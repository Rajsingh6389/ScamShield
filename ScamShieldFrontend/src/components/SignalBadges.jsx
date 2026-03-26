import React from 'react';
import './SignalBadges.css';

export default function SignalBadges({ fakeSignals = [], realSignals = [], isFake }) {
  const signals = isFake ? fakeSignals : realSignals;
  const colorClass = isFake ? 'signal-fake' : 'signal-real';
  const label = isFake ? '🚨 Scam Signals Detected' : '✅ Legitimacy Signals';

  if (!signals.length) return null;

  return (
    <div className="signals-section">
      <p className="signals-title">{label}</p>
      <div className="signals-grid">
        {signals.map((s, i) => {
          const match = s.match(/^(.+?)\s*\((-?\d+\.?\d*)\)$/);
          const word = match ? match[1] : s;
          const score = match ? parseFloat(match[2]) : 0;
          const weight = Math.abs(score);

          return (
            <div key={i} className={`signal-badge ${colorClass}`} style={{ '--delay': `${i * 0.06}s` }}>
              <span className="signal-word">{word}</span>
              <span className="signal-score">{weight.toFixed(2)}</span>
              <div
                className="signal-bar"
                style={{ width: `${Math.min(weight * 20, 100)}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
