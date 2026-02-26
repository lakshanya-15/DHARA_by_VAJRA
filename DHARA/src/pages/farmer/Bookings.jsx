import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { Calendar, Clock, CheckCircle, User as UserIcon, X, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Bookings = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(t('farmer.noBookings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [t]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingsAPI.cancel(id);
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel booking");
    }
  };

  if (loading) return <div className="p-4">{t('common.loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 border-gray-200">{t('farmer.mySchedule')}</h2>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${booking.status === 'COMPLETED' ? 'bg-gray-100' : 'bg-green-100'}`}>
                {booking.status === 'COMPLETED'
                  ? <CheckCircle className="text-gray-500" />
                  : <Calendar className="text-green-600" />}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-lg">{booking.Asset?.name || t('operator.other')}</h3>
                <p className="text-sm text-green-700 font-medium flex items-center gap-1 mt-1">
                  <UserIcon size={14} /> {t('landing.howItWorks.step2Desc').split('.')[0]}: {booking.Asset?.operatorName || t('common.operator')}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {new Date(booking.startDate).toLocaleDateString()}
                  </span>
                  {booking.bookingTime && (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <Clock size={14} /> {booking.bookingTime}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${booking.status === 'COMPLETED'
                  ? 'bg-gray-100 text-gray-600'
                  : (booking.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700')}`}>
                {booking.status}
              </span>

              {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedBooking(booking); setIsUpdateModalOpen(true); }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <Edit size={14} />
                    Update
                  </button>
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-100 transition-all active:scale-95 border border-red-100"
                  >
                    <Trash2 size={14} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400">{t('farmer.noBookings')}</p>
          </div>
        )}
      </div>

      {isUpdateModalOpen && selectedBooking && (
        <UpdateBookingModal
          booking={selectedBooking}
          onClose={() => { setIsUpdateModalOpen(false); setSelectedBooking(null); }}
          onSuccess={() => { setIsUpdateModalOpen(false); setSelectedBooking(null); fetchBookings(); }}
        />
      )}
    </div>
  );
};

const UpdateBookingModal = ({ booking, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [date, setDate] = useState(booking.startDate);
  const [time, setTime] = useState(booking.bookingTime || '09:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingsAPI.update(booking.id, { startDate: date, bookingTime: time });
      onSuccess();
    } catch (err) {
      alert("Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Update Booking</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-green-600 font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Time</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-green-600 font-bold text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Bookings;
