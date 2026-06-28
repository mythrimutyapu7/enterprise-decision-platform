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
      className="rounded-2xl border border-slate-700 bg-[#121826] p-5 shadow-xl"
    >

      <p className="text-[11px] uppercase tracking-[0.25em] text-blue-400">
        REVIEW
      </p>

      <h2 className="mt-2 text-xl font-bold text-white">
        Human Approval
      </h2>

      {/* STATUS */}

      <div
        className={`mt-5 rounded-xl p-4 ${
          approved
            ? "bg-green-500/10 border border-green-500/20"
            : "bg-yellow-500/10 border border-yellow-500/20"
        }`}
      >

        <div className="flex items-center gap-3">

          {approved ? (
            <FiCheckCircle
              className="text-green-400"
              size={22}
            />
          ) : (
            <FiClock
              className="text-yellow-400"
              size={22}
            />
          )}

          <div>

            <p className="text-xs text-slate-400">
              Status
            </p>

            <h3 className="font-semibold text-white">
              {approval.execution_status}
            </h3>

          </div>

        </div>

      </div>

      {/* REVIEWER */}

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 p-3">

        <div className="flex items-center gap-2">

          <FiUser className="text-blue-400" />

          <span className="text-sm text-slate-300">
            {approval.approved_by || "Security Analyst"}
          </span>

        </div>

      </div>

      {/* CONFIDENCE */}

      <div className="mt-4">

        <div className="mb-2 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <FiActivity className="text-cyan-400" />

            <span className="text-sm text-slate-400">
              AI Confidence
            </span>

          </div>

          <span className="font-bold text-white">
            {confidence}%
          </span>

        </div>

        <div className="h-2 rounded-full bg-slate-700">

          <div
            className="h-full rounded-full bg-cyan-400"
            style={{
              width: `${confidence}%`
            }}
          />

        </div>

      </div>

      {/* BUTTONS */}

      <div className="mt-5 grid grid-cols-2 gap-3">

        <button
          className="rounded-xl bg-green-600 py-2.5 font-semibold text-white hover:bg-green-500"
        >
          <div className="flex items-center justify-center gap-2">

            <FiCheckCircle />

            Approve

          </div>
        </button>

        <button
          className="rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-500"
        >
          <div className="flex items-center justify-center gap-2">

            <FiXCircle />

            Reject

          </div>
        </button>

      </div>

      {/* DOWNLOAD */}

      <button
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
      >
        <FiDownload />

        Full Investigation Report
      </button>

    </motion.div>

  );

}