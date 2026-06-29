import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaIdBadge } from 'react-icons/fa';
import { register } from '../services/authService';
import { RegisterRequest } from '../types/auth';
import Loader from '../components/common/Loader';

const RegisterPage = () => {
  const [form, setForm] = useState<RegisterRequest>({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: keyof RegisterRequest) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!form.name || !form.email || !form.password || !form.role) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError('Unable to register. Please verify your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-[#7c5cff]/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-[#4f8cff]/14 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45 }} className="glass-card w-full max-w-lg p-8">
        <p className="eyebrow">Identity Setup</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Create your account</h1>
        <p className="mt-2 text-sm text-muted">Register to access the enterprise incident response platform.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label className="block text-sm text-muted">
            <span className="mb-2 block font-medium text-text">Name</span>
            <div className="relative">
              <FaUser className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                value={form.name}
                onChange={handleChange('name')}
                className="glass-field px-12"
                placeholder="Your full name"
              />
            </div>
          </label>
          <label className="block text-sm text-muted">
            <span className="mb-2 block font-medium text-text">Email</span>
            <div className="relative">
              <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                className="glass-field px-12"
                placeholder="email@example.com"
              />
            </div>
          </label>
          <label className="block text-sm text-muted">
            <span className="mb-2 block font-medium text-text">Password</span>
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                className="glass-field px-12"
                placeholder="Create a password"
              />
            </div>
          </label>
          <label className="block text-sm text-muted">
            <span className="mb-2 block font-medium text-text">Role</span>
            <div className="relative">
              <FaIdBadge className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                value={form.role}
                onChange={handleChange('role')}
                className="glass-field px-12"
                placeholder="SOC Analyst, Manager, etc."
              />
            </div>
          </label>
          {error && <div className="rounded-[20px] border border-critical/20 bg-critical/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <button
            type="submit"
            className="primary-button w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-blue-400">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
