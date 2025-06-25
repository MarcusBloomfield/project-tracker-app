import React from 'react';
import { ProjectStatistics } from '../../utils/statisticsManager';

interface TaskPrioritiesProps {
    stats: ProjectStatistics | null;
}

const TaskPriorities: React.FC<TaskPrioritiesProps> = ({ stats }) => {

    if (stats) {
        return (
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
        )
    }
    else 
    {
        <h3>No Tasks: stats is empty</h3>
    }
}

export default TaskPriorities
