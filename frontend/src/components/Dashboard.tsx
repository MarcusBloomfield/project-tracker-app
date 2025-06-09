import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, taskManager } from '../utils/taskManager';
import { statisticsManager, ProjectStatistics } from '../utils/statisticsManager';
import '../styles/Dashboard.css';

interface DashboardProps {
  projectId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ projectId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ProjectStatistics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});

  // Load project list when component mounts if showing all projects
  useEffect(() => {
    if (projectId === 'all') {
      window.api.triggerEvent('project:list', {});
      window.api.addListener('project:list', (projectList: any[]) => {
        const projectNames = projectList.map(project => project.name);
        setAllProjects(projectNames);
        
        // Create a mapping of project IDs to names
        const projectMapping: Record<string, string> = {};
        projectList.forEach(project => {
          projectMapping[project.name] = project.name;
        });
        setProjectNames(projectMapping);
      });
    }
  }, [projectId]);

  // Load tasks when component mounts or projectId or allProjects changes
  useEffect(() => {
    if (projectId === 'all') {
      if (allProjects.length === 0) return;
      
      setLoading(true);
      
      // Initialize an array to collect all tasks
      let allTasks: Task[] = [];
      let loadedProjectCount = 0;
      let componentMounted = true;
      
      // Setup a handler for receiving tasks from each project
      const handleTasksReceived = (taskList: Task[], currentProjectId: string) => {
        if (!componentMounted) return;
        
        allTasks = [...allTasks, ...taskList];
        loadedProjectCount++;
        
        // When all projects are loaded, update the state
        if (loadedProjectCount === allProjects.length) {
          setTasks(allTasks);
          setLoading(false);
        }
      };
      
      // Register the listener once
      window.api.addListener('task:list', handleTasksReceived);
      
      // Request tasks for each project
      allProjects.forEach(projectName => {
        window.api.triggerEvent('task:list', { projectId: projectName });
      });
      
      // Cleanup function 
      return () => {
        componentMounted = false;
      };
    } else if (projectId) {
      setLoading(true);
      
      let componentMounted = true;
      
      const handleTaskList = (taskList: Task[]) => {
        if (!componentMounted) return;
        
        setTasks(taskList);
        setLoading(false);
      };
      
      window.api.triggerEvent('task:list', { projectId });
      window.api.addListener('task:list', handleTaskList);
      
      // Cleanup function
      return () => {
        componentMounted = false;
      };
    }
  }, [projectId, allProjects]);

  // Calculate statistics when tasks are loaded
  useEffect(() => {
    if (tasks.length === 0 && !loading) {
      setStats(null);
      return;
    }

    if (tasks.length > 0) {
      const projectStats = statisticsManager.calculateProjectStatistics(tasks);
      setStats(projectStats);
    }
  }, [tasks, loading]);

  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  // Get priority label and class
  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return { label: 'High', className: 'priority-high' };
      case TaskPriority.MEDIUM:
        return { label: 'Medium', className: 'priority-medium' };
      case TaskPriority.LOW:
        return { label: 'Low', className: 'priority-low' };
    }
  };

  // Render task status badge
  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <span className="status-badge status-todo">To Do</span>;
      case TaskStatus.IN_PROGRESS:
        return <span className="status-badge status-in-progress">In Progress</span>;
      case TaskStatus.COMPLETED:
        return <span className="status-badge status-completed">Completed</span>;
    }
  };

  if (loading && (!stats || tasks.length === 0)) {
    return <div className="dashboard-container">Loading project statistics...</div>;
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <h2>{projectId === 'all' ? 'All Projects Dashboard' : 'Project Dashboard'}</h2>
        <div className="no-stats">
          <p>No tasks found {projectId === 'all' ? 'across any projects' : 'for this project'}.</p>
          <p>Create tasks to see project statistics.</p>
        </div>
      </div>
    );
  }

  // Sort tasks by priority for all projects view
  const tasksSortedByPriority = projectId === 'all' 
    ? taskManager.sortTasks([...tasks], 'priority')
    : [];

  return (
    <div className="dashboard-container">
      <h2>{projectId === 'all' ? 'All Projects Dashboard' : 'Project Dashboard'}</h2>
      
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Task Overview</h3>
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
          
          <div className="stat-details">
            <div className="stat-item">
              <span className="stat-item-value todo">{stats.todoTasks}</span>
              <span className="stat-item-label">To Do</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-value in-progress">{stats.inProgressTasks}</span>
              <span className="stat-item-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-value completed">{stats.completedTasks}</span>
              <span className="stat-item-label">Completed</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <div className="completion-circle" style={{ 
            background: `conic-gradient(#4caf50 ${stats.completionRate * 3.6}deg, #f0f0f0 ${stats.completionRate * 3.6}deg)` 
          }}>
            <div className="completion-inner">
              <span>{formatPercentage(stats.completionRate)}</span>
            </div>
          </div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        
        <div className="stat-card">
          <h3>Average Completion Time</h3>
          <div className="stat-value">
            {stats.averageCompletionTime 
              ? statisticsManager.formatDuration(stats.averageCompletionTime)
              : 'N/A'}
          </div>
          <div className="stat-label">From creation to completion</div>
        </div>
      </div>
      
      {/* All tasks from all projects sorted by priority */}
      {projectId === 'all' && tasksSortedByPriority.length > 0 && (
        <div className="stats-row">
          <div className="stat-chart-card full-width">
            <h3>All Tasks Sorted by Priority</h3>
            <div className="all-tasks-list">
              {tasksSortedByPriority.map(task => (
                <div key={task.id} className={`task-item ${task.status === TaskStatus.COMPLETED ? 'completed' : ''}`}>
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <div className="task-project">
                      Project: {projectNames[task.projectId] || task.projectId}
                    </div>
                  </div>
                  <div className="task-info">
                    <div className="task-status">{renderStatusBadge(task.status)}</div>
                    <div className={`task-priority ${getPriorityInfo(task.priority).className}`}>
                      {getPriorityInfo(task.priority).label}
                    </div>
                    {task.dueDate && (
                      <div className="task-due-date">
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="task-tags">
                      {task.tags.map(tag => (
                        <span key={tag} className="task-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="stats-row">
        <div className="stat-chart-card">
          <h3>Task Distribution</h3>
          <div className="task-distribution">
            <div className="distribution-bar">
              {stats.totalTasks > 0 && (
                <>
                  <div 
                    className="distribution-segment todo" 
                    style={{ width: `${(stats.todoTasks / stats.totalTasks) * 100}%` }}
                    title={`To Do: ${stats.todoTasks} tasks (${formatPercentage((stats.todoTasks / stats.totalTasks) * 100)})`}
                  ></div>
                  <div 
                    className="distribution-segment in-progress" 
                    style={{ width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%` }}
                    title={`In Progress: ${stats.inProgressTasks} tasks (${formatPercentage((stats.inProgressTasks / stats.totalTasks) * 100)})`}
                  ></div>
                  <div 
                    className="distribution-segment completed" 
                    style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                    title={`Completed: ${stats.completedTasks} tasks (${formatPercentage((stats.completedTasks / stats.totalTasks) * 100)})`}
                  ></div>
                </>
              )}
            </div>
            
            <div className="distribution-legend">
              <div className="legend-item">
                <span className="legend-color todo"></span>
                <span className="legend-label">To Do</span>
                <span className="legend-value">{stats.todoTasks}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color in-progress"></span>
                <span className="legend-label">In Progress</span>
                <span className="legend-value">{stats.inProgressTasks}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color completed"></span>
                <span className="legend-label">Completed</span>
                <span className="legend-value">{stats.completedTasks}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-chart-card">
          <h3>Task Priorities</h3>
          <div className="task-priorities">
            <div className="priorities-chart">
              {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
                <div 
                  key={priority}
                  className={`priority-bar ${priority.toLowerCase()}`}
                  style={{ height: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 200 : 0}px` }}
                  title={`${priority}: ${count} tasks`}
                ></div>
              ))}
            </div>
            
            <div className="priorities-legend">
              <div className="legend-item">
                <span className="legend-color high"></span>
                <span className="legend-label">High</span>
                <span className="legend-value">{stats.tasksByPriority.high}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color medium"></span>
                <span className="legend-label">Medium</span>
                <span className="legend-value">{stats.tasksByPriority.medium}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color low"></span>
                <span className="legend-label">Low</span>
                <span className="legend-value">{stats.tasksByPriority.low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard; 