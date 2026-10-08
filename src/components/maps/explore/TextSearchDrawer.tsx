import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  X, 
  MapPin, 
  Star, 
  Navigation2, 
  Zap, 
  Utensils, 
  Landmark, 
  Coffee 
} from 'lucide-react';
import { 
  executeTextSearch, 
  PlaceEntity 
} from '../../../services/mapPlatformService';

interface TextSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  centerCoords: { lat: number; lng: number };
  onSelectPlace: (place: PlaceEntity) => void;
}

export const TextSearchDrawer: React.FC<TextSearchDrawerProps> = ({
  isOpen,
  onClose,
  centerCoords,
  onSelectPlace,
}) => {
  const [query, setQuery] = useState('EV charging station');
  const [results, setResults] = useState<PlaceEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const sampleQueries = [
    { label: '⚡ EV charging station', q: 'EV charging station' },
    { label: '🏛️ Historic mughal monuments', q: 'historic mughal monuments' },
    { label: '🍛 Authentic Old Delhi biryani', q: 'biryani dinner restaurant' },
    { label: '☕ Specialty coffee roasters', q: 'cafe coffee bakery' },
  ];

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);

    executeTextSearch(searchQuery, centerCoords)
      .then((res) => {
        setResults(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 left-4 z-30 w-88 sm:w-96 max-h-[85vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-4 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#191715] flex items-center gap-1.5">
              Text Search
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                ENTERPRISE
              </span>
            </h3>
            <p className="text-[10px] text-[#78716C]">Natural language queries on map data</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC]">
        <Search className="w-4 h-4 text-[#0284C7] ml-1.5 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. EV charging station, rooftop cafe..."
          className="w-full text-xs font-semibold bg-transparent text-[#191715] placeholder:text-[#A8A29E] outline-none"
        />
        <button
          onClick={() => handleSearch()}
          className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          Search
        </button>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {sampleQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(item.q);
              handleSearch(item.q);
            }}
            className="text-[10.5px] font-semibold px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#524B43] border border-[#E8E2D9] transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2 mt-1">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#78716C]">
            <div className="w-5 h-5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
            <span>Finding matching locations...</span>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="text-[11px] font-bold text-[#78716C] flex items-center justify-between">
              <span>RESULTS FOR "{query}" ({results.length})</span>
            </div>
            {results.map((place) => (
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

                  <p className="text-[10.5px] text-[#78716C] truncate mt-0.5">
                    {place.address}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{place.rating}</span>
                    </div>
                    <span className="text-[10px] text-[#78716C]">({place.reviewsCount})</span>
                    <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      {place.openHoursText.split('•')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : hasSearched ? (
          <div className="p-4 text-center text-xs text-[#78716C] bg-[#FAF8F5] rounded-xl">
            No locations matched "{query}". Try one of the quick chips above.
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-[#8C827A] bg-[#FAF8F5] rounded-xl">
            Type any query above and hit Search to view matching places on the map.
          </div>
        )}
      </div>

    </div>
  );
};
