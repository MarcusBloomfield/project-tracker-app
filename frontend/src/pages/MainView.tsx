import React, { useState, useEffect } from 'react';
import { ProjectInfo, fileSystem } from '../utils/fileSystem';
import CreateDialog from '../components/CreateDialog';
import Dashboard from '../components/Dashboard/Dashboard';
import DailyTaskList from '../components/DailyTaskList';
import DeadLines from '../components/DeadLines';
import ProjectList from '../components/ProjectList';
import '../css/ProjectSelector.css'

interface MainViewProps {
    onProjectSelect: (project: ProjectInfo) => void;
}

const MainView: React.FC<MainViewProps> = ({ onProjectSelect }) => {
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    // Load projects when component mounts
    useEffect(() => {
        const loadProjects = async () => {
            setLoading(true);
            setError(null);

            try {
                const projectList = await fileSystem.listProjects();
                setProjects(projectList);
            } catch (err) {
                setError('Failed to load projects');
            } finally {
                setLoading(false);
            }
        };

        const handleProjectCreated = (project: ProjectInfo) => {
            if (project) {
                setProjects(prevProjects => [...prevProjects, project]);
            } else {
                setError('Failed to create project');
            }
        };

        // Register listener for project creation only
        window.api.addListener('project:created', handleProjectCreated);

        // Load initial projects
        loadProjects();

        // Cleanup function to remove listeners
        return () => {
            window.api.removeListener('project:created', handleProjectCreated);
        };
    }, []);

    const handleProjectSelect = (project: ProjectInfo) => {
        onProjectSelect(project);
    };

    const handleCreateProjectClick = () => {
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const handleCreateProject = (projectName: string) => {
        setLoading(true);
        setError(null);
        setIsDialogOpen(false);

        window.api.triggerEvent('project:create', { name: projectName });
    };

    if (loading && projects.length === 0) {
        return (
            <div className="project-selection">
                <h2>Loading Projects...</h2>
            </div>
        );
    }

    return (
        <div className="project-selection">

            {error && <div className="error-message">{error}</div>}

            <div className="project-selection-tasks-and-projects-container">

                
                <div className="dead-lines-subcontainer">
                    <div className="dead-lines-container">
                        <DeadLines projectId="all" />
                    </div>
                </div>
                <div className="project-selection-tasks-and-projects-subcontainer">
                    <ProjectList
                        projects={projects}
                        onProjectSelect={handleProjectSelect}
                        onCreateProjectClick={handleCreateProjectClick}
                    />
                </div>
                <div className='project-selection-tasks-and-projects-subcontainer'>
                    <DailyTaskList/>
                </div>

            </div>
            
            <div className="project-selection-tasks-and-projects-container">
                <div className="dead-lines-subcontainer">
                    <div className="dashboard-container">
                        <h3>Dashboard</h3>
                        <Dashboard projectId="all" />
                    </div>
                </div>
            </div>

            <CreateDialog
                type="project"
                isOpen={isDialogOpen}
                onClose={handleDialogClose}
                onConfirm={handleCreateProject}
            />
        </div>
    );
};

export default MainView; 
