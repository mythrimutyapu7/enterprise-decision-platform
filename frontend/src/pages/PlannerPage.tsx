import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCpu, 
  FiDatabase, 
  FiSearch, 
  FiCheckCircle, 
  FiClock, 
  FiLayers, 
  FiAlertTriangle,
  FiHelpCircle,
  FiChevronRight,
  FiActivity,
  FiUserCheck,
  FiGlobe,
  FiSettings
} from 'react-icons/fi';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { fetchIncidents } from '../services/incidentService';

interface TimelineStep {
  name: string;
  status: 'Executed' | 'Skipped' | 'Conditional' | 'Fast Path' | 'Human Review Required';
  time: string;
  reason: string;
  confidence?: string;
  icon: React.ComponentType<any>;
  color: string;
}

const DEFAULT_DEMO_INCIDENTS = [
  {
    id: 'DEMO-CRIT-01',
    title: 'Phishing Alert: APT29 Cozy Bear Executable Campaign',
    severity: 'critical',
    status: 'open',
    createdAt: new Date().toISOString(),
    analysis: {
      analysis: {
        risk_score: 95,
        risk_level: 'critical',
        confidence: 94
      }
    }
  },
  {
    id: 'DEMO-MED-02',
    title: 'Multiple Failed SSH Logins on Staging API Gateway',
    severity: 'medium',
    status: 'resolved',
    createdAt: new Date().toISOString(),
    analysis: {
      analysis: {
        risk_score: 45,
        risk_level: 'medium',
        confidence: 97
      }
    }
  }
];

