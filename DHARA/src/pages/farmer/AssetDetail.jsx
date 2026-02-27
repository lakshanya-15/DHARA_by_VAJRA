import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, Shield, Check, Calendar, ArrowLeft } from 'lucide-react';
import { assetsAPI, bookingsAPI } from '../../services/api';

const getAssetImage = (type) => {
  const images = {
    'Tractor': 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a0913?auto=format&fit=crop&q=80&w=800',
    'Harvester': 'https://images.unsplash.com/photo-1627497230495-20dedc34a2e5?auto=format&fit=crop&q=80&w=800',
    'Drone': 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=800',
    'JCB': 'https://images.unsplash.com/photo-1516629994640-5e608d003def?auto=format&fit=crop&q=80&w=800'
  };
  return images[type] || images['Tractor'];
};

const AssetDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await assetsAPI.getById(id);
      setAsset(response.data.data);
    } catch (err) {
      console.error('Failed to load asset details', err);
      setError('Could not load asset details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!bookingDate) {
      setError('Please select a date.');
      return;
    }
    setError('');
    setIsBooking(true);
    try {
      await bookingsAPI.create({
        assetId: asset.id,
        bookingDate,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/farmer/bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reserve machinery');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Machine Not Found</h2>
        <button onClick={() => navigate('/farmer/dashboard')} className="mt-4 text-green-600 font-semibold underline">Return to Dashboard</button>
      </div>
    );
  }

  const images = (asset.images && asset.images.length > 0)
    ? [...asset.images]
    : [getAssetImage(asset.type), 'https://images.unsplash.com/photo-1589923188900-85dae5243404?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1598516947265-cc740391d4ce?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1627497230495-20dedc34a2e5?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a0913?auto=format&fit=crop&q=80&w=400'];

  // Pad to 5 images for the grid
  while (images.length < 5 && images.length > 0) {
    images.push(images[0]);
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in relative px-4 sm:px-6">

      {/* Navigation & Header Space */}
      <div className="py-6 border-b border-slate-100 mb-6 sticky top-0 bg-white z-40">
        <button
          onClick={() => navigate('/farmer/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Search
        </button>
      </div>

      {/* Title Section */}
      <div className="mb-6 space-y-2">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          {asset.name}
        </h1>
        <div className="flex items-center flex-wrap gap-4 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-slate-900 text-slate-900" />
            <span className="font-semibold text-slate-900">4.92</span>
            <span className="underline cursor-pointer">(14 reviews)</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <div className="flex items-center gap-1">
            <Shield size={14} className="text-green-600" />
            <span>Trusted Owner</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <div className="flex items-center gap-1 underline cursor-pointer">
            <MapPin size={14} />
            <span>{asset.location || 'Local Hub'}</span>
          </div>
        </div>
      </div>

      {/* Airbnb Style Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
        <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer h-full">
          <img src={images[0]} className="w-full h-full object-cover group-hover:brightness-95 transition-all" alt="Main" />
        </div>
        <div className="hidden md:block relative group cursor-pointer h-full">
          <img src={images[1]} className="w-full h-full object-cover group-hover:brightness-95 transition-all" alt="View 2" />
        </div>
        <div className="hidden md:block relative group cursor-pointer h-full">
          <img src={images[2]} className="w-full h-full object-cover group-hover:brightness-95 transition-all" alt="View 3" />
        </div>
        <div className="hidden md:block relative group cursor-pointer h-full">
          <img src={images[3]} className="w-full h-full object-cover group-hover:brightness-95 transition-all" alt="View 4" />
        </div>
        <div className="hidden md:block relative group cursor-pointer h-full">
          <img src={images[4]} className="w-full h-full object-cover group-hover:brightness-95 transition-all" alt="View 5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        {/* Left Content: Description & Specs */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-center pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{asset.type}</h2>
              <p className="text-sm text-slate-500 font-medium">Ready for Field · Well Maintained</p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold text-xl uppercase shrink-0 ml-4">
              {asset.User?.name?.charAt(0) || 'O'}
            </div>
          </div>

          <div className="space-y-6 pb-6 border-b border-slate-200">
            <div className="flex gap-4">
              <Shield className="text-slate-800 shrink-0 w-8 h-8" strokeWidth={1.5} />
              <div>
                <h4 className="font-semibold text-slate-900">Protected Booking</h4>
                <p className="text-slate-500 text-sm mt-1">Every booking is protected by DHARA's safety guarantee. We cover machine damage up to ₹50,000.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Calendar className="text-slate-800 shrink-0 w-8 h-8" strokeWidth={1.5} />
              <div>
                <h4 className="font-semibold text-slate-900">Flexible Cancellation</h4>
                <p className="text-slate-500 text-sm mt-1">Free cancellation for 48 hours after booking.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">About this machine</h3>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
              {asset.description || "This machine is well-maintained and ready for work. It is operated by a trusted owner in your area."}
            </p>
          </div>

          <div className="space-y-4 pb-10">
            <h3 className="text-xl font-bold text-slate-900">What this machine offers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
              <div className="flex items-center gap-3 text-slate-600 font-medium"><Check size={20} /> GPS Tracking Enabled</div>
              <div className="flex items-center gap-3 text-slate-600 font-medium"><Check size={20} /> Operator Included</div>
              <div className="flex items-center gap-3 text-slate-600 font-medium"><Check size={20} /> Fuel Included in Base Rate</div>
              <div className="flex items-center gap-3 text-slate-600 font-medium"><Check size={20} /> Maintenance Log Verified</div>
            </div>
          </div>
        </div>

        {/* Right Content: Sticky Booking Widget */}
        <div className="w-full relative">
          <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-end gap-1 mb-6">
              <span className="text-2xl font-bold text-slate-900">₹{asset.hourlyRate}</span>
              <span className="text-slate-500 font-medium text-sm mb-1">/ hour</span>
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden mb-4">
              <div className="p-3 w-full">
                <label className="block text-[10px] uppercase font-bold text-slate-700 tracking-widest mb-1">Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full outline-none font-medium text-slate-900 cursor-pointer bg-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleReserve}
              disabled={isBooking || success || !asset.availability}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all
                        ${success ? 'bg-green-500' :
                  (!asset.availability ? 'bg-slate-300 cursor-not-allowed' :
                    'bg-green-600 hover:bg-green-700 active:scale-95')}
                    `}
            >
              {success ? 'Booked!' : (isBooking ? 'Booking...' : (asset.availability ? 'Book Now' : 'Not Available'))}
            </button>

            <p className="text-center text-slate-500 text-sm mt-4 font-medium">You won't be charged yet</p>
            {error && <p className="text-center text-rose-600 text-sm mt-2 font-medium bg-rose-50 p-2 rounded-lg">{error}</p>}

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>₹{asset.hourlyRate} x 5 hours estimate</span>
                <span>₹{asset.hourlyRate * 5}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="underline cursor-pointer">Service fee</span>
                <span>₹150</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between text-lg font-bold text-slate-900">
              <span>Total before taxes</span>
              <span>₹{(asset.hourlyRate * 5) + 150}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AssetDetail;
