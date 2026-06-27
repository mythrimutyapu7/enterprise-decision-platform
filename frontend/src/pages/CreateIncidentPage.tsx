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
        <form onSubmit={handleSubmit} className="space-y-7">

  <div className="grid gap-6 md:grid-cols-2">

    <label>
      <span className="mb-3 block text-sm font-semibold text-white">
        Incident Title
      </span>

      <input
        value={form.title}
        onChange={handleChange("title")}
        className="glass-field"
        placeholder="Suspicious Login Attempt"
      />
    </label>

    <label>
      <span className="mb-3 block text-sm font-semibold text-white">
        Reported By
      </span>

      <input
        value={form.createdBy}
        onChange={handleChange("createdBy")}
        className="glass-field"
        placeholder="John Smith"
      />
    </label>

  </div>

  <label>

    <span className="mb-3 block text-sm font-semibold text-white">
      Incident Description
    </span>

    <textarea
      rows={8}
      value={form.description}
      onChange={handleChange("description")}
      className="glass-field min-h-[220px] rounded-3xl"
      placeholder={`Example:

15 failed login attempts detected from IP 185.xx.xx.xx

Followed by successful authentication.

User belongs to Finance department.

Microsoft Sentinel generated alert.

Possible brute-force attack.`}
    />

  </label>

  <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">

    <h3 className="text-lg font-semibold text-blue-300">
      AI Analysis
    </h3>

    <p className="mt-2 text-sm leading-7 text-slate-300">

      Severity, Risk Score, Threat Classification,
      Recommendations and Approval Decision
      will be generated automatically after
      the incident is submitted.

    </p>

  </div>

  {error && (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
      {error}
    </div>
  )}

  <button
    type="submit"
    disabled={isLoading}
    className="primary-button w-full h-14 text-lg"
  >
    {isLoading ? "Creating Incident..." : "Submit Incident"}
  </button>

</form>
      </Card>
    </motion.div>
  );
};

export default CreateIncidentPage;
