import React, { useState } from 'react';
import { ProjectStatistics } from '../utils/statisticsManager';
import '../styles/ReportExport.css';

interface ReportExportProps {
  projectId: string;
  stats: ProjectStatistics;
}

// Report format options
enum ReportFormat {
  CSV = 'csv',
  HTML = 'html',
  JSON = 'json'
}

// Report content options
interface ReportOption {
  id: string;
  label: string;
  checked: boolean;
}

const ReportExport: React.FC<ReportExportProps> = ({ projectId, stats }) => {
  const [exportFormat, setExportFormat] = useState<ReportFormat>(ReportFormat.HTML);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean | null>(null);
  const [exportOptions, setExportOptions] = useState<ReportOption[]>([
    { id: 'taskSummary', label: 'Task Summary', checked: true },
    { id: 'statusDistribution', label: 'Status Distribution', checked: true },
    { id: 'priorityDistribution', label: 'Priority Distribution', checked: true },
    { id: 'completionTrend', label: 'Completion Trend', checked: true },
    { id: 'upcomingDeadlines', label: 'Upcoming Deadlines', checked: true },
    { id: 'overdueTasks', label: 'Overdue Tasks', checked: true }
  ]);

  // Toggle report option
  const toggleOption = (optionId: string) => {
    setExportOptions(options => 
      options.map(option => 
        option.id === optionId 
          ? { ...option, checked: !option.checked } 
          : option
      )
    );
  };

  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportFormat(e.target.value as ReportFormat);
  };

  // Generate CSV content
  const generateCSV = (): string => {
    let csvContent = 'Project Report - ' + projectId + '\n\n';
    
    // Task Summary
    if (exportOptions.find(opt => opt.id === 'taskSummary')?.checked) {
      csvContent += 'Task Summary\n';
      csvContent += 'Total Tasks,Completed,In Progress,To Do,Completion Rate,Average Completion Time\n';
      csvContent += `${stats.totalTasks},${stats.completedTasks},${stats.inProgressTasks},${stats.todoTasks},${stats.completionRate.toFixed(1)}%,${stats.averageCompletionTime || 'N/A'}\n\n`;
    }
    
    // Status Distribution
    if (exportOptions.find(opt => opt.id === 'statusDistribution')?.checked) {
      csvContent += 'Status Distribution\n';
      csvContent += 'Status,Count,Percentage\n';
      csvContent += `To Do,${stats.todoTasks},${(stats.todoTasks / stats.totalTasks * 100).toFixed(1)}%\n`;
      csvContent += `In Progress,${stats.inProgressTasks},${(stats.inProgressTasks / stats.totalTasks * 100).toFixed(1)}%\n`;
      csvContent += `Completed,${stats.completedTasks},${(stats.completedTasks / stats.totalTasks * 100).toFixed(1)}%\n\n`;
    }
    
    // Priority Distribution
    if (exportOptions.find(opt => opt.id === 'priorityDistribution')?.checked) {
      csvContent += 'Priority Distribution\n';
      csvContent += 'Priority,Count,Percentage\n';
      csvContent += `High,${stats.tasksByPriority.high},${(stats.tasksByPriority.high / stats.totalTasks * 100).toFixed(1)}%\n`;
      csvContent += `Medium,${stats.tasksByPriority.medium},${(stats.tasksByPriority.medium / stats.totalTasks * 100).toFixed(1)}%\n`;
      csvContent += `Low,${stats.tasksByPriority.low},${(stats.tasksByPriority.low / stats.totalTasks * 100).toFixed(1)}%\n\n`;
    }
    
    // Completion Trend
    if (exportOptions.find(opt => opt.id === 'completionTrend')?.checked) {
      csvContent += 'Completion Trend\n';
      csvContent += 'Date,Created,Completed\n';
      stats.taskCompletionTrend.forEach(day => {
        csvContent += `${day.date},${day.created},${day.completed}\n`;
      });
      csvContent += '\n';
    }
    
    // Upcoming Deadlines
    if (exportOptions.find(opt => opt.id === 'upcomingDeadlines')?.checked && stats.upcomingDeadlines.length > 0) {
      csvContent += 'Upcoming Deadlines\n';
      csvContent += 'Task,Priority,Due Date\n';
      stats.upcomingDeadlines.forEach(task => {
        csvContent += `"${task.title}",${task.priority},${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}\n`;
      });
      csvContent += '\n';
    }
    
    // Overdue Tasks
    if (exportOptions.find(opt => opt.id === 'overdueTasks')?.checked && stats.overdueTasks.length > 0) {
      csvContent += 'Overdue Tasks\n';
      csvContent += 'Task,Priority,Due Date\n';
      stats.overdueTasks.forEach(task => {
        csvContent += `"${task.title}",${task.priority},${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}\n`;
      });
    }
    
    return csvContent;
  };

  // Generate HTML content
  const generateHTML = (): string => {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Project Report - ${projectId}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
          h1, h2 { color: #2c3e50; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .progress-bar { background-color: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden; }
          .progress-fill { height: 100%; background-color: #4caf50; }
          .todo { color: #ff9800; }
          .in-progress { color: #2196f3; }
          .completed { color: #4caf50; }
          .high { color: #f44336; }
          .medium { color: #ff9800; }
          .low { color: #4caf50; }
          .task-card { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
          .task-title { font-weight: bold; margin-bottom: 5px; }
          .task-due { font-size: 0.9rem; color: #666; }
        </style>
      </head>
      <body>
        <h1>Project Report - ${projectId}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    `;
    
    // Task Summary
    if (exportOptions.find(opt => opt.id === 'taskSummary')?.checked) {
      htmlContent += `
        <h2>Task Summary</h2>
        <table>
          <tr>
            <th>Total Tasks</th>
            <th>Completed</th>
            <th>In Progress</th>
            <th>To Do</th>
            <th>Completion Rate</th>
            <th>Average Completion Time</th>
          </tr>
          <tr>
            <td>${stats.totalTasks}</td>
            <td class="completed">${stats.completedTasks}</td>
            <td class="in-progress">${stats.inProgressTasks}</td>
            <td class="todo">${stats.todoTasks}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${stats.completionRate}%;"></div>
              </div>
              ${stats.completionRate.toFixed(1)}%
            </td>
            <td>${stats.averageCompletionTime ? stats.averageCompletionTime : 'N/A'}</td>
          </tr>
        </table>
      `;
    }
    
    // Status Distribution
    if (exportOptions.find(opt => opt.id === 'statusDistribution')?.checked) {
      htmlContent += `
        <h2>Status Distribution</h2>
        <table>
          <tr>
            <th>Status</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
          <tr>
            <td class="todo">To Do</td>
            <td>${stats.todoTasks}</td>
            <td>${(stats.todoTasks / stats.totalTasks * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td class="in-progress">In Progress</td>
            <td>${stats.inProgressTasks}</td>
            <td>${(stats.inProgressTasks / stats.totalTasks * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td class="completed">Completed</td>
            <td>${stats.completedTasks}</td>
            <td>${(stats.completedTasks / stats.totalTasks * 100).toFixed(1)}%</td>
          </tr>
        </table>
      `;
    }
    
    // Priority Distribution
    if (exportOptions.find(opt => opt.id === 'priorityDistribution')?.checked) {
      htmlContent += `
        <h2>Priority Distribution</h2>
        <table>
          <tr>
            <th>Priority</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
          <tr>
            <td class="high">High</td>
            <td>${stats.tasksByPriority.high}</td>
            <td>${(stats.tasksByPriority.high / stats.totalTasks * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td class="medium">Medium</td>
            <td>${stats.tasksByPriority.medium}</td>
            <td>${(stats.tasksByPriority.medium / stats.totalTasks * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td class="low">Low</td>
            <td>${stats.tasksByPriority.low}</td>
            <td>${(stats.tasksByPriority.low / stats.totalTasks * 100).toFixed(1)}%</td>
          </tr>
        </table>
      `;
    }
    
    // Completion Trend
    if (exportOptions.find(opt => opt.id === 'completionTrend')?.checked) {
      htmlContent += `
        <h2>Completion Trend</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Created</th>
            <th>Completed</th>
          </tr>
      `;
      
      stats.taskCompletionTrend.forEach(day => {
        htmlContent += `
          <tr>
            <td>${new Date(day.date).toLocaleDateString()}</td>
            <td>${day.created}</td>
            <td>${day.completed}</td>
          </tr>
        `;
      });
      
      htmlContent += `</table>`;
    }
    
    // Upcoming Deadlines
    if (exportOptions.find(opt => opt.id === 'upcomingDeadlines')?.checked && stats.upcomingDeadlines.length > 0) {
      htmlContent += `
        <h2>Upcoming Deadlines</h2>
      `;
      
      stats.upcomingDeadlines.forEach(task => {
        htmlContent += `
          <div class="task-card">
            <div class="task-title">${task.title}</div>
            <div class="task-due">Priority: <span class="${task.priority}">${task.priority}</span></div>
            <div class="task-due">Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</div>
          </div>
        `;
      });
    }
    
    // Overdue Tasks
    if (exportOptions.find(opt => opt.id === 'overdueTasks')?.checked && stats.overdueTasks.length > 0) {
      htmlContent += `
        <h2>Overdue Tasks</h2>
      `;
      
      stats.overdueTasks.forEach(task => {
        htmlContent += `
          <div class="task-card">
            <div class="task-title">${task.title}</div>
            <div class="task-due">Priority: <span class="${task.priority}">${task.priority}</span></div>
            <div class="task-due">Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</div>
          </div>
        `;
      });
    }
    
    htmlContent += `
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  // Generate JSON content
  const generateJSON = (): string => {
    const reportData: any = {
      projectId,
      generatedAt: new Date().toISOString()
    };
    
    // Task Summary
    if (exportOptions.find(opt => opt.id === 'taskSummary')?.checked) {
      reportData.taskSummary = {
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        inProgressTasks: stats.inProgressTasks,
        todoTasks: stats.todoTasks,
        completionRate: stats.completionRate,
        averageCompletionTime: stats.averageCompletionTime
      };
    }
    
    // Status Distribution
    if (exportOptions.find(opt => opt.id === 'statusDistribution')?.checked) {
      reportData.statusDistribution = {
        todo: {
          count: stats.todoTasks,
          percentage: stats.totalTasks > 0 ? (stats.todoTasks / stats.totalTasks) * 100 : 0
        },
        inProgress: {
          count: stats.inProgressTasks,
          percentage: stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0
        },
        completed: {
          count: stats.completedTasks,
          percentage: stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0
        }
      };
    }
    
    // Priority Distribution
    if (exportOptions.find(opt => opt.id === 'priorityDistribution')?.checked) {
      reportData.priorityDistribution = {
        high: {
          count: stats.tasksByPriority.high,
          percentage: stats.totalTasks > 0 ? (stats.tasksByPriority.high / stats.totalTasks) * 100 : 0
        },
        medium: {
          count: stats.tasksByPriority.medium,
          percentage: stats.totalTasks > 0 ? (stats.tasksByPriority.medium / stats.totalTasks) * 100 : 0
        },
        low: {
          count: stats.tasksByPriority.low,
          percentage: stats.totalTasks > 0 ? (stats.tasksByPriority.low / stats.totalTasks) * 100 : 0
        }
      };
    }
    
    // Completion Trend
    if (exportOptions.find(opt => opt.id === 'completionTrend')?.checked) {
      reportData.completionTrend = stats.taskCompletionTrend;
    }
    
    // Upcoming Deadlines
    if (exportOptions.find(opt => opt.id === 'upcomingDeadlines')?.checked) {
      reportData.upcomingDeadlines = stats.upcomingDeadlines;
    }
    
    // Overdue Tasks
    if (exportOptions.find(opt => opt.id === 'overdueTasks')?.checked) {
      reportData.overdueTasks = stats.overdueTasks;
    }
    
    return JSON.stringify(reportData, null, 2);
  };

  // Handle export button click
  const handleExport = () => {
    setIsExporting(true);
    
    // Generate export content based on selected format
    let content = '';
    let fileName = `${projectId}-report`;
    let mimeType = '';
    
    switch (exportFormat) {
      case ReportFormat.CSV:
        content = generateCSV();
        fileName += '.csv';
        mimeType = 'text/csv';
        break;
      case ReportFormat.HTML:
        content = generateHTML();
        fileName += '.html';
        mimeType = 'text/html';
        break;
      case ReportFormat.JSON:
        content = generateJSON();
        fileName += '.json';
        mimeType = 'application/json';
        break;
    }
    
    // Create a Blob from the content
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExportSuccess(true);
    
    // Reset success state after a delay
    setTimeout(() => {
      setExportSuccess(null);
      setIsExporting(false);
    }, 3000);
  };

  return (
    <div className="report-export">
      <h3>Export Report</h3>
      
      <div className="export-options">
        <div className="export-format">
          <label htmlFor="export-format">Format:</label>
          <select 
            id="export-format" 
            value={exportFormat} 
            onChange={handleFormatChange}
          >
            <option value={ReportFormat.HTML}>HTML</option>
            <option value={ReportFormat.CSV}>CSV</option>
            <option value={ReportFormat.JSON}>JSON</option>
          </select>
        </div>
        
        <div className="export-content">
          <p>Include in report:</p>
          <div className="export-checkboxes">
            {exportOptions.map(option => (
              <div key={option.id} className="export-checkbox">
                <input 
                  type="checkbox" 
                  id={option.id} 
                  checked={option.checked} 
                  onChange={() => toggleOption(option.id)} 
                />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button 
        className={`export-button ${isExporting ? 'exporting' : ''} ${exportSuccess ? 'success' : ''}`} 
        onClick={handleExport}
        disabled={isExporting}
      >
        {exportSuccess 
          ? '✓ Exported Successfully' 
          : isExporting 
            ? 'Exporting...' 
            : `Export as ${exportFormat.toUpperCase()}`}
      </button>
    </div>
  );
};

export default ReportExport; 