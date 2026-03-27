import React, { useEffect, useState, useRef } from 'react';
import './CyberTerminal.css';

const LOG_MESSAGES = [
  "Establishing secure connection to AI cluster...",
  "Loading neural weights v4.0.1...",
  "Vectorizing input data via TF-IDF matrix...",
  "Running 256 parallel prediction passes...",
  "Analyzing linguistic patterns for scam markers...",
  "Checking domain reputation against global blacklists...",
  "Calculating confidence score...",
  "Generating threat level assessment...",
  "SECURE_SOCKET_LAYER established.",
  "HEURISTIC_ENGINE: ONLINE",
  "NEURAL_PATH_ANALYSIS: COMPLETED",
];

export default function CyberTerminal({ active }) {
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setLogs([]);
      return;
    }

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < LOG_MESSAGES.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${LOG_MESSAGES[currentIdx]}`]);
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!active) return null;

  return (
    <div className="cyber-terminal">
      <div className="terminal-header">
        <span className="blink">●</span> SYSTEM_LOG
      </div>
      <div className="terminal-body">
        {logs.map((log, i) => (
          <div key={i} className="log-line">
            <span className="log-prefix">{"Subscriber: "}</span>
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
