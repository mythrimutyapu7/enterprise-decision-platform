import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  accent?: "primary" | "success" | "warning" | "critical";
  trend?: number[];
}

const colors = {
  primary: {
    icon: "from-blue-500 to-indigo-600",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    line: "from-blue-500 to-indigo-500",
  },
  success: {
    icon: "from-emerald-500 to-green-500",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    line: "from-emerald-500 to-green-500",
  },
  warning: {
    icon: "from-amber-500 to-orange-500",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    line: "from-amber-500 to-orange-500",
  },
  critical: {
    icon: "from-red-500 to-rose-600",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    line: "from-red-500 to-rose-600",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  accent = "primary",
  trend = [],
}: StatCardProps) {
  const max = Math.max(...trend, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`
      relative
      overflow-hidden
      rounded-2xl
      border
      ${colors[accent].border}
      bg-[#121826]
      p-6
      shadow-xl
      ${colors[accent].glow}
    `}
    >
      {/* Background Glow */}

      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">{value}</h2>

          <p className="mt-2 text-sm text-slate-500">
            Updated in real time
          </p>
        </div>

        <div
          className={`
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-xl
          bg-gradient-to-br
          ${colors[accent].icon}
          text-white
          shadow-lg
        `}
        >
          {icon}
        </div>
      </div>

      {/* Trend */}

      <div className="mt-8 flex h-12 items-end gap-1">
        {(trend.length ? trend : [0]).map((v, i) => (
          <div
            key={i}
            className={`
              flex-1
              rounded-full
              bg-gradient-to-t
              ${colors[accent].line}
            `}
            style={{
              height: `${Math.max((v / max) * 100, v ? 18 : 8)}%`,
              opacity: v ? 1 : 0.25,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}