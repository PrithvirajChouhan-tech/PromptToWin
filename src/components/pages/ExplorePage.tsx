import React, { useState } from 'react';
import {
  Train,
  Utensils,
  Sparkles,
  ShoppingBag,
  BookOpen,
  UserCheck,
  Compass,
  ShieldCheck,
  ArrowRight,
  Scan,
  MapPin,
  CheckCircle2,
  TrendingDown,
  Search,
  AlertTriangle,
  Award,
  ChevronRight,
  Star
} from 'lucide-react';
import { MainNavTab } from '../BottomNavBar';

interface ExplorePageProps {
  onSelectTab: (tab: MainNavTab) => void;
  onOpenScanner?: () => void;
  onOpenAssistant?: () => void;
  onOpenDestinationHub?: (destination: string) => void;
  onOpenMapWithLocation?: (loc: { lat: number; lng: number; title: string }) => void;
  currentCity?: string;
}

type ExploreCategory = 'all' | 'culture' | 'transit' | 'food_safety';

interface FeatureItem {
  id: MainNavTab | 'scanner';
  title: string;
  subtitle: string;
  tag: string;
  category: 'culture' | 'transit' | 'food_safety';
  icon: React.FC<{ className?: string }>;
  gradient: string;
  iconBg: string;
  tagBg: string;
  borderHover: string;
  highlight?: string;
}

const ALL_DISCOVERY_FEATURES: FeatureItem[] = [
  // Culture & Heritage
  {
    id: 'festivals',
    title: 'Festivals & Aarti Timings',
    subtitle: 'Live local festival schedules, temple aarti times, and traditional celebrations',
    tag: 'Sacred Calendar',
    category: 'culture',
    icon: Sparkles,
    gradient: 'from-amber-500/15 via-orange-500/10 to-rose-500/10',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    tagBg: 'bg-amber-100 text-amber-800',
    borderHover: 'hover:border-amber-300',
    highlight: 'Next: Maha Shivratri & Evening Aarti'
  },
  {
    id: 'crafts',
    title: 'GI Crafts & Handlooms',
    subtitle: 'Authentic Geographical Indication artisan guilds, handlooms & certified shopping',
    tag: 'GI Tag Certified',
    category: 'culture',
    icon: ShoppingBag,
    gradient: 'from-rose-500/15 via-pink-500/10 to-amber-500/10',
    iconBg: 'bg-gradient-to-br from-[#C84B31] to-[#A03B25] text-white',
    tagBg: 'bg-rose-100 text-rose-800',
    borderHover: 'hover:border-rose-300',
    highlight: 'Banarasi Silk, Blue Pottery, Brassware'
  },
  {
    id: 'guide',
    title: 'Cultural Etiquette & Tips',
    subtitle: 'Temple dress codes, bargaining benchmarks & local customs cheat-sheet',
    tag: 'Local Etiquette',
    category: 'culture',
    icon: BookOpen,
    gradient: 'from-stone-500/15 via-amber-500/10 to-stone-500/10',
    iconBg: 'bg-gradient-to-br from-stone-600 to-[#183E35] text-white',
    tagBg: 'bg-stone-100 text-stone-800',
    borderHover: 'hover:border-stone-300',
    highlight: 'Do\'s & Don\'ts for temples & bazaars'
  },

  // Transit & Commute
  {
    id: 'transit',
    title: 'Multi-Modal Transit Hub',
    subtitle: 'Vande Bharat trains, Metro QR ticketing, auto fare benchmark & e-rickshaws',
    tag: 'Live Commute',
    category: 'transit',
    icon: Train,
    gradient: 'from-blue-500/15 via-indigo-500/10 to-sky-500/10',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
    tagBg: 'bg-blue-100 text-blue-800',
    borderHover: 'hover:border-blue-300',
    highlight: 'Govt approved metered fare engine'
  },

  // Food & Safety
  {
    id: 'culinary',
    title: 'Food Safety & Hygiene',
    subtitle: 'FSSAI verified street food hotspots, hygiene ratings & culinary trails',
    tag: 'FSSAI Verified',
    category: 'food_safety',
    icon: Utensils,
    gradient: 'from-emerald-500/15 via-green-500/10 to-teal-500/10',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-green-700 text-white',
    tagBg: 'bg-emerald-100 text-emerald-800',
    borderHover: 'hover:border-emerald-300',
    highlight: 'Hygiene audit scores & safe drinking water'
  }
];

