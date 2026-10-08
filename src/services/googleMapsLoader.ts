import { GOOGLE_MAPS_API_KEYS } from "../utils/mapsConfig";
let pending: Promise<typeof google.maps> | undefined;
let keyIndex = 0;
let googleMapsReady = false;

function loadWithKey(index: number): Promise<typeof google.maps> {
  if (index >= GOOGLE_MAPS_API_KEYS.length) {
    return Promise.reject(
      new Error(
        "Google Maps authorization failed for all configured keys. Check API activation, billing and allowed website referrers.",
      ),
    );
  }

  const apiKey = GOOGLE_MAPS_API_KEYS[index];
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const globals = window as typeof window & {
      yatraGoogleReady?: () => void;
      gm_authFailure?: () => void;
    };
    let settled = false;
    const timeout = setTimeout(() => fail("Google Maps timed out."), 15000);
    const cleanup = () => {
      clearTimeout(timeout);
      script.remove();
    };
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (index + 1 < GOOGLE_MAPS_API_KEYS.length) {
        keyIndex = index + 1;
        loadWithKey(index + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(message));
      }
    };
    globals.gm_authFailure = () => {
      window.dispatchEvent(new Event("yatra-google-auth-error"));
      fail("Google Maps authorization failed.");
    };
    globals.yatraGoogleReady = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      googleMapsReady = true;
      resolve(window.google.maps);
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&callback=yatraGoogleReady&v=weekly`;
    script.async = true;
    script.onerror = () => fail("Google Maps could not load.");
    document.head.appendChild(script);
  });
}

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (googleMapsReady && window.google?.maps?.Map)
    return Promise.resolve(window.google.maps);
  if (pending) return pending;
  pending = loadWithKey(keyIndex).finally(() => {
    pending = undefined;
  });
  return pending;
}
