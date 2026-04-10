import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function RiskAccordion({ finding }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
      <div 
        className="p-24 cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-12">
            <div className="flex items-center gap-12">
              <SeverityBadge severity={finding.severity} />
              <span className="label-caps !text-[9px] opacity-40">{finding.category}</span>
            </div>
            <h4 className="text-[15px] font-bold text-text-primary">{finding.title}</h4>
            <p className="text-[13px] text-text-secondary leading-relaxed opacity-80">
              {finding.description}
            </p>
          </div>
          <div className="text-primary/40 group-hover:text-primary transition-colors">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-24 pb-24 flex flex-col gap-16 animate-in slide-in-from-top-1 duration-200">
          <div className="p-20 rounded-xl bg-black/40 border border-border flex flex-col gap-12">
            <div className="flex items-center gap-8 label-caps !text-[9px] text-primary">
               <ShieldAlert size={12} /> Discovery Evidence
            </div>
            <code className="text-[12px] font-mono text-primary/80 break-all bg-primary/5 p-12 rounded-lg border border-primary/10">
              {finding.evidence}
            </code>
          </div>

          <div className="p-20 rounded-xl bg-success/5 border border-success/20 flex flex-col gap-12">
            <div className="flex items-center gap-8 label-caps !text-[9px] text-success">
               <CheckCircle size={12} /> Priority Remediation
            </div>
            <p className="text-[12px] text-text-primary opacity-80 leading-relaxed">
              {finding.remediation || "Apply strictly enforced transport protocols and sanitize input clusters to eliminate the detected risk vector."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
