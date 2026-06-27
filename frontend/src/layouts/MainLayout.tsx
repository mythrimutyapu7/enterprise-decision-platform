import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-surface text-text">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="px-6 py-6 sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
