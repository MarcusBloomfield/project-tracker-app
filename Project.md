# Project Tracker App

## Current Status
* ✅ Successfully set up TypeScript environment
* ✅ Integrated React into the Electron application
* ✅ Created basic UI components (App and ProjectSelector)
* ✅ Set up webpack for bundling React components
* ✅ Successfully running application with React UI
* ✅ Implemented file system utilities and Electron IPC
* ✅ Created file browser and text editor components
* ✅ Implemented project view with split layout
* ✅ Created task management with filtering and priority system
* ✅ Implemented statistics dashboard with task visualizations
* ✅ Added README.md with project documentation
* ✅ Added .gitignore file for source control
* ✅ Added project selection dashboard view with aggregated tasks statistics across all projects
* ✅ Implemented feature to display all tasks from all projects sorted by priority on the projects overview
* ✅ Enhanced UI to display projects list and dashboard side by side instead of toggling between them

## Implementation Progress
* ✅ Phase 1: Project Setup and Foundation - Complete
* ✅ Phase 2: Core UI Framework - Complete
* Added React and ReactDOM libraries
* Configured webpack for React and TypeScript
* Created component structure (App, ProjectSelector)
* Set up CSS styling for components
* Implemented project selection interface
* Connected Electron with React through preload scripts
* ✅ Phase 3: File Management - Complete
  * Created file system utility module to interact with OS
  * Added FileBrowser component with directory navigation
  * Implemented TextEditor for viewing and editing files
  * Integrated project creation and file/folder management
  * Connected backend file operations with frontend UI
* ✅ Phase 4: Task Management - Complete
  * Created task data model with status and priority enums
  * Implemented task storage via JSON files
  * Created TaskList component with filtering and sorting
  * Added task creation and status management
  * Implemented task tags and due date functionality
* ✅ Phase 5: Statistics and Reporting - In Progress (Partially Complete: Dashboard UI and basic stats implemented)
  * Created statistics utility module for task analytics
  * Implemented dashboard with interactive visualizations
  * Added task completion trend charts
  * Created task distribution and priority visualizations
  * Added upcoming deadlines and overdue tasks tracking
  * Adjusted application styling to ensure `ProjectView` utilizes the maximum available screen space.
  * Enhanced ProjectSelector to include a dashboard view showing aggregated statistics across all projects
  * Added feature to display all tasks from all projects sorted by priority on the projects overview dashboard
  * ⬜ Implement report export in multiple formats (HTML, CSV, JSON) - Remaining

## Issues / Blockers
* Task update and delete operations in `taskHandlers.ts` are inefficient as they iterate through all projects to find the relevant project ID for the task. This needs optimization if performance becomes an issue with many projects/tasks.
* No actual charting library is used yet for the dashboard; using simple divs for now. Consider integrating a library like Chart.js or Recharts if more complex visualizations are needed.

## Next Steps
* Complete Phase 5: Statistics and Reporting
    * Implement basic time tracking functionalities (if feasible within scope).
    * Develop report generation capabilities (e.g., export to HTML, CSV, JSON).
* Proceed to Phase 6: Project Collaboration (if decided).
* Refine UI/UX based on feedback and testing.
* Address the inefficient task update/delete operations.

## Issues Resolved
* Path resolution issues between Electron and webpack
  * Fixed by using absolute paths with process.cwd()
  * Added better logging to debug file path issues
* HTML loading issue in Electron
  * Configured webpack to properly inject scripts
  * Updated main process to load HTML from correct location
* IPC communication between main and renderer processes
  * Implemented proper channel validation in preload script
  * Created type-safe interfaces for file system operations

## Next Steps (Phase 6: Project Collaboration)
* Implement user accounts and authentication
* Add multi-user project support
* Create user roles and permissions
* Add real-time collaboration features
* Implement activity logs and history
* Add comments and discussions functionality

## Project Structure
* frontend/src/ - Source TypeScript files
* frontend/src/components/ - React components
* frontend/src/styles/ - CSS styles
* frontend/src/utils/ - Utility modules
* frontend/src/main/ - Main process code
* dist/ - Compiled JavaScript files
* package.json - Project configuration and dependencies

## Build Commands
* `npm run build` - Compile TypeScript to JavaScript and bundle with webpack
* `npm run watch` - Watch for changes and compile
* `npm run start` - Build and start the application
* `npm run dev` - Run with hot reloading in development mode

## Technologies Used
* Electron - Desktop application framework
* TypeScript - Programming language
* React - UI library
* Webpack - Module bundler
* CSS - Styling
* IPC - Inter-process communication

## Recent Change
* Improved ProjectSelector UI by displaying projects list and dashboard side by side instead of toggling between them with a button, providing a more comprehensive overview.
* Added feature to display all tasks from all projects sorted by priority on the projects overview dashboard. This allows users to quickly view their most important tasks across all projects in one place.
* Implemented cleanup function in `FileBrowser.tsx`'s `useEffect` to remove `fs:readdir` event listener using `window.api.off`. (Note: Requires updating the `ElectronAPI` type definition to include the `off` method to resolve TypeScript errors).

## Development Setup

*   **Build:** `npm run build` (compiles TypeScript and bundles with Webpack)
*   **Run:** `npm start` (ensure `NODE_ENV` is set, e.g., `$env:NODE_ENV="development"; npm start` on PowerShell)
*   **Lint:** `npm run lint`
*   **Dev Mode:** `npm run dev` (runs webpack in watch mode and electron concurrently)

### Key File Locations:

*   **Main Process Entry:** `dist/frontend/src/main.js` (compiled from `frontend/src/main.ts`)
*   **Renderer Process Entry (React):** `frontend/src/renderer.tsx` (bundled by Webpack into `dist/renderer.js`)
*   **Webpack Config:** `webpack.config.js`
*   **TypeScript Config:** `tsconfig.json`
*   **ESLint Config:** `.eslintrc.js`
*   **Project Data Storage:**
    *   Projects are created as folders under `[UserDocuments]/ProjectTracker/`.
    *   Each project folder (e.g., `[UserDocuments]/ProjectTracker/[ProjectName]/`) contains its files and a `tasks.json` for task management.
*   **`tasks.json` location:** Each project has its own `tasks.json` file located at `[UserDocuments]/ProjectTracker/[PROJECT_ID]/tasks.json`.

## Architecture Overview 