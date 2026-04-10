import React from 'react';
import { motion } from 'framer-motion';

export default function ExposureRing({ score, size = 'normal' }) {
  const isLarge = size === 'large';
  const radius = isLarge ? 120 : 80;
  const strokeWidth = isLarge ? 12 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s < 30) return '#22C55E'; // success
    if (s < 70) return '#FACC15'; // warning
    return '#FF4D6D'; // danger
  };

  const svgSize = isLarge ? 300 : 200;

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: svgSize, height: svgSize }}
    >
      {/* Background Glow */}
      {isLarge && (
        <div 
          className="absolute inset-0 blur-[60px] opacity-10 rounded-full transition-colors duration-1000"
          style={{ backgroundColor: getColor(score) }}
        />
      )}

      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="relative z-10">
        {/* Track */}
        <circle
          cx={svgSize/2}
          cy={svgSize/2}
          r={radius}
          stroke="rgba(34, 211, 238, 0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress */}
        <motion.circle
          cx={svgSize/2}
          cy={svgSize/2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          style={{ 
            filter: `drop-shadow(0 0 ${isLarge ? '12px' : '6px'} ${getColor(score)}80)`,
            transformOrigin: '50% 50%',
            transform: 'rotate(-90deg)'
          }}
        />

        {/* Inner Subtle Ring */}
        <circle
          cx={svgSize/2}
          cy={svgSize/2}
          r={radius - 15}
          stroke="rgba(34, 211, 238, 0.02)"
          strokeWidth="1"
          fill="transparent"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`font-accent font-black tracking-tighter ${isLarge ? 'text-6xl' : 'text-3xl'}`}
          style={{ color: getColor(score) }}
        >
          {Math.round(score)}<span className="text-[0.4em] opacity-60 ml-2">%</span>
        </motion.span>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-[10px] font-bold uppercase tracking-[2px] mt-4 opacity-40"
        >
          Exposure Level
        </motion.span>
      </div>
    </div>
  );
}
