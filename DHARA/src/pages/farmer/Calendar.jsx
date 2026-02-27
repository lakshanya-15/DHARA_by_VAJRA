import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { bookingsAPI } from '../../services/api';

const FarmerCalendar = ({ externalBookings = null }) => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (externalBookings) {
            setBookings(externalBookings);
            setLoading(false);
            return;
        }

        const fetchBookings = async () => {
            try {
                const response = await bookingsAPI.getMyBookings();
                setBookings(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch calendar bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [externalBookings]);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    // Current month days
    const totalDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const getBookingsForDay = (day) => {
        if (!day) return [];
        return bookings.filter(b => {
            const dateStr = b.startDate || b.bookingdate;
            if (!dateStr) return false;

            // Extract YYYY-MM-DD to avoid timezone shifting issues
            const dateOnly = typeof dateStr === 'string' ? dateStr.split('T')[0] : new Date(dateStr).toISOString().split('T')[0];
            const [yearStr, monthStr, dayStr] = dateOnly.split('-');

            return parseInt(dayStr, 10) === day &&
                (parseInt(monthStr, 10) - 1) === currentDate.getMonth() &&
                parseInt(yearStr, 10) === currentDate.getFullYear();
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{t('sidebar.calendar')}</h2>
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-black text-xs uppercase tracking-widest text-slate-800 min-w-[120px] text-center">
                        {monthName} {year}
                    </span>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                    {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => (
                        <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t(`farmer.calendar.days.${day}`)}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 min-h-[600px]">
                    {days.map((day, i) => {
                        const dayBookings = getBookingsForDay(day);
                        return (
                            <div key={i} className={`border-r border-b border-gray-100 p-2 min-h-[120px] transition-colors relative
                                ${!day ? 'bg-gray-50/30' : 'hover:bg-blue-50/30'}`}>
                                {day && (
                                    <>
                                        <span className={`text-xs font-bold ${dayBookings.length > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                            {day}
                                        </span>
                                        <div className="mt-1 space-y-1">
                                            {dayBookings.map((b, idx) => (
                                                <div className={`p-1.5 ${b.status === 'COMPLETED' ? 'bg-slate-400' : (b.status === 'CANCELLED' ? 'bg-red-400' : 'bg-green-600')} text-white text-[9px] font-black rounded-lg border border-white/20 truncate shadow-sm uppercase tracking-tighter`}>
                                                    {b.Asset?.name || 'Machine'}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            {loading && (
                <div className="flex justify-center p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Updating Calendar...</p>
                </div>
            )}
        </div>
    );
};

export default FarmerCalendar;
