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

            initial={{ opacity:0, y:20 }}

            animate={{ opacity:1, y:0 }}

            className="rounded-3xl border border-slate-700 bg-[#121826] p-8 shadow-2xl"

        >

            <div className="flex items-start justify-between flex-wrap gap-8">

                <div>

                    <p className="text-xs uppercase tracking-[0.35em] text-blue-400">

                        AI INCIDENT REPORT

                    </p>

                    <h1 className="mt-3 text-4xl font-bold text-white">

                        {incident.title}

                    </h1>

                    <p className="mt-5 max-w-3xl text-slate-300 leading-7">

                        {incident.summary}

                    </p>

                </div>

                <div>

                    <span
                        className={`rounded-full border px-5 py-2 font-semibold ${
                            severityColor[incident.severity] ||
                            severityColor.High
                        }`}
                    >
                        {incident.severity}
                    </span>

                </div>

            </div>

            <div className="mt-10 grid md:grid-cols-4 gap-5">

                <div className="rounded-2xl bg-slate-900 p-5 border border-slate-700">

                    <FiShield className="text-blue-400 text-2xl" />

                    <p className="mt-4 text-xs uppercase text-slate-500">

                        Incident Type

                    </p>

                    <h3 className="mt-2 font-semibold text-white">

                        {incident.incident_type}

                    </h3>

                </div>

                <div className="rounded-2xl bg-slate-900 p-5 border border-slate-700">

                    <FiDatabase className="text-cyan-400 text-2xl" />

                    <p className="mt-4 text-xs uppercase text-slate-500">

                        Source

                    </p>

                    <h3 className="mt-2 font-semibold text-white">

                        {incident.source}

                    </h3>

                </div>

                <div className="rounded-2xl bg-slate-900 p-5 border border-slate-700">

                    <FiCpu className="text-violet-400 text-2xl" />

                    <p className="mt-4 text-xs uppercase text-slate-500">

                        AI Classification

                    </p>

                    <h3 className="mt-2 font-semibold text-white">

                        {incident.incident_type}

                    </h3>

                </div>

                <div className="rounded-2xl bg-slate-900 p-5 border border-slate-700">

                    <FiAlertTriangle className="text-red-400 text-2xl" />

                    <p className="mt-4 text-xs uppercase text-slate-500">

                        Severity

                    </p>

                    <h3 className="mt-2 font-semibold text-white">

                        {incident.severity}

                    </h3>

                </div>

            </div>

        </motion.div>

    );

}