import React, { useEffect, useState } from "react";
import { X, LocateFixed, Lock } from "lucide-react";
import { AuthUser, isDemoUser, promptDemoRestriction } from "../../types/auth";
import { SOSIncident } from "../../types/trustEngine";
import { SOSService } from "../../services/smartMap/repository";
import type { Coordinates } from "../../services/smartMap/models";
interface GlobalSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSOS: (incident: SOSIncident) => void;
  initialCategory?: string;
}
export const GlobalSOSModal: React.FC<GlobalSOSModalProps> = ({
  isOpen,
  onClose,
  onBroadcastSOS,
  initialCategory = "safety_emergency",
}) => {
  const [category, setCategory] = useState(initialCategory),
    [location, setLocation] = useState(""),
    [coordinates, setCoordinates] = useState<Coordinates>(),
    [notes, setNotes] = useState(""),
    [ticket, setTicket] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (isOpen) {
      setTicket("");
      setError("");
      setCategory(initialCategory);
      setCoordinates(undefined);
      setLocation("");
    }
  }, [isOpen, initialCategory]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="SOS assistance"
        className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90dvh] overflow-auto"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-red-700">SOS assistance</h2>
          <button aria-label="Close SOS" onClick={onClose}>
            <X />
          </button>
        </div>
        <p className="text-sm text-stone-600 my-4">
          Hackathon simulation. This creates a request on the demo Authority
          Dashboard. It does not contact police or emergency services.
        </p>
        {ticket ? (
          <>
            <h3 className="font-bold">Demo request recorded</h3>
            <p className="text-sm my-3">Reference: {ticket}</p>
            <button
              className="bg-stone-900 text-white rounded-xl p-3"
              onClick={onClose}
            >
              Close
            </button>
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const saved = await SOSService.submit({
                  category,
                  location: location.trim(),
                  coordinates,
                  evidence: notes,
                });
                setTicket(saved.id);
                onBroadcastSOS({
                  id: saved.id,
                  category: category as SOSIncident["category"],
                  city: "User selected",
                  location: saved.location,
                  timestamp: new Date(saved.timestamp).toISOString(),
                  status: "demo-pending",
                  notes: notes || "Demo assistance request",
                });
              } catch {
                setError("Could not save the demo request. Please retry.");
              }
            }}
          >
            <label className="block text-sm">
              Category
              <select
                className="block w-full border rounded-xl p-3 mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {[
                  ["safety_emergency", "Safety Emergency"],
                  ["transport_scam", "Transport Scam"],
                  ["overcharging", "Overcharging"],
                  ["hotel_issue", "Hotel Issue"],
                  ["accessibility_need", "Accessibility Assistance"],
                  ["other", "Other"],
                ].map(([id, label]) => (
                  <option value={id} key={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Location or landmark
              <input
                required
                minLength={3}
                maxLength={200}
                className="block w-full border rounded-xl p-3 mt-1"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCoordinates(undefined);
                }}
                placeholder="Enter your location"
              />
            </label>
            <button
              type="button"
              className="text-sm flex gap-2 items-center"
              onClick={() => {
                if (!navigator.geolocation) {
                  setError("GPS unavailable. Enter a landmark manually.");
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (p) => {
                    setCoordinates({
                      lat: p.coords.latitude,
                      lng: p.coords.longitude,
                    });
                    setLocation(
                      `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`,
                    );
                    setError("");
                  },
                  () =>
                    setError(
                      "Location unavailable. Enter a landmark manually.",
                    ),
                  { timeout: 10000, enableHighAccuracy: true },
                );
              }}
            >
              <LocateFixed size={16} />
              Share precise location for this request
            </button>
            <p className="text-xs text-stone-500">
              Only this user-initiated assistance request includes your precise
              location.
            </p>
            <label className="block text-sm">
              Optional evidence notes
              <textarea
                maxLength={1200}
                className="block w-full border rounded-xl p-3 mt-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <button
              className="w-full bg-red-700 text-white rounded-xl p-3 font-bold"
              type="submit"
            >
              Send simulated SOS request
            </button>
          </form>
        )}
        <div className="border-t mt-5 pt-4">
          <p className="text-xs text-stone-500 mb-2">
            Existing helpline shortcuts · calls open your phone app
          </p>
          <div className="flex gap-3 text-sm font-semibold text-red-700">
            <a href="tel:112">Call 112</a>
            <a href="tel:1363">Call 1363</a>
            <a href="tel:139">Call 139</a>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-red-700 mt-3 text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
