import { useState, useEffect, isValidElement, cloneElement } from 'react';
import { assetsAPI, bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Search, MapPin, Calendar, Clock, CheckCircle,
    User as UserIcon, ShoppingCart,
    Wallet, Filter, X, ArrowRight, Info, Calculator
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('browse');
    const [assets, setAssets] = useState([]);
    const [bookings, setBookings] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [radius, setRadius] = useState(25);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetsRes, bookingsRes] = await Promise.all([
                assetsAPI.getAll(),
                bookingsAPI.getMyBookings()
            ]);
            setAssets(assetsRes.data.data || []);
            setBookings(bookingsRes.data.data || []);
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s for dynamic updates
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter Logic
    const filteredAssets = assets.filter((asset) => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Stats Calculation
    const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.Asset?.hourlyRate) || 0), 0);
    const activeBookings = bookings.filter(b => b.status === 'BOOKED' || b.status === 'PENDING').length;

    const stats = [
        { title: t('farmer.totalBookings'), value: bookings.length, icon: <ShoppingCart className="text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-100' },
        { title: t('farmer.activeJobs'), value: activeBookings, icon: <Calendar className="text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-100' },
        { title: t('farmer.totalSpent'), value: `₹${totalSpent} `, icon: <Wallet className="text-green-600" />, bg: 'bg-green-50', border: 'border-green-100' },
    ];

    const getAssetImage = (type) => {
        const assetImages = {
            'Tractor': '/dhara_logo.png',
            'Drone': '/assets/images/drone.png',
            'Harvester': '/assets/images/harvester.png',
            'JCB': '/assets/images/jcb.png'
        };
        return assetImages[type] || '/dhara_logo.png';
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header - Simple & Elegant */}
            <div className="glass-card p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group border-white/60">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none mb-2">{t('farmer.console')}</h2>
                    <p className="text-slate-500 font-bold text-sm max-w-md leading-relaxed">
                        {t('farmer.welcomeMessage', { name: user?.name })}
                    </p>
                </div>
                <div className="flex items-center gap-5 bg-white/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/60 relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-green-600/10">
                        {user?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-green-700/60 uppercase tracking-[0.2em] mb-0.5">{t('farmer.villageNetwork')}</p>
                        <p className="text-base font-black text-slate-800">{user?.village || t('farmer.localRegion')}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Clean & Elegant */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 flex items-center gap-5 transition-all hover:translate-y-[-4px] hover:shadow-lg">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-sm`}>
                            {stat.icon && isValidElement(stat.icon)
                                ? cloneElement(stat.icon, { size: 24 })
                                : stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">{stat.title}</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Container - Simple & Elegant */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-lg">
                {/* Refined Tab Bar */}
                <div className="flex bg-slate-50/50 border-b border-white/40 px-8 pt-6 gap-8 relative">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${activeTab === 'browse' ? 'text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {t('farmer.machineryMarket')}
                        {activeTab === 'browse' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${activeTab === 'bookings' ? 'text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {t('farmer.mySchedule')}
                        {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>}
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'browse' ? (
                        <div className="space-y-8">
                            {/* Filters Area - Refined */}
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full lg:w-96 group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder={t('farmer.searchMachinery')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none font-bold text-slate-800 transition-all shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="flex-1 lg:flex-none px-6 py-3.5 bg-white border border-slate-100 rounded-xl font-bold text-slate-600 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="All">{t('farmer.allCategories')}</option>
                                        <option value="SOIL_PREPARATION">{t('operator.soilPrep')}</option>
                                        <option value="SOWING">{t('operator.sowing')}</option>
                                        <option value="PLANT_PROTECTION">{t('operator.protection')}</option>
                                        <option value="HARVESTING">{t('operator.harvesting')}</option>
                                        <option value="TRANSPORTATION">{t('operator.transport')}</option>
                                        <option value="OTHER">{t('operator.other')}</option>
                                    </select>

                                    <div className="flex items-center gap-4 px-6 py-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('farmer.radius', { radius })}</span>
                                        <input
                                            type="range" min="5" max="100" step="5"
                                            value={radius} onChange={(e) => setRadius(e.target.value)}
                                            className="accent-green-600 h-1.5 w-24 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Machinery Grid - Clean & Elegant */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAssets.map((asset) => (
                                    <div key={asset.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                        <div className="h-56 bg-slate-50 p-6 relative flex items-center justify-center">
                                            {!asset.availability && (
                                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                                    <span className="bg-white/90 px-4 py-2 rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('farmer.reserved')}</span>
                                                </div>
                                            )}
                                            <img
                                                src={asset.image || getAssetImage(asset.type)}
                                                alt={asset.name}
                                                className="h-full w-full object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-lg tracking-tight mb-1">{asset.name}</h4>
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <MapPin size={12} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{asset.location || 'Local Hub'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-green-600 tracking-tighter">₹{asset.hourlyRate}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">per hour</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedAsset(asset)}
                                                disabled={!asset.availability}
                                                className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                                                          ${asset.availability
                                                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-600/10 active:scale-95'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {asset.availability ? t('farmer.reserveMachinery') : t('farmer.unavailable')}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {filteredAssets.length === 0 && (
                                    <div className="col-span-full py-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                            <Search className="text-gray-200" size={40} />
                                        </div>
                                        <p className="text-gray-400 font-bold text-lg">{t('farmer.noMatches')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* My Bookings Tab Content */
                        <div className="space-y-6">
                            {bookings.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                        <Calendar className="text-gray-200" size={40} />
                                    </div>
                                    <p className="text-gray-400 font-bold text-lg">{t('farmer.noBookings')}</p>
                                    <button
                                        onClick={() => setActiveTab('browse')}
                                        className="text-green-600 font-black uppercase text-xs tracking-widest hover:underline"
                                    >
                                        {t('farmer.goToMarket')}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {bookings.map((booking) => (
                                        <div key={booking.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-6">
                                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center p-2">
                                                    <img src="/dhara_logo.png" className="w-full h-full object-cover rounded-full" alt="Logo" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-800 tracking-tight">{booking.Asset?.name || 'Machinery'}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <Calendar size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{booking.startDate}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <Clock size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{booking.bookingTime}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-800 tracking-tighter">₹{booking.Asset?.hourlyRate || 0}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('farmer.hourlyYield')}</p>
                                                </div>
                                                <div className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em]
                                                    ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {booking.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal Integration */}
            {selectedAsset && (
                <BookingModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                    onSuccess={() => {
                        setSelectedAsset(null);
                        fetchData();
                        setActiveTab('bookings'); // Take them to their schedule after booking
                    }}
                />
            )}
        </div>
    );
};

const BookingModal = ({ asset, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await bookingsAPI.create({
                assetId: asset.id,
                startDate: date,
                bookingTime: time
            });
            setIsSuccess(true);
            setTimeout(() => onSuccess(), 1500); // Small delay to let success state show
        } catch (err) {
            setError(err.response?.data?.error || t('farmer.reserveMachineModal.bookingFailed'));
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="glass-card rounded-[3rem] max-w-sm w-full p-12 text-center animate-scale-up shadow-[0_40px_80px_rgba(0,0,0,0.3)] border-white/40">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-600/30 animate-pulse-glow">
                        <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">{t('farmer.reserveMachineModal.successTitle')}</h3>
                    <p className="text-slate-500 font-bold mb-10 leading-relaxed uppercase tracking-tighter">
                        {t('farmer.reserveMachineModal.successText')}
                    </p>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-green-600 h-full animate-progress-fast shadow-[0_0_15px_rgba(22,163,74,0.5)]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="glass-card rounded-[3.5rem] max-w-lg w-full p-12 relative shadow-[0_50px_100px_rgba(0,0,0,0.4)] animate-scale-up border-white/50 group/modal mt-20 mb-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover/modal:bg-green-500/10 transition-colors duration-700"></div>

                <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-3 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 z-20">
                    <X size={28} strokeWidth={3} />
                </button>

                <div className="flex items-center gap-6 mb-10 relative z-10">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl border border-green-100">
                        <img src="/dhara_logo.png" alt="Logo" className="w-12 h-12 object-cover rounded-full" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">{t('farmer.reserveMachineModal.title')}</h3>
                        <p className="text-[10px] text-green-600 font-black uppercase tracking-[0.2em] mt-1">{t('farmer.reserveMachineModal.securing', { name: asset.name })}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {error && <div className="p-5 bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/10 animate-shake">{error}</div>}

                    <div className="grid gap-6">
                        <div className="group/field">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2 transition-colors group-focus-within/field:text-green-600">{t('farmer.reserveMachineModal.selectedDate')}</label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-green-600 transition-colors">
                                    <Calendar size={22} />
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-[4.5rem] pr-8 py-5 bg-slate-950/5 border border-white/60 rounded-[1.5rem] focus:ring-0 focus:border-green-600 outline-none font-black text-slate-800 transition-all shadow-inner placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="group/field">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2 transition-colors group-focus-within/field:text-green-600">{t('farmer.reserveMachineModal.preferredTime')}</label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-green-600 transition-colors">
                                    <Clock size={22} />
                                </div>
                                <input
                                    type="time"
                                    required
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full pl-[4.5rem] pr-8 py-5 bg-slate-950/5 border border-white/60 rounded-[1.5rem] focus:ring-0 focus:border-green-600 outline-none font-black text-slate-800 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/5 p-8 rounded-[2rem] border border-white/60 space-y-5 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-green-700/60 uppercase tracking-[0.2em] mb-1 leading-none">{t('farmer.reserveMachineModal.standardRate')}</p>
                                <p className="text-[10px] text-slate-400 font-bold italic">{t('farmer.reserveMachineModal.noUpfront')}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{asset.hourlyRate}</span>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">/ hour</p>
                            </div>
                        </div>
                        <div className="pt-5 border-t border-white/20 flex gap-4 items-start relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0 shadow-sm border border-white">
                                <Calculator size={14} className="text-green-600" />
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic opacity-70">
                                {t('farmer.reserveMachineModal.standardizedNote')}
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn btn-premium
                            ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 text-white shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:shadow-[0_25px_50px_rgba(22,163,74,0.4)] active:scale-95'}`}
                    >
                        {loading ? t('farmer.reserveMachineModal.transmitting') : t('farmer.reserveMachineModal.confirm')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FarmerDashboard;
