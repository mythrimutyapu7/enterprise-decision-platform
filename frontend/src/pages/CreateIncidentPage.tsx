import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createIncident } from '../services/incidentService';
import { CreateIncidentRequest, IncidentSeverity, IncidentStatus } from '../types/incident';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

const CreateIncidentPage = () => {
  const [form, setForm] = useState<CreateIncidentRequest>({
    title: '',
    description: '',
    severity: 'low',
    status: 'open',
    createdBy: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (field: keyof CreateIncidentRequest) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.title || !form.description || !form.createdBy) {
      setError('Title, description, and reporter are required.');
      return;
    }

    setIsLoading(true);
    try {
      await createIncident(form);
      navigate('/incidents');
    } catch (_err) {
      setError('Unable to create incident at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">New Case</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Create Incident</h1>
        <p className="mt-1 text-sm text-muted">Log a new security incident for tracking and analysis.</p>
      </div>
      <Card title="Incident details">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm text-muted">
              <span className="mb-2 block font-medium text-text">Title</span>
              <input
                value={form.title}
                onChange={handleChange('title')}
                className="glass-field"
                placeholder="Incident title"
              />
            </label>
            <label className="block text-sm text-muted">
              <span className="mb-2 block font-medium text-text">Created By</span>
              <input
                value={form.createdBy}
                onChange={handleChange('createdBy')}
                className="glass-field"
                placeholder="Reporter name"
              />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm text-muted">
              <span className="mb-2 block font-medium text-text">Severity</span>
              <select
                value={form.severity}
                onChange={handleChange('severity')}
                className="glass-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="block text-sm text-muted">
              <span className="mb-2 block font-medium text-text">Status</span>
              <select
                value={form.status}
                onChange={handleChange('status')}
                className="glass-field"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          <label className="block text-sm text-muted">
            <span className="mb-2 block font-medium text-text">Description</span>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows={6}
              className="glass-field min-h-40 rounded-[24px]"
              placeholder="Describe the incident and context."
            />
          </label>
          {error && <div className="rounded-[20px] border border-critical/20 bg-critical/10 px-4 py-3 text-sm text-red-200 shadow-[0_0_34px_rgba(239,68,68,0.12)]">{error}</div>}
          <button
            type="submit"
            className="primary-button w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Create Incident'}
          </button>
        </form>
      </Card>
    </motion.div>
  );
};

export default CreateIncidentPage;
