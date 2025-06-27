import React, { useState, useEffect } from 'react';
import { fileSystem } from '../utils/fileSystem';
import '../css/DeadLines.css';
import { Task, TaskPriority, taskManager, TaskStatus } from '../utils/taskManager';

interface InProgressProps {
    projectId: string;
}

const InProgress: React.FC<InProgressProps> = ({ projectId }) => {
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
            console.log('InProgress: Loading tasks for all projects:', allProjects);

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
                    console.log('InProgress: Received all taskLists:', allTasks);
                    setTasks(allTasks);
                    setLoading(false);

                    if (allTasks.length === 0) {
                        console.log("InProgress: No tasks found.");
                    } else {
                        console.log(`InProgress: Loaded ${allTasks.length} total tasks`);
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
            console.log('InProgress: Loading tasks for projectId:', projectId);

            let componentMounted = true;

            const handleTaskList = (taskList: Task[]) => {
                if (!componentMounted) return;

                console.log('InProgress: Received taskList:', taskList);
                setTasks(taskList);
                setLoading(false);

                if (taskList.length === 0) {
                    console.log("InProgress: No tasks found.");
                } else {
                    console.log(`InProgress: Loaded ${taskList.length} tasks`);
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

    // Apply filters when tasks change - only filter for in-progress status
    useEffect(() => {
        const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
        
        if (!loading && tasks.length > 0 && inProgressTasks.length === 0) {
            console.log("InProgress: No in-progress tasks found.");
        }

        // Sort by priority for better organization
        const sortedTasks = taskManager.sortTasks(inProgressTasks, "priority");
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

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString();
    };

    if (loading) {
        return <div className="dead-lines-container">Loading tasks...</div>;
    }

    return ( 
    <div >
        <h4 className="dead-lines-overdue-title">In Progress Tasks</h4>
        {filteredTasks.length === 0 ? (
            <p className="dead-lines-no-tasks">No In Progress Tasks</p>
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

export default InProgress;
