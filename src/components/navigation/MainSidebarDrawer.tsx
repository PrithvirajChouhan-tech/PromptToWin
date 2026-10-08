import React from 'react';
import { 
  X, 
  Compass, 
  Calendar, 
  AlertOctagon, 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  Train, 
  Utensils, 
  ShoppingBag, 
  BookOpen, 
  User, 
  Accessibility, 
  PhoneCall, 
  ChevronRight,
  Store,
  Building,
  MapPin,
  ShieldCheck,
  LogOut, 
  ArrowRightLeft 
} from 'lucide-react';
import { MainNavTab } from '../BottomNavBar';
import { AppEntity } from '../../types/entity';
import { AuthUser } from '../../types/auth';
import { IndianTimeWidget } from '../common/IndianTimeWidget';

interface MainSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenSOS: () => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  onOpenProfile: () => void;
  currentEntity?: AppEntity;
  onSelectEntity?: (entity: AppEntity) => void;
  onOpenEcosystemModal?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onSwitchAccount?: () => void;
}

export const MainSidebarDrawer: React.FC<MainSidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenSOS,
  accessibilityMode,
  onToggleAccessibility,
  onOpenProfile,
  currentEntity: _currentEntity = 'tourist',
  currentUser,
  onLogout,
  onSwitchAccount,
}) => {
  if (!isOpen) return null;

  const role = currentUser?.role || 'tourist';
  const isMerchant = role === 'business';
  const isAuthority = role === 'authority';
  const isTourist = !isMerchant && !isAuthority;

  // Single source of truth for specialized navigation sections per role
  const touristSections = [
    {
      title: 'Geospatial & Discovery',
      items: [
        { 
          id: 'map' as MainNavTab, 
          label: 'Interactive Live Map & GPS', 
          desc: 'Current location marker, heritage stops & safe zones',
          icon: MapPin, 
          tag: 'Live GPS' 
        },
        { 
          id: 'transit' as MainNavTab, 
          label: 'Transit Hub & Auto Fares', 
          desc: 'Vande Bharat, Metro lines & Auto rate card',
          icon: Train, 
          tag: 'Live' 
        },
      ]
    },
    {
      title: 'Trust & Safety Layer (SIH26204)',
      items: [
        { 
          id: 'guides' as MainNavTab, 
          label: 'Guide', 
          desc: 'ASI-certified multi-lingual regional guides',
          icon: UserCheck, 
          tag: 'Certified' 
        },
      ]
    },
    {
      title: 'Indian Culture & Living',
      items: [
        { 
          id: 'culinary' as MainNavTab, 
          label: 'Food Safety & Street Hygiene', 
          desc: 'FSSAI standards, filtered water & hygienic stalls',
          icon: Utensils, 
          tag: 'FSSAI' 
        },
        { 
          id: 'festivals' as MainNavTab, 
          label: 'Festivals & Ghat Rituals', 
          desc: 'Aarti schedules, regional dates & celebrations',
          icon: Sparkles, 
          tag: 'Calendar' 
        },
        { 
          id: 'crafts' as MainNavTab, 
          label: 'GI Authenticity & Craft Guilds', 
          desc: 'Certified handlooms, silk, brassware & spices',
          icon: ShoppingBag, 
          tag: 'Handloom' 
        },
        { 
          id: 'guide' as MainNavTab, 
          label: 'India Tourist Toolkit & Tips', 
          desc: 'Cultural etiquette, bargaining norms & cheat-sheet',
          icon: BookOpen, 
          tag: 'Guide' 
        },
      ]
    },
    {
      title: 'My Account',
      items: [
        { 
          id: 'profile' as MainNavTab, 
          label: 'Traveler Profile & Credentials', 
          desc: 'Emergency ICE contacts, KYC & trip history',
          icon: User, 
          tag: 'Verified' 
        },
      ]
    }
  ];

  const merchantSections = [
    {
      title: 'Commercial Geospatial & Footfall',
      items: [
        { 
          id: 'map' as MainNavTab, 
          label: 'Live Footfall & Storefront Map', 
          desc: 'Customer density radar, store perimeter & peak hours',
          icon: MapPin, 
          tag: 'Live Map' 
        },
      ]
    },
    {
      title: 'Quality & Reputation',
      items: [
        { 
          id: 'trust' as MainNavTab, 
          label: 'Customer Grievances & Trust Score', 
          desc: 'Monitor reviews, quality tier badge & feedback',
          icon: ShieldCheck, 
          tag: 'Reputation' 
        },
      ]
    },
    {
      title: 'Merchant Account',
      items: [
        { 
          id: 'profile' as MainNavTab, 
          label: 'Business Profile & GSTIN Registry', 
          desc: 'Store hours, commercial license & verified badge',
          icon: Store, 
          tag: 'GSTIN' 
        },
      ]
    }
  ];

  const authoritySections = [
    {
      title: 'Heritage Perimeters & Telemetry',
      items: [
        { 
          id: 'map' as MainNavTab, 
          label: 'Live GPS Telemetry & Heritage Map', 
          desc: 'ASI protected buffer zones, active police patrols & crowd sensors',
          icon: MapPin, 
          tag: 'Telemetry' 
        },
        { 
          id: 'b2b' as MainNavTab, 
          label: 'Police Telemetry & Incident Dispatch', 
          desc: 'Emergency responder dispatch and live safety alerts',
          icon: Briefcase, 
          tag: 'Console' 
        },
      ]
    },
    {
      title: 'Official Account',
      items: [
        { 
          id: 'profile' as MainNavTab, 
          label: 'Officer Credentials & Jurisdictional Scope', 
          desc: 'Official badge ID, station command & enforcement ledger',
          icon: Building, 
          tag: 'Official' 
        },
      ]
    }
  ];

  const navSections = isMerchant ? merchantSections : isAuthority ? authoritySections : touristSections;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-xs sm:max-w-sm w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200 border-r border-[#EAE5DC]">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#F0ECE4] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 ${
              isMerchant 
                ? 'bg-[#059669]' 
                : isAuthority 
                ? 'bg-[#E11D48]' 
                : 'bg-gradient-to-tr from-[#C84B31] to-[#FF6F59]'
            }`}>
              {isMerchant ? <Store className="w-5 h-5 stroke-[2.2]" /> : isAuthority ? <Building className="w-5 h-5 stroke-[2.2]" /> : <Compass className="w-5 h-5 stroke-[2.2]" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1F1C18] tracking-tight">Yatra One</h2>
              <p className="text-[11px] text-[#8C827A] font-medium">
                {isMerchant ? 'Merchant Partner Portal' : isAuthority ? 'Authority & ASI Console' : 'India Travel & Trust Platform'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8C827A] hover:text-[#1F1C18] hover:bg-[#EFEAE1] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card at Top */}
        <div className={`p-4 border-b ${
          isMerchant 
            ? 'bg-[#F0FDF4] border-[#DCFCE7]' 
            : isAuthority 
            ? 'bg-[#FFF1F2] border-[#FFE4E6]' 
            : 'bg-gradient-to-br from-[#FFF5F2] to-[#FAF8F5] border-[#F5DDD7]'
        }`}>
          <div 
            onClick={() => {
              onOpenProfile();
              onClose();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                alt="Account Avatar"
                className={`w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 transition-all ${
                  isMerchant 
                    ? 'ring-[#059669]/30 group-hover:ring-[#059669]' 
                    : isAuthority 
                    ? 'ring-[#E11D48]/30 group-hover:ring-[#E11D48]' 
                    : 'ring-[#C84B31]/30 group-hover:ring-[#C84B31]'
                }`}
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#10B981] rounded-full border-2 border-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#1F1C18] truncate group-hover:text-[#C84B31] transition-colors">
                  {currentUser?.name || 'Verified User'}
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  isMerchant 
                    ? 'bg-[#10B981]/15 text-[#065F46]' 
                    : isAuthority 
                    ? 'bg-[#E11D48]/15 text-[#9F1239]' 
                    : 'bg-[#10B981]/15 text-[#065F46]'
                }`}>
                  {isMerchant ? 'GSTIN ✓' : isAuthority ? 'ASI OFFICIAL' : 'KYC ✓'}
                </span>
              </div>
              <p className="text-xs text-[#8C827A] truncate">
                {isMerchant 
                  ? (currentUser?.businessName || currentUser?.email)
                  : isAuthority 
                  ? (currentUser?.department || currentUser?.email)
                  : (currentUser?.email || 'tutepython97@gmail.com')}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#C84B31] font-semibold">
                <span>View Profile & Settings</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick SOS & Accessibility strip (Tourist Only) */}
          {isTourist && (
            <div className="mt-3 pt-3 border-t border-[#F5DDD7] flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenSOS();
                }}
                className="flex-1 py-1.5 px-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Emergency SOS</span>
              </button>

              <button
                onClick={onToggleAccessibility}
                className={`py-1.5 px-2.5 text-xs font-bold rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                  accessibilityMode
                    ? 'bg-[#0284C7] text-white border-[#0284C7]'
                    : 'bg-white text-[#5A524C] border-[#EAE5DC] hover:bg-[#FAF8F5]'
                }`}
                title="Toggle Wheelchair & Accessible Mode"
              >
                <Accessibility className="w-4 h-4" />
                <span>{accessibilityMode ? '♿ ON' : '♿ OFF'}</span>
              </button>
            </div>
          )}

          {/* Authenticated User Identity & Role Separation */}
          {currentUser && (
            <div className="mt-3 pt-3 border-t border-[#F5DDD7] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-[#665E55] tracking-wider">
                <span>Active Role</span>
                <span className={`px-2 py-0.5 rounded text-[10px] text-white font-extrabold ${
                  currentUser.role === 'tourist' 
                    ? 'bg-[#0284C7]' 
                    : currentUser.role === 'business' 
                    ? 'bg-[#059669]' 
                    : 'bg-[#E11D48]'
                }`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>

              <div className="pt-1">
                {onLogout && (
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tourist-Only Quick Return to Main Itinerary Button */}
        {isTourist && (
          <div className="px-3 pt-3 pb-1">
            <button
              id="drawer-main-itinerary-btn"
              onClick={() => {
                onSelectTab('itinerary');
                onClose();
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'itinerary'
                  ? 'bg-[#FFF2EE] text-[#C84B31] border border-[#FED7CC] shadow-xs'
                  : 'bg-[#FAF8F5] text-[#5A524C] hover:bg-white hover:text-[#1F1C18] border border-[#EAE5DC]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-4 h-4 ${activeTab === 'itinerary' ? 'text-[#C84B31]' : 'text-[#8C827A]'}`} />
                <span>Primary Itinerary & Day Stops</span>
              </div>
              {activeTab === 'itinerary' ? (
                <span className="w-2 h-2 rounded-full bg-[#C84B31]" />
              ) : (
                <span className="text-[10px] text-[#8C827A] font-semibold">Switch</span>
              )}
            </button>
          </div>
        )}

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-[10px] font-bold text-[#9C948B] uppercase tracking-wider px-2.5 pb-1">
                {section.title}
              </h3>
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`drawer-nav-${item.id}-btn`}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer text-left border ${
                        isSelected
                          ? 'bg-[#FFF2EE] text-[#C84B31] font-bold border-[#FED7CC] shadow-xs'
                          : 'bg-white border-transparent text-[#5A524C] hover:bg-[#FAF8F5] hover:text-[#1F1C18]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#C84B31] text-white' : 'bg-[#FAF8F5] text-[#8C827A]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`truncate leading-tight ${isSelected ? 'font-bold text-[#C84B31]' : 'font-semibold text-[#1F1C18]'}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-[#8C827A] truncate leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      
                      {item.tag && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-[#C84B31] text-white'
                            : 'bg-[#FAF8F5] text-[#8C827A] border border-[#EAE5DC]'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Indian Standard Time Clock Widget */}
        <div className="p-3 bg-white border-t border-[#F0ECE4]">
          <IndianTimeWidget variant="full" showRefresh={true} />
        </div>

        {/* Footer with Helpline shortcuts */}
        <div className="p-3 bg-[#FAF8F5] border-t border-[#F0ECE4] text-[11px] text-[#8C827A] space-y-1.5">
          <div className="flex items-center justify-between font-medium">
            <span>Tourist Helpline (MoT):</span>
            <a href="tel:1363" className="font-bold text-[#1F1C18] hover:text-[#C84B31] flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#10B981]" />
              <span>1363 (24/7)</span>
            </a>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span>National Emergency:</span>
            <a href="tel:112" className="font-bold text-[#E11D48] hover:underline">
              112 (Police/Fire/Ambulance)
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
