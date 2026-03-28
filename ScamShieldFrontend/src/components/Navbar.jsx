import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config/api';
import './Navbar.css';

export default function Navbar({ user, loading, login, logout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`navbar ${isMenuOpen ? 'menu-active' : ''}`}>
      <div className="navbar-inner">
        <div className="nav-logo cyber-glitch" data-text="ScamShield" onClick={closeMenu}>
          <div className="logo-icon">📡</div>
          <span className="logo-text">SCAM<span className="text-highlight">SHIELD</span></span>
          <span className="logo-badge cyber">SECURE</span>
        </div>

        {/* Hamburger Menu Icon */}
        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#analyze" className="nav-link" onClick={closeMenu}>Analyze</a>
          <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer" className="nav-link" onClick={closeMenu}>
            API Docs ↗
          </a>
          {!loading && (
            user ? (
              <div className="nav-user">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="user-avatar"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <button className="nav-btn logout-btn" onClick={() => { logout(); closeMenu(); }}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="nav-btn login-btn" onClick={() => { login(); closeMenu(); }}>
                <span>🔑</span> Login with Google
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
