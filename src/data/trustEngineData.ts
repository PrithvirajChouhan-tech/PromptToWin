import { 
  PriceReport, 
  FairPriceCategorySummary, 
  ScamAlert, 
  VerifiedHotel, 
  LocalGuide, 
  RiskZone, 
  SOSIncident 
} from '../types/trustEngine';

// Statistical calculations for fair prices and outlier detection
export function calculateMedianAndOutliers(prices: number[]): {
  median: number;
  fairMin: number;
  fairMax: number;
  outlierThreshold: number;
} {
  if (prices.length === 0) return { median: 0, fairMin: 0, fairMax: 0, outlierThreshold: 0 };
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  
  // Fair range: from min typical price to median * 1.3
  const fairMin = sorted[0];
  const fairMax = Math.round(median * 1.3);
  const outlierThreshold = Math.round(median * 1.6);

  return { median, fairMin, fairMax, outlierThreshold };
}

// Sample Price Reports (Demonstrating Section 4.1: Reports ₹320, ₹350, ₹380, ₹400, ₹850 -> Fair range ₹320–₹400, ₹850 flagged)
export const INITIAL_PRICE_REPORTS: PriceReport[] = [
  {
    id: 'pr-1',
    itemTitle: 'Auto Rickshaw (New Delhi Railway Station to Connaught Place)',
    category: 'transport',
    city: 'Delhi',
    location: 'NDLS Paharganj Exit to CP Inner Circle',
    pricePaid: 70,
    fairPriceRange: [60, 90],
    isOutlier: false,
    vendorName: 'Delhi Traffic Police Pre-paid Booth',
    reportedDate: '2 hours ago',
    upvotes: 42,
    downvotes: 1,
    reporterName: 'Aarav M. (Verified Tourist)',
    isVerifiedBuyer: true,
    notes: 'Use the official pre-paid booth right outside Platform 16 instead of street touts who demand ₹350.'
  },
  {
    id: 'pr-2',
    itemTitle: 'Auto Rickshaw (NDLS to CP) - Touting Incident',
    category: 'transport',
    city: 'Delhi',
    location: 'Paharganj Main Bazar Road',
    pricePaid: 350,
    fairPriceRange: [60, 90],
    isOutlier: true,
    outlierReason: 'Flagged as 288% above median fair price! Driver claimed meter was broken.',
    vendorName: 'Unregistered Auto #DL1R-4912',
    reportedDate: '5 hours ago',
    upvotes: 68,
    downvotes: 3,
    reporterName: 'Elena Rostova (International Solo Traveler)',
    isVerifiedBuyer: true,
    notes: 'Threatened to drop midway if not paid ₹350. Reported to Delhi Tourist Police.'
  },
  {
    id: 'pr-3',
    itemTitle: 'Artisan Pashmina Shawl (Hand-spun GI Certified 100% Cashmere)',
    category: 'handicraft',
    city: 'Delhi / Kashmir Emporium',
    location: 'State Emporia Complex, Baba Kharak Singh Marg, CP',
    pricePaid: 4500,
    fairPriceRange: [4200, 6500],
    isOutlier: false,
    vendorName: 'Kashmir Government Arts Emporium',
    reportedDate: 'Yesterday',
    upvotes: 89,
    downvotes: 0,
    reporterName: 'Priya Sundaram (Cultural Researcher)',
    isVerifiedBuyer: true,
    notes: 'Contains Silk Mark and Geographical Indication (GI) hologram. Passed ring test.'
  },
  {
    id: 'pr-4',
    itemTitle: 'Imitation "Pashmina" from Street Tout',
    category: 'handicraft',
    city: 'Agra',
    location: 'Near Taj Mahal East Gate Alley',
    pricePaid: 1800,
    fairPriceRange: [300, 500],
    isOutlier: true,
    outlierReason: 'Flagged as Synthetic Viscose overcharged 350% as genuine Pashmina.',
    vendorName: 'Taj Souvenirs Stall #4',
    reportedDate: '2 days ago',
    upvotes: 55,
    downvotes: 2,
    reporterName: 'Marcus Weber (Tourist)',
    isVerifiedBuyer: false,
    notes: 'Seller did burn test on edge fringe (which was wool), but rest of fabric was polyester.'
  },
  {
    id: 'pr-5',
    itemTitle: 'Heritage Haveli Deluxe Room with Breakfast',
    category: 'hotel',
    city: 'Jaipur',
    location: 'Bani Park, Jaipur',
    pricePaid: 2800,
    fairPriceRange: [2500, 3200],
    isOutlier: false,
    vendorName: 'Kalyan Heritage Haveli (Verified Direct)',
    reportedDate: '3 days ago',
    upvotes: 34,
    downvotes: 1,
    reporterName: 'Devika & Neil',
    isVerifiedBuyer: true,
    notes: 'Booked direct via community portal for ₹2,800. OTA website was charging ₹3,850.'
  },
  {
    id: 'pr-6',
    itemTitle: 'Varanasi Sunrise Boat Ride (Assi to Manikarnika & return - 2 hrs)',
    category: 'activity',
    city: 'Varanasi',
    location: 'Assi Ghat Boat Stand',
    pricePaid: 350,
    fairPriceRange: [300, 450],
    isOutlier: false,
    vendorName: 'Ganga Nao Union Boat #12',
    reportedDate: '1 day ago',
    upvotes: 73,
    downvotes: 2,
    reporterName: 'Sunita Joshi',
    isVerifiedBuyer: true,
    notes: 'Shared boat fixed rate is ₹300–₹400/person. Private row boat is ₹800–₹1200 total.'
  },
  {
    id: 'pr-7',
    itemTitle: 'Sunrise Boat Extortion Tout',
    category: 'activity',
    city: 'Varanasi',
    location: 'Dashashwamedh Ghat Steps',
    pricePaid: 2200,
    fairPriceRange: [300, 450],
    isOutlier: true,
    outlierReason: 'Flagged: 400% price gouging! Tout claimed holy ceremony requires private blessing fee.',
    vendorName: 'Independent Tout at Steps',
    reportedDate: '3 days ago',
    upvotes: 91,
    downvotes: 1,
    reporterName: 'David Lee',
    isVerifiedBuyer: true,
    notes: 'Always book from the Municipal Corporation official rate board at Assi or Rajendra Prasad Ghat.'
  },
  {
    id: 'pr-8',
    itemTitle: 'Thali Lunch (Unlimited Rotis, Dal Makhani, Paneer, Rice, Gulab Jamun)',
    category: 'food',
    city: 'Jaipur',
    location: 'LMB Hotel, Johari Bazar',
    pricePaid: 380,
    fairPriceRange: [320, 400],
    isOutlier: false,
    vendorName: 'Laxmi Mishthan Bhandar (LMB)',
    reportedDate: '4 hours ago',
    upvotes: 49,
    downvotes: 0,
    reporterName: 'Kunal Verma',
    isVerifiedBuyer: true,
    notes: 'Hygienic pure veg traditional Rajasthani thali. Clean filtered water served.'
  },
  {
    id: 'pr-9',
    itemTitle: 'Overcharged Mineral Water Bottle (MRP Tampered)',
    category: 'food',
    city: 'Agra',
    location: 'Taj Western Gate Parking Lot',
    pricePaid: 60,
    fairPriceRange: [20, 20],
    isOutlier: true,
    outlierReason: 'Flagged: Violation of Legal Metrology Act. MRP ₹20 scratched off with razor.',
    vendorName: 'Parking Kiosk #2',
    reportedDate: 'Yesterday',
    upvotes: 112,
    downvotes: 0,
    reporterName: 'Rohit Bansal',
    isVerifiedBuyer: true,
    notes: 'Demand to pay strictly the ₹20 printed MRP on Bisleri/Kinley. Refuse bottles with scratched labels.'
  }
];

