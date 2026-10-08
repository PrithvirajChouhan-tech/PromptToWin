import { BusinessProfile, BusinessComplaint, HeritageSiteReport, EnforcementAction } from '../types/entity';

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  id: 'biz-taj-crafts-01',
  name: 'Marble Craft Guild & Emporium',
  category: 'Handicraft',
  city: 'Agra',
  location: 'Taj Ganj, Western Gate Road',
  ownerName: 'Sunil Mathur',
  gstOrLicense: 'UP09AABM1289P1Z3 (UP Tourism Approved)',
  qualityScore: 94,
  qualityTier: 'Gold',
  averageRating: 4.8,
  totalReviews: 412,
  ratingBreakdown: {
    pricing: 4.9,
    hygiene: 4.7,
    hospitality: 4.9,
    speed: 4.6,
  },
  footfallStats: {
    todayVisitors: 284,
    weeklyVisitors: 1940,
    monthlyVisitors: 8420,
    peakHours: '10:30 AM - 1:00 PM & 4:30 PM - 7:00 PM',
    busiestDay: 'Saturday',
  }
};

export const INITIAL_BUSINESS_COMPLAINTS: BusinessComplaint[] = [
  {
    id: 'CMP-2026-081',
    touristName: 'Elena Rostova',
    touristNationality: 'Germany',
    date: 'Today, 11:20 AM',
    category: 'Overcharging',
    title: 'Discrepancy on polished coaster set price tag vs register',
    description: 'The display rack indicated ₹650 for set of 4 marble inlay coasters, but counter staff quoted ₹900 before discount.',
    severity: 'medium',
    status: 'Pending',
    impactOnRank: 'Rank risk: -8 spots in Tourist App search if unaddressed within 24h',
  },
  {
    id: 'CMP-2026-077',
    touristName: 'Marcus Vance',
    touristNationality: 'UK',
    date: 'Yesterday, 4:15 PM',
    category: 'Service Quality',
    title: 'Commission tout accompanied party to store entrance',
    description: 'An unofficial auto driver escorted us claiming this is the official govt shop. Staff should clarify tout affiliations.',
    severity: 'high',
    status: 'Action Committed',
    impactOnRank: 'Remediation underway: "Zero-Commission Partner" board installed',
    actionTaken: 'Store owner posted visible CCTV notice: No commissions to auto drivers.',
  },
  {
    id: 'CMP-2026-065',
    touristName: 'Pooja Iyer',
    touristNationality: 'India (Bangalore)',
    date: '3 days ago',
    category: 'Hygiene',
    title: 'Water dispenser paper cups were depleted during peak rush',
    description: 'During hot afternoon rush, RO water dispenser was unavailable for visiting family.',
    severity: 'low',
    status: 'Resolved',
    impactOnRank: 'Rank restored. Verified Tourist badge maintained.',
    actionTaken: 'Dual commercial RO dispenser with eco-friendly copper cups installed.',
  }
];

export const HOURLY_FOOTFALL_DATA = [
  { time: '08:00', visitors: 18, peak: false },
  { time: '09:00', visitors: 42, peak: false },
  { time: '10:00', visitors: 96, peak: true },
  { time: '11:00', visitors: 145, peak: true },
  { time: '12:00', visitors: 160, peak: true },
  { time: '13:00', visitors: 85, peak: false },
  { time: '14:00', visitors: 70, peak: false },
  { time: '15:00', visitors: 95, peak: false },
  { time: '16:00', visitors: 130, peak: true },
  { time: '17:00', visitors: 175, peak: true },
  { time: '18:00', visitors: 150, peak: true },
  { time: '19:00', visitors: 65, peak: false },
  { time: '20:00', visitors: 30, peak: false },
];

