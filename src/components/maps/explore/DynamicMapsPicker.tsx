import React from "react";
import {
  Layers,
  X,
  Check,
  Sparkles,
  Sun,
  Moon,
  Mountain,
  Car,
  Globe,
} from "lucide-react";
import { GoogleMapStyleType } from "../../../utils/mapsConfig";

interface DynamicMapsPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: GoogleMapStyleType | string;
  onSelectStyle: (style: GoogleMapStyleType) => void;
}

export const DynamicMapsPicker: React.FC<DynamicMapsPickerProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
}) => {
  if (!isOpen) return null;

  const styles: Array<{
    id: GoogleMapStyleType;
    name: string;
    description: string;
    previewBg: string;
    icon: string;
    badge?: string;
  }> = [
    {
      id: "google-streets",
      name: "Google Standard Roadmap",
      description: "Clean high-definition vector street network & landmarks",
      previewBg: "bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1]",
      icon: "🗺️",
      badge: "DEFAULT",
    },
    {
      id: "google-satellite",
      name: "Google Satellite Imagery",
      description: "High-resolution photorealistic satellite photography",
      previewBg: "bg-gradient-to-br from-[#1E293B] to-[#0F172A]",
      icon: "🛰️",
      badge: "HD",
    },
    {
      id: "google-hybrid",
      name: "Google Hybrid Map",
      description:
        "Satellite imagery overlayed with crisp roads & label layers",
      previewBg: "bg-gradient-to-br from-[#334155] to-[#1E293B]",
      icon: "🏷️",
      badge: "POPULAR",
    },
    {
      id: "google-terrain",
      name: "Google Terrain & Topo",
      description: "Topographic elevation contours & shaded physical reliefs",
      previewBg: "bg-gradient-to-br from-[#D97706]/20 to-[#B45309]/30",
      icon: "⛰️",
    },
    {
      id: "google-traffic",
      name: "Google Live Traffic Layer",
      description: "Real-time color-coded congestion data on roadways",
      previewBg: "bg-gradient-to-br from-emerald-100 to-amber-100",
      icon: "🚗",
      badge: "LIVE",
    },
  ];

  return (
    <div className="absolute top-14 right-4 z-30 w-80 sm:w-88 max-h-[85vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-4 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#191715] flex items-center gap-1.5">
              Dynamic Maps
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                CLOUD STYLING
              </span>
            </h3>
            <p className="text-[10px] text-[#78716C]">
              Real-time map styles & layer updates
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Style Options Grid */}
      <div className="space-y-2">
        {styles.map((st) => {
          const isSelected = currentStyle === st.id;
          return (
            <div
              key={st.id}
              onClick={() => {
                onSelectStyle(st.id);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                isSelected
                  ? "bg-[#EFF6FF] border-[#3B82F6] ring-2 ring-[#3B82F6]/20"
                  : "bg-white border-[#E8E2D9] hover:border-[#CBD5E1] hover:bg-[#FAF8F5]"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs ${st.previewBg}`}
              >
                {st.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-[#191715] truncate">
                    {st.name}
                  </h4>
                  {st.badge && (
                    <span
                      className={`text-[8.5px] font-black px-1.5 py-0.2 rounded ${
                        st.badge === "LIVE"
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-[#E2E8F0] text-[#475569]"
                      }`}
                    >
                      {st.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#78716C] line-clamp-1 mt-0.5">
                  {st.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                    : "border-[#CBD5E1]"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloud-based styling note */}
      <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] text-[10px] text-[#78716C] leading-tight">
        <p className="font-semibold text-[#191715] mb-0.5">
          ⚡ Cloud-Based Map Styling
        </p>
        Styles switch seamlessly across Web, Android & iOS with zero app
        restarts.
      </div>
    </div>
  );
};
