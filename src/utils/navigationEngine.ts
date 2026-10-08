// Comprehensive Navigation & Directions Engine for Incredible India Planner

export type NavTravelMode = 'walk' | 'rickshaw' | 'metro' | 'cab';

export type ManeuverType = 
  | 'depart' 
  | 'turn-left' 
  | 'turn-right' 
  | 'slight-left' 
  | 'slight-right' 
  | 'straight' 
  | 'u-turn' 
  | 'roundabout' 
  | 'arrive';

export interface RouteStep {
  id: string;
  instruction: string;
  secondaryText: string;
  maneuver: ManeuverType;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number];
  landmarkHint?: string;
}

export interface RouteResult {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  mode: NavTravelMode;
  totalDistanceKm: number;
  totalDurationMin: number;
  estimatedCostInr: number;
  fareBreakdown: string;
  polyline: [number, number][];
  steps: RouteStep[];
  localTransitAlerts: string[];
}

export interface LocationPreset {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
}

export const FAMOUS_LOCATION_PRESETS: LocationPreset[] = [
  {
    id: 'chandni_chowk',
    name: 'Chandni Chowk Market',
    city: 'Old Delhi',
    lat: 28.6506,
    lng: 77.2301,
    description: 'Heritage street hub near Red Fort'
  },
  {
    id: 'connaught_place',
    name: 'Connaught Place (Inner Circle)',
    city: 'New Delhi',
    lat: 28.6328,
    lng: 77.2197,
    description: 'Rajiv Chowk central transit interchange'
  },
  {
    id: 'india_gate',
    name: 'Kartavya Path / India Gate',
    city: 'New Delhi',
    lat: 28.6129,
    lng: 77.2295,
    description: 'Central memorial boulevard'
  },
  {
    id: 'taj_ganj',
    name: 'Taj Mahal East Gate',
    city: 'Agra',
    lat: 27.1751,
    lng: 78.0421,
    description: 'Battery auto & pedestrian heritage zone'
  },
  {
    id: 'dashashwamedh',
    name: 'Dashashwamedh Ghat',
    city: 'Varanasi',
    lat: 25.3076,
    lng: 83.0104,
    description: 'Ganga Aarti riverfront walkway'
  },
  {
    id: 'hawa_mahal',
    name: 'Badi Chaupar (Hawa Mahal)',
    city: 'Jaipur',
    lat: 26.9239,
    lng: 75.8267,
    description: 'Pink City heritage core & bazaar lanes'
  },
  {
    id: 'fort_kochi',
    name: 'Chinese Fishing Nets Promenade',
    city: 'Fort Kochi',
    lat: 9.9658,
    lng: 76.2421,
    description: 'Colonial heritage promenade & ferry jetty'
  },
  {
    id: 'rajwada_indore',
    name: 'Rajwada Palace Chowk',
    city: 'Indore',
    lat: 22.7186,
    lng: 75.8553,
    description: 'Historic 7-story Holkar Palace gateway & central heritage hub'
  },
  {
    id: 'sarafa_bazaar_indore',
    name: 'Sarafa Night Food Bazaar',
    city: 'Indore',
    lat: 22.7196,
    lng: 75.8577,
    description: 'Iconic midnight food street (Bhutte Ka Kees, Garadu & Joshi Dahi Vada)'
  },
  {
    id: 'chappan_dukan_indore',
    name: '56 Dukan (Chappan Dukan)',
    city: 'Indore',
    lat: 22.7244,
    lng: 75.8839,
    description: 'FSSAI clean street food hub & Poha-Jalebi breakfast haven'
  },
  {
    id: 'lalbagh_palace_indore',
    name: 'Lal Bagh Palace Estate',
    city: 'Indore',
    lat: 22.7008,
    lng: 75.8427,
    description: 'Holkar royal estate with Buckingham palace replica gates'
  },
  {
    id: 'khajrana_ganesh_indore',
    name: 'Khajrana Ganesh Temple',
    city: 'Indore',
    lat: 22.7303,
    lng: 75.9038,
    description: 'Historic 1735 shrine built by Rani Ahilyabai Holkar'
  }
];

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance nicely
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Format duration nicely
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}

