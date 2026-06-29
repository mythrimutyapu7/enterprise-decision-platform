import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiInfo,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";

interface Props {
  analysis: any;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  border: string;
  bg: string;
  text: string;
}

function ListSection({
  title,
  icon,
  items,
  border,
  bg,
  text,
}: SectionProps) {
  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        {icon}
        <h3 className="break-words text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {items?.length ? (
          items.map((item: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border ${border} ${bg} p-4`}
            >
              <div className="flex items-start gap-3">
                <FiCheckCircle className={text + " mt-1"} />
                <p className="break-words text-slate-300 leading-7">{item}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-slate-500">
            No information available.
          </div>
        )}
      </div>
    </div>
  );
}

export default function RiskScoreCard({ analysis }: Props) {
  const score = analysis?.risk_score || 0;
  const confidence = analysis?.confidence || 0;

  const color =
    score >= 85
      ? "text-red-400"
      : score >= 70
      ? "text-orange-400"
      : score >= 50
      ? "text-yellow-400"
      : "text-green-400";

  const progress = Math.min(score, 100);

  const progressColor =
    score >= 85
      ? "bg-red-500"
      : score >= 70
      ? "bg-orange-500"
      : score >= 50
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-8"
    >
      {/* Header */}

      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
          <p className="eyebrow">AI RISK ASSESSMENT</p>

          <h2 className="mt-2 break-words text-3xl font-bold text-white">
            Risk Evaluation
          </h2>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Confidence
          </p>

          <h3 className="mt-2 break-words text-3xl font-bold text-blue-400">
            {confidence}%
          </h3>
        </div>
      </div>

      {/* Risk Score */}

      <div className="mt-10">

        <div className="flex items-end gap-4">

          <motion.h1
            initial={{ scale: .8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: .5 }}
            className={`break-words text-7xl font-bold ${color}`}
          >
            {score}
          </motion.h1>

          <span className="pb-4 text-slate-400 text-xl">
            /100
          </span>

        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${progressColor}`}
          />

        </div>

        <p className="mt-4 text-slate-300">
          Overall Risk Level
          <span className={`ml-3 font-bold ${color}`}>
            {analysis?.risk_level}
          </span>
        </p>

      </div>

      {/* Sections */}

      <ListSection
        title="Threat Indicators"
        icon={<FiInfo className="text-blue-400" size={20} />}
        items={analysis?.indicators || []}
        border="border-slate-700"
        bg="bg-slate-900"
        text="text-blue-400"
      />

      <ListSection
        title="Potential Risks"
        icon={<FiAlertTriangle className="text-red-400" size={20} />}
        items={analysis?.risks || []}
        border="border-red-500/20"
        bg="bg-red-500/5"
        text="text-red-400"
      />

      <ListSection
        title="Missing Information"
        icon={<FiInfo className="text-yellow-400" size={20} />}
        items={analysis?.missing_information || []}
        border="border-yellow-500/20"
        bg="bg-yellow-500/5"
        text="text-yellow-400"
      />

      <ListSection
        title="Opportunities"
        icon={<FiTrendingUp className="text-green-400" size={20} />}
        items={analysis?.opportunities || []}
        border="border-green-500/20"
        bg="bg-green-500/5"
        text="text-green-400"
      />
    </motion.div>
  );
}