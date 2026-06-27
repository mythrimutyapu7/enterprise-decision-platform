import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'critical';
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  critical: 'bg-critical/10 text-critical',
};

const StatCard = ({ title, value, icon, accent = 'primary' }: StatCardProps) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-text">{value}</p>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
