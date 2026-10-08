import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface FloatingAssistantButtonProps {
  onOpenAssistant: () => void;
}

export const FloatingAssistantButton: React.FC<FloatingAssistantButtonProps> = ({ onOpenAssistant }) => {
  const [isHoveredLongEnough, setIsHoveredLongEnough] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Only activate color change and tooltip after stopping on it for 1.5 seconds
    hoverTimerRef.current = setTimeout(() => {
      setIsHoveredLongEnough(true);
    }, 1500);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHoveredLongEnough(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="fixed bottom-32 sm:bottom-38 right-3 sm:right-6 z-45"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Sahayak AI Floating Button - Fully Circular */}
      <button
        id="floating-assistant-btn"
        onClick={onOpenAssistant}
        aria-label="Open Sahayak AI Travel Assistant"
        className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full text-white font-bold shadow-[0_6px_20px_rgba(25,23,21,0.4)] border-2 border-white/90 active:scale-95 transition-all duration-300 cursor-pointer select-none flex flex-col items-center justify-center touch-manipulation ${
          isHoveredLongEnough ? 'bg-[#C84B31] scale-105' : 'bg-[#191715]'
        }`}
      >
        {/* Subtle sparkle indicator badge in top-right */}
        <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-[#10B981] border border-white" />
        
        <Bot className={`w-4 h-4 sm:w-6 sm:h-6 transition-colors duration-300 ${isHoveredLongEnough ? 'text-white' : 'text-[#FFA07A]'}`} />
        <span className="text-[7px] sm:text-[9px] font-bold text-white/95 leading-none mt-0.5 tracking-tight">AI</span>
      </button>

      {/* Hover tooltip - Only displays when user stops on it for a few seconds */}
      {isHoveredLongEnough && (
        <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-[#191715] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-white/10 pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-200">
          Sahayak AI Travel & Place Guide
        </div>
      )}
    </div>
  );
};