// Fair Price Summaries across categories
export const FAIR_PRICE_SUMMARIES: FairPriceCategorySummary[] = [
  {
    category: 'transport',
    itemName: 'Pre-paid Auto Rickshaw (per km standard rate)',
    city: 'Delhi / NCR',
    fairRange: [15, 20],
    medianPrice: 16,
    unit: 'per km (after ₹30 base for first 1.5 km)',
    reportsCount: 340,
    outlierCount: 42,
    safetyTip: 'Insist on digital meter or buy pre-paid slip from Delhi Traffic Police counters.'
  },
  {
    category: 'hotel',
    itemName: 'Verified 3-Star Heritage Stay with Breakfast',
    city: 'Jaipur / Golden Triangle',
    fairRange: [2200, 3200],
    medianPrice: 2650,
    unit: 'per room/night',
    reportsCount: 185,
    outlierCount: 19,
    safetyTip: 'Direct community verified bookings save 18–25% vs OTA commissions.'
  },
  {
    category: 'activity',
    itemName: 'Ganga Sunrise Boat Ride (Assi to Manikarnika)',
    city: 'Varanasi',
    fairRange: [300, 450],
    medianPrice: 350,
    unit: 'per person (shared) / ₹1000 private',
    reportsCount: 220,
    outlierCount: 31,
    safetyTip: 'Official rates are posted on board at Assi Ghat. Avoid touts following you in alleys.'
  },
  {
    category: 'guide',
    itemName: 'Ministry of Tourism Approved Guide (Half-day)',
    city: 'Agra / Taj Mahal & Fort',
    fairRange: [1200, 1800],
    medianPrice: 1500,
    unit: 'half-day (4 hours, up to 5 persons)',
    reportsCount: 142,
    outlierCount: 27,
    safetyTip: 'Check official photo badge with QR code issued by ASI / Ministry of Tourism.'
  },
  {
    category: 'handicraft',
    itemName: 'Blue Pottery 8-inch Decorative Floral Plate',
    city: 'Jaipur (Sanganer / Kot Jeweler)',
    fairRange: [450, 750],
    medianPrice: 550,
    unit: 'per piece',
    reportsCount: 98,
    outlierCount: 11,
    safetyTip: 'Genuine blue pottery uses quartz powder without clay. Buy at certified craft clusters.'
  }
];

