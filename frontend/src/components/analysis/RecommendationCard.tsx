import { motion } from "framer-motion";
import {
  FiShield,
  FiCheckCircle,
  FiActivity,
  FiArrowRight,
  FiLayers,
  FiAlertTriangle,
  FiZap,
} from "react-icons/fi";

interface Props {
  recommendation: any;
}

interface ListProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  border?: string;
}

function Section({
  title,
  icon,
  items,
  border = "border-slate-700",
}: ListProps) {
  return (
    <div className={`rounded-2xl border ${border} bg-slate-900 p-5`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
          {icon}
        </div>

        <h3 className="font-semibold text-white">
          {title}
        </h3>
      </div>

      {items?.length ? (
        <div className="space-y-3">
          {items.map((item: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-slate-700 bg-[#121826] p-4"
            >
              <div className="flex gap-3">
                <FiCheckCircle className="mt-1 text-green-400" />
                <p className="leading-7 text-slate-300">
                  {item}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-slate-500">
          No information available
        </div>
      )}
    </div>
  );
}

export default function RecommendationCard({
  recommendation,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      <div className="mb-8">

        <p className="eyebrow">
          AI RECOMMENDATION
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Executive Decision
        </h2>

      </div>

      {/* Main Decision */}

      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-7">

        <div className="flex items-start gap-5">

          <div className="rounded-2xl bg-blue-500/15 p-4">
            <FiShield
              className="text-blue-400"
              size={30}
            />
          </div>

          <div className="flex-1">

            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Recommended Action
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              {recommendation.recommended_action}
            </h2>

          </div>

        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">

          <div className="premium-panel">

            <FiAlertTriangle className="text-orange-400 text-xl"/>

            <p className="mt-3 text-xs uppercase text-slate-500">
              Priority
            </p>

            <h3 className="mt-2 text-xl font-bold text-orange-300">
              {recommendation.action_priority}
            </h3>

          </div>

          <div className="premium-panel">

            <FiZap className="text-green-400 text-xl"/>

            <p className="mt-3 text-xs uppercase text-slate-500">
              Confidence
            </p>

            <h3 className="mt-2 text-xl font-bold text-green-300">
              {recommendation.confidence}%
            </h3>

          </div>

        </div>

      </div>

      {/* Business Impact */}

      <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">

        <div className="mb-4 flex items-center gap-3">

          <FiAlertTriangle className="text-orange-400"/>

          <h3 className="font-semibold text-white">
            Business Impact
          </h3>

        </div>

        <p className="leading-8 text-slate-300">
          {recommendation.business_impact}
        </p>

      </div>

      <div className="mt-8 space-y-6">

        <Section
          title="AI Reasoning"
          icon={<FiActivity />}
          items={recommendation.reasoning}
        />

        <Section
          title="Supporting Evidence"
          icon={<FiCheckCircle />}
          items={recommendation.supporting_evidence}
        />

        <Section
          title="Alternative Actions"
          icon={<FiLayers />}
          items={recommendation.alternative_actions}
        />

        <Section
          title="Follow-up Actions"
          icon={<FiArrowRight />}
          items={recommendation.follow_up_actions}
          border="border-green-500/20"
        />

      </div>

    </motion.div>
  );
}