import React from 'react';
import { Database, Clock, Server, ArrowRight } from 'lucide-react';

export default function ArchiveTable({ history, onOpenReport }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-64 text-center opacity-20 label-caps border border-dashed border-white/5 rounded-2xl">
        Archives are currently empty
      </div>
    );
  }

  const getScoreBadge = (score) => {
    if (score >= 70) return 'badge-danger';
    if (score >= 35) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div className="card !p-0 overflow-hidden border-white/5 bg-surface/30">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/5">
            <th className="p-24 label-caps !text-[9px] w-[30%]">Timestamp</th>
            <th className="p-24 label-caps !text-[9px] w-[30%]">Target Cluster</th>
            <th className="p-24 label-caps !text-[9px] text-center w-[20%]">Score Index</th>
            <th className="p-24 label-caps !text-[9px] text-right w-[20%]">Operation Logs</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {history.map((h, i) => (
            <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
              <td className="p-24">
                <div className="flex items-center gap-8 text-[12px] font-mono text-text-secondary">
                  <Clock size={12} className="opacity-40" />
                  {new Date(h.created_at).toLocaleString()}
                </div>
              </td>
              <td className="p-24">
                <div className="flex items-center gap-12">
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Server size={14} className="text-primary" />
                   </div>
                   <span className="text-sm font-bold text-text-primary">{h.target_name}</span>
                </div>
              </td>
              <td className="p-24 text-center">
                <span className={`badge ${getScoreBadge(h.risk_score)}`}>
                  {h.risk_score}% EXPOSURE
                </span>
              </td>
              <td className="p-24 text-right">
                <button 
                  onClick={() => onOpenReport(h)}
                  className="btn btn-outline !py-8 !px-16 !text-[10px] hover:glow-primary"
                >
                  RECOVER_TELEMETRY <ArrowRight size={12} className="ml-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
