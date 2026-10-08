import React, { useState, useEffect } from 'react';
import {
  Building,
  ShieldAlert,
  MapPin,
  Flame,
  Smile,
  AlertTriangle,
  Landmark,
  FileCheck2,
  Gavel,
  TrendingUp,
  Users,
  PhoneCall,
  Sparkles,
  Radio,
  CheckCircle2,
  Eye,
  Clock,
  ArrowUpRight,
  Shield,
  ChevronRight,
  Send,
  Plus,
  User,
  LogOut,
  FileText,
  Award,
  BadgeCheck,
  ArrowLeft,
} from 'lucide-react';
import {
  AUTHORITY_HERITAGE_REPORTS,
  AUTHORITY_ENFORCEMENT_ACTIONS,
} from '../../data/ecosystemData';
import { HeritageSiteReport, EnforcementAction } from '../../types/entity';
import { AuthUser } from '../../types/auth';
import { DashboardMapSection } from '../maps/DashboardMapSection';

export type AuthorityDashboardTab = 'overview' | 'map' | 'heatmaps' | 'sentiment' | 'complaints' | 'heritage' | 'compliance' | 'enforcement' | 'profile';

interface AuthorityDashboardProps {
  onOpenEcosystemModal?: () => void;
  currentUser?: AuthUser | null;
  onSwitchAccount?: () => void;
  onLogout?: () => void;
  activeTab?: AuthorityDashboardTab;
  onTabChange?: (tab: AuthorityDashboardTab) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  onOpenEcosystemModal: _onOpenEcosystemModal,
  currentUser,
  onSwitchAccount: _onSwitchAccount,
  onLogout,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [heritageReports, setHeritageReports] = useState<HeritageSiteReport[]>(AUTHORITY_HERITAGE_REPORTS);
  const [enforcementActions, setEnforcementActions] = useState<EnforcementAction[]>(AUTHORITY_ENFORCEMENT_ACTIONS);
  const [internalTab, setInternalTab] = useState<AuthorityDashboardTab>('overview');
  const activeTab = controlledTab || internalTab;
  const setActiveTab = (tab: AuthorityDashboardTab) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [selectedReport, setSelectedReport] = useState<HeritageSiteReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEnforcementModal, setShowEnforcementModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [newEnforcement, setNewEnforcement] = useState({
    businessName: '',
    category: 'Handicrafts',
    violation: '',
    actionType: 'Penalty Fine' as const,
    amountOrPenalty: '₹10,000 Fine',
  });

