import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Bike, 
  Footprints, 
  Train, 
  Fuel, 
  IndianRupee, 
  Clock, 
  Compass, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Navigation2,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  RotateCcw
} from 'lucide-react';
import { 
  computeRoutes, 
  RouteOption, 
  TravelMode 
} from '../../../services/mapPlatformService';

interface ComputeRoutesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number; locationName: string };
  targetCoords?: { lat: number; lng: number; title?: string } | null;
  onSelectRoute: (route: RouteOption) => void;
  activeRoute: RouteOption | null;
}

export const ComputeRoutesDrawer: React.FC<ComputeRoutesDrawerProps> = ({
  isOpen,
  onClose,
  userCoords,
  targetCoords,
  onSelectRoute,
  activeRoute,
}) => {
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Preset destination choices or custom
  const [destName, setDestName] = useState(targetCoords?.title || 'India Gate / Central Vista');
  const [destPoint, setDestPoint] = useState<{ lat: number; lng: number }>({
    lat: targetCoords?.lat || 28.6129,
    lng: targetCoords?.lng || 77.2295
  });

  useEffect(() => {
    if (targetCoords) {
      setDestPoint({ lat: targetCoords.lat, lng: targetCoords.lng });
      setDestName(targetCoords.title || 'Selected Map Location');
    }
  }, [targetCoords]);

  // Fetch routes whenever origin, destination or travelMode updates
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    computeRoutes(
      { lat: userCoords.lat, lng: userCoords.lng, name: userCoords.locationName },
      { lat: destPoint.lat, lng: destPoint.lng, name: destName },
      travelMode
    ).then((res) => {
      if (isMounted) {
        setRoutes(res);
        setLoading(false);
        if (res.length > 0) {
          onSelectRoute(res[0]);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, travelMode, userCoords, destPoint]);

  if (!isOpen) return null;

  const modes: Array<{ id: TravelMode; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'driving', label: 'Car', icon: Car },
    { id: 'motorcycle', label: '2-Wheeler', icon: Bike },
    { id: 'transit', label: 'Transit', icon: Train },
    { id: 'walking', label: 'Walk', icon: Footprints },
    { id: 'bicycling', label: 'Bicycle', icon: Bike },
  ];

  const getStepIcon = (action: string) => {
    if (action.includes('left')) return <CornerUpLeft className="w-3.5 h-3.5 text-[#0284C7]" />;
    if (action.includes('right')) return <CornerUpRight className="w-3.5 h-3.5 text-[#0284C7]" />;
    if (action.includes('u-turn')) return <RotateCcw className="w-3.5 h-3.5 text-amber-500" />;
    if (action.includes('arrive')) return <MapPin className="w-3.5 h-3.5 text-rose-500" />;
    return <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <div className="absolute top-14 left-4 z-30 w-88 sm:w-96 max-h-[85vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-4 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#0284C7]/10 text-[#0284C7]">
            <Navigation2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#191715] flex items-center gap-1.5">
              Compute Routes
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                API
              </span>
            </h3>
            <p className="text-[10px] text-[#78716C]">Directions, live distance & multi-modal cost</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin & Destination */}
      <div className="space-y-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFEAE2] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] ring-2 ring-[#0284C7]/20 shrink-0" />
          <div className="flex-1 truncate font-medium text-[#443E38]">
            <span className="text-[10px] uppercase font-bold text-[#8C827A] block">Origin</span>
            <span className="truncate block font-semibold">{userCoords.locationName}</span>
          </div>
        </div>

        <div className="w-0.5 h-3 bg-[#D8D2C7] ml-1" />

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C84B31] ring-2 ring-[#C84B31]/20 shrink-0" />
          <div className="flex-1 truncate font-medium text-[#443E38]">
            <span className="text-[10px] uppercase font-bold text-[#8C827A] block">Destination</span>
            <span className="truncate block font-bold text-[#191715]">{destName}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-5 gap-1 bg-[#F5F2EC] p-1 rounded-xl">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSel = travelMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setTravelMode(m.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                isSel
                  ? 'bg-white text-[#191715] shadow-xs'
                  : 'text-[#78716C] hover:text-[#191715]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-0.5 ${isSel ? 'text-[#0284C7]' : ''}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-[#78716C]">
          <div className="w-5 h-5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
          <span>Computing optimal routes via {travelMode}...</span>
        </div>
      )}

      {/* Route Cards */}
      {!loading && routes.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-[#78716C] flex items-center justify-between">
            <span>AVAILABLE ROUTES ({routes.length})</span>
            <span>Est. Fuel & Transit Cost</span>
          </div>

          {routes.map((rt) => {
            const isSelected = activeRoute?.id === rt.id;
            return (
              <div
                key={rt.id}
                onClick={() => onSelectRoute(rt)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#93C5FD] ring-2 ring-[#3B82F6]/20'
                    : 'bg-white border-[#E8E2D9] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-xs text-[#191715] flex items-center gap-1.5">
                    {rt.name}
                    {rt.isRecommended && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                        FASTEST
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-black text-[#0284C7]">
                    {rt.durationMin} min
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#665E55] mb-2">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#78716C]" />
                    {rt.distanceKm} km
                  </span>
                  {rt.fuelLiters > 0 && (
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-amber-600" />
                      {rt.fuelLiters} L fuel
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 font-bold text-emerald-700">
                    <IndianRupee className="w-3 h-3" />
                    {rt.costEstimate > 0 ? `₹${rt.costEstimate}` : 'Free'}
                  </span>
                </div>

                <p className="text-[10px] text-[#78716C] line-clamp-1">{rt.summary}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Turn-by-Turn Guidance Toggle */}
      {activeRoute && activeRoute.steps.length > 0 && (
        <div className="border-t border-[#F0EBE1] pt-2">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFEA] text-xs font-bold text-[#443E38] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Navigation2 className="w-3.5 h-3.5 text-[#0284C7]" />
              Turn-by-turn guidance ({activeRoute.steps.length} steps)
            </span>
            {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSteps && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeRoute.steps.map((st, i) => (
                <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg bg-white border border-[#EFEAE2] text-[11px]">
                  <span className="p-1 rounded-md bg-[#F0F9FF] shrink-0 mt-0.5">
                    {getStepIcon(st.action)}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-[#191715] leading-tight">{st.instruction}</p>
                    <p className="text-[9.5px] text-[#8C827A] mt-0.5">
                      {st.distanceKm} km • {st.durationMin} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
