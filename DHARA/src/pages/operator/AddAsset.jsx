import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Upload, Info, Calculator, Percent } from 'lucide-react';
import { assetsAPI } from '../../services/api';
import { calculateBaseCost, calculateFinalPrice } from '../../utils/pricingConfig';

const AddAsset = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Tractor',
    category: 'SOIL_PREPARATION',
    margin: 0.20, // Default 20%
    location: '',
    description: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');

  // Calculate pricing in real-time
  const baseCost = useMemo(() => calculateBaseCost(formData.category, formData.purchaseDate), [formData.category, formData.purchaseDate]);
  const finalPrice = useMemo(() => calculateFinalPrice(baseCost, formData.margin), [baseCost, formData.margin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await assetsAPI.create({
        name: formData.name,
        type: formData.type,
        category: formData.category,
        hourlyRate: finalPrice,
        description: formData.description,
        purchaseDate: formData.purchaseDate,
      });
      navigate('/operator/dashboard');
    } catch (err) {
      console.error("Failed to add asset", err);
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'margin' ? parseFloat(value) : value
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-10">
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="p-2 bg-white rounded-2xl shadow-sm border border-green-100">
          <img src="/dhara_logo.png" alt="Logo" className="w-10 h-10 object-cover rounded-full" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{t('operator.listNewMachine')}</h2>
          <p className="text-gray-500 font-bold mt-1">{t('operator.welcomeMessage', { name: '' }).split(',')[0]} {t('operator.fleetAlerts')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('operator.machineIdentity')}</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none font-bold text-gray-800 transition-all shadow-inner"
                placeholder="e.g. John Deere 5050D"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('operator.category')}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none appearance-none cursor-pointer transition-all shadow-inner"
                >
                  <option value="SOIL_PREPARATION">{t('operator.soilPrep')}</option>
                  <option value="SOWING">{t('operator.sowing')}</option>
                  <option value="PLANT_PROTECTION">{t('operator.protection')}</option>
                  <option value="HARVESTING">{t('operator.harvesting')}</option>
                  <option value="TRANSPORTATION">{t('operator.transport')}</option>
                  <option value="OTHER">{t('operator.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('operator.type')}</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none appearance-none cursor-pointer transition-all shadow-inner"
                >
                  <option value="Tractor">{t('operator.tractor')}</option>
                  <option value="Harvester">{t('operator.harvester')}</option>
                  <option value="Drone">{t('operator.drone')}</option>
                  <option value="JCB">{t('operator.jcb')}</option>
                  <option value="Other">{t('operator.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('operator.purchaseDate') || 'Purchase Date'}</label>
                <input
                  type="date"
                  name="purchaseDate"
                  required
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none font-bold text-gray-800 transition-all shadow-inner cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('farmer.localRegion')}</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none font-bold text-gray-800 transition-all shadow-inner"
                  placeholder="Village, District"
                />
              </div>
            </div>

            {/* Price Algorithm Section */}
            <div className="bg-green-50/50 p-8 rounded-[2rem] border border-green-100 space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black text-green-700 uppercase tracking-widest px-1">{t('operator.dynamicProfit')}</label>
                <div className="bg-white px-4 py-2 rounded-xl text-green-700 font-black flex items-center gap-1 shadow-sm border border-green-100">
                  <Percent size={14} /> {Math.round(formData.margin * 100)}%
                </div>
              </div>

              <div className="relative pt-2">
                <input
                  type="range"
                  name="margin"
                  min="0.10"
                  max="0.40"
                  step="0.01"
                  value={formData.margin}
                  onChange={handleChange}
                  className="w-full accent-green-600 h-2 cursor-pointer appearance-none bg-green-200 rounded-full"
                />
                <div className="flex justify-between mt-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">10% (Min)</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">40% (Max)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/60 p-4 rounded-2xl border border-green-100">
                <Info size={16} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 font-bold leading-relaxed">
                  {t('operator.marginAlert')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/operator/dashboard')}
              className="px-8 py-3 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600 transition-colors"
            >
              {t('common.confirm').split(' ')[0]}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? t('operator.optimizing') : t('operator.listNewMachine')}
            </button>
          </div>
        </form>

        {/* Right Side: Pricing Breakdown Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
              <h3 className="font-black text-gray-900 flex items-center gap-2">
                <Calculator size={18} className="text-green-600" />
                {t('operator.yieldBreakdown')}
              </h3>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-black uppercase tracking-widest">{t('operator.baseCost')} (B)</span>
                <span className="font-black text-gray-900">₹{baseCost}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-black uppercase tracking-widest">{t('operator.yieldModifier')}</span>
                  <span className="text-[8px] font-black uppercase text-green-600">
                    {new Date().getFullYear() - new Date(formData.purchaseDate).getFullYear() < 2 ? 'New Machine (~25% Premium)' :
                      new Date().getFullYear() - new Date(formData.purchaseDate).getFullYear() > 7 ? 'Aged Machine (~15% Discount)' : 'Standard Age'}
                  </span>
                </div>
                <span className="font-black text-green-600">+ ₹{finalPrice - baseCost}</span>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('operator.standardValue')}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{finalPrice}</span>
                  <span className="text-sm font-bold text-gray-400">/{t('operator.perHour')}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Algorithm Explanation</p>
                <p className="text-[11px] text-blue-800 font-bold leading-relaxed italic">
                  "Market depreciation + legal charges + operator wages, plus your {Math.round(formData.margin * 100)}% margin."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAsset;
