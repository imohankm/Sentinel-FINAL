// Reads the DOM to gather intelligent signals
function gatherIntelligentSignals() {
    // 1. Gather Forms
    const forms = Array.from(document.querySelectorAll('form')).map(f => {
        return {
            id: f.id,
            action: f.action,
            method: f.method,
            className: f.className
        };
    });

    // 2. Gather Inputs
    const inputs = Array.from(document.querySelectorAll('input')).map(i => {
        return {
            type: i.type,
            name: i.name,
            id: i.id
        };
    });

    // 3. Gather Scripts (looking for exposed APIs)
    const scripts = Array.from(document.querySelectorAll('script')).map(s => {
        return s.src || s.innerText.substring(0, 50); // limit payload size
    });

    return {
        forms: forms,
        inputs: inputs,
        protocol: window.location.protocol,
        url: window.location.href,
        scripts: scripts
    };
}

// Inject Floating Panel UI
const panel = document.createElement("div");
panel.id = "sentinel-panel";

// Initially it's injected but hidden off-screen (right: -300px in css)
panel.innerHTML = `
  <div class="sentinel-header">
    <h2>SentinelAI</h2>
    <span>Client Intelligence</span>
  </div>

  <div class="sentinel-actions">
    <button id="scanBtn">⚡ Run Agentic Scan</button>
    <button id="dashBtn">📊 Open Dashboard</button>
  </div>

  <div class="sentinel-status">
    Ready for inspection
  </div>
`;

document.body.appendChild(panel);

const statusDiv = document.querySelector(".sentinel-status");
function updateStatus(msg, color="#facc15") {
  statusDiv.innerText = msg;
  statusDiv.style.color = color;
}

// Button actions
document.getElementById("scanBtn").onclick = () => {
    updateStatus("Gathering signals...", "#facc15");
    
    try {
        const payload = gatherIntelligentSignals();
        updateStatus("Calling Backend...", "#facc15");
        
        chrome.runtime.sendMessage({ action: "runAnalysis", payload: payload }, (response) => {
            if (chrome.runtime.lastError) {
                updateStatus("Error: " + chrome.runtime.lastError.message, "#ff003c");
                return;
            }
            if (response && response.success) {
                updateStatus(`Analysis Complete! Risk: ${response.risk_score}%`, "#39ff14");
            } else {
                updateStatus("Backend Refused. Check port 8000.", "#ff003c");
            }
        });
    } catch (err) {
        updateStatus("Execution Error.", "#ff003c");
    }
};

document.getElementById("dashBtn").onclick = () => {
  updateStatus("Opening dashboard...", "#38bdf8");
  window.open('http://localhost:5173', '_blank');
};

// Listen for popup trigger from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanDOM") { // old action support
        const payload = gatherIntelligentSignals();
        sendResponse({ payload: payload });
    } else if (request.action === "TOGGLE_PANEL") {
        const p = document.getElementById("sentinel-panel");
        if (p.classList.contains("open")) {
            p.classList.remove("open");
        } else {
            p.classList.add("open");
        }
    }
});
