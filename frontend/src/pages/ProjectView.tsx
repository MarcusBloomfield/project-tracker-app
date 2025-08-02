import React, { useState, useEffect } from 'react';
import FileBrowser from '../components/FileBrowser';
import TextEditor from '../components/TextEditor';
import TaskList from '../components/TaskList';
import Dashboard from '../components/Dashboard/Dashboard';
import TaskChat from '../components/TaskChat';
import '../css/ProjectView.css';
import { ProjectInfo } from '../utils/fileSystem';
import { Task, taskManager } from '../utils/taskManager';

interface ProjectViewProps {
  project: ProjectInfo;
  onBack: () => void;
}

type ProjectTab = 'files' | 'tasks' | 'dashboard' | 'chat';

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectTab>('files');
  const [tasks, setTasks] = useState<Task[]>([]);

  // Handle file selection from FileBrowser
  const handleFileSelect = (filePath: string) => {
    setSelectedFilePath(filePath);
  };

  // Handle tab change
  const handleTabChange = (tab: ProjectTab) => {
    setActiveTab(tab);
  };

  // Load tasks when component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskList = await taskManager.getProjectTasks(project.name);
        setTasks(taskList);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    loadTasks();
  }, [project.name]);

  return (
    <div className="project-view">
      <div className="project-header">
        <button className="back-button" onClick={onBack}>← Back to Projects</button>
        <h2 className="project-title">{project.name}</h2>
        
        <div className="project-tabs">
          <button 
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => handleTabChange('files')}
          >
            Files
          </button>
          <button 
            className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => handleTabChange('tasks')}
          >
            Tasks
          </button>
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabChange('chat')}
          >
            Chat
          </button>
        </div>
      </div>
      
      <div className="project-content">
        {activeTab === 'files' && (
          <>
            <div className="file-browser-container">
              <FileBrowser 
                projectPath={project.path} 
                onSelectFile={handleFileSelect} 
              />
            </div>
            
            <div className="text-editor-container">
              <TextEditor filePath={selectedFilePath} />
            </div>
          </>
        )}
        
        {activeTab === 'tasks' && (
          <div className="tasks-container">
            <TaskList projectId={project.name} />
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="dashboard-container">
            <Dashboard projectId={project.name} />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="chat-container">
            <TaskChat projectId={project.name} tasks={tasks} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView; 