export const AUTHORITY_HERITAGE_REPORTS: HeritageSiteReport[] = [
  {
    id: 'ASI-AGR-401',
    siteName: 'Taj Mahal - Western Gate Promenade',
    city: 'Agra',
    category: 'Crowding',
    severity: 'critical',
    timestamp: '18 mins ago',
    reportedBy: 'ASI Turnstile Sensor & Tourist App Reports (14 users)',
    description: 'Gate density exceeded 88% capacity. Security bottleneck near security screening conveyor belt 2.',
    status: 'Under Inspection',
    actionTaken: 'Tourism Police Sector 4 opened auxiliary bag scanner 3. Crowd flowing normally.',
    coordinates: { lat: 27.1751, lng: 78.0421 }
  },
  {
    id: 'ASI-DEL-319',
    siteName: 'Red Fort - Lahori Gate Entrance',
    city: 'Delhi',
    category: 'Safety',
    severity: 'medium',
    timestamp: '1 hour ago',
    reportedBy: 'Tourist App Scam Report #4410',
    description: '3 unauthorized touts dressed in fake ASI safari suits attempting to divert tourists to private handicraft malls.',
    status: 'Open',
    coordinates: { lat: 28.6562, lng: 77.2410 }
  },
  {
    id: 'ASI-JAI-288',
    siteName: 'Amer Fort - Elephant Pathway Ramp',
    city: 'Jaipur',
    category: 'Maintenance',
    severity: 'medium',
    timestamp: '3 hours ago',
    reportedBy: 'Guide Association Report #88',
    description: 'Paving stone looseness on the pedestrian descent curve near Suraj Pol.',
    status: 'Under Inspection',
    actionTaken: 'PWD heritage masonry team dispatched for evening repair.',
    coordinates: { lat: 26.9855, lng: 75.8513 }
  },
  {
    id: 'ASI-VNS-194',
    siteName: 'Dashashwamedh Ghat - Aarti Platform 4',
    city: 'Varanasi',
    category: 'Sanitation',
    severity: 'low',
    timestamp: '5 hours ago',
    reportedBy: 'Clean Ghat Volunteer Unit & Tourist App',
    description: 'Flower garland residue accumulated after morning Mangala Aarti.',
    status: 'Resolved',
    actionTaken: 'Municipal motorized river cleaning boat cleared platform steps at 10:30 AM.',
    coordinates: { lat: 25.3076, lng: 83.0107 }
  }
];

export const AUTHORITY_ENFORCEMENT_ACTIONS: EnforcementAction[] = [
  {
    id: 'ENF-2026-092',
    businessName: 'Royal Rajasthan Gem Palace (Shop #14)',
    category: 'Jewelry / Gems',
    violation: 'Synthetic glass sold as genuine star ruby; tourist overcharged ₹28,000 without certificate',
    actionType: 'Suspension / Delisting',
    amountOrPenalty: '14-Day App Delisting + ₹50,000 Consumer Court Notice',
    date: 'Today, 09:30 AM',
    status: 'Enforced',
    authorityOfficer: 'Insp. R. K. Shekhawat (Rajasthan Tourism Police)'
  },
  {
    id: 'ENF-2026-088',
    businessName: 'Yamuna View Prepaid Auto Stand #3',
    category: 'Transport',
    violation: 'Refusal of printed digital receipt & charging ₹400 for ₹120 standard prepaid route',
    actionType: 'Penalty Fine',
    amountOrPenalty: '₹5,000 Fine on Stand Union + 3-day driver suspension',
    date: 'Yesterday',
    status: 'Enforced',
    authorityOfficer: 'Agra Traffic Enforcement Unit'
  },
  {
    id: 'ENF-2026-079',
    businessName: 'Old City Spice Vault',
    category: 'Spices & Saffron',
    violation: 'Adulterated saffron sample reported by 4 tourists via Yatra One quality scanner',
    actionType: 'Rank Demotion',
    amountOrPenalty: 'Quality Score dropped to 41/100 (Unverified tier)',
    date: '3 days ago',
    status: 'Active',
    authorityOfficer: 'FSSAI Regional Inspection Wing'
  }
];

export const HOW_WE_STAND_OUT_DATA = [
  {
    feature: 'Fair-price intelligence',
    typical: 'Partial (Generic estimates only)',
    yatraOne: 'Strong (Real-time street benchmarks, crowdsourced scans & MRP validation)',
  },
  {
    feature: 'Real-time risk & scam detection',
    typical: 'Not Available',
    yatraOne: 'Strong (Active geotagged scam alerts, tout hotspots & one-touch police link)',
  },
  {
    feature: 'AI itinerary + accessibility-aware planning',
    typical: 'Partial (Standard route without accessibility)',
    yatraOne: 'Strong (Weather-adaptive re-routing, step-free access, Braille/wheelchair filters)',
  },
  {
    feature: 'Community reports & validation',
    typical: 'Partial (Basic 5-star comments)',
    yatraOne: 'Strong (Cryptographically tagged receipts, verified reviews & quality scores)',
  },
  {
    feature: 'Authority dashboard',
    typical: 'Not Available',
    yatraOne: 'Strong (Live footfall heatmaps, ASI heritage alerts & direct enforcement tracking)',
  },
  {
    feature: 'One integrated ecosystem',
    typical: 'Not Available (Fragmented silos)',
    yatraOne: 'Strong (Unifies Tourists, Businesses & Authorities in closed feedback loop)',
  },
];

