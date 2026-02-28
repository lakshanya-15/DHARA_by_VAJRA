import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, isValidElement, cloneElement } from 'react';
import { assetsAPI, bookingsAPI, notificationsAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ArrowRight, Bell, TrendingUp, Wrench, Edit, Trash2, X, Plus, AlertCircle, Clock, Percent, Calculator, Info, User as UserIcon, Phone, MapPin, ShieldAlert, Star, CheckCircle } from 'lucide-react';
import { calculateBaseCost, calculateFinalPrice } from '../../utils/pricingConfig';
import { useTranslation } from 'react-i18next';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedAsset, setSelectedAsset] = useState(null); // For Edit Modal
  const [assetToDelete, setAssetToDelete] = useState(null); // For Delete Modal
  const { t } = useTranslation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, bookingsRes, notifRes, profileRes] = await Promise.all([
        assetsAPI.getAll({ operatorId: user?.id }),
        bookingsAPI.getMyBookings(),
        notificationsAPI.getAll(),
        authAPI.me()
      ]);
      setAssets(assetsRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
      setNotifications(notifRes.data.data || []);
      if (profileRes.data.success) {
        setWalletBalance(profileRes.data.data.walletBalance);
      }
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

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      console.log("Confirming delete for asset:", assetToDelete);
      await assetsAPI.delete(assetToDelete);
      setAssetToDelete(null);
      await fetchData();
    } catch (err) {
      console.error("Delete asset error:", err);
      const msg = err.response?.data?.error || t('common.error');
      alert(`Could not remove machine: ${msg}`);
      setAssetToDelete(null);
    }
  };

  const handleUpdateStatus = async (id, status, hoursUsed = null) => {
    try {
      await bookingsAPI.updateStatus(id, status, hoursUsed);
      fetchData();
    } catch (err) {
      console.error("Update status error", err);
      alert(err.response?.data?.error || t('common.error'));
    }
  };

  // Calc stats
  const completedRevenue = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (Number(b.Asset?.hourlyRate) || 0), 0);

  const inEscrow = bookings
    .filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (Number(b.Asset?.hourlyRate) || 0), 0);

  const busyMachines = bookings.filter(b => ['BOOKED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length;
  const assetCount = assets.length;

  const stats = [
    { title: t('operator.machineryFleet'), value: assetCount, icon: <img src="/dhara_logo.png" className="w-8 h-8 object-cover rounded-full" alt="Logo" />, bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: t('operator.activeBookings'), value: busyMachines, icon: <Calendar className="text-purple-600" />, bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: "My Wallet", value: `₹${walletBalance.toLocaleString()}`, icon: <TrendingUp className="text-green-600" />, bg: 'bg-green-50', border: 'border-green-100' },
  ];

  if (!user) return <div className="p-10 text-center font-bold text-gray-400">{t('common.profileLoading')}</div>;

  return (
    <div className="space-y-10 animate-fade-up pb-20">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/60 flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{t('operator.fleetManager')}</h2>
          <p className="text-slate-500 font-bold text-sm">{t('operator.welcomeMessage', { name: user.name })}</p>
        </div>
        <button
          onClick={() => navigate('/operator/add-asset')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-green-600/10 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]"
        >
          <Plus size={16} /> {t('operator.listNewMachine')}
        </button>
      </div>

      {notifications.filter(n => !n.isread).length > 0 && (
        <div className="glass-card bg-amber-500/5 border-amber-500/20 rounded-[2rem] p-8 space-y-6 animate-pulse">
          <h3 className="font-black text-amber-600 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
            <Bell size={18} strokeWidth={3} /> {t('operator.fleetAlerts')}
          </h3>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md">
            <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center`}>
              {isValidElement(stat.icon) ? cloneElement(stat.icon, { size: 24 }) : stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

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
                <div className="py-20 text-center"><p className="p-10 text-slate-400 font-bold italic">{t('operator.noMachinery')}</p></div>
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
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[8px] font-black rounded-lg uppercase tracking-widest">{asset.type}</span>
                          <span className="ml-2 px-2.5 py-1 bg-blue-50 text-blue-600 text-[8px] font-black rounded-lg uppercase tracking-widest">{asset.totalHoursUsed || 0} hrs logged</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xl font-black text-green-600 tracking-tighter">₹{asset.hourlyRate}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('operator.perHour')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedAsset(asset)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-green-600 rounded-lg transition-colors"><Edit size={16} /></button>
                          <button onClick={() => setAssetToDelete(asset.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="py-20 text-center"><p className="text-slate-400 font-bold italic">{t('operator.noBookings')}</p></div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className={`bg-white p-6 rounded-2xl border ${booking.status === 'CANCELLED' ? 'opacity-60 bg-slate-50 border-slate-100' : 'border-slate-100'} flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow relative overflow-hidden`}>
                      {booking.isDisputed && (
                        <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-1.5 flex items-center gap-2 rounded-br-2xl text-[9px] font-black uppercase tracking-widest z-10 shadow-lg animate-pulse">
                          <ShieldAlert size={12} /> DISPUTED ({booking.disputeStatus})
                        </div>
                      )}

                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${booking.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                          {booking.status === 'COMPLETED' ? <CheckCircle size={24} /> : <Calendar size={24} />}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">{booking.Asset?.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${booking.status === 'BOOKED' ? 'bg-blue-50 text-blue-600' :
                              booking.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                  'bg-amber-50 text-amber-600'
                              }`}>
                              {booking.status.replace('_', ' ')}
                            </div>
                            {booking.isReviewed && (
                              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-100">
                                <Star size={8} fill="currentColor" /> RATED
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><UserIcon size={10} /> {booking.farmerName}</p>
                        <p className="text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-1"><Phone size={10} className="text-green-600" /> {booking.farmerPhone || 'No Phone'}</p>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest flex items-center gap-1 max-w-[200px] text-right truncate"><MapPin size={10} className="text-blue-600" /> {booking.farmerAddress || 'No Address'}</p>
                      </div>

                      <div className="flex gap-2">
                        {booking.isDisputed ? (
                          <div className="px-4 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200">Payment Locked</div>
                        ) : (
                          <>
                            {booking.status === 'BOOKED' && (
                              <button onClick={() => handleUpdateStatus(booking.id, 'ACCEPTED')} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all">Accept Job</button>
                            )}
                            {booking.status === 'ACCEPTED' && (
                              <button onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')} className="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-amber-600 active:scale-95 transition-all">Go to Farm</button>
                            )}
                            {booking.status === 'IN_PROGRESS' && (
                              <button onClick={() => {
                                const hours = window.prompt("How many hours was the machine used?");
                                if (hours && !isNaN(hours) && Number(hours) > 0) {
                                  if (window.confirm(`Confirm the machine was used for ${hours} hours? This will finalize the payment.`)) {
                                    handleUpdateStatus(booking.id, 'COMPLETED', parseFloat(hours));
                                  }
                                } else if (hours !== null) {
                                  alert("Please enter a valid number of hours.");
                                }
                              }} className="px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-all">Complete Job</button>
                            )}
                            {booking.status === 'COMPLETED' && !booking.isReviewed && (
                              <div className="text-[9px] font-bold text-slate-400 italic">Waiting for Farmer Review...</div>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <div className="text-[9px] font-black text-red-400 uppercase tracking-widest">Cancelled</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <div onClick={() => navigate('/operator/analytics')} className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-all cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-green-50 rounded-xl"><TrendingUp className="text-green-600" size={24} /></div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-green-600 transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{t('operator.growthAnalytics')}</h3>
            <p className="text-xs text-slate-400 font-bold">{t('operator.growthAnalyticsDesc')}</p>
          </div>
        </div>
        <div onClick={() => navigate('/operator/maintenance')} className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[180px] hover:shadow-lg transition-all cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-blue-50 rounded-xl"><Wrench className="text-blue-600" size={24} /></div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{t('operator.fleetService')}</h3>
            <p className="text-xs text-slate-400 font-bold">{t('operator.fleetServiceDesc')}</p>
          </div>
        </div>
      </div>

      {assetToDelete && <DeleteConfirmationModal onClose={() => setAssetToDelete(null)} onConfirm={confirmDelete} />}
      {
        selectedAsset && (
          <EditAssetModal
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onSuccess={() => { setSelectedAsset(null); fetchData(); }}
          />
        )
      }
    </div >
  );
};

const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-white relative overflow-hidden animate-pop">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 shadow-inner"><AlertCircle size={40} strokeWidth={1.5} /></div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('common.confirmDelete')}</h3>
            <p className="text-slate-500 font-bold text-sm mt-2 leading-relaxed">{t('operator.deleteWarning')}</p>
          </div>
          <div className="flex flex-col w-full gap-3 pt-4">
            <button onClick={onConfirm} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-red-600/20 active:scale-95 transition-all">{t('common.confirmDelete')}</button>
            <button onClick={onClose} className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl active:scale-95 transition-all">{t('common.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditAssetModal = ({ asset, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const baseCost = useMemo(() => calculateBaseCost(asset.category || 'OTHER', asset.purchaseDate), [asset.category, asset.purchaseDate]);
  const initialMargin = useMemo(() => {
    const m = (asset.hourlyRate / baseCost) - 1;
    return Math.max(0.10, Math.min(0.40, m));
  }, [asset.hourlyRate, baseCost]);

  const [formData, setFormData] = useState({
    name: asset.name,
    margin: initialMargin,
    availability: asset.availability,
    category: asset.category || 'OTHER',
    type: asset.type || 'Tractor',
    attachments: (asset.attachments || []).join(', '),
    purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const currentBaseCost = useMemo(() => calculateBaseCost(formData.category, formData.purchaseDate), [formData.category, formData.purchaseDate]);
  const finalPrice = useMemo(() => calculateFinalPrice(currentBaseCost, formData.margin), [currentBaseCost, formData.margin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        hourlyRate: finalPrice,
        attachments: formData.attachments ? formData.attachments.split(',').map(s => s.trim()).filter(s => s !== '') : []
      };
      await assetsAPI.update(asset.id, payload);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] max-w-5xl w-full p-12 relative shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-12 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-3 hover:bg-slate-100 rounded-2xl transition-all z-20"><X size={28} /></button>
        <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-green-600 rounded-[1.5rem] flex items-center justify-center text-white"><Edit size={36} /></div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">{t('operator.editMachine')}</h3>
              <p className="text-[10px] text-green-600 font-black uppercase tracking-[0.2em] mt-1">{asset.name}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('operator.machineIdentity')}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('operator.category')}</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold appearance-none">
                  <option value="SOIL_PREPARATION">{t('operator.soilPrep')}</option>
                  <option value="SOWING">{t('operator.sowing')}</option>
                  <option value="PLANT_PROTECTION">{t('operator.protection')}</option>
                  <option value="HARVESTING">{t('operator.harvesting')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                <input type="date" value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments (Comma Separated)</label>
              <input
                type="text"
                value={formData.attachments}
                onChange={e => setFormData({ ...formData, attachments: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold"
                placeholder="e.g. Plough, Trailer"
              />
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Profit Added</span>
                <span className="font-black text-green-600">{Math.round(formData.margin * 100)}%</span>
              </div>
              <input type="range" min="0.10" max="0.40" step="0.01" value={formData.margin} onChange={e => setFormData({ ...formData, margin: parseFloat(e.target.value) })} className="w-full accent-green-600" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-6 bg-green-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all">
              {loading ? 'Processing...' : t('operator.applyUpdates')}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 rounded-[3.5rem] p-10 flex flex-col justify-center space-y-8">
          <div className="flex items-center gap-4"><Calculator className="text-green-600" /> <h4 className="font-black text-xl">Earnings Breakdown</h4></div>
          <div className="space-y-6">
            <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Base Price</span><span className="font-black">₹{currentBaseCost}</span></div>
            <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Profit Added</span><span className="font-black text-green-600">+{Math.round(formData.margin * 100)}%</span></div>
            <div className="pt-6 border-t border-slate-200">
              <div className="p-8 bg-white rounded-3xl text-center shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Final Rental Rate</p>
                <p className="text-4xl font-black text-slate-900">₹{finalPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
