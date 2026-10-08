export type AppEntity = 'tourist' | 'business' | 'authority';

export interface BusinessProfile {
  id: string;
  name: string;
  category: 'Hotel' | 'Restaurant' | 'Handicraft' | 'Tour Agency' | 'Transport';
  city: string;
  location: string;
  ownerName: string;
  gstOrLicense: string;
  qualityScore: number; // 0-100
  qualityTier: 'Diamond' | 'Gold' | 'Silver' | 'Under Review';
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    pricing: number;
    hygiene: number;
    hospitality: number;
    speed: number;
  };
  footfallStats: {
    todayVisitors: number;
    weeklyVisitors: number;
    monthlyVisitors: number;
    peakHours: string;
    busiestDay: string;
    currentDensity?: string;
  };
}

export interface BusinessComplaint {
  id: string;
  touristName: string;
  touristNationality: string;
  date: string;
  category: 'Overcharging' | 'Service Quality' | 'Hygiene' | 'Unethical Practice' | 'Delay';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'Pending' | 'Action Committed' | 'Resolved' | 'Disputed';
  impactOnRank: string;
  actionTaken?: string;
}

export interface HeritageSiteReport {
  id: string;
  siteName: string;
  city: string;
  category: 'Maintenance' | 'Crowding' | 'Safety' | 'Sanitation';
  severity: 'low' | 'medium' | 'critical';
  timestamp: string;
  reportedBy: string;
  description: string;
  status: 'Open' | 'Under Inspection' | 'Resolved';
  actionTaken?: string;
  coordinates?: { lat: number; lng: number };
}

export interface EnforcementAction {
  id: string;
  businessName: string;
  category: string;
  violation: string;
  actionType: 'Penalty Fine' | 'Rank Demotion' | 'Suspension / Delisting' | 'Police Warning';
  amountOrPenalty: string;
  date: string;
  status: 'Active' | 'Appealed' | 'Enforced';
  authorityOfficer: string;
}