// Scam & Touting Alerts (PRD Section 4.1 & 4.2)
export const INITIAL_SCAM_ALERTS: ScamAlert[] = [
  {
    id: 'scam-1',
    title: 'Fake "Government Tourist Office" Redirect at NDLS Station',
    scamCategory: 'touting',
    city: 'Delhi',
    location: 'New Delhi Railway Station (Platform 1 exit & taxi stands)',
    severity: 'high',
    description: 'Auto drivers or friendly strangers claim "Delhi is currently locked down / riots / your booked hotel has burned down / closed by police" and take you to a bogus private travel agency in Connaught Place or Paharganj where you are pressured to buy ₹50,000 fake tour packages.',
    howToAvoid: 'Never listen to anyone claiming your hotel is closed. The only official Ministry of Tourism office is at 88 Janpath (Indiatourism). Call your hotel directly.',
    reportedDate: 'Today, 10:15 AM',
    upvotes: 148,
    author: 'Delhi Tourist Police Alert Desk',
    status: 'active',
    policeCaseReference: 'FIR/DEL/TP/2026/089'
  },
  {
    id: 'scam-2',
    title: 'The "Taj Mahal Is Closed Today" or "VIP Entry" Scam',
    scamCategory: 'fake_tickets',
    city: 'Agra',
    location: 'Taj East Gate approach road & Shilpgram parking',
    severity: 'high',
    description: 'Unlicensed touts intercept vehicles 2 km away, claiming only they can grant entrance or that the main gate is blocked for VIPs. They sell counterfeit entry tokens or lead you to high-commission marble shops.',
    howToAvoid: 'Only buy tickets online via the official ASI portal (asi.payumoney.com) or official electronic kiosks at Taj East/West gates. Taj is ONLY closed on Fridays.',
    reportedDate: 'Yesterday',
    upvotes: 124,
    author: 'ASI Visitor Protection Team',
    status: 'under_police_review'
  },
  {
    id: 'scam-3',
    title: 'Manikarnika Ghat "Hospice Wood Donation" Extortion',
    scamCategory: 'temple_donation_extortion',
    city: 'Varanasi',
    location: 'Alleys leading to Manikarnika Cremation Ghat',
    severity: 'high',
    description: 'Aggressive touts posing as hospice caretakers or priests corner tourists onto rooftops overlooking cremations and demand ₹5,000 to ₹10,000 in cash "for sacred sandalwood to burn poor families".',
    howToAvoid: 'There is NO compulsory wood donation fee. Do NOT take photos of funeral pyres. Stand quietly at the public ghat steps or observe respectfully from a river boat.',
    reportedDate: '3 days ago',
    upvotes: 196,
    author: 'Varanasi Heritage Action Group',
    status: 'active'
  },
  {
    id: 'scam-4',
    title: 'Jaipur Auto "Free Tour" Gem & Carpet Kickback Loop',
    scamCategory: 'gem_carpet_scam',
    city: 'Jaipur',
    location: 'Amer Fort road and MI Road jewelry quarter',
    severity: 'medium',
    description: 'Auto driver offers a full-day tour for an absurdly low ₹100 or ₹200. Throughout the day, the driver insists on stopping at 4 "uncle\'s wholesale gem/carpet factories" where tourists are fed tea and high-pressure sales pitches for 30-50% driver commissions.',
    howToAvoid: 'Agree firmly on a fixed rate (₹800–₹1,000 for 8 hrs) with a clear written condition: "No commercial shopping stops, only monument sightseeing".',
    reportedDate: '4 days ago',
    upvotes: 82,
    author: 'Rajasthan Tourism Assistance Unit',
    status: 'resolved'
  }
];

