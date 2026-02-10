import { useState, useEffect } from 'react';
import { assetsAPI, bookingsAPI } from '../../services/api';
import { Search, MapPin, Filter, X, Calendar, Clock, CheckCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
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
    const matchesType = selectedType === 'All' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = ['All', ...new Set(assets.map(a => a.type))];

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-green-600">Loading assets...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Available Assets</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tractors, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none w-full sm:w-64"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-48 bg-green-50 p-6 flex items-center justify-center relative">
              {/* Availability Badge */}
              <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-full 
                 ${asset.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {asset.availability ? 'AVAILABLE' : 'BOOKED'}
              </span>
              <img
                src={asset.image || 'https://cdn-icons-png.flaticon.com/512/2675/2675869.png'} // Fallback image 
                alt={asset.name}
                className="h-full object-contain hover:scale-110 transition-transform duration-300 drop-shadow-sm"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{asset.name}</h3>
                  <p className="text-xs text-green-700 font-medium mb-1 flex items-center gap-1">
                    <UserIcon size={12} /> {asset.operatorName || 'Listed by Operator'}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin size={14} /> {asset.location || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-bold text-lg">₹{asset.hourlyRate}</p>
                  <p className="text-xs text-gray-400">/ hr</p>
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
                  {asset.availability ? 'Book Now' : 'Unavailable'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">
            <p>No assets found matching your criteria.</p>
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
  const [date, setDate] = useState('');
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
        startDate: date
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Booking failed");
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-500 mb-6">
            You have successfully booked <strong>{asset.name}</strong>.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Done
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

        <h3 className="text-xl font-bold text-gray-900 mb-6">Book {asset.name}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assets;
