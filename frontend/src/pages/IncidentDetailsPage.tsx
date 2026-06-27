import { useEffect, useState } from 'react';
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
    return <div className="rounded-3xl border border-white/10 bg-card p-8 text-center text-muted">{error || 'Incident not found.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Incident details</h1>
        <p className="text-sm text-muted">Full incident summary and event metadata.</p>
      </div>
      <Card title={incident.title}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-[#111827] p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Severity</p>
              <p className="mt-2 text-lg font-semibold text-text">{incident.severity}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Status</p>
              <p className="mt-2 text-lg font-semibold text-text">{incident.status}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Created by</p>
              <p className="mt-2 text-lg font-semibold text-text">{incident.createdBy}</p>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/10 bg-[#111827] p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Created at</p>
              <p className="mt-2 text-lg font-semibold text-text">{new Date(incident.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Description</p>
              <p className="mt-2 text-sm leading-7 text-muted">{incident.description}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IncidentDetailsPage;
