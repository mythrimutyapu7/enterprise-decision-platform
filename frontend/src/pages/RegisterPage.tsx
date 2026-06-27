import { useState } from 'react';
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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-card p-8 shadow-panel">
        <h1 className="text-2xl font-semibold text-text">Create your account</h1>
        <p className="mt-2 text-sm text-muted">Register to access the enterprise incident response platform.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label className="block text-sm text-muted">
            <span className="mb-2 block font-medium text-text">Name</span>
            <div className="relative">
              <FaUser className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                value={form.name}
                onChange={handleChange('name')}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-12 py-3 text-sm text-text outline-none transition focus:border-primary"
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
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-12 py-3 text-sm text-text outline-none transition focus:border-primary"
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
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-12 py-3 text-sm text-text outline-none transition focus:border-primary"
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
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-12 py-3 text-sm text-text outline-none transition focus:border-primary"
                placeholder="SOC Analyst, Manager, etc."
              />
            </div>
          </label>
          {error && <div className="rounded-2xl bg-critical/10 px-4 py-3 text-sm text-critical">{error}</div>}
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
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
      </div>
    </div>
  );
};

export default RegisterPage;
