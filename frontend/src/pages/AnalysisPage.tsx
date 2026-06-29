import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  FiDatabase, 
  FiSearch, 
  FiCheckCircle, 
  FiCpu, 
  FiClock, 
  FiAlertTriangle, 
  FiArrowRight, 
  FiRefreshCw, 
  FiActivity, 
  FiLayers,
  FiUser
} from "react-icons/fi";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/common/Card";

import {
  approveRecommendation,
  analyzeIncident,
  fetchIncidentById,
  downloadInvestigationReport,
  getSavedAnalysis,
  rejectRecommendation,
  searchMemory,
} from "../services/incidentService";

import { AnalysisResponse } from "../types/incident";

import AnalysisHero from "../components/analysis/AnalysisHero";
import FindingsCard from "../components/analysis/FindingsCard";
import ActionsCard from "../components/analysis/ActionsCard";
import ApprovalPanel from "../components/analysis/ApprovalPanel";
import AnalystNotesCard from "../components/analysis/AnalystNotesCard";

const SEARCH_MESSAGES = [
  "Searching historical investigations...",
  "Comparing incident characteristics...",
  "Checking analyst decisions...",
  "Searching previous resolutions...",
  "Finding similar investigations..."
];

export default function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlIncidentId = searchParams.get("id");

  const incidentId =
    urlIncidentId ||
    localStorage.getItem("lastAnalysisId") ||
    "";

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);
  const [analystNotes, setAnalystNotes] = useState("");

  // Case Memory Search Flow States
  // 'idle' | 'searching' | 'match_found' | 'fresh_analysis_running'
  const [searchState, setSearchState] = useState<"idle" | "searching" | "match_found" | "fresh_analysis_running">("idle");
  const [searchMessageIndex, setSearchMessageIndex] = useState(0);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchStatusText, setSearchStatusText] = useState("");
  const searchMessageInterval = useRef<any>(null);

  const loadAnalystNotes = async () => {
    try {
      const incidentDetails = await fetchIncidentById(incidentId);
      setAnalystNotes(incidentDetails.analystNotes || "");
    } catch {
      setAnalystNotes("");
    }
  };

  const handleDownloadReport = async () => {
    try {
      const report = await downloadInvestigationReport(incidentId);
      const reportUrl = window.URL.createObjectURL(report);
      const link = document.createElement("a");
      link.href = reportUrl;
      link.download = `investigation-report-${incidentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(reportUrl);
    } catch {
      setError("Unable to download investigation report.");
    }
  };

  const refreshAnalysis = async () => {
    const latest = await getSavedAnalysis(incidentId);
    if (latest) {
      setAnalysis(latest);
    }
  };

  const handleApprove = async () => {
    try {
      setIsUpdatingApproval(true);
      setError("");
      const response = await approveRecommendation(incidentId);
      if (!response?.success) {
        throw new Error(response?.error || "Approval failed.");
      }
      await refreshAnalysis();
    } catch (err: any) {
      setError(err?.message || "Unable to approve recommendation.");
    } finally {
      setIsUpdatingApproval(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsUpdatingApproval(true);
      setError("");
      const response = await rejectRecommendation(incidentId);
      if (!response?.success) {
        throw new Error(response?.error || "Rejection failed.");
      }
      await refreshAnalysis();
    } catch (err: any) {
      setError(err?.message || "Unable to reject recommendation.");
    } finally {
      setIsUpdatingApproval(false);
    }
  };

  // Perform Memory Search and potential Auto-routing
  const performMemorySearchAndAnalysis = async () => {
    try {
      setLoading(false);
      setSearchState("searching");
      setSearchMessageIndex(0);
      setError("");

      // Start stepping through loading messages
      searchMessageInterval.current = setInterval(() => {
        setSearchMessageIndex((prev) => {
          if (prev < SEARCH_MESSAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 700);

      // Trigger backend similarity lookup
      const memoryResult = await searchMemory(incidentId);
      setSearchResult(memoryResult);

      // Enforce clean delay so the user experiences the SOC scans
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clearInterval(searchMessageInterval.current);

      if (memoryResult.success && memoryResult.similarity >= 95) {
        // High similarity: stop and present decision gate screen
        setSearchState("match_found");
      } else {
        // Low/Medium similarity: display status text and run fresh analysis automatically
        if (memoryResult.similarity >= 80) {
          setSearchStatusText(`Similar investigation found (${memoryResult.similarity}% similarity). Passing context to Planner and starting a new AI investigation...`);
        } else {
          setSearchStatusText("No historical match found. Starting a new AI investigation...");
        }

        // Leave notice on screen for 1.5 seconds
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await triggerFreshAnalysis(false);
      }
    } catch (err: any) {
      clearInterval(searchMessageInterval.current);
      setError(err?.message || "Memory search failed. Executing fresh analysis.");
      await triggerFreshAnalysis(true);
    }
  };

  // Run AI analysis pipeline
  const triggerFreshAnalysis = async (force: boolean) => {
    try {
      setSearchState("fresh_analysis_running");
      const generated = await analyzeIncident(incidentId, force);
      localStorage.setItem("lastAnalysisId", incidentId);
      setAnalysis(generated);
      await loadAnalystNotes();
      setSearchState("idle");
    } catch (err: any) {
      setError(err?.message || "Unable to analyze incident.");
      setSearchState("idle");
    }
  };

  // Initialize page loading check
  useEffect(() => {
    if (!incidentId) {
      setLoading(false);
      return;
    }

    async function checkExistingAnalysis() {
      try {
        setLoading(true);
        setError("");
        
        const saved = await getSavedAnalysis(incidentId);
        if (saved) {
          localStorage.setItem("lastAnalysisId", incidentId);
          setAnalysis(saved);
          await loadAnalystNotes();
          setLoading(false);
        } else {
          // If no saved analysis, start the Memory Search lookup workflow
          await performMemorySearchAndAnalysis();
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load case information.");
        setLoading(false);
      }
    }

    checkExistingAnalysis();

    return () => {
      if (searchMessageInterval.current) {
        clearInterval(searchMessageInterval.current);
      }
    };
  }, [incidentId]);

  if (!incidentId) {
    return (
      <EmptyState
        title="No Incident Selected"
        description="Open an incident first."
      />
    );
  }

  // Loader screen
  if (loading) {
    return <Loader />;
  }

  // Dynamic Case Memory Search Loading Workflow Screen
  if (searchState === "searching") {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="glass-card p-10 border border-white/10 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
          
          <div className="relative mb-8">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse">
              <FiDatabase className="h-8 w-8 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur-md -z-10 animate-pulse" />
          </div>

          <span className="glass-pill text-blue-400 font-semibold text-xs tracking-wider uppercase">Enterprise Memory Search</span>
          
          <h2 className="text-xl font-bold text-white mt-4 tracking-tight min-h-[28px]">
            {SEARCH_MESSAGES[searchMessageIndex]}
          </h2>

          <p className="text-slate-400 text-sm mt-2 max-w-sm">
            AI Planner is auditing the long-term memory index to isolate matching patterns and playbooks.
          </p>

          {/* Micro progress indicator */}
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full mt-8 overflow-hidden border border-slate-700/30">
            <motion.div 
              className="bg-blue-500 h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((searchMessageIndex + 1) / SEARCH_MESSAGES.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="flex items-center gap-2 mt-8 text-xs text-slate-500 font-mono">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span>Scanning MongoDB Memory Index...</span>
          </div>
        </div>
      </div>
    );
  }

  // Similarity auto-transition status screen
  if (searchState === "fresh_analysis_running") {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="glass-card p-10 border border-white/10 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
          
          <div className="relative mb-8">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FiCpu className="h-8 w-8 animate-pulse" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md -z-10 animate-pulse" />
          </div>

          <span className="glass-pill text-emerald-400 font-semibold text-xs tracking-wider uppercase">Orchestrator Execution</span>
          
          <h2 className="text-lg font-bold text-white mt-4 tracking-tight leading-relaxed">
            {searchStatusText || "Starting a new AI investigation..."}
          </h2>

          <div className="flex items-center gap-3 mt-8 text-sm text-slate-300 bg-slate-900/50 border border-slate-800/80 px-4 py-2.5 rounded-xl">
            <FiRefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
            <span className="font-semibold">Executing Autonomous AI Agents...</span>
          </div>
        </div>
      </div>
    );
  }

  // High Similarity Decision Gate screen
  if (searchState === "match_found" && searchResult) {
    const match = searchResult.match;
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.45 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <span className="glass-pill text-emerald-400 font-semibold text-xs tracking-wider uppercase">Duplicate Check Completed</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">Enterprise Memory Match Found</h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-lg mx-auto">
              Our Memory Agent detected an equivalent security investigation previously approved by a SOC analyst.
            </p>
          </div>

          {/* Glass Decision Card */}
          <div className="glass-card border border-white/10 p-8 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Top row: Match % */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FiDatabase className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Similarity Score</h4>
                  <p className="text-sm font-semibold text-slate-300">Jaccard Weighted Overlap</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="inline-flex items-center rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-1.5 text-2xl font-black font-mono text-emerald-300 shadow-lg shadow-emerald-500/5">
                  {searchResult.similarity}%
                </span>
              </div>
            </div>

            {/* Comparison logs table */}
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Existing Investigation</span>
                  <p className="mt-0.5 text-sm font-bold font-mono text-white">{match.incident_id}</p>
                </div>
                
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Incident Title</span>
                  <p className="mt-0.5 text-sm font-bold text-slate-200">{match.title}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Severity</span>
                  <p className="mt-1">
                    <span className="inline-flex items-center rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
                      {match.severity}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Previously Approved</span>
                  <p className="mt-0.5 text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <FiCheckCircle className="h-4 w-4" />
                    <span>{match.approved ? "Yes" : "No"}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resolution Time</span>
                  <p className="mt-0.5 text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <FiClock className="h-4 w-4 text-slate-400" />
                    <span>{match.resolution_time}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Primary Recommendation</span>
                  <p className="mt-0.5 text-xs text-slate-300 leading-normal line-clamp-2 italic">
                    "{match.recommendation}"
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions grid */}
            <div className="border-t border-white/5 pt-6 mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button
                type="button"
                onClick={() => triggerFreshAnalysis(true)}
                className="w-full sm:w-auto glass-button gap-2 px-5 py-3 hover:border-slate-600 transition-colors"
              >
                <FiRefreshCw className="h-4 w-4" />
                Run Fresh Analysis Anyway
              </button>

              <button
                type="button"
                onClick={() => navigate(`/analysis?id=${match.id}`)}
                className="w-full sm:w-auto primary-button gap-2 px-6 py-3 shadow-lg shadow-blue-500/10"
              >
                Open Existing Investigation
                <FiArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Verification error fallback
  if (!analysis) {
    return (
      <EmptyState
        title="Analysis Not Available"
        description={error || "No analysis found."}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <AnalysisHero
        incident={analysis.incident}
        analysis={analysis.analysis}
      />

      {analysis.planner_decision && (
        <div className="rounded-[20px] border border-blue-500/20 bg-blue-500/5 px-6 py-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FiLayers className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Planner Decision Outcome</p>
              <p className="text-sm font-semibold text-white mt-0.5">{analysis.planner_decision}</p>
            </div>
          </div>
          
          {analysis.similarity_score !== undefined && analysis.similarity_score > 0 && (
            <div className="text-right">
              <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-300">
                Similarity: {analysis.similarity_score}%
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <FindingsCard
            findings={analysis.analysis.indicators}
            missing={analysis.analysis.missing_information}
          />
        </div>

        <div className="xl:col-span-4">
          <ActionsCard
            recommendation={analysis.recommendation}
          />
        </div>

        <div className="xl:col-span-4">
          <ApprovalPanel
            approval={analysis.approval}
            confidence={analysis.analysis.confidence}
            onDownloadReport={handleDownloadReport}
            onApprove={handleApprove}
            onReject={handleReject}
            isUpdating={isUpdatingApproval}
          />
        </div>
      </div>

      <AnalystNotesCard
        incidentId={incidentId}
        initialNotes={analystNotes}
        onSaved={setAnalystNotes}
      />
    </motion.div>
  );
}