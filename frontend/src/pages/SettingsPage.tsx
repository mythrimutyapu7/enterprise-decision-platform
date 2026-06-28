import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCheckCircle, FiEdit, FiShield } from 'react-icons/fi';
import Card from '../components/common/Card';
import { updateProfile } from '../services/authService';

const SettingsPage = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [name, setName] = useState(user.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Display name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateProfile(name.trim());
      if (response.success && response.user) {
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        setSuccessMsg("Profile updated successfully!");
        
        // Dispatch custom event to trigger navbar/sidebar updates instantly
        window.dispatchEvent(new Event("storage"));
        
        setTimeout(() => {
          setSuccessMsg(null);
          // reload the page to refresh all layouts cleanly
          window.location.reload();
        }, 1500);
      } else {
        setErrorMsg(response.error || "Failed to update profile.");
      }
    } catch (err) {
      setErrorMsg("An error occurred while updating profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((word: string) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.15)] flex items-center gap-3 backdrop-blur-md"
          >
            <FiCheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <p className="eyebrow">Control Plane</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account profile and platform preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Card */}
        <div className="md:col-span-1 rounded-[24px] border border-white/10 bg-[#0B1120] p-6 shadow-xl flex flex-col items-center justify-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4f8cff] to-[#7c5cff] text-2xl font-bold text-white shadow-2xl">
            {initials}
          </span>
          <h2 className="mt-4 text-xl font-bold text-white">{user.name || "Guest Analyst"}</h2>
          <p className="text-sm text-slate-400 mt-1">{user.role || "SOC Analyst"}</p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-success bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Authorized Session
          </div>
        </div>

        {/* Profile Editor Form */}
        <div className="md:col-span-2">
          <Card title="Account Profile Settings">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">Email Address</span>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={user.email || ''} 
                      disabled 
                      className="glass-field pl-11 opacity-60 cursor-not-allowed text-slate-400"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">Platform Role</span>
                  <div className="relative">
                    <FiShield className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={user.role || ''} 
                      disabled 
                      className="glass-field pl-11 opacity-60 cursor-not-allowed text-slate-400"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Display Name</span>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="glass-field pl-11 focus:border-[#4f8cff]/50" 
                    placeholder="Enter your display name"
                  />
                </div>
              </label>

              {errorMsg && (
                <div className="rounded-2xl border border-critical/20 bg-critical/10 p-4 text-red-300 text-sm">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="primary-button gap-2 py-3 px-6 text-sm font-bold w-full sm:w-auto"
              >
                {isSubmitting ? "Saving Changes..." : "Save Profile Changes"}
              </button>

            </form>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
