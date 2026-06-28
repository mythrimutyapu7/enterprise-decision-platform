import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiBell,
  FiSearch,
  FiCommand,
  FiCircle,
} from "react-icons/fi";

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const user = JSON.parse(
  localStorage.getItem("currentUser") || "{}"
);

const initials =
  user?.name
    ?.split(" ")
    .map((word: string) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  useEffect(() => {
    const timer = window.setInterval(
      () => setTime(new Date()),
      1000
    );

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className="
        sticky
        top-4
        z-30
        mb-6
        glass-card
        px-5
        py-4
        shadow-[0_38px_90px_rgba(0,0,0,0.24)]
      "
    >
      {/* TOP */}

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">

        <div className="min-w-0">

          <p className="eyebrow">
            Command Center
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            AI SOC Operations
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-300">
            Live status, agent telemetry, and intelligent incident controls.
          </p>

        </div>

        <div className="grid min-w-0 gap-3 sm:flex sm:items-center">

          <div className="glass-input flex min-w-0 items-center gap-3 sm:w-72">

            <FiSearch className="h-4 w-4 text-slate-300" />

            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Search commands"
            />

          </div>

          <div className="glass-pill justify-between text-white/80 sm:justify-start">

            AI Status

            <span className="inline-flex items-center gap-2 normal-case tracking-normal">

              <FiCircle className="h-2.5 w-2.5 fill-green-400 text-green-400" />

              Active

            </span>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm text-slate-400">

        <div className="flex items-center gap-3">

          <button
            className="glass-button h-11 w-11 p-0 text-white"
          >

            <FiCommand className="h-5 w-5" />

          </button>

          <div className="glass-pill normal-case tracking-normal text-white/80">

            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            className="glass-button h-11 w-11 p-0 text-white"
          >

            <FiBell className="h-5 w-5" />

          </button>

          

            <div className="flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] py-1 pl-2 pr-4">

  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#4f8cff] to-[#7c5cff] text-xs font-bold text-white">

    {initials}

  </span>

  <div className="leading-tight">

    <p className="text-sm font-semibold text-white">

      {user?.name || "Guest"}

    </p>

    <p className="text-[11px] text-slate-400">

      {user?.role || "User"}

    </p>

  </div>

</div>
          </div>

        </div>

      

    </motion.header>
  );
};

export default Navbar;