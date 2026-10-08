import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertOctagon,
  ShieldCheck,
  MapPin,
  Radio,
  Search,
  AlertTriangle,
  PhoneCall,
  Navigation,
  CheckCircle2,
  Info,
  Users,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";
import {
  LIVE_RISK_ZONES,
  INITIAL_SCAM_ALERTS,
} from "../../data/trustEngineData";
import { RiskZone } from "../../types/trustEngine";
import { getMapTileConfig } from "../../utils/mapsConfig";

interface SafetyPageProps {
  onOpenSOS: () => void;
  accessibilityMode?: boolean;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({
  onOpenSOS,
  accessibilityMode = false,
}) => {
  const [selectedZone, setSelectedZone] = useState<RiskZone>(
    LIVE_RISK_ZONES[0],
  );
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const filteredZones = LIVE_RISK_ZONES.filter((z) => {
    const matchCity =
      cityFilter === "all" || z.city.toLowerCase() === cityFilter.toLowerCase();
    const matchRisk =
      riskLevelFilter === "all" || z.riskLevel === riskLevelFilter;
    return matchCity && matchRisk;
  });

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedZone.coordinates.lat, selectedZone.coordinates.lng],
        zoom: 13,
        zoomControl: false,
      });

      const tileConfig = getMapTileConfig("google-streets");
      L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom,
        subdomains: tileConfig.subdomains,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (map && markersGroup) {
      markersGroup.clearLayers();

      filteredZones.forEach((zone) => {
        // Color based on risk level
        const isHigh = zone.riskLevel === "high";
        const isMedium = zone.riskLevel === "medium";
        const circleColor = isHigh
          ? "#E11D48"
          : isMedium
            ? "#EA580C"
            : "#10B981";

        // Custom HTML Marker Icon
        const iconHtml = `
          <div style="
            background-color: ${circleColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            ${isHigh ? "!" : isMedium ? "⚠" : "✓"}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-risk-marker",
          iconSize: [28, 28],
        });

        const marker = L.marker([zone.coordinates.lat, zone.coordinates.lng], {
          icon: customIcon,
        });

        // Circle radius to indicate risk zone
        const circle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
          radius: isHigh ? 500 : 350,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.15,
          weight: 1.5,
        });

        marker.on("click", () => {
          setSelectedZone(zone);
          map.setView([zone.coordinates.lat, zone.coordinates.lng], 14, {
            animate: true,
          });
        });

        markersGroup.addLayer(circle);
        markersGroup.addLayer(marker);
      });
    }
  }, [filteredZones]);

  // Pan to selected zone
  const handleSelectZone = (zone: RiskZone) => {
    setSelectedZone(zone);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [zone.coordinates.lat, zone.coordinates.lng],
        14,
        { animate: true },
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner with Emergency SOS Callout */}
      <div className="bg-gradient-to-r from-[#FFF1F2] via-[#FFF7F4] to-[#FAF8F5] rounded-3xl p-5 sm:p-7 border border-[#FECDD3] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E11D48]/10 text-[#E11D48] text-xs font-bold uppercase tracking-wider mb-2.5">
              <AlertOctagon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>PRD 4.2 • Safety Layer & Live Risk Heatmap</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1C18] tracking-tight">
              Real-Time Tourist Safety &{" "}
              <span className="text-[#E11D48]">Risk Heatmap</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#5A524C] mt-2 leading-relaxed">
              Live heat clusters mapping high scam densities, aggressive tout
              corridors, pickpocket zones, and safe monitored tourist police
              booths. Always know the safety level of your current location.
            </p>
          </div>

          {/* Large Actionable SOS Trigger Button */}
          <button
            id="safety-page-sos-btn"
            onClick={onOpenSOS}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white text-sm font-black tracking-wide shadow-lg shadow-[#E11D48]/30 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <Radio className="w-5 h-5 animate-ping" />
            <span>TRIGGER EMERGENCY SOS (24/7 POLICE)</span>
          </button>
        </div>
      </div>

      {/* Filter and Zone Stats Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#8C827A]">City:</span>
          {["all", "Delhi", "Agra", "Varanasi", "Jaipur"].map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                cityFilter === city
                  ? "bg-[#1F1C18] text-white"
                  : "bg-[#FAF8F5] text-[#5A524C] hover:bg-[#F0ECE4] border border-[#EAE5DC]"
              }`}
            >
              {city === "all" ? "All Cities" : city}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#8C827A]">Risk Level:</span>
          {["all", "high", "medium", "safe"].map((level) => (
            <button
              key={level}
              onClick={() => setRiskLevelFilter(level)}
              className={`px-2.5 py-1 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                riskLevelFilter === level
                  ? level === "high"
                    ? "bg-[#E11D48] text-white"
                    : level === "medium"
                      ? "bg-[#EA580C] text-white"
                      : "bg-[#10B981] text-white"
                  : "bg-[#FAF8F5] text-[#5A524C] border border-[#EAE5DC]"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map & Zone Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center: Interactive Leaflet Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EAE5DC] overflow-hidden shadow-xs flex flex-col h-[480px]">
          <div className="p-3.5 bg-[#FAF8F5] border-b border-[#EAE5DC] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-[#1F1C18]">
              <MapPin className="w-4 h-4 text-[#FF6F59]" />
              <span>Live Geographic Risk Layer (Google Maps)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-[#E11D48]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]"></span>{" "}
                High Scam
              </span>
              <span className="flex items-center gap-1 text-[#EA580C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>{" "}
                Moderate
              </span>
              <span className="flex items-center gap-1 text-[#10B981]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>{" "}
                Safe Booth
              </span>
            </div>
          </div>

          <div ref={mapContainerRef} className="flex-1 w-full relative z-0" />
        </div>

        {/* Right: Selected Zone Details Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Location Risk Level Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs text-[#8C827A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>{selectedZone.city} District</span>
                </span>
                <h3 className="text-lg font-bold text-[#1F1C18] mt-0.5">
                  {selectedZone.name}
                </h3>
              </div>

              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                  selectedZone.riskLevel === "high"
                    ? "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECDD3]"
                    : selectedZone.riskLevel === "medium"
                      ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                      : "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                }`}
              >
                {selectedZone.riskLevel.toUpperCase()} RISK
              </span>
            </div>

            <p className="text-xs text-[#5A524C] leading-relaxed">
              {selectedZone.description}
            </p>

            {/* Active Incidents Pill */}
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] text-xs flex items-center justify-between">
              <span className="text-[#8C827A]">
                Active Community Scam Reports:
              </span>
              <span className="font-extrabold text-[#E11D48]">
                {selectedZone.activeIncidentsCount} cases logged
              </span>
            </div>

            {/* Official Safety Advice */}
            <div className="bg-[#FFF7ED] border border-[#FFEDD5] p-3.5 rounded-2xl text-xs text-[#9A3412] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#C2410C]">
                <ShieldCheck className="w-4 h-4" />
                <span>Recommended Precaution</span>
              </div>
              <p className="leading-relaxed">{selectedZone.safetyAdvice}</p>
            </div>

            {/* Tourist Police Booth Contact */}
            <div className="pt-2 border-t border-[#F0ECE4] flex items-center justify-between text-xs">
              <span className="text-[#8C827A]">Nearest Monitored Post:</span>
              <span className="font-bold text-[#0284C7] font-mono">
                {selectedZone.touristPoliceContact}
              </span>
            </div>
          </div>

          {/* Quick Zone Selector List */}
          <div className="bg-white rounded-3xl p-4 border border-[#EAE5DC] shadow-xs space-y-2">
            <div className="text-xs font-bold text-[#8C827A] uppercase tracking-wider mb-2">
              Browse Indian Scam & Safe Hotspots ({filteredZones.length})
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
              {filteredZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    selectedZone.id === zone.id
                      ? "bg-[#FFF2EE] border-l-4 border-[#FF6F59] font-bold text-[#1F1C18]"
                      : "hover:bg-[#FAF8F5] text-[#5A524C]"
                  }`}
                >
                  <span className="truncate pr-2">{zone.name}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${
                      zone.riskLevel === "high"
                        ? "bg-[#FEE2E2] text-[#B91C1C]"
                        : zone.riskLevel === "medium"
                          ? "bg-[#FEF3C7] text-[#B45309]"
                          : "bg-[#ECFDF5] text-[#065F46]"
                    }`}
                  >
                    {zone.riskLevel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
