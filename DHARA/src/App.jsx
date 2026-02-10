import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import Assets from './pages/farmer/Assets';
import Bookings from './pages/farmer/Bookings';

import OperatorDashboard from './pages/operator/Dashboard';
import AddAsset from './pages/operator/AddAsset';
import MyAssets from './pages/operator/MyAssets';

import AdminDashboard from './pages/admin/Dashboard';

// Placeholder Pages (we will implement these next)
const Placeholder = ({ title }) => (
  <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    <p className="text-gray-500">This feature is under development.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Area with Sidebar Layout */}
          <Route element={<Layout />}>
            
            {/* Farmer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
              <Route path="/farmer/assets" element={<Assets />} />
              <Route path="/farmer/bookings" element={<Bookings />} />
            </Route>

            {/* Operator Routes */}
            <Route element={<ProtectedRoute allowedRoles={['operator']} />}>
              <Route path="/operator/dashboard" element={<OperatorDashboard />} />
              <Route path="/operator/add-asset" element={<AddAsset />} />
              <Route path="/operator/assets" element={<MyAssets />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
