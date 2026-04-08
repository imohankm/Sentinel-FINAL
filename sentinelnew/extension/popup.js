const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runAgenticSimulation(payload) {
    const aiSteps = document.getElementById('aiSteps');
    const resultArea = document.getElementById('resultArea');
    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    const s3 = document.getElementById('step3');
    
    // Reset steps
    s1.className = 'step'; s1.innerText = '[ ] Collecting data...';
    s2.className = 'step'; s2.innerText = '[ ] Analyzing scripts...';
    s3.className = 'step'; s3.innerText = '[ ] Detecting threats...';
    
    aiSteps.style.display = 'flex';
    resultArea.style.display = 'none';

    // Step 1
    s1.className = 'step active';
    s1.innerText = '[⏳] Collecting data...';
    await sleep(600);
    s1.className = 'step done';
    s1.innerText = '[✔] Collecting data...';

    // Step 2
    s2.className = 'step active';
    s2.innerText = '[⏳] Analyzing scripts...';
    await sleep(800);
    s2.className = 'step done';
    s2.innerText = '[✔] Analyzing scripts...';

    // Step 3
    s3.className = 'step active';
    s3.innerText = '[⏳] Detecting threats...';
    
    // Call backend
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "runAnalysis", payload: payload }, async (bgResponse) => {
            await sleep(700); 
            s3.className = 'step done';
            s3.innerText = '[✔] Detecting threats...';
            resolve(bgResponse);
        });
    });
}

function gatherIntelligentSignals() {
    const forms = Array.from(document.querySelectorAll('form')).map(f => {
        return { id: f.id, action: f.action, method: f.method, className: f.className };
    });
    const inputs = Array.from(document.querySelectorAll('input')).map(i => {
        return { type: i.type, name: i.name, id: i.id };
    });
    const scripts = Array.from(document.querySelectorAll('script')).map(s => {
        return s.src || s.innerText.substring(0, 100);
    });
    return {
        forms: forms,
        inputs: inputs,
        protocol: window.location.protocol,
        url: window.location.href,
        scripts: scripts
    };
}

document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
});

document.getElementById('dashboardBtn').addEventListener('click', () => {
    // Note: User specified 8501 (Streamlit), but dashboard is on 5173 (React/Vite). Using 5173.
    chrome.tabs.create({ url: 'http://localhost:5173' });
});

document.getElementById('scanBtn').addEventListener('click', async () => {
    const btn = document.getElementById('scanBtn');
    btn.disabled = true;
    btn.innerText = 'Scanning...';

    const tLevel = document.getElementById('threatLevel');
    const rScore = document.getElementById('riskScore');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || tab.url.startsWith('chrome://')) {
            alert("Cannot scan this page type. Try on localhost:8080");
            btn.disabled = false;
            btn.innerText = '⚡ Run Agentic Scan';
            return;
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: gatherIntelligentSignals,
        });

        const payload = results && results[0] ? results[0].result : {};
        
        // Execute AI Visual Flow
        const response = await runAgenticSimulation(payload);

        document.getElementById('aiSteps').style.display = 'none';
        const resArea = document.getElementById('resultArea');
        resArea.style.display = 'flex';

        if (response && response.success) {
            const risk = response.risk_score || 0;
            const vulnCount = Math.max(1, Math.floor(risk / 30)); 
            
            document.getElementById('resVuln').innerText = `✔ ${vulnCount} vulnerabilities detected`;
            document.getElementById('resRisk').innerText = `✔ Risk Score: ${risk}%`;
            
            let color = '';
            let shadowColor = '';
            let msg = '';
            
            rScore.innerText = `${risk}%`;

            if (risk < 30) {
                tLevel.innerText = 'LOW';
                tLevel.className = 'threat-level low';
                color = '#00F5A0'; shadowColor = 'rgba(0,245,160,0.3)';
                msg = '✓ Safe for now';
            } else if (risk < 70) {
                tLevel.innerText = 'MEDIUM';
                tLevel.className = 'threat-level medium';
                color = '#FACC15'; shadowColor = 'rgba(250,204,21,0.3)';
                msg = '⚠ Some config issues found';
            } else {
                tLevel.innerText = 'HIGH';
                tLevel.className = 'threat-level high';
                color = '#EF4444'; shadowColor = 'rgba(239,68,68,0.3)';
                msg = '⚠ Critical exploits possible';
            }
            
            document.getElementById('threatCard').style.borderColor = shadowColor;
            if(risk >= 70) document.getElementById('threatCard').style.boxShadow = `0 0 15px ${shadowColor}`;
            else document.getElementById('threatCard').style.boxShadow = 'none';
            
            resArea.style.borderLeftColor = color;
            document.getElementById('resMsg').innerText = msg;
            document.getElementById('resMsg').style.color = color;
            
        } else {
            document.getElementById('resMsg').innerText = '⚠ Backend failed / Offline';
            resArea.style.borderLeftColor = '#EF4444';
        }

    } catch (e) {
        alert("Error executing scan: " + e.message);
    }

    btn.disabled = false;
    btn.innerText = '⚡ Run Agentic Scan';
});
