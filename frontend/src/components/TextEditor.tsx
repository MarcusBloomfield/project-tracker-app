import React, { useState, useEffect } from 'react';
import { fileSystem } from '../utils/fileSystem';
import '../styles/TextEditor.css';

interface TextEditorProps {
  filePath: string | null;
}

const TextEditor: React.FC<TextEditorProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isPreventingTaskFileDeletion, setIsPreventingTaskFileDeletion] = useState<boolean>(false);

  // Load file content when filePath changes
  useEffect(() => {
    if (!filePath) {
      setContent('');
      setFileName('');
      setIsEdited(false);
      return;
    }

    const loadFileContent = async () => {
      setIsLoading(true);
      setError(null);

      preventTaskFileDeletion();

      // Extract file name from path
      const name = filePath.substring(filePath.lastIndexOf('\\') + 1);
      setFileName(name);

      try {
        const fileContent = await fileSystem.readFile(filePath);
        setContent(fileContent);
        setIsEdited(false);
      } catch (error) {
        setError('Failed to load file');
        console.error('Failed to load file:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [filePath]);

  const preventTaskFileDeletion = () => {
    if (filePath?.includes('tasks.json')) {
      setError('Cannot delete task file');
      setIsPreventingTaskFileDeletion(true);
    }
  };

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsEdited(true);
  };

  // Save the file
  const handleSave = async () => {
    if (!filePath) return;
    
    setIsSaving(true);
    setError(null);

    try {
      const success = await fileSystem.writeFile(filePath, content);
      
      if (success) {
        setIsEdited(false);
      } else {
        setError('Failed to save file');
      }
    } catch (error) {
      setError('Failed to save file');
      console.error('Failed to save file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!filePath) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const success = await fileSystem.delete(filePath);
      
      if (success) {
        setError('File deleted successfully');
        // Note: Consider adding a callback prop to notify parent component
      } else {
        setError('Failed to delete file');
      }
    } catch (error) {
      setError('Failed to delete file');
      console.error('Failed to delete file:', error);
    } finally {
      setIsDeleting(false);
    }
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
            className="delete-button" 
            onClick={handleDelete}
            disabled={isSaving || isPreventingTaskFileDeletion}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
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