// Calculate Indian public transport & auto rickshaw fares
export function calculateEstimatedFare(mode: NavTravelMode, distanceKm: number): { cost: number; breakdown: string } {
  const dist = Math.max(0.2, distanceKm);

  switch (mode) {
    case 'walk':
      return {
        cost: 0,
        breakdown: 'Free • Zero emissions'
      };

    case 'rickshaw': {
      // Official Delhi / State Transport Dept Auto Meter Rate:
      // First 1.5 km: ₹30, thereafter ₹11 per km
      const baseDist = 1.5;
      let fare = 30;
      if (dist > baseDist) {
        fare += Math.ceil((dist - baseDist) * 11);
      }
      return {
        cost: fare,
        breakdown: `Official Govt Meter: ₹30 for 1st 1.5km + ₹11/km (Approx ₹${fare})`
      };
    }

    case 'metro': {
      // DMRC Fare Slabs:
      // 0-2 km: ₹10, 2-5 km: ₹20, 5-12 km: ₹30, 12-21 km: ₹40, 21-32 km: ₹50, >32 km: ₹60
      let fare = 10;
      if (dist > 32) fare = 60;
      else if (dist > 21) fare = 50;
      else if (dist > 12) fare = 40;
      else if (dist > 5) fare = 30;
      else if (dist > 2) fare = 20;

      return {
        cost: fare,
        breakdown: `Metro Smart Token: ₹${fare} (10% off with Metro Card / UPI QR)`
      };
    }

    case 'cab': {
      // AC Taxi / Rideshare benchmark: ₹50 base + ₹16/km
      const baseFare = 50;
      const kmRate = 16;
      const fare = Math.round(baseFare + (dist * kmRate));
      return {
        cost: fare,
        breakdown: `Prepaid Taxi / Cab: ~₹${fare} (Base ₹50 + ₹16/km)`
      };
    }
  }
}

// Generate realistic polyline geometry with urban bends
function generatePathPolyline(
  start: [number, number], 
  end: [number, number], 
  mode: NavTravelMode
): [number, number][] {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  const points: [number, number][] = [[lat1, lng1]];
  const segments = mode === 'walk' ? 6 : 8;

  // Vector difference
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  for (let i = 1; i < segments; i++) {
    const fraction = i / segments;
    // Introduce orthogonal street grid offsets typical of Indian roads/lanes
    const wiggle = Math.sin(fraction * Math.PI) * (mode === 'walk' ? 0.0006 : 0.0012);
    const perpLat = -dLng * (i % 2 === 0 ? 0.4 : -0.4);
    const perpLng = dLat * (i % 2 === 0 ? 0.4 : -0.4);

    const lat = lat1 + dLat * fraction + perpLat * 0.15 + (i % 3 === 0 ? wiggle : -wiggle);
    const lng = lng1 + dLng * fraction + perpLng * 0.15;
    points.push([lat, lng]);
  }

  points.push([lat2, lng2]);
  return points;
}

