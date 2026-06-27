import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { login } from '../services/authService';
import { LoginRequest } from '../types/auth';
import Loader from '../components/common/Loader';

const LoginPage = () => {
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: keyof LoginRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!form.email || !form.password) {
      setError('Please provide both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(form);
      localStorage.setItem('auth_token', response.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-8 shadow-panel">
        <h1 className="text-2xl font-semibold text-text">Sign in to Enterprise AI</h1>
        <p className="mt-2 text-sm text-muted">Enter your credentials to access the incident response platform.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm text-muted">
            <span className="mb-2 block font-medium text-text">Email</span>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
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
              <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-12 py-3 text-sm text-text outline-none transition focus:border-primary"
                placeholder="Enter your password"
              />
            </div>
          </label>
          {error && <div className="rounded-2xl bg-critical/10 px-4 py-3 text-sm text-critical">{error}</div>}
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New user?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-blue-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
