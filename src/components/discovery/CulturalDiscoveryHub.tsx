import React from 'react';
import { 
  Train, 
  Utensils, 
  Sparkles, 
  ShoppingBag, 
  BookOpen, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { MainNavTab } from '../BottomNavBar';

export interface DiscoveryItem {
  id: MainNavTab;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  gradient: string;
}

export const DISCOVERY_FEATURES: DiscoveryItem[] = [
  {
    id: 'transit',
    title: 'Transit Hub & Auto Fares',
    subtitle: 'Vande Bharat schedules, Metro QR & official pre-paid auto rate cards',
    tag: 'Live Transit',
    tagColor: 'bg-blue-100 text-[#0284C7] border-blue-200',
    icon: Train,
    color: 'text-[#0284C7]',
    gradient: 'from-blue-500/10 to-sky-500/5',
  },
  {
    id: 'culinary',
    title: 'Food Safety & Hygiene',
    subtitle: 'FSSAI standards, filtered water rules & verified street food hotspots',
    tag: 'FSSAI Verified',
    tagColor: 'bg-emerald-100 text-[#059669] border-emerald-200',
    icon: Utensils,
    color: 'text-[#059669]',
    gradient: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    id: 'crafts',
    title: 'GI Crafts & Souvenirs',
    subtitle: 'Certified handloom silk, Jaipur blue pottery & brass artisan guilds',
    tag: 'GI Authenticity',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: ShoppingBag,
    color: 'text-amber-700',
    gradient: 'from-amber-500/10 to-orange-500/5',
  },
  {
    id: 'festivals',
    title: 'Festivals & Rituals',
    subtitle: 'Celebrate with local schedules, aarti timings, and respectful visitor guidance',
    tag: 'Local Calendar',
    tagColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    icon: Sparkles,
    color: 'text-fuchsia-700',
    gradient: 'from-fuchsia-500/10 to-rose-500/5',
  },
  {
    id: 'guides',
    title: 'Verified Local Guides',
    subtitle: 'Find ASI-certified guides for a safer, more meaningful visit',
    tag: 'ASI Certified',
    tagColor: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: UserCheck,
    color: 'text-teal-700',
    gradient: 'from-teal-500/10 to-emerald-500/5',
  },
  {
    id: 'guide',
    title: 'Travel Etiquette Guide',
    subtitle: 'Essential local customs, bargaining tips, and visitor know-how',
    tag: 'Traveler Tips',
    tagColor: 'bg-stone-100 text-stone-700 border-stone-200',
    icon: BookOpen,
    color: 'text-stone-700',
    gradient: 'from-stone-500/10 to-amber-500/5',
  },
];

interface CulturalDiscoveryHubProps {
  onSelectFeature: (tab: MainNavTab) => void;
  variant?: 'grid' | 'pills' | 'compact';
  title?: string;
  description?: string;
  className?: string;
}

export const CulturalDiscoveryHub: React.FC<CulturalDiscoveryHubProps> = ({
  onSelectFeature,
  variant = 'grid',
  title = 'Explore the local experience',
  description = 'Helpful local tools for getting around, eating safely, celebrating respectfully, and shopping with confidence.',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <div className={`overflow-x-auto pb-2 scrollbar-none ${className}`}>
        <div className="flex items-center gap-2 min-w-max">
          {DISCOVERY_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`discovery-pill-${item.id}`}
                onClick={() => onSelectFeature(item.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#EAE5DC] text-[#191715] hover:border-[#C84B31]/40 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight group-hover:text-[#C84B31] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#8C827A] font-semibold leading-tight">
                    {item.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl border border-[#EAE5DC] p-5 sm:p-6 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#F0ECE4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C84B31] animate-pulse" />
            <h3 className="text-base font-black text-[#191715]">{title}</h3>
          </div>
          {description && (
            <p className="text-xs text-[#665E55] mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE5DC] text-[#8C827A] self-start sm:self-auto">
          6 local tools
        </span>
      </div>

      {/* Local discovery tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {DISCOVERY_FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`discovery-card-${item.id}`}
              onClick={() => onSelectFeature(item.id)}
              className="p-4 rounded-2xl border border-[#EAE5DC] hover:border-[#C84B31]/50 bg-[#FAF8F5]/60 hover:bg-white transition-all text-left group flex flex-col justify-between gap-3 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} border border-white shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${item.color} stroke-[2.2]`} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>

                <h4 className="text-sm font-black text-[#191715] group-hover:text-[#C84B31] transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#665E55] mt-1 leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EAE5DC]/60 flex items-center justify-between text-xs font-bold text-[#8C827A] group-hover:text-[#C84B31] transition-colors">
                <span>Explore Toolkit</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
