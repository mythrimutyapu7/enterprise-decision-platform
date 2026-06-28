import { motion } from 'framer-motion';
import Card from '../components/common/Card';
import { FiDownload, FiFileText } from 'react-icons/fi';

const ReportsPage = () => {
  const reports = [
    { title: 'Weekly Incident Summaries', type: 'Executive Report', date: '28 Jun 2026', size: '2.4 MB' },
    { title: 'Quarterly Risk Assessment Matrix', type: 'Risk & Compliance', date: '15 Jun 2026', size: '12.8 MB' },
    { title: 'SOC Compliance Verification Log', type: 'Audit Logs', date: '01 Jun 2026', size: '4.1 MB' },
    { title: 'AI Analyst Telemetry Metrics', type: 'System Telemetry', date: '24 May 2026', size: '8.3 MB' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Data Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Platform Reports</h1>
        <p className="mt-1 text-sm text-muted">Generate, download, and review comprehensive reports and compliance audits.</p>
      </div>

      <Card title="Available Document Downloads">
        <div className="space-y-4">
          {reports.map((rep, idx) => (
            <div key={idx} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f172a] p-5 sm:flex-row sm:items-center sm:justify-between hover:border-[#4f8cff]/30 transition duration-300">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
                  <FiFileText className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{rep.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{rep.type} • Created {rep.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">{rep.size}</span>
                <button className="primary-button py-3 px-5 gap-2 text-sm">
                  <FiDownload className="h-4 w-4" /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default ReportsPage;
