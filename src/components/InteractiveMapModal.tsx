import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  X, 
  MapPin, 
  Map,
  List,
  Navigation, 
  IndianRupee, 
  Star, 
  Clock, 
  Train, 
  Utensils, 
  ShoppingBag, 
  Landmark, 
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Maximize2,
  ExternalLink,
  Locate,
  LocateFixed,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  RotateCcw,
  Volume2,
  VolumeX,
  Footprints,
  Car,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { ItineraryItem, DayPlan } from '../types/travel';
import { 
  NavTravelMode, 
  RouteStep, 
  RouteResult, 
  FAMOUS_LOCATION_PRESETS, 
  calculateDistanceKm, 
  formatDistance, 
  formatDuration, 
  generateRoute, 
  announceVoicePrompt 
} from '../utils/navigationEngine';
import { 
  getMapTileConfig, 
  MAP_STYLE_OPTIONS, 
  GoogleMapStyleType, 
  getGoogleMapsDirectionsUrl 
} from '../utils/mapsConfig';
import { 
  ExploreFeatureToolbar, 
  ExploreActiveTool 
} from './maps/explore/ExploreFeatureToolbar';
import { ComputeRoutesDrawer } from './maps/explore/ComputeRoutesDrawer';
import { AutocompleteSearchBar } from './maps/explore/AutocompleteSearchBar';
import { NearbySearchDrawer } from './maps/explore/NearbySearchDrawer';
import { TextSearchDrawer } from './maps/explore/TextSearchDrawer';
import { GeocodingTool } from './maps/explore/GeocodingTool';
import { MapsGroundingLiteModal } from './maps/explore/MapsGroundingLiteModal';
import { DynamicMapsPicker } from './maps/explore/DynamicMapsPicker';
import { PlacesUIKitCard } from './maps/explore/PlacesUIKitCard';
import { ThreeDMapControls } from './maps/explore/ThreeDMapControls';
import { WeatherOverlayWidget } from './maps/explore/WeatherOverlayWidget';
import { 
  RouteOption, 
  PlaceEntity, 
  GeocodedLocation, 
  reverseGeocode 
} from '../services/mapPlatformService';

interface InteractiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayPlan;
  items: ItineraryItem[];
  city: string;
  focusLocation?: { lat: number; lng: number; title?: string } | null;
  initialUserCoords?: { lat: number; lng: number } | null;
}

