import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ChatThemeDemo = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="card mt-3">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-palette me-2"></i>
          Chat Theme Integration Demo
        </h5>
      </div>
      <div className="card-body">
        <p className="card-text">
          The floating chat automatically adapts to your app's theme. 
          Try toggling between light and dark mode to see the chat change colors instantly!
        </p>
        
        <div className="d-flex align-items-center gap-3 mb-3">
          <span>Current Theme:</span>
          <span className={`badge ${isDark ? 'bg-dark' : 'bg-light text-dark'}`}>
            <i className={`fas ${isDark ? 'fa-moon' : 'fa-sun'} me-1`}></i>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        <button 
          className="btn btn-primary"
          onClick={toggleTheme}
        >
          <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} me-2`}></i>
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </button>

        <div className="mt-3">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            The chat uses CSS variables from your theme.css file to ensure perfect color matching.
          </small>
        </div>
      </div>
    </div>
  );
};

export default ChatThemeDemo;