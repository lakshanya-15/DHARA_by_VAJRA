import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { Calendar, Clock, CheckCircle, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Bookings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchBookings();
  }, [t]);

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
                    <Calendar size={14} /> {new Date(booking.startDate || booking.bookingdate).toLocaleDateString()}
                  </span>
                  {booking.bookingTime && (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <Clock size={14} /> {booking.bookingTime}
                    </span>
                  )}
                  {/* Duration is not in Booking model, removed */}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              {/* Status badge with plain English label */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${booking.status === 'COMPLETED'
                  ? 'bg-gray-100 text-gray-600'
                  : (booking.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700')}`}>
                {booking.status === 'BOOKED' ? 'Reserved' : booking.status === 'COMPLETED' ? 'Finished' : booking.status === 'CANCELLED' ? 'Cancelled' : booking.status === 'PENDING' ? 'Waiting' : booking.status}
              </span>

              {(booking.status === 'BOOKED' || booking.status === 'PENDING') && (
                <button
                  onClick={async () => {
                    if (window.confirm(t('farmer.confirmCancel') || 'Are you sure you want to cancel this booking? If cancelled within 24 hours of the start time, a penalty will be applied to your trust score.')) {
                      try {
                        await bookingsAPI.cancel(booking.id);
                        // Refresh bookings list from server
                        const resp = await bookingsAPI.getMyBookings();
                        setBookings(resp.data.data || []);
                      } catch (err) {
                        alert(err.response?.data?.error || t('farmer.reserveMachineModal.bookingFailed'));
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        ))}

      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400">{t('farmer.noBookings')}</p>
        </div>
      )}
    </div>
  );
};

export default Bookings;
