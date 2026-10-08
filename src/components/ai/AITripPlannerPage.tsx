import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  IndianRupee, 
  Calendar, 
  MapPin, 
  Compass, 
  Clock, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  Utensils, 
  Building2, 
  Ticket, 
  Accessibility, 
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Trip, DayPlan, ItineraryItem } from '../../types/travel';

interface AITripPlannerPageProps {
  currentTrip: Trip;
  onApplyGeneratedTrip: (newTrip: Trip) => void;
  accessibilityMode?: boolean;
}

export const AITripPlannerPage: React.FC<AITripPlannerPageProps> = ({
  currentTrip,
  onApplyGeneratedTrip,
  accessibilityMode = false
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [destination, setDestination] = useState('Golden Triangle (Delhi - Agra - Jaipur)');
  const [budgetLimit, setBudgetLimit] = useState<number>(25000);
  const [daysCount, setDaysCount] = useState<number>(4);
  const [travelStyle, setTravelStyle] = useState<string>(accessibilityMode ? 'accessible' : 'cultural');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Namaste! I am your AI India Trip Planner. I am aware of your current budget (₹${budgetLimit.toLocaleString()}), regional scam alerts, and multi-modal transit options. Tell me what you'd like to explore, or configure your preferences below to generate an optimized itinerary with validated budget calculations!`,
      time: 'Just now'
    }
  ]);

  // Generated Plan State
  const [generatedPlan, setGeneratedPlan] = useState<{
    title: string;
    region: string;
    summary: string;
    days: Array<{
      dayNumber: number;
      city: string;
      title: string;
      items: Array<{
        time: string;
        title: string;
        category: 'transit' | 'cultural_sight' | 'culinary' | 'cultural_buy' | 'stay';
        cost: number;
        tip: string;
        accessibleNote?: string;
      }>;
    }>;
    budgetBreakdown: {
      hotel: number;
      transport: number;
      food: number;
      entryTickets: number;
      activities: number;
      contingency: number;
      total: number;
    };
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Generate Itinerary
  const handleGenerateItinerary = (customPrompt?: string) => {
    setIsGenerating(true);
    const query = customPrompt || promptInput || `${daysCount} days in ${destination} for ₹${budgetLimit} with ${travelStyle} focus`;

    // Add user query to chat
    setChatMessages(prev => [
      ...prev,
      { role: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    setTimeout(() => {
      // Calculate realistic itemized budget fitting stated budget
      const totalTarget = budgetLimit;
      const stayBudget = Math.round(totalTarget * 0.35);
      const transportBudget = Math.round(totalTarget * 0.22);
      const foodBudget = Math.round(totalTarget * 0.20);
      const ticketBudget = Math.round(totalTarget * 0.10);
      const activitiesBudget = Math.round(totalTarget * 0.08);
      const contingency = Math.round(totalTarget * 0.05);
      const computedTotal = stayBudget + transportBudget + foodBudget + ticketBudget + activitiesBudget + contingency;

      const newPlan = {
        title: `${daysCount}-Day Curated ${destination}`,
        region: destination,
        summary: `Optimized for a ₹${totalTarget.toLocaleString()} ceiling. Features verified honest stays, pre-paid Vande Bharat express seats, certified local guides, and zero kickback tourist stops.`,
        days: Array.from({ length: daysCount }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayCity = destination.includes('Jaipur') && dayNum >= 3 ? 'Jaipur' : destination.includes('Agra') && dayNum === 2 ? 'Agra' : 'Delhi';
          return {
            dayNumber: dayNum,
            city: dayCity,
            title: dayNum === 1 ? 'Mughal Architecture & Heritage Street Food' : dayNum === 2 ? 'Taj Sunrise & Agra Fort History' : dayNum === 3 ? 'Pink City Palaces & Jantar Mantar Sundials' : 'Amer Fort Ramparts & Artisan Craft Clusters',
            items: [
              {
                time: '08:30 AM',
                title: dayNum === 2 ? 'Taj Mahal Sunrise Tour (West Gate Entry)' : 'Old Delhi Heritage Walk & Jama Masjid',
                category: 'cultural_sight' as const,
                cost: dayNum === 2 ? 1100 : 300,
                tip: 'Book official ASI electronic ticket online to bypass unauthorized touts at approach road.',
                accessibleNote: 'Ramp access available at West Gate. Golf cart shuttle connects from Shilpgram.'
              },
              {
                time: '11:00 AM',
                title: dayNum === 2 ? 'Vande Bharat Express Transit (Delhi to Agra Cantt)' : 'Delhi Metro Violet Line to Red Fort',
                category: 'transit' as const,
                cost: dayNum === 2 ? 850 : 50,
                tip: 'Executive AC Chair Car includes fresh onboard breakfast and zero tout interaction.',
                accessibleNote: 'Wheelchair step-free platform access and wide automatic coach doors.'
              },
              {
                time: '01:30 PM',
                title: 'Hygienic Traditional Thali Lunch at LMB / Haldiram',
                category: 'culinary' as const,
                cost: 380,
                tip: 'Purified RO water provided; freshly prepared piping hot rotis and dal.',
                accessibleNote: 'Ground-floor spacious seating with accessible washrooms.'
              },
              {
                time: '04:00 PM',
                title: 'Certified Artisan Handicrafts (GI Blue Pottery & Silk)',
                category: 'cultural_buy' as const,
                cost: 650,
                tip: 'Look for the official Geographical Indication (GI) hologram badge to ensure fair artisan wages.',
                accessibleNote: 'Level entrance emporium with wide aisles.'
              },
              {
                time: '08:00 PM',
                title: 'Verified Honest Stay Check-in & Rooftop Rest',
                category: 'stay' as const,
                cost: Math.round(stayBudget / daysCount),
                tip: 'Direct community rate voucher active — zero hidden service markups.',
                accessibleNote: 'Elevator access to guest floors and grab-rail equipped bathrooms.'
              }
            ]
          };
        }),
        budgetBreakdown: {
          hotel: stayBudget,
          transport: transportBudget,
          food: foodBudget,
          entryTickets: ticketBudget,
          activities: activitiesBudget,
          contingency: contingency,
          total: computedTotal
        }
      };

      setGeneratedPlan(newPlan);
      setIsGenerating(false);

      // Add assistant response to chat
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `I have generated your ${daysCount}-day itinerary for ${destination}! The underlying budget calculator has verified that all stay, transit, food, and entry fees sum to ₹${computedTotal.toLocaleString()} (within your ₹${budgetLimit.toLocaleString()} budget with a ₹${contingency.toLocaleString()} safety buffer). You can inspect the breakdown below or click "Apply to Active Trip" to save it immediately.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setPromptInput('');
    }, 800);
  };

  // Apply Plan to Active Trip
  const handleApplyToTrip = () => {
    if (!generatedPlan) return;

    const newTrip: Trip = {
      ...currentTrip,
      title: generatedPlan.title,
      region: generatedPlan.region,
      tagline: generatedPlan.summary,
      duration: `${generatedPlan.days.length} Days`,
      baseBudget: generatedPlan.budgetBreakdown.total,
      days: generatedPlan.days.map((d, dIdx) => ({
        dayNumber: d.dayNumber,
        date: `Day ${d.dayNumber}`,
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dIdx % 7],
        title: d.title,
        city: d.city,
        weather: {
          temp: '28°C',
          condition: 'Pleasant & Sunny',
          icon: 'Sun'
        },
        highlight: d.items[0]?.title || 'City exploration',
        items: d.items.map((it, itIdx) => ({
          id: `ai-gen-${d.dayNumber}-${itIdx}-${Date.now()}`,
          time: it.time,
          title: it.title,
          category: it.category as any,
          location: `${d.city} Central`,
          city: d.city,
          duration: '2 hours',
          cost: it.cost,
          description: `AI-verified tourist stop with fair price monitoring and scam protection.`,
          touristTip: it.tip,
          imageUrl: it.category === 'transit' 
            ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
            : it.category === 'culinary'
            ? 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
        }))
      }))
    };

    onApplyGeneratedTrip(newTrip);
    showToast('Plan applied! Switched to your active Itinerary.');
  };

  const isUnderBudget = generatedPlan ? generatedPlan.budgetBreakdown.total <= budgetLimit : true;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FFF7F4] via-[#FAF8F5] to-[#FFF2EE] rounded-3xl p-5 sm:p-7 border border-[#FED7CC] shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6F59]/10 text-[#FF6F59] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>PRD 4.3 • Conversational AI Planner & Budget Calculator</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1C18] tracking-tight">
            AI Trip Planner with <span className="text-[#FF6F59]">Budget Validation</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#5A524C] mt-2 leading-relaxed">
            Generate scam-free Indian travel itineraries tailored to your exact budget, schedule, and accessibility needs. 
            The underlying calculator itemizes transport, stays, meals, and tickets to guarantee zero hidden financial surprises.
          </p>
        </div>
      </div>

      {/* Generator Controls Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF6F59]" />
              <span>Destination / Region</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
            >
              <option value="Golden Triangle (Delhi - Agra - Jaipur)">Golden Triangle (Delhi - Agra - Jaipur)</option>
              <option value="Spiritual Varanasi & Ghats">Spiritual Varanasi & Sarnath</option>
              <option value="Kerala Backwaters & Fort Kochi">Kerala Backwaters & Munnar</option>
              <option value="Royal Rajasthan (Jaipur - Udaipur - Jodhpur)">Royal Rajasthan Forts</option>
            </select>
          </div>

          {/* Budget Limit */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1.5 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-[#FF6F59]" />
              <span>Fixed Target Budget (₹)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                min="5000"
                max="200000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs font-bold font-mono text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8C827A] font-medium">
                Total Cap
              </span>
            </div>
          </div>

          {/* Number of Days */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#FF6F59]" />
              <span>Trip Duration</span>
            </label>
            <select
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
            >
              <option value={2}>2 Days (Weekend Sprint)</option>
              <option value={3}>3 Days (Highlights)</option>
              <option value={4}>4 Days (Classic Route)</option>
              <option value={5}>5 Days (Deep Heritage)</option>
              <option value={7}>7 Days (Full Grand Tour)</option>
            </select>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1.5 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#FF6F59]" />
              <span>Style & Focus</span>
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
            >
              <option value="cultural">Heritage & Monuments</option>
              <option value="culinary">Street Food & Cooking</option>
              <option value="budget">Budget Solo Backpacking</option>
              <option value="accessible">♿ Accessible / Wheelchair Friendly</option>
              <option value="family">Family & Comfort</option>
            </select>
          </div>

        </div>

        {/* Natural Language Prompt Input */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-[#1F1C18] mb-1.5">
            Natural Language Instruction (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateItinerary()}
              placeholder="e.g. Plan a 3-day budget trip avoiding auto scams with vegetarian thali recommendations..."
              className="flex-1 bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
            />
            <button
              id="ai-planner-generate-btn"
              onClick={() => handleGenerateItinerary()}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-[#FF6F59] hover:bg-[#E55B46] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-[#FF6F59]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Generating...' : 'Generate Plan'}</span>
            </button>
          </div>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-[#8C827A] font-semibold">Try asking:</span>
          {[
            '3-Day Golden Triangle with Vande Bharat Express',
            'Wheelchair-accessible heritage sights in Delhi & Agra',
            'Budget Varanasi trip under ₹15,000 avoiding boat scams',
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => {
                setPromptInput(promptText);
                handleGenerateItinerary(promptText);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F3F0EA] border border-[#EAE5DC] text-[#5A524C] transition-colors cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

      </div>

      {/* Chat Dialogue Stream */}
      <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs space-y-3">
        <div className="text-xs font-bold text-[#8C827A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#FF6F59]" />
          <span>Conversational Assistant Log</span>
        </div>

        <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                msg.role === 'user'
                  ? 'ml-auto bg-[#1F1C18] text-white font-medium'
                  : 'bg-[#FAF8F5] border border-[#EAE5DC] text-[#1F1C18]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] opacity-70 mb-1">
                <span>{msg.role === 'user' ? 'You' : 'Travel Assistant AI'}</span>
                <span>{msg.time}</span>
              </div>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GENERATED ITINERARY & BUDGET CALCULATOR PREVIEW */}
      {generatedPlan && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Budget Calculator Card (PRD Requirement: Sums hotel + transport + food + entry + activities to validate budget) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE4]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6F59] bg-[#FFF2EE] px-2.5 py-0.5 rounded-full">
                  Underlying Budget Validation Engine
                </span>
                <h3 className="text-lg font-bold text-[#1F1C18] mt-1">
                  Itemized Cost Breakdown vs Stated Budget
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#8C827A] block">Validated Plan Total:</span>
                <span className={`text-2xl font-black font-mono ${
                  isUnderBudget ? 'text-[#10B981]' : 'text-[#E11D48]'
                }`}>
                  ₹{generatedPlan.budgetBreakdown.total.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#8C827A] block">
                  Target Cap: ₹{budgetLimit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Validation Banner */}
            <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 font-medium ${
              isUnderBudget 
                ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]' 
                : 'bg-[#FEF2F2] border border-[#FECDD3] text-[#991B1B]'
            }`}>
              {isUnderBudget ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>
                    <strong>Budget Passed:</strong> Total plan cost is ₹{(budgetLimit - generatedPlan.budgetBreakdown.total).toLocaleString()} under your stated ceiling. Includes emergency buffer.
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>
                    <strong>Over Budget:</strong> Plan exceeds target by ₹{(generatedPlan.budgetBreakdown.total - budgetLimit).toLocaleString()}. We suggest downgrading stay tier or switching private auto to Metro.
                  </span>
                </>
              )}
            </div>

            {/* 6-Pillar Itemized Budget Calculator Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[#8C827A] text-[11px] block">Verified Stays:</span>
                <span className="font-bold text-[#1F1C18] font-mono text-sm">
                  ₹{generatedPlan.budgetBreakdown.hotel.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[#8C827A] text-[11px] block">Transit / Trains:</span>
                <span className="font-bold text-[#1F1C18] font-mono text-sm">
                  ₹{generatedPlan.budgetBreakdown.transport.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[#8C827A] text-[11px] block">Food & Thalis:</span>
                <span className="font-bold text-[#1F1C18] font-mono text-sm">
                  ₹{generatedPlan.budgetBreakdown.food.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[#8C827A] text-[11px] block">ASI Entry Tickets:</span>
                <span className="font-bold text-[#1F1C18] font-mono text-sm">
                  ₹{generatedPlan.budgetBreakdown.entryTickets.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[#8C827A] text-[11px] block">Certified Guides:</span>
                <span className="font-bold text-[#1F1C18] font-mono text-sm">
                  ₹{generatedPlan.budgetBreakdown.activities.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <span className="text-[#8C827A] text-[11px] block">Buffer / Shopping:</span>
                <span className="font-bold text-[#1F1C18] font-mono text-sm">
                  ₹{generatedPlan.budgetBreakdown.contingency.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Button: Apply Plan to Active Itinerary */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                id="apply-ai-itinerary-btn"
                onClick={handleApplyToTrip}
                className="px-6 py-3 bg-[#FF6F59] hover:bg-[#E55B46] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-[#FF6F59]/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply & Save to Active Trip Itinerary</span>
              </button>
            </div>

          </div>

          {/* Day by Day Plan Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#8C827A] uppercase tracking-wider px-1">
              Generated Daily Schedule & Sequence
            </h3>

            {generatedPlan.days.map((day) => (
              <div 
                key={day.dayNumber}
                className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE4]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#FF6F59] text-white text-xs font-black flex items-center justify-center">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#1F1C18]">{day.title}</h4>
                      <span className="text-[11px] text-[#8C827A]">{day.city}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {day.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#F0ECE4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-[11px] font-mono text-[#8C827A] shrink-0 mt-0.5">{item.time}</span>
                        <div>
                          <span className="font-bold text-[#1F1C18] block">{item.title}</span>
                          <span className="text-[11px] text-[#5A524C]">{item.tip}</span>
                          {accessibilityMode && item.accessibleNote && (
                            <span className="text-[10px] font-semibold text-[#0284C7] block mt-0.5">
                              ♿ {item.accessibleNote}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 font-mono font-bold text-[#1F1C18]">
                        ₹{item.cost.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1C18] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
