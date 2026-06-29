import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiActivity,
  FiPlay,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  ReferenceDot
} from 'recharts';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { fetchIncidents, updateIncidentStatus } from '../services/incidentService';
import { IncidentSummary, IncidentDetail } from '../types/incident';

interface ChartDayData {
  date: string;
  fullDate: string;
  dateStr: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgRisk: number;
  highestSeverity: string;
}

const DashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHoveredDistribution, setIsHoveredDistribution] = useState(false);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  }, []);

  // Helper to generate a timezone-aware ISO string for local date boundaries
  const getLocalISOString = useCallback((date: Date, type: 'start' | 'end') => {
    const d = new Date(date);
    if (type === 'start') {
      d.setHours(0, 0, 0, 0);
    } else {
      d.setHours(23, 59, 59, 999);
    }
    const offset = d.getTimezoneOffset();
    const localTime = new Date(d.getTime() - (offset * 60 * 1000));
    const iso = localTime.toISOString();
    const offsetSign = offset > 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const offsetMinutes = String(absOffset % 60).padStart(2, '0');
    const offsetStr = offset === 0 ? 'Z' : `${offsetSign}${offsetHours}:${offsetMinutes}`;
    return iso.slice(0, -1) + offsetStr;
  }, []);

  // Fetch 7 days of incidents ending on selected date
  const loadDashboardData = useCallback(async (targetDate: Date, showFullLoader = false) => {
    if (showFullLoader) setIsLoading(true);
    else setIsChartLoading(true);

    try {
      setError(null);
      // Calculate 6 days prior to the target date
      const startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - 6);

      const startISO = getLocalISOString(startDate, 'start');
      const endISO = getLocalISOString(targetDate, 'end');

      const data = await fetchIncidents(startISO, endISO);
      setIncidents(data);
    } catch (_err) {
      setError('Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
      setIsChartLoading(false);
    }
  }, [getLocalISOString]);

  // Load initial data on mount or when selectedDate date component changes
  useEffect(() => {
    // We only reload from server if targetDate changes outside of current fetched window
    loadDashboardData(selectedDate, true);
  }, [selectedDate, loadDashboardData]);

  // Status Change handler
  const handleStatusChange = async (incidentId: string, newStatus: string) => {
    try {
      await updateIncidentStatus(incidentId, newStatus);
      // Dynamic auto-refresh without full-page flash loader
      loadDashboardData(selectedDate, false);
    } catch (_err) {
      setError('Failed to update status.');
    }
  };

  const getRiskScore = (incident: any) => {
    if (incident.analysis?.analysis?.risk_score) {
      return Number(incident.analysis.analysis.risk_score);
    }
    const s = (incident.analysis?.analysis?.risk_level || incident.severity)?.toLowerCase();
    switch (s) {
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

  // Formatter matching "Jun 29, 2026, 07:29 AM"
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
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

  // Date Filter Widgets Handlers
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Split YYYY-MM-DD to avoid time shift
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newD = new Date();
      newD.setFullYear(year, month - 1, day);
      setSelectedDate(newD);
    }
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  // Memoized date string YYYY-MM-DD for standard input values
  const dateInputString = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // Dynamic filter for only the incidents created ON the selected date
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const incDate = new Date(inc.createdAt);
      return incDate.toDateString() === selectedDate.toDateString();
    });
  }, [incidents, selectedDate]);

  // Sort incidents by newest first
  const sortedFilteredIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredIncidents]);

  // Statistics and metrics specifically for the selected date
  const stats = useMemo(() => {
    const total = filteredIncidents.length;
    const open = filteredIncidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    const high = filteredIncidents.filter(i => {
      const s = (i.analysis?.analysis?.risk_level || i.severity)?.toLowerCase();
      return s === 'high' || s === 'critical';
    }).length;
    const resolved = filteredIncidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    
    const totalRisk = filteredIncidents.reduce((sum, i) => sum + getRiskScore(i), 0);
    const avgRisk = total ? Math.round(totalRisk / total) : 0;

    return { total, open, high, resolved, avgRisk };
  }, [filteredIncidents]);

  // Severity counts specifically for the selected date
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    filteredIncidents.forEach(i => {
      const s = (i.analysis?.analysis?.risk_level || i.severity)?.toLowerCase();
      if (s === 'critical' || s === 'high' || s === 'medium' || s === 'low') {
        counts[s]++;
      }
    });
    const total = filteredIncidents.length || 1;
    return {
      critical: { count: counts.critical, pct: Math.round((counts.critical / total) * 100) },
      high: { count: counts.high, pct: Math.round((counts.high / total) * 100) },
      medium: { count: counts.medium, pct: Math.round((counts.medium / total) * 100) },
      low: { count: counts.low, pct: Math.round((counts.low / total) * 100) },
    };
  }, [filteredIncidents]);

  // Chart data for the 7 days ending on selected date
  const chartData = useMemo(() => {
    const data: ChartDayData[] = [];
    const endDate = new Date(selectedDate);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const fullDisplayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      
      const dayIncidents = incidents.filter(inc => {
        const incDate = new Date(inc.createdAt);
        return incDate.toDateString() === d.toDateString();
      });
      
      let critical = 0;
      let high = 0;
      let medium = 0;
      let low = 0;
      let totalRisk = 0;
      
      dayIncidents.forEach(inc => {
        const s = (inc.analysis?.analysis?.risk_level || inc.severity)?.toLowerCase();
        if (s === 'critical') critical++;
        else if (s === 'high') high++;
        else if (s === 'medium') medium++;
        else low++;
        
        totalRisk += getRiskScore(inc);
      });
      
      const avgRisk = dayIncidents.length ? Math.round(totalRisk / dayIncidents.length) : 0;
      
      let highestSeverity = 'low';
      if (critical > 0) highestSeverity = 'critical';
      else if (high > 0) highestSeverity = 'high';
      else if (medium > 0) highestSeverity = 'medium';
      
      data.push({
        date: displayDate,
        fullDate: fullDisplayDate,
        dateStr: d.toDateString(),
        total: dayIncidents.length,
        critical,
        high,
        medium,
        low,
        avgRisk,
        highestSeverity
      });
    }
    return data;
  }, [incidents, selectedDate]);

  // Handler for chart point clicks - filters table and cards to that day
  const handleChartPointClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length) {
      const clickedData = state.activePayload[0].payload as ChartDayData;
      const clickedDate = new Date(clickedData.dateStr);
      setSelectedDate(clickedDate);
    }
  };

  // Recharts Custom Dot based on highest severity
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const sev = payload.highestSeverity;
    const total = payload.total;
    
    if (total === 0) return null;

    let markerColor = '#22c55e'; // Green
    if (sev === 'critical') markerColor = '#ef4444'; // Red
    else if (sev === 'high') markerColor = '#f59e0b'; // Orange
    else if (sev === 'medium') markerColor = '#3b82f6'; // Blue
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#0B1120"
        stroke={markerColor}
        strokeWidth={3}
        className="cursor-pointer transition-all duration-300 hover:r-6"
      />
    );
  };

  // Custom Active Dot with ping animation glow
  const CustomActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    const sev = payload.highestSeverity;
    
    let markerColor = '#22c55e';
    let glowColor = 'rgba(34, 197, 94, 0.4)';
    if (sev === 'critical') {
      markerColor = '#ef4444';
      glowColor = 'rgba(239, 68, 68, 0.4)';
    } else if (sev === 'high') {
      markerColor = '#f59e0b';
      glowColor = 'rgba(245, 158, 11, 0.4)';
    } else if (sev === 'medium') {
      markerColor = '#3b82f6';
      glowColor = 'rgba(59, 130, 246, 0.4)';
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill={glowColor} className="animate-ping" />
        <circle cx={cx} cy={cy} r={6} fill="#0B1120" stroke={markerColor} strokeWidth={3} />
      </g>
    );
  };

  // Custom hover tooltips showing detailed counts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDayData;
      return (
        <div className="glass-card-strong p-4 border border-blue-500/20 text-left min-w-[200px] shadow-2xl relative z-50">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
            Date: {data.fullDate}
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-1 mb-1 font-bold text-white">
              <span>Total Incidents:</span>
              <span>{data.total}</span>
            </div>
            <div className="flex justify-between text-red-400 font-semibold">
              <span>Critical:</span>
              <span>{data.critical}</span>
            </div>
            <div className="flex justify-between text-orange-400 font-semibold">
              <span>High:</span>
              <span>{data.high}</span>
            </div>
            <div className="flex justify-between text-blue-400 font-semibold">
              <span>Medium:</span>
              <span>{data.medium}</span>
            </div>
            <div className="flex justify-between text-green-400 font-semibold">
              <span>Low:</span>
              <span>{data.low}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1 mt-1 text-purple-300 font-bold">
              <span>Avg Risk Score:</span>
              <span>{data.avgRisk}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Categories distribution
  const topIncidentTypes = useMemo(() => {
    const typesMap: Record<string, number> = {};
    filteredIncidents.forEach(inc => {
      const analysisType = inc.analysis?.incident?.incident_type;
      if (analysisType) {
        typesMap[analysisType] = (typesMap[analysisType] || 0) + 1;
        return;
      }
      
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

    const total = filteredIncidents.length || 1;
    return Object.entries(typesMap)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredIncidents]);

  // Feed alerts specifically for the selected date
  const alerts = useMemo(() => {
    const list: any[] = [];
    
    sortedFilteredIncidents.forEach((inc) => {
      const incId = formatIncidentId(inc.id, inc.createdAt);
      const timeLabel = formatDateTime(inc.createdAt);
      const s = (inc.analysis?.analysis?.risk_level || inc.severity)?.toLowerCase();

      if (s === 'critical' || s === 'high') {
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
    });

    if (list.length === 0) {
      list.push({
        type: 'info',
        title: 'System Operational',
        message: 'No security alerts or playbook actions required for this date.',
        time: 'Just now',
        icon: <FiCheckCircle className="text-success" />,
        bgColor: 'bg-success/10 border-success/20'
      });
    }

    return list.slice(0, 4);
  }, [sortedFilteredIncidents]);

  // Activity list specifically for the selected date
  const activities = useMemo(() => {
    const list: any[] = [];
    
    sortedFilteredIncidents.forEach(inc => {
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
    });

    return list.slice(0, 4);
  }, [sortedFilteredIncidents]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="space-y-6 max-w-7xl mx-auto pb-10">
      {error && <div className="glass-card border-critical/20 p-4 text-sm text-red-200">{error}</div>}

      {/* Header bar with custom Date Picker and Today Shortcut */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Welcome back, {user?.name || 'ALPHA'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Security Operations Center telemetry metrics.
          </p>
        </div>
        
        {/* Date Ingestion Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400">
              <FiCalendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              value={dateInputString}
              onChange={handleDateChange}
              className="glass-field pl-10 pr-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-200 bg-black/40 border-slate-700/80 rounded-xl cursor-pointer w-[180px]"
            />
          </div>
          
          <button
            type="button"
            onClick={setToday}
            className="glass-button text-xs py-2.5 px-4 font-bold border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-300 flex items-center gap-1.5 cursor-pointer"
          >
            Today
          </button>
          
          <button
            type="button"
            onClick={() => loadDashboardData(selectedDate, false)}
            disabled={isChartLoading}
            className="glass-button text-xs p-2.5 border-slate-700 hover:bg-white/5 cursor-pointer text-slate-300"
            title="Refresh Dashboard"
          >
            <FiRefreshCw className={`w-4 h-4 ${isChartLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats metrics row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }, (_, idx) => <SkeletonCard key={idx} />)
        ) : (
          <>
            <StatCard title="Total Incidents" value={stats.total} icon={<FiFileText className="text-[#4f8cff]" />} accent="primary" trend={chartData.map(d => d.total)} />
            <StatCard title="Open Incidents" value={stats.open} icon={<FiFolder className="text-amber-400" />} accent="warning" trend={chartData.map(d => d.total)} />
            <StatCard title="High Severity" value={stats.high} icon={<FiAlertTriangle className="text-red-400" />} accent="critical" trend={chartData.map(d => d.total)} />
            <StatCard title="Resolved" value={stats.resolved} icon={<FiCheckCircle className="text-green-400" />} accent="success" trend={chartData.map(d => d.total)} />
            <StatCard title="Avg. Risk Score" value={stats.avgRisk} icon={<FiTrendingUp className="text-purple-400" />} accent="critical" trend={chartData.map(d => d.total)} />
          </>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
        
        {/* Left Side elements */}
        <div className="space-y-6">
          
          {/* Incidents over Time graph with zoom/summary side card */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl relative overflow-hidden text-left">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Incidents Over Time</h2>
                <p className="text-xs text-slate-500 mt-1">Trend analysis for 7 days ending {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="text-[10px] uppercase font-bold text-[#4f8cff] tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                Click dots to filter table
              </div>
            </div>

            {/* Grid for Line Chart + Sidebar stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              {/* Recharts Area Chart Container */}
              <div className="md:col-span-3 h-52 relative">
                {isChartLoading && (
                  <div className="absolute inset-0 bg-[#0B1120]/80 z-20 flex items-center justify-center rounded-2xl">
                    <div className="flex flex-col items-center gap-3">
                      <FiActivity className="w-8 h-8 text-blue-400 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-400">Loading chart analytics...</span>
                    </div>
                  </div>
                )}
                
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={chartData} 
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    onClick={handleChartPointClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <defs>
                      <linearGradient id="areaGlowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ stroke: 'rgba(255, 255, 255, 0.08)', strokeWidth: 1.5 }}
                      animationDuration={300}
                    />

                    {/* Curved line area */}
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="url(#lineGrad)" 
                      strokeWidth={2.5} 
                      fill="url(#areaGlowGrad)"
                      dot={<CustomDot />}
                      activeDot={<CustomActiveDot />}
                      animationDuration={1200}
                    />

                    {/* Zoom support */}
                    <Brush 
                      dataKey="date" 
                      height={18} 
                      stroke="#334155" 
                      fill="rgba(15,23,42,0.4)" 
                      travellerWidth={8}
                      tickFormatter={() => ''}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sidebar Summary Card */}
              <div className="md:col-span-1 bg-white/[0.02] border border-slate-800 rounded-2xl p-4 space-y-3.5 h-full flex flex-col justify-center">
                <div className="border-b border-slate-800/80 pb-2 text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtered metrics</span>
                  <h4 className="text-xs font-bold text-slate-300 truncate">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} Summary</h4>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Incidents:</span>
                    <span className="text-white font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Critical:</span>
                    <span className="text-red-400 font-bold">{severityCounts.critical.count}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>High:</span>
                    <span className="text-orange-400 font-bold">{severityCounts.high.count}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Medium:</span>
                    <span className="text-blue-400 font-bold">{severityCounts.medium.count}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Low:</span>
                    <span className="text-green-400 font-bold">{severityCounts.low.count}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2 text-slate-400">
                    <span>Avg Risk:</span>
                    <span className="text-purple-400 font-black">{stats.avgRisk}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Recent Incidents Panel */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Incidents</h2>
                <p className="text-xs text-slate-500 mt-1">Showing incidents for {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <button onClick={() => navigate('/incidents')} className="text-xs uppercase tracking-widest text-[#4f8cff] hover:text-blue-300 font-bold cursor-pointer">
                View All
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-20 text-center text-slate-500">Loading incidents list...</div>
            ) : sortedFilteredIncidents.length === 0 ? (
              <div className="py-10 text-center">
                <EmptyState 
                  title="No incidents found for this date" 
                  description="No threat vectors logged. Try navigating back or load telemetry entries." 
                />
              </div>
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
                    {sortedFilteredIncidents.map((incident) => {
                      const riskScore = getRiskScore(incident);
                      const displaySeverity = (incident.analysis?.analysis?.risk_level || incident.severity)?.toLowerCase();
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
                              displaySeverity === 'critical' ? 'border-red-500/35 bg-red-500/10 text-red-300' :
                              displaySeverity === 'high' ? 'border-orange-500/35 bg-orange-500/10 text-orange-300' :
                              displaySeverity === 'medium' ? 'border-blue-500/35 bg-blue-500/10 text-blue-300' :
                              'border-green-500/35 bg-green-500/10 text-green-300'
                            }`}>
                              {displaySeverity}
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
                                  data-testid="risk-bar"
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
                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition duration-200 cursor-pointer"
                                title="View Details"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => navigate(`/analysis?id=${incident.id}`)}
                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition duration-200 cursor-pointer"
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

        </div>

        {/* Right Side elements */}
        <div className="space-y-6">
          
          {/* Severity Distribution Donut */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl text-left">
            <h2 className="text-lg font-bold text-white mb-6">Severity Distribution</h2>
            
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Donut Chart Container */}
              <div 
                className="relative h-32 w-32 cursor-pointer transition-transform duration-300 hover:scale-105"
                onMouseEnter={() => setIsHoveredDistribution(true)}
                onMouseLeave={() => setIsHoveredDistribution(false)}
              >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Base Circle */}
                  {!isHoveredDistribution && (
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  )}
                  
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
                          r={isHoveredDistribution ? 8.7575 : 15.915}
                          fill="none"
                          stroke={strokeColors[sev as keyof typeof strokeColors]}
                          strokeWidth={isHoveredDistribution ? 17.515 : 3.2}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          className="transition-all duration-300 ease-in-out"
                        />
                      );
                    });
                  })()}

                  {/* Percentage Labels on Hover */}
                  {isHoveredDistribution && (() => {
                    let totalPercent = 0;
                    return ['critical', 'high', 'medium', 'low'].map((sev, idx) => {
                      const pct = severityCounts[sev as keyof typeof severityCounts]?.pct || 0;
                      if (!pct) return null;
                      
                      const midPct = totalPercent + (pct / 2);
                      totalPercent += pct;
                      
                      const angle = (midPct / 100) * 2 * Math.PI;
                      const rLabel = 10.5; // Positioning radius inside segment
                      const x = 18 + rLabel * Math.cos(angle);
                      const y = 18 + rLabel * Math.sin(angle);
                      
                      return (
                        <text
                          key={`lbl-${idx}`}
                          x={x}
                          y={y}
                          fill="white"
                          fontSize="3.2"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(90, ${x}, ${y})`}
                          className="pointer-events-none select-none"
                        >
                          {pct}%
                        </text>
                      );
                    });
                  })()}
                </svg>
 
                {/* Centered text */}
                {!isHoveredDistribution && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white leading-none">{stats.total}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Total</span>
                  </div>
                )}
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

          {/* Top Incident Types Panel */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Top Incident Types</h2>
            </div>

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

          {/* Recent Activity Timeline */}
          <div className="rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            </div>
 
            {activities.length === 0 ? (
              <div className="py-6 text-slate-500 text-xs">No active log entries for this date.</div>
            ) : (
              <div className="space-y-4 mt-5 pl-1.5 relative border-l border-white/5 ml-3">
                {activities.map((act, idx) => (
                  <div key={idx} className="relative pl-6">
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
            )}
          </div>

        </div>

      </div>

      {/* Bottom Actions banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-violet-950/20 to-black/20 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-2xl text-left">
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
        <button onClick={() => navigate('/incidents/new')} className="primary-button py-3 px-6 shrink-0 gap-2 font-bold text-sm cursor-pointer">
          <FiPlus className="h-4 w-4" /> Create Incident
        </button>
      </div>
    </motion.div>
  );
};

export default DashboardPage;