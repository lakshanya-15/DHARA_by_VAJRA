import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle } from 'lucide-react';

const MaintenanceLogs = () => {
    const { t } = useTranslation();
    const [logs] = useState([
        { id: 1, asset: 'John Deere 5050D', date: '2026-02-01', type: t('operator.oilChange') || 'Oil Change', cost: '₹2,500', status: t('operator.active') },
        { id: 2, asset: 'DJI Agras T40', date: '2026-02-15', type: t('operator.motorInspection') || 'Motor Inspection', cost: '₹1,200', status: t('operator.reserved') },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t('operator.fleetService')}</h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center gap-2">
                    <Plus size={16} /> {t('operator.logService') || 'Log Service'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-orange-700 font-black uppercase tracking-wider">{t('operator.nextDue') || 'Next Due'}</p>
                        <p className="text-sm font-semibold text-gray-800">John Deere 5050D - 20 Feb</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('operator.machineIdentity')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('farmer.reserveMachineModal.selectedDate')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('operator.serviceType') || 'Service Type'}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('operator.revenue')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('operator.operationalPulse')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.asset}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{log.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{log.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{log.cost}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${log.status === t('operator.active') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceLogs;
