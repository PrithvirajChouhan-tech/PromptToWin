export type PriceCategory = 
  | 'hotel' 
  | 'transport' 
  | 'food' 
  | 'handicraft' 
  | 'guide' 
  | 'monument_ticket' 
  | 'activity';

export interface PriceReport {
  id: string;
  itemTitle: string;
  category: PriceCategory;
  city: string;
  location: string;
  pricePaid: number; // in INR
  fairPriceRange?: [number, number];
  isOutlier?: boolean;
  outlierReason?: string;
  vendorName?: string;
  reportedDate: string;
  upvotes: number;
  downvotes: number;
  reporterName: string;
  isVerifiedBuyer?: boolean;
  notes?: string;
}

export interface FairPriceCategorySummary {
  category: PriceCategory;
  itemName: string;
  city: string;
  fairRange: [number, number];
  medianPrice: number;
  unit: string;
  reportsCount: number;
  outlierCount: number;
  safetyTip: string;
}

export type ScamCategory = 
  | 'overcharging' 
  | 'fake_tickets' 
  | 'transport_fraud' 
  | 'touting' 
  | 'fake_hotel' 
  | 'gem_carpet_scam' 
  | 'temple_donation_extortion';

export interface ScamAlert {
  id: string;
  title: string;
  scamCategory: ScamCategory;
  city: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  howToAvoid: string;
  reportedDate: string;
  upvotes: number;
  author: string;
  status: 'active' | 'under_police_review' | 'resolved';
  policeCaseReference?: string;
}

export interface VerifiedHotel {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  starRating: number;
  trustScore: number; // 0 to 100
  lastVerifiedDate: string;
  verifiedPhotos: string[];
  directPricePerNight: number; // Low commission direct price
  otaPricePerNight: number; // High commission OTA price
  commissionSavings: number; // in INR or percent
  amenities: string[];
  wheelchairAccessible: boolean;
  accessibleFeatures: string[];
  complaintsCount: number;
  complaintsResolvedPercent: number;
  contactPhone: string;
  verifiedAddress: string;
  description: string;
}

export interface LocalGuide {
  id: string;
  name: string;
  avatar: string;
  city: string;
  state: string;
  languages: string[];
  specialties: string[];
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  fairRangeHalfDay: [number, number];
  isGovtVerified: boolean;
  licenseNo: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  wheelchairCertified: boolean;
  availability: 'available_today' | 'available_tomorrow' | 'busy';
  phone: string;
  tokensEarned: number;
}

export interface RiskZone {
  id: string;
  name: string;
  city: string;
  riskLevel: 'high' | 'medium' | 'safe';
  riskType: 'scam_hotspot' | 'tout_cluster' | 'pickpocket_zone' | 'police_safe_zone' | 'prepaid_booth';
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  activeIncidentsCount: number;
  safetyAdvice: string;
  touristPoliceContact: string;
}

export interface SOSIncident {
  id: string;
  category: 'overcharging' | 'hotel_issue' | 'transport_scam' | 'safety_emergency' | 'accessibility_need' | 'other';
  location: string;
  city: string;
  timestamp: string;
  status: 'demo-pending' | 'dispatched' | 'in_progress' | 'resolved';
  notes: string;
  policeUnitAssigned?: string;
  estimatedArrivalMinutes?: number;
}

export interface GuideBooking {
  id: string;
  guideId: string;
  guideName: string;
  city: string;
  date: string;
  duration: 'hourly' | 'half_day' | 'full_day';
  hours?: number;
  totalPrice: number;
  travelerName: string;
  paymentMethod: 'sandbox_upi' | 'sandbox_card' | 'pay_on_tour';
  status: 'confirmed' | 'completed' | 'cancelled';
  tokensRewarded: number;
}
