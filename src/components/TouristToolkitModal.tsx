import React, { useState, useMemo } from 'react';
import { 
  X, 
  Train, 
  Sparkles, 
  Utensils, 
  ShoppingBag, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Droplets,
  Flame,
  Ticket,
  MapPin,
  Search,
  Volume2,
  Copy,
  Check,
  PhoneCall,
  Compass,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  Clock,
  ThumbsUp,
  Tag
} from 'lucide-react';
import { 
  TRANSIT_TOOLKIT, 
  REGIONAL_FESTIVALS, 
  CULINARY_SAFETY_TIPS, 
  FAMOUS_CULTURAL_BUYS 
} from '../data/indiaTrips';

interface TouristToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'transit' | 'festivals' | 'culinary' | 'shopping' | 'emergency';
}

export const TouristToolkitModal: React.FC<TouristToolkitModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'transit',
}) => {
  const [activeTab, setActiveTab] = useState<'transit' | 'festivals' | 'culinary' | 'shopping' | 'emergency'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive states
  const [selectedTransitIndex, setSelectedTransitIndex] = useState(0);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  
  // Festival filter
  const [festivalRegion, setFestivalRegion] = useState<string>('all');
  
  // Culinary spice slider
  const [spicePreference, setSpicePreference] = useState<'mild' | 'medium' | 'spicy' | 'fiery'>('mild');
  
  // Copied phrase indicator
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  // Authenticity test active craft
  const [activeCraftIndex, setActiveCraftIndex] = useState(0);

  // Sync initial tab when reopened
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Audio pronunciation helper
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Hindi
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPhrase(id);
      setTimeout(() => setCopiedPhrase(null), 2000);
    }
  };

  // Phrases for culinary & transit
  const orderingPhrases = [
    {
      id: 'p1',
      hindi: 'कम तीखा कीजिए',
      transliteration: 'Kam theekha kijiye',
      meaning: 'Please make it mild / less spicy',
      category: 'Food',
      tip: 'Say this politely when ordering any curry or chaat.',
    },
    {
      id: 'p2',
      hindi: 'बिना मिर्च के',
      transliteration: 'Bina mirchi ke',
      meaning: 'Completely without chili peppers',
      category: 'Food',
      tip: 'Perfect for children or sensitive stomachs.',
    },
    {
      id: 'p3',
      hindi: 'सील बंद पानी दीजिए',
      transliteration: 'Sealed bandh paani dijiye',
      meaning: 'Give bottled mineral water with unbroken seal',
      category: 'Water',
      tip: 'Always ensure the plastic seal ring is intact.',
    },
    {
      id: 'p4',
      hindi: 'मीठा दही या छाछ',
      transliteration: 'Meetha dahi ya chaas',
      meaning: 'Sweet curd or refreshing buttermilk',
      category: 'Food',
      tip: 'Instant antidote if a dish turns out spicier than expected.',
    },
    {
      id: 'p5',
      hindi: 'मीटर से चलिए',
      transliteration: 'Meter se chaliye',
      meaning: 'Please charge by the official meter',
      category: 'Transit',
      tip: 'Standard phrase for auto-rickshaws in Delhi, Mumbai, and Bengaluru.',
    },
    {
      id: 'p6',
      hindi: 'कितना हुआ भैया?',
      transliteration: 'Kitna hua bhaiya?',
      meaning: 'How much is it, brother?',
      category: 'Transit & Shopping',
      tip: 'Friendly and respectful way to ask for the total bill.',
    },
    {
      id: 'p7',
      hindi: 'नमस्ते / धन्यवाद',
      transliteration: 'Namaste / Dhanyawaad',
      meaning: 'Hello / Thank you',
      category: 'Politeness',
      tip: 'Pair Namaste with hands folded at chest level.',
    },
  ];

  // Filtered phrases
  const filteredPhrases = useMemo(() => {
    if (!searchQuery) return orderingPhrases;
    const q = searchQuery.toLowerCase();
    return orderingPhrases.filter(p => 
      p.transliteration.toLowerCase().includes(q) ||
      p.meaning.toLowerCase().includes(q) ||
      p.hindi.includes(q)
    );
  }, [searchQuery]);

  // Filtered festivals
  const filteredFestivals = useMemo(() => {
    return REGIONAL_FESTIVALS.filter(f => {
      const matchesRegion = festivalRegion === 'all' || f.region.toLowerCase().includes(festivalRegion);
      const matchesSearch = !searchQuery || 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [festivalRegion, searchQuery]);

  // Emergency Helplines
  const emergencyHelplines = [
    {
      number: '1363',
      name: '24x7 Multi-Lingual Tourist Helpline',
      authority: 'Ministry of Tourism, Govt of India',
      languages: 'English, French, German, Spanish, Japanese, Russian, Hindi',
      desc: 'Dedicated emergency assistance, travel guidance, and grievance redressal for international tourists.',
      badge: 'Official Tourist Support',
      primary: true,
    },
    {
      number: '112',
      name: 'National Unified Emergency Helpline',
      authority: 'Police, Fire, Ambulance',
      languages: 'Pan-India Service',
      desc: 'All-in-one emergency helpline equivalent to 911 or 112 in Europe. Works from any mobile even without roaming balance.',
      badge: 'Police / Medical',
      primary: false,
    },
    {
      number: '139',
      name: 'RailMadad (Railway Assistance)',
      authority: 'Indian Railways',
      languages: 'English & Hindi',
      desc: 'Instant help on trains, medical emergencies during travel, lost luggage, and seat verification.',
      badge: 'Train Travel',
      primary: false,
    },
    {
      number: '1091',
      name: "Women's Safety Helpline",
      authority: 'Police Department',
      languages: 'Multi-lingual local support',
      desc: '24-hour rapid response team dedicated to safety assistance for solo female travelers.',
      badge: 'Women Safety',
      primary: false,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="tourist-toolkit-modal"
        className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] max-h-[820px] overflow-hidden flex flex-col shadow-2xl border border-[#EAE5DC]"
      >
        
        {/* Header with spacious branding and search bar */}
        <div className="p-4 sm:px-8 sm:py-5 bg-[#FFFDF9] border-b border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF6F59] text-white uppercase tracking-wider">
                India Tourist Companion
              </span>
              <span className="text-xs font-semibold text-[#8C827A]">Interactive Cultural & Transit Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1F1C18] font-display">
              Field Guide & Navigation Assistant
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search inside Guide */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guide (train, spice, water)..."
                className="w-full bg-[#F4F1EB] border border-[#E5DFD5] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1F1C18] placeholder-[#9E948A] focus:outline-none focus:ring-2 focus:ring-[#FF6F59]/20 focus:border-[#FF6F59] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#1F1C18]"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              id="close-toolkit-modal-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#1F1C18] flex items-center justify-center transition-colors shrink-0"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Spacious, Elegant Tab Ribbon */}
        <div className="flex border-b border-[#EAE5DC] bg-[#FAF8F5] px-4 sm:px-8 gap-1 sm:gap-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'transit', label: 'Transit Hub & Trains', icon: <Train className="w-4 h-4 text-[#0284C7]" /> },
            { id: 'culinary', label: 'Culinary & Hindi Phrases', icon: <Utensils className="w-4 h-4 text-[#D97706]" /> },
            { id: 'festivals', label: 'Regional Festivals', icon: <Sparkles className="w-4 h-4 text-[#BE185D]" /> },
            { id: 'shopping', label: 'GI Crafts & Authenticity', icon: <ShoppingBag className="w-4 h-4 text-[#7E22CE]" /> },
            { id: 'emergency', label: 'Helpline & Safety', icon: <ShieldCheck className="w-4 h-4 text-[#10B981]" /> },
          ].map(tab => (
            <button
              key={tab.id}
              id={`toolkit-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#FF6F59] text-[#FF6F59] bg-white rounded-t-2xl shadow-xs'
                  : 'border-transparent text-[#6B635B] hover:text-[#1F1C18] hover:bg-white/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#FBF9F5]">
          
          {/* ========================================================= */}
          {/* TAB 1: TRANSIT HUB & RAILWAYS                            */}
          {/* ========================================================= */}
          {activeTab === 'transit' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* Highlight Banner: Foreign Tourist Quota */}
              <div className="p-5 bg-gradient-to-r from-[#EFF6FF] to-[#E0F2FE] rounded-2xl border border-[#BAE6FD] text-xs sm:text-sm text-[#0369A1] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-[#0C4A6E] text-sm sm:text-base flex items-center gap-2">
                    <span>Foreign Tourist Quota (FTQ) Available</span>
                    <span className="text-[10px] bg-[#0284C7] text-white px-2 py-0.5 rounded-full uppercase">VIP Tip</span>
                  </div>
                  <p className="leading-relaxed text-[#1E3A8A]">
                    Even when high-speed trains appear fully waitlisted ("WL"), Indian Railways reserves special emergency berths for international passport holders. Book online at IRCTC or in-person at <strong>International Tourist Bureaus</strong> (e.g. New Delhi Railway Station 1st Floor).
                  </p>
                </div>
              </div>

              {/* Interactive Transit Mode Switcher */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8C827A]">
                  Select Transportation Mode to Explore:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {TRANSIT_TOOLKIT.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTransitIndex(idx);
                        setSelectedClassIndex(0);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedTransitIndex === idx
                          ? 'bg-white border-[#0284C7] shadow-md ring-2 ring-[#0284C7]/20'
                          : 'bg-white/80 border-[#EAE5DC] hover:border-[#CBD5E1] text-[#524B44]'
                      }`}
                    >
                      <div className="text-lg mb-1">
                        {idx === 0 ? '🚆' : idx === 1 ? '🚇' : idx === 2 ? '🛺' : '⛴️'}
                      </div>
                      <div className="text-xs font-bold text-[#1F1C18] truncate">{t.mode}</div>
                      <div className="text-[11px] text-[#0284C7] font-semibold">{t.badge}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Mode Detail Card */}
              {TRANSIT_TOOLKIT[selectedTransitIndex] && (() => {
                const currentTransit = TRANSIT_TOOLKIT[selectedTransitIndex];
                return (
                  <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-sm space-y-5">
                    
                    {/* Visual Photo Header for Transit Mode */}
                    {currentTransit.imageUrl && (
                      <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-xs">
                        <img 
                          src={currentTransit.imageUrl} 
                          alt={currentTransit.mode} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                            {currentTransit.badge}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-bold text-[#10B981] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-2xs">
                            {currentTransit.rating} Comfort
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          {currentTransit.place && (
                            <div className="text-xs text-white/90 flex items-center gap-1.5 font-medium mb-1 drop-shadow-xs">
                              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                              <span>{currentTransit.place}</span>
                            </div>
                          )}
                          <h4 className="text-lg sm:text-xl font-black font-display text-white drop-shadow-sm">
                            {currentTransit.mode}
                          </h4>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0ECE4]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
                            Speed: {currentTransit.speed}
                          </span>
                          <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">
                            {currentTransit.rating} Comfort
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-[#1F1C18] font-display">
                          {currentTransit.mode}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-[#524B44] bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#EAE5DC] self-start sm:self-auto">
                        {currentTransit.badge}
                      </span>
                    </div>

                    <p className="text-sm text-[#524B44] leading-relaxed">
                      {currentTransit.summary}
                    </p>

                    {/* Interactive Travel Classes / Ticketing Types */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#8C827A]">
                        Travel Classes & Ticketing Options (Tap to inspect):
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2.5">
                        {currentTransit.classes.map((cls, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => setSelectedClassIndex(cIdx)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              selectedClassIndex === cIdx
                                ? 'bg-[#F0F9FF] border-[#0284C7] shadow-xs'
                                : 'bg-[#FAF8F5] border-[#EAE5DC] hover:border-[#BAE6FD]'
                            }`}
                          >
                            <div className="font-extrabold text-sm text-[#0284C7]">{cls.code}</div>
                            <div className="text-xs font-bold text-[#1F1C18] mt-0.5">{cls.name}</div>
                            <div className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                              {cls.tip}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Insider Pro-Tip Box */}
                    <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3 text-xs sm:text-sm text-[#15803D]">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A] mt-0.5" />
                      <div>
                        <strong className="font-bold">Tourist Insider Pro-Tip: </strong>
                        {currentTransit.proTip}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Fare & Booking Rule Reference */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] space-y-2">
                  <h4 className="text-sm font-bold text-[#1F1C18] flex items-center gap-2">
                    <span>💳 Payment Methods Accepted</span>
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Metro and Railway stations support contactless international credit cards (Visa/Mastercard) and UPI QR codes. For local street autos, always carry small cash notes (₹10, ₹20, ₹50, ₹100).
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#EAE5DC] space-y-2">
                  <h4 className="text-sm font-bold text-[#1F1C18] flex items-center gap-2">
                    <span>🧳 Luggage Safety Guidance</span>
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    In train sleeper coaches, luggage slips easily beneath your lower berth. Use a small padlock or bicycle wire lock to attach your bag handle to the under-seat metal ring for peaceful sleep.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CULINARY SAFETY & INTERACTIVE HINDI PHRASEBOOK    */}
          {/* ========================================================= */}
          {activeTab === 'culinary' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* Interactive Spice Level Selector */}
              <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#1F1C18] font-display flex items-center gap-2">
                      <Flame className="w-5 h-5 text-[#EA580C]" />
                      <span>Interactive Spice Level Assistant</span>
                    </h3>
                    <p className="text-xs text-[#8C827A]">
                      Select your heat tolerance to see custom ordering advice & remedy tips
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#EA580C] bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#FFEDD5] self-start sm:self-auto">
                    {spicePreference === 'mild' ? '🌿 Mild / No Chili' : spicePreference === 'medium' ? '🌶️ Moderate Spice' : spicePreference === 'spicy' ? '🔥 Authentic Desi' : '💥 High Fire'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'mild', label: 'Mild (Tourist Safe)', icon: '🌿', desc: 'Zero whole green chillies' },
                    { id: 'medium', label: 'Medium (Aromatic)', icon: '🌶️', desc: 'Cardamom, cumin, mild heat' },
                    { id: 'spicy', label: 'Authentic Indian', icon: '🔥', desc: 'Standard local palate' },
                    { id: 'fiery', label: 'Rajasthani Fire', icon: '💥', desc: 'Laal Maas & green chillies' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSpicePreference(s.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        spicePreference === s.id
                          ? 'bg-[#FFF7ED] border-[#EA580C] shadow-xs'
                          : 'bg-[#FAF8F5] border-[#EAE5DC] hover:border-[#FDBA74]'
                      }`}
                    >
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="text-xs font-bold text-[#1F1C18]">{s.label}</div>
                      <div className="text-[11px] text-[#8C827A] mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Advice based on selected spice */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#FDBA74] text-xs sm:text-sm text-[#7C2D12] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>💡 What to tell your server:</span>
                  </div>
                  {spicePreference === 'mild' && (
                    <p>Tell the waiter: <strong>"Kam Theekha kijiye, bina hari mirch ke"</strong>. Safe dishes to order: Butter Paneer/Chicken, Malai Kofta, Dal Makhani, Idli-Sambar, or Biryani with cooling cucumber raita.</p>
                  )}
                  {spicePreference === 'medium' && (
                    <p>Tell the waiter: <strong>"Medium theekha rakhein"</strong>. You will savor fragrant ginger, cloves, and Kashmiri red chili (which gives brilliant red color with mild, pleasant warmth).</p>
                  )}
                  {spicePreference === 'spicy' && (
                    <p>Enjoy standard local curries, samosas, and chole bhature. Keep a glass of sweet lassi or a bowl of plain sweet curd (dahi) at the table as a backup palate cleanser!</p>
                  )}
                  {spicePreference === 'fiery' && (
                    <p>You love heat! Try Rajasthani Laal Maas (red mutton in Mathania chilies), Kolhapuri Tambada Rassa, or spicy Chettinad pepper chicken. Drink buttermilk (chaas) to soothe stomach digestion.</p>
                  )}
                </div>
              </div>

              {/* Interactive Hindi Food & Transit Phrasebook */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-[#1F1C18] font-display flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-[#D97706]" />
                    <span>Essential Hindi Travel Phrases (Audio & Copy)</span>
                  </h3>
                  <span className="text-xs text-[#8C827A]">Tap 🔊 to listen or copy to clipboard</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredPhrases.map(phrase => (
                    <div 
                      key={phrase.id}
                      className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-2xs hover:shadow-sm transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-lg font-extrabold text-[#1F1C18] font-sans">
                            {phrase.hindi}
                          </div>
                          <div className="text-xs font-bold text-[#FF6F59]">
                            "{phrase.transliteration}"
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSpeak(phrase.hindi)}
                            className="p-2 rounded-xl bg-[#F4F1EB] hover:bg-[#FFE8E2] hover:text-[#FF6F59] text-[#524B44] transition-colors"
                            title="Hear Pronunciation"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCopy(phrase.transliteration, phrase.id)}
                            className="p-2 rounded-xl bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#524B44] transition-colors"
                            title="Copy Phrase"
                          >
                            {copiedPhrase === phrase.id ? (
                              <Check className="w-4 h-4 text-[#10B981]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-[#1F1C18]">
                        Meaning: <span className="font-normal text-[#524B44]">{phrase.meaning}</span>
                      </div>

                      <div className="text-[11px] text-[#8C827A] italic bg-[#FAF8F5] p-2 rounded-xl border border-[#F0ECE4]">
                        💡 {phrase.tip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Golden Rules of Eating Out in India */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#1F1C18] font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                  <span>4 Golden Rules for 100% Stomach Peace</span>
                </h3>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {CULINARY_SAFETY_TIPS.map((tip, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#EAE5DC] space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <h4 className="text-xs font-bold text-[#1F1C18]">{tip.title}</h4>
                      </div>
                      <p className="text-xs text-[#524B44] leading-relaxed">
                        {tip.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: REGIONAL FESTIVALS & DRESS CODE CALENDAR          */}
          {/* ========================================================= */}
          {activeTab === 'festivals' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* Regional filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <span className="text-xs font-bold text-[#8C827A] whitespace-nowrap">Filter Region:</span>
                {[
                  { id: 'all', label: 'All Festivals' },
                  { id: 'jaipur', label: 'Rajasthan' },
                  { id: 'varanasi', label: 'Varanasi (UP)' },
                  { id: 'kerala', label: 'Kerala & South' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setFestivalRegion(r.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      festivalRegion === r.id
                        ? 'bg-[#BE185D] text-white shadow-xs'
                        : 'bg-white text-[#524B44] border border-[#EAE5DC] hover:border-[#FBCFE8]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Festival Cards */}
              <div className="grid gap-5">
                {filteredFestivals.map((fest, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-sm space-y-4 overflow-hidden">
                    
                    {/* Photographic Header for Festival */}
                    {fest.imageUrl && (
                      <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-xs">
                        <img 
                          src={fest.imageUrl} 
                          alt={fest.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-bold text-[#BE185D] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-2xs">
                            {fest.timing}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-bold text-[#10B981] bg-black/55 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/20">
                            ✓ Tourist Welcomed
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="text-xs text-white/90 flex items-center gap-1.5 font-medium mb-1 drop-shadow-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#F472B6]" />
                            <span>{fest.place || fest.region}</span>
                          </div>
                          <h4 className="text-base sm:text-xl font-black font-display text-white drop-shadow-sm">
                            {fest.name}
                          </h4>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-[#BE185D] bg-[#FCE7F3] px-2.5 py-0.5 rounded-full">
                            {fest.timing}
                          </span>
                          <span className="text-xs text-[#8C827A] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#FF6F59]" />
                            {fest.region}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-[#1F1C18] font-display">
                          {fest.name}
                        </h3>
                      </div>

                      <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-3 py-1 rounded-xl border border-[#A7F3D0] self-start sm:self-auto">
                        Tourist Welcomed
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                      {fest.description}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] text-xs space-y-1">
                        <div className="font-bold text-[#1F1C18] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#BE185D]" />
                          <span>Cultural Etiquette & Dress Code</span>
                        </div>
                        <p className="text-[#524B44] leading-relaxed">
                          {fest.touristEtiquette}
                        </p>
                      </div>

                      <div className="p-3 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] text-xs space-y-1">
                        <div className="font-bold text-[#16A34A] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>Photography Advisory</span>
                        </div>
                        <p className="text-[#15803D] leading-relaxed">
                          Photography is encouraged at processions and outdoor ghats. In innermost temple shrines, look for "No Photography" signs and always ask before photographing sadhus or priests.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: CULTURAL BUYS, GI TAGS & BARGAINING GUIDE          */}
          {/* ========================================================= */}
          {activeTab === 'shopping' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* GI Tag Explanation Banner */}
              <div className="p-5 bg-[#FAF5FF] rounded-2xl border border-[#DDD6FE] text-xs sm:text-sm text-[#6B21A8] shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white text-[#7E22CE] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-[#581C87] text-sm sm:text-base flex items-center gap-2">
                    <span>GI (Geographical Indication) Certified Souvenirs</span>
                    <span className="text-[10px] bg-[#7E22CE] text-white px-2 py-0.5 rounded-full uppercase">Authentic</span>
                  </div>
                  <p className="leading-relaxed text-[#4C1D95]">
                    India's GI tag is a government intellectual property certification protecting century-old artisan traditions. Buying GI certified ensures your money directly supports authentic weaver and craftsman families, not factory copies.
                  </p>
                </div>
              </div>

              {/* Interactive Craft Authenticity Checker */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8C827A]">
                  Select Heritage Craft to view Authenticity Tests:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FAMOUS_CULTURAL_BUYS.map((craft, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCraftIndex(idx)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeCraftIndex === idx
                          ? 'bg-white border-[#7E22CE] shadow-md ring-2 ring-[#7E22CE]/20'
                          : 'bg-white/80 border-[#EAE5DC] hover:border-[#DDD6FE] text-[#524B44]'
                      }`}
                    >
                      <div className="text-xs font-extrabold text-[#7E22CE] mb-0.5">{craft.region}</div>
                      <div className="text-xs font-bold text-[#1F1C18] line-clamp-2">{craft.craft}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Craft Detailed Guide */}
              {FAMOUS_CULTURAL_BUYS[activeCraftIndex] && (() => {
                const currentCraft = FAMOUS_CULTURAL_BUYS[activeCraftIndex];
                return (
                  <div className="p-6 rounded-3xl bg-white border border-[#EAE5DC] shadow-sm space-y-4">
                    
                    {/* Photographic Header for Cultural Craft */}
                    {currentCraft.imageUrl && (
                      <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-xs">
                        <img 
                          src={currentCraft.imageUrl} 
                          alt={currentCraft.craft} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-bold text-white bg-[#7E22CE]/90 backdrop-blur-md px-3 py-1 rounded-full">
                            Region: {currentCraft.region}
                          </span>
                        </div>
                        {currentCraft.giTag && (
                          <div className="absolute top-3 right-3">
                            <span className="text-xs font-bold text-[#10B981] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-2xs">
                              ✓ Official GI Certified
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="text-xs text-white/90 flex items-center gap-1.5 font-medium mb-1 drop-shadow-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#DDD6FE]" />
                            <span>{currentCraft.place}</span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black font-display text-white drop-shadow-sm">
                            {currentCraft.craft}
                          </h4>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#7E22CE] bg-[#FAF5FF] px-2.5 py-0.5 rounded-full">
                            Region: {currentCraft.region}
                          </span>
                          {currentCraft.giTag && (
                            <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">
                              ✓ Official GI Certified
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-[#1F1C18] font-display">
                          {currentCraft.craft}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#1F1C18] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        <span>30-Second Authenticity Inspection Checklist:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed">
                        {currentCraft.whatToLookFor}
                      </p>
                    </div>

                    <div className="p-4 bg-[#FAF5FF] rounded-2xl border border-[#DDD6FE] space-y-1 text-xs sm:text-sm text-[#6B21A8]">
                      <div className="font-bold flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#7E22CE]" />
                        <span>Verified Government & Master Artisan Co-Ops:</span>
                      </div>
                      <p className="text-[#581C87] font-medium">
                        {currentCraft.whereToBuy}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Respectful Bargaining & Fair Pricing Rules */}
              <div className="p-5 rounded-3xl bg-white border border-[#EAE5DC] space-y-3">
                <h4 className="text-sm font-bold text-[#1F1C18] font-display flex items-center gap-2">
                  <span>🤝 Tourist Bargaining Etiquette (Bazaar vs Showroom)</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-[#524B44]">
                  <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC]">
                    <span className="font-bold text-[#1F1C18] block mb-1">🏛️ State Emporiums (Fixed Price)</span>
                    Outlets like <strong>Rajasthali</strong> (Rajasthan), <strong>Kairali</strong> (Kerala), or <strong>Cottage Industries Exposition</strong> have fixed price tags. No bargaining is needed or accepted; quality is 100% government guaranteed.
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC]">
                    <span className="font-bold text-[#1F1C18] block mb-1">🛍️ Street Bazaars & Flea Markets</span>
                    Bargaining is viewed as a friendly social dance. Start with a pleasant smile, counter with approximately 60–70% of the opening quote, and settle cordially in the middle. Always stay polite and playful.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: EMERGENCY HELPLINES & SAFETY                       */}
          {/* ========================================================= */}
          {activeTab === 'emergency' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              <div className="p-4 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] text-xs sm:text-sm text-[#065F46] flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#10B981] shrink-0" />
                <div>
                  <strong>Emergency Telephony in India:</strong> All Indian SIM cards (Airtel, Jio) and international roaming phones can dial these 3-digit and 4-digit emergency numbers toll-free 24/7 without country codes.
                </div>
              </div>

              <div className="grid gap-3.5">
                {emergencyHelplines.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-3xl border transition-all ${
                      item.primary 
                        ? 'bg-white border-[#10B981] ring-2 ring-[#10B981]/15 shadow-sm' 
                        : 'bg-white border-[#EAE5DC]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-black text-xl font-display">
                          {item.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-[#1F1C18]">{item.name}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F1EB] text-[#524B44]">
                              {item.badge}
                            </span>
                          </div>
                          <div className="text-xs text-[#8C827A]">{item.authority}</div>
                        </div>
                      </div>

                      <a
                        href={`tel:${item.number}`}
                        className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call {item.number}</span>
                      </a>
                    </div>

                    <p className="text-xs sm:text-sm text-[#524B44] leading-relaxed mt-2">
                      {item.desc}
                    </p>

                    <div className="text-[11px] text-[#64748B] mt-2 pt-2 border-t border-[#F0ECE4]">
                      <strong>Languages Supported:</strong> {item.languages}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
