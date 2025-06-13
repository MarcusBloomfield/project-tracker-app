import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { initFileSystemHandlers } from './main/fileSystemHandlers';
import { initTaskHandlers } from './main/taskHandlers';
import { initDailyTaskHandlers } from './main/dailyTaskHandlers';

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
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  console.log('Loading HTML from:', indexPath);

  // and load the index.html of the app.
  mainWindow.loadFile(indexPath);

  // Open the DevTools (temporarily always enabled)
  mainWindow.webContents.openDevTools();
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

