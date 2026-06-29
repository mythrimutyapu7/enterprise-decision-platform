import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

interface Props {
  findings: string[];
  missing: string[];
}

export default function FindingsCard({
  findings,
  missing,
}: Props) {

  const topFindings = findings?.slice(0, 5) ?? [];
  const topMissing = missing?.slice(0, 2) ?? [];

  return (

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700 bg-[#121826] p-5 shadow-xl"
    >

      <p className="text-[11px] uppercase tracking-[0.28em] text-blue-400">

        AI FINDINGS

      </p>

      <h2 className="mt-2 text-xl font-bold text-white">

        Key Indicators

      </h2>

      {/* Findings */}

      <div className="mt-5">

        <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">

          Top Findings

        </h3>

        <div className="space-y-2">

          {topFindings.map((item, index) => (

            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            >

              <FiCheckCircle
                className="mt-0.5 shrink-0 text-green-400"
                size={16}
              />

              <p className="break-words text-sm text-slate-300 line-clamp-2">

                {item}

              </p>

            </div>

          ))}

        </div>

        {findings.length > 5 && (

          <p className="mt-2 text-xs text-slate-500">

            + {findings.length - 5} more findings in full report

          </p>

        )}

      </div>

      {/* Missing */}

      <div className="mt-6">

        <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">

          Missing Information

        </h3>

        <div className="space-y-2">

          {topMissing.map((item, index) => (

            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2"
            >

              <FiAlertCircle
                className="mt-0.5 shrink-0 text-yellow-400"
                size={16}
              />

              <p className="break-words text-sm text-slate-300 line-clamp-2">

                {item}

              </p>

            </div>

          ))}

        </div>

        {missing.length > 2 && (

          <p className="mt-2 text-xs text-slate-500">

            + {missing.length - 2} more items in full report

          </p>

        )}

      </div>

    </motion.div>

  );

}