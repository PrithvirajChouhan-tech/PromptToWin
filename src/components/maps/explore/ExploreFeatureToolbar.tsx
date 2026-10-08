import React from 'react';
import { 
  Navigation2, 
  Search, 
  Compass, 
  FileText, 
  MapPin, 
  Sparkles, 
  Layers, 
  Store, 
  Box, 
  CloudSun,
  ChevronDown
} from 'lucide-react';

export type ExploreActiveTool = 
  | 'none' 
  | 'routes' 
  | 'autocomplete' 
  | 'nearby' 
  | 'textSearch' 
  | 'geocoding' 
  | 'grounding' 
  | 'styles' 
  | 'places' 
  | 'threeD' 
  | 'weather';

interface ExploreFeatureToolbarProps {
  activeTool: ExploreActiveTool;
  onSelectTool: (tool: ExploreActiveTool) => void;
  is3DActive?: boolean;
}

export const ExploreFeatureToolbar: React.FC<ExploreFeatureToolbarProps> = ({
  activeTool,
  onSelectTool,
  is3DActive = false,
}) => {
  const tools: Array<{
    id: ExploreActiveTool;
    label: string;
    icon: React.FC<{ className?: string }>;
    tier: 'ESSENTIALS' | 'PRO' | 'ENTERPRISE' | 'MCP';
    tierColor: string;
    tooltip: string;
  }> = [
    {
      id: 'routes',
      label: 'Compute Routes',
      icon: Navigation2,
      tier: 'ESSENTIALS',
      tierColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tooltip: 'Multi-modal transit & driving routes with fuel/cost estimates'
    },
    {
      id: 'autocomplete',
      label: 'Autocomplete',
      icon: Search,
      tier: 'ESSENTIALS',
      tierColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tooltip: 'Live typeahead suggestion engine'
    },
    {
      id: 'nearby',
      label: 'Nearby Search',
      icon: Compass,
      tier: 'PRO',
      tierColor: 'bg-blue-50 text-blue-700 border-blue-200',
      tooltip: 'Radius-based POI radar by category & wheelchair accessibility'
    },
    {
      id: 'textSearch',
      label: 'Text Search',
      icon: FileText,
      tier: 'PRO',
      tierColor: 'bg-blue-50 text-blue-700 border-blue-200',
      tooltip: 'Free-form natural language query search'
    },
    {
      id: 'geocoding',
      label: 'Geocoding',
      icon: MapPin,
      tier: 'ESSENTIALS',
      tierColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tooltip: 'Address to coordinates & map click reverse geocoder'
    },
    {
      id: 'grounding',
      label: 'Grounding Lite',
      icon: Sparkles,
      tier: 'MCP',
      tierColor: 'bg-purple-50 text-purple-700 border-purple-200',
      tooltip: 'Model Context Protocol (MCP) AI map intelligence'
    },
    {
      id: 'styles',
      label: 'Dynamic Maps',
      icon: Layers,
      tier: 'ESSENTIALS',
      tierColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tooltip: 'Cloud-based map styling: Roadmap, Satellite, Terrain, Dark'
    },
    {
      id: 'places',
      label: 'Places UI Kit',
      icon: Store,
      tier: 'PRO',
      tierColor: 'bg-blue-50 text-blue-700 border-blue-200',
      tooltip: 'Google Maps Places UI Kit cards & accessibility'
    },
    {
      id: 'threeD',
      label: '3D Maps',
      icon: Box,
      tier: 'PRO',
      tierColor: 'bg-amber-50 text-amber-700 border-amber-200',
      tooltip: 'Photorealistic 3D camera tilt, pitch & orbit'
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: CloudSun,
      tier: 'ESSENTIALS',
      tierColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tooltip: 'Live meteorological forecast & sightseeing advisory'
    }
  ];

  return (
    <div className="w-full">
      {/* Scrollable Ribbon with Google Maps Platform Brand Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9] text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-[#C84B31] text-white font-black text-[10px] shadow-xs">
            G
          </div>
          <span className="font-extrabold text-[#191715] tracking-tight">Google Maps Platform</span>
          <span className="hidden sm:inline text-[10px] font-semibold text-[#8C827A] px-1.5 py-0.2 rounded-md bg-[#FAF8F5] border border-[#E8E2D9]">
            10 Active APIs
          </span>
        </div>

        {/* Horizontal scroll pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id || (tool.id === 'threeD' && is3DActive);

            return (
              <button
                key={tool.id}
                id={`gmp-tool-${tool.id}-btn`}
                onClick={() => onSelectTool(activeTool === tool.id ? 'none' : tool.id)}
                title={tool.tooltip}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#191715] text-white border-[#191715] shadow-sm'
                    : 'bg-[#FAF8F5] hover:bg-white text-[#4D453E] border-[#E8E2D9] hover:border-[#C84B31]/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF7A59]' : 'text-[#665E55]'}`} />
                <span className="whitespace-nowrap">{tool.label}</span>
                <span className={`text-[8.5px] font-black px-1 py-0.2 rounded border ${
                  isActive ? 'bg-white/20 text-white border-white/30' : tool.tierColor
                }`}>
                  {tool.tier}
                </span>
                {isActive && <ChevronDown className="w-3 h-3 text-white/70" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
