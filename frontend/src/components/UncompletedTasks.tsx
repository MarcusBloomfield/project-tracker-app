import React, { useState, useEffect } from 'react';
import { fileSystem } from '../utils/fileSystem';
import '../css/DeadLines.css';
import { Task, TaskPriority, taskManager, TaskStatus } from '../utils/taskManager';

interface UncompletedTasksProps {
    projectId: string;
}

const UncompletedTasks: React.FC<UncompletedTasksProps> = ({ projectId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [allProjects, setAllProjects] = useState<string[]>([]);

    // Load project list when component mounts if showing all projects
    useEffect(() => {
        if (projectId === 'all') {
            const loadProjects = async () => {
                try {
                    const projectList = await fileSystem.listProjects();
                    const projectNames = projectList.map(project => project.name);
                    setAllProjects(projectNames);
                } catch (error) {
                    console.error('Failed to load projects:', error);
                }
            };

            loadProjects();
        }
    }, [projectId]);

    // Load tasks when component mounts or projectId changes
    useEffect(() => {
        if (projectId === 'all') {
            if (allProjects.length === 0) return;

            setLoading(true);
            console.log('UncompletedTasks: Loading tasks for all projects:', allProjects);

            // Initialize an array to collect all tasks
            let allTasks: Task[] = [];
            let loadedProjectCount = 0;
            let componentMounted = true;

            // Setup a handler for receiving tasks from each project
            const handleTasksReceived = (taskList: Task[]) => {
                if (!componentMounted) return;

                allTasks = [...allTasks, ...taskList];
                loadedProjectCount++;

                // When all projects are loaded, update the state
                if (loadedProjectCount === allProjects.length) {
                    console.log('UncompletedTasks: Received all taskLists:', allTasks);
                    setTasks(allTasks);
                    setLoading(false);

                    if (allTasks.length === 0) {
                        console.log("UncompletedTasks: No tasks found.");
                    } else {
                        console.log(`UncompletedTasks: Loaded ${allTasks.length} total tasks`);
                    }
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
            console.log('UncompletedTasks: Loading tasks for projectId:', projectId);

            let componentMounted = true;

            const handleTaskList = (taskList: Task[]) => {
                if (!componentMounted) return;

                console.log('UncompletedTasks: Received taskList:', taskList);
                setTasks(taskList);
                setLoading(false);

                if (taskList.length === 0) {
                    console.log("UncompletedTasks: No tasks found.");
                } else {
                    console.log(`UncompletedTasks: Loaded ${taskList.length} tasks`);
                }
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

    // Apply filters when tasks change - filter for uncompleted tasks (TODO and IN_PROGRESS)
    useEffect(() => {
        const uncompletedTasks = tasks.filter(task => 
            task.status === TaskStatus.TODO || task.status === TaskStatus.IN_PROGRESS
        );
        
        if (!loading && tasks.length > 0 && uncompletedTasks.length === 0) {
            console.log("UncompletedTasks: No uncompleted tasks found.");
        }

        // Sort by priority for better organization
        const sortedTasks = taskManager.sortTasks(uncompletedTasks, "priority");
        setFilteredTasks(sortedTasks);
    }, [tasks, loading]);

    const getPriorityColor = (priority: TaskPriority): string => {
        switch (priority) {
            case TaskPriority.HIGH:
                return '#ff4757';
            case TaskPriority.MEDIUM:
                return '#ffa502';
            case TaskPriority.LOW:
                return '#2ed573';
            default:
                return '#747d8c';
        }
    };

    const getStatusColor = (status: TaskStatus): string => {
        switch (status) {
            case TaskStatus.TODO:
                return '#3742fa';
            case TaskStatus.IN_PROGRESS:
                return '#f39c12';
            default:
                return '#747d8c';
        }
    };

    const getStatusText = (status: TaskStatus): string => {
        switch (status) {
            case TaskStatus.TODO:
                return 'To Do';
            case TaskStatus.IN_PROGRESS:
                return 'In Progress';
            default:
                return status;
        }
    };

    const formatDate = (date: Date | string): string => {
        try {
            const dateObject = date instanceof Date ? date : new Date(date);
            return dateObject.toLocaleDateString();
        } catch (error) {
            console.error('Invalid date format:', date);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return <div className="dead-lines-container">Loading tasks...</div>;
    }

    return ( 
    <div >
        <h4 className="dead-lines-overdue-title">Uncompleted Tasks</h4>
        {filteredTasks.length === 0 ? (
            <p className="dead-lines-no-tasks">No Uncompleted Tasks</p>
        ) : (
            <div>
                {filteredTasks.map(task => (
                    <div 
                        key={task.id} 
                        className="dead-lines-overdue-item"
                        style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}
                    >
                        {projectId === 'all' && (
                            <div className="dead-lines-overdue-project">
                                Project: {task.projectId}
                            </div>
                        )}
                        <div className="dead-lines-overdue-title-text">
                            {task.title}
                        </div>
                        {task.description && (
                            <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                                {task.description}
                            </div>
                        )}
                        <div style={{ fontSize: '11px', marginTop: '8px' }}>
                            <span style={{ color: getPriorityColor(task.priority), fontWeight: 'bold' }}>
                                {task.priority} Priority
                            </span>
                            <span style={{ 
                                marginLeft: '10px', 
                                color: getStatusColor(task.status), 
                                fontWeight: 'bold' 
                            }}>
                                {getStatusText(task.status)}
                            </span>
                            {task.dueDate && (
                                <span style={{ marginLeft: '10px', color: '#666' }}>
                                    Due: {formatDate(task.dueDate)}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
    );
};

export default UncompletedTasks; 