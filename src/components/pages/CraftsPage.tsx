import React, { useState } from 'react';
import { FAMOUS_CULTURAL_BUYS } from '../../data/indiaTrips';
import { 
  ShoppingBag, 
  MapPin, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  Award, 
  Sparkles,
  Info,
  BadgePercent,
  ArrowLeft
} from 'lucide-react';

interface CraftsPageProps {
  onBack?: () => void;
}

export const CraftsPage: React.FC<CraftsPageProps> = ({ onBack }) => {
  const [selectedCraftIndex, setSelectedCraftIndex] = useState(0);
  const currentCraft = FAMOUS_CULTURAL_BUYS[selectedCraftIndex] || FAMOUS_CULTURAL_BUYS[0];

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
            <div className="w-14 h-14 rounded-2xl bg-[#FAF5FF] text-[#7E22CE] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              <ShoppingBag className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7E22CE] bg-[#FAF5FF] px-2.5 py-0.5 rounded-full">
                  Heritage Crafts & Geographical Indications (GI)
                </span>
                <span className="text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                  100% Artisan Certified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1F1C18]">
                Famous Cultural Things to See & Buy
              </h1>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 max-w-2xl">
                Support traditional craft master artisans by seeking official Geographical Indication (GI) tags. Learn how to identify genuine Banarasi silks, Jaipur pottery, and Kashmiri Pashmina.
              </p>
            </div>
          </div>
        </div>

        {/* Official Certifications Callout */}
        <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-[#FAF5FF] via-[#F3E8FF] to-[#EDE9FE] rounded-2xl border border-[#DDD6FE] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#7E22CE] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-extrabold text-[#6B21A8] flex items-center gap-2">
              Official Indian Certification Marks to Look For
            </h3>
            <p className="text-[#6B21A8]/90 leading-relaxed text-xs">
              Always verify genuine heritage goods with government hallmark logos: <strong>Silk Mark</strong> (100% natural mulberry or wild tussar silk), <strong>Handloom Mark</strong> (certified handwoven on artisan pit-looms), <strong>Woolmark</strong>, and the tri-color <strong>GI Tag Logo</strong>. Government Emporiums (Central Cottage Industries, CCIE) carry fixed-price certified stock.
            </p>
          </div>
        </div>

        {/* Craft Selector Ribbon */}
        <div className="mt-8">
          <h2 className="text-xs font-bold text-[#8C827A] uppercase tracking-wider mb-3">
            Select Heritage Craft to View Authenticity Checks:
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FAMOUS_CULTURAL_BUYS.map((craft, idx) => {
              const isSelected = selectedCraftIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCraftIndex(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected 
                      ? 'bg-[#1F1C18] text-white border-[#1F1C18] shadow-md scale-[1.02]' 
                      : 'bg-[#FAF8F5] text-[#1F1C18] border-[#EAE5DC] hover:border-[#7E22CE] hover:bg-white'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF5FF] text-[#7E22CE]'
                  }`}>
                    {craft.region}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold line-clamp-1">{craft.craft}</h3>
                    <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#8C827A]'}`}>
                      {craft.place}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Craft Showcase */}
        {currentCraft && (
          <div className="mt-8 p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-6">
            
            {/* Visual Photo Header */}
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-xs">
              <img 
                src={currentCraft.imageUrl} 
                alt={currentCraft.craft}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  Region: {currentCraft.region}
                </span>
              </div>
              {currentCraft.giTag && (
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-bold text-[#10B981] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-2xs">
                    ✓ Official GI Certified
                  </span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs text-white/90 flex items-center gap-1.5 font-medium mb-1 drop-shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#DDD6FE]" />
                  <span>{currentCraft.place}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white drop-shadow-sm">
                  {currentCraft.craft}
                </h3>
              </div>
            </div>

            {/* Authenticity Checklist & Where to Buy */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] space-y-2.5">
                <div className="text-xs font-bold text-[#7E22CE] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>How to Identify Genuine Artisanship:</span>
                </div>
                <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                  {currentCraft.whatToLookFor}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] space-y-2.5">
                <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Verified Artisan Clusters & Stores:</span>
                </div>
                <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                  {currentCraft.whereToBuy}
                </p>
                <div className="pt-2 text-[11px] text-[#6B635B] border-t border-[#F0ECE4]">
                  💡 Pro Tip: Avoid commission touts outside monuments claiming "my uncle has the factory loom".
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Bargaining & Fair Price Guide */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5FF] text-[#7E22CE] flex items-center justify-center font-bold">
            <BadgePercent className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1F1C18]">Bazaar Bargaining Protocol</h3>
          <p className="text-xs text-[#6B635B] leading-relaxed">
            In informal street markets, counter-offering 40-50% below the asking price with a polite smile is expected. In government emporiums and craft cooperatives, prices are strictly fixed.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1F1C18]">Pashmina Ring Test</h3>
          <p className="text-xs text-[#6B635B] leading-relaxed">
            Authentic Changthangi raw pashmina fibers are less than 15 microns thick. An entire genuine 2-meter shawl can be smoothly pulled through a standard finger wedding ring.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#1F1C18]">Silk Thread Burn Test</h3>
          <p className="text-xs text-[#6B635B] leading-relaxed">
            Authentic mulberry silk thread smells like burnt hair when singed and leaves a crushable black ash. Synthetic polyester melts rapidly into a hard plastic bead.
          </p>
        </div>
      </div>

    </div>
  );
};
