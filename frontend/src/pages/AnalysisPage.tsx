import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

import AnalysisHero from "../components/analysis/AnalysisHero";
import RiskScoreCard from "../components/analysis/RiskScoreCard";
import ContextCard from "../components/analysis/ContextCard";
import RecommendationCard from "../components/analysis/RecommendationCard";
import ApprovalCard from "../components/analysis/ApprovalCard";

import { analyzeIncident } from "../services/incidentService";
import { AnalysisResponse } from "../types/incident";

export default function AnalysisPage() {
    const [searchParams] = useSearchParams();

    const incidentId = searchParams.get("id");

    const [loading, setLoading] = useState(true);

    const [analysis, setAnalysis] =
        useState<AnalysisResponse | null>(null);

    const [error, setError] = useState("");

    useEffect(() => {

        if (!incidentId) return;

        async function load() {

            try {

                setLoading(true);

                const result = await analyzeIncident(incidentId);

                setAnalysis(result);

            } catch {

                setError("Unable to analyze incident.");

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
                description={error || "No analysis available"}
            />

        );

    }

    return (

        <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ duration:0.35 }}
            className="space-y-6"
        >

            {/* Hero */}

            <AnalysisHero
                incident={analysis.incident}
            />

            {/* Main Grid */}

            <div className="grid gap-6 xl:grid-cols-3">

                {/* Left */}

                <div className="space-y-6 xl:col-span-2">

                    <RiskScoreCard
                        analysis={analysis.analysis}
                    />

                    <ContextCard
                        context={analysis.context}
                    />

                </div>

                {/* Right */}

                <div className="space-y-6">

                    <RecommendationCard
                        recommendation={analysis.recommendation}
                    />

                    <ApprovalCard
                        approval={analysis.approval}
                    />

                </div>

            </div>

        </motion.div>

    );

}