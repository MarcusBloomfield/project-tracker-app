import React, { useState } from 'react';
import '../styles/CreateProjectDialog.css';

interface CreateDialogProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (projectName: string) => void;
}

const CreateDialog: React.FC<CreateDialogProps> = ({ 
  type,
  isOpen, 
  onClose, 
  onConfirm
}) => {
  const [projectName, setProjectName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('Project name cannot be empty');
      return;
    }
    
    onConfirm(projectName);
    setProjectName('');
    setError(null);
  };

  const handleCancel = () => {
    setProjectName('');
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
        
        <form onSubmit={handleSubmit}>
          <div className="dialog-content">
            <label htmlFor="project-name">Name:</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
            {error && <div className="dialog-error">{error}</div>}
          </div>
          
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