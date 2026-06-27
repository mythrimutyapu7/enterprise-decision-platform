import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

import { analyzeIncident } from "../services/incidentService";
import { AnalysisResponse } from "../types/incident";

import AnalysisHero from "../components/analysis/AnalysisHero";
import RiskScoreCard from "../components/analysis/RiskScoreCard";
import ContextCard from "../components/analysis/ContextCard";
import RecommendationCard from "../components/analysis/RecommendationCard";
import ApprovalCard from "../components/analysis/ApprovalCard";

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
                description="Select an incident to analyze."
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
                description={error}
            />
        );

    }

    return (

        <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            className="space-y-6"
        >

            <AnalysisHero incident={analysis.incident} />

            <div className="grid gap-6 xl:grid-cols-3">

                <div className="xl:col-span-2 space-y-6">

                    <RiskScoreCard
                        analysis={analysis.analysis}
                    />

                    <ContextCard
                        context={analysis.context}
                    />

                </div>

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