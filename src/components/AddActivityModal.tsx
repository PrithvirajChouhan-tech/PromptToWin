import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Train, 
  Utensils, 
  ShoppingBag, 
  Landmark, 
  Sparkles 
} from 'lucide-react';
import { ItineraryCategory, ItineraryItem, TransitMode } from '../types/travel';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  city: string;
  onAdd: (item: Omit<ItineraryItem, 'id'>) => void;
}

const DEFAULT_CATEGORY_IMAGES: Record<ItineraryCategory, string> = {
  cultural_sight: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  transit: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
  culinary: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  cultural_buy: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  festival: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
  stay: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
};

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  city,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItineraryCategory>('cultural_sight');
  const [time, setTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('1h 30m');
  const [location, setLocation] = useState(city);
  const [cost, setCost] = useState('500');
  const [description, setDescription] = useState('');
  const [touristTip, setTouristTip] = useState('');
  const [imageUrl, setImageUrl] = useState(DEFAULT_CATEGORY_IMAGES.cultural_sight);

  // Specific extra fields
  const [transitMode, setTransitMode] = useState<TransitMode>('train');
  const [transitFrom, setTransitFrom] = useState('');
  const [transitTo, setTransitTo] = useState('');
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Authentic Spicy'>('Medium');
  const [itemToBuy, setItemToBuy] = useState('');
  const [festivalName, setFestivalName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const getCityCoordinates = (cityName: string) => {
      const lower = cityName.toLowerCase();
      const offset = (Math.random() - 0.5) * 0.015;
      if (lower.includes('delhi')) return { lat: 28.6139 + offset, lng: 77.2090 + offset };
      if (lower.includes('agra')) return { lat: 27.1767 + offset, lng: 78.0081 + offset };
      if (lower.includes('jaipur')) return { lat: 26.9124 + offset, lng: 75.7873 + offset };
      if (lower.includes('kochi')) return { lat: 9.9312 + offset, lng: 76.2673 + offset };
      if (lower.includes('alleppey')) return { lat: 9.4981 + offset, lng: 76.3388 + offset };
      if (lower.includes('varanasi')) return { lat: 25.3176 + offset, lng: 82.9739 + offset };
      return { lat: 28.6139 + offset, lng: 77.2090 + offset };
    };

    const newItem: Omit<ItineraryItem, 'id'> = {
      title,
      category,
      time,
      duration,
      location: location || city,
      city,
      cost: Number(cost) || 0,
      description: description || `Experience ${title} during your visit to ${city}.`,
      touristTip: touristTip || 'Check timings in advance and carry cash / UPI for small vendor transactions.',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      reviewsCount: 120,
      coordinates: getCityCoordinates(location || city),
    };

    if (category === 'transit') {
      newItem.transitDetails = {
        mode: transitMode,
        from: transitFrom || 'Current Station',
        to: transitTo || location,
        operator: 'IRCTC / Local Transit Operator',
        bookingTip: 'Book tickets in advance via IRCTC portal or official Metro QR app.'
      };
    } else if (category === 'culinary') {
      newItem.culinaryDetails = {
        specialties: [title, 'Local Regional Delicacy'],
        spiceLevel,
        isVegetarianFriendly: true
      };
    } else if (category === 'cultural_buy') {
      newItem.culturalBuyDetails = {
        itemToBuy: itemToBuy || title,
        giTagCertified: true,
        bargainTip: 'Compare in government emporiums first to benchmark standard price.',
        authenticPriceRange: `₹${cost || 500} - ₹2,500`
      };
    } else if (category === 'festival') {
      newItem.festivalDetails = {
        festivalName: festivalName || title,
        significance: 'Traditional celebration with lights, music, and regional customs.',
        dressCode: 'Comfortable modest Indian attire or smart casuals'
      };
    }

    onAdd(newItem);
    onClose();
  };

  const categories: { id: ItineraryCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'cultural_sight', label: 'Cultural Sight', icon: <Landmark className="w-4 h-4 text-[#EA580C]" /> },
    { id: 'transit', label: 'Local Transit', icon: <Train className="w-4 h-4 text-[#0284C7]" /> },
    { id: 'culinary', label: 'Food / Culinary', icon: <Utensils className="w-4 h-4 text-[#D97706]" /> },
    { id: 'cultural_buy', label: 'Thing to Buy', icon: <ShoppingBag className="w-4 h-4 text-[#7E22CE]" /> },
    { id: 'festival', label: 'Festival', icon: <Sparkles className="w-4 h-4 text-[#BE185D]" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="add-activity-modal-container"
        className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EAE5DC] p-5 sm:p-6 relative"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE4] mb-4">
          <div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFF0EB] text-[#FF6F59] uppercase tracking-wide">
              Day {dayNumber} • {city}
            </span>
            <h3 className="text-lg font-bold text-[#1F1C18] font-display">
              Add New Stop to Itinerary
            </h3>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#1F1C18] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1.5">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    if (Object.values(DEFAULT_CATEGORY_IMAGES).includes(imageUrl) || !imageUrl) {
                      setImageUrl(DEFAULT_CATEGORY_IMAGES[c.id]);
                    }
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all ${
                    category === c.id
                      ? 'bg-[#FDFBF7] border-[#FF6F59] ring-2 ring-[#FF6F59]/20 text-[#1F1C18]'
                      : 'border-[#EAE5DC] hover:bg-[#FAF8F5] text-[#6B635B]'
                  }`}
                >
                  {c.icon}
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1">
              Stop Title / Name *
            </label>
            <input
              id="new-activity-title"
              type="text"
              required
              placeholder="e.g. Amber Palace Sound & Light Show, Vande Bharat Express..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2 text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59] focus:bg-white"
            />
          </div>

          {/* Time & Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F1C18] mb-1">Time Slot</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 09:30 AM"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1C18] mb-1">Est. Duration</label>
              <input
                type="text"
                placeholder="e.g. 1h 45m"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
              />
            </div>
          </div>

          {/* Location & Cost Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F1C18] mb-1">Location / Landmark</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Pink City, Jaipur"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1C18] mb-1">Est. Cost (₹ INR)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-[#2E7D32] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="0 for free"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
                />
              </div>
            </div>
          </div>

          {/* Category-Specific fields */}
          {category === 'transit' && (
            <div className="p-3 bg-[#F0F9FF] rounded-xl border border-[#BAE6FD] space-y-2.5">
              <div className="text-xs font-bold text-[#0369A1]">Transit Leg Details</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="From (e.g. New Delhi Station)"
                  value={transitFrom}
                  onChange={e => setTransitFrom(e.target.value)}
                  className="bg-white border border-[#BAE6FD] rounded-lg px-2.5 py-1.5 text-xs text-[#1F1C18]"
                />
                <input
                  type="text"
                  placeholder="To (e.g. Agra Cantt)"
                  value={transitTo}
                  onChange={e => setTransitTo(e.target.value)}
                  className="bg-white border border-[#BAE6FD] rounded-lg px-2.5 py-1.5 text-xs text-[#1F1C18]"
                />
              </div>
              <div className="flex gap-2">
                {(['train', 'metro', 'rickshaw', 'boat', 'cab'] as TransitMode[]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransitMode(mode)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold capitalize ${
                      transitMode === mode ? 'bg-[#0284C7] text-white' : 'bg-white text-[#0369A1]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {category === 'culinary' && (
            <div className="p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] space-y-2">
              <div className="text-xs font-bold text-[#92400E]">Spice Level Preference</div>
              <div className="flex gap-2">
                {(['Mild', 'Medium', 'Authentic Spicy'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSpiceLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      spiceLevel === lvl ? 'bg-[#B45309] text-white' : 'bg-white text-[#92400E]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {category === 'cultural_buy' && (
            <div className="p-3 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE]">
              <label className="block text-xs font-bold text-[#6B21A8] mb-1">Authentic Craft / Souvenir Item</label>
              <input
                type="text"
                placeholder="e.g. Sanganeri block print scarf, Pashmina stole..."
                value={itemToBuy}
                onChange={e => setItemToBuy(e.target.value)}
                className="w-full bg-white border border-[#DDD6FE] rounded-lg px-2.5 py-1.5 text-xs text-[#1F1C18]"
              />
            </div>
          )}

          {/* Description & Tourist Tip */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1">Description & Highlights</label>
            <textarea
              rows={2}
              placeholder="What makes this stop iconic..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F1C18] mb-1">Tourist Insider Tip</label>
            <input
              type="text"
              placeholder="e.g. Dress code: covered shoulders, ask for pre-paid counter..."
              value={touristTip}
              onChange={e => setTouristTip(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#1F1C18] focus:outline-none focus:border-[#FF6F59]"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#EAE5DC] text-xs font-bold text-[#5A524C] hover:bg-[#FAF8F5]"
            >
              Cancel
            </button>
            <button
              id="confirm-add-activity-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#F25C44] text-white text-xs font-bold transition-all shadow-sm shadow-[#FF6F59]/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Day {dayNumber}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
