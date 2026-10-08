import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Utensils, 
  Landmark, 
  Zap, 
  Hotel, 
  Coffee, 
  Activity, 
  CreditCard, 
  ShoppingBag, 
  Star, 
  X, 
  SlidersHorizontal, 
  Check, 
  MapPin, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  fetchNearbyPlaces, 
  PlaceEntity 
} from '../../../services/mapPlatformService';

interface NearbySearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  centerCoords: { lat: number; lng: number };
  onSelectPlace: (place: PlaceEntity) => void;
}

export const NearbySearchDrawer: React.FC<NearbySearchDrawerProps> = ({
  isOpen,
  onClose,
  centerCoords,
  onSelectPlace,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [radiusMeters, setRadiusMeters] = useState<number>(2000);
  const [places, setPlaces] = useState<PlaceEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterWheelchair, setFilterWheelchair] = useState(false);
  const [filterHighRating, setFilterHighRating] = useState(false);

  const categories = [
    { id: 'all', label: 'All Places', icon: Compass },
    { id: 'food', label: 'Restaurants', icon: Utensils },
    { id: 'cafes', label: 'Cafes & Tea', icon: Coffee },
    { id: 'monuments', label: 'Monuments', icon: Landmark },
    { id: 'ev', label: 'EV Charging', icon: Zap },
    { id: 'hotels', label: 'Hotels & Stays', icon: Hotel },
    { id: 'shopping', label: 'Bazaars & Crafts', icon: ShoppingBag },
    { id: 'health', label: 'Hospitals', icon: Activity },
    { id: 'atm', label: 'ATMs & Cash', icon: CreditCard },
  ];

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetchNearbyPlaces(centerCoords, selectedCategory, radiusMeters)
      .then((res) => {
        let filtered = res;
        if (filterWheelchair) {
          filtered = filtered.filter(p => p.accessibility.isWheelchairAccessible);
        }
        if (filterHighRating) {
          filtered = filtered.filter(p => p.rating >= 4.5);
        }
        setPlaces(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, selectedCategory, radiusMeters, filterWheelchair, filterHighRating, centerCoords]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 left-4 z-30 w-88 sm:w-96 max-h-[85vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-4 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#191715] flex items-center gap-1.5">
              Nearby Search
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PRO
              </span>
            </h3>
            <p className="text-[10px] text-[#78716C]">Discover POIs around center coordinates</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSel = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSel
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                  : 'bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#443E38] border-[#E8E2D9]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Radius & Accessibility Filter Bar */}
      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFEAE2] space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#665E55]">
          <span>Search Radius</span>
          <span className="font-extrabold text-[#0284C7]">{(radiusMeters / 1000).toFixed(1)} km</span>
        </div>
        <input
          type="range"
          min="500"
          max="10000"
          step="500"
          value={radiusMeters}
          onChange={(e) => setRadiusMeters(Number(e.target.value))}
          className="w-full accent-[#0284C7] cursor-pointer"
        />

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#EAE5DC]">
          <button
            onClick={() => setFilterWheelchair(!filterWheelchair)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
              filterWheelchair
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white text-[#665E55] border-[#D8D2C7]'
            }`}
          >
            <Check className={`w-3 h-3 ${filterWheelchair ? 'opacity-100' : 'opacity-0'}`} />
            <span>Wheelchair Accessible</span>
          </button>

          <button
            onClick={() => setFilterHighRating(!filterHighRating)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
              filterHighRating
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-white text-[#665E55] border-[#D8D2C7]'
            }`}
          >
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>4.5+ Rating</span>
          </button>
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-[#78716C] flex items-center justify-between">
          <span>NEARBY RESULTS ({places.length})</span>
          <span>Tap to Inspect</span>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#78716C]">
            <div className="w-5 h-5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
            <span>Scanning area around center...</span>
          </div>
        ) : places.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#78716C] bg-[#FAF8F5] rounded-xl">
            No places match your active filters. Try extending the radius.
          </div>
        ) : (
          places.map((place) => (
            <div
              key={place.id}
              onClick={() => onSelectPlace(place)}
              className="p-2.5 rounded-xl border border-[#E8E2D9] hover:border-[#0284C7] bg-white hover:bg-[#F8FAFC] transition-all cursor-pointer group flex gap-3"
            >
              {place.photos[0] && (
                <img
                  src={place.photos[0]}
                  alt={place.title}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-[#E8E2D9]"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#191715] truncate group-hover:text-[#0284C7]">
                    {place.title}
                  </h4>
                  <span className="text-[10px] font-bold text-[#8C827A] shrink-0">
                    {place.priceLevel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 my-0.5">
                  <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{place.rating}</span>
                  </div>
                  <span className="text-[10px] text-[#78716C]">({place.reviewsCount})</span>
                  <span className="text-[10px] text-[#A8A29E]">•</span>
                  <span className="text-[10px] font-semibold text-[#0284C7]">{place.categoryLabel}</span>
                </div>

                {place.accessibility.isWheelchairAccessible && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 w-fit mt-1">
                    <span>♿ Wheelchair Accessible</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
