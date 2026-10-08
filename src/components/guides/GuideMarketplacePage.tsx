import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Languages, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  Accessibility, 
  Award, 
  Coins, 
  QrCode,
  ArrowRight,
  Filter,
  ThumbsUp,
  AlertTriangle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { LocalGuide, GuideBooking } from '../../types/trustEngine';
import { VERIFIED_GUIDES } from '../../data/trustEngineData';
import type { Trip } from '../../types/travel';

interface GuideMarketplacePageProps {
  accessibilityMode?: boolean;
  currentTrip?: Trip;
  currentCity?: string;
  onBack?: () => void;
}

export const GuideMarketplacePage: React.FC<GuideMarketplacePageProps> = ({
  accessibilityMode = false,
  currentTrip,
  currentCity,
  onBack,
}) => {
  const [guides, setGuides] = useState<LocalGuide[]>(() => {
    try {
      const saved = localStorage.getItem('sih_verified_guides');
      return saved ? JSON.parse(saved) : VERIFIED_GUIDES;
    } catch {
      return VERIFIED_GUIDES;
    }
  });

  // Automatically suggest top guides matching the active trip destination
  const activeCity = currentCity || (currentTrip?.region?.toLowerCase().includes('delhi') ? 'Delhi' : currentTrip?.region?.toLowerCase().includes('rajasthan') || currentTrip?.region?.toLowerCase().includes('jaipur') ? 'Jaipur' : currentTrip?.region?.toLowerCase().includes('kerala') || currentTrip?.region?.toLowerCase().includes('kochi') ? 'Kochi' : currentTrip?.region?.toLowerCase().includes('varanasi') || currentTrip?.region?.toLowerCase().includes('uttar pradesh') ? 'Varanasi' : '');

  const suggestedGuides = useMemo(() => {
    if (activeCity) {
      const cityMatches = guides.filter(g => g.city.toLowerCase() === activeCity.toLowerCase());
      if (cityMatches.length > 0) return cityMatches;
    }
    return [...guides].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [guides, activeCity]);

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(accessibilityMode);

  // Compare Guides State
  const [compareGuides, setCompareGuides] = useState<LocalGuide[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Booking Flow State
  const [bookingGuide, setBookingGuide] = useState<LocalGuide | null>(null);
  const [bookingDuration, setBookingDuration] = useState<'hourly' | 'half_day' | 'full_day'>('half_day');
  const [bookingDate, setBookingDate] = useState('Tomorrow');
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState<'sandbox_upi' | 'sandbox_card' | 'pay_on_tour'>('sandbox_upi');
  const [completedBooking, setCompletedBooking] = useState<GuideBooking | null>(null);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regCity, setRegCity] = useState('Delhi');
  const [regLanguages, setRegLanguages] = useState('');
  const [regSpecialties, setRegSpecialties] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regHourly, setRegHourly] = useState('450');
  const [regHalfDay, setRegHalfDay] = useState('1500');
  const [regFullDay, setRegFullDay] = useState('2600');
  const [regWheelchair, setRegWheelchair] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem('sih_verified_guides', JSON.stringify(guides));
    } catch (e) {
      console.error(e);
    }
  }, [guides]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchCity = selectedCity === 'all' || guide.city.toLowerCase() === selectedCity.toLowerCase();
      const matchLang = selectedLanguage === 'all' || guide.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase());
      const matchWheelchair = !wheelchairOnly && !accessibilityMode ? true : guide.wheelchairCertified;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        guide.name.toLowerCase().includes(q) ||
        guide.specialties.some(s => s.toLowerCase().includes(q)) ||
        guide.bio.toLowerCase().includes(q);
      return matchCity && matchLang && matchWheelchair && matchSearch;
    });
  }, [guides, selectedCity, selectedLanguage, wheelchairOnly, accessibilityMode, searchQuery]);

  // Handle Guide Comparison
  const toggleCompare = (guide: LocalGuide) => {
    if (compareGuides.some(g => g.id === guide.id)) {
      setCompareGuides(prev => prev.filter(g => g.id !== guide.id));
    } else {
      if (compareGuides.length >= 2) {
        showToast('You can compare up to 2 guides simultaneously.');
        return;
      }
      setCompareGuides(prev => [...prev, guide]);
      if (compareGuides.length === 1) {
        setIsCompareOpen(true);
      }
    }
  };

  // Complete Booking Flow (Sandbox Mode)
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingGuide) return;

    const price = bookingDuration === 'hourly' 
      ? bookingGuide.hourlyRate * 2 
      : bookingDuration === 'half_day' 
      ? bookingGuide.halfDayRate 
      : bookingGuide.fullDayRate;

    const newBooking: GuideBooking = {
      id: `GB-${Math.floor(100000 + Math.random() * 900000)}`,
      guideId: bookingGuide.id,
      guideName: bookingGuide.name,
      city: bookingGuide.city,
      date: bookingDate,
      duration: bookingDuration,
      totalPrice: price,
      travelerName: 'Verified Traveler',
      paymentMethod: bookingPaymentMethod,
      status: 'confirmed',
      tokensRewarded: 150
    };

    setCompletedBooking(newBooking);
    showToast(`Tour booked! You earned +150 Community Trust Tokens.`);
  };

  // Submit Guide Registration
  const handleRegisterGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regLicense) return;

    const newGuide: LocalGuide = {
      id: `guide-${Date.now()}`,
      name: regName,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      city: regCity,
      state: `${regCity} Tourism Region`,
      languages: regLanguages ? regLanguages.split(',').map(s => s.trim()) : ['English', 'Hindi'],
      specialties: regSpecialties ? regSpecialties.split(',').map(s => s.trim()) : ['Heritage History', 'Cultural Tours'],
      hourlyRate: parseFloat(regHourly) || 450,
      halfDayRate: parseFloat(regHalfDay) || 1500,
      fullDayRate: parseFloat(regFullDay) || 2600,
      fairRangeHalfDay: [1200, 1800],
      isGovtVerified: false,
      licenseNo: regLicense,
      rating: 5.0,
      reviewsCount: 1,
      bio: `Government registered independent local guide. Committed to transparent fair pricing with zero shopping tout commissions.`,
      wheelchairCertified: regWheelchair,
      availability: 'available_today',
      phone: '+91 98000 00000',
      tokensEarned: 200
    };

    setGuides([newGuide, ...guides]);
    setIsRegisterOpen(false);
    // reset
    setRegName('');
    setRegLicense('');
    showToast('Sample guide saved locally. Use Register as a guide above to submit for review.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 pb-20">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5] shadow-xs cursor-pointer transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Explore</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FFF7F4] via-[#FAF8F5] to-[#FFF2EE] rounded-3xl p-5 sm:p-7 border border-[#FED7CC] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6F59]/10 text-[#FF6F59] text-xs font-bold uppercase tracking-wider mb-2.5">
              <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>PRD 4.4 • Verified Local Guide Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1C18] tracking-tight">
              Hire Verified Guides with <span className="text-[#FF6F59]">Zero Touting</span> & Transparent Rates
            </h1>

            <p className="text-xs sm:text-sm text-[#5A524C] mt-2 leading-relaxed">
              Every guide is verified with official Ministry of Tourism or State Tourism credentials. 
              Protected by the <strong>Fair Price Engine</strong> to stop tout commissions, kickback stores, and exorbitant quotes.
            </p>
          </div>

          <button
            id="register-guide-modal-btn"
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2.5 bg-[#1F1C18] hover:bg-black text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FF6F59]" />
            <span>Register as Local Guide (Formalize Income)</span>
          </button>
        </div>

        {/* Fair Price Engine Callout for Guides */}
        <div className="mt-4 p-3 bg-white rounded-2xl border border-[#EAE5DC] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span className="text-[#1F1C18] font-bold">Guide Fair Price Benchmark:</span>
            <span className="font-mono text-[#10B981] font-bold">₹1,200 – ₹1,800 for Half-Day (4 hrs)</span>
          </div>
          <span className="text-[11px] text-[#E11D48] bg-[#FFF1F2] px-2.5 py-0.5 rounded-md font-semibold">
            ⚠️ Street tout quotes of ₹4,000+ flagged by Fair Price Engine
          </span>
        </div>
      </div>

      {/* Automatically Suggested Top Guides Banner */}
      <div className="bg-gradient-to-br from-white to-[#FFF9F6] rounded-3xl p-5 border border-[#FED7CC] shadow-xs">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C84B31]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1F1C18]">
              {activeCity ? `Suggested Verified Guides for ${activeCity}` : 'Top Recommended & Verified Local Guides'}
            </h2>
          </div>
          <span className="text-xs font-bold text-[#059669] bg-[#10B981]/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt & ASI Verified</span>
          </span>
        </div>
        <p className="text-xs text-[#6B635B] mb-4">
          {activeCity 
            ? `Top-rated certified guides available for your itinerary in ${activeCity}. Verified fair rates with zero commercial tout commissions.` 
            : 'Top-rated certified guides across popular Indian cultural destinations.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {suggestedGuides.map(guide => (
            <div 
              key={`sug-${guide.id}`}
              className="bg-white rounded-2xl p-3.5 border border-[#EAE5DC] hover:border-[#C84B31] transition-all flex flex-col justify-between shadow-2xs group"
            >
              <div>
                <div className="flex items-start gap-3 mb-2.5">
                  <img 
                    src={guide.avatar} 
                    alt={guide.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-[#EAE5DC] shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-xs sm:text-sm font-bold text-[#1F1C18] truncate group-hover:text-[#C84B31]">
                        {guide.name}
                      </strong>
                    </div>
                    <div className="text-[11px] text-[#787067] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#FF6F59] shrink-0" />
                      <span className="truncate">{guide.city}, {guide.state}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                      <span>{guide.rating.toFixed(2)}</span>
                      <span className="text-[10px] text-[#8C827A] font-normal">({guide.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {guide.specialties.slice(0, 2).map((spec, i) => (
                    <span key={i} className="text-[10px] bg-[#FAF8F5] text-[#524B45] px-2 py-0.5 rounded-md border border-[#EAE5DC] truncate max-w-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0ECE4] flex items-center justify-between mt-1">
                <div>
                  <span className="text-[10px] text-[#8C827A] block leading-none">Half-Day</span>
                  <span className="text-xs font-extrabold text-[#1F1C18]">₹{guide.halfDayRate}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingGuide(guide)}
                  className="px-3 py-1.5 rounded-xl bg-[#C84B31] hover:bg-[#A93C24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Book Guide
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#9C948B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guide name, specialties (e.g. Mughal history, photography, street food)..."
            className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
          />
        </div>

        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1C18]"
        >
          <option value="all">All Cities</option>
          <option value="Delhi">Delhi</option>
          <option value="Agra">Agra</option>
          <option value="Jaipur">Jaipur</option>
          <option value="Varanasi">Varanasi</option>
        </select>

        {/* Language Filter */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1C18]"
        >
          <option value="all">All Languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="French">French</option>
          <option value="Spanish">Spanish</option>
          <option value="German">German</option>
          <option value="Japanese">Japanese</option>
        </select>

        {/* Wheelchair Accessible Certified Filter */}
        <button
          onClick={() => setWheelchairOnly(!wheelchairOnly)}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            wheelchairOnly || accessibilityMode
              ? 'bg-[#0284C7] text-white'
              : 'bg-[#FAF8F5] text-[#5A524C] hover:bg-[#F3F0EA] border border-[#EAE5DC]'
          }`}
        >
          <Accessibility className="w-3.5 h-3.5" />
          <span>♿ Accessible Certified</span>
        </button>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white rounded-3xl border border-[#EAE5DC] p-5 shadow-xs hover:border-[#FF6F59]/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={guide.avatar}
                      alt={guide.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-[#FF6F59]/30"
                    />
                    {guide.isGovtVerified && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#10B981] rounded-full text-white">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-[#1F1C18]">{guide.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#ECFDF5] text-[#065F46] px-2 py-0.2 rounded-md">
                        GOVT VERIFIED
                      </span>
                    </div>

                    <div className="text-xs text-[#8C827A] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#FF6F59]" />
                      <span>{guide.city}, {guide.state}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 bg-[#FFF9ED] border border-[#FDE68A] px-2 py-0.5 rounded-lg text-xs font-bold text-[#B45309]">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{guide.rating}</span>
                    <span className="text-[#8C827A] font-normal">({guide.reviewsCount})</span>
                  </div>
                </div>
              </div>

              {/* License Badge */}
              <div className="text-[11px] font-mono text-[#5A524C] bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#F0ECE4] flex items-center justify-between mb-3">
                <span>License: <strong className="text-[#1F1C18]">{guide.licenseNo}</strong></span>
                <span className="text-[#10B981] font-bold">✓ Background Checked</span>
              </div>

              {/* Bio */}
              <p className="text-xs text-[#5A524C] leading-relaxed mb-3">
                {guide.bio}
              </p>

              {/* Languages */}
              <div className="mb-2">
                <span className="text-[11px] text-[#8C827A] font-medium block mb-1">Spoken Languages:</span>
                <div className="flex flex-wrap gap-1">
                  {guide.languages.map((lang, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-[#F4F1EB] text-[#1F1C18] px-2 py-0.5 rounded-md">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-3">
                <span className="text-[11px] text-[#8C827A] font-medium block mb-1">Specialties:</span>
                <div className="flex flex-wrap gap-1">
                  {guide.specialties.map((spec, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-[#FFF2EE] text-[#FF6F59] px-2 py-0.5 rounded-md">
                      {spec}
                    </span>
                  ))}
                  {guide.wheelchairCertified && (
                    <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded-md">
                      ♿ Accessible Guide Certified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price List & Booking Action */}
            <div className="pt-3 border-t border-[#F0ECE4] space-y-3">
              <div className="grid grid-cols-3 gap-1 text-center bg-[#FAF8F5] p-2 rounded-2xl border border-[#EAE5DC] text-xs">
                <div>
                  <span className="text-[10px] text-[#8C827A] block">Hourly</span>
                  <span className="font-bold text-[#1F1C18]">₹{guide.hourlyRate}</span>
                </div>
                <div className="border-x border-[#EAE5DC]">
                  <span className="text-[10px] text-[#8C827A] block">Half-Day (4h)</span>
                  <span className="font-bold text-[#10B981]">₹{guide.halfDayRate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C827A] block">Full-Day (8h)</span>
                  <span className="font-bold text-[#1F1C18]">₹{guide.fullDayRate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCompare(guide)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    compareGuides.some(g => g.id === guide.id)
                      ? 'bg-[#1F1C18] text-white border-[#1F1C18]'
                      : 'bg-white text-[#5A524C] border-[#EAE5DC] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {compareGuides.some(g => g.id === guide.id) ? 'Comparing ✓' : 'Compare'}
                </button>

                <button
                  id={`book-guide-${guide.id}`}
                  onClick={() => setBookingGuide(guide)}
                  className="flex-1 py-2 rounded-xl bg-[#FF6F59] hover:bg-[#E55B46] text-white text-xs font-bold shadow-sm shadow-[#FF6F59]/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Book Guide</span>
                  <span className="text-[10px] bg-white/20 px-1 rounded-sm">+150 Tokens</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL 1: SANDBOX BOOKING FLOW */}
      {bookingGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#FED7CC] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            {!completedBooking ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
                  <div>
                    <h3 className="text-lg font-bold text-[#1F1C18]">Book Verified Guide</h3>
                    <p className="text-xs text-[#8C827A]">{bookingGuide.name} • {bookingGuide.city}</p>
                  </div>
                  <button 
                    onClick={() => setBookingGuide(null)}
                    className="p-1.5 rounded-xl hover:bg-[#F3F0EA] text-[#8C827A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleConfirmBooking} className="space-y-4 mt-4 text-xs">
                  
                  {/* Select Duration */}
                  <div>
                    <label className="block font-bold text-[#1F1C18] mb-1.5">Tour Duration *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'hourly', label: '2 Hours Sprint', price: bookingGuide.hourlyRate * 2 },
                        { id: 'half_day', label: 'Half-Day (4 hrs)', price: bookingGuide.halfDayRate },
                        { id: 'full_day', label: 'Full-Day (8 hrs)', price: bookingGuide.fullDayRate },
                      ].map(dur => (
                        <button
                          key={dur.id}
                          type="button"
                          onClick={() => setBookingDuration(dur.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            bookingDuration === dur.id
                              ? 'border-[#FF6F59] bg-[#FFF2EE] font-bold text-[#FF6F59]'
                              : 'border-[#EAE5DC] bg-[#FAF8F5] text-[#5A524C]'
                          }`}
                        >
                          <span className="block text-[11px]">{dur.label}</span>
                          <span className="block font-mono font-bold text-sm mt-0.5">₹{dur.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1F1C18] mb-1">Tour Date *</label>
                      <select
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2"
                      >
                        <option value="Today Afternoon">Today Afternoon</option>
                        <option value="Tomorrow Morning (Sunrise)">Tomorrow Morning (Sunrise)</option>
                        <option value="Tomorrow Afternoon">Tomorrow Afternoon</option>
                        <option value="Day After Tomorrow">Day After Tomorrow</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1F1C18] mb-1">Sandbox Payment Method</label>
                      <select
                        value={bookingPaymentMethod}
                        onChange={(e) => setBookingPaymentMethod(e.target.value as any)}
                        className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 font-medium"
                      >
                        <option value="sandbox_upi">UPI QR (Google Pay / PhonePe)</option>
                        <option value="sandbox_card">Credit Card (Sandbox Test)</option>
                        <option value="pay_on_tour">Pay Cash Directly on Tour</option>
                      </select>
                    </div>
                  </div>

                  {/* Fair Price Shield Guarantee */}
                  <div className="p-3 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] text-[#065F46] flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">No-Tout Anti-Commission Guarantee: </strong>
                      This guide has signed the Ministry of Tourism Code of Conduct. Zero forced shopping visits or secret retail markups.
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#F0ECE4]">
                    <div>
                      <span className="text-[11px] text-[#8C827A] block">Total Transparent Fare:</span>
                      <span className="text-lg font-black font-mono text-[#1F1C18]">
                        ₹{bookingDuration === 'hourly' ? bookingGuide.hourlyRate * 2 : bookingDuration === 'half_day' ? bookingGuide.halfDayRate : bookingGuide.fullDayRate}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E55B46] text-white font-bold shadow-md shadow-[#FF6F59]/20 transition-all cursor-pointer"
                    >
                      Confirm Booking (Sandbox)
                    </button>
                  </div>

                </form>
              </div>
            ) : (
              /* Booking Success Voucher with QR Code */
              <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1F1C18]">Tour Confirmed & Secured!</h3>
                  <p className="text-xs text-[#5A524C] mt-0.5">
                    Your verified guide <strong>{completedBooking.guideName}</strong> has reserved your slot.
                  </p>
                </div>

                {/* Voucher Box */}
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EAE5DC] text-left text-xs font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#8C827A]">Booking ID:</span>
                    <span className="font-bold text-[#1F1C18]">{completedBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C827A]">Date & Duration:</span>
                    <span className="font-bold text-[#1F1C18]">{completedBooking.date} ({completedBooking.duration})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C827A]">Total Amount:</span>
                    <span className="font-bold text-[#10B981]">₹{completedBooking.totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C827A]">Guide Phone:</span>
                    <span className="font-bold text-[#0284C7]">{bookingGuide?.phone}</span>
                  </div>
                </div>

                {/* Token Rewards Banner (PRD requirement) */}
                <div className="p-3 bg-[#FFF9ED] border border-[#FDE68A] rounded-2xl text-xs text-[#B45309] flex items-center justify-center gap-2 font-bold">
                  <Coins className="w-4 h-4 text-[#F59E0B]" />
                  <span>+150 Community Trust Tokens Credited to Your Wallet!</span>
                </div>

                <button
                  onClick={() => {
                    setBookingGuide(null);
                    setCompletedBooking(null);
                  }}
                  className="w-full py-2.5 bg-[#FF6F59] hover:bg-[#E55B46] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Done & Return to Marketplace
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER AS LOCAL GUIDE */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE5DC] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div>
                <h3 className="text-lg font-bold text-[#1F1C18]">Local Guide Onboarding</h3>
                <p className="text-xs text-[#8C827A]">Connect directly with tourists without paying 40% tout syndicates</p>
              </div>
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F3F0EA] text-[#8C827A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterGuide} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#1F1C18] mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Sharma"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1F1C18] mb-1">City / Hub *</label>
                  <select
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Agra">Agra</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Kochi">Kochi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1F1C18] mb-1">Govt License / Badge No. *</label>
                  <input
                    type="text"
                    required
                    value={regLicense}
                    onChange={(e) => setRegLicense(e.target.value)}
                    placeholder="e.g. MOT/UP/2022/109"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1F1C18] mb-1">Languages (comma separated)</label>
                <input
                  type="text"
                  value={regLanguages}
                  onChange={(e) => setRegLanguages(e.target.value)}
                  placeholder="e.g. English, Hindi, German, Japanese"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F1C18] mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  value={regSpecialties}
                  onChange={(e) => setRegSpecialties(e.target.value)}
                  placeholder="e.g. Temple Architecture, Sunrise Photography, Safe Street Food"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-[#1F1C18] mb-1">Hourly (₹)</label>
                  <input
                    type="number"
                    value={regHourly}
                    onChange={(e) => setRegHourly(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1F1C18] mb-1">Half-Day (₹)</label>
                  <input
                    type="number"
                    value={regHalfDay}
                    onChange={(e) => setRegHalfDay(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1F1C18] mb-1">Full-Day (₹)</label>
                  <input
                    type="number"
                    value={regFullDay}
                    onChange={(e) => setRegFullDay(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reg-wheelchair-chk"
                  checked={regWheelchair}
                  onChange={(e) => setRegWheelchair(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F59]"
                />
                <label htmlFor="reg-wheelchair-chk" className="font-semibold text-[#1F1C18] cursor-pointer">
                  Certified in Accessible & Assisted Wheelchair Tours
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C827A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1F1C18] hover:bg-black text-white shadow-sm"
                >
                  Submit for Verification
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1C18] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
