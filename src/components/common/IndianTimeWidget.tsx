import React, { useState } from 'react';
import { Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useIndianTime } from '../../hooks/useIndianTime';

interface IndianTimeWidgetProps {
  variant?: 'compact' | 'header' | 'badge' | 'full';
  showRefresh?: boolean;
  className?: string;
}

export const IndianTimeWidget: React.FC<IndianTimeWidgetProps> = ({
  variant = 'compact',
  showRefresh = false,
  className = '',
}) => {
  const { timeDisplay, datePart, timePart, loading, error, syncedWithApi, refresh } = useIndianTime();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Header compact pill style
  if (variant === 'header') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-[#191715] shadow-2xs font-mono select-none ${className}`}
        title={`Indian Standard Time (IST - Asia/Kolkata): ${timeDisplay} ${syncedWithApi ? '• Synced via WorldTimeAPI' : '• Local IST Fallback'}`}
      >
        <span className="flex items-center gap-1 text-[10px] font-sans font-extrabold text-[#C84B31] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>IST</span>
        </span>
        <span className="text-xs font-bold text-[#191715] tabular-nums tracking-tight">
          {loading && timeDisplay === 'Loading...' ? (
            <span className="animate-pulse text-[#8C827A] text-[11px]">Syncing...</span>
          ) : (
            timeDisplay
          )}
        </span>
      </div>
    );
  }

  // Simple small badge style
  if (variant === 'badge') {
    return (
      <div 
        className={`inline-flex items-center gap-1 text-[11px] font-mono text-[#5C554E] bg-white/80 px-2 py-0.5 rounded-lg border border-[#EAE5DC] ${className}`}
        title={`Asia/Kolkata: ${timeDisplay}`}
      >
        <Clock className="w-3 h-3 text-[#C84B31]" />
        <span className="font-bold text-[#191715] tabular-nums">{timeDisplay}</span>
      </div>
    );
  }

  // Full detailed card style
  if (variant === 'full') {
    return (
      <div className={`p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-2xs space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#191715]">Indian Standard Time (IST)</div>
              <div className="text-[10px] text-[#8C827A]">Timezone: Asia/Kolkata (UTC+05:30)</div>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#191715] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            title="Re-sync with WorldTimeAPI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#EA580C]' : ''}`} />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#F0ECE4] flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] uppercase font-sans font-semibold text-[#8C827A]">Date & Time (DD/MM/YYYY, HH:mm:ss)</div>
            <div className="text-base font-bold text-[#191715] tabular-nums tracking-wide mt-0.5">
              {timeDisplay}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              24-Hour
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#665E55] pt-0.5">
          <span className="flex items-center gap-1">
            {syncedWithApi ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Source: worldtimeapi.org</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{error || 'Local IST clock'}</span>
              </>
            )}
          </span>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              className="text-[11px] text-[#C84B31] hover:underline font-semibold cursor-pointer"
            >
              Force Sync
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default compact layout
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] shadow-2xs font-mono ${className}`}>
      <Clock className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] font-sans font-extrabold text-[#C84B31] uppercase">IST</span>
        <span className="text-xs font-bold text-[#191715] tabular-nums">
          {timeDisplay}
        </span>
      </div>
      {showRefresh && (
        <button
          onClick={handleRefresh}
          className="text-[#8C827A] hover:text-[#191715] transition-colors p-0.5 ml-1 cursor-pointer"
          title="Refresh Indian Time"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#C84B31]' : ''}`} />
        </button>
      )}
    </div>
  );
};
