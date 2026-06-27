import { motion } from 'framer-motion';

const SettingsPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Control Plane</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account and platform preferences.</p>
      </div>
      <div className="glass-card p-8">
        <p className="text-sm text-muted">Account settings and integrations are managed by the backend and will be available here once configured.</p>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
