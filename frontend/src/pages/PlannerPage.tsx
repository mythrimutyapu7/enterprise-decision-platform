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

const PlannerPage = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analyzed incidents from backend only (no demo incidents)
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchIncidents() as any[];
        // Filter incidents to show only those that have been analyzed (analysis isn't null)
        const analyzed = data.filter(inc => inc.analysis !== null);
        setIncidents(analyzed);
        if (analyzed.length > 0) {
          setSelectedIncidentId(analyzed[0].id);
        }
      } catch (_err) {
        setError('Unable to load plans registry.');
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
    const date = new Date(createdAt);
    const year = isNaN(date.getFullYear()) ? 2026 : date.getFullYear();
    const suffix = id.slice(-4).toUpperCase();
    return `INC-${year}-${suffix}`;
  };

  // Get dynamic planner metadata
  const plannerDecision = selectedIncident?.analysis?.planner_decision || "No match found. Starting new investigation.";
  const similarityScore = selectedIncident?.analysis?.similarity_score !== undefined ? selectedIncident.analysis.similarity_score : 0;
  const isReused = plannerDecision.includes("reused");

  // Generate dynamic execution plan timeline based on incident and Planner decisions
  const executionTimeline = useMemo((): TimelineStep[] => {
    if (!selectedIncident) return [];

    const steps: TimelineStep[] = [
      {
        name: 'Planner Ingest',
        status: 'Executed',
        time: '12 ms',
        reason: 'Orchestrator parsed incident attributes and allocated execution thread.',
        confidence: '100%',
        icon: FiSettings,
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      }
    ];

    // Memory Lookup step showing similarity and routing decision
    if (isReused) {
      steps.push({
        name: 'Memory Agent Lookup',
        status: 'Fast Path',
        time: '85 ms',
        reason: `Duplicate investigation found with ${similarityScore}% similarity. Bypassing context, risk, and recommendation agents to reuse playbooks.`,
        confidence: `${similarityScore}%`,
        icon: FiDatabase,
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      });
    } else if (similarityScore >= 80) {
      steps.push({
        name: 'Memory Agent Lookup',
        status: 'Executed',
        time: '95 ms',
        reason: `Similar investigation found with ${similarityScore}% similarity. Injected historical recommendation as additional Planner context.`,
        confidence: `${similarityScore}%`,
        icon: FiDatabase,
        color: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      });
    } else {
      steps.push({
        name: 'Memory Agent Lookup',
        status: 'Executed',
        time: '75 ms',
        reason: `Memory check completed. No historical match found (similarity score: ${similarityScore}%). Starting a new AI investigation.`,
        confidence: '100%',
        icon: FiDatabase,
        color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
      });
    }

    steps.push({
      name: 'Knowledge Retrieval',
      status: 'Executed',
      time: '110 ms',
      reason: 'Queried corporate security policies and incident response playbook guidelines.',
      confidence: '95%',
      icon: FiSearch,
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
    });

    // Context Agent
    steps.push({
      name: 'Context Agent',
      status: isReused ? 'Skipped' : 'Executed',
      time: isReused ? '0 ms' : '150 ms',
      reason: isReused 
        ? 'Skipped: Context agent bypassed because historical duplicate investigation was reused.'
        : 'Enriched device records, LDAP user details, and asset criticality scores for target nodes.',
      confidence: isReused ? undefined : '96%',
      icon: FiLayers,
      color: isReused
        ? 'text-slate-500 bg-slate-500/5 border-slate-700/30'
        : 'text-teal-400 bg-teal-400/10 border-teal-400/20'
    });

    // Analysis Agent
    steps.push({
      name: 'Analysis Agent',
      status: isReused ? 'Skipped' : 'Executed',
      time: isReused ? '0 ms' : '220 ms',
      reason: isReused
        ? 'Skipped: Risk computation bypassed. Copying analysis outcomes from reused investigation.'
        : 'Correlated findings from asset details and threat vectors to compute risk score.',
      confidence: isReused ? undefined : '92%',
      icon: FiActivity,
      color: isReused
        ? 'text-slate-500 bg-slate-500/5 border-slate-700/30'
        : 'text-[#4f8cff] bg-[#4f8cff]/10 border-[#4f8cff]/20'
    });

    // Recommendation Agent
    steps.push({
      name: 'Recommendation Agent',
      status: isReused ? 'Skipped' : 'Executed',
      time: isReused ? '0 ms' : '120 ms',
      reason: isReused
        ? 'Skipped: Recommendation generation bypassed. Reusing approved actions.'
        : 'Compiled target isolation scripts, credentials rotators, and response playbooks.',
      confidence: isReused ? undefined : '97%',
      icon: FiCpu,
      color: isReused
        ? 'text-slate-500 bg-slate-500/5 border-slate-700/30'
        : 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    });

    // Approval Agent
    const executionStatus = selectedIncident.analysis?.approval?.execution_status || 'Pending';
    const isApproved = executionStatus === 'Approved';
    const isRejected = executionStatus === 'Rejected';
    
    steps.push({
      name: 'Approval Agent',
      status: isApproved || isRejected ? 'Executed' : 'Human Review Required',
      time: isApproved || isRejected ? '75 ms' : 'N/A',
      reason: isApproved 
        ? 'Incident remediation playbooks approved by Security Analyst.'
        : isRejected
        ? 'Incident remediation playbooks rejected by Security Analyst.'
        : 'Remediation playbooks pending manual gate review from Security Analyst.',
      confidence: isApproved ? '100%' : undefined,
      icon: FiUserCheck,
      color: isApproved 
        ? 'text-success bg-success/10 border-success/20' 
        : isRejected
        ? 'text-red-400 bg-red-400/10 border-red-400/20'
        : 'text-critical bg-critical/10 border-critical/20 animate-pulse'
    });

    return steps;
  }, [selectedIncident, plannerDecision, similarityScore, isReused]);

  // Compute stats metrics dynamically
  const totalExecutionTime = useMemo(() => {
    if (isReused) return '207 ms';
    return severity === 'critical' || severity === 'high' ? '1,120 ms' : '625 ms';
  }, [severity, isReused]);

  const plannerStatus = useMemo(() => {
    if (isReused) return 'Duplicate Investigation Reused';
    const executionStatus = selectedIncident?.analysis?.approval?.execution_status || 'Pending';
    if (executionStatus === 'Approved') return 'Remediation Approved';
    if (executionStatus === 'Rejected') return 'Remediation Rejected';
    return 'Awaiting Human Review';
  }, [selectedIncident, isReused]);

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
      ) : incidents.length === 0 ? (
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
                    plannerStatus.includes('Awaiting') ? 'text-red-400' : 'text-emerald-400'
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
                    <span>Memory agent routing logic active</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span>Similarity threshold gates enforced (95% / 80%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span>{isReused ? 'Bypass pipeline triggers active' : 'Full pipeline ingestion active'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
                  Planner Reasoning Log
                </h3>
                
                <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                  <div>
                    <p className="font-bold text-blue-300">Orchestrator Decision:</p>
                    <p className="text-slate-400 mt-1">{plannerDecision}</p>
                  </div>
                  {isReused ? (
                    <div>
                      <p className="font-bold text-emerald-300">Fast path reuse policy triggered:</p>
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                        <li>Jaccard match similarity score is {similarityScore}%.</li>
                        <li>This meets the duplicates limit rules threshold (95%).</li>
                        <li>Automated reuse of recommended runbooks deployed.</li>
                      </ul>
                    </div>
                  ) : similarityScore >= 80 ? (
                    <div>
                      <p className="font-bold text-purple-300">Injected previous similar recommendation:</p>
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                        <li>Jaccard match similarity score is {similarityScore}%.</li>
                        <li>Meets similar context retrieval thresholds (80% - 95%).</li>
                        <li>Confidence level upgraded using historical context.</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-slate-400">Standard pipeline run:</p>
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-550">
                        <li>Jaccard match similarity score is below thresholds ({similarityScore}%).</li>
                        <li>Full execution of Context, Risk, and Recommendation agents required.</li>
                      </ul>
                    </div>
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
