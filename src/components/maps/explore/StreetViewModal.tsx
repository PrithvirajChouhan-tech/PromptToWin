import React, { useEffect, useRef, useState } from "react";
import { X, RotateCw, ExternalLink } from "lucide-react";
import { loadGoogleMaps } from "../../../services/googleMapsLoader";
interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lng: number; name?: string; address?: string };
}
export const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Finding Street View imagery…");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    let panorama: google.maps.StreetViewPanorama | undefined;
    let errorWatch: ReturnType<typeof setInterval> | undefined;
    setStatus("Finding Street View imagery…");
    const authError = () =>
      setStatus(
        "Google Street View is not enabled for this key. Enable Maps JavaScript API and Street View, and allow this site's referrer in Google Cloud.",
      );
    window.addEventListener("yatra-google-auth-error", authError);
    loadGoogleMaps()
      .then(async (maps) => {
        const response = await new maps.StreetViewService().getPanorama({
          location: { lat: location.lat, lng: location.lng },
          radius: 100,
          preference: maps.StreetViewPreference.NEAREST,
        });
        if (!active || !container.current) return;
        if (!response.data.location?.pano)
          throw new Error(
            "No Street View imagery is available within 100 m of this location.",
          );
        panorama = new maps.StreetViewPanorama(container.current, {
          pano: response.data.location.pano,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: true,
          fullscreenControl: true,
          linksControl: true,
          motionTracking: false,
          motionTrackingControl: false,
        });
        // Google can render its error surface after the panorama promise resolves
        // when the key has no billing/referrer authorization. Keep that surface
        // out of the product and return the user to a clean fallback state.
        errorWatch = setInterval(() => {
          const root = container.current;
          const googleError = root?.querySelector(
            ".gm-err-container, .gm-err-autocomplete, .gm-err-message",
          );
          const errorText = root?.textContent || "";
          if (
            active &&
            (googleError ||
              /can't load Google Maps correctly|for development purposes only/i.test(
                errorText,
              ))
          ) {
            if (errorWatch) clearInterval(errorWatch);
            if (panorama) {
              panorama.setVisible(false);
              maps.event.clearInstanceListeners(panorama);
            }
            // Remove Google's injected authorization dialog and any degraded
            // panorama canvas before showing our own fallback state.
            root?.replaceChildren();
            setStatus(
              "Google Street View could not authorize this key. Enable Maps JavaScript API and Street View, and allow this site's referrer.",
            );
          }
        }, 250);
        panorama.addListener("status_changed", () => {
          if (active && panorama?.getStatus() !== maps.StreetViewStatus.OK)
            setStatus(
              "Street View imagery could not load. Retry or return to the map.",
            );
        });
        setStatus("");
      })
      .catch((error) => {
        if (active)
          setStatus(
            String(error?.message || "").includes("ZERO_RESULTS")
              ? "No Street View imagery is available within 100 m of this location."
              : String(error?.message || "").includes("REQUEST_DENIED")
                ? "Google Street View access was denied. Check API activation and website restrictions."
                : error?.message ||
                  "Street View unavailable here. Try another location.",
          );
      });
    return () => {
      active = false;
      window.removeEventListener("yatra-google-auth-error", authError);
      if (errorWatch) clearInterval(errorWatch);
      if (panorama) {
        google.maps.event.clearInstanceListeners(panorama);
        panorama.setVisible(false);
      }
      container.current?.replaceChildren();
    };
  }, [isOpen, location.lat, location.lng, retry]);
  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      className="sm-streetview fixed inset-0 z-[3000] bg-stone-100 flex flex-col"
      style={{ filter: "none", colorScheme: "light", isolation: "isolate" }}
      role="dialog"
      aria-modal="true"
      aria-label="Google Street View"
    >
      <div className="bg-white px-4 py-3 flex items-center justify-between gap-3 border-b">
        <div>
          <strong className="text-sm">
            Street View · {location.name || "Selected map location"}
          </strong>
          <p className="text-xs text-stone-500">
            Nearest available imagery within 100 m
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Street View"
          className="p-2"
        >
          <X size={20} />
        </button>
      </div>
      <div className="relative flex-1 min-h-0">
        <div
          ref={container}
          className="sm-streetview-canvas absolute inset-0"
          style={{ filter: "none", mixBlendMode: "normal" }}
        />
        {status && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 p-6">
            <div className="max-w-sm text-center">
              <p role="status" className="text-sm mb-4">
                {status}
              </p>
              <button
                onClick={() => setRetry((r) => r + 1)}
                className="p-3 rounded-xl bg-white inline-flex gap-2"
              >
                <RotateCw size={16} />
                Retry
              </button>
              <button
                onClick={onClose}
                className="p-3 rounded-xl bg-stone-800 text-white ml-2"
              >
                Continue with Map
              </button>
            </div>
          </div>
        )}
      </div>
      <a
        className="bg-white p-3 text-xs flex items-center justify-center gap-2"
        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={14} />
        Open this location in Google Maps
      </a>
    </div>
  );
};
