import { motion } from "framer-motion";
import {
  FiShield,
  FiArrowRight,
  FiTrendingUp,
  FiBriefcase,
} from "react-icons/fi";

interface Props {
  recommendation: any;
}

export default function ActionsCard({ recommendation }: Props) {
  const actions =
    recommendation.follow_up_actions?.length
      ? recommendation.follow_up_actions.slice(0, 3)
      : [recommendation.recommended_action];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700 bg-[#121826] p-5 shadow-xl"
    >
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.25em] text-blue-400">
          RESPONSE PLAN
        </p>

        <h2 className="mt-2 text-xl font-bold text-white">
          Recommended Actions
        </h2>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
        <div className="flex gap-3">
          <FiShield className="mt-1 text-blue-400 shrink-0" />

          <p className="text-sm leading-6 text-slate-200">
            {recommendation.recommended_action}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {actions.map((item: string, index: number) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2"
          >
            <FiArrowRight className="text-red-400 shrink-0" />

            <span className="text-sm text-slate-300 line-clamp-2">
              {item}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-900 p-3">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-400" />

            <span className="text-[11px] uppercase text-slate-400">
              Confidence
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-bold text-white">
            {recommendation.confidence}%
          </h3>
        </div>

        <div className="rounded-xl bg-slate-900 p-3">
          <div className="flex items-center gap-2">
            <FiBriefcase className="text-orange-400" />

            <span className="text-[11px] uppercase text-slate-400">
              Priority
            </span>
          </div>

          <h3 className="mt-2 text-base font-semibold text-red-400">
            {recommendation.action_priority}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}