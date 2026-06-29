import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import { FiDownload, FiFileText, FiLoader, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { fetchIncidents, downloadIncidentReport } from '../services/incidentService';

const ReportsPage = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadReportsData = async () => {
    try {
      const data = await fetchIncidents();
      // Filter only incidents that have analysis data
      const analyzed = data.filter((inc: any) => inc.analysis && Object.keys(inc.analysis).length > 0);
      setIncidents(analyzed);
    } catch (err) {
      console.error("Failed to load reports metadata", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const handleDownload = async (id: string, title: string) => {
    setDownloadingId(id);
    setErrorMsg(null);
    try {
      await downloadIncidentReport(id, title);
      setNotification(`Downloaded PDF report for "${title}" successfully!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setErrorMsg(`Failed to generate/download report PDF for "${title}".`);
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatIncidentId = (id: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = isNaN(date.getFullYear()) ? 2026 : date.getFullYear();
    const suffix = id.slice(-4).toUpperCase();
    return `INC-${year}-${suffix}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.15)] flex items-center gap-3 backdrop-blur-md"
          >
            <FiCheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm font-semibold">{notification}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.15)] flex items-center gap-3 backdrop-blur-md"
          >
            <FiAlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <p className="eyebrow">Data Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Platform Reports</h1>
        <p className="mt-1 text-sm text-muted">Generate and download comprehensive AI investigation PDF reports for analysed incident cases.</p>
      </div>

      <Card title="AI Investigation Report Downloads">
        {isLoading ? (
          <Loader />
        ) : incidents.length === 0 ? (
          <EmptyState 
            title="No reports available" 
            description="Reports are generated automatically once an incident is analysed by the AI Agent. Go to the Incidents page to analyze a case." 
          />
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => {
              const displayId = formatIncidentId(incident.id, incident.createdAt);
              const isDownloading = downloadingId === incident.id;

              return (
                <div 
                  key={incident.id} 
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f172a] p-5 sm:flex-row sm:items-center sm:justify-between hover:border-[#4f8cff]/30 transition duration-300"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
                      <FiFileText className="h-6 w-6 text-[#4f8cff]" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {displayId} • AI Analysis Completed • Severity: {incident.severity?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleDownload(incident.id, incident.title)}
                      disabled={isDownloading}
                      className="primary-button py-3 px-5 gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <FiLoader className="h-4 w-4 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload className="h-4 w-4" /> Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ReportsPage;
