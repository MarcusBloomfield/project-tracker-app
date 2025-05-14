import React, { useState, useEffect } from 'react';
import { FSItem } from '../utils/fileSystem';
import '../styles/FileBrowser.css';
import CreateDialog from './CreateDialog';

interface FileBrowserProps {
  projectPath: string;
  onSelectFile: (filePath: string) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ projectPath, onSelectFile }) => {
  const [items, setItems] = useState<FSItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(projectPath);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState<boolean>(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState<boolean>(false);


  // Load directory contents
  useEffect(() => {
    if (!currentPath) return;

    setLoading(true);
    setError(null);

    const loadContents = () => {
      window.api.send('fs:readdir', { path: currentPath });
      window.api.receive('fs:readdir', (contents: FSItem[]) => {
        setItems(contents);
        setLoading(false);
      });
    };

    loadContents();

    // Cleanup function
    return () => {
      // No cleanup needed for now
    };
  }, [currentPath]);


  // Handle directory navigation
  const handleItemClick = (item: FSItem) => {
    if (item.type === 'directory') {
      setCurrentPath(item.path);
    } else {
      setSelectedItem(item.path);
      onSelectFile(item.path);
    }
  };

  // Navigate up one directory
  const handleNavigateUp = () => {
    if (currentPath === projectPath) return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('\\'));
    setCurrentPath(parentPath);
  };

  // Format file/folder name for display
  const formatName = (name: string) => {
    if (name.length > 25) {
      return name.substring(0, 22) + '...';
    }
    return name;
  };


  // Create new folder
  const handleFolderDialogOpen = () => {
    setIsFolderDialogOpen(true);
  };

  const handleFolderDialogClose = () => {
    setIsFolderDialogOpen(false);
  };

  const handleFolderDialogConfirm = (name: string) => {
    if (isFolderDialogOpen) {
      handleCreateFolder(name);
      handleFolderDialogClose();
    }
  };

  const handleCreateFolder = (folderName: string) => {
    if (!folderName) return;

    const newFolderPath = `${currentPath}\\${folderName}`;
    window.api.send('fs:mkdir', { path: newFolderPath });
    window.api.receive('fs:mkdir', (success: boolean) => {
      if (success) {
        // Refresh the directory contents
        window.api.send('fs:readdir', { path: currentPath });
        window.api.receive('fs:readdir', (contents: FSItem[]) => {
          setItems(contents);
        });
      } else {
        setError('Failed to create folder');
      }
    });
  };

  // Create new file
  const handleFileDialogOpen = () => {
    setIsFileDialogOpen(true);
  };

  const handleFileDialogClose = () => {
    setIsFileDialogOpen(false);
  };

  const handleFileDialogConfirm = (name: string) => {
    if (isFileDialogOpen) {
      handleCreateFile(name);
      handleFileDialogClose();
    }
  };

  const handleCreateFile = (fileName: string) => {
    if (!fileName) return;

    const newFilePath = `${currentPath}\\${fileName}`;
    window.api.send('fs:writefile', { path: newFilePath, content: '' });
    window.api.receive('fs:writefile', (success: boolean) => {
      if (success) {
        // Refresh the directory contents
        window.api.send('fs:readdir', { path: currentPath });
        window.api.receive('fs:readdir', (contents: FSItem[]) => {
          setItems(contents);
        });
      } else {
        setError('Failed to create file');
      }
    });
  };

  const handleDeleteItem = (item: FSItem) => {

    if (item.path.includes('tasks.json')) {
      setError('Cannot delete task file');
      return;
    }
    
    window.api.send('fs:delete', { path: item.path });
      window.api.receive('fs:delete', (success: boolean) => {
        if (success) {
          setItems(items.filter(i => i.path !== item.path));
        } else {
          setError('Failed to delete file');
        }
      });
  };

  // Get file icon based on extension
  const getFileIcon = (item: FSItem) => {
    if (item.type === 'directory') {
      return '📁';
    }

    // Map file extensions to icons
    if (item.type === 'file') {
      const ext = item.extension.toLowerCase();
      
      if (['.txt', '.md', '.rtf'].includes(ext)) return '📄';
      if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) return '🖼️';
      if (['.mp3', '.wav', '.ogg'].includes(ext)) return '🎵';
      if (['.mp4', '.mov', '.avi'].includes(ext)) return '🎬';
      if (['.pdf'].includes(ext)) return '📑';
      if (['.doc', '.docx'].includes(ext)) return '📝';
      if (['.xls', '.xlsx'].includes(ext)) return '📊';
      if (['.ppt', '.pptx'].includes(ext)) return '📊';
      if (['.zip', '.rar', '.7z'].includes(ext)) return '🗜️';
    }
    
    return '📄';
  };

  if (loading && items.length === 0) {
    return <div className="file-browser">Loading...</div>;
  }

  return (
    <div className="file-browser">
      <div className="file-browser-header">
        <button 
          className="nav-button" 
          onClick={handleNavigateUp}
          disabled={currentPath === projectPath}
        >
          ⬆️ Up
        </button>
        <span className="current-path">{currentPath.substring(currentPath.lastIndexOf('\\') + 1)}</span>
        <div className="file-actions">
          <button className="action-button" onClick={handleFolderDialogOpen}>+ Folder</button>
          <button className="action-button" onClick={handleFileDialogOpen}>+ File</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="file-list">
        {items.length === 0 ? (
          <div className="empty-directory">This folder is empty</div>
        ) : (
          items
            .sort((a, b) => {
              // Sort directories first, then files alphabetically
              if (a.type === 'directory' && b.type !== 'directory') return -1;
              if (a.type !== 'directory' && b.type === 'directory') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((item) => (
              <div
                key={item.path} 
                className={`file-item ${selectedItem === item.path ? 'selected' : ''}`}> 
                <div
                  className="file-button"
                  onClick={() => handleItemClick(item)}
                >
                  <span className="file-icon">{getFileIcon(item)}</span>
                  <span className="file-name" title={item.name}>{formatName(item.name)}</span>
                </div>
                <button 
                  className="file-delete-button"
                  onClick={() => handleDeleteItem(item)}
                  disabled={item.path.includes('tasks.json')}
                >
                  Delete
                </button>
              </div>
            ))
        )}
      </div>

      <CreateDialog 
        type="file"
        isOpen={isFileDialogOpen}
        onClose={handleFileDialogClose}
        onConfirm={handleFileDialogConfirm}
      />

      <CreateDialog 
        type="folder"
        isOpen={isFolderDialogOpen}
        onClose={handleFolderDialogClose}
        onConfirm={handleFolderDialogConfirm}
      />
    </div>
  );
};

export default FileBrowser; 