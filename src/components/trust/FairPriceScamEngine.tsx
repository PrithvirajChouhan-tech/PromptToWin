import { mutate } from "../../services/journey";
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  ThumbsUp, 
  ThumbsDown, 
  Plus, 
  Search, 
  Building2, 
  Car, 
  Utensils, 
  ShoppingBag, 
  UserCheck, 
  Ticket, 
  CheckCircle2, 
  Calendar, 
  Star, 
  Compass, 
  Sparkles,
  Info,
  MapPin,
  X,
  Lock,
  ArrowRight,
  ArrowLeft,
  Filter,
  Flame,
  MessageCircle,
  BedDouble,
  Landmark
} from 'lucide-react';
import { 
  PriceReport, 
  PriceCategory, 
  ScamAlert, 
  VerifiedHotel, 
  FairPriceCategorySummary 
} from '../../types/trustEngine';
import { 
  INITIAL_PRICE_REPORTS, 
  INITIAL_SCAM_ALERTS, 
  VERIFIED_HOTELS, 
  FAIR_PRICE_SUMMARIES,
  calculateMedianAndOutliers 
} from '../../data/trustEngineData';
import { MainNavTab } from '../BottomNavBar';
import { DayPlan, ItineraryCategory, Trip } from '../../types/travel';

interface FairPriceScamEngineProps {
  externalSearch?: string;
  accessibilityMode?: boolean;
  onOpenSOS?: () => void;
  onSelectTab?: (tab: MainNavTab) => void;
  currentTrip: Trip;
  currentDay: DayPlan;
  currentLocationName: string;
  onBack?: () => void;
}

