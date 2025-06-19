# Project Tracker App

A powerful, yet simple desktop project management application built with Electron, React, and TypeScript. Designed for developers and small teams, it helps you track your projects, manage tasks, and monitor progress with an intuitive and clean interface.

## Screenshots

*Main interface showing project management, daily tasks, and comprehensive dashboard with statistics*
![Project Tracker App Interface](Display.png)

*The project dashboard provides a comprehensive overview of your project's statistics, including task distribution, completion rate, and task priorities.*
![Project Dashboard](DashBoard.PNG)

*Built-in file browser and text editor for managing project files and documentation*
![File Browser and Text Editor](Notes.png) 

*Task creation dialog and kanban-style task management with status tracking*
![Task Management Interface](TaskCreator.png)

## Features

- **Project Management**: Create and organize multiple projects
- **Task Tracking**: Create, edit, and manage tasks with priorities and due dates
- **Daily Tasks**: Manage recurring daily tasks separately
- **Progress Dashboard**: Visual statistics and progress tracking
- **File Browser**: Browse and manage project files
- **Text Editor**: Built-in text editor for project notes and files

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Desktop Framework**: Electron 36
- **Build Tools**: Webpack, TypeScript Compiler
- **Styling**: CSS with component-based styles

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd project-tracker-app
```

2. Install dependencies
```bash
npm install
```

### Development

Run the application in development mode:
```bash
npm run dev
```

This will start the application with hot reloading enabled.

### Scripts

- `npm run build` - Build TypeScript and bundle with Webpack
- `npm run watch` - Watch TypeScript files for changes
- `npm start` - Build and start the Electron application
- `npm run dev` - Start development mode with hot reloading
- `npm run dist` - Package the application for distribution

## Project Structure

```
project-tracker-app/
├── frontend/src/
│   ├── components/         # React components
│   │   ├── App.tsx        # Main application component
│   │   ├── Dashboard.tsx  # Project statistics dashboard
│   │   ├── TaskList.tsx   # Task management interface
│   │   └── ...
│   ├── main/              # Electron main process handlers
│   │   ├── taskHandlers.ts
│   │   ├── dailyTaskHandlers.ts
│   │   └── fileSystemHandlers.ts
│   ├── styles/            # CSS stylesheets
│   ├── utils/             # Utility functions and managers
│   ├── main.ts           # Electron main process entry
│   └── renderer.tsx      # React application entry
├── dist/                  # Built application files
└── package.json
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Marcus Bloomfield

---

*A simple and effective project tracking solution for managing your development projects and tasks.*
