import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Convert fs functions to promises
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);

// Daily task interface (must match the one in dailyTaskManager.ts)
interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  lastResetDate: string; // YYYY-MM-DD format for tracking daily resets
  order?: number; // Optional order field for sorting
}

// Get daily tasks file path
const getDailyTasksFilePath = (): string => {
  const appDataPath = path.join(app.getPath('userData'), 'DailyTasks');
  return path.join(appDataPath, 'dailyTasks.json');
};

// Ensure daily tasks file exists
const ensureDailyTasksFile = async (): Promise<void> => {
  const filePath = getDailyTasksFilePath();
  const appDataPath = path.dirname(filePath);

  try {
    await stat(appDataPath);
  } catch (error) {
    await mkdir(appDataPath, { recursive: true });
  }

  try {
    await stat(filePath);
  } catch (error) {
    await writeFile(filePath, '[]', { encoding: 'utf-8' });
  }
};

// Load daily tasks from file
const loadDailyTasks = async (): Promise<DailyTask[]> => {
  await ensureDailyTasksFile();
  const filePath = getDailyTasksFilePath();
  
  try {
    const data = await readFile(filePath, { encoding: 'utf-8' });
    const tasks = JSON.parse(data);
    
    // Check if tasks need to be reset for a new day
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    let tasksNeedReset = false;
    
    for (const task of tasks) {
      if (task.lastResetDate !== today) {
        tasksNeedReset = true;
        break;
      }
    }
    
    if (tasksNeedReset) {
      // Reset all tasks to not completed for the new day
      const resetTasks = tasks.map((task: DailyTask) => ({
        ...task,
        completed: false,
        lastResetDate: today
      }));
      
      await saveDailyTasks(resetTasks);
      return resetTasks;
    }
    
    // Sort by order if available
    return tasks.sort((a: DailyTask, b: DailyTask) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return 0;
    });
  } catch (error) {
    console.error('Error loading daily tasks:', error);
    return [];
  }
};

// Save daily tasks to file
const saveDailyTasks = async (tasks: DailyTask[]): Promise<boolean> => {
  await ensureDailyTasksFile();
  const filePath = getDailyTasksFilePath();
  
  try {
    await writeFile(filePath, JSON.stringify(tasks, null, 2), { encoding: 'utf-8' });
    return true;
  } catch (error) {
    console.error('Error saving daily tasks:', error);
    return false;
  }
};

// Initialize daily task handlers
export const initDailyTaskHandlers = (): void => {
  // List daily tasks
  ipcMain.on('dailyTask:list', async (event) => {
    try {
      const tasks = await loadDailyTasks();
      event.reply('dailyTask:list', tasks);
    } catch (error) {
      console.error('Error listing daily tasks:', error);
      event.reply('dailyTask:list', []);
    }
  });

  // Create a new daily task
  ipcMain.on('dailyTask:create', async (event, { task }) => {
    try {
      const tasks = await loadDailyTasks();
      
      // Set order to be the last in the list
      const newTask: DailyTask = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date(),
        order: tasks.length // Set the order to the end of the list
      };
      
      tasks.push(newTask);
      
      const success = await saveDailyTasks(tasks);
      if (success) {
        event.reply('dailyTask:created', newTask);
      } else {
        event.reply('dailyTask:created', null);
      }
    } catch (error) {
      console.error('Error creating daily task:', error);
      event.reply('dailyTask:created', null);
    }
  });

  // Toggle task completion
  ipcMain.on('dailyTask:toggle', async (event, { taskId, completed }) => {
    try {
      const tasks = await loadDailyTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = completed;
        
        const success = await saveDailyTasks(tasks);
        if (success) {
          event.reply('dailyTask:updated', tasks[taskIndex]);
        } else {
          event.reply('dailyTask:updated', null);
        }
      } else {
        event.reply('dailyTask:updated', null);
      }
    } catch (error) {
      console.error('Error updating daily task:', error);
      event.reply('dailyTask:updated', null);
    }
  });

  // Delete a daily task
  ipcMain.on('dailyTask:delete', async (event, { taskId }) => {
    try {
      const tasks = await loadDailyTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        
        // Update order for remaining tasks
        tasks.forEach((task, index) => {
          task.order = index;
        });
        
        const success = await saveDailyTasks(tasks);
        event.reply('dailyTask:deleted', success);
      } else {
        event.reply('dailyTask:deleted', false);
      }
    } catch (error) {
      console.error('Error deleting daily task:', error);
      event.reply('dailyTask:deleted', false);
    }
  });
  
  // Reorder tasks
  ipcMain.on('dailyTask:reorder', async (event, { tasks: reorderedTasks }) => {
    try {
      // Update the order property for each task
      const updatedTasks = reorderedTasks.map((task: DailyTask, index: number) => ({
        ...task,
        order: index
      }));
      
      const success = await saveDailyTasks(updatedTasks);
      if (success) {
        event.reply('dailyTask:reordered', updatedTasks);
      } else {
        event.reply('dailyTask:reordered', null);
      }
    } catch (error) {
      console.error('Error reordering daily tasks:', error);
      event.reply('dailyTask:reordered', null);
    }
  });
}; 