import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, taskManager } from '../../utils/taskManager';
import { statisticsManager, ProjectStatistics} from '../../utils/statisticsManager';
import { fileSystem } from '../../utils/fileSystem';
import '../../css/Dashboard.css';

import UpTime from './UpTime';
import TaskOverview from './TaskOverview';
import CompletionRate from './CompletionRate';
import CompletionTime from './CompletionTime';
import ContributionGraph from './ContributionGraph';
import TaskList from './TaskList';
import TaskPriorities from './TaskPriorities'; 
import WorkTimeGraph from '../WorkTimeGraph'; 

interface DashboardProps {
    projectId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ projectId }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<ProjectStatistics | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allProjects, setAllProjects] = useState<string[]>([]);
    const [projectNames, setProjectNames] = useState<Record<string, string>>({});

    // Load project list when component mounts if showing all projects
    useEffect(() => {
        if (projectId === 'all') {
            const loadProjects = async () => {
                try {
                    const projectList = await fileSystem.listProjects();
                    const projectNames = projectList.map(project => project.name);
                    setAllProjects(projectNames);

                    // Create a mapping of project IDs to names
                    const projectMapping: Record<string, string> = {};
                    projectList.forEach(project => {
                        projectMapping[project.name] = project.name;
                    });
                    setProjectNames(projectMapping);
                } catch (error) {
                    console.error('Failed to load projects:', error);
                }
            };

            loadProjects();
        }
    }, [projectId]);

    // Load tasks when component mounts or projectId or allProjects changes
    useEffect(() => {
        if (projectId === 'all') {
            if (allProjects.length === 0) return;

            setLoading(true);

            // Initialize an array to collect all tasks
            let allTasks: Task[] = [];
            let loadedProjectCount = 0;
            let componentMounted = true;

            // Setup a handler for receiving tasks from each project
            const handleTasksReceived = (taskList: Task[], currentProjectId: string) => {
                if (!componentMounted) return;

                allTasks = [...allTasks, ...taskList];
                loadedProjectCount++;

                // When all projects are loaded, update the state
                if (loadedProjectCount === allProjects.length) {
                    setTasks(allTasks);
                    setLoading(false);
                }
            };

            // Register the listener once
            window.api.addListener('task:list', handleTasksReceived);

            // Request tasks for each project
            allProjects.forEach(projectName => {
                window.api.triggerEvent('task:list', { projectId: projectName });
            });

            // Cleanup function 
            return () => {
                componentMounted = false;
                window.api.removeListener('task:list', handleTasksReceived);
            };
        }
        else if (projectId) {
            setLoading(true);

            let componentMounted = true;

            const handleTaskList = (taskList: Task[]) => {
                if (!componentMounted) return;

                setTasks(taskList);
                setLoading(false);
            };

            window.api.triggerEvent('task:list', { projectId });
            window.api.addListener('task:list', handleTaskList);

            // Cleanup function
            return () => {
                componentMounted = false;
                window.api.removeListener('task:list', handleTaskList);
            };
        }
    }, [projectId, allProjects]);

    // Calculate statistics when tasks are loaded
    useEffect(() => {
        if (tasks.length === 0 && !loading) {
            setStats(null);
            return;
        }

        if (tasks.length > 0) {
            const projectStats = statisticsManager.calculateProjectStatistics(tasks);
            setStats(projectStats);
        }
    }, [tasks, loading]);





    const formatPercentage = (value: number): string => {

        return `${value.toFixed(1)}%`;
    };


    if (loading && (!stats || tasks.length === 0)) {
        return <div className="dashboard-container">Loading project statistics...</div>;
    }

    if (!stats) {
        return (
            <div className="dashboard-container">
                <h2>{projectId === 'all' ? 'All Projects Dashboard' : 'Project Dashboard'}</h2>
                <div className="no-stats">
                    <p>No tasks found {projectId === 'all' ? 'across any projects' : 'for this project'}.</p>
                    <p>Create tasks to see project statistics.</p>
                </div>
            </div>
        );
    }

    // Sort tasks by priority for all projects view
    const tasksSortedByPriority = projectId === 'all'
        ? taskManager.sortTasks([...tasks], 'priority')
        : [];

    // Filter tasks into uncompleted and completed for separate sections
    const uncompletedTasksSortedByPriority = tasksSortedByPriority.filter(task =>
        task.status === TaskStatus.TODO || task.status === TaskStatus.IN_PROGRESS
    );

    return (
        <div className="dashboard-container" style={{ padding: projectId === 'all' ? '0px' : '20px' }}>
            <div className="dashboard-header">
                <h2>{projectId === 'all' ? 'All Projects Dashboard' : 'Project Dashboard'}</h2>
                <UpTime />
            </div>

            <div className="stats-overview">
                <TaskOverview stats={stats} />
                <CompletionRate stats={stats} />
                <CompletionTime stats={stats} />
            </div>

            <ContributionGraph stats={stats}/>
        </div>
    );
};

export default Dashboard; 