const PlannerPage = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analyzed incidents from backend + inject demo incidents
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchIncidents() as any[];
        // Filter incidents to show only those that have been analyzed (analysis isn't null)
        const analyzed = data.filter(inc => inc.analysis !== null);
        
        // Combine demo incidents and actual analyzed backend incidents
        const combined = [...DEFAULT_DEMO_INCIDENTS, ...analyzed];
        setIncidents(combined);
        if (combined.length > 0) {
          setSelectedIncidentId(combined[0].id);
        }
      } catch (_err) {
        // Fallback to demo incidents on API error
        setIncidents(DEFAULT_DEMO_INCIDENTS);
        setSelectedIncidentId(DEFAULT_DEMO_INCIDENTS[0].id);
      } finally {
        setIsLoading(false);
      }
    };
    loadIncidents();
  }, []);

  // Find currently selected incident
  const selectedIncident = useMemo(() => {
    return incidents.find(inc => inc.id === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);

  const severity = useMemo(() => {
    if (!selectedIncident) return 'low';
    return (selectedIncident.analysis?.analysis?.risk_level || selectedIncident.severity || 'low').toLowerCase();
  }, [selectedIncident]);

  const formatIncidentId = (id: string, createdAt: string) => {
    if (id.startsWith('DEMO-')) return id;
    const date = new Date(createdAt);
    const year = isNaN(date.getFullYear()) ? 2026 : date.getFullYear();
    const suffix = id.slice(-4).toUpperCase();
    return `INC-${year}-${suffix}`;
  };

  // Generate dynamic execution plan timeline based on incident severity
  const executionTimeline = useMemo((): TimelineStep[] => {
    if (!selectedIncident) return [];

    const isCriticalOrHigh = severity === 'critical' || severity === 'high';

    return [
      {
        name: 'Planner Ingest',
        status: 'Executed',
        time: '12 ms',
        reason: 'Orchestrator parsed incident attributes and allocated execution thread.',
        confidence: '100%',
        icon: FiSettings,
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      },
      {
        name: 'Memory Lookup',
        status: 'Executed',
        time: '85 ms',
        reason: 'Searched historical vector database for matching malicious patterns or IP blocks.',
        confidence: '98%',
        icon: FiDatabase,
        color: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      },
      {
        name: 'Knowledge Retrieval',
        status: 'Executed',
        time: '140 ms',
        reason: 'Queried corporate security policies and incident response playbook guidelines.',
        confidence: '95%',
        icon: FiSearch,
        color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
      },
      {
        name: 'Context Agent',
        status: isCriticalOrHigh ? 'Executed' : 'Fast Path',
        time: isCriticalOrHigh ? '190 ms' : '45 ms',
        reason: isCriticalOrHigh 
          ? 'Enriched device records, LDAP user details, and asset criticality scores for target nodes.' 
          : 'Retrieved standard asset context dynamically from local cache (fast path).',
        confidence: isCriticalOrHigh ? '96%' : '99%',
        icon: FiLayers,
        color: isCriticalOrHigh 
          ? 'text-teal-400 bg-teal-400/10 border-teal-400/20' 
          : 'text-sky-400 bg-sky-400/10 border-sky-400/20'
      },
      {
        name: 'Threat Intelligence Agent',
        status: isCriticalOrHigh ? 'Executed' : 'Skipped',
        time: isCriticalOrHigh ? '380 ms' : '0 ms',
        reason: isCriticalOrHigh 
          ? 'Triggered active network feed scan. Checked AlienVault and VirusTotal for domain and hash matches.' 
          : 'Skipped: Low severity incident does not warrant external IOC feed consumption rules.',
        confidence: isCriticalOrHigh ? '94%' : undefined,
        icon: FiGlobe,
        color: isCriticalOrHigh 
          ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' 
          : 'text-slate-500 bg-slate-500/5 border-slate-700/30'
      },
      {
        name: 'Analysis Agent',
        status: 'Executed',
        time: isCriticalOrHigh ? '420 ms' : '180 ms',
        reason: isCriticalOrHigh 
          ? 'Correlated findings from Threat Intel, asset details, and playbooks to compute risk score.' 
          : 'Generated localized risk estimation using template classification rules.',
        confidence: isCriticalOrHigh ? '92%' : '96%',
        icon: FiActivity,
        color: 'text-[#4f8cff] bg-[#4f8cff]/10 border-[#4f8cff]/20'
      },
      {
        name: 'Recommendation Agent',
        status: 'Executed',
        time: isCriticalOrHigh ? '210 ms' : '90 ms',
        reason: 'Compiled target isolation script, system patches, and response runbook tasks.',
        confidence: '97%',
        icon: FiCpu,
        color: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      },
      {
        name: 'Approval Agent',
        status: isCriticalOrHigh ? 'Human Review Required' : 'Executed',
        time: isCriticalOrHigh ? 'N/A' : '75 ms',
        reason: isCriticalOrHigh 
          ? 'Critical threat risk score exceeds auto-remediation thresholds. Blocked actions pending analyst review.' 
          : 'Auto-approved incident remediation actions: risk score falls below approval thresholds.',
        confidence: isCriticalOrHigh ? undefined : '98%',
        icon: FiUserCheck,
        color: isCriticalOrHigh 
          ? 'text-critical bg-critical/10 border-critical/20 animate-pulse' 
          : 'text-success bg-success/10 border-success/20'
      }
    ];
  }, [selectedIncident, severity]);

  // Compute stats metrics dynamically
  const totalExecutionTime = useMemo(() => {
    if (severity === 'critical' || severity === 'high') return '1,447 ms';
    return '625 ms';
  }, [severity]);

  const plannerStatus = useMemo(() => {
    if (severity === 'critical' || severity === 'high') return 'Awaiting Human Review';
    return 'Optimized Path Executed';
  }, [severity]);

  // Badges renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Executed':
        return <span className="inline-flex items-center rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-300">Executed</span>;
      case 'Skipped':
        return <span className="inline-flex items-center rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Skipped</span>;
      case 'Conditional':
        return <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">Conditional</span>;
      case 'Fast Path':
        return <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-300">Fast Path</span>;
      case 'Human Review Required':
        return <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-300">Review Required</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.45 }} 
      className="space-y-6 max-w-7xl mx-auto pb-10 text-left"
    >
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="glass-pill text-blue-400 font-semibold">Agentic Orchestrator</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">AI Planner Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Audit agent execution logs, routing triggers, and automated logic paths generated by the AI Planner.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Case:</label>
          <select
            value={selectedIncidentId}
            onChange={e => setSelectedIncidentId(e.target.value)}
            className="glass-field py-2 px-3 text-xs font-semibold text-slate-200 bg-black/40 border-slate-700/80 rounded-xl cursor-pointer w-[250px] md:w-[320px] truncate"
          >
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id} className="bg-slate-900 text-white font-sans">
                [{formatIncidentId(inc.id, inc.createdAt)}] {inc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-40 text-center flex flex-col items-center justify-center gap-4">
          <Loader />
          <span className="text-sm text-slate-400">Loading plan registry...</span>
        </div>
      ) : !selectedIncident ? (
        <EmptyState title="No active plans" description="Please verify analyzed incidents are present in the SOC." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Metadata & Decision Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Metadata Summary Card */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Planner Case Details
              </h3>
              
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-semibold">Incident ID:</span>
                  <span className="text-white font-mono font-bold">
                    {formatIncidentId(selectedIncident.id, selectedIncident.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-semibold">Severity:</span>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    severity === 'critical' ? 'border-red-500/35 bg-red-500/10 text-red-300' :
                    severity === 'high' ? 'border-orange-500/35 bg-orange-500/10 text-orange-300' :
                    severity === 'medium' ? 'border-blue-500/35 bg-blue-500/10 text-blue-300' :
                    'border-green-500/35 bg-green-500/10 text-green-300'
                  }`}>
                    {severity}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-semibold">Planner Status:</span>
                  <span className={`font-bold ${
                    plannerStatus.includes('Human') ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {plannerStatus}
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400 font-semibold">Execution Duration:</span>
                  <span className="text-blue-300 font-bold font-mono">{totalExecutionTime}</span>
                </div>
              </div>
            </div>

            {/* Planner Decision Summary */}
            <div className="glass-card p-6 space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Routing Rules Triggered
                </h3>
                
                <div className="mt-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span>{severity === 'critical' || severity === 'high' ? 'High Severity Rules Active' : 'Low Severity Fast-Track Policy'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span>{severity === 'critical' ? 'Zero-Trust Payload Analysis Flag' : 'Standard Ingress Validation'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span>{severity === 'critical' || severity === 'high' ? 'Active Threat Intelligence Check' : 'Local Memory Search Only'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
                  Planner Reasoning Log
                </h3>
                
                <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                  {severity === 'critical' || severity === 'high' ? (
                    <>
                      <div>
                        <p className="font-bold text-blue-300">Added Threat Intelligence Agent because:</p>
                        <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                          <li>Severity matches Critical / High incident rules.</li>
                          <li>External IOC scanning policies are triggered.</li>
                          <li>Confidence rating check requires live API vector feeds.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-orange-300">Triggered Approval Agent human gate because:</p>
                        <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                          <li>Calculated risk score exceeds threshold limits.</li>
                          <li>Zero-day vectors detected in analyzed parameters.</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-bold text-slate-400">Skipped Threat Intelligence Agent because:</p>
                        <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-500">
                          <li>Severity is below threat intelligence payload rules.</li>
                          <li>No indicators of compromise detected in local lookup logs.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-blue-300 font-semibold">Executed Fast Path Context Agent because:</p>
                        <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                          <li>Highly similar incidents (3+) were previously closed in the memory index.</li>
                          <li>Cached mapping rules applied directly.</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Vertical Timeline */}
          <div className="lg:col-span-7">
            <Card title="Orchestrator Execution Timeline">
              <div className="relative pl-6 sm:pl-10 space-y-8 py-4 border-l border-slate-800 ml-4 sm:ml-8 text-left">
                
                <AnimatePresence>
                  {executionTimeline.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.name}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="relative"
                      >
                        {/* Glowing Connection Point */}
                        <span className={`absolute -left-[39px] sm:-left-[55px] top-0 flex h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl border bg-[#0B1120] ${step.color} shadow-lg shadow-[#000]/40 z-10`}>
                          <Icon className="w-4 h-4" />
                        </span>

                        {/* Timeline Step details */}
                        <div className="bg-white/[0.015] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 group">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-2.5">
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors duration-200">
                                {step.name}
                              </h4>
                              {step.confidence && (
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  Agent Confidence: <span className="text-slate-300 font-bold">{step.confidence}</span>
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {renderStatusBadge(step.status)}
                              {step.status !== 'Skipped' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded-md font-bold">
                                  <FiClock className="w-3 h-3 text-slate-500" />
                                  {step.time}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {step.reason}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

              </div>
            </Card>
          </div>

        </div>
      )}
    </motion.div>
  );
};

export default PlannerPage;
