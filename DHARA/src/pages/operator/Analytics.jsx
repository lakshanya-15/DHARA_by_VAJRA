import { TrendingUp, Users, Calendar, IndianRupee, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { bookingsAPI, assetsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#ef4444', '#f59e0b'];

const OperatorAnalytics = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                const [bookingsRes, assetsRes] = await Promise.all([
                    bookingsAPI.getMyBookings(),
                    assetsAPI.getAll()
                ]);
                setBookings(bookingsRes.data.data || []);
                setAssets(assetsRes.data.data || []);
            } catch (err) {
                console.error("Analytics fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);

    const stats = useMemo(() => {
        const completed = bookings.filter(b => b.status === 'COMPLETED');
        const active = bookings.filter(b => ['BOOKED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status));
        const totalRevenue = completed.reduce((sum, b) => sum + (Number(b.Asset?.hourlyRate) || 0), 0);
        const uniqueFarmers = new Set(bookings.map(b => b.farmerId)).size;
        const utilization = assets.length > 0 ? Math.round((active.length / assets.length) * 100) : 0;

        return [
            { name: t('operator.revenue'), value: `₹${totalRevenue.toLocaleString()}`, icon: <IndianRupee className="text-green-600" />, trend: '+12.5%', color: 'text-green-600' },
            { name: t('operator.activeBookings'), value: active.length, icon: <Calendar className="text-blue-600" />, trend: '+8%', color: 'text-blue-600' },
            { name: t('operator.newCustomers') || 'Customers Served', value: uniqueFarmers, icon: <Users className="text-purple-600" />, trend: '+15%', color: 'text-purple-600' },
            { name: t('operator.utilizationRate') || 'Fleet Usage', value: `${utilization}%`, icon: <TrendingUp className="text-orange-600" />, trend: '+5%', color: 'text-orange-600' },
        ];
    }, [bookings, assets, t]);

    const revenueChartData = useMemo(() => {
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            last6Months.push({
                month: d.toLocaleString('default', { month: 'short' }),
                revenue: 0,
                fullDate: d
            });
        }

        bookings.filter(b => b.status === 'COMPLETED').forEach(booking => {
            const bDate = new Date(booking.startDate);
            const monthName = bDate.toLocaleString('default', { month: 'short' });
            const monthData = last6Months.find(m => m.month === monthName);
            if (monthData) {
                monthData.revenue += Number(booking.Asset?.hourlyRate) || 0;
            }
        });

        return last6Months;
    }, [bookings]);

    const utilizationChartData = useMemo(() => {
        const types = {};
        assets.forEach(a => {
            if (!types[a.type]) types[a.type] = { name: a.type, count: 0, booked: 0 };
            types[a.type].count++;
        });

        bookings.forEach(b => {
            const type = b.Asset?.type;
            if (type && types[type]) {
                types[type].booked++;
            }
        });

        return Object.values(types).map(t => ({
            name: t.name,
            rate: t.count > 0 ? Math.round((t.booked / (t.count * 5)) * 100) : 0 // Normalized over assumed capacity
        })).slice(0, 4);
    }, [assets, bookings]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Analyzing Fleet Performance...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:shadow-md active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('operator.growthAnalytics')}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time business performance overview</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">{stat.icon}</div>
                            <span className="text-[9px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.name}</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Graph */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-[450px] flex flex-col group hover:shadow-xl transition-all duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('operator.revenueStream') || 'Money Earned'} (6 Months)</h3>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={(value) => `₹${value >= 1000 ? value / 1000 + 'k' : value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                        fontSize: '12px',
                                        fontWeight: 900,
                                        padding: '16px'
                                    }}
                                    itemStyle={{ color: '#16a34a' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Utilization Chart */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-[450px] flex flex-col group hover:shadow-xl transition-all duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('operator.utilizationRate') || 'Machine Usage Rate'}</h3>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={utilizationChartData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc', radius: 10 }}
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                        fontSize: '12px',
                                        fontWeight: 900,
                                        padding: '16px'
                                    }}
                                    formatter={(value) => [`${value}%`, 'Busy Rate']}
                                />
                                <Bar dataKey="rate" radius={[0, 20, 20, 0]} barSize={32}>
                                    {utilizationChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorAnalytics;
