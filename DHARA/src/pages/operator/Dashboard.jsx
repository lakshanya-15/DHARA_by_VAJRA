import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { assetsAPI, bookingsAPI, notificationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Tractor, Calendar, DollarSign, ArrowRight, Bell, User as UserIcon } from 'lucide-react';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch my assets
        const assetsRes = await assetsAPI.getAll({ operatorId: user?.id });
        setAssets(assetsRes.data.data || []);

        // Fetch bookings
        const bookingsRes = await bookingsAPI.getMyBookings();
        setBookings(bookingsRes.data.data || []);

        // Fetch notifications
        const notifRes = await notificationsAPI.getAll();
        setNotifications(notifRes.data.data || []);

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isread: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Calc stats
  const myAssetsCount = assets.length;
  const myBookingsCount = bookings.length;
  const totalEarnings = bookings.reduce((sum, b) => {
    const asset = assets.find(a => a.id === b.assetId);
    return sum + (asset ? asset.hourlyRate : 0);
  }, 0);

  const stats = [
    { title: 'Total Assets', value: myAssetsCount, icon: <Tractor className="text-blue-600" />, bg: 'bg-blue-100' },
    { title: 'Total Bookings', value: myBookingsCount, icon: <Calendar className="text-purple-600" />, bg: 'bg-purple-100' },
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

      {/* Notifications Section */}
      {notifications.filter(n => !n.isread).length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
              <Bell size={20} /> New Bookings & Alerts
            </h3>
          </div>
          <div className="space-y-2">
            {notifications.filter(n => !n.isread).slice(0, 3).map(notif => (
              <div key={notif.id} className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm border border-orange-100">
                <p className="text-sm text-gray-700">{notif.message}</p>
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                >
                  Mark Read
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Recent Bookings -> Show Farmer Name */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Detailed Bookings</h3>
          <p className="text-sm text-gray-500">Party information</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Machine</th>
                <th className="p-4">Farmer Name</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Earning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-400">No bookings yet.</td>
                </tr>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 font-medium text-gray-900">{booking.Asset?.name}</td>
                    <td className="p-4 text-gray-600 flex items-center gap-2">
                      <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                        <UserIcon size={14} />
                      </div>
                      {booking.farmerName}
                    </td>
                    <td className="p-4 text-gray-500">{booking.startDate}</td>
                    <td className="p-4 text-right font-medium text-green-600">₹{booking.Asset?.priceperday || 0}</td>
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
