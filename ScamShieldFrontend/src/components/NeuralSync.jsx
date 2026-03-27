import React, { useEffect, useRef } from 'react';
import './NeuralSync.css';

const STEPS = [
  { label: "Phase 01", title: "DATA ANALYSIS", desc: "Extraction of linguistic features and career metadata." },
  { label: "Phase 02", title: "RISK MAPPING", desc: "Identifying high-probability threat markers in the text." },
  { label: "Phase 03", title: "SECURITY INFERENCE", desc: "Cross-referencing signals with our global security database." },
  { label: "Phase 04", title: "SECURE VERDICT", desc: "Generating a detailed report with actionable safety insights." }
];

export default function NeuralSync() {
  const lineRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!lineRef.current) return;
      const rect = lineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (rect.height + windowHeight)));
      lineRef.current.style.setProperty('--scroll-progress', `${progress * 100}%`);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="sync-section">
      <div className="section-header">
        <span className="section-label">VERIFICATION_PROCESS</span>
        <h2 className="section-title">OUR SECURITY WORKFLOW</h2>
      </div>
      
      <div className="sync-container">
        <div className="sync-line-bg"></div>
        <div className="sync-line-active" ref={lineRef}></div>
        
        <div className="sync-steps">
          {STEPS.map((step, i) => (
            <div key={i} className="sync-step">
              <div className="sync-marker">
                <span className="marker-dot"></span>
                <span className="marker-label">{step.label}</span>
              </div>
              <div className="sync-content">
                <h3 className="sync-title">{step.title}</h3>
                <p className="sync-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
