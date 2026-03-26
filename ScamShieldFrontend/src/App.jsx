import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Analyzer from './components/Analyzer';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <div id="analyze">
        <Hero />
        <Analyzer />
      </div>
      <footer className="footer">
        <p>ScamShield &copy; {new Date().getFullYear()} — AI-powered job scam detection</p>
        <p className="footer-sub">Built with FastAPI + scikit-learn + React</p>
      </footer>
    </div>
  );
}