import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide back button on dashboard pages
  const isDashboard = location.pathname.endsWith('/dashboard');

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
          {/* Global Back Button */}
          {!isDashboard && (
            <button
              onClick={() => navigate(-1)}
              className="mb-8 group flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-xl hover:shadow-green-600/5 transition-all active:scale-95 shadow-sm"
            >
              <div className="p-1.5 bg-slate-50 group-hover:bg-green-50 rounded-lg transition-colors">
                <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
            </button>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
