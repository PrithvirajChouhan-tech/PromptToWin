import React, { useState } from 'react';
import { 
  Building2, 
  Briefcase, 
  UserCheck, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  Camera, 
  Radio, 
  ArrowUpRight, 
  Download, 
  Sparkles, 
  Plus, 
  FileText, 
  Users, 
  Activity,
  Award
} from 'lucide-react';
import { INITIAL_SOS_LOG, INITIAL_SCAM_ALERTS, VERIFIED_HOTELS } from '../../data/trustEngineData';
import { SOSIncident } from '../../types/trustEngine';

export const IndustryAuthorityPortal: React.FC = () => {
  const [activeSector, setActiveSector] = useState<'hotels' | 'operators' | 'artisans' | 'authorities'>('hotels');
  const [sosLogs, setSosLogs] = useState<SOSIncident[]>(INITIAL_SOS_LOG);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResolveSOS = (id: string) => {
    setSosLogs(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: 'resolved', estimatedArrivalMinutes: 0 };
      }
      return inc;
    }));
    showToast(`Incident ${id} marked as resolved by on-ground unit.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1F1C18] via-[#2D2823] to-[#1F1C18] text-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#3E3831]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6F59]/20 text-[#FFA07A] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Problem Statement SIH26204 • Section 5: Industry (B2B) & Authority Layer</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Boosting India's Tourism Economy & <span className="text-[#FFA07A]">Authority Telemetry</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#D5CECE] mt-2 leading-relaxed">
            Eliminating extractive middlemen, empowering independent hoteliers with zero-commission direct bookings, 
            formalizing artisan & guide incomes, and equipping Tourism Police with real-time scam intelligence.
          </p>

          {/* Sector Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-white/10">
            {[
              { id: 'hotels', label: '1. Hoteliers & Homestays', icon: Building2 },
              { id: 'operators', label: '2. Tour Operators & Agencies', icon: Briefcase },
              { id: 'artisans', label: '3. Local Guides & Artisans', icon: UserCheck },
              { id: 'authorities', label: '4. Tourism Board & Police Telemetry', icon: ShieldAlert },
            ].map(sec => {
              const Icon = sec.icon;
              const isSelected = activeSector === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSector(sec.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF6F59] text-white shadow-sm'
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTOR 1: HOTELIERS & HOMESTAYS */}
      {activeSector === 'hotels' && (
        <div className="space-y-5">
          
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs">
              <span className="text-xs text-[#8C827A] block font-medium">Direct Commission Savings</span>
              <span className="text-2xl font-black text-[#10B981] font-mono mt-1 block">₹4,28,500</span>
              <span className="text-[11px] text-[#5A524C] mt-1 block">Paid 5% platform fee vs 22% OTA rate</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs">
              <span className="text-xs text-[#8C827A] block font-medium">Average Trust Score</span>
              <span className="text-2xl font-black text-[#1F1C18] font-mono mt-1 block">96.4 / 100</span>
              <span className="text-[11px] text-[#10B981] mt-1 block font-semibold">✓ Verified Badge Active</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs">
              <span className="text-xs text-[#8C827A] block font-medium">Direct Inquiries / Month</span>
              <span className="text-2xl font-black text-[#FF6F59] font-mono mt-1 block">1,840</span>
              <span className="text-[11px] text-[#5A524C] mt-1 block">+38% from AI Trip Planner matches</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs">
              <span className="text-xs text-[#8C827A] block font-medium">Complaints Resolution</span>
              <span className="text-2xl font-black text-[#0284C7] font-mono mt-1 block">100%</span>
              <span className="text-[11px] text-[#5A524C] mt-1 block">6/6 resolved within 2 hours</span>
            </div>
          </div>

          {/* Hoteliers Action Panel */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1F1C18]">Property Verification & Direct Booking Engine</h3>
                <p className="text-xs text-[#8C827A]">Audited by Community Inspection Officers</p>
              </div>

              <button
                onClick={() => showToast('Verification audit photo portal opened for hotel partner.')}
                className="px-4 py-2 bg-[#FF6F59] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Submit Fresh Inspection Photos</span>
              </button>
            </div>

            <div className="space-y-3">
              {VERIFIED_HOTELS.slice(0, 2).map((hotel) => (
                <div key={hotel.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={hotel.verifiedPhotos[0]} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-[#1F1C18] text-sm">{hotel.name}</h4>
                      <span className="text-[#8C827A]">{hotel.verifiedAddress}</span>
                      <span className="text-[#10B981] font-semibold block mt-0.5">Trust Score: {hotel.trustScore}/100 • {hotel.lastVerifiedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => showToast('Direct rate rules updated successfully.')}
                      className="px-3 py-1.5 bg-white border border-[#EAE5DC] rounded-xl text-xs font-bold hover:bg-[#F3F0EA]"
                    >
                      Configure Direct Rates
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTOR 2: TOUR OPERATORS & TRAVEL AGENCIES */}
      {activeSector === 'operators' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1F1C18]">Curated Package Ingestion into AI Itineraries</h3>
                <p className="text-xs text-[#8C827A]">Approved travel agencies have their transparent packages matched to traveler prompts</p>
              </div>

              <button
                onClick={() => showToast('Package registration sandbox opened.')}
                className="px-4 py-2 bg-[#1F1C18] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List New Verified Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded-md">
                      ACTIVE IN AI MATCHING
                    </span>
                    <h4 className="font-bold text-[#1F1C18] text-sm mt-1">4-Day Golden Triangle Vande Bharat Tour</h4>
                  </div>
                  <span className="font-mono font-bold text-[#10B981] text-sm">₹18,500</span>
                </div>
                <p className="text-[#5A524C]">
                  Includes Vande Bharat AC Chair Car tickets, 3 verified heritage stays, guided sunrise Taj tour with zero kickbacks.
                </p>
                <div className="text-[11px] text-[#8C827A] flex justify-between pt-1 border-t border-[#F0ECE4]">
                  <span>Agency: Heritage Voyage India (IATO Verified)</span>
                  <span className="font-bold text-[#FF6F59]">42 inquiries this week</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded-md">
                      ACTIVE IN AI MATCHING
                    </span>
                    <h4 className="font-bold text-[#1F1C18] text-sm mt-1">Spiritual Kashi & Sarnath Wheelchair Circuit</h4>
                  </div>
                  <span className="font-mono font-bold text-[#10B981] text-sm">₹12,200</span>
                </div>
                <p className="text-[#5A524C]">
                  Specially audited for wheelchair tourists. Ramp boat embarkation at Assi Ghat, elevator stays, dedicated sahayaks.
                </p>
                <div className="text-[11px] text-[#8C827A] flex justify-between pt-1 border-t border-[#F0ECE4]">
                  <span>Agency: Accessible Bharat Tours</span>
                  <span className="font-bold text-[#FF6F59]">28 inquiries this week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTOR 3: LOCAL GUIDES & ARTISANS */}
      {activeSector === 'artisans' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs">
              <span className="text-xs text-[#8C827A] block font-medium">Digital Disbursed Income</span>
              <span className="text-2xl font-black text-[#10B981] font-mono mt-1 block">₹84,200 / guide avg</span>
              <span className="text-[11px] text-[#5A524C] mt-1 block">100% direct to UPI, zero tout commission cut</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs">
              <span className="text-xs text-[#8C827A] block font-medium">Artisan GI Sales Protected</span>
              <span className="text-2xl font-black text-[#FF6F59] font-mono mt-1 block">₹12,45,000</span>
              <span className="text-[11px] text-[#5A524C] mt-1 block">Authentic Pashmina, Blue Pottery, Silk</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs">
              <span className="text-xs text-[#8C827A] block font-medium">Community Trust Tokens</span>
              <span className="text-2xl font-black text-[#F59E0B] font-mono mt-1 block">42,800 🪙</span>
              <span className="text-[11px] text-[#5A524C] mt-1 block">Awarded for 5-star honest conduct</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-2xs">
            <h3 className="text-base font-bold text-[#1F1C18] mb-1">Artisan Direct Fair Market (Anti-Middleman Shield)</h3>
            <p className="text-xs text-[#5A524C] mb-4">
              Tourists scan the GI QR code on handicrafts to confirm authenticity and pay the weaver directly without 40% driver kickbacks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC]">
                <span className="font-bold text-[#1F1C18] block">Jaipur Blue Pottery Guild</span>
                <span className="text-[#8C827A] text-[11px]">Sanganer Artisan Cluster</span>
                <span className="text-[#10B981] font-semibold block mt-1">100% Direct to 42 Weavers</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC]">
                <span className="font-bold text-[#1F1C18] block">Varanasi Handloom Silk Society</span>
                <span className="text-[#8C827A] text-[11px]">Kotwa & Madanpura Looms</span>
                <span className="text-[#10B981] font-semibold block mt-1">GI Certificate #GI-094</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC]">
                <span className="font-bold text-[#1F1C18] block">Kashmir Pashmina Guild</span>
                <span className="text-[#8C827A] text-[11px]">Srinagar & Delhi Emporium</span>
                <span className="text-[#10B981] font-semibold block mt-1">Silk Mark & Lab Tested</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTOR 4: TOURISM BOARDS & POLICE TELEMETRY */}
      {activeSector === 'authorities' && (
        <div className="space-y-5">
          
          {/* Live Telemetry Banner */}
          <div className="bg-[#FFF1F2] rounded-3xl p-5 border border-[#FECDD3] flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#9F1239]">
                  State Tourist Police & Ministry Telemetry Dashboard
                </h3>
                <p className="text-xs text-[#BE123C]">
                  Aggregated scam hotspots, live SOS emergency dispatch queue, and price-gouging pattern detection.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#10B981] text-white text-xs font-bold rounded-xl flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>SYSTEM LIVE</span>
              </span>
            </div>
          </div>

          {/* Real-time SOS Incidents Log (PRD Section 4.2 & 5) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE4]">
              <div>
                <h3 className="text-base font-bold text-[#1F1C18]">Live SOS Dispatch Queue & Field Units</h3>
                <p className="text-xs text-[#8C827A]">Emergency transmissions packaged with GPS coordinates & tourist category</p>
              </div>
              <span className="text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-2.5 py-1 rounded-xl">
                {sosLogs.filter(s => s.status !== 'resolved').length} Active Dispatches
              </span>
            </div>

            <div className="space-y-3">
              {sosLogs.map((incident) => (
                <div 
                  key={incident.id}
                  className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    incident.status === 'resolved'
                      ? 'bg-[#F9FBF9] border-[#D1FAE5]'
                      : 'bg-[#FFF9F9] border-[#FECDD3]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1F1C18]">{incident.id}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        incident.status === 'resolved'
                          ? 'bg-[#ECFDF5] text-[#065F46]'
                          : 'bg-[#FEE2E2] text-[#B91C1C] animate-pulse'
                      }`}>
                        {incident.status}
                      </span>
                      <span className="text-[#8C827A]">• {incident.city} ({incident.location})</span>
                    </div>

                    <p className="text-[#5A524C]">{incident.notes}</p>
                    <div className="text-[11px] text-[#8C827A]">
                      Assigned: <strong className="text-[#1F1C18]">{incident.policeUnitAssigned}</strong> • {incident.timestamp}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {incident.status !== 'resolved' ? (
                      <button
                        onClick={() => handleResolveSOS(incident.id)}
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Mark Case Resolved
                      </button>
                    ) : (
                      <span className="text-[#10B981] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Closed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1C18] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