  // Sync with URL hash or custom event if profile is targeted
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes('profile')) {
        setActiveTab('profile');
      }
    };
    handleHash();
    const handleCustom = () => setActiveTab('profile');
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('open-dashboard-profile', handleCustom);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('open-dashboard-profile', handleCustom);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolveHeritageReport = (id: string, actionNote: string) => {
    setHeritageReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Resolved',
          actionTaken: actionNote || 'ASI Conservation unit inspected and restored site access.'
        };
      }
      return r;
    }));
    setSelectedReport(null);
    showToast(`Heritage incident ${id} marked as inspected and resolved.`);
  };

  const handleCreateEnforcement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnforcement.businessName || !newEnforcement.violation) return;

    const action: EnforcementAction = {
      id: `ENF-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessName: newEnforcement.businessName,
      category: newEnforcement.category,
      violation: newEnforcement.violation,
      actionType: newEnforcement.actionType as any,
      amountOrPenalty: newEnforcement.amountOrPenalty,
      date: 'Just now',
      status: 'Enforced',
      authorityOfficer: currentUser?.name || 'Central Enforcement Control'
    };

    setEnforcementActions(prev => [action, ...prev]);
    setShowEnforcementModal(false);
    setNewEnforcement({
      businessName: '',
      category: 'Handicrafts',
      violation: '',
      actionType: 'Penalty Fine',
      amountOrPenalty: '₹10,000 Fine',
    });
    showToast(`Enforcement order ${action.id} published to Business Dashboard and Police network.`);
  };

  const criticalHeritageCount = heritageReports.filter(r => r.status !== 'Resolved').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'map', label: 'Heritage Map', icon: MapPin },
    { id: 'heatmaps', label: 'Heatmaps', icon: Flame },
    { id: 'sentiment', label: 'Sentiment', icon: Smile },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
    { id: 'heritage', label: `Heritage (${criticalHeritageCount})`, icon: Landmark, badge: criticalHeritageCount > 0 },
    { id: 'compliance', label: 'Compliance', icon: FileCheck2 },
    { id: 'enforcement', label: `Enforcement (${enforcementActions.length})`, icon: Gavel },
  ];

  return (
    <div className="space-y-0 animate-in fade-in duration-200 pb-24">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#991B1B] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#EF4444] animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-[#FCA5A5]" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 1: DEDICATED OVERVIEW / COMMAND CENTER                   */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Cinematic Hero Banner */}
          <div
            id="authority-hero-section"
            className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-[0_2px_12px_rgba(25,23,21,0.04)]"
          >
            {/* Dark Cinematic Hero Header */}
            <div className="relative min-h-[220px] sm:min-h-[260px] w-full overflow-hidden bg-[#1A0A0E] select-none flex flex-col justify-between p-4 sm:p-6 md:p-8">

              {/* Background Image with gradient overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80"
                  alt="Authority Dashboard"
                  className="w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0E] via-[#1A0A0E]/80 to-[#1A0A0E]/55" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A0A0E]/90 via-[#1A0A0E]/40 to-transparent hidden md:block" />
              </div>

              {/* Top badges row */}
              <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#191715] text-[11px] sm:text-xs font-extrabold shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-[#BE123C] shrink-0" />
                    <span className="truncate max-w-[190px]">{currentUser?.department || 'Ministry of Tourism & ASI'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/20 shrink-0">
                    <Landmark className="w-3.5 h-3.5 text-[#FDA4AF] shrink-0" />
                    <span>ASI Heritage Zones: 34 Sites</span>
                  </span>
                </div>

                {/* Live telemetry pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#BE123C]/90 text-white text-[11px] sm:text-xs font-bold shadow-md border border-[#BE123C]/40">
                  <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  <span>District Telemetry Live</span>
                </div>
              </div>

              {/* Slide Content */}
              <div className="relative z-10 w-full text-white space-y-2.5 sm:space-y-3 mt-auto pt-6">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-md bg-[#BE123C]/90 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-xs shrink-0">
                    Authority Console
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-md bg-white/15 backdrop-blur-md text-white/90 text-[10px] sm:text-[11px] font-semibold border border-white/15 shrink-0">
                    {currentUser?.designation || 'Chief Heritage Inspector'}
                  </span>
                  {currentUser?.officerBadgeId && (
                    <span className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-md text-white/90 text-[10px] sm:text-[11px] font-semibold border border-white/15 shrink-0">
                      Badge: {currentUser.officerBadgeId}
                    </span>
                  )}
                </div>

                <div className="max-w-3xl space-y-1 sm:space-y-1.5">
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    Ministry of Tourism, ASI & Police Telemetry
                  </h1>
                  <p className="text-xs sm:text-sm text-white/85 font-medium leading-relaxed max-w-2xl drop-shadow-xs">
                    <span className="font-semibold text-[#FDA4AF]">Unified governance command:</span>{' '}
                    Real-time crowd heatmaps, tourist sentiment, heritage preservation alerts, merchant compliance & rapid enforcement.
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="p-4 sm:p-5 md:p-6 bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-4 border-t border-[#E8E2D9]">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center gap-2 font-bold text-[#191715]">
                  <Flame className="w-3.5 h-3.5 text-[#BE123C]" />
                  <span>38,420 Active</span>
                  <span className="text-[10px] text-[#665E55] font-normal uppercase tracking-wider">In District</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center gap-2 font-bold text-[#191715]">
                  <Smile className="w-3.5 h-3.5 text-[#059669]" />
                  <span>82%</span>
                  <span className="text-[10px] text-[#665E55] font-normal uppercase tracking-wider">Positive Sentiment</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center gap-2 font-bold text-[#191715]">
                  <Gavel className="w-3.5 h-3.5 text-[#991B1B]" />
                  <span>{enforcementActions.length} Actions</span>
                  <span className="text-[10px] text-[#665E55] font-normal uppercase tracking-wider">This Week</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => { setActiveTab('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#191715] border border-[#E8E2D9] text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 text-[#BE123C] shrink-0" />
                  <span>Heritage Map</span>
                </button>
                <button
                  onClick={() => { setActiveTab('heatmaps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#191715] border border-[#E8E2D9] text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <Flame className="w-4 h-4 text-[#BE123C] shrink-0" />
                  <span>Crowd Heatmaps</span>
                </button>
                <button
                  onClick={() => setShowEnforcementModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#BE123C] hover:bg-[#9F1239] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Gavel className="w-4 h-4 stroke-[2.4] shrink-0" />
                  <span>Issue Enforcement</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#665E55]">Footfall Density</span>
                <div className="p-2 rounded-xl bg-[#FFF1F2]">
                  <Flame className="w-4 h-4 text-[#BE123C]" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#191715]">38,420</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#BE123C]" />
                <span className="text-xs font-semibold text-[#BE123C]">Active in District</span>
              </div>
              <div className="text-[11px] text-[#665E55] mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Peak surge: Taj Mahal Western Gate (88% Cap)</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#665E55]">Tourist Sentiment</span>
                <div className="p-2 rounded-xl bg-[#ECFDF5]">
                  <Smile className="w-4 h-4 text-[#059669]" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#191715]">82%</div>
              <div className="text-xs font-bold text-[#059669] mt-1">Positive Perception</div>
              <div className="text-[11px] text-[#665E55] mt-2">
                Clean ghats, safe night lighting, verified auto cards
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#665E55]">Compliance Enforcement</span>
                <div className="p-2 rounded-xl bg-[#FEF2F2]">
                  <Gavel className="w-4 h-4 text-[#991B1B]" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#991B1B]">{enforcementActions.length} Actions</div>
              <div className="text-xs text-[#991B1B] font-bold mt-1">Active Penalties Enforced</div>
              <div className="text-[11px] text-[#665E55] mt-2">
                Turnaround SLA: 1.8 hrs from tourist ticket
              </div>
            </div>
          </div>

          {/* Executive Dedicated Modules Hub */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#191715]">District Governance Modules</h2>
                <p className="text-xs text-[#665E55]">Select any dedicated module below to open its full dashboard control page.</p>
              </div>
              <span className="text-xs font-bold text-[#BE123C] bg-[#FFF1F2] px-3 py-1 rounded-xl border border-[#FECDD3]">
                8 Dedicated Pages Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  id: 'map',
                  title: 'ASI Heritage Map',
                  desc: 'Regulated perimeters (100m/200m) & police patrol beacons.',
                  icon: MapPin,
                  badge: 'Live Geospatial',
                  color: 'text-[#BE123C]',
                  bg: 'bg-[#FFF1F2]',
                },
                {
                  id: 'heatmaps',
                  title: 'Crowd Heatmaps',
                  desc: 'Monument capacity surges, transit arrivals & gate bottlenecks.',
                  icon: Flame,
                  badge: '1 Critical Surge',
                  badgeColor: 'bg-[#FEF2F2] text-[#DC2626]',
                  color: 'text-[#BE123C]',
                  bg: 'bg-[#FFF1F2]',
                },
                {
                  id: 'sentiment',
                  title: 'Tourist Sentiment',
                  desc: 'Perception index, satisfaction drivers & visitor feedback.',
                  icon: Smile,
                  badge: '82% Positive',
                  color: 'text-[#059669]',
                  bg: 'bg-[#ECFDF5]',
                },
                {
                  id: 'complaints',
                  title: 'Grievance Trends',
                  desc: 'Overcharging trends, fake guide reports & tout hot-spots.',
                  icon: AlertTriangle,
                  badge: '4 Categories',
                  color: 'text-[#D97706]',
                  bg: 'bg-[#FFFBEB]',
                },
                {
                  id: 'heritage',
                  title: 'Heritage Preservation',
                  desc: 'Field damage inspection reports, barrier breaches & ASI repairs.',
                  icon: Landmark,
                  badge: `${criticalHeritageCount} Pending`,
                  badgeColor: criticalHeritageCount > 0 ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#ECFDF5] text-[#059669]',
                  color: 'text-[#BE123C]',
                  bg: 'bg-[#FFF1F2]',
                },
                {
                  id: 'compliance',
                  title: 'Commercial Compliance',
                  desc: 'Fair-price adherence rate, certified guide badges & surprise raids.',
                  icon: FileCheck2,
                  badge: '96.2% Rate',
                  color: 'text-[#059669]',
                  bg: 'bg-[#ECFDF5]',
                },
                {
                  id: 'enforcement',
                  title: 'Rapid Enforcement',
                  desc: 'Challan registry, license suspensions & penalty execution.',
                  icon: Gavel,
                  badge: `${enforcementActions.length} Orders`,
                  color: 'text-[#991B1B]',
                  bg: 'bg-[#FEF2F2]',
                },
                {
                  id: 'profile',
                  title: 'Officer Profile',
                  desc: 'Official credentials, badge ID, jurisdiction zone & Sign Out.',
                  icon: User,
                  badge: 'Official Session',
                  color: 'text-[#7C3AED]',
                  bg: 'bg-[#F5F3FF]',
                },
              ].map(card => {
                const CardIcon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => { setActiveTab(card.id as any); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-4 rounded-2xl border border-[#EAE5DC] bg-[#FAF8F5] hover:bg-white hover:border-[#BE123C]/40 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                          <CardIcon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${card.badgeColor || 'bg-white text-[#191715] border-[#EAE5DC]'}`}>
                          {card.badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#191715] group-hover:text-[#BE123C] transition-colors flex items-center gap-1">
                          <span>{card.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-xs text-[#665E55] mt-1 leading-relaxed line-clamp-2">{card.desc}</p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#EAE5DC] text-[11px] font-bold text-[#BE123C] flex items-center justify-between">
                      <span>Open Dedicated Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Incident Banner */}
          <div className="p-4 rounded-3xl bg-[#FEF2F2] border border-[#FECDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-white text-[#DC2626] shrink-0 shadow-2xs">
                <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div>
                <strong className="text-[#991B1B]">District Surge Alert:</strong>{' '}
                <span className="text-[#7F1D1D]">
                  Taj Mahal Western Gate has reached 88% capacity. Automated pedestrian diversion signs active towards South Gate.
                </span>
              </div>
            </div>
            <button
              onClick={() => { setActiveTab('heatmaps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-3.5 py-1.5 rounded-xl bg-[#DC2626] text-white font-bold hover:bg-[#B91C1C] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Inspect Surge Radar →
            </button>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: DEDICATED ASI HERITAGE MAP PAGE                      */}
      {/* ============================================================ */}
      {activeTab === 'map' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] text-[#BE123C] flex items-center justify-center shrink-0 border border-[#FECDD3]">
                  <MapPin className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#BE123C]">Heritage Map</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Live Location & ASI Heritage Map</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Officer GPS telemetry, ASI monument perimeters & live police patrol beacons.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF1F2] text-[#BE123C] text-xs font-bold border border-[#FECDD3]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Patrol Radar Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* Full Interactive Map */}
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xs overflow-hidden">
            <DashboardMapSection role="authority" currentUser={currentUser} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 3: DEDICATED CROWD HEATMAPS PAGE                        */}
      {/* ============================================================ */}
      {activeTab === 'heatmaps' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] text-[#BE123C] flex items-center justify-center shrink-0 border border-[#FECDD3]">
                  <Flame className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#BE123C]">Crowd Heatmaps</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Where and Why Footfall Changes</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Live crowd telemetry correlating monument capacity, weather shifts, and transit arrivals.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#BE123C] bg-[#FFF1F2] px-3 py-1.5 rounded-xl border border-[#FECDD3]">
                  🔴 1 Critical Bottleneck Flagged
                </span>
              </div>
            </div>
          </div>

          {/* Monitored Zones */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                { site: 'Taj Mahal (Western Gate)', density: '88% Capacity', level: 'Critical', visitors: '14,200', reason: 'Morning ticket surge + international group arrivals via Gatimaan Express', color: 'border-[#EF4444] bg-[#FEF2F2]' },
                { site: 'Red Fort (Lahori Gate)', density: '62% Capacity', level: 'Moderate', visitors: '9,450', reason: 'Normal weekend flow; sound & light show surge anticipated at 6:30 PM', color: 'border-[#F59E0B] bg-[#FFFBEB]' },
                { site: 'Hawa Mahal & Johari Bazaar', density: '74% Capacity', level: 'Elevated', visitors: '8,100', reason: 'Evening craft shopping surge; pedestrian zone active', color: 'border-[#F59E0B] bg-[#FFFBEB]' },
                { site: 'Dashashwamedh Ghat', density: '91% Capacity', level: 'High Surge', visitors: '16,500', reason: 'Evening Ganga Aarti preparation; boat queue regulation deployed', color: 'border-[#EF4444] bg-[#FEF2F2]' },
              ].map((zone, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${zone.color} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#191715]">{zone.site}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white shadow-2xs">
                      {zone.level}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#191715]">{zone.density}</span>
                    <span className="text-xs text-[#665E55]">({zone.visitors} tourists)</span>
                  </div>
                  <p className="text-[11px] text-[#443F38] leading-tight"><strong>Cause:</strong> {zone.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 4: DEDICATED TOURIST SENTIMENT PAGE                     */}
      {/* ============================================================ */}
      {activeTab === 'sentiment' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                  <Smile className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#059669]">Tourist Sentiment</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Overall Sentiment Insights</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Aggregated from tourist app reviews, complaints, and guide ratings.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1.5 rounded-xl border border-[#A7F3D0]">
                  82% Positive Overall
                </span>
              </div>
            </div>
          </div>

          {/* Sentiment Content */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#059669]">Positive (82%)</span>
                <span className="text-[#665E55]">Neutral (12%)</span>
                <span className="text-[#DC2626]">Negative (6%)</span>
              </div>
              <div className="h-4 w-full bg-[#EAE5DC] rounded-full overflow-hidden flex">
                <div style={{ width: '82%' }} className="bg-[#059669] h-full" />
                <div style={{ width: '12%' }} className="bg-[#F59E0B] h-full" />
                <div style={{ width: '6%' }} className="bg-[#EF4444] h-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-2">
                <div className="font-extrabold text-[#166534] text-sm">Top Positive Drivers</div>
                <div className="text-[#15803D] space-y-1">
                  <div>• Verified ASI Guides (+34% trust score)</div>
                  <div>• Fair Price rate cards on registered auto stands</div>
                  <div>• Clean RO water dispensers around monument outer court</div>
                  <div>• Instant bilingual QR ticket turnstiles</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] space-y-2">
                <div className="font-extrabold text-[#991B1B] text-sm">Top Negative Drivers</div>
                <div className="text-[#B91C1C] space-y-1">
                  <div>• Unofficial touts at outer parking perimeter</div>
                  <div>• Long security queues during peak 11 AM arrival</div>
                  <div>• Lack of step-free ramps at older heritage ghats</div>
                  <div>• Discrepancies in shoe deposit counter fees</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 5: DEDICATED TOURIST COMPLAINTS & TRENDS PAGE           */}
      {/* ============================================================ */}
      {activeTab === 'complaints' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 border border-[#FCA5A5]">
                  <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#DC2626]">Grievance Trends</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Top Issues, Trends & Patterns</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Categorization of tourist-reported grievances across Golden Triangle district.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1.5 rounded-xl border border-[#A7F3D0]">
                  Target: &lt; 5% total issues
                </span>
              </div>
            </div>
          </div>

          {/* Complaint Categories */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
            <div className="space-y-3 text-xs">
              {[
                { label: 'Overcharging & Auto Fare Inflation', percent: 38, count: 142, change: '-12% this week', color: 'bg-[#DC2626]' },
                { label: 'Unofficial / Fake Guides (No ASI Badge)', percent: 26, count: 98, change: '-18% after verification badge rollout', color: 'bg-[#EA580C]' },
                { label: 'Street Sanitation & Plastic Waste', percent: 19, count: 71, change: '-8% municipal pickup', color: 'bg-[#D97706]' },
                { label: 'Counterfeit Craft / False GI Claims', percent: 17, count: 64, change: '4 shops delisted', color: 'bg-[#4F46E5]' },
              ].map((cat, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2">
                  <div className="flex justify-between font-bold text-[#191715]">
                    <span className="text-sm">{cat.label}</span>
                    <span className="text-xs">{cat.percent}% ({cat.count} cases)</span>
                  </div>
                  <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.percent}%` }} />
                  </div>
                  <div className="text-[11px] text-[#059669] font-medium flex items-center justify-between">
                    <span>{cat.change}</span>
                    <span className="text-[#665E55]">SLA Resolution: 1.8 hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 6: DEDICATED HERITAGE PRESERVATION PAGE                 */}
      {/* ============================================================ */}
      {activeTab === 'heritage' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF1F2] text-[#BE123C] flex items-center justify-center shrink-0 border border-[#FECDD3]">
                  <Landmark className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#BE123C]">Heritage Preservation</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Heritage-Site Issue Reports</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Direct reports from ASI on-ground conservationists and verified tourist transmissions.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#BE123C] bg-[#FFF1F2] px-3 py-1.5 rounded-xl border border-[#FECDD3]">
                  {heritageReports.length} Monument Reports
                </span>
              </div>
            </div>
          </div>

          {/* Heritage Reports List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {heritageReports.map(rep => (
              <div
                key={rep.id}
                className={`p-5 rounded-3xl border transition-all ${rep.status === 'Resolved'
                  ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                  : rep.severity === 'critical'
                    ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                    : 'bg-[#FFFBEB] border-[#FDE68A]'
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#665E55]">{rep.id}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-white ${rep.severity === 'critical' ? 'bg-[#DC2626]' : 'bg-[#D97706]'
                        }`}>
                        {rep.category}
                      </span>
                      <span className="text-xs text-[#665E55]">{rep.timestamp}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#191715]">{rep.siteName} ({rep.city})</h3>
                    <p className="text-xs text-[#443F38] leading-relaxed">{rep.description}</p>
                    <div className="text-[11px] text-[#665E55]">Source: {rep.reportedBy}</div>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg shrink-0 ${rep.status === 'Resolved' ? 'bg-[#059669] text-white' : 'bg-[#DC2626] text-white'
                    }`}>
                    {rep.status}
                  </span>
                </div>

                {rep.actionTaken ? (
                  <div className="mt-3 pt-2.5 border-t border-black/10 text-xs text-[#065F46] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span><strong>Action Taken:</strong> {rep.actionTaken}</span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
                    <span className="text-xs text-[#DC2626] font-bold">Needs authority field dispatch</span>
                    <button
                      onClick={() => handleResolveHeritageReport(rep.id, 'Inspection completed by ASI regional unit. Restored to safe standards.')}
                      className="px-3.5 py-1.5 bg-[#BE123C] hover:bg-[#9F1239] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Dispatch & Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 7: DEDICATED COMMERCIAL COMPLIANCE PAGE                 */}
      {/* ============================================================ */}
      {activeTab === 'compliance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                  <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#059669]">Commercial Compliance</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Merchant Compliance & Anti-Tout Units</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Surprise check records, rate card audits, and authorized guide coverage.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1.5 rounded-xl border border-[#A7F3D0]">
                  Audit Status: Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Compliance Audit Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Fair-Price Compliance Rate', value: '96.2%', sub: 'Audited against Yatra One Fair-Price Benchmark', color: 'text-[#059669]' },
              { label: 'Verified Guide Badge Coverage', value: '91.8%', sub: 'ASI certified badges active on ground', color: 'text-[#059669]' },
              { label: 'Enforcement Turnaround', value: '1.8 hours', sub: 'Avg time from tourist report to resolution', color: 'text-[#191715]' },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-2xs space-y-1">
                <div className="text-[#665E55] text-xs font-bold">{stat.label}</div>
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-[#665E55] mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-3">
            <h3 className="text-base font-extrabold text-[#191715]">Active Inspection Directives</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#191715]">Prepaid Auto Stand Rate Board Audit</div>
                  <div className="text-[11px] text-[#665E55]">Mandatory display of district-sanctioned rates at Agra Cantt & Fort station stands.</div>
                </div>
                <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-lg">Inspected ✓</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#191715]">GI Marble Artisan Anti-Counterfeit Sweep</div>
                  <div className="text-[11px] text-[#665E55]">Taj Ganj market compliance team verified 42 emporiums for genuine alabaster origin.</div>
                </div>
                <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-lg">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 8: DEDICATED RAPID ENFORCEMENT ACTIONS PAGE             */}
      {/* ============================================================ */}
      {activeTab === 'enforcement' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] text-[#991B1B] flex items-center justify-center shrink-0 border border-[#FCA5A5]">
                  <Gavel className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#991B1B]">Rapid Enforcement</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Rapid Enforcement Actions Log</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Penalties, rank adjustments & delisting orders issued by authorized officers.</p>
                </div>
              </div>

              <button
                onClick={() => setShowEnforcementModal(true)}
                className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Enforcement</span>
              </button>
            </div>
          </div>

          {/* Enforcement Registry */}
          <div className="space-y-3">
            {enforcementActions.map(action => (
              <div key={action.id} className="p-5 rounded-3xl bg-white border border-[#EAE5DC] shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#665E55]">{action.id}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${action.actionType.includes('Suspension') ? 'bg-[#991B1B] text-white' : 'bg-[#DC2626] text-white'
                        }`}>
                        {action.actionType}
                      </span>
                      <span className="text-xs text-[#665E55]">{action.date}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#191715]">{action.businessName}</h3>
                    <p className="text-xs text-[#443F38]"><strong>Violation:</strong> {action.violation}</p>
                    <div className="text-xs text-[#991B1B] font-bold">Penalty: {action.amountOrPenalty}</div>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-xs font-bold">
                      {action.status}
                    </span>
                    <div className="text-[10px] text-[#665E55]">{action.authorityOfficer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 9: DEDICATED OFFICER PROFILE & SIGN OUT PAGE            */}
      {/* ============================================================ */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0 border border-[#DDD6FE]">
                  <User className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#BE123C] transition-colors cursor-pointer flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#7C3AED]">Officer Profile</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Officer Credentials & Command Settings</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Government authority authorization, ASI jurisdiction zone, and session controls.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#191715] text-xs font-bold border border-[#EAE5DC] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Console</span>
                </button>
                <span className="px-3 py-1.5 rounded-full bg-[#FFF1F2] text-[#BE123C] text-xs font-bold border border-[#FECDD3] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Authorized Official</span>
                </span>
              </div>
            </div>
          </div>

          {/* Officer Identity Card */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser?.name || 'Officer Profile'}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#FAF8F5] shadow-sm shrink-0"
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#191715]">{currentUser?.name || 'Insp. Vikramaditya Sharma'}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#BE123C] text-xs font-bold border border-[#FECDD3]">
                    {currentUser?.designation || 'Chief Heritage Inspector'}
                  </span>
                </div>
                <p className="text-xs text-[#665E55]">
                  Department: <strong className="text-[#191715]">{currentUser?.department || 'Archaeological Survey of India & Ministry of Tourism'}</strong>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#8C827A] pt-0.5">
                  <span className="flex items-center gap-1 text-[#BE123C] font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Badge: {currentUser?.officerBadgeId || 'ASI-ND-8492'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#BE123C]" />
                    <span>Jurisdiction: Agra Heritage Circle (Taj Mahal, Agra Fort, Fatehpur Sikri)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Deployment Details */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)] space-y-4">
            <h3 className="text-base font-extrabold text-[#191715]">Command Authorization & Active Posting</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
                <div className="text-[#665E55]">Jurisdiction District</div>
                <div className="font-extrabold text-[#191715] text-sm">Northern Heritage Command (Circle 4)</div>
                <div className="text-[11px] text-[#665E55]">34 Monitored ASI Zones</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
                <div className="text-[#665E55]">Enforcement Authority Level</div>
                <div className="font-extrabold text-[#BE123C] text-sm">Class I Gazetted Inspector</div>
                <div className="text-[11px] text-[#665E55]">Authorized for on-spot challans & license suspensions</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
                <div className="text-[#665E55]">Dispatch Unit Control</div>
                <div className="font-extrabold text-[#191715] text-sm">Tourist Police Rapid Response Unit</div>
                <div className="text-[11px] text-[#665E55]">Connected to live GPS patrol network</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
                <div className="text-[#665E55]">Session Token Expiry</div>
                <div className="font-extrabold text-[#059669] text-sm">24h Shift Active</div>
                <div className="text-[11px] text-[#665E55]">Secure Government SSO Authentication</div>
              </div>
            </div>
          </div>

          {/* SIGN OUT SECTION */}
          <div className="bg-white rounded-3xl border-2 border-[#FECACA] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#DC2626] flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out of Authority Command Console</span>
                </h3>
                <p className="text-xs text-[#665E55]">
                  Signing out ends your officer session and disables field dispatch authority on this device until next authentication.
                </p>
              </div>

              <button
                type="button"
                id="authority-signout-btn"
                onClick={() => setShowLogoutModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enforcement Order Modal */}
      {showEnforcementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#EAE5DC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-[#991B1B]" />
                </div>
                <h3 className="text-base font-extrabold text-[#191715]">Issue Authority Enforcement Order</h3>
              </div>
              <button
                onClick={() => setShowEnforcementModal(false)}
                className="text-xs font-bold text-[#665E55] hover:text-[#191715] cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateEnforcement} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#191715] block mb-1">Business or Stand Name</label>
                <input
                  type="text"
                  required
                  value={newEnforcement.businessName}
                  onChange={e => setNewEnforcement(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="E.g., Sunrise Souvenirs Shop #9"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl p-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#991B1B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#191715] block mb-1">Violation Description</label>
                <textarea
                  required
                  value={newEnforcement.violation}
                  onChange={e => setNewEnforcement(prev => ({ ...prev, violation: e.target.value }))}
                  placeholder="E.g., Quoted ₹1,800 for ₹350 marked silk scarf to foreign tourist party. Refused official receipt."
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl p-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#991B1B] min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#191715] block mb-1">Action Type</label>
                  <select
                    value={newEnforcement.actionType}
                    onChange={e => setNewEnforcement(prev => ({ ...prev, actionType: e.target.value as any }))}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl p-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#991B1B]"
                  >
                    <option value="Penalty Fine">Penalty Fine</option>
                    <option value="Rank Demotion">Rank Demotion</option>
                    <option value="Suspension / Delisting">Suspension / Delisting</option>
                    <option value="Police Warning">Police Warning</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#191715] block mb-1">Penalty Terms</label>
                  <input
                    type="text"
                    value={newEnforcement.amountOrPenalty}
                    onChange={e => setNewEnforcement(prev => ({ ...prev, amountOrPenalty: e.target.value }))}
                    placeholder="E.g., ₹15,000 Fine + 7 Day Delist"
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl p-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#991B1B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnforcementModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#EAE5DC] font-semibold text-[#665E55] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-extrabold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#EAE5DC] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#191715]">Confirm Official Sign Out</h3>
              <p className="text-xs text-[#665E55]">
                Are you sure you want to end your official command session for <strong>{currentUser?.name || 'Inspector'}</strong>?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EAE5DC] text-xs font-bold text-[#665E55] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black transition-colors cursor-pointer shadow-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* BOTTOM DOCKED NAVIGATION BAR                                  */}
      {/* ============================================================ */}
      <nav
        aria-label="Authority Dashboard Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8E2D9] px-2 sm:px-4 py-1.5 shadow-[0_-4px_25px_rgba(25,23,21,0.07)]"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          {/* Centralized tabs area */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar w-full">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`auth-nav-${tab.id}-btn`}
                  onClick={() => { setActiveTab(tab.id as any); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 sm:px-3 rounded-xl transition-all cursor-pointer shrink-0 group ${isActive
                    ? 'text-[#BE123C] font-bold'
                    : 'text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5]'
                    }`}
                  aria-label={tab.label}
                  title={tab.label}
                >
                  <div className={`relative p-1 sm:p-1.5 rounded-xl transition-colors flex items-center justify-center ${isActive ? 'bg-[#BE123C]/12 text-[#BE123C]' : 'group-hover:bg-[#FAF8F5]'
                    }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                    {isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#BE123C]" />
                    )}
                    {tab.badge && !isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[11px] leading-tight text-center truncate max-w-full ${isActive ? 'font-black text-[#BE123C]' : 'font-medium'
                    }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

    </div>
  );
};
