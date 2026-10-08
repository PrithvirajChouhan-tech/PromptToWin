import React from 'react';
import { Bot, ShieldCheck, Shield, UserCheck, ArrowRight } from 'lucide-react';
import { MainNavTab } from './BottomNavBar';

interface TravelerEssentialsProps {
  onSelectTab: (tab: MainNavTab) => void;
  onOpenSOS: () => void;
}

/** Keeps frequent traveler actions discoverable in one place. */
export const TravelerEssentials: React.FC<TravelerEssentialsProps> = ({
  onSelectTab,
  onOpenSOS,
}) => {
  const actions = [
    { id: 'trust', title: 'Community', detail: 'Reviews & fair prices', icon: ShieldCheck, tone: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { id: 'guides', title: 'Find a guide', detail: 'Verified local experts', icon: UserCheck, tone: 'bg-teal-50 border-teal-200 text-teal-700' },
  ] as const;

  return (
    <section className="bg-white rounded-3xl border border-[#EAE5DC] p-4 sm:p-5 shadow-xs" aria-label="Travel essentials">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#191715]">Travel essentials</h2>
          <p className="text-[11px] sm:text-xs text-[#665E55] mt-0.5">Plan, verify, and get local help without leaving your trip.</p>
        </div>
        <button type="button" id="traveler-essential-sos-btn" onClick={onOpenSOS} className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FECDD3] text-[#BE123C] text-xs font-extrabold transition-colors cursor-pointer">
          <Shield className="w-3.5 h-3.5" />
          Emergency SOS
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button type="button" key={action.id} id={`traveler-essential-${action.id}`} onClick={() => onSelectTab(action.id)} className="group flex items-center gap-3 text-left p-3 rounded-2xl border border-[#EAE5DC] hover:border-[#C84B31]/40 hover:bg-[#FFF9F7] transition-all cursor-pointer">
              <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${action.tone}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold text-[#191715]">{action.title}</span>
                <span className="block text-[10px] text-[#665E55] mt-0.5 truncate">{action.detail}</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9C948B] group-hover:text-[#C84B31] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </section>
  );
};
