import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { assetsAPI, bookingsAPI } from '../../services/api'; // Import APIs (bookingsAPI needs myBookings endpoint for operator?)
import { useAuth } from '../../context/AuthContext';
import { Tractor, Calendar, DollarSign, ArrowRight } from 'lucide-react';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch my assets
        const assetsRes = await assetsAPI.getAll({ operatorId: user?.id });
        setAssets(assetsRes.data.data || []);

        // Fetch bookings (Dashboard assumes we can see bookings for our assets)
        // Note: bookingsAPI.getMyBookings() is for Farmers to see their bookings.
        // We probably need an operator specific bookings endpoint or filter.
        // For MVP, we'll verify if 'getMyBookings' returns what we need or if we use local filtering on a global list (not secure but MVP)
        // Actually, backend app.js says: admin: GET /admin/bookings. 
        // create: POST /bookings (FARMER).
        // It doesn't seem to have "Get Bookings for my Assets" for Operator.
        // We'll leave bookings empty/mock for now or assume fetching all if role is operator?
        // Let's stick to assets primarily for the "Make Interactive" request.

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Calc stats
  const myAssets = assets.length;
  // const myBookings = bookings.length; 
  // const totalEarnings = bookings.reduce...
  const myBookings = 0;
  const totalEarnings = 0;

  const stats = [
    { title: 'Total Assets', value: myAssets, icon: <Tractor className="text-blue-600" />, bg: 'bg-blue-100' },
    { title: 'Total Bookings', value: myBookings, icon: <Calendar className="text-purple-600" />, bg: 'bg-purple-100' },
    { title: 'Total Earnings', value: `₹${totalEarnings}`, icon: <DollarSign className="text-green-600" />, bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Operator Dashboard</h2>
        <button
          onClick={() => navigate('/operator/add-asset')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          + Add New Asset
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-full ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity -> My Assets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">My Assets</h3>
          <button
            onClick={() => navigate('/operator/my-assets')}
            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Asset Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-400">No assets listed yet.</td>
                </tr>
              ) : (
                assets.slice(0, 5).map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{asset.name}</td>
                    <td className="p-4 text-gray-500">{asset.type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold
                        ${asset.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {asset.isAvailable ? 'Active' : 'Rented'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">₹{asset.hourlyRate}/hr</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