// Verified Hotels with Trust Score & Low Commission Direct Rates (PRD Section 4.1 & 5)
export const VERIFIED_HOTELS: VerifiedHotel[] = [
  {
    id: 'hotel-1',
    name: 'Kalyan Heritage Haveli & Rooftop',
    city: 'Jaipur',
    neighborhood: 'Bani Park, Hathroi Fort Area',
    starRating: 4.2,
    trustScore: 96,
    lastVerifiedDate: 'Verified 4 days ago by Inspector #JP-14',
    verifiedPhotos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
    ],
    directPricePerNight: 2800,
    otaPricePerNight: 3650,
    commissionSavings: 850,
    amenities: ['RO Filtered Drinking Water', '100% Power Backup', 'Rooftop Rajasthani Restaurant', 'Clean Linens Guarantee', 'Prepaid Taxi Desk'],
    wheelchairAccessible: true,
    accessibleFeatures: ['Ground floor ramp access', 'Wide 36" doorway rooms', 'Roll-in shower with grab rails', 'Elevator to rooftop dining'],
    complaintsCount: 2,
    complaintsResolvedPercent: 100,
    contactPhone: '+91 141 2368904',
    verifiedAddress: '59, Hathroi Fort, Ajmer Road, Jaipur 302001',
    description: 'Family-run heritage property with authentic jharokha balconies, transparent zero-hidden-fee billing, and free railway station pickup.'
  },
  {
    id: 'hotel-2',
    name: 'Brijrama Palace Heritage Sanctum',
    city: 'Varanasi',
    neighborhood: 'Darbhanga Ghat, Riverfront',
    starRating: 4.9,
    trustScore: 98,
    lastVerifiedDate: 'Verified 1 week ago by Community Auditor #VN-02',
    verifiedPhotos: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80'
    ],
    directPricePerNight: 12500,
    otaPricePerNight: 16200,
    commissionSavings: 3700,
    amenities: ['Private Ghat Boat Landing', 'Classical Sitar Evenings', 'Ayurvedic Wellness Spa', 'Pure Satvik Dining', 'Complimentary Aarti Seats'],
    wheelchairAccessible: true,
    accessibleFeatures: ['Historic heritage mechanical elevator from Ghat water level', 'Level floor corridors', 'Staff dedicated assistance team'],
    complaintsCount: 0,
    complaintsResolvedPercent: 100,
    contactPhone: '+91 542 2450001',
    verifiedAddress: 'Darbhanga Ghat, Dashashwamedh, Varanasi 221001',
    description: '18th-century Maratha stone palace perched directly above the sacred Ganges. Strict no-commission, anti-scam guest concierge.'
  },
  {
    id: 'hotel-3',
    name: 'Bloomrooms @ New Delhi Station',
    city: 'Delhi',
    neighborhood: 'Near NDLS Station & Paharganj Outer',
    starRating: 4.1,
    trustScore: 94,
    lastVerifiedDate: 'Verified 2 days ago by Delhi Tourism Board',
    verifiedPhotos: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'
    ],
    directPricePerNight: 3100,
    otaPricePerNight: 3900,
    commissionSavings: 800,
    amenities: ['Triple-glazed Soundproof Windows', 'Cloud Beds', '24/7 Security & CCTV', 'High-speed Wi-Fi', 'Airport Metro Escort Service'],
    wheelchairAccessible: true,
    accessibleFeatures: ['Step-free ramp entrance', 'ADA-compliant guest bathroom', 'Elevator to all 4 floors'],
    complaintsCount: 3,
    complaintsResolvedPercent: 100,
    contactPhone: '+91 11 41223344',
    verifiedAddress: '8591, Arakashan Road, Ram Nagar, Paharganj, New Delhi 110055',
    description: 'Modern, ultra-clean yellow-and-white boutique oasis 400m from New Delhi Railway Station with transparent pricing and zero tout affiliations.'
  },
  {
    id: 'hotel-4',
    name: 'The Coral Court Homestay',
    city: 'Agra',
    neighborhood: 'Taj East Gate Road, Tajganj',
    starRating: 4.6,
    trustScore: 95,
    lastVerifiedDate: 'Verified 5 days ago by UP Tourism Inspector',
    verifiedPhotos: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'
    ],
    directPricePerNight: 3400,
    otaPricePerNight: 4200,
    commissionSavings: 800,
    amenities: ['Walk to Taj East Gate (8 mins)', 'Homecooked Awadhi Dinners', 'Lush Terrace Garden', 'Purified Water Stations', 'Complimentary Bicycles'],
    wheelchairAccessible: false,
    accessibleFeatures: ['Ground floor room available on request'],
    complaintsCount: 1,
    complaintsResolvedPercent: 100,
    contactPhone: '+91 562 2230112',
    verifiedAddress: 'Plot 18, Amarlok Colony, Taj East Gate Road, Agra 282001',
    description: 'Eco-conscious homestay hosted by local art collectors. Strict anti-marble-shop referral policy protects guests from commercial scams.'
  }
];

