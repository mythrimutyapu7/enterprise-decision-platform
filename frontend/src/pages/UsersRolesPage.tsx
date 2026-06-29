import { motion } from 'framer-motion';
import Card from '../components/common/Card';
import { FiUsers, FiUserCheck, FiKey } from 'react-icons/fi';

const UsersRolesPage = () => {
  const usersList = [
    { name: 'Mythri', email: 'mutyapu.mythri@gmail.com', role: 'Analyst', department: 'Security Operations', status: 'Active' },
    { name: 'nikki', email: 'nikki@gmail.com', role: 'Manager', department: 'Risk & IT Auditing', status: 'Active' },
    { name: 'akhila', email: 'akhila@gmail.com', role: 'Manager', department: 'IT Infrastructure', status: 'Offline' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Identity & Access</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Users & Roles</h1>
        <p className="mt-1 text-sm text-muted">Manage active SOC analysts, security managers, permissions, and roles.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4f8cff]/10 text-primary">
            <FiUsers className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Total Users</p>
            <p className="mt-1 text-2xl font-bold text-white">3 Accounts</p>
          </div>
        </div>
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
            <FiUserCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Active Sessions</p>
            <p className="mt-1 text-2xl font-bold text-white">2 Online</p>
          </div>
        </div>
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <FiKey className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Role Policies</p>
            <p className="mt-1 text-2xl font-bold text-white">2 Standard</p>
          </div>
        </div>
      </div>

      <Card title="Active Platform Accounts">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                <th className="py-4">User</th>
                <th className="py-4">Email</th>
                <th className="py-4">Role</th>
                <th className="py-4">Department</th>
                <th className="py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 font-semibold text-white">{usr.name}</td>
                  <td className="py-4 text-slate-400">{usr.email}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300 font-semibold uppercase tracking-widest">
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-4 text-slate-300">{usr.department}</td>
                  <td className="py-4">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${usr.status === 'Active' ? 'bg-green-400' : 'bg-slate-600'}`} />
                      {usr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default UsersRolesPage;
