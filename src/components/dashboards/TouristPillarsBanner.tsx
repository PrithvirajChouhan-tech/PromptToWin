import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Star, 
  AlertTriangle, 
  AlertOctagon, 
  Calendar, 
  CloudSun, 
  Accessibility, 
  Activity, 
  ChevronRight, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Send,
  HelpCircle
} from 'lucide-react';

interface TouristPillarsBannerProps {
  onOpenFairPrices: () => void;
  onOpenScamReport: () => void;
  onOpenSOS: () => void;
  onOpenPlanner: () => void;
  onToggleAccessibility: () => void;
  accessibilityMode: boolean;
  onOpenScanner: () => void;
  onOpenEcosystemModal?: () => void;
}

export const TouristPillarsBanner: React.FC<TouristPillarsBannerProps> = ({
  onOpenFairPrices,
  onOpenScamReport,
  onOpenSOS,
  onOpenPlanner,
  onToggleAccessibility,
  accessibilityMode,
  onOpenScanner,
  onOpenEcosystemModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickReportOpen, setQuickReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleQuickReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle) return;
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setQuickReportOpen(false);
      setReportTitle('');
    }, 2500);
  };

  const touristPillars = [
    {
      id: 'fair-prices',
      title: 'Fair-Price Checks',
      subtitle: 'Compare prices, avoid overcharging',
      actionLabel: 'Check Price',
      icon: ShieldCheck,
      color: 'text-[#0284C7] bg-[#E0F2FE]',
      onClick: onOpenFairPrices,
    },
    {
      id: 'scam-reports',
      title: 'Scam Reports',
      subtitle: 'Report scams & suspicious activity',
      actionLabel: 'File Report',
      icon: AlertTriangle,
      color: 'text-[#DC2626] bg-[#FEE2E2]',
      onClick: () => setQuickReportOpen(true),
    },
    {
      id: 'sos-emergency',
      title: 'SOS / Emergency',
      subtitle: 'Instant police & medical dispatch',
      actionLabel: '112 / 1363',
      icon: AlertOctagon,
      color: 'text-[#E11D48] bg-[#FFE4E6]',
      onClick: onOpenSOS,
    },
    {
      id: 'itinerary-tracking',
      title: 'Itinerary Tracking',
      subtitle: 'AI planning, arrival detection',
      actionLabel: 'Planner',
      icon: Calendar,
      color: 'text-[#7C3AED] bg-[#EDE9FE]',
      onClick: onOpenPlanner,
    },
    {
      id: 'weather-aware',
      title: 'Weather-Aware AI',
      subtitle: 'Auto-adjusts for rain / midday heat',
      actionLabel: 'Live Weather',
      icon: CloudSun,
      color: 'text-[#D97706] bg-[#FEF3C7]',
      onClick: onOpenPlanner,
    },
    {
      id: 'accessibility-filters',
      title: 'Accessibility Filters',
      subtitle: 'Surfaces ramps & step-free venues',
      actionLabel: accessibilityMode ? '♿ Mode Active' : 'Enable ♿',
      icon: Accessibility,
      color: accessibilityMode ? 'text-white bg-[#0284C7]' : 'text-[#0284C7] bg-[#E0F2FE]',
      onClick: onToggleAccessibility,
    },
    {
      id: 'community-reviews',
      title: 'Community Reviews',
      subtitle: 'Rate & review experiences',
      actionLabel: 'Verified Logs',
      icon: Star,
      color: 'text-[#F59E0B] bg-[#FEF3C7]',
      onClick: onOpenFairPrices,
    },
    {
      id: 'real-time-data',
      title: 'Real-Time Tourist Data',
      subtitle: 'Live proximity radar & crowds',
      actionLabel: 'Scan Radar',
      icon: Activity,
      color: 'text-[#059669] bg-[#DCFCE7]',
      onClick: onOpenScanner,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#F0F9FF] via-[#FFFFFF] to-[#FAF8F5] rounded-3xl p-4 sm:p-5 border border-[#BAE6FD] shadow-2xs space-y-4">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E0F2FE]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0284C7] text-white text-[10px] font-extrabold uppercase tracking-wide">
              Tourist App Dashboard
            </span>
            <span className="text-xs text-[#0369A1] font-bold">
              8 Core Traveler Pillars
            </span>
          </div>
          <p className="text-xs text-[#334155] mt-1">
            <strong className="text-[#0284C7]">Fixes:</strong> overcharging, unsafe areas, poor trip planning, weather disruptions, accessibility gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
          >
            {isExpanded ? 'Show Compact' : 'View All 8 Pillars'}
          </button>
        </div>
      </div>

      {/* 8 Feature Pillars Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${isExpanded ? '' : 'max-h-36 sm:max-h-none overflow-hidden'}`}>
        {touristPillars.map(p => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              onClick={p.onClick}
              className="p-3 rounded-2xl bg-white border border-[#EAE5DC] hover:border-[#0284C7] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-xl ${p.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0284C7] group-hover:translate-x-0.5 transition-transform">
                    {p.actionLabel} →
                  </span>
                </div>
                <div className="font-extrabold text-xs text-[#191715] group-hover:text-[#0284C7] transition-colors leading-tight">
                  {p.title}
                </div>
                <div className="text-[10px] text-[#665E55] mt-0.5 leading-tight">
                  {p.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Scam / Overcharging Report Drawer */}
      {quickReportOpen && (
        <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#9F1239]">
              <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
              <span>Quick Tourist Report (Transmits to Authority & Business Dashboards)</span>
            </div>
            <button
              onClick={() => setQuickReportOpen(false)}
              className="text-xs text-[#9F1239] font-bold hover:underline"
            >
              Cancel
            </button>
          </div>

          {reportSuccess ? (
            <div className="p-3 rounded-xl bg-[#ECFDF5] text-[#065F46] text-xs font-bold flex items-center gap-2 border border-[#A7F3D0]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Report received! Geotag logged for Tourism Police & shop quality review.</span>
            </div>
          ) : (
            <form onSubmit={handleQuickReport} className="flex gap-2">
              <input
                type="text"
                required
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                placeholder="E.g., Auto driver charged ₹450 without meter at Western Gate"
                className="flex-1 bg-white border border-[#FECDD3] rounded-xl px-3 py-1.5 text-xs text-[#191715] focus:outline-none focus:border-[#E11D48]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Alert</span>
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};
