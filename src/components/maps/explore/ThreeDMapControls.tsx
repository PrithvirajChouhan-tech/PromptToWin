import React from 'react';
import { 
  Box, 
  RotateCcw, 
  RotateCw, 
  ChevronUp, 
  ChevronDown, 
  Compass, 
  X, 
  Eye, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface ThreeDMapControlsProps {
  is3DActive: boolean;
  onToggle3D: (active: boolean) => void;
  tilt: number;
  rotation: number;
  onChangeTilt: (tilt: number) => void;
  onChangeRotation: (rotation: number) => void;
  onReset: () => void;
  onClose?: () => void;
}

export const ThreeDMapControls: React.FC<ThreeDMapControlsProps> = ({
  is3DActive,
  onToggle3D,
  tilt,
  rotation,
  onChangeTilt,
  onChangeRotation,
  onReset,
  onClose,
}) => {
  return (
    <div className="absolute top-14 right-4 z-30 w-76 sm:w-84 bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-3.5 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#191715] flex items-center gap-1.5">
              3D Photorealistic Maps
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                PRO
              </span>
            </h3>
            <p className="text-[10px] text-[#78716C]">Camera pitch, tilt & 360° perspective</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main 3D Toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
        <div>
          <span className="text-xs font-bold block text-[#191715]">3D Isometric Mode</span>
          <span className="text-[10px] text-[#78716C]">Photorealistic bird's eye view</span>
        </div>
        <button
          onClick={() => onToggle3D(!is3DActive)}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
            is3DActive
              ? 'bg-amber-500 text-white shadow-amber-500/25 ring-2 ring-amber-500/30'
              : 'bg-white text-[#78716C] border border-[#D8D2C7] hover:text-[#191715]'
          }`}
        >
          {is3DActive ? '3D ON' : 'ENABLE 3D'}
        </button>
      </div>

      {is3DActive && (
        <div className="space-y-3 animate-fade-in">
          
          {/* Tilt (Pitch) Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#665E55]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#0284C7]" />
                Camera Tilt (Pitch)
              </span>
              <span className="font-extrabold text-[#191715]">{tilt}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="58"
              step="2"
              value={tilt}
              onChange={(e) => onChangeTilt(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Rotation (Compass Orbit) Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#665E55]">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-rose-500" />
                Rotation Orbit (Heading)
              </span>
              <span className="font-extrabold text-[#191715]">{rotation}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={rotation}
              onChange={(e) => onChangeRotation(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Quick Camera Navigation Pads */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button
              onClick={() => onChangeTilt(Math.min(58, tilt + 10))}
              className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E2D9] text-xs font-bold text-[#443E38] flex flex-col items-center justify-center cursor-pointer"
              title="Tilt Down (Flatter)"
            >
              <ChevronUp className="w-4 h-4 text-amber-600" />
              <span className="text-[9px]">Tilt +</span>
            </button>

            <button
              onClick={() => onChangeTilt(Math.max(0, tilt - 10))}
              className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E2D9] text-xs font-bold text-[#443E38] flex flex-col items-center justify-center cursor-pointer"
              title="Tilt Up"
            >
              <ChevronDown className="w-4 h-4 text-amber-600" />
              <span className="text-[9px]">Tilt -</span>
            </button>

            <button
              onClick={() => onChangeRotation(rotation - 15)}
              className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E2D9] text-xs font-bold text-[#443E38] flex flex-col items-center justify-center cursor-pointer"
              title="Orbit Counter-Clockwise"
            >
              <RotateCcw className="w-4 h-4 text-[#0284C7]" />
              <span className="text-[9px]">Orbit ↺</span>
            </button>

            <button
              onClick={() => onChangeRotation(rotation + 15)}
              className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E2D9] text-xs font-bold text-[#443E38] flex flex-col items-center justify-center cursor-pointer"
              title="Orbit Clockwise"
            >
              <RotateCw className="w-4 h-4 text-[#0284C7]" />
              <span className="text-[9px]">Orbit ↻</span>
            </button>
          </div>

          {/* Reset Flat 2D View */}
          <button
            onClick={onReset}
            className="w-full py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EBE1] border border-[#E8E2D9] text-[11px] font-bold text-[#78716C] hover:text-[#191715] transition-colors cursor-pointer"
          >
            Reset to Standard 2D Top-Down View
          </button>

        </div>
      )}

    </div>
  );
};
