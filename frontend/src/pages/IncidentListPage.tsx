import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronRight, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchIncidents, deleteIncident } from '../services/incidentService';
import { IncidentSummary, IncidentSeverity, IncidentStatus } from '../types/incident';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

const severityLabels: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const statusLabels: Record<IncidentStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const severityStyles: Record<IncidentSeverity, string> = {
  critical: 'border-critical/30 bg-critical/10 text-red-200 shadow-[0_0_34px_rgba(239,68,68,0.15)]',
  high: 'border-warning/30 bg-warning/10 text-orange-200 shadow-[0_0_34px_rgba(245,158,11,0.13)]',
  medium: 'border-primary/30 bg-primary/10 text-blue-200 shadow-[0_0_34px_rgba(79,140,255,0.13)]',
  low: 'border-success/30 bg-success/10 text-green-200 shadow-[0_0_34px_rgba(34,197,94,0.12)]',
};

const IncidentListPage = () => {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (err) {
        setError('Unable to load incidents.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredIncidents = useMemo(
    () =>
      incidents.filter((incident) => {
        const matchesSearch = [incident.title, incident.createdBy].some((field) => field.toLowerCase().includes(search.toLowerCase()));
        const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
        return matchesSearch && matchesSeverity && matchesStatus;
      }),
    [incidents, search, severityFilter, statusFilter],
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteIncident(id);
      setIncidents((current) => current.filter((incident) => incident.id !== id));
    } catch (_err) {
      setError('Unable to delete incident.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">Case Intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Incidents</h1>
          <p className="mt-1 text-sm text-muted">Review and manage all incident records.</p>
        </div>
        <button type="button" onClick={() => navigate('/incidents/new')} className="primary-button gap-2 self-start">
          Create Incident
        </button>
      </div>

      {error && <div className="glass-card border-critical/20 p-4 text-sm text-red-200">{error}</div>}

      <Card title="Incident Search & Filters">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="glass-field px-12" placeholder="Search incidents..." />
          </div>
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="glass-field">
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="glass-field">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </Card>

      {isLoading ? (
        <Loader />
      ) : filteredIncidents.length === 0 ? (
        <EmptyState title="No incidents found" description="Try adjusting your search or filters to locate records." />
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident, index) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="glass-card p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${severityStyles[incident.severity]}`}>
                      {severityLabels[incident.severity]}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {statusLabels[incident.status]}
                    </span>
                  </div>
                  <p className="truncate text-lg font-semibold text-text">{incident.title}</p>
                  <p className="mt-1 text-sm text-muted">Created by {incident.createdBy}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => navigate(`/incidents/${incident.id}`)} className="glass-button gap-2 px-4 py-3">
                    <FiEye /> View
                  </button>
                  <button type="button" onClick={() => handleDelete(incident.id)} className="glass-button gap-2 border-critical/20 bg-critical/15 px-4 py-3 hover:bg-critical/20">
                    <FiTrash2 /> Delete
                  </button>
                  <button type="button" onClick={() => navigate(`/analysis?id=${incident.id}`)} className="primary-button gap-2 px-4 py-3">
                    Analyze <FiChevronRight />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default IncidentListPage;
