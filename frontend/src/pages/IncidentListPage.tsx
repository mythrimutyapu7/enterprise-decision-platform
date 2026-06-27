import { useEffect, useMemo, useState } from 'react';
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
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-2xl font-semibold text-text">Incidents</h1>
          <p className="text-sm text-muted">Review and manage all incident records.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/incidents/new')}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Create Incident
        </button>
      </div>

      <Card title="Incident Search & Filters">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#111827] px-12 py-3 text-sm text-text outline-none focus:border-primary"
              placeholder="Search incidents..."
            />
          </div>
          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-text outline-none focus:border-primary"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-text outline-none focus:border-primary"
          >
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
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="rounded-3xl border border-white/10 bg-card p-5 shadow-panel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-text">{incident.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {severityLabels[incident.severity]} · {statusLabels[incident.status]} · Created by {incident.createdBy}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    <FiEye /> View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(incident.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-critical px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    <FiTrash2 /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/analysis?id=${incident.id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Analyze <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentListPage;
