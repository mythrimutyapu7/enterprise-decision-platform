import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiShield, FiTrendingUp } from 'react-icons/fi';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SkeletonCard from '../components/common/SkeletonCard';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    highSeverity: 0,
    openIncidents: 0,
    recentlyAnalyzed: 0,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStats({ totalIncidents: 112, highSeverity: 24, openIncidents: 39, recentlyAnalyzed: 15 });
      setIsLoading(false);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} />)
          : [
              { title: 'Total Incidents', value: stats.totalIncidents, icon: <FiAlertTriangle /> },
              { title: 'High Severity', value: stats.highSeverity, icon: <FiShield />, accent: 'critical' },
              { title: 'Open Incidents', value: stats.openIncidents, icon: <FiTrendingUp />, accent: 'warning' },
              { title: 'Recently Analyzed', value: stats.recentlyAnalyzed, icon: <FiCheckCircle />, accent: 'success' },
            ].map((stat) => (
              <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} accent={stat.accent as any} />
            ))}
      </div>

      <Card title="Operations Overview">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">Active cases</p>
            <p className="mt-4 text-5xl font-semibold text-text">39</p>
            <p className="mt-2 text-sm text-muted">Open incidents awaiting investigation.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">Response velocity</p>
            <p className="mt-4 text-5xl font-semibold text-text">4.2h</p>
            <p className="mt-2 text-sm text-muted">Average time from detection to triage.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
