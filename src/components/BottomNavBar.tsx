import { usePlatform, navLabels } from "../services/journey";
import React from 'react';
import {
  Calendar,
  Map,
  Compass,
  Users,
  Sparkles
} from 'lucide-react';

export type MainNavTab =
  | 'home'
  | 'itinerary'
  | 'map'
  | 'trust'
  | 'safety'
  | 'ai_planner'
  | 'guides'
  | 'b2b'
  | 'transit'
  | 'culinary'
  | 'festivals'
  | 'crafts'
  | 'guide'
  | 'profile'
  | 'supercard'
  | 'explore'
  | 'fairprice';

export interface BottomNavBarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenSOS?: () => void;
  accessibilityMode?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSOS: _onOpenSOS,
  accessibilityMode: _accessibilityMode,
}) => {
  const { profile } = usePlatform();
  const lang = profile.language || "en";

  const navItems: {
    id: MainNavTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    isCenter?: boolean;
  }[] = [
    { id: 'itinerary', label: lang === 'hi' ? 'मेरी यात्रा' : 'My Trip', icon: Calendar },
    { id: 'map', label: lang === 'hi' ? 'मानचित्र' : 'Live Map', icon: Map },
    { id: 'explore', label: lang === 'hi' ? 'अन्वेषण' : 'Explore', icon: Compass, isCenter: true },
    { id: 'ai_planner', label: lang === 'hi' ? 'एआई प्लानर' : 'AI Planner', icon: Sparkles },
    { id: 'trust', label: lang === 'hi' ? 'समुदाय' : 'Community', icon: Users },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      className="fixed bottom-0 left-0 right-0 z-[1500] bg-white/98 backdrop-blur-xl border-t border-[#E8E2D9] px-1 sm:px-4 py-1 transition-all shadow-[0_-4px_25px_rgba(25,23,21,0.12)] overflow-visible"
    >
      <div className="max-w-xl mx-auto grid grid-cols-5 items-end justify-items-center gap-0 overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id
            || (item.id === 'map' && activeTab === 'safety')
            || (item.id === 'explore' && ['transit', 'culinary', 'festivals', 'crafts', 'guide', 'guides', 'fairprice'].includes(activeTab));

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center cursor-pointer group -mt-5 relative z-[1600] overflow-visible"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#183E35] to-[#244D40] text-[#F2DB9B] ring-2 ring-[#F2DB9B] shadow-[#183E35]/40 scale-105'
                    : 'bg-gradient-to-br from-[#183E35] to-[#244D40] text-[#F2DB9B] group-hover:scale-105 group-hover:shadow-[#183E35]/30'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className={`text-[10px] leading-tight text-center mt-1 ${
                  isActive ? 'font-black text-[#183E35]' : 'font-bold text-[#665E55]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-${item.id}-btn`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-14 gap-0.5 py-1 px-0.5 rounded-xl transition-all cursor-pointer w-full group ${isActive
                ? 'text-[#C84B31] font-bold'
                : 'text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <div className={`relative p-1 rounded-xl transition-colors flex items-center justify-center ${isActive ? 'bg-[#C84B31]/12 text-[#C84B31]' : 'group-hover:bg-[#FAF8F5]'
                }`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C84B31]" />
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] leading-tight text-center truncate max-w-full ${isActive ? 'font-black text-[#C84B31]' : 'font-medium'
                }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
