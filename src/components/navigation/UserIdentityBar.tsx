import React from 'react';
import { 
  LogOut, 
  Compass, 
  Store, 
  Building, 
  ShieldCheck, 
  UserCheck,
  Building2,
  BadgeAlert,
  KeyRound
} from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { IndianTimeWidget } from '../common/IndianTimeWidget';

interface UserIdentityBarProps {
  currentUser: AuthUser;
  onLogout: () => void;
  onSwitchAccount?: () => void;
}

export const UserIdentityBar: React.FC<UserIdentityBarProps> = ({
  currentUser,
  onLogout,
}) => {
  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'tourist':
        return {
          icon: Compass,
          label: 'Tourist Dashboard',
          sub: currentUser.nationality ? `${currentUser.nationality} Traveler` : 'Traveler & Visitor',
          bg: 'bg-[#F0F9FF]',
          border: 'border-[#BAE6FD]',
          text: 'text-[#0284C7]',
          badgeBg: 'bg-[#0284C7]',
        };
      case 'business':
        return {
          icon: Store,
          label: 'Business Portal',
          sub: currentUser.businessName || 'Verified Merchant Partner',
          bg: 'bg-[#ECFDF5]',
          border: 'border-[#A7F3D0]',
          text: 'text-[#059669]',
          badgeBg: 'bg-[#059669]',
        };
      case 'authority':
        return {
          icon: Building,
          label: 'Authority Console',
          sub: currentUser.department || 'Ministry of Tourism & ASI Official',
          bg: 'bg-[#FFF1F2]',
          border: 'border-[#FECDD3]',
          text: 'text-[#E11D48]',
          badgeBg: 'bg-[#E11D48]',
        };
    }
  };

  const badge = getRoleBadge();
  const Icon = badge.icon;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-[#EAE5DC] px-2.5 sm:px-6 py-2 shadow-2xs sticky top-[57px] sm:top-[63px] z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left: User Identity Info */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-2 ring-[#EAE5DC] shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white" />
          </div>

          <div className="min-w-0 flex-1 sm:flex-none">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-[#191715] truncate">
                {currentUser.name}
              </span>

              {/* Entity Role Pill */}
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-white ${badge.badgeBg}`}>
                <Icon className="w-3 h-3" />
                <span>{badge.label}</span>
              </span>

              {currentUser.role === 'tourist' && currentUser.kycVerified && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.2 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  <span>KYC Verified</span>
                </span>
              )}

              {currentUser.role === 'business' && currentUser.gstOrLicense && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.2 rounded-md">
                  <Building2 className="w-3 h-3" />
                  <span>GSTIN: {currentUser.gstOrLicense}</span>
                </span>
              )}

              {currentUser.role === 'authority' && currentUser.officerBadgeId && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-[#881337] bg-[#FFF1F2] border border-[#FECDD3] px-1.5 py-0.2 rounded-md">
                  <BadgeAlert className="w-3 h-3" />
                  <span>Badge: {currentUser.officerBadgeId}</span>
                </span>
              )}
            </div>

            <div className="text-[11px] text-[#665E55] truncate max-w-xs sm:max-w-md">
              {badge.sub}
            </div>
          </div>
        </div>

        {/* Right: Indian Standard Time Clock & Sign Out Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          <IndianTimeWidget variant="header" />

          <button
            id="auth-sign-out-btn"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEF2F2] border border-[#EAE5DC] hover:border-[#FECACA] text-[#DC2626] text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
            title="Sign out from this dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
