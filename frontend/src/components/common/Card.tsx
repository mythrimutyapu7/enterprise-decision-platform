import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Card({
  title,
  children,
  footer,
}: CardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="
        rounded-2xl
        border
        border-slate-700/60
        bg-[#121826]
        shadow-xl
        overflow-hidden
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-blue-400">
            Enterprise Security
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            {title}
          </h2>
        </div>
      </div>

      {/* Body */}

      <div className="p-6">
        {children}
      </div>

      {/* Footer */}

      {footer && (
        <div className="border-t border-slate-700/50 bg-[#0f172a]/40 px-6 py-4">
          {footer}
        </div>
      )}
    </motion.section>
  );
}