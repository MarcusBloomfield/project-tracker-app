import React, { useState, useEffect } from 'react';
import { fileSystem } from '../utils/fileSystem';
import '../css/DeadLines.css';
import { Task, TaskPriority, taskManager, TaskStatus } from '../utils/taskManager';

interface DeadLinesProps {
    projectId: string;
}

interface DayWithTasks {
    date: Date;
    dateString: string;
    tasks: Task[];
}

const DeadLines: React.FC<DeadLinesProps> = ({ projectId }) => {
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
            console.log('DeadLines: Loading tasks for all projects:', allProjects);

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
                    console.log('DeadLines: Received all taskLists:', allTasks);
                    setTasks(allTasks);
                    setLoading(false);

                    if (allTasks.length === 0) {
                        console.error("Dead lines: No tasks found.");
                    } else {
                        console.log(`DeadLines: Loaded ${allTasks.length} total tasks`);
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
            console.log('DeadLines: Loading tasks for projectId:', projectId);

            let componentMounted = true;

            const handleTaskList = (taskList: Task[]) => {
                if (!componentMounted) return;

                console.log('DeadLines: Received taskList:', taskList);
                setTasks(taskList);
                setLoading(false);

                if (taskList.length === 0) {
                    console.error("Dead lines: No tasks found.");
                } else {
                    console.log(`DeadLines: Loaded ${taskList.length} tasks`);
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


    // Apply filters and sorting when tasks, filters, or sort criteria change
    useEffect(() => {
        let result = [...tasks];
        result = taskManager.filterByHasDueDate(result);

        // Only log error if we're not loading and have tasks but none with due dates
        if (!loading && tasks.length > 0 && result.length === 0) {
            console.error("Dead lines: No tasks with due date found.");
        }

        result = taskManager.sortTasks(result, "dueDate");

        setFilteredTasks(result);
    }, [tasks, loading]);

        const getOverdueTasks = (tasks: Task[]): Task[] => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison
        
        const overdueTasks = tasks.filter(task => {
            if (task.status === TaskStatus.COMPLETED) return false;
            if (!task.dueDate) return false;
            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0);
            return taskDueDate < today;
        });
        
        // Sort overdue tasks by due date (oldest overdue first) and then by priority
        overdueTasks.sort((taskA, taskB) => {
            const dateA = new Date(taskA.dueDate!).getTime();
            const dateB = new Date(taskB.dueDate!).getTime();
            const dateDiff = dateA - dateB;
            if (dateDiff !== 0) return dateDiff;
            
            // If same due date, sort by priority
            const priorityValues: Record<TaskPriority, number> = {
                [TaskPriority.LOW]: 0,
                [TaskPriority.MEDIUM]: 1,
                [TaskPriority.HIGH]: 2
            };
            return priorityValues[taskB.priority] - priorityValues[taskA.priority];
        });
        
        console.log(`DeadLines: Found ${overdueTasks.length} overdue tasks`);
        return overdueTasks;
    };

    const generateFromTodayToYearInDays = (tasks: Task[]): DayWithTasks[] => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneYearFromToday = new Date();
        oneYearFromToday.setFullYear(today.getFullYear() + 1);
        
        const days: DayWithTasks[] = [];
        const currentDate = new Date(today);
        
        // Filter out overdue tasks from future dates view
        const futureTasks = tasks.filter(task => {
            if (task.status === TaskStatus.COMPLETED) return false;
            if (!task.dueDate) return false;
            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0);
            return taskDueDate >= today;
        });
        
        // Create a map of date strings to tasks for efficient lookup
        const tasksByDate = new Map<string, Task[]>();
        futureTasks.forEach(task => {
            if (task.dueDate) {
                const taskDate = new Date(task.dueDate);
                const dateString = taskDate.toDateString();
                
                if (!tasksByDate.has(dateString)) {
                    tasksByDate.set(dateString, []);
                }
                tasksByDate.get(dateString)!.push(task);
            }
        });
        
        // Generate every day from today to one year from today
        while (currentDate <= oneYearFromToday) {
            const dateString = currentDate.toDateString();
            const tasksForThisDay = tasksByDate.get(dateString) || [];
            
            // Sort tasks for this day by priority and then by title
            tasksForThisDay.sort((taskA, taskB) => {
                // Higher priority tasks first (High=2, Medium=1, Low=0)
                const priorityValues: Record<TaskPriority, number> = {
                    [TaskPriority.LOW]: 0,
                    [TaskPriority.MEDIUM]: 1,
                    [TaskPriority.HIGH]: 2
                };
                const priorityDiff = priorityValues[taskB.priority] - priorityValues[taskA.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                // Then sort by title alphabetically
                return taskA.title.localeCompare(taskB.title);
            });
            
            days.push({
                date: new Date(currentDate),
                dateString: dateString,
                tasks: tasksForThisDay
            });
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`DeadLines: Generated ${days.length} days with tasks distributed across them`);
        return days;
    }

    if (loading) {
        return <div className="dead-lines-container">Loading tasks...</div>;
    }

    const overdueTasks = getOverdueTasks(filteredTasks);
    const futureDays = generateFromTodayToYearInDays(filteredTasks);

    return (
        <div className="dead-lines-container">
            <h3>Dead Lines</h3>
            {filteredTasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <div className="dead-lines-main-layout">
                    {/* Overdue Section */}
                    <div className="dead-lines-overdue-section">
                        <h4 className="dead-lines-overdue-title">Overdue Tasks</h4>
                        {overdueTasks.length === 0 ? (
                            <p className="dead-lines-no-tasks">No overdue tasks</p>
                        ) : (
                            <div className="dead-lines-overdue-container">
                                {overdueTasks.map(task => (
                                    <div key={task.id} className="dead-lines-overdue-item">
                                        <div className="dead-lines-overdue-date">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                        </div>
                                        <div className="dead-lines-overdue-project">{task.projectId}:</div>
                                        <p className="dead-lines-overdue-title-text">{task.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Future Dates Section */}
                    <div className="dead-lines-future-section">
                        <h4 className="dead-lines-future-title">Upcoming Deadlines</h4>
                        <div className="dead-lines-date-container">
                            {futureDays.map(day => (
                                <div className='dead-lines-date-container-item' key={day.dateString}>
                                    <h4>{day.date.toLocaleDateString()}</h4>
                                    {day.tasks.length === 0 ? (
                                        <p className="dead-lines-no-tasks">No tasks due</p>
                                    ) : (
                                        <ol className="dead-lines-tasks">
                                            {day.tasks.map(task => (
                                                <li key={task.id} > {task.projectId}:
                                                    <p className="dead-lines-tasks-title">{task.title}</p>
                                                    <br></br>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DeadLines;