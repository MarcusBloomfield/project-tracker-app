// Task status options
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

// Task priority levels
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Task type options
export enum TaskType {
  BUG = 'bug',
  FEATURE = 'feature',
  TASK = 'task',
  OTHER = 'other'
}

// Task data model
export interface Task {
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

// Task manager operations
export const taskManager = {
  /**
   * Get all tasks for a specific project
   */
  getProjectTasks: (projectId: string): Promise<Task[]> => {
    return new Promise((resolve) => {
      window.api.send('task:list', { projectId });
      window.api.receive('task:list', (tasks: Task[]) => {
        resolve(tasks);
      });
    });
  },

  /**
   * Create a new task
   */
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task> => {
    return new Promise((resolve) => {
      window.api.send('task:create', { task });
      window.api.receive('task:created', (newTask: Task) => {
        resolve(newTask);
      });
    });
  },

  /**
   * Update an existing task
   */
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> => {
    return new Promise((resolve) => {
      window.api.send('task:update', { taskId, updates });
      window.api.receive('task:updated', (updatedTask: Task) => {
        resolve(updatedTask);
      });
    });
  },

  /**
   * Delete a task
   */
  deleteTask: (taskId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.api.send('task:delete', { taskId });
      window.api.receive('task:deleted', (success: boolean) => {
        resolve(success);
      });
    });
  },

  /**
   * Change task status
   */
  changeTaskStatus: (taskId: string, status: TaskStatus): Promise<Task> => {
    return new Promise((resolve) => {
      const updates = { 
        status,
        completedAt: status === TaskStatus.COMPLETED ? new Date() : null 
      };
      window.api.send('task:update', { taskId, updates });
      window.api.receive('task:updated', (updatedTask: Task) => {
        resolve(updatedTask);
      });
    });
  },

  /**
   * Filter tasks by status
   */
  filterByStatus: (tasks: Task[], status: TaskStatus | null): Task[] => {
    if (!status) return tasks;
    return tasks.filter(task => task.status === status);
  },

  /**
   * Filter tasks by priority
   */
  filterByPriority: (tasks: Task[], priority: TaskPriority | null): Task[] => {
    if (!priority) return tasks;
    return tasks.filter(task => task.priority === priority);
  },

  /**
   * Filter tasks by type
  /**
   * Filter tasks by type
   */
  filterByType: (tasks: Task[], type: TaskType | null): Task[] => {
    if (!type) return tasks;
    return tasks.filter(task => task.type === type);
  },

  /**
   * Filter tasks by tags
   */
  filterByTags: (tasks: Task[], tags: string[]): Task[] => {
    if (!tags.length) return tasks;
    return tasks.filter(task => 
      tags.some(tag => task.tags.includes(tag))
    );
  },

  /**
   * Sort tasks by due date, priority, or creation date
   */
  sortTasks: (tasks: Task[], sortBy: 'dueDate' | 'priority' | 'createdAt' = 'createdAt'): Task[] => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'dueDate') {
        // Handle null due dates
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } 
      
      if (sortBy === 'priority') {
        const priorityValues = {
          [TaskPriority.LOW]: 0,
          [TaskPriority.MEDIUM]: 1,
          [TaskPriority.HIGH]: 2
        };
        return priorityValues[b.priority] - priorityValues[a.priority];
      }
      
      // Default sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}; 