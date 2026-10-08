import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Star, 
  IndianRupee, 
  Train, 
  Utensils, 
  ShoppingBag, 
  Landmark, 
  Sparkles, 
  Check, 
  Trash2, 
  Info, 
  ExternalLink,
  ChevronDown,
  Navigation,
  Compass
} from 'lucide-react';
import { ItineraryItem, ItineraryCategory } from '../types/travel';

interface ItineraryCardProps {
  item: ItineraryItem;
  index: number;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onSelectMapLocation?: (lat: number, lng: number, title: string) => void;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({
  item,
  index,
  onToggleComplete,
  onDeleteItem,
  onSelectMapLocation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryBadge = (cat: ItineraryCategory) => {
    switch (cat) {
      case 'transit':
        return {
          icon: <Train className="w-3.5 h-3.5" />,
          label: 'Local Transit',
          bg: 'bg-[#F0F5FA]',
          text: 'text-[#1E3A8A]',
          border: 'border-[#D1E0F0]',
        };
      case 'culinary':
        return {
          icon: <Utensils className="w-3.5 h-3.5" />,
          label: 'Culinary Hotspot',
          bg: 'bg-[#FAF6EE]',
          text: 'text-[#92400E]',
          border: 'border-[#F5E6CC]',
        };
      case 'cultural_buy':
        return {
          icon: <ShoppingBag className="w-3.5 h-3.5" />,
          label: 'Cultural Buy & Craft',
          bg: 'bg-[#FAF5F9]',
          text: 'text-[#701A75]',
          border: 'border-[#EED7EC]',
        };
      case 'festival':
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: 'Regional Festival',
          bg: 'bg-[#FAF5EE]',
          text: 'text-[#B45309]',
          border: 'border-[#EEDCC7]',
        };
      case 'cultural_sight':
      default:
        return {
          icon: <Landmark className="w-3.5 h-3.5" />,
          label: 'Cultural Sight',
          bg: 'bg-[#FAF5F0]',
          text: 'text-[#C84B31]',
          border: 'border-[#F2DFD7]',
        };
    }
  };

  const badge = getCategoryBadge(item.category);

  return (
    <div 
      id={`itinerary-card-${item.id}`}
      className={`group rounded-2xl bg-white border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        item.completed 
          ? 'border-[#D1D5DB] bg-[#FBFBFA] opacity-75' 
          : 'border-[#EBE6DD] hover:border-[#D8D1C7]'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        
        {/* Left/Top Image Thumbnail */}
        <div className="relative sm:w-48 md:w-56 h-40 sm:h-auto shrink-0 overflow-hidden bg-[#ECE8E1]">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden"></div>

          {/* Time Badge Overlay */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-[#1F1C18] shadow-xs flex items-center gap-1 border border-white/40">
            <Clock className="w-3 h-3 text-[#FF6F59]" />
            <span>{item.time}</span>
          </div>

          {/* Duration Badge on Mobile */}
          <div className="absolute bottom-3 left-3 sm:hidden text-white text-xs font-semibold">
            {item.duration}
          </div>

          {/* Completed Checkmark Overlay */}
          {item.completed && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs">
              <span className="px-3 py-1 rounded-full bg-[#10B981] text-white text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Visited
              </span>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          
          <div>
            {/* Category Pill & Metrics Row */}
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.icon}
                <span>{badge.label}</span>
              </span>

              <div className="flex items-center gap-2.5 text-xs text-[#8C827A]">
                <span className="hidden sm:inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#FF6F59]" />
                  <span>{item.duration}</span>
                </span>

                {item.rating && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#1F1C18] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DC]">
                    <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{item.rating}</span>
                    {item.reviewsCount && (
                      <span className="text-[10px] text-[#8C827A] font-normal">({item.reviewsCount})</span>
                    )}
                  </span>
                )}

                <span className="inline-flex items-center gap-0.5 font-bold text-[#2E7D32] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                  <IndianRupee className="w-3 h-3" />
                  <span>{item.cost === 0 ? 'Free' : item.cost.toLocaleString('en-IN')}</span>
                </span>
              </div>
            </div>

            {/* Title & Location */}
            <h3 className={`text-base sm:text-lg font-bold font-serif-display text-[#191715] mb-1 leading-snug ${
              item.completed ? 'line-through text-[#6B7280]' : ''
            }`}>
              {item.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-[#665E55] mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-[#524B44] leading-relaxed mb-3">
              {item.description}
            </p>

            {/* Specific Details based on Category */}
            {item.transitDetails && (
              <div className="bg-[#F0F5FA] rounded-xl p-2.5 border border-[#D1E0F0] text-xs text-[#1E3A8A] mb-3 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Transit Route: {item.transitDetails.from} ➔ {item.transitDetails.to}</span>
                  {item.transitDetails.lineOrNumber && (
                    <span className="bg-white px-2 py-0.5 rounded text-[11px] font-semibold border border-[#D1E0F0]">
                      {item.transitDetails.lineOrNumber}
                    </span>
                  )}
                </div>
                {item.transitDetails.bookingTip && (
                  <p className="text-[11px] text-[#1E3A8A]/90">
                    <span className="font-bold">Booking Advice:</span> {item.transitDetails.bookingTip}
                  </p>
                )}
              </div>
            )}

            {item.culinaryDetails && (
              <div className="bg-[#FAF6EE] rounded-xl p-2.5 border border-[#F5E6CC] text-xs text-[#92400E] mb-3 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Specialties: {item.culinaryDetails.specialties.join(', ')}</span>
                  <span className="bg-white px-2 py-0.5 rounded text-[11px] font-semibold border border-[#F5E6CC]">
                    Spice: {item.culinaryDetails.spiceLevel}
                  </span>
                </div>
                <div className="text-[11px] text-[#92400E]/90 font-medium">
                  {item.culinaryDetails.isVegetarianFriendly ? 'Pure Vegetarian Friendly' : 'Regional Non-Vegetarian Specialty'}
                </div>
              </div>
            )}

            {item.culturalBuyDetails && (
              <div className="bg-[#FAF5F9] rounded-xl p-2.5 border border-[#EED7EC] text-xs text-[#701A75] mb-3 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Authentic Craft: {item.culturalBuyDetails.itemToBuy}</span>
                  {item.culturalBuyDetails.giTagCertified && (
                    <span className="bg-[#15803D] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      ✓ GI Tagged
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#701A75]/90">
                  <span>Price Range: {item.culturalBuyDetails.authenticPriceRange}</span>
                  <span>Bargaining: {item.culturalBuyDetails.bargainTip}</span>
                </div>
              </div>
            )}

            {item.festivalDetails && (
              <div className="bg-[#FAF5EE] rounded-xl p-2.5 border border-[#EEDCC7] text-xs text-[#B45309] mb-3 space-y-1">
                <div className="font-bold">
                  {item.festivalDetails.festivalName} • {item.festivalDetails.significance}
                </div>
                {item.festivalDetails.dressCode && (
                  <div className="text-[11px] text-[#B45309]/90">
                    <span className="font-bold">Dress Code:</span> {item.festivalDetails.dressCode}
                  </div>
                )}
              </div>
            )}

            {/* Tourist Tip Accordion / Box */}
            <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-[#E8E2D9] text-xs text-[#524B44]">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#C84B31] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-[#191715]">Local Advisory: </span>
                  <span>{item.touristTip}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Bar Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0ECE4] text-xs">
            
            {/* Complete Checkbox */}
            <button
              id={`toggle-complete-btn-${item.id}`}
              onClick={() => onToggleComplete(item.id)}
              className={`flex items-center gap-1.5 font-bold transition-colors ${
                item.completed ? 'text-[#10B981]' : 'text-[#8C827A] hover:text-[#1F1C18]'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                item.completed ? 'bg-[#10B981] border-[#10B981] text-white' : 'border-[#C4BDB5] bg-white'
              }`}>
                {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span>{item.completed ? 'Marked Visited' : 'Mark as Visited'}</span>
            </button>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2">
              {item.coordinates && onSelectMapLocation && (
                <button
                  id={`view-map-item-btn-${item.id}`}
                  onClick={() => onSelectMapLocation(item.coordinates!.lat, item.coordinates!.lng, item.title)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0ECE4] text-[#5A524C] font-semibold transition-colors"
                  title="View on Map"
                >
                  <Navigation className="w-3 h-3 text-[#FF6F59]" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              )}

              <button
                id={`delete-item-btn-${item.id}`}
                onClick={() => onDeleteItem(item.id)}
                className="p-1.5 rounded-lg text-[#9C948B] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                title="Remove Stop"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
