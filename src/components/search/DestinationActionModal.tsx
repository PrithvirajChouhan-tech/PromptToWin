import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Navigation,
  Sparkles,
  ShieldCheck,
  Radio,
  ExternalLink,
  Plus,
  Check,
  Clock,
  IndianRupee,
  Compass,
  Star,
  Layers,
  ArrowRight,
  Info,
  Car
} from 'lucide-react';
import { Trip, DayPlan, ItineraryItem, ItineraryCategory } from '../../types/travel';
import { SerpSearchResult } from './SerpApiSearchDropdown';
import { findDestinationCoordinates, DestinationGeoInfo } from '../../utils/destinationCoordinates';

interface DestinationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  searchData?: SerpSearchResult | null;
  currentTrip: Trip;
  currentDay: DayPlan;
  onAddStop: (item: Omit<ItineraryItem, 'id'>) => void;
  onOpenMap: (loc: { lat: number; lng: number; title: string }) => void;
  onOpenAIPlanner: (dest: string) => void;
  onOpenFairPrice: (query: string) => void;
  onOpenScanner: () => void;
  onOpenAssistant: (query: string, context?: any) => void;
  onSelectTrip?: (tripId: string) => void;
  allTrips?: Trip[];
}

export const DestinationActionModal: React.FC<DestinationActionModalProps> = ({
  isOpen,
  onClose,
  query,
  searchData,
  currentTrip,
  currentDay,
  onAddStop,
  onOpenMap,
  onOpenAIPlanner,
  onOpenFairPrice,
  onOpenScanner,
  onOpenAssistant,
  onSelectTrip,
  allTrips = [],
}) => {
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  if (!isOpen || !query.trim()) return null;

  // Resolve enriched destination details from geo directory and search data
  const geoInfo: DestinationGeoInfo = findDestinationCoordinates(
    searchData?.knowledgeGraph?.title || query
  );

  const displayTitle = searchData?.knowledgeGraph?.title || geoInfo.name || query;
  const displayType = searchData?.knowledgeGraph?.type || 'Historic Heritage Destination';
  const displayDesc = searchData?.knowledgeGraph?.description || geoInfo.description;
  const displayThumb = searchData?.knowledgeGraph?.thumbnail || geoInfo.photoUrl;

  // Check if any in-app trip matches this destination
  const qLower = query.toLowerCase();
  const matchingTrip = allTrips.find(t => 
    t.title.toLowerCase().includes(qLower) || 
    t.region.toLowerCase().includes(qLower)
  );

  const handleAddDestinationToItinerary = (titleToAdd: string, customCategory?: ItineraryCategory) => {
    const newItem: Omit<ItineraryItem, 'id'> = {
      title: titleToAdd,
      category: customCategory || geoInfo.category || 'cultural_sight',
      time: '11:00 AM',
      duration: '2h',
      location: `${titleToAdd}, ${geoInfo.city}`,
      city: currentDay.city || geoInfo.city,
      cost: 150,
      description: displayDesc,
      touristTip: `${geoInfo.timings || 'Check opening hours'} • ${geoInfo.dressCode || 'Modest clothing recommended'}.`,
      imageUrl: displayThumb,
      rating: 4.8,
      reviewsCount: 240,
      coordinates: { lat: geoInfo.lat, lng: geoInfo.lng }
    };

    onAddStop(newItem);
    setAddedItemName(titleToAdd);
    setTimeout(() => {
      setAddedItemName(null);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        id="destination-action-modal-container"
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE5DC] overflow-hidden text-[#1F1C18]"
      >
        {/* Hero Banner with Cover Photo */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0 bg-[#191715]">
          <img 
            src={displayThumb} 
            alt={displayTitle}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          {/* Close button */}
          <button
            id="close-destination-modal-btn"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge & Title */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C84B31] text-white">
                {displayType}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF8566]" />
                <span>{geoInfo.city}, {geoInfo.state}</span>
              </span>
              {matchingTrip && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#059669] text-white">
                  Trip Available in App
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-display">
              {displayTitle}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick Notice if added successfully */}
          {addedItemName && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Added "{addedItemName}" directly into Day {currentDay.dayNumber} ({currentDay.city})!</span>
            </div>
          )}

          {/* Description */}
          {displayDesc && (
            <p className="text-xs sm:text-sm text-[#524B45] leading-relaxed">
              {displayDesc}
            </p>
          )}

          {/* Quick Practical Intel Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col">
              <span className="text-[10px] text-[#8C827A] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C84B31]" /> Timings
              </span>
              <span className="font-bold text-[#1F1C18] mt-1 text-[11px] truncate" title={geoInfo.timings}>
                {geoInfo.timings || '9:00 AM - 6:00 PM'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col">
              <span className="text-[10px] text-[#8C827A] font-semibold flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-[#059669]" /> Entry / Ticket
              </span>
              <span className="font-bold text-[#1F1C18] mt-1 text-[11px] truncate" title={geoInfo.ticketPrice}>
                {geoInfo.ticketPrice || '₹50 standard entry'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col">
              <span className="text-[10px] text-[#8C827A] font-semibold flex items-center gap-1">
                <Car className="w-3 h-3 text-[#D97706]" /> Fair Auto Fare
              </span>
              <span className="font-bold text-[#1F1C18] mt-1 text-[11px] truncate" title={geoInfo.fairFareEstimate}>
                {geoInfo.fairFareEstimate || '₹60 - ₹120 prepaid'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col">
              <span className="text-[10px] text-[#8C827A] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2563EB]" /> Etiquette
              </span>
              <span className="font-bold text-[#1F1C18] mt-1 text-[11px] truncate" title={geoInfo.dressCode}>
                {geoInfo.dressCode || 'Modest clothing'}
              </span>
            </div>
          </div>

          {/* PRIMARY PRODUCTIVE ACTIONS (What the user specifically requested!) */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8C827A] mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>Instant Productive Actions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Action 1: Add to Current Day's Itinerary */}
              <button
                id="modal-add-to-itinerary-btn"
                onClick={() => handleAddDestinationToItinerary(displayTitle)}
                className="p-3.5 rounded-2xl bg-[#FFF7F4] border-2 border-[#FFD8CC] hover:border-[#C84B31] text-left transition-all group flex items-start gap-3 cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#C84B31] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#1F1C18] group-hover:text-[#C84B31] flex items-center justify-between">
                    <span>Add to Itinerary</span>
                    <span className="text-[10px] font-bold text-[#C84B31] bg-[#C84B31]/10 px-1.5 py-0.5 rounded">
                      Day {currentDay.dayNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#635B54] mt-0.5 leading-snug">
                    Schedule stop in {currentDay.city} with timing and route coordinates.
                  </div>
                </div>
              </button>

              {/* Action 2: View and Navigate on Live Interactive Map */}
              <button
                id="modal-view-on-map-btn"
                onClick={() => {
                  onOpenMap({
                    lat: geoInfo.lat,
                    lng: geoInfo.lng,
                    title: displayTitle
                  });
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#BBF7D0] hover:border-[#059669] text-left transition-all group flex items-start gap-3 cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Navigation className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#1F1C18] group-hover:text-[#059669] flex items-center justify-between">
                    <span>Navigate on Map</span>
                    <span className="text-[10px] font-bold text-[#059669] bg-[#059669]/10 px-1.5 py-0.5 rounded">
                      GPS Route
                    </span>
                  </div>
                  <div className="text-[11px] text-[#635B54] mt-0.5 leading-snug">
                    Pinpoint on Leaflet map, compute walking or auto transit route.
                  </div>
                </div>
              </button>

              {/* Action 3: AI Trip Planner Generator */}
              <button
                id="modal-ai-planner-btn"
                onClick={() => {
                  if (matchingTrip && onSelectTrip) {
                    onSelectTrip(matchingTrip.id);
                  } else {
                    onOpenAIPlanner(displayTitle);
                  }
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-[#F5F3FF] border-2 border-[#DDD6FE] hover:border-[#7C3AED] text-left transition-all group flex items-start gap-3 cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Compass className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#1F1C18] group-hover:text-[#7C3AED] flex items-center justify-between">
                    <span>{matchingTrip ? 'Switch to Curated Trip' : 'Generate Full Itinerary'}</span>
                    <span className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-1.5 py-0.5 rounded">
                      AI Planner
                    </span>
                  </div>
                  <div className="text-[11px] text-[#635B54] mt-0.5 leading-snug">
                    {matchingTrip 
                      ? `Open full multi-day itinerary for "${matchingTrip.title}".`
                      : `Create custom 3-day travel plan with hotels, budget, and sights.`}
                  </div>
                </div>
              </button>

              {/* Action 4: Fair Price Scam Engine & Meter Rate */}
              <button
                id="modal-fair-price-btn"
                onClick={() => {
                  onOpenFairPrice(displayTitle);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] hover:border-[#D97706] text-left transition-all group flex items-start gap-3 cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#1F1C18] group-hover:text-[#D97706] flex items-center justify-between">
                    <span>Fair Auto / Taxi Fare</span>
                    <span className="text-[10px] font-bold text-[#D97706] bg-[#D97706]/10 px-1.5 py-0.5 rounded">
                      Anti-Scam
                    </span>
                  </div>
                  <div className="text-[11px] text-[#635B54] mt-0.5 leading-snug">
                    Check standard police prepaid rates and avoid local tourist overcharging.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Top Local Sights / Attractions in this Area */}
          {((searchData?.places && searchData.places.length > 0) || (geoInfo.topAttractions && geoInfo.topAttractions.length > 0)) && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Must-See Attractions in {geoInfo.city}</span>
                </h3>
                <span className="text-[10px] text-[#8C827A]">1-Click Add to Itinerary</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchData?.places && searchData.places.length > 0 ? (
                  searchData.places.map((place, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl border border-[#EAE5DC] bg-[#FAF8F5]/60 flex items-center justify-between gap-2.5 hover:bg-white transition-all shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#1F1C18] truncate leading-tight">
                          {place.title}
                        </div>
                        <div className="text-[10px] text-[#8C827A] truncate mt-0.5">
                          {place.address || `${place.type || 'Attraction'} • ${geoInfo.city}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleAddDestinationToItinerary(place.title)}
                          className="px-2.5 py-1 rounded-lg bg-[#C84B31] text-white hover:bg-[#A93C24] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Add stop to today's plan"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenMap({
                              lat: geoInfo.lat + (Math.random() - 0.5) * 0.008,
                              lng: geoInfo.lng + (Math.random() - 0.5) * 0.008,
                              title: place.title
                            });
                            onClose();
                          }}
                          className="p-1 rounded-lg bg-white border border-[#EAE5DC] text-[#635B54] hover:text-[#059669] transition-colors cursor-pointer"
                          title="View on Map"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  geoInfo.topAttractions?.map((attrName, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl border border-[#EAE5DC] bg-[#FAF8F5]/60 flex items-center justify-between gap-2.5 hover:bg-white transition-all shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#1F1C18] truncate leading-tight">
                          {attrName}
                        </div>
                        <div className="text-[10px] text-[#8C827A] truncate mt-0.5">
                          Verified Sight • {geoInfo.city}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleAddDestinationToItinerary(attrName)}
                          className="px-2.5 py-1 rounded-lg bg-[#C84B31] text-white hover:bg-[#A93C24] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Add stop to today's plan"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenMap({
                              lat: geoInfo.lat + (Math.random() - 0.5) * 0.008,
                              lng: geoInfo.lng + (Math.random() - 0.5) * 0.008,
                              title: attrName
                            });
                            onClose();
                          }}
                          className="p-1 rounded-lg bg-white border border-[#EAE5DC] text-[#635B54] hover:text-[#059669] transition-colors cursor-pointer"
                          title="View on Map"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Secondary Actions: Surrounding Radar Scanner & Assistant Chat */}
          <div className="pt-2 border-t border-[#EAE5DC] flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => {
                onOpenScanner();
                onClose();
              }}
              className="text-xs font-medium text-[#635B54] hover:text-[#C84B31] flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Radio className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>Launch Surrounding Radar Scanner</span>
            </button>

            <button
              onClick={() => {
                onOpenAssistant(
                  `Tell me practical travel tips for ${displayTitle}: famous sights, authentic food, timings, and how to reach.`,
                  { destination: displayTitle, snippet: displayDesc, query }
                );
                onClose();
              }}
              className="text-xs font-medium text-[#7C3AED] hover:underline flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Sahayak Cultural AI</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#EAE5DC] flex items-center justify-between text-xs text-[#8C827A] shrink-0">
          <span>Incredible India Travel & Trust Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#191715] text-white hover:bg-black font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
