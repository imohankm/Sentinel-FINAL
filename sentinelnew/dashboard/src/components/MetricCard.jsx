import React from 'react';

export default function MetricCard({ label, value, icon: Icon, color = 'text-primary' }) {
  return (
    <div className="card h-[110px] flex flex-col justify-between group hover:translate-y-[-4px]">
      <div className="flex justify-between items-center opacity-40">
        <span className="label-caps !text-[9px]">{label}</span>
        {Icon && <Icon size={14} className={color} />}
      </div>
      <div className="flex flex-col">
        <span className="font-accent text-3xl font-black text-white">{value}</span>
      </div>
    </div>
  );
}
