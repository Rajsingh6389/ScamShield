import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-logo">
          <div className="logo-icon">🛡️</div>
          <span className="logo-text">ScamShield</span>
          <span className="logo-badge">AI</span>
        </div>
        <div className="nav-links">
          <a href="#analyze" className="nav-link">Analyze</a>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="nav-link">
            API Docs ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
