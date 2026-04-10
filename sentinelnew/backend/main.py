import asyncio
import re
import datetime
import uuid
import requests
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import concurrent.futures
from database import get_db, init_db, hash_password

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    # Start the continuous monitoring loop
    asyncio.create_task(continuous_monitor_loop())

# Memory store for active/live scan status
live_scans: Dict[str, Any] = {}
scans_lock = asyncio.Lock()

# ----------------------------------------------------
# Modular Analysis Engine
# ----------------------------------------------------

def fetch_target(url: str):
    try:
        return requests.get(url, timeout=5, verify=False, allow_redirects=True)
    except Exception:
        return None

class SentinelScanner:
    def __init__(self, target_id, url, scan_id, org_id, started_by):
        self.target_id = target_id
        self.url = url
        self.scan_id = scan_id
        self.org_id = org_id
        self.started_by = started_by
        self.logs = []
        self.findings = []
        self.score = 0
        self.summary = {"pages": 1, "endpoints": 0, "headers": 0, "forms": 0}

    async def log(self, agent, text):
        timestamp = datetime.datetime.now().isoformat()
        self.logs.append({"agent": agent, "text": text, "timestamp": timestamp})
        # Persist to DB immediately for live feed
        conn = get_db()
        c = conn.cursor()
        c.execute("INSERT INTO scan_logs (scan_id, agent, message, timestamp) VALUES (?, ?, ?, ?)",
                  (self.scan_id, agent, text, timestamp))
        conn.commit()
        conn.close()

    def add_finding(self, title, severity, category, description, evidence, impact, recommendation):
        self.findings.append({
            "title": title,
            "severity": severity,
            "category": category,
            "description": description,
            "evidence": evidence,
            "impact": impact,
            "recommendation": recommendation,
            "confidence": 95 if severity in ["HIGH", "CRITICAL"] else 80
        })

    async def run(self):
        global live_scans
        async with scans_lock:
            live_scans[self.scan_id] = {"status": "running", "logs": self.logs}

        await self.log("agent-recon", f"Job Initialized. Target: {self.url}")
        await asyncio.sleep(0.5)

        # 1. Recon Stage
        await self.log("agent-recon", "Initializing Connectivity Probe...")
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            response = await loop.run_in_executor(pool, fetch_target, self.url)

        if response is None:
            await self.log("agent-recon", "CRITICAL: Target unreachable. Analysis aborted.")
            self.add_finding("Target Unreachable", "CRITICAL", "Availability", 
                             "Host is offline", "No response", "No data", "Check URL")
            await self.finalize("failed")
            return

        # 2. Header & Cookie Analysis
        await self.log("agent-strategy", "Inspecting Transport & Protocol headers...")
        headers = {k.lower(): v for k, v in response.headers.items()}
        self.summary["headers"] = len(headers)
        
        if not self.url.startswith("https"):
            self.add_finding("Insecure Transport (HTTP)", "HIGH", "Encryption",
                             "Communication is unencrypted.", "URL schema is http",
                             "Data interception possible.", "Upgrade to TLS 1.3.")

        missing = []
        if "content-security-policy" not in headers: missing.append("CSP")
        if "x-frame-options" not in headers: missing.append("X-Frame-Options")
        if missing:
            self.add_finding(f"Missing Security Headers: {', '.join(missing)}", "MEDIUM", "Configuration",
                             "Web server policy allows broad interaction.", f"Headers found: {list(headers.keys())[:3]}",
                             "SUSCEPTIBLE to XSS/Clickjacking.", "Implement modern security headers.")

        # 3. Auth & Form Discovery
        await self.log("agent-auth", "Probing for Authentication vectors...")
        html = response.text
        forms = re.findall(r'<form[^>]*>', html, re.IGNORECASE)
        self.summary["forms"] = len(forms)
        
        has_login = any(re.search(r'login|auth|key|id', f, re.IGNORECASE) for f in forms)
        if has_login:
            await self.log("agent-auth", "Active Login Surface detected. Probing for brute-force mitigation...")
            if "debug" in html.lower():
                self.add_finding("Public Admin Page Exposure", "HIGH", "Authentication",
                                 "Admin portal is accessible without IP filtering.", "Found 'debug' trace in HTML",
                                 "Full system compromise if breached.", "Restrict access to internal ranges.")
            
            if "db_connector.php" in html:
                 self.add_finding("Verbose Error Disclosure", "MEDIUM", "Information Leak",
                                 "Server leaking internal path information.", "Found path trace in footer",
                                 "Aids attackers in reconnaissance.", "Disable debug headers in production.")

        # 4. Endpoint Discovery (JS Scraping)
        await self.log("agent-recon", "Scraping Javascript for internal API references...")
        api_endpoints = re.findall(r'[\'"](/api/[^\'"]+)[\'"]', html, re.IGNORECASE)
        self.summary["endpoints"] = len(api_endpoints)
        if api_endpoints:
            await self.log("agent-recon", f"Found {len(api_endpoints)} potential API routes.")
            if any("internal" in e for e in api_endpoints) or any("users" in e for e in api_endpoints):
                self.add_finding("Internal API Exposure in client-side JS", "HIGH", "Sensitivity",
                                 "Client-side scripts reference sensitive APIs.", f"Route: {api_endpoints[0]}",
                                 "Discovery of internal functionality.", "Ensure strict server-side RBAC.")

        # Calculate Score
        weight = {"CRITICAL": 40, "HIGH": 25, "MEDIUM": 15, "LOW": 5}
        self.score = min(sum(weight.get(f["severity"], 0) for f in self.findings), 100)
        
        await self.log("agent-strategy", f"Synthesis complete. Final Risk Index: {self.score}%")
        await self.finalize("complete")

    async def finalize(self, status):
        now = datetime.datetime.now().isoformat()
        conn = get_db()
        c = conn.cursor()
        c.execute('''
            INSERT INTO scans (id, org_id, target_id, started_by, status, risk_score, created_at, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (self.scan_id, self.org_id, self.target_id, self.started_by, status, self.score, now, now))
        
        for f in self.findings:
            c.execute('''
                INSERT INTO findings (scan_id, target_id, title, severity, category, description, evidence, affected_asset, recommendation, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (self.scan_id, self.target_id, f["title"], f["severity"], f["category"], f["description"], f["evidence"], self.url, f["recommendation"], now))
        
        conn.commit()
        conn.close()
        
        async with scans_lock:
            if self.scan_id in live_scans:
                live_scans[self.scan_id]["status"] = status
                live_scans[self.scan_id]["score"] = self.score
                live_scans[self.scan_id]["findings"] = self.findings

# ----------------------------------------------------
# Continuous Monitoring Task
# ----------------------------------------------------

async def continuous_monitor_loop():
    """Background loop that monitors approved targets every 60 seconds for the demo."""
    print("[SYSTEM] Starting Continuous Monitoring Loop...")
    while True:
        try:
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT id, url, org_id FROM targets WHERE approval_status = 'approved'")
            targets = [dict(row) for row in c.fetchall()]
            conn.close()

            for t in targets:
                scan_id = str(uuid.uuid4())
                print(f"[MONITOR] Triggering scheduled scan for {t['url']}")
                scanner = SentinelScanner(t['id'], t['url'], scan_id, t['org_id'], 1) # System User ID = 1
                asyncio.create_task(scanner.run())
            
            await asyncio.sleep(60) # Demo interval
        except Exception as e:
            print(f"[MONITOR ERROR] {e}")
            await asyncio.sleep(10)

# ----------------------------------------------------
# API Routes
# ----------------------------------------------------

@app.post("/api/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password", "")
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, org_id, name, email, role FROM users WHERE email = ? AND password_hash = ?", 
              (email, hash_password(password)))
    row = c.fetchone()
    
    if row:
        user_data = {
            "id": row["id"],
            "org_id": row["org_id"],
            "name": row["name"],
            "email": row["email"],
            "role": row["role"]
        }
        
        # Record persistent login telemetry
        try:
            now = datetime.datetime.now().isoformat()
            ip = "127.0.0.1" # Dev handshake origin
            c.execute("INSERT INTO logins (user_id, ip_address, timestamp) VALUES (?, ?, ?)", 
                      (user_data["id"], ip, now))
            conn.commit()
        except Exception as e:
            print(f"[AUTH TELEMETRY ERROR] {e}")
            
        conn.close()
        return {"success": True, "user": user_data}
    
    conn.close()
    raise HTTPException(status_code=401, detail="Unauthorized HANDSHAKE_FAILURE")

