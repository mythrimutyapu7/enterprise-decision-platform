import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { FiClock, FiFileText, FiLayers, FiShield, FiUser } from 'react-icons/fi';
import { fetchIncidentById } from '../services/incidentService';
import { IncidentDetail } from '../types/incident';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

const IncidentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const loadIncident = async () => {
      try {
        const data = await fetchIncidentById(id);
        setIncident(data);
      } catch (_err) {
        setError('Unable to load incident details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadIncident();
  }, [id]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !incident) {
    return <div className="glass-card p-8 text-center text-muted">{error || 'Incident not found.'}</div>;
  }

  const workflow = incident.analysis as any;
  const approval = workflow?.approval || {};
  const meta = workflow?.meta || {};

  const timeline = [
    { time: incident.createdAt, label: 'Incident Created' },
    { time: meta.analysis_completed_at, label: 'AI Analysis Completed' },
    { time: meta.recommendation_generated_at, label: 'Recommendation Generated' },
    { time: approval.approval_timestamp, label: approval.execution_status === 'Rejected' ? 'Rejected by Security Analyst' : 'Approved by Security Analyst' },
    { time: incident.analystNotesUpdatedAt, label: 'Analyst Notes Updated' },
  ].filter((entry) => entry.time);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Case Record</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Incident details</h1>
        <p className="mt-1 text-sm text-muted">Full incident summary and event metadata.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card title={incident.title}>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="premium-panel space-y-4">
                <div>
                  <p className="eyebrow">Severity</p>
                  <p className="mt-2 text-lg font-semibold text-text">{incident.severity}</p>
                </div>
                <div>
                  <p className="eyebrow">Status</p>
                  <p className="mt-2 text-lg font-semibold text-text">{incident.status}</p>
                </div>
                <div>
                  <p className="eyebrow">Created by</p>
                  <p className="mt-2 text-lg font-semibold text-text">{incident.createdBy}</p>
                </div>
              </div>

              <div className="premium-panel space-y-4">
                <div>
                  <p className="eyebrow">Created at</p>
                  <p className="mt-2 text-lg font-semibold text-text">{new Date(incident.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="eyebrow">Description</p>
                  <p className="mt-2 break-words text-sm leading-7 text-muted">{incident.description}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Case Actions</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Open the full workflow</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => navigate(`/analysis?id=${incident.id}`)} className="primary-button gap-2 px-4 py-3">
                    <FiLayers /> Analysis
                  </button>
                  <button type="button" onClick={() => navigate(`/analysis?id=${incident.id}`)} className="glass-button gap-2 px-4 py-3">
                    <FiFileText /> Report
                  </button>
                </div>
              </div>
            </div>

            <div className="premium-panel">
              <div className="mb-4 flex items-center gap-3">
                <FiClock className="text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
              </div>

              <div className="space-y-3">
                {timeline.map((entry, index) => (
                  <div key={`${entry.label}-${index}`} className="flex items-start gap-4 rounded-xl border border-white/10 bg-[#121826] p-4">
                    <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(entry.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Analyst Notes">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <FiUser className="text-blue-400" />
                <p className="text-sm">Saved notes from the live investigation.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                  {incident.analystNotes || 'No analyst notes have been saved for this incident yet.'}
                </p>
              </div>

              <div className="text-sm text-slate-400">
                <p className="flex items-center gap-2">
                  <FiShield className="text-cyan-400" />
                  Notes are stored in MongoDB with the incident record.
                </p>
                <p className="mt-2">Updated: {incident.analystNotesUpdatedAt ? new Date(incident.analystNotesUpdatedAt).toLocaleString() : 'Not available'}</p>
              </div>
            </div>
          </Card>

          <Card title="Case Metadata">
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Analyst</p>
                <p className="mt-2 text-white">{incident.createdBy}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className="mt-2 text-white">{incident.status}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Approval</p>
                <p className="mt-2 text-white">{approval.execution_status || 'Pending'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default IncidentDetailsPage;
