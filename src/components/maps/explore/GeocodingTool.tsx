import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  X, 
  Copy, 
  Check, 
  Crosshair, 
  Navigation, 
  ExternalLink,
  Globe
} from 'lucide-react';
import { 
  forwardGeocode, 
  reverseGeocode, 
  GeocodedLocation 
} from '../../../services/mapPlatformService';

interface GeocodingToolProps {
  isOpen: boolean;
  onClose: () => void;
  centerCoords: { lat: number; lng: number };
  onFlyTo: (lat: number, lng: number, title?: string) => void;
  isInspectActive: boolean;
  onToggleInspect: (active: boolean) => void;
  inspectedLocation?: GeocodedLocation | null;
}

export const GeocodingTool: React.FC<GeocodingToolProps> = ({
  isOpen,
  onClose,
  centerCoords,
  onFlyTo,
  isInspectActive,
  onToggleInspect,
  inspectedLocation,
}) => {
  const [addressInput, setAddressInput] = useState('Plaza Mayor, Madrid');
  const [forwardResult, setForwardResult] = useState<GeocodedLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleForwardSearch = () => {
    if (!addressInput.trim()) return;
    setLoading(true);

    forwardGeocode(addressInput)
      .then((res) => {
        setForwardResult(res);
        setLoading(false);
        if (res) {
          onFlyTo(res.lat, res.lng, res.name);
        }
      })
      .catch(() => setLoading(false));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isOpen) return null;

  const displayLoc = inspectedLocation || forwardResult || {
    name: 'Current Map Viewport Center',
    displayName: 'Coordinates of current map center',
    lat: centerCoords.lat,
    lng: centerCoords.lng,
    city: 'Active Viewport',
    country: 'India'
  };

  return (
    <div className="absolute top-14 left-4 z-30 w-88 sm:w-96 max-h-[85vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-4 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#191715] flex items-center gap-1.5">
              Geocoding API
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                ESSENTIALS
              </span>
            </h3>
            <p className="text-[10px] text-[#78716C]">Forward & Reverse Address ⇄ Coordinate conversion</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode 1: Forward Geocoding (Address -> Lat/Lng) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold text-[#78716C] uppercase tracking-wider block">
          1. Forward Geocoding (Address to Lat/Lng)
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="e.g. Plaza Mayor, Madrid or Red Fort Delhi"
            className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs font-semibold text-[#191715] outline-none focus:border-[#0284C7]"
          />
          <button
            onClick={handleForwardSearch}
            className="px-3 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            Geocode
          </button>
        </div>
      </div>

      {/* Mode 2: Reverse Geocoding (Click Map to Inspect Address) */}
      <div className="space-y-1.5 pt-2 border-t border-[#F0EBE1]">
        <label className="text-[11px] font-extrabold text-[#78716C] uppercase tracking-wider block">
          2. Reverse Geocoding (Click Map to Inspect)
        </label>
        <button
          onClick={() => onToggleInspect(!isInspectActive)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            isInspectActive
              ? 'bg-rose-500 text-white border-rose-500 shadow-md ring-2 ring-rose-500/30'
              : 'bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#191715] border-[#E8E2D9]'
          }`}
        >
          <Crosshair className={`w-4 h-4 ${isInspectActive ? 'animate-spin' : ''}`} />
          <span>{isInspectActive ? 'Click Anywhere on Map to Inspect Address' : 'Enable Click-to-Reverse-Geocode Pin'}</span>
        </button>
      </div>

      {/* Geocoded Result Card (Matching Screenshot Pin) */}
      <div className="p-3 bg-gradient-to-br from-[#191715] to-[#2D2825] text-white rounded-xl shadow-lg space-y-2 mt-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/30" />
            <span className="text-xs font-black truncate">{displayLoc.name}</span>
          </div>
          <button
            onClick={() => copyToClipboard(`${displayLoc.lat.toFixed(6)}, ${displayLoc.lng.toFixed(6)}`)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Copy Coordinates"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="text-[11px] text-white/80 font-mono bg-white/5 p-2 rounded-lg border border-white/10 flex items-center justify-between">
          <span>Lat: <strong className="text-white">{displayLoc.lat.toFixed(6)}</strong></span>
          <span>Lng: <strong className="text-white">{displayLoc.lng.toFixed(6)}</strong></span>
        </div>

        <p className="text-[10.5px] text-white/70 line-clamp-2">
          {displayLoc.displayName}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-white/60">
          <span>City: {displayLoc.city || 'Regional'}</span>
          <span>Country: {displayLoc.country || 'Global'}</span>
        </div>
      </div>

    </div>
  );
};
