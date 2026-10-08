import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertOctagon, 
  Store, 
  Building, 
  Compass, 
  ShieldCheck, 
  Users, 
  MapPin, 
  CloudRain, 
  Accessibility, 
  Activity, 
  TrendingUp, 
  MessageSquare, 
  Star, 
  Award, 
  Flame, 
  Smile, 
  AlertTriangle, 
  Landmark, 
  FileCheck2, 
  Gavel,
  CheckCircle2,
  Minus
} from 'lucide-react';
import { HOW_WE_STAND_OUT_DATA } from '../../data/ecosystemData';
import { AppEntity } from '../../types/entity';

interface EcosystemFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEntity: AppEntity;
  onSelectEntity: (entity: AppEntity) => void;
}

export const EcosystemFlowModal: React.FC<EcosystemFlowModalProps> = ({
  isOpen,
  onClose,
  currentEntity,
  onSelectEntity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-[#EAE5DC] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0284C7] via-[#059669] to-[#E11D48] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#191715] flex items-center justify-center font-black shadow-sm">
              <Compass className="w-5 h-5 text-[#C84B31]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight">Yatra One • Unified Ecosystem</span>
                <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">3-Entity Network</span>
              </div>
              <p className="text-xs text-white/90">
                A unified platform connecting tourists, businesses and authorities for a safer, smarter and more sustainable travel ecosystem.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Slogan Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] text-xs">
            <div className="font-extrabold text-[#191715] text-sm italic tracking-wide">
              "Better Data. Better Decisions. Better Journeys."
            </div>
            <div className="text-[#665E55]">
              Click any dashboard below to switch live personas immediately.
            </div>
          </div>

          {/* 3 Columns for 3 Entities with Data Flow arrows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            
            {/* COLUMN 1: TOURIST APP */}
            <div className={`p-4 sm:p-5 rounded-3xl border-2 transition-all ${
              currentEntity === 'tourist'
                ? 'border-[#0284C7] bg-[#F0F9FF] shadow-md ring-2 ring-[#0284C7]/20'
                : 'border-[#BAE6FD] bg-white hover:border-[#0284C7]'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E0F2FE]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0284C7] text-white flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-[#0C4A6E]">Tourist App</h3>
                    <div className="text-[10px] text-[#0284C7] font-bold">Entity: Traveler / Visitor</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectEntity('tourist');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0284C7] text-white text-[11px] font-bold hover:bg-[#0369A1] transition-colors cursor-pointer"
                >
                  {currentEntity === 'tourist' ? 'Active' : 'Open'}
                </button>
              </div>

              <div className="mt-2.5 p-2 rounded-xl bg-[#E0F2FE] text-[#0369A1] text-[11px] font-semibold">
                <strong>Fixes:</strong> overcharging, unsafe areas, poor trip planning, weather disruptions, accessibility gaps
              </div>

              {/* Features List */}
              <div className="mt-3 space-y-2 text-xs">
                {[
                  { title: 'Fair-price checks', desc: 'Compare prices, avoid overcharging.' },
                  { title: 'Community reviews', desc: 'Rate and review experiences.' },
                  { title: 'Scam reports', desc: 'Report scams and suspicious activity.' },
                  { title: 'SOS/Emergency', desc: 'Get help in critical situations.' },
                  { title: 'Itinerary tracking', desc: 'AI planning, automatic arrival detection.' },
                  { title: 'Weather-aware suggestions', desc: 'Auto-adjusts plans for rain/heat.' },
                  { title: 'Accessibility filters', desc: 'Surfaces accessible routes and venues.' },
                  { title: 'Real-time tourist data', desc: 'Data as they travel.' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0C4A6E]">{f.title}:</strong>{' '}
                      <span className="text-[#334155]">{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: BUSINESS DASHBOARD */}
            <div className={`p-4 sm:p-5 rounded-3xl border-2 transition-all ${
              currentEntity === 'business'
                ? 'border-[#059669] bg-[#ECFDF5] shadow-md ring-2 ring-[#059669]/20'
                : 'border-[#A7F3D0] bg-white hover:border-[#059669]'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#D1FAE5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-[#064E3B]">Business Dashboard</h3>
                    <div className="text-[10px] text-[#059669] font-bold">Entity: Merchant / Hotelier / Guide</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectEntity('business');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#059669] text-white text-[11px] font-bold hover:bg-[#047857] transition-colors cursor-pointer"
                >
                  {currentEntity === 'business' ? 'Active' : 'Open'}
                </button>
              </div>

              <div className="mt-2.5 p-2 rounded-xl bg-[#D1FAE5] text-[#065F46] text-[11px] font-semibold">
                <strong>Fixes:</strong> low visibility, no feedback loop, unclear service quality
              </div>

              {/* Features List */}
              <div className="mt-3 space-y-2.5 text-xs">
                {[
                  { title: 'Footfall trends', desc: 'Visitor volume, peak hours, locations.' },
                  { title: 'Complaints', desc: 'Issues reported by tourists.' },
                  { title: 'Service ratings', desc: 'Average ratings and reviews.' },
                  { title: 'Quality score', desc: 'Overall performance score.' },
                  { title: 'Act on feedback', desc: 'Lower ranking, less reach if ignored.' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#064E3B]">{f.title}:</strong>{' '}
                      <span className="text-[#334155]">{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#A7F3D0] text-[11px] text-[#065F46] font-medium">
                ⚡ Receives tourist data & reports; returns improved service; bound by authority enforcement.
              </div>
            </div>

            {/* COLUMN 3: AUTHORITY DASHBOARD */}
            <div className={`p-4 sm:p-5 rounded-3xl border-2 transition-all ${
              currentEntity === 'authority'
                ? 'border-[#E11D48] bg-[#FFF1F2] shadow-md ring-2 ring-[#E11D48]/20'
                : 'border-[#FECDD3] bg-white hover:border-[#E11D48]'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#FFE4E6]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E11D48] text-white flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-[#881337]">Authority Dashboard</h3>
                    <div className="text-[10px] text-[#E11D48] font-bold">Entity: Ministry, ASI & Police</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectEntity('authority');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#E11D48] text-white text-[11px] font-bold hover:bg-[#BE123C] transition-colors cursor-pointer"
                >
                  {currentEntity === 'authority' ? 'Active' : 'Open'}
                </button>
              </div>

              <div className="mt-2.5 p-2 rounded-xl bg-[#FFE4E6] text-[#9F1239] text-[11px] font-semibold">
                <strong>Fixes:</strong> no real-time footfall or safety intelligence, unmonitored heritage sites
              </div>

              {/* Features List */}
              <div className="mt-3 space-y-2 text-xs">
                {[
                  { title: 'Footfall heatmaps', desc: 'Where and why footfall changes.' },
                  { title: 'Sentiment/feedback', desc: 'Overall sentiment insights.' },
                  { title: 'Complaint categories', desc: 'Top issues, trends, patterns.' },
                  { title: 'Heritage-site issue reports', desc: 'Maintenance, crowding, safety.' },
                  { title: 'Compliance monitoring', desc: 'Fair pricing, service quality, legal compliance.' },
                  { title: 'Enforcement', desc: 'Penalties, rank adjustments, or removal for non-compliant businesses.' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E11D48] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#881337]">{f.title}:</strong>{' '}
                      <span className="text-[#334155]">{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interconnected Flow Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#191715]">
              🔄 Closed Feedback Loop Interconnections
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-[#BAE6FD]">
                <div className="text-[10px] font-bold text-[#0284C7] uppercase">Tourist → Business</div>
                <div className="font-semibold text-[#191715] mt-0.5">Tourist Data & Reports</div>
                <div className="text-[11px] text-[#665E55]">Footfall visits, purchases & review reports</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#FECDD3]">
                <div className="text-[10px] font-bold text-[#E11D48] uppercase">Tourist → Authority</div>
                <div className="font-semibold text-[#191715] mt-0.5">Complaints & Heritage Issues</div>
                <div className="text-[11px] text-[#665E55]">Overcharging logs, ASI site issues & scam alerts</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#FCA5A5]">
                <div className="text-[10px] font-bold text-[#991B1B] uppercase">Authority → Business</div>
                <div className="font-semibold text-[#191715] mt-0.5">Enforcement & Audits</div>
                <div className="text-[11px] text-[#665E55]">Penalties, rank adjustments, or removal/delisting</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-[#A7F3D0]">
                <div className="text-[10px] font-bold text-[#059669] uppercase">Business → Tourist</div>
                <div className="font-semibold text-[#191715] mt-0.5">Improved Service</div>
                <div className="text-[11px] text-[#665E55]">Verified fair prices, clean facilities & high quality</div>
              </div>
            </div>
          </div>

          {/* "How we stand out" Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
              <h3 className="text-sm font-extrabold text-[#191715]">How We Stand Out vs. Typical Travel Apps</h3>
            </div>

            <div className="border border-[#EAE5DC] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#EAE5DC] text-[#665E55] font-bold">
                    <th className="p-3">Feature</th>
                    <th className="p-3">Typical travel apps</th>
                    <th className="p-3 text-[#059669]">Yatra One Unified Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE5DC]">
                  {HOW_WE_STAND_OUT_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5]/50">
                      <td className="p-3 font-extrabold text-[#191715]">{row.feature}</td>
                      <td className="p-3 text-[#665E55]">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#D97706] font-medium">
                          {row.typical.startsWith('Partial') ? '△ ' : '✕ '}
                          {row.typical}
                        </span>
                      </td>
                      <td className="p-3 text-[#059669] font-bold">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#059669]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
                          {row.yatraOne}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE5DC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#665E55]">
            Currently active persona: <strong className="text-[#191715] capitalize">{currentEntity} Dashboard</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#191715] hover:bg-[#332F2B] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Continue to App
          </button>
        </div>

      </div>
    </div>
  );
};
