export type UserRole = 'tourist' | 'business' | 'authority';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  demo?: boolean;
  isDemo?: boolean;
  notificationPreferences?: { grievance: boolean; dailyReport: boolean; authorityAlerts: boolean };
  // Tourist details
  nationality?: string;
  travelerType?: 'Solo Traveler' | 'Family' | 'Couple' | 'Group';
  kycVerified?: boolean;
  // Business details
  businessName?: string;
  gstOrLicense?: string;
  businessCategory?: 'Hotel' | 'Restaurant' | 'Handicraft' | 'Tour Agency' | 'Transport';
  businessLocation?: string;
  qualityScore?: number;
  qualityTier?: string;
  // Authority details
  department?: string;
  designation?: string;
  officerBadgeId?: string;
  securityClearance?: string;
  jurisdictionZone?: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser> = {
  tourist: {
    id: 'usr_tourist_01',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@traveler.in',
    role: 'tourist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    phone: '+91 98765 43210',
    nationality: 'Indian',
    travelerType: 'Solo Traveler',
    kycVerified: true,
  },
  business: {
    id: 'usr_biz_01',
    name: 'Vikramaditya Rathore',
    email: 'manager@royalhavelicrafts.com',
    role: 'business',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+91 94140 12345',
    businessName: 'Royal Rajasthan Haveli & GI Crafts Emporium',
    gstOrLicense: '08AABCR1234F1Z8',
    businessCategory: 'Hotel',
    businessLocation: 'Johari Bazaar, Jaipur, Rajasthan',
    qualityScore: 94,
    qualityTier: 'Gold Tier',
  },
  authority: {
    id: 'usr_auth_01',
    name: 'Dr. Rajesh Verma (IAS)',
    email: 'rajesh.verma@tourism.gov.in',
    role: 'authority',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '+91 11 2338 1234',
    department: 'Ministry of Tourism & ASI Northern Circle',
    designation: 'Chief Heritage Inspector & Director of Safety',
    officerBadgeId: 'ASI-HQ-2024-884',
    securityClearance: 'Level 3 - Command',
    jurisdictionZone: 'Agra-Jaipur-Delhi Golden Triangle',
  },
};

export function isDemoUser(user?: AuthUser | null): boolean {
  if (!user) return true;
  if (user.demo === true || user.isDemo === true) return true;
  if (user.id?.startsWith('demo-') || user.id?.startsWith('usr_')) return true;
  if (
    user.email?.includes('@demo.local') ||
    user.email?.includes('@traveler.in') ||
    user.email?.includes('@royalhavelicrafts.com') ||
    user.email?.includes('@tourism.gov.in')
  ) {
    return true;
  }
  return false;
}

export function promptDemoRestriction(feature: string, description?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('yatra-demo-restrict', {
        detail: { feature, description },
      })
    );
  }
}
