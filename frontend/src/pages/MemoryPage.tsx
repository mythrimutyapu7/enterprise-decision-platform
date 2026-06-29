import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiDatabase, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiClock, 
  FiShield, 
  FiBookOpen,
  FiArrowRight,
  FiPercent,
  FiActivity,
  FiUserCheck,
  FiAlertOctagon,
  FiRotateCcw
} from 'react-icons/fi';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { fetchMemory } from '../services/incidentService';

// Interfaces
interface MemoryItem {
  id: string;
  dbId: string;
  title: string;
  similarity: number;
  severity: string;
  recommendation: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  resolution: string;
  timeToResolution: string;
}

const MemoryPage = () => {
  const [memories, setMemories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load database memories
  useEffect(() => {
    const loadMemoryIncidents = async () => {
      try {
        const response = await fetchMemory();
        if (response.success) {
          setMemories(response.data || []);
        } else {
          setError(response.error || 'Could not retrieve memory registry.');
        }
      } catch (_err) {
        setError('Could not retrieve memory registry.');
      } finally {
        setIsLoading(false);
      }
    };
    loadMemoryIncidents();
  }, []);

  // Convert raw DB memories into normalized MemoryItems
  const memoryItems = useMemo((): MemoryItem[] => {
    return memories.map(item => {
      const title = item.title || 'Suspicious Alert Logged';
      const sev = (item.severity || 'low').toLowerCase();
      
      // Use similarity calculated during planning, or default to 100 for primary records
      const similarity = item.similarity !== undefined ? item.similarity : 100;
      
      const recommendation = item.recommendation?.recommended_action || 
        (sev === 'critical' || sev === 'high' 
          ? 'Quarantine the affected subnet, revoke credentials, and audit audit trails.' 
          : 'Monitor host metrics and reset active web portal sessions.');

      const status = item.approval?.execution_status === 'Approved' ? 'Approved' :
                     item.approval?.execution_status === 'Rejected' ? 'Rejected' : 'Pending';

      const resolution = item.approval?.reviewer_comments || 
        (status === 'Approved' 
          ? 'Remediation playbooks successfully deployed, threat vector contained.' 
          : 'Awaiting mitigation actions verification.');

      const timeToResolution = item.time_to_resolution || '15 mins';

      return {
        id: item.incident_id || item.original_incident_id || item._id || '',
        dbId: item.original_incident_id || item._id || '',
        title,
        similarity,
        severity: sev,
        recommendation,
        status,
        resolution,
        timeToResolution
      };
    });
  }, [memories]);

  // Memory Metrics Calculations
  const stats = useMemo(() => {
    const totalFound = memoryItems.length;
    
    // Average Jaccard Similarity of the matches stored in memory (seed items are 100)
    const sumSim = memoryItems.reduce((acc, curr) => acc + curr.similarity, 0);
    const avgSimilarity = totalFound ? Math.round(sumSim / totalFound) : 0;
    
    // Matched recommendations percentage (reused playbooks matching >= 80%)
    const matchedCount = memoryItems.filter(m => m.similarity >= 80).length;
    const recommendationReused = totalFound ? Math.round((matchedCount / totalFound) * 100) : 0;
    
    // Analyst approval rate on recommendations
    const approvedCount = memoryItems.filter(m => m.status === 'Approved').length;
    const avgApproval = totalFound ? Math.round((approvedCount / totalFound) * 100) : 0;

    return {
      totalFound,
      avgSimilarity,
      recommendationReused,
      avgApproval
    };
  }, [memoryItems]);

  // Interactive navigation to analysis page
  const handleCardClick = (item: MemoryItem) => {
    if (item.dbId && !item.dbId.startsWith('seed-incident-')) {
      navigate(`/analysis?id=${item.dbId}`);
    } else {
      navigate('/analysis');
    }
  };

  // Badge styles helper
  const getSimilarityBadge = (score: number) => {
    if (score >= 90) {
      return (
        <span className="inline-flex items-center rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-bold font-mono text-green-300">
          {score}% Match
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-bold font-mono text-amber-300">
          {score}% Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-bold font-mono text-red-300">
        {score}% Match
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') {
      return <span className="inline-flex items-center rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-300">Approved</span>;
    }
    if (status === 'Rejected') {
      return <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-300">Rejected</span>;
    }
    return <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Pending</span>;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.45 }} 
      className="space-y-6 max-w-7xl mx-auto pb-10 text-left"
    >
      {/* Title Header */}
      <div>
        <span className="glass-pill text-blue-400 font-semibold">SOC Memory Index</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">AI Case Memory</h1>
        <p className="mt-1 text-sm text-slate-400">
          Audit how the AI Planner analyzes historical cases to reuse recommended remediation playbooks and learn from analyst approval decisions.
        </p>
      </div>

      {isLoading ? (
        <div className="py-40 text-center flex flex-col items-center justify-center gap-4">
          <Loader />
          <span className="text-sm text-slate-400">Querying MongoDB incident memory store...</span>
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center text-red-400">
          <FiAlertOctagon className="h-10 w-10 mx-auto text-red-400 mb-3" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : memoryItems.length === 0 ? (
        <EmptyState 
          title="No previous investigations exist in organizational memory." 
          description="Analyze and approve incidents first to begin building the SOC memory index."
        />
      ) : (
        <>
          {/* Memory Summary stats cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FiDatabase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Similar Incidents Found</p>
                <h4 className="text-2xl font-black text-white mt-1 font-mono">{stats.totalFound}</h4>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiPercent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Similarity</p>
                <h4 className="text-2xl font-black text-white mt-1 font-mono">{stats.avgSimilarity}%</h4>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FiRotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Recommendation Reused</p>
                <h4 className="text-2xl font-black text-white mt-1 font-mono">{stats.recommendationReused}%</h4>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FiUserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Analyst Approval Rate</p>
                <h4 className="text-2xl font-black text-white mt-1 font-mono">{stats.avgApproval}%</h4>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Memory List */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Incidents Comparison Logs
              </h3>
              
              <AnimatePresence>
                {memoryItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    onClick={() => handleCardClick(item)}
                    className="group rounded-3xl border border-white/10 bg-white/[0.015] hover:bg-white/[0.03] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 cursor-pointer flex flex-col gap-4 text-left"
                  >
                    {/* Title & Similarity Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          ID: {item.id}
                        </span>
                        <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors duration-200">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.severity === 'critical' ? 'border-red-500/35 bg-red-500/10 text-red-300' :
                          item.severity === 'high' ? 'border-orange-500/35 bg-orange-500/10 text-orange-300' :
                          item.severity === 'medium' ? 'border-blue-500/35 bg-blue-500/10 text-blue-300' :
                          'border-green-500/35 bg-green-500/10 text-green-300'
                        }`}>
                          {item.severity}
                        </span>
                        {getSimilarityBadge(item.similarity)}
                      </div>
                    </div>

                    {/* Recommendation and Status */}
                    <div className="grid gap-4 sm:grid-cols-2 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/40 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Recommendation Reused</span>
                        <p className="mt-1 text-slate-300 leading-relaxed">{item.recommendation}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resolution</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="mt-1 text-slate-300 leading-relaxed">{item.resolution}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold font-sans pt-1">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>Remediation time: <span className="text-slate-300 font-bold font-mono">{item.timeToResolution}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-[#4f8cff] group-hover:translate-x-1 transition-transform duration-200">
                        <span>View Analytics</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right Column: Insights */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card p-6 space-y-5 text-left">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  AI Learning Insights
                </h3>
                
                <div className="space-y-4">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                      <FiActivity className="w-4 h-4 shrink-0" />
                      <span>Class Pattern Analysis</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The planner audits historical incident logs to automatically discover credential compromise and privilege escalation attack vectors.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <FiCheckCircle className="w-4 h-4 shrink-0" />
                      <span>Mitigation Consensus</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Playbooks and recommended actions approved by analysts in previous matching cases are automatically passed as context.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <FiTrendingUp className="w-4 h-4 shrink-0" />
                      <span>Confidence Escalation</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Confidence metrics are automatically adjusted upward when historical match resolutions align with security policies.
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 text-slate-500 text-[10px] italic leading-normal">
                  * Case memory weights are updated in the background each time an analyst approves or rejects a recommended remediation playbook.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MemoryPage;
