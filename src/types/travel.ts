export type ItineraryCategory = 
  | 'transit' 
  | 'cultural_sight' 
  | 'culinary' 
  | 'cultural_buy' 
  | 'festival' 
  | 'stay';

export type TransitMode = 
  | 'train' 
  | 'flight' 
  | 'metro' 
  | 'rickshaw' 
  | 'boat' 
  | 'cab' 
  | 'walk';

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  category: ItineraryCategory;
  location: string;
  city: string;
  duration: string;
  cost: number; // in INR
  rating?: number;
  reviewsCount?: number;
  imageUrl: string;
  description: string;
  touristTip: string;
  completed?: boolean;
  transitDetails?: {
    mode: TransitMode;
    from: string;
    to: string;
    lineOrNumber?: string;
    operator?: string;
    bookingTip?: string;
  };
  culinaryDetails?: {
    specialties: string[];
    spiceLevel: 'Mild' | 'Medium' | 'Authentic Spicy';
    isVegetarianFriendly: boolean;
  };
  culturalBuyDetails?: {
    itemToBuy: string;
    giTagCertified: boolean;
    bargainTip: string;
    authenticPriceRange: string;
  };
  festivalDetails?: {
    festivalName: string;
    significance: string;
    dressCode?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DayPlan {
  currentActivityId?: string;
  dayNumber: number;
  date: string;
  dayOfWeek: string;
  title: string;
  city: string;
  weather: {
    temp: string;
    condition: string;
    icon: string;
  };
  highlight: string;
  items: ItineraryItem[];
}

export interface Trip {
  destinationCountries?: string[];
  id: string;
  title: string;
  region: string;
  tagline: string;
  duration: string;
  dateRange: string;
  coverImage: string;
  baseBudget: number;
  travelers: {
    name: string;
    avatar: string;
  }[];
  days: DayPlan[];
  highlights: {
    transit: string;
    food: string;
    festival: string;
    shopping: string;
  };
}
