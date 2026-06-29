import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

import {
  approveRecommendation,
  analyzeIncident,
  fetchIncidentById,
  downloadInvestigationReport,
  getSavedAnalysis,
  rejectRecommendation,
} from "../services/incidentService";

import { AnalysisResponse } from "../types/incident";

import AnalysisHero from "../components/analysis/AnalysisHero";
import FindingsCard from "../components/analysis/FindingsCard";
import ActionsCard from "../components/analysis/ActionsCard";
import ApprovalPanel from "../components/analysis/ApprovalPanel";
import AnalystNotesCard from "../components/analysis/AnalystNotesCard";

export default function AnalysisPage() {

  const [searchParams] = useSearchParams();

  const urlIncidentId = searchParams.get("id");

  const incidentId =
    urlIncidentId ||
    localStorage.getItem("lastAnalysisId") ||
    "";

  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] =
    useState<AnalysisResponse | null>(null);

  const [error, setError] = useState("");
  const [isUpdatingApproval, setIsUpdatingApproval] =
    useState(false);
  const [analystNotes, setAnalystNotes] = useState("");

  const loadAnalystNotes = async () => {

    try {

      const incidentDetails = await fetchIncidentById(
        incidentId
      );

      setAnalystNotes(incidentDetails.analystNotes || "");

    }

    catch {

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

    }

    catch {

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

    }

    catch (err: any) {

      setError(err?.message || "Unable to approve recommendation.");

    }

    finally {

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

    }

    catch (err: any) {

      setError(err?.message || "Unable to reject recommendation.");

    }

    finally {

      setIsUpdatingApproval(false);

    }

  };

  useEffect(() => {

    if (!incidentId) {

      setLoading(false);

      return;

    }

    async function load() {

      try {

        setLoading(true);

        setError("");

        // -----------------------------
        // Load saved analysis first
        // -----------------------------

        const saved =
          await getSavedAnalysis(
            incidentId
          );

        if (saved) {

          localStorage.setItem(
            "lastAnalysisId",
            incidentId
          );

          setAnalysis(saved);

          await loadAnalystNotes();

          return;

        }

        // -----------------------------
        // Generate AI analysis
        // -----------------------------

        const generated =
          await analyzeIncident(
            incidentId
          );

        localStorage.setItem(
          "lastAnalysisId",
          incidentId
        );

        setAnalysis(generated);

        await loadAnalystNotes();

      }

      catch (err: any) {

        setError(
          err?.message ??
          "Unable to analyze incident."
        );

      }

      finally {

        setLoading(false);

      }

    }

    load();

  }, [incidentId]);

  if (!incidentId) {

    return (

      <EmptyState
        title="No Incident Selected"
        description="Open an incident first."
      />

    );

  }

  if (loading) {

    return <Loader />;

  }

  if (!analysis) {

    return (

      <EmptyState
        title="Analysis Not Available"
        description={
          error ||
          "No analysis found."
        }
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

      <div className="grid gap-5 xl:grid-cols-12">

        <div className="xl:col-span-4">

          <FindingsCard
            findings={
              analysis.analysis.indicators
            }
            missing={
              analysis.analysis
                .missing_information
            }
          />

        </div>

        <div className="xl:col-span-4">

          <ActionsCard
            recommendation={
              analysis.recommendation
            }
          />

        </div>

        <div className="xl:col-span-4">

          <ApprovalPanel
            approval={
              analysis.approval
            }
            confidence={
              analysis.analysis
                .confidence
            }
            onDownloadReport={
              handleDownloadReport
            }
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