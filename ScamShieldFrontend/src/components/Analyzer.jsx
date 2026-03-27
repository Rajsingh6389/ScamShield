import React, { useState, useRef } from 'react';
import SignalBadges from './SignalBadges';
import CyberTerminal from './CyberTerminal';
import './Analyzer.css';
import { API_URL } from '../config/api';

const EXAMPLES = [
  {
    label: '🚨 Suspicious',
    text: 'Earn money fast from home no experience required. Apply now! $5000/week guaranteed income.',
  },
  {
    label: '✅ Legitimate',
    text: 'We are hiring a Software Engineer at ABC Technologies. The candidate should have 2+ years of experience in Java, Spring Boot, and SQL. Responsibilities include developing scalable backend systems.',
  },
];

export default function Analyzer({ user, onInboxScan }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef(null);
  const fileInputRef = useRef(null);

  async function handleFileScan(selectedFile) {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_URL}/scan-file`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      if (data.extracted_text) {
         setText(data.extracted_text);
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e.message.includes('fetch') ? 'Cannot connect to API. Make sure the backend is running on port 8000.' : e.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e.message.includes('fetch') ? 'Cannot connect to API. Make sure the backend is running on port 8000.' : e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInbox() {
    if (!user) return;
    setInboxLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/scan-inbox`, { credentials: 'include' });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onInboxScan?.(data);
        setTimeout(() => {
          document.getElementById('inbox')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch {
      setError('Failed to fetch emails. Make sure you are logged in.');
    } finally {
      setInboxLoading(false);
    }
  }

  function loadExample(exText) {
    setText(exText);
    setResult(null);
    setError('');
  }

  const isFake = result?.is_fake;

  return (
    <main className="analyzer-container">

      {/* Scan Inbox CTA — shown only when logged in */}
      {user && (
        <div className="glass inbox-cta-card">
          <div className="inbox-cta-left">
            <div className="inbox-cta-icon">📩</div>
            <div className="inbox-cta-text">
              <p className="inbox-cta-title">Scan Your Gmail Inbox</p>
              <p className="inbox-cta-sub">Check your last 10 emails for scams instantly</p>
            </div>
          </div>
          <button
            className={`analyze-btn inbox-cta-btn ${inboxLoading ? 'loading' : ''}`}
            onClick={fetchInbox}
            disabled={inboxLoading}
          >
            {inboxLoading ? (
              <><span className="spinner" /> Scanning...</>
            ) : (
              <>📩 Scan My Emails</>
            )}
          </button>
        </div>
      )}

      {/* Input Card */}
      <div className="glass analyzer-card">
        <div className="card-header">
          <div className="card-icon">🔍</div>
          <div>
            <h2 className="card-title">RESEARCH_INPUT_FIELD</h2>
            <p className="card-desc">PASTE JOB SPECIFICATIONS FOR NEURAL ANALYSIS</p>
          </div>
        </div>

        <div className="examples-row">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} className="example-btn" onClick={() => loadExample(ex.text)}>
              {ex.label}
            </button>
          ))}
        </div>

        <div className="textarea-wrapper">
          <textarea
            id="job-input"
            className={`job-textarea ${loading ? 'textarea-scanning' : ''}`}
            rows={8}
            placeholder="AWAITING SYSTEM_INPUT..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <CyberTerminal active={loading} />
          <div className="char-count">{text.length} BUFFER_SIZE</div>
        </div>

        <div className="upload-wrapper">
          <input 
            type="file" 
            accept=".pdf,.png,.jpg,.jpeg,.webp" 
            id="file-upload" 
            className="file-input"
            ref={fileInputRef}
            disabled={loading}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileScan(e.target.files[0]);
              }
            }}
          />
          <label htmlFor="file-upload" className="file-label">
            <span className="upload-icon">📄</span>
            <span>Upload Screenshot or PDF</span>
          </label>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <button
          id="analyze-btn"
          className={`analyze-btn ${loading ? 'loading' : ''}`}
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <><span className="spinner" />Analyzing...</>
          ) : (
            <><span>🛡️</span>Analyze with AI</>
          )}
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div
          ref={resultRef}
          className={`glass result-card ${isFake ? 'result-fake' : 'result-real'}`}
        >
          <div className="result-header">
            <div className={`result-icon-wrap ${isFake ? 'icon-fake' : 'icon-real'}`}>
              {isFake ? '⚠️' : '✅'}
            </div>
            <div className="result-meta">
              <span className="result-label">Verdict</span>
              <h2 className="result-verdict">{result.prediction}</h2>
            </div>
            <div className="confidence-ring-wrap">
              <ConfidenceRing value={result.confidence} isFake={isFake} />
            </div>
          </div>

          <SignalBadges
            isFake={isFake}
            fakeSignals={result.top_fake_signals}
            realSignals={result.top_real_signals}
          />
        </div>
      )}
    </main>
  );
}

function ConfidenceRing({ value, isFake }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const dash = (value / 100) * circ;
  const color = isFake ? '#ef4444' : '#22c55e';

  return (
    <div className="confidence-ring">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="ring-label">
        <span className="ring-value">{value}%</span>
        <span className="ring-sub">confidence</span>
      </div>
    </div>
  );
}
