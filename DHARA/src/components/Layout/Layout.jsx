import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative overflow-hidden">
      {/* Subtle Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Sidebar (only if logged in) */}
      {user && <Sidebar />}

      {/* Main Content - High Depth Scroll Area */}
      <main className={`flex-1 transition-all duration-500 relative z-10 ${user ? 'md:ml-72' : ''}`}>
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
