import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Sun, 
  Compass, 
  X, 
  ChevronRight, 
  ChevronDown,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  fetchMapWeather, 
  WeatherData 
} from '../../../services/mapPlatformService';

interface WeatherOverlayWidgetProps {
  centerCoords: { lat: number; lng: number };
  locationName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onWeatherLoaded?: (brief: string) => void;
  className?: string;
}

export const WeatherOverlayWidget: React.FC<WeatherOverlayWidgetProps> = ({
  centerCoords,
  locationName = 'Current Location',
  isOpen: externalIsOpen,
  onClose,
  onWeatherLoaded,
  className = '',
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');
  const [isExpandedInternal, setIsExpandedInternal] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const isExpanded = externalIsOpen !== undefined ? externalIsOpen : isExpandedInternal;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchMapWeather(centerCoords.lat, centerCoords.lng)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
          if (onWeatherLoaded) {
            onWeatherLoaded(`${data.temperature}°C, ${data.condition}`);
          }
        }
      })
      .catch(() => setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [centerCoords.lat, centerCoords.lng]);

  const handleToggle = () => {
    if (externalIsOpen !== undefined && onClose) {
      if (externalIsOpen) onClose();
    } else {
      setIsExpandedInternal(!isExpandedInternal);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose();
    setIsExpandedInternal(false);
  };

  if (!weather && loading) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E2D9] text-xs font-bold text-[#78716C] shadow-md ${className}`}>
        <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div ref={widgetRef} className={`relative select-none ${className}`}>
      
      {/* Compact Current Location Weather Badge */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/98 backdrop-blur-md border border-[#E8E2D9] text-xs font-extrabold text-[#191715] shadow-md hover:shadow-lg hover:border-amber-400/80 transition-all cursor-pointer group"
        title="Click to expand full weather forecast & travel advisory"
      >
        <span className="text-sm">
          {weather.weatherCode === 0 ? '☀️' : weather.weatherCode < 4 ? '⛅' : '🌧️'}
        </span>
        <span className="text-sm font-black text-[#191715]">{weather.temperature}°C</span>
        <span className="text-[10px] text-[#78716C] font-semibold hidden sm:inline truncate max-w-[100px]">
          {weather.condition}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#A8A29E] transition-transform duration-200 ${
          isExpanded ? 'rotate-180 text-amber-500' : 'group-hover:text-[#191715]'
        }`} />
      </button>

      {/* Expanded Weather & Forecast Card (Positioned neatly relative to badge) */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 z-40 w-80 sm:w-88 max-h-[80vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-4 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#191715] leading-tight">
                  {locationName} Weather
                </h4>
                <p className="text-[10px] text-[#78716C]">Real-time Meteorological Forecast</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded-lg hover:bg-[#FAF8F5] text-[#8C827A] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Temp Gradient Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black">{weather.temperature}°C</span>
                <p className="text-xs font-semibold text-white/90">{weather.condition}</p>
                <p className="text-[10px] text-white/70">Feels like {weather.feelsLike}°C</p>
              </div>
              <div className="text-3xl">
                {weather.weatherCode === 0 ? '☀️' : weather.weatherCode < 4 ? '⛅' : '🌧️'}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/20 text-[10px]">
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-200" />
                <span>{weather.humidity}% Hum</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-200" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-300" />
                <span>UV {weather.uvIndex}</span>
              </div>
            </div>
          </div>

          {/* Travel Advisory Note */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug text-[10.5px] font-medium">{weather.advisory}</p>
          </div>

          {/* Forecast Tabs */}
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('hourly')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'hourly'
                    ? 'bg-[#191715] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#191715]'
                }`}
              >
                Hourly
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'daily'
                    ? 'bg-[#191715] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#191715]'
                }`}
              >
                5-Day
              </button>
            </div>
            <span className="text-[9.5px] text-[#8C827A] font-semibold">{weather.airQuality}</span>
          </div>

          {/* Forecast Strip */}
          {activeTab === 'hourly' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {weather.hourly.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] shrink-0 min-w-13 text-center"
                >
                  <span className="text-[9.5px] font-bold text-[#78716C]">{h.time}</span>
                  <span className="text-xs font-black text-[#191715] my-0.5">{h.temp}°</span>
                  <span className="text-[8.5px] font-semibold text-[#0284C7]">{h.rainChance}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {weather.daily.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs"
                >
                  <span className="font-bold text-[#191715] w-18">{d.day}</span>
                  <div className="flex items-center gap-1">
                    <span>{d.icon}</span>
                    <span className="text-[10px] text-[#78716C]">{d.condition}</span>
                  </div>
                  <span className="font-extrabold text-[#191715]">
                    {d.maxTemp}° / <span className="text-[#8C827A]">{d.minTemp}°</span>
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
