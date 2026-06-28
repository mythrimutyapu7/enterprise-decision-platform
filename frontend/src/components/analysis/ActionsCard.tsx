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

export default function ActionsCard({
  recommendation,
}: Props) {

  const actions =
    recommendation.follow_up_actions?.length
      ? recommendation.follow_up_actions.slice(0, 4)
      : [
          recommendation.recommended_action,
        ];

  return (

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-3xl border border-slate-700 bg-[#121826] p-6 shadow-xl"
    >

      {/* Header */}

      <div className="mb-6">

        <p className="text-xs uppercase tracking-[0.3em] text-blue-400">

          RESPONSE PLAN

        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">

          Recommended Actions

        </h2>

      </div>

      {/* Primary Recommendation */}

      <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5">

        <div className="flex items-start gap-3">

          <FiShield
            className="mt-1 text-blue-400"
            size={22}
          />

          <div>

            <p className="text-xs uppercase tracking-wider text-slate-400">

              Primary Response

            </p>

            <p className="mt-2 text-sm leading-7 text-white">

              {recommendation.recommended_action}

            </p>

          </div>

        </div>

      </div>

      {/* Action List */}

      <div className="mt-6">

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">

          Immediate Actions

        </h3>

        <div className="space-y-3">

          {actions.map((item: string, index: number) => (

            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4"
            >

              <FiArrowRight
                className="shrink-0 text-red-400"
              />

              <span className="text-sm text-slate-300">

                {item}

              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Bottom Stats */}

      <div className="mt-8 grid grid-cols-2 gap-4">

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">

          <div className="flex items-center gap-2">

            <FiTrendingUp
              className="text-green-400"
            />

            <span className="text-xs uppercase tracking-wider text-slate-400">

              Confidence

            </span>

          </div>

          <h3 className="mt-3 text-3xl font-bold text-white">

            {recommendation.confidence}%

          </h3>

        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">

          <div className="flex items-center gap-2">

            <FiBriefcase
              className="text-orange-400"
            />

            <span className="text-xs uppercase tracking-wider text-slate-400">

              Priority

            </span>

          </div>

          <h3 className="mt-3 text-lg font-semibold text-red-400">

            {recommendation.action_priority}

          </h3>

        </div>

      </div>

      {/* Business Impact */}

      <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">

        <p className="text-xs uppercase tracking-wider text-slate-400">

          Business Impact

        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">

          {recommendation.business_impact}

        </p>

      </div>

    </motion.div>

  );

}