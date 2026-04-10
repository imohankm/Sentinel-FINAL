import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Cpu, Activity, Zap, Network, Lock, Crosshair } from 'lucide-react';

const PHASES = [
  { id: 'recon', name: 'Neural Reconnaissance', icon: Network, color: '#00F5FF' },
  { id: 'headers', name: 'Protocol Header Analysis', icon: Shield, color: '#7B61FF' },
  { id: 'auth', name: 'Authentication stress-test', icon: Lock, color: '#FFD600' },
  { id: 'sim', name: 'Breach Path Simulation', icon: Zap, color: '#FF3B3B' },
  { id: 'risk', name: 'Risk exposure Scoring', icon: Crosshair, color: '#00FF9C' }
];

export default function ScanOverlay({ show, onComplete }) {
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    if (show) {
      const interval = setInterval(() => {
        setCurrentPhase(prev => {
          if (prev < PHASES.length - 1) return prev + 1;
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return prev;
        });
      }, 700); // 0.7s per step for snappy AI feel
      return () => clearInterval(interval);
    } else {
      setCurrentPhase(0);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="scan-overlay glass-heavy">
      <div className="bg-grid" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-48 relative z-10 max-w-4xl"
      >
        <div className="flex flex-col items-center gap-16 text-center">
          <div className="relative">
             <Activity size={80} className="text-cyber-cyan glow-primary animate-pulse" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Cpu size={32} className="text-cyber-cyan opacity-50" />
             </div>
          </div>
          <div>
            <h2 className="text-cyber text-4xl font-black tracking-tighter text-gradient mb-8">AI AGENT DEPLOYED</h2>
            <div className="text-gray-dim text-xs font-mono tracking-[4px] uppercase">Orchestrating autonomous breach simulation</div>
          </div>
        </div>

        <div className="flex gap-16 w-full justify-center">
          {PHASES.map((phase, idx) => {
            const Icon = phase.icon;
            const isDone = idx < currentPhase;
            const isActive = idx === currentPhase;

            return (
              <motion.div 
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col items-center gap-16 p-24 glass flex-1 min-w-[160px] transition-all relative ${isActive ? 'border-cyber-cyan shadow-xl scale-110 bg-cyber-cyan/5' : 'opacity-30'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-glow" 
                    className="absolute inset-0 border border-cyber-cyan rounded-[20px] shadow-[0_0_20px_rgba(0,245,255,0.3)]"
                  />
                )}
                <div style={{ color: phase.color }}>
                  <Icon size={28} className={isActive ? 'animate-bounce' : ''} />
                </div>
                <div className="text-[10px] text-center font-black text-white uppercase tracking-wider">{phase.name}</div>
                
                <div className="h-2 w-full bg-white/5 rounded-full mt-8 overflow-hidden">
                   {isDone && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-cyber-green" />}
                   {isActive && <motion.div animate={{ x: [-20, 160] }} transition={{ duration: 1, repeat: Infinity }} className="h-full w-20 bg-cyber-cyan blur-sm" />}
                </div>

                {isDone && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-8 -right-8 bg-cyber-green text-black text-[8px] font-black px-6 py-2 rounded-full shadow-lg">DONE</motion.div>}
              </motion.div>
            );
          })}
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-12">
            <div className="flex justify-between text-[10px] font-mono text-text-dim uppercase font-bold">
               <span>Agent Progress</span>
               <span className="text-cyber-cyan">{Math.round((currentPhase / (PHASES.length - 1)) * 100)}%</span>
            </div>
            <div className="h-6 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-cyan"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentPhase / (PHASES.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
                style={{ 
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
                  backgroundSize: '200% 100%'
                }}
              />
            </div>
        </div>
      </motion.div>
    </div>
  );
}
