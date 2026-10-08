import React from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { SuperCard } from '../tourist/SuperCard';
import { MainNavTab } from '../BottomNavBar';

interface SuperCardPageProps {
  onBack: () => void;
  onSelectTab: (tab: MainNavTab) => void;
}

export const SuperCardPage: React.FC<SuperCardPageProps> = ({ onBack }) => {
  return (
    <div className="animate-in fade-in duration-300 space-y-4">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center hover:bg-[#F0EDE8] transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-[#665E55]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#183E35] to-[#244D40] flex items-center justify-center shadow-sm">
            <CreditCard className="w-4 h-4 text-[#F3D997]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#1F1C18] tracking-tight">
              SUPER Card
            </h1>
            <p className="text-[11px] text-[#8C827A] font-medium">
              Membership, quests & rewards
            </p>
          </div>
        </div>
      </div>

      {/* SuperCard Component */}
      <SuperCard />

      {/* Spacer for bottom nav */}
      <div className="h-4" />
    </div>
  );
};
