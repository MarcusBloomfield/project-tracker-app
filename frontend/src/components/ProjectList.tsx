import React, { useEffect, useMemo, useState } from 'react';
import { ProjectInfo } from '../utils/fileSystem';

interface ProjectListProps {
    projects: ProjectInfo[];
    onProjectSelect: (project: ProjectInfo) => void;
    onCreateProjectClick: () => void;
}

type SortMode = 'modified' | 'alpha';

const ProjectList: React.FC<ProjectListProps> = ({ 
    projects, 
    onProjectSelect, 
    onCreateProjectClick 
}) => {
    const [sortMode, setSortMode] = useState<SortMode>('modified');

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString();
    };

    const handleToggleSortMode = () => {
        const newMode: SortMode = sortMode === 'modified' ? 'alpha' : 'modified';
        console.log('[ProjectList] Toggling sort mode', { previousMode: sortMode, newMode: newMode });
        setSortMode(newMode);
    };

    const sortedProjects = useMemo(() => {
        const filtered: ProjectInfo[] = projects.filter(project => project.name != ".backup");

        if (sortMode === 'modified') {
            const sortedByModified: ProjectInfo[] = filtered
                .slice()
                .sort((a: ProjectInfo, b: ProjectInfo) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
            console.log('[ProjectList] Sorted projects by last modified (desc)', { count: sortedByModified.length, sample: sortedByModified.slice(0, 3).map(p => ({ id: p.id, name: p.name, modifiedAt: p.modifiedAt })) });
            return sortedByModified;
        }

        const sortedByAlpha: ProjectInfo[] = filtered
            .slice()
            .sort((a: ProjectInfo, b: ProjectInfo) => a.name.localeCompare(b.name));
        console.log('[ProjectList] Sorted projects alphabetically (asc)', { count: sortedByAlpha.length, sample: sortedByAlpha.slice(0, 3).map(p => ({ id: p.id, name: p.name })) });
        return sortedByAlpha;
    }, [projects, sortMode]);

    useEffect(() => {
        console.log('[ProjectList] Sort mode changed effect', { sortMode: sortMode });
    }, [sortMode]);

    return (
        <div className="project-list-container">
            <h3>My Projects</h3>
            <div className="project-sort-controls">
                <button type="button" className="sort-button" onClick={handleToggleSortMode}>
                    Sort: {sortMode === 'modified' ? 'Last Modified' : 'Alphabetical'}
                </button>
            </div>
            <div className="project-list">
                {projects.length === 0 ? (
                    <div className="no-projects">
                        <p>No projects found</p>
                        <p>Create a new project to get started</p>
                    </div>
                ) : (
                    sortedProjects
                        .map(project => (
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