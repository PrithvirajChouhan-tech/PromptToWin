import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Navigation, 
  Compass, 
  CloudSun,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { 
  queryMapsGroundingLite, 
  GroundingPayload 
} from '../../../services/mapPlatformService';

interface MapsGroundingLiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewportCenter: { lat: number; lng: number };
  weatherBrief: string;
  nearbyPlacesSummary: string[];
  onFlyTo: (lat: number, lng: number, title?: string) => void;
}

export const MapsGroundingLiteModal: React.FC<MapsGroundingLiteModalProps> = ({
  isOpen,
  onClose,
  viewportCenter,
  weatherBrief,
  nearbyPlacesSummary,
  onFlyTo,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    sender: 'user' | 'assistant';
    text: string;
    citedPlaces?: Array<{ name: string; lat: number; lng: number; actionText: string }>;
    sources?: string[];
  }>>([
    {
      sender: 'user',
      text: "I'm exploring this area today. What should I pack for the weather? Also, please recommend top dinner spots nearby and the drive time."
    },
    {
      sender: 'assistant',
      text: `Based on your live location (${viewportCenter.lat.toFixed(4)}°, ${viewportCenter.lng.toFixed(4)}°) and current ${weatherBrief.toLowerCase()}:\n\n` +
        `🍽️ **Top Grounded Dinner Spots**:\n` +
        `• **Aqua Vieja Heritage Bistro** (~650m, 8 min walk) — Renowned for regional Mughlai thalis and open-air courtyard.\n` +
        `• **Grand Spice Court** (~1.4 km, 6 min drive / ₹45 auto) — Verified FSSAI hygiene certificate and family dining.\n\n` +
        `☀️ **Weather & Packing Grounding**:\n` +
        `• Current conditions are **${weatherBrief}**. Light cotton clothes, sunglasses, and comfortable slip-on walking shoes are recommended.\n` +
        `• Rain likelihood is minimal for the next 4 hours.`,
      citedPlaces: [
        { name: 'Aqua Vieja Heritage Bistro', lat: viewportCenter.lat + 0.003, lng: viewportCenter.lng + 0.004, actionText: 'Show on Map' },
        { name: 'Grand Spice Court', lat: viewportCenter.lat - 0.004, lng: viewportCenter.lng + 0.002, actionText: 'Get Directions' }
      ],
      sources: ['Google Maps Platform Grounding', 'Model Context Protocol (MCP)', 'Open-Meteo Live']
    }
  ]);

  const quickPrompts = [
    'Recommend dinner spots nearby & drive time',
    'What should I pack for today\'s weather?',
    'Suggest a 2-hour walking tour of historic sites',
    'Are there safe late-night dining streets around here?'
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    const payload: GroundingPayload = {
      prompt: textToSend,
      viewportCenter,
      weatherBrief,
      nearbyPlacesSummary: nearbyPlacesSummary.length > 0 ? nearbyPlacesSummary : ['Old Delhi Heritage Corridor', 'Chandni Chowk', 'Red Fort', 'Jama Masjid']
    };

    try {
      const response = await queryMapsGroundingLite(payload);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: response.reply,
          citedPlaces: response.citedPlaces,
          sources: response.sources
        }
      ]);
    } catch (err) {
      console.warn('Grounding Lite error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-4 z-30 w-88 sm:w-104 max-h-[85vh] overflow-y-auto bg-white/98 backdrop-blur-xl rounded-2xl border border-[#E8E2D9] shadow-2xl p-4 text-[#191715] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#191715] flex items-center gap-1.5">
              Maps Grounding Lite
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                MCP
              </span>
            </h3>
            <p className="text-[10px] text-[#78716C]">Real-time Maps data brought to LLMs</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl hover:bg-[#FAF8F5] text-[#78716C] hover:text-[#191715] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* MCP Status Banner */}
      <div className="px-2.5 py-1.5 rounded-xl bg-purple-50/70 border border-purple-200/70 flex items-center justify-between text-[10px] text-purple-900">
        <span className="flex items-center gap-1 font-semibold">
          <Bot className="w-3 h-3 text-purple-600" />
          Grounding Active: Lat {viewportCenter.lat.toFixed(3)}, Lng {viewportCenter.lng.toFixed(3)}
        </span>
        <span className="font-bold text-purple-700">Live Context</span>
      </div>

      {/* Conversation Stream */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-xs ${
                m.sender === 'user'
                  ? 'bg-[#191715] text-white rounded-br-xs'
                  : 'bg-[#FAF8F5] text-[#191715] border border-[#E8E2D9] rounded-bl-xs'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

              {/* Cited Places Action Chips */}
              {m.citedPlaces && m.citedPlaces.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#E8E2D9] flex flex-wrap gap-1.5">
                  {m.citedPlaces.map((pl, i) => (
                    <button
                      key={i}
                      onClick={() => onFlyTo(pl.lat, pl.lng, pl.name)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#0284C7] font-bold text-[10.5px] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#0284C7]" />
                      <span>{pl.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sources Chip */}
              {m.sources && (
                <div className="mt-2 flex items-center gap-1 text-[9px] text-[#8C827A]">
                  <span>Sources:</span>
                  {m.sources.map((s, i) => (
                    <span key={i} className="px-1.5 py-0.2 rounded bg-white/80 border border-[#EAE5DC]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs text-[#78716C]">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Grounding LLM with live map coordinates & POIs...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="whitespace-nowrap text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#524B43] border border-[#E8E2D9] transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask LLM anything about this location..."
          className="flex-1 text-xs font-semibold bg-transparent text-[#191715] placeholder:text-[#A8A29E] outline-none ml-1.5"
        />
        <button
          onClick={() => handleSend()}
          disabled={!prompt.trim() || loading}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
