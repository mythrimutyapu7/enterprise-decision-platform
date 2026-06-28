import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiUser,
  FiXCircle,
  FiActivity,
} from "react-icons/fi";

interface Props {
  approval: any;
  confidence: number;
}

export default function ApprovalPanel({
  approval,
  confidence,
}: Props) {

  const approved = approval?.approved;

  return (

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-3xl border border-slate-700 bg-[#121826] p-6 shadow-xl flex flex-col"
    >

      {/* Header */}

      <div>

        <p className="text-xs uppercase tracking-[0.3em] text-blue-400">

          REVIEW

        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">

          Human Approval

        </h2>

      </div>

      {/* Status */}

      <div
        className={`mt-6 rounded-2xl border p-5 ${
          approved
            ? "border-green-500/30 bg-green-500/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >

        <div className="flex items-center gap-3">

          {approved ? (

            <FiCheckCircle
              className="text-green-400"
              size={24}
            />

          ) : (

            <FiClock
              className="text-yellow-400"
              size={24}
            />

          )}

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-400">

              Status

            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">

              {approval.execution_status}

            </h3>

          </div>

        </div>

      </div>

      {/* Analyst */}

      <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4">

        <div className="flex items-center gap-3">

          <FiUser className="text-blue-400" />

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-400">

              Assigned Reviewer

            </p>

            <p className="mt-2 text-white">

              {approval.approved_by || "Security Analyst"}

            </p>

          </div>

        </div>

      </div>

      {/* AI Confidence */}

      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <FiActivity className="text-cyan-400" />

            <span className="text-xs uppercase tracking-wider text-slate-400">

              AI Confidence

            </span>

          </div>

          <span className="text-xl font-bold text-white">

            {confidence}%

          </span>

        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">

          <div
            style={{ width: `${confidence}%` }}
            className="h-full rounded-full bg-cyan-400"
          />

        </div>

      </div>

      {/* Buttons */}

      <div className="mt-8 grid grid-cols-2 gap-3">

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500"
        >

          <FiCheckCircle />

          Approve

        </button>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500"
        >

          <FiXCircle />

          Reject

        </button>

      </div>

      {/* Download */}

      <button
        className="mt-auto flex items-center justify-center gap-3 rounded-2xl border border-slate-700 py-4 text-slate-300 transition hover:bg-slate-800"
      >

        <FiDownload />

        Download Investigation Report

      </button>

    </motion.div>

  );

}