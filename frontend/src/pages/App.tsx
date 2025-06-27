import React, { useState } from 'react';
import '../css/App.css';
import MainView from './MainView';
import ProjectView from './ProjectView';
import { ProjectInfo } from '../utils/fileSystem';

const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);

  const handleProjectSelect = (project: ProjectInfo) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  return (
    <div className="app">
      <main className="app-content">
        {selectedProject ? (
          <ProjectView 
            project={selectedProject} 
            onBack={handleBackToProjects} 
          />
        ) : (
          <MainView onProjectSelect={handleProjectSelect} />
        )}
      </main>
    </div>
  );
};

export default App; 
