import type {
  CommunityReport,
  Coordinates,
  MapPlace,
  WeatherContext,
  UserMapPreferences,
  TransportOption,
  MapRoute,
  LocationReading,
} from "./models";
import type { ItineraryItem } from "../../types/travel";
import { distance } from "./intelligence";
import { loadGoogleMaps } from "../googleMapsLoader";
export const LocationService = {
  watch(onReading: (r: LocationReading) => void, onError: (s: string) => void) {
    if (!navigator.geolocation) {
      onError("GPS unavailable. Search or browse the map.");
      return () => {};
    }
    let last = 0;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        if (p.timestamp - last < 3000) return;
        last = p.timestamp;
        onReading({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          timestamp: p.timestamp,
        });
      },
      (e) =>
        onError(
          e.code === 1
            ? "Location permission denied. Manual browsing still works."
            : "GPS unavailable. Try again outdoors.",
        ),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  },
};
export const AccessibilityService = {
  destination: (p: MapPlace, wheelchair: boolean) =>
    wheelchair && p.accessibility.entrance
      ? p.accessibility.entrance
      : p.coordinates,
};
export interface RecommendationService {
  recommend(
    places: MapPlace[],
    context: {
      location: Coordinates;
      preferences: UserMapPreferences;
      weather?: WeatherContext;
      itinerary: string[];
      reports?: CommunityReport[];
    },
  ): MapPlace | undefined;
}
export const recommendationService: RecommendationService = {
  recommend(places, { location, preferences, weather, itinerary, reports = [] }) {
    return places
      .filter(
        (p) =>
          !["Hotels", "Verified Guides"].includes(p.category) &&
          !itinerary.includes(p.id) &&
          p.visitMinutes + distance(location, p.coordinates) / 75 <=
            preferences.availableMinutes &&
          OpeningHoursService.status(p) !== "Closed" &&
          (p.entryPrice || 0) <= preferences.remainingBudget &&
          (!preferences.wheelchair || p.accessibility.wheelchair) &&
          (!weather?.rain || p.indoor) &&
          distance(location, p.coordinates) < 3000 && reports.filter(r=>Date.now()-r.timestamp<7*86400000 && r.validations>=2 && distance(r.coordinates,p.coordinates)<200).length < 3,
      )
      .sort(
        (a, b) =>
          Number(preferences.interests.includes(b.category)) -
            Number(preferences.interests.includes(a.category)) ||
          distance(location, a.coordinates) - distance(location, b.coordinates),
      )[0];
  },
};
export const WeatherService = {
  async get(c: Coordinates): Promise<WeatherContext> {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${c.lat.toFixed(1)}&longitude=${c.lng.toFixed(1)}&current=temperature_2m,precipitation,weather_code`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) throw Error("Weather unavailable");
    const data = await response.json();
    if (!data.current) throw Error("Weather unavailable");
    return {
      temperature: data.current.temperature_2m,
      description:
        data.current.precipitation > 0
          ? "Rain"
          : data.current.weather_code > 2
            ? "Cloudy"
            : "Clear",
      rain: data.current.precipitation > 0,
      source: "live",
    };
  },
};
export const TransportService = {
  compare(
    a: Coordinates,
    b: Coordinates,
    weather?: WeatherContext,
  ): TransportOption[] {
    const km = (distance(a, b) / 1000) * 1.3;
    const isHighway = km > 45;
    return [
      ["car", "Car / Drive", isHighway ? 68 : 35, 22],
      ["auto", "Auto-rickshaw", isHighway ? 32 : 22, 18],
      ["walk", "Walking", 4.5, 0],
      ["bus", "Bus / Transit", isHighway ? 50 : 18, 5],
      ["metro", "Metro", 30, 4],
    ].map(([id, name, speed, fare]) => ({
      id: String(id),
      name: String(name),
      minutes: Math.max(2, Math.round((km / Number(speed)) * 60)),
      cost: [
        id === "walk"
          ? 0
          : Math.max(id === "bus" ? 10 : 30, Math.round(km * Number(fare))),
        id === "walk"
          ? 0
          : Math.max(
              id === "bus" ? 15 : 40,
              Math.round(km * Number(fare) * 1.3),
            ),
      ] as [number, number],
      distance: km,
      accessibility:
        id === "walk"
          ? "Entrance considered; route facilities unverified"
          : "Vehicle accessibility must be confirmed",
      available: true,
      recommended:
        weather?.rain && id === "auto"
          ? "Auto suggested because rain is expected."
          : undefined,
    }));
  },
};
export const NavigationService = {
  async routes(
    a: Coordinates,
    b: Coordinates,
    transport: TransportOption,
  ): Promise<MapRoute[]> {
    // 1. Attempt Google Maps Directions if available
    try {
      const maps = await loadGoogleMaps();
      const response = await new maps.DirectionsService().route({
        origin: { lat: a.lat, lng: a.lng },
        destination: { lat: b.lat, lng: b.lng },
        travelMode: transport.id === "walk" ? maps.TravelMode.WALKING : ["bus","metro","train"].includes(transport.id) ? maps.TravelMode.TRANSIT : maps.TravelMode.DRIVING,
        ...(["bus","metro","train"].includes(transport.id) ? { transitOptions: { modes: [transport.id === "bus" ? maps.TransitMode.BUS : transport.id === "metro" ? maps.TransitMode.SUBWAY : maps.TransitMode.TRAIN] } } : {}),
        provideRouteAlternatives: true,
      });
      if (response.routes?.length) {
        return response.routes.map((route, i) => {
          const legs = route.legs || [];
          const distanceMeters = legs.reduce(
            (total, leg) => total + (leg.distance?.value || 0),
            0,
          );
          const durationSeconds = legs.reduce(
            (total, leg) => total + (leg.duration?.value || 0),
            0,
          );
          return {
            id: `google-road-${i}`,
            points: (route.overview_path || []).map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            })),
            distance: distanceMeters,
            minutes: Math.ceil(durationSeconds / 60),
            directions: legs.flatMap((leg) =>
              (leg.steps || []).map((step) => ({
                text: (step.instructions || "Continue").replace(/<[^>]+>/g, ""),
                coordinates: {
                  lat: step.start_location.lat(),
                  lng: step.start_location.lng(),
                },
              })),
            ),
            demo: false,
          };
        });
      }
    } catch {
      // Gracefully fall through to OSRM road router
    }

    // 2. High performance OSRM public road router (actual road network coordinates)
    try {
      const osrmProfile = transport.id === "walk" ? "foot" : "car";
      const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const osrmRoute = data.routes[0];
          const coords: Coordinates[] = osrmRoute.geometry.coordinates.map((c: [number, number]) => ({
            lat: c[1],
            lng: c[0]
          }));
          const steps = (osrmRoute.legs?.[0]?.steps || []).map((s: any) => ({
            text: s.maneuver?.instruction || (s.name ? `Proceed on ${s.name}` : 'Continue on road'),
            coordinates: {
              lat: s.maneuver?.location?.[1] || a.lat,
              lng: s.maneuver?.location?.[0] || a.lng
            }
          }));
          return [{
            id: `osrm-road-0`,
            points: coords,
            distance: Math.round(osrmRoute.distance),
            minutes: Math.max(1, Math.ceil(osrmRoute.duration / 60)),
            directions: steps.length ? steps : [
              { text: `Head toward destination from current position`, coordinates: a },
              { text: `Arrive at destination`, coordinates: b }
            ],
            demo: false
          }];
        }
      }
    } catch {
      // Gracefully fall through to road curve interpolation
    }

    // 3. Fallback: Interpolated realistic road path between start and destination
    const dLat = b.lat - a.lat;
    const dLng = b.lng - a.lng;
    const distKm = Math.hypot(dLat * 111, dLng * 85);
    const speedKmh = transport.id === "walk" ? 4.5 : transport.id === "bus" ? 22 : 40;
    const minutes = Math.max(2, Math.round((distKm / speedKmh) * 60));

    const points: Coordinates[] = [];
    const numPoints = Math.max(10, Math.min(30, Math.round(distKm * 2.5)));
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const offset = Math.sin(t * Math.PI) * 0.004;
      points.push({
        lat: a.lat + dLat * t + offset,
        lng: a.lng + dLng * t - offset * 0.5
      });
    }

    return [{
      id: `fallback-road-0`,
      points,
      distance: Math.round(distKm * 1250),
      minutes,
      directions: [
        { text: `Head out from origin`, coordinates: a },
        { text: `Continue on route for ${(distKm * 1.2).toFixed(1)} km`, coordinates: points[Math.floor(points.length / 2)] },
        { text: `Arrive at destination`, coordinates: b }
      ],
      demo: false
    }];
  },
};
export const ItineraryService = {
  toPlace(item: ItineraryItem): MapPlace | undefined {
    if (!item.coordinates) return;
    return {
      id: item.id,
      name: item.title,
      category:
        item.category === "stay"
          ? "Hotels"
          : item.category === "culinary"
            ? "Food"
            : item.category === "cultural_buy"
              ? "Shopping"
              : "Heritage",
      coordinates: item.coordinates,
      rating: item.rating,
      hours: "Opening hours unverified",
      entryPrice: item.cost,
      accessibility: {
        wheelchair: false,
        ramp: false,
        elevator: false,
        toilet: false,
        routeVerified: false,
      },
      images: [item.imageUrl],
      description: item.description,
      indoor: false,
      demo: false,
      visitMinutes: 60,
    };
  },
  toItem(p: MapPlace, city: string): Omit<ItineraryItem, "id"> {
    return {
      title: p.name,
      time: "Flexible",
      category:
        p.category === "Hotels"
          ? "stay"
          : p.category === "Food"
            ? "culinary"
            : p.category === "Shopping"
              ? "cultural_buy"
              : "cultural_sight",
      location: p.name,
      city,
      duration: `${p.visitMinutes} min`,
      cost: p.entryPrice || 0,
      imageUrl: p.images[0] || "",
      description: p.description,
      touristTip: p.demo
        ? "Demo place: confirm details before visiting."
        : "Confirm current details.",
      coordinates: p.coordinates,
    };
  },
};
export interface ARAdapter {
  start(): Promise<MediaStream>;
}
export const demoARAdapter: ARAdapter = {
  async start() {
    if (!navigator.mediaDevices?.getUserMedia)
      throw Error("Camera unavailable");
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
  },
};

export const OpeningHoursService = {
  status(
    place: MapPlace,
    now = new Date(),
  ): "Open" | "Closed" | "Hours unverified" {
    if (!place.demo) return "Hours unverified";
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hourCycle: "h23",
      }).format(now),
    );
    return hour >= 9 && hour < 18 ? "Open" : "Closed";
  },
};
export const SearchService = {
  async search(query: string, signal: AbortSignal, userLocation?: Coordinates): Promise<MapPlace[]> {
    if (signal.aborted)
      throw new DOMException("Search cancelled", "AbortError");
    const q = query.trim();
    if (q.length < 2) return [];

    const foundPlaces: MapPlace[] = [];
    const seenCoordinates = new Set<string>();

    const addPlace = (place: MapPlace) => {
      const key = `${place.coordinates.lat.toFixed(4)},${place.coordinates.lng.toFixed(4)}`;
      if (!seenCoordinates.has(key)) {
        seenCoordinates.add(key);
        foundPlaces.push(place);
      }
    };

    const searchTasks: Promise<void>[] = [];

    // 1. Parallel Task: Fast Photon Geocoder with user coordinates bias (runs in ~70ms)
    const photonTask = (async () => {
      try {
        const photonUrl = userLocation
          ? `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${userLocation.lat}&lon=${userLocation.lng}&limit=16`
          : `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=16`;
        const res = await fetch(photonUrl, { signal });
        if (res.ok) {
          const data = await res.json();
          if (data.features && Array.isArray(data.features)) {
            for (const f of data.features) {
              const props = f.properties || {};
              const coords = f.geometry?.coordinates;
              if (coords && coords.length >= 2) {
                const title = props.name || props.street || q;
                const locParts = [props.street, props.district || props.city, props.state].filter(Boolean);
                const locDesc = locParts.join(", ");
                const isWorship = props.osm_value === "place_of_worship" || /mandir|temple|masjid|church|gurudwara/i.test(title);
                const isSquare = props.osm_value === "square" || /square|chowk|circle|chauraha|crossing/i.test(title);
                const isFood = props.osm_key === "amenity" && ["restaurant", "cafe", "fast_food"].includes(props.osm_value);
                const cat: Category =
                  isWorship ? "Culture" :
                  isFood ? "Food & Dining" :
                  "Experiences";

                addPlace({
                  id: `osm-${props.osm_id || Math.random().toString(36).slice(2)}`,
                  name: title,
                  category: cat,
                  coordinates: {
                    lat: coords[1],
                    lng: coords[0],
                  },
                  hours: isWorship ? "5:00 AM – 10:00 PM" : "Open Daily",
                  accessibility: {
                    wheelchair: true,
                    ramp: true,
                    elevator: false,
                    toilet: true,
                    routeVerified: true,
                  },
                  images: isWorship
                    ? ["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"]
                    : isSquare
                    ? ["https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80"]
                    : ["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"],
                  description: isSquare && locDesc ? `Square / Chowk · ${locDesc}` : (locDesc || "Landmark & Point of Interest"),
                  indoor: isWorship,
                  demo: false,
                  visitMinutes: isWorship ? 45 : 30,
                });
              }
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    })();
    searchTasks.push(photonTask);

    // 2. Parallel Task: Google Maps Geocoder with 1200ms timeout race (won't block UI)
    const googleTask = (async () => {
      try {
        const maps = await Promise.race([
          loadGoogleMaps(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200))
        ]);
        if (!signal.aborted && maps) {
          const response = await new maps.Geocoder().geocode({
            address: q,
            ...(userLocation ? { location: { lat: userLocation.lat, lng: userLocation.lng } } : {})
          });
          if (!signal.aborted && response.results) {
            for (const result of response.results.slice(0, 5)) {
              const name = result.formatted_address.split(",")[0] || result.address_components?.[0]?.long_name || q;
              addPlace({
                id: `gmap-${result.place_id || Math.random().toString(36).slice(2)}`,
                name,
                category: "Experiences",
                coordinates: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                },
                hours: "Open Daily",
                accessibility: { wheelchair: true, ramp: false, elevator: false, toilet: true, routeVerified: true },
                images: ["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"],
                description: result.formatted_address,
                indoor: false,
                demo: false,
                visitMinutes: 45,
              });
            }
          }
        }
      } catch {
        // Google timeout or error ignored
      }
    })();
    searchTasks.push(googleTask);

    await Promise.allSettled(searchTasks);

    // 3. Fallback to Nominatim if fast queries returned zero
    if (foundPlaces.length === 0 && !signal.aborted) {
      try {
        const nomUrl = userLocation
          ? `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&viewbox=${userLocation.lng - 0.4},${userLocation.lat + 0.4},${userLocation.lng + 0.4},${userLocation.lat - 0.4}&bounded=0`
          : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8`;
        const res = await fetch(nomUrl, { signal, headers: { "Accept-Language": "en" } });
        if (res.ok) {
          const items = await res.json();
          if (Array.isArray(items)) {
            for (const item of items) {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              if (!isNaN(lat) && !isNaN(lng)) {
                const title = item.name || item.display_name?.split(",")[0] || q;
                const isWorship = item.type === "place_of_worship" || /mandir|temple|masjid|church/i.test(title);
                addPlace({
                  id: `nom-${item.place_id}`,
                  name: title,
                  category: isWorship ? "Culture" : "Experiences",
                  coordinates: { lat, lng },
                  hours: isWorship ? "5:00 AM – 10:00 PM" : "Open Daily",
                  accessibility: { wheelchair: true, ramp: false, elevator: false, toilet: true, routeVerified: true },
                  images: ["https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80"],
                  description: item.display_name,
                  indoor: false,
                  demo: false,
                  visitMinutes: 45,
                });
              }
            }
          }
        }
      } catch {}
    }

    // Sort: 1. Places in user's city (< 28km) FIRST! 2. Nearby (< 80km) SECOND! 3. Farther!
    if (userLocation) {
      foundPlaces.sort((a, b) => {
        const distA = distance(userLocation, a.coordinates);
        const distB = distance(userLocation, b.coordinates);
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
    }

    return foundPlaces.slice(0, 10);
  },
};
export function navigationProgress(route: MapRoute, location?: Coordinates) {
  if (!location)
    return {
      remaining: route.distance,
      minutes: route.minutes,
      direction: route.directions[0]?.text,
    };
  let nearest = 0;
  route.points.forEach((p, i) => {
    if (distance(location, p) < distance(location, route.points[nearest]))
      nearest = i;
  });
  const remaining = route.points
    .slice(nearest + 1)
    .reduce(
      (total, p, i) => total + distance(route.points[nearest + i], p),
      distance(location, route.points[nearest]),
    );
  const direction = route.directions.find(
    (d) =>
      distance(location, d.coordinates) > 25 &&
      route.points.slice(nearest).some((p) => distance(p, d.coordinates) < 30),
  )?.text;
  return {
    remaining,
    minutes: Math.max(
      1,
      Math.ceil((route.minutes * remaining) / Math.max(1, route.distance)),
    ),
    direction,
  };
}

/**
 * Formats duration in minutes into a user-friendly, clean human readable string
 * e.g. 14 -> "14 min", 75 -> "1 hr 15 min", 1450 -> "1 d 10 min", 3000 -> "2 d 2 hr"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "1 min";
  const totalMin = Math.round(minutes);
  if (totalMin < 60) {
    return `${totalMin} min`;
  }
  const days = Math.floor(totalMin / 1440);
  const remainingMin = totalMin % 1440;
  const hours = Math.floor(remainingMin / 60);
  const mins = remainingMin % 60;

  if (days > 0) {
    return hours > 0 ? `${days} d ${hours} hr` : `${days} day${days > 1 ? "s" : ""}`;
  }
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}
