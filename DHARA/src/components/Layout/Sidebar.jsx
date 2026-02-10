import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Tractor, 
  Calendar, 
  PlusCircle, 
  LayoutDashboard, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobile state

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'farmer':
        return [
          { name: 'Browse Assets', path: '/farmer/assets', icon: <Tractor /> },
          { name: 'My Bookings', path: '/farmer/bookings', icon: <Calendar /> },
        ];
      case 'operator':
        return [
          { name: 'Dashboard', path: '/operator/dashboard', icon: <LayoutDashboard /> },
          { name: 'Add Asset', path: '/operator/add-asset', icon: <PlusCircle /> },
          { name: 'My Assets', path: '/operator/assets', icon: <Tractor /> },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard /> },
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

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out z-40
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <Tractor className="text-green-700" />
              DHARA
            </h1>
          </div>

          {/* User Info */}
          <div className="p-4 bg-green-50 mx-4 mt-4 rounded-lg">
             <p className="font-semibold text-gray-800">{user.name}</p>
             <p className="text-xs text-green-600 uppercase font-bold tracking-wider">{user.role}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive(link.path) 
                    ? 'bg-green-100 text-green-800' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={20} />
              Sign Out
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
