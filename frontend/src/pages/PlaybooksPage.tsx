import { motion } from 'framer-motion';
import Card from '../components/common/Card';
import { FiBookOpen, FiPlay, FiSettings } from 'react-icons/fi';

const PlaybooksPage = () => {
  const playbooks = [
    { name: 'Brute Force Attack Playbook', description: 'Triggered when multiple failed login attempts are detected. Disables compromise accounts and resets credentials.', triggers: 24, status: 'Active' },
    { name: 'Phishing Email Remediation', description: 'Triggered upon user reporting phishing threat. Scans inbox for similar subjects and quarantines emails.', triggers: 12, status: 'Active' },
    { name: 'Malware Isolation & Scan', description: 'Isolates affected workstations from the local subnet and initiates deep defender endpoint sweep.', triggers: 8, status: 'Active' },
    { name: 'Exfiltration Data Defense', description: 'Restricts external network upload requests for high-privilege users exceeding standard thresholds.', triggers: 3, status: 'Testing' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Automation Controls</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Security Playbooks</h1>
        <p className="mt-1 text-sm text-muted">Automated action workflows for immediate response and telemetry orchestration.</p>
      </div>

      <Card title="Available Response Playbooks">
        <div className="grid gap-6 md:grid-cols-2">
          {playbooks.map((p, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 hover:border-primary/30 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f8cff]/10 text-primary">
                  <FiBookOpen className="h-5 w-5" />
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  p.status === 'Active' ? 'bg-success/15 text-green-300' : 'bg-warning/15 text-orange-300'
                }`}>
                  {p.status}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{p.name}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-6">{p.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-500 uppercase tracking-widest">
                <span>Triggers: {p.triggers} times</span>
                <button className="glass-button py-2 px-4 gap-2 text-xs">
                  <FiPlay className="h-3 w-3" /> Run Playbook
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default PlaybooksPage;
