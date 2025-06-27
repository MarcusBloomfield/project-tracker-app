import React from 'react';
import { ProjectStatistics } from '../../utils/statisticsManager';

interface TaskPrioritiesProps {
    stats: ProjectStatistics | null;
}

const TaskPriorities: React.FC<TaskPrioritiesProps> = ({ stats }) => {

    if (stats) {
        return (
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
                  <span className="legend-label">Medium</span>i
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
        )
    }
    else 
    {
        <h3>No Tasks: stats is empty</h3>
    }
}

export default TaskPriorities
