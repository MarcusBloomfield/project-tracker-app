// Types for file and directory structures
export interface FileInfo {
  name: string;
  path: string;
  type: 'file';
  extension: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface DirectoryInfo {
  name: string;
  path: string;
  type: 'directory';
  children: (FileInfo | DirectoryInfo)[];
  createdAt: Date;
  modifiedAt: Date;
}

export type FSItem = FileInfo | DirectoryInfo;

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  modifiedAt: Date;
}

// File system operations
export const fileSystem = {
  /**
   * List all projects in the projects directory
   */
  listProjects: (): Promise<ProjectInfo[]> => {
    return new Promise((resolve) => {
      const handleProjectList = (projects: ProjectInfo[]) => {
        window.api.removeListener('project:list', handleProjectList);
        resolve(projects);
      };

      window.api.addListener('project:list', handleProjectList);
      window.api.triggerEvent('project:list', {});
    });
  },

  /**
   * Create a new project
   */
  createProject: (name: string): Promise<ProjectInfo> => {
    return new Promise((resolve) => {
      const handleProjectCreated = (project: ProjectInfo) => {
        window.api.removeListener('project:created', handleProjectCreated);
        resolve(project);
      };

      window.api.addListener('project:created', handleProjectCreated);
      window.api.triggerEvent('project:create', { name });
    });
  },

  /**
   * Get contents of a directory
   */
  getDirectoryContents: (path: string): Promise<FSItem[]> => {
    return new Promise((resolve) => {
      const handleDirectoryContents = (items: FSItem[]) => {
        window.api.removeListener('fs:readdir', handleDirectoryContents);
        resolve(items);
      };

      window.api.addListener('fs:readdir', handleDirectoryContents);
      window.api.triggerEvent('fs:readdir', { path });
    });
  },

  /**
   * Read a file's contents
   */
  readFile: (path: string): Promise<string> => {
    return new Promise((resolve) => {
      const handleFileRead = (content: string) => {
        window.api.removeListener('fs:readfile', handleFileRead);
        resolve(content);
      };

      window.api.addListener('fs:readfile', handleFileRead);
      window.api.triggerEvent('fs:readfile', { path });
    });
  },

  /**
   * Write content to a file
   */
  writeFile: (path: string, content: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleFileWrite = (success: boolean) => {
        window.api.removeListener('fs:writefile', handleFileWrite);
        resolve(success);
      };

      window.api.addListener('fs:writefile', handleFileWrite);
      window.api.triggerEvent('fs:writefile', { path, content });
    });
  },

  /**
   * Create a new directory
   */
  createDirectory: (path: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleDirectoryCreated = (success: boolean) => {
        window.api.removeListener('fs:mkdir', handleDirectoryCreated);
        resolve(success);
      };

      window.api.addListener('fs:mkdir', handleDirectoryCreated);
      window.api.triggerEvent('fs:mkdir', { path });
    });
  },

  /**
   * Delete a file or directory
   */
  delete: (path: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleDelete = (success: boolean) => {
        window.api.removeListener('fs:delete', handleDelete);
        resolve(success);
      };

      window.api.addListener('fs:delete', handleDelete);
      window.api.triggerEvent('fs:delete', { path });
    });
  },

  /**
   * Rename a file or directory
   */
  rename: (oldPath: string, newPath: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleRename = (success: boolean) => {
        window.api.removeListener('fs:rename', handleRename);
        resolve(success);
      };

      window.api.addListener('fs:rename', handleRename);
      window.api.triggerEvent('fs:rename', { oldPath, newPath });
    });
  }
}; 