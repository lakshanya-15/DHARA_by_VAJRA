import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle, Wrench, X, Calendar as CalendarIcon, IndianRupee, FileText } from 'lucide-react';
import { maintenanceAPI, assetsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MaintenanceLogs = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        assetId: '',
        date: new Date().toISOString().split('T')[0],
        type: '',
        cost: '',
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, assetsRes] = await Promise.all([
                maintenanceAPI.list(),
                assetsAPI.getAll({ operatorId: user?.id })
            ]);
            setLogs(logsRes.data.data || []);
            setAssets(assetsRes.data.data || []);

            // Set first asset as default in form if available
            if (assetsRes.data.data?.length > 0 && !formData.assetId) {
                setFormData(prev => ({ ...prev, assetId: assetsRes.data.data[0].id }));
            }
        } catch (err) {
            console.error("Error fetching maintenance data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await maintenanceAPI.create(formData);
            setIsModalOpen(false);
            setFormData({
                assetId: assets[0]?.id || '',
                date: new Date().toISOString().split('T')[0],
                type: '',
                cost: '',
                notes: ''
            });
            fetchData();
        } catch (err) {
            console.error("Error creating maintenance log:", err);
            alert(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-up pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/60 flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{t('operator.fleetService')}</h2>
                    <p className="text-slate-500 font-bold text-sm">
                        {t('operator.fleetServiceDesc') || 'Maintain elite performance standards with health logs.'}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-600/10 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]"
                >
                    <Plus size={16} strokeWidth={3} /> {t('operator.logService') || 'Log Service'}
                </button>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] text-orange-700 font-black uppercase tracking-widest mb-1">{t('operator.nextDue') || 'Health Status'}</p>
                        <p className="text-sm font-bold text-slate-800">
                            {logs.length > 0 ? t('operator.healthyFleet') || 'All systems optimized' : t('operator.noLogs') || 'No service records yet'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-white/40">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('operator.machineIdentity')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('farmer.reserveMachineModal.selectedDate')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('operator.serviceType') || 'Service Type'}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('operator.revenue')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.notes') || 'Maintenance Details'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white/20">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center animate-pulse">
                                        <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">{t('common.syncing')}</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-bold italic">{t('operator.noLogs') || 'No maintenance records found'}</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/60 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                                    <Wrench size={18} />
                                                </div>
                                                <span className="text-sm font-black text-slate-800 tracking-tight">{log.Asset?.name || 'Unknown Machine'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black rounded-lg uppercase tracking-widest border border-blue-100">
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-black text-slate-800 text-sm">₹{log.cost}</td>
                                        <td className="px-8 py-5 text-xs text-slate-500 font-medium leading-relaxed max-w-xs">{log.notes || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-white relative overflow-hidden animate-pop">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                    <Wrench size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('operator.logService') || 'Log Maintenance'}</h3>
                                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">{t('operator.fleetHeath') || 'Record machinery service'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('operator.machineIdentity')}</label>
                                    <select
                                        required
                                        value={formData.assetId}
                                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner"
                                    >
                                        {assets.map(asset => (
                                            <option key={asset.id} value={asset.id}>{asset.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('farmer.reserveMachineModal.selectedDate')}</label>
                                        <div className="relative">
                                            <CalendarIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('operator.serviceType') || 'Service Type'}</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Oil Change"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('operator.revenue') || 'Service Cost'}</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            value={formData.cost}
                                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.notes') || 'Notes'}</label>
                                    <div className="relative">
                                        <FileText size={16} className="absolute left-5 top-5 text-slate-400" />
                                        <textarea
                                            rows="3"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner resize-none"
                                            placeholder="Initial verification passed..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all
                                        ${submitting ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95'}`}
                                >
                                    {submitting ? t('common.syncing') : t('operator.logService') || 'Log Service Record'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceLogs;
