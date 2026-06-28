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

  const urlIncidentId = searchParams.get("id");

  const incidentId =
    urlIncidentId ||
    localStorage.getItem("lastAnalysisId") ||
    "";

  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] =
    useState<AnalysisResponse | null>(null);

  const [error, setError] = useState("");

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
          />

        </div>

      </div>

    </motion.div>

  );

}