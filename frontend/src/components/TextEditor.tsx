import React, { useState, useEffect } from 'react';
import '../styles/TextEditor.css';

interface TextEditorProps {
  filePath: string | null;
}

const TextEditor: React.FC<TextEditorProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Load file content when filePath changes
  useEffect(() => {
    if (!filePath) {
      setContent('');
      setFileName('');
      setIsEdited(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Extract file name from path
    const name = filePath.substring(filePath.lastIndexOf('\\') + 1);
    setFileName(name);

    // Load file content
    window.api.send('fs:readfile', { path: filePath });
    window.api.receive('fs:readfile', (fileContent: string) => {
      setContent(fileContent);
      setIsLoading(false);
      setIsEdited(false);
    });
  }, [filePath]);

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsEdited(true);
  };

  // Save the file
  const handleSave = () => {
    if (!filePath) return;
    
    setIsSaving(true);
    setError(null);

    window.api.send('fs:writefile', { path: filePath, content });
    window.api.receive('fs:writefile', (success: boolean) => {
      setIsSaving(false);
      
      if (success) {
        setIsEdited(false);
      } else {
        setError('Failed to save file');
      }
    });
  };

  if (!filePath) {
    return (
      <div className="text-editor-empty">
        <p>Select a file to edit</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-editor-loading">
        <p>Loading file...</p>
      </div>
    );
  }

  return (
    <div className="text-editor">
      <div className="text-editor-header">
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          {isEdited && <span className="edited-indicator">*</span>}
        </div>
        <div className="editor-actions">
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={!isEdited || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <textarea
        className="text-content"
        value={content}
        onChange={handleContentChange}
        spellCheck={false}
      />
    </div>
  );
};

export default TextEditor; 