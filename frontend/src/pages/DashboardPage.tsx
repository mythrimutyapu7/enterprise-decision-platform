import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiAlertTriangle, 
  FiArrowRight, 
  FiCheckCircle, 
  FiClock, 
  FiShield, 
  FiTrendingUp, 
  FiFolder, 
  FiFileText, 
  FiEye, 
  FiPlus, 
  FiPlusCircle,
  FiBell, 
  FiActivity,
  FiPlay,
  FiUser
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { fetchIncidents, updateIncidentStatus } from '../services/incidentService';
import { IncidentSummary, IncidentDetail } from '../types/incident';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await fetchIncidents() as any[];
      setIncidents(data);
    } catch (_err) {
      setError('Unable to load dashboard data from incidents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStatusChange = async (incidentId: string, newStatus: string) => {
    try {
      await updateIncidentStatus(incidentId, newStatus);
      // Reload dashboard data dynamically to update all calculations
      loadDashboardData();
    } catch (_err) {
      setError('Failed to update status.');
    }
  };

  const getRiskScore = (incident: any) => {
    if (incident.analysis?.analysis?.risk_score) {
      return Number(incident.analysis.analysis.risk_score);
    }
    switch (incident.severity) {
      case 'critical': return 90;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low':
      default: return 25;
    }
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

  // 1. Calculations & Metrics
  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    const high = incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length;
    const resolved = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    
    const totalRisk = incidents.reduce((sum, i) => sum + getRiskScore(i), 0);
    const avgRisk = total ? Math.round(totalRisk / total) : 0;

    return { total, open, high, resolved, avgRisk };
  }, [incidents]);

  // 2. Recent Incidents (max 5 sorted by date)
  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [incidents]);

  // 3. Severity Distribution Counts
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach(i => {
      const s = i.severity?.toLowerCase();
      if (s === 'critical' || s === 'high' || s === 'medium' || s === 'low') {
        counts[s]++;
      }
    });
    const total = incidents.length || 1;
    return {
      critical: { count: counts.critical, pct: Math.round((counts.critical / total) * 100) },
      high: { count: counts.high, pct: Math.round((counts.high / total) * 100) },
      medium: { count: counts.medium, pct: Math.round((counts.medium / total) * 100) },
      low: { count: counts.low, pct: Math.round((counts.low / total) * 100) },
    };
  }, [incidents]);

  // 4. Incidents Over Time (Last 7 Days)
  const chartData = useMemo(() => {
    const days = [];
    const counts = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      
      const matchCount = incidents.filter(inc => {
        const incDate = new Date(inc.createdAt);
        return incDate.toDateString() === d.toDateString();
      }).length;
      counts.push(matchCount);
    }
    
    const maxVal = Math.max(...counts, 4);
    
    // Create SVG points
    const points = counts.map((count, index) => {
      const x = (index / 6) * 100; // percent width
      const y = 80 - (count / maxVal) * 60; // scale to fit nicely in 100px height
      return { x, y, count };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }, '');

    const areaD = pathD ? `${pathD} L 100 100 L 0 100 Z` : '';

    return { days, counts, points, pathD, areaD };
  }, [incidents]);

  // 5. Top Incident Types
  const topIncidentTypes = useMemo(() => {
    const typesMap: Record<string, number> = {};
    incidents.forEach(inc => {
      const analysisType = inc.analysis?.incident?.incident_type;
      if (analysisType) {
        typesMap[analysisType] = (typesMap[analysisType] || 0) + 1;
        return;
      }
      
      // Fallback description scanning
      const title = inc.title?.toLowerCase() || '';
      const desc = inc.description?.toLowerCase() || '';
      let detectedType = 'Suspicious Anomalies';
      
      if (title.includes('login') || title.includes('auth') || desc.includes('brute')) {
        detectedType = 'Authentication Attack';
      } else if (title.includes('malware') || title.includes('trojan') || desc.includes('execution')) {
        detectedType = 'Malware';
      } else if (title.includes('phish') || desc.includes('email')) {
        detectedType = 'Phishing';
      } else if (title.includes('exfiltrat') || desc.includes('leak') || desc.includes('access')) {
        detectedType = 'Data Exfiltration';
      } else if (title.includes('privilege') || desc.includes('admin') || desc.includes('escalat')) {
        detectedType = 'Privilege Escalation';
      }
      
      typesMap[detectedType] = (typesMap[detectedType] || 0) + 1;
    });

    const total = incidents.length || 1;
    return Object.entries(typesMap)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [incidents]);

  // 6. Dynamic Alerts & Activity
  const alerts = useMemo(() => {
    const list: any[] = [];
    const sorted = [...incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    sorted.forEach((inc, idx) => {
      const incId = formatIncidentId(inc.id, inc.createdAt);
      const timeLabel = formatDateTime(inc.createdAt);

      if (inc.severity === 'critical' || inc.severity === 'high') {
        list.push({
          type: 'severity',
          title: 'High severity incident detected',
          message: `${incId} - ${inc.title}`,
          time: timeLabel,
          icon: <FiAlertTriangle className="text-critical" />,
          bgColor: 'bg-critical/10 border-critical/20'
        });
      }
      
      if (inc.analysis?.analysis?.indicators && inc.analysis.analysis.indicators.length > 0) {
        list.push({
          type: 'intel',
          title: 'New IOC match found',
          message: `${inc.analysis.analysis.indicators.length} indicators matched in threat intelligence`,
          time: timeLabel,
          icon: <FiActivity className="text-warning" />,
          bgColor: 'bg-warning/10 border-warning/20'
        });
      }
      
      if (inc.analysis?.recommendation?.recommended_action) {
        list.push({
          type: 'playbook',
          title: 'Playbook execution required',
          message: `${inc.analysis.recommendation.recommended_action.substring(0, 50)}...`,
          time: timeLabel,
          icon: <FiPlay className="text-primary" />,
          bgColor: 'bg-[#4f8cff]/10 border-[#4f8cff]/20'
        });
      }

      if (inc.status === 'resolved' || inc.status === 'closed') {
        list.push({
          type: 'resolved',
          title: 'Incident resolved',
          message: `${incId} - Resolved by ${inc.createdBy || 'Analyst'}`,
          time: timeLabel,
          icon: <FiCheckCircle className="text-success" />,
          bgColor: 'bg-success/10 border-success/20'
        });
      }
    });

    // Provide default fallback alerts if empty
    if (list.length === 0) {
      list.push({
        type: 'info',
        title: 'System Operational',
        message: 'No security alerts or playbook actions required.',
        time: 'Just now',
        icon: <FiCheckCircle className="text-success" />,
        bgColor: 'bg-success/10 border-success/20'
      });
    }

    return list.slice(0, 4);
  }, [incidents]);

  const activities = useMemo(() => {
    const list: any[] = [];
    const sorted = [...incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    sorted.forEach(inc => {
      const incId = formatIncidentId(inc.id, inc.createdAt);
      const rawDate = new Date(inc.createdAt);
      const timeString = rawDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      list.push({
        message: `You created incident ${incId}`,
        time: timeString,
        icon: <FiPlus className="text-indigo-400" />
      });

      if (inc.analysis) {
        list.push({
          message: `AI analysis completed for ${incId}`,
          time: timeString,
          icon: <FiActivity className="text-sky-400" />
        });
      }

      if (inc.status === 'resolved' || inc.status === 'closed') {
        list.push({
          message: `Incident ${incId} resolved`,
          time: timeString,
          icon: <FiCheckCircle className="text-emerald-400" />
        });
      }
    });

    return list.slice(0, 4);
  }, [incidents]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="space-y-6">
      {error && <div className="glass-card border-critical/20 p-4 text-sm text-red-200">{error}</div>}

      {/* Title & Greeting Row */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Welcome back, {user?.name || 'ALPHA'} 👋
        </h1>
        <p className="text-sm text-slate-400">
          Here's what's happening in your security operations center.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }, (_, idx) => <SkeletonCard key={idx} />)
        ) : (
          <>
            <StatCard title="Total Incidents" value={stats.total} icon={<FiFileText className="text-[#4f8cff]" />} accent="primary" trend={chartData.counts} />
            <StatCard title="Open Incidents" value={stats.open} icon={<FiFolder className="text-amber-400" />} accent="warning" trend={chartData.counts} />
            <StatCard title="High Severity" value={stats.high} icon={<FiAlertTriangle className="text-red-400" />} accent="critical" trend={chartData.counts} />
            <StatCard title="Resolved" value={stats.resolved} icon={<FiCheckCircle className="text-green-400" />} accent="success" trend={chartData.counts} />
            <StatCard title="Avg. Risk Score" value={stats.avgRisk} icon={<FiTrendingUp className="text-purple-400" />} accent="critical" trend={chartData.counts} />
          </>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        
        {/* Left Side Panels */}
        <div className="space-y-6">
          {/* Recent Incidents Panel */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Incidents</h2>
              <button onClick={() => navigate('/incidents')} className="text-xs uppercase tracking-widest text-[#4f8cff] hover:text-blue-300 font-bold">
                View All
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-20 text-center text-slate-500">Loading incidents list...</div>
            ) : recentIncidents.length === 0 ? (
              <EmptyState title="No recent cases found" description="Create a security incident to begin analysis feeds." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider pb-3">
                      <th className="pb-3 pr-2">ID</th>
                      <th className="pb-3 pr-2">TITLE</th>
                      <th className="pb-3 pr-2">SEVERITY</th>
                      <th className="pb-3 pr-2">STATUS</th>
                      <th className="pb-3 pr-2">RISK SCORE</th>
                      <th className="pb-3 pr-2">CREATED AT</th>
                      <th className="pb-3 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIncidents.map((incident) => {
                      const riskScore = getRiskScore(incident);
                      return (
                        <tr key={incident.id} className="border-b border-white/5 hover:bg-white/[0.015] transition duration-200">
                          <td className="py-4 font-mono font-bold text-slate-400">
                            {formatIncidentId(incident.id, incident.createdAt)}
                          </td>
                          <td className="py-4 font-semibold text-white truncate max-w-[150px]">
                            {incident.title}
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              incident.severity === 'critical' ? 'border-red-500/35 bg-red-500/10 text-red-300' :
                              incident.severity === 'high' ? 'border-orange-500/35 bg-orange-500/10 text-orange-300' :
                              incident.severity === 'medium' ? 'border-blue-500/35 bg-blue-500/10 text-blue-300' :
                              'border-green-500/35 bg-green-500/10 text-green-300'
                            }`}>
                              {incident.severity}
                            </span>
                          </td>
                          <td className="py-4">
                            <select
                              value={incident.status}
                              onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                              className={`rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-200 outline-none cursor-pointer focus:border-[#4f8cff]/50 ${
                                incident.status === 'open' ? 'text-red-300 border-red-500/20' :
                                incident.status === 'in_progress' ? 'text-purple-300 border-purple-500/20' :
                                incident.status === 'resolved' ? 'text-green-300 border-green-500/20' :
                                'text-slate-400 border-slate-500/20'
                              }`}
                            >
                              <option value="open" className="bg-[#0B1120] text-red-200">Open</option>
                              <option value="in_progress" className="bg-[#0B1120] text-purple-200">In Progress</option>
                              <option value="resolved" className="bg-[#0B1120] text-green-200">Resolved</option>
                              <option value="closed" className="bg-[#0B1120] text-slate-400">Closed</option>
                            </select>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-6 text-right">{riskScore}</span>
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    riskScore >= 75 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                    riskScore >= 45 ? 'bg-gradient-to-r from-orange-400 to-yellow-400' :
                                    'bg-gradient-to-r from-green-500 to-emerald-400'
                                  }`} 
                                  style={{ width: `${riskScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-slate-400 font-medium">
                            {formatDateTime(incident.createdAt)}
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => navigate(`/incidents/${incident.id}`)}
                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition duration-200"
                                title="View Details"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => navigate(`/analysis?id=${incident.id}`)}
                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition duration-200"
                                title="Open Analysis"
                              >
                                <FiArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Grid Row: Time Series & Top Types */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Incidents Over Time Panel */}
            <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Incidents Over Time</h2>
                <select className="bg-transparent text-xs text-slate-400 font-semibold border-none outline-none cursor-pointer">
                  <option className="bg-[#0B1120]">Last 7 Days</option>
                </select>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="relative h-44 mt-6">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                  {/* Gradient Area */}
                  {chartData.areaD && (
                    <path d={chartData.areaD} fill="url(#areaGrad)" />
                  )}

                  {/* Highlight Path Line */}
                  {chartData.pathD && (
                    <path d={chartData.pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.2" strokeLinecap="round" />
                  )}

                  {/* Line Gradient */}
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f8cff" />
                    <stop offset="100%" stopColor="#7c5cff" />
                  </linearGradient>
                </svg>

                {/* Interactive Points Labels */}
                <div className="absolute inset-0 flex justify-between">
                  {chartData.points.map((p, idx) => (
                    <div key={idx} className="relative flex flex-col justify-end items-center h-full" style={{ width: '14.28%' }}>
                      <span className="text-[10px] font-bold text-white mb-1.5" style={{ transform: `translateY(${-115 + p.y}px)` }}>
                        {p.count}
                      </span>
                      <div className="absolute bottom-[20%] w-2 h-2 rounded-full border border-white bg-[#4f8cff] shadow-lg shadow-[#4f8cff]/50" style={{ bottom: `${100 - p.y - 2.5}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold tracking-wider mt-4">
                {chartData.days.map((day, idx) => (
                  <span key={idx} className="w-[14.28%] text-center">{day}</span>
                ))}
              </div>
            </div>

            {/* Top Incident Types Panel */}
            <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Top Incident Types</h2>
                <button onClick={() => navigate('/incidents')} className="text-xs uppercase tracking-widest text-[#4f8cff] hover:text-blue-300 font-bold">
                  View All
                </button>
              </div>

              {/* Categories list */}
              <div className="space-y-4 mt-6">
                {isLoading ? (
                  <div className="text-center text-slate-500 py-10">Computing types...</div>
                ) : topIncidentTypes.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">No categories found.</div>
                ) : (
                  topIncidentTypes.map((type, idx) => {
                    const colors = [
                      'from-[#4f8cff] to-blue-400',
                      'from-orange-500 to-orange-400',
                      'from-yellow-400 to-yellow-300',
                      'from-[#7c5cff] to-purple-400',
                      'from-emerald-400 to-teal-400'
                    ];
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{type.name}</span>
                          <span>{type.count} ({type.pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]}`} 
                            style={{ width: `${type.pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side Panels */}
        <div className="space-y-6">
          
          {/* Severity Distribution Panel */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6">Severity Distribution</h2>
            
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Donut Chart Container */}
              <div className="relative h-32 w-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Base Circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  
                  {/* Segment calculation */}
                  {(() => {
                    let totalPercent = 0;
                    return ['critical', 'high', 'medium', 'low'].map((sev, idx) => {
                      const pct = severityCounts[sev as keyof typeof severityCounts]?.pct || 0;
                      if (!pct) return null;
                      
                      const strokeDasharray = `${pct} ${100 - pct}`;
                      const strokeDashoffset = 100 - totalPercent;
                      totalPercent += pct;
                      
                      const strokeColors = {
                        critical: '#ef4444', // Red
                        high: '#f59e0b',     // Orange
                        medium: '#3b82f6',   // Blue
                        low: '#22c55e',      // Green
                      };

                      return (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={strokeColors[sev as keyof typeof strokeColors]}
                          strokeWidth="3.2"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Centered text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white leading-none">{stats.total}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Total</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="w-full space-y-2.5">
                {[
                  { name: 'Critical', color: 'bg-red-500', metrics: severityCounts.critical },
                  { name: 'High', color: 'bg-orange-500', metrics: severityCounts.high },
                  { name: 'Medium', color: 'bg-[#4f8cff]', metrics: severityCounts.medium },
                  { name: 'Low', color: 'bg-green-500', metrics: severityCounts.low },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-white">
                      {item.metrics.count} <span className="text-slate-500 font-medium ml-1">({item.metrics.pct}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts & Notifications Panel */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Alerts & Notifications</h2>
              <button onClick={() => navigate('/incidents')} className="text-xs uppercase tracking-widest text-[#4f8cff] hover:text-blue-300 font-bold">
                View All
              </button>
            </div>

            {/* List */}
            <div className="space-y-3 mt-5">
              {alerts.map((al, idx) => (
                <div key={idx} className={`flex items-start gap-3 rounded-2xl border p-4 ${al.bgColor} transition duration-300 hover:scale-[1.01]`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/5">
                    {al.icon}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-white leading-tight">{al.title}</p>
                    <p className="text-[11px] text-slate-400 leading-normal truncate">{al.message}</p>
                    <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wide pt-1">{al.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Panel */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <button onClick={() => navigate('/incidents')} className="text-xs uppercase tracking-widest text-[#4f8cff] hover:text-blue-300 font-bold">
                View All
              </button>
            </div>

            {/* Timeline */}
            <div className="space-y-4 mt-5 pl-1.5 relative border-l border-white/5 ml-3">
              {activities.map((act, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Point */}
                  <span className="absolute -left-[14px] top-1 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#0B1120] border border-white/10">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5">
                      {act.icon}
                    </span>
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{act.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-violet-950/20 to-black/20 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4f8cff]/15 text-[#4f8cff] shadow-lg shadow-[#4f8cff]/10">
            <FiPlusCircle className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">Create New Incident</h3>
            <p className="text-sm text-slate-400 mt-1 leading-normal">
              Log a new security incident and let our AI analyze and provide recommendations.
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/incidents/new')} className="primary-button py-3 px-6 shrink-0 gap-2 font-bold text-sm">
          <FiPlus className="h-4 w-4" /> Create Incident
        </button>
      </div>
    </motion.div>
  );
};

export default DashboardPage;