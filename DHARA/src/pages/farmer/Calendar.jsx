import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FarmerCalendar = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.calendar')}</h2>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold py-2 px-4">February 2026</span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider uppercase">
                            {t(`farmer.calendar.days.${day.toLowerCase()}`)}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 h-[600px]">
                    {Array.from({ length: 35 }).map((_, i) => {
                        const dayNum = i - 6; // Mock starting from appropriate weekday
                        return (
                            <div key={i} className={`border-r border-b border-gray-100 p-2 hover:bg-gray-50 transition-colors
                 ${dayNum <= 0 || dayNum > 28 ? 'bg-gray-50/50' : ''}`}>
                                {dayNum > 0 && dayNum <= 28 && (
                                    <>
                                        <span className="text-sm font-medium text-gray-400">{dayNum}</span>
                                        {dayNum === 10 && (
                                            <div className="mt-1 p-1 bg-green-100 text-green-700 text-[10px] rounded border border-green-200 font-bold truncate">
                                                {t('operator.tractor')} - Lucknow
                                            </div>
                                        )}
                                        {dayNum === 15 && (
                                            <div className="mt-1 p-1 bg-blue-100 text-blue-700 text-[10px] rounded border border-blue-200 font-bold truncate">
                                                {t('operator.drone')} - Spraying
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FarmerCalendar;
