import sqlite3
import os
import hashlib
from datetime import datetime

DB_FILE = "sentinel_internal.db"

def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = get_db()
    c = conn.cursor()
    
    # 1. Organizations table
    c.execute('''
        CREATE TABLE IF NOT EXISTS organizations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            domain TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 2. Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            org_id INTEGER,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL,
            FOREIGN KEY (org_id) REFERENCES organizations (id)
        )
    ''')
    
    # 3. Targets table
    c.execute('''
        CREATE TABLE IF NOT EXISTS targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            org_id INTEGER,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            environment TEXT NOT NULL,
            approval_status TEXT DEFAULT 'pending',
            created_by INTEGER,
            created_at TEXT NOT NULL,
            FOREIGN KEY (org_id) REFERENCES organizations (id)
        )
    ''')
    
    # 4. Scans table
    c.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            org_id INTEGER,
            target_id INTEGER,
            started_by INTEGER,
            status TEXT,
            risk_score INTEGER,
            created_at TEXT NOT NULL,
            completed_at TEXT,
            FOREIGN KEY (org_id) REFERENCES organizations (id),
            FOREIGN KEY (target_id) REFERENCES targets (id)
        )
    ''')
    
    # 5. Findings table (Expanded for Enterprise Reporting)
    c.execute('''
        CREATE TABLE IF NOT EXISTS findings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT,
            target_id INTEGER,
            title TEXT,
            severity TEXT,
            category TEXT,
            confidence INTEGER,
            description TEXT,
            evidence TEXT,
            affected_asset TEXT,
            recommendation TEXT,
            status TEXT DEFAULT 'open',
            created_at TEXT,
            FOREIGN KEY (scan_id) REFERENCES scans (id),
            FOREIGN KEY (target_id) REFERENCES targets (id)
        )
    ''')

    # 6. Scan Logs table (Persistent Mission Feed)
    c.execute('''
        CREATE TABLE IF NOT EXISTS scan_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT,
            agent TEXT,
            message TEXT,
            timestamp TEXT,
            FOREIGN KEY (scan_id) REFERENCES scans (id)
        )
    ''')

    # 7. Login History table (Identity Telemetry)
    c.execute('''
        CREATE TABLE IF NOT EXISTS logins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            ip_address TEXT,
            timestamp TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()

    # Seed Database if empty
    c.execute("SELECT COUNT(*) FROM organizations")
    if c.fetchone()[0] == 0:
        print("Seeding Initial Mock Organizations, Admin, and Targets...")
        now = datetime.now().isoformat()
        
        # Insert Organization
        c.execute("INSERT INTO organizations (name, domain, created_at) VALUES (?, ?, ?)", 
                  ("CorpNet Enterprise", "corpnet.io", now))
        org_id = c.lastrowid
        
        # Insert Admin
        c.execute('''
            INSERT INTO users (org_id, name, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (org_id, "Security Director", "sercuity_manager_admin@CropNet", hash_password("SmA$Entpswd"), "Admin", now))
        admin_id = c.lastrowid
        
        # Target A: Legacy Admin Portal
        c.execute('''
            INSERT INTO targets (org_id, name, url, environment, approval_status, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (org_id, "Legacy Admin Portal", "http://localhost:8080", "Legacy Infrastructure", "approved", admin_id, now))
        
        # Target B: Marketing Site
        c.execute('''
            INSERT INTO targets (org_id, name, url, environment, approval_status, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (org_id, "CorpNet Marketing", "http://localhost:8081", "Public Web", "approved", admin_id, now))

        # Target C: Employee Dashboard
        c.execute('''
            INSERT INTO targets (org_id, name, url, environment, approval_status, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (org_id, "Employee Talent Matrix", "http://localhost:8082", "Internal Apps", "approved", admin_id, now))
        
        conn.commit()

    conn.close()

if __name__ == "__main__":
    # If db exists, delete to force re-seed with new schema for the demo
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    init_db()
    print(f"Database {DB_FILE} initialized and seeded successfully.")
