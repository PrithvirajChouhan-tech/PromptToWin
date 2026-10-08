import { QRScanner } from "../../journey/JourneyHub";
import { usePlatform } from "../../../services/journey";
import GoogleMutant from "leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs";
import { loadGoogleMaps } from "../../../services/googleMapsLoader";
import { StreetViewModal } from "../explore/StreetViewModal";
import { PegmanButton } from "../explore/PegmanButton";
import {
  OpeningHoursService,
  SearchService,
  navigationProgress,
  formatDuration,
} from "../../../services/smartMap/travel";
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import {
  Search,
  SlidersHorizontal,
  LocateFixed,
  Navigation,
  Shield,
  Compass,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  Plus,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { DayPlan, ItineraryItem } from "../../../types/travel";
import type {
  Coordinates,
  MapPlace,
  Category,
  LocationReading,
  CommunityReport,
  SafetyHotspot,
  WeatherContext,
  TransportOption,
  MapRoute,
  ReportCategory,
} from "../../../services/smartMap/models";
import {
  demoPlaces,
  CommunityReportService,
} from "../../../services/smartMap/repository";
import {
  HotelService,
  GuideService,
  priceReports,
} from "../../../services/smartMap/repository";
import {
  distance,
  FairPriceService,
  RiskAggregationService,
  ArrivalDetectionService,
  SafetyService,
} from "../../../services/smartMap/intelligence";
import {
  LocationService,
  WeatherService,
  TransportService,
  NavigationService,
  AccessibilityService,
  ItineraryService,
  recommendationService,
} from "../../../services/smartMap/travel";
import { ARView } from "./ARView";
import { AuthUser, isDemoUser, promptDemoRestriction } from "../../../types/auth";
import "./smartMap.css";
const categories: Category[] = [
  "Heritage",
  "Nature",
  "Food",
  "Shopping",
  "Culture",
  "Hotels",
  "Experiences",
  "Verified Guides",
];
const symbols: Record<Category, string> = {
  Heritage: "♜",
  Nature: "♧",
  Food: "♨",
  Shopping: "◇",
  Culture: "◈",
  Hotels: "▤",
  Experiences: "✧",
  "Verified Guides": "✓",
};
const reportCategories: ReportCategory[] = [
  "Overcharging",
  "Transport Scam",
  "Hotel Issue",
  "Fake/Misleading Guide",
  "Theft/Safety Concern",
  "Other",
];
type Sheet =
  | "home"
  | "place"
  | "filters"
  | "commute"
  | "navigation"
  | "hotspot"
  | "report"
  | "routes"
  | "qr";
export function SmartSafetyMap({
  day,
  currentUser,
  onAdd,
  onArrive,
  onOpenSOS,
  accessibilityMode = false,
  onBack,
  focusLocation,
}: {
  day: DayPlan;
  currentUser?: AuthUser | null;
  onAdd: (p: Omit<ItineraryItem, "id">) => void;
  onArrive: (place: MapPlace) => string;
  onOpenSOS: () => void;
  accessibilityMode?: boolean;
  onBack?: () => void;
  focusLocation?: { lat: number; lng: number; title?: string } | null;
}) {
  const {profile:platformProfile}=usePlatform();
  const container = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    userMarker = useRef<L.Marker | L.CircleMarker | null>(null),
    userAccuracyCircle = useRef<L.Circle | null>(null),
    searchFocusMarker = useRef<L.Marker | null>(null),
    stopLocation = useRef<() => void>(() => {}),
    arrival = useRef(new ArrivalDetectionService()),
    osmLayer = useRef<L.TileLayer | null>(null),
    routeGeneration = useRef(0);
  const [streetView, setStreetView] = useState<{
    lat: number;
    lng: number;
    name?: string;
  }>();
  const [pegmanDragging, setPegmanDragging] = useState(false);
  const [nearbyPlaces,setNearbyPlaces]=useState<MapPlace[]>([]);
  const [nearbyStatus,setNearbyStatus]=useState('');
  const [nearbyRetry,setNearbyRetry]=useState(0);
  const nearbyOrigin=useRef<Coordinates | undefined>(undefined);
  const [mapRetry, setMapRetry] = useState(0);
  useEffect(()=>{const update=()=>setReports(CommunityReportService.list());window.addEventListener("yatra-map-data",update);return()=>window.removeEventListener("yatra-map-data",update);},[]);
  const [mode, setMode] = useState<"explore" | "safety">("explore"),
    [sheet, setSheet] = useState<Sheet>("home"),
    [expanded, setExpanded] = useState(false),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<MapPlace>(),
    [location, setLocation] = useState<LocationReading>(),
    [manualOrigin, setManualOrigin] = useState<Coordinates>(),
    [notice, setNotice] = useState(""),
    [weather, setWeather] = useState<WeatherContext>(),
    [weatherError, setWeatherError] = useState(false),
    [viewport, setViewport] = useState(0),
    [filter, setFilter] = useState<Category[]>([]),
    [wheelchair, setWheelchair] = useState(accessibilityMode),
    [riskFilter, setRiskFilter] = useState("All Relevant Reports"),
    [days, setDays] = useState(30),
    [reports, setReports] = useState<CommunityReport[]>(() =>
      CommunityReportService.list(),
    ),
    [hotspot, setHotspot] = useState<SafetyHotspot>(),
    [transport, setTransport] = useState<TransportOption>({
      id: "car",
      name: "Car / Drive",
      distance: 1200,
      cost: [35, 90],
      minutes: 15,
      accessibility: "Standard",
      available: true,
    }),
    [suggestionsOpen, setSuggestionsOpen] = useState(() => {
      if (typeof window !== "undefined") {
        return window.innerWidth > 768;
      }
      return true;
    }),
    [fixedFeaturedPlace, setFixedFeaturedPlace] = useState<MapPlace | null>(null),
    [routes, setRoutes] = useState<MapRoute[]>([]),
    [route, setRoute] = useState<MapRoute>(),
    [navigating, setNavigating] = useState(false),
    [autoFollow, setAutoFollow] = useState(true),
    [userHeading, setUserHeading] = useState<number | null>(null),
    [arrived, setArrived] = useState(false),
    [currentId, setCurrentId] = useState<string>(day.currentActivityId),
    [busy, setBusy] = useState(false),
    [ar, setAR] = useState(false),
    [tileError, setTileError] = useState(false),
    [tileLoading, setTileLoading] = useState(true),
    [permission, setPermission] = useState(false),
    [language, setLanguage] = useState("en-IN"),
    [qr, setQR] = useState(""),
    [qrOpen, setQROpen] = useState(false),
    [fullscreenImage, setFullscreenImage] = useState<string | null>(null),
    [transportPickerTarget, setTransportPickerTarget] = useState<MapPlace | null>(null);

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lastCoordRef = useRef<LocationReading | null>(null);
  const progress = useMemo(() => {
    if (!route) return null;
    return navigationProgress(route, location);
  }, [route, location]);

  const initialRouteBearing = useMemo(() => {
    if (route && route.points.length > 1) {
      const p1 = route.points[0];
      const p2 = route.points[1];
      const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
      const lat1 = (p1.lat * Math.PI) / 180;
      const lat2 = (p2.lat * Math.PI) / 180;
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
    }
    return 0;
  }, [route]);

  const [vehicleModel, setVehicleModel] = useState<'blue-sedan' | 'red-suv' | 'yellow-cab' | 'green-sports' | 'arrow'>('arrow');
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false);

  const createCarIcon = (heading: number, model: string = 'arrow') => {
    if (model === 'arrow') {
      return L.divIcon({
        className: "sm-gps-car-marker",
        html: `
          <div class="sm-gps-car-container" id="sm-live-car-indicator" style="transform: rotate(${heading}deg);">
            <div class="sm-car-shadow" style="width: 22px; height: 28px; border-radius: 50%; top: 12px; left: 11px;"></div>
            <svg class="sm-nav-car-svg" width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 4 L4 38 L18 30 Z" fill="#1A73E8" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M18 4 L32 38 L18 30 Z" fill="#1557B0" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M18 4 L18 30" stroke="rgba(255,255,255,0.9)" stroke-width="1.8"/>
            </svg>
            <div class="sm-car-pulse-ring" style="width: 42px; height: 42px;"></div>
          </div>
        `,
        iconSize: [44, 48],
        iconAnchor: [22, 24],
      });
    }

    const primaryColor =
      model === 'red-suv' ? '#DC2626' :
      model === 'yellow-cab' ? '#F59E0B' :
      model === 'green-sports' ? '#059669' : '#1A73E8';
    const roofColor =
      model === 'red-suv' ? '#B91C1C' :
      model === 'yellow-cab' ? '#D97706' :
      model === 'green-sports' ? '#047857' : '#1967D2';

    return L.divIcon({
      className: "sm-gps-car-marker",
      html: `
        <div class="sm-gps-car-container" id="sm-live-car-indicator" style="transform: rotate(${heading}deg);">
          <div class="sm-car-shadow"></div>
          <svg class="sm-nav-car-svg" width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Headlight beams -->
            <path d="M9 7 L3 0 M25 7 L31 0" stroke="rgba(255,235,59,0.85)" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Car body outer -->
            <rect x="6" y="5" width="22" height="36" rx="8" fill="${primaryColor}"/>
            <rect x="6" y="5" width="22" height="36" rx="8" stroke="#FFFFFF" stroke-width="2"/>
            ${model === 'yellow-cab' ? '<rect x="13" y="10" width="8" height="3" rx="1" fill="#1F1C18"/><rect x="14" y="10.5" width="6" height="2" fill="#FDE68A"/>' : ''}
            ${model === 'red-suv' ? '<line x1="9" y1="20" x2="9" y2="32" stroke="#FFFFFF" stroke-width="1.5"/><line x1="25" y1="20" x2="25" y2="32" stroke="#FFFFFF" stroke-width="1.5"/>' : ''}
            ${model === 'green-sports' ? '<rect x="16" y="5" width="2" height="36" fill="#FDE68A"/>' : ''}
            <!-- Front windshield -->
            <path d="M9 15 C9 12 25 12 25 15 L24 20 C24 19 10 19 10 20 Z" fill="#0D47A1"/>
            <path d="M11 14.5 L23 14.5" stroke="rgba(255,255,255,0.75)" stroke-width="1.2" stroke-linecap="round"/>
            <!-- Car roof -->
            <rect x="9.5" y="20" width="15" height="11" rx="3" fill="${roofColor}"/>
            <!-- Rear windshield -->
            <path d="M10 32 C10 31 24 31 24 32 L25 35 C25 35.5 9 35.5 9 35 Z" fill="#0D47A1"/>
            <!-- Rear tail lights -->
            <rect x="7.5" y="39" width="4" height="1.5" rx="0.75" fill="#EA4335"/>
            <rect x="22.5" y="39" width="4" height="1.5" rx="0.75" fill="#EA4335"/>
            <!-- Mirrors -->
            <rect x="3.5" y="14" width="2.5" height="4" rx="1.2" fill="${roofColor}"/>
            <rect x="28" y="14" width="2.5" height="4" rx="1.2" fill="${roofColor}"/>
          </svg>
          <div class="sm-car-pulse-ring"></div>
        </div>
      `,
      iconSize: [44, 52],
      iconAnchor: [22, 26],
    });
  };

  const createDotIcon = (heading: number | null) => {
    return L.divIcon({
      className: "sm-live-gps-user-marker",
      html: `
        <div class="sm-gps-dot-container" id="sm-live-dot-indicator" style="${heading !== null ? `transform: rotate(${heading}deg);` : ''}">
          <div class="sm-gps-heading-beam ${heading !== null ? 'is-active' : ''}"></div>
          <div class="sm-gps-dot-pulse"></div>
          <div class="sm-gps-dot-core"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };
  // Hide bottom nav bar when fullscreen image is shown
  useEffect(() => {
    if (fullscreenImage) {
      document.body.classList.add('img-fullscreen-open');
    } else {
      document.body.classList.remove('img-fullscreen-open');
    }
    return () => document.body.classList.remove('img-fullscreen-open');
  }, [fullscreenImage]);
  const [reportCategory, setReportCategory] =
      useState<ReportCategory>("Overcharging"),
    [description, setDescription] = useState(""),
    [evidence, setEvidence] = useState<string>(),
    [reportLocation, setReportLocation] = useState<"center" | "gps">("center");
  const [searchResults, setSearchResults] = useState<MapPlace[]>([]);
  const [searchError, setSearchError] = useState("");
  const [minutesAvailable, setMinutesAvailable] = useState(80);
  const [budget, setBudget] = useState(platformProfile.budget || 500);
  useEffect(() => {
    setSearchResults([]);
    setSearchError("");
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const userLoc = location ? { lat: location.lat, lng: location.lng } : (map.current ? { lat: map.current.getCenter().lat, lng: map.current.getCenter().lng } : undefined);
      SearchService.search(query, controller.signal, userLoc)
        .then(setSearchResults)
        .catch((e) => {
          if (!controller.signal.aborted) setSearchError(e.message);
        });
    }, 160);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  const tripPlaces = useMemo(
    () =>
      day.items
        .filter((i) => i.category !== "transit")
        .map(ItineraryService.toPlace)
        .filter((p): p is MapPlace => !!p),
    [day.items],
  );
  const allPlaces = useMemo(
    () => [
      ...nearbyPlaces,
      ...tripPlaces.filter(p=>!nearbyPlaces.some(n=>distance(n.coordinates,p.coordinates)<80)),
      ...demoPlaces.filter(
        (p) =>
          !tripPlaces.some((t) => distance(t.coordinates, p.coordinates) < 80),
      ),
    ],
    [tripPlaces,nearbyPlaces],
  );
  const next = day.items.find(
    (i) => !i.completed && i.id !== currentId && i.category !== "transit",
  );
  const nextPlace = tripPlaces.find((p) => p.id === next?.id);
  const activeReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          riskFilter === "All Relevant Reports" ||
          (riskFilter === "Scam Reports" &&
            ["Transport Scam", "Fake/Misleading Guide"].includes(r.category)) ||
          (riskFilter === "Overcharging" && r.category === "Overcharging") ||
          (riskFilter === "Theft Reports" &&
            r.category === "Theft/Safety Concern") ||
          (riskFilter === "Safety Incidents" &&
            ["Other", "Hotel Issue", "Theft/Safety Concern"].includes(
              r.category,
            )),
      ),
    [reports, riskFilter],
  );
  const hotspots = useMemo(
    () => RiskAggregationService.aggregate(activeReports, days),
    [activeReports, days],
  );
  const visiblePlaces = useMemo(
    () =>
      allPlaces.filter(
        (p) =>
          (!filter.length || filter.includes(p.category)) &&
          (!wheelchair || p.accessibility.wheelchair) &&
          (!map.current ||
            map.current
              .getBounds()
              .pad(0.15)
              .contains([p.coordinates.lat, p.coordinates.lng])),
      ),
    [allPlaces, filter, wheelchair, viewport],
  );
  useEffect(()=>{
    if(mode!=='explore'||!map.current)return;
    const center=map.current.getCenter();const point={lat:center.lat,lng:center.lng};
    if(nearbyOrigin.current&&distance(nearbyOrigin.current,point)<1000&&nearbyRetry===0)return;
    let active=true;const timer=setTimeout(async()=>{
      setNearbyStatus('Finding well-rated places nearby…');
      try {const maps=await loadGoogleMaps();const {Place,SearchNearbyRankPreference}=await maps.importLibrary('places') as google.maps.PlacesLibrary;
        const result=await Place.searchNearby({fields:['id','displayName','location','rating','userRatingCount','photos','formattedAddress'],locationRestriction:{center:point,radius:5000},includedTypes:['tourist_attraction','museum','park'],maxResultCount:16,rankPreference:SearchNearbyRankPreference.POPULARITY});
        if(!active)return;nearbyOrigin.current=point;
        const places:MapPlace[]=result.places.filter(p=>p.location&&(p.rating||0)>=4&&(p.userRatingCount||0)>=20).sort((a,b)=>((b.rating||0)-3.5)*Math.log1p(b.userRatingCount||0)-((a.rating||0)-3.5)*Math.log1p(a.userRatingCount||0)).slice(0,10).map(p=>({id:`nearby-${p.id}`,name:p.displayName||'Nearby attraction',category:'Heritage',coordinates:{lat:p.location!.lat(),lng:p.location!.lng()},rating:p.rating||undefined,reviewCount:p.userRatingCount||0,ratingSource:'google',images:p.photos?.[0]?[p.photos[0].getURI({maxWidth:200,maxHeight:160})]:[],photoCredits:p.photos?.[0]?.authorAttributions?.map(a=>a.displayName).join(', '),hours:'Check opening hours',accessibility:{wheelchair:false,ramp:false,elevator:false,toilet:false,routeVerified:false},description:p.formattedAddress||'Popular nearby place on Google Maps. Facilities and entry fees need confirmation.',indoor:false,demo:false,visitMinutes:60}));
        setNearbyPlaces(places);setNearbyStatus(places.length?'Rated by Google Maps visitors':'No highly rated attractions found in this area. Showing itinerary places.');
      }catch{if(active)setNearbyStatus('Live recommendations unavailable. Showing nearby itinerary picks.');}
    },700);return()=>{active=false;clearTimeout(timer);};
  },[viewport,mode,nearbyRetry]);
  const recommendedCards = useMemo(() => {
    const pool = visiblePlaces.length > 0 ? visiblePlaces : allPlaces;
    return pool
      .filter((p) => !["Hotels", "Verified Guides"].includes(p.category))
      .filter((p) => !p.name.toLowerCase().includes("jama masjid")) // Show varied, fresh iconic places
      .sort((a, b) => (b.rating || 0) - (a.rating || 0) || Number(b.ratingSource === "google") - Number(a.ratingSource === "google"))
      .slice(0, 8);
  }, [visiblePlaces, allPlaces]);
  const visibleHotspots = hotspots.filter(
    (h) =>
      !map.current ||
      map.current.getBounds().contains([h.coordinates.lat, h.coordinates.lng]),
  );
  const center = map.current?.getCenter();
  const origin = location ||
    manualOrigin || {
      lat: center?.lat || 26.9258,
      lng: center?.lng || 75.8237,
    };
  // Computed default nearby candidate
  const initialNearbyCandidate = useMemo(() => {
    if (nextPlace && distance(origin, nextPlace.coordinates) < 28000 && !nextPlace.name.toLowerCase().includes('jama masjid')) {
      return nextPlace;
    }
    return recommendedCards.find(p => distance(origin, p.coordinates) < 28000 && !p.name.toLowerCase().includes('jama masjid')) || recommendedCards[0];
  }, [nextPlace, origin, recommendedCards]);

  // Keep left div place fixed until the user explicitly clicks a place
  useEffect(() => {
    if (!fixedFeaturedPlace && initialNearbyCandidate) {
      setFixedFeaturedPlace(initialNearbyCandidate);
    }
  }, [initialNearbyCandidate, fixedFeaturedPlace]);

  // The actual place shown in the left div: fixed until user clicks!
  const displayFeaturedPlace = fixedFeaturedPlace || initialNearbyCandidate;
  const recommendation = recommendationService.recommend(visiblePlaces, {
    location: origin,
    preferences: {
      wheelchair,
      interests: platformProfile.interests?.length ? platformProfile.interests as Category[] : ["Heritage", "Culture"],
      availableMinutes: minutesAvailable,
      remainingBudget: budget,
    },
    weather,
    itinerary: tripPlaces.map((p) => p.id),
    reports,
  });
  const prices = FairPriceService.aggregate(priceReports);
  const routeRisk = route ? SafetyService.route(route, reports) : undefined;
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qWords = q.split(/\s+/).filter(Boolean);

    // 1. Local verified places that match all keywords in name, category, or description
    const localMatches = allPlaces.filter((p) => {
      const text = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      return qWords.every((word) => text.includes(word));
    });

    // 2. Combine with searchResults from global API (which already matched the query)
    const combined = [...localMatches, ...searchResults];

    // Deduplicate by ID or nearby coordinates
    const seen = new Set<string>();
    const deduped: MapPlace[] = [];
    for (const p of combined) {
      const key = `${p.coordinates.lat.toFixed(3)},${p.coordinates.lng.toFixed(3)}`;
      if (!seen.has(p.id) && !seen.has(key)) {
        seen.add(p.id);
        seen.add(key);
        deduped.push(p);
      }
    }

    // Sort: 1. Places in user's city (< 28km) FIRST! 2. Nearby (< 80km) SECOND! 3. Farther!
    deduped.sort((a, b) => {
      const distA = distance(origin, a.coordinates);
      const distB = distance(origin, b.coordinates);
      const cityA = distA <= 28000;
      const cityB = distB <= 28000;
      if (cityA && !cityB) return -1;
      if (!cityA && cityB) return 1;
      const nearA = distA <= 80000;
      const nearB = distB <= 80000;
      if (nearA && !nearB) return -1;
      if (!nearA && nearB) return 1;
      return distA - distB;
    });

    return deduped.slice(0, 10);
  }, [query, allPlaces, searchResults, origin]);
  const openStreetView = (coords?: { lat: number; lng: number }) => {
    const target = coords || selected?.coordinates || map.current?.getCenter();
    if (target) {
      setStreetView({
        lat: target.lat,
        lng: target.lng,
        name: coords ? "Dropped map location" : selected?.name || "Map center",
      });
    }
  };
  const isPegmanDrop = (event: React.DragEvent) =>
    Array.from(event.dataTransfer.types).includes(
      "application/pegman-streetview",
    );
  const handlePegmanDragOver = (event: React.DragEvent) => {
    if (!isPegmanDrop(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setPegmanDragging(true);
  };
  const handlePegmanDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node))
      setPegmanDragging(false);
  };
  const handlePegmanDrop = (event: React.DragEvent) => {
    if (!isPegmanDrop(event)) return;
    event.preventDefault();
    setPegmanDragging(false);
    if (!container.current || !map.current) return;
    const rect = container.current.getBoundingClientRect();
    const point = map.current.containerPointToLatLng([
      event.clientX - rect.left,
      event.clientY - rect.top,
    ]);
    openStreetView({ lat: point.lat, lng: point.lng });
  };
  const pick = (p: MapPlace) => {
    if (!location && !manualOrigin && map.current) {
      const start = map.current.getCenter();
      setManualOrigin({ lat: start.lat, lng: start.lng });
    }
    routeGeneration.current += 1;
    setBusy(false);
    if (navigating && p.id !== selected?.id) {
      setNavigating(false);
      setRoute(undefined);
      setRoutes([]);
    }
    setQROpen(false);
    setQR("");
    setSelected(p);
    setFixedFeaturedPlace(p);
    setSheet(mode === "explore" ? "place" : "home");
    setExpanded(false);
    setQuery("");
    map.current?.flyTo([p.coordinates.lat, p.coordinates.lng], 16, { duration: 1.2 });
  };

  const handleApplyFocus = (loc: { lat: number; lng: number; title?: string }) => {
    if (!map.current) return;
    map.current.setView([loc.lat, loc.lng], 15, { animate: true });

    if (searchFocusMarker.current) {
      searchFocusMarker.current.remove();
      searchFocusMarker.current = null;
    }

    const titleText = loc.title || 'Selected Destination';
    const pin = L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({
        className: 'sm-focus-pin',
        html: `<div style="background:#C84B31;color:#fff;padding:6px 14px;border-radius:24px;font-weight:800;font-size:12px;box-shadow:0 6px 18px rgba(200,75,49,0.45);border:2px solid #fff;display:flex;align-items:center;gap:6px;transform:translate(-50%,-100%);">📍 ${titleText}</div>`,
        iconSize: [0, 0]
      }),
      zIndexOffset: 2000
    }).addTo(map.current);
    searchFocusMarker.current = pin;

    const matched = allPlaces.find(
      (p) => Math.abs(p.coordinates.lat - loc.lat) < 0.005 && Math.abs(p.coordinates.lng - loc.lng) < 0.005
    );

    const placeToSelect: MapPlace = matched || {
      id: `searched-${loc.lat.toFixed(4)}-${loc.lng.toFixed(4)}`,
      name: loc.title || 'Selected Destination',
      category: 'Heritage',
      coordinates: { lat: loc.lat, lng: loc.lng },
      rating: 4.8,
      reviewCount: 350,
      hours: 'Open • Popular destination',
      accessibility: { wheelchair: true, ramp: true, elevator: false, toilet: true, routeVerified: true },
      description: `Navigating to ${loc.title || 'destination'} on Live Interactive Map.`,
      indoor: false,
      demo: false,
      images: [],
      visitMinutes: 60
    };

    pick(placeToSelect);
  };

  useEffect(() => {
    if (!focusLocation || !map.current) return;
    handleApplyFocus(focusLocation);
  }, [focusLocation]);

  useEffect(() => {
    if (!container.current) return;
    const initial = focusLocation
      ? { lat: focusLocation.lat, lng: focusLocation.lng }
      : (tripPlaces[0]?.coordinates || demoPlaces[0].coordinates);
    const m = L.map(container.current, { zoomControl: false }).setView(
      [initial.lat, initial.lng],
      focusLocation ? 15 : 14,
    );
    map.current = m;
    setViewport((v) => v + 1);

    if (focusLocation) {
      setTimeout(() => {
        handleApplyFocus(focusLocation);
      }, 120);
    }

    // Automatically locate user and activate real-time GPS tracking on map open!
    locate();

    // The Google basemap is loaded separately, so retrying never resets this map.
    m.on("moveend zoomend", () => setViewport((v) => v + 1));
    m.on("dragstart", () => setAutoFollow(false));
    m.on("click", (e) => {
      const target = e.originalEvent?.target as HTMLElement | undefined;
      if (target && (target.closest('.sm-sheet') || target.closest('.sm-marker') || target.closest('.sm-top') || target.closest('.sm-side') || target.closest('.sm-place-recommendations'))) {
        return;
      }
      setSelected(undefined);
      setSheet("home");
      setExpanded(false);
    });
    const resize = new ResizeObserver(() => m.invalidateSize());
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      stopLocation.current();
      searchFocusMarker.current?.remove();
      userAccuracyCircle.current?.remove();
      m.remove();
      map.current = null;
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    let active = true;
    let layer: L.GridLayer | undefined;
    let overlayCheck: ReturnType<typeof setTimeout> | undefined;
    setTileLoading(true);
    setTileError(false);
    const fail = () => {
      if (active) {
        layer?.remove();
        setTileLoading(false);
        setTileError(true);
        if (m && !osmLayer.current) {
          const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          });
          osm.addTo(m);
          osmLayer.current = osm;
        }
        setNotice(
          "Using standard OpenStreetMap basemap. Tap places or safety zones to explore.",
        );
      }
    };
    window.addEventListener("yatra-google-auth-error", fail);
    loadGoogleMaps()
      .then(() => {
        if (!active) return;
        layer = new GoogleMutant({ type: "roadmap", maxZoom: 21 });
        layer.on("load", () => {
          if (active) setTileLoading(false);
        });
        layer.on("tileerror", fail);
        layer.addTo(m);
        setTileLoading(false);
        // Google can return HTTP 200 while rendering its billing watermark.
        // Detect that state and remove the degraded layer instead of showing it.
        overlayCheck = setTimeout(() => {
          const text = m.getContainer().textContent || "";
          if (/for development purposes only/i.test(text)) fail();
        }, 1800);
      })
      .catch(() => fail());
    return () => {
      active = false;
      if (overlayCheck) clearTimeout(overlayCheck);
      window.removeEventListener("yatra-google-auth-error", fail);
      layer?.remove();
      osmLayer.current?.remove();
      osmLayer.current = null;
    };
  }, [mapRetry]);
  useEffect(() => {
    let active = true;
    setWeatherError(false);
    WeatherService.get(origin)
      .then((w) => {
        if (active) setWeather(w);
      })
      .catch(() => {
        if (active) setWeatherError(true);
      });
    return () => {
      active = false;
    };
  }, [Math.round(origin.lat * 10), Math.round(origin.lng * 10)]);
  useEffect(() => {
    if (!map.current) return;
    const group = L.layerGroup().addTo(map.current);
    const m = map.current;
    const list =
      mode === "explore"
        ? navigating
          ? selected
            ? [selected]
            : []
          : [
              ...visiblePlaces,
              ...(selected && !visiblePlaces.some((p) => p.id === selected.id)
                ? [selected]
                : []),
            ]
        : [];
    const buckets = new Map<string, MapPlace[]>();
    list.forEach((p) => {
      const point = m.project(
        [p.coordinates.lat, p.coordinates.lng],
        m.getZoom(),
      );
      const key = [selected?.id, next?.id, currentId].includes(p.id)
        ? p.id
        : `${Math.floor(point.x / 170)}:${Math.floor(point.y / 65)}`;
      buckets.set(key, [...(buckets.get(key) || []), p]);
    });
    buckets.forEach((items) => {
      const p = items[0];
      const label =
        items.length > 1 ? String(items.length) : symbols[p.category];
      const tab=document.createElement('div');tab.className='sm-place-tab';
      if(items.length===1){
        const photoUrl = p.images?.[0] || 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=100&auto=format&fit=crop&q=80';
        const img=document.createElement('img');img.src=photoUrl;img.alt=p.name;img.onerror=()=>{img.style.display='none';};tab.append(img);
      }
      const title=document.createElement('span');title.textContent=items.length>1?`${items.length} nearby places`:p.name;tab.append(title);
      if(items.length===1&&p.ratingSource==='google'){const rating=document.createElement('small');rating.textContent=`★ ${p.rating?.toFixed(1)}`;tab.append(rating);}
      const marker = L.marker([p.coordinates.lat, p.coordinates.lng], {
        icon: L.divIcon({
          className: `sm-marker sm-named-marker ${p.id === selected?.id ? "selected" : ""} ${p.id === next?.id ? "next" : ""} ${p.id === currentId ? "current" : ""} ${tripPlaces.some((t) => t.id === p.id) && p.id !== next?.id && p.id !== currentId ? "future" : ""}`,
          html: tab,
          iconSize: [170, 48],
          iconAnchor: [85, 48],
        }),
        title: items.length > 1 ? `${items.length} places` : p.name,
      }).addTo(group);
      marker.on("click", () =>
        items.length > 1
          ? m.setView(marker.getLatLng(), m.getZoom() + 2)
          : pick(p),
      );
    });
    if (mode === "safety") {
      const hs = hotspots.filter((h) =>
        m.getBounds().pad(0.2).contains([h.coordinates.lat, h.coordinates.lng]),
      );
      if (hs.length)
        (L as any)
          .heatLayer(
            hs.map((h) => [
              h.coordinates.lat,
              h.coordinates.lng,
              Math.min(0.85, h.weight / 20),
            ]),
            {
              radius: 48,
              blur: 35,
              maxZoom: 16,
              minOpacity: 0.15,
              gradient: {
                0.2: "#b9cc94",
                0.5: "#e8bc66",
                0.8: "#d88458",
                1: "#bb503e",
              },
            },
          )
          .addTo(group);
      const bins = new Map<string, SafetyHotspot[]>();
      const clusteredReports =
        m.getZoom() >= 17
          ? hs.flatMap((h) =>
              h.reports.map((r) => ({
                ...h,
                id: r.id,
                coordinates: r.coordinates,
                reports: [r],
                confidence: "Limited Data" as const,
              })),
            )
          : hs;
      clusteredReports.forEach((h) => {
        const pt = m.project(
          [h.coordinates.lat, h.coordinates.lng],
          m.getZoom(),
        );
        const key = `${Math.floor(pt.x / 65)}:${Math.floor(pt.y / 65)}`;
        bins.set(key, [...(bins.get(key) || []), h]);
      });
      bins.forEach((items) => {
        const h = items[0],
          count = items.reduce((s, x) => s + x.reports.length, 0);
        L.marker([h.coordinates.lat, h.coordinates.lng], {
          icon: L.divIcon({
            className: "sm-risk-marker",
            html: `<span>${count}</span>`,
            iconSize: [42, 36],
          }),
          title: `${count} reports`,
        })
          .addTo(group)
          .on("click", () => {
            if (items.length > 1) {
              m.setView(
                [h.coordinates.lat, h.coordinates.lng],
                m.getZoom() + 2,
              );
            } else {
              setHotspot(h);
              setSheet("hotspot");
              setExpanded(false);
            }
          });
      });
      if (selected)
        L.circleMarker([selected.coordinates.lat, selected.coordinates.lng], {
          radius: 7,
          color: "#283d39",
          fillOpacity: 1,
        }).addTo(group);
    }
    return () => {
      group.remove();
    };
  }, [
    mode,
    visiblePlaces,
    hotspots,
    viewport,
    navigating,
    selected?.id,
    next?.id,
    currentId,
  ]);
  useEffect(() => {
    if (!map.current || !location) return;

    // Calculate heading from GPS displacement if moved >= 3m
    if (lastCoordRef.current && distance(lastCoordRef.current, location) >= 3) {
      const dLng = ((location.lng - lastCoordRef.current.lng) * Math.PI) / 180;
      const lat1 = (lastCoordRef.current.lat * Math.PI) / 180;
      const lat2 = (location.lat * Math.PI) / 180;
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
      setUserHeading(Math.round(brng));
      lastCoordRef.current = location;
    } else if (!lastCoordRef.current) {
      lastCoordRef.current = location;
    }

    // Accuracy Circle Halo
    if (!userAccuracyCircle.current) {
      userAccuracyCircle.current = L.circle([location.lat, location.lng], {
        radius: Math.max(15, location.accuracy || 25),
        color: "#3B82F6",
        weight: 1.5,
        fillColor: "#3B82F6",
        fillOpacity: 0.15,
      }).addTo(map.current);
    } else {
      userAccuracyCircle.current.setLatLng([location.lat, location.lng]);
      userAccuracyCircle.current.setRadius(Math.max(15, location.accuracy || 25));
    }

    const isDriving = navigating && (transport?.id === 'car' || transport?.id === 'auto');
    const headingToUse = userHeading !== null ? userHeading : initialRouteBearing;

    // Google Maps Style Live Navigation Marker (Pulsating Blue Dot with beam by default, Car ONLY when actively driving)
    if (!userMarker.current) {
      const icon = isDriving ? createCarIcon(headingToUse, vehicleModel) : createDotIcon(userHeading);
      const marker = L.marker([location.lat, location.lng], {
        icon,
        zIndexOffset: 1500,
      }).addTo(map.current);
      marker.on("click", () => {
        if (navigating && (transport?.id === 'car' || transport?.id === 'auto')) {
          setVehiclePickerOpen((v) => !v);
        }
      });
      userMarker.current = marker;
      marker.bindPopup(isDriving ? "<b>🚗 Your Vehicle (Tap to customize)</b><br><small>GPS Live Navigation</small>" : "<b>📍 Your Location</b><br><small>Live Real-time GPS</small>");
    } else {
      userMarker.current.setLatLng([location.lat, location.lng]);
      if (isDriving) {
        const carEl = document.getElementById("sm-live-car-indicator");
        if (carEl) {
          carEl.style.transform = `rotate(${headingToUse}deg)`;
        } else if ("setIcon" in userMarker.current) {
          userMarker.current.setIcon(createCarIcon(headingToUse, vehicleModel));
        }
      } else {
        const dotEl = document.getElementById("sm-live-dot-indicator");
        if (dotEl) {
          if (userHeading !== null) {
            dotEl.style.transform = `rotate(${userHeading}deg)`;
            const beam = dotEl.querySelector(".sm-gps-heading-beam");
            if (beam) beam.classList.add("is-active");
          }
        } else if ("setIcon" in userMarker.current) {
          userMarker.current.setIcon(createDotIcon(userHeading));
        }
      }
    }

    // Live Camera Auto-Follow when navigating (like Google Maps)
    if (navigating && autoFollow && map.current) {
      map.current.panTo([location.lat, location.lng], { animate: true, duration: 0.8 });
    }

    if (navigating && selected) {
      const isArr = arrival.current.observe(
        location,
        AccessibilityService.destination(selected, wheelchair),
      );
      if (isArr) setArrived(true);
    }
  }, [location, navigating, selected, wheelchair, autoFollow, transport?.id, userHeading, initialRouteBearing, vehicleModel]);

  // Dynamically switch marker icon when navigation starts/stops or vehicle model changes
  useEffect(() => {
    if (!userMarker.current) return;
    const isDriving = navigating && (transport?.id === 'car' || transport?.id === 'auto');
    const headingToUse = userHeading !== null ? userHeading : initialRouteBearing;
    if (isDriving) {
      userMarker.current.setIcon(createCarIcon(headingToUse, vehicleModel));
      userMarker.current.bindPopup("<b>🚗 Your Vehicle (Tap to customize)</b><br><small>GPS Live Navigation</small>");
    } else {
      userMarker.current.setIcon(createDotIcon(userHeading));
      userMarker.current.bindPopup("<b>📍 Your Location</b><br><small>Live Real-time GPS</small>");
    }
  }, [navigating, transport?.id, vehicleModel]);

  // Proximity auto-arrival when remaining distance is <= 35m
  useEffect(() => {
    if (navigating && progress && progress.remaining <= 35) {
      setArrived(true);
    }
  }, [navigating, progress]);
  useEffect(() => {
    arrival.current.reset();
    setArrived(false);
  }, [selected?.id, navigating]);
  useEffect(() => {
    if (!map.current || !route) return;
    const border = L.polyline(
      route.points.map((p) => [p.lat, p.lng] as [number, number]),
      {
        color: "#1557B0",
        weight: 8,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      },
    ).addTo(map.current);
    const line = L.polyline(
      route.points.map((p) => [p.lat, p.lng] as [number, number]),
      {
        color: mode === "explore" ? "#1A73E8" : "#86674b",
        weight: 5,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        dashArray: route.demo ? "8 8" : undefined,
      },
    ).addTo(map.current);

    // Final destination symbol at the end of the route
    const destCoord = route.points[route.points.length - 1] || selected?.coordinates;
    let destMarker: L.Marker | undefined;
    if (destCoord) {
      const destName = selected?.name || "Final Destination";
      const destHtml = `
        <div class="sm-final-dest-wrap">
          <div class="sm-dest-radar-ring"></div>
          <div class="sm-dest-flag-pin">
            <span class="sm-dest-flag-icon">🏁</span>
          </div>
          <div class="sm-dest-name-pill">
            <span class="sm-dest-name-text">${destName}</span>
          </div>
        </div>
      `;
      destMarker = L.marker([destCoord.lat, destCoord.lng], {
        icon: L.divIcon({
          className: "sm-final-destination-marker",
          html: destHtml,
          iconSize: [120, 60],
          iconAnchor: [60, 56],
        }),
        zIndexOffset: 1600,
        title: `Final Destination: ${destName}`,
      }).addTo(map.current);
    }

    if (route.points.length > 1) {
      map.current.fitBounds(
        route.points.map((p) => [p.lat, p.lng] as [number, number]),
        { padding: [50, 50] }
      );
    }

    return () => {
      border.remove();
      line.remove();
      destMarker?.remove();
    };
  }, [route, mode, selected?.name, selected?.coordinates]);

  const locate = () => {
    setPermission(false);
    stopLocation.current();
    setNotice("Locating your real-time position…");
    let first = true;

    // Immediate acquisition via getCurrentPosition
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const r: LocationReading = {
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
            timestamp: p.timestamp,
          };
          setLocation(r);
          setNotice("");
          if (!focusLocation) {
            map.current?.setView([r.lat, r.lng], 15, { animate: true });
          }
        },
        (err) => {
          console.warn("Geolocation initial acquisition:", err.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }

    stopLocation.current = LocationService.watch((r) => {
      setLocation(r);
      // GPS warning removed per request
      if (first && !focusLocation) {
        map.current?.setView([r.lat, r.lng], 15);
        first = false;
      }
    }, setNotice);
  };
  const switchMode = (m: "explore" | "safety") => {
    setMode(m);
    setSheet(
      m === "explore"
        ? navigating
          ? "navigation"
          : selected
            ? "place"
            : "home"
        : "home",
    );
    setExpanded(false);
  };
  const startRoute = async (t: TransportOption) => {
    if (!selected) return;
    if (isDemoUser(currentUser)) {
      promptDemoRestriction(
        "Live GPS Turn-by-Turn Navigation",
        "Turn-by-turn live GPS navigation with voice audio alerts, real-time rerouting, and custom driving models is restricted in Demo Mode. Please sign in or create a free account to begin navigation."
      );
      return;
    }
    const generation = ++routeGeneration.current;
    setBusy(true);
    setNotice("");
    try {
      const rs = await NavigationService.routes(
        origin,
        AccessibilityService.destination(selected, wheelchair),
        t,
      );
      if (generation !== routeGeneration.current) return;
      setRoutes(rs);
      setRoute(rs[0]);
      setTransport(t);
      setNavigating(true);
      setAutoFollow(true);
      if (!location)
        setNotice(
          "Route preview from map center. Use Current location to begin GPS guidance.",
        );
      setSheet("navigation");
      setExpanded(false);
      map.current?.fitBounds(
        rs[0].points.map((p) => [p.lat, p.lng] as [number, number]),
        { paddingTopLeft: [30, 150], paddingBottomRight: [30, 260] },
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      if (generation === routeGeneration.current) setBusy(false);
    }
  };

  // Shows the transport picker bottom sheet before starting navigation
  const requestNavigation = (place?: MapPlace) => {
    const target = place || selected;
    if (!target) return;
    if (isDemoUser(currentUser)) {
      promptDemoRestriction(
        "Turn-by-Turn Route Navigation",
        "Live GPS routing, estimated time calculations, and multi-modal transport guidance are reserved for logged-in travelers. Please sign in or register to navigate."
      );
      return;
    }
    setTransportPickerTarget(target);
  };

  const handleStartCarNavigation = async (place?: MapPlace, modeId: 'bike' | 'car' | 'auto' | 'walk' | 'bus' = 'bike') => {
    const target = place || selected;
    if (!target) return;
    if (isDemoUser(currentUser)) {
      promptDemoRestriction(
        "Live Turn-by-Turn Navigation",
        "Live navigation with vehicle tracking is reserved for authenticated users. Please sign in or create an account to start your journey."
      );
      return;
    }
    if (target.id !== selected?.id) {
      setSelected(target);
    }
    const km = (distance(origin, target.coordinates) / 1000) * 1.3;
    const isHighway = km > 45;
    const speed = modeId === 'car' ? (isHighway ? 68 : 35) : modeId === 'bike' ? (isHighway ? 48 : 28) : modeId === 'auto' ? (isHighway ? 32 : 22) : modeId === 'walk' ? 4.5 : (isHighway ? 50 : 18);
    const modeName = modeId === 'car' ? 'Car / Drive' : modeId === 'bike' ? 'Bike' : modeId === 'auto' ? 'Auto-rickshaw' : modeId === 'walk' ? 'Walking' : 'Transit';
    const opt: TransportOption = {
      id: modeId,
      name: modeName,
      distance: km,
      cost: [modeId === 'walk' ? 0 : modeId === 'bike' ? 0 : 30, Math.max(40, Math.round(km * 25))],
      minutes: Math.max(2, Math.round((km / speed) * 60)),
      accessibility: 'Standard',
      available: true,
    };
    await startRoute(opt);
  };

  const confirmArrival = () => {
    if (
      !selected ||
      !arrived ||
      !location ||
      Date.now() - location.timestamp > 15000
    ) {
      setArrived(false);
      setNotice("Waiting for a fresh, accurate location reading.");
      return;
    }
    const destinationId = onArrive(selected);
    setCurrentId(destinationId);
    setSelected({ ...selected, id: destinationId });
    setNavigating(false);
    setRoute(undefined);
    setSheet("home");
    setNotice(`You're at ${selected.name}. Your next activity is ready.`);
  };
  const hotel = selected ? HotelService.get(selected.id) : undefined,
    guide = selected ? GuideService.get(selected.id) : undefined;
  return (
    <section className={`smart-map ${mode} ${navigating ? "is-navigating" : ""}`} aria-label="Smart Safety Map">
      <div
        ref={container}
        className={`sm-canvas ${pegmanDragging ? "sm-canvas-pegman-active" : ""}`}
        onDragOver={handlePegmanDragOver}
        onDragEnter={handlePegmanDragOver}
        onDragLeave={handlePegmanDragLeave}
        onDrop={handlePegmanDrop}
      />

      {/* Real-time Navigation HUD Overlay (Bottom docked on mobile, top centered on desktop) */}
      {navigating && route && (
        <div 
          className={`sm-nav-top-banner fixed z-[1200] animate-in fade-in ${isMobile ? 'slide-in-from-bottom-4' : 'slide-in-from-top-4'}`}
          style={isMobile ? { bottom: "24px", top: "auto", left: "12px", right: "12px" } : { top: "18px", bottom: "auto", left: 0, right: 0, margin: "0 auto", width: "540px", maxWidth: "calc(100vw - 32px)" }}
        >
          <div className="relative bg-white/95 backdrop-blur-2xl text-[#1F1C18] rounded-[26px] p-3 sm:p-4 shadow-[0_22px_50px_-10px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.9)_inset] border border-[#E2DBD1] flex flex-col gap-2.5 overflow-hidden">
            {/* Top Glowing Ambient Nav Bar */}
            <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#183E35] via-[#10B981] to-[#F3D997] opacity-90" />

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-3 min-w-0">
                {/* Transport mode icon pill */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#183E35] to-[#0D241F] text-white flex flex-col items-center justify-center shrink-0 shadow-md shadow-[#183E35]/25 border border-[#183E35]">
                  <span className="text-lg sm:text-xl leading-none">
                    {(transport?.id === 'bike') ? '🚴' :
                     (transport?.id === 'car') ? '🚗' :
                     (transport?.id === 'auto') ? '🛺' :
                     (transport?.id === 'walk') ? '🚶' : '🚆'}
                  </span>
                  <span className="text-[8.5px] font-black text-[#F3D997] uppercase tracking-wider leading-none mt-1">
                    {transport?.name?.split(' ')[0] || 'Drive'}
                  </span>
                </div>

                <div className="min-w-0">
                  <div 
                    className="text-xs sm:text-[14.5px] font-black truncate text-[#191715] tracking-tight leading-snug"
                    dangerouslySetInnerHTML={{ __html: progress?.direction || route.directions?.[0]?.text || `Head to ${selected?.name}` }}
                  />
                  <div className="text-[11px] sm:text-xs text-[#554E46] flex items-center gap-1.5 sm:gap-2 mt-1">
                    <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 leading-tight">
                      {progress
                        ? progress.remaining >= 1000
                          ? `${(progress.remaining / 1000).toFixed(1)} km`
                          : `${Math.round(progress.remaining)} m`
                        : `${(route.distance / 1000).toFixed(1)} km`}
                    </span>
                    <span className="text-[#D9D2C7]">•</span>
                    <span className="font-extrabold text-[#191715]">
                      {progress ? formatDuration(progress.minutes) : formatDuration(route.minutes)}
                    </span>
                    <span className="text-[#D9D2C7]">•</span>
                    <span className="truncate text-[#786E64] max-w-[130px] sm:max-w-[190px]">
                      {selected?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {(transport?.id === 'car' || transport?.id === 'auto') && (
                  <button
                    onClick={() => setVehiclePickerOpen((v) => !v)}
                    className="p-2 sm:p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] hover:bg-[#F0ECE4] text-[#1F1C18] cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center gap-1"
                    title="Change navigation vehicle model"
                  >
                    <span className="text-base sm:text-lg">
                      {vehicleModel === 'red-suv' ? '🚘' :
                       vehicleModel === 'yellow-cab' ? '🚖' :
                       vehicleModel === 'green-sports' ? '🏎️' :
                       vehicleModel === 'arrow' ? '📍' : '🚗'}
                    </span>
                  </button>
                )}
                {!autoFollow ? (
                  <button
                    onClick={() => {
                      setAutoFollow(true);
                      if (location) map.current?.setView([location.lat, location.lng], 16, { animate: true });
                    }}
                    className="px-2.5 py-1.5 sm:py-2 rounded-2xl bg-[#183E35] text-[#F3D997] font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md animate-pulse hover:bg-[#122F28]"
                    title="Resume camera following"
                  >
                    <LocateFixed size={14} />
                    <span className="hidden sm:inline">Re-center</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (location) map.current?.setView([location.lat, location.lng], 16, { animate: true });
                    }}
                    className="p-2 sm:p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] hover:bg-[#F0ECE4] text-[#1F1C18] cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95"
                    title="Center on my location"
                  >
                    <LocateFixed size={17} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setNavigating(false);
                    setRoute(undefined);
                    setSheet("place");
                  }}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#DC2626] to-[#991B1B] hover:from-[#B91C1C] hover:to-[#7F1D1D] text-white font-black text-xs sm:text-[13px] cursor-pointer shadow-[0_4px_14px_rgba(220,38,38,0.35)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.45)] border border-red-300/30 transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                  title="End active journey"
                >
                  <X size={14} className="stroke-[2.5]" />
                  <span>End Journey</span>
                </button>
              </div>
            </div>

            {/* Arrival Banner within HUD when arrived */}
            {arrived && (
              <div className="bg-[#183E35] text-white rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-md animate-in slide-in-from-top-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base sm:text-lg">🎉</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">You've arrived!</div>
                    <div className="text-[10px] sm:text-[11px] text-[#F3D997] truncate">{selected?.name}</div>
                  </div>
                </div>
                <button
                  onClick={confirmArrival}
                  className="px-3 py-1.5 bg-[#C84B31] hover:bg-[#B83E26] text-white rounded-xl font-black text-xs shadow-sm cursor-pointer transition shrink-0 ml-2"
                >
                  Confirm Arrival
                </button>
              </div>
            )}
          </div>

          {/* Floating In-Drive Vehicle Model Picker Card */}
          {vehiclePickerOpen && (
            <div className="sm-vehicle-picker-card animate-in fade-in zoom-in-95">
              <div className="sm-vehicle-picker-header">
                <div className="sm-vehicle-picker-title">Choose Driving Icon</div>
                <button
                  onClick={() => setVehiclePickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F3ECE2] flex items-center justify-center text-[#1F1C18] hover:bg-[#E8DFC8] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="sm-vehicle-picker-grid">
                {[
                  { id: 'arrow' as const, name: '3D Arrow', icon: '📍', desc: 'Google Pointer (Default)' },
                  { id: 'blue-sedan' as const, name: 'Blue Sedan', icon: '🚗', desc: 'Classic Google Sedan' },
                  { id: 'red-suv' as const, name: 'Red SUV', icon: '🚘', desc: 'Sport Utility' },
                  { id: 'yellow-cab' as const, name: 'Yellow Taxi', icon: '🚖', desc: 'City Cab' },
                  { id: 'green-sports' as const, name: 'Green Coupe', icon: '🏎️', desc: 'Performance Racer' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVehicleModel(v.id);
                      setVehiclePickerOpen(false);
                    }}
                    className={`sm-vehicle-card-btn ${vehicleModel === v.id ? 'is-active' : ''}`}
                  >
                    <span className="sm-vehicle-card-icon">{v.icon}</span>
                    <div>
                      <div className="sm-vehicle-card-name">{v.name}</div>
                      <div className="sm-vehicle-card-desc">{v.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Search & Category Bar (Hidden while actively navigating for a clean screen) */}
      {!navigating && (
        <div className="sm-top">
          <div className="flex flex-col gap-1.5 mb-1.5 sm:mb-2">
            <div className="sm-search flex-1">
              <Search size={16} />
              <input
                aria-label="Search destination or area"
                placeholder="Search Indore, squares, mandirs, food, petrol…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Google Maps Quick Discovery Chips */}
            <div className="sm-category-chips-strip">
              {[
                { label: 'Squares / Chowks', query: 'Square', icon: '📍' },
                { label: 'Temples', query: 'Mandir Temple', icon: '🛕' },
                { label: 'Food', query: 'Restaurant Cafe', icon: '🍽️' },
                { label: 'Petrol', query: 'Petrol Pump', icon: '⛽' },
                { label: 'Hospitals', query: 'Hospital', icon: '🏥' },
                { label: 'Bazaars', query: 'Bazaar Market', icon: '🛍️' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className="sm-quick-chip"
                  onClick={() => setQuery(chip.query)}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {query && (
            <div className="sm-results">
              {searchError && <p className="p-3 text-xs text-[#C84B31]">{searchError}</p>}
              {results.map((p) => {
                const distM = distance(origin, p.coordinates);
                const distStr = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${Math.round(distM)} m`;
                const isCity = distM <= 28000;
                const isNearby = distM > 28000 && distM <= 80000;
                return (
                  <div key={p.id} className="sm-result-item" onClick={() => pick(p)}>
                    <div className="sm-result-left">
                      <div className="sm-result-pin">
                        {p.category === 'Heritage' || p.name.toLowerCase().includes('mandir') || p.name.toLowerCase().includes('temple') ? '🛕' :
                         p.category === 'Food & Dining' || p.category === 'Food' ? '🍽️' :
                         p.category === 'Hotels' ? '🏨' :
                         p.name.toLowerCase().includes('square') || p.name.toLowerCase().includes('chowk') || p.name.toLowerCase().includes('circle') ? '📍' : '✨'}
                      </div>
                      <div className="sm-result-info">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="sm-result-title">{p.name}</span>
                          {isCity ? (
                            <span className="text-[9px] font-extrabold text-[#065F46] bg-[#D1FAE5] px-1.5 py-0.5 rounded-full shrink-0">In City</span>
                          ) : isNearby ? (
                            <span className="text-[9px] font-extrabold text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.5 rounded-full shrink-0">Nearby</span>
                          ) : null}
                        </div>
                        <div className="sm-result-sub">{p.description || p.category}</div>
                      </div>
                    </div>
                    <div className="sm-result-right" onClick={(e) => e.stopPropagation()}>
                      <span className="sm-result-dist">{distStr}</span>
                      <button
                        className="sm-result-nav-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCarNavigation(p, 'car');
                        }}
                        title="Start GPS car navigation"
                      >
                        🚗 Go
                      </button>
                    </div>
                  </div>
                );
              })}
              {!results.length && (
                <p className="p-3 text-xs text-[#797166]">
                  Searching Google Maps for places in your city & nearby…
                </p>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="sm-segment !m-0 !w-auto flex-1 max-w-[210px]" role="group" aria-label="Map mode">
              {(["explore", "safety"] as const).map((m) => (
                <button
                  key={m}
                  aria-pressed={mode === m}
                  onClick={() => switchMode(m)}
                >
                  {m === "explore" ? <Compass size={15} /> : <Shield size={15} />}{" "}
                  {m === "explore" ? "Explore" : "Safety"}
                </button>
              ))}
            </div>
            <div className="sm-context !m-0">
              <span>
                {mode === "explore"
                  ? weather
                    ? `${weather.temperature}°C`
                    : weatherError
                      ? ""
                      : "…"
                  : "Intel"}
              </span>
              <button
                onClick={() => {
                  setSheet("filters");
                  setExpanded(true);
                }}
              >
                <SlidersHorizontal size={13} />
                <span>{mode === "explore" ? "Filter" : "Risk"}</span>
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="sm-side">
        {mode === "explore" && (
          <PegmanButton
            className="sm-pegman"
            onActivateStreetView={openStreetView}
            onDragStateChange={setPegmanDragging}
          />
        )}
        <button
          id="sm-current-location-btn"
          aria-label="Current location"
          title="Center on My Real-time Location"
          onClick={() => {
            locate();
            if (location) {
              map.current?.setView([location.lat, location.lng], 16, { animate: true });
            }
          }}
          className={location ? "!border-blue-500 !text-blue-600 !bg-blue-50" : ""}
        >
          <LocateFixed size={20} className={location ? "text-blue-600" : ""} />
        </button>
      </div>
      {(notice || tileError || tileLoading) && (
        <div className="sm-notice" role="status">
          {notice ||
            (tileError
              ? "Map tiles unavailable. Check your connection."
              : "Loading map…")}
          {tileError && (
            <button
              onClick={() => {
                setTileError(false);
                setNotice("");
                setMapRetry((value) => value + 1);
              }}
            >
              Retry
            </button>
          )}
          <button
            aria-label="Dismiss notification"
            onClick={() => {
              setNotice("");
              setTileError(false);
              setTileLoading(false);
            }}
          >
            ×
          </button>
        </div>
      )}
      {sheet === "place" && selected && (
        <div
          className="sm-sheet-backdrop"
          onClick={() => {
            setSelected(undefined);
            setSheet("home");
            setExpanded(false);
          }}
          aria-label="Close place details"
        />
      )}
      {mode === "explore" && sheet === "home" && !navigating && !expanded && recommendedCards.length > 0 && (
        <aside
          className={`sm-place-recommendations ${!suggestionsOpen ? "is-collapsed" : ""}`}
          aria-label="Popular nearby places"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {!suggestionsOpen ? (
            !isMobile ? (
              <button
                type="button"
                className="sm-rec-desktop-trigger"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSuggestionsOpen(true);
                }}
                title="Explore Popular Places Nearby"
              >
                <div className="sm-rec-sparkle-icon-box">
                  <Sparkles size={15} className="text-[#F3D997]" />
                </div>
                <div className="sm-rec-desktop-info">
                  <span className="sm-rec-title">Popular Places</span>
                  <span className="sm-rec-subtitle">Explore nearby</span>
                </div>
                <span className="sm-rec-badge">{recommendedCards.length}</span>
                <div className="sm-rec-arrow-box">
                  <ArrowUpRight size={14} className="sm-rec-arrow" />
                </div>
              </button>
            ) : (
              <button
                type="button"
                className="sm-rec-mobile-trigger"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSuggestionsOpen(true);
                }}
                title="Explore popular places nearby"
              >
                <Sparkles size={15} className="text-[#F3D997] shrink-0" />
                <span className="sm-rec-trigger-label">Places</span>
                <span className="sm-rec-count-badge">{recommendedCards.length}</span>
              </button>
            )
          ) : (
            <>
              <div className="sm-recommendation-heading">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles size={13} className="text-[#C84B31] shrink-0" />
                  <strong className="text-xs font-black text-[#1F1C18] truncate">
                    Popular Nearby
                  </strong>
                  <span className="sm-rec-count-badge">
                    {recommendedCards.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    className="sm-rec-icon-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      nearbyOrigin.current = undefined;
                      setNearbyRetry((n) => n + 1);
                    }}
                    title="Refresh recommendations"
                  >
                    <RefreshCw size={11} />
                  </button>
                  <button
                    type="button"
                    className="sm-rec-toggle-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSuggestionsOpen(false);
                    }}
                    title="Close"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="sm-rec-zoom-hint" title="Map automatically updates places as you zoom or pan">
                <Compass size={11} className="text-[#183E35] shrink-0" />
                <span>Zoom out to explore more places</span>
              </div>
              <div className="sm-place-card-list">
                {recommendedCards.map((p) => (
                  <button
                    key={p.id}
                    className={`sm-place-card ${selected?.id === p.id ? "is-selected" : ""}`}
                    onClick={() => {
                      pick(p);
                      if (isMobile) {
                        setSuggestionsOpen(false);
                      }
                    }}
                    aria-label={`View ${p.name}`}
                  >
                    <div className="sm-place-photo">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=120&auto=format&fit=crop&q=80";
                          }}
                        />
                      ) : (
                        <span aria-hidden="true">📍</span>
                      )}
                    </div>
                    <div className="sm-place-info">
                      <strong>{p.name}</strong>
                      <div className="sm-place-badges">
                        {p.rating && (
                          <span className="sm-place-rating">★ {p.rating.toFixed(1)}</span>
                        )}
                        <span className="sm-place-dist">
                          {(distance(origin, p.coordinates) / 1000).toFixed(1)} km
                        </span>
                      </div>
                    </div>
                    <div
                      className="sm-place-quick-nav"
                      title="Navigate here"
                      onClick={(e) => {
                        e.stopPropagation();
                        pick(p);
                        if (isMobile) setSuggestionsOpen(false);
                        setSheet("commute");
                      }}
                    >
                      <ArrowUpRight size={13} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      )}
      <div 
        className={`sm-sheet ${expanded ? "expanded" : ""}`}
        style={(suggestionsOpen && isMobile) || navigating ? { display: 'none' } : undefined}
      >
        <button
          className="sm-handle"
          aria-label={expanded ? "Collapse details" : "Expand details"}
          onClick={(e) => {
            if (e.currentTarget.dataset.dragged === "true") {
              e.currentTarget.dataset.dragged = "false";
              return;
            }
            setExpanded(!expanded);
          }}
          onPointerDown={(e) => {
            e.currentTarget.dataset.y = String(e.clientY);
            e.currentTarget.dataset.dragged = "false";
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            const diff = e.clientY - Number(e.currentTarget.dataset.y);
            if (Math.abs(diff) > 25) {
              e.currentTarget.dataset.dragged = "true";
              setExpanded(diff < 0);
            }
          }}
        >
          <span />
        </button>
        {sheet !== "home" && (
          <button
            className="sm-close"
            aria-label="Close details"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSheet(
                navigating && mode === "explore" ? "navigation" : "home",
              );
              setExpanded(false);
              setSelected(undefined);
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}
        <div className="sm-sheet-content">
          {sheet === "home" && (
            <>
              {mode === "explore" ? (
                <>
                  {displayFeaturedPlace ? (
                    <div className="sm-featured-tab-card">
                      <div
                        className="sm-featured-tab-media"
                        onClick={() => {
                          pick(displayFeaturedPlace);
                          setSheet("place");
                        }}
                        title="Click to view details & photos"
                      >
                        <img
                          src={displayFeaturedPlace.images?.[0] || "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=320&auto=format&fit=crop&q=80"}
                          alt={displayFeaturedPlace.name}
                          className="sm-featured-tab-img"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=320&auto=format&fit=crop&q=80";
                          }}
                        />
                        {displayFeaturedPlace.rating && (
                          <span className="sm-featured-rating-pill">
                            ★ {displayFeaturedPlace.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="sm-featured-cat-tag">
                          {displayFeaturedPlace.category || "Discovery"}
                        </span>
                      </div>
                      <div className="sm-featured-tab-content">
                        <div className="sm-eyebrow">
                          {currentId ? "UP NEXT" : "FEATURED NEARBY"}
                        </div>
                        <h2>{displayFeaturedPlace.name}</h2>
                        <p>
                          {(distance(origin, displayFeaturedPlace.coordinates) / 1000).toFixed(1)} km · {location ? "from your location" : "from map center"}
                        </p>
                        <div className="sm-featured-actions">
                          <button
                            className="sm-primary"
                            onClick={() => {
                              pick(displayFeaturedPlace);
                              setSheet("commute");
                            }}
                          >
                            Start Journey <ArrowUpRight size={15} />
                          </button>
                          <button
                            className="sm-featured-details-btn"
                            onClick={() => {
                              pick(displayFeaturedPlace);
                              setSheet("place");
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F2EE] flex items-center justify-center text-sm shrink-0">
                          📍
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-[#1F1C18] truncate">
                            Explore {day.city || 'Nearby'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-[#797166] truncate">
                            {location ? "Live GPS active • Tap any place on map" : "Pan map or search above"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className="px-2.5 py-1 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] font-bold text-[#183E35] shrink-0 cursor-pointer"
                      >
                        {expanded ? "Collapse" : "Explore"}
                      </button>
                    </div>
                  )}
                  {expanded && (
                    <>
                      <p>
                        {currentId
                          ? `Current activity: ${allPlaces.find((p) => p.id === currentId)?.name}`
                          : "Your itinerary destinations are highlighted on the map."}
                      </p>
                      {recommendation && (
                        <div className="sm-recommendation">
                          <small>
                            {weather?.rain
                              ? "Rain nearby · an indoor alternative"
                              : "With your available time and budget"}
                          </small>
                          <h3>{recommendation.name}</h3>
                          <p>
                            {Math.round(
                              distance(origin, recommendation.coordinates),
                            )}{" "}
                            m · ₹{recommendation.entryPrice} ·{" "}
                            {recommendation.indoor ? "Indoor" : "Outdoor"}
                          </p>
                          <button onClick={() => pick(recommendation)}>
                            View alternative
                          </button>
                          <button
                            onClick={() => {
                              onAdd(
                                ItineraryService.toItem(
                                  recommendation,
                                  day.city,
                                ),
                              );
                              setNotice("Added alternative to your itinerary.");
                            }}
                          >
                            Add to Trip
                          </button>
                        </div>
                      )}
                      {selected?.heritageQR &&
                        location &&
                        distance(location, selected.coordinates) < 120 && (
                          <button onClick={() => setSheet("qr")}>
                            Scan Heritage QR
                          </button>
                        )}
                      <p>
                        {visiblePlaces.length
                          ? `${visiblePlaces.length} places in view`
                          : "No nearby places match these filters. Try another area or reset filters."}
                      </p>
                      {weatherError && (
                        <button
                          onClick={() => {
                            setWeatherError(false);
                            WeatherService.get(origin)
                              .then(setWeather)
                              .catch(() => setWeatherError(true));
                          }}
                        >
                          Retry weather
                        </button>
                      )}
                      <small>
                        Seeded listings are labelled in details. Accessibility
                        and current opening hours may need confirmation.
                      </small>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="sm-eyebrow">REPORTS, WITH CONTEXT</div>
                  <h2>
                    {visibleHotspots.length
                      ? "Know what’s been reported nearby"
                      : "No reports in this view"}
                  </h2>
                  <p>
                    {visibleHotspots.length
                      ? "Relative report concentration · last " + days + " days"
                      : "No reports does not establish that an area is safe."}
                  </p>
                  <div className="sm-legend">
                    <i /> Lower <i /> Moderate <i /> Higher reported risk
                  </div>
                  <div className="sm-actions">
                    <button
                      onClick={() => {
                        setSheet("report");
                        setExpanded(true);
                      }}
                    >
                      Report Issue
                    </button>
                    {selected && (
                      <button
                        onClick={() => {
                          setSheet("routes");
                          setExpanded(true);
                        }}
                      >
                        Compare Routes
                      </button>
                    )}
                  </div>
                  {expanded && (
                    <>
                      <p>
                        Community reports are not official alerts. Zoom in and
                        select a report cluster for evidence and fair-price
                        insights.
                      </p>
                      {visibleHotspots.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => {
                            setHotspot(h);
                            setSheet("hotspot");
                          }}
                        >
                          {h.reports.length} reports · {h.confidence}
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
          {sheet === "place" && selected && (
            <div className="sm-place-detail-card">
              {!expanded ? (
                <div 
                  className="sm-featured-tab-card" 
                  style={{ marginTop: 0, padding: 0, cursor: 'pointer' }}
                  onClick={() => setExpanded(true)}
                >
                  {selected.images[0] && (
                    <div
                      className="sm-featured-tab-media"
                      title="Click to view details & photos"
                    >
                      <img
                        src={selected.images[0]}
                        alt={selected.name}
                        className="sm-featured-tab-img"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {selected.rating && (
                        <span className="sm-featured-rating-pill">
                          ★ {selected.rating.toFixed(1)}
                        </span>
                      )}
                      <span className="sm-featured-cat-tag">
                        {selected.category}
                      </span>
                    </div>
                  )}
                  <div className="sm-featured-tab-content">
                    <div className="sm-eyebrow">
                      {selected.category}
                    </div>
                    <h2>
                      {selected.name}
                    </h2>
                    <p>
                      {(distance(origin, selected.coordinates) / 1000).toFixed(1)} km · {location ? "from your location" : "from map center"}
                    </p>
                    <div className="sm-featured-actions">
                      <button
                        className="sm-primary"
                        onClick={() => requestNavigation(selected)}
                      >
                        Start Journey <ArrowUpRight size={15} />
                      </button>
                      <button
                        className="sm-featured-details-btn"
                        onClick={() => setExpanded(true)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {selected.images[0] && (
                    <div className="sm-place-hero-container">
                      <img
                        className="sm-place-hero-img"
                        src={selected.images[0]}
                        alt={
                          selected.demo
                            ? "Illustrative destination photo"
                            : selected.name
                        }
                        onClick={() => { if (expanded) setFullscreenImage(selected.images[0]); }}
                        style={{ cursor: expanded ? 'pointer' : 'default' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="sm-place-hero-overlay">
                        <span className="sm-hero-category-tag">{selected.category}</span>
                        {selected.rating && (
                          <span className="sm-hero-rating-tag">★ {selected.rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="sm-eyebrow">
                    {selected.category}
                    {selected.demo ? " · Community listing" : ""}
                  </div>
                  <h2>{selected.name}</h2>
                  <p className="sm-place-meta">
                    ★ {selected.rating || "Unrated"} ·{" "}
                    {(distance(origin, selected.coordinates) / 1000).toFixed(1)} km
                    · {OpeningHoursService.status(selected)} · {selected.hours}
                  </p>
                  
                  <div className="sm-actions">
                    <button
                      className="sm-primary sm-action-btn"
                      onClick={() => requestNavigation(selected)}
                    >
                      <Navigation size={14} /> Start Journey
                    </button>
                    <button 
                      className="sm-btn-more-info sm-action-btn"
                      onClick={() => setExpanded(!expanded)}
                    >
                      <Sparkles size={14} /> {expanded ? "Less Info" : (guide ? "View Guide" : "Full Guide")}
                    </button>
                  </div>
                  <p className="sm-place-price">
                    {selected.entryPrice !== undefined
                      ? `₹${selected.entryPrice} entry / listed cost · `
                      : ""}
                    {selected.accessibility.wheelchair
                      ? "Ramp entrance available"
                      : "Accessibility unverified"}
                  </p>
                  {selected.description && (
                    <p className="sm-place-desc">{selected.description}</p>
                  )}
                  <div className="sm-actions">
                    <button
                      className="sm-btn-add-trip sm-action-btn"
                      onClick={() => {
                        onAdd(ItineraryService.toItem(selected, day.city));
                        setNotice("Added to your trip.");
                      }}
                    >
                      <Plus size={14} /> Add to Trip
                    </button>
                    <button 
                      className="sm-btn-street-view sm-action-btn"
                      onClick={() => openStreetView(selected.coordinates)}
                    >
                      <Compass size={14} /> Street View 360°
                    </button>
                  </div>

                  {/* Google Maps Style Directions Card */}
                  <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF9F6] to-[#FAF8F5] border border-[#EAE5DC] space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#1F1C18]">
                    <Navigation size={14} className="text-[#C84B31]" />
                    <span>Real-time Directions (Google Maps Style)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C84B31]/10 text-[#C84B31]">
                    {location ? "Live GPS" : "Map Center"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8] ring-2 ring-blue-100 shrink-0"></span>
                    <span className="text-[#554E46] font-medium truncate">
                      From: <strong>{location ? "My Current Location" : "Map Center"}</strong>
                    </span>
                  </div>
                  <div className="ml-1 w-0.5 h-2 bg-[#D9D2C7]"></div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C84B31] ring-2 ring-red-100 shrink-0"></span>
                    <span className="text-[#1F1C18] font-bold truncate">
                      To: <strong>{selected.name}</strong>
                    </span>
                  </div>
                </div>

                {/* Transport Mode Options - Car is Default */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'car', label: 'Drive', icon: '🚗' },
                    { id: 'auto', label: 'Auto', icon: '🛺' },
                    { id: 'walk', label: 'Walk', icon: '🚶' },
                    { id: 'bus', label: 'Transit', icon: '🚆' },
                  ].map((m) => {
                    const isSelected = (transport?.id || 'car') === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleStartCarNavigation(selected, m.id as any)}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer shadow-2xs ${
                          isSelected
                            ? 'bg-[#C84B31] text-white border border-[#C84B31] shadow-xs'
                            : 'bg-white border border-[#EAE5DC] text-[#1F1C18] hover:bg-[#FAF8F5] hover:border-[#D6CEC3]'
                        }`}
                      >
                        <span className="text-sm">{m.icon}</span>
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Direct Google Maps Route Link */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${selected.coordinates.lat},${selected.coordinates.lng}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#EAE5DC] hover:bg-[#FAF8F5] hover:border-[#C84B31] text-[#1F1C18] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ExternalLink size={13} className="text-[#C84B31]" />
                  <span>Open Route in Google Maps App</span>
                </a>
              </div>
                  <p>
                    Facilities: {selected.accessibility.ramp ? "Ramp · " : ""}
                    {selected.accessibility.toilet
                      ? "Accessible toilet · "
                      : ""}
                    {selected.accessibility.elevator
                      ? "Elevator"
                      : "Elevator unverified"}
                  </p>
                  {hotel && (
                    <>
                      <h3>Stay with context</h3>
                      <p>{hotel.priceCategory}</p>
                      <p>
                        {hotel.trust} · Photos updated {hotel.updatedAt}
                      </p>
                      <p>{hotel.complaints}</p>
                    </>
                  )}
                  {guide && (
                    <>
                      <h3>Verified Heritage Guide</h3>
                      <p>
                        {guide.languages.join(" • ")} · {guide.specialization}
                      </p>
                      <p>
                        ₹{guide.pricePerHour}/hour · {guide.availability}
                      </p>
                    </>
                  )}
                  {wheelchair && (
                    <p>
                      The ramp entrance is prioritized. Step-free route
                      availability must be confirmed.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          {sheet === "filters" && (
            <>
              <div className="sm-eyebrow">
                {mode === "explore"
                  ? "MAKE IT YOUR JOURNEY"
                  : "COMMUNITY EVIDENCE"}
              </div>
              <h2>{mode === "explore" ? "Explore filters" : "Risk Filter"}</h2>
              {mode === "explore" ? (
                <>
                  <label>
                    Time available (minutes)
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={minutesAvailable}
                      onChange={(e) =>
                        setMinutesAvailable(
                          Math.max(15, Number(e.target.value)),
                        )
                      }
                    />
                  </label>
                  <label>
                    Remaining budget (₹)
                    <input
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) =>
                        setBudget(Math.max(0, Number(e.target.value)))
                      }
                    />
                  </label>
                  <div className="sm-filter-grid">
                    {categories.map((c) => (
                      <button
                        key={c}
                        aria-pressed={filter.includes(c)}
                        onClick={() =>
                          setFilter((f) =>
                            f.includes(c)
                              ? f.filter((x) => x !== c)
                              : [...f, c],
                          )
                        }
                      >
                        {symbols[c]} {c}
                      </button>
                    ))}
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={wheelchair}
                      onChange={(e) => setWheelchair(e.target.checked)}
                    />{" "}
                    Prioritize wheelchair-accessible entrances
                  </label>
                  <button
                    onClick={() => {
                      setFilter([]);
                      setWheelchair(false);
                    }}
                  >
                    Reset filters
                  </button>
                </>
              ) : (
                <>
                  <div className="sm-filter-grid">
                    {[
                      "All Relevant Reports",
                      "Scam Reports",
                      "Overcharging",
                      "Theft Reports",
                      "Safety Incidents",
                    ].map((f) => (
                      <button
                        key={f}
                        aria-pressed={riskFilter === f}
                        onClick={() => setRiskFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <label>
                    Report period
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                    >
                      <option value={1}>Last 24 Hours</option>
                      <option value={7}>Last 7 Days</option>
                      <option value={30}>Last 30 Days</option>
                    </select>
                  </label>
                  <p>
                    Recent reports receive more weight. A single unverified
                    report remains limited evidence.
                  </p>
                </>
              )}
              <button
                className="sm-primary"
                onClick={() => {
                  setSheet("home");
                  setExpanded(false);
                }}
              >
                Show on map
              </button>
            </>
          )}
          {sheet === "commute" && selected && (
            <>
              <div className="sm-eyebrow">HOW WOULD YOU LIKE TO GO?</div>
              <h2>To {selected.name}</h2>
              <p>
                {location
                  ? "From your current location"
                  : "Preview from map center. Enable location for navigation and arrival detection."}
              </p>
              <p>
                Estimated fares · Walking and bus route previews may vary.
                Transit schedules are not connected.
              </p>
              {!location && (
                <button
                  onClick={() => {
                    const c = map.current?.getCenter();
                    if (c) {
                      setManualOrigin({ lat: c.lat, lng: c.lng });
                      setNotice("Route start set to the map center.");
                    }
                  }}
                >
                  Use map center as starting point
                </button>
              )}
              {TransportService.compare(
                origin,
                AccessibilityService.destination(selected, wheelchair),
                weather,
              ).map((t) => (
                <button
                  className="sm-transport"
                  key={t.id}
                  disabled={busy || !t.available}
                  onClick={() => startRoute(t)}
                >
                  <span>
                    <b>{t.name}</b>
                    <small>{t.recommended || t.accessibility}</small>
                  </span>
                  <span>
                    {t.available ? formatDuration(t.minutes) : "Unavailable"}
                    <small>
                      ₹{t.cost[0]}
                      {t.cost[1] !== t.cost[0] ? `–₹${t.cost[1]}` : ""}
                    </small>
                  </span>
                </button>
              ))}
              {busy && <p role="status">Finding routes…</p>}
            </>
          )}
          {sheet === "navigation" && route && (
            <>
              <div className="sm-eyebrow">
                {route.demo ? "ROUTE PREVIEW" : transport?.name} ·{" "}
                {progress
                  ? progress.remaining >= 1000
                    ? `${(progress.remaining / 1000).toFixed(1)} km`
                    : `${Math.round(progress.remaining)} m`
                  : `${Math.round(route.distance / 100) / 10} km`}{" "}
                remaining
              </div>
              <h2>
                {route.demo
                  ? "Route preview only"
                  : progress?.direction ||
                    "Continue toward your destination"}
              </h2>
              <p>
                {formatDuration(progress ? progress.minutes : route.minutes)} estimated ·{" "}
                {selected?.name}
              </p>
              {route.demo && (
                <p>
                  Dashed line is a route preview; follow local signs or a
                  supported navigation provider.
                </p>
              )}
              <div className="sm-actions">
                {transport?.id === "walk" && (
                  <button onClick={() => setAR(true)}>AR View</button>
                )}
                <button
                  onClick={() => {
                    setSheet("routes");
                    setExpanded(true);
                  }}
                >
                  Route details
                </button>
                <button
                  onClick={() => {
                    setNavigating(false);
                    setRoute(undefined);
                    setSheet("home");
                  }}
                >
                  End journey
                </button>
              </div>
              {arrived && (
                <button className="sm-primary" onClick={confirmArrival}>
                  It looks like you’ve reached {selected?.name}. Mark as Arrived
                </button>
              )}
              {routeRisk && routeRisk.recentReports > 1 && (
                <button
                  className="sm-advisory"
                  onClick={() => switchMode("safety")}
                >
                  <b>Tourism advisory ahead</b>
                  <small>
                    Multiple recent reports near this route. View in Safety Map
                    →
                  </small>
                </button>
              )}
            </>
          )}
          {sheet === "routes" && (
            <>
              <div className="sm-eyebrow">
                {mode === "safety" ? "ROUTE CHECK" : "JOURNEY OPTIONS"}
              </div>
              <h2>Choose with context</h2>
              {!routes.length ? (
                <>
                  <p>
                    Choose transport first to load candidate routes for{" "}
                    {selected?.name}.
                  </p>
                  <button
                    onClick={() => {
                      setMode("explore");
                      setSheet("commute");
                    }}
                  >
                    Choose transport
                  </button>
                </>
              ) : (
                routes.map((r, i) => (
                  <div className="sm-route" key={r.id}>
                    <h3>
                      Route {String.fromCharCode(65 + i)} · {formatDuration(r.minutes)}
                    </h3>
                    <p>
                      {(r.distance / 1000).toFixed(1)} km
                      {r.demo ? " · schematic preview" : ""}
                    </p>
                    {mode === "safety" && (
                      <p>{SafetyService.route(r, activeReports).description}</p>
                    )}
                    <button
                      onClick={() => {
                        setRoute(r);
                        setSheet(mode === "explore" ? "navigation" : "home");
                        setExpanded(false);
                      }}
                    >
                      Use this route
                    </button>
                  </div>
                ))
              )}
              {mode === "safety" && (
                <p>
                  Counts reflect seeded reports, coverage and recency; fewer
                  reports do not guarantee safety.
                </p>
              )}
            </>
          )}
          {sheet === "hotspot" && hotspot && (
            <>
              <div className="sm-eyebrow">FREQUENT REPORTS</div>
              <h2>{hotspot.reports[0].category}</h2>
              <p>
                {hotspot.reports.length} reports · Last {days} days ·{" "}
                {hotspot.confidence}
              </p>
              <p>
                Most recent:{" "}
                {new Date(
                  Math.max(...hotspot.reports.map((r) => r.timestamp)),
                ).toLocaleDateString()}
              </p>
              {expanded && (
                <>
                  <h3>Fair Price Insights</h3>
                  <p>Local guide / hour · community sample</p>
                  {prices && (
                    <>
                      <h2>
                        ₹{prices.range[0]}–₹{prices.range[1]}
                      </h2>
                      <p>
                        Based on {prices.count} reports · {prices.confidence} ·
                        Updated {new Date(prices.latest).toLocaleDateString()}
                      </p>
                      <p>
                        {prices.outliers.map((x) => `₹${x}`).join(", ")} ·
                        unusual reported price
                      </p>
                    </>
                  )}
                  <p>Community range, not an official tariff.</p>
                  {hotspot.reports.slice(0, 8).map((r) => (
                    <article key={r.id}>
                      <h3>{r.category}</h3>
                      <p>{r.description}</p>
                      <small>
                        {new Date(r.timestamp).toLocaleDateString()} ·{" "}
                        {r.validations} validations
                      </small>
                      <div className="sm-actions">
                        {["Useful", "Experienced Similar Issue"].map((v) => (
                          <button
                            key={v}
                            disabled={r.votes?.includes(v)}
                            onClick={async () => {
                              try {
                                await CommunityReportService.validate(r.id, v);
                                const updated = CommunityReportService.list();
                                setReports(updated);
                                setHotspot(
                                  RiskAggregationService.aggregate(
                                    updated,
                                    days,
                                  ).find((h) =>
                                    h.reports.some(
                                      (report) => report.id === r.id,
                                    ),
                                  ),
                                );
                              } catch {
                                setNotice(
                                  "Validation was not saved. Sign in, and confirm a shared report you did not create.",
                                );
                              }
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </>
              )}
              <button onClick={() => setExpanded(!expanded)}>
                {expanded ? "Less detail" : "Evidence & fair prices"}{" "}
                <ChevronUp size={14} />
              </button>
            </>
          )}
          {sheet === "report" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isDemoUser(currentUser)) {
                  promptDemoRestriction(
                    "Community Incident Reporting",
                    "Submitting public safety alerts, scam reports, and verified reviews requires a registered account. Please sign in or register to submit a report."
                  );
                  return;
                }
                if (reportLocation === "gps" && !location) {
                  setNotice("Enable location or choose map center.");
                  return;
                }
                try {
                  await CommunityReportService.submit({
                    id: crypto.randomUUID(),
                    category: reportCategory,
                    coordinates:
                      reportLocation === "gps"
                        ? location!
                        : {
                            lat: center?.lat ?? 26.9258,
                            lng: center?.lng ?? 75.8237,
                          },
                    description: description.trim(),
                    timestamp: Date.now(),
                    validations: 0,
                    reliability: 0.2,
                    evidence,
                    demo: true,
                  });
                  setReports(CommunityReportService.list());
                  setDescription("");
                  setEvidence(undefined);
                  setSheet("home");
                  setExpanded(false);
                  setNotice(
                    "Report saved. Public location rounded to approximately 1 km.",
                  );
                } catch (e) {
                  setNotice((e as Error).message);
                }
              }}
            >
              <h2>Report an issue</h2>
              <p>
                Your public location is rounded. Avoid names or personal
                information.
              </p>
              <label>
                Category
                <select
                  value={reportCategory}
                  onChange={(e) =>
                    setReportCategory(e.target.value as ReportCategory)
                  }
                >
                  {reportCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <select
                  value={reportLocation}
                  onChange={(e) => {
                    setReportLocation(e.target.value as "center" | "gps");
                    if (e.target.value === "gps" && !location)
                      setPermission(true);
                  }}
                >
                  <option value="center">Selected map center</option>
                  <option value="gps">
                    Current location (with permission)
                  </option>
                </select>
              </label>
              <label>
                Description
                <textarea
                  required
                  minLength={12}
                  maxLength={1200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened?"
                />
              </label>
              <label>
                Optional photo (up to 1 MB)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 1000000 || !f.type.startsWith("image/")) {
                      setNotice("Choose an image under 1 MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setEvidence(String(reader.result));
                    reader.readAsDataURL(f);
                  }}
                />
              </label>
              <button className="sm-primary" type="submit">
                Submit report
              </button>
            </form>
          )}
          {sheet === "qr" && (
            <>
              <h2>Heritage QR</h2><QRScanner onCode={code=>{setQR(code);if(code===selected?.heritageQR)setQROpen(true);}}/>
              <p>Enter YATRA:palace to open the heritage story.</p>
              <input
                aria-label="Heritage QR code"
                value={qr}
                onChange={(e) => setQR(e.target.value)}
              />
              <button
                onClick={() =>
                  qr === selected?.heritageQR
                    ? setQROpen(true)
                    : setNotice("This QR code is not recognized.")
                }
              >
                Read QR
              </button>
              {qrOpen && (
                <>
                  <h3>City Palace, Jaipur</h3>
                  <label>
                    Language
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en-IN">English</option>
                      <option value="hi-IN">हिन्दी</option>
                    </select>
                  </label>
                  <p>
                    {language === "en-IN"
                      ? "Explore the courtyards and craftsmanship of Jaipur’s City Palace."
                      : "जयपुर के सिटी पैलेस के आंगनों और शिल्पकला को जानें।"}
                  </p>
                  <button
                    onClick={() => {
                      if (!window.speechSynthesis) {
                        setNotice("Audio unavailable on this device.");
                        return;
                      }
                      const s = new SpeechSynthesisUtterance(
                        language === "en-IN"
                          ? "Explore the courtyards and craftsmanship of Jaipur’s City Palace."
                          : "जयपुर के सिटी पैलेस के आंगनों और शिल्पकला को जानें।",
                      );
                      s.lang = language;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(s);
                    }}
                  >
                    Play audio guide
                  </button>
                  <button onClick={() => window.speechSynthesis?.cancel()}>
                    Stop audio
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {permission && (
        <div className="sm-dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-label="Use your location">
            <h2>A little help finding your way</h2>
            <p>
              Location places you on the map and supports navigation and arrival
              detection. Movement history is not shared. You can continue
              browsing manually.
            </p>
            <button className="sm-primary" onClick={locate}>
              Use my location
            </button>
            <button onClick={() => setPermission(false)}>
              Browse manually
            </button>
          </div>
        </div>
      )}
      {streetView && (
        <StreetViewModal
          isOpen
          onClose={() => setStreetView(undefined)}
          location={streetView}
        />
      )}
      {ar && (
        <ARView accuracy={location?.accuracy} direction={route ? navigationProgress(route,location).direction : undefined} remaining={route ? navigationProgress(route,location).remaining : undefined} onClose={() => setAR(false)} />
      )}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-white/15 hover:bg-white/30 rounded-full text-white transition-colors cursor-pointer backdrop-blur-sm border border-white/20"
            onClick={() => setFullscreenImage(null)}
          >
            <X size={20} />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen view" 
            style={{ width: '95vw', height: '90vh', objectFit: 'contain' }}
            className="rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {transportPickerTarget && (
        <div
          className="fixed inset-0 z-[99998] flex items-end justify-center"
          onClick={() => setTransportPickerTarget(null)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* bottom sheet */}
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 shadow-[0_-8px_40px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* handle bar */}
            <div className="w-10 h-1 bg-[#D9D2C7] rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-2 mb-1">
              <Navigation size={16} className="text-[#C84B31]" />
              <p className="text-xs font-bold text-[#C84B31] uppercase tracking-wider">Start Journey To</p>
            </div>
            <h2 className="text-lg font-extrabold text-[#1F1C18] mb-5 truncate">{transportPickerTarget.name}</h2>
            <p className="text-xs text-[#A8A199] font-bold uppercase tracking-wider mb-3">Choose your mode of transport</p>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {(() => {
                const targetKm = (distance(origin, transportPickerTarget.coordinates) / 1000) * 1.3;
                const isHwy = targetKm > 45;
                const modes = [
                  { id: 'bike' as const, icon: '🚴', label: 'Bike', speed: isHwy ? 48 : 28 },
                  { id: 'car' as const, icon: '🚗', label: 'Drive', speed: isHwy ? 68 : 35 },
                  { id: 'auto' as const, icon: '🛺', label: 'Auto', speed: isHwy ? 32 : 22 },
                  { id: 'walk' as const, icon: '🚶', label: 'Walk', speed: 4.5 },
                  { id: 'bus' as const, icon: '🚆', label: 'Transit', speed: isHwy ? 50 : 18 },
                ];
                return modes.map((m) => {
                  const estMins = Math.max(2, Math.round((targetKm / m.speed) * 60));
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        handleStartCarNavigation(transportPickerTarget, m.id);
                        setTransportPickerTarget(null);
                      }}
                      className="flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 border-[#EAE5DC] bg-[#FAF8F5] hover:border-[#183E35] hover:bg-[#E8F2EE] active:scale-95 transition-all cursor-pointer group"
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <span className="text-[11px] font-bold text-[#1F1C18] group-hover:text-[#183E35]">{m.label}</span>
                      <span className="text-[9px] font-bold text-[#183E35] bg-[#E8F2EE] px-1.5 py-0.5 rounded-md">{formatDuration(estMins)}</span>
                    </button>
                  );
                });
              })()}
            </div>
            <button
              className="w-full py-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] text-[#554E46] text-sm font-bold hover:bg-[#F0ECE4] transition-colors cursor-pointer"
              onClick={() => setTransportPickerTarget(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
