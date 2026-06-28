import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiShield,
  FiPlusCircle,
  FiActivity,
  FiSettings,
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
    label: "Settings",
    path: "/settings",
    icon: FiSettings,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const nav = (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition duration-300 ${
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
                  className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition duration-300 group-hover:scale-110 ${
                    isActive
                      ? "bg-white/12 text-[#9bbcff]"
                      : "bg-white/[0.04] text-slate-300"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
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
            p-6
            overflow-hidden
            shadow-[0_50px_130px_rgba(0,0,0,0.35)]
          "
        >
          {/* Logo */}

          <div className="mb-10">

            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f8cff] to-[#7c5cff] shadow-[0_18px_60px_rgba(79,140,255,0.35)]">

              <FiShield className="h-6 w-6 text-white" />

            </div>

            <div className="eyebrow mb-3">

              SOC Console

            </div>

            <h1 className="text-3xl font-semibold text-white">

              Enterprise AI

            </h1>

            <p className="mt-3 max-w-[15rem] text-sm leading-6 text-slate-300">

              Autonomous decisions for high-trust incident response.

            </p>

          </div>

          {/* Navigation */}

          <div className="flex-1 overflow-y-auto pr-1">

            {nav}

          </div>

          {/* Footer */}

          <div className="pt-6">

            <div className="mb-4 rounded-[22px] border border-white/10 bg-white/[0.045] p-4">

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">

                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_18px_rgba(34,197,94,0.8)]" />

                AI Online

              </div>

              <p className="mt-3 text-sm leading-6 text-slate-300">

                Policy engine and memory agents are ready.

              </p>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="glass-button w-full justify-center gap-2 text-white"
            >

              <FiLogOut className="h-4 w-4" />

              Logout

            </button>

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
                  `flex h-12 flex-1 items-center justify-center rounded-full transition duration-300 ${
                    isActive
                      ? "bg-[#4f8cff]/20 text-white"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`
                }
              >

                <Icon className="h-5 w-5" />

              </NavLink>

            );

          })}

        </div>

      </div>
    </>
  );
};

export default Sidebar;