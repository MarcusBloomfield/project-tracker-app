import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Convert fs functions to promises
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);

// Task status and priority enums (must match the ones in taskManager.ts)
enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

enum TaskType {
  BUG = 'bug',
  FEATURE = 'feature',
  TASK = 'task',
  OTHER = 'other'
}

// Task interface (must match the one in taskManager.ts)
interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  tags: string[];
}

// Get tasks file path for a project
const getTasksFilePath = (projectId: string): string => {
  const projectsPath = path.join(app.getPath('documents'), 'ProjectTracker');
  return path.join(projectsPath, projectId, 'tasks.json');
};

const getTasksBackUpFilePath = (projectId: string): string => {
  const projectsPath = path.join(app.getPath('documents'), 'ProjectTracker', '.backup');
  return path.join(projectsPath, projectId, 'tasks.json');
};

// Ensure tasks file exists for a project
const ensureTasksFile = async (projectId: string): Promise<void> => {
  const tasksFilePath = getTasksFilePath(projectId);
  const dir = path.dirname(tasksFilePath);
  
  try {
    await stat(dir);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(dir, { recursive: true });
  }
  
  try {
    await stat(tasksFilePath);
  } catch (error) {
    // File doesn't exist, create it with empty tasks array
    await writeFile(tasksFilePath, JSON.stringify([], null, 2), { encoding: 'utf-8' });
  }
};

// Ensure backup tasks file exists for a project
const ensureTasksFileBackup = async (projectId: string): Promise<void> => {
  const tasksFilePath = getTasksBackUpFilePath(projectId);
  const dir = path.dirname(tasksFilePath);
  
  try {
    await stat(dir);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(dir, { recursive: true });
  }
  
  try {
    await stat(tasksFilePath);
  } catch (error) {
    // File doesn't exist, create it with empty tasks array
    await writeFile(tasksFilePath, JSON.stringify([], null, 2), { encoding: 'utf-8' });
  }
};

// Load tasks from file
const loadTasks = async (projectId: string): Promise<Task[]> => {
  await ensureTasksFile(projectId);
  const tasksFilePath = getTasksFilePath(projectId);
  
  try {
    const data = await readFile(tasksFilePath, { encoding: 'utf-8' });
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

// Save old tasks to backup folder
const saveTasksBackup = async (projectId: string, tasks: Task[]): Promise<boolean> => {
  await ensureTasksFileBackup(projectId);
  const tasksBackUpFilePath = getTasksBackUpFilePath(projectId);
  try {
    await writeFile(tasksBackUpFilePath, JSON.stringify(tasks, null, 2), { encoding: 'utf-8' });
    return true;
  } catch (error) {
    console.error('Error saving tasks backup:', error);
    return false;
  }
};

// Save tasks to file
const saveTasks = async (projectId: string, tasks: Task[]): Promise<boolean> => {
  const backedUpTasks = await saveTasksBackup(projectId, tasks);
  if (backedUpTasks) {
    console.log(`Tasks backed up for project: ${projectId}`);
  } else {
    console.error(`Failed to backup tasks for project: ${projectId}`);
  }
  await ensureTasksFile(projectId);
  const tasksFilePath = getTasksFilePath(projectId);
  
  try {
    await writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), { encoding: 'utf-8' });
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

// Initialize task handlers
export const initTaskHandlers = (): void => {
  // List tasks for a project
  ipcMain.on('task:list', async (event, { projectId }) => {
    try {
      const tasks = await loadTasks(projectId);
      event.reply('task:list', tasks);
    } catch (error) {
      console.error('Error listing tasks:', error);
      event.reply('task:list', []);
    }
  });

  // Create a new task
  ipcMain.on('task:create', async (event, { task }) => {
    try {
      const tasks = await loadTasks(task.projectId);

      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      };
      
      tasks.push(newTask);
      
      const success = await saveTasks(task.projectId, tasks);
      if (success) {
        event.reply('task:created', newTask);
      } else {
        event.reply('task:created', null);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      event.reply('task:created', null);
    }
  });

  // Update a task
  ipcMain.on('task:update', async (event, { taskId, updates }) => {
    try {
      // We need to find the project ID first
      let projectId = '';
      let tasks: Task[] = [];
      const projectsPath = path.join(app.getPath('documents'), 'ProjectTracker');
      const projects = await fs.promises.readdir(projectsPath, { withFileTypes: true });
      
      for (const project of projects) {
        if (project.isDirectory()) {
          const projectTasks = await loadTasks(project.name);
          const task = projectTasks.find(t => t.id === taskId);
          
          if (task) {
            projectId = project.name;
            tasks = projectTasks;
            break;
          }
        }
      }
      
      if (!projectId) {
        event.reply('task:updated', null);
        return;
      }
      
      // Find and update the task
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        event.reply('task:updated', null);
        return;
      }
      
      const updatedTask: Task = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      tasks[taskIndex] = updatedTask;
      
      const success = await saveTasks(projectId, tasks);
      
      if (success) {
        event.reply('task:updated', updatedTask);
      } else {
        event.reply('task:updated', null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      event.reply('task:updated', null);
    }
  });

  // Delete a task
  ipcMain.on('task:delete', async (event, { taskId }) => {
    try {
      // We need to find the project ID first (similar to update)
      let projectId = '';
      let tasks: Task[] = [];
      
      const projectsPath = path.join(app.getPath('documents'), 'ProjectTracker');
      const projects = await fs.promises.readdir(projectsPath, { withFileTypes: true });
      
      for (const project of projects) {
        if (project.isDirectory()) {
          const projectTasks = await loadTasks(project.name);
          const taskIndex = projectTasks.findIndex(t => t.id === taskId);
          
          if (taskIndex !== -1) {
            projectId = project.name;
            tasks = projectTasks;
            
            // Remove the task
            tasks.splice(taskIndex, 1);
            break;
          }
        }
      }
      
      if (!projectId) {
        event.reply('task:deleted', false);
        return;
      }
      
      const success = await saveTasks(projectId, tasks);
      event.reply('task:deleted', success);
    } catch (error) {
      console.error('Error deleting task:', error);
      event.reply('task:deleted', false);
    }
  });
}; 