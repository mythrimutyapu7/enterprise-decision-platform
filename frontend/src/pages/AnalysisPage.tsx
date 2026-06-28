import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

import {
  analyzeIncident,
  getSavedAnalysis,
} from "../services/incidentService";

import { AnalysisResponse } from "../types/incident";

import AnalysisHero from "../components/analysis/AnalysisHero";
import FindingsCard from "../components/analysis/FindingsCard";
import ActionsCard from "../components/analysis/ActionsCard";
import ApprovalPanel from "../components/analysis/ApprovalPanel";

export default function AnalysisPage() {
  const [searchParams] = useSearchParams();

  const incidentId = searchParams.get("id") ?? "";

  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] =
    useState<AnalysisResponse | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {

    if (!incidentId) return;

    async function load() {

      try {

        setLoading(true);

        setError("");

        // ----------------------------------
        // Try loading existing analysis
        // ----------------------------------

        const saved = await getSavedAnalysis(
          incidentId
        );

        if (saved) {

          setAnalysis(saved);

          return;

        }

        // ----------------------------------
        // No analysis yet → Run AI
        // ----------------------------------

        const generated =
          await analyzeIncident(
            incidentId
          );

        setAnalysis(generated);

      } catch (err: any) {

        setError(
          err?.message ||
          "Unable to analyze incident."
        );

      } finally {

        setLoading(false);

      }

    }

    load();

  }, [incidentId]);

  if (!incidentId) {

    return (

      <EmptyState
        title="No Incident Selected"
        description="Please select an incident."
      />

    );

  }

  if (loading) {

    return <Loader />;

  }

  if (!analysis || error) {

    return (

      <EmptyState
        title="Analysis Failed"
        description={
          error || "No analysis available."
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
            approval={analysis.approval}
            confidence={
              analysis.analysis.confidence
            }
          />

        </div>

      </div>

    </motion.div>

  );

}