import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiShield,
  FiPlusCircle,
  FiActivity,
  FiBookOpen,
  FiDatabase,
  FiFileText,
  FiSettings,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FiHome,
  },
  {
    label: "Incidents",
    path: "/incidents",
    icon: FiShield,
  },
  {
    label: "Create Incident",
    path: "/incidents/new",
    icon: FiPlusCircle,
  },
  {
    label: "AI Analysis",
    path: "/analysis",
    icon: FiActivity,
  },
  {
    label: "Playbooks",
    path: "/playbooks",
    icon: FiBookOpen,
  },
  {
    label: "Threat Intelligence",
    path: "/threat-intelligence",
    icon: FiDatabase,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FiFileText,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: FiSettings,
  },
  {
    label: "Users & Roles",
    path: "/users-roles",
    icon: FiUsers,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  const initials = user?.name
    ?.split(" ")
    .map((word: string) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const nav = (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold transition duration-300 ${
                isActive
                  ? "bg-[#4f8cff]/18 text-white shadow-[0_18px_60px_rgba(79,140,255,0.22)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#4f8cff]/22 to-[#7c5cff]/12 transition-opacity duration-300 ${
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-60"
                  }`}
                />

                <span
                  className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition duration-300 group-hover:scale-110 ${
                    isActive
                      ? "bg-white/12 text-[#9bbcff]"
                      : "bg-white/[0.04] text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="relative whitespace-nowrap">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.55,
            ease: "easeOut",
          }}
          className="
            fixed
            left-4
            top-4
            bottom-4
            w-[288px]
            glass-card
            flex
            flex-col
            p-5
            overflow-hidden
            shadow-[0_50px_130px_rgba(0,0,0,0.35)]
          "
        >
          {/* Logo */}
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#7c5cff] shadow-[0_12px_30px_rgba(79,140,255,0.35)]">
              <FiShield className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">
                Enterprise AI
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                SOC Platform
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto pr-1">
            {nav}
          </div>

          {/* Footer - Profile Card */}
          <div className="pt-4 border-t border-white/5 mt-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4f8cff] to-[#7c5cff] text-sm font-bold text-white shadow-[0_0_15px_rgba(79,140,255,0.45)]">
                  {initials}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-white">
                    {user?.name || "ALPHA"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {user?.role || "SOC Analyst"}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="glass-button w-full py-2 px-3 justify-center gap-2 text-xs font-semibold"
              >
                <FiLogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-3 bottom-3 z-30 md:hidden">
        <div className="glass-card flex items-center justify-between gap-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `flex h-10 flex-1 items-center justify-center rounded-full transition duration-300 ${
                    isActive
                      ? "bg-[#4f8cff]/20 text-white"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;