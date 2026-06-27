import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const MainLayout = () => {
  return (
    <div className="relative min-h-screen text-text">
      <div className="pointer-events-none fixed left-[-8rem] top-12 h-96 w-96 rounded-full bg-[#7c5cff]/18 blur-3xl" />
      <div className="pointer-events-none fixed right-[-8rem] top-[22rem] h-96 w-96 rounded-full bg-[#4f8cff]/14 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-[#22c55e]/5 blur-3xl" />
      <div className="relative z-10 flex min-h-screen gap-5 overflow-hidden px-3 pb-6 pt-4 sm:px-5 md:px-6">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Navbar />
          <main className="mx-auto max-w-[1600px] px-1 py-5 sm:px-3 lg:px-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
