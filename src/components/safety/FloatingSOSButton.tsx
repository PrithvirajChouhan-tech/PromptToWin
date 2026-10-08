import React from 'react';
import { AlertOctagon } from 'lucide-react';

interface FloatingSOSButtonProps {
  onOpenSOS: () => void;
}

export const FloatingSOSButton: React.FC<FloatingSOSButtonProps> = ({ onOpenSOS }) => {
  return (
    <div className="fixed bottom-19 right-3 sm:bottom-22 sm:right-6 z-45 group">
      {/* Main High-Contrast Emergency Floating Button - Fully Circular without intrusive glow */}
      <button
        id="floating-sos-bottom-right-btn"
        onClick={onOpenSOS}
        aria-label="SOS assistance · demo"
        className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-black shadow-md hover:shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer select-none flex flex-col items-center justify-center touch-manipulation"
      >
        <AlertOctagon className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.8] text-white" />
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-white leading-none mt-0.5">SOS</span>
      </button>

      {/* Hover tooltip */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap bg-[#191715] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-white/10 pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
        Instant Emergency Dispatch (Police 112)
      </div>
    </div>
  );
};
