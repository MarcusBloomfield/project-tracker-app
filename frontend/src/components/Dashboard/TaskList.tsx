
import React from 'react';
import { ProjectStatistics } from '../../utils/statisticsManager';
import { Task, TaskStatus, TaskPriority, taskManager } from '../../utils/taskManager';

interface TaskListProps {
    tasks: Task[]
    projectNames: Record<string, string>
}

const TaskList: React.FC<TaskListProps> = ({ tasks, projectNames }) => {
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

    if (tasks) {
        return (


                <div className="stats-row">
                    <div className="stat-chart-card full-width">
                        <h3>Uncompleted Tasks</h3>
                        <div className="all-tasks-list">
                            {tasks.map(task => (
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
            )
    }
    else 
    {
        <h3>No Tasks: stats is empty</h3>
    }
}

export default TaskList
