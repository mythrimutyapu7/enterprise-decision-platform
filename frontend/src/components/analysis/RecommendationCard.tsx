import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiShield,
  FiArrowRight,
  FiActivity,
  FiLayers,
} from "react-icons/fi";

interface Props {
  recommendation: any;
}

interface ListProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  color?: string;
}

function ListSection({
  title,
  icon,
  items,
  color = "border-slate-700",
}: ListProps) {
  return (
    <div className={`rounded-2xl border ${color} bg-slate-900 p-5`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
          {icon}
        </div>

        <h3 className="font-semibold text-white">
          {title}
        </h3>
      </div>

      {items?.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-700 bg-[#121826] p-3"
            >
              <p className="text-sm leading-6 text-slate-300">
                {item}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-500">
          No information available.
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-700 bg-[#121826] p-8 shadow-xl"
    >
      <div className="mb-8">

        <p className="text-xs uppercase tracking-[0.35em] text-blue-400">
          AI RECOMMENDATION
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Recommended Response
        </h2>

      </div>

      {/* Main Recommendation */}

      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">

        <div className="flex items-center gap-3">

          <FiShield
            size={26}
            className="text-blue-400"
          />

          <div>

            <p className="text-xs uppercase text-slate-400">
              Recommended Action
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {recommendation.recommended_action}
            </h3>

          </div>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="rounded-xl bg-slate-900 p-4">

            <p className="text-xs uppercase text-slate-500">
              Priority
            </p>

            <h4 className="mt-2 text-lg font-semibold text-red-400">
              {recommendation.action_priority}
            </h4>

          </div>

          <div className="rounded-xl bg-slate-900 p-4">

            <p className="text-xs uppercase text-slate-500">
              AI Confidence
            </p>

            <h4 className="mt-2 text-lg font-semibold text-green-400">
              {recommendation.confidence}%
            </h4>

          </div>

        </div>

      </div>

      {/* Business Impact */}

      <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">

        <div className="mb-3 flex items-center gap-3">

          <FiAlertTriangle className="text-orange-400" />

          <h3 className="font-semibold text-white">
            Business Impact
          </h3>

        </div>

        <p className="leading-7 text-slate-300">
          {recommendation.business_impact}
        </p>

      </div>

      <div className="mt-8 space-y-6">

        <ListSection
          title="Reasoning"
          icon={<FiActivity />}
          items={recommendation.reasoning}
        />

        <ListSection
          title="Supporting Evidence"
          icon={<FiCheckCircle />}
          items={recommendation.supporting_evidence}
        />

        <ListSection
          title="Alternative Actions"
          icon={<FiLayers />}
          items={recommendation.alternative_actions}
        />

        <ListSection
          title="Follow-up Actions"
          icon={<FiArrowRight />}
          items={recommendation.follow_up_actions}
          color="border-green-500/20"
        />

      </div>

    </motion.div>
  );
}