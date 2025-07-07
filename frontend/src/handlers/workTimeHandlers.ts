import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Convert fs functions to promises
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);

// Work session interface (must match the one in workTimeManager.ts)
interface WorkSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  date: string; // YYYY-MM-DD format for daily grouping
  projectId?: string; // optional project association
}

// Daily work time summary
interface DailyWorkTime {
  date: string; // YYYY-MM-DD format
  totalDuration: number; // milliseconds
  sessionCount: number;
  sessions: WorkSession[];
}

// Work time statistics
interface WorkTimeStatistics {
  totalTime: number; // milliseconds
  averageDailyTime: number; // milliseconds
  longestSession: number; // milliseconds
  totalSessions: number;
  activeDays: number;
  dailyTrend: DailyWorkTime[];
}

// Get work sessions file path
const getWorkSessionsFilePath = (): string => {
  const projectsPath = path.join(app.getPath('documents'), 'ProjectTracker');
  return path.join(projectsPath, 'work-sessions.json');
};

const getWorkSessionsBackupFilePath = (): string => {
  const projectsPath = path.join(app.getPath('documents'), 'ProjectTracker', '.backup');
  return path.join(projectsPath, 'work-sessions.json');
};

// Ensure work sessions file exists
const ensureWorkSessionsFile = async (): Promise<void> => {
  const workSessionsFilePath = getWorkSessionsFilePath();
  const dir = path.dirname(workSessionsFilePath);
  
  try {
    await stat(dir);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(dir, { recursive: true });
  }
  
  try {
    await stat(workSessionsFilePath);
  } catch (error) {
    // File doesn't exist, create it with empty sessions array
    await writeFile(workSessionsFilePath, JSON.stringify([], null, 2), { encoding: 'utf-8' });
  }
};

// Ensure backup work sessions file exists
const ensureWorkSessionsBackupFile = async (): Promise<void> => {
  const workSessionsBackupFilePath = getWorkSessionsBackupFilePath();
  const dir = path.dirname(workSessionsBackupFilePath);
  
  try {
    await stat(dir);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(dir, { recursive: true });
  }
  
  try {
    await stat(workSessionsBackupFilePath);
  } catch (error) {
    // File doesn't exist, create it with empty sessions array
    await writeFile(workSessionsBackupFilePath, JSON.stringify([], null, 2), { encoding: 'utf-8' });
  }
};

// Load work sessions from file
const loadWorkSessions = async (): Promise<WorkSession[]> => {
  await ensureWorkSessionsFile();
  const workSessionsFilePath = getWorkSessionsFilePath();
  
  try {
    const data = await readFile(workSessionsFilePath, { encoding: 'utf-8' });
    const sessions = JSON.parse(data);
    
    // Convert date strings back to Date objects
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime)
    }));
  } catch (error) {
    console.error('Error loading work sessions:', error);
    return [];
  }
};

// Save work sessions backup
const saveWorkSessionsBackup = async (sessions: WorkSession[]): Promise<boolean> => {
  await ensureWorkSessionsBackupFile();
  const workSessionsBackupFilePath = getWorkSessionsBackupFilePath();
  
  try {
    await writeFile(workSessionsBackupFilePath, JSON.stringify(sessions, null, 2), { encoding: 'utf-8' });
    return true;
  } catch (error) {
    console.error('Error saving work sessions backup:', error);
    return false;
  }
};

// Save work sessions to file
const saveWorkSessions = async (sessions: WorkSession[]): Promise<boolean> => {
  const backedUp = await saveWorkSessionsBackup(sessions);
  if (backedUp) {
    console.log('Work sessions backed up successfully');
  } else {
    console.error('Failed to backup work sessions');
  }
  
  await ensureWorkSessionsFile();
  const workSessionsFilePath = getWorkSessionsFilePath();
  
  try {
    await writeFile(workSessionsFilePath, JSON.stringify(sessions, null, 2), { encoding: 'utf-8' });
    return true;
  } catch (error) {
    console.error('Error saving work sessions:', error);
    return false;
  }
};

