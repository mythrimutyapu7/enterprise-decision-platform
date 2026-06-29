import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiMoon, FiSun, FiCalendar, FiChevronDown } from "react-icons/fi";

const Navbar = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
    setIsLight(document.body.classList.contains("light-theme"));
  }, []);

  const toggleTheme = () => {
    const nextState = !isLight;
    setIsLight(nextState);
    if (nextState) {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className="
        z-30
        mb-6
        flex
        flex-col
        items-center
        justify-between
        gap-4
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        px-6
        py-4
        shadow-[0_38px_90px_rgba(0,0,0,0.24)]
        backdrop-blur-md
        sm:flex-row
      "
    >
      {/* SEARCH BAR (Left) */}
      <div className="relative w-full sm:w-80">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#4f8cff]/50 transition duration-300"
          placeholder="Search incidents, users, IPs..."
        />
      </div>

      {/* CONTROLS (Right) */}
      <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition duration-300"
          title="Toggle light/dark theme"
        >
          {isLight ? <FiSun className="h-5 w-5 text-amber-500" /> : <FiMoon className="h-5 w-5" />}
        </button>
      </div>
    </motion.header>
  );
};

export default Navbar;