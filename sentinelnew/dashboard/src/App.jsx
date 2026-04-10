import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Activity, Server, AlertTriangle, ArrowRight, Zap, Target, Globe, Filter, Search, Info, Eye, Layers, Cpu,
  Terminal as ConsoleIcon, Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

import './index.css';

// Premium Enterprise Components
import ExposureRing from './components/ExposureRing';
import TerminalPanel from './components/TerminalPanel';
import AssetCard from './components/AssetCard';
import MetricCard from './components/MetricCard';
import InsightCard from './components/InsightCard';
import SeverityBadge from './components/SeverityBadge';
import RiskAccordion from './components/RiskAccordion';
import AppSidebar from './components/AppSidebar';
import ArchiveTable from './components/ArchiveTable';
import ScanOverlay from './components/ScanOverlay';
import AttackFlow from './components/AttackFlow';
import AddTargetModal from './components/AddTargetModal';
import TopHeader from './components/TopHeader';

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAddTargetModalOpen, setIsAddTargetModalOpen] = useState(false);
  
  const [targets, setTargets] = useState([]);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [state, setState] = useState('idle');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showScanOverlay, setShowScanOverlay] = useState(false);
  const [logs, setLogs] = useState([]);
  const [vulns, setVulns] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [currentScanId, setCurrentScanId] = useState(null);
  
  const [loginHistory, setLoginHistory] = useState([]);
  const [activity, setActivity] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  
  const pollInterval = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sentinel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('home');
    }
  }, []);

  useEffect(() => {
    if (user) {
        if (view === 'home') fetchStats();
        if (view === 'targets') fetchTargets();
        if (view === 'history') fetchHistory();
    }
  }, [user, view]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/stats?org_id=${user.org_id}`);
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error("Stats Error:", e); }
  };

  const fetchTargets = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/targets?org_id=${user.org_id}`);
      const data = await res.json();
      setTargets(data);
    } catch (e) { console.error("Targets Error:", e); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/history?org_id=${user.org_id}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) { console.error("History Error:", e); }
  };

  const fetchLoginHistory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/user/logins?user_id=${user.id}`);
      if (!res.ok) throw new Error("Telemetry Feed Unavailable");
      const data = await res.json();
      setLoginHistory(Array.isArray(data) ? data : []);
    } catch (e) { 
        console.error("Login History Error:", e); 
        setLoginHistory([]);
    }
  };

  const fetchFullUser = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/user/me?user_id=${user.id}`);
      const data = await res.json();
      setFullUser(data);
    } catch (e) { console.error("Full User Error:", e); }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/user/activity?user_id=${user.id}`);
      const data = await res.json();
      setActivity(data);
    } catch (e) { console.error("Activity Error:", e); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('sentinel_user', JSON.stringify(data.user));
        setView('home');
      } else {
        alert("ACCESS_DENIED: Invalid Handshake");
      }
    } catch (e) {
      alert("CONNECTION_FAILURE: Sentinel API Offline");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const runAudit = async (target) => {
    setSelectedTarget(target);
    setShowScanOverlay(true);
    setLogs([]);
    setVulns([]);
    setRiskScore(0);
    
    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_id: target.id, url: target.url, org_id: user.org_id, user_id: user.id })
      });
      const data = await res.json();
      if (data.success) {
         setCurrentScanId(data.scan_id);
      }
    } catch (e) { console.error("Analysis Request Failed", e); }
  };

  const onScanAnimationComplete = () => {
    setShowScanOverlay(false);
    setView('report');
    if (currentScanId) {
        pollInterval.current = setInterval(() => pollReport(currentScanId), 1000);
    }
  };

  const pollReport = async (scanId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/report?scan_id=${scanId}`);
      const data = await res.json();
      
      setLogs(data.logs || []);
      setRiskScore(data.score || 0);
      setVulns(data.findings || []);
      setState(data.status || 'running');
      
      if (data.status === 'complete' || data.status === 'failed') {
        clearInterval(pollInterval.current);
      }
    } catch (e) { console.error("Poll Error:", e); }
  };

  const openReportFromArchive = (archiveItem) => {
    setSelectedTarget({ name: archiveItem.target_name, url: archiveItem.target_url });
    setView('report');
    setCurrentScanId(archiveItem.id);
    pollReport(archiveItem.id);
  };

  const logout = () => {
    localStorage.removeItem('sentinel_user');
    setUser(null);
    setView('login');
  };

  useEffect(() => {
    if (user && view === 'home') {
       fetchFullUser();
       fetchActivity();
    }
  }, [user, view]);

  // -------------------------------------------------------------------------
  // VIEW: LOGIN
  // -------------------------------------------------------------------------
  if (view === 'login') return (
    <div className="flex items-center justify-center min-h-screen bg-bg relative px-24 overflow-hidden">
      <div className="bg-cyber-grid" />
      <div className="scanline" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="card glass w-full max-w-[440px] shadow-2xl z-10 p-[64px] border-primary/20 relative"
      >
        <div className="absolute top-0 right-0 w-120 h-120 bg-primary/5 blur-[80px] rounded-full" />
        
        <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-90 h-90 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary mb-32 border border-primary/20 glow-primary">
                <Shield size={42} strokeWidth={1} />
            </div>
            
            <div className="mb-48">
               <h1 className="title-xl mb-4 tracking-tight">SentinelAI</h1>
               <p className="label-caps !text-[11px] opacity-60">Enterprise Security Monitoring Portal</p>
               <p className="text-[10px] text-primary/40 mt-8 font-bold uppercase tracking-[2px]">Authorized Access Only</p>
            </div>

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-24">
                <div className="flex flex-col items-start gap-8 group">
                    <span className="label-caps !text-[9px] opacity-40 ml-4 group-focus-within:opacity-100 transition-opacity">Corporate Identity</span>
                    <input 
                      name="email" 
                      className="input-field !bg-background/40 focus:!bg-background/60" 
                      placeholder="Corporate Email"
                      required 
                    />
                </div>
                <div className="flex flex-col items-start gap-8 group">
                    <span className="label-caps !text-[9px] opacity-40 ml-4 group-focus-within:opacity-100 transition-opacity">Security Key</span>
                    <input 
                      name="password" 
                      type="password" 
                      className="input-field !bg-background/40 focus:!bg-background/60" 
                      placeholder="Password"
                      required 
                    />
                </div>
                <button type="submit" className="btn btn-primary w-full !py-18 mt-12 pulse-primary group" disabled={isLoggingIn}>
                    <span className="flex items-center gap-12 font-bold tracking-wider">
                       {isLoggingIn ? "VALIDATING IDENTITY..." : "ESTABLISH SECURE UPLINK"}
                       <ArrowRight size={18} className="group-hover:translate-x-4 transition-transform" />
                    </span>
                </button>
            </form>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        background: "#050816",
        color: "#E5F0FF",
        overflow: "hidden"
      }}
    >
      <ScanOverlay show={showScanOverlay} onComplete={onScanAnimationComplete} />

      <aside
        style={{
          borderRight: "1px solid rgba(34,211,238,0.08)",
          background: "#06101F",
          height: "100vh",
          overflowY: "auto"
        }}
      >
        <AppSidebar 
          view={view} 
          setView={setView} 
          user={fullUser || user} 
          onLogout={logout}
        />
      </aside>

      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <TopHeader 
          user={fullUser || user}
          activity={activity}
          onOpenProfile={() => {
              fetchLoginHistory();
              fetchActivity();
          }}
          onLogout={logout}
        />

        <AddTargetModal 
          isOpen={isAddTargetModalOpen}
          onClose={() => setIsAddTargetModalOpen(false)}
          onAdd={fetchTargets}
          user={user}
        />

        <main
          style={{
            padding: "24px 28px 32px",
            flex: 1,
            overflowY: "auto"
          }}
        >
          <AnimatePresence mode="wait">
          {/* 1. MISSION OVERVIEW */}
          {view === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div className="card card-hero grid grid-cols-12 gap-64 items-center border-primary/10 overflow-visible relative">
                <div className="bg-cyber-grid !opacity-20" />
                <div className="col-span-4 flex justify-center relative">
                    <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
                    <ExposureRing score={stats?.risk_trend ? stats.risk_trend[stats.risk_trend.length-1] : 42} size="large" />
                </div>
                <div className="col-span-8 relative z-10">
                  <div className="flex items-center gap-16 mb-24">
                     <span className="badge badge-success flex items-center gap-8 py-6 px-12 glow-primary animate-pulse-soft">
                        <div className="w-8 h-8 rounded-full bg-success pulse-dot" /> 
                        Monitoring Live
                     </span>
                     <span className="badge badge-primary flex items-center gap-8 py-6 px-12 glow-primary">
                        🔐 Secure Uplink Active
                     </span>
                  </div>
                  <h1 className="title-xl !text-[48px] mb-16 tracking-tight leading-tight">SentinelAI <span className="text-primary/60">Live Security Operations</span></h1>
                  <p className="text-text-secondary text-[15px] leading-relaxed max-w-[620px] mb-40 opacity-80 font-medium">
                    Continuously monitoring approved enterprise targets in real time. 
                    Orchestrating autonomous security validation across internal cluster nodes.
                  </p>
                  
                  <div className="flex gap-20">
                    <button onClick={() => setView('targets')} className="btn btn-primary !px-32 !py-16 group">
                       <span className="flex items-center gap-12 text-sm font-bold">
                          VIEW TARGET FLEET <ArrowRight size={18} className="group-hover:translate-x-4 transition-transform" />
                       </span>
                    </button>
                    <button onClick={() => setView('history')} className="btn btn-outline !px-32 !py-16 text-sm font-bold">
                      REVIEW ARCHIVES
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-24">
                <MetricCard 
                    label="Approved Targets" 
                    value={stats?.total_targets || 3} 
                    icon={Server} 
                    color="text-primary" 
                />
                <MetricCard 
                    label="Audits Today" 
                    value={stats?.total_scans || 12} 
                    icon={Activity} 
                    color="text-secondary" 
                />
                <MetricCard 
                    label="Open Findings" 
                    value={12} 
                    icon={AlertTriangle} 
                    color="text-danger" 
                />
                <MetricCard 
                    label="Fleet Health" 
                    value="94%" 
                    icon={Shield} 
                    color="text-success" 
                />
              </div>

              <div className="grid grid-cols-12 gap-24 h-[360px]">
                <div className="col-span-8 card flex flex-col">
                    <div className="flex justify-between items-center mb-32">
                        <div className="flex flex-col gap-4">
                           <h3 className="title-md !text-[14px]">Risk Exposure Trend</h3>
                           <span className="label-caps !text-[8px] opacity-40 uppercase">Telemetry window: Last 24 hours</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.risk_trend?.map((v, i) => ({ n: i, v })) || [] }>
                          <defs>
                            <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area 
                            type="monotone" 
                            dataKey="v" 
                            stroke="#22D3EE" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#valGrad)" 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. TARGETS FLEET */}
          {view === 'targets' && (
            <motion.div 
               key="targets" 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
               <div className="grid grid-cols-3 gap-24">
                  {targets.map(t => (
                    <AssetCard key={t.id} target={t} onAudit={() => runAudit(t)} />
                  ))}
               </div>
            </motion.div>
          )}

          {/* 3. OPERATIONS */}
          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <ArchiveTable data={history} onOpen={openReportFromArchive} />
            </motion.div>
          )}

          {/* 4. SECURITY REPORT */}
          {view === 'report' && (
            <motion.div 
               key="report" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
               <div className="flex flex-col gap-32">
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col gap-12">
                        <button onClick={() => setView('targets')} className="flex items-center gap-8 text-[10px] font-bold text-primary hover:opacity-100 opacity-60 transition-opacity">
                           <ArrowRight size={14} className="rotate-180" /> BACK TO INVENTORY
                        </button>
                        <h2 className="title-lg !text-[32px]">{selectedTarget?.name}</h2>
                     </div>
                  </div>

                  <div className="grid grid-cols-12 gap-32">
                     <div className="col-span-4 flex flex-col gap-32">
                        <div className="card flex flex-col items-center py-48 gap-24 bg-surface/40">
                           <ExposureRing score={riskScore} size="large" />
                        </div>
                        
                        <div className="flex flex-col gap-12">
                           {vulns.map((v, i) => (
                             <RiskAccordion key={i} vuln={v} />
                           ))}
                        </div>
                     </div>

                     <div className="col-span-8 flex flex-col gap-32">
                        <div className="card h-[400px] !p-0 flex flex-col overflow-hidden border-primary/10">
                           <div className="flex-1 relative">
                              <AttackFlow vulns={vulns} />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex flex-col h-[300px] card glass !p-0 border-primary/20 overflow-hidden relative">
                  <div className="h-full">
                     <TerminalPanel logs={logs} />
                  </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
