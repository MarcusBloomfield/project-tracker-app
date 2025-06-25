import React from 'react'
import { statisticsManager, ProjectStatistics } from '../../utils/statisticsManager';

interface CompletionTimeProps {
    stats: ProjectStatistics | null;
}

const CompletionTime: React.FC<CompletionTimeProps> = ({ stats }) => {
    if (stats) {
        return (

            <div className="stat-card">
                <h3>Median Completion Time</h3>
                <div className="stat-value">
                    {stats.medianCompletionTime
                        ? statisticsManager.formatDuration(stats.medianCompletionTime)
                        : 'N/A'}
                </div>
                <div className="stat-label">From creation to completion</div>
            </div>
        )
    }
    else {
        <h3>Median Completion Time: No stats</h3>
    }
}

export default CompletionTime
