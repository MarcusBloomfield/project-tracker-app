import React, { useState, useEffect } from 'react';
import { workTimeManager, DailyWorkTime, WorkTimeStatistics } from '../../utils/workTimeManager';

interface WorkTimeGraphProps {
  days?: number; // Number of days to show (default 30)
}

const WorkTimeGraph: React.FC<WorkTimeGraphProps> = ({ days = 30 }) => {
  const [dailyData, setDailyData] = useState<DailyWorkTime[]>([]);
  const [statistics, setStatistics] = useState<WorkTimeStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load work time data
  useEffect(() => {
    const loadWorkTimeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [dailyWorkTime, stats] = await Promise.all([
          workTimeManager.getDailyWorkTime(days),
          workTimeManager.getWorkTimeStatistics(days)
        ]);
        
        setDailyData(dailyWorkTime);
        setStatistics(stats);
      } catch (err) {
        setError('Failed to load work time data');
        console.error('Error loading work time data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkTimeData();
  }, [days]);

  // Simple fixed dimensions
  const getGraphDimensions = () => {
    const width = 700;
    const height = 300;
    const padding = { top: 20, right: 40, bottom: 60, left: 60 };
    
    return {
      width,
      height,
      padding,
      chartWidth: width - padding.left - padding.right,
      chartHeight: height - padding.top - padding.bottom
    };
  };

  // Generate SVG path for line graph
  const generateLinePath = (): string => {
    if (dailyData.length === 0) return '';
    
    const { chartWidth, chartHeight } = getGraphDimensions();
    const maxHours = Math.max(...dailyData.map(day => workTimeManager.millisecondsToHours(day.totalDuration)), 1);
    
    const points = dailyData.map((day, index) => {
      const x = (index / (dailyData.length - 1)) * chartWidth;
      const hours = workTimeManager.millisecondsToHours(day.totalDuration);
      const y = chartHeight - (hours / maxHours) * chartHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate grid lines for better readability
  const generateGridLines = () => {
    const { chartWidth, chartHeight } = getGraphDimensions();
    const maxHours = Math.max(...dailyData.map(day => workTimeManager.millisecondsToHours(day.totalDuration)), 1);
    const gridLines = [];
    
    // Horizontal grid lines (for hours)
    const hourSteps = Math.ceil(maxHours / 5);
    for (let i = 0; i <= 5; i++) {
      const y = chartHeight - (i / 5) * chartHeight;
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke="var(--border-primary)"
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }
    
    // Vertical grid lines (for dates)
    const dateSteps = Math.max(1, Math.floor(dailyData.length / 7));
    for (let i = 0; i < dailyData.length; i += dateSteps) {
      const x = (i / (dailyData.length - 1)) * chartWidth;
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={chartHeight}
          stroke="var(--border-primary)"
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }
    
    return gridLines;
  };

  // Generate simple axis labels
  const generateAxisLabels = () => {
    const { chartWidth, chartHeight } = getGraphDimensions();
    const maxHours = Math.max(...dailyData.map(day => workTimeManager.millisecondsToHours(day.totalDuration)), 1);
    const labels = [];
    
    // Y-axis labels (hours)
    for (let i = 0; i <= 5; i++) {
      const hours = (i / 5) * maxHours;
      const y = chartHeight - (i / 5) * chartHeight;
      labels.push(
        <text
          key={`y-${i}`}
          x={-10}
          y={y + 4}
          textAnchor="end"
          fontSize="12"
          fill="var(--text-tertiary)"
        >
          {hours.toFixed(1)}h
        </text>
      );
    }
    
    // X-axis labels (dates) - show every 5th day
    const dateSteps = Math.max(1, Math.floor(dailyData.length / 6));
    for (let i = 0; i < dailyData.length; i += dateSteps) {
      const x = (i / (dailyData.length - 1)) * chartWidth;
      const date = new Date(dailyData[i].date);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      labels.push(
        <text
          key={`x-${i}`}
          x={x}
          y={chartHeight + 20}
          textAnchor="middle"
          fontSize="12"
          fill="var(--text-tertiary)"
        >
          {label}
        </text>
      );
    }
    
    return labels;
  };

  // Generate simple data points
  const generateDataPoints = () => {
    if (dailyData.length === 0) return [];
    
    const { chartWidth, chartHeight } = getGraphDimensions();
    const maxHours = Math.max(...dailyData.map(day => workTimeManager.millisecondsToHours(day.totalDuration)), 1);
    
    return dailyData.map((day, index) => {
      const x = (index / (dailyData.length - 1)) * chartWidth;
      const hours = workTimeManager.millisecondsToHours(day.totalDuration);
      const y = chartHeight - (hours / maxHours) * chartHeight;
      
      return (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="4"
          fill="var(--color-primary)"
          stroke="var(--bg-primary)"
          strokeWidth="2"
        >
          <title>
            {`${new Date(day.date).toLocaleDateString()}: ${workTimeManager.formatDuration(day.totalDuration)} (${day.sessionCount} sessions)`}
          </title>
        </circle>
      );
    });
  };

  if (loading) {
    return (
      <div className="stat-card">
        <h3>Work Time Trend</h3>
        <div className="loading-message">Loading work time data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stat-card">
        <h3>Work Time Trend</h3>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!statistics || dailyData.length === 0) {
    return (
      <div className="stat-card">
        <h3>Work Time Trend</h3>
        <div className="no-data-message">
          <p>No work time data available.</p>
          <p>Start using the timer to track your work sessions!</p>
        </div>
      </div>
    );
  }

  const { width, height, padding } = getGraphDimensions();

  return (
    <div className="stat-card work-time-graph">
      <h3>Work Time Trend ({days} days)</h3>
      
      <div className="work-time-summary">
        <div className="summary-item">
          <span className="summary-label">Total Time:</span>
          <span className="summary-value">{workTimeManager.formatDuration(statistics.totalTime)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Average Daily:</span>
          <span className="summary-value">{workTimeManager.formatDuration(statistics.averageDailyTime)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Longest Session:</span>
          <span className="summary-value">{workTimeManager.formatDuration(statistics.longestSession)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Active Days:</span>
          <span className="summary-value">{statistics.activeDays}/{days}</span>
        </div>
      </div>
      
      <div className="graph-container">
        <svg 
          width={width} 
          height={height} 
          className="work-time-chart"
        >
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {generateGridLines()}
            {generateAxisLabels()}
            
            <path
              d={generateLinePath()}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {generateDataPoints()}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default WorkTimeGraph; 