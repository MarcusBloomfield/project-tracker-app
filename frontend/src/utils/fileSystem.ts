/**
 * File system utility module that provides functionality for working with files and directories.
 * Uses Electron's IPC to communicate with the main process for file operations.
 */

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
      window.api.send('project:list', {});
      window.api.receive('project:list', (projects: ProjectInfo[]) => {
        resolve(projects);
      });
    });
  },

  /**
   * Create a new project
   */
  createProject: (name: string): Promise<ProjectInfo> => {
    return new Promise((resolve) => {
      window.api.send('project:create', { name });
      window.api.receive('project:created', (project: ProjectInfo) => {
        resolve(project);
      });
    });
  },

  /**
   * Get contents of a directory
   */
  getDirectoryContents: (path: string): Promise<FSItem[]> => {
    return new Promise((resolve) => {
      window.api.send('fs:readdir', { path });
      window.api.receive('fs:readdir', (items: FSItem[]) => {
        resolve(items);
      });
    });
  },

  /**
   * Read a file's contents
   */
  readFile: (path: string): Promise<string> => {
    return new Promise((resolve) => {
      window.api.send('fs:readfile', { path });
      window.api.receive('fs:readfile', (content: string) => {
        resolve(content);
      });
    });
  },

  /**
   * Write content to a file
   */
  writeFile: (path: string, content: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.send('fs:writefile', { path, content });
      window.api.receive('fs:writefile', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Create a new directory
   */
  createDirectory: (path: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.send('fs:mkdir', { path });
      window.api.receive('fs:mkdir', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Delete a file or directory
   */
  delete: (path: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.send('fs:delete', { path });
      window.api.receive('fs:delete', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Rename a file or directory
   */
  rename: (oldPath: string, newPath: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.send('fs:rename', { oldPath, newPath });
      window.api.receive('fs:rename', (success: boolean) => {
        resolve(success);
      });
    });
  }
}; 