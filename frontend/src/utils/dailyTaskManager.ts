/**
 * Daily task management utility module that provides functionality for handling daily repeating tasks.
 * Uses Electron's IPC to communicate with the main process for persistent storage.
 */

// Daily task data model
export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  lastResetDate: string; // YYYY-MM-DD format for tracking daily resets
  order?: number; // Optional order field for sorting
}

// Daily task manager operations
export const dailyTaskManager = {
  /**
   * Get all daily tasks
   */
  getDailyTasks: (): Promise<DailyTask[]> => {
    return new Promise((resolve) => {
      window.api.send('dailyTask:list', {});
      window.api.receive('dailyTask:list', (tasks: DailyTask[]) => {
        resolve(tasks);
      });
    });
  },

  /**
   * Create a new daily task
   */
  createDailyTask: (title: string): Promise<DailyTask> => {
    return new Promise((resolve) => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const taskData = {
        title,
        completed: false,
        lastResetDate: today
      };
      window.api.send('dailyTask:create', { task: taskData });
      window.api.receive('dailyTask:created', (newTask: DailyTask) => {
        resolve(newTask);
      });
    });
  },

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion: (taskId: string, completed: boolean): Promise<DailyTask> => {
    return new Promise((resolve) => {
      window.api.send('dailyTask:toggle', { taskId, completed });
      window.api.receive('dailyTask:updated', (updatedTask: DailyTask) => {
        resolve(updatedTask);
      });
    });
  },

  /**
   * Delete a daily task
   */
  deleteDailyTask: (taskId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.send('dailyTask:delete', { taskId });
      window.api.receive('dailyTask:deleted', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Reorder tasks after drag and drop
   */
  reorderTasks: (tasks: DailyTask[]): Promise<DailyTask[]> => {
    return new Promise((resolve) => {
      window.api.send('dailyTask:reorder', { tasks });
      window.api.receive('dailyTask:reordered', (updatedTasks: DailyTask[]) => {
        resolve(updatedTasks);
      });
    });
  }
}; 