import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { fetchIncidentById } from '../services/incidentService';
import { IncidentDetail } from '../types/incident';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

const IncidentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Case Record</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Incident details</h1>
        <p className="mt-1 text-sm text-muted">Full incident summary and event metadata.</p>
      </div>
      <Card title={incident.title}>
        <div className="grid gap-6 md:grid-cols-2">
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
              <p className="mt-2 text-sm leading-7 text-muted">{incident.description}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default IncidentDetailsPage;