// ===========================
// TOURISM LEADERBOARD DATA
// Used by Business Dashboard to show category-wise rankings
// ===========================

export interface LeaderboardEntry {
  rank: number;
  name: string;
  category: 'Hotel' | 'Restaurant' | 'Handicraft' | 'Tour Agency' | 'Transport';
  city: string;
  rating: number;
  totalReviews: number;
  qualityScore: number;
  badge: 'Diamond' | 'Gold' | 'Silver' | 'Under Review';
  change: 'up' | 'down' | 'stable';
  changeAmount: number;
}

export const TOURISM_LEADERBOARD_DATA: LeaderboardEntry[] = [
  // Hotels
  { rank: 1, name: 'The Oberoi Amarvilas', category: 'Hotel', city: 'Agra', rating: 4.96, totalReviews: 1842, qualityScore: 99, badge: 'Diamond', change: 'stable', changeAmount: 0 },
  { rank: 2, name: 'Taj Lake Palace', category: 'Hotel', city: 'Udaipur', rating: 4.93, totalReviews: 1534, qualityScore: 98, badge: 'Diamond', change: 'up', changeAmount: 1 },
  { rank: 3, name: 'Rambagh Palace', category: 'Hotel', city: 'Jaipur', rating: 4.91, totalReviews: 1265, qualityScore: 97, badge: 'Diamond', change: 'down', changeAmount: 1 },
  { rank: 4, name: 'ITC Mughal Grand', category: 'Hotel', city: 'Agra', rating: 4.85, totalReviews: 980, qualityScore: 95, badge: 'Gold', change: 'up', changeAmount: 2 },
  { rank: 5, name: 'The Leela Palace', category: 'Hotel', city: 'Delhi', rating: 4.82, totalReviews: 1120, qualityScore: 94, badge: 'Gold', change: 'stable', changeAmount: 0 },
  { rank: 6, name: 'Suryagarh Heritage', category: 'Hotel', city: 'Jaisalmer', rating: 4.78, totalReviews: 670, qualityScore: 93, badge: 'Gold', change: 'up', changeAmount: 3 },
  { rank: 7, name: 'Samode Haveli', category: 'Hotel', city: 'Jaipur', rating: 4.75, totalReviews: 512, qualityScore: 91, badge: 'Gold', change: 'down', changeAmount: 2 },
  { rank: 8, name: 'BrijRama Palace', category: 'Hotel', city: 'Varanasi', rating: 4.72, totalReviews: 445, qualityScore: 90, badge: 'Gold', change: 'up', changeAmount: 1 },

  // Restaurants
  { rank: 1, name: 'Pinch of Spice', category: 'Restaurant', city: 'Agra', rating: 4.88, totalReviews: 2340, qualityScore: 97, badge: 'Diamond', change: 'stable', changeAmount: 0 },
  { rank: 2, name: 'Laxmi Mishthan Bhandar', category: 'Restaurant', city: 'Jaipur', rating: 4.85, totalReviews: 3100, qualityScore: 96, badge: 'Diamond', change: 'up', changeAmount: 2 },
  { rank: 3, name: 'Bukhara - ITC Maurya', category: 'Restaurant', city: 'Delhi', rating: 4.82, totalReviews: 1890, qualityScore: 95, badge: 'Gold', change: 'stable', changeAmount: 0 },
  { rank: 4, name: 'Baati Chokha', category: 'Restaurant', city: 'Varanasi', rating: 4.79, totalReviews: 1420, qualityScore: 93, badge: 'Gold', change: 'up', changeAmount: 1 },
  { rank: 5, name: 'The Spice Route', category: 'Restaurant', city: 'Delhi', rating: 4.76, totalReviews: 980, qualityScore: 92, badge: 'Gold', change: 'down', changeAmount: 1 },
  { rank: 6, name: 'Chokhi Dhani', category: 'Restaurant', city: 'Jaipur', rating: 4.74, totalReviews: 2200, qualityScore: 91, badge: 'Gold', change: 'up', changeAmount: 2 },

  // Handicrafts
  { rank: 1, name: 'Anokhi Museum of Hand Printing', category: 'Handicraft', city: 'Jaipur', rating: 4.92, totalReviews: 890, qualityScore: 98, badge: 'Diamond', change: 'stable', changeAmount: 0 },
  { rank: 2, name: 'Oswal Emporium', category: 'Handicraft', city: 'Agra', rating: 4.87, totalReviews: 720, qualityScore: 96, badge: 'Diamond', change: 'up', changeAmount: 1 },
  { rank: 3, name: 'Marble Craft Guild & Emporium', category: 'Handicraft', city: 'Agra', rating: 4.80, totalReviews: 412, qualityScore: 94, badge: 'Gold', change: 'up', changeAmount: 2 },
  { rank: 4, name: 'Rajasthali Government Emporium', category: 'Handicraft', city: 'Jaipur', rating: 4.76, totalReviews: 560, qualityScore: 92, badge: 'Gold', change: 'stable', changeAmount: 0 },
  { rank: 5, name: 'Mehrotra Silk Weaves', category: 'Handicraft', city: 'Varanasi', rating: 4.72, totalReviews: 380, qualityScore: 90, badge: 'Gold', change: 'down', changeAmount: 1 },
  { rank: 6, name: 'Blue Pottery Art Centre', category: 'Handicraft', city: 'Jaipur', rating: 4.68, totalReviews: 310, qualityScore: 88, badge: 'Silver', change: 'up', changeAmount: 3 },

  // Tour Agencies
  { rank: 1, name: 'India Unbound Experiences', category: 'Tour Agency', city: 'Delhi', rating: 4.94, totalReviews: 1560, qualityScore: 99, badge: 'Diamond', change: 'stable', changeAmount: 0 },
  { rank: 2, name: 'Heritage Walk Jaipur', category: 'Tour Agency', city: 'Jaipur', rating: 4.89, totalReviews: 890, qualityScore: 97, badge: 'Diamond', change: 'up', changeAmount: 1 },
  { rank: 3, name: 'Varanasi Voyages', category: 'Tour Agency', city: 'Varanasi', rating: 4.84, totalReviews: 620, qualityScore: 95, badge: 'Gold', change: 'up', changeAmount: 2 },
  { rank: 4, name: 'Golden Triangle Tours Co.', category: 'Tour Agency', city: 'Agra', rating: 4.78, totalReviews: 450, qualityScore: 93, badge: 'Gold', change: 'down', changeAmount: 1 },
  { rank: 5, name: 'Rajasthan Desert Safaris', category: 'Tour Agency', city: 'Jaisalmer', rating: 4.74, totalReviews: 340, qualityScore: 91, badge: 'Gold', change: 'stable', changeAmount: 0 },

  // Transport
  { rank: 1, name: 'Rajasthan Royals Cab Service', category: 'Transport', city: 'Jaipur', rating: 4.86, totalReviews: 2100, qualityScore: 96, badge: 'Diamond', change: 'up', changeAmount: 1 },
  { rank: 2, name: 'Agra Prepaid Auto Union (Official)', category: 'Transport', city: 'Agra', rating: 4.80, totalReviews: 3400, qualityScore: 94, badge: 'Gold', change: 'stable', changeAmount: 0 },
  { rank: 3, name: 'Delhi Metro Tourist Card Service', category: 'Transport', city: 'Delhi', rating: 4.78, totalReviews: 5600, qualityScore: 93, badge: 'Gold', change: 'up', changeAmount: 2 },
  { rank: 4, name: 'Varanasi E-Rickshaw Network', category: 'Transport', city: 'Varanasi', rating: 4.72, totalReviews: 1800, qualityScore: 90, badge: 'Gold', change: 'up', changeAmount: 4 },
  { rank: 5, name: 'Udaipur Lake Shuttle Boats', category: 'Transport', city: 'Udaipur', rating: 4.68, totalReviews: 980, qualityScore: 88, badge: 'Silver', change: 'down', changeAmount: 2 },
];

