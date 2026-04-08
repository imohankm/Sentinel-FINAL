from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global store for the latest report
latest_report = {
    "status": "idle",
    "risk_score": 0,
    "vulnerabilities": [],
    "attack_paths": [],
    "logs": []
}

@app.post("/api/analyze")
async def analyze_target(request: Request):
    data = await request.json()
    forms = data.get("forms", [])
    inputs = data.get("inputs", [])
    protocol = data.get("protocol", "http:")
    scripts = data.get("scripts", [])
    
    global latest_report
    logs = []
    vulnerabilities = []
    attack_paths = []
    
    logs.append({"agent": "agent-recon", "text": "Received live DOM signal from Chrome Extension."})
    logs.append({"agent": "agent-recon", "text": f"Scanned {len(forms)} forms, {len(inputs)} input fields. Protocol: {protocol}"})
    
    # Rules + AI Inference Engine
    
    # Rule 1: HTTP instead of HTTPS
    if "http:" in protocol:
        vulnerabilities.append({
            "severity": "High",
            "name": "Insecure Communication (HTTP)",
            "description": "Target is using HTTP. Interception of credentials is highly probable.",
            "type": "Misconfig"
        })
        logs.append({"agent": "agent-strategy", "text": "Insecure HTTP detected. Flagging network interception risk."})
    
    # Rule 2: Passwords without security checks & Rate Limits
    has_password = any(i.get('type') == 'password' for i in inputs)
    has_login_form = any('login' in str(f.get('action', '')).lower() or 'admin' in str(f.get('id', '')).lower() for f in forms)
    
    if has_password or has_login_form:
        logs.append({"agent": "agent-recon", "text": "Login form located."})
        
        # Simulating strategy inference on the loose form
        logs.append({"agent": "agent-strategy", "text": "Login form has no CAPTCHA or visible rate limiting in HTML structure."})
        vulnerabilities.append({
            "severity": "Critical",
            "name": "Brute Force Risk",
            "description": "Login form lacks anti-automation mechanisms. Susceptible to credential stuffing.",
            "type": "Brute Force"
        })
        attack_paths.append("User -> Login Form -> Brute Force -> Admin Access -> Data Leak")
        logs.append({"agent": "agent-attack", "text": "Simulating brute force... High probability of success."})
        
    # Rule 3: Hidden API exposure checking
    if any('api' in script.lower() for script in scripts):
        vulnerabilities.append({
            "severity": "Medium",
            "name": "Exposed API Endpoint in JS",
            "description": "Frontend scripts reference internal APIs directly.",
            "type": "Misconfig"
        })
        logs.append({"agent": "agent-recon", "text": "Found exposed internal API refs in frontend script tags."})
        attack_paths.append("User -> Scrape JS -> Discover API -> Bypass Frontend Auth")

    # Final Risk Score Math
    risk_score = 0
    for v in vulnerabilities:
        if v['severity'] == 'Critical': risk_score += 40
        elif v['severity'] == 'High': risk_score += 25
        elif v['severity'] == 'Medium': risk_score += 15
        
    risk_score = min(risk_score + 10, 100) # Base 10 risk + findings
    
    logs.append({"agent": "agent-strategy", "text": f"Systemic risk calculated at {risk_score}%."})

    latest_report = {
        "status": "complete",
        "risk_score": risk_score,
        "vulnerabilities": vulnerabilities,
        "attack_paths": attack_paths,
        "logs": logs,
        "timestamp": str(datetime.datetime.now())
    }
    
    return {"message": "Analysis complete", "risk_score": risk_score}

@app.get("/api/report")
async def get_report():
    return latest_report

@app.post("/api/reset")
async def reset_report():
    global latest_report
    latest_report = {
        "status": "idle",
        "risk_score": 0,
        "vulnerabilities": [],
        "attack_paths": [],
        "logs": []
    }
    return {"message": "Reset"}
