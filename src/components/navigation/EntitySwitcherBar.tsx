import React from 'react';
import { 
  Compass, 
  Store, 
  Building, 
  Layers,
  Radio
} from 'lucide-react';
import { AppEntity } from '../../types/entity';

interface EntitySwitcherBarProps {
  currentEntity: AppEntity;
  onSelectEntity: (entity: AppEntity) => void;
  onOpenEcosystemModal?: () => void;
}

export const EntitySwitcherBar: React.FC<EntitySwitcherBarProps> = ({
  currentEntity,
  onSelectEntity,
}) => {
  const entities: {
    id: AppEntity;
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
    activeBg: string;
    activeText: string;
    borderColor: string;
    tag: string;
  }[] = [
    {
      id: 'tourist',
      label: 'Tourist App',
      sublabel: 'Travelers & Visitors',
      icon: Compass,
      activeBg: 'bg-[#0284C7]',
      activeText: 'text-white',
      borderColor: 'border-[#0284C7]',
      tag: '8 Pillars'
    },
    {
      id: 'business',
      label: 'Business Dashboard',
      sublabel: 'Merchants & Hoteliers',
      icon: Store,
      activeBg: 'bg-[#059669]',
      activeText: 'text-white',
      borderColor: 'border-[#059669]',
      tag: 'Quality & Footfall'
    },
    {
      id: 'authority',
      label: 'Authority Dashboard',
      sublabel: 'Ministry, ASI & Police',
      icon: Building,
      activeBg: 'bg-[#E11D48]',
      activeText: 'text-white',
      borderColor: 'border-[#E11D48]',
      tag: 'Heatmaps & Telemetry'
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#EAE5DC] px-2.5 sm:px-6 py-2 shadow-2xs sticky top-[57px] sm:top-[63px] z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left: Entities Switcher Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
          <span className="hidden md:flex items-center gap-1 text-[11px] font-extrabold uppercase text-[#8C827A] tracking-wider pr-1 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>Select Entity:</span>
          </span>

          <div className="flex items-center p-1 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] gap-1 w-full sm:w-auto">
            {entities.map(ent => {
              const Icon = ent.icon;
              const isActive = currentEntity === ent.id;
              return (
                <button
                  key={ent.id}
                  id={`entity-switch-${ent.id}-btn`}
                  onClick={() => onSelectEntity(ent.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none justify-center ${
                    isActive
                      ? `${ent.activeBg} ${ent.activeText} shadow-xs`
                      : 'text-[#5A524C] hover:text-[#191715] hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  <span className="text-xs">{ent.label}</span>
                  <span className={`hidden lg:inline text-[9px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#EAE5DC] text-[#665E55]'
                  }`}>
                    {ent.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Entity Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] font-bold text-[#665E55] shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Active: <strong className="text-[#191715]">{currentEntity === 'tourist' ? 'Tourist App' : currentEntity === 'business' ? 'Business Portal' : 'Authority Console'}</strong></span>
        </div>

      </div>
    </div>
  );
};
