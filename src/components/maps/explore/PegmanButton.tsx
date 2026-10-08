import React, { useState } from "react";

interface PegmanButtonProps {
  onActivateStreetView: (coords?: { lat: number; lng: number }) => void;
  onDragStartPegman?: (e: React.DragEvent) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  className?: string;
}

export const PegmanButton: React.FC<PegmanButtonProps> = ({
  onActivateStreetView,
  onDragStartPegman,
  onDragStateChange,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStateChange?.(true);
    e.dataTransfer.setData("application/pegman-streetview", "true");
    e.dataTransfer.effectAllowed = "copyMove";

    // Transparent or custom drag image
    if (onDragStartPegman) {
      onDragStartPegman(e);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragStateChange?.(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Tooltip hint on hover */}
      {isHovered && !isDragging && (
        <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#191715] text-white px-2.5 py-1 rounded-xl text-[10.5px] font-bold shadow-xl border border-white/10 pointer-events-none animate-in fade-in slide-in-from-right-1 duration-150 flex items-center gap-1.5 z-40">
          <span>Drag Pegman onto the map for Street View</span>
        </div>
      )}

      {/* The Pegman Button Container */}
      <button
        type="button"
        id="activate-streetview-btn"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onActivateStreetView();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-11 h-11 rounded-2xl bg-white/98 backdrop-blur-md border border-[#E8E2D9] shadow-lg hover:shadow-xl hover:border-amber-400 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all select-none group pointer-events-auto ${
          isDragging
            ? "opacity-40 scale-90 ring-4 ring-amber-400/50"
            : "hover:scale-105"
        }`}
        title="Google Street View (click or drag Pegman onto the map)"
      >
        {/* Authentic SVG Pegman Doll */}
        <svg
          viewBox="0 0 32 32"
          className={`w-7 h-7 drop-shadow-sm transition-transform duration-200 ${
            isHovered ? "-rotate-6 scale-110" : ""
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <circle
            cx="16"
            cy="7"
            r="4"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1.2"
          />

          {/* Cap / Visor */}
          <path
            d="M13 5.5C14 4.5 18 4.5 19 5.5"
            stroke="#B45309"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Torso */}
          <path
            d="M11.5 12C11.5 11 13 10.5 16 10.5C19 10.5 20.5 11 20.5 12L21 19.5C21 20 20 20.5 16 20.5C12 20.5 11 20 11 19.5L11.5 12Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1.2"
          />

          {/* Belt */}
          <path d="M12.5 17.5H19.5" stroke="#B45309" strokeWidth="1" />

          {/* Left Leg */}
          <path
            d="M13.5 20.5L13 28.5"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Right Leg */}
          <path
            d="M18.5 20.5L19 28.5"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Shoes */}
          <circle cx="12" cy="28.5" r="1.5" fill="#B45309" />
          <circle cx="20" cy="28.5" r="1.5" fill="#B45309" />

          {/* Left Arm */}
          <path
            d="M11.5 12.5L9.5 18"
            stroke="#FBBF24"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right Arm */}
          <path
            d="M20.5 12.5L22.5 18"
            stroke="#FBBF24"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
