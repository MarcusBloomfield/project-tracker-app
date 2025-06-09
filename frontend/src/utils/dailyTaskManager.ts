
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
      window.api.triggerEvent('dailyTask:list', {});
      window.api.addListener('dailyTask:list', (tasks: DailyTask[]) => {
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
      window.api.triggerEvent('dailyTask:create', { task: taskData });
      window.api.addListener('dailyTask:created', (newTask: DailyTask) => {
        resolve(newTask);
      });
    });
  },

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion: (taskId: string, completed: boolean): Promise<DailyTask> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('dailyTask:toggle', { taskId, completed });
      window.api.addListener('dailyTask:updated', (updatedTask: DailyTask) => {
        resolve(updatedTask);
      });
    });
  },

  /**
   * Delete a daily task
   */
  deleteDailyTask: (taskId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('dailyTask:delete', { taskId });
      window.api.addListener('dailyTask:deleted', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Reorder tasks after drag and drop
   */
  reorderTasks: (tasks: DailyTask[]): Promise<DailyTask[]> => {
    return new Promise((resolve) => {
      window.api.triggerEvent('dailyTask:reorder', { tasks });
      window.api.addListener('dailyTask:reordered', (updatedTasks: DailyTask[]) => {
        resolve(updatedTasks);
      });
    });
  }
}; 