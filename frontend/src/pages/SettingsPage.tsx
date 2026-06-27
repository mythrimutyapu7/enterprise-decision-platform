const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="text-sm text-muted">Manage your account and platform preferences.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-card p-8 shadow-panel">
        <p className="text-sm text-muted">Account settings and integrations are managed by the backend and will be available here once configured.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