// Calculate daily work time data
const calculateDailyWorkTime = (sessions: WorkSession[], days: number): DailyWorkTime[] => {
  const dailyData: { [date: string]: DailyWorkTime } = {};
  const now = new Date();
  
  // Initialize all days with zero data
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    dailyData[dateStr] = {
      date: dateStr,
      totalDuration: 0,
      sessionCount: 0,
      sessions: []
    };
  }
  
  // Aggregate sessions by date
  sessions.forEach(session => {
    if (dailyData[session.date]) {
      dailyData[session.date].totalDuration += session.duration;
      dailyData[session.date].sessionCount++;
      dailyData[session.date].sessions.push(session);
    }
  });
  
  // Convert to array and sort by date
  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
};

// Calculate work time statistics
const calculateWorkTimeStatistics = (sessions: WorkSession[], days: number): WorkTimeStatistics => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentSessions = sessions.filter(session => new Date(session.date) >= cutoffDate);
  
  const totalTime = recentSessions.reduce((sum, session) => sum + session.duration, 0);
  const longestSession = recentSessions.reduce((max, session) => Math.max(max, session.duration), 0);
  const totalSessions = recentSessions.length;
  
  // Count active days (days with at least one session)
  const activeDaysSet = new Set(recentSessions.map(session => session.date));
  const activeDays = activeDaysSet.size;
  
  const averageDailyTime = activeDays > 0 ? totalTime / days : 0;
  
  const dailyTrend = calculateDailyWorkTime(recentSessions, days);
  
  return {
    totalTime,
    averageDailyTime,
    longestSession,
    totalSessions,
    activeDays,
    dailyTrend
  };
};

// Initialize work time handlers
export const initWorkTimeHandlers = (): void => {
  console.log('Initializing work time handlers...');

  // List work sessions
  ipcMain.on('workTime:list', async (event) => {
    try {
      const sessions = await loadWorkSessions();
      event.reply('workTime:list', sessions);
    } catch (error) {
      console.error('Error listing work sessions:', error);
      event.reply('workTime:list', []);
    }
  });

  // Save a work session
  ipcMain.on('workTime:save', async (event, { session }) => {
    try {
      const sessions = await loadWorkSessions();
      
      const newSession: WorkSession = {
        ...session,
        id: Date.now().toString(),
        date: session.startTime.toISOString().split('T')[0] // Extract date from startTime
      };
      
      sessions.push(newSession);
      
      const success = await saveWorkSessions(sessions);
      if (success) {
        event.reply('workTime:saved', newSession);
      } else {
        event.reply('workTime:saved', null);
      }
    } catch (error) {
      console.error('Error saving work session:', error);
      event.reply('workTime:saved', null);
    }
  });

  // Get daily work time data
  ipcMain.on('workTime:daily', async (event, { days }) => {
    try {
      const sessions = await loadWorkSessions();
      const dailyData = calculateDailyWorkTime(sessions, days);
      event.reply('workTime:daily', dailyData);
    } catch (error) {
      console.error('Error calculating daily work time:', error);
      event.reply('workTime:daily', []);
    }
  });

  // Get work time statistics
  ipcMain.on('workTime:statistics', async (event, { days }) => {
    try {
      const sessions = await loadWorkSessions();
      const statistics = calculateWorkTimeStatistics(sessions, days);
      event.reply('workTime:statistics', statistics);
    } catch (error) {
      console.error('Error calculating work time statistics:', error);
      event.reply('workTime:statistics', {
        totalTime: 0,
        averageDailyTime: 0,
        longestSession: 0,
        totalSessions: 0,
        activeDays: 0,
        dailyTrend: []
      });
    }
  });

  // Delete a work session
  ipcMain.on('workTime:delete', async (event, { sessionId }) => {
    try {
      const sessions = await loadWorkSessions();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);
      
      const success = await saveWorkSessions(filteredSessions);
      event.reply('workTime:deleted', success);
    } catch (error) {
      console.error('Error deleting work session:', error);
      event.reply('workTime:deleted', false);
    }
  });

  console.log('Work time handlers initialized successfully');
}; 