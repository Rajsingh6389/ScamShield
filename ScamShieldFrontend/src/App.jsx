import React from 'react';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import NeuralSync from './components/NeuralSync';
import Analyzer from './components/Analyzer';
import EmailInbox from './components/EmailInbox';
import './App.css';
import { useState } from 'react';

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [inboxEmails, setInboxEmails] = useState(null);

  return (
    <div className="app">
      <Navbar user={user} loading={loading} login={login} logout={logout} />
      <div>
        <Hero />
        <FeatureCards />
        <NeuralSync />

        <div id="analyze">
          <Analyzer user={user} onInboxScan={setInboxEmails} />
        </div>
      </div>
      {inboxEmails && (
        <div id="inbox">
          <EmailInbox emails={inboxEmails} />
        </div>
      )}
      <footer className="footer">
        <p>ScamShield &copy; {new Date().getFullYear()} — AI-powered scam detection</p>
        <p className="footer-sub">Built with FastAPI + scikit-learn + React</p>
      </footer>
    </div>
  );
}