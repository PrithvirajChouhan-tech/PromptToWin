import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  MapPin, 
  Map, 
  IndianRupee, 
  Clock, 
  Sparkles,
  Train,
  Plus,
  ArrowRight,
  Radio,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Utensils,
  Landmark,
  ShoppingBag,
  Star,
  Play,
  Pause
} from 'lucide-react';
import { Trip, ItineraryCategory } from '../types/travel';

interface TripHeroProps {
  trip: Trip;
  allTrips?: Trip[];
  onSelectTrip?: (tripId: string) => void;
  onSelectDay?: (dayIndex: number) => void;
  selectedDayIndex?: number;
  totalActivities: number;
  completedActivities: number;
  totalCost: number;
  onOpenMap: () => void;
  onOpenBudget: () => void;
  onAddActivity: () => void;
  onOpenScanner?: () => void;
}

interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  meta: string;
  dayIndex?: number;
  dayNumber?: number;
  category?: ItineraryCategory;
}

export const TripHero: React.FC<TripHeroProps> = ({
  trip,
  onSelectDay,
  selectedDayIndex = 0,
  totalActivities,
  completedActivities,
  totalCost,
  onOpenMap,
  onOpenBudget,
  onAddActivity,
  onOpenScanner
}) => {
  // ----------------------------------------------------
  // 1. Hero Showcase Auto-Sliding Banner
  // ----------------------------------------------------
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [heroPlaying, setHeroPlaying] = useState(false);

  // Generate hero slides: Main Overview + Highlight places across the trip
  const heroSlides = useMemo<HeroSlide[]>(() => {
    const slides: HeroSlide[] = [
      {
        id: `overview-${trip.id}`,
        image: trip.coverImage,
        badge: trip.duration,
        badgeColor: 'bg-[#C84B31]',
        title: trip.title,
        subtitle: trip.tagline,
        meta: trip.region
      }
    ];

    // Pick top representative places across the days
    trip.days.forEach((day, dIdx) => {
      day.items.forEach((item) => {
        // Pick prominent cultural sights or culinary attractions
        if (item.imageUrl && (item.category === 'cultural_sight' || item.category === 'culinary') && slides.length < 6) {
          slides.push({
            id: item.id,
            image: item.imageUrl,
            badge: item.category === 'culinary' ? 'Famous Food Spot' : 'Iconic Landmark',
            badgeColor: item.category === 'culinary' ? 'bg-amber-600' : 'bg-[#C84B31]',
            title: item.title,
            subtitle: item.touristTip || item.description,
            meta: `${item.location || item.city} • Day ${day.dayNumber}`,
            dayIndex: dIdx,
            dayNumber: day.dayNumber,
            category: item.category
          });
        }
      });
    });

    return slides;
  }, [trip]);

  // Reset active slide if trip changes
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [trip.id]);

  // Auto-sliding interval for top hero banner
  useEffect(() => {
    if (!heroPlaying || isHeroHovered || heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroPlaying, isHeroHovered, heroSlides.length]);

  const handleNextHeroSlide = useCallback(() => {
    setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const handlePrevHeroSlide = useCallback(() => {
    setActiveSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  // ----------------------------------------------------
  // 2. Horizontal Places Carousel with Smooth Auto-Sliding
  // ----------------------------------------------------
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPlacesAutoSliding, setIsPlacesAutoSliding] = useState(false);
  const [isPlacesHovered, setIsPlacesHovered] = useState(false);

  // Flatten all places across all days for the horizontal reel
  const allTripPlaces = useMemo(() => {
    return trip.days.flatMap((day, dIdx) => 
      day.items.map(item => ({
        ...item,
        dayNumber: day.dayNumber,
        dayIndex: dIdx,
        dayCity: day.city
      }))
    );
  }, [trip]);

  // Check scroll boundary limits
  const checkScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [allTripPlaces, checkScroll]);

  const scrollSlider = useCallback((direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  }, [checkScroll]);

  // Places carousel continuous auto-sliding effect
  useEffect(() => {
    if (!isPlacesAutoSliding || isPlacesHovered || allTripPlaces.length <= 1) return;

    const autoScrollInterval = setInterval(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      
      // If near the end, loop smoothly back to start
      if (scrollLeft >= scrollWidth - clientWidth - 25) {
        sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: 290, behavior: 'smooth' });
      }
      setTimeout(checkScroll, 350);
    }, 3600);

    return () => clearInterval(autoScrollInterval);
  }, [isPlacesAutoSliding, isPlacesHovered, allTripPlaces.length, checkScroll]);

  const getCategoryBadge = (category: ItineraryCategory) => {
    switch (category) {
      case 'culinary':
        return { label: 'Street Food / Dining', bg: 'bg-amber-500/90 text-white', icon: Utensils };
      case 'cultural_sight':
        return { label: 'Heritage Landmark', bg: 'bg-[#C84B31]/90 text-white', icon: Landmark };
      case 'cultural_buy':
        return { label: 'Artisan & Craft', bg: 'bg-emerald-600/90 text-white', icon: ShoppingBag };
      case 'transit':
        return { label: 'Transit Link', bg: 'bg-blue-600/90 text-white', icon: Train };
      default:
        return { label: 'Curated Stop', bg: 'bg-neutral-700/90 text-white', icon: MapPin };
    }
  };

  const currentSlide = heroSlides[activeSlideIndex] || heroSlides[0];

  return (
    <div 
      id="trip-hero-section"
      className="bg-white rounded-[28px] border border-[#E8E2D9] overflow-hidden shadow-[0_16px_32px_rgba(25,23,21,0.06)] mb-6 transition-all"
    >
      
      {/* ---------------------------------------------------------------- */}
      {/* TOP AUTO-SLIDING HERO BANNER SHOWCASE                            */}
      {/* ---------------------------------------------------------------- */}
      <div 
        className="relative min-h-[340px] sm:min-h-[360px] md:min-h-[380px] w-full overflow-hidden bg-[#15120F] select-none flex flex-col justify-between p-4 sm:p-6 md:p-8"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        
        {/* Render stacked slide images for smooth cross-fading */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {heroSlides.map((slide, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className={`w-full h-full object-cover object-center transform transition-transform duration-6000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
              </div>
            );
          })}

          {/* Cinematic Deep Scrims for High-Contrast Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#15120F] via-[#15120F]/65 to-[#15120F]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#15120F]/85 via-[#15120F]/30 to-transparent hidden md:block" />
        </div>

        {/* Top Header Badges (In flow, prevents any vertical overlapping) */}
        <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#191715] text-[11px] sm:text-xs font-extrabold shadow-sm max-w-full">
              <MapPin className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
              <span className="truncate max-w-[190px] xs:max-w-none">{trip.region}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/20 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#FFA07A] shrink-0" />
              <span>{trip.dateRange}</span>
            </span>
          </div>

          {/* Quick Scanner Badge Trigger */}
          {onOpenScanner && (
            <button
              id="hero-quick-scanner-pill"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#C84B31] hover:bg-[#B83E26] text-white text-[11px] sm:text-xs font-bold shadow-md transition-all cursor-pointer group shrink-0"
              title="Scan live surroundings within 5 km"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Explore nearby</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform hidden sm:inline" />
            </button>
          )}

        </div>

        {/* Next / Previous Banner Controls */}
        <button
          id="hero-banner-prev-slide-btn"
          onClick={handlePrevHeroSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
          title="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          id="hero-banner-next-slide-btn"
          onClick={handleNextHeroSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
          title="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dynamic Slide Content Caption (In flow, anchored at bottom via mt-auto) */}
        <div className="relative z-10 w-full text-white space-y-2.5 sm:space-y-3 mt-auto pt-6">
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`px-2.5 sm:px-3 py-1 rounded-md ${currentSlide.badgeColor} text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-xs shrink-0`}>
              {currentSlide.badge}
            </span>
            
            <span className="px-2.5 sm:px-3 py-1 rounded-md bg-white/15 backdrop-blur-md text-white/90 text-[10px] sm:text-[11px] font-semibold border border-white/15 shrink-0">
              Verified • {totalActivities} Curated Stops
            </span>

            {trip.id === 'indore-heritage-culinary' && (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/90 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-xs shrink-0">
                🏆 India's Cleanest City
              </span>
            )}

            {currentSlide.dayIndex !== undefined && onSelectDay && (
              <button
                onClick={() => onSelectDay(currentSlide.dayIndex!)}
                className="px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/35 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold cursor-pointer transition-colors shrink-0"
              >
                Day {currentSlide.dayNumber} →
              </button>
            )}
          </div>

          <div className="max-w-3xl space-y-1 sm:space-y-1.5">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight font-serif-display leading-tight drop-shadow-md">
              {currentSlide.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/85 font-medium leading-relaxed max-w-2xl drop-shadow-xs line-clamp-2">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Slide Indicator Progress Bars & Day Quick Links */}
          <div className="pt-2 sm:pt-2.5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            
            {/* Slide Navigation Dots / Bars */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button type="button" aria-label={heroPlaying ? 'Pause trip slideshow' : 'Play trip slideshow'} aria-pressed={heroPlaying} onClick={() => setHeroPlaying(!heroPlaying)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 mr-1">{heroPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
              {heroSlides.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      isActive 
                        ? 'w-6 sm:w-7 bg-white shadow-xs' 
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${idx + 1}: ${slide.title}`}
                  />
                );
              })}
              <span className="text-[11px] text-white/70 font-medium ml-1">
                {activeSlideIndex + 1} / {heroSlides.length}
              </span>
            </div>

            {/* Daily Itinerary Quick Day Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-white/70 uppercase tracking-wider shrink-0 hidden md:inline-block">
                Daily Schedule:
              </span>
              {trip.days.map((day, idx) => {
                const isSelected = idx === selectedDayIndex;
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => onSelectDay && onSelectDay(idx)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-white text-[#191715] font-extrabold shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-white/85 border border-white/15'
                    }`}
                  >
                    <span>Day {day.dayNumber}</span>
                    <span className="text-[10px] opacity-70 hidden xs:inline">• {day.city.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* ---------------------------------------------------------------- */}
      {/* HORIZONTAL PLACES CAROUSEL WITH AUTO-SLIDING                     */}
      {/* ---------------------------------------------------------------- */}
      <div 
        className="bg-[#FAF8F5] border-t border-[#E8E2D9] py-4.5"
        onMouseEnter={() => setIsPlacesHovered(true)}
        onMouseLeave={() => setIsPlacesHovered(false)}
      >
        
        {/* Section Header with Auto-Slide Controls */}
        <div className="px-4 sm:px-6 mb-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C84B31]/10 flex items-center justify-center text-[#C84B31] shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-[#191715] tracking-tight">
                  Famous Places to Visit
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#EFEAE2] text-[#665E55] text-[10px] font-extrabold border border-[#E0D9CE]">
                  {allTripPlaces.length} Stops
                </span>
                
                {/* Auto-Slide Status Pill */}
                <button
                  onClick={() => setIsPlacesAutoSliding(!isPlacesAutoSliding)}
                  className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                    isPlacesAutoSliding 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                      : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                  }`}
                  title={isPlacesAutoSliding ? 'Click to pause auto-slide' : 'Click to enable auto-slide'}
                >
                  {isPlacesAutoSliding ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                  <span>{isPlacesAutoSliding ? 'Auto-sliding' : 'Play slideshow'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#7A7267] hidden sm:block">
                Curated showcase of iconic monuments, street food bazaars & cultural gems
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Adjusted Add Stop Button in the sliding section */}
            <button
              id="hero-slider-add-stop-btn"
              onClick={onAddActivity}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#C84B31] hover:bg-[#B83E26] text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
              title="Add a new stop to this itinerary"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Stop</span>
            </button>

            {/* Slider Manual Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                id="hero-places-slide-left-btn"
                onClick={() => scrollSlider('left')}
                disabled={!canScrollLeft}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border border-[#E0D9CE] hover:bg-[#F3EFEA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#191715] transition-all cursor-pointer shadow-2xs"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="hero-places-slide-right-btn"
                onClick={() => scrollSlider('right')}
                disabled={!canScrollRight}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border border-[#E0D9CE] hover:bg-[#F3EFEA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#191715] transition-all cursor-pointer shadow-2xs"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Sliding Places Container */}
        <div 
          ref={sliderRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-3.5 overflow-x-auto scroll-smooth px-4 sm:px-6 py-1 no-scrollbar snap-x snap-mandatory"
        >
          {allTripPlaces.map((place, index) => {
            const badge = getCategoryBadge(place.category);
            const BadgeIcon = badge.icon;

            return (
              <button
                type="button"
                key={place.id || index}
                onClick={() => onSelectDay && onSelectDay(place.dayIndex)}
                className="text-left p-2.5 w-64 sm:w-72 shrink-0 snap-start bg-white rounded-[24px] border border-[#E8E2D9] hover:border-[#C84B31]/50 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* Place Image with Badges */}
                <div className="relative h-40 w-full rounded-[18px] overflow-hidden bg-neutral-900">
                  <img
                    src={place.imageUrl}
                    alt={place.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-bold shadow-xs border border-white/20">
                    <span className={`px-1.5 py-0.5 rounded-xs ${badge.bg} flex items-center gap-1`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Day & Cost Tag */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md font-extrabold border border-white/20">
                      Day {place.dayNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md font-bold text-amber-300 border border-white/20">
                      {place.cost === 0 ? 'Free' : `₹${place.cost}`}
                    </span>
                  </div>
                </div>

                {/* Place Information Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1 text-[11px] text-[#7A7267]">
                      <span className="flex items-center gap-1 truncate font-medium">
                        <MapPin className="w-3 h-3 text-[#C84B31] shrink-0" />
                        <span className="truncate">{place.location || place.city}</span>
                      </span>
                      {place.rating && (
                        <span className="flex items-center gap-0.5 font-bold text-[#191715] shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{place.rating}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-[#191715] line-clamp-2 group-hover:text-[#C84B31] transition-colors leading-tight">
                      {place.title}
                    </h4>
                  </div>

                  {/* Bottom Strip: Time & Action Link */}
                  <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[11px]">
                    <span className="text-[#7A7267] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#998F82]" />
                      <span>{place.time}</span>
                    </span>
                    <span className="text-[#C84B31] font-bold group-hover:underline flex items-center gap-0.5">
                      <span>View Day {place.dayNumber}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add Stop Interactive Card at the End of the Slider */}
          <button
            type="button"
            onClick={onAddActivity}
            className="w-52 sm:w-60 shrink-0 snap-start bg-gradient-to-b from-[#FFFBF7] to-[#FFF3ED] rounded-2xl border-2 border-dashed border-[#C84B31]/40 hover:border-[#C84B31] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:shadow-md"
            title="Add a custom stop or landmark to this itinerary"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#C84B31] text-white flex items-center justify-center mb-3 group-hover:scale-110 group-active:scale-95 transition-transform shadow-xs">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-black text-[#191715] mb-1">Add Another Stop</h4>
            <p className="text-[11px] text-[#7A7267] mb-3.5 leading-snug">
              Insert a monument, food joint, or transit step to this itinerary
            </p>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#C84B31] text-white text-xs font-bold group-hover:bg-[#B83E26] transition-colors shadow-2xs">
              + Add Stop Now
            </span>
          </button>

        </div>

      </div>

      {/* ---------------------------------------------------------------- */}
      {/* BOTTOM ACTION LEDGER & PROXIMITY CONTROLS                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="trip-action-panel p-4 sm:p-6 bg-[#FFFFFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#E8E2D9]">
        
        {/* Travelers & Key Metrics */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Travelers Group */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {trip.travelers.map((t, idx) => (
                <img
                  key={idx}
                  src={t.avatar}
                  alt={t.name}
                  title={t.name}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs"
                />
              ))}
            </div>
            <div className="text-xs">
              <div className="font-extrabold text-[#191715]">{trip.travelers.length} Travelers</div>
              <div className="text-[11px] text-[#665E55]">Verified Party</div>
            </div>
          </div>

          <div className="h-8 w-px bg-[#E8E2D9] hidden sm:block" />

          {/* Quick Ledger Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <button
              id="view-budget-pill-btn"
              onClick={onOpenBudget}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E2D9] flex items-center gap-2 font-bold text-[#191715] transition-colors cursor-pointer"
            >
              <IndianRupee className="w-3.5 h-3.5 text-[#166534]" />
              <span>₹{totalCost.toLocaleString('en-IN')} Est.</span>
              <span className="text-[10px] text-[#665E55] font-normal uppercase tracking-wider">Budget</span>
            </button>

            <button
              id="view-stops-pill-btn"
              onClick={() => onSelectDay && onSelectDay(selectedDayIndex)}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center gap-1.5 font-bold text-[#191715]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>{completedActivities}/{totalActivities} Visited</span>
            </button>
          </div>

        </div>

        {/* Primary Action Buttons */}
        <div className="trip-quick-actions flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 shrink-0 w-full sm:w-auto">
          
          {/* Radar Scanner Button */}
          {onOpenScanner && (
            <button
              id="hero-scan-surroundings-btn"
              onClick={onOpenScanner}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#191715] hover:bg-[#C84B31] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFA07A] animate-pulse" />
              <span>Nearby</span>
            </button>
          )}

          {/* Route Map Button */}
          <button
            id="open-map-view-btn"
            onClick={onOpenMap}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#191715] border border-[#E8E2D9] text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C84B31]" />
            <span>Route Map</span>
          </button>

          {/* Add Stop Button */}
          <button
            id="add-activity-hero-btn"
            onClick={onAddActivity}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#C84B31] hover:bg-[#B83E26] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
            <span>Add Stop</span>
          </button>

        </div>

      </div>

    </div>
  );
};
