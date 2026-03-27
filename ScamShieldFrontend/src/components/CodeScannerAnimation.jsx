import React, { useState, useEffect } from 'react';
import './CodeScannerAnimation.css';

const CODE_LINES = [
  "SYSTEM_SCAN --target ALL_BUFFERS",
  "INITIALIZING NEURAL_NETWORK v4.0.1",
  "LOAD_MODEL: ./models/scam_shield_v2.bin",
  "STATUS: OPTIMIZING_WEIGHTS [OK]",
  "",
  "fn ANALYZE_PACKET(data: stream) {",
  "    let vectors = text.vectorize(data);",
  "    let confidence = model.predict(vectors);",
  "    ",
  "    if confidence > 0.85 {",
  "        ALERT('SCAM_DETECTED');",
  "        TERMINATE_CONNECTION();",
  "    }",
  "}",
  "",
  "// MONITORING_INCOMING_TRAFFIC..."
];

export default function CodeScannerAnimation() {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (currentLineIdx >= CODE_LINES.length) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setDisplayedLines([]);
        setCurrentLineIdx(0);
        setCurrentCharIdx(0);
      }, 4000); // Wait 4 seconds after finishing before restarting
      return;
    }

    const currentLine = CODE_LINES[currentLineIdx];

    if (currentCharIdx < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (newLines[currentLineIdx] === undefined) {
            newLines[currentLineIdx] = '';
          }
          newLines[currentLineIdx] += currentLine[currentCharIdx];
          return newLines;
        });
        setCurrentCharIdx(c => c + 1);
      }, Math.random() * 20 + 10); // Typing speed

      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (newLines[currentLineIdx] === undefined) newLines[currentLineIdx] = '';
          return newLines;
        });
        setCurrentLineIdx(l => l + 1);
        setCurrentCharIdx(0);
      }, 150); // Delay between lines

      return () => clearTimeout(timeout);
    }
  }, [currentLineIdx, currentCharIdx]);

  return (
    <div className="code-window">
      <div className="window-header">
        <div className="window-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="window-title">bash — AI Scanner Module</div>
      </div>

      <div className={`window-body ${isScanning ? 'scanning-active' : ''}`}>
        <div className="code-content">
          {displayedLines.map((line, idx) => (
            <div key={idx} className="code-line">
              <span className="line-number">{idx + 1}</span>
              <span className="line-text" dangerouslySetInnerHTML={{ __html: highlightSyntax(line) }}></span>
            </div>
          ))}
          {!isScanning && <span className="cursor-blink">_</span>}
        </div>

        {isScanning && <div className="scanning-laser"></div>}
      </div>
    </div>
  );
}

// Simple syntax highlighter
function highlightSyntax(code) {
  let highlighted = code
    .replace(/ /g, '&nbsp;')
    .replace(/(from|import|def|return|if)\b/g, '<span class="keyword">$1</span>')
    .replace(/(print|FraudDetector)\b/g, '<span class="function">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="string">$1</span>')
    .replace(/(#[^\n]*)/g, '<span class="comment">$1</span>')
    .replace(/\b([0-9]+\.[0-9]+|[0-9]+)\b/g, '<span class="number">$1</span>');
  return highlighted;
}
