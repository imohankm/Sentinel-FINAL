import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, AlertTriangle, Globe, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

export default function AssetCard({ target, onAudit, onOpenReport }) {
  const getRiskStatus = (score) => {
    if (score >= 70) return { label: 'CRITICAL', className: 'badge-danger', icon: ShieldAlert };
    if (score >= 40) return { label: 'RISK_ELEVATED', className: 'badge-warning', icon: AlertTriangle };
    if (score > 0) return { label: 'STABLE_MONITORING', className: 'badge-success', icon: Shield };
    return { label: 'PROVISIONED', className: 'badge-primary', icon: Globe };
  };

  const status = getRiskStatus(target.last_risk_score || 0);
  const StatusIcon = status.icon;

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="card flex flex-col gap-24 group hover:bg-surface/60 transition-all duration-300"
    >
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[60px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors" />

      {/* TOP ROW */}
      <div className="flex justify-between items-center relative z-10">
        <span className={`badge ${status.className} flex items-center gap-6`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
        <span className="label-caps !text-[9px] opacity-40 bg-white/5 px-8 py-2 rounded-full border border-white/5">
            {target.environment || 'INTERNAL_DEMO_LAB'}
        </span>
      </div>

      {/* TITLE BLOCK */}
      <div className="flex flex-col gap-4 relative z-10">
        <h3 className="title-md group-hover:text-primary transition-colors truncate">
          {target.name}
        </h3>
        <div className="flex items-center gap-8 text-text-secondary opacity-60">
           <Globe size={12} />
           <span className="text-[11px] font-mono truncate italic">{target.url}</span>
        </div>
      </div>

      {/* MIDDLE META */}
      <div className="grid grid-cols-2 gap-12 relative z-10">
        <div className="p-16 rounded-xl bg-background/40 border border-white/5 flex flex-col gap-4">
          <span className="label-caps !text-[8px] opacity-60">Exposure Index</span>
          <div className="flex items-end gap-4">
            <span className={`font-accent text-xl font-black ${target.last_risk_score >= 70 ? 'text-danger' : 'text-primary'}`}>
              {target.last_risk_score || 0}
            </span>
            <span className="text-[10px] opacity-40 mb-4 font-bold">%</span>
          </div>
        </div>
        <div className="p-16 rounded-xl bg-background/40 border border-white/5 flex flex-col gap-4">
          <span className="label-caps !text-[8px] opacity-60">Current Status</span>
          <span className="text-xs font-bold text-text-primary flex items-center gap-6">
             <div className="w-6 h-6 rounded-full bg-success pulse-dot" /> 
             CONTINUOUS
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8 text-text-secondary opacity-40 relative z-10">
         <Clock size={12} />
         <span className="text-[10px] font-bold uppercase tracking-wider">Last Sync: {target.last_scan_time || 'Pending'}</span>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="flex gap-12 relative z-10">
        <button 
          onClick={() => onAudit && onAudit(target)}
          className="btn btn-primary flex-1 !py-12"
        >
          <Zap size={16} />
          RUN AUDIT
        </button>
        <button 
          onClick={() => onOpenReport(target)}
          className="btn btn-outline p-12 h-44 w-44 border-white/10 hover:border-primary"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
