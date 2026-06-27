import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiCalendar,
} from "react-icons/fi";

interface Props {
  approval: any;
}

export default function ApprovalCard({ approval }: Props) {
  const approved = approval?.approved;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-700 bg-[#121826] p-8 shadow-xl"
    >
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-400">
          HUMAN APPROVAL
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Approval Workflow
        </h2>
      </div>

      {/* Status */}

      <div
        className={`rounded-2xl border p-6 ${
          approved
            ? "border-green-500/30 bg-green-500/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >
        <div className="flex items-center gap-4">
          {approved ? (
            <FiCheckCircle
              size={30}
              className="text-green-400"
            />
          ) : (
            <FiClock
              size={30}
              className="text-yellow-400"
            />
          )}

          <div>
            <p className="text-xs uppercase text-slate-400">
              Current Status
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {approval.execution_status}
            </h3>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-5">

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">

          <div className="flex items-center gap-3">

            <FiUser className="text-blue-400" />

            <div>

              <p className="text-xs uppercase text-slate-500">
                Approved By
              </p>

              <p className="mt-1 text-white">
                {approval.approved_by || "Pending Approval"}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">

          <div className="flex items-center gap-3">

            <FiCalendar className="text-cyan-400" />

            <div>

              <p className="text-xs uppercase text-slate-500">
                Approval Time
              </p>

              <p className="mt-1 text-white">
                {approval.approval_timestamp || "-"}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">

          <div className="flex items-start gap-3">

            <FiMessageSquare className="mt-1 text-orange-400" />

            <div>

              <p className="text-xs uppercase text-slate-500">
                Reviewer Comments
              </p>

              <p className="mt-2 leading-6 text-slate-300">
                {approval.reviewer_comments ||
                  "Awaiting analyst approval before execution."}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Demo Buttons */}

      <div className="mt-8 grid grid-cols-2 gap-3">

        <button
          className="rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500"
        >
          Approve
        </button>

        <button
          className="rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          Reject
        </button>

      </div>
    </motion.div>
  );
}