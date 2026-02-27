import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, isValidElement, cloneElement } from 'react';
import { assetsAPI, bookingsAPI, notificationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ArrowRight, Bell, TrendingUp, Wrench, Edit, Trash2, X, Plus, AlertCircle, Clock, Percent, Calculator, Info } from 'lucide-react';
import { calculateBaseCost, calculateFinalPrice } from '../../utils/pricingConfig';
import { useTranslation } from 'react-i18next';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedAsset, setSelectedAsset] = useState(null); // For Edit Modal
  const [assetToDelete, setAssetToDelete] = useState(null); // For Delete Modal
  const { t } = useTranslation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const assetsRes = await assetsAPI.getAll({ operatorId: user?.id });
      setAssets(assetsRes.data.data || []);
      const bookingsRes = await bookingsAPI.getMyBookings();
      setBookings(bookingsRes.data.data || []);
      const notifRes = await notificationsAPI.getAll();
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 30000); // Poll every 30s for dynamic updates
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const totalEarnings = bookings.reduce((sum, b) => sum + (Number(b.Asset?.hourlyRate) || 0), 0);
  const activeBookings = bookings.filter(b => b.status === 'BOOKED' || b.status === 'PENDING').length;
  const assetCount = assets.length;

  const stats = [
    { title: t('operator.machineryFleet'), value: assetCount, icon: <img src="/dhara_logo.png" className="w-8 h-8 object-cover rounded-full" alt="Logo" />, bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: t('operator.activeBookings'), value: activeBookings, icon: <Calendar className="text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: t('operator.revenue'), value: `₹${totalEarnings}`, icon: <TrendingUp className="text-green-600" />, bg: 'bg-green-50', border: 'border-green-100' },
  ];

  const handleDelete = (id) => {
    setAssetToDelete(id);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      await assetsAPI.delete(assetToDelete);
      setAssetToDelete(null);
      fetchData();
    } catch (err) {
      console.error("Delete asset error:", err);
      alert(t('common.error'));
      setAssetToDelete(null);
    }
  };

  if (!user) return <div className="p-10 text-center font-bold text-gray-400">{t('common.profileLoading')}</div>;

  return (
    <div className="space-y-10 animate-fade-up pb-20">
      {/* Header - Simple & Elegant */}
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/60 flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{t('operator.fleetManager')}</h2>
          <p className="text-slate-500 font-bold text-sm">
            {t('operator.welcomeMessage', { name: user.name })}
          </p>
        </div>
        <button
          onClick={() => navigate('/operator/add-asset')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-green-600/10 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]"
        >
          <Plus size={16} /> {t('operator.listNewMachine')}
        </button>
      </div>

      {/* Notifications Section - Themed Alerts */}
      {notifications.filter(n => !n.isread).length > 0 && (
        <div className="glass-card bg-amber-500/5 border-amber-500/20 rounded-[2rem] p-8 space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-amber-600 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
              <Bell size={18} strokeWidth={3} /> {t('operator.fleetAlerts')}
            </h3>
          </div>
          <div className="space-y-3">
            {notifications.filter(n => !n.isread).slice(0, 3).map(notif => (
              <div key={notif.id} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center shadow-sm border border-amber-500/10 animate-fade-up">
                <p className="text-sm font-bold text-slate-700">{notif.message}</p>
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-black px-4 py-2 hover:bg-amber-500/10 rounded-xl transition-colors uppercase tracking-widest"
                >
                  {t('common.confirm')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid - Refined Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md">
            <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center`}>
              {stat.icon && isValidElement(stat.icon)
                ? cloneElement(stat.icon, { size: 24 })
                : stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area - Refined Console */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-lg">
        <div className="flex bg-slate-50/50 border-b border-white/40 px-8 pt-6 gap-8 relative">
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${activeTab === 'assets' ? 'text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t('operator.machineryFleet')}
            {activeTab === 'assets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${activeTab === 'bookings' ? 'text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t('operator.activeRevenue')}
            {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>}
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
              <p className="text-green-700 font-black uppercase tracking-[0.3em] text-[10px]">{t('common.syncing')}</p>
            </div>
          ) : activeTab === 'assets' ? (
            <div className="space-y-6">
              {assets.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="p-10 text-slate-400 font-bold italic">{t('operator.noMachinery')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                          <img src="/dhara_logo.png" className="w-8 h-8 object-cover rounded-full" alt="Logo" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">{asset.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[8px] font-black rounded-lg uppercase tracking-widest">
                              {t(`operator.${(asset.type || 'Other').toLowerCase()}`, { defaultValue: asset.type || 'Other' })}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                              {t(`operator.${asset.category?.toLowerCase()}`, { defaultValue: asset.category?.replace('_', ' ') || 'OTHER' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xl font-black text-green-600 tracking-tighter">₹{asset.hourlyRate}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('operator.perHour')}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest
                            ${asset.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {asset.availability ? t('operator.active') : t('operator.reserved')}
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className="p-2.5 bg-slate-50 text-slate-400 hover:text-green-600 rounded-lg transition-colors"
                              title={t('operator.editMachine')}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                              title={t('common.removeAsset') || 'Remove Asset'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.filter(b => b.status === 'BOOKED').length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold italic">{t('operator.noBookings')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.filter(b => b.status === 'BOOKED').map((booking) => (
                    <div key={booking.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center">
                          <Calendar className="text-slate-400" size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">{booking.Asset?.name}</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.farmerName}</span>
                            </div>
                            <div className="text-[10px] text-green-600 font-bold border-l border-slate-100 pl-4">
                              {booking.startDate}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-10">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                          <Clock size={14} className="opacity-40" /> {booking.bookingTime || '09:00 AM'}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-green-600 tracking-tighter">₹{booking.Asset?.hourlyRate || 0}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('operator.revenue')}</p>
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

      {/* Utility Links - Refined */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <div
          onClick={() => navigate('/operator/analytics')}
          className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="p-4 bg-green-50 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-green-600 transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{t('operator.growthAnalytics')}</h3>
            <p className="text-xs text-slate-400 font-bold">{t('operator.growthAnalyticsDesc') || 'Deconstruct your revenue stream and fleet performance.'}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/operator/maintenance')}
          className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="p-4 bg-blue-50 rounded-xl">
              <Wrench className="text-blue-600" size={24} />
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{t('operator.fleetService')}</h3>
            <p className="text-xs text-slate-400 font-bold">{t('operator.fleetServiceDesc') || 'Maintain elite performance standards with health logs.'}</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <DeleteConfirmationModal
          onClose={() => setAssetToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Edit Asset Modal */}
      {selectedAsset && (
        <EditAssetModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onSuccess={() => {
            setSelectedAsset(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-white relative overflow-hidden animate-pop">
        <div className="absolute top-0 right-0 p-8">
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 shadow-inner">
            <AlertCircle size={40} strokeWidth={1.5} />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('common.confirmDelete') || 'Careful Now'}</h3>
            <p className="text-slate-500 font-bold text-sm mt-2 leading-relaxed">
              {t('operator.deleteWarning') || 'Are you absolutely sure you want to remove this machine? This action is permanent and cannot be reversed.'}
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              {t('common.confirmDelete') || 'Yes, Delete Machine'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl active:scale-95 transition-all"
            >
              {t('common.cancel') || 'Keep It'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditAssetModal = ({ asset, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const baseCost = useMemo(() => calculateBaseCost(asset.category || 'OTHER', asset.purchaseDate), [asset.category, asset.purchaseDate]);

  // Back-calculate initial margin: FinalPrice = BaseCost * (1 + margin) => margin = (FinalPrice / BaseCost) - 1
  const initialMargin = useMemo(() => {
    const m = (asset.hourlyRate / baseCost) - 1;
    return Math.max(0.10, Math.min(0.40, m)); // Clamp to valid range
  }, [asset.hourlyRate, baseCost]);

  const [formData, setFormData] = useState({
    name: asset.name,
    margin: initialMargin,
    availability: asset.availability,
    category: asset.category || 'OTHER',
    type: asset.type || 'Tractor',
    purchaseDate: asset.purchaseDate || new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // Recalculate base cost if category or date changes in modal
  const currentBaseCost = useMemo(() => calculateBaseCost(formData.category, formData.purchaseDate), [formData.category, formData.purchaseDate]);
  const finalPrice = useMemo(() => calculateFinalPrice(currentBaseCost, formData.margin), [currentBaseCost, formData.margin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assetsAPI.update(asset.id, {
        name: formData.name,
        category: formData.category,
        type: formData.type,
        availability: formData.availability,
        hourlyRate: finalPrice,
        purchaseDate: formData.purchaseDate
      });
      onSuccess();
    } catch (err) {
      console.error("Submit price error:", err);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="glass-card rounded-[3.5rem] max-w-5xl w-full p-12 relative shadow-[0_50px_100px_rgba(0,0,0,0.4)] animate-scale-up border-white/50 group/modal grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 mb-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover/modal:bg-green-500/10 transition-colors duration-700"></div>

        <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-3 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 z-20">
          <X size={28} strokeWidth={3} />
        </button>

        <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-green-600/20">
              <Edit size={36} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">{t('operator.editMachine')}</h3>
              <p className="text-[10px] text-green-600 font-black uppercase tracking-[0.2em] mt-1">{t('operator.refining')}: {asset.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="group/field">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2 transition-colors group-focus-within/field:text-green-600">{t('operator.machineIdentity')}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-8 py-5 bg-slate-950/5 border border-white/60 rounded-[1.5rem] focus:ring-0 focus:border-green-600 outline-none font-black text-slate-800 transition-all shadow-inner placeholder:text-slate-300"
                placeholder="e.g. Majestic Harvester X1"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="group/field">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2 transition-colors group-focus-within/field:text-green-600">{t('operator.category')}</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-8 py-5 bg-slate-950/5 border border-white/60 rounded-[1.5rem] font-black text-slate-800 outline-none appearance-none cursor-pointer shadow-inner focus:border-green-600 transition-all"
                    >
                      <option value="SOIL_PREPARATION">{t('operator.soilPrep')}</option>
                      <option value="SOWING">{t('operator.sowing')}</option>
                      <option value="PLANT_PROTECTION">{t('operator.protection')}</option>
                      <option value="HARVESTING">{t('operator.harvesting')}</option>
                      <option value="TRANSPORTATION">{t('operator.transport')}</option>
                      <option value="OTHER">{t('operator.other')}</option>
                    </select>
                  </div>
                </div>

                <div className="group/field">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2 transition-colors group-focus-within/field:text-green-600">{t('operator.purchaseDate') || 'Purchase Date'}</label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-8 py-5 bg-slate-950/5 border border-white/60 rounded-[1.5rem] font-black text-slate-800 outline-none appearance-none cursor-pointer shadow-inner focus:border-green-600 transition-all"
                  />
                </div>
              </div>
              <div className="group/field">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2 transition-colors group-focus-within/field:text-green-600">{t('operator.type')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-8 py-5 bg-slate-950/5 border border-white/60 rounded-[1.5rem] font-black text-slate-800 outline-none appearance-none cursor-pointer shadow-inner focus:border-green-600 transition-all"
                >
                  <option value="Tractor">{t('operator.tractor')}</option>
                  <option value="Harvester">{t('operator.harvester')}</option>
                  <option value="Drone">{t('operator.drone')}</option>
                  <option value="JCB">{t('operator.jcb')}</option>
                  <option value="Other">{t('operator.other')}</option>
                </select>
              </div>
            </div>

            <div className="group/field">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2 transition-colors group-focus-within/field:text-green-600">{t('operator.operationalPulse')}</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value === 'true' })}
                className="w-full px-8 py-5 bg-slate-950/5 border border-white/60 rounded-[1.5rem] font-black text-slate-800 outline-none appearance-none cursor-pointer shadow-inner focus:border-green-600 transition-all"
              >
                <option value="true">{t('operator.activeVisible')}</option>
                <option value="false">{t('operator.hiddenMaintenance')}</option>
              </select>
            </div>

            <div className="bg-slate-950/5 p-8 rounded-[2.5rem] border border-white/60 space-y-6 shadow-inner relative overflow-hidden group/margin">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black text-green-700/60 uppercase tracking-[0.2em] px-1">{t('operator.dynamicProfit')}</span>
                <div className="bg-green-600 px-5 py-2 rounded-xl text-white font-black flex items-center gap-2 shadow-lg shadow-green-600/20 animate-glow">
                  <Percent size={14} strokeWidth={3} /> {Math.round(formData.margin * 100)}%
                </div>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.40"
                step="0.01"
                value={formData.margin}
                onChange={(e) => setFormData({ ...formData, margin: parseFloat(e.target.value) })}
                className="w-full accent-green-600 h-2.5 cursor-pointer bg-slate-200 rounded-full appearance-none transition-all group-hover/margin:h-3"
              />
              <div className="flex justify-between relative z-10">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none bg-white/40 px-3 py-1 rounded-lg">10% Min</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none bg-white/40 px-3 py-1 rounded-lg">40% Max</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn btn-premium
                ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 text-white shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:shadow-[0_25px_50px_rgba(22,163,74,0.4)] active:scale-95'}`}
            >
              {loading ? t('operator.optimizing') : t('operator.applyUpdates')}
            </button>
          </form>
        </div>

        <div className="bg-slate-950/5 rounded-[3.5rem] p-10 border border-white/60 flex flex-col relative overflow-hidden shadow-inner group/breakdown">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-14 h-14 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white transition-transform group-hover/breakdown:rotate-12 duration-500">
              <Calculator size={24} className="text-green-600" />
            </div>
            <h4 className="font-black text-xl text-slate-900 tracking-tighter">{t('operator.yieldBreakdown')}</h4>
          </div>

          <div className="space-y-8 flex-1 relative z-10">
            <div className="flex justify-between items-center group/line">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] group-hover/line:text-slate-600 transition-colors">{t('operator.baseCost')}</span>
              <span className="font-black text-slate-900 text-xl tracking-tighter shadow-sm bg-white/40 px-4 py-2 rounded-xl">₹{currentBaseCost}</span>
            </div>
            <div className="flex justify-between items-center group/line">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] group-hover/line:text-slate-600 transition-colors">{t('operator.yieldModifier')}</span>
                <Info size={12} className="text-slate-300 cursor-help hover:text-green-500" />
              </div>
              <span className="font-black text-green-600 text-xl tracking-tighter px-4 py-2 bg-green-500/5 rounded-xl border border-green-500/10 animate-pulse">+{Math.round(formData.margin * 100)}%</span>
            </div>

            <div className="pt-8 border-t border-white/20">
              <div className="p-8 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl group/final hover:bg-white transition-colors duration-500">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 text-center">{t('operator.hourlyYield')}</p>
                <p className="text-5xl font-black text-slate-950 tracking-tighter text-center group-hover/final:scale-110 transition-transform duration-500">₹{finalPrice}</p>
                <p className="text-[8px] font-black text-green-600 uppercase tracking-[0.2em] mt-4 text-center bg-green-500/10 py-2 rounded-lg leading-none">{t('operator.standardValue')}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-4 items-start relative z-10 group/alert">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5 group-hover/alert:scale-110 transition-transform" />
            <p className="text-[10px] text-amber-700/80 font-bold leading-relaxed italic">
              {t('operator.marginAlert')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
