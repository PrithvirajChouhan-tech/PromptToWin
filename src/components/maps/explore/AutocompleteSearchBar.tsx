import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  Compass,
  Clock,
  ChevronRight,
  Sparkles,
  Building,
  Store,
} from "lucide-react";
import {
  fetchAutocompleteSuggestions,
  GeocodedLocation,
} from "../../../services/mapPlatformService";

interface AutocompleteSearchBarProps {
  onSelectLocation: (loc: GeocodedLocation) => void;
  centerCoords: { lat: number; lng: number };
  onClose?: () => void;
}

export const AutocompleteSearchBar: React.FC<AutocompleteSearchBarProps> = ({
  onSelectLocation,
  centerCoords,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Red Fort, Old Delhi",
    "India Gate, Central Delhi",
    "Chandni Chowk Market",
    "Bagels & Bakery Cafe",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const debounceTimer = setTimeout(() => {
      fetchAutocompleteSuggestions(query, centerCoords)
        .then((res) => {
          setSuggestions(res);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [query, centerCoords]);

  const handleSelect = (loc: GeocodedLocation) => {
    if (!recentSearches.includes(loc.name)) {
      setRecentSearches((prev) => [loc.name, ...prev.slice(0, 4)]);
    }
    onSelectLocation(loc);
    setQuery(loc.name);
    setSuggestions([]);
  };

  return (
    <div className="absolute top-14 left-4 sm:left-6 z-30 w-[calc(100%-2rem)] sm:w-96">
      <div className="bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#F0EBE1]">
          <Search className="w-4 h-4 text-[#0284C7] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, businesses, addresses (e.g. Bagel, Fort)..."
            className="w-full text-xs font-semibold bg-transparent text-[#191715] placeholder:text-[#A8A29E] outline-none"
          />
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="text-[#A8A29E] hover:text-[#191715] p-0.5 rounded-full hover:bg-[#FAF8F5] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#78716C] hover:text-[#191715] text-[11px] font-bold px-1.5 py-0.5 rounded-lg hover:bg-[#FAF8F5] ml-1 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        <div className="max-h-72 overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="p-1.5 space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-extrabold text-[#A8A29E] uppercase tracking-wider">
                Suggestions (Google Maps Platform)
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-colors shrink-0 mt-0.5">
                    {item.resultType === "establishment" ||
                    item.resultType === "point_of_interest" ? (
                      <Store className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#191715] truncate group-hover:text-[#0284C7]">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#78716C] truncate mt-0.5">
                      {item.displayName}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D6D3D1] group-hover:text-[#0284C7] shrink-0 mt-1" />
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="p-4 text-center text-xs text-[#78716C]">
              No direct matches found. Try searching for city landmarks or
              monuments.
            </div>
          ) : (
            /* Recent / Popular Suggestions */
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-extrabold text-[#A8A29E] uppercase tracking-wider flex items-center justify-between">
                <span>Quick Autocomplete Suggestions</span>
                <span className="text-[9px] text-[#0284C7] font-bold">
                  TYPEAHEAD
                </span>
              </div>
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(term)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-[#443E38] hover:bg-[#FAF8F5] hover:text-[#191715] transition-colors cursor-pointer"
                >
                  <Clock className="w-3 h-3 text-[#A8A29E]" />
                  <span className="truncate">{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info pill */}
        <div className="px-3 py-1.5 bg-[#FAF8F5] border-t border-[#F0EBE1] flex items-center justify-between text-[9.5px] text-[#8C827A]">
          <span>Powered by Places Autocomplete API</span>
          <span className="font-bold text-[#0284C7]">Instant Pan</span>
        </div>
      </div>
    </div>
  );
};
