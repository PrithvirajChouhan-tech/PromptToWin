import React, { useState } from 'react';
import { CULINARY_SAFETY_TIPS, POPULAR_CULINARY_DESTINATIONS } from '../../data/indiaTrips';
import { 
  Utensils, 
  Droplets, 
  Flame, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  HeartHandshake,
  Coffee,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface CulinaryPageProps {
  onBack?: () => void;
}

export const CulinaryPage: React.FC<CulinaryPageProps> = ({ onBack }) => {
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(0);
  const currentDestination = POPULAR_CULINARY_DESTINATIONS[selectedDestinationIndex];

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
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F0ECE4]">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              <Utensils className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">
                  Culinary Destinations & Safety
                </span>
                <span className="text-[11px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                  Hygiene Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1F1C18]">
                India Food Guide & Street Safety
              </h1>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 max-w-2xl">
                Experience authentic regional flavors while protecting your digestive health with proven rules on bottled water, peak turnover times, and probiotic balance.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Golden Rules of Indian Dining */}
        <div className="mt-8 space-y-3">
          <h2 className="text-xs font-bold text-[#8C827A] uppercase tracking-wider">
            4 Golden Rules to Prevent Stomach Upset:
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CULINARY_SAFETY_TIPS.map((tip, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE5DC] text-[#10B981] flex items-center justify-center shadow-2xs">
                  {idx === 0 && <Droplets className="w-4 h-4 text-[#0284C7]" />}
                  {idx === 1 && <Flame className="w-4 h-4 text-[#EA580C]" />}
                  {idx === 2 && <Sparkles className="w-4 h-4 text-[#E11D48]" />}
                  {idx === 3 && <ShieldCheck className="w-4 h-4 text-[#10B981]" />}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1F1C18]">
                  {tip.title}
                </h3>
                <p className="text-xs text-[#524B44] leading-relaxed">
                  {tip.tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Destinations Ribbon */}
        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1F1C18]">
              Popular Regional Culinary Destinations
            </h2>
            <span className="text-xs text-[#8C827A]">
              Tap city to view iconic dishes & etiquette
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {POPULAR_CULINARY_DESTINATIONS.map((dest, idx) => {
              const isSelected = selectedDestinationIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDestinationIndex(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected 
                      ? 'bg-[#1F1C18] text-white border-[#1F1C18] shadow-md scale-[1.02]' 
                      : 'bg-[#FAF8F5] text-[#1F1C18] border-[#EAE5DC] hover:border-[#10B981] hover:bg-white'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#ECFDF5] text-[#10B981]'
                  }`}>
                    {dest.city}
                  </span>
                  <div className="text-xs font-bold truncate">{dest.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Culinary Showcase */}
        {currentDestination && (
          <div className="mt-8 p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-6">
            
            {/* Visual Photo Header */}
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-xs">
              <img 
                src={currentDestination.imageUrl} 
                alt={currentDestination.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {currentDestination.city}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs font-bold text-[#10B981] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-2xs">
                  {currentDestination.hygieneRating}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs text-white/90 flex items-center gap-1.5 font-medium mb-1 drop-shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>{currentDestination.city}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white drop-shadow-sm">
                  {currentDestination.name}
                </h3>
              </div>
            </div>

            {/* Description & Must-Try Specialty */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                {currentDestination.description}
              </p>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] space-y-2">
                <div className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Must-Try Signature Delicacy:</span>
                </div>
                <div className="text-sm font-bold text-[#1F1C18]">
                  {currentDestination.mustTrySpecialty}
                </div>
              </div>
            </div>

            {/* Signature Dishes List & Local Etiquette */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#10B981]" />
                  <span>Signature Regional Dishes</span>
                </h4>
                <ul className="space-y-2">
                  {currentDestination.dishes.map((dish, i) => (
                    <li key={i} className="text-xs text-[#524B44] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                      <span>{dish}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-[#D97706]" />
                  <span>Local Dining Etiquette</span>
                </h4>
                <p className="text-xs text-[#524B44] leading-relaxed">
                  {currentDestination.localEtiquette}
                </p>
                <div className="pt-2 text-[11px] text-[#8C827A] border-t border-[#F0ECE4]">
                  💡 Probiotic balance tip: Order fresh sweet lassi or salted cumin chaas alongside your meal.
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
