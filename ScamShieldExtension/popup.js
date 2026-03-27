const API_URL = 'http://localhost:8000';

document.getElementById('scan-btn').addEventListener('click', async () => {
  showState('loading-state');
  
  // 1. Get current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 2. Execute script to extract text
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        // 1. If user highlighted text, scan only that!
        let selectedText = window.getSelection().toString();
        if (selectedText.trim().length > 50) return selectedText;
        
        // 2. Otherwise, look for the main content area to avoid Navbars/Footers
        let mainNode = document.querySelector('main') 
                    || document.querySelector('[role="main"]') 
                    || document.querySelector('article') 
                    || document.body;
        
        let text = mainNode.innerText || mainNode.textContent || '';
        if (text.trim().length < 50 && mainNode !== document.body) {
           text = document.body.innerText || document.body.textContent || '';
        }
        return text;
      },
    },
    async (injectionResults) => {
      try {
        if (!injectionResults || !injectionResults[0]) {
          throw new Error('Could not read page text.');
        }
        
        const pageText = injectionResults[0].result;
        const pageUrl = tab.url;
        
        if (!pageText || pageText.trim().length < 20) {
          throw new Error('Not enough text on page to analyze. Please try scrolling down the page and clicking again, or refresh the page.');
        }

        // 3. Send text to backend
        const response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pageText, url: pageUrl })
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 4. Update UI
        showResult(data);
        
      } catch (err) {
        showError(err.message.includes('fetch') 
          ? 'Cannot connect to ScamShield API. Ensure the backend is running locally.' 
          : err.message);
      }
    }
  );
});

document.getElementById('retry-btn').addEventListener('click', () => {
  showState('main-content');
});

function showState(stateId) {
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('error-state').classList.add('hidden');
  document.getElementById('result-state').classList.add('hidden');
  
  document.getElementById(stateId).classList.remove('hidden');
}

function showError(msg) {
  document.getElementById('error-msg').textContent = msg;
  showState('error-state');
}

function showResult(data) {
  const isFake = data.is_fake;
  const resultState = document.getElementById('result-state');
  
  resultState.className = `result-card ${isFake ? 'result-fake' : 'result-real'}`;
  
  document.getElementById('verdict-icon').className = `result-icon-wrap ${isFake ? 'icon-fake' : 'icon-real'}`;
  document.getElementById('verdict-icon').textContent = isFake ? '⚠️' : '✅';
  
  document.getElementById('verdict-text').textContent = data.prediction;
  document.getElementById('confidence-val').textContent = `${data.confidence}%`;
  
  if (data.domain) {
    const domainEl = document.getElementById('domain-val');
    if (domainEl) {
      domainEl.textContent = `${data.domain} - ${data.domain_verdict}`;
      domainEl.className = data.domain_verdict === 'Trusted Portal' ? 'domain-safe' : 'domain-warn';
    }
  }
  
  const signalsDiv = document.getElementById('signals');
  signalsDiv.innerHTML = ''; // clear old signals
  
  const signals = isFake ? data.top_fake_signals : data.top_real_signals;
  if (signals && signals.length > 0) {
    signals.slice(0, 3).forEach(sig => {
      const pill = document.createElement('div');
      pill.className = 'signal-pill';
      pill.textContent = sig;
      signalsDiv.appendChild(pill);
    });
  } else {
    signalsDiv.innerHTML = '<div class="signal-pill">No major signals</div>';
  }
  
  showState('result-state');
}
