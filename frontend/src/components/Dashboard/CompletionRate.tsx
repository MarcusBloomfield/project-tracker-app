import React from 'react';
import { ProjectStatistics } from '../../utils/statisticsManager';

interface CompletionRateProps {
    stats: ProjectStatistics | null;
}

// Format percentage for display
const formatPercentage = (value: number): string => {

    return `${value.toFixed(1)}%`;
};
const CompletionRate: React.FC<CompletionRateProps> = ({ stats }) =>{
    if (stats){
     return(

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
    )
    } else{
        
        <h3>Completion Rate: stats is empty</h3>
    }
}

export default CompletionRate