// Verified Local Guides Marketplace (PRD Section 4.4)
export const VERIFIED_GUIDES: LocalGuide[] = [
  {
    id: 'guide-1',
    name: 'Rajeshwar "Raj" Singh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    city: 'Agra',
    state: 'Uttar Pradesh',
    languages: ['English', 'Hindi', 'French', 'German'],
    specialties: ['Mughal Architecture & Symmetry', 'Taj Mahal Sunrise Photography', 'Agra Fort History'],
    hourlyRate: 450,
    halfDayRate: 1500,
    fullDayRate: 2600,
    fairRangeHalfDay: [1200, 1800],
    isGovtVerified: true,
    licenseNo: 'MOT/UP/AGR/2018/0421',
    rating: 4.96,
    reviewsCount: 312,
    bio: '14 years certified Ministry of Tourism Regional Level Guide. Historian specializing in Persian calligraphy and Pietra Dura stonework. Zero-commission policy — never takes tourists to commercial shops.',
    wheelchairCertified: true,
    availability: 'available_today',
    phone: '+91 98370 12345',
    tokensEarned: 1420
  },
  {
    id: 'guide-2',
    name: 'Ananya Chakraborty',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    city: 'Delhi',
    state: 'Delhi NCR',
    languages: ['English', 'Hindi', 'Spanish'],
    specialties: ['Old Delhi Culinary Walks', 'Sufi Heritage & Nizamuddin', 'Accessible Heritage Tours'],
    hourlyRate: 500,
    halfDayRate: 1600,
    fullDayRate: 2800,
    fairRangeHalfDay: [1400, 1900],
    isGovtVerified: true,
    licenseNo: 'DEL/TO/GDE/2021/1109',
    rating: 4.92,
    reviewsCount: 184,
    bio: 'Food anthropologist and certified Delhi Tourism Guide. Expert in safe street food tasting, Shahjahanabad alleys, and wheelchair-accessible routes in Humayun\'s Tomb and Qutub Complex.',
    wheelchairCertified: true,
    availability: 'available_today',
    phone: '+91 98110 54321',
    tokensEarned: 980
  },
  {
    id: 'guide-3',
    name: 'Pandit Rameshwar Shastri',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    languages: ['English', 'Hindi', 'Sanskrit', 'Japanese'],
    specialties: ['Ganga Aarti Philosophy', 'Sanskrit Inscriptions', 'Weavers Village & Handloom Silk'],
    hourlyRate: 400,
    halfDayRate: 1350,
    fullDayRate: 2400,
    fairRangeHalfDay: [1100, 1600],
    isGovtVerified: true,
    licenseNo: 'UPT/VNS/SPL/2016/0073',
    rating: 4.88,
    reviewsCount: 246,
    bio: 'Born and raised in the ancient ghats of Kashi. Former Banaras Hindu University scholar. Guides tourists with deep spiritual respect and protects them from fake hospice donation syndicates.',
    wheelchairCertified: false,
    availability: 'available_tomorrow',
    phone: '+91 94150 98765',
    tokensEarned: 1140
  },
  {
    id: 'guide-4',
    name: 'Vikram Rathore',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    city: 'Jaipur',
    state: 'Rajasthan',
    languages: ['English', 'Hindi', 'Italian'],
    specialties: ['Rajput Fortresses & Armory', 'Astronomical Instruments at Jantar Mantar', 'Block Printing Workshops'],
    hourlyRate: 450,
    halfDayRate: 1500,
    fullDayRate: 2500,
    fairRangeHalfDay: [1200, 1750],
    isGovtVerified: true,
    licenseNo: 'RAJ/JPR/G-1/2019/3321',
    rating: 4.95,
    reviewsCount: 209,
    bio: 'Govt. Grade-I licensed Rajasthan tourist guide. Passionate storyteller who decodes ancient stone sundials at Jantar Mantar and secret tunnels of Amer Fort without pushing retail kickback stores.',
    wheelchairCertified: true,
    availability: 'available_today',
    phone: '+91 94140 11223',
    tokensEarned: 1290
  }
];

