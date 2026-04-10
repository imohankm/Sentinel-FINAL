import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, AlertTriangle, Globe, Lock, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

export default function TargetCard({ target, onScan }) {
  const getRiskStatus = (score) => {
    if (score >= 70) return { label: 'CRITICAL', className: 'badge-critical', icon: ShieldAlert };
    if (score >= 40) return { label: 'WARNING', className: 'badge-warning', icon: AlertTriangle };
    if (score > 0) return { label: 'STABLE', className: 'badge-ready', icon: Shield };
    return { label: 'READY', className: 'badge-ready', icon: Globe };
  };

  const status = getRiskStatus(target.last_risk_score || 0);
  const StatusIcon = status.icon;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="card flex flex-col gap-24 group hover:bg-surface/60 transition-all duration-300"
    >
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 transition-colors duration-500 group-hover:bg-primary/10" />

      {/* Header Strip */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-8 mb-4">
            <span className={`badge ${status.className} flex items-center gap-4`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
            {target.environment && <span className="label-caps !text-[9px] opacity-40">{target.environment}</span>}
          </div>
          <h3 className="title-lg !text-xl group-hover:text-primary transition-colors truncate max-w-[220px]">
            {target.name}
          </h3>
          <div className="flex items-center gap-8 text-text-secondary">
             <Globe size={12} className="opacity-40" />
             <span className="text-[11px] font-mono truncate max-w-[180px] opacity-60 italic">{target.url}</span>
          </div>
        </div>
        <div className="w-48 h-48 rounded-2xl bg-surface border border-border flex items-center justify-center group-hover:border-primary/40 transition-all">
           <Activity size={20} className="text-primary group-hover:animate-pulse" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-16 relative z-10">
        <div className="p-16 rounded-2xl bg-background/40 border border-border-dim flex flex-col gap-4">
          <span className="label-caps !text-[8px] opacity-60">Exposure Index</span>
          <div className="flex items-end gap-4">
            <span className={`font-accent text-xl font-black ${target.last_risk_score >= 70 ? 'text-danger' : 'text-primary'}`}>
              {target.last_risk_score || 0}
            </span>
            <span className="text-[10px] opacity-40 mb-4 font-bold">%</span>
          </div>
        </div>
        <div className="p-16 rounded-2xl bg-background/40 border border-border-dim flex flex-col gap-4">
          <span className="label-caps !text-[8px] opacity-60">Status</span>
          <span className="text-xs font-bold text-text-primary flex items-center gap-4">
             <div className="w-6 h-6 rounded-full bg-success animate-pulse" /> 
             CONTINUOUS
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-16 pt-8 relative z-10">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-6 opacity-40">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Audit: {target.last_scan_time || 'Pending'}</span>
           </div>
        </div>
        <div className="flex gap-12">
            <button 
              onClick={() => onScan(target)}
              className="btn btn-primary flex-1 !py-14"
            >
              <Zap size={16} />
              RUN AUDIT
            </button>
            <button className="btn btn-outline p-14 h-48 w-48 border-border hover:border-primary">
               <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </motion.div>
  );
}