export const InteractiveMapModal: React.FC<InteractiveMapModalProps> = ({
  isOpen,
  onClose,
  day,
  items,
  city,
  focusLocation,
  initialUserCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Active view modes: 'explore' (browse stops) or 'directions' (route navigation)
  const [mapMode, setMapMode] = useState<'explore' | 'directions'>('explore');
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [mapStyle, setMapStyle] = useState<GoogleMapStyleType>('google-streets');
  const osmFallbackLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // ── 10 Google Maps Platform Features State ──
  const [activeExploreTool, setActiveExploreTool] = useState<ExploreActiveTool>('none');
  const [selectedPlaceEntity, setSelectedPlaceEntity] = useState<PlaceEntity | null>(null);
  const [activePlatformRoute, setActivePlatformRoute] = useState<RouteOption | null>(null);
  const platformRoutePolylineRef = useRef<L.Polyline | null>(null);
  const [is3DActive, setIs3DActive] = useState(false);
  const [tilt3D, setTilt3D] = useState(38);
  const [rotation3D, setRotation3D] = useState(0);
  const [isInspectActive, setIsInspectActive] = useState(false);
  const isInspectActiveRef = useRef(false);
  isInspectActiveRef.current = isInspectActive;
  const [inspectedLocation, setInspectedLocation] = useState<GeocodedLocation | null>(null);
  const inspectMarkerRef = useRef<L.Marker | null>(null);
  const [weatherBrief, setWeatherBrief] = useState('28°C, Partly Sunny');

  // Live Location & GPS state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    isRealGPS: boolean;
    locationName: string;
  }>(() => {
    if (initialUserCoords) {
      return {
        lat: initialUserCoords.lat,
        lng: initialUserCoords.lng,
        accuracy: 15,
        isRealGPS: false,
        locationName: 'Calibrated Device Location'
      };
    }
    // Default fallback near Old Delhi / Chandni Chowk
    return {
      lat: 28.6506,
      lng: 77.2301,
      accuracy: 20,
      isRealGPS: false,
      locationName: 'Chandni Chowk, Old Delhi'
    };
  });

  const [isGpsActive, setIsGpsActive] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Directions state
  const [travelMode, setTravelMode] = useState<NavTravelMode>('walk');
  const [originType, setOriginType] = useState<'user' | string>('user');
  const [destinationId, setDestinationId] = useState<string>('');
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);

  // Valid items with coordinates
  const validItems = useMemo(() => {
    return items.filter(it => it.coordinates && it.coordinates.lat && it.coordinates.lng);
  }, [items]);

  const displayItems = useMemo(() => {
    return validItems.filter(it => 
      activeCategoryFilter === 'all' ? true : it.category === activeCategoryFilter
    );
  }, [validItems, activeCategoryFilter]);

  // Set default selected item and destination
  useEffect(() => {
    if (!isOpen) return;

    // Automatically activate live GPS when opening map
    requestLiveGPS();

    if (focusLocation) {
      const match = validItems.find(i => 
        i.coordinates && 
        Math.abs(i.coordinates.lat - focusLocation.lat) < 0.001 &&
        Math.abs(i.coordinates.lng - focusLocation.lng) < 0.001
      );
      if (match) {
        setSelectedItem(match);
        setDestinationId(match.id);
      } else {
        const focusItem: ItineraryItem = {
          id: `focus-${focusLocation.lat}-${focusLocation.lng}`,
          title: focusLocation.title || 'Searched Destination',
          category: 'cultural_sight',
          time: 'Active Target',
          duration: '2h',
          location: focusLocation.title || 'Searched Location',
          city: city || day?.city || 'India',
          cost: 0,
          description: `Navigating to ${focusLocation.title || 'destination'}`,
          touristTip: 'Popular point of interest',
          imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
          coordinates: { lat: focusLocation.lat, lng: focusLocation.lng }
        };
        setSelectedItem(focusItem);
        setDestinationId(focusItem.id);
      }
    } else if (validItems.length > 0 && !selectedItem) {
      setSelectedItem(validItems[0]);
      setDestinationId(validItems[0].id);
    }
  }, [isOpen, focusLocation, validItems]);

  // Handle GPS tracking
  const requestLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          isRealGPS: true,
          locationName: 'My Live GPS Location'
        };
        setUserLocation(coords);
        setIsGpsActive(true);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 16, { duration: 1.2 });
        }
      },
      (err) => {
        console.warn('GPS Error or Permission Denied:', err.message);
        setIsGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Watch position when GPS active
  useEffect(() => {
    if (!isGpsActive || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          isRealGPS: true,
          locationName: 'My Live GPS Location'
        }));
      },
      (err) => console.warn('Watch position error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isGpsActive]);

  // Switch preset location
  const handleSelectPreset = (preset: typeof FAMOUS_LOCATION_PRESETS[0]) => {
    setUserLocation({
      lat: preset.lat,
      lng: preset.lng,
      accuracy: 10,
      isRealGPS: false,
      locationName: `${preset.name}, ${preset.city}`
    });
    setIsGpsActive(false);
    setShowPresetDropdown(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 15, { duration: 1 });
    }
  };

  // Recalculate Route whenever origin, destination, or travelMode changes
  useEffect(() => {
    if (!destinationId) return;

    const destItem = validItems.find(i => i.id === destinationId);
    if (!destItem || !destItem.coordinates) return;

    let originCoords: { lat: number; lng: number; name: string };

    if (originType === 'user') {
      originCoords = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        name: userLocation.locationName
      };
    } else {
      const origItem = validItems.find(i => i.id === originType);
      if (origItem && origItem.coordinates) {
        originCoords = {
          lat: origItem.coordinates.lat,
          lng: origItem.coordinates.lng,
          name: origItem.title
        };
      } else {
        originCoords = {
          lat: userLocation.lat,
          lng: userLocation.lng,
          name: userLocation.locationName
        };
      }
    }

    const destCoords = {
      lat: destItem.coordinates.lat,
      lng: destItem.coordinates.lng,
      name: destItem.title
    };

    const route = generateRoute(originCoords, destCoords, travelMode);
    setActiveRoute(route);
    setActiveStepIndex(0);
  }, [destinationId, originType, travelMode, userLocation, validItems]);

  // Voice announcement on step change when navigating
  useEffect(() => {
    if (!isNavigating || !activeRoute || isVoiceMuted) return;
    const currentStep = activeRoute.steps[activeStepIndex];
    if (currentStep) {
      announceVoicePrompt(`${currentStep.instruction}. ${currentStep.secondaryText}`);
    }
  }, [isNavigating, activeStepIndex, isVoiceMuted, activeRoute]);

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
        activePlatformRoute.mode === 'walking' ? '#10B981' :
        activePlatformRoute.mode === 'transit' ? '#8B5CF6' :
        activePlatformRoute.mode === 'motorcycle' ? '#F59E0B' :
        '#0284C7';

      const polyline = L.polyline(activePlatformRoute.polyline, {
        color,
        weight: 6,
        opacity: 0.9,
        dashArray: activePlatformRoute.mode === 'walking' ? '6, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      platformRoutePolylineRef.current = polyline;

      const bounds = polyline.getBounds();
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    }
  }, [activePlatformRoute]);

  // Reverse geocoding map click handler
  const handleMapClickInspect = async (lat: number, lng: number) => {
    const geo = await reverseGeocode(lat, lng);
    setInspectedLocation(geo);
    setActiveExploreTool('geocoding');

    if (mapInstanceRef.current && markersLayerRef.current) {
      if (inspectMarkerRef.current) {
        markersLayerRef.current.removeLayer(inspectMarkerRef.current);
      }

      const inspectIconHtml = `
        <div class="relative flex items-center justify-center" style="transform: translate(-50%, -100%); cursor: pointer;">
          <div class="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] shadow-xl border-2 border-white flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>${geo.name}</span>
          </div>
          <div class="w-2.5 h-2.5 bg-rose-600 border-r border-b border-white rotate-45 mx-auto -mt-1 shadow-sm"></div>
        </div>
      `;

      const inspectIcon = L.divIcon({
        className: 'geocoded-pin-marker',
        html: inspectIconHtml,
        iconSize: [140, 45],
        iconAnchor: [70, 45]
      });

      const marker = L.marker([lat, lng], { icon: inspectIcon }).addTo(markersLayerRef.current);
      inspectMarkerRef.current = marker;
      mapInstanceRef.current.panTo([lat, lng]);
    }
  };

  // Place selection handler (from Autocomplete, Nearby, Text Search)
  const handleSelectPlaceEntity = (place: PlaceEntity) => {
    setSelectedPlaceEntity(place);
    setActiveExploreTool('places');

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
        className: 'gmp-active-place-marker',
        html: placeIconHtml,
        iconSize: [160, 45],
        iconAnchor: [80, 45]
      });

      L.marker([place.lat, place.lng], { icon: placeIcon }).addTo(markersLayerRef.current);
    }
  };

  // Place navigation CTA handler
  const handleNavigatePlaceEntity = (place: PlaceEntity) => {
    setSelectedPlaceEntity(null);
    setActivePlatformRoute(null);
    setActiveExploreTool('routes');
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initial center
      const defaultCenter: [number, number] = focusLocation
        ? [focusLocation.lat, focusLocation.lng]
        : displayItems[0]?.coordinates
        ? [displayItems[0].coordinates.lat, displayItems[0].coordinates.lng]
        : [userLocation.lat, userLocation.lng];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Click listener for Geocoding Inspect Pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isInspectActiveRef.current) {
          handleMapClickInspect(e.latlng.lat, e.latlng.lng);
        }
      });

      // Google Maps Tile layer with automatic OSM fallback
      const tileConfig = getMapTileConfig(mapStyle);
      const googleTileLayer = L.tileLayer(tileConfig.url, { 
        maxZoom: tileConfig.maxZoom, 
        subdomains: tileConfig.subdomains 
      });

      googleTileLayer.on('tileerror', () => {
        if (mapInstanceRef.current && !osmFallbackLayerRef.current) {
          const fallback = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          });
          fallback.addTo(mapInstanceRef.current);
          osmFallbackLayerRef.current = fallback;
        }
      });
      googleTileLayer.addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution(tileConfig.attribution)
        .addTo(map);

      // ResizeObserver to ensure tiles render immediately when modal opens or resizes
      let resizeObserver: ResizeObserver | null = null;
      if (mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      // Markers Layer Group
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Render markers and active user GPS
      renderMapContent(map, markersLayer);

      // Fit bounds or focus on selected searched destination
      if (focusLocation && focusLocation.lat && focusLocation.lng) {
        map.flyTo([focusLocation.lat, focusLocation.lng], 15, { duration: 1.2 });
      } else if (activeRoute && activeRoute.polyline.length > 0) {
        const bounds = L.latLngBounds(activeRoute.polyline);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      } else if (displayItems.length > 1) {
        const bounds = L.latLngBounds(displayItems.map(it => [it.coordinates!.lat, it.coordinates!.lng]));
        bounds.extend([userLocation.lat, userLocation.lng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      osmFallbackLayerRef.current = null;
    };
  }, [isOpen, mapStyle]);

  // Reactive invalidation for modal transitions, mode switches, and mobile view changes
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(t);
  }, [isOpen, mobileView, mapMode]);

  // Update map markers and route overlay when state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    renderMapContent(mapInstanceRef.current, markersLayerRef.current);
  }, [displayItems, selectedItem, userLocation, activeRoute, mapMode, isNavigating, activeStepIndex]);

  // Master Render Function for Markers, User GPS Pulse, and Route Polyline
  const renderMapContent = (map: L.Map, markersLayer: L.LayerGroup) => {
    markersLayer.clearLayers();

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    // 1. Render User GPS Live Location Marker
    const userIconHtml = `
      <div class="relative flex items-center justify-center" style="transform: translate(-50%, -50%);">
        <div class="absolute w-10 h-10 rounded-full bg-[#0284C7]/25 gps-radar-pulse"></div>
        <div class="w-5 h-5 rounded-full bg-[#0284C7] border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        <div class="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-[#191715]/90 text-white text-[10px] font-bold shadow-md border border-white/20 pointer-events-none">
          ${userLocation.isRealGPS ? 'You (GPS)' : 'You (Current)'}
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-gps-marker',
      html: userIconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
      icon: userIcon,
      zIndexOffset: 1000 
    }).addTo(markersLayer);
    userMarkerRef.current = userMarker;

    // Accuracy Circle
    if (userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current.remove();
    }
    const accCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: Math.max(userLocation.accuracy, 15),
      color: '#0284C7',
      weight: 1,
      fillColor: '#0284C7',
      fillOpacity: 0.1
    }).addTo(markersLayer);
    userAccuracyCircleRef.current = accCircle;

    // 2. Render Destination / Itinerary Stop Markers
    displayItems.forEach((item) => {
      if (!item.coordinates) return;
      const { lat, lng } = item.coordinates;
      const isSelected = selectedItem?.id === item.id;
      const isRouteDest = destinationId === item.id;
      const costText = item.cost === 0 ? 'Free' : `₹${item.cost.toLocaleString('en-IN')}`;

      const iconHtml = `
        <div class="custom-dribbble-marker group" style="transform: translate(-50%, -100%); cursor: pointer;">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-xl transition-all border ${
            isRouteDest 
              ? 'bg-[#C84B31] text-white border-white ring-4 ring-[#C84B31]/35 scale-110' 
              : isSelected 
              ? 'bg-[#191715] text-white border-white ring-2 ring-black/20 scale-105' 
              : 'bg-white text-[#191715] border-[#E5E0D8] hover:border-[#C84B31] hover:scale-105'
          }">
            <span class="w-2 h-2 rounded-full ${isRouteDest ? 'bg-white animate-pulse' : 'bg-[#10B981]'}"></span>
            <span style="font-family: 'Plus Jakarta Sans', sans-serif;">${costText}</span>
          </div>
          <div class="w-2.5 h-2.5 ${isRouteDest ? 'bg-[#C84B31]' : isSelected ? 'bg-[#191715]' : 'bg-white'} border-r border-b border-[#E5E0D8] rotate-45 mx-auto -mt-1 shadow-xs"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'dribbble-leaflet-marker-wrapper',
        html: iconHtml,
        iconSize: [80, 40],
        iconAnchor: [40, 40],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      marker.on('click', () => {
        setSelectedItem(item);
        setDestinationId(item.id);
        map.flyTo([lat, lng], 15, { duration: 0.8 });
      });
    });

    // 2b. Render Searched Target Destination Pin if provided
    if (focusLocation && focusLocation.lat && focusLocation.lng) {
      const isAlreadyInItems = displayItems.some(
        it => it.coordinates && 
        Math.abs(it.coordinates.lat - focusLocation.lat) < 0.001 &&
        Math.abs(it.coordinates.lng - focusLocation.lng) < 0.001
      );
      if (!isAlreadyInItems) {
        const focusHtml = `
          <div class="custom-focus-marker" style="transform: translate(-50%, -100%); cursor: pointer;">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-2xl bg-[#059669] text-white border-2 border-white ring-4 ring-[#059669]/30">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span style="font-family: 'Plus Jakarta Sans', sans-serif;">${focusLocation.title || 'Searched Destination'}</span>
            </div>
            <div class="w-3 h-3 bg-[#059669] border-r border-b border-white rotate-45 mx-auto -mt-1.5 shadow-sm"></div>
          </div>
        `;
        const focusIcon = L.divIcon({
          className: 'focus-destination-marker',
          html: focusHtml,
          iconSize: [120, 48],
          iconAnchor: [60, 48]
        });
        const focusMarker = L.marker([focusLocation.lat, focusLocation.lng], { icon: focusIcon, zIndexOffset: 1500 }).addTo(markersLayer);
        focusMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #191715; font-size: 13px;">${focusLocation.title || 'Searched Destination'}</strong>
            <p style="color: #059669; font-size: 11px; margin: 4px 0 0; font-weight: bold;">Verified Location via Search</p>
          </div>
        `);
      }
    }

    // 3. Render Active Route Polyline & Maneuver Waypoints
    if (activeRoute && activeRoute.polyline.length > 1) {
      // High-contrast Route Line
      const routePolyline = L.polyline(activeRoute.polyline, {
        color: '#C84B31',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: travelMode === 'walk' ? '4, 10' : undefined
      }).addTo(map);

      routePolylineRef.current = routePolyline;

      // When navigating, highlight current step maneuver waypoint
      if (isNavigating && activeRoute.steps[activeStepIndex]) {
        const step = activeRoute.steps[activeStepIndex];
        const stepHtml = `
          <div class="flex items-center justify-center" style="transform: translate(-50%, -50%);">
            <div class="w-7 h-7 rounded-full bg-[#191715] text-white text-xs font-bold border-2 border-white shadow-xl flex items-center justify-center animate-bounce">
              ${activeStepIndex + 1}
            </div>
          </div>
        `;
        const stepIcon = L.divIcon({
          className: 'step-nav-marker',
          html: stepHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        L.marker(step.coordinates, { icon: stepIcon, zIndexOffset: 2000 }).addTo(markersLayer);
      }
    }
  };

  // Navigation handlers
  const handleStartNavigation = () => {
    setIsNavigating(true);
    setMapMode('directions');
    setActiveStepIndex(0);

    if (mapInstanceRef.current && activeRoute && activeRoute.polyline.length > 0) {
      mapInstanceRef.current.flyTo(activeRoute.polyline[0], 17, { duration: 1 });
    }
  };

  const handleNextStep = () => {
    if (!activeRoute) return;
    if (activeStepIndex < activeRoute.steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      const nextStep = activeRoute.steps[nextIdx];
      if (mapInstanceRef.current && nextStep) {
        mapInstanceRef.current.flyTo(nextStep.coordinates, 17, { duration: 0.8 });
      }
    } else {
      // Arrived
      alert(`You have arrived at ${activeRoute.destination.name}!`);
      setIsNavigating(false);
    }
  };

  const handlePrevStep = () => {
    if (!activeRoute || activeStepIndex <= 0) return;
    const prevIdx = activeStepIndex - 1;
    setActiveStepIndex(prevIdx);
    const prevStep = activeRoute.steps[prevIdx];
    if (mapInstanceRef.current && prevStep) {
      mapInstanceRef.current.flyTo(prevStep.coordinates, 17, { duration: 0.8 });
    }
  };

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 0.8 });
    }
  };

  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    if (activeRoute && activeRoute.polyline.length > 0) {
      const bounds = L.latLngBounds(activeRoute.polyline);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (displayItems.length > 0) {
      const bounds = L.latLngBounds(displayItems.map(it => [it.coordinates!.lat, it.coordinates!.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Helper for Maneuver Icons
  const renderManeuverIcon = (maneuver: RouteStep['maneuver']) => {
    switch (maneuver) {
      case 'turn-left':
      case 'slight-left':
        return <CornerUpLeft className="w-5 h-5 text-[#C84B31]" />;
      case 'turn-right':
      case 'slight-right':
        return <CornerUpRight className="w-5 h-5 text-[#C84B31]" />;
      case 'arrive':
        return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
      case 'depart':
      case 'straight':
      default:
        return <ArrowUp className="w-5 h-5 text-[#0284C7]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="interactive-map-modal"
        className="bg-[#F7F5F0] rounded-none sm:rounded-3xl w-full max-w-6xl h-[100dvh] sm:h-[94vh] max-h-[100dvh] sm:max-h-[880px] overflow-hidden flex flex-col shadow-2xl border-0 sm:border border-[#E5E0D8] relative"
      >
        
        {/* TOP HEADER BAR */}
        <div className="p-2.5 sm:px-6 bg-white border-b border-[#E5E0D8] flex items-center justify-between gap-2 z-30 shrink-0">
          
          {/* Title & Live Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-[#FAF5F0] text-[#C84B31] uppercase tracking-wider border border-[#F2DFD7] whitespace-nowrap">
                  Day {day.dayNumber}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-[#66605B] truncate flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-[#C84B31] shrink-0" />
                  <span className="truncate">{city}</span>
                </span>
              </div>
              <h2 className="text-xs sm:text-base font-bold text-[#191715] font-serif-display leading-tight truncate">
                Interactive Route Map
              </h2>
            </div>
          </div>

          {/* Quick Controls & GPS Preset Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* GPS Status & Calibration Dropdown */}
            <div className="relative">
              <button
                id="gps-calibration-btn"
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-colors ${
                  userLocation.isRealGPS 
                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' 
                    : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                }`}
                title="Calibrate GPS Location"
              >
                <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${userLocation.isRealGPS ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'}`}></span>
                <span className="max-w-[70px] sm:max-w-[130px] truncate">{userLocation.locationName}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Location Preset Menu */}
              {showPresetDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-[#F0ECE4] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#191715]">Calibrate GPS Location</span>
                    <button 
                      onClick={requestLiveGPS}
                      className="text-[11px] font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                    >
                      <Locate className="w-3 h-3" />
                      <span>Use Real GPS</span>
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-[#F7F5F0] py-1">
                    <button
                      onClick={requestLiveGPS}
                      className="w-full text-left p-2 hover:bg-[#FAF8F5] rounded-xl flex items-start gap-2 text-xs transition-colors"
                    >
                      <LocateFixed className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#191715]">Detect Device Live GPS</div>
                        <div className="text-[11px] text-[#736A62]">High accuracy device geolocation</div>
                      </div>
                    </button>
                    {FAMOUS_LOCATION_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className="w-full text-left p-2 hover:bg-[#FAF8F5] rounded-xl flex items-start gap-2 text-xs transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#C84B31] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#191715]">{preset.name}</div>
                          <div className="text-[11px] text-[#736A62]">{preset.description} ({preset.city})</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Mode Selector Toggle: Explore vs Directions */}
            <div className="hidden md:flex items-center bg-[#EDE8DF] p-0.5 rounded-xl border border-[#E5E0D8] text-xs">
              <button
                id="mode-explore-btn"
                onClick={() => {
                  setMapMode('explore');
                  setIsNavigating(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapMode === 'explore' 
                    ? 'bg-white text-[#191715] shadow-xs' 
                    : 'text-[#66605B] hover:text-[#191715]'
                }`}
              >
                Explore Stops
              </button>
              <button
                id="mode-directions-btn"
                onClick={() => setMapMode('directions')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mapMode === 'directions' 
                    ? 'bg-[#C84B31] text-white shadow-xs' 
                    : 'text-[#66605B] hover:text-[#191715]'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>
            </div>

            {/* Close Modal Button */}
            <button
              id="close-map-modal-btn"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EDE8DF] hover:bg-[#E5E0D8] text-[#191715] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close Map"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

          </div>
        </div>

        {/* Mobile View Switcher Bar (Map Canvas vs Stops & Directions) */}
        <div className="flex md:hidden items-center justify-between p-1.5 px-3 bg-[#FAF8F5] border-b border-[#E5E0D8] shrink-0 gap-2">
          <div className="grid grid-cols-2 flex-1 bg-[#EDE8DF] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setMobileView('map');
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
              }}
              className={`py-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mobileView === 'map' ? 'bg-white text-[#191715] shadow-xs font-black' : 'text-[#66605B]'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setMobileView('list')}
              className={`py-1 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mobileView === 'list' ? 'bg-white text-[#191715] shadow-xs font-black' : 'text-[#66605B]'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>Stops & Route ({validItems.length})</span>
            </button>
          </div>

          <div className="flex items-center bg-[#EDE8DF] p-0.5 rounded-xl border border-[#E5E0D8] text-[11px]">
            <button
              onClick={() => {
                const nextMode = mapMode === 'explore' ? 'directions' : 'explore';
                setMapMode(nextMode);
                if (nextMode === 'directions') setMobileView('list');
              }}
              className="px-2 py-1 rounded-lg font-bold bg-[#C84B31] text-white flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>{mapMode === 'explore' ? 'Directions' : 'Stops'}</span>
            </button>
          </div>
        </div>

        {/* MAIN BODY: SPLIT VIEW (Map Canvas + Side Control / Directions Deck) */}
        <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
          
          {/* MAP CANVAS CONTAINER */}
          <div className={`flex-1 h-full relative bg-[#EAE6DF] overflow-hidden ${mobileView === 'map' ? 'flex' : 'hidden md:flex'}`}>
            
            {/* The Leaflet Canvas (with 3D perspective pitch support) */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-full z-0" 
              id="leaflet-map-canvas"
              style={is3DActive ? {
                transform: `perspective(900px) rotateX(${tilt3D}deg) rotateZ(${rotation3D}deg) scale(1.18)`,
                transformOrigin: '50% 60%',
                transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              } : {
                transform: 'none',
                transition: 'transform 0.3s ease'
              }}
            />

            {/* FLOATING MAP TOOLS & CONTROLS */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E5E0D8] shadow-md">
              <button 
                onClick={handleCenterOnUser}
                className="p-2 hover:bg-[#F7F5F0] rounded-xl text-[#0284C7] transition-colors"
                title="Locate Me / Center on Live Location"
              >
                <Locate className="w-4 h-4" />
              </button>
              <button 
                onClick={handleFitRoute}
                className="p-2 hover:bg-[#F7F5F0] rounded-xl text-[#C84B31] transition-colors"
                title="Fit Route to Viewport"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="h-px w-full bg-[#E5E0D8]"></div>
              <button 
                onClick={() => {
                  if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
                }}
                className="p-2 hover:bg-[#F7F5F0] rounded-xl text-[#191715] transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
                }}
                className="p-2 hover:bg-[#F7F5F0] rounded-xl text-[#191715] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Map Style Selector Bottom Left */}
            <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#E5E0D8] shadow-sm text-xs">
                <Layers className="w-3.5 h-3.5 text-[#66605B] ml-1.5 mr-1" />
                {MAP_STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setMapStyle(style.id)}
                    className={`px-2 py-0.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      mapStyle === style.id ? 'bg-[#191715] text-white' : 'text-[#66605B] hover:text-[#191715]'
                    }`}
                    title={style.label}
                  >
                    <span>{style.icon}</span>
                    <span className="hidden md:inline">{style.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-md rounded-xl border border-[#E5E0D8] shadow-sm text-[10px] font-bold text-[#1E1E24]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-700">Google Maps</span>
              </div>
            </div>

            {/* ACTIVE NAVIGATION HUD (HEADS-UP DISPLAY OVERLAY) */}
            {isNavigating && activeRoute && (
              <div className="absolute inset-x-3 top-3 z-20 flex flex-col gap-2 pointer-events-none animate-in slide-in-from-top-3 duration-200">
                
                {/* Top Turn Guidance Banner */}
                <div className="bg-[#191715] text-white rounded-2xl p-4 shadow-2xl border border-white/20 pointer-events-auto flex items-center justify-between gap-4 max-w-xl mx-auto w-full">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#C84B31] text-white flex items-center justify-center shrink-0 shadow-md">
                      {renderManeuverIcon(activeRoute.steps[activeStepIndex]?.maneuver || 'straight')}
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-[#A8A29E] font-bold">
                        In {activeRoute.steps[activeStepIndex]?.distanceMeters || 100} meters
                      </div>
                      <div className="text-base font-bold text-white font-serif-display leading-snug">
                        {activeRoute.steps[activeStepIndex]?.instruction}
                      </div>
                      <div className="text-xs text-[#D6D3D1]">
                        {activeRoute.steps[activeStepIndex]?.secondaryText}
                      </div>
                      {activeRoute.steps[activeStepIndex]?.landmarkHint && (
                        <div className="text-[11px] text-[#FBBF24] font-medium mt-0.5">
                          💡 {activeRoute.steps[activeStepIndex]?.landmarkHint}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice Toggle */}
                  <button
                    onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                    title={isVoiceMuted ? 'Unmute Voice Prompts' : 'Mute Voice Prompts'}
                  >
                    {isVoiceMuted ? <VolumeX className="w-5 h-5 text-[#EF4444]" /> : <Volume2 className="w-5 h-5 text-[#10B981]" />}
                  </button>
                </div>

                {/* Bottom Navigation Status Card */}
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 px-5 shadow-2xl border border-[#E5E0D8] pointer-events-auto flex items-center gap-6 max-w-lg w-full justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#736A62]">Distance</div>
                      <div className="text-sm font-bold text-[#191715]">
                        {formatDistance(activeRoute.totalDistanceKm)}
                      </div>
                    </div>
                    <div className="h-7 w-px bg-[#E5E0D8]"></div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#736A62]">Remaining</div>
                      <div className="text-sm font-bold text-[#10B981]">
                        {formatDuration(activeRoute.totalDurationMin)}
                      </div>
                    </div>
                    <div className="h-7 w-px bg-[#E5E0D8]"></div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#736A62]">Speed</div>
                      <div className="text-sm font-bold text-[#191715]">
                        {travelMode === 'walk' ? '4.2 km/h' : travelMode === 'rickshaw' ? '18 km/h' : '22 km/h'}
                      </div>
                    </div>
                  </div>

                  {/* Step controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevStep}
                      disabled={activeStepIndex === 0}
                      className="p-1.5 rounded-lg border border-[#E5E0D8] text-[#191715] disabled:opacity-30 hover:bg-[#FAF8F5]"
                      title="Previous Maneuver"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <span className="text-xs font-bold text-[#191715]">
                      {activeStepIndex + 1}/{activeRoute.steps.length}
                    </span>
                    <button
                      onClick={handleNextStep}
                      className="px-3 py-1.5 rounded-lg bg-[#C84B31] text-white font-bold text-xs hover:bg-[#B33E26] flex items-center gap-1 shadow-xs"
                      title="Next Maneuver"
                    >
                      <span>{activeStepIndex === activeRoute.steps.length - 1 ? 'Finish' : 'Next Step'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsNavigating(false)}
                      className="p-1.5 rounded-lg text-[#66605B] hover:text-[#EF4444] hover:bg-[#FEE2E2]"
                      title="End Navigation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ── Google Maps Platform 10 Features Drawers & Overlays (Explore Map Modal) ── */}

            {/* 1. Compute Routes Drawer */}
            {mapMode === 'explore' && (
              <ComputeRoutesDrawer
                isOpen={activeExploreTool === 'routes'}
                onClose={() => setActiveExploreTool('none')}
                userCoords={userLocation}
                targetCoords={selectedItem?.coordinates ? { lat: selectedItem.coordinates.lat, lng: selectedItem.coordinates.lng, title: selectedItem.title } : null}
                activeRoute={activePlatformRoute}
                onSelectRoute={(rt) => setActivePlatformRoute(rt)}
              />
            )}

            {/* 2. Autocomplete Search Bar */}
            {mapMode === 'explore' && activeExploreTool === 'autocomplete' && (
              <AutocompleteSearchBar
                centerCoords={{ lat: userLocation.lat, lng: userLocation.lng }}
                onClose={() => setActiveExploreTool('none')}
                onSelectLocation={(loc) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 });
                  }
                  handleMapClickInspect(loc.lat, loc.lng);
                }}
              />
            )}

            {/* 3. Nearby Search Drawer */}
            {mapMode === 'explore' && (
              <NearbySearchDrawer
                isOpen={activeExploreTool === 'nearby'}
                onClose={() => setActiveExploreTool('none')}
                centerCoords={{ lat: userLocation.lat, lng: userLocation.lng }}
                onSelectPlace={handleSelectPlaceEntity}
              />
            )}

            {/* 4. Text Search Drawer */}
            {mapMode === 'explore' && (
              <TextSearchDrawer
                isOpen={activeExploreTool === 'textSearch'}
                onClose={() => setActiveExploreTool('none')}
                centerCoords={{ lat: userLocation.lat, lng: userLocation.lng }}
                onSelectPlace={handleSelectPlaceEntity}
              />
            )}

            {/* 5. Geocoding Tool */}
            {mapMode === 'explore' && (
              <GeocodingTool
                isOpen={activeExploreTool === 'geocoding'}
                onClose={() => {
                  setActiveExploreTool('none');
                  setIsInspectActive(false);
                }}
                centerCoords={{ lat: userLocation.lat, lng: userLocation.lng }}
                onFlyTo={(lat, lng) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
                  }
                }}
                isInspectActive={isInspectActive}
                onToggleInspect={(active) => setIsInspectActive(active)}
                inspectedLocation={inspectedLocation}
              />
            )}

            {/* 6. Maps Grounding Lite (MCP AI) */}
            {mapMode === 'explore' && (
              <MapsGroundingLiteModal
                isOpen={activeExploreTool === 'grounding'}
                onClose={() => setActiveExploreTool('none')}
                viewportCenter={{ lat: userLocation.lat, lng: userLocation.lng }}
                weatherBrief={weatherBrief}
                nearbyPlacesSummary={items.map(s => s.title)}
                onFlyTo={(lat, lng) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
                  }
                }}
              />
            )}

            {/* 7. Dynamic Maps Picker */}
            {mapMode === 'explore' && (
              <DynamicMapsPicker
                isOpen={activeExploreTool === 'styles'}
                onClose={() => setActiveExploreTool('none')}
                currentStyle={mapStyle}
                onSelectStyle={(newStyle) => setMapStyle(newStyle)}
              />
            )}

            {/* 8. Places UI Kit Card */}
            {mapMode === 'explore' && selectedPlaceEntity && (
              <PlacesUIKitCard
                place={selectedPlaceEntity}
                onClose={() => setSelectedPlaceEntity(null)}
                onNavigate={handleNavigatePlaceEntity}
              />
            )}

            {/* 9. 3D Maps Controls */}
            {mapMode === 'explore' && activeExploreTool === 'threeD' && (
              <ThreeDMapControls
                is3DActive={is3DActive}
                onToggle3D={(active) => setIs3DActive(active)}
                tilt={tilt3D}
                rotation={rotation3D}
                onChangeTilt={(t) => setTilt3D(t)}
                onChangeRotation={(r) => setRotation3D(r)}
                onReset={() => {
                  setIs3DActive(false);
                  setTilt3D(38);
                  setRotation3D(0);
                }}
                onClose={() => setActiveExploreTool('none')}
              />
            )}

            {/* 10. Weather Forecast Overlay Widget */}
            {mapMode === 'explore' && (
              <WeatherOverlayWidget
                isOpen={activeExploreTool === 'weather'}
                onClose={() => setActiveExploreTool('none')}
                centerCoords={{ lat: userLocation.lat, lng: userLocation.lng }}
                onWeatherLoaded={(brief) => setWeatherBrief(brief)}
              />
            )}
            {/* Mobile Bottom Quick Stop Card (when viewing map full-screen on mobile) */}
            <div className="absolute bottom-3 inset-x-3 md:hidden z-10 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E5E0D8] shadow-xl flex items-center justify-between gap-2 pointer-events-auto">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-extrabold text-[#C84B31] flex items-center gap-1">
                    <span>Active Destination</span>
                  </div>
                  <div className="text-xs font-black text-[#191715] truncate">
                    {selectedItem?.title || displayItems[0]?.title || 'Day ' + day.dayNumber + ' Stops'}
                  </div>
                  <div className="text-[10px] text-[#736A62] truncate">
                    {selectedItem?.time || displayItems[0]?.time || ''} • {selectedItem?.category || 'Itinerary Stop'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      if (selectedItem) setDestinationId(selectedItem.id);
                      setMapMode('directions');
                      setMobileView('list');
                    }}
                    className="px-2.5 py-1.5 bg-[#C84B31] hover:bg-[#B33E26] text-white text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </button>
                  <button
                    onClick={() => setMobileView('list')}
                    className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#EDE8DF] border border-[#E5E0D8] text-[#191715] text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    All Stops
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT / SIDE PANEL: DIRECTIONS & EXPLORE DECK */}
          <div className={`w-full md:w-[380px] lg:w-[420px] bg-white border-t md:border-t-0 md:border-l border-[#E5E0D8] flex flex-col flex-1 md:h-full overflow-hidden shadow-lg z-20 ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
            
            {/* VIEW 1: DIRECTIONS & ROUTE ENGINE */}
            {mapMode === 'directions' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Mode Selector (Walk, Rickshaw, Metro, Cab) */}
                <div className="p-3 bg-[#FAF8F5] border-b border-[#E5E0D8]">
                  <div className="text-[11px] font-bold text-[#736A62] uppercase tracking-wider mb-2">
                    Select Mode of Travel
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'walk' as NavTravelMode, label: 'Walking', icon: <Footprints className="w-4 h-4" />, sub: 'Bazaars' },
                      { id: 'rickshaw' as NavTravelMode, label: 'Auto', icon: <Car className="w-4 h-4" />, sub: 'Meter' },
                      { id: 'metro' as NavTravelMode, label: 'Metro', icon: <Train className="w-4 h-4" />, sub: 'Transit' },
                      { id: 'cab' as NavTravelMode, label: 'Cab', icon: <Car className="w-4 h-4" />, sub: 'AC Taxi' },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setTravelMode(m.id)}
                        className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                          travelMode === m.id
                            ? 'bg-[#191715] text-white border-[#191715] shadow-xs'
                            : 'bg-white text-[#575049] border-[#E5E0D8] hover:border-[#C84B31]'
                        }`}
                      >
                        {m.icon}
                        <div className="text-xs font-bold leading-none">{m.label}</div>
                        <div className={`text-[10px] leading-none ${travelMode === m.id ? 'text-[#D6D3D1]' : 'text-[#8C827A]'}`}>
                          {m.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origin & Destination Pickers */}
                <div className="p-3.5 border-b border-[#E5E0D8] space-y-2">
                  
                  {/* Origin */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center shrink-0">
                      <Locate className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase font-bold text-[#736A62]">Start Point</div>
                      <select
                        value={originType}
                        onChange={(e) => setOriginType(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-2.5 py-1 text-xs font-bold text-[#191715] focus:outline-none focus:ring-1 focus:ring-[#C84B31]"
                      >
                        <option value="user">📍 {userLocation.locationName} (Current)</option>
                        {validItems.map(it => (
                          <option key={`orig-${it.id}`} value={it.id}>
                            🏛️ {it.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#C84B31]/15 text-[#C84B31] flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase font-bold text-[#736A62]">Destination</div>
                      <select
                        value={destinationId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-2.5 py-1 text-xs font-bold text-[#191715] focus:outline-none focus:ring-1 focus:ring-[#C84B31]"
                      >
                        {validItems.map(it => (
                          <option key={`dest-${it.id}`} value={it.id}>
                            🎯 {it.title} ({it.cost === 0 ? 'Free' : `₹${it.cost}`})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                {/* Route Summary Metrics & Action Buttons */}
                {activeRoute && (
                  <div className="p-3 bg-[#FBF9F6] border-b border-[#E5E0D8]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#191715] font-serif-display">
                          {formatDuration(activeRoute.totalDurationMin)}
                        </span>
                        <span className="text-xs text-[#736A62]">
                          ({formatDistance(activeRoute.totalDistanceKm)})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{activeRoute.estimatedCostInr === 0 ? 'Free Route' : `~₹${activeRoute.estimatedCostInr}`}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#736A62] mb-3">
                      {activeRoute.fareBreakdown}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2">
                      <button
                        id="start-live-navigation-btn"
                        onClick={handleStartNavigation}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#C84B31] hover:bg-[#B33E26] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Start Live Navigation</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${activeRoute.origin.lat},${activeRoute.origin.lng}&destination=${activeRoute.destination.lat},${activeRoute.destination.lng}&travelmode=${travelMode === 'walk' ? 'walking' : travelMode === 'metro' ? 'transit' : 'driving'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] text-[#191715] transition-colors flex items-center justify-center shrink-0"
                        title="Open in Google Maps Turn-by-Turn"
                      >
                        <ExternalLink className="w-4 h-4 text-[#0284C7]" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Turn-by-Turn Maneuvers List */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
                  <div className="text-[11px] font-bold text-[#736A62] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Turn-by-Turn Steps ({activeRoute?.steps.length || 0})</span>
                    <span className="text-[10px] text-[#0284C7] font-semibold">Tap step to inspect</span>
                  </div>

                  {activeRoute?.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      onClick={() => {
                        setActiveStepIndex(idx);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo(step.coordinates, 17, { duration: 0.8 });
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        activeStepIndex === idx
                          ? 'bg-[#FAF5F0] border-[#C84B31] shadow-xs ring-1 ring-[#C84B31]/20'
                          : 'bg-white border-[#E5E0D8] hover:border-[#C84B31]'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] shrink-0 mt-0.5">
                        {renderManeuverIcon(step.maneuver)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-[#191715]">
                            {step.instruction}
                          </span>
                          <span className="text-[10px] font-bold text-[#736A62] shrink-0">
                            {step.distanceMeters} m
                          </span>
                        </div>
                        <p className="text-[11px] text-[#66605B] line-clamp-1">
                          {step.secondaryText}
                        </p>
                        {step.landmarkHint && (
                          <div className="text-[10px] text-[#B45309] font-medium mt-1">
                            📍 {step.landmarkHint}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Local Advisory Box */}
                  {activeRoute?.localTransitAlerts && activeRoute.localTransitAlerts.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs space-y-1">
                      <div className="font-bold text-[#92400E] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Indian Transit Advisory</span>
                      </div>
                      {activeRoute.localTransitAlerts.map((alert, i) => (
                        <div key={i} className="text-[11px] text-[#78350F] pl-4 list-disc">
                          • {alert}
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              
              /* VIEW 2: EXPLORE STOPS & ITINERARY PREVIEW */
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Category Filters */}
                <div className="p-3 bg-[#FAF8F5] border-b border-[#E5E0D8] overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'all', label: `All Stops (${validItems.length})` },
                      { id: 'transit', label: '🚆 Transit' },
                      { id: 'cultural_sight', label: '🏛️ Sights' },
                      { id: 'culinary', label: '🍛 Food' },
                      { id: 'cultural_buy', label: '🛍️ Shopping' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setActiveCategoryFilter(f.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          activeCategoryFilter === f.id
                            ? 'bg-[#191715] text-white shadow-xs'
                            : 'text-[#66605B] hover:bg-[#EDE8DF]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Item Preview Card */}
                {selectedItem ? (
                  <div className="p-3.5 border-b border-[#E5E0D8] bg-[#FAF5F0]/60">
                    <div className="flex gap-3">
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5E0D8]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#C84B31] uppercase border border-[#F2DFD7]">
                            {selectedItem.category.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-0.5 text-xs font-bold text-[#10B981] bg-white px-2 py-0.5 rounded border border-[#A7F3D0]">
                            <IndianRupee className="w-3 h-3" />
                            <span>{selectedItem.cost === 0 ? 'Free' : selectedItem.cost.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-[#191715] truncate font-serif-display">
                          {selectedItem.title}
                        </h4>

                        <div className="flex items-center gap-1 text-[11px] text-[#736A62] truncate mb-1">
                          <MapPin className="w-3 h-3 text-[#C84B31] shrink-0" />
                          <span className="truncate">{selectedItem.location}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#736A62]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C84B31]" />
                            {selectedItem.time} ({selectedItem.duration})
                          </span>
                          {selectedItem.rating && (
                            <span className="flex items-center gap-0.5 font-bold text-[#191715]">
                              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                              {selectedItem.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDestinationId(selectedItem.id);
                          setMapMode('directions');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#C84B31] text-white font-bold text-xs hover:bg-[#B33E26] shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate Here</span>
                      </button>

                      {selectedItem.coordinates && (
                        <button
                          onClick={() => {
                            if (mapInstanceRef.current && selectedItem.coordinates) {
                              mapInstanceRef.current.flyTo(
                                [selectedItem.coordinates.lat, selectedItem.coordinates.lng], 
                                16, 
                                { duration: 0.8 }
                              );
                            }
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] text-[#191715]"
                          title="Center Map on this Stop"
                        >
                          <Maximize2 className="w-4 h-4 text-[#C84B31]" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#736A62]">
                    Select any stop on the map or list to view directions and details.
                  </div>
                )}

                {/* List of All Stops on this Day */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  <div className="text-[11px] font-bold text-[#736A62] uppercase tracking-wider mb-1">
                    Day Stops ({displayItems.length})
                  </div>

                  {displayItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setDestinationId(item.id);
                        if (mapInstanceRef.current && item.coordinates) {
                          mapInstanceRef.current.flyTo([item.coordinates.lat, item.coordinates.lng], 15, { duration: 0.8 });
                        }
                        setMobileView('map');
                        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selectedItem?.id === item.id
                          ? 'bg-[#FAF5F0] border-[#C84B31] shadow-xs'
                          : 'bg-white border-[#E5E0D8] hover:border-[#C84B31]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E5E0D8]"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#191715] truncate font-serif-display">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-[#736A62] truncate flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C84B31]" />
                            {item.time} • {item.cost === 0 ? 'Free' : `₹${item.cost}`}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDestinationId(item.id);
                          setSelectedItem(item);
                          setMapMode('directions');
                          setMobileView('map');
                          setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE8DF] text-[#C84B31] text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Get directions to this stop"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Route</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
