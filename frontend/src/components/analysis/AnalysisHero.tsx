import { motion } from "framer-motion";
import {
    FiAlertTriangle,
    FiShield,
    FiCpu,
    FiDatabase
} from "react-icons/fi";

interface Props {
    incident: any;
}

const severityColor: Record<string, string> = {
    Critical: "bg-red-500/20 text-red-300 border-red-500/40",
    High: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    Low: "bg-green-500/20 text-green-300 border-green-500/40",
};

export default function AnalysisHero({ incident }: Props) {

   return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card overflow-hidden p-0"
    >

        {/* Header */}

        <div className="border-b border-white/10 bg-gradient-to-r from-[#111827] to-[#172554] p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                <div className="max-w-4xl">

                    <p className="eyebrow text-blue-400">
                        AI INCIDENT REPORT
                    </p>

                    <h1 className="mt-3 text-4xl font-bold text-white">
                        {incident.title}
                    </h1>

                    <p className="mt-5 leading-8 text-slate-300">
                        {incident.summary}
                    </p>

                </div>

                <div className="flex flex-col items-end gap-3">

                    <span
                        className={`rounded-full border px-5 py-2 font-semibold ${
                            severityColor[incident.severity] ||
                            severityColor.High
                        }`}
                    >
                        {incident.severity}
                    </span>

                    <span className="rounded-full bg-green-500/15 px-4 py-2 text-xs uppercase tracking-[0.25em] text-green-300">
                        AI Verified
                    </span>

                </div>

            </div>

        </div>

        {/* Stats */}

        <div className="grid gap-5 p-8 md:grid-cols-2 xl:grid-cols-4">

            <div className="premium-panel">

                <FiShield className="text-3xl text-blue-400"/>

                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-500">
                    Incident Type
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                    {incident.incident_type}
                </h3>

            </div>

            <div className="premium-panel">

                <FiDatabase className="text-3xl text-cyan-400"/>

                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-500">
                    Detection Source
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                    {incident.source}
                </h3>

            </div>

            <div className="premium-panel">

                <FiCpu className="text-3xl text-violet-400"/>

                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-500">
                    AI Classification
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                    {incident.incident_type}
                </h3>

            </div>

            <div className="premium-panel">

                <FiAlertTriangle className="text-3xl text-red-400"/>

                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-500">
                    Threat Severity
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                    {incident.severity}
                </h3>

            </div>

        </div>

    </motion.div>
);

}