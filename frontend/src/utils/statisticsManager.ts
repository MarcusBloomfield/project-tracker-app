import { Task, TaskStatus, TaskPriority } from './taskManager';

export interface ContributionData {
  [date: string]: {
    completed: number;
    todo: number;
    inProgress: number;
    total: number;
  };
}

// Statistics data model
export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  tasksByPriority: Record<TaskPriority, number>;
  medianCompletionTime: number | null;
  taskCompletionTrend: TaskCompletionTrend[];
  upcomingDeadlines: Task[];
  overdueTasks: Task[];
  contributionData: ContributionData;
}

// Task completion trend data model for charts
export interface TaskCompletionTrend {
  date: string;
  completed: number;
  created: number;
}

// Statistics manager operations
export const statisticsManager = {
  /**
   * Calculate project statistics based on tasks
   */
  calculateProjectStatistics: (tasks: Task[]): ProjectStatistics => {
    const now = new Date();
    
    // Count tasks by status
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const todoTasks = tasks.filter(task => task.status === TaskStatus.TODO).length;
    
    // Count tasks by priority
    const tasksByPriority = {
      [TaskPriority.HIGH]: tasks.filter(task => task.priority === TaskPriority.HIGH).length,
      [TaskPriority.MEDIUM]: tasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
      [TaskPriority.LOW]: tasks.filter(task => task.priority === TaskPriority.LOW).length,
    };
    
    // Calculate completion rate
    const completionRate = tasks.length > 0 
      ? (completedTasks / tasks.length) * 100 
      : 0;
    
    // Calculate median completion time (for completed tasks)
    const completedTasksWithTime = tasks.filter(
      task => task.status === TaskStatus.COMPLETED && task.completedAt && task.createdAt
    );
    
    let medianCompletionTime = null;
    if (completedTasksWithTime.length > 0) {
      const completionTimes = completedTasksWithTime.map(task => {
        return new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime();
      }).sort((a, b) => a - b);
      
      // Calculate median time in milliseconds
      const middleIndex = Math.floor(completionTimes.length / 2);
      if (completionTimes.length % 2 === 0) {
        // Even number of elements - average of two middle values
        medianCompletionTime = (completionTimes[middleIndex - 1] + completionTimes[middleIndex]) / 2;
      } else {
        // Odd number of elements - middle value
        medianCompletionTime = completionTimes[middleIndex];
      }
    }
    
    // Get tasks with upcoming deadlines (within next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    const upcomingDeadlines = tasks.filter(task => 
      task.status !== TaskStatus.COMPLETED && 
      task.dueDate && 
      new Date(task.dueDate) <= sevenDaysFromNow &&
      new Date(task.dueDate) >= now
    ).sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    // Get overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.status !== TaskStatus.COMPLETED && 
      task.dueDate && 
      new Date(task.dueDate) < now
    ).sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    // Calculate task completion trend (last 14 days)
    const taskCompletionTrend = statisticsManager.calculateTaskCompletionTrend(tasks, 14);
    
    return {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
      tasksByPriority,
      medianCompletionTime,
      taskCompletionTrend,
      upcomingDeadlines,
      overdueTasks,
      contributionData: statisticsManager.calculateContributions(tasks)
    };
  },
  
  /**
   * Calculate task completion trend over a specific number of days
   */
  calculateTaskCompletionTrend: (tasks: Task[], days: number): TaskCompletionTrend[] => {
    const result: TaskCompletionTrend[] = [];
    const now = new Date();
    
    // Initialize array with last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      result.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        completed: 0,
        created: 0
      });
    }
    
    // Count created and completed tasks for each day
    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      const createdDateStr = createdDate.toISOString().split('T')[0];
      
      const dayIndex = result.findIndex(day => day.date === createdDateStr);
      if (dayIndex !== -1) {
        result[dayIndex].created++;
      }
      
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        const completedDateStr = completedDate.toISOString().split('T')[0];
        
        const completedDayIndex = result.findIndex(day => day.date === completedDateStr);
        if (completedDayIndex !== -1) {
          result[completedDayIndex].completed++;
        }
      }
    });
    
    return result;
  },
  
  /**
   * Format milliseconds into a human-readable duration string
   */
  formatDuration: (milliseconds: number | null): string => {
    if (milliseconds === null) return 'N/A';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },
  
  calculateContributions(tasks: Task[]): ContributionData {
    const contributions: ContributionData = {};
    
    // Get date range for the last year
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Initialize all dates in the last year with 0
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      contributions[dateStr] = {
        completed: 0,
        todo: 0,
        inProgress: 0,
        total: 0
      };
    }
    
    // Count contributions (created or completed tasks)
    tasks.forEach(task => {
      // Count task creation based on its current status
      const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
      if (contributions[createdDate] !== undefined) {
        contributions[createdDate].total++;
        
        if (task.status === TaskStatus.COMPLETED) {
          contributions[createdDate].completed++;
        } else if (task.status === TaskStatus.TODO) {
          contributions[createdDate].todo++;
        } else if (task.status === TaskStatus.IN_PROGRESS) {
          contributions[createdDate].inProgress++;
        }
      }
       
      // Count task completion
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
        if (contributions[completedDate] !== undefined) {
          contributions[completedDate].total++;
          contributions[completedDate].completed++;
        }
      }
    });
    
    return contributions;
  },
}; 
