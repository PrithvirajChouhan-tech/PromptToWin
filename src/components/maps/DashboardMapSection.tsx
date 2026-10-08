import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import {
  MapPin,
  Navigation,
  Locate,
  LocateFixed,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Maximize2,
  Minimize2,
  Shield,
  Store,
  Building,
  Users,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  IndianRupee,
  PhoneCall,
  Sparkles,
  Eye,
  ExternalLink,
  RotateCw,
  Landmark,
  Utensils,
  ShoppingBag,
  Train,
  ShieldAlert,
  Flame,
  Search,
  AlertOctagon,
  Radio,
  ShieldCheck,
  Camera,
  Scan,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { AppEntity } from "../../types/entity";
import { AuthUser } from "../../types/auth";
import { Trip, ItineraryItem } from "../../types/travel";
import { RiskZone } from "../../types/trustEngine";
import {
  FAMOUS_LOCATION_PRESETS,
  LocationPreset,
  calculateDistanceKm,
  formatDistance,
  generateRoute,
  RouteResult,
} from "../../utils/navigationEngine";
import {
  AUTHORITY_HERITAGE_REPORTS,
  INITIAL_BUSINESS_PROFILE,
} from "../../data/ecosystemData";
import { LIVE_RISK_ZONES } from "../../data/trustEngineData";
import {
  getMapTileConfig,
  MAP_STYLE_OPTIONS,
  GoogleMapStyleType,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsLocationUrl,
} from "../../utils/mapsConfig";
import { MapSearchTab } from "./explore/MapSearchTab";
import { PegmanButton } from "./explore/PegmanButton";
import { StreetViewModal } from "./explore/StreetViewModal";
import { ComputeRoutesDrawer } from "./explore/ComputeRoutesDrawer";
import { DynamicMapsPicker } from "./explore/DynamicMapsPicker";
import { PlacesUIKitCard } from "./explore/PlacesUIKitCard";
import { WeatherOverlayWidget } from "./explore/WeatherOverlayWidget";
import { MapsGroundingLiteModal } from "./explore/MapsGroundingLiteModal";
import {
  RouteOption,
  PlaceEntity,
  GeocodedLocation,
  reverseGeocode,
} from "../../services/mapPlatformService";

export type DashboardMapMode = "explore" | "safety";

interface DashboardMapSectionProps {
  role: AppEntity;
  currentUser?: AuthUser | null;
  currentTrip?: Trip;
  selectedDayIndex?: number;
  onOpenSOS?: () => void;
  className?: string;
  defaultExpanded?: boolean;
  initialMode?: DashboardMapMode;
}

export const DashboardMapSection: React.FC<DashboardMapSectionProps> = ({
  role,
  currentUser,
  currentTrip,
  selectedDayIndex = 0,
  onOpenSOS,
  className = "",
  defaultExpanded = false,
  initialMode = "explore",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zoneLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const [mapMode, setMapMode] = useState<DashboardMapMode>(
    initialMode === "safety" ? "safety" : "explore",
  );
  const [isSatellite, setIsSatellite] = useState(false);
  const [selectedRiskZone, setSelectedRiskZone] = useState<RiskZone | null>(
    null,
  );
  const [mapStyle, setMapStyle] =
    useState<GoogleMapStyleType>("google-streets");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<any | null>(
    null,
  );

  // Navigation Target & Modes (Normal Route Navigation & AR Navigation)
  const [navigationTarget, setNavigationTarget] = useState<{
    title: string;
    subtitle?: string;
    coords: { lat: number; lng: number };
  } | null>(null);
  const [showNavigationChoiceModal, setShowNavigationChoiceModal] =
    useState(false);
  const [activeNavType, setActiveNavType] = useState<"none" | "normal" | "ar">(
    "none",
  );
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Default place for Places UI Kit (ALWAYS ON directly on Explore Map)
  const defaultPlace: PlaceEntity = useMemo(
    () => ({
      id: "default-aqua-vieja",
      title: "Aqua Vieja Heritage Restaurant",
      subtitle: "North Indian, Mughlai & Kashmiri Delicacies",
      category: "food",
      categoryLabel: "Restaurant",
      lat: 28.6534,
      lng: 77.2336,
      rating: 4.6,
      reviewsCount: 874,
      priceLevel: "$$",
      isOpen: true,
      openHoursText: "Open Now • Closes 11:00 PM",
      address: "24 Fort Gate Way, Near Central Chowk, Old Delhi",
      phone: "+91 11 2386 4920",
      website: "https://aquavieja-demo.in",
      photos: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      ],
      accessibility: {
        isWheelchairAccessible: true,
        hasAccessibleEntrance: true,
        hasAccessibleRestroom: true,
        hasAccessibleParking: true,
        hasAccessibleSeating: true,
      },
      tags: [
        "Dine-in",
        "Outdoor seating",
        "FSSAI Clean Food",
        "Live Sitar Music",
      ],
      reviews: [
        {
          author: "Priya Sharma",
          rating: 5,
          text: "Super accessible ramp entrance and spotless facilities. Staff was incredibly polite and knowledgeable!",
          timeAgo: "2 days ago",
        },
      ],
    }),
    [],
  );

  // ── Explore Map Google Maps Layout State ──
  const [selectedPlaceEntity, setSelectedPlaceEntity] =
    useState<PlaceEntity>(defaultPlace);
  const [isPlacesCardOpen, setIsPlacesCardOpen] = useState(false);
  const [showComputeRoutes, setShowComputeRoutes] = useState(false);
  const [showDynamicMapsPicker, setShowDynamicMapsPicker] = useState(false);
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false);
  const [streetViewLocation, setStreetViewLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
    address?: string;
  }>({
    lat: 28.6534,
    lng: 77.2336,
    name: "Aqua Vieja Heritage Restaurant",
    address: "24 Fort Gate Way, Near Central Chowk, Old Delhi",
  });
  const [isGroundingAIOpen, setIsGroundingAIOpen] = useState(false);
  const [activePlatformRoute, setActivePlatformRoute] =
    useState<RouteOption | null>(null);
  const platformRoutePolylineRef = useRef<L.Polyline | null>(null);
  const [weatherBrief, setWeatherBrief] = useState("28°C, Partly Sunny");

  // AR Navigation State & Camera Management
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [arHeading, setArHeading] = useState(342);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isPegmanDragging, setIsPegmanDragging] = useState(false);

  // Sync Satellite toggle with tile layer style for both Explore and Safety modes
  useEffect(() => {
    setMapStyle(isSatellite ? "google-hybrid" : "google-streets");
  }, [isSatellite]);

  const speakTurnPrompt = (text: string) => {
    if ("speechSynthesis" in window && isVoiceActive) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.lang = "en-IN";
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraActive(false);
        setCameraError(
          "Camera API not available on this browser. Switched to simulated 3D AR view.",
        );
        return;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {}
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access denied or unavailable:", err);
      setIsCameraActive(false);
      setCameraError(
        "Camera permission denied or camera in use. Switched to high-fidelity simulated 3D AR mode.",
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Ensure video element receives stream once mounted
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  const handleOpenNavigateModal = (target: {
    title: string;
    subtitle?: string;
    coords: { lat: number; lng: number };
  }) => {
    setNavigationTarget(target);
    setShowNavigationChoiceModal(true);
  };

  const startNavigation = (type: "normal" | "ar") => {
    if (!navigationTarget) return;

    const route = generateRoute(
      {
        lat: userCoords.lat,
        lng: userCoords.lng,
        name: userCoords.locationName,
      },
      {
        lat: navigationTarget.coords.lat,
        lng: navigationTarget.coords.lng,
        name: navigationTarget.title,
      },
      "walk",
    );

    setActiveRoute(route);
    setActiveNavType(type);
    setShowNavigationChoiceModal(false);

    if (type === "ar") {
      const firstStep =
        route.steps[0]?.instruction ||
        `Navigate towards ${navigationTarget.title}`;
      speakTurnPrompt(
        `Starting AR Navigation. ${firstStep}. Total distance ${route.totalDistanceKm} kilometers.`,
      );
    }
  };

  const stopNavigation = () => {
    setActiveNavType("none");
    setActiveRoute(null);
    setNavigationTarget(null);
    stopCamera();
    if (routePolylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
  };

  // Sync 2D Route Polyline on Leaflet map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (
      activeNavType === "normal" &&
      activeRoute &&
      activeRoute.polyline.length > 0
    ) {
      const polyline = L.polyline(activeRoute.polyline, {
        color: "#0284C7",
        weight: 6,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      routePolylineRef.current = polyline;

      const bounds = polyline.getBounds();
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [activeNavType, activeRoute]);

  // Sync Platform Route Polyline on Leaflet map (Compute Routes feature)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (platformRoutePolylineRef.current) {
      map.removeLayer(platformRoutePolylineRef.current);
      platformRoutePolylineRef.current = null;
    }

    if (activePlatformRoute && activePlatformRoute.polyline.length > 0) {
      const color =
        activePlatformRoute.mode === "walking"
          ? "#10B981"
          : activePlatformRoute.mode === "transit"
            ? "#8B5CF6"
            : activePlatformRoute.mode === "motorcycle"
              ? "#F59E0B"
              : "#0284C7";

      const polyline = L.polyline(activePlatformRoute.polyline, {
        color,
        weight: 6,
        opacity: 0.9,
        dashArray: activePlatformRoute.mode === "walking" ? "6, 8" : undefined,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      platformRoutePolylineRef.current = polyline;

      const bounds = polyline.getBounds();
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    }
  }, [activePlatformRoute]);

  // Reverse geocoding map click handler
  const handleMapClickInspect = async (lat: number, lng: number) => {
    try {
      const geo = await reverseGeocode(lat, lng);
      const clickedPlace: PlaceEntity = {
        id: `place-${Date.now()}`,
        title: geo.name || "Selected Location",
        subtitle: geo.displayName || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        category: "landmark",
        categoryLabel: "Point of Interest",
        lat,
        lng,
        rating: 4.8,
        reviewsCount: 382,
        priceLevel: "$$",
        isOpen: true,
        openHoursText: "Open • Public Access",
        address: geo.displayName || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        photos: [
          "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop&q=80",
        ],
        accessibility: {
          isWheelchairAccessible: true,
          hasAccessibleEntrance: true,
          hasAccessibleRestroom: true,
          hasAccessibleParking: true,
          hasAccessibleSeating: true,
        },
        tags: [
          "Heritage Sight",
          "Google Maps Grounded",
          "Wheelchair Accessible",
        ],
        reviews: [
          {
            author: "Verified Traveler",
            rating: 5,
            text: "Spectacular location with easy accessibility from the main gate.",
            timeAgo: "Recently",
          },
        ],
      };
      setSelectedPlaceEntity(clickedPlace);

      if (mapInstanceRef.current && markersLayerRef.current) {
        const inspectIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] shadow-xl border-2 border-white flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>${geo.name}</span>
            </div>
            <div class="w-2.5 h-2.5 bg-rose-600 border-r border-b border-white rotate-45 mx-auto -mt-1 shadow-sm"></div>
          </div>
        `;

        const inspectIcon = L.divIcon({
          className: "geocoded-pin-marker",
          html: inspectIconHtml,
          iconSize: [140, 45],
          iconAnchor: [70, 45],
        });

        L.marker([lat, lng], { icon: inspectIcon }).addTo(
          markersLayerRef.current,
        );
        mapInstanceRef.current.panTo([lat, lng]);
      }
    } catch (err) {
      console.warn("Map inspect error:", err);
    }
  };

  // Place selection handler (from search tab, markers, etc.)
  const handleSelectPlaceEntity = (place: PlaceEntity) => {
    setSelectedPlaceEntity(place);
    setIsPlacesCardOpen(true);
    setSelectedEntityInfo(null);

    if (mapInstanceRef.current && markersLayerRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 16, { duration: 1 });

      const placeIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191715] text-white font-extrabold text-xs shadow-2xl border-2 border-white ring-4 ring-[#0284C7]/40 scale-110">
            <span class="w-2 h-2 rounded-full bg-[#3B82F6] animate-ping"></span>
            <span class="truncate max-w-[130px]">${place.title}</span>
          </div>
          <div class="w-2.5 h-2.5 bg-[#191715] border-r border-b border-white rotate-45 mx-auto -mt-1 shadow-sm"></div>
        </div>
      `;

      const placeIcon = L.divIcon({
        className: "gmp-active-place-marker",
        html: placeIconHtml,
        iconSize: [160, 45],
        iconAnchor: [80, 45],
      });

      L.marker([place.lat, place.lng], { icon: placeIcon }).addTo(
        markersLayerRef.current,
      );
    }
  };

  // Place navigation CTA handler (Compute Routes drawer shown when selecting a place to go)
  const handleNavigatePlaceEntity = (place: PlaceEntity) => {
    setNavigationTarget({
      title: place.title,
      subtitle: place.address,
      coords: { lat: place.lat, lng: place.lng },
    });
    setShowComputeRoutes(true);
  };

  // Street view drag-and-drop & click activation handlers
  const isPegmanDrop = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).includes("application/pegman-streetview");

  const handleMapDragOver = (e: React.DragEvent) => {
    if (!isPegmanDrop(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsPegmanDragging(true);
  };

  const handleMapDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsPegmanDragging(false);
    }
  };

  const handleMapDrop = async (e: React.DragEvent) => {
    if (!isPegmanDrop(e)) return;
    e.preventDefault();
    setIsPegmanDragging(false);
    if (mapInstanceRef.current && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const latlng = mapInstanceRef.current.containerPointToLatLng([x, y]);

      try {
        const geo = await reverseGeocode(latlng.lat, latlng.lng);
        setStreetViewLocation({
          lat: latlng.lat,
          lng: latlng.lng,
          name: geo.name || "Street View Location",
          address:
            geo.displayName ||
            `${latlng.lat.toFixed(4)}°N, ${latlng.lng.toFixed(4)}°E`,
        });
      } catch {
        setStreetViewLocation({
          lat: latlng.lat,
          lng: latlng.lng,
          name: "Street View Location",
          address: `${latlng.lat.toFixed(4)}°N, ${latlng.lng.toFixed(4)}°E`,
        });
      }
      setIsStreetViewOpen(true);
    }
  };

  const handleActivateStreetView = (coords?: { lat: number; lng: number }) => {
    const targetLat = coords?.lat ?? selectedPlaceEntity?.lat ?? userCoords.lat;
    const targetLng = coords?.lng ?? selectedPlaceEntity?.lng ?? userCoords.lng;
    const targetName = selectedPlaceEntity?.title ?? "Street View";
    const targetAddress =
      selectedPlaceEntity?.address ??
      `${targetLat.toFixed(4)}°N, ${targetLng.toFixed(4)}°E`;

    setStreetViewLocation({
      lat: targetLat,
      lng: targetLng,
      name: targetName,
      address: targetAddress,
    });
    setIsStreetViewOpen(true);
  };

  useEffect(() => {
    if (activeNavType === "ar") {
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [activeNavType]);

  // Pointer drag to look around in AR mode
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    setArHeading((prev) => {
      const next = (prev - deltaX * 0.35) % 360;
      return next < 0 ? next + 360 : next;
    });
    setDragStartX(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Device orientation listener for mobile gyro
  useEffect(() => {
    if (activeNavType !== "ar") return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && typeof e.alpha === "number") {
        setArHeading(Math.round(e.alpha));
      }
    };
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [activeNavType]);

  // Live Location & GPS state
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    isRealGPS: boolean;
    locationName: string;
  }>(() => {
    // Role-tailored initial center coordinates
    if (role === "business") {
      return {
        lat: 27.1751,
        lng: 78.0421,
        accuracy: 12,
        isRealGPS: false,
        locationName: "Taj Ganj Commercial Hub, Agra",
      };
    } else if (role === "authority") {
      return {
        lat: 28.6562,
        lng: 77.241,
        accuracy: 10,
        isRealGPS: false,
        locationName: "ASI Central Heritage Post, Delhi",
      };
    }
    return {
      lat: 28.6506,
      lng: 77.2301,
      accuracy: 15,
      isRealGPS: false,
      locationName: "Chandni Chowk / Delhi NCR",
    };
  });

  // Dynamic bearing from user to navigation target
  const targetBearing = useMemo(() => {
    if (!navigationTarget) return 45;
    const lat1 = (userCoords.lat * Math.PI) / 180;
    const lat2 = (navigationTarget.coords.lat * Math.PI) / 180;
    const dLng =
      ((navigationTarget.coords.lng - userCoords.lng) * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(dLng);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return Math.round((brng + 360) % 360);
  }, [userCoords, navigationTarget]);

  // Relative angle between target and current compass heading (-180 to +180)
  const relativeAngle = useMemo(() => {
    const diff = targetBearing - arHeading;
    return ((diff + 540) % 360) - 180;
  }, [targetBearing, arHeading]);

  // Screen horizontal position for 3D beacon (0% to 100%, 50% is dead-center)
  const beaconScreenX = useMemo(() => {
    const clampedAngle = Math.max(-35, Math.min(35, relativeAngle));
    const normalized = (clampedAngle + 35) / 70;
    return 15 + normalized * 70; // between 15% and 85%
  }, [relativeAngle]);

  const isTargetInView = Math.abs(relativeAngle) <= 35;

  const getCardinal = (heading: number) => {
    const cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round((heading % 360) / 45) % 8;
    return cardinals[index];
  };

  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "locating" | "active" | "denied"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // ----------------------------------------------------
  // Location Access / Geolocation Handler
  // ----------------------------------------------------
  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      setGpsStatus("denied");
      return;
    }

    setGpsStatus("locating");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          isRealGPS: true,
          locationName: "Live Device GPS Location",
        };
        setUserCoords(coords);
        setIsGpsActive(true);
        setGpsStatus("active");

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 16, {
            duration: 1.2,
          });
        }
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setGpsStatus("denied");
        setErrorMessage(
          err.code === 1
            ? "Location access was blocked or denied in your browser settings. You can pick any Indian heritage preset below to simulate your location."
            : `Unable to retrieve precise GPS coordinates: ${err.message}`,
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 },
    );
  };

  // Continuous Position Watching
  useEffect(() => {
    if (!isGpsActive || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserCoords((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          isRealGPS: true,
          locationName: "Live Device GPS Location",
        }));
      },
      (err) => console.warn("Watch error:", err.message),
      { enableHighAccuracy: true, maximumAge: 4000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isGpsActive]);

  const handleSelectPreset = (preset: LocationPreset) => {
    setUserCoords({
      lat: preset.lat,
      lng: preset.lng,
      accuracy: 10,
      isRealGPS: false,
      locationName: `${preset.name}, ${preset.city}`,
    });
    setIsGpsActive(false);
    setGpsStatus("idle");
    setErrorMessage(null);
    setShowPresetDropdown(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 15, {
        duration: 1,
      });
    }
  };

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 16, {
        duration: 1,
      });
    }
  };

  // ----------------------------------------------------
  // Role-Specific Map Data Sources
  // ----------------------------------------------------

  // 1. Tourist items from current trip
  const touristStops: ItineraryItem[] = useMemo(() => {
    if (!currentTrip || !currentTrip.days) return [];
    const currentDay =
      currentTrip.days[selectedDayIndex] || currentTrip.days[0];
    return (currentDay?.items || []).filter(
      (i) => i.coordinates && i.coordinates.lat && i.coordinates.lng,
    );
  }, [currentTrip, selectedDayIndex]);

  // 2. Business commercial items & footfall clusters near Agra / Taj Ganj / Jaipur
  const businessItems = useMemo(() => {
    return [
      {
        id: "biz-my-store",
        name: currentUser?.businessName || INITIAL_BUSINESS_PROFILE.name,
        category: "my_store",
        lat: userCoords.lat + 0.0012,
        lng: userCoords.lng + 0.0018,
        description: "Your registered storefront & verified partner showcase.",
        footfall: "284 visitors today",
        qualityScore: "94/100 (Tier Gold)",
        isStore: true,
      },
      {
        id: "hotspot-bus-lot",
        name: "Tourist Bus Depot & Shuttle Junction",
        category: "footfall_hotspot",
        lat: userCoords.lat + 0.0035,
        lng: userCoords.lng - 0.0028,
        description:
          "High tourist arrival cluster. Peak arrival: 10:30 AM - 1:00 PM.",
        density: "Very High (180+ pax/hr)",
        potentialReach: "Primary footfall funnel into your market lane",
      },
      {
        id: "hotspot-monument-gate",
        name: "Heritage Monument Promenade Exit",
        category: "footfall_hotspot",
        lat: userCoords.lat - 0.0025,
        lng: userCoords.lng + 0.0032,
        description:
          "Tourists exiting ticketed perimeter looking for crafts, souvenirs & dining.",
        density: "Peak (240+ pax/hr)",
        potentialReach: "Direct pedestrian inflow",
      },
      {
        id: "comp-guild-1",
        name: "Heritage Silk & Handloom Cooperative",
        category: "partner_competitor",
        lat: userCoords.lat + 0.0042,
        lng: userCoords.lng + 0.0045,
        description: "Verified Yatra One partner shop (Textiles & Carpets).",
        rating: "4.7 ★",
        license: "UP Tourism Approved",
      },
      {
        id: "comp-guild-2",
        name: "Agra Marble Carvers Guild",
        category: "partner_competitor",
        lat: userCoords.lat - 0.0038,
        lng: userCoords.lng - 0.0021,
        description: "Pietra Dura inlay craft collective.",
        rating: "4.8 ★",
        license: "Govt Certified",
      },
    ];
  }, [currentUser, userCoords]);

  // 3. Authority heritage checkpoints & live incident reports
  const authorityItems = useMemo(() => {
    return [
      {
        id: "auth-my-unit",
        name: currentUser?.name
          ? `${currentUser.name} (Active Patrol)`
          : "Patrol Unit #04",
        category: "command_unit",
        lat: userCoords.lat,
        lng: userCoords.lng,
        description: "Active enforcement officer station & field terminal.",
        badge: currentUser?.officerBadgeId || "ASI-FLD-992",
        department: currentUser?.department || "Archaeological Survey of India",
      },
      {
        id: "asi-buffer-1",
        name: "Taj Mahal / Red Fort 300m Heritage Buffer",
        category: "heritage_buffer",
        lat: userCoords.lat + 0.0025,
        lng: userCoords.lng + 0.0035,
        description:
          "100m Prohibited Zone + 200m Regulated Zone under AMASR Act 1958.",
        status: "Buffer Active: Strict Zero-Construction Enforced",
        prohibitedRadiusMeters: 100,
        regulatedRadiusMeters: 300,
      },
      {
        id: "police-booth-01",
        name: "Tourism Assistance Police Booth #2",
        category: "police_booth",
        lat: userCoords.lat - 0.0028,
        lng: userCoords.lng - 0.0034,
        description:
          "Stationed personnel: 2 Sub-Inspectors + Tourist Assistance Desk.",
        contact: "112 / 1363 (Tourist Helpline)",
        status: "Operational 24x7",
      },
      {
        id: "crowd-sensor-01",
        name: "Entry Turnstile Automated Sensor Array",
        category: "crowd_sensor",
        lat: userCoords.lat + 0.0032,
        lng: userCoords.lng - 0.0015,
        description:
          "Turnstile live velocity: 42 entries/min. Flow index: Green (Normal).",
        capacityPct: "68% of maximum throughput",
        status: "Optimal",
      },
    ];
  }, [currentUser, userCoords]);

  // ----------------------------------------------------
  // Leaflet Map Initialization & Rendering
  // ----------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Click anywhere on map to inspect location and show in Places UI Kit
      map.on("click", (e: L.LeafletMouseEvent) => {
        handleMapClickInspect(e.latlng.lat, e.latlng.lng);
      });

      // Google Maps Tile Layer
      const tileConfig = getMapTileConfig(mapStyle);
      L.tileLayer(tileConfig.url, {
        maxZoom: tileConfig.maxZoom,
        subdomains: tileConfig.subdomains,
      }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution(tileConfig.attribution)
        .addTo(map);

      const zoneLayer = L.layerGroup().addTo(map);
      zoneLayerRef.current = zoneLayer;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Render content
      renderMarkers(map, markersLayer, zoneLayer);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle, isExpanded]);

  // Update markers when data changes (including mapMode)
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !markersLayerRef.current ||
      !zoneLayerRef.current
    )
      return;
    renderMarkers(
      mapInstanceRef.current,
      markersLayerRef.current,
      zoneLayerRef.current,
    );
  }, [
    userCoords,
    role,
    touristStops,
    businessItems,
    authorityItems,
    activeFilter,
    mapMode,
    selectedPlaceEntity,
  ]);

  // Master marker renderer
  const renderMarkers = (
    map: L.Map,
    markersLayer: L.LayerGroup,
    zoneLayer: L.LayerGroup,
  ) => {
    markersLayer.clearLayers();
    zoneLayer.clearLayers();

    // Remove old heatmap layer if exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // ── SAFETY HEATMAP MODE ──
    if (mapMode === "safety" && role === "tourist") {
      // Generate dense heatmap points around each risk zone (Snapchat-style thermal blobs)
      const heatPoints: [number, number, number][] = [];

      LIVE_RISK_ZONES.forEach((zone) => {
        const intensity =
          zone.riskLevel === "high"
            ? 1.0
            : zone.riskLevel === "medium"
              ? 0.6
              : 0.15;
        const spread =
          zone.riskLevel === "high"
            ? 0.008
            : zone.riskLevel === "medium"
              ? 0.006
              : 0.004;
        const pointCount =
          zone.riskLevel === "high"
            ? 40
            : zone.riskLevel === "medium"
              ? 25
              : 12;

        // Central point
        heatPoints.push([
          zone.coordinates.lat,
          zone.coordinates.lng,
          intensity,
        ]);

        // Scatter surrounding thermal points for organic blob shape
        for (let i = 0; i < pointCount; i++) {
          const angle = (Math.PI * 2 * i) / pointCount;
          const radiusJitter = spread * (0.3 + Math.random() * 0.7);
          const lat = zone.coordinates.lat + Math.sin(angle) * radiusJitter;
          const lng = zone.coordinates.lng + Math.cos(angle) * radiusJitter;
          const jitteredIntensity = intensity * (0.5 + Math.random() * 0.5);
          heatPoints.push([lat, lng, jitteredIntensity]);
        }

        // Extra inner ring for high-risk zones for denser core
        if (zone.riskLevel === "high") {
          for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15 + Math.random() * 0.3;
            const lat = zone.coordinates.lat + Math.sin(angle) * spread * 0.25;
            const lng = zone.coordinates.lng + Math.cos(angle) * spread * 0.25;
            heatPoints.push([lat, lng, intensity * 0.9]);
          }
        }
      });

      // Create the Snapchat-style heatmap layer
      const heat = (L as any).heatLayer(heatPoints, {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        max: 1.0,
        minOpacity: 0.35,
        gradient: {
          0.0: "#00000000",
          0.15: "#2dd4bf80", // teal/safe (translucent)
          0.35: "#fbbf2490", // amber
          0.5: "#f97316cc", // orange
          0.7: "#ef4444dd", // red
          0.85: "#dc2626ee", // deep red
          1.0: "#991b1bff", // darkest danger
        },
      });
      heat.addTo(map);
      heatLayerRef.current = heat;

      // Add clickable risk zone markers on top of heatmap
      LIVE_RISK_ZONES.forEach((zone) => {
        const isHigh = zone.riskLevel === "high";
        const isMedium = zone.riskLevel === "medium";
        const markerColor = isHigh
          ? "#DC2626"
          : isMedium
            ? "#F97316"
            : "#10B981";
        const emoji = isHigh ? "🔴" : isMedium ? "🟠" : "🟢";

        const zoneHtml = `
          <div class="cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg transition-all border bg-white/95 backdrop-blur-sm border-[#EAE5DC] hover:scale-105" style="border-left: 3px solid ${markerColor};">
              <span>${emoji}</span>
              <span class="truncate max-w-[130px]" style="color: ${markerColor};">${zone.name.split("(")[0].trim()}</span>
              <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md text-white" style="background-color: ${markerColor};">${zone.riskLevel}</span>
            </div>
          </div>
        `;

        const zoneIcon = L.divIcon({
          className: "safety-zone-marker",
          html: zoneHtml,
          iconSize: [200, 36],
          iconAnchor: [100, 36],
        });

        L.marker([zone.coordinates.lat, zone.coordinates.lng], {
          icon: zoneIcon,
        })
          .addTo(markersLayer)
          .on("click", () => {
            setSelectedRiskZone(zone);
            setSelectedEntityInfo(null);
            map.flyTo([zone.coordinates.lat, zone.coordinates.lng], 14, {
              duration: 0.8,
            });
          });
      });

      return; // Don't render explore markers in safety mode
    }

    // ── EXPLORE MODE (original behavior) ──
    // Clear risk zone selection when switching back
    setSelectedRiskZone(null);

    // 1. Live User Location Pin with Animated Pulse Ring
    const userRoleColor =
      role === "tourist"
        ? "#0284C7"
        : role === "business"
          ? "#059669"
          : "#E11D48";
    const userRoleLabel =
      role === "tourist"
        ? "You (Traveler)"
        : role === "business"
          ? "You (Merchant)"
          : "You (Officer)";

    const userPulseHtml = `
      <div class="relative flex items-center justify-center" style="transform: translate(-50%, -50%);">
        <div class="absolute w-12 h-12 rounded-full gps-radar-pulse" style="background-color: ${userRoleColor}33;"></div>
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white" style="background-color: ${userRoleColor};">
          <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
        </div>
        <div class="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-lg bg-[#191715]/90 text-white text-[10px] font-black shadow-md border border-white/20 pointer-events-none">
          ${userCoords.isRealGPS ? `📍 ${userRoleLabel} • GPS` : `📍 ${userRoleLabel}`}
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: "dashboard-user-marker",
      html: userPulseHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    L.marker([userCoords.lat, userCoords.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    })
      .addTo(markersLayer)
      .on("click", () => {
        setSelectedEntityInfo({
          type: "user",
          title: userCoords.locationName,
          subtitle: `${userCoords.isRealGPS ? "Verified Real-Time GPS" : "Calibrated Location"} (${userCoords.lat.toFixed(4)}°N, ${userCoords.lng.toFixed(4)}°E)`,
          details: `Accuracy radius: ±${userCoords.accuracy} meters. Location coordinates mapped and calibrated.`,
          coords: { lat: userCoords.lat, lng: userCoords.lng },
          badge: userCoords.isRealGPS ? "Real GPS Active" : "Calibrated Device",
          badgeColor: "bg-emerald-600",
        });
      });

    // Accuracy Circle
    L.circle([userCoords.lat, userCoords.lng], {
      radius: Math.max(userCoords.accuracy, 25),
      color: userRoleColor,
      weight: 1.5,
      fillColor: userRoleColor,
      fillOpacity: 0.12,
    }).addTo(zoneLayer);

    // 2. Render Role-Specific Markers
    if (role === "tourist") {
      touristStops.forEach((item) => {
        if (!item.coordinates) return;
        const distKm = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          item.coordinates.lat,
          item.coordinates.lng,
        );
        const distFormatted = formatDistance(distKm * 1000);

        const stopHtml = `
          <div class="cursor-pointer group" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#191715] border border-[#EAE5DC] shadow-lg hover:scale-105 hover:border-[#C84B31] transition-all">
              <span class="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span class="text-xs font-black truncate max-w-[120px]">${item.title}</span>
              <span class="text-[10px] text-[#665E55] font-semibold">(${distFormatted})</span>
            </div>
          </div>
        `;

        const stopIcon = L.divIcon({
          className: "tourist-stop-marker",
          html: stopHtml,
          iconSize: [160, 36],
          iconAnchor: [80, 36],
        });

        L.marker([item.coordinates.lat, item.coordinates.lng], {
          icon: stopIcon,
        })
          .addTo(markersLayer)
          .on("click", () => {
            setSelectedEntityInfo({
              type: "tourist_stop",
              title: item.title,
              subtitle: `${item.category} • ${distFormatted} from your location`,
              details: item.description,
              tip: item.touristTip,
              cost: item.cost === 0 ? "Free Entry" : `₹${item.cost}`,
              coords: item.coordinates,
              badge: "Itinerary Stop",
              badgeColor: "bg-[#C84B31]",
            });
          });
      });
    } else if (role === "business") {
      businessItems.forEach((bItem) => {
        const isStore = bItem.category === "my_store";
        const isHotspot = bItem.category === "footfall_hotspot";

        if (isHotspot) {
          // Footfall Hotspot circle radius
          L.circle([bItem.lat, bItem.lng], {
            radius: 120,
            color: "#D97706",
            weight: 1,
            fillColor: "#F59E0B",
            fillOpacity: 0.2,
          }).addTo(zoneLayer);
        }

        const bHtml = `
          <div class="cursor-pointer group" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs shadow-lg transition-all border ${
              isStore
                ? "bg-[#064E3B] text-white border-[#34D399] ring-2 ring-[#059669]/40 scale-105"
                : isHotspot
                  ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                  : "bg-white text-[#191715] border-[#EAE5DC]"
            }">
              <span>${isStore ? "🏪" : isHotspot ? "👥" : "🏬"}</span>
              <span class="truncate max-w-[140px]">${bItem.name}</span>
            </div>
          </div>
        `;

        const bIcon = L.divIcon({
          className: "business-map-marker",
          html: bHtml,
          iconSize: [180, 36],
          iconAnchor: [90, 36],
        });

        L.marker([bItem.lat, bItem.lng], { icon: bIcon })
          .addTo(markersLayer)
          .on("click", () => {
            setSelectedEntityInfo({
              type: "business",
              title: bItem.name,
              subtitle: bItem.description,
              details:
                bItem.potentialReach || bItem.footfall || bItem.license || "",
              coords: { lat: bItem.lat, lng: bItem.lng },
              badge: isStore
                ? "Your Business"
                : isHotspot
                  ? "Footfall Hotspot"
                  : "Verified Partner",
              badgeColor: isStore
                ? "bg-[#059669]"
                : isHotspot
                  ? "bg-[#D97706]"
                  : "bg-[#0284C7]",
            });
          });
      });
    } else if (role === "authority") {
      authorityItems.forEach((aItem) => {
        const isBuffer = aItem.category === "heritage_buffer";
        const isUnit = aItem.category === "command_unit";

        if (isBuffer && aItem.prohibitedRadiusMeters) {
          // ASI 100m Prohibited Zone (Red)
          L.circle([aItem.lat, aItem.lng], {
            radius: aItem.prohibitedRadiusMeters,
            color: "#DC2626",
            weight: 2,
            fillColor: "#EF4444",
            fillOpacity: 0.18,
          }).addTo(zoneLayer);

          // ASI 200m Regulated Zone (Amber)
          L.circle([aItem.lat, aItem.lng], {
            radius: aItem.regulatedRadiusMeters,
            color: "#D97706",
            weight: 1.5,
            fillColor: "#F59E0B",
            fillOpacity: 0.08,
            dashArray: "5, 5",
          }).addTo(zoneLayer);
        }

        const aHtml = `
          <div class="cursor-pointer group" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs shadow-lg transition-all border ${
              isUnit
                ? "bg-[#881337] text-white border-[#FDA4AF] ring-2 ring-[#E11D48]/40"
                : isBuffer
                  ? "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                  : "bg-white text-[#191715] border-[#EAE5DC]"
            }">
              <span>${isUnit ? "👮" : isBuffer ? "🏛️" : "📡"}</span>
              <span class="truncate max-w-[140px]">${aItem.name}</span>
            </div>
          </div>
        `;

        const aIcon = L.divIcon({
          className: "authority-map-marker",
          html: aHtml,
          iconSize: [180, 36],
          iconAnchor: [90, 36],
        });

        L.marker([aItem.lat, aItem.lng], { icon: aIcon })
          .addTo(markersLayer)
          .on("click", () => {
            setSelectedEntityInfo({
              type: "authority",
              title: aItem.name,
              subtitle: aItem.description,
              details: aItem.status || aItem.department || aItem.contact || "",
              coords: { lat: aItem.lat, lng: aItem.lng },
              badge: isUnit
                ? "Field Patrol"
                : isBuffer
                  ? "ASI Buffer Zone"
                  : "Telemetry Station",
              badgeColor: isUnit ? "bg-[#E11D48]" : "bg-[#D97706]",
            });
          });
      });

      // Also render heritage incident markers from ecosystem data
      AUTHORITY_HERITAGE_REPORTS.forEach((report) => {
        if (!report.coordinates) return;

        const isCritical = report.severity === "critical";
        const reportHtml = `
          <div class="cursor-pointer group" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-md border ${
              isCritical
                ? "bg-[#991B1B] text-white border-red-300 animate-bounce"
                : "bg-[#FFFBEB] text-[#92400E] border-amber-300"
            }">
              <span>⚠️</span>
              <span class="truncate max-w-[120px]">${report.siteName.split("-")[0]}</span>
            </div>
          </div>
        `;

        const reportIcon = L.divIcon({
          className: "incident-map-marker",
          html: reportHtml,
          iconSize: [160, 32],
          iconAnchor: [80, 32],
        });

        L.marker([report.coordinates.lat, report.coordinates.lng], {
          icon: reportIcon,
        })
          .addTo(markersLayer)
          .on("click", () => {
            setSelectedEntityInfo({
              type: "incident",
              title: report.siteName,
              subtitle: `Reported: ${report.timestamp} by ${report.reportedBy}`,
              details: report.description,
              coords: report.coordinates,
              action: report.actionTaken || "Pending field unit inspection",
              badge: `${report.severity.toUpperCase()} INCIDENT`,
              badgeColor: isCritical ? "bg-red-700" : "bg-amber-600",
            });
          });
      });
    }

    // 3. Places UI Kit Pin Drop Marker on the actual map (Explore Mode)
    if (mapMode === "explore") {
      const activePlace = selectedPlaceEntity || defaultPlace;
      if (activePlace && activePlace.lat && activePlace.lng) {
        const isRestaurant = activePlace.category === "food";
        const iconSvg = isRestaurant
          ? `
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        `
          : `
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `;

        const placesPinHtml = `
          <div class="places-uikit-pindrop group cursor-pointer" style="transform: translate(-50%, -100%);">
            <!-- Radar ring pulse -->
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-3 rounded-full bg-[#EA4335]/35 blur-[3px] animate-pulse"></div>
            
            <!-- Floating Place Label Badge -->
            <div class="relative flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white text-[#191715] shadow-2xl border-2 border-[#EA4335] group-hover:border-[#0284C7] group-hover:scale-105 transition-all duration-200">
              <div class="w-6 h-6 rounded-xl bg-gradient-to-br from-[#EA4335] to-[#C5221F] flex items-center justify-center shadow-sm shrink-0">
                ${iconSvg}
              </div>
              <div class="flex flex-col text-left">
                <div class="flex items-center gap-1.5 leading-none">
                  <span class="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-[#C5221F]">Places UI Kit</span>
                  <span class="text-[10px] text-amber-500 font-black">★ ${activePlace.rating || "4.6"}</span>
                </div>
                <span class="text-xs font-black truncate max-w-[150px] text-[#191715] group-hover:text-[#0284C7] transition-colors mt-0.5">
                  ${activePlace.title}
                </span>
              </div>
            </div>

            <!-- Needle Point -->
            <div class="w-3 h-3 bg-[#EA4335] group-hover:bg-[#0284C7] rotate-45 mx-auto -mt-1.5 shadow-md border-r border-b border-white transition-colors"></div>
          </div>
        `;

        const placesPinIcon = L.divIcon({
          className: "places-uikit-marker",
          html: placesPinHtml,
          iconSize: [210, 54],
          iconAnchor: [105, 54],
        });

        L.marker([activePlace.lat, activePlace.lng], {
          icon: placesPinIcon,
          zIndexOffset: 850,
        })
          .addTo(markersLayer)
          .on("click", () => {
            setSelectedPlaceEntity(activePlace);
            setIsPlacesCardOpen(true);
            setSelectedEntityInfo(null);
            map.flyTo([activePlace.lat, activePlace.lng], 16, {
              duration: 0.8,
            });
          });
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Section Header & Location Access Action Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg ${
                  role === "tourist"
                    ? "bg-[#E0F2FE] text-[#0284C7]"
                    : role === "business"
                      ? "bg-[#D1FAE5] text-[#059669]"
                      : "bg-[#FFE4E6] text-[#E11D48]"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {role === "tourist"
                    ? "Interactive Itinerary & Heritage Map"
                    : role === "business"
                      ? "Commercial Footfall Radar & Merchant Map"
                      : "Geographic Telemetry & ASI Heritage Map"}
                </span>
              </span>

              {isGpsActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span>GPS Tracking Live</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#191715]">
              {role === "tourist"
                ? "Your Live Location & Sights Explorer"
                : role === "business"
                  ? "Storefront Location & Footfall Density Radar"
                  : "Command Post & Protected Heritage Perimeters"}
            </h2>

            <p className="text-xs sm:text-sm text-[#665E55]">
              {role === "tourist"
                ? "Enable GPS to track your real-time position, see distances to monuments, fair-price stalls, and find nearby emergency police booths."
                : role === "business"
                  ? "Pinpoint your shop on the verified merchant grid, observe tourist flow corridors, and track active visitor density in your district."
                  : "Monitor ASI 100m prohibited and 200m regulated buffer rings, field inspection unit positions, and live crowd telemetry."}
            </p>
          </div>

          {/* Primary Action Buttons: Enable Location Access & Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Enable Location Access Button */}
            <button
              id="enable-location-access-btn"
              onClick={handleEnableLocation}
              disabled={gpsStatus === "locating"}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isGpsActive
                  ? "bg-[#10B981] text-white hover:bg-[#059669]"
                  : gpsStatus === "locating"
                    ? "bg-[#EAE5DC] text-[#665E55] cursor-wait"
                    : "bg-[#191715] text-white hover:bg-[#C84B31]"
              }`}
              title="Request device GPS location to map your real-time coordinates"
            >
              {gpsStatus === "locating" ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Acquiring GPS...</span>
                </>
              ) : isGpsActive ? (
                <>
                  <LocateFixed className="w-4 h-4 animate-pulse" />
                  <span>GPS Connected (±{userCoords.accuracy}m)</span>
                </>
              ) : (
                <>
                  <Locate className="w-4 h-4" />
                  <span>Enable Location Access</span>
                </>
              )}
            </button>

            {/* Center on My Location Button */}
            <button
              id="center-user-location-btn"
              onClick={handleCenterOnUser}
              className="px-3 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EAE5DC] border border-[#EAE5DC] text-[#191715] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Recenter map to your location"
            >
              <Compass className="w-4 h-4 text-[#C84B31]" />
              <span className="hidden sm:inline">Center Me</span>
            </button>

            {/* Test Location Presets Dropdown (for quick testing / when GPS denied) */}
            <div className="relative">
              <button
                id="preset-location-selector-btn"
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className="px-3 py-2.5 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#EAE5DC] text-[#665E55] hover:text-[#191715] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Simulate location in iconic Indian cities"
              >
                <span>Presets</span>
                <span className="text-[10px] text-[#C84B31]">▼</span>
              </button>

              {showPresetDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAE5DC] py-2 z-50 text-left animate-in fade-in">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#8C827A] uppercase tracking-wider border-b border-[#F0ECE4]">
                    Simulate Location on Map
                  </div>
                  {FAMOUS_LOCATION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#FAF8F5] transition-colors flex flex-col cursor-pointer"
                    >
                      <span className="text-xs font-bold text-[#191715]">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-[#665E55]">
                        {preset.city} • {preset.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Expand Button */}
            <button
              id="expand-map-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#EAE5DC] text-[#191715] transition-all shadow-2xs cursor-pointer"
              title={isExpanded ? "Collapse Map" : "Expand Fullscreen Map"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Live Location Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-2.5 h-2.5 rounded-full ${userCoords.isRealGPS ? "bg-[#10B981] animate-pulse" : "bg-[#F59E0B]"}`}
            />
            <div className="font-bold text-[#191715] truncate">
              {userCoords.locationName}
            </div>
            <span className="text-[#8C827A] hidden sm:inline">•</span>
            <div className="font-mono text-[#665E55] text-[11px] hidden sm:inline">
              {userCoords.lat.toFixed(5)}°N, {userCoords.lng.toFixed(5)}°E
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#665E55]">
              Accuracy: <strong>±{userCoords.accuracy} meters</strong>
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                userCoords.isRealGPS
                  ? "bg-[#D1FAE5] text-[#065F46]"
                  : "bg-[#FEF3C7] text-[#92400E]"
              }`}
            >
              {userCoords.isRealGPS ? "Hardware GPS" : "Calibrated Pin"}
            </span>
          </div>
        </div>

        {/* Error / Permission Guidance Banner if blocked */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Location Permission Note:</span>{" "}
              {errorMessage}
            </div>
          </div>
        )}
      </div>

      {/* Map Canvas Container with Floating Controls & Detail Card */}
      <div
        className={`relative bg-white rounded-3xl border border-[#EAE5DC] shadow-sm overflow-hidden transition-all duration-300 ${
          isExpanded ? "h-[75vh]" : "h-[500px]"
        } ${isPegmanDragging ? "ring-4 ring-amber-400 ring-inset" : ""}`}
        onDragOver={handleMapDragOver}
        onDragEnter={handleMapDragOver}
        onDragLeave={handleMapDragLeave}
        onDrop={handleMapDrop}
      >
        {/* Leaflet Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {isPegmanDragging && (
          <div className="absolute inset-6 z-[1200] pointer-events-none rounded-3xl border-4 border-dashed border-amber-400 bg-amber-100/40 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-[#191715] text-white text-sm font-black shadow-xl">
              Drop Pegman here for Street View
            </span>
          </div>
        )}

        {/* AR NAVIGATION VIEWPORT OVERLAY (Active when user launches AR Navigation) */}
        {activeNavType === "ar" && (
          <div
            className="absolute inset-0 z-[1500] bg-[#050811] text-white flex flex-col overflow-hidden animate-in fade-in duration-300 touch-none select-none cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Live Camera Video (permanently mounted to avoid null ref) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 z-0 ${
                isCameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Realistic Simulated AR Environment (Heritage panoramic backdrop when camera is off or denied) */}
            <div
              className={`w-full h-full absolute inset-0 bg-cover bg-center transition-all duration-300 ease-out z-0 ${
                isCameraActive ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=80')`,
                filter: "brightness(0.72) contrast(1.15)",
                backgroundPosition: `${(arHeading / 360) * 100}% center`,
                transform: "scale(1.1)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />
              {/* Drag-to-look hint */}
              <div className="absolute top-24 inset-x-0 flex justify-center pointer-events-none">
                <div className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] text-white/80 font-mono tracking-wide shadow-md">
                  👆 Drag left / right to look around 360°
                </div>
              </div>
            </div>

            {/* 3D AR Ground Chevrons (Forward Path Overlay) */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2 z-10">
              <div className="text-cyan-400 font-mono text-[10px] tracking-widest font-black uppercase px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 shadow-lg animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>AR 3D Ground Pathway</span>
              </div>
              <div className="flex flex-col items-center -space-y-2.5 opacity-95">
                <div className="w-20 h-5 border-t-3 border-l-3 border-r-3 border-cyan-400 rounded-t-full transform rotate-180 opacity-30 animate-ping"></div>
                <div className="w-16 h-5 border-t-3 border-l-3 border-r-3 border-cyan-400 rounded-t-full transform rotate-180 opacity-60"></div>
                <div className="w-12 h-5 border-t-3 border-l-3 border-r-3 border-cyan-400 rounded-t-full transform rotate-180 opacity-90"></div>
                <div className="w-8 h-4 border-t-2 border-l-2 border-r-2 border-cyan-300 rounded-t-full transform rotate-180 opacity-100"></div>
              </div>
            </div>

            {/* Dynamic Floating 3D AR Target Waypoint Pin */}
            {isTargetInView ? (
              <div
                className="absolute top-1/3 -translate-y-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center transition-[left] duration-150 ease-out z-20"
                style={{ left: `${beaconScreenX}%` }}
              >
                {/* Pulsing Concentric Radar Rings */}
                <div className="relative flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-2 border-cyan-400/30 animate-ping absolute" />
                  <div className="w-20 h-20 rounded-full border border-purple-400/60 animate-pulse absolute" />
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-500 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.9)] flex items-center justify-center text-white text-base font-black ring-4 ring-white/20">
                    📍
                  </div>
                </div>

                {/* Target Information Card */}
                <div className="mt-3 px-4 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-cyan-400/40 shadow-2xl text-center pointer-events-auto">
                  <div className="flex items-center justify-center gap-1.5 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>Target Destination</span>
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {navigationTarget?.title ||
                      touristStops[0]?.title ||
                      "Destination"}
                  </div>
                  <div className="text-xs text-cyan-200 font-bold mt-0.5">
                    {navigationTarget?.coords
                      ? `${formatDistance(calculateDistanceKm(userCoords.lat, userCoords.lng, navigationTarget.coords.lat, navigationTarget.coords.lng) * 1000)} Ahead`
                      : "420m Ahead"}{" "}
                    • ~{activeRoute?.totalDurationMin || 5} min walk
                  </div>
                </div>

                {/* Vertical Laser Projection Line to ground */}
                <div className="w-0.5 h-16 bg-gradient-to-b from-cyan-400 via-cyan-400/50 to-transparent"></div>
              </div>
            ) : (
              /* Turn Directional Indicator when target is off-screen */
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${relativeAngle < 0 ? "left-4" : "right-4"} z-30 flex items-center gap-2 bg-purple-950/90 border border-purple-400/50 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl animate-pulse pointer-events-none`}
              >
                {relativeAngle < 0 ? (
                  <>
                    <ChevronLeft className="w-5 h-5 text-cyan-300 animate-bounce" />
                    <div>
                      <div className="text-xs font-black text-white">
                        Turn Left towards Target
                      </div>
                      <div className="text-[10px] text-purple-300 font-mono">
                        Target bearing {targetBearing}° (
                        {Math.abs(relativeAngle)}° left)
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="text-xs font-black text-white">
                        Turn Right towards Target
                      </div>
                      <div className="text-[10px] text-purple-300 font-mono">
                        Target bearing {targetBearing}° (
                        {Math.abs(relativeAngle)}° right)
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-cyan-300 animate-bounce" />
                  </>
                )}
              </div>
            )}

            {/* Top Compass Heading Ribbon */}
            <div className="absolute top-16 inset-x-0 flex flex-col items-center pointer-events-none z-20">
              <div className="px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2.5 text-xs font-mono">
                <Compass
                  className="w-3.5 h-3.5 text-cyan-400 animate-spin"
                  style={{ animationDuration: "10s" }}
                />
                <span className="text-white font-black">
                  {arHeading}° {getCardinal(arHeading)}
                </span>
                <span className="text-white/30">|</span>
                <span className="text-cyan-300 font-semibold text-[11px]">
                  Target: {targetBearing}° {getCardinal(targetBearing)}
                </span>
              </div>
            </div>

            {/* Bottom AR Turn Banner & Action Bar */}
            <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-30 pointer-events-auto">
              <div className="flex-1 bg-black/85 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-lg font-black shrink-0">
                  ⮑
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white truncate">
                    {activeRoute?.steps[0]?.instruction ||
                      `Navigate towards ${navigationTarget?.title || "Destination"}`}
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
                    <span className="text-emerald-400 font-bold">
                      {navigationTarget?.coords
                        ? `${formatDistance(calculateDistanceKm(userCoords.lat, userCoords.lng, navigationTarget.coords.lat, navigationTarget.coords.lng) * 1000)}`
                        : "420m"}
                    </span>
                    <span>• Direct line of sight</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                {/* Voice Turn Prompt Audio Toggle */}
                <button
                  onClick={() => {
                    setIsVoiceActive(!isVoiceActive);
                    if (!isVoiceActive) {
                      speakTurnPrompt(
                        `Voice guidance active. Destination ${navigationTarget?.title || "target"}.`,
                      );
                    }
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold backdrop-blur-md transition-all flex items-center justify-center cursor-pointer shadow-lg ${
                    isVoiceActive
                      ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                      : "bg-white/10 border-white/20 text-white/60"
                  }`}
                  title={
                    isVoiceActive
                      ? "Mute voice guidance"
                      : "Unmute voice guidance"
                  }
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Camera Toggle Button */}
                <button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`px-3.5 py-2.5 rounded-2xl border text-xs font-black backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                    isCameraActive
                      ? "bg-purple-600/30 border-purple-400 text-purple-200"
                      : "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                  }`}
                  title={
                    isCameraActive
                      ? "Switch to simulated AR view"
                      : "Use device camera"
                  }
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>
                    {isCameraActive ? "Simulated AR" : "Device Camera"}
                  </span>
                </button>

                {/* Switch to 2D Map */}
                <button
                  onClick={() => {
                    setActiveNavType("normal");
                    stopCamera();
                  }}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>2D Map</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE NAVIGATION TOP HUD BANNER (Present in both 2D and AR mode) */}
        {activeNavType !== "none" && activeRoute && (
          <div className="absolute top-3.5 inset-x-3.5 z-[1600] flex items-center justify-between gap-2 max-w-xl mx-auto bg-[#191715]/95 backdrop-blur-md text-white rounded-2xl p-2.5 sm:p-3 border border-white/20 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
                ⮑
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate">
                  {navigationTarget?.title || activeRoute.destination.name}
                </div>
                <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">
                    {activeRoute.totalDistanceKm} km
                  </span>
                  <span>• ~{activeRoute.totalDurationMin} min walk</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mode Toggle: 2D Map vs AR View */}
              <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setActiveNavType("normal");
                    stopCamera();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeNavType === "normal"
                      ? "bg-[#0284C7] text-white shadow-xs"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span>🗺️</span>
                  <span className="hidden sm:inline">2D Map</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNavType("ar");
                    startCamera();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeNavType === "ar"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <span>👓</span>
                  <span className="hidden sm:inline">AR Mode</span>
                </button>
              </div>

              {/* Exit Navigation */}
              <button
                onClick={stopNavigation}
                className="p-1.5 hover:bg-white/15 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Exit Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* UNIFIED TOP CONTROLS BAR: Guarantees zero overlapping between search bar, mode switcher, dynamic map & weather */}
        <div className="absolute top-3.5 inset-x-4 z-20 flex items-start justify-between gap-3 pointer-events-none">
          {/* Left Controls Cluster */}
          <div className="flex items-center gap-2 pointer-events-auto flex-wrap max-w-[calc(100%-140px)]">
            {/* 1. Map Search Tab (Explore Mode) */}
            {mapMode === "explore" && activeNavType === "none" && (
              <MapSearchTab
                centerCoords={{ lat: userCoords.lat, lng: userCoords.lng }}
                onSelectPlace={handleSelectPlaceEntity}
                onSelectGeocoded={(loc) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, {
                      duration: 1,
                    });
                  }
                  handleMapClickInspect(loc.lat, loc.lng);
                }}
                onOpenGroundingAI={() => setIsGroundingAIOpen(true)}
              />
            )}

            {/* 2. Mode Switcher (Explore | Safety Map) */}
            {role === "tourist" && activeNavType === "none" && (
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl border border-[#EAE5DC] p-1.5 shadow-xl shrink-0">
                <button
                  id="map-mode-explore-btn"
                  onClick={() => {
                    setMapMode("explore");
                    setSelectedRiskZone(null);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    mapMode === "explore"
                      ? "bg-[#0284C7] text-white shadow-sm"
                      : "text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore</span>
                </button>

                <button
                  id="map-mode-safety-btn"
                  onClick={() => {
                    setMapMode("safety");
                    setSelectedEntityInfo(null);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    mapMode === "safety"
                      ? "bg-[#DC2626] text-white shadow-sm"
                      : "text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Safety Map</span>
                </button>
              </div>
            )}

            {/* 3. Dynamic Maps Option Button */}
            <button
              id="toggle-dynamic-map-btn"
              onClick={() => setShowDynamicMapsPicker(!showDynamicMapsPicker)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-md border shrink-0 ${
                showDynamicMapsPicker
                  ? "bg-[#191715] text-white border-white/20 ring-2 ring-emerald-500/50 shadow-lg"
                  : "bg-white/95 text-[#665E55] border-[#EAE5DC] hover:text-[#191715] hover:bg-[#FAF8F5]"
              }`}
              title="Switch Map Layers (Roadmap, Satellite, Hybrid, Terrain, Traffic, Dark)"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="font-extrabold hidden md:inline">
                Dynamic Map
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-black bg-[#EAE5DC] text-[#78716C] uppercase">
                {mapStyle.replace("google-", "")}
              </span>
            </button>
          </div>

          {/* Right Controls Cluster: Weather Widget */}
          <div className="pointer-events-auto shrink-0">
            <WeatherOverlayWidget
              centerCoords={{ lat: userCoords.lat, lng: userCoords.lng }}
              locationName="Current Location"
              onWeatherLoaded={(brief) => setWeatherBrief(brief)}
            />
          </div>
        </div>

        {/* Right Side Map Controls Stack: Directly under weather widget */}
        <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE5DC] text-[#191715] shadow-md hover:bg-[#FAF8F5] transition-all flex items-center justify-center cursor-pointer font-black"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE5DC] text-[#191715] shadow-md hover:bg-[#FAF8F5] transition-all flex items-center justify-center cursor-pointer font-black"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleCenterOnUser}
            className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white shadow-md hover:bg-[#0369A1] transition-all flex items-center justify-center cursor-pointer font-black"
            title="Recenter on My Location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Right: Pegman Street View Button */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
          <PegmanButton
            onActivateStreetView={handleActivateStreetView}
            onDragStateChange={setIsPegmanDragging}
          />
        </div>

        {/* Role-Specific Legend & Quick Overlays (Bottom Left) - shown in safety mode */}
        {mapMode === "safety" && (
          <div className="absolute bottom-4 left-4 z-20 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-[#EAE5DC] p-3 shadow-lg space-y-1.5 hidden sm:block">
            <div className="text-[11px] font-extrabold text-[#191715] uppercase tracking-wider flex items-center justify-between">
              <span>Risk Heatmap Legend</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#DC2626] text-white">
                SAFETY
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-[#524B43]">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm shrink-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #991b1b, #dc2626, #ef4444)",
                  }}
                />
                <span className="font-bold text-[#B91C1C]">
                  High Risk — Scam cluster / Tout corridor
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm shrink-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #ea580c, #f97316, #fbbf24)",
                  }}
                />
                <span className="font-bold text-[#B45309]">
                  Moderate — Pickpocket zone / Caution
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm shrink-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #059669, #10b981, #2dd4bf)",
                  }}
                />
                <span className="font-bold text-[#065F46]">
                  Safe — Police booth / Monitored zone
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Places UI Kit Card (Expands when Pin Drop on map or search place is clicked; Close button dismisses it) */}
        {mapMode === "explore" &&
          activeNavType === "none" &&
          isPlacesCardOpen && (
            <PlacesUIKitCard
              place={selectedPlaceEntity || defaultPlace}
              onClose={() => setIsPlacesCardOpen(false)}
              onNavigate={handleNavigatePlaceEntity}
            />
          )}
        {/* Interactive Selected Location Card (Bottom Right Drawer) */}
        {selectedEntityInfo && (
          <div className="absolute bottom-18 right-4 z-20 max-w-sm w-full bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl p-4 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white mb-1 ${selectedEntityInfo.badgeColor || "bg-[#191715]"}`}
                >
                  {selectedEntityInfo.badge}
                </span>
                <h4 className="text-sm font-black text-[#191715] leading-snug">
                  {selectedEntityInfo.title}
                </h4>
                <div className="text-xs text-[#665E55] mt-0.5">
                  {selectedEntityInfo.subtitle}
                </div>
              </div>

              <button
                onClick={() => setSelectedEntityInfo(null)}
                className="text-[#8C827A] hover:text-[#191715] p-1 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedEntityInfo.details && (
              <p className="text-xs text-[#443F38] mt-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE5DC] leading-relaxed">
                {selectedEntityInfo.details}
              </p>
            )}

            {selectedEntityInfo.tip && (
              <div className="text-[11px] text-[#059669] font-semibold mt-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Tip: {selectedEntityInfo.tip}</span>
              </div>
            )}

            {selectedEntityInfo.action && (
              <div className="text-[11px] text-[#D97706] font-semibold mt-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Action: {selectedEntityInfo.action}</span>
              </div>
            )}

            {selectedEntityInfo.coords && (
              <div className="mt-3 pt-2.5 border-t border-[#EAE5DC] flex items-center gap-2">
                <button
                  id="navigate-entity-btn"
                  onClick={() =>
                    handleOpenNavigateModal({
                      title: selectedEntityInfo.title,
                      subtitle: selectedEntityInfo.subtitle,
                      coords: selectedEntityInfo.coords,
                    })
                  }
                  className="flex-1 py-2 px-3.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate (2D & AR)</span>
                </button>

                <a
                  href={getGoogleMapsDirectionsUrl(
                    { lat: userCoords.lat, lng: userCoords.lng },
                    selectedEntityInfo.coords,
                    "walking",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#EAE5DC] text-[#665E55] hover:text-[#191715] rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  title="Open in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Safety Heatmap - Selected Risk Zone Detail Card (Bottom Right) */}
        {selectedRiskZone && mapMode === "safety" && (
          <div className="absolute bottom-18 right-4 z-20 max-w-sm w-full bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl p-4 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white mb-1 ${
                    selectedRiskZone.riskLevel === "high"
                      ? "bg-[#DC2626]"
                      : selectedRiskZone.riskLevel === "medium"
                        ? "bg-[#F97316]"
                        : "bg-[#10B981]"
                  }`}
                >
                  {selectedRiskZone.riskLevel.toUpperCase()} RISK
                </span>
                <h4 className="text-sm font-black text-[#191715] leading-snug">
                  {selectedRiskZone.name}
                </h4>
                <div className="text-xs text-[#665E55] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C84B31]" />
                  <span>{selectedRiskZone.city} District</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRiskZone(null)}
                className="text-[#8C827A] hover:text-[#191715] p-1 rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#443F38] mt-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE5DC] leading-relaxed">
              {selectedRiskZone.description}
            </p>

            <div className="mt-2 p-2.5 bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl text-xs text-[#9A3412] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#C2410C]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safety Precaution</span>
              </div>
              <p className="leading-relaxed">{selectedRiskZone.safetyAdvice}</p>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#DC2626] font-bold">
                {selectedRiskZone.activeIncidentsCount} active reports
              </span>
              <span className="font-mono text-[11px] text-[#0284C7]">
                {selectedRiskZone.touristPoliceContact.split(":")[0]}
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#EAE5DC] flex items-center gap-2">
              <button
                id="navigate-riskzone-btn"
                onClick={() =>
                  handleOpenNavigateModal({
                    title: selectedRiskZone.name,
                    subtitle: `${selectedRiskZone.riskLevel.toUpperCase()} Risk Zone (${selectedRiskZone.city})`,
                    coords: selectedRiskZone.coordinates,
                  })
                }
                className="flex-1 py-2 px-3.5 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate Safe Route (2D & AR)</span>
              </button>

              <a
                href={getGoogleMapsDirectionsUrl(
                  { lat: userCoords.lat, lng: userCoords.lng },
                  selectedRiskZone.coordinates,
                  "walking",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#EAE5DC] text-[#665E55] hover:text-[#191715] rounded-xl flex items-center justify-center transition-all cursor-pointer"
                title="Inspect in Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* NAVIGATION MODE CHOICE MODAL (Normal Route vs AR Mode) */}
        {showNavigationChoiceModal && navigationTarget && (
          <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#0284C7]/10 text-[#0284C7]">
                    Choose Navigation Mode
                  </span>
                  <h3 className="text-base font-black text-[#191715] mt-1 leading-snug">
                    {navigationTarget.title}
                  </h3>
                  {navigationTarget.subtitle && (
                    <p className="text-xs text-[#665E55] mt-0.5">
                      {navigationTarget.subtitle}
                    </p>
                  )}
                </div>
                <button
                  id="close-nav-modal-btn"
                  onClick={() => setShowNavigationChoiceModal(false)}
                  className="p-1.5 rounded-xl hover:bg-[#FAF8F5] text-[#8C827A] hover:text-[#191715] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Preview info */}
              <div className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC] text-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0284C7] flex items-center justify-center font-black text-base shrink-0">
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#191715] truncate">
                    Direct Distance from Location
                  </div>
                  <div className="text-[11px] text-[#665E55]">
                    ~
                    {formatDistance(
                      calculateDistanceKm(
                        userCoords.lat,
                        userCoords.lng,
                        navigationTarget.coords.lat,
                        navigationTarget.coords.lng,
                      ) * 1000,
                    )}{" "}
                    • Approx.{" "}
                    {Math.max(
                      2,
                      Math.round(
                        calculateDistanceKm(
                          userCoords.lat,
                          userCoords.lng,
                          navigationTarget.coords.lat,
                          navigationTarget.coords.lng,
                        ) * 14,
                      ),
                    )}{" "}
                    min walk
                  </div>
                </div>
              </div>

              {/* Two Navigation Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Normal Route Navigation (2D Map) */}
                <button
                  id="select-normal-nav-btn"
                  onClick={() => startNavigation("normal")}
                  className="p-4 rounded-2xl border-2 border-[#0284C7]/30 hover:border-[#0284C7] bg-[#F0F9FF] hover:bg-[#E0F2FE] transition-all text-left group flex flex-col justify-between gap-3 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center text-lg shadow-sm mb-2 group-hover:scale-105 transition-transform">
                      🗺️
                    </div>
                    <h4 className="text-sm font-black text-[#0369A1]">
                      Normal Route
                    </h4>
                    <p className="text-[11px] text-[#0284C7]/80 mt-1 leading-relaxed">
                      2D GPS map turn-by-turn routing with clear path polylines,
                      turns & live tracking.
                    </p>
                  </div>
                  <div className="text-xs font-black text-[#0284C7] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Start 2D Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 2. AR Navigation Mode */}
                <button
                  id="select-ar-nav-btn"
                  onClick={() => startNavigation("ar")}
                  className="p-4 rounded-2xl border-2 border-purple-300 hover:border-purple-600 bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF] hover:from-[#F3E8FF] hover:to-[#E9D5FF] transition-all text-left group flex flex-col justify-between gap-3 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-lg shadow-sm mb-2 group-hover:scale-105 transition-transform">
                      👓
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-purple-900">
                        AR Navigation
                      </h4>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-purple-600 text-white animate-pulse">
                        3D HUD
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-950/70 mt-1 leading-relaxed">
                      Camera AR view with 3D ground chevrons, floating
                      destination beacon & compass.
                    </p>
                  </div>
                  <div className="text-xs font-black text-purple-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Start AR Mode</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Footer hint */}
              <div className="text-center pt-1 border-t border-[#EAE5DC]">
                <p className="text-[11px] text-[#8C827A]">
                  💡 You can also switch between 2D Map and AR Mode anytime
                  during your route.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Direct Modals (Compute Routes, Dynamic Maps, Street View, Maps Grounding AI) ── */}

        {/* 1. Compute Routes Drawer (Shows when selecting a destination) */}
        <ComputeRoutesDrawer
          isOpen={showComputeRoutes}
          onClose={() => setShowComputeRoutes(false)}
          userCoords={userCoords}
          targetCoords={
            navigationTarget
              ? {
                  lat: navigationTarget.coords.lat,
                  lng: navigationTarget.coords.lng,
                  title: navigationTarget.title,
                }
              : null
          }
          activeRoute={activePlatformRoute}
          onSelectRoute={(rt) => setActivePlatformRoute(rt)}
        />

        {/* 2. Dynamic Maps Picker */}
        <DynamicMapsPicker
          isOpen={showDynamicMapsPicker}
          onClose={() => setShowDynamicMapsPicker(false)}
          currentStyle={mapStyle}
          onSelectStyle={(newStyle) => {
            setMapStyle(newStyle);
            if (
              newStyle === "google-satellite" ||
              newStyle === "google-hybrid"
            ) {
              setIsSatellite(true);
            } else {
              setIsSatellite(false);
            }
            setShowDynamicMapsPicker(false);
          }}
        />

        {/* 3. 360° Street View Modal */}
        <StreetViewModal
          isOpen={isStreetViewOpen}
          onClose={() => setIsStreetViewOpen(false)}
          location={streetViewLocation}
        />

        {/* 4. Maps Grounding Lite (MCP AI) */}
        <MapsGroundingLiteModal
          isOpen={isGroundingAIOpen}
          onClose={() => setIsGroundingAIOpen(false)}
          viewportCenter={{ lat: userCoords.lat, lng: userCoords.lng }}
          weatherBrief={weatherBrief}
          nearbyPlacesSummary={touristStops.map((s) => s.title)}
          onFlyTo={(lat, lng) => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
            }
          }}
        />
      </div>
    </div>
  );
};
