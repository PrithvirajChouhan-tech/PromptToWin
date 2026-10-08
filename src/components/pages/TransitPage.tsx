import React, { useState } from 'react';
import { TRANSIT_TOOLKIT } from '../../data/indiaTrips';
import { 
  Train, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  ChevronRight,
  Compass,
  CreditCard,
  Ticket,
  ArrowLeft
} from 'lucide-react';

interface TransitPageProps {
  onOpenBookingModal?: () => void;
  onBack?: () => void;
}

export const TransitPage: React.FC<TransitPageProps> = ({ onBack }) => {
  const [selectedTransitIndex, setSelectedTransitIndex] = useState(0);
  const currentTransit = TRANSIT_TOOLKIT[selectedTransitIndex] || TRANSIT_TOOLKIT[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5] shadow-xs cursor-pointer transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Explore</span>
        </button>
      )}
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F0ECE4]">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              <Train className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
                  Verified Local Transit Network
                </span>
                <span className="text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                  Foreign Tourist Quota (FTQ) Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1F1C18]">
                India Transit Hub & Ticketing Guide
              </h1>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 max-w-2xl">
                Navigate high-speed Vande Bharat expresses, metro QR codes, pre-paid auto booths, and tranquil Kerala backwater electric ferries with confidence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden lg:block">
              <div className="text-xs text-[#8C827A]">Railway Helpline</div>
              <div className="text-sm font-black text-[#0284C7]">Dial 139 (24/7)</div>
            </div>
          </div>
        </div>

        {/* Foreign Tourist Quota (FTQ) Highlight Box */}
        <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-[#EFF6FF] via-[#E0F2FE] to-[#F0F9FF] rounded-2xl border border-[#BAE6FD] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Ticket className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-extrabold text-[#0369A1] flex items-center gap-2">
              Foreign Tourist Quota (FTQ) Rules & Berths
            </h3>
            <p className="text-[#0369A1]/90 leading-relaxed text-xs">
              When standard Indian Railway trains show "WL" (Waitlist) or "Regret", international travelers can access designated Foreign Tourist Quota (FTQ) seats reserved specifically on key routes (e.g. Delhi–Varanasi, Delhi–Agra, Jaipur–Mumbai). Book online via the IRCTC portal with foreign passport validation or visit International Tourist Bureaus located at New Delhi and Varanasi stations.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-8">
          <h2 className="text-xs font-bold text-[#8C827A] uppercase tracking-wider mb-3">
            Select Transit Mode to Explore Classes & Guidelines:
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TRANSIT_TOOLKIT.map((t, idx) => {
              const isSelected = selectedTransitIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTransitIndex(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                    isSelected 
                      ? 'bg-[#1F1C18] text-white border-[#1F1C18] shadow-md scale-[1.02]' 
                      : 'bg-[#FAF8F5] text-[#1F1C18] border-[#EAE5DC] hover:border-[#0284C7] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#E0F2FE] text-[#0284C7]'
                    }`}>
                      {t.speed}
                    </span>
                    <span className="text-xs">{t.rating}</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold line-clamp-1">{t.mode}</h3>
                    <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#8C827A]'}`}>
                      {t.place}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Mode Detail Section */}
        {currentTransit && (
          <div className="mt-8 p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-6">
            
            {/* Visual Header Image */}
            <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden shadow-xs">
              <img 
                src={currentTransit.imageUrl} 
                alt={currentTransit.mode} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {currentTransit.badge}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs font-bold text-[#10B981] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-2xs">
                  {currentTransit.rating} Comfort Score
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs text-white/90 flex items-center gap-1.5 font-medium mb-1 drop-shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{currentTransit.place}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white drop-shadow-sm">
                  {currentTransit.mode}
                </h3>
              </div>
            </div>

            {/* Description & Pro Tip */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                {currentTransit.summary}
              </p>
              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tourist Pro Tip: </span>
                  <span>{currentTransit.proTip}</span>
                </div>
              </div>
            </div>

            {/* Class Breakdown */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1C18]">
                Seat Classes & Fare Categories
              </h4>
              <div className="grid sm:grid-cols-3 gap-3">
                {currentTransit.classes.map((cls, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-[#EAE5DC] space-y-2 shadow-2xs">
                    <div className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md inline-block">
                      {cls.code}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#1F1C18]">
                      {cls.name}
                    </div>
                    <p className="text-[11px] text-[#6B635B] leading-relaxed">
                      {cls.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Practical Transit Survival Tips */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1F1C18]">App-Based Auto Booking</h3>
          <p className="text-xs text-[#6B635B] leading-relaxed">
            Download Uber or Ola upon landing. Both support booking 3-wheel autos with fixed GPS pricing, so you never have to haggle with street drivers.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1F1C18]">Airport Express Rail</h3>
          <p className="text-xs text-[#6B635B] leading-relaxed">
            Delhi IGI Terminal 3 connects directly to New Delhi Railway Station via the high-speed Airport Metro in just 19 minutes for ₹60. Luggage racks are provided.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1F1C18]">Paperless Metro QR</h3>
          <p className="text-xs text-[#6B635B] leading-relaxed">
            Delhi, Bengaluru, and Kochi metro stations allow buying QR ticket tokens instantly on WhatsApp without queuing at token counter booths.
          </p>
        </div>
      </div>

    </div>
  );
};
