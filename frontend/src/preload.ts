
import { contextBridge, ipcRenderer } from 'electron';
import { setMaxListeners } from 'events';

// Define valid IPC channels
const validSendChannels = [
  'project:create', 
  'project:get', 
  'project:list',
  'fs:readdir',
  'fs:readfile',
  'fs:writefile',
  'fs:mkdir',
  'fs:delete',
  'fs:rename',
  'task:list',
  'task:create',
  'task:update',
  'task:delete',
  'dailyTask:list',
  'dailyTask:create',
  'dailyTask:toggle',
  'dailyTask:delete',
  'dailyTask:reorder'
];

const validReceiveChannels = [
  'project:created', 
  'project:data', 
  'project:list',
  'fs:readdir',
  'fs:readfile',
  'fs:writefile',
  'fs:mkdir',
  'fs:delete',
  'fs:rename',
  'task:list',
  'task:created',
  'task:updated',
  'task:deleted',
  'dailyTask:list',
  'dailyTask:created',
  'dailyTask:updated',
  'dailyTask:deleted',
  'dailyTask:reordered'
];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  triggerEvent: (channel: string, data: any) => {
    console.log('triggerEvent');
    // Whitelist channels
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  addListener: (channel: string, func: (...args: any[]) => void) => {
    console.log('addListener');
    if (validReceiveChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    console.log('removeListener');
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  },
  // Expose any other APIs you need here
  appInfo: {
    versions: {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string): void => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency] as string);
  }
}); 