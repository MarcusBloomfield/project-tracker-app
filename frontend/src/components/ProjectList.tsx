import React from 'react';
import { ProjectInfo } from '../utils/fileSystem';

interface ProjectListProps {
    projects: ProjectInfo[];
    onProjectSelect: (project: ProjectInfo) => void;
    onCreateProjectClick: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
    projects, 
    onProjectSelect, 
    onCreateProjectClick 
}) => {
    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString();
    };

    return (
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
                            onClick={() => onProjectSelect(project)}
                        >
                            <h3>{project.name}</h3>
                            <p>Last modified: {formatDate(project.modifiedAt)}</p>
                        </div>
                    ))
                )}

                <div
                    className="project-item new-project"
                    onClick={onCreateProjectClick}
                >
                    <h3>+ Create New Project</h3>
                </div>
            </div>
        </div>
    );
};

export default ProjectList; 