import React from 'react';
import { statisticsManager, ProjectStatistics, ContributionData } from '../../utils/statisticsManager';

interface ContributionGraphProps {
    stats: ProjectStatistics | null;
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ stats }) => {

    // Helper function to get day of week (0-6, 0 = Sunday)
    const getDayOfWeek = (dateStr: string): number => {
        return new Date(dateStr).getDay();
    };
    // Function to generate contribution grid data
    const generateContributionGrid = (contributionData: ContributionData) => {
        const weeks: { date: string; dayData: { completed: number; todo: number; inProgress: number; total: number } }[][] = [];
        const dates = Object.keys(contributionData).sort();

        if (dates.length === 0) return weeks;

        let currentWeek: { date: string; dayData: { completed: number; todo: number; inProgress: number; total: number } }[] = [];
        const firstDate = new Date(dates[0]);
        const firstDay = firstDate.getDay();

        // Fill in empty days at the start
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push({ date: '', dayData: { completed: 0, todo: 0, inProgress: 0, total: 0 } });
        }

        dates.forEach(date => {
            const dayOfWeek = getDayOfWeek(date);

            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentWeek.push({
                date,
                dayData: contributionData[date]
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        // Fill in remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ date: '', dayData: { completed: 0, todo: 0, inProgress: 0, total: 0 } });
            }
            weeks.push(currentWeek);
        }

        return weeks;
    };

    // Helper function to get contribution level (0-4)
    const getContributionLevel = (count: number): number => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    // Helper function to get contribution level (0-4)
    const getContributionType = () => {
        return "completed";
    };


    // Helper function to format date for tooltip
    const formatContributionDate = (dateStr: string, dayData: { completed: number; todo: number; inProgress: number; total: number }): string => {
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const parts: string[] = [];

        if (dayData.completed > 0) {
            parts.push(`${dayData.completed} completed`);
        }
        if (dayData.todo > 0) {
            parts.push(`${dayData.todo} todo`);
        }
        if (dayData.inProgress > 0) {
            parts.push(`${dayData.inProgress} in progress`);
        }

        const tasksText = parts.length > 0 ? parts.join(', ') : 'No tasks';

        return `${tasksText} on ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };
    // Helper function to get the dominant status for styling
    const getDominantStatus = (dayData: { completed: number; todo: number; inProgress: number; total: number }): string => {
        if (dayData.completed >= dayData.todo && dayData.completed >= dayData.inProgress) {
            return 'completed';
        } else if (dayData.inProgress >= dayData.todo) {
            return 'in-progress';
        } else {
            return 'todo';
        }
    };
    if (stats) {
        return (
            <div className="contribution-section">
                <div className="contribution-graph">
                    <div className="contribution-grid">
                        {generateContributionGrid(stats.contributionData).map((week, weekIndex) => (
                            <div key={weekIndex} className="contribution-week">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={`${weekIndex}-${dayIndex}`}
                                        className={`contribution-day level-${getContributionLevel(day.dayData.total)}-${day.dayData.total > 0 ? getDominantStatus(day.dayData) : ''}`}
                                        title={day.date ? formatContributionDate(day.date, day.dayData) : ''}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    else {
        <h3>No Tasks: stats is empty</h3>
    }
}

export default ContributionGraph