// Generate step-by-step turn-by-turn navigation instructions
export function generateRoute(
  origin: { lat: number; lng: number; name: string },
  destination: { lat: number; lng: number; name: string },
  mode: NavTravelMode = 'walk'
): RouteResult {
  const straightDistKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // Real street travel distance is typically 1.25x - 1.4x of straight-line distance in Indian cities
  const roadFactor = mode === 'walk' ? 1.25 : 1.35;
  const totalDistanceKm = Math.max(0.15, +(straightDistKm * roadFactor).toFixed(2));

  // Speeds in km/h:
  // Walking: ~4.2 km/h
  // Auto Rickshaw: ~18 km/h (including traffic/lights)
  // Metro: ~32 km/h (including train dwell time)
  // Cab: ~22 km/h
  let speedKmH = 4.2;
  if (mode === 'rickshaw') speedKmH = 18;
  if (mode === 'metro') speedKmH = 32;
  if (mode === 'cab') speedKmH = 22;

  const totalDurationMin = Math.max(2, Math.round((totalDistanceKm / speedKmH) * 60));
  const fare = calculateEstimatedFare(mode, totalDistanceKm);
  const polyline = generatePathPolyline([origin.lat, origin.lng], [destination.lat, destination.lng], mode);

  // Generate maneuvers along the waypoints
  const steps: RouteStep[] = [];
  const totalManeuvers = Math.min(polyline.length - 1, 6);
  const stepDist = Math.round((totalDistanceKm * 1000) / totalManeuvers);

  const maneuverTemplates: {
    maneuver: ManeuverType;
    instruction: (dest: string, mode: NavTravelMode) => string;
    secondary: string;
    landmark: string;
  }[] = [
    {
      maneuver: 'depart',
      instruction: (_, m) => m === 'walk' 
        ? `Start walking towards main heritage promenade` 
        : `Board at designated pickup / prepaid auto stand`,
      secondary: `Head towards ${destination.name.split(' ')[0]} arterial route`,
      landmark: 'Official Tourist Information kiosk visible nearby'
    },
    {
      maneuver: 'turn-left',
      instruction: () => 'Turn left onto the bazaar arterial connector',
      secondary: 'Pass through the pedestrian walkway (mind cycle rickshaws)',
      landmark: 'Old heritage archway on your left'
    },
    {
      maneuver: 'straight',
      instruction: () => 'Continue straight past the verified handicraft emporiums',
      secondary: 'Follow the paved heritage trail signage',
      landmark: 'Look for Ministry of Tourism signage board'
    },
    {
      maneuver: 'turn-right',
      instruction: () => 'Turn right onto the monument access road',
      secondary: 'Follow directional signs toward the security ticketing queue',
      landmark: 'Official ASI ticket scanner booths ahead'
    },
    {
      maneuver: 'slight-left',
      instruction: () => 'Keep left towards the visitor entrance gateway',
      secondary: 'Wheelchair / step-free ramp pathway available on the side',
      landmark: 'Clockroom & shoe depository kiosk nearby'
    },
    {
      maneuver: 'arrive',
      instruction: (dest) => `Arrive at ${dest}`,
      secondary: 'Your destination is directly ahead',
      landmark: 'Main verified entry gate reached'
    }
  ];

  for (let i = 0; i < totalManeuvers; i++) {
    const template = maneuverTemplates[Math.min(i, maneuverTemplates.length - 1)];
    const point = polyline[i] || [origin.lat, origin.lng];

    steps.push({
      id: `step-${i + 1}`,
      maneuver: i === totalManeuvers - 1 ? 'arrive' : template.maneuver,
      instruction: i === totalManeuvers - 1 
        ? `Arrive at ${destination.name}` 
        : template.instruction(destination.name, mode),
      secondaryText: template.secondary,
      distanceMeters: i === totalManeuvers - 1 ? 25 : stepDist,
      durationSeconds: Math.round((totalDurationMin * 60) / totalManeuvers),
      coordinates: point,
      landmarkHint: template.landmark
    });
  }

  // Local transit alerts
  const localTransitAlerts: string[] = [];
  if (mode === 'rickshaw') {
    localTransitAlerts.push('Ask driver: "Meter se chalo" (Run by the government meter).');
    localTransitAlerts.push('Night charges apply between 11:00 PM and 5:00 AM (+25%).');
  } else if (mode === 'walk') {
    localTransitAlerts.push('Pedestrian-only hours often enforced in historic heritage bazaars (9 AM - 9 PM).');
    localTransitAlerts.push('Comfortable slip-on shoes recommended for visiting temples/monuments en route.');
  } else if (mode === 'metro') {
    localTransitAlerts.push('Security frisking mandatory at all metro stations; luggage X-ray required.');
    localTransitAlerts.push('First coach in direction of travel is reserved for women travelers.');
  } else if (mode === 'cab') {
    localTransitAlerts.push('Verify OTP with driver before boarding; check license plate.');
  }

  return {
    origin,
    destination,
    mode,
    totalDistanceKm,
    totalDurationMin,
    estimatedCostInr: fare.cost,
    fareBreakdown: fare.breakdown,
    polyline,
    steps,
    localTransitAlerts
  };
}

// Speak turn-by-turn instruction using browser SpeechSynthesis
export function announceVoicePrompt(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Attempt to select an Indian English voice if present
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis unavailable:', err);
  }
}
