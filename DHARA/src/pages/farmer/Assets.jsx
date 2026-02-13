import { useState, useEffect } from 'react';
import { assetsAPI, bookingsAPI } from '../../services/api';
import { Search, MapPin, Filter, X, Calendar, Clock, CheckCircle, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Assets = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [radius, setRadius] = useState(25);
  const [selectedAsset, setSelectedAsset] = useState(null); // For Booking Modal

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await assetsAPI.getAll();
        setAssets(response.data.data || []); // Assuming backend returns { success: true, data: [...] }
      } catch (err) {
        console.error("Failed to fetch assets:", err);
        setError("Failed to load assets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'All', name: t('farmer.allCategories') },
    { id: 'SOIL_PREPARATION', name: t('operator.soilPrep') },
    { id: 'SOWING', name: t('operator.sowing') },
    { id: 'PLANT_PROTECTION', name: t('operator.protection') },
    { id: 'HARVESTING', name: t('operator.harvesting') },
    { id: 'TRANSPORTATION', name: t('operator.transport') }
  ];


  const getAssetImage = (type) => {
    const assetImages = {
      'Tractor': '/dhara_logo.png',
      'Drone': '/assets/images/drone.png',
      'Harvester': '/assets/images/harvester.png',
      'JCB/Excavator': '/assets/images/jcb.png',
      'JCB': '/assets/images/jcb.png',
    };
    return assetImages[type] || '/dhara_logo.png';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-green-600">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">{t('farmer.machineryMarket')}</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('farmer.searchMachinery')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none w-full sm:w-64"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer text-sm font-medium"
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="flex items-center gap-3 px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{t('farmer.radius', { radius })}</span>
            <input
              type="range" min="5" max="100" step="5"
              value={radius} onChange={(e) => setRadius(e.target.value)}
              className="accent-green-600 h-1.5 w-24"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-48 bg-green-50 p-6 flex items-center justify-center relative">
              {/* Availability Badge */}
              <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-full z-10 shadow-sm
                 ${asset.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {asset.availability ? t('operator.active').toUpperCase() : t('operator.reserved').toUpperCase()}
              </span>
              <img
                src={asset.image || getAssetImage(asset.type)}
                alt={asset.name}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{asset.name}</h3>
                  <p className="text-xs text-green-700 font-medium mb-1 flex items-center gap-1">
                    <UserIcon size={12} /> {asset.operatorName || t('farmer.localRegion')}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin size={14} /> {asset.location || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-bold text-lg">₹{asset.hourlyRate}</p>
                  <p className="text-xs text-gray-400">/ {t('operator.perHour')}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                <button
                  onClick={() => setSelectedAsset(asset)}
                  disabled={!asset.availability}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-center transition-colors
                    ${asset.availability
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {asset.availability ? t('farmer.reserveMachinery') : t('farmer.unavailable')}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">
            <p>{t('farmer.noMatches')}</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedAsset && (
        <BookingModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
    </div>
  );
};

const BookingModal = ({ asset, onClose }) => {
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  // const [hours, setHours] = useState(4); // Removed hours as price is per day in DB schema
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Actually, let's just stick to the top import.
  // We need to move BookingModal inside or pass bookingsAPI, or just use the imported one.
  // Since it's in the same file, the top import 'assetsAPI' is available, but we need 'bookingsAPI'.
  // I will add bookingsAPI to the top import.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create booking
      await bookingsAPI.create({
        assetId: asset.id,
        startDate: date,
        bookingTime: time
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || t('farmer.reserveMachineModal.bookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-sm w-full p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('farmer.reserveMachineModal.successTitle')}</h3>
          <p className="text-gray-500 mb-6">
            {t('farmer.reserveMachineModal.successText')}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-6">{t('farmer.reserveMachineModal.title')}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('farmer.reserveMachineModal.selectedDate')}</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('farmer.reserveMachineModal.preferredTime')}</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center text-sm">
            <span className="font-bold text-lg text-green-700">₹{asset.hourlyRate}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-md mt-2 disabled:bg-gray-400"
          >
            {loading ? t('farmer.reserveMachineModal.transmitting') : t('farmer.reserveMachineModal.confirm')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assets;
