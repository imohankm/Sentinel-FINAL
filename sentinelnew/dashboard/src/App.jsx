import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, ShieldAlert, Cpu, Network, User, Search, Zap, AlertTriangle, CheckCircle, Target, Database, Activity, Lock, Unlock, ArrowRight, ChevronDown, ChevronUp, Server, LayoutGrid } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

const AI_AGENTS = [
  { id: 'agent-recon', name: 'Recon Agent', color: '#00F5FF', icon: Search },
  { id: 'agent-strategy', name: 'Logic Engine', color: '#7C3AED', icon: Cpu },
  { id: 'agent-exploit', name: 'Exploit Sim', color: '#FF3B3B', icon: Zap }
];

const ATTACK_LOGS = [
  { agent: 'agent-strategy', text: 'Initializing target analysis on localhost:8080...', delay: 500 },
  { agent: 'agent-recon', text: 'Scanning exposed endpoints. 3 vulnerabilities identified.', delay: 1500 },
  { agent: 'agent-recon', text: 'Admin login form located. No CAPTCHA detected.', delay: 2800 },
  { agent: 'agent-strategy', text: 'Insecure HTTP detected. Flagging network interception risk.', delay: 4000 },
  { agent: 'agent-exploit', text: 'Simulating brute force... High probability of success.', delay: 5500 },
  { agent: 'agent-recon', text: 'Found exposed internal API refs in frontend scripts.', delay: 7000 },
  { agent: 'agent-strategy', text: 'Systemic risk calculated at 90%. Synthesis complete.', delay: 8500 }
];

const vulns = [
  { level: 'CRITICAL', color: '#FF3B3B', title: 'Brute Force Risk', desc: 'No rate-limiting or CAPTCHA detected on primary login interface.', impact: 'High probability of account takeover via automated credential stuffing.', fix: 'Implement strict rate limiting and integrate Google reCAPTCHA v3.' },
  { level: 'HIGH', color: '#FF8A00', title: 'Insecure Network Transmission', desc: 'HTTP protocol in use. Sensitive data transmitted in plaintext.', impact: 'Session hijacking targeting local networks.', fix: 'Enforce HTTPS globally using TLS 1.2+ configuration.' }
];

const vulnChart = [{ name: 'Critical', count: 1, color: '#FF3B3B' }, { name: 'High', count: 1, color: '#FF8A00' }, { name: 'Medium', count: 1, color: '#FFD600' }];
const atkData = [{ name: 'Brute Force', successRate: 95 }, { name: 'Misconfig', successRate: 80 }, { name: 'API Exfil', successRate: 65 }];
const breakdown = [{ name: 'Auth Security', score: 20 }, { name: 'Network', score: 40 }, { name: 'API', score: 30 }];

