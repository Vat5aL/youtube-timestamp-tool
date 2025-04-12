import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <div className="theme-toggle">
      <button 
        className="theme-toggle-btn"
        onClick={onToggle}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default ThemeToggle;