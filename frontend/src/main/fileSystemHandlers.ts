import { ipcMain, dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Convert fs functions to promises
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const rm = util.promisify(fs.rm);
const rename = util.promisify(fs.rename);

// Projects directory path
const getProjectsPath = (): string => {
  return path.join(app.getPath('documents'), 'ProjectTracker');
};

// Ensure projects directory exists
const ensureProjectsDirectory = async (): Promise<void> => {
  const projectsPath = getProjectsPath();
  
  try {
    await stat(projectsPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(projectsPath, { recursive: true });
    console.log(`Created projects directory at ${projectsPath}`);
  }
};

// Initialize file system handlers
export const initFileSystemHandlers = (): void => {
  // Ensure projects directory exists on startup
  ensureProjectsDirectory().catch(error => {
    console.error('Failed to create projects directory:', error);
  });

  // List projects
  ipcMain.on('project:list', async (event) => {
    try {
      const projectsPath = getProjectsPath();
      const items = await readdir(projectsPath, { withFileTypes: true });
      
      const projects = await Promise.all(
        items
          .filter(item => item.isDirectory())
          .map(async (item) => {
            const projectPath = path.join(projectsPath, item.name);
            const stats = await stat(projectPath);
            
            return {
              id: item.name,
              name: item.name,
              path: projectPath,
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime
            };
          })
      );
      
      event.reply('project:list', projects);
    } catch (error) {
      console.error('Error listing projects:', error);
      event.reply('project:list', []);
    }
  });

  // Create a new project
  ipcMain.on('project:create', async (event, { name }) => {
    try {
      const projectId = Date.now().toString();
      const projectPath = path.join(getProjectsPath(), name);
      
      await mkdir(projectPath, { recursive: true });
      
      const stats = await stat(projectPath);
      const project = {
        id: projectId,
        name,
        path: projectPath,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
      
      event.reply('project:created', project);
    } catch (error) {
      console.error('Error creating project:', error);
      event.reply('project:created', null);
    }
  });

  // Read directory contents
  ipcMain.on('fs:readdir', async (event, { path: dirPath }) => {
    try {
      const items = await readdir(dirPath, { withFileTypes: true });
      
      const contents = await Promise.all(
        items.map(async (item) => {
          const itemPath = path.join(dirPath, item.name);
          const stats = await stat(itemPath);
          
          if (item.isDirectory()) {
            return {
              name: item.name,
              path: itemPath,
              type: 'directory',
              children: [],
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime
            };
          } else {
            return {
              name: item.name,
              path: itemPath,
              type: 'file',
              extension: path.extname(item.name),
              size: stats.size,
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime
            };
          }
        })
      );
      
      event.reply('fs:readdir', contents);
    } catch (error) {
      console.error('Error reading directory:', error);
      event.reply('fs:readdir', []);
    }
  });

  // Read file contents
  ipcMain.on('fs:readfile', async (event, { path: filePath }) => {
    try {
      const content = await readFile(filePath, { encoding: 'utf-8' });
      event.reply('fs:readfile', content);
    } catch (error) {
      console.error('Error reading file:', error);
      event.reply('fs:readfile', '');
    }
  });

  // Write to file
  ipcMain.on('fs:writefile', async (event, { path: filePath, content }) => {
    try {
      await writeFile(filePath, content, { encoding: 'utf-8' });
      event.reply('fs:writefile', true);
    } catch (error) {
      console.error('Error writing file:', error);
      event.reply('fs:writefile', false);
    }
  });

  // Create directory
  ipcMain.on('fs:mkdir', async (event, { path: dirPath }) => {
    try {
      await mkdir(dirPath, { recursive: true });
      event.reply('fs:mkdir', true);
    } catch (error) {
      console.error('Error creating directory:', error);
      event.reply('fs:mkdir', false);
    }
  });

  // Delete file or directory
  ipcMain.on('fs:delete', async (event, { path: itemPath }) => {
    try {
      await rm(itemPath, { recursive: true, force: true });
      event.reply('fs:delete', true);
    } catch (error) {
      console.error('Error deleting item:', error);
      event.reply('fs:delete', false);
    }
  });

  // Rename file or directory
  ipcMain.on('fs:rename', async (event, { oldPath, newPath }) => {
    try {
      await rename(oldPath, newPath);
      event.reply('fs:rename', true);
    } catch (error) {
      console.error('Error renaming item:', error);
      event.reply('fs:rename', false);
    }
  });
}; 