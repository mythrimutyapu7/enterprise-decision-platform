import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiArrowRight, FiCheckCircle, FiClock, FiShield, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { fetchIncidents } from '../services/incidentService';
import { IncidentSummary } from '../types/incident';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (_err) {
        setError('Unable to load dashboard data from incidents.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const dashboard = useMemo(() => {
    const now = Date.now();
    const recentCutoff = now - 7 * 24 * 60 * 60 * 1000;
    const totalIncidents = incidents.length;
    const highSeverity = incidents.filter((incident) => incident.severity === 'high' || incident.severity === 'critical').length;
    const openIncidents = incidents.filter((incident) => incident.status === 'open' || incident.status === 'in_progress').length;
    const recentIncidents = incidents.filter((incident) => new Date(incident.createdAt).getTime() >= recentCutoff).length;
    const statusCounts = ['open', 'in_progress', 'resolved', 'closed'].map((status) => incidents.filter((incident) => incident.status === status).length);
    const severityCounts = ['low', 'medium', 'high', 'critical'].map((severity) => incidents.filter((incident) => incident.severity === severity).length);
    const dailyCounts = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now - (6 - index) * 24 * 60 * 60 * 1000);
      return incidents.filter((incident) => new Date(incident.createdAt).toDateString() === day.toDateString()).length;
    });

    return {
      totalIncidents,
      highSeverity,
      openIncidents,
      recentIncidents,
      statusCounts,
      severityCounts,
      dailyCounts,
      activeRatio: totalIncidents ? Math.round((openIncidents / totalIncidents) * 100) : 0,
    };
  }, [incidents]);

  const recentCases = useMemo(() => {
    return [...incidents]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 5);
  }, [incidents]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="space-y-8">
      {error && <div className="glass-card border-critical/20 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} />)
          : [
              { title: 'Total Incidents', value: dashboard.totalIncidents, icon: <FiAlertTriangle />, trend: dashboard.dailyCounts },
              { title: 'High Severity', value: dashboard.highSeverity, icon: <FiShield />, accent: 'critical', trend: dashboard.severityCounts },
              { title: 'Open Incidents', value: dashboard.openIncidents, icon: <FiTrendingUp />, accent: 'warning', trend: dashboard.statusCounts },
              { title: 'Recent Incidents', value: dashboard.recentIncidents, icon: <FiCheckCircle />, accent: 'success', trend: dashboard.dailyCounts },
            ].map((stat) => (
              <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} accent={stat.accent as any} trend={stat.trend} />
            ))}
      </div>

      {!isLoading && incidents.length === 0 ? (
        <EmptyState title="No incident data yet" description="Create incidents to populate live dashboard metrics." />
      ) : (
        <div className="space-y-6">
          <Card title="Operations Overview">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="premium-panel">
                <p className="eyebrow">Active cases</p>
                <p className="mt-4 text-[42px] font-bold leading-none text-text">{dashboard.openIncidents}</p>
                <p className="mt-3 text-sm text-muted">Open and in-progress incidents awaiting action.</p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] shadow-[0_0_24px_rgba(79,140,255,0.45)]"
                    style={{ width: `${dashboard.activeRatio}%` }}
                  />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">{dashboard.activeRatio}% active workload</p>
              </div>

              <div className="premium-panel">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Status pipeline</p>
                    <p className="mt-4 text-[42px] font-bold leading-none text-text">{dashboard.totalIncidents}</p>
                  </div>
                  <span className="glass-pill text-slate-300">Live incidents</span>
                </div>
                <div className="mt-8 grid h-36 grid-cols-4 items-end gap-3 rounded-[22px] border border-white/10 bg-black/10 p-4">
                  {dashboard.statusCounts.map((count, index) => {
                    const maxValue = Math.max(...dashboard.statusCounts, 1);
                    return (
                      <motion.span
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((count / maxValue) * 100, count > 0 ? 16 : 8)}%` }}
                        transition={{ duration: 0.65, delay: index * 0.05, ease: 'easeOut' }}
                        className="rounded-full bg-gradient-to-t from-[#4f8cff] to-[#7c5cff] shadow-[0_0_18px_rgba(79,140,255,0.32)]"
                      />
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
                  <span>Open</span>
                  <span>Progress</span>
                  <span>Resolved</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Recent Cases & Saved Notes">
            <div className="space-y-4">
              {recentCases.map((incident) => (
                <div key={incident.id} className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                          {incident.severity}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                          {incident.status}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white">{incident.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">Created by {incident.createdBy}</p>
                      <p className="mt-4 break-words text-sm leading-7 text-slate-300">
                        {incident.analystNotes || 'No analyst notes saved yet. Open the case to add investigation notes.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => navigate(`/incidents/${incident.id}`)} className="glass-button gap-2 px-4 py-3">
                        View Details <FiArrowRight />
                      </button>
                      <button type="button" onClick={() => navigate(`/analysis?id=${incident.id}`)} className="primary-button gap-2 px-4 py-3">
                        Open Analysis <FiClock />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {recentCases.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">
                  No recent cases available.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardPage;