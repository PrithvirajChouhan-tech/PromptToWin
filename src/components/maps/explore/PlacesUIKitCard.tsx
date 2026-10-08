import React, { useState } from 'react';
import { 
  Star, 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Navigation2, 
  Bookmark, 
  Share2, 
  Clock, 
  Check, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Store,
  Info
} from 'lucide-react';
import { PlaceEntity } from '../../../services/mapPlatformService';

interface PlacesUIKitCardProps {
  place: PlaceEntity;
  onClose: () => void;
  onNavigate: (place: PlaceEntity) => void;
  onAddToItinerary?: (place: PlaceEntity) => void;
}

export const PlacesUIKitCard: React.FC<PlacesUIKitCardProps> = ({
  place,
  onClose,
  onNavigate,
  onAddToItinerary,
}) => {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % place.photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + place.photos.length) % place.photos.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.title,
        text: `Check out ${place.title} on YatraOne Explore Map!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${place.title} - ${place.address}`);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  if (isMinimized) {
    return (
      <div className="absolute bottom-4 left-4 z-30 bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-xl p-2.5 flex items-center gap-3 text-xs select-none animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          {place.photos[0] && (
            <img src={place.photos[0]} alt={place.title} className="w-9 h-9 rounded-xl object-cover border border-[#E8E2D9]" />
          )}
          <div>
            <h4 className="font-extrabold text-[#191715] truncate max-w-[140px] sm:max-w-[180px]">{place.title}</h4>
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
              <span>★ {place.rating}</span>
              <span className="text-[#8C827A]">({place.reviewsCount})</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(false)}
          className="px-2.5 py-1 rounded-xl bg-[#0284C7] text-white text-[11px] font-extrabold hover:bg-[#0369A1] transition-colors cursor-pointer"
        >
          Expand
        </button>

        <button
          onClick={() => onNavigate(place)}
          className="p-1.5 rounded-xl bg-[#FAF8F5] text-[#191715] hover:bg-[#F0EBE1] border border-[#E8E2D9] transition-colors cursor-pointer"
          title="Directions"
        >
          <Navigation2 className="w-3.5 h-3.5 text-[#0284C7]" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-104 z-30 bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl overflow-hidden text-[#191715] animate-in fade-in slide-in-from-bottom-3 duration-200">
      
      {/* Photo Carousel Header */}
      <div className="relative h-44 sm:h-48 bg-[#191715] overflow-hidden group">
        {place.photos.length > 0 ? (
          <img
            src={place.photos[currentPhotoIdx]}
            alt={place.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#FAF8F5] text-[#A8A29E]">
            <Store className="w-8 h-8" />
          </div>
        )}

        {/* Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Action controls (Minimize & Close) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm"
            title="Minimize to bar"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Google Places UI Kit Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[10px] font-extrabold text-[#191715] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <span>Places UI Kit</span>
          <span className="text-[#059669]">✓ Verified</span>
        </div>

        {/* Photo Navigation Arrows */}
        {place.photos.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Carousel indicator dots */}
        {place.photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {place.photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentPhotoIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Title on Photo Bottom */}
        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
          <h3 className="font-black text-base drop-shadow-md truncate">{place.title}</h3>
          <p className="text-[11px] text-white/90 drop-shadow-sm truncate">{place.subtitle}</p>
        </div>
      </div>

      {/* Place Details Body */}
      <div className="p-3.5 space-y-3 max-h-80 overflow-y-auto">
        
        {/* Rating & Category Row */}
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{place.rating}</span>
            </div>
            <span className="text-xs text-[#78716C]">
              ({place.reviewsCount.toLocaleString()} reviews)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E2D9] font-bold text-[#443E38]">
              {place.categoryLabel}
            </span>
            <span className="font-extrabold text-[#78716C]">
              {place.priceLevel}
            </span>
          </div>
        </div>

        {/* Screenshot Matching Accessibility Box: "Fully wheelchair accessible: ✓ Entrance ✓ Restroom ✓ Parking ✓ Seating" */}
        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
            <span>♿</span>
            <span>
              {place.accessibility.isWheelchairAccessible
                ? 'Fully wheelchair accessible'
                : 'Partial accessibility available'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold text-emerald-700">
            {place.accessibility.hasAccessibleEntrance && (
              <span className="flex items-center gap-0.5">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                Entrance
              </span>
            )}
            {place.accessibility.hasAccessibleRestroom && (
              <span className="flex items-center gap-0.5">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                Restroom
              </span>
            )}
            {place.accessibility.hasAccessibleParking && (
              <span className="flex items-center gap-0.5">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                Parking
              </span>
            )}
            {place.accessibility.hasAccessibleSeating && (
              <span className="flex items-center gap-0.5">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                Seating
              </span>
            )}
          </div>
        </div>

        {/* Operating Hours & Address */}
        <div className="space-y-1.5 text-xs text-[#524B43]">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bold text-emerald-700">{place.openHoursText}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#78716C] shrink-0 mt-0.5" />
            <span className="text-[#665E55]">{place.address}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => onNavigate(place)}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black transition-all shadow-sm cursor-pointer"
          >
            <Navigation2 className="w-3.5 h-3.5" />
            <span>Directions</span>
          </button>

          {place.phone ? (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#191715] text-xs font-bold border border-[#E8E2D9] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call</span>
            </a>
          ) : (
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isSaved ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-[#FAF8F5] text-[#191715] border-[#E8E2D9]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Save</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#191715] text-xs font-bold border border-[#E8E2D9] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Share toast feedback */}
        {showShareToast && (
          <div className="p-1.5 bg-[#191715] text-white text-center text-[10px] font-bold rounded-lg animate-fade-in">
            Link copied to clipboard!
          </div>
        )}

        {/* Add to itinerary optional trigger */}
        {onAddToItinerary && (
          <button
            onClick={() => onAddToItinerary(place)}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#FF7A59] text-white text-xs font-extrabold shadow-xs hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>+ Add to Day Itinerary</span>
          </button>
        )}

      </div>

    </div>
  );
};