// Live Risk Zones for Risk Heatmap (PRD Section 4.2)
export const LIVE_RISK_ZONES: RiskZone[] = [
  {
    id: 'rz-1',
    name: 'New Delhi Railway Station (Paharganj / Plat 1 Exit)',
    city: 'Delhi',
    riskLevel: 'high',
    riskType: 'tout_cluster',
    description: 'Concentrated ring of unlicensed touts targeting arriving foreign tourists with fake closure stories.',
    coordinates: { lat: 28.6431, lng: 77.2197 },
    activeIncidentsCount: 14,
    safetyAdvice: 'Walk directly to the Delhi Traffic Police Pre-paid Booth on Ajmeri Gate side or use Airport Express Metro directly.',
    touristPoliceContact: 'NDLS Tourist Police Booth: +91 11 2334 0000'
  },
  {
    id: 'rz-2',
    name: 'Taj Mahal East Gate Approach (Shilpgram to Gate)',
    city: 'Agra',
    riskLevel: 'medium',
    riskType: 'scam_hotspot',
    description: 'Electric golf cart route has unauthorized touts attempting to sell fake audio guides and marble emporium vouchers.',
    coordinates: { lat: 27.1751, lng: 78.0421 },
    activeIncidentsCount: 8,
    safetyAdvice: 'Use only the official battery bus (₹10) and verify guide identity on the ASI m-Ticket app.',
    touristPoliceContact: 'Agra Tourist Police Station: +91 562 242 1204'
  },
  {
    id: 'rz-3',
    name: 'Manikarnika Ghat Cremation Rooftops',
    city: 'Varanasi',
    riskLevel: 'high',
    riskType: 'scam_hotspot',
    description: 'Aggressive extortion for fake holy wood donations targeting foreign tourists taking photos.',
    coordinates: { lat: 25.3109, lng: 83.0135 },
    activeIncidentsCount: 19,
    safetyAdvice: 'Never give cash for funeral wood. Polite but firm refusal: "No donations, observing respectfully".',
    touristPoliceContact: 'Dashashwamedh Tourist Police Post: +91 542 250 8080'
  },
  {
    id: 'rz-4',
    name: 'Connaught Place Central Park & Inner Circle',
    city: 'Delhi',
    riskLevel: 'safe',
    riskType: 'police_safe_zone',
    description: 'Well-lit pedestrian precinct with active Delhi Police kiosks, CCTV surveillance, and verified restaurants.',
    coordinates: { lat: 28.6328, lng: 77.2195 },
    activeIncidentsCount: 0,
    safetyAdvice: 'Safe for evening strolls. Only accept assistance from uniformed Delhi Police personnel at Block A & F booths.',
    touristPoliceContact: 'CP Police Station: 112 / +91 11 2374 2000'
  },
  {
    id: 'rz-5',
    name: 'Johari Bazar & Bapu Bazar Crossing',
    city: 'Jaipur',
    riskLevel: 'medium',
    riskType: 'pickpocket_zone',
    description: 'High footfall during festival seasons and evening hours. Beware of purse snatching in crowded jewelry lanes.',
    coordinates: { lat: 26.9208, lng: 75.8243 },
    activeIncidentsCount: 5,
    safetyAdvice: 'Keep backpacks in front and use digital UPI instead of carrying large amounts of cash.',
    touristPoliceContact: 'Manak Chowk Police Station: +91 141 260 2233'
  },
  {
    id: 'rz-6',
    name: 'Assi Ghat Promenade & Aarti Steps',
    city: 'Varanasi',
    riskLevel: 'safe',
    riskType: 'police_safe_zone',
    description: 'Official municipal boat union counter with fixed tariffs and dedicated tourist assistance booth.',
    coordinates: { lat: 25.2899, lng: 83.0068 },
    activeIncidentsCount: 1,
    safetyAdvice: 'Buy tickets directly from the Municipal Corporation ticket shed.',
    touristPoliceContact: 'Assi Police Assistance Post: +91 542 231 0100'
  }
];

