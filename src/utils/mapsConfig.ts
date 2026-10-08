/**
 * Google Maps Configuration & Utilities
 * Uses the user's provided Google Maps API key
 */

export const GOOGLE_MAPS_API_KEYS = ["AIzaSyBQB2k8ueh9Ub9RI1JmQTexKLjW6bH1sXs"];

// Existing consumers that only need one key continue to use the active primary key.
export const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEYS[0];

export type GoogleMapStyleType =
  | "google-streets" // Standard Google Roadmap
  | "google-satellite" // Pure Satellite Imagery
  | "google-hybrid" // Satellite + Roads/Labels
  | "google-terrain" // Terrain + Elevation + Roads
  | "google-traffic"; // Roadmap with live traffic overlay

export interface MapStyleOption {
  id: GoogleMapStyleType;
  label: string;
  icon: string;
  badge?: string;
}

export const MAP_STYLE_OPTIONS: MapStyleOption[] = [
  { id: "google-streets", label: "Google Maps", icon: "🗺️", badge: "HD" },
  { id: "google-satellite", label: "Satellite", icon: "🛰️" },
  { id: "google-hybrid", label: "Hybrid", icon: "🏷️" },
  { id: "google-terrain", label: "Terrain", icon: "⛰️" },
  { id: "google-traffic", label: "Traffic", icon: "🚗", badge: "Live" },
];

/**
 * Returns the tile URL and configuration for a given map style
 */
export function getMapTileConfig(style: GoogleMapStyleType | string) {
  const apiKey = GOOGLE_MAPS_API_KEY;

  switch (style) {
    case "google-satellite":
      return {
        url: `https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${apiKey}`,
        subdomains: "0123",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a> Imagery',
        isGoogle: true,
      };

    case "google-hybrid":
      return {
        url: `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${apiKey}`,
        subdomains: "0123",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
        isGoogle: true,
      };

    case "google-terrain":
      return {
        url: `https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${apiKey}`,
        subdomains: "0123",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a> Terrain',
        isGoogle: true,
      };

    case "google-traffic":
      return {
        url: `https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}&key=${apiKey}`,
        subdomains: "0123",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a> Live Traffic',
        isGoogle: true,
      };

    case "google-streets":
    case "voyager":
    default:
      // Default: Google Maps Standard Roadmap
      return {
        url: `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${apiKey}`,
        subdomains: "0123",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
        isGoogle: true,
      };
  }
}

/**
 * Generate a direct Google Maps Directions URL
 */
export function getGoogleMapsDirectionsUrl(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: "driving" | "walking" | "transit" = "walking",
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${travelMode}`;
}

/**
 * Generate a Google Maps Place / Location URL
 */
export function getGoogleMapsLocationUrl(
  lat: number,
  lng: number,
  placeName?: string,
): string {
  if (placeName) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}+${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
