import { useState, useEffect } from 'react';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { assetsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const MyAssets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myAssets, setMyAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAssets = async () => {
      try {
        if (user?.id) {
          const response = await assetsAPI.getAll({ operatorId: user.id });
          setMyAssets(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch my assets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAssets();
  }, [user]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('operator.machineryFleet')}</h2>
        <button
          onClick={() => navigate('/operator/add-asset')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          {t('operator.listNewMachine')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-40 bg-gray-50 p-4 flex items-center justify-center relative">
              <img
                src={asset.image || getAssetImage(asset.type)}
                alt={asset.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button className="bg-white p-2 rounded-full shadow-sm hover:text-blue-600 transition-colors">
                  <Edit size={16} />
                </button>
                <button className="bg-white p-2 rounded-full shadow-sm hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{asset.name}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {asset.location || t('farmer.localRegion')}
                </p>
              </div>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                <div>
                  <span className="text-xs text-gray-400 block">{t('landing.howItWorks.step3')}</span>
                  <span className="font-bold text-green-600">₹{asset.hourlyRate}<span className="text-xs font-normal text-gray-400">/{t('operator.perHour')}</span></span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold
                     ${asset.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {asset.availability ? t('operator.active') : t('operator.reserved')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {myAssets.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">
            <p>{t('operator.noMachinery')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssets;