// Seeded SOS Incidents for Authority Telemetry (Section 5)
export const INITIAL_SOS_LOG: SOSIncident[] = [
  {
    id: 'SOS-IN-1092',
    category: 'transport_scam',
    location: 'Agra Cantt Railway Station Exit',
    city: 'Agra',
    timestamp: '18 mins ago',
    status: 'in_progress',
    notes: 'Unmetered taxi refused to take passenger to hotel unless paid ₹1,200 instead of ₹150.',
    policeUnitAssigned: 'UP Tourist Police Patrol #2',
    estimatedArrivalMinutes: 4
  },
  {
    id: 'SOS-IN-1091',
    category: 'overcharging',
    location: 'Paharganj Main Bazar, Delhi',
    city: 'Delhi',
    timestamp: '1 hour ago',
    status: 'resolved',
    notes: 'Shopkeeper demanded ₹4,000 for fake saffron. Police booth mediated and refunded full amount.',
    policeUnitAssigned: 'Delhi Tourist Police NDLS Unit',
    estimatedArrivalMinutes: 0
  },
  {
    id: 'SOS-IN-1090',
    category: 'accessibility_need',
    location: 'Humayun\'s Tomb Main Gateway',
    city: 'Delhi',
    timestamp: '2 hours ago',
    status: 'resolved',
    notes: 'Wheelchair ramp blocked by construction barrier. Monument Sahayak deployed portable ramp.',
    policeUnitAssigned: 'ASI Monument Sahayak Desk',
    estimatedArrivalMinutes: 0
  }
];
