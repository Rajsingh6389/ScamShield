import React from 'react';
import './EmailInbox.css';

export default function EmailInbox({ emails }) {
  if (!emails || emails.length === 0) {
    return (
      <section className="inbox-section">
        <div className="inbox-header">
          <h2 className="inbox-title">NEURAL_INBOX_SCAN</h2>
          <p className="inbox-sub">NULL_BUFFER: NO_RECORDS_FOUND</p>
        </div>
      </section>
    );
  }

  const scamCount = emails.filter((e) => e.result === 'SCAM').length;

  return (
    <section className="inbox-section">
      <div className="inbox-header">
        <div>
          <h2 className="inbox-title">SCAN_RECORDS_TELEMETRY</h2>
          <p className="inbox-sub">
            PROCESSED: <strong>{emails.length}</strong> BYTES —{' '}
            <span className="inbox-scam-count">{scamCount} THREATS_IDENTIFIED</span>
          </p>
        </div>
        <div className="inbox-summary-pills">
          <span className="pill pill-scam">⚠️ {scamCount} SCAM</span>
          <span className="pill pill-safe">✅ {emails.length - scamCount} SAFE</span>
        </div>
      </div>

      <div className="email-list">
        {emails.map((email, idx) => (
          <EmailCard key={idx} email={email} />
        ))}
      </div>
    </section>
  );
}

function parseSender(raw) {
  // e.g. "John Doe <john@example.com>" → { name: "John Doe", addr: "john@example.com" }
  const match = raw.match(/^(.*?)\s*<(.+)>$/);
  if (match) return { name: match[1].replace(/"/g, '').trim(), addr: match[2] };
  return { name: raw, addr: raw };
}

function formatDate(raw) {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function EmailCard({ email }) {
  const isScam = email.result === 'SCAM';
  const risk = email.risk ?? 0;
  const sender = parseSender(email.sender || '');
  const dateStr = formatDate(email.date);

  return (
    <div className={`email-card glass ${isScam ? 'email-scam' : 'email-safe'}`}>
      {/* Top row: avatar + meta + badge + date */}
      <div className="email-row-top">
        <div className="sender-avatar">{sender.name.charAt(0).toUpperCase()}</div>
        <div className="email-meta">
          <div className="email-meta-top">
            <span className="sender-name">{sender.name}</span>
            <span className="email-date">{dateStr}</span>
          </div>
          <span className="sender-addr">{sender.addr}</span>
        </div>
        <span className={`email-badge ${isScam ? 'badge-scam' : 'badge-safe'}`}>
          {isScam ? '⚠️ SCAM' : '✅ SAFE'}
        </span>
      </div>

      {/* Subject */}
      <p className="email-subject">{email.subject}</p>

      {/* Snippet */}
      <p className="email-snippet">{email.snippet}</p>

      {/* Risk bar */}
      <div className="risk-bar-row">
        <span className="risk-label">Risk</span>
        <div className="risk-bar-wrap">
          <div
            className="risk-bar-fill"
            style={{
              width: `${risk}%`,
              background: isScam
                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                : 'linear-gradient(90deg, #22c55e, #10b981)',
            }}
          />
        </div>
        <span className="risk-pct">{risk}%</span>
      </div>
    </div>
  );
}
