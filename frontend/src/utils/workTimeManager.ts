// Work session data model
export interface WorkSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  date: string; // YYYY-MM-DD format for daily grouping
  projectId?: string; // optional project association
}

// Daily work time summary
export interface DailyWorkTime {
  date: string; // YYYY-MM-DD format
  totalDuration: number; // milliseconds
  sessionCount: number;
  sessions: WorkSession[];
}

// Work time statistics
export interface WorkTimeStatistics {
  totalTime: number; // milliseconds
  averageDailyTime: number; // milliseconds
  longestSession: number; // milliseconds
  totalSessions: number;
  activeDays: number;
  dailyTrend: DailyWorkTime[];
}

// Work time manager operations
export const workTimeManager = {
  /**
   * Get all work sessions
   */
  getWorkSessions: (): Promise<WorkSession[]> => {
    return new Promise((resolve) => {
      const handleSessionList = (sessions: WorkSession[]) => {
        window.api.removeListener('workTime:list', handleSessionList);
        resolve(sessions);
      };

      window.api.addListener('workTime:list', handleSessionList);
      window.api.triggerEvent('workTime:list', {});
    });
  },

  /**
   * Save a completed work session
   */
  saveWorkSession: (session: Omit<WorkSession, 'id' | 'date'>): Promise<WorkSession> => {
    return new Promise((resolve) => {
      const handleSessionSaved = (savedSession: WorkSession) => {
        window.api.removeListener('workTime:saved', handleSessionSaved);
        resolve(savedSession);
      };

      window.api.addListener('workTime:saved', handleSessionSaved);
      window.api.triggerEvent('workTime:save', { session });
    });
  },

  /**
   * Get daily work time data for the last N days
   */
  getDailyWorkTime: (days: number = 30): Promise<DailyWorkTime[]> => {
    return new Promise((resolve) => {
      const handleDailyData = (dailyData: DailyWorkTime[]) => {
        window.api.removeListener('workTime:daily', handleDailyData);
        resolve(dailyData);
      };

      window.api.addListener('workTime:daily', handleDailyData);
      window.api.triggerEvent('workTime:daily', { days });
    });
  },

  /**
   * Get work time statistics
   */
  getWorkTimeStatistics: (days: number = 30): Promise<WorkTimeStatistics> => {
    return new Promise((resolve) => {
      const handleStatistics = (stats: WorkTimeStatistics) => {
        window.api.removeListener('workTime:statistics', handleStatistics);
        resolve(stats);
      };

      window.api.addListener('workTime:statistics', handleStatistics);
      window.api.triggerEvent('workTime:statistics', { days });
    });
  },

  /**
   * Delete a work session
   */
  deleteWorkSession: (sessionId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleSessionDeleted = (success: boolean) => {
        window.api.removeListener('workTime:deleted', handleSessionDeleted);
        resolve(success);
      };

      window.api.addListener('workTime:deleted', handleSessionDeleted);
      window.api.triggerEvent('workTime:delete', { sessionId });
    });
  },

  /**
   * Format duration in milliseconds to human-readable string
   */
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  },

  /**
   * Convert milliseconds to hours for graph display
   */
  millisecondsToHours: (milliseconds: number): number => {
    return Number((milliseconds / (1000 * 60 * 60)).toFixed(2));
  },

  /**
   * Get the last N days of dates for graph baseline
   */
  getDateRange: (days: number): string[] => {
    const dates: string[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }
}; 