import React, { useState } from 'react';
import { REGIONAL_FESTIVALS } from '../../data/indiaTrips';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Camera, 
  ShieldCheck, 
  Users, 
  Flame,
  Info,
  ArrowLeft
} from 'lucide-react';

interface FestivalsPageProps {
  onBack?: () => void;
}

export const FestivalsPage: React.FC<FestivalsPageProps> = ({ onBack }) => {
  const [selectedFestivalIndex, setSelectedFestivalIndex] = useState(0);
  const currentFestival = REGIONAL_FESTIVALS[selectedFestivalIndex] || REGIONAL_FESTIVALS[0];

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
            <div className="w-14 h-14 rounded-2xl bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              <Sparkles className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#BE185D] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full">
                  Regional Celebrations & Sacred Seasons
                </span>
                <span className="text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                  Tourists Warmly Welcomed
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1F1C18]">
                India Festivals & Cultural Calendars
              </h1>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 max-w-2xl">
                Witness 1 million earthenware oil lamps during Varanasi Dev Deepawali, colorful desert gatherings at Pushkar, and thunderous 100-foot snake boat races along Kerala backwaters.
              </p>
            </div>
          </div>
        </div>

        {/* Tourist Etiquette & Photography Notice */}
        <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-[#FDF2F8] via-[#FCE7F3] to-[#FFF1F2] rounded-2xl border border-[#FBCFE8] flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#BE185D] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-extrabold text-[#9D174D] flex items-center gap-2">
              Photography & Crowd Navigation Rules
            </h3>
            <p className="text-[#9D174D]/90 leading-relaxed text-xs">
              Outdoor ghats, illuminated bazaar streets, and processions are open for photography. Always ask polite verbal consent before photographing sadhus (monks) or temple interiors. In sacred sanctums (Garbhagriha), mobile phones and cameras must be stowed away.
            </p>
          </div>
        </div>

        {/* Festival Quick Selection */}
        <div className="mt-8">
          <h2 className="text-xs font-bold text-[#8C827A] uppercase tracking-wider mb-3">
            Select Festival to Explore Details & Etiquette:
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {REGIONAL_FESTIVALS.map((fest, idx) => {
              const isSelected = selectedFestivalIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFestivalIndex(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected 
                      ? 'bg-[#BE185D] text-white border-[#BE185D] shadow-md scale-[1.02]' 
                      : 'bg-[#FAF8F5] text-[#1F1C18] border-[#EAE5DC] hover:border-[#BE185D] hover:bg-white'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FCE7F3] text-[#BE185D]'
                  }`}>
                    {fest.timing}
                  </span>
                  <div className="text-xs font-bold truncate">{fest.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Festival Showcase */}
        {currentFestival && (
          <div className="mt-8 p-6 rounded-3xl bg-[#FFFDF9] border border-[#EAE5DC] space-y-6">
            
            {/* Visual Photo Header */}
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-xs">
              <img 
                src={currentFestival.imageUrl} 
                alt={currentFestival.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {currentFestival.timing}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs font-bold text-[#10B981] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-2xs">
                  ✓ Tourist Welcomed
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs text-white/90 flex items-center gap-1.5 font-medium mb-1 drop-shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#F472B6]" />
                  <span>{currentFestival.place || currentFestival.region}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white drop-shadow-sm">
                  {currentFestival.name}
                </h3>
              </div>
            </div>

            {/* Description & Cultural Etiquette */}
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                {currentFestival.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] space-y-2">
                  <div className="text-xs font-bold text-[#BE185D] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Respectful Tourist Etiquette:</span>
                  </div>
                  <p className="text-xs text-[#524B44] leading-relaxed">
                    {currentFestival.touristEtiquette}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] space-y-2">
                  <div className="text-xs font-bold text-[#D97706] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Crowd & Safety Guidance:</span>
                  </div>
                  <p className="text-xs text-[#524B44] leading-relaxed">
                    Carry minimal valuables in zipped interior chest pockets. Use designated VIP or tourist viewing enclosures at large ghat ceremonies and boat races.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Grid of All Celebrations */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F1C18]">
          All Featured Regional Celebrations
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REGIONAL_FESTIVALS.map((fest, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedFestivalIndex(idx)}
              className={`p-4 rounded-3xl bg-white border transition-all cursor-pointer space-y-3 ${
                selectedFestivalIndex === idx 
                  ? 'border-[#BE185D] ring-2 ring-[#BE185D]/20 shadow-md' 
                  : 'border-[#EAE5DC] hover:border-[#BE185D] hover:shadow-xs'
              }`}
            >
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-[#EAE5DC]">
                <img 
                  src={fest.imageUrl} 
                  alt={fest.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-bold text-[#BE185D] bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-2xs">
                    {fest.timing}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[10px] text-white/85 flex items-center gap-1 font-medium mb-0.5">
                    <MapPin className="w-3 h-3 text-[#F472B6]" />
                    <span className="truncate">{fest.place || fest.region}</span>
                  </div>
                  <h4 className="text-sm font-black font-display text-white line-clamp-1">
                    {fest.name}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-[#524B44] leading-relaxed line-clamp-2">
                {fest.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
