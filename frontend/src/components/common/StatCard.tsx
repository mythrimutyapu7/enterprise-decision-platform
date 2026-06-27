import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'critical';
  trend?: number[];
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'from-[#4f8cff] to-[#7c5cff] text-white shadow-[0_22px_70px_rgba(79,140,255,0.28)]',
  success: 'from-[#22c55e] to-[#4ade80] text-white shadow-[0_22px_70px_rgba(34,197,94,0.18)]',
  warning: 'from-[#f59e0b] to-[#f97316] text-white shadow-[0_22px_70px_rgba(245,158,11,0.18)]',
  critical: 'from-[#ef4444] to-[#f97316] text-white shadow-[0_22px_70px_rgba(239,68,68,0.2)]',
};

const progressClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'from-[#4f8cff] to-[#7c5cff]',
  success: 'from-[#22c55e] to-[#86efac]',
  warning: 'from-[#f59e0b] to-[#f97316]',
  critical: 'from-[#ef4444] to-[#f59e0b]',
};

const StatCard = ({ title, value, icon, accent = 'primary', trend = [] }: StatCardProps) => {
  const bars = trend.length > 0 ? trend : [0];
  const maxValue = Math.max(...bars, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-card group overflow-hidden p-6"
    >
      <div className="absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-[#4f8cff]/10 blur-3xl transition duration-300 group-hover:bg-[#7c5cff]/16" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="mt-4 text-[42px] font-bold leading-none text-white">{value}</p>
          <p className="mt-3 text-sm text-slate-400">Real-time operational signal</p>
        </div>
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClasses[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-6 flex h-10 items-end gap-1.5">
        {bars.map((count, index) => (
          <span
            key={index}
            className={`flex-1 rounded-full bg-gradient-to-t ${progressClasses[accent]}`}
            style={{ height: `${Math.max((count / maxValue) * 100, count > 0 ? 18 : 8)}%`, opacity: count > 0 ? 0.88 : 0.28 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default StatCard;
