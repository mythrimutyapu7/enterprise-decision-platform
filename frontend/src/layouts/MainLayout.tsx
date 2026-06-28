import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { setNavigationHandler } from "../services/api";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigationHandler(navigate);
  }, [navigate]);

  return (
    <div className="h-screen overflow-hidden bg-[#0B1120] text-white">

      {/* Background */}

      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-[-180px] top-[-120px] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute right-[-200px] top-[180px] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[160px]" />

        <div className="absolute bottom-[-150px] left-1/3 h-[320px] w-[320px] rounded-full bg-cyan-500/5 blur-[120px]" />

      </div>

      <div className="flex h-full overflow-hidden">

        {/* Sidebar */}

        <aside className="hidden lg:block w-80 flex-shrink-0">

          <Sidebar />

        </aside>

        {/* Main */}

        <div className=" flex flex-1 flex-col overflow-hidden px-6 pt-4">

          <Navbar />

          {/* Only this scrolls */}

          <main className="flex-1 overflow-y-auto pb-8">

            <div className="mx-auto max-w-[1600px]">

              <Outlet />

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}