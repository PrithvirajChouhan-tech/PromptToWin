import React, { useEffect, useState, useRef } from 'react';
import { 
  ExternalLink, 
  MapPin, 
  Star, 
  Sparkles, 
  Compass, 
  Globe, 
  Loader2, 
  Info, 
  X,
  Navigation,
  Plus,
  Check,
  IndianRupee,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Trip, DayPlan, ItineraryItem } from '../../types/travel';
import { journeyContext } from '../../services/journey';
import { findDestinationCoordinates } from '../../utils/destinationCoordinates';

export interface SerpSearchResult {
  query: string;
  source: 'serpapi' | 'local' | 'empty';
  knowledgeGraph: {
    title: string;
    type: string;
    description: string;
    thumbnail?: string | null;
    website?: string | null;
    source?: string;
  } | null;
  places: Array<{
    title: string;
    rating?: number | null;
    reviews?: number | null;
    type?: string;
    address?: string;
    thumbnail?: string | null;
  }>;
  organicResults: Array<{
    title: string;
    snippet: string;
    link: string;
    displayedLink?: string;
    thumbnail?: string | null;
  }>;
}

export interface SerpApiSearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  allTrips?: Trip[];
  onSelectTrip?: (tripId: string) => void;
  onOpenAssistant?: (initialQuery?: string, context?: any) => void;
  onOpenAIPlanner?: (destination: string) => void;
  onOpenMap?: (loc?: { lat: number; lng: number; title: string }) => void;
  onAddStop?: (item: Omit<ItineraryItem, 'id'>) => void;
  onOpenDestinationHub?: (destination: string, searchData?: SerpSearchResult | null) => void;
  onOpenFairPrice?: (query: string) => void;
  currentDay?: DayPlan;
}

const SerpApiSearchDropdownInner: React.FC<SerpApiSearchDropdownProps> = ({
  query,
  isOpen,
  onClose,
  allTrips = [],
  onSelectTrip,
  onOpenAssistant,
  onOpenAIPlanner,
  onOpenMap,
  onAddStop,
  onOpenDestinationHub,
  onOpenFairPrice,
  currentDay,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SerpSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedItemTitle, setAddedItemTitle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter matching in-app trips safely without crashing
  const q = query.trim().toLowerCase();
  const matchingTrips = q.length >= 2
    ? allTrips.filter(t => {
        if (!t) return false;
        const matchesTitle = t.title ? t.title.toLowerCase().includes(q) : false;
        const matchesRegion = t.region ? t.region.toLowerCase().includes(q) : false;
        const matchesTagline = t.tagline ? t.tagline.toLowerCase().includes(q) : false;
        const matchesDays = Array.isArray(t.days)
          ? t.days.some(d => 
              (d.title && d.title.toLowerCase().includes(q)) ||
              (d.city && d.city.toLowerCase().includes(q)) ||
              (Array.isArray(d.items) && d.items.some(it => 
                (it.title && it.title.toLowerCase().includes(q)) || 
                (it.location && it.location.toLowerCase().includes(q))
              ))
            )
          : false;
        return matchesTitle || matchesRegion || matchesTagline || matchesDays;
      })
    : [];

  useEffect(() => {
    if (!isOpen || !query.trim() || query.trim().length < 2) {
      setData(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json: SerpSearchResult = await res.json();
          setData(json);
        } else {
          // If non-JSON returned, don't crash
          setData({
            query: query.trim(),
            source: 'local',
            knowledgeGraph: null,
            places: [],
            organicResults: []
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('SerpAPI search dropdown error:', err);
          setData({
            query: query.trim(),
            source: 'local',
            knowledgeGraph: null,
            places: [],
            organicResults: []
          });
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, isOpen]);

  // Click outside listener - ignore clicks inside the search input or clear button
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        !target?.closest('#global-search-input') &&
        !target?.closest('#mobile-search-input') &&
        !target?.closest('.search-box-wrapper')
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleQuickAddStop = (title: string, address?: string, thumbnail?: string | null) => {
    if (!onAddStop) return;

    const geo = findDestinationCoordinates(title);
    const targetCity = currentDay?.city || geo.city || 'India';

    const newItem: Omit<ItineraryItem, 'id'> = {
      title,
      category: 'cultural_sight',
      time: '11:30 AM',
      duration: '2h',
      location: address || `${title}, ${targetCity}`,
      city: targetCity,
      cost: 100,
      description: `Visited ${title} in ${targetCity}.`,
      touristTip: `${geo.timings || 'Check opening hours'} • ${geo.dressCode || 'Comfortable attire'}.`,
      imageUrl: thumbnail || geo.photoUrl,
      rating: 4.8,
      reviewsCount: 150,
      coordinates: { lat: geo.lat, lng: geo.lng }
    };

    onAddStop(newItem);
    setAddedItemTitle(title);
    setTimeout(() => setAddedItemTitle(null), 2500);
  };

  if (!isOpen || query.trim().length < 2) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-[#EAE5DC] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] sm:max-h-[600px] flex flex-col text-[#1F1C18]"
    >
      {/* Top Header Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF8F5] border-b border-[#EAE5DC] text-[11px] font-semibold text-[#8C827A] shrink-0">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#C84B31]" />
          <span>Live Travel Search</span>
          <span className="text-[10px] font-bold text-[#059669] bg-[#10B981]/10 px-1.5 py-0.5 rounded-md">
            Interactive Actions
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#8C827A] hover:text-[#1F1C18] p-1 rounded-md transition-colors cursor-pointer"
          title="Close search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1">
        {/* Quick Add Success Toast */}
        {addedItemTitle && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Added "{addedItemTitle}" to your day's itinerary!</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-[#8C827A]">
            <Loader2 className="w-5 h-5 text-[#C84B31] animate-spin" />
            <span>Fetching live destination data for "{query}"...</span>
          </div>
        )}

        {/* Error Notice */}
        {error && !loading && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Google Knowledge Graph Card with Instant Actions */}
        {!loading && data?.knowledgeGraph && (
          <div className="bg-gradient-to-br from-[#FCFAF7] to-[#F7F4EE] border border-[#E2DBD0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {data.knowledgeGraph.thumbnail && (
                <img 
                  src={data.knowledgeGraph.thumbnail} 
                  alt={data.knowledgeGraph.title} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#EAE5DC] shrink-0 shadow-xs"
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm sm:text-base text-[#1F1C18] leading-tight">
                    {data.knowledgeGraph.title}
                  </h4>
                  {data.knowledgeGraph.type && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#183E35]/10 text-[#183E35] border border-[#183E35]/15">
                      {data.knowledgeGraph.type}
                    </span>
                  )}
                </div>
                {data.knowledgeGraph.description && (
                  <p className="text-xs text-[#524B45] mt-1.5 line-clamp-3 leading-relaxed">
                    {data.knowledgeGraph.description}
                  </p>
                )}
                {data.knowledgeGraph.source && (
                  <span className="text-[10px] text-[#9C948B] mt-1 block">
                    Source: {data.knowledgeGraph.source}
                  </span>
                )}
              </div>
            </div>

            {/* PRODUCTIVE ACTION: EXPLORE DESTINATION */}
            <div className="mt-3.5 pt-3 border-t border-[#EAE5DC] flex flex-col sm:flex-row items-center justify-between gap-3">
              {onOpenDestinationHub && (
                <button
                  id="search-explore-destination-btn"
                  onClick={() => {
                    onOpenDestinationHub(data.knowledgeGraph?.title || query, data);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#183E35] via-[#204E43] to-[#183E35] hover:from-[#13322B] hover:to-[#13322B] text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(24,62,53,0.25)] hover:shadow-[0_6px_20px_rgba(24,62,53,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group border border-[#2B5E51]"
                  title="Explore Destination Details, Sights & Map"
                >
                  <Compass className="w-4 h-4 text-[#F3D997] stroke-[2.2] group-hover:rotate-45 transition-transform" />
                  <span className="tracking-wide">Explore Destination</span>
                  <ArrowRight className="w-4 h-4 text-[#F3D997]/80 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <span className="text-[11px] text-[#7C7269] text-center sm:text-left font-medium">
                Tap Explore to view live guides, maps & curated sights
              </span>
            </div>
          </div>
        )}

        {/* 2. In-App Curated Trips Matching Query */}
        {matchingTrips.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>Matching Curated Itineraries ({matchingTrips.length})</span>
            </div>
            <div className="space-y-1.5">
              {matchingTrips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => {
                    if (onSelectTrip) onSelectTrip(trip.id);
                    onClose();
                  }}
                  className="w-full text-left p-2 rounded-xl border border-[#EAE5DC] hover:border-[#C84B31] hover:bg-[#FFF7F4] transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <img src={trip.coverImage} alt={trip.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#1F1C18] group-hover:text-[#C84B31] truncate">
                      {trip.title}
                    </div>
                    <div className="text-[11px] text-[#8C827A] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#FF6F59]" />
                      <span className="truncate">{trip.region} • {trip.duration}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#C84B31] px-2 py-0.5 rounded-full bg-[#C84B31]/10 shrink-0">
                    Switch Trip
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Local Places & Attractions with Individual Action Buttons */}
        {!loading && data?.places && data.places.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                <span>Top Attractions & Local Sights ({data.places.length})</span>
              </span>
              <span className="text-[10px] text-[#8C827A]">Click + Add to include in schedule</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.places.map((place, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-xl border border-[#EAE5DC] bg-[#FAF8F5]/60 hover:bg-white hover:border-[#C84B31]/40 transition-all flex items-start gap-2.5 shadow-2xs"
                >
                  {place.thumbnail && (
                    <img 
                      src={place.thumbnail} 
                      alt={place.title} 
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#EAE5DC]"
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#1F1C18] truncate leading-tight">
                      {place.title}
                    </div>
                    {place.rating && (
                      <div className="flex items-center gap-1 text-[11px] text-[#D97706] font-semibold mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                        <span>{place.rating}</span>
                        {place.reviews && (
                          <span className="text-[10px] text-[#8C827A] font-normal">({place.reviews})</span>
                        )}
                      </div>
                    )}
                    {place.address && (
                      <div className="text-[10px] text-[#8C827A] truncate mt-0.5">
                        {place.address}
                      </div>
                    )}
                    
                    {/* Action Bar for each place */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {onAddStop && (
                        <button
                          onClick={() => handleQuickAddStop(place.title, place.address, place.thumbnail)}
                          className="px-2 py-0.5 rounded-md bg-[#C84B31] text-white hover:bg-[#A93C24] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Add stop to today's plan"
                        >
                          <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          <span>Add Stop</span>
                        </button>
                      )}

                      {onOpenMap && (
                        <button
                          onClick={() => {
                            const geo = findDestinationCoordinates(place.title);
                            onOpenMap({
                              lat: geo.lat,
                              lng: geo.lng,
                              title: place.title
                            });
                            onClose();
                          }}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#EAE5DC] text-[#059669] hover:bg-[#F0FDF4] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                          title="View on Map"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>Map</span>
                        </button>
                      )}

                      {onOpenAssistant && (
                        <button
                          onClick={() => {
                            const placeName = place.title;
                            const contextCity = data?.knowledgeGraph?.title || query;
                            const fullPlace = `${placeName}${contextCity ? ` (${contextCity})` : ''}`;
                            journeyContext.current = {
                              ...journeyContext.current,
                              searchedLocation: fullPlace,
                              description: place.address || '',
                              lastQuery: query,
                              timestamp: Date.now()
                            };
                            onOpenAssistant(
                              `Tell me about ${fullPlace}: history, famous sights, timings, and travel guide.`,
                              { destination: fullPlace, snippet: place.address, query }
                            );
                            onOpenAIPlanner?.(fullPlace);
                            onClose();
                          }}
                          className="text-[10px] font-medium text-[#7C3AED] hover:underline flex items-center gap-0.5 cursor-pointer ml-auto"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Guide</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Organic Live Search Results */}
        {!loading && data?.organicResults && data.organicResults.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>Travel Guides & Web Results</span>
            </div>
            <div className="space-y-2">
              {data.organicResults.map((result, idx) => (
                <a
                  key={idx}
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded-xl border border-[#EAE5DC] hover:border-[#C84B31] hover:bg-[#FAF8F5] transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-[#8C827A] truncate">
                      {result.displayedLink || 'Web Result'}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#8C827A] group-hover:text-[#C84B31] shrink-0" />
                  </div>
                  <div className="text-xs font-semibold text-[#1F1C18] group-hover:text-[#C84B31] line-clamp-1 mt-0.5">
                    {result.title}
                  </div>
                  {result.snippet && (
                    <p className="text-[11px] text-[#635B54] line-clamp-2 mt-1 leading-snug">
                      {result.snippet}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when finished loading and no results */}
        {!loading && !data?.knowledgeGraph && (!data?.organicResults || data.organicResults.length === 0) && matchingTrips.length === 0 && (
          <div className="py-6 text-center text-xs text-[#8C827A]">
            <p>No live search results found for "{query}".</p>
            {onOpenDestinationHub && (
              <button
                onClick={() => {
                  onOpenDestinationHub(query);
                  onClose();
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#C84B31] text-white font-bold text-xs hover:bg-[#A93C24] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Destination Action Hub for "{query}"</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with Destination Hub Action Button */}
      <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-[#EAE5DC] text-[10px] text-[#8C827A] flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#EAE5DC] font-mono text-[9px] text-[#1F1C18]">Enter</kbd>
          <span>for Full Destination Hub</span>
        </span>
        
        {onOpenDestinationHub && (
          <button
            onClick={() => {
              onOpenDestinationHub(data?.knowledgeGraph?.title || query, data);
              onClose();
            }}
            className="text-[#C84B31] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Destination Hub</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

// Safe Error Boundary with explicit TypeScript definitions (fixes React 19 / TypeScript 5.8 lint errors)
interface SearchErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
}

interface SearchErrorBoundaryState {
  hasError: boolean;
}

class SearchErrorBoundary extends React.Component<SearchErrorBoundaryProps, SearchErrorBoundaryState> {
  public override state: SearchErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SearchErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: any) {
    console.warn('SerpApiSearchDropdown Error caught by boundary:', error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#EAE5DC] p-3.5 text-xs text-[#8C827A] flex items-center justify-between z-50">
          <span>Search temporarily unavailable. Showing itinerary results.</span>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onClose();
            }}
            className="text-[#C84B31] font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SerpApiSearchDropdown: React.FC<SerpApiSearchDropdownProps> = (props) => {
  return (
    <SearchErrorBoundary onClose={props.onClose}>
      <SerpApiSearchDropdownInner {...props} />
    </SearchErrorBoundary>
  );
};
