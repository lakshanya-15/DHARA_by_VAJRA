import { TrendingUp, Users, Calendar, IndianRupee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15600 },
    { month: 'Apr', revenue: 28000 },
    { month: 'May', revenue: 35000 },
    { month: 'Jun', revenue: 45800 },
];

const utilizationData = [
    { name: 'Tractor', rate: 85 },
    { month: 'Drone', rate: 45 },
    { month: 'Harvester', rate: 92 },
    { month: 'JCB', rate: 70 },
];

const COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c'];

const OperatorAnalytics = () => {
    const { t } = useTranslation();
    const stats = [
        { name: t('operator.revenue'), value: '₹45,800', icon: <IndianRupee className="text-green-600" />, trend: '+12.5%' },
        { name: t('operator.activeBookings'), value: '24', icon: <Calendar className="text-blue-600" />, trend: '+8%' },
        { name: t('operator.newCustomers') || 'New Customers', value: '12', icon: <Users className="text-purple-600" />, trend: '+15%' },
        { name: t('operator.utilizationRate') || 'Utilization Rate', value: '78%', icon: <TrendingUp className="text-orange-600" />, trend: '+5%' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('operator.growthAnalytics')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-slate-50 rounded-xl">{stat.icon}</div>
                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.name}</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1 tracking-tighter">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Graph */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[400px] flex flex-col">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">{t('operator.revenue') || 'Revenue Stream'} (6 Months)</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
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
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 900
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Utilization Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[400px] flex flex-col">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">{t('operator.utilizationRate') || 'Fleet Utilization'}</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={utilizationData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis
                                    type="number"
                                    hide
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 900
                                    }}
                                    formatter={(value) => [`${value}%`, 'Utilization']}
                                />
                                <Bar dataKey="rate" radius={[0, 10, 10, 0]} barSize={24}>
                                    {utilizationData.map((entry, index) => (
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
