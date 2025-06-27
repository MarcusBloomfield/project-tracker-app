import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './css/App.css';

console.log('Renderer process started');

// Create root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  const appElement = document.createElement('div');
  appElement.id = 'root';
  document.body.appendChild(appElement);
}

// Render React application
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 