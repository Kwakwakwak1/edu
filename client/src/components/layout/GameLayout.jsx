import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './GameLayout.css';

const GameLayout = ({ children, title, settingsContent }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="game-layout">
      {/* Header with hamburger menu */}
      <header className="game-layout-header">
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger"></span>
        </button>
        <h1>{title}</h1>
        <button 
          className="settings-button"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </header>

      {/* Side Navigation Menu */}
      <nav className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <button 
          className="close-menu"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>
        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link to="/courses" onClick={() => setIsMenuOpen(false)}>Courses</Link>
        <Link to="/games" onClick={() => setIsMenuOpen(false)}>Games</Link>
      </nav>

      {/* Settings Panel */}
      <div className={`settings-panel ${isSettingsOpen ? 'open' : ''}`}>
        <button 
          className="close-settings"
          onClick={() => setIsSettingsOpen(false)}
          aria-label="Close settings"
        >
          ×
        </button>
        <h2>Settings</h2>
        <div className="settings-content">
          {settingsContent}
        </div>
      </div>

      {/* Main Content */}
      <main className="game-layout-content">
        {children}
      </main>

      {/* Overlay for closing menus */}
      {(isMenuOpen || isSettingsOpen) && (
        <div 
          className="overlay"
          onClick={() => {
            setIsMenuOpen(false);
            setIsSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
};

GameLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  settingsContent: PropTypes.node,
};

GameLayout.defaultProps = {
  settingsContent: null,
};

export default GameLayout; 