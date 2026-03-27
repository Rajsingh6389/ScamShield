import React, { useEffect, useRef } from 'react';
import './FeatureCards.css';

const FEATURES = [
  {
    title: "LINGUISTIC ANALYSIS",
    desc: "OUR AI EXAMINES LANGUAGE PATTERNS TO IDENTIFY SUBTLE SIGNS OF FRAUD AND MANIPULATION.",
    icon: "🧠",
    color: "var(--accent-cyber)"
  },
  {
    title: "SECURE DOCUMENT CHECK",
    desc: "VERIFY THE AUTHENTICITY OF JOB OFFER LETTERS AND CONTRACTS WITH ADVANCED OCR TECHNOLOGY.",
    icon: "📄",
    color: "var(--accent-neon)"
  },
  {
    title: "REAL-TIME BROWSER SHIELD",
    desc: "STAY PROTECTED ON EXTERNAL JOB BOARDS WITH PROACTIVE WARNINGS ON SUSPICIOUS DOMAINS.",
    icon: "🛡️",
    color: "var(--success)"
  }
];

export default function FeatureCards() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
        }
      });
    }, { threshold: 0.1 });

    cardsRef.current.forEach(card => card && observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section">
      <div className="section-header">
        <span className="section-label">PROTECTION_LAYERS</span>
        <h2 className="section-title">PROFESSIONAL SECURITY FEATURES</h2>
      </div>
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div 
            key={i} 
            className="feature-card" 
            ref={el => cardsRef.current[i] = el}
            style={{ '--accent-color': f.color }}
          >
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
            <div className="card-glitch"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
