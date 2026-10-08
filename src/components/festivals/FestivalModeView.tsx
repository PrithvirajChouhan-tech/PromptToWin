import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronDown,
  Star,
  Users,
  Camera,
  ShieldCheck,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  Flame,
  Award,
  Filter
} from 'lucide-react';

interface FestivalModeViewProps {
  onViewFullFestivals: () => void;
}

interface CelebrationPlace {
  city: string;
  state: string;
  famousFor: string;
  imageUrl: string;
  rating: string;
  crowdLevel: 'peaceful' | 'medium' | 'high' | 'extreme';
  highlightTag: string;
}

interface UpcomingFestival {
  id: string;
  name: string;
  shortName: string;
  date: string;
  startDate: string;
  season: 'Autumn' | 'Winter' | 'Spring';
  category: 'dance' | 'lights' | 'spiritual' | 'folk';
  icon: string;
  description: string;
  tagline: string;
  celebrationPlaces: CelebrationPlace[];
  etiquetteTip: string;
  photoTip: string;
  prasadTip: string;
  gradient: string;
  themeColor: string;
  accentBadge: string;
}

const UPCOMING_FESTIVALS: UpcomingFestival[] = [
  {
    id: 'navratri-durga-puja',
    name: 'Navratri & Durga Puja',
    shortName: 'Navratri',
    date: '02 Oct – 11 Oct 2026',
    startDate: '2026-10-02',
    season: 'Autumn',
    category: 'dance',
    icon: '🪔',
    tagline: 'Nine nights of devotion, traditional dance & UNESCO-honored pandal art',
    description: 'India\'s most vibrant festival celebrating the divine feminine. From all-night Dandiya and Garba raas in Gujarat to awe-inspiring mega-art installations across Kolkata.',
    celebrationPlaces: [
      {
        city: 'Kolkata',
        state: 'West Bengal',
        famousFor: 'UNESCO-recognized Durga Puja pandals with 4,000+ public art pavilions across the city',
        imageUrl: 'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?auto=format&fit=crop&w=800&q=80',
        rating: '4.9',
        crowdLevel: 'extreme',
        highlightTag: 'UNESCO Heritage Art'
      },
      {
        city: 'Ahmedabad',
        state: 'Gujarat',
        famousFor: 'Largest open-air Garba dance festival with 50,000+ dancers nightly at GMDC Ground',
        imageUrl: 'https://images.unsplash.com/photo-1567591414240-e9c1e839850c?auto=format&fit=crop&w=800&q=80',
        rating: '4.8',
        crowdLevel: 'extreme',
        highlightTag: 'Mega Garba Raas'
      },
      {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        famousFor: 'Ramnagar Ramlila folk drama and evening Ganga Aarti during festive fortnight',
        imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
        rating: '4.7',
        crowdLevel: 'high',
        highlightTag: 'Historic Ramlila'
      }
    ],
    etiquetteTip: 'Remove shoes before entering sanctum pandals. Dress modestly covering shoulders and knees.',
    photoTip: 'Best photography during golden blue-hour illumination (6:30 PM - 8:30 PM). Avoid flash near the deity idols.',
    prasadTip: 'Receive bhog/prasad with cupped right hand or both hands together as a sign of reverence.',
    gradient: 'from-[#FF6F59] to-[#C84B31]',
    themeColor: '#FF6F59',
    accentBadge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    id: 'dussehra-vijayadashami',
    name: 'Dussehra (Vijayadashami)',
    shortName: 'Dussehra',
    date: '11 Oct 2026',
    startDate: '2026-10-11',
    season: 'Autumn',
    category: 'spiritual',
    icon: '🏹',
    tagline: 'The triumph of righteousness — burning of colossal Ravana effigies & royal processions',
    description: 'Marks Lord Rama\'s victory over Ravana and Goddess Durga\'s triumph over Mahishasura. Celebrated with theatrical fire-effigies in North India and royal parades in Mysore.',
    celebrationPlaces: [
      {
        city: 'Delhi',
        state: 'NCR',
        famousFor: 'Ramlila Maidan: 75-foot tall Ravana effigies set ablaze with millions in attendance',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
        rating: '4.7',
        crowdLevel: 'extreme',
        highlightTag: 'Towering Effigy Fire'
      },
      {
        city: 'Mysuru (Mysore)',
        state: 'Karnataka',
        famousFor: 'Royal Dasara palace illumination with 100,000 bulbs and decorated elephant procession',
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        rating: '4.9',
        crowdLevel: 'high',
        highlightTag: 'Royal Heritage Parade'
      },
      {
        city: 'Kullu',
        state: 'Himachal Pradesh',
        famousFor: 'Week-long Himalayan Dussehra assembly bringing 200+ local village deities into the valley',
        imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
        rating: '4.8',
        crowdLevel: 'medium',
        highlightTag: 'Himalayan Deity Gathering'
      }
    ],
    etiquetteTip: 'Arrive at grounds at least 2 hours before sundown. Maintain safety distance from fireworks and firezones.',
    photoTip: 'Use continuous burst mode and high shutter speed (1/500s) to freeze sparks as the effigy ignites.',
    prasadTip: 'Traditional sweets include Jalebi and Fafda in the West, and Mysore Pak in the South.',
    gradient: 'from-[#DC2626] to-[#B91C1C]',
    themeColor: '#DC2626',
    accentBadge: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    id: 'diwali-festival-lights',
    name: 'Diwali (Deepavali)',
    shortName: 'Diwali',
    date: '08 Nov 2026',
    startDate: '2026-11-08',
    season: 'Autumn',
    category: 'lights',
    icon: '✨',
    tagline: 'The grand Festival of Lights — millions of clay earthen lamps illuminate homes and rivers',
    description: 'Pan-Indian festival celebrating the triumph of light over darkness and knowledge over ignorance. Temples, heritage havelis, and holy ghats glow in dazzling golden light.',
    celebrationPlaces: [
      {
        city: 'Jaipur',
        state: 'Rajasthan',
        famousFor: 'UNESCO Walled City architectural illuminations, Nahargarh panoramic views, and bazaar lighting competitions',
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        rating: '4.9',
        crowdLevel: 'high',
        highlightTag: 'Pink City Illumination'
      },
      {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        famousFor: 'Millions of terracotta diyas floating on the sacred Ganga across all 84 historic stone ghats',
        imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
        rating: '5.0',
        crowdLevel: 'extreme',
        highlightTag: 'Holy Ghat Floating Lamps'
      },
      {
        city: 'Amritsar',
        state: 'Punjab',
        famousFor: 'Bandi Chhor Divas at the Golden Temple with spectacular sarovar reflections and community langar',
        imageUrl: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=800&q=80',
        rating: '4.9',
        crowdLevel: 'high',
        highlightTag: 'Golden Temple Splendor'
      }
    ],
    etiquetteTip: 'Accept festive sweets (mithai) gracefully. Avoid loud synthetic firecrackers in residential or heritage zones.',
    photoTip: 'Twilight (blue hour) offers the best dynamic range between natural sky gradients and burning earthen lamps.',
    prasadTip: 'Share Kaju Katli, Besan Ladoo, and dry fruits with hosts and neighborhood locals.',
    gradient: 'from-[#F59E0B] to-[#D97706]',
    themeColor: '#F59E0B',
    accentBadge: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'pushkar-camel-fair',
    name: 'Pushkar Camel Fair',
    shortName: 'Pushkar Mela',
    date: '18 Nov – 24 Nov 2026',
    startDate: '2026-11-18',
    season: 'Winter',
    category: 'folk',
    icon: '🐫',
    tagline: 'World\'s premier desert carnival & livestock spectacle on holy Pushkar Lake',
    description: 'Over 50,000 camels, horses, and cattle gather alongside desert folk musicians, Rajasthani dancers, Ferris wheels, and sacred Kartik Purnima lake dips.',
    celebrationPlaces: [
      {
        city: 'Pushkar',
        state: 'Rajasthan',
        famousFor: 'Expansive desert dunes, camel beauty contests, mustache competitions, and hot air ballooning',
        imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        rating: '4.8',
        crowdLevel: 'high',
        highlightTag: 'Thar Desert Carnival'
      }
    ],
    etiquetteTip: 'Seek polite consent before photographing camel owners up close. Wear comfortable dust-proof footwear.',
    photoTip: 'Dawn sunrise shoots in the Thar dunes provide stunning silhouettes with camel caravans.',
    prasadTip: 'Try traditional Pushkar Malpua and rabri from Halwai Gali near Brahma Temple.',
    gradient: 'from-[#EA580C] to-[#C2410C]',
    themeColor: '#EA580C',
    accentBadge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    id: 'holi-festival-colors',
    name: 'Holi (Festival of Colors)',
    shortName: 'Holi',
    date: '03 Mar 2027',
    startDate: '2027-03-03',
    season: 'Spring',
    category: 'dance',
    icon: '🎨',
    tagline: 'A kaleidoscope of organic gulal powder, devotional song & joyous community unity',
    description: 'India\'s joyful welcoming of spring. Communities gather to play with vibrant organic powders and flower petals, dissolving barriers in music and shared sweet treats.',
    celebrationPlaces: [
      {
        city: 'Mathura & Vrindavan',
        state: 'Uttar Pradesh',
        famousFor: 'Legendary Braj celebrations including Barsana Lathmar Holi and Banke Bihari flower showers',
        imageUrl: 'https://images.unsplash.com/photo-1583244972934-8c887467776b?auto=format&fit=crop&w=800&q=80',
        rating: '4.9',
        crowdLevel: 'extreme',
        highlightTag: 'Braj Heritage Holi'
      },
      {
        city: 'Jaipur',
        state: 'Rajasthan',
        famousFor: 'Royal City Palace courtyards, heritage hotel musical bashes, and folk Gair dancers',
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        rating: '4.7',
        crowdLevel: 'high',
        highlightTag: 'Royal Courtyard Holi'
      }
    ],
    etiquetteTip: 'Use skin-safe herbal gulal. Protect eyes and apply coconut oil or moisturizer on skin before venturing out.',
    photoTip: 'Wrap camera bodies in waterproof ziplock shields with UV filter protectors against color powder.',
    prasadTip: 'Enjoy freshly prepared Gujiya (crispy sweet dumplings filled with khoya and nuts) and chilled Thandai.',
    gradient: 'from-[#EC4899] to-[#8B5CF6]',
    themeColor: '#EC4899',
    accentBadge: 'bg-pink-50 text-pink-700 border-pink-200'
  }
];

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const getCrowdBadgeInfo = (level: string) => {
  switch (level) {
    case 'extreme':
      return { label: 'High Density / Huge Crowd', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'high':
      return { label: 'Lively / Busy', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'medium':
      return { label: 'Moderate Flow', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    default:
      return { label: 'Peaceful / Calm', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
};

export const FestivalModeView: React.FC<FestivalModeViewProps> = ({ onViewFullFestivals }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFestivalId, setExpandedFestivalId] = useState<string>(UPCOMING_FESTIVALS[0].id);

  // Compute days until and sort
  const festivalsWithDays = useMemo(() => {
    return UPCOMING_FESTIVALS.map(fest => ({
      ...fest,
      daysUntil: getDaysUntil(fest.startDate)
    })).sort((a, b) => a.daysUntil - b.daysUntil);
  }, []);

  const closestFestival = festivalsWithDays[0];

  // Filter based on category and search query
  const filteredFestivals = useMemo(() => {
    return festivalsWithDays.filter(fest => {
      const matchesCategory =
        selectedCategory === 'all' ||
        fest.category === selectedCategory ||
        fest.season.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        fest.name.toLowerCase().includes(query) ||
        fest.shortName.toLowerCase().includes(query) ||
        fest.tagline.toLowerCase().includes(query) ||
        fest.celebrationPlaces.some(p => p.city.toLowerCase().includes(query) || p.state.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [festivalsWithDays, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Hero Spotlight: Next Immediate Celebration */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F1C18] via-[#2A2421] to-[#1F1C18] text-white border border-[#3E3832] shadow-xl">
        {/* Subtle Decorative Backdrop Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF6F59]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-[#C84B31]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#FF6F59] text-white shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Featured Cultural Event
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/15 backdrop-blur-xs">
                {closestFestival.daysUntil === 0 ? '✨ Happening Today!' : `⏳ In ${closestFestival.daysUntil} Days`}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white/70 bg-white/5 border border-white/10">
                {closestFestival.season} Season
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{closestFestival.icon}</span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {closestFestival.name}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-white/80 mt-1 font-medium leading-relaxed">
                {closestFestival.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/70 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF6F59]" />
                <span>{closestFestival.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF6F59]" />
                <span>Major Hubs: {closestFestival.celebrationPlaces.map(p => p.city).join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setExpandedFestivalId(closestFestival.id)}
              className="px-5 py-3 rounded-2xl bg-[#FF6F59] hover:bg-[#E85B46] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>Explore Celebration Hubs</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={onViewFullFestivals}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              <span>All 30+ Pan-India Festivals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Systematic Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Festivals' },
              { id: 'dance', label: 'Dance & Music' },
              { id: 'lights', label: 'Lights & Illuminations' },
              { id: 'spiritual', label: 'Sacred Rituals' },
              { id: 'folk', label: 'Desert & Folk Melas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? 'bg-[#1F1C18] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#665E55] hover:text-[#1F1C18] hover:bg-[#F2ECE3] border border-[#EAE5DC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#9C948B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search festival or city..."
              className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1F1C18] placeholder-[#9C948B] focus:outline-none focus:border-[#C84B31]"
            />
          </div>
        </div>
      </div>

      {/* 3. Systematic Festival Cards List */}
      <div className="space-y-5">
        {filteredFestivals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE5DC]">
            <p className="text-sm font-bold text-[#665E55]">No festivals matched your filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-bold text-[#C84B31] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredFestivals.map((festival, index) => {
            const isExpanded = expandedFestivalId === festival.id;
            return (
              <div
                key={festival.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  isExpanded ? 'border-[#C84B31]/40 ring-2 ring-[#C84B31]/10 shadow-sm' : 'border-[#EAE5DC] hover:border-[#1F1C18]/20'
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => setExpandedFestivalId(isExpanded ? '' : festival.id)}
                  className="p-5 sm:p-6 cursor-pointer flex items-start sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/60 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                      {festival.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-[#1F1C18]">
                          {festival.name}
                        </h3>
                        {index === 0 && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Upcoming Next
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#C84B31] border border-orange-200">
                          {festival.daysUntil === 0 ? 'Today!' : `${festival.daysUntil} Days Away`}
                        </span>
                        <span className="text-[10px] font-semibold text-[#8C827A] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE5DC]">
                          {festival.season}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-[#665E55]">
                        <Calendar className="w-3.5 h-3.5 text-[#C84B31]" />
                        <span>{festival.date}</span>
                      </div>

                      <p className="text-xs text-[#665E55] line-clamp-1 max-w-2xl font-normal">
                        {festival.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className={`p-2 rounded-xl border border-[#EAE5DC] text-[#665E55] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 bg-[#FAF8F5] text-[#1F1C18]' : ''
                      }`}
                      aria-label="Toggle details"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Section */}
                {isExpanded && (
                  <div className="border-t border-[#EAE5DC] bg-[#FAF8F5]/40 p-5 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Cultural Significance Paragraph */}
                    <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC]">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#1F1C18] mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
                        Cultural Significance
                      </h4>
                      <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                        {festival.description}
                      </p>
                    </div>

                    {/* Celebration Hubs Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1F1C18] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C84B31]" />
                          Premier Celebration Hubs
                        </h4>
                        <span className="text-[11px] font-semibold text-[#8C827A]">
                          {festival.celebrationPlaces.length} Destinations
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {festival.celebrationPlaces.map((place, pIdx) => {
                          const crowdBadge = getCrowdBadgeInfo(place.crowdLevel);
                          return (
                            <div
                              key={pIdx}
                              className="bg-white rounded-2xl border border-[#EAE5DC] overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                            >
                              <div className="relative h-40 w-full overflow-hidden">
                                <img
                                  src={place.imageUrl}
                                  alt={`${festival.name} in ${place.city}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-xs ${crowdBadge.bg}`}>
                                    {crowdBadge.label}
                                  </span>
                                </div>

                                <div className="absolute top-2.5 right-2.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-amber-700 flex items-center gap-0.5 shadow-2xs">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    {place.rating}
                                  </span>
                                </div>

                                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                                  <div className="text-sm font-black flex items-center justify-between">
                                    <span>{place.city}</span>
                                    <span className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-xs">
                                      {place.state}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C84B31]">
                                    {place.highlightTag}
                                  </div>
                                  <p className="text-xs text-[#524B44] leading-relaxed">
                                    {place.famousFor}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cultural Etiquette, Photography & Prasad Guidelines */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] space-y-1.5 shadow-2xs">
                        <div className="text-xs font-bold text-[#1F1C18] flex items-center gap-1.5 uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Etiquette & Dress Code
                        </div>
                        <p className="text-xs text-[#524B44] leading-relaxed">
                          {festival.etiquetteTip}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] space-y-1.5 shadow-2xs">
                        <div className="text-xs font-bold text-[#1F1C18] flex items-center gap-1.5 uppercase tracking-wider">
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          Photography Guidelines
                        </div>
                        <p className="text-xs text-[#524B44] leading-relaxed">
                          {festival.photoTip}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] space-y-1.5 shadow-2xs">
                        <div className="text-xs font-bold text-[#1F1C18] flex items-center gap-1.5 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Prasad & Culinary Treats
                        </div>
                        <p className="text-xs text-[#524B44] leading-relaxed">
                          {festival.prasadTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Bottom Action Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] text-center space-y-2 shadow-2xs">
        <h4 className="text-sm font-bold text-[#1F1C18]">
          Planning a festival pilgrimage or heritage journey?
        </h4>
        <p className="text-xs text-[#665E55] max-w-xl mx-auto">
          Explore complete festive schedules, verified crowd forecasts, accommodation guides, and local temple contacts.
        </p>
        <button
          onClick={onViewFullFestivals}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F1C18] hover:bg-[#332E2A] text-white text-xs font-bold transition-all cursor-pointer shadow-xs mt-1"
        >
          <span>Open Full Cultural Festivals Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export function getClosestFestivalTheme() {
  const sorted = UPCOMING_FESTIVALS
    .map(f => ({ ...f, daysUntil: getDaysUntil(f.startDate) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
  const closest = sorted[0];
  return {
    gradient: closest.gradient,
    icon: closest.icon,
    name: closest.shortName,
    fullName: closest.name,
    daysUntil: closest.daysUntil,
    date: closest.date,
    tagline: closest.tagline,
    season: closest.season,
    accentBg: 'bg-orange-50',
    accentText: 'text-[#C84B31]',
    accentBorder: 'border-orange-200',
    motif: closest.icon,
  };
}
