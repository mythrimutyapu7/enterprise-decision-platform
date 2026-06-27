import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiClipboard,
  FiShield,
  FiGlobe,
  FiCheckCircle,
} from "react-icons/fi";

interface Props {
  context: any;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

function Section({ title, icon, items }: SectionProps) {
  return (
    <div className="premium-panel">

      <div className="mb-5 flex items-center gap-3">

        <div className="rounded-xl bg-blue-500/15 p-3 text-blue-400">
          {icon}
        </div>

        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

      </div>

      {items?.length ? (

        <div className="space-y-3">

          {items.map((item: string, index: number) => (

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-slate-700 bg-[#121826] p-4"
            >

              <div className="flex items-start gap-3">

                <FiCheckCircle className="mt-1 text-blue-400" />

                <p className="leading-7 text-slate-300">
                  {item}
                </p>

              </div>

            </motion.div>

          ))}

        </div>

      ) : (

        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-500">

          No information available

        </div>

      )}

    </div>
  );
}

export default function ContextCard({ context }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-8"
    >

      <div className="mb-8">

        <p className="eyebrow">
          ENTERPRISE CONTEXT
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          AI Knowledge Base
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-400">
          Before generating a recommendation, the AI retrieved internal
          organizational knowledge, security policies, playbooks, historical
          incidents, and threat intelligence to improve decision quality.
        </p>

      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        <Section
          title="Security Policies"
          icon={<FiShield size={20} />}
          items={context.security_policies || []}
        />

        <Section
          title="Incident Playbooks"
          icon={<FiBookOpen size={20} />}
          items={context.incident_playbooks || []}
        />

        <Section
          title="Organizational Notes"
          icon={<FiClipboard size={20} />}
          items={context.organizational_notes || []}
        />

        <Section
          title="Threat Intelligence"
          icon={<FiGlobe size={20} />}
          items={context.threat_intelligence || []}
        />

      </div>

    </motion.div>
  );
}