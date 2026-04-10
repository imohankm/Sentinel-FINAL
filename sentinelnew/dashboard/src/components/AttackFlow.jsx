import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, ChevronDown, Shield, ShieldAlert } from 'lucide-react';

export default function AttackFlow({ paths }) {
  if (!paths || paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-16 text-text-secondary h-full opacity-30">
        <Shield size={32} />
        <span className="label-caps">No Active Breach Vectors</span>
      </div>
    );
  }

  // If paths is a list of strings, we treat them as sequential nodes in the breach chain
  const nodes = paths;

  return (
    <div className="flex flex-col items-center gap-12 py-16 h-full overflow-y-auto pr-8">
      {nodes.map((node, idx) => (
        <React.Fragment key={idx}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`w-full p-16 rounded-xl border border-border relative overflow-hidden group hover:border-primary/40 transition-colors ${idx === nodes.length - 1 ? 'bg-danger/5 border-danger/30' : 'bg-surface/40'}`}
          >
            {/* Index Pin */}
            <div className="absolute top-0 right-0 p-8 opacity-10 font-bold text-[10px] tracking-widest">{idx + 1}</div>
            
            <div className="flex items-center gap-12">
               <div className={`w-32 h-32 rounded-lg flex items-center justify-center ${idx === nodes.length - 1 ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                  {idx === nodes.length - 1 ? <ShieldAlert size={16} /> : <Zap size={16} />}
               </div>
               <div className="flex flex-col text-left">
                  <span className="label-caps !text-[8px] opacity-40">Chain Node</span>
                  <span className={`text-[11px] font-bold truncate max-w-[160px] ${idx === nodes.length - 1 ? 'text-danger' : 'text-text-primary'}`}>
                    {node}
                  </span>
               </div>
            </div>

            {idx === nodes.length - 1 && (
              <div className="absolute top-0 left-0 w-2 h-full bg-danger" />
            )}
          </motion.div>

          {idx < nodes.length - 1 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 16 }}
              className="flex items-center justify-center"
            >
              <ChevronDown size={14} className="text-border-dim opacity-30" />
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
