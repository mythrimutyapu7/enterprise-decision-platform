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

  return (

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-3xl border border-slate-700 bg-[#121826] p-6 shadow-xl"
    >

      {/* Header */}

      <div className="mb-6">

        <p className="text-xs uppercase tracking-[0.3em] text-blue-400">

          AI FINDINGS

        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">

          Key Indicators

        </h2>

      </div>

      {/* Findings */}

      <div>

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">

          Top Findings

        </h3>

        <div className="space-y-3">

          {findings?.slice(0, 5).map((item, index) => (

            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4"
            >

              <FiCheckCircle
                className="mt-1 shrink-0 text-green-400"
                size={18}
              />

              <p className="text-sm leading-6 text-slate-300">

                {item}

              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Missing Information */}

      <div className="mt-8">

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">

          Missing Information

        </h3>

        <div className="space-y-3">

          {missing?.slice(0, 3).map((item, index) => (

            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
            >

              <FiAlertCircle
                className="mt-1 shrink-0 text-yellow-400"
                size={18}
              />

              <p className="text-sm leading-6 text-slate-300">

                {item}

              </p>

            </div>

          ))}

        </div>

      </div>

    </motion.div>

  );

}