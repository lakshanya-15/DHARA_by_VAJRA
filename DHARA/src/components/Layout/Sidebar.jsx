import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Calendar,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { useState, isValidElement, cloneElement } from 'react';

import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobile state
  const { t, i18n } = useTranslation();

  if (!user) return null;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getLinks = () => {
    switch (user.role) {
      case 'farmer':
        return [
          { name: t('sidebar.dashboard'), path: '/farmer/dashboard', icon: <LayoutDashboard /> },
          { name: t('sidebar.calendar'), path: '/farmer/calendar', icon: <Calendar /> },
        ];
      case 'operator':
        return [
          { name: t('sidebar.dashboard'), path: '/operator/dashboard', icon: <LayoutDashboard /> },
          { name: t('sidebar.analytics'), path: '/operator/analytics', icon: <TrendingUp /> },
          { name: t('sidebar.myAssets'), path: '/operator/assets', icon: <img src="/dhara_logo.png" className="w-5 h-5 object-cover rounded-full" alt="" /> },
          { name: t('sidebar.addAsset'), path: '/operator/add-asset', icon: <PlusCircle /> },
          { name: t('sidebar.maintenance'), path: '/operator/maintenance', icon: <Wrench /> },
        ];
      case 'admin':
        return [
          { name: t('sidebar.dashboard'), path: '/admin/dashboard', icon: <LayoutDashboard /> },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Container - Light & Elegant */}
      <div className={`
        fixed inset-y-0 left-0 bg-white/90 backdrop-blur-xl w-72 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-all duration-500 ease-in-out z-40
        border-r border-slate-100 shadow-[2px_0_15px_rgba(0,0,0,0.03)]
      `}>
        <div className="flex flex-col h-full">
          {/* Brand Header - Clean */}
          <div className="p-10 border-b border-slate-50 flex items-center justify-center relative overflow-hidden group">
            <h1 className="relative z-10 text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
              <img src="/dhara_logo.png" alt="DHARA Logo" className="w-10 h-10 object-cover rounded-full drop-shadow-md border border-slate-100" />
              DHARA
            </h1>
          </div>

          {/* User Profile Hook - High Contrast */}
          <div className="mx-6 mt-8 mb-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-green-600/10">
                {user.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm tracking-tight">{user.name}</p>
                <p className="text-[8px] text-green-700 uppercase font-bold tracking-[0.2em] mt-0.5">
                  {user.role === 'farmer' ? t('common.farmer') : user.role === 'operator' ? t('common.operator') : t('common.admin')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation - High Contrast Links */}
          <nav className="flex-1 px-6 space-y-1.5 pt-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden group
                  ${isActive(link.path)
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <div className={`transition-transform duration-300 ${isActive(link.path) ? 'text-white' : 'text-slate-400 group-hover:text-green-600'}`}>
                  {isValidElement(link.icon)
                    ? cloneElement(link.icon, { size: 18, strokeWidth: isActive(link.path) ? 3 : 2 })
                    : link.icon}
                </div>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Footer / Logout */}
          <div className="p-8 border-t border-slate-50 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language</span>
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${i18n.language === 'en' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${i18n.language === 'hi' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            <button
              onClick={logout}
              className="group flex items-center gap-4 px-6 py-4 w-full text-left text-slate-500 hover:text-red-600 rounded-xl transition-all text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-50"
            >
              <LogOut size={18} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