export default function App() {
  const [targetUrl, setTargetUrl] = useState('http://localhost:8080');
  const [state, setState] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [showCharts, setShowCharts] = useState(false);
  const [expanded, setExpanded] = useState({});
  const logsRef = useRef(null);

  useEffect(() => { logsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const start = () => {
    if (!targetUrl) return;
    setState('scanning'); setLogs([]); setShowCharts(false);
    ATTACK_LOGS.forEach((log, i) => {
      setTimeout(() => {
        setLogs(p => [...p, { ...log, id: Math.random() }]);
        if (i === ATTACK_LOGS.length - 1) setTimeout(() => { setState('complete'); setShowCharts(true); }, 1000);
      }, log.delay);
    });
  };

  return (
    <div className="app-container">
      <div className="bg-particles" />
      {state === 'scanning' && <div className="scanner-line"></div>}

      {/* SIDEBAR: 280px width */}
      <aside className="sidebar glass-panel">
        <div className="logo-section">
          <ShieldAlert size={32} color="#00F5FF" className="glow-icon" />
          <h1 className="text-gradient-cyan logo-text">SentinelAI</h1>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Target Config</div>
          <input className="input-field glow-input" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} disabled={state === 'scanning'} placeholder="Enter target URL..." />
          <button className="cyber-btn run-scan-btn w-full mt-16" onClick={start} disabled={state === 'scanning' || !targetUrl}>
            {state === 'scanning' ? <><Activity className="spin text-cyan" size={16}/> SCANNING</> : 'RUN AI SCAN'}
          </button>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Status</div>
          <div className="status-box glass-panel inner">
            {state === 'idle' && <><div className="dot idle"/> Idle</>}
            {state === 'scanning' && <><Activity className="spin text-cyan" size={16}/> <span className="text-cyan glow-text font-bold">Scanning Target</span></>}
            {state === 'complete' && <><CheckCircle size={16} color="#00FF9D"/> <span className="text-green glow-text font-bold">Scan Complete</span></>}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title">AI Agents</div>
          <div className="agents-list">
            {AI_AGENTS.map(ag => {
              const Icon = ag.icon;
              const isRun = state === 'scanning' && logs.some(l => l.agent === ag.id);
              const color = isRun ? ag.color : (state === 'complete' ? '#00FF9D' : '#555');
              return (
                <div key={ag.id} className="agent-item glass-panel inner">
                  <div className={`dot ${isRun ? 'pulse' : ''}`} style={{background: color}}/>
                  <Icon size={14} color={ag.color} />
                  <span className="agent-name">{ag.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="risk-score-wrapper mt-auto">
          <div className="section-title text-center">System Risk Level</div>
          <div className={`hero-score ${state === 'complete' ? 'danger' : ''}`}>
            <span className="score-text">{state === 'complete' ? '90' : '--'}<span>%</span></span>
          </div>
          
          {/* Security Breakdown Bars */}
          <div className={`breakdown-list ${state === 'complete' ? 'fade-in' : 'hidden'}`}>
             {breakdown.map((b, i) => (
                <div key={i} className="breakdown-item">
                  <div className="bd-header"><span>{b.name}</span> <span className="text-red">{b.score}%</span></div>
                  <div className="bd-bar"><div className="bd-fill bg-red" style={{width: `${b.score}%`}}/></div>
                </div>
             ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT: flex-1 */}
      <main className="main-content">
        {state === 'idle' ? (
          <div className="empty-state glass-panel">
            <Target size={64} className="text-gray-dim" />
            <h2>AWAITING TARGET</h2>
            <p>Enter a URL and run an AI scan to analyze target surface.</p>
          </div>
        ) : state === 'scanning' && !showCharts ? (
          <div className="loading-state">
            <Activity className="spin-slow text-cyan icon-lg mb-24" size={64} />
            <h2 className="text-gradient-cyan pulse-opacity">AI AGENTS ANALYZING...</h2>
            <div className="loading-timeline mt-24">
               {['Recon', 'Detection', 'Exploit', 'Risk'].map((step, i) => (
                 <div key={i} className="time-node delay-1 text-cyan">{step}</div>
               ))}
            </div>
          </div>
        ) : (
          <div className="dashboard-wrapper">
            
            {/* TARGET SUMMARY BANNER */}
            <div className="target-summary glass-panel animate-fade-up">
              <div className="sum-item"><Server className="text-cyan"/><div className="val">{targetUrl}</div></div>
              <div className="sum-divider" />
              <div className="sum-item"><Network className="text-purple"/><div className="val">3 Open Ports</div></div>
              <div className="sum-divider" />
              <div className="sum-item"><LayoutGrid className="text-orange"/><div className="val">12 Endpoints</div></div>
              <div className="sum-divider" />
              <div className="sum-item"><AlertTriangle className="text-red"/><div className="val text-red">HIGH RISK</div></div>
            </div>

            <div className="dashboard-grid">
              {/* ROW 1: 50% / 50% */}
              <div className="row grid-2">
                <div className="card glass-panel animate-fade-up delay-1">
                  <div className="card-header"><PieChart size={18} className="text-cyan"/> <h3>Risk Overview</h3></div>
                  <div className="card-body">
                    <ResponsiveContainer><PieChart><Pie data={vulnChart} innerRadius={80} outerRadius={100} dataKey="count" stroke="none">{vulnChart.map((e, i) => <Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
                    <div className="chart-center-text">3</div>
                  </div>
                </div>

                <div className="card glass-panel animate-fade-up delay-2">
                  <div className="card-header"><Zap size={18} className="text-purple"/> <h3>Attack Vector Strength</h3></div>
                  <div className="card-body pl-8">
                    <ResponsiveContainer><BarChart data={atkData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{fill: '#e5e7eb'}} /><Bar dataKey="successRate" fill="#7C3AED" radius={[0,6,6,0]} barSize={24} /></BarChart></ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* ROW 2: 65% / 35% */}
              <div className="row grid-auto-sidebar">
                <div className="card glass-panel animate-fade-up delay-3 list-wrapper h-full">
                  <div className="card-header"><AlertTriangle size={18} className="text-orange"/> <h3>Vulnerability Intelligence</h3></div>
                  <div className="card-body scroll-y">
                    {vulns.map((v, i) => (
                      <div key={i} className={`vuln-item br-${v.level}`} onClick={() => setExpanded(p=>({...p, [i]:!p[i]}))}>
                        <div className="vuln-header-bar">
                          <span className={`badge bg-${v.level}`}>{v.level}</span>
                          <h4>{v.title}</h4>
                          {expanded[i] ? <ChevronUp size={16} className="text-gray"/> : <ChevronDown size={16} className="text-gray"/>}
                        </div>
                        <p className="vuln-desc">{v.desc}</p>
                        {expanded[i] && (
                          <div className="vuln-drop">
                            <div className="vd-sec"><span className="label">Impact</span><p>{v.impact}</p></div>
                            <div className="vd-sec"><span className="label fix text-green">Remediation</span><p className="text-green glow-text-sm">{v.fix}</p></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card glass-panel animate-fade-up delay-4 h-full">
                  <div className="card-header"><Target size={18} className="text-red"/> <h3>Predicted Attack Flow</h3></div>
                  <div className="card-body flex-col justify-center gap-16 py-16">
                    <div className="path-node bg-dim"><User size={16} className="text-cyan"/> Target Entry <ArrowRight className="path-arrow"/></div>
                    <div className="path-node bg-dim"><Unlock size={16} className="text-purple"/> Login Endpoint <ArrowRight className="path-arrow"/></div>
                    <div className="path-node border-red danger-glow"><Zap size={16} className="text-red"/> Brute Force Attack <ArrowRight className="path-arrow text-red animate-bounce-down"/></div>
                    <div className="path-node bg-dim"><Database size={16} className="text-orange"/> Admin Overwrite</div>
                  </div>
                </div>
              </div>

              {/* ROW 3: 65% / 35% */}
              <div className="row grid-auto-sidebar">
                 <div className="card glass-panel animate-fade-up delay-5 terminal p-0 h-full">
                   <div className="term-header"><Terminal size={14} className="text-cyan"/> <span>SYSTEM.LOGS</span></div>
                   <div className="term-body">
                     {logs.map((l, i) => (
                        <div key={i} className="log-line fade-log"><span style={{color: AI_AGENTS.find(a=>a.id===l.agent)?.color}}>[{l.agent.replace('agent-','').toUpperCase()}]</span> <span>{l.text}</span></div>
                      ))}
                      {state === 'scanning' && <div className="log-line text-cyan typing-cursor">_</div>}
                      <div ref={logsRef} />
                   </div>
                 </div>

                 <div className="card glass-panel animate-fade-up delay-6 ai-panel h-full overflow-hidden">
                    <div className="ai-glow-bg"></div>
                    <div className="card-header border-none mb-0"><Shield size={18} className="text-cyan"/> <h3 className="text-cyan drop-shadow-cyan">AI Synthesis</h3></div>
                    <div className="card-body">
                      <p className="ai-text">
                        Enforce <b className="text-cyan">Rate Limiting</b> immediately to block brute-force viability. Apply <b className="text-purple">HTTPS</b> to strictly restrict session token interception across local network taps.
                      </p>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
