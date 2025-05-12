// main.ts

// Modules to control application life and create native browser window
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { initFileSystemHandlers } from './main/fileSystemHandlers';
import { initTaskHandlers } from './main/taskHandlers';

// Debug logging to help troubleshoot path issues
console.log('__dirname:', __dirname);
console.log('Current working directory:', process.cwd());

// Initialize file system handlers
initFileSystemHandlers();

// Initialize task handlers
initTaskHandlers();

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Build the path to the HTML file
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  console.log('Loading HTML from:', indexPath);

  // and load the index.html of the app.
  mainWindow.loadFile(indexPath);

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here. 