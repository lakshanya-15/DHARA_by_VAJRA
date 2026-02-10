import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    // If user has a role but not the allowed one, redirect them to their own dashboard
    // or a generic unauthorized page.
    const role = user.role.toLowerCase();
    if (role === 'farmer') return <Navigate to="/farmer/assets" replace />;
    if (role === 'operator') return <Navigate to="/operator/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
