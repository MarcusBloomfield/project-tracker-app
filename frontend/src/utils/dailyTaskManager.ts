
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
      const handleTaskList = (tasks: DailyTask[]) => {
        window.api.removeListener('dailyTask:list', handleTaskList);
        resolve(tasks);
      };

      window.api.removeListener('dailyTask:list', handleTaskList);
      window.api.addListener('dailyTask:list', handleTaskList);
      window.api.triggerEvent('dailyTask:list', {});
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

      const handleTaskCreated = (newTask: DailyTask) => {
        window.api.removeListener('dailyTask:created', handleTaskCreated);
        resolve(newTask);
      };

      window.api.addListener('dailyTask:created', handleTaskCreated);
      window.api.triggerEvent('dailyTask:create', { task: taskData });
    });
  },

  /**
   * Toggle task completion status
   */
  toggleTaskCompletion: (taskId: string, completed: boolean): Promise<DailyTask> => {
    return new Promise((resolve) => {
      const handleTaskUpdated = (updatedTask: DailyTask) => {
        window.api.removeListener('dailyTask:updated', handleTaskUpdated);
        resolve(updatedTask);
      };

      window.api.addListener('dailyTask:updated', handleTaskUpdated);
      window.api.triggerEvent('dailyTask:toggle', { taskId, completed });
    });
  },

  /**
   * Delete a daily task
   */
  deleteDailyTask: (taskId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleTaskDeleted = (success: boolean) => {
        window.api.removeListener('dailyTask:deleted', handleTaskDeleted);
        resolve(success);
      };

      window.api.addListener('dailyTask:deleted', handleTaskDeleted);
      window.api.triggerEvent('dailyTask:delete', { taskId });
    });
  },

  /**
   * Reorder tasks after drag and drop
   */
  reorderTasks: (tasks: DailyTask[]): Promise<DailyTask[]> => {
    return new Promise((resolve) => {
      const handleTasksReordered = (updatedTasks: DailyTask[]) => {
        window.api.removeListener('dailyTask:reordered', handleTasksReordered);
        resolve(updatedTasks);
      };

      window.api.addListener('dailyTask:reordered', handleTasksReordered);
      window.api.triggerEvent('dailyTask:reorder', { tasks });
    });
  }
}; 