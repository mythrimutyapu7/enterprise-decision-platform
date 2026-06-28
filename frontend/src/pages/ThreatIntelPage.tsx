import { motion } from 'framer-motion';
import Card from '../components/common/Card';
import { FiTrendingUp, FiShield, FiAlertOctagon } from 'react-icons/fi';

const ThreatIntelPage = () => {
  const iocs = [
    { type: 'IP Address', indicator: '185.220.101.44', threat: 'Tor Exit Node / Brute Force Botnet', confidence: 'High (95%)', updated: '10 mins ago' },
    { type: 'IP Address', indicator: '82.102.23.109', threat: 'Known Command & Control (C2) Server', confidence: 'Critical (99%)', updated: '1 hour ago' },
    { type: 'File Hash', indicator: 'd3b07384d113edec49eaa6238ad5ff00', threat: 'Trojan.Generic downloader payload', confidence: 'High (90%)', updated: 'Yesterday' },
    { type: 'Domain Name', indicator: 'sec-auth-portal.com', threat: 'Phishing portal impersonating Microsoft login', confidence: 'Critical (98%)', updated: '2 days ago' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Threat Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Global Threat Intel</h1>
        <p className="mt-1 text-sm text-muted">Aggregated Indicator of Compromise (IOC) feeds, IP reputation checks, and active threat definitions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-critical/10 text-critical">
            <FiAlertOctagon className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Active Threat Feeds</p>
            <p className="mt-1 text-2xl font-bold text-white">4 Online</p>
          </div>
        </div>
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4f8cff]/10 text-primary">
            <FiShield className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Total Indicators</p>
            <p className="mt-1 text-2xl font-bold text-white">14,204</p>
          </div>
        </div>
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
            <FiTrendingUp className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Sync Status</p>
            <p className="mt-1 text-2xl font-bold text-white">Synchronized</p>
          </div>
        </div>
      </div>

      <Card title="Latest Indicators of Compromise (IOCs)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                <th className="py-4">Type</th>
                <th className="py-4">Indicator</th>
                <th className="py-4">Associated Threat</th>
                <th className="py-4">Confidence</th>
                <th className="py-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {iocs.map((ioc, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 font-semibold text-white">{ioc.type}</td>
                  <td className="py-4 font-mono text-slate-400">{ioc.indicator}</td>
                  <td className="py-4">{ioc.threat}</td>
                  <td className="py-4 text-[#9bbcff]">{ioc.confidence}</td>
                  <td className="py-4 text-xs text-slate-500">{ioc.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default ThreatIntelPage;
