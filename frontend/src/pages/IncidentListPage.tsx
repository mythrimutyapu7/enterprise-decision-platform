import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiChevronRight, 
  FiTrash2, 
  FiEye, 
  FiSearch, 
  FiUser, 
  FiCalendar, 
  FiActivity, 
  FiAlertTriangle, 
  FiPlus 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { fetchIncidents, deleteIncident } from '../services/incidentService';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';

const severityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const severityRank: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const IncidentListPage = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // Options: newest, oldest, severity_desc, severity_asc, risk_desc, risk_asc
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadIncidents = async () => {
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      setError('Unable to load incidents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const getSeverity = (incident: any) => {
    return (incident.analysis?.analysis?.risk_level || incident.severity || 'low').toLowerCase();
  };

  const getRiskScore = (incident: any) => {
    if (incident.analysis?.analysis?.risk_score) {
      return Number(incident.analysis.analysis.risk_score);
    }
    const s = getSeverity(incident);
    switch (s) {
      case 'critical': return 90;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low':
      default: return 25;
    }
  };

  const getIncidentCategory = (incident: any) => {
    if (incident.analysis?.incident?.incident_type) {
      return incident.analysis.incident.incident_type;
    }
    const title = incident.title?.toLowerCase() || '';
    const desc = incident.description?.toLowerCase() || '';
    if (title.includes('login') || title.includes('auth') || desc.includes('brute')) return 'Authentication Attack';
    if (title.includes('malware') || title.includes('trojan') || desc.includes('execution')) return 'Malware';
    if (title.includes('phish') || desc.includes('email')) return 'Phishing';
    if (title.includes('exfiltrat') || desc.includes('leak') || desc.includes('access')) return 'Data Exfiltration';
    if (title.includes('privilege') || desc.includes('admin') || desc.includes('escalat')) return 'Privilege Escalation';
    return 'Suspicious Anomalies';
  };

  const formatIncidentId = (id: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = isNaN(date.getFullYear()) ? 2026 : date.getFullYear();
    const suffix = id.slice(-4).toUpperCase();
    return `INC-${year}-${suffix}`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const filteredAndSortedIncidents = useMemo(() => {
    // 1. Filter
    const filtered = incidents.filter((incident) => {
      const matchesSearch = [incident.title, incident.createdBy].some((field) => 
        (field || '').toLowerCase().includes(search.toLowerCase())
      );
      const matchesSeverity = severityFilter === 'all' || getSeverity(incident) === severityFilter;
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'severity_desc') {
        return (severityRank[getSeverity(b)] || 0) - (severityRank[getSeverity(a)] || 0);
      }
      if (sortBy === 'severity_asc') {
        return (severityRank[getSeverity(a)] || 0) - (severityRank[getSeverity(b)] || 0);
      }
      if (sortBy === 'risk_desc') {
        return getRiskScore(b) - getRiskScore(a);
      }
      if (sortBy === 'risk_asc') {
        return getRiskScore(a) - getRiskScore(b);
      }
      return 0;
    });
  }, [incidents, search, severityFilter, statusFilter, sortBy]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this incident case?")) {
      return;
    }
    try {
      await deleteIncident(id);
      setIncidents((current) => current.filter((incident) => incident.id !== id));
    } catch (_err) {
      setError('Unable to delete incident.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      
      {/* Title & Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Case Intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Incidents</h1>
          <p className="mt-1 text-sm text-muted">Review, filter, and manage all logged incident cases.</p>
        </div>
        <button 
          type="button" 
          onClick={() => navigate('/incidents/new')} 
          className="primary-button gap-2 self-start py-3.5 px-6 font-bold text-sm"
        >
          <FiPlus className="h-4.5 w-4.5" /> Create Incident
        </button>
      </div>

      {error && <div className="glass-card border-critical/20 p-4 text-sm text-red-200">{error}</div>}

      {/* Control Panel (Search, Filters, Sort) */}
      <Card title="Incident Search & Controls">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input 
              value={search} 
              onChange={(event) => setSearch(event.target.value)} 
              className="glass-field pl-12 pr-4 py-2.5 text-sm" 
              placeholder="Search incidents..." 
            />
          </div>
          
          <select 
            value={severityFilter} 
            onChange={(event) => setSeverityFilter(event.target.value)} 
            className="glass-field text-sm cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
            <option value="critical">Critical Severity</option>
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(event) => setStatusFilter(event.target.value)} 
            className="glass-field text-sm cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(event) => setSortBy(event.target.value)} 
            className="glass-field text-sm cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="severity_desc">Sort: Severity (High to Low)</option>
            <option value="severity_asc">Sort: Severity (Low to High)</option>
          </select>
        </div>
      </Card>

      {/* Incident List Rows */}
      {isLoading ? (
        <Loader />
      ) : filteredAndSortedIncidents.length === 0 ? (
        <EmptyState title="No incidents found" description="Try adjusting your search query, filters, or sorting rules." />
      ) : (
        <div className="space-y-4">
          {filteredAndSortedIncidents.map((incident, index) => {
            const riskScore = getRiskScore(incident);
            const category = getIncidentCategory(incident);
            const displayId = formatIncidentId(incident.id, incident.createdAt);
            const severity = getSeverity(incident);

            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, scale: 1.005 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className={`
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#0B1120]
                  p-5
                  shadow-xl
                  hover:border-[#4f8cff]/30
                  transition
                  duration-200
                `}
              >
                {/* Severity left glowing line */}
                <div className={`
                  absolute
                  left-0
                  top-0
                  bottom-0
                  w-1.5
                  ${
                    severity === 'critical' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' :
                    severity === 'high' ? 'bg-orange-500 shadow-[0_0_15px_#f59e0b]' :
                    severity === 'medium' ? 'bg-blue-500 shadow-[0_0_15px_#3b82f6]' :
                    'bg-green-500 shadow-[0_0_15px_#22c55e]'
                  }
                `} />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between pl-2">
                  
                  {/* Left Column Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    
                    {/* ID & Badges Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{displayId}</span>
                      
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        severity === 'critical' ? 'border-red-500/35 bg-red-500/10 text-red-300' :
                        severity === 'high' ? 'border-orange-500/35 bg-orange-500/10 text-orange-300' :
                        severity === 'medium' ? 'border-blue-500/35 bg-blue-500/10 text-blue-300' :
                        'border-green-500/35 bg-green-500/10 text-green-300'
                      }`}>
                        {severityLabels[severity]}
                      </span>

                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        incident.status === 'open' ? 'border-red-500/20 bg-red-500/5 text-red-200' :
                        incident.status === 'in_progress' ? 'border-purple-500/20 bg-purple-500/5 text-purple-200' :
                        incident.status === 'resolved' ? 'border-green-500/20 bg-green-500/5 text-green-200' :
                        'border-slate-500/20 bg-slate-500/5 text-slate-400'
                      }`}>
                        {statusLabels[incident.status]}
                      </span>

                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        {category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {incident.title}
                    </h3>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <FiUser className="h-3.5 w-3.5 text-slate-500" />
                        Reported by <span className="text-slate-300 font-semibold">{incident.createdBy}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="h-3.5 w-3.5 text-slate-500" />
                        {formatDateTime(incident.createdAt)}
                      </span>
                    </div>
                  </div>


                  {/* Right Column Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => navigate(`/incidents/${incident.id}`)} 
                      className="glass-button gap-2 py-2.5 px-4 text-xs font-bold"
                    >
                      <FiEye className="h-4 w-4" /> View Details
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDelete(incident.id)} 
                      className="glass-button border-critical/20 bg-critical/10 py-2.5 px-4 text-xs font-bold hover:bg-critical/20 hover:text-red-200"
                    >
                      <FiTrash2 className="h-4 w-4" /> Delete
                    </button>
                    <button 
                      type="button" 
                      onClick={() => navigate(`/analysis?id=${incident.id}`)} 
                      className="primary-button gap-2 py-2.5 px-5 text-xs font-bold"
                    >
                      Analyze Case <FiChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default IncidentListPage;
