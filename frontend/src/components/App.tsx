import React, { useState } from 'react';
import '../styles/App.css';
import ProjectSelector from './ProjectSelector';
import ProjectView from './ProjectView';
import { ProjectInfo } from '../utils/fileSystem';

const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);

  // Handle project selection
  const handleProjectSelect = (project: ProjectInfo) => {
    setSelectedProject(project);
  };

  // Handle back navigation from project view
  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Tracker</h1>
      </header>
      <main className="app-content">
        {selectedProject ? (
          <ProjectView 
            project={selectedProject} 
            onBack={handleBackToProjects} 
          />
        ) : (
          <ProjectSelector onProjectSelect={handleProjectSelect} />
        )}
      </main>
    </div>
  );
};

export default App; 