// ===========================
// AUTHORITY BUSINESS PERFORMANCE DATA
// Used by Authority Dashboard to monitor business performance & complaints
// ===========================

export interface BusinessPerformanceEntry {
  id: string;
  name: string;
  category: 'Hotel' | 'Restaurant' | 'Handicraft' | 'Tour Agency' | 'Transport';
  city: string;
  rating: number;
  qualityScore: number;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  performanceStatus: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export const AUTHORITY_BUSINESS_PERFORMANCE_DATA: BusinessPerformanceEntry[] = [
  // Top performers
  { id: 'BP-001', name: 'The Oberoi Amarvilas', category: 'Hotel', city: 'Agra', rating: 4.96, qualityScore: 99, totalComplaints: 2, resolvedComplaints: 2, pendingComplaints: 0, performanceStatus: 'excellent', trend: 'up' },
  { id: 'BP-002', name: 'Pinch of Spice', category: 'Restaurant', city: 'Agra', rating: 4.88, qualityScore: 97, totalComplaints: 5, resolvedComplaints: 5, pendingComplaints: 0, performanceStatus: 'excellent', trend: 'stable' },
  { id: 'BP-003', name: 'India Unbound Experiences', category: 'Tour Agency', city: 'Delhi', rating: 4.94, qualityScore: 99, totalComplaints: 1, resolvedComplaints: 1, pendingComplaints: 0, performanceStatus: 'excellent', trend: 'up' },
  { id: 'BP-004', name: 'Anokhi Museum of Hand Printing', category: 'Handicraft', city: 'Jaipur', rating: 4.92, qualityScore: 98, totalComplaints: 3, resolvedComplaints: 3, pendingComplaints: 0, performanceStatus: 'excellent', trend: 'stable' },

  // Good performers
  { id: 'BP-005', name: 'Marble Craft Guild & Emporium', category: 'Handicraft', city: 'Agra', rating: 4.80, qualityScore: 94, totalComplaints: 8, resolvedComplaints: 6, pendingComplaints: 2, performanceStatus: 'good', trend: 'up' },
  { id: 'BP-006', name: 'Rajasthan Royals Cab Service', category: 'Transport', city: 'Jaipur', rating: 4.86, qualityScore: 96, totalComplaints: 12, resolvedComplaints: 11, pendingComplaints: 1, performanceStatus: 'good', trend: 'up' },
  { id: 'BP-007', name: 'Rambagh Palace', category: 'Hotel', city: 'Jaipur', rating: 4.91, qualityScore: 97, totalComplaints: 6, resolvedComplaints: 5, pendingComplaints: 1, performanceStatus: 'good', trend: 'stable' },
  { id: 'BP-008', name: 'Baati Chokha', category: 'Restaurant', city: 'Varanasi', rating: 4.79, qualityScore: 93, totalComplaints: 9, resolvedComplaints: 7, pendingComplaints: 2, performanceStatus: 'good', trend: 'up' },

  // Warning
  { id: 'BP-009', name: 'Yamuna View Prepaid Auto Stand #3', category: 'Transport', city: 'Agra', rating: 3.40, qualityScore: 58, totalComplaints: 34, resolvedComplaints: 18, pendingComplaints: 16, performanceStatus: 'warning', trend: 'down' },
  { id: 'BP-010', name: 'Sunrise Souvenirs Shop #9', category: 'Handicraft', city: 'Agra', rating: 3.60, qualityScore: 62, totalComplaints: 22, resolvedComplaints: 14, pendingComplaints: 8, performanceStatus: 'warning', trend: 'down' },
  { id: 'BP-011', name: 'Heritage Dhaba Express', category: 'Restaurant', city: 'Jaipur', rating: 3.50, qualityScore: 55, totalComplaints: 28, resolvedComplaints: 16, pendingComplaints: 12, performanceStatus: 'warning', trend: 'down' },

  // Critical
  { id: 'BP-012', name: 'Royal Rajasthan Gem Palace (Shop #14)', category: 'Handicraft', city: 'Jaipur', rating: 2.10, qualityScore: 22, totalComplaints: 48, resolvedComplaints: 12, pendingComplaints: 36, performanceStatus: 'critical', trend: 'down' },
  { id: 'BP-013', name: 'Old City Spice Vault', category: 'Restaurant', city: 'Agra', rating: 2.80, qualityScore: 41, totalComplaints: 38, resolvedComplaints: 15, pendingComplaints: 23, performanceStatus: 'critical', trend: 'down' },
  { id: 'BP-014', name: 'Lucky Auto Stand (Unlicensed)', category: 'Transport', city: 'Varanasi', rating: 1.90, qualityScore: 15, totalComplaints: 62, resolvedComplaints: 8, pendingComplaints: 54, performanceStatus: 'critical', trend: 'down' },
];