interface DestinationCard {
  id: string;
  name: string;
  subtitle: string;
  city: string;
  state: string;
  description: string;
  photoUrl: string;
  rating: number;
  reviewsCount: number;
  tag: string;
  timings: string;
  lat: number;
  lng: number;
}

const DEFAULT_EXPLORE_DESTINATIONS: DestinationCard[] = [
  {
    id: 'somnath',
    name: 'Somnath Jyotirlinga Temple',
    subtitle: 'First of the 12 Holy Jyotirlingas',
    city: 'Somnath',
    state: 'Gujarat',
    description: 'Ancient shore temple dedicated to Lord Shiva on the western coast of Gujarat overlooking the Arabian Sea, renowned for spiritual majesty and evening sound & light show.',
    photoUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 3840,
    tag: 'Holy Jyotirlinga',
    timings: '6:00 AM - 10:00 PM',
    lat: 20.8880,
    lng: 70.4012
  },
  {
    id: 'goa',
    name: 'Goa Coastal & Heritage Circuit',
    subtitle: 'Portuguese Heritage & Konkan Coast',
    city: 'Goa',
    state: 'Goa',
    description: 'Sun-drenched coastal state celebrated for Portuguese baroque churches, pristine beaches, and vibrant Konkan food.',
    photoUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 5200,
    tag: 'Coastal Haven',
    timings: '24/7 Beaches & Sights',
    lat: 15.2993,
    lng: 74.1240
  },
  {
    id: 'varanasi',
    name: 'Varanasi Ghats & Kashi Vishwanath',
    subtitle: 'Oldest Living City on Mother Ganga',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    description: 'Sacred riverbanks, world-famous evening Ganga Aarti at Dashashwamedh Ghat, and divine Kashi Vishwanath corridor.',
    photoUrl: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 4600,
    tag: 'Spiritual Capital',
    timings: 'Ghats Open 24/7 • Aarti 6:45 PM',
    lat: 25.3176,
    lng: 82.9739
  },
  {
    id: 'jaipur',
    name: 'Jaipur Pink City & Amber Fort',
    subtitle: 'UNESCO Royal Rajput Palaces',
    city: 'Jaipur',
    state: 'Rajasthan',
    description: 'Hawa Mahal, magnificent hilltop Amber Fort, vibrant Johari Bazaar, and authentic royal Rajasthani heritage.',
    photoUrl: 'https://images.unsplash.com/photo-1603288940340-9a3b2b7a5a8f?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 4100,
    tag: 'Royal Heritage',
    timings: '9:00 AM - 6:00 PM',
    lat: 26.9124,
    lng: 75.7873
  },
  {
    id: 'taj-mahal',
    name: 'Taj Mahal & Agra Heritage',
    subtitle: 'UNESCO Wonder of the World',
    city: 'Agra',
    state: 'Uttar Pradesh',
    description: 'Pristine white marble mausoleum built by Emperor Shah Jahan, symbol of eternal love along the Yamuna River.',
    photoUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 9800,
    tag: 'Wonder of World',
    timings: 'Sunrise to Sunset (Closed Fri)',
    lat: 27.1751,
    lng: 78.0421
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh Yoga & Ganga Aarti',
    subtitle: 'Yoga Capital in Himalayan Foothills',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    description: 'Serene ashrams, Ram Jhula suspension bridge, sacred Triveni Ghat river ceremonies, and river rafting.',
    photoUrl: 'https://images.unsplash.com/photo-1596768393529-6598fb8701eb?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 2950,
    tag: 'Yoga & Adventure',
    timings: 'Aarti 6:00 PM',
    lat: 30.0869,
    lng: 78.2676
  }
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectTab,
  onOpenScanner,
  onOpenAssistant,
  onOpenDestinationHub,
  onOpenMapWithLocation,
  currentCity = 'Old & New Delhi',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExploreCategory>('all');
  const [destQuery, setDestQuery] = useState('');
  const [selectedDestId, setSelectedDestId] = useState<string>('somnath');

  const handleAction = (id: string) => {
    if (id === 'scanner' && onOpenScanner) {
      onOpenScanner();
    } else {
      onSelectTab(id as MainNavTab);
    }
  };

  const filteredFeatures = selectedCategory === 'all'
    ? ALL_DISCOVERY_FEATURES
    : ALL_DISCOVERY_FEATURES.filter((f) => f.category === selectedCategory);

  const categories: { id: ExploreCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Experiences', count: ALL_DISCOVERY_FEATURES.length },
    { id: 'culture', label: 'Culture & Heritage', count: ALL_DISCOVERY_FEATURES.filter(f => f.category === 'culture').length },
    { id: 'transit', label: 'Transit & Commute', count: ALL_DISCOVERY_FEATURES.filter(f => f.category === 'transit').length },
    { id: 'food_safety', label: 'Food & Safety', count: ALL_DISCOVERY_FEATURES.filter(f => f.category === 'food_safety').length },
  ];

  // Filter destinations based on search query
  const filteredDestinations = DEFAULT_EXPLORE_DESTINATIONS.filter(d => {
    if (!destQuery.trim()) return true;
    const q = destQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || 
           d.city.toLowerCase().includes(q) || 
           d.state.toLowerCase().includes(q) || 
           d.description.toLowerCase().includes(q);
  });

  const activeDestination = DEFAULT_EXPLORE_DESTINATIONS.find(d => d.id === selectedDestId) || DEFAULT_EXPLORE_DESTINATIONS[0];

  return (
    <div className="animate-in fade-in duration-300 space-y-5 sm:space-y-6 pb-20">
      
      {/* 0. ICONIC DESTINATION HUB (DEFAULT: SOMNATH & TOP PLACES) */}
      <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-sm p-4 sm:p-6 space-y-4">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE4]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C84B31]/10 text-[#C84B31]">
                Featured Destination Hub
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Knowledge Cards
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#1F1C18] flex items-center gap-1.5 font-display">
              <Compass className="w-5 h-5 text-[#C84B31]" />
              <span>Explore Destinations</span>
            </h2>
            <p className="text-xs text-[#736A62]">
              Tap any destination to open the full Destination Action Hub with timings, entry fees, and map guidance.
            </p>
          </div>

          {/* Quick Search inside Explore */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9C948B]" />
            <input
              type="text"
              value={destQuery}
              onChange={(e) => setDestQuery(e.target.value)}
              placeholder="Search e.g. Somnath, Goa..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl text-[#1F1C18] placeholder-[#9C948B] focus:outline-none focus:border-[#C84B31]"
            />
            {destQuery && (
              <button
                onClick={() => setDestQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9C948B] hover:text-[#1F1C18]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* DEFAULT FEATURED CARD: SOMNATH (or active selection) */}
        <div 
          onClick={() => onOpenDestinationHub?.(activeDestination.name)}
          className="group relative overflow-hidden rounded-2xl border-2 border-[#FFD8CC] bg-gradient-to-br from-[#FFF8F5] via-white to-[#FAF8F5] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Destination Photo */}
            <div className="relative w-full md:w-64 h-48 md:h-40 rounded-xl overflow-hidden shrink-0 shadow-xs">
              <img
                src={activeDestination.photoUrl}
                alt={activeDestination.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/60 text-white backdrop-blur-xs">
                {activeDestination.tag}
              </span>
              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#1F1C18] shadow-xs flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{activeDestination.rating}</span>
                <span className="text-[#8C827A]">({activeDestination.reviewsCount})</span>
              </span>
            </div>

            {/* Destination Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#1F1C18] group-hover:text-[#C84B31] transition-colors">
                  {activeDestination.name}
                </h3>
                <span className="text-[11px] font-semibold text-[#8C827A] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C84B31]" />
                  <span>{activeDestination.city}, {activeDestination.state}</span>
                </span>
              </div>

              <p className="text-xs text-[#524B45] leading-relaxed line-clamp-3">
                {activeDestination.description}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-[#736A62] pt-1">
                <span><strong>Timings:</strong> {activeDestination.timings}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <button
                  id={`explore-hub-btn-${activeDestination.id}`}
                  onClick={() => onOpenDestinationHub?.(activeDestination.name)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#183E35] to-[#122F28] hover:from-[#13322B] hover:to-[#0E241F] text-white text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-[0_3px_10px_rgba(24,62,53,0.2)] cursor-pointer border border-[#2B5E51]"
                >
                  <Compass className="w-3.5 h-3.5 text-[#F3D997]" />
                  <span>Explore Destination Hub</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F3D997]/80" />
                </button>

                {onOpenMapWithLocation && (
                  <button
                    id={`explore-map-btn-${activeDestination.id}`}
                    onClick={() => onOpenMapWithLocation({
                      lat: activeDestination.lat,
                      lng: activeDestination.lng,
                      title: activeDestination.name
                    })}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] hover:bg-[#FAF8F5] text-[#1F1C18] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Navigate on Map</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Destination Thumbnails Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
            Popular Destinations in India
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {filteredDestinations.map(dest => {
              const isSelected = dest.id === selectedDestId;
              return (
                <button
                  key={dest.id}
                  onClick={() => {
                    setSelectedDestId(dest.id);
                    onOpenDestinationHub?.(dest.name);
                  }}
                  className={`text-left p-2 rounded-xl border transition-all cursor-pointer group flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-[#C84B31] bg-[#FFF7F4] shadow-xs'
                      : 'border-[#EAE5DC] bg-white hover:border-[#FFD8CC] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="w-full h-16 rounded-lg overflow-hidden bg-stone-100">
                    <img
                      src={dest.photoUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#1F1C18] truncate group-hover:text-[#C84B31] leading-tight">
                      {dest.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#8C827A] truncate">
                      {dest.city}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. TOP HERO: VERIFIED LOCAL GUIDES */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#183E35] to-[#244D40] border border-[#183E35] p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-[#F3D997]" />
              Govt ASI Certified • Local Guides
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Verified Local Guides
              <span className="text-sm sm:text-base font-bold text-emerald-300">({currentCity})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Book Ministry of Tourism & ASI approved cultural historians, multi-lingual storytellers, zero-commission authentic tours, and safe heritage walks.
            </p>
          </div>
          <button
            onClick={() => handleAction('guides')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-[#183E35] font-black text-xs flex items-center gap-1.5 hover:bg-[#F3D997] transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <UserCheck className="w-4 h-4 text-[#183E35]" />
            <span>Verified Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. FEATURED: FAIR PRICE & SCAM ENGINE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C2D27] via-[#243D35] to-[#2B493F] border-2 border-[#D4AF37]/40 p-5 sm:p-6 text-white shadow-md hover:shadow-xl transition-all">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-[#D4AF37]/10 blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3D997] text-[10.5px] font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F3D997]" />
                Smart Tourist Shield
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Live Scam Radar Active
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Fair Price & Scam Engine</span>
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </h2>

            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Never get overcharged. Check crowd-verified fair rates for auto rickshaws, prepaid airport cabs, hotel tariffs, and local markets.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#F3D997]/90 font-medium">
              <span className="flex items-center gap-1">✓ Auto & Taxi Rate Benchmark</span>
              <span className="flex items-center gap-1">✓ Fake Guide Radar</span>
              <span className="flex items-center gap-1">✓ Hotel Overcharging Alerts</span>
            </div>
          </div>

          <div className="shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => handleAction('fairprice')}
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-[#183E35] font-black text-xs flex items-center gap-1.5 hover:bg-[#F3D997] transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#183E35]" />
              <span>Check Fair Prices & Scams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#183E35] text-white shadow-sm scale-[1.02]'
                  : 'bg-white text-[#665E55] border border-[#E8E2D9] hover:bg-[#FAF8F5] hover:text-[#191715]'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#EAE5DC] text-[#665E55]'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Structured Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {filteredFeatures.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleAction(item.id)}
              className={`relative bg-white rounded-2xl p-4 sm:p-5 text-left border border-[#E8E2D9] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:scale-[1.01] active:scale-[0.99] ${item.borderHover}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${item.gradient} blur-xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tagBg}`}>
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base font-black text-[#1F1C18] group-hover:text-[#C84B31] transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-[#665E55] mt-1.5 leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0EBE3] flex items-center justify-between text-xs">
                {item.highlight ? (
                  <span className="text-[11px] font-medium text-[#8C827A] truncate max-w-[200px] sm:max-w-[240px]">
                    {item.highlight}
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-1 font-bold text-[#183E35] group-hover:text-[#C84B31] transition-colors shrink-0">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
