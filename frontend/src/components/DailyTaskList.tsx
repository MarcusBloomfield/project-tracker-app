import React, { useState, useEffect, useRef } from 'react';
import { DailyTask, dailyTaskManager } from '../utils/dailyTaskManager';
import '../styles/DailyTaskList.css';

const DailyTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);

  // References for drag and drop
  const draggedItemRef = useRef<HTMLDivElement | null>(null);
  const draggedOverItemRef = useRef<string | null>(null);

  // Load daily tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  // Load tasks from the backend
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const taskList = await dailyTaskManager.getDailyTasks();
      setTasks(taskList);
    } catch (err) {
      setError('Failed to load daily tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newTask = await dailyTaskManager.createDailyTask(newTaskTitle.trim());
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskTitle('');
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggling task completion
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTask = await dailyTaskManager.toggleTaskCompletion(taskId, !completed);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await dailyTaskManager.deleteDailyTask(taskId);
      if (success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        setError('Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: DailyTask) => {
    setDraggedTask(task);
    draggedItemRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    // Add a delay to ensure the dragged element is styled properly
    setTimeout(() => {
      if (draggedItemRef.current) {
        draggedItemRef.current.classList.add('dragging');
      }
    }, 0);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (draggedItemRef.current) {
      draggedItemRef.current.classList.remove('dragging');
    }
    setDraggedTask(null);
    draggedItemRef.current = null;
    draggedOverItemRef.current = null;
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedOverItemRef.current === taskId) return;
    
    draggedOverItemRef.current = taskId;
    
    // Find the current target element and add a visual indicator
    const currentElement = e.currentTarget;
    
    // Reset all other task items
    document.querySelectorAll('.daily-task-item').forEach(item => {
      if (item !== draggedItemRef.current) {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      }
    });
    
    // Don't apply visual indicators if dragging over self
    if (draggedTask && draggedTask.id === taskId) return;
    
    // Get bounding rect for position calculations
    const rect = currentElement.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    // Determine whether to show top or bottom indicator
    if (e.clientY < midpoint) {
      currentElement.classList.add('drag-over-top');
      currentElement.classList.remove('drag-over-bottom');
    } else {
      currentElement.classList.add('drag-over-bottom');
      currentElement.classList.remove('drag-over-top');
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetTaskId: string) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    // Remove visual indicators
    document.querySelectorAll('.daily-task-item').forEach(item => {
      item.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    const droppedOnSelf = draggedTask.id === targetTaskId;
    if (droppedOnSelf) return;
    
    // Create a new array of tasks with the dropped task in the new position
    const tasksCopy = [...tasks];
    const draggedTaskIndex = tasksCopy.findIndex(t => t.id === draggedTask.id);
    const targetTaskIndex = tasksCopy.findIndex(t => t.id === targetTaskId);
    
    if (draggedTaskIndex !== -1 && targetTaskIndex !== -1) {
      // Get position from drop indicator
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const insertBeforeTarget = e.clientY < midpoint;
      
      // Remove the dragged task
      const [removedTask] = tasksCopy.splice(draggedTaskIndex, 1);
      
      // Calculate the new index
      let newIndex = targetTaskIndex;
      if (draggedTaskIndex < targetTaskIndex && !insertBeforeTarget) {
        newIndex = targetTaskIndex - 1;
      } else if (draggedTaskIndex > targetTaskIndex && insertBeforeTarget) {
        newIndex = targetTaskIndex;
      } else if (draggedTaskIndex > targetTaskIndex && !insertBeforeTarget) {
        newIndex = targetTaskIndex + 1;
      }
      
      // Insert the task at the new index
      tasksCopy.splice(newIndex, 0, removedTask);
      
      try {
        setLoading(true);
        const updatedTasks = await dailyTaskManager.reorderTasks(tasksCopy);
        if (updatedTasks) {
          setTasks(updatedTasks);
        }
      } catch (err) {
        setError('Failed to reorder tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="daily-task-container">Loading daily tasks...</div>;
  }

  return (
    <div className="daily-task-container">
      <h3>Daily Tasks</h3>
      <p className="daily-task-subtitle">These tasks reset every day</p>
      <p className="daily-task-subtitle drag-info">Drag tasks to reorder them</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="add-daily-task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          placeholder="Add a new daily task..."
          className="daily-task-input"
        />
        <button 
          type="submit" 
          className="add-daily-task-button"
          disabled={!newTaskTitle.trim() || loading}
        >
          Add
        </button>
      </form>
      
      <div className="daily-task-list">
        {tasks.length === 0 ? (
          <div className="no-daily-tasks">
            <p>No daily tasks yet.</p>
            <p>Add some tasks to track every day.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`daily-task-item ${task.completed ? 'completed' : ''}`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, task.id)}
            >
              <div className="daily-task-drag-handle">
                <span className="drag-icon">☰</span>
              </div>
              <div className="daily-task-checkbox-container">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id, task.completed)}
                  className="daily-task-checkbox"
                  id={`task-${task.id}`}
                />
                <label 
                  htmlFor={`task-${task.id}`}
                  className="daily-task-label"
                >
                  {task.title}
                </label>
              </div>
              <div className="daily-task-actions">
                <span className="daily-task-date">
                  Added: {formatDate(task.createdAt)}
                </span>
                <button
                  className="delete-daily-task-button"
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete task"
                >
                  ✖
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyTaskList; 