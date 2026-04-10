import React from 'react';
import { Layers } from 'lucide-react';

export default function InsightCard({ title, content, confidence }) {
  return (
    <div className="card flex flex-col relative overflow-hidden bg-surface/50 h-[360px]">
      <div className="absolute top-0 right-0 p-24 opacity-10">
        <Layers size={140} className="text-primary" />
      </div>
      <h3 className="label-caps mb-24 flex items-center gap-8">
        AI Synthesis Insight
      </h3>
      <div className="bg-secondary/5 border border-secondary/20 p-20 rounded-2xl flex-1 relative z-10 flex flex-col justify-center">
        <p className="text-[14px] text-text-primary italic leading-relaxed opacity-80">
          "{content}"
        </p>
      </div>
      <div className="mt-24 pt-24 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="w-8 h-8 rounded-full bg-success pulse-dot" />
          <span className="label-caps !text-[8px] opacity-40">Intelligence Synced</span>
        </div>
        {confidence && (
          <span className="label-caps !text-[8px] text-primary/60">Confidence: {confidence}%</span>
        )}
      </div>
    </div>
  );
}
