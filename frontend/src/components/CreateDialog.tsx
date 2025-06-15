import React, { useState } from 'react';
import '../styles/CreateDialog.css';

interface CreateDialogProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const CreateDialog: React.FC<CreateDialogProps> = ({ 
  type,
  isOpen, 
  onClose, 
  onConfirm
}) => {
  const [Name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    onConfirm(Name);
    setName('');
    setError(null);
  };

  const handleCancel = () => {
    setName('');
    setError(null);
    onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h3>Create new {type}</h3>
          <button 
            className="dialog-close-button" 
            onClick={handleCancel}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="form-group">
          <div className="dialog-content">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          {error && <div className="dialog-error">{error}</div>}
          <div className="dialog-actions">
            <button 
              type="button" 
              className="dialog-button cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="dialog-button confirm-button"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDialog; 