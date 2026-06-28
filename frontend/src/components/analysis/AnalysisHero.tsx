import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";

interface Props {
  incident: any;
  analysis: any;
}

const severityStyle: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-300 border-red-500/30",
  High: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Medium: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  Low: "bg-green-500/15 text-green-300 border-green-500/30",
};

export default function AnalysisHero({
  incident,
  analysis,
}: Props) {

  return (

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-700 bg-[#121826] p-8 shadow-xl"
    >

      <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

        {/* LEFT */}

        <div className="max-w-4xl min-w-0">

          <p className="text-xs uppercase tracking-[0.35em] text-blue-400">

            AI SECURITY ANALYSIS

          </p>

          <h1 className="mt-3 break-words text-4xl font-bold text-white">

            {incident.title}

          </h1>

          <p className="mt-5 break-words leading-8 text-slate-300">

            {incident.summary}

          </p>

        </div>

        {/* RIGHT */}

        <div className="grid grid-cols-3 gap-4">

          {/* Risk */}

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">

            <FiAlertTriangle
              className="mx-auto text-red-400"
              size={26}
            />

            <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">

              Risk

            </p>

            <h2 className="mt-2 text-4xl font-bold text-red-400">

              {analysis.risk_score}

            </h2>

          </div>

          {/* Confidence */}

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-center">

            <FiTrendingUp
              className="mx-auto text-blue-400"
              size={26}
            />

            <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">

              Confidence

            </p>

            <h2 className="mt-2 text-4xl font-bold text-blue-300">

              {analysis.confidence}%

            </h2>

          </div>

          {/* Severity */}

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-center">

            <FiShield
              className="mx-auto text-orange-400"
              size={26}
            />

            <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">

              Severity

            </p>

            <div
              className={`mt-3 rounded-full border px-3 py-2 text-sm font-semibold ${
                severityStyle[incident.severity] ||
                severityStyle.High
              }`}
            >

              {incident.severity}

            </div>

          </div>

        </div>

      </div>

    </motion.div>

  );

}