import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Sparkles, 
  Utensils, 
  Landmark, 
  Zap, 
  Coffee, 
  Store,
  ChevronRight,
  Bot
} from 'lucide-react';
import { 
  fetchAutocompleteSuggestions, 
  executeTextSearch, 
  PlaceEntity, 
  GeocodedLocation 
} from '../../../services/mapPlatformService';

interface MapSearchTabProps {
  centerCoords: { lat: number; lng: number };
  onSelectPlace: (place: PlaceEntity) => void;
  onSelectGeocoded: (loc: GeocodedLocation) => void;
  onOpenGroundingAI?: () => void;
  className?: string;
}

export const MapSearchTab: React.FC<MapSearchTabProps> = ({
  centerCoords,
  onSelectPlace,
  onSelectGeocoded,
  onOpenGroundingAI,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [searchResults, setSearchResults] = useState<PlaceEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete & search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [suggs, places] = await Promise.all([
          fetchAutocompleteSuggestions(query, centerCoords),
          executeTextSearch(query, centerCoords)
        ]);
        setSuggestions(suggs);
        setSearchResults(places);
      } catch (err) {
        console.warn('Map search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, centerCoords]);

  const handleQuickFilter = async (categoryQuery: string) => {
    setQuery(categoryQuery);
    setIsFocused(true);
    setIsLoading(true);
    try {
      const places = await executeTextSearch(categoryQuery, centerCoords);
      setSearchResults(places);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (loc: GeocodedLocation) => {
    setQuery(loc.name);
    setIsFocused(false);
    onSelectGeocoded(loc);
  };

  const handleSelectPlaceItem = (place: PlaceEntity) => {
    setQuery(place.title);
    setIsFocused(false);
    onSelectPlace(place);
  };

  return (
    <div ref={wrapperRef} className={`relative z-30 w-64 sm:w-72 md:w-80 select-none ${className}`}>
      
      {/* Floating Google Maps Style Search Card */}
      <div className="bg-white/98 backdrop-blur-xl rounded-2xl border border-[#EAE5DC] shadow-xl overflow-hidden transition-all duration-200">
        
        {/* Main Search Input */}
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <Search className="w-4 h-4 text-[#0284C7] shrink-0" />
          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Google Maps..."
            className="flex-1 text-xs font-semibold text-[#191715] placeholder:text-[#8C827A] bg-transparent outline-none"
          />

          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin shrink-0" />
          )}

          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setSearchResults([]);
              }}
              className="p-1 rounded-full text-[#8C827A] hover:text-[#191715] hover:bg-[#FAF8F5] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenGroundingAI && (
            <button
              onClick={onOpenGroundingAI}
              className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer shrink-0"
              title="Maps Grounding Lite (AI Assistant)"
            >
              <Bot className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Chips (Shown when focused or idle) */}
        {(!query || isFocused) && (
          <div className="flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto no-scrollbar pt-0.5 border-t border-[#F5F2EC]">
            <button
              onClick={() => handleQuickFilter('restaurants food')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#524B43] text-[10.5px] font-bold border border-[#E8E2D9] transition-colors shrink-0 cursor-pointer"
            >
              <Utensils className="w-3 h-3 text-[#C84B31]" />
              <span>Food</span>
            </button>

            <button
              onClick={() => handleQuickFilter('monuments heritage fort')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#524B43] text-[10.5px] font-bold border border-[#E8E2D9] transition-colors shrink-0 cursor-pointer"
            >
              <Landmark className="w-3 h-3 text-amber-600" />
              <span>Sights</span>
            </button>

            <button
              onClick={() => handleQuickFilter('EV charging station')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#524B43] text-[10.5px] font-bold border border-[#E8E2D9] transition-colors shrink-0 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>EV</span>
            </button>

            <button
              onClick={() => handleQuickFilter('cafe bakery coffee')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#524B43] text-[10.5px] font-bold border border-[#E8E2D9] transition-colors shrink-0 cursor-pointer"
            >
              <Coffee className="w-3 h-3 text-amber-700" />
              <span>Cafes</span>
            </button>
          </div>
        )}

        {/* Dropdown Suggestions & Results */}
        {isFocused && (suggestions.length > 0 || searchResults.length > 0) && (
          <div className="max-h-72 overflow-y-auto border-t border-[#F0EBE1] p-1.5 space-y-1">
            
            {/* Direct Place Entities */}
            {searchResults.length > 0 && (
              <div className="space-y-0.5">
                <div className="px-2 py-1 text-[9.5px] font-extrabold uppercase text-[#8C827A]">
                  Places & Businesses
                </div>
                {searchResults.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlaceItem(p)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#191715] truncate group-hover:text-[#0284C7]">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-[#78716C] truncate">
                        {p.subtitle} • {p.rating}★
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D6D3D1] group-hover:text-[#0284C7] shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Geocoded Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-0.5 pt-1 border-t border-[#F0EBE1]">
                <div className="px-2 py-1 text-[9.5px] font-extrabold uppercase text-[#8C827A]">
                  Address Suggestions
                </div>
                {suggestions.slice(0, 4).map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocation(s)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#191715] truncate group-hover:text-[#0284C7]">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-[#78716C] truncate">
                        {s.displayName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
