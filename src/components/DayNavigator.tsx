import React from 'react';
import { Calendar, CloudSun, Filter, Plus, BookOpen, Train, Landmark, Utensils, ShoppingBag, Sparkles, MapPin } from 'lucide-react';
import { DayPlan, ItineraryCategory } from '../types/travel';

interface DayNavigatorProps {
  days: DayPlan[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  selectedCategory: ItineraryCategory | 'all';
  onSelectCategory: (cat: ItineraryCategory | 'all') => void;
  categoryCounts: Record<string, number>;
  onSelectGuides?: () => void;
  prerequisites?: React.ReactNode;
}

export const DayNavigator: React.FC<DayNavigatorProps> = ({
  days,
  selectedDayIndex,
  onSelectDay,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  onSelectGuides: _onSelectGuides,
  prerequisites,
}) => {

  const categories: { id: ItineraryCategory | 'all'; label: string; countKey: string }[] = [
    { id: 'all', label: 'All Stops', countKey: 'all' },
    { id: 'transit', label: 'Transit', countKey: 'transit' },
    { id: 'cultural_sight', label: 'Cultural Sights', countKey: 'cultural_sight' },
    { id: 'culinary', label: 'Culinary Spots', countKey: 'culinary' },
    { id: 'cultural_buy', label: 'Things to Buy', countKey: 'cultural_buy' },
    { id: 'festival', label: 'Festivals', countKey: 'festival' },
  ];

  const categoryIcons = { all: MapPin, transit: Train, cultural_sight: Landmark, culinary: Utensils, cultural_buy: ShoppingBag, festival: Sparkles };

  return (
    <div className="space-y-4 mb-6">
      
      {/* Day Selector Ribbon (Archival Travel Itinerary Ribbon) */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        {days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day.dayNumber}
              id={`day-tab-btn-${day.dayNumber}`}
              aria-pressed={isSelected}
              onClick={() => onSelectDay(idx)}
              className={`shrink-0 px-4 py-3 rounded-2xl transition-all text-left relative flex flex-col justify-between min-w-[130px] border cursor-pointer ${
                isSelected
                  ? 'bg-[#191715] text-white border-[#191715] shadow-sm'
                  : 'bg-white text-[#191715] border-[#E8E2D9] hover:border-[#191715]/40 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                  isSelected ? 'text-[#FFA07A]' : 'text-[#665E55]'
                }`}>
                  Day {day.dayNumber}
                </span>
                <span className="text-xs">{day.weather.icon}</span>
              </div>

              <div className="font-extrabold text-sm sm:text-base leading-tight font-serif-display">
                {day.date}
              </div>

              <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1 border-t border-white/10">
                <span className={`font-semibold ${isSelected ? 'text-white/90' : 'text-[#665E55]'}`}>
                  {day.city.split(' ')[0]}
                </span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-white/70' : 'text-[#8C827A]'}`}>
                  {day.weather.temp}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {prerequisites}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        <div className="flex items-center gap-1.5 text-xs text-[#8C827A] font-medium pr-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter:</span>
        </div>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.countKey] || 0;
          const CategoryIcon = categoryIcons[cat.id];
          return (
            <button
              key={cat.id}
              id={`cat-filter-btn-${cat.id}`}
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(cat.id)}
              className={`min-h-11 shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-[#1F1C18] text-white border-[#1F1C18] shadow-xs'
                  : 'bg-white text-[#5A524C] border-[#EAE5DC] hover:border-[#D1C9BE] hover:bg-[#FAF8F5]'
              }`}
            >
              <CategoryIcon aria-hidden="true" className="h-4 w-4" /><span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-[#F2ECE2] text-[#8C827A]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
