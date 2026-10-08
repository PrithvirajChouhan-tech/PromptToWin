import React from 'react';
import { 
  MapPin, 
  Search, 
  Bell, 
  Compass, 
  ChevronDown,
  Sparkles, 
  Share2, 
  Accessibility, 
  Radio, 
  BookOpen,
  Store,
  Building,
  Building2,
  BadgeAlert,
  LogOut,
  User,
  ArrowUpRight,
  Lock,
  X
} from 'lucide-react';
import { Trip, DayPlan, ItineraryItem } from '../types/travel';
import { AuthUser, isDemoUser, promptDemoRestriction } from '../types/auth';
import { IndianTimeWidget } from './common/IndianTimeWidget';
import { Notifications } from './journey/JourneyHub';
import { ProfileMenu } from './tourist/ProfileMenu';
import { SerpApiSearchDropdown } from './search/SerpApiSearchDropdown';
import './journey/journey.css';
import './tourist/tourist.css';

interface HeaderProps {
  currentTrip: Trip;
  allTrips: Trip[];
  onSelectTrip: (tripId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenToolkit: () => void;
  onShare: () => void;
  onOpenSOS?: () => void;
  accessibilityMode?: boolean;
  onToggleAccessibility?: () => void;
  onOpenProfile?: () => void;
  onOpenSuperCard?: () => void;
  onOpenScanner?: () => void;
  onOpenAssistant?: (initialQuery?: string, context?: any) => void;
  onOpenAIPlanner?: (destination: string) => void;
  currentLocationName?: string;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenMap?: () => void;
  onOpenMapWithLocation?: (loc: { lat: number; lng: number; title: string }) => void;
  onAddStop?: (item: Omit<ItineraryItem, 'id'>) => void;
  onOpenDestinationHub?: (destination: string, searchData?: any) => void;
  onOpenFairPrice?: (query: string) => void;
  currentDay?: DayPlan;
  activeNavTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrip,
  allTrips,
  onSelectTrip,
  searchQuery,
  onSearchChange,
  onOpenToolkit,
  onShare,
  onOpenSOS,
  accessibilityMode = false,
  onToggleAccessibility,
  onOpenProfile,
  onOpenSuperCard,
  onOpenScanner,
  onOpenAssistant,
  onOpenAIPlanner,
  currentLocationName,
  currentUser,
  onLogout,
  onOpenMap,
  onOpenMapWithLocation,
  onAddStop,
  onOpenDestinationHub,
  onOpenFairPrice,
  currentDay,
  activeNavTab,
}) => {
  const hideSearchBar = ['trust', 'community', 'ai_planner', 'explore'].includes(activeNavTab || '');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = React.useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [localSearch, setLocalSearch] = React.useState(searchQuery);
  const profilePopoverRef = React.useRef<HTMLDivElement>(null);

  // Sync external prop changes
  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce updating parent itinerary filter so background page doesn't glitch while typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  React.useEffect(() => {
    if (!profilePopoverOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (profilePopoverRef.current && !profilePopoverRef.current.contains(e.target as Node)) {
        setProfilePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profilePopoverOpen]);

  const isMerchant = currentUser?.role === 'business';
  const isAuthority = currentUser?.role === 'authority';
  const isTourist = !isMerchant && !isAuthority;

  /* USER / TOURIST DASHBOARD NAVBAR: Left trip selector, centered search bar, right notifications bell + profile menu */
  if (isTourist) {
    return (
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE5DC] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 relative min-h-[44px]">
          
          {/* Left: Tourist Trip Selector Header */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#C84B31] flex items-center justify-center text-white shadow-xs shrink-0">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="text-[10px] font-semibold text-[#8C827A] tracking-wider uppercase flex items-center gap-1.5 leading-none mb-0.5">
                <span>TRIP</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              </div>

              <button
                id="trip-selector-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 text-[#1F1C18] font-bold text-xs sm:text-sm md:text-base hover:text-[#C84B31] transition-colors focus:outline-none cursor-pointer text-left min-w-0"
              >
                <span className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[260px]">{currentTrip.title}</span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown for switching India itineraries */}
              {dropdownOpen && (
                <div 
                  id="trip-selector-menu"
                  className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#EAE5DC] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-1.5 text-xs font-semibold text-[#9C948B] uppercase tracking-wider border-b border-[#F0ECE4]">
                    Curated Indian Itineraries
                  </div>
                  {allTrips.map((trip) => (
                    <button
                      key={trip.id}
                      id={`trip-option-${trip.id}`}
                      onClick={() => {
                        onSelectTrip(trip.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-[#FBF9F6] transition-colors ${
                        trip.id === currentTrip.id ? 'bg-[#FFF7F4] border-l-4 border-[#FF6F59]' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5">
                        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[#1F1C18] truncate">{trip.title}</div>
                        <div className="text-xs text-[#827971] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#FF6F59]" />
                          <span className="truncate">{trip.region}</span>
                        </div>
                        <div className="text-[11px] text-[#8C827A] flex items-center gap-1.5 mt-0.5 font-medium">
                          <span>{trip.dateRange}</span>
                          <span>•</span>
                          <span>{trip.duration}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar - Exactly Centered with SerpAPI Live Search & Productive Actions */}
          {!hideSearchBar && (
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs md:max-w-sm lg:max-w-md pointer-events-auto z-50 search-box-wrapper">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C948B] pointer-events-none" />
                <input
                  id="global-search-input"
                  type="text"
                  value={localSearch}
                  onFocus={() => {
                    if (localSearch.trim().length >= 2) setDesktopSearchOpen(true);
                  }}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setDesktopSearchOpen(e.target.value.trim().length >= 2);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setDesktopSearchOpen(false);
                    if (e.key === 'Enter' && localSearch.trim()) {
                      onOpenDestinationHub?.(localSearch.trim());
                      setDesktopSearchOpen(false);
                    }
                  }}
                  placeholder="Search destinations, sights & guides..."
                  className="w-full bg-[#FFFFFF] border border-[#EAE5DC] rounded-xl pl-10 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm text-[#1F1C18] placeholder-[#9C948B] focus:outline-none focus:border-[#C84B31] focus:ring-2 focus:ring-[#C84B31]/10 transition-all shadow-xs"
                />
                {localSearch && (
                  <button 
                    onClick={() => {
                      setLocalSearch('');
                      onSearchChange('');
                      setDesktopSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#1F1C18] p-1 rounded-md cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* SerpAPI Live Search Dropdown */}
                <SerpApiSearchDropdown
                  query={localSearch}
                  isOpen={desktopSearchOpen}
                  onClose={() => setDesktopSearchOpen(false)}
                  allTrips={allTrips}
                  onSelectTrip={onSelectTrip}
                  onOpenAssistant={onOpenAssistant}
                  onOpenAIPlanner={onOpenAIPlanner}
                  onOpenMap={onOpenMapWithLocation || (() => onOpenMap?.())}
                  onAddStop={onAddStop}
                  onOpenDestinationHub={onOpenDestinationHub}
                  onOpenFairPrice={onOpenFairPrice}
                  currentDay={currentDay}
                />
              </div>
            </div>
          )}

          {/* Right: Tourist Account Actions (Notifications Bell + Profile Menu) */}
          <div className="flex items-center gap-2 relative z-[60] shrink-0">
            {isDemoUser(currentUser) && (
              <button
                type="button"
                onClick={() => promptDemoRestriction(
                  "Full Application Access",
                  "You are currently using a Demo Account. Live turn-by-turn navigation, custom AI itinerary planning, and emergency 112 services are restricted. Please sign in or register to unlock all features."
                )}
                className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
                title="Demo Account - Tap to log in"
              >
                <Lock size={12} className="text-amber-600 stroke-[2.5]" />
                <span>Demo User</span>
                <span className="text-[10px] text-amber-900 underline font-semibold ml-0.5">Log in</span>
              </button>
            )}
            <div className="tourist-account-actions !static !top-auto !right-auto !z-auto flex items-center gap-2">
              <Notifications />
              <ProfileMenu
                name={currentUser?.name || 'Explorer'}
                avatar={currentUser?.avatar}
                onViewProfile={onOpenProfile || (() => {})}
                onOpenSuperCard={onOpenSuperCard}
                onLogout={onLogout || (() => {})}
              />
            </div>
          </div>
        </div>

        {/* Mobile search bar visible on screens under sm (640px) */}
        {!hideSearchBar && (
          <div className="mt-2.5 sm:hidden relative z-30 search-box-wrapper">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C948B]" />
              <input
                id="mobile-search-input"
                type="text"
                value={localSearch}
                onFocus={() => {
                  if (localSearch.trim().length >= 2) setMobileSearchOpen(true);
                }}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setMobileSearchOpen(e.target.value.trim().length >= 2);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setMobileSearchOpen(false);
                  if (e.key === 'Enter' && localSearch.trim()) {
                    onOpenDestinationHub?.(localSearch.trim());
                    setMobileSearchOpen(false);
                  }
                }}
                placeholder="Search destinations, sights & guides..."
                className="w-full bg-white border border-[#EAE5DC] rounded-xl pl-9 pr-9 py-2 text-xs text-[#1F1C18] placeholder-[#9C948B] focus:outline-none focus:border-[#C84B31]"
              />
              {localSearch && (
                <button 
                  onClick={() => {
                    setLocalSearch('');
                    onSearchChange('');
                    setMobileSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#1F1C18] p-1 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Mobile SerpAPI Search Dropdown */}
              <SerpApiSearchDropdown
                query={localSearch}
                isOpen={mobileSearchOpen}
                onClose={() => setMobileSearchOpen(false)}
                allTrips={allTrips}
                onSelectTrip={onSelectTrip}
                onOpenAssistant={onOpenAssistant}
                onOpenAIPlanner={onOpenAIPlanner}
                onOpenMap={onOpenMapWithLocation || (() => onOpenMap?.())}
                onAddStop={onAddStop}
                onOpenDestinationHub={onOpenDestinationHub}
                onOpenFairPrice={onOpenFairPrice}
                currentDay={currentDay}
              />
            </div>
          </div>
        )}
      </header>
    );
  }

  /* BUSINESS & AUTHORITY DASHBOARDS NAVBAR */
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE5DC] px-2.5 sm:px-4 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Left: Menu Option & Role-Specific Brand / Selector */}
        <div className="flex items-center gap-1 sm:gap-2.5 relative min-w-0 flex-shrink">
          


          {/* Role 1: Merchant (Business) Brand Header */}
          {isMerchant && (
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#064E3B] flex items-center justify-center text-white shadow-xs shrink-0">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-extrabold text-[#059669] tracking-wider uppercase flex items-center gap-1 leading-none mb-0.5">
                  <span>Merchant Portal</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                </div>
                <div className="text-xs sm:text-sm font-black text-[#191715] truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
                  {currentUser?.businessName || 'Verified Merchant Partner'}
                </div>
              </div>
            </div>
          )}

          {/* Role 2: Authority & ASI Brand Header */}
          {isAuthority && (
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#881337] flex items-center justify-center text-white shadow-xs shrink-0">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-extrabold text-[#E11D48] tracking-wider uppercase flex items-center gap-1 leading-none mb-0.5">
                  <span>Authority Console</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]"></span>
                </div>
                <div className="text-xs sm:text-sm font-black text-[#191715] truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
                  {currentUser?.department || 'Ministry of Tourism & ASI'}
                </div>
              </div>
            </div>
          )}

          {/* Role 3: Tourist Trip Selector Header with Yatra One Brand Logo */}
          {isTourist && (
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs shrink-0 ring-1 ring-[#FF6F59]/30 hover:scale-105 transition-all bg-[#C84B31] p-0.5 cursor-pointer">
                <img src="/logo.svg" alt="Yatra One" className="w-full h-full object-contain rounded-lg" />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="text-[9px] sm:text-[10px] font-semibold text-[#8C827A] tracking-wider uppercase flex items-center gap-1 leading-none mb-0.5">
                  <span className="font-black text-[#C84B31] tracking-tight">Yatra One</span>
                  <span className="text-[#CCC]">•</span>
                  <span>Trip</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                </div>

                <button
                  id="trip-selector-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 text-[#1F1C18] font-bold text-xs sm:text-sm md:text-base hover:text-[#FF6F59] transition-colors focus:outline-none cursor-pointer text-left min-w-0 max-w-full"
                >
                  <span className="truncate max-w-[85px] xs:max-w-[125px] sm:max-w-[170px] md:max-w-[210px] lg:max-w-[260px]">{currentTrip.title}</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown for switching India itineraries */}
                {dropdownOpen && (
                  <div 
                    id="trip-selector-menu"
                    className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#EAE5DC] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3.5 py-1.5 text-xs font-semibold text-[#9C948B] uppercase tracking-wider border-b border-[#F0ECE4]">
                      Curated Indian Itineraries
                    </div>
                    {allTrips.map((trip) => (
                      <button
                        key={trip.id}
                        id={`trip-option-${trip.id}`}
                        onClick={() => {
                          onSelectTrip(trip.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-[#FBF9F6] transition-colors ${
                          trip.id === currentTrip.id ? 'bg-[#FFF7F4] border-l-4 border-[#FF6F59]' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5">
                          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-[#1F1C18] truncate">{trip.title}</div>
                          <div className="text-xs text-[#827971] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#FF6F59]" />
                            <span className="truncate">{trip.region}</span>
                          </div>
                          <div className="text-[11px] text-[#8C827A] flex items-center gap-1.5 mt-0.5 font-medium">
                            <span>{trip.dateRange}</span>
                            <span>•</span>
                            <span>{trip.duration}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Center: Search Bar - Dedicated on sm (>=640px) screens */}
        <div className="hidden sm:flex flex-1 max-w-xs xl:max-w-md mx-3 xl:mx-6 min-w-0">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C948B]" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                isMerchant
                  ? "Search complaints, verified invoices, transactions..."
                  : isAuthority
                  ? "Search monuments, officer logs, enforcement files..."
                  : "Search stops, Vande Bharat train, street food, crafts..."
              }
              className="w-full bg-[#FFFFFF] border border-[#EAE5DC] rounded-xl pl-10 pr-4 py-2 text-sm text-[#1F1C18] placeholder-[#9C948B] focus:outline-none focus:border-[#FF6F59] focus:ring-2 focus:ring-[#FF6F59]/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#1F1C18]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Role-Specific Action Buttons & Profile Popover Menu */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          
          {/* Indian Standard Time (IST - Asia/Kolkata) Live WorldTimeAPI Clock (Tourist only; hidden in Business & Authority dashboards) */}
          {isTourist && (
            <div className="hidden lg:flex items-center">
              <IndianTimeWidget variant="header" />
            </div>
          )}

          {/* Universal Map Shortcut in Header for All Dashboards */}
          {onOpenMap && (
            <button
              id="header-universal-map-btn"
              onClick={onOpenMap}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isMerchant
                  ? 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
                  : isAuthority
                  ? 'bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]'
                  : 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE]'
              }`}
              title="Open dedicated Map section and enable location access"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {isMerchant ? 'Footfall Map' : isAuthority ? 'Telemetry Map' : 'Live Map'}
              </span>
            </button>
          )}

          {/* Tourist-Exclusive Action Buttons */}
          {isTourist && (
            <>
              {/* Surrounding Area Scanner */}
              {onOpenScanner && (
                <button
                  id="header-location-scanner-btn"
                  onClick={onOpenScanner}
                  className="w-9 h-9 lg:w-auto lg:px-2.5 lg:py-1.5 xl:px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E2D9] text-[#191715] text-xs font-bold transition-all shadow-2xs cursor-pointer group flex items-center justify-center gap-1.5 shrink-0"
                  title="Scan nearby verified sights, food, and transit in your immediate area"
                  aria-label="Scan nearby radar"
                >
                  <div className="relative flex items-center justify-center">
                    <Radio className="w-4 h-4 text-[#C84B31] animate-pulse shrink-0" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  </div>
                  <span className="hidden xl:inline truncate max-w-[110px] text-[11px] text-[#665E55]">
                    {currentLocationName || 'Near Chandni Chowk'}
                  </span>
                  <span className="hidden lg:inline text-[11px] text-[#C84B31] font-bold group-hover:underline">Radar</span>
                </button>
              )}

              {/* Accessibility Mode Toggle */}
              {onToggleAccessibility && (
                <button
                  id="accessibility-mode-toggle-btn"
                  onClick={onToggleAccessibility}
                  className={`hidden sm:flex w-9 h-9 xl:w-auto xl:px-2.5 xl:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border items-center justify-center gap-1 shrink-0 ${
                    accessibilityMode
                      ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                      : 'bg-white text-[#5A524C] hover:bg-[#FAF8F5] border-[#EAE5DC]'
                  }`}
                  title="Toggle Accessibility Mode (Wheelchair routes, accessible toilets, assistance)"
                  aria-label="Toggle Accessibility Mode"
                >
                  <Accessibility className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{accessibilityMode ? '♿ ON' : '♿ Accessible'}</span>
                </button>
              )}

              {/* Sahayak AI Assistant */}
              {onOpenAssistant && (
                <button
                  id="header-sahayak-chat-btn"
                  onClick={() => onOpenAssistant?.()}
                  className="w-9 h-9 lg:w-auto lg:px-2.5 lg:py-1.5 bg-[#191715] hover:bg-[#C84B31] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  title="Sahayak AI Assistant (Travel & App Help)"
                  aria-label="Open Sahayak AI Assistant"
                >
                  <Sparkles className="w-4 h-4 text-[#FFA07A] shrink-0" />
                  <span className="hidden lg:inline">Sahayak AI</span>
                </button>
              )}

              {/* Tourist Toolkit & Guide */}
              <button
                id="tourist-guide-header-btn"
                onClick={onOpenToolkit}
                className="hidden sm:flex w-9 h-9 lg:w-auto lg:px-2.5 lg:py-1.5 bg-[#FFF2EE] hover:bg-[#FFE6DF] text-[#D94F36] rounded-xl text-xs font-semibold border border-[#FED7CC] transition-colors shadow-2xs items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                title="India Tourist Toolkit & Cultural Guide"
                aria-label="Open Tourist Guide"
              >
                <BookOpen className="w-4 h-4 text-[#FF6F59] shrink-0" />
                <span className="hidden lg:inline">Guide</span>
              </button>

              {/* Share Itinerary */}
              <button
                id="share-trip-btn"
                onClick={onShare}
                className="hidden xs:flex w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] hover:bg-[#F6F4EE] text-[#5A524C] transition-colors shrink-0 items-center justify-center cursor-pointer"
                title="Share Itinerary Link"
                aria-label="Share Itinerary"
              >
                <Share2 className="w-4 h-4 shrink-0" />
              </button>
            </>
          )}


          {/* USER / TOURIST DASHBOARD NAVBAR (from yatraone-map-feature) */}
          {isTourist ? (
            <>
              {/* User Profile Avatar (Direct click to open profile) */}
              <button
                id="header-user-profile-btn"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 sm:gap-2 pl-0.5 sm:pl-1.5 border-l border-[#EAE5DC] hover:opacity-90 active:scale-95 transition-all cursor-pointer group shrink-0"
                title="Open Account Profile & Settings"
                aria-label="Open Account Profile"
              >
                <div className="relative shrink-0">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                    alt={currentUser?.name || "User Profile"}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-2 ring-[#FF6F59]/30 group-hover:ring-[#FF6F59] transition-all shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#10B981] ring-2 ring-white"></span>
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-[#1F1C18] group-hover:text-[#FF6F59] transition-colors leading-tight truncate max-w-[120px]">
                    {currentUser?.name || 'Guest User'}
                  </div>
                  <div className="text-[10px] text-[#8C827A] leading-tight capitalize">
                    Traveler
                  </div>
                </div>
              </button>

              {/* Sign Out Action Button */}
              {onLogout && (
                <button
                  id="header-sign-out-btn"
                  onClick={onLogout}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-[#FEF2F2] border border-[#EAE5DC] hover:border-[#FECACA] text-[#DC2626] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                  title="Sign out from this dashboard"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </>
          ) : (
            /* BUSINESS & AUTHORITY DASHBOARDS: Avatar with Popover (View Profile & Sign Out) */
            <div ref={profilePopoverRef} className="relative">
              <button
                id="header-user-profile-btn"
                onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
                className="flex items-center gap-1.5 sm:gap-2 pl-0.5 sm:pl-1.5 border-l border-[#EAE5DC] hover:opacity-90 active:scale-95 transition-all cursor-pointer group shrink-0"
                title="Open Account Profile & Settings"
                aria-label="Open Account Profile"
              >
                <div className="relative shrink-0">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                    alt={currentUser?.name || "User Profile"}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-2 transition-all shadow-xs ${
                      isAuthority
                        ? 'ring-[#BE123C]/30 group-hover:ring-[#BE123C]'
                        : 'ring-[#059669]/30 group-hover:ring-[#059669]'
                    }`}
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#10B981] ring-2 ring-white"></span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-[#1F1C18] group-hover:text-[#059669] transition-colors leading-tight truncate max-w-[130px]">
                    {currentUser?.name || 'User Account'}
                  </div>
                  <div className="text-[10px] text-[#8C827A] leading-tight capitalize">
                    {currentUser?.role === 'authority' ? 'Official' : 'Merchant'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8C827A] transition-transform ${profilePopoverOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Popover Dropdown (View Profile & Sign Out) */}
              {profilePopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EAE5DC] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-2 border-b border-[#F0ECE4]">
                    <div className="text-xs font-black text-[#191715] truncate">{currentUser?.name || 'User Account'}</div>
                    <div className="text-[10px] text-[#665E55] capitalize font-medium">
                      {currentUser?.role === 'authority' ? 'Official Government Account' : 'Verified Merchant Account'}
                    </div>
                  </div>

                  <button
                    id="view-profile-header-btn"
                    onClick={() => {
                      setProfilePopoverOpen(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#191715] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${isAuthority ? 'text-[#BE123C]' : 'text-[#059669]'}`} />
                      <span>{isMerchant ? 'View merchant profile' : 'View officer profile'}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#665E55]" />
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setProfilePopoverOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#DC2626]" />
                      <span>Sign out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Mobile & Tablet search bar visible on screens under sm (640px) */}
      <div className="mt-2.5 sm:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C948B]" />
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isMerchant
                ? "Search complaints, verified invoices, transactions..."
                : isAuthority
                ? "Search monuments, officer logs, enforcement files..."
                : "Search stops, transit, food, spices, festivals..."
            }
            className="w-full bg-white border border-[#EAE5DC] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F1C18] placeholder-[#9C948B] focus:outline-none focus:border-[#FF6F59]"
          />
        </div>
      </div>
    </header>
  );
};
