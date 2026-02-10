import { ASSETS } from '../../services/mockData';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyAssets = () => {
  const navigate = useNavigate();
  // Filter for 'my' assets
  // For MVP we just show all or a subset
  const myAssets = ASSETS; 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Listed Assets</h2>
        <button 
           onClick={() => navigate('/operator/add-asset')}
           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          + Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-40 bg-gray-50 p-4 flex items-center justify-center relative">
               <img src={asset.image} alt={asset.name} className="h-full object-contain" />
               <div className="absolute top-2 right-2 flex gap-2">
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
                  <MapPin size={14} /> {asset.location}
                </p>
              </div>
              
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                 <div>
                   <span className="text-xs text-gray-400 block">Price</span>
                   <span className="font-bold text-green-600">₹{asset.price}<span className="text-xs font-normal text-gray-400">/hr</span></span>
                 </div>
                 <div className="flex gap-2 text-sm">
                   <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                     {asset.available ? 'Active' : 'Rented'}
                   </span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAssets;
