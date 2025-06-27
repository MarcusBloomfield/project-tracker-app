import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, taskManager, TaskType } from '../utils/taskManager';
import '../css/TaskList.css';

interface TaskListProps {
  projectId: string;
}

const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | null>(null);
  const [typeFilter, setTypeFilter] = useState<TaskType | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    type: TaskType.TASK,
    dueDate: '',
    tags: ''
  });

  // Load tasks when component mounts or projectId changes
  useEffect(() => {
    if (!projectId) return;

    const loadTasks = async () => {
      setLoading(true);
      
      try {
        const taskList = await taskManager.getProjectTasks(projectId);
        setTasks(taskList);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId]);

  // Apply filters and sorting when tasks, filters, or sort criteria change
  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (statusFilter) {
      result = taskManager.filterByStatus(result, statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter) {
      result = taskManager.filterByPriority(result, priorityFilter);
    }
    
    // Apply type filter
    if (typeFilter) {
      result = taskManager.filterByType(result, typeFilter);
    }
    
    // Apply sort
    result = taskManager.sortTasks(result, sortBy);
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, priorityFilter, typeFilter, sortBy]);

  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter(null);
    setPriorityFilter(null);
    setTypeFilter(null);
    setSortBy('createdAt');
  };

  // Handle changing task status
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await taskManager.changeTaskStatus(taskId, newStatus);
      
      // Update the task in the local state
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        const success = await taskManager.deleteTask(taskId);
        
        if (success) {
          // Remove the task from local state
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        } else {
          console.error('Failed to delete task');
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  // Handle changes to new task form
  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Handle saving a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      projectId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      type: newTask.type,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    try {
      const createdTask = await taskManager.createTask(taskData);
      
      // Add the new task to local state
      setTasks(prevTasks => [...prevTasks, createdTask]);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        type: TaskType.TASK,
        dueDate: '',
        tags: ''
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
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

  
  // Render task status badge
  const renderTaskTypeBadge = (type: TaskType) => {
    switch (type) {
      case TaskType.TASK:
        return <span className="task-type-badge task-type-task">Task</span>;
      case TaskType.FEATURE:
        return <span className="task-type-badge task-type-feature">Feature</span>;
      case TaskType.BUG:
        return <span className="task-type-badge task-type-bug">Bug</span>;
      case TaskType.OTHER:
        return <span className="task-type-badge task-type-other">Other</span>;
      default:
        return <span className="task-type-badge task-type-other">Other</span>;
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="task-list-container">Loading tasks...</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Tasks</h2>
        <button 
          className="create-task-button"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? '✖ Cancel' : '+ New Task'}
        </button>
      </div>
      
      {isCreating && (
        <div className="new-task-form-container">
          <h3>Create New Task</h3>
          <form className="new-task-form" onSubmit={handleCreateTask}>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={newTask.title} 
                onChange={handleNewTaskChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea 
                id="description" 
                name="description" 
                value={newTask.description} 
                onChange={handleNewTaskChange} 
                className='description-textarea'
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <select 
                  id="status" 
                  name="status" 
                  value={newTask.status} 
                  onChange={handleNewTaskChange}
                >
                  <option value={TaskStatus.TODO}>To Do</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.COMPLETED}>Completed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority:</label>
                <select 
                  id="priority" 
                  name="priority" 
                  value={newTask.priority} 
                  onChange={handleNewTaskChange}
                >
                  <option value={TaskPriority.LOW}>Low</option>
                  <option value={TaskPriority.MEDIUM}>Medium</option>
                  <option value={TaskPriority.HIGH}>High</option>
                </select>
              </div>

              
              <div className="form-group">
                <label htmlFor="type">Type:</label>
                <select 
                  id="type" 
                  name="type" 
                  value={newTask.type} 
                  onChange={handleNewTaskChange}
                >
                  <option value={TaskType.TASK}>Task</option>
                  <option value={TaskType.FEATURE}>Feature</option>
                  <option value={TaskType.BUG}>Bug</option>
                  <option value={TaskType.OTHER}>Other</option>
                </select>
              </div>
            </div>
            
            
            <div className="form-group">
              <label htmlFor="dueDate">Due Date:</label>
              <input 
                type="date" 
                id="dueDate" 
                name="dueDate" 
                value={newTask.dueDate} 
                onChange={handleNewTaskChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated):</label>
              <input 
                type="text" 
                id="tags" 
                name="tags" 
                value={newTask.tags} 
                onChange={handleNewTaskChange} 
                placeholder="Easy, LongTask, Annoying, etc."
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-button">Create Task</button>
              <button 
                type="button" 
                className="cancel-button" 
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="task-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter || ''} onChange={e => setStatusFilter(e.target.value as TaskStatus || null)}>
            <option value="">All</option>
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Priority:</label>
          <select value={priorityFilter || ''} onChange={e => setPriorityFilter(e.target.value as TaskPriority || null)}>
            <option value="">All</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.LOW}>Low</option>
          </select>
        </div>

        
        <div className="filter-group">
          <label>Type:</label>
          <select value={typeFilter || ''} onChange={e => setTypeFilter(e.target.value as TaskType || null)}>
            <option value="">All</option>
            <option value={TaskType.TASK}>Task</option>
            <option value={TaskType.FEATURE}>Feature</option>
            <option value={TaskType.BUG}>Bug</option>
            <option value={TaskType.OTHER}>Other</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as 'dueDate' | 'priority' | 'createdAt')}
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        
        <button 
          className="reset-filters-button"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks found.</p>
          <p>Create a new task to get started.</p>
        </div>
      ) : (
        <div className="task-items">
          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item ${task.status === TaskStatus.COMPLETED ? 'completed' : ''}`}
            >
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <button 
                    className="delete-task-button"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    ✖
                  </button>
                </div>
              </div>
              
              <div className="task-info">

                <div className="task-status">
                  {renderStatusBadge(task.status)}
                </div>
                
                <div className={`task-priority ${getPriorityInfo(task.priority).className}`}>
                  {getPriorityInfo(task.priority).label}
                </div>  

                <div className="task-type">
                  {renderTaskTypeBadge(task.type)}
                </div>
                
                {task.dueDate && (
                  <div className="task-due-date">
                    Due: {formatDate(task.dueDate)}
                  </div>
                )}
              </div>
              
              {task.description && (
                <div className="task-description">
                  {task.description}
                </div>
              )}
              
              {task.tags && task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map(tag => (
                    <span key={tag} className="task-tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="task-status-actions">
                <button 
                  className={`status-button todo ${task.status === TaskStatus.TODO ? 'active' : ''}`}
                  onClick={() => handleStatusChange(task.id, TaskStatus.TODO)}
                >
                  To Do
                </button>
                <button 
                  className={`status-button in-progress ${task.status === TaskStatus.IN_PROGRESS ? 'active' : ''}`}
                  onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                >
                  In Progress
                </button>
                <button 
                  className={`status-button completed ${task.status === TaskStatus.COMPLETED ? 'active' : ''}`}
                  onClick={() => handleStatusChange(task.id, TaskStatus.COMPLETED)}
                >
                  Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList; 