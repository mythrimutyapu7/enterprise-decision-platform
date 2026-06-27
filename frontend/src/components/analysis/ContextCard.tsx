import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiClipboard,
  FiShield,
  FiClock,
} from "react-icons/fi";

interface Props {
  context: any;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

function Section({ icon, title, items }: SectionProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
          {icon}
        </div>

        <h3 className="font-semibold text-white">
          {title}
        </h3>
      </div>

      {items && items.length > 0 ? (
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

export default function ContextCard({ context }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-700 bg-[#121826] p-8 shadow-xl"
    >
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-400">
          SECURITY CONTEXT
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Enterprise Knowledge Base
        </h2>

        <p className="mt-2 text-slate-400">
          Context collected by the AI agents before generating recommendations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <Section
          title="Security Policies"
          icon={<FiShield size={18} />}
          items={context.security_policies || []}
        />

        <Section
          title="Incident Playbooks"
          icon={<FiBookOpen size={18} />}
          items={context.incident_playbooks || []}
        />

        <Section
          title="Organizational Notes"
          icon={<FiClipboard size={18} />}
          items={context.organizational_notes || []}
        />

        <Section
          title="Threat Intelligence"
          icon={<FiClock size={18} />}
          items={context.threat_intelligence || []}
        />

      </div>
    </motion.div>
  );
}