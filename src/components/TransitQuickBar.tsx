import React, { useState } from 'react';
import { 
  Train, 
  Plane, 
  Ship, 
  Zap, 
  ArrowRight, 
  Info, 
  ExternalLink,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { TRANSIT_TOOLKIT } from '../data/indiaTrips';

interface TransitQuickBarProps {
  onOpenTransitDetails: (modeTitle: string) => void;
}

export const TransitQuickBar: React.FC<TransitQuickBarProps> = ({ onOpenTransitDetails }) => {
  const [selectedTransit, setSelectedTransit] = useState(0);

  const getTransitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Train':
        return <Train className="w-5 h-5 text-[#0284C7]" />;
      case 'Subway':
        return <Zap className="w-5 h-5 text-[#10B981]" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-[#F59E0B]" />;
      case 'Ship':
        return <Ship className="w-5 h-5 text-[#8B5CF6]" />;
      default:
        return <Train className="w-5 h-5 text-[#FF6F59]" />;
    }
  };

  const current = TRANSIT_TOOLKIT[selectedTransit];

  return (
    <div className="bg-white rounded-2xl border border-[#EAE5DC] p-4 mb-6 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F1C18]">Multi-Modal Transit & Local Commute</h3>
            <p className="text-[11px] text-[#8C827A]">Tap a transport mode for booking codes, tourist quotas & navigation tips</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex text-[11px] font-semibold text-[#0284C7] bg-[#F0F9FF] px-2.5 py-1 rounded-full border border-[#BAE6FD]">
          India Verified Transit
        </span>
      </div>

      {/* Transport Selection Pills (Dribbble multi-transport cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {TRANSIT_TOOLKIT.map((item, index) => {
          const isSelected = selectedTransit === index;
          return (
            <button
              key={index}
              id={`transit-tab-${index}`}
              onClick={() => setSelectedTransit(index)}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#F9F7F4] border-[#FF6F59] ring-2 ring-[#FF6F59]/15 shadow-xs'
                  : 'bg-white border-[#EAE5DC] hover:border-[#D8D1C7] hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white shadow-2xs' : 'bg-[#F4F1EB]'}`}>
                  {getTransitIcon(item.icon)}
                </div>
                <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                  {item.rating}
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-[#1F1C18] truncate">{item.mode.split('&')[0]}</div>
                <div className="text-[10px] text-[#8C827A] truncate">{item.badge}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mode Quick Drawer */}
      <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EAE5DC] flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3 w-full md:w-auto">
          {current.imageUrl && (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#EAE5DC] shadow-2xs">
              <img 
                src={current.imageUrl} 
                alt={current.mode} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white leading-none">
                {current.speed}
              </span>
            </div>
          )}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-[#1F1C18]">{current.mode}</span>
              {current.place && (
                <span className="text-[10px] text-[#8C827A] flex items-center gap-0.5">
                  • {current.place}
                </span>
              )}
            </div>
            <p className="text-xs text-[#524B44] max-w-2xl leading-relaxed line-clamp-2">
              {current.summary}
            </p>
            <div className="text-[11px] text-[#0284C7] font-medium flex items-center gap-1 pt-0.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">Tip: {current.proTip}</span>
            </div>
          </div>
        </div>

        <button
          id="learn-transit-details-btn"
          onClick={() => onOpenTransitDetails(current.mode)}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-bold text-[#1F1C18] hover:bg-[#F2ECE2] flex items-center gap-1.5 transition-colors self-end md:self-center shadow-2xs"
        >
          <span>Classes & Fare Guide</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF6F59]" />
        </button>
      </div>

    </div>
  );
};
