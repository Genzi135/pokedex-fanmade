'use client';

import { motion } from 'framer-motion';

interface StatsBarProps {
  label: string;
  value: number;
  max?: number;
}

export function StatsBar({ label, value, max = 255 }: StatsBarProps) {
  // Calculate percentage of max value
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine color matching requirements
  // <50 = red, 50-80 = yellow, 80-100 = green, >100 = blue
  const getColor = (val: number) => {
    if (val < 50) return '#FF5959'; // Red
    if (val < 80) return '#FAE078'; // Yellow
    if (val <= 100) return '#A7DB8D'; // Green
    return '#9DB7F5'; // Blue
  };

  const barColor = getColor(value);

  return (
    <div className="flex items-center gap-4 py-2 font-mono">
      {/* Stat Name */}
      <span className="w-24 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </span>

      {/* Stat Value */}
      <span className="w-8 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">
        {value}
      </span>

      {/* Animated Track & Bar */}
      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-200/20 dark:border-slate-800/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1], delay: 0.05 }}
          className="h-full rounded-full"
          style={{
            backgroundColor: barColor,
            boxShadow: `0 0 6px ${barColor}50`,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label} stat`}
        />
      </div>
    </div>
  );
}

export default StatsBar;
