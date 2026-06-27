import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiCalendar,
  FiShield,
} from "react-icons/fi";

interface Props {
  approval: any;
}

export default function ApprovalCard({ approval }: Props) {
  const approved = approval?.approved;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-8"
    >
      {/* Header */}

      <div className="mb-8">

        <p className="eyebrow">
          HUMAN REVIEW
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Approval Workflow
        </h2>

        <p className="mt-3 leading-7 text-slate-400">
          AI recommendations require analyst approval before automated execution.
        </p>

      </div>

      {/* Status */}

      <div
        className={`rounded-3xl border p-6 ${
          approved
            ? "border-green-500/30 bg-green-500/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >
        <div className="flex items-center gap-5">

          <div
            className={`rounded-2xl p-4 ${
              approved
                ? "bg-green-500/20"
                : "bg-yellow-500/20"
            }`}
          >
            {approved ? (
              <FiCheckCircle
                size={34}
                className="text-green-400"
              />
            ) : (
              <FiClock
                size={34}
                className="text-yellow-400"
              />
            )}
          </div>

          <div>

            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Execution Status
            </p>

            <h3 className="mt-2 text-2xl font-bold text-white">
              {approval.execution_status}
            </h3>

          </div>

        </div>
      </div>

      {/* Details */}

      <div className="mt-8 space-y-4">

        <div className="premium-panel">

          <div className="flex items-center gap-4">

            <FiUser className="text-blue-400 text-xl" />

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Approved By
              </p>

              <p className="mt-2 text-white">
                {approval.approved_by || "Pending Analyst Review"}
              </p>

            </div>

          </div>

        </div>

        <div className="premium-panel">

          <div className="flex items-center gap-4">

            <FiCalendar className="text-cyan-400 text-xl" />

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Approval Timestamp
              </p>

              <p className="mt-2 text-white">
                {approval.approval_timestamp || "Not Available"}
              </p>

            </div>

          </div>

        </div>

        <div className="premium-panel">

          <div className="flex items-start gap-4">

            <FiMessageSquare className="mt-1 text-orange-400 text-xl" />

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Reviewer Comments
              </p>

              <p className="mt-3 leading-7 text-slate-300">
                {approval.reviewer_comments ||
                  "Awaiting manual analyst approval before execution."}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Action Buttons */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">

        <button className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500">

          <FiCheckCircle />

          Approve

        </button>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500">

          <FiShield />

          Reject

        </button>

      </div>

    </motion.div>
  );
}