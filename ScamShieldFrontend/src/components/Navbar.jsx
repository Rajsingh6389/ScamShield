import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config/api';
import './Navbar.css';

export default function Navbar({ user, loading, login, logout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-logo cyber-glitch" data-text="ScamShield">
          <div className="logo-icon">📡</div>
          <span className="logo-text">SCAM<span className="text-highlight">SHIELD</span></span>
          <span className="logo-badge cyber">SECURE</span>
        </div>
        <div className="nav-links">
          <a href="#analyze" className="nav-link">Analyze</a>
          <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer" className="nav-link">
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
                <button className="nav-btn logout-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="nav-btn login-btn" onClick={login}>
                <span>🔑</span> Login with Google
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
