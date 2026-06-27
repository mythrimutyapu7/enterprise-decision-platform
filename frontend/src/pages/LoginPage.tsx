import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-[#7c5cff]/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-[#4f8cff]/14 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45 }} className="glass-card w-full max-w-md p-8">
        <p className="eyebrow">Secure Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Sign in to Enterprise AI</h1>
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
                className="glass-field px-12"
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
                className="glass-field px-12"
                placeholder="Enter your password"
              />
            </div>
          </label>
          {error && <div className="rounded-[20px] border border-critical/20 bg-critical/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <button
            type="submit"
            className="primary-button w-full"
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
      </motion.div>
    </div>
  );
};

export default LoginPage;
