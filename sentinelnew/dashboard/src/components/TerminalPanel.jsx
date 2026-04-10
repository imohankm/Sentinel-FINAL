import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TerminalPanel({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentColor = (agent) => {
    const map = {
      'recon': '#22D3EE',    // primary
      'strategy': '#7C3AED', // secondary
      'exploit': '#FF4D6D',  // danger
      'auth': '#FACC15',     // warning
      'risk': '#22C55E'      // success
    };
    return map[agent] || '#94A3B8';
  };

  return (
    <div className="terminal-block h-full flex flex-col overflow-hidden group">
      {/* Scanline Effect */}
      <div className="scanline" />
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8 opacity-60">
        <div className="flex items-center gap-8">
          <div className="w-6 h-6 rounded-full bg-primary animate-pulse" />
          <span className="label-caps !text-[9px]">Neural Link: Active Telemetry</span>
        </div>
        <div className="flex gap-4">
          <div className="w-8 h-2 bg-primary/20 rounded-full" />
          <div className="w-16 h-2 bg-primary/40 rounded-full" />
        </div>
      </div>

      {/* Logs Scroll Area */}
      <div 
        className="flex-1 overflow-y-auto pr-8 scrollbar-thin scrollbar-thumb-primary/10" 
        ref={containerRef}
      >
        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-12 font-mono text-[11px] leading-relaxed"
              >
                <span className="text-text-secondary opacity-30 shrink-0">
                  {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span 
                  style={{ color: getAgentColor(log.agent?.replace('agent-', '')) }} 
                  className="font-bold uppercase tracking-wider shrink-0 min-w-[70px]"
                >
                  [{log.agent?.replace('agent-', '')}]
                </span>
                <span className="text-text-secondary opacity-40">»</span>
                <span className="text-text-primary break-all">
                  {log.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Blinking Cursor */}
          <div className="flex items-center gap-4 mt-8">
            <span className="text-primary font-bold">{'>'}</span>
            <div className="cursor-blink" />
          </div>
        </div>
      </div>

      {/* Ambient background glow */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 blur-[40px] pointer-events-none" />
    </div>
  );
}
