export type Coordinates = { lat: number; lng: number };
export type Category =
  | "Heritage"
  | "Nature"
  | "Food"
  | "Shopping"
  | "Culture"
  | "Hotels"
  | "Experiences"
  | "Verified Guides";
export interface AccessibilityInfo {
  wheelchair: boolean;
  ramp: boolean;
  elevator: boolean;
  toilet: boolean;
  entrance?: Coordinates;
  routeVerified: boolean;
}
export interface MapPlace {
  id: string;
  name: string;
  category: Category;
  coordinates: Coordinates;
  rating?: number;
  reviewCount?: number;
  ratingSource?: "google" | "itinerary";
  photoCredits?: string;
  hours: string;
  entryPrice?: number;
  accessibility: AccessibilityInfo;
  images: string[];
  description: string;
  indoor: boolean;
  demo: boolean;
  visitMinutes: number;
  heritageQR?: string;
}
export interface Hotel extends MapPlace {
  verifiedPhotos: string[];
  updatedAt: string;
  complaints: string;
  trust: string;
  priceCategory: string;
}
export interface Guide extends MapPlace {
  profileImage: string;
  verified: boolean;
  languages: string[];
  specialization: string;
  pricePerHour: number;
  availability: string;
}
export interface ItineraryMapActivity {
  id: string;
  placeId: string;
  startsAt: string;
  state: "current" | "next" | "future" | "complete";
}
export interface TransportOption {
  id: string;
  name: string;
  minutes: number;
  cost: [number, number];
  distance: number;
  accessibility: string;
  recommended?: string;
  available: boolean;
}
export interface WeatherContext {
  temperature: number;
  description: string;
  rain: boolean;
  source: "live" | "demo";
}
export type ReportCategory =
  | "Overcharging"
  | "Transport Scam"
  | "Hotel Issue"
  | "Fake/Misleading Guide"
  | "Theft/Safety Concern"
  | "Other";
export interface CommunityReport {
  id: string;
  category: ReportCategory;
  coordinates: Coordinates;
  description: string;
  timestamp: number;
  validations: number;
  reliability: number;
  evidence?: string;
  demo: boolean;
  votes?: string[];
}
export interface SafetyHotspot {
  id: string;
  coordinates: Coordinates;
  reports: CommunityReport[];
  confidence: "Limited Data" | "Moderate Confidence" | "High Confidence";
  weight: number;
}
export interface PriceReport {
  id: string;
  service: string;
  amount: number;
  timestamp: number;
}
export interface FairPriceSummary {
  range: [number, number];
  median: number;
  outliers: number[];
  count: number;
  latest: number;
  confidence: string;
}
export interface RiskArea extends SafetyHotspot {
  radius: number;
}
export interface RouteRiskSummary {
  routeId: string;
  reports: number;
  recentReports: number;
  description: string;
}
export interface SOSRequest {
  id: string;
  category: string;
  coordinates?: Coordinates;
  location: string;
  timestamp: number;
  evidence?: string;
  status: "demo-pending";
}
export interface UserMapPreferences {
  wheelchair: boolean;
  interests: Category[];
  availableMinutes: number;
  remainingBudget: number;
}
export interface LocationReading extends Coordinates {
  accuracy: number;
  timestamp: number;
}
export interface MapRoute {
  id: string;
  points: Coordinates[];
  distance: number;
  minutes: number;
  directions: { text: string; coordinates: Coordinates }[];
  demo: boolean;
}
