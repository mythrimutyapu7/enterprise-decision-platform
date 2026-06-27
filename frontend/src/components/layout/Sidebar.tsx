import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiShield, FiPlusCircle, FiActivity, FiSettings, FiLogOut } from 'react-icons/fi';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: FiHome },
  { label: 'Incidents', path: '/incidents', icon: FiShield },
  { label: 'Create Incident', path: '/incidents/new', icon: FiPlusCircle },
  { label: 'AI Analysis', path: '/analysis', icon: FiActivity },
  { label: 'Settings', path: '/settings', icon: FiSettings },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <aside className="hidden w-72 flex-shrink-0 border-r border-white/10 bg-[#0b1323] p-6 md:block">
      <div className="mb-10">
        <div className="mb-4 text-sm uppercase tracking-[0.3em] text-muted">SOC Console</div>
        <h1 className="text-2xl font-semibold text-text">Enterprise AI</h1>
        <p className="mt-2 text-sm text-muted">Incident response command center</p>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-primary text-white shadow-panel' : 'text-muted hover:bg-white/5 hover:text-text'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111827] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1f2937]"
        >
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
