const sleep = ms => new Promise(r => setTimeout(r, ms));

function updateRiskGauge(score) {
    const fill = document.getElementById('riskFill');
    const scoreText = document.getElementById('riskScore');
    const badge = document.getElementById('threatLevel');
    
    // Circumference = 2 * PI * 45 = 283
    const circumference = 283;
    const offset = circumference - (score / 100 * circumference);
    fill.style.strokeDashoffset = offset;
    
    scoreText.innerText = score.toString().padStart(2, '0');
    
    let level = 'SURFACE STABLE';
    let className = 'safe';
    if (score >= 70) { level = 'BREACH DETECTED'; className = 'critical'; }
    else if (score >= 40) { level = 'ELEVATED RISK'; className = 'warning'; }
    else if (score > 0) { level = 'MONITORING'; className = 'safe'; }

    badge.innerText = level;
    badge.className = `threat-badge ${className}`;
}

async function pollReport(scanId) {
    for (let i = 0; i < 15; i++) { 
        try {
            const res = await fetch(`http://localhost:8000/api/report?scan_id=${scanId}`);
            const data = await res.json();
            
            if (data.status === 'running' || data.status === 'complete') {
                updateRiskGauge(data.score || 0);
            }

            if (data.status === 'complete') break;
        } catch (e) { console.error("Poll error", e); }
        await sleep(1000);
    }
}

async function runAgenticSimulation(payload) {
    const aiSteps = document.getElementById('aiSteps');
    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    const s3 = document.getElementById('step3');
    
    aiSteps.style.display = 'flex';

    // Step 1: Recon
    s1.className = 'step active';
    await sleep(800);
    s1.className = 'step done';

    // Step 2: Transmission
    s2.className = 'step active';
    
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "runAnalysis", payload: payload }, async (bgResponse) => {
            s2.className = 'step done';

            s3.className = 'step active';
            
            if (bgResponse && bgResponse.success && bgResponse.scan_id) {
                pollReport(bgResponse.scan_id);
            }

            await sleep(1500); 
            s3.className = 'step done';
            resolve(bgResponse);
        });
    });
}

document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
});

document.getElementById('scanBtn').addEventListener('click', async () => {
    const btn = document.getElementById('scanBtn');
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Establishing Uplink...';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || tab.url.startsWith('chrome://')) {
            alert("Sentinel cannot audit system pages.");
            btn.disabled = false;
            btn.innerHTML = originalContent;
            return;
        }

        const payload = { url: tab.url };
        const response = await runAgenticSimulation(payload);

        if (response && response.success && response.scan_id) {
            const dashBtn = document.getElementById('dashboardBtn');
            dashBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Open Full Report
            `;
            dashBtn.onclick = () => {
                chrome.tabs.create({ url: `http://localhost:5173/?scan_id=${response.scan_id}` });
            };
            btn.innerHTML = 'Audit Synchronized';
        } else {
            alert("Backend Handshake Failed");
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }

    } catch (e) {
        alert("Runtime Error: " + e.message);
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
});
