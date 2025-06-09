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
      window.api.triggerEvent('project:list', {});
      window.api.addListener('project:list', (projects: ProjectInfo[]) => {
        resolve(projects);
      });
    });
  },

  /**
   * Create a new project
   */
  createProject: (name: string): Promise<ProjectInfo> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('project:create', { name });
      window.api.addListener('project:created', (project: ProjectInfo) => {
        resolve(project);
      });
    });
  },

  /**
   * Get contents of a directory
   */
  getDirectoryContents: (path: string): Promise<FSItem[]> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('fs:readdir', { path });
      window.api.addListener('fs:readdir', (items: FSItem[]) => {
        resolve(items);
      });
    });
  },

  /**
   * Read a file's contents
   */
  readFile: (path: string): Promise<string> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('fs:readfile', { path });
      window.api.addListener('fs:readfile', (content: string) => {
        resolve(content);
      });
    });
  },

  /**
   * Write content to a file
   */
  writeFile: (path: string, content: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('fs:writefile', { path, content });
      window.api.addListener('fs:writefile', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Create a new directory
   */
  createDirectory: (path: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('fs:mkdir', { path });
      window.api.addListener('fs:mkdir', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Delete a file or directory
   */
  delete: (path: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('fs:delete', { path });
      window.api.addListener('fs:delete', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Rename a file or directory
   */
  rename: (oldPath: string, newPath: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('fs:rename', { oldPath, newPath });
      window.api.addListener('fs:rename', (success: boolean) => {
        resolve(success);
      });
    });
  }
}; 