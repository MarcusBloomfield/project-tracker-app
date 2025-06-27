import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { initFileSystemHandlers } from './handlers/fileSystemHandlers';
import { initTaskHandlers } from './handlers/taskHandlers';
import { initDailyTaskHandlers } from './handlers/dailyTaskHandlers';

// Debug logging to help troubleshoot path issues
console.log('__dirname:', __dirname);
console.log('Current working directory:', process.cwd());

initFileSystemHandlers();

initTaskHandlers();

initDailyTaskHandlers();

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Build the path to the HTML file
  // Use __dirname instead of process.cwd() for packaged apps
  const indexPath = path.join(__dirname, 'index.html');
  console.log('Loading HTML from:', indexPath);
  console.log('App is packaged:', app.isPackaged);

  // and load the index.html of the app.
  mainWindow.loadFile(indexPath);

  // Open DevTools only in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

