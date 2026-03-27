import React from 'react';
import CodeScannerAnimation from './CodeScannerAnimation';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot" />
          AI-Powered Job Scam Detector
        </div>

        <h1 className="hero-title cyber-glitch" data-text="Protect Your Career">
          ADVANCED CAREER<br/>
          <span className="cyber-text">PROTECTION</span>
        </h1>

        <p className="hero-subtitle">
          Paste any job listing below. Our trained ML model instantly analyzes it
          and flags suspicious patterns — so you never fall for a scam again.
        </p>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">95%+</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-value">&lt;1s</span>
            <span className="stat-label">Response</span>
          </div>
          <div className="stat">
            <span className="stat-value">AI</span>
            <span className="stat-label">Signal Analysis</span>
          </div>
        </div>
      </div>

      <div className="hero-animation">
        <CodeScannerAnimation />
      </div>
    </section>
  );
}
