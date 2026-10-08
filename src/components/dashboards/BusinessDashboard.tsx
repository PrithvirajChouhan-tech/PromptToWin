import React, { useState, useEffect } from 'react';
import {
  Store,
  TrendingUp,
  Users,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle2,
  Award,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Building2,
  ChevronRight,
  FileCheck,
  Send,
  Eye,
  Percent,
  MapPin,
  Check,
  Radio,
  IndianRupee,
  ArrowUpRight,
  Filter,
  RefreshCw,
  User,
  LogOut,
  Bell,
  Save,
  Phone,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_BUSINESS_COMPLAINTS,
  HOURLY_FOOTFALL_DATA,
} from '../../data/ecosystemData';
import { BusinessProfile, BusinessComplaint } from '../../types/entity';
import { AuthUser } from '../../types/auth';
import { DashboardMapSection } from '../maps/DashboardMapSection';

export type BusinessDashboardTab = 'overview' | 'map' | 'footfall' | 'complaints' | 'ratings' | 'quality_action' | 'profile';

interface BusinessDashboardProps {
  onOpenEcosystemModal?: () => void;
  currentUser?: AuthUser | null;
  onSwitchAccount?: () => void;
  onLogout?: () => void;
  onUpdateUser?: (updated: AuthUser) => void;
  activeTab?: BusinessDashboardTab;
  onTabChange?: (tab: BusinessDashboardTab) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  onOpenEcosystemModal: _onOpenEcosystemModal,
  currentUser,
  onSwitchAccount: _onSwitchAccount,
  onLogout,
  onUpdateUser,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [profile, setProfile] = useState<BusinessProfile>(() => {
    if (currentUser?.businessName) {
      return {
        ...INITIAL_BUSINESS_PROFILE,
        name: currentUser.businessName,
        gstOrLicense: currentUser.gstOrLicense || INITIAL_BUSINESS_PROFILE.gstOrLicense,
        ownerName: currentUser.name || INITIAL_BUSINESS_PROFILE.ownerName,
        location: currentUser.businessLocation || INITIAL_BUSINESS_PROFILE.location,
      };
    }
    return INITIAL_BUSINESS_PROFILE;
  });
  const [complaints, setComplaints] = useState<BusinessComplaint[]>(INITIAL_BUSINESS_COMPLAINTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pending' | 'resolved'>('all');
  const [internalTab, setInternalTab] = useState<BusinessDashboardTab>('overview');
  const activeTab = controlledTab || internalTab;
  const setActiveTab = (tab: BusinessDashboardTab) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [selectedComplaint, setSelectedComplaint] = useState<BusinessComplaint | null>(null);
  const [actionText, setActionText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form States
  const [ownerName, setOwnerName] = useState(profile.ownerName || currentUser?.name || 'Sunil Mathur');
  const [businessName, setBusinessName] = useState(profile.name || currentUser?.businessName || 'Marble Craft Guild & Emporium');
  const [category, setCategory] = useState(profile.category || currentUser?.businessCategory || 'Handicraft');
  const [location, setLocation] = useState(profile.location || currentUser?.businessLocation || 'Taj Ganj, Western Gate Road');
  const [gstOrLicense, setGstOrLicense] = useState(profile.gstOrLicense || currentUser?.gstOrLicense || 'UP09AABM1289P1Z3 (UP Tourism Approved)');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 94140 12345');
  const [email, setEmail] = useState(currentUser?.email || 'manager@royalhavelicrafts.com');

  // Notification Preferences
  const [notifyGrievance, setNotifyGrievance] = useState(true);
  const [notifyDailyReport, setNotifyDailyReport] = useState(true);
  const [notifyAuthorityAlerts, setNotifyAuthorityAlerts] = useState(true);

  // Logout modal state & save feedback
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

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

  const handleResolveComplaint = (id: string, actionNote: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Resolved',
          actionTaken: actionNote || 'Corrective action committed by merchant. Pricing and standards reconciled.',
          impactOnRank: 'Rank restored. Verified Partner status fully active.'
        };
      }
      return c;
    }));
    setProfile(prev => ({
      ...prev,
      qualityScore: Math.min(100, prev.qualityScore + 2)
    }));
    setSelectedComplaint(null);
    setActionText('');
    showToast('Complaint resolved & reported back to Tourist App and Authority portal!');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: BusinessProfile = {
      ...profile,
      ownerName,
      name: businessName,
      category: category as any,
      location,
      gstOrLicense,
    };
    setProfile(updatedProfile);

    if (currentUser && onUpdateUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: ownerName,
        businessName,
        gstOrLicense,
        businessLocation: location,
        businessCategory: category as any,
        phone,
        email,
      };
      onUpdateUser(updatedUser);
    }
    setProfileSaved(true);
    showToast('Merchant profile updated successfully!');
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const filteredComplaints = complaints.filter(c => {
    if (selectedCategory === 'pending') return c.status === 'Pending' || c.status === 'Action Committed';
    if (selectedCategory === 'resolved') return c.status === 'Resolved';
    return true;
  });

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Store },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'footfall', label: 'Footfall', icon: TrendingUp },
    { id: 'complaints', label: `Complaints${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: AlertTriangle, badge: pendingCount > 0 },
    { id: 'ratings', label: 'Ratings', icon: Star },
    { id: 'quality_action', label: 'Quality Score', icon: Award },
  ];

  return (
    <div className="space-y-0 animate-in fade-in duration-200 pb-24">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#065F46] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#10B981] animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
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
            id="business-hero-section"
            className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-[0_2px_12px_rgba(25,23,21,0.04)]"
          >
            {/* Dark Cinematic Hero Header */}
            <div className="relative min-h-[220px] sm:min-h-[260px] w-full overflow-hidden bg-[#0A1F14] select-none flex flex-col justify-between p-4 sm:p-6 md:p-8">

              {/* Background Image with gradient overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
                  alt="Business Dashboard"
                  className="w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F14] via-[#0A1F14]/75 to-[#0A1F14]/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F14]/90 via-[#0A1F14]/40 to-transparent hidden md:block" />
              </div>

              {/* Top badges row */}
              <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#191715] text-[11px] sm:text-xs font-extrabold shadow-sm">
                    <Store className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span className="truncate max-w-[190px]">{profile.location}, {profile.city}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/20 shrink-0">
                    <FileCheck className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span>{profile.gstOrLicense}</span>
                  </span>
                </div>

                {/* Live telemetry pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#059669]/90 text-white text-[11px] sm:text-xs font-bold shadow-md border border-[#059669]/40">
                  <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  <span>Live Telemetry</span>
                </div>
              </div>

              {/* Slide Content */}
              <div className="relative z-10 w-full text-white space-y-2.5 sm:space-y-3 mt-auto pt-6">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-md bg-[#059669]/90 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-xs shrink-0">
                    Merchant Portal
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-md bg-white/15 backdrop-blur-md text-white/90 text-[10px] sm:text-[11px] font-semibold border border-white/15 shrink-0">
                    {profile.qualityTier} Partner • Score {profile.qualityScore}/100
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/90 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-xs shrink-0">
                    ⭐ {profile.averageRating} / 5.0 Rating
                  </span>
                </div>

                <div className="max-w-3xl space-y-1 sm:space-y-1.5">
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    {profile.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-white/85 font-medium leading-relaxed max-w-2xl drop-shadow-xs">
                    <span className="font-semibold text-[#34D399]">Real-time business intelligence:</span>{' '}
                    Monitor tourist footfall, respond to complaints, protect your quality score and search ranking.
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="p-4 sm:p-5 md:p-6 bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-4 border-t border-[#E8E2D9]">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center gap-2 font-bold text-[#191715]">
                  <Users className="w-3.5 h-3.5 text-[#059669]" />
                  <span>{profile.footfallStats.todayVisitors} Visitors</span>
                  <span className="text-[10px] text-[#059669] font-semibold uppercase tracking-wider">Today</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center gap-2 font-bold text-[#191715]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{profile.averageRating} / 5.0</span>
                  <span className="text-[10px] text-[#665E55] font-normal uppercase tracking-wider">{profile.totalReviews} Reviews</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center gap-2 font-bold text-[#191715]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{pendingCount} Pending</span>
                  <span className="text-[10px] text-[#665E55] font-normal uppercase tracking-wider">Complaints</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#665E55]">Today's Footfall</span>
                <div className="p-2 rounded-xl bg-[#ECFDF5]">
                  <Users className="w-4 h-4 text-[#059669]" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#191715]">{profile.footfallStats.todayVisitors}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-xs font-semibold text-[#059669]">+14% vs yesterday</span>
              </div>
              <div className="text-[11px] text-[#665E55] mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Peak: {profile.footfallStats.peakHours}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#665E55]">Footfall Density</span>
                <div className="p-2 rounded-xl bg-[#EFF6FF]">
                  <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#191715]">{profile.footfallStats.currentDensity}</div>
              <div className="text-xs text-[#2563EB] font-bold mt-1">Taj Ganj Zone: High Flow</div>
              <div className="text-[11px] text-[#665E55] mt-2">
                Turnstile signal: 45 tourists/min passing store
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#665E55]">Verified Reviews</span>
                <div className="p-2 rounded-xl bg-[#FFFBEB]">
                  <Star className="w-4 h-4 text-[#D97706]" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#191715]">{profile.averageRating}</div>
              <div className="text-xs text-[#665E55] mt-1">/ 5.0 ({profile.totalReviews} reviews)</div>
              <div className="text-[11px] text-[#059669] font-bold mt-2">
                ✓ 98% Fair Price score
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#665E55]">Quality Index</span>
                <div className="p-2 rounded-xl bg-[#ECFDF5]">
                  <Award className="w-4 h-4 text-[#059669]" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#047857]">{profile.qualityScore}/100</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">{profile.qualityTier} Partner</span>
              </div>
              <div className="text-[11px] text-[#665E55] mt-2">
                Protected Search Prominence
              </div>
            </div>
          </div>


          {/* Quick Snapshot Ledger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Urgent Grievance Snippet */}
            <div className="p-4 rounded-3xl bg-white border border-[#EAE5DC] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#191715]">
                  <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                  <span>Grievance Quick Status</span>
                </div>
                <button
                  onClick={() => { setActiveTab('complaints'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-xs font-bold text-[#059669] hover:underline"
                >
                  View All ({complaints.length}) →
                </button>
              </div>
              <p className="text-xs text-[#665E55]">
                {pendingCount > 0
                  ? `You have ${pendingCount} unresolved complaint(s) requiring remediation before search demotion triggers.`
                  : 'All tourist grievances are resolved! Your store maintains full VIP prominence in the Tourist App.'}
              </p>
            </div>

            {/* Quality Score Snapshot */}
            <div className="p-4 rounded-3xl bg-white border border-[#EAE5DC] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#191715]">
                  <Award className="w-4 h-4 text-[#059669]" />
                  <span>Quality Benchmark</span>
                </div>
                <button
                  onClick={() => { setActiveTab('quality_action'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-xs font-bold text-[#059669] hover:underline"
                >
                  Check Tier Roadmap →
                </button>
              </div>
              <p className="text-xs text-[#665E55]">
                Current Score: <strong className="text-[#059669]">{profile.qualityScore}/100</strong>. Maintain fast resolution times and certified bills to qualify for the Platinum Artisan Badge.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: DEDICATED LIVE MAP PAGE                              */}
      {/* ============================================================ */}
      {activeTab === 'map' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                  <MapPin className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#059669] transition-colors cursor-pointer flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#059669]">Live Catchment Map</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Store Location & Commercial Catchment</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">GPS-verified store location, commercial catchment & walking visitor density within 500m.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold border border-[#A7F3D0]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>GPS Telemetry Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* Full Interactive Map */}
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xs overflow-hidden">
            <DashboardMapSection role="business" currentUser={currentUser} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 3: DEDICATED FOOTFALL ANALYTICS PAGE                    */}
      {/* ============================================================ */}
      {activeTab === 'footfall' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                  <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#059669] transition-colors cursor-pointer flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#2563EB]">Footfall Analytics</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Tourist Footfall & Peak Hours</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Real-time anonymous tourist geolocation signals & turnstile telemetry.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  Weekly: {profile.footfallStats.weeklyVisitors.toLocaleString()} Visitors
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF8F5] text-[#665E55] border border-[#EAE5DC]">
                  Busiest Day: {profile.footfallStats.busiestDay}
                </span>
              </div>
            </div>
          </div>

          {/* Footfall Content */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#665E55] flex items-center justify-between">
                <span>Hourly Visitor Volume (Today)</span>
                <span className="text-[11px] text-[#059669] font-medium">Green = peak tourist hours</span>
              </div>
              <div className="grid grid-cols-13 gap-1 sm:gap-2 items-end h-48 pt-6 pb-2 px-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC]">
                {HOURLY_FOOTFALL_DATA.map((h, i) => {
                  const heightPercent = Math.round((h.visitors / 180) * 100);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="text-[9px] font-bold text-[#665E55] opacity-0 group-hover:opacity-100 transition-opacity">
                        {h.visitors}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all ${h.peak
                          ? 'bg-[#059669] group-hover:bg-[#047857]'
                          : 'bg-[#CBD5E1] group-hover:bg-[#94A3B8]'
                          }`}
                        title={`${h.time} - ${h.visitors} visitors`}
                      />
                      <span className="text-[8px] sm:text-[9px] text-[#665E55] font-medium leading-none">{h.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-xs space-y-1">
                <div className="font-bold text-[#166534]">Taj Ganj Tourist Gateway</div>
                <div className="text-[#15803D]">High footfall spillover from Taj Mahal Western Gate exit between 11 AM – 1 PM.</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs space-y-1">
                <div className="font-bold text-[#1E40AF]">Foreign Traveler Ratio</div>
                <div className="text-[#1D4ED8]">48% international visitors. Multi-lingual price tags and digital UPI/Card signs recommended.</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FEF3C7] text-xs space-y-1">
                <div className="font-bold text-[#92400E]">Staff Optimization</div>
                <div className="text-[#B45309]">Peak hour requires 3 sales personnel at checkout to eliminate queue drop-off.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 4: DEDICATED COMPLAINTS & GRIEVANCE PAGE                */}
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
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#059669] transition-colors cursor-pointer flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#DC2626]">Grievance Center</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Issues Reported & Mandatory Remediation</h1>
                  <p className="text-xs text-[#DC2626] font-semibold mt-0.5">⚠️ Unresolved complaints reduce your search visibility in the Tourist App.</p>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: `All (${complaints.length})`, active: 'bg-[#191715] text-white' },
                  { id: 'pending', label: `Needs Action (${pendingCount})`, active: 'bg-[#DC2626] text-white' },
                  { id: 'resolved', label: 'Resolved', active: 'bg-[#059669] text-white' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedCategory(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${selectedCategory === f.id ? f.active : 'bg-[#FAF8F5] text-[#665E55] hover:bg-[#EFEAE1]'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Complaint Cards List */}
          <div className="space-y-3">
            {filteredComplaints.map(item => (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all ${item.status === 'Pending'
                  ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                  : item.status === 'Action Committed'
                    ? 'bg-[#FFFBEB] border-[#FDE68A]'
                    : 'bg-[#F0FDF4] border-[#BBF7D0]'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#665E55]">{item.id}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.severity === 'high' ? 'bg-[#EF4444] text-white' : 'bg-[#F59E0B] text-white'
                        }`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-[#665E55]">
                        Reported by <strong>{item.touristName}</strong> ({item.touristNationality}) • {item.date}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#191715]">{item.title}</h3>
                    <p className="text-xs text-[#443F38] leading-relaxed">{item.description}</p>
                  </div>

                  <div className="shrink-0 text-right space-y-1">
                    <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-lg ${item.status === 'Pending' ? 'bg-[#DC2626] text-white'
                      : item.status === 'Action Committed' ? 'bg-[#D97706] text-white'
                        : 'bg-[#059669] text-white'
                      }`}>
                      {item.status}
                    </span>
                    <div className="text-[10px] text-[#665E55] font-semibold">{item.impactOnRank}</div>
                  </div>
                </div>

                {item.actionTaken ? (
                  <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center gap-1.5 text-xs text-[#065F46]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span><strong>Corrective Action Taken:</strong> {item.actionTaken}</span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
                    <span className="text-xs text-[#DC2626] font-bold">
                      Pending owner response to prevent automatic search demotion
                    </span>
                    <button
                      onClick={() => { setSelectedComplaint(item); setActionText(''); }}
                      className="px-3.5 py-1.5 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Act on Feedback</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Modal */}
          {selectedComplaint && (
            <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#059669] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#059669] uppercase">Remediation Action Form: {selectedComplaint.id}</span>
                <button onClick={() => setSelectedComplaint(null)} className="text-xs text-[#665E55] hover:text-[#191715] font-bold cursor-pointer">
                  Cancel
                </button>
              </div>
              <div className="text-xs text-[#191715] font-semibold">Issue: {selectedComplaint.title}</div>
              <textarea
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="Detail corrective actions (e.g., refunded billing difference, updated display MRP, reprimanded staff)..."
                className="w-full bg-white border border-[#EAE5DC] rounded-xl p-3 text-xs text-[#191715] focus:outline-none focus:border-[#059669] min-h-[70px]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleResolveComplaint(selectedComplaint.id, actionText)}
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Action & Protect Ranking</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 5: DEDICATED RATINGS & REVIEWS PAGE                     */}
      {/* ============================================================ */}
      {activeTab === 'ratings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                  <Star className="w-6 h-6 fill-[#D97706]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#059669] transition-colors cursor-pointer flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#D97706]">Ratings & Reviews</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Average Ratings & Verified Reviews</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Verified tourist appraisals, price adherence feedback, and customer impressions.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#D97706] bg-[#FFFBEB] px-3 py-1.5 rounded-xl border border-[#FDE68A]">
                  ⭐ {profile.averageRating} / 5.0 ({profile.totalReviews} Verified Tourists)
                </span>
              </div>
            </div>
          </div>

          {/* Ratings Details */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
              <div className="text-center md:border-r md:border-[#EAE5DC] md:pr-8">
                <div className="text-4xl font-black text-[#191715]">{profile.averageRating}</div>
                <div className="flex items-center justify-center text-[#F59E0B] my-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />)}
                </div>
                <div className="text-xs text-[#665E55]">{profile.totalReviews} verified tourists</div>
              </div>

              <div className="flex-1 w-full space-y-3 text-xs">
                {[
                  { label: 'Fair Pricing & MRP Adherence', value: profile.ratingBreakdown.pricing, pct: 98 },
                  { label: 'Store Hygiene & Facility', value: profile.ratingBreakdown.hygiene, pct: 94 },
                  { label: 'Staff Hospitality & Culture', value: profile.ratingBreakdown.hospitality, pct: 98 },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-semibold text-[#191715] mb-1">
                      <span>{r.label}</span>
                      <span className="font-bold text-[#059669]">{r.value} / 5.0</span>
                    </div>
                    <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#059669] h-full rounded-full" style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Reviews Stream */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-[#191715]">Recent Verified Tourist Feedback</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#191715]">Hannah Mueller (Austria)</span>
                    <span className="text-[10px] text-[#665E55]">Yesterday</span>
                  </div>
                  <p className="text-[#443F38]">"Transparent fixed prices for Pietra Dura inlay plates with certificate of authentic marble. No bargaining stress."</p>
                  <div className="text-[10px] text-[#059669] font-semibold">✓ Verified Purchase • YatraOne Fair-Price Tagged</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#191715]">David R. (UK)</span>
                    <span className="text-[10px] text-[#665E55]">3 days ago</span>
                  </div>
                  <p className="text-[#443F38]">"Clean premises, provided complimentary drinking water, and staff gave a demonstration of stone carving techniques."</p>
                  <div className="text-[10px] text-[#059669] font-semibold">✓ Verified Purchase • In-Store Demonstration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 6: DEDICATED QUALITY SCORE & PARTNER RANK PAGE          */}
      {/* ============================================================ */}
      {activeTab === 'quality_action' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dedicated Page Header */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                  <Award className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#665E55]">
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#059669] transition-colors cursor-pointer flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#059669]">Quality Score</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Performance & Partner Tier Certification</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Quality benchmark, partner tier criteria & search ranking impact across YatraOne.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1.5 rounded-xl border border-[#A7F3D0]">
                  Score: {profile.qualityScore}/100 • {profile.qualityTier} Partner
                </span>
              </div>
            </div>
          </div>

          {/* Quality Content */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] border border-[#A7F3D0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#065F46] uppercase">Active Partner Status</div>
                <div className="text-2xl sm:text-3xl font-black text-[#064E3B]">Tier: {profile.qualityTier} Partner</div>
                <div className="text-xs text-[#047857] max-w-md">
                  Enables the prestigious "Recommended Verified Merchant" badge on Tourist App discovery feeds and map search cards.
                </div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/85 backdrop-blur-md shadow-xs border border-white shrink-0">
                <div className="text-4xl font-black text-[#047857]">{profile.qualityScore}</div>
                <div className="text-[10px] font-bold uppercase text-[#065F46]">Score / 100</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-[#191715]">Score Component Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Fair Price Adherence', score: '38 / 40 pts', desc: 'MRP adherence & digital soundbox' },
                  { label: 'Complaint Resolution', score: '28 / 30 pts', desc: 'Resolved within 2 hours SLA' },
                  { label: 'Tourist Sentiment', score: '18 / 20 pts', desc: 'Positive reviews & hospitality' },
                  { label: 'Statutory Compliance', score: '10 / 10 pts', desc: 'GST & UP Tourism license' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
                    <div className="text-[#665E55] text-xs font-medium">{item.label}</div>
                    <div className="font-black text-[#059669] text-xl">{item.score}</div>
                    <div className="text-[10px] text-[#8C827A]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#1E40AF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong>Authority Audit Status: Verified Compliant</strong>
                <p className="text-[11px] text-[#3B82F6] mt-0.5">Inspection confirmed by Central Archaeological & District Enforcement Unit.</p>
              </div>
              <span className="font-bold text-[#1D4ED8] bg-white px-3 py-1.5 rounded-xl border border-[#DBEAFE] shrink-0">
                ASI & District Certified ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 7: DEDICATED MERCHANT PROFILE PAGE                      */}
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
                    <button onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#059669] transition-colors cursor-pointer flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    <span>/</span>
                    <span className="text-[#7C3AED]">Merchant Profile</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#191715]">Merchant Profile & Account Settings</h1>
                  <p className="text-xs text-[#665E55] mt-0.5">Trade registration, commercial establishment identity, and session controls.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#191715] text-xs font-bold border border-[#EAE5DC] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Overview</span>
                </button>
                <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold border border-[#A7F3D0] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Merchant</span>
                </span>
              </div>
            </div>
          </div>

          {/* Profile Identity Card */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)]">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={ownerName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#FAF8F5] shadow-sm shrink-0"
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#191715]">{businessName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold border border-[#A7F3D0] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Merchant
                  </span>
                </div>
                <p className="text-xs text-[#665E55]">
                  Proprietor: <strong className="text-[#191715]">{ownerName}</strong> • Category: <strong className="text-[#191715]">{category}</strong>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#8C827A] pt-0.5">
                  <span className="flex items-center gap-1 text-[#059669] font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>{profile.qualityTier} Partner (Score: {profile.qualityScore}/100)</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{location}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Business & Owner Information Form */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)] space-y-5">
            <div className="border-b border-[#F0ECE4] pb-3.5">
              <h3 className="text-base font-extrabold text-[#191715]">Business Information</h3>
              <p className="text-xs text-[#665E55] mt-0.5">
                Keep your establishment identity, trade registration, and contact information up-to-date.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#191715] mb-1">
                    Registered Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#059669] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191715] mb-1">
                    Owner / Primary Signatory
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#059669] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191715] mb-1">
                    Commercial Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#059669] focus:bg-white"
                  >
                    <option value="Handicraft">GI Crafts / Handicraft Emporium</option>
                    <option value="Hotel">Hotel / Heritage Haveli</option>
                    <option value="Restaurant">Restaurant / Traditional Food Hub</option>
                    <option value="Transport">Prepaid Transport / Taxi Operator</option>
                    <option value="Tour Agency">Certified Guide & Tour Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#191715] mb-1">
                    GSTIN or Trade License
                  </label>
                  <input
                    type="text"
                    value={gstOrLicense}
                    onChange={(e) => setGstOrLicense(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#059669] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191715] mb-1">
                    Contact Phone (for Grievance SMS)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#059669] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191715] mb-1">
                    Official Business Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#059669] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#191715] mb-1">
                    Premises / Catchment Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-xs text-[#191715] focus:outline-none focus:border-[#059669] focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE4]">
                {profileSaved ? (
                  <span className="text-xs text-[#059669] font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                    Profile saved successfully!
                  </span>
                ) : (
                  <span className="text-xs text-[#8C827A]">
                    Changes persist to your account session.
                  </span>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Compliance Accreditations */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)] space-y-4">
            <h3 className="text-base font-extrabold text-[#191715]">Accreditations & Certificates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'UP Tourism Approved Emporium', subtitle: gstOrLicense, status: 'Active' },
                { title: 'GI Tag Authentic Artisan Guild', subtitle: 'Agra Pietra Dura Guild', status: 'Certified' },
                { title: 'Zero-Commission Partner', subtitle: 'Anti-tout compliance pledge', status: 'Signed' },
                { title: 'Soundbox Verified Payments', subtitle: '100% digital receipting', status: 'Online' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#191715]">{item.title}</div>
                    <div className="text-[11px] text-[#665E55]">{item.subtitle}</div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-lg border border-[#A7F3D0]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)] space-y-3">
            <h3 className="text-base font-extrabold text-[#191715] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#059669]" />
              <span>Notification Preferences</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] cursor-pointer">
                <div>
                  <div className="font-bold text-[#191715]">Customer Grievance Alerts</div>
                  <div className="text-[11px] text-[#665E55]">Instant SMS alerts when a tourist logs an overcharging or quality ticket.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyGrievance}
                  onChange={(e) => setNotifyGrievance(e.target.checked)}
                  className="w-4 h-4 accent-[#059669] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] cursor-pointer">
                <div>
                  <div className="font-bold text-[#191715]">Daily Footfall & Billing Digest</div>
                  <div className="text-[11px] text-[#665E55]">Evening summary of daily tourist volume and transaction reconciliation.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDailyReport}
                  onChange={(e) => setNotifyDailyReport(e.target.checked)}
                  className="w-4 h-4 accent-[#059669] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] cursor-pointer">
                <div>
                  <div className="font-bold text-[#191715]">ASI & Police Compliance Notices</div>
                  <div className="text-[11px] text-[#665E55]">Directives, festival perimeter hours, and crowd diversion updates.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAuthorityAlerts}
                  onChange={(e) => setNotifyAuthorityAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#059669] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* SIGN OUT SECTION */}
          <div className="bg-white rounded-3xl border-2 border-[#FECACA] p-5 sm:p-7 shadow-[0_2px_12px_rgba(25,23,21,0.04)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#DC2626] flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out of Merchant Portal</span>
                </h3>
                <p className="text-xs text-[#665E55]">
                  Logging out ends your active session on this device. You will need your credentials to access the Merchant Portal again.
                </p>
              </div>

              <button
                type="button"
                id="profile-signout-btn"
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

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#EAE5DC] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#191715]">Confirm Sign Out</h3>
              <p className="text-xs text-[#665E55]">
                Are you sure you want to sign out of <strong>{businessName}</strong>?
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
        aria-label="Business Dashboard Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8E2D9] px-2 sm:px-4 py-1.5 shadow-[0_-4px_25px_rgba(25,23,21,0.07)]"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          {/* Centralized tabs area */}
          <div className="flex items-center justify-center gap-1 sm:gap-2.5 overflow-x-auto no-scrollbar w-full">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`biz-nav-${tab.id}-btn`}
                  onClick={() => { setActiveTab(tab.id as any); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 sm:px-3.5 rounded-xl transition-all cursor-pointer shrink-0 group ${isActive
                    ? 'text-[#059669] font-bold'
                    : 'text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5]'
                    }`}
                  aria-label={tab.label}
                  title={tab.label}
                >
                  <div className={`relative p-1 sm:p-1.5 rounded-xl transition-colors flex items-center justify-center ${isActive ? 'bg-[#059669]/12 text-[#059669]' : 'group-hover:bg-[#FAF8F5]'
                    }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                    {isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    )}
                    {tab.badge && !isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                    )}
                  </div>
                  <span className={`text-[9px] sm:text-[11px] leading-tight text-center truncate max-w-full ${isActive ? 'font-black text-[#059669]' : 'font-medium'
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