export const FairPriceScamEngine: React.FC<FairPriceScamEngineProps> = ({
  externalSearch,
  accessibilityMode = false,
  onOpenSOS,
  onSelectTab,
  currentTrip,
  currentDay,
  currentLocationName,
  onBack,
}) => {
  const [subTab, setSubTab] = useState<'nearby' | 'prices' | 'scams' | 'hotels'>('nearby');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  React.useEffect(()=>{if(externalSearch!==undefined)setSearchQuery(externalSearch);},[externalSearch]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  
  // Dynamic State for community reports
  const [priceReports, setPriceReports] = useState<PriceReport[]>(() => {
    try {
      const saved = localStorage.getItem('sih_price_reports');
      return saved ? JSON.parse(saved) : INITIAL_PRICE_REPORTS;
    } catch {
      return INITIAL_PRICE_REPORTS;
    }
  });

  const [scamAlerts, setScamAlerts] = useState<ScamAlert[]>(() => {
    try {
      const saved = localStorage.getItem('sih_scam_alerts');
      return saved ? JSON.parse(saved) : INITIAL_SCAM_ALERTS;
    } catch {
      return INITIAL_SCAM_ALERTS;
    }
  });

  // Modal States
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
  const [isAddScamOpen, setIsAddScamOpen] = useState(false);
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<VerifiedHotel | null>(null);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Price Report Form State
  const [newPriceTitle, setNewPriceTitle] = useState('');
  const [newPriceCategory, setNewPriceCategory] = useState<PriceCategory>('transport');
  const [newPriceCity, setNewPriceCity] = useState('Delhi');
  const [newPriceLocation, setNewPriceLocation] = useState('');
  const [newPriceAmount, setNewPriceAmount] = useState('');
  const [newPriceVendor, setNewPriceVendor] = useState('');
  const [newPriceNotes, setNewPriceNotes] = useState('');

  // New Scam Report Form State
  const [newScamTitle, setNewScamTitle] = useState('');
  const [newScamCategory, setNewScamCategory] = useState<any>('overcharging');
  const [newScamCity, setNewScamCity] = useState('Delhi');
  const [newScamLocation, setNewScamLocation] = useState('');
  const [newScamSeverity, setNewScamSeverity] = useState<'high' | 'medium' | 'low'>('high');
  const [newScamDescription, setNewScamDescription] = useState('');
  const [newScamHowToAvoid, setNewScamHowToAvoid] = useState('');

  const nearbyCity = useMemo(() => {
    const source = `${currentLocationName} ${currentDay.city}`.toLowerCase();
    if (source.includes('agra')) return 'Agra';
    if (source.includes('jaipur')) return 'Jaipur';
    if (source.includes('varanasi')) return 'Varanasi';
    return 'Delhi';
  }, [currentLocationName, currentDay.city]);

  const itineraryPriceCategory = (category: ItineraryCategory): PriceCategory | null => {
    if (category === 'transit') return 'transport';
    if (category === 'culinary') return 'food';
    if (category === 'cultural_sight') return 'monument_ticket';
    if (category === 'cultural_buy') return 'handicraft';
    if (category === 'festival') return 'activity';
    if (category === 'stay') return 'hotel';
    return null;
  };

  const nearbyEssentials = useMemo(() => {
    const defaults: Array<{ category: PriceCategory; label: string; detail: string; range: [number, number]; unit: string; icon: typeof Car }> = [
      { category: 'transport', label: 'Transit', detail: 'Metro, auto & cab', range: [30, 180], unit: 'local trip', icon: Car },
      { category: 'hotel', label: 'Stay', detail: 'Verified room', range: [1800, 3800], unit: 'room / night', icon: BedDouble },
      { category: 'food', label: 'Food', detail: 'Meal & drinking water', range: [120, 550], unit: 'per person', icon: Utensils },
      { category: 'monument_ticket', label: 'Tickets', detail: 'Official monument entry', range: [50, 650], unit: 'per person', icon: Landmark },
      { category: 'guide', label: 'Guide', detail: 'Licensed half-day guide', range: [1200, 1800], unit: 'up to 5 people', icon: UserCheck },
      { category: 'handicraft', label: 'Shopping', detail: 'Authentic local craft', range: [350, 2500], unit: 'typical purchase', icon: ShoppingBag },
      { category: 'activity', label: 'Activities', detail: 'Local experience', range: [250, 1200], unit: 'per person', icon: Compass },
    ];

    return defaults.map((essential) => {
      const linkedStop = currentDay.items.find(item => itineraryPriceCategory(item.category) === essential.category);
      const nearbyHotel = essential.category === 'hotel'
        ? VERIFIED_HOTELS.find(hotel => hotel.city.toLowerCase().includes(nearbyCity.toLowerCase()))
        : undefined;
      const basePrice = linkedStop?.cost || nearbyHotel?.directPricePerNight;
      const range: [number, number] = basePrice && basePrice > 0
        ? [Math.max(1, Math.round(basePrice * 0.85)), Math.round(basePrice * 1.15)]
        : essential.range;

      return { ...essential, range, linkedStop, nearbyHotel };
    });
  }, [currentDay.items, nearbyCity]);

  const nearbyReviews = useMemo(() => {
    const reviewers = ['Aarav M.', 'Elena R.', 'Priya S.', 'Marcus W.', 'Devika N.'];
    return currentDay.items.slice(0, 5).map((item, index) => ({
      id: item.id,
      title: item.title,
      location: item.location,
      rating: item.rating || 4.7,
      reviewsCount: item.reviewsCount || 24,
      author: reviewers[index % reviewers.length],
      quote: item.touristTip || item.description,
      category: item.category,
    }));
  }, [currentDay.items]);

  React.useEffect(() => {
    setSelectedCity(nearbyCity);
  }, [nearbyCity]);

  // Persist to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('sih_price_reports', JSON.stringify(priceReports));
    } catch (e) {
      console.error(e);
    }
  }, [priceReports]);

  React.useEffect(() => {
    try {
      localStorage.setItem('sih_scam_alerts', JSON.stringify(scamAlerts));
    } catch (e) {
      console.error(e);
    }
  }, [scamAlerts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Upvote / Downvote Price Report
  const handleVotePrice = (id: string, type: 'up' | 'down') => {
    const key='yatra-sample-vote-price-'+id;if(localStorage.getItem(key)){showToast('You already voted on this sample report.');return;}localStorage.setItem(key,type);
    setPriceReports(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          upvotes: type === 'up' ? item.upvotes + 1 : item.upvotes,
          downvotes: type === 'down' ? item.downvotes + 1 : item.downvotes
        };
      }
      return item;
    }));
    showToast(type === 'up' ? 'Upvoted price report' : 'Downvoted price report');
  };

  // Upvote Scam Alert
  const handleVoteScam = (id: string) => {
    const key='yatra-sample-vote-scam-'+id;if(localStorage.getItem(key)){showToast('You already confirmed this sample alert.');return;}localStorage.setItem(key,'confirmed');
    setScamAlerts(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, upvotes: item.upvotes + 1 };
      }
      return item;
    }));
    showToast('Confirmed scam report! Thank you for protecting tourists.');
  };

  // Submit Price Report
  const handleSubmitPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(newPriceAmount);
    if (!newPriceTitle || isNaN(cost)) return;

    // Detect if this is an outlier based on category sample
    const categorySample = priceReports
      .filter(p => p.category === newPriceCategory)
      .map(p => p.pricePaid);
    
    let isOutlier = false;
    let outlierReason = '';
    
    if (categorySample.length > 0) {
      const stats = calculateMedianAndOutliers([...categorySample, cost]);
      if (cost > stats.outlierThreshold) {
        isOutlier = true;
        outlierReason = `Flagged: ${Math.round(((cost - stats.median) / stats.median) * 100)}% above category median (₹${stats.median})`;
      }
    }

    const newReport: PriceReport = {
      id: `pr-${Date.now()}`,
      itemTitle: newPriceTitle,
      category: newPriceCategory,
      city: newPriceCity,
      location: newPriceLocation || `${newPriceCity} Area`,
      pricePaid: cost,
      fairPriceRange: [Math.round(cost * 0.8), Math.round(cost * 1.15)],
      isOutlier,
      outlierReason,
      vendorName: newPriceVendor || 'Independent Vendor',
      reportedDate: 'Just now',
      upvotes: 1,
      downvotes: 0,
      reporterName: 'You (Community Contributor)',
      isVerifiedBuyer: false,
      notes: newPriceNotes
    };

    try{await mutate('/contributions',{kind:'price',place:`${newPriceTitle} · ${newPriceCity}`,text:newPriceNotes||`Paid ₹${cost} for ${newPriceTitle} in ${newPriceCity}.`,amount:cost});}catch(error){showToast(error.message);return;}
    setPriceReports([newReport, ...priceReports]);
    setIsAddPriceOpen(false);
    // Reset form
    setNewPriceTitle('');
    setNewPriceAmount('');
    setNewPriceLocation('');
    setNewPriceVendor('');
    setNewPriceNotes('');

    showToast(isOutlier ? 'Report submitted! Flagged as outlier for community verification.' : 'Price report published for community review.');
  };

  // Submit Scam Report
  const handleSubmitScam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScamTitle || !newScamDescription) return;

    const newScam: ScamAlert = {
      id: `scam-${Date.now()}`,
      title: newScamTitle,
      scamCategory: newScamCategory,
      city: newScamCity,
      location: newScamLocation || `${newScamCity} Tourist Area`,
      severity: newScamSeverity,
      description: newScamDescription,
      howToAvoid: newScamHowToAvoid || 'Book only through verified kiosks or official tourist booths.',
      reportedDate: 'Just now',
      upvotes: 1,
      author: 'You (Community Contributor)',
      status: 'under_police_review'
    };

    try{await mutate('/contributions',{kind:'scam',place:newScamLocation||newScamCity,text:newScamDescription});}catch(error){showToast(error.message);return;}
    setScamAlerts([newScam, ...scamAlerts]);
    setIsAddScamOpen(false);
    // Reset
    setNewScamTitle('');
    setNewScamLocation('');
    setNewScamDescription('');
    setNewScamHowToAvoid('');

    showToast('Report saved to the shared community. No police service has been contacted.');
  };

  // Filtered Price Reports
  const filteredPrices = useMemo(() => {
    return priceReports.filter(report => {
      const matchCat = selectedCategory === 'all' || report.category === selectedCategory;
      const matchCity = selectedCity === 'all' || report.city.toLowerCase().includes(selectedCity.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        report.itemTitle.toLowerCase().includes(q) ||
        report.location.toLowerCase().includes(q) ||
        (report.notes && report.notes.toLowerCase().includes(q)) ||
        (report.vendorName && report.vendorName.toLowerCase().includes(q));
      return matchCat && matchCity && matchSearch;
    });
  }, [priceReports, selectedCategory, selectedCity, searchQuery]);

  // Filtered Scam Alerts
  const filteredScams = useMemo(() => {
    return scamAlerts.filter(scam => {
      const matchCity = selectedCity === 'all' || scam.city.toLowerCase().includes(selectedCity.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        scam.title.toLowerCase().includes(q) ||
        scam.location.toLowerCase().includes(q) ||
        scam.description.toLowerCase().includes(q) ||
        scam.howToAvoid.toLowerCase().includes(q);
      return matchCity && matchSearch;
    });
  }, [scamAlerts, selectedCity, searchQuery]);

  // Filtered Hotels
  const filteredHotels = useMemo(() => {
    return VERIFIED_HOTELS.filter(hotel => {
      const matchCity = selectedCity === 'all' || hotel.city.toLowerCase().includes(selectedCity.toLowerCase());
      const matchAccessibility = !accessibilityMode || hotel.wheelchairAccessible;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        hotel.name.toLowerCase().includes(q) ||
        hotel.neighborhood.toLowerCase().includes(q) ||
        hotel.description.toLowerCase().includes(q);
      return matchCity && matchAccessibility && matchSearch;
    });
  }, [selectedCity, accessibilityMode, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5] shadow-xs cursor-pointer transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Explore</span>
        </button>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-[#FFF7F4] via-[#FAF8F5] to-[#FFF2EE] rounded-3xl p-5 sm:p-7 border border-[#FED7CC] shadow-xs relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6F59]/10 text-[#FF6F59] text-xs font-bold uppercase tracking-wider mb-3">
            <MessageCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Community • Reviews, fair prices & local trust</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1C18] tracking-tight leading-tight">
            Know what’s trusted and <span className="text-[#FF6F59]">fairly priced</span> around you
          </h1>

          <p className="text-sm sm:text-base text-[#5A524C] mt-2 leading-relaxed">
            See traveler feedback for stops in your itinerary, compare fair prices by category, and report misleading quotes before they affect someone else.
          </p>

          <div className="mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-white/85 border border-[#FED7CC] px-3.5 py-2 text-xs text-[#5A524C]">
            <MapPin className="w-3.5 h-3.5 text-[#FF6F59]" />
            <span><strong className="text-[#1F1C18]">Around {currentLocationName}</strong> · {nearbyCity}</span>
            <span className="text-[#C9C1B7]">•</span>
            <span>{currentTrip.title} · Day {currentDay.dayNumber}</span>
          </div>

          {/* Keeps the original anti-overcharging logic visible but secondary to local context. */}
          <div className="mt-4 bg-white rounded-2xl p-3.5 border border-[#EAE5DC] shadow-2xs">
            <div className="text-xs font-bold text-[#1F1C18] flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
              <span>Community price check</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#8C827A]">When travelers report:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F1EB] font-mono text-[#1F1C18]">₹320</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F1EB] font-mono text-[#1F1C18]">₹350</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F1EB] font-mono text-[#1F1C18]">₹380</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F1EB] font-mono text-[#1F1C18]">₹400</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FEE2E2] text-[#B91C1C] font-mono font-bold line-through">₹850</span>
              <span className="text-[#10B981] font-bold">→ Fair Range: ₹320–₹400</span>
              <span className="text-[#E11D48] text-[11px] font-semibold bg-[#FFF1F2] px-2 py-0.5 rounded-md">
                ⚠️ ₹850 Flagged as Overcharging Outlier
              </span>
            </div>
          </div>

          {/* Sub-navigation groups nearby context, detailed prices, safety and stays. */}
          <div className="flex flex-wrap items-stretch gap-2 mt-5 pt-3 pb-1 border-t border-[#F0ECE4]">
            <button
              id="subtab-nearby-btn"
              onClick={() => setSubTab('nearby')}
              className={`px-4 py-2 min-h-11 max-w-full shrink-0 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'nearby'
                  ? 'bg-[#1F1C18] text-white shadow-sm'
                  : 'bg-white text-[#5A524C] hover:bg-[#F8F6F2] border border-[#EAE5DC]'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Nearby for today</span>
            </button>
            <button
              id="subtab-prices-btn"
              onClick={() => setSubTab('prices')}
              className={`px-4 py-2 min-h-11 max-w-full shrink-0 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'prices'
                  ? 'bg-[#FF6F59] text-white shadow-sm shadow-[#FF6F59]/25'
                  : 'bg-white text-[#5A524C] hover:bg-[#F8F6F2] border border-[#EAE5DC]'
              }`}
            >
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span>All fair prices</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {priceReports.length}
              </span>
            </button>

            <button
              id="subtab-scams-btn"
              onClick={() => setSubTab('scams')}
              className={`px-4 py-2 min-h-11 max-w-full shrink-0 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'scams'
                  ? 'bg-[#E11D48] text-white shadow-sm shadow-[#E11D48]/25'
                  : 'bg-white text-[#5A524C] hover:bg-[#F8F6F2] border border-[#EAE5DC]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Scam & Tout Alerts</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {scamAlerts.length}
              </span>
            </button>

            <button
              id="subtab-hotels-btn"
              onClick={() => setSubTab('hotels')}
              className={`px-4 py-2 min-h-11 max-w-full shrink-0 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'hotels'
                  ? 'bg-[#FF6F59] text-white shadow-sm shadow-[#FF6F59]/25'
                  : 'bg-white text-[#5A524C] hover:bg-[#F8F6F2] border border-[#EAE5DC]'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Verified Honest Hotels</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {VERIFIED_HOTELS.length}
              </span>
            </button>

            {onSelectTab && (
              <>
                <button
                  id="subtab-guides-btn"
                  onClick={() => onSelectTab('guides')}
                  className="px-3.5 py-2 min-h-11 max-w-full shrink-0 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white text-[#5A524C] hover:bg-[#F8F6F2] hover:text-[#0F766E] border border-[#EAE5DC]"
                  title="Browse ASI-certified tourist guides"
                >
                  <UserCheck className="w-4 h-4 shrink-0 text-teal-600" />
                  <span>Verified Guides</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-extrabold">
                    ASI ✓
                  </span>
                </button>

                <button
                  id="subtab-crafts-btn"
                  onClick={() => onSelectTab('crafts')}
                  className="px-3.5 py-2 min-h-11 max-w-full shrink-0 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white text-[#5A524C] hover:bg-[#F8F6F2] hover:text-amber-800 border border-[#EAE5DC]"
                  title="Explore authentic GI artisan craft guilds"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>GI Crafts Guilds</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
                    GI Tag
                  </span>
                </button>

                <button
                  id="subtab-transit-rates-btn"
                  onClick={() => onSelectTab('transit')}
                  className="px-3.5 py-2 min-h-11 max-w-full shrink-0 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white text-[#5A524C] hover:bg-[#F8F6F2] hover:text-[#0284C7] border border-[#EAE5DC]"
                  title="Check official pre-paid auto rate cards"
                >
                  <Ticket className="w-4 h-4 shrink-0 text-[#0284C7]" />
                  <span>Auto Rate Cards</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#9C948B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="trust-engine-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={subTab === 'nearby' ? "Search today’s places, nearby reviews, or price categories..." : subTab === 'prices' ? "Search auto fares, thali, pashmina, boat rates..." : subTab === 'scams' ? "Search scams, locations, tout methods..." : "Search verified hotels in Delhi, Jaipur, Agra..."}
            className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#FF6F59]" />
          <select
            id="trust-city-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
          >
            <option value="all">All India Cities</option>
            <option value="Delhi">Delhi / NCR</option>
            <option value="Agra">Agra</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Varanasi">Varanasi</option>
          </select>
        </div>

        {/* Action Button */}
        {subTab === 'prices' && (
          <button
            id="report-price-modal-trigger"
            onClick={() => setIsAddPriceOpen(true)}
            className="px-3.5 py-2 bg-[#FF6F59] hover:bg-[#E55B46] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm shadow-[#FF6F59]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Price Paid</span>
          </button>
        )}

        {subTab === 'scams' && (
          <button
            id="report-scam-modal-trigger"
            onClick={() => setIsAddScamOpen(true)}
            className="px-3.5 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm shadow-[#E11D48]/20 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report a Scam / Tout</span>
          </button>
        )}
      </div>

      {/* TAB 1: NEARBY COMMUNITY CONTEXT */}
      {subTab === 'nearby' && (
        <div className="space-y-6">
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6F59]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fair-price guide for your day</span>
                </div>
                <h2 className="text-lg font-extrabold text-[#1F1C18] mt-1">What tourists typically pay near {nearbyCity}</h2>
                <p className="text-xs text-[#665E55] mt-1">Cards with “on your itinerary” use the stop you added today. Tap any category for community price reports.</p>
              </div>
              <span className="self-start shrink-0 px-2.5 py-1 rounded-full bg-[#FFF2EE] text-[#C84B31] text-[10px] font-extrabold uppercase tracking-wider">
                Day {currentDay.dayNumber} context
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nearbyEssentials.map((essential) => {
                const Icon = essential.icon;
                return (
                  <button
                    key={essential.category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(essential.category);
                      setSubTab('prices');
                    }}
                    className="text-left p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-white border border-[#EAE5DC] hover:border-[#FF6F59]/45 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-8 h-8 rounded-xl bg-white border border-[#EAE5DC] text-[#FF6F59] flex items-center justify-center group-hover:bg-[#FFF2EE] transition-colors">
                        <Icon className="w-4 h-4" />
                      </span>
                      {essential.linkedStop && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-[#ECFDF5] text-[#047857]">On your itinerary</span>
                      )}
                    </div>
                    <div className="mt-2.5 text-xs font-extrabold text-[#191715]">{essential.label}</div>
                    <div className="text-[10px] text-[#665E55] mt-0.5 truncate">{essential.linkedStop?.title || essential.nearbyHotel?.name || essential.detail}</div>
                    <div className="mt-2 pt-2 border-t border-[#EAE5DC]">
                      <span className="text-[10px] text-[#8C827A]">Fair range</span>
                      <span className="ml-1.5 text-sm font-black text-[#059669]">₹{essential.range[0].toLocaleString()}–₹{essential.range[1].toLocaleString()}</span>
                      <span className="block text-[10px] text-[#8C827A] mt-0.5">{essential.unit}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Traveler reviews near you</span>
                </div>
                <h2 className="text-lg font-extrabold text-[#1F1C18] mt-1">Places already in today’s itinerary</h2>
                <p className="text-xs text-[#665E55] mt-1">Community feedback for the stops you are likely to visit next.</p>
              </div>
              <span className="text-xs font-semibold text-[#665E55]">{nearbyReviews.length} nearby stops</span>
            </div>

            <div className="space-y-3">
              {nearbyReviews.map((review) => (
                <article key={review.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8C827A]">
                        <span className="font-bold uppercase tracking-wide text-[#C84B31]">{review.category.replace('_', ' ')}</span>
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {review.location}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-[#191715] mt-1">{review.title}</h3>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FFF9ED] border border-[#FDE68A] text-xs font-bold text-[#B45309]">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" /> {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A524C] mt-2 leading-relaxed line-clamp-2">“{review.quote}”</p>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#EAE5DC] text-[10px] text-[#8C827A]">
                    <span>Shared by {review.author} · verified itinerary visitor</span>
                    <span>{review.reviewsCount.toLocaleString()} reviews</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: DETAILED COMMUNITY FAIR PRICES */}
      {subTab === 'prices' && (
        <div className="space-y-6">
          
          {/* Quick Category Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FAIR_PRICE_SUMMARIES.map((summary, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-2xs hover:border-[#FF6F59]/30 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-[#8C827A] mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-[#FF6F59]">{summary.category}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF6F59]" />
                    <span>{summary.city}</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1F1C18] line-clamp-1">{summary.itemName}</h3>
                
                <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-[#F0ECE4]">
                  <div>
                    <span className="text-xs text-[#8C827A]">Fair Range: </span>
                    <span className="text-base font-extrabold text-[#10B981]">
                      ₹{summary.fairRange[0]} – ₹{summary.fairRange[1]}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#8C827A]">{summary.unit}</span>
                </div>

                <p className="mt-2 text-[11px] text-[#5A524C] bg-[#FAF8F5] p-2 rounded-xl flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-[#FF6F59] shrink-0 mt-0.5" />
                  <span>{summary.safetyTip}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[#8C827A] font-semibold shrink-0">Filter:</span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'transport', label: 'Transit & Rickshaw', icon: Car },
              { id: 'food', label: 'Food & Meals', icon: Utensils },
              { id: 'hotel', label: 'Hotel & Stays', icon: Building2 },
              { id: 'handicraft', label: 'Handicrafts & Gifts', icon: ShoppingBag },
              { id: 'guide', label: 'Licensed Guides', icon: UserCheck },
              { id: 'monument_ticket', label: 'Monument Tickets', icon: Landmark },
              { id: 'activity', label: 'Boats & Sightseeing', icon: Compass },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1F1C18] text-white shadow-2xs'
                    : 'bg-white text-[#5A524C] hover:bg-[#F8F6F2] border border-[#EAE5DC]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Price Reports Feed */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#8C827A] uppercase tracking-wider px-1">
              <span>Community Submissions ({filteredPrices.length})</span>
              <span>Weighted by Tourist Upvotes</span>
            </div>

            {filteredPrices.map((report) => (
              <div 
                key={report.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-2xs ${
                  report.isOutlier 
                    ? 'border-[#FECDD3] bg-gradient-to-r from-white to-[#FFF5F5]' 
                    : 'border-[#EAE5DC] hover:border-[#FF6F59]/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF6F59] uppercase tracking-wide">
                        {report.category}
                      </span>
                      <span className="text-xs text-[#8C827A] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF6F59]" />
                        <span>{report.location}, {report.city}</span>
                      </span>
                      {report.isVerifiedBuyer && (
                        <span className="text-[11px] font-semibold text-[#10B981] flex items-center gap-1 bg-[#ECFDF5] px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#1F1C18]">
                      {report.itemTitle}
                    </h3>

                    {report.vendorName && (
                      <p className="text-xs text-[#8C827A] mt-0.5">
                        Vendor / Provider: <span className="font-semibold text-[#5A524C]">{report.vendorName}</span>
                      </p>
                    )}

                    {report.notes && (
                      <p className="text-xs text-[#5A524C] mt-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0ECE4]">
                        "{report.notes}"
                      </p>
                    )}

                    {/* Outlier Alert Banner if flagged */}
                    {report.isOutlier && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#FEE2E2] border border-[#FECDD3] text-[#991B1B] text-xs flex items-start gap-2 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-[#E11D48] mt-0.5" />
                        <div>
                          <strong className="font-bold">Community Scam / Outlier Warning:</strong> {report.outlierReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Price & Upvote Engine */}
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F0ECE4]">
                    <div>
                      <span className="text-[11px] text-[#8C827A] block">Price Paid:</span>
                      <span className={`text-xl font-extrabold font-mono ${
                        report.isOutlier ? 'text-[#E11D48]' : 'text-[#10B981]'
                      }`}>
                        ₹{report.pricePaid.toLocaleString()}
                      </span>
                      {report.fairPriceRange && (
                        <span className="text-[11px] text-[#8C827A] block">
                          Fair: ₹{report.fairPriceRange[0]}–₹{report.fairPriceRange[1]}
                        </span>
                      )}
                    </div>

                    {/* Upvote / Downvote Buttons */}
                    <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE5DC]">
                      <button
                        onClick={() => handleVotePrice(report.id, 'up')}
                        className="px-2 py-1 rounded-lg hover:bg-white text-xs font-bold text-[#5A524C] hover:text-[#10B981] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Confirm this price"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{report.upvotes}</span>
                      </button>
                      <button
                        onClick={() => handleVotePrice(report.id, 'down')}
                        className="px-2 py-1 rounded-lg hover:bg-white text-xs font-bold text-[#5A524C] hover:text-[#E11D48] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Flag inaccurate price"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{report.downvotes}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: SCAM & TOUT ALERTS */}
      {subTab === 'scams' && (
        <div className="space-y-4">
          <div className="bg-[#FFF1F2] rounded-2xl p-4 border border-[#FECDD3] flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#9F1239]">
                Live Tourist Scam Warning Desk (Tourist Police Liaison)
              </h3>
              <p className="text-xs text-[#BE123C] mt-0.5 leading-relaxed">
                Active alerts reported by travelers and validated by local authorities. 
                If you encounter illegal extortion or aggressive touting, tap the <strong>Global SOS</strong> button immediately.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredScams.map((scam) => (
              <div 
                key={scam.id}
                className="bg-white rounded-2xl p-5 border border-[#EAE5DC] shadow-2xs hover:border-[#E11D48]/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        scam.severity === 'high' 
                          ? 'bg-[#FEE2E2] text-[#B91C1C]' 
                          : 'bg-[#FEF3C7] text-[#B45309]'
                      }`}>
                        {scam.severity.toUpperCase()} SEVERITY
                      </span>
                      <span className="text-xs text-[#8C827A] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF6F59]" />
                        <span>{scam.location}, {scam.city}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1F1C18]">
                      {scam.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVoteScam(scam.id)}
                      className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#F3F0EA] border border-[#EAE5DC] text-xs font-bold text-[#5A524C] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#E11D48]" />
                      <span>{scam.upvotes} tourists helped</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed">
                  {scam.description}
                </p>

                {/* How to Avoid */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE5DC] text-xs text-[#1F1C18] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-[#10B981]">Official Defense Strategy: </strong>
                    <span>{scam.howToAvoid}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8C827A] pt-2 border-t border-[#F0ECE4]">
                  <span>Source: {scam.author} • {scam.reportedDate}</span>
                  {scam.policeCaseReference && (
                    <span className="font-mono font-semibold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded-md">
                      Ref: {scam.policeCaseReference}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED HONEST HOTELS */}
      {subTab === 'hotels' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#FFF2EE] to-white rounded-2xl p-4 border border-[#FED7CC] flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[#FF6F59] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#1F1C18]">
                Zero-Gouging Hotel Trust Engine & Low Commission Booking (PRD Section 4.1 & 5)
              </h3>
              <p className="text-xs text-[#5A524C] mt-0.5 leading-relaxed">
                By booking directly through the Community Trust Engine, hotels avoid 18–25% OTA commissions 
                and pass the savings directly to you. Every property features recent on-ground verified photos, 
                audited trust scores, and an enforceable transparent pricing guarantee.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredHotels.map((hotel) => (
              <div 
                key={hotel.id}
                className="bg-white rounded-3xl border border-[#EAE5DC] overflow-hidden shadow-xs hover:border-[#FF6F59]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner with Trust Badge */}
                  <div className="relative h-48 sm:h-56 w-full bg-[#1F1C18] overflow-hidden">
                    <img 
                      src={hotel.verifiedPhotos[0]} 
                      alt={hotel.name}
                      className="w-full h-full object-cover opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                    {/* Trust Score Pill */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10B981] stroke-[2.5]" />
                      <span className="text-xs font-black text-[#1F1C18]">{hotel.trustScore}/100 Trust Score</span>
                    </div>

                    {/* Verification Date */}
                    <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      📸 {hotel.lastVerifiedDate}
                    </div>

                    {/* Commission Saved Pill */}
                    <div className="absolute bottom-3 right-3 bg-[#10B981] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                      Save ₹{hotel.commissionSavings} Direct
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-[#8C827A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF6F59]" />
                          <span>{hotel.neighborhood}, {hotel.city}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1F1C18] mt-0.5">{hotel.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-[#FFF9ED] border border-[#FDE68A] px-2 py-0.5 rounded-lg text-xs font-bold text-[#B45309]">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span>{hotel.starRating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5A524C] leading-relaxed">
                      {hotel.description}
                    </p>

                    {/* Amenities Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hotel.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="text-[11px] font-medium bg-[#FAF8F5] border border-[#EAE5DC] text-[#5A524C] px-2 py-0.5 rounded-lg">
                          ✓ {amenity}
                        </span>
                      ))}
                      {hotel.wheelchairAccessible && (
                        <span className="text-[11px] font-bold bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] px-2 py-0.5 rounded-lg">
                          ♿ Wheelchair Verified
                        </span>
                      )}
                    </div>

                    {/* Complaint History Box */}
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE5DC] text-[11px] text-[#5A524C] flex items-center justify-between">
                      <span>Complaint History:</span>
                      <span className="font-bold text-[#10B981]">
                        {hotel.complaintsCount} incidents • {hotel.complaintsResolvedPercent}% Resolved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Direct Booking */}
                <div className="p-5 pt-3 border-t border-[#F0ECE4] bg-[#FCFAF8] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#8C827A] block">Direct Transparent Rate:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#1F1C18]">
                        ₹{hotel.directPricePerNight.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#8C827A] line-through font-medium">
                        ₹{hotel.otaPricePerNight.toLocaleString()} OTA
                      </span>
                    </div>
                  </div>

                  <button
                    id={`book-direct-hotel-${hotel.id}`}
                    onClick={() => {
                      setSelectedHotelForBooking(hotel);
                      setBookingSuccessModal(true);
                    }}
                    className="px-4 py-2 bg-[#FF6F59] hover:bg-[#E55B46] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#FF6F59]/20 transition-all cursor-pointer"
                  >
                    Direct Reserve (0% Fee)
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* MODAL 1: REPORT PRICE PAID */}
      {isAddPriceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE5DC] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div>
                <h3 className="text-lg font-bold text-[#1F1C18]">Report Price Paid</h3>
                <p className="text-xs text-[#8C827A]">Helps tourists know fair rates and flags overcharging outliers</p>
              </div>
              <button 
                onClick={() => setIsAddPriceOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F3F0EA] text-[#8C827A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPrice} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">Item or Service Name *</label>
                <input
                  type="text"
                  required
                  value={newPriceTitle}
                  onChange={(e) => setNewPriceTitle(e.target.value)}
                  placeholder="e.g. Pre-paid Auto NDLS to Connaught Place"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">Category *</label>
                  <select
                    value={newPriceCategory}
                    onChange={(e) => setNewPriceCategory(e.target.value as PriceCategory)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                  >
                    <option value="transport">Transport / Auto / Taxi</option>
                    <option value="food">Food / Restaurant / Thali</option>
                    <option value="hotel">Hotel / Homestay Room</option>
                    <option value="handicraft">Handicraft / Souvenir</option>
                    <option value="activity">Boat / Activity</option>
                    <option value="guide">Local Guide</option>
                    <option value="monument_ticket">Monument Ticket</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">City *</label>
                  <select
                    value={newPriceCity}
                    onChange={(e) => setNewPriceCity(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Agra">Agra</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Kochi">Kochi / Kerala</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">Price Paid (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPriceAmount}
                    onChange={(e) => setNewPriceAmount(e.target.value)}
                    placeholder="e.g. 70"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">Exact Location</label>
                  <input
                    type="text"
                    value={newPriceLocation}
                    onChange={(e) => setNewPriceLocation(e.target.value)}
                    placeholder="e.g. Platform 16 Pre-paid Booth"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">Vendor / Shop / Driver ID</label>
                <input
                  type="text"
                  value={newPriceVendor}
                  onChange={(e) => setNewPriceVendor(e.target.value)}
                  placeholder="e.g. Traffic Police Counter or Auto DL1R-XXXX"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">Practical Tip / Notes</label>
                <textarea
                  rows={2}
                  value={newPriceNotes}
                  onChange={(e) => setNewPriceNotes(e.target.value)}
                  placeholder="Share details (e.g., whether meter was used, MRP adherence, bargaining advice)..."
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPriceOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C827A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF6F59] hover:bg-[#E55B46] text-white shadow-sm"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT SCAM / TOUT */}
      {isAddScamOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#FECDD3] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#FEE2E2]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#E11D48]" />
                <div>
                  <h3 className="text-lg font-bold text-[#9F1239]">Report a Tourist Scam</h3>
                  <p className="text-xs text-[#BE123C]">Alerts the community and feeds Tourist Police hotspot mapping</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddScamOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F3F0EA] text-[#8C827A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitScam} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">Scam Headline *</label>
                <input
                  type="text"
                  required
                  value={newScamTitle}
                  onChange={(e) => setNewScamTitle(e.target.value)}
                  placeholder="e.g. Fake 'Hotel Has Closed' Touts at Station"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">Scam Category *</label>
                  <select
                    value={newScamCategory}
                    onChange={(e) => setNewScamCategory(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="overcharging">Severe Overcharging</option>
                    <option value="touting">Aggressive Touts / Agency Redirect</option>
                    <option value="fake_tickets">Fake Monument Tickets</option>
                    <option value="transport_fraud">Transport / Broken Meter Fraud</option>
                    <option value="fake_hotel">Bogus Hotel Listing</option>
                    <option value="gem_carpet_scam">Kickback Gem / Carpet Factory</option>
                    <option value="temple_donation_extortion">Temple Donation Extortion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">Severity *</label>
                  <select
                    value={newScamSeverity}
                    onChange={(e) => setNewScamSeverity(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="high">High (Threat/Heavy Extortion)</option>
                    <option value="medium">Medium (Trickery/Kickback)</option>
                    <option value="low">Low (Minor overcharging)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newScamCity}
                    onChange={(e) => setNewScamCity(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">Exact Location *</label>
                  <input
                    type="text"
                    required
                    value={newScamLocation}
                    onChange={(e) => setNewScamLocation(e.target.value)}
                    placeholder="e.g. NDLS Station Gate 1"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">What Happened? (Description) *</label>
                <textarea
                  rows={3}
                  required
                  value={newScamDescription}
                  onChange={(e) => setNewScamDescription(e.target.value)}
                  placeholder="Describe the scam tactics, what they claimed, and how much was demanded..."
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">How Other Tourists Can Avoid It</label>
                <input
                  type="text"
                  value={newScamHowToAvoid}
                  onChange={(e) => setNewScamHowToAvoid(e.target.value)}
                  placeholder="e.g. Only book with official pre-paid booth and ignore strangers claiming your hotel is closed."
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddScamOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C827A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm"
                >
                  Submit Scam Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT HOTEL BOOKING CONFIRMATION */}
      {bookingSuccessModal && selectedHotelForBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#FED7CC] text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-bold text-[#1F1C18]">Direct Booking Voucher Issued!</h3>
            <p className="text-xs text-[#5A524C] mt-1">
              Confirmed with <strong>{selectedHotelForBooking.name}</strong> ({selectedHotelForBooking.city})
            </p>

            <div className="my-4 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Voucher Ref:</span>
                <span className="font-bold text-[#1F1C18]">TRST-DIR-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Direct Rate:</span>
                <span className="font-bold text-[#10B981]">₹{selectedHotelForBooking.directPricePerNight}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">OTA Savings:</span>
                <span className="font-bold text-[#FF6F59]">₹{selectedHotelForBooking.commissionSavings} saved</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Desk Phone:</span>
                <span className="font-bold text-[#1F1C18]">{selectedHotelForBooking.contactPhone}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#8C827A] mb-4">
              Demo sandbox reservation. Show this voucher at check-in with zero intermediary markups.
            </p>

            <button
              onClick={() => {
                setBookingSuccessModal(false);
                setSelectedHotelForBooking(null);
                showToast('Booking voucher saved to your device!');
              }}
              className="w-full py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E55B46] text-white text-xs font-bold shadow-sm transition-all"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1C18] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