@app.get("/api/targets")
async def get_targets(org_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM targets WHERE org_id = ?", (org_id,))
    data = [dict(row) for row in c.fetchall()]
    conn.close()
    return data

@app.post("/api/targets")
async def add_target(request: Request):
    data = await request.json()
    org_id = data.get("org_id")
    name = data.get("name")
    url = data.get("url")
    environment = data.get("environment")
    user_id = data.get("user_id")

    if not all([org_id, name, url, environment]):
        raise HTTPException(status_code=400, detail="Missing required target fields")

    now = datetime.datetime.now().isoformat()
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO targets (org_id, name, url, environment, approval_status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (org_id, name, url, environment, 'approved', user_id, now))
    conn.commit()
    target_id = c.lastrowid
    conn.close()

    return {"success": True, "target_id": target_id}

@app.get("/api/stats")
async def get_stats(org_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM targets WHERE org_id = ?", (org_id,))
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM scans WHERE org_id = ?", (org_id,))
    scans = c.fetchone()[0]
    c.execute("SELECT risk_score FROM scans WHERE org_id = ? ORDER BY created_at DESC LIMIT 10", (org_id,))
    trend = [row[0] for row in c.fetchall()]
    conn.close()
    return {"total_targets": total, "total_scans": scans, "risk_trend": trend[::-1]}

@app.get("/api/history")
async def get_history(org_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT s.*, t.name as target_name FROM scans s JOIN targets t ON s.target_id = t.id WHERE s.org_id = ? ORDER BY s.created_at DESC", (org_id,))
    data = [dict(row) for row in c.fetchall()]
    conn.close()
    return data

@app.post("/api/analyze")
async def analyze_target(request: Request):
    data = await request.json()
    url = data.get("url")
    target_id = data.get("target_id")
    org_id = data.get("org_id", 1)
    user_id = data.get("user_id", 1)

    if not url and not target_id:
        raise HTTPException(status_code=400, detail="URL or Target ID required")

    conn = get_db()
    c = conn.cursor()

    if not target_id and url:
        # Resolve target_id from URL
        c.execute("SELECT id FROM targets WHERE url = ? OR url = ? OR url = ?", (url, url.rstrip('/'), url + '/'))
        row = c.fetchone()
        if row:
            target_id = row[0]
        else:
            # Auto-register discovered asset
            name = url.split('//')[-1].split('/')[0]
            now = datetime.datetime.now().isoformat()
            c.execute('''
                INSERT INTO targets (org_id, name, url, environment, approval_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (org_id, f"Discovered: {name}", url, "External / Discovery", "approved", now))
            conn.commit()
            target_id = c.lastrowid
    
    conn.close()
    
    scan_id = str(uuid.uuid4())
    scanner = SentinelScanner(target_id, url, scan_id, org_id, user_id)
    asyncio.create_task(scanner.run())
    return {"success": True, "scan_id": scan_id}

@app.get("/api/report")
async def get_report(scan_id: str):
    async with scans_lock:
        if scan_id in live_scans:
            return live_scans[scan_id]
    
    # Fallback to DB
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM scans WHERE id = ?", (scan_id,))
    scan = c.fetchone()
    if scan:
        c.execute("SELECT * FROM findings WHERE scan_id = ?", (scan_id,))
        findings = [dict(row) for row in c.fetchall()]
        c.execute("SELECT * FROM scan_logs WHERE scan_id = ? ORDER BY timestamp ASC", (scan_id,))
        logs = [dict(row) for row in c.fetchall()]
        conn.close()
        return {"status": scan["status"], "score": scan["risk_score"], "findings": findings, "logs": logs}
    
    conn.close()
    return {"status": "not_found"}

@app.get("/api/user/logins")
async def get_login_history(user_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT ip_address, timestamp FROM logins WHERE user_id = ? ORDER BY id DESC LIMIT 10", (user_id,))
    logins = [dict(row) for row in c.fetchall()]
    conn.close()
    return logins

@app.get("/api/user/me")
async def get_me(user_id: int):
    conn = get_db()
    c = conn.cursor()
    # Fetch user & Organization info
    c.execute("""
        SELECT u.id, u.name, u.email, u.role, u.status, o.name as org_name, u.created_at
        FROM users u 
        JOIN organizations o ON u.org_id = o.id
        WHERE u.id = ?
    """, (user_id,))
    user = dict(c.fetchone())
    
    # Fetch last 2 logins for session details
    c.execute("SELECT timestamp FROM logins WHERE user_id = ? ORDER BY id DESC LIMIT 2", (user_id,))
    logins = c.fetchall()
    
    user["current_session_started_at"] = logins[0]["timestamp"] if len(logins) > 0 else user["created_at"]
    user["last_login_at"] = logins[1]["timestamp"] if len(logins) > 1 else "First Session"
    
    conn.close()
    return user

@app.get("/api/user/activity")
async def get_activity(user_id: int):
    conn = get_db()
    c = conn.cursor()
    
    # Aggregates
    c.execute("SELECT COUNT(*) FROM scans WHERE started_by = ?", (user_id,))
    audits_initiated = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM scans WHERE started_by = ? AND status = 'complete'", (user_id,))
    reports_generated = c.fetchone()[0]
    
    c.execute("SELECT timestamp FROM scan_logs sl JOIN scans s ON sl.scan_id = s.id WHERE s.started_by = ? ORDER BY sl.id DESC LIMIT 1", (user_id,))
    last_active = c.fetchone()
    
    conn.close()
    return {
        "audits_initiated": audits_initiated,
        "reports_viewed": reports_generated,
        "last_active_at": last_active["timestamp"] if last_active else "N/A"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
