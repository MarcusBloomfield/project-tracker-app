import React, { useState, useEffect } from 'react';
import { ProjectInfo, fileSystem } from '../utils/fileSystem';
import CreateDialog from './CreateDialog';
import Dashboard from './Dashboard';
import DailyTaskList from './DailyTaskList';
import DeadLines from './DeadLines';
import '../styles/ProjectSelector.css';

interface ProjectSelectorProps {
  onProjectSelect: (project: ProjectInfo) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onProjectSelect }) => {
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

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString();
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

      <div className="project-selection-tasks-and-projects-subcontainer">
        <div className="project-list-container">
          <h3>My Projects</h3>
          <div className="project-list">
            {projects.length === 0 ? (
              <div className="no-projects">
                <p>No projects found</p>
                <p>Create a new project to get started</p>
              </div>
            ) : (
              projects.filter(project => project.name != ".backup").map(project => (
                <div
                  key={project.id}
                  className="project-item"
                  onClick={() => handleProjectSelect(project)}
                >
                  <h3>{project.name}</h3>
                  <p>Last modified: {formatDate(project.modifiedAt)}</p>
                </div>
              ))
            )}

            <div
              className="project-item new-project"
              onClick={handleCreateProjectClick}
            >
              <h3>+ Create New Project</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="dead-lines-subcontainer">
        <div className="dead-lines-container">
          <DeadLines projectId="all" />
        </div>
      </div>

      
      <div className="project-selection-tasks-and-projects-subcontainer">

        <div className="daily-tasks-container">
          <DailyTaskList />
        </div>

      </div>

      </div>

      <div className="project-selection-dashboard-subcontainer">
        <div className="dashboard-container">
          <h3>Dashboard</h3>
          <Dashboard projectId="all" />
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

export default ProjectSelector; 
