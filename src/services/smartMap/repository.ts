import { api, refreshPlatform } from "../journey";
import type {
  MapPlace,
  Hotel,
  Guide,
  CommunityReport,
  SOSRequest,
  Coordinates,
  PriceReport,
} from "./models";
const access = {
  wheelchair: true,
  ramp: true,
  elevator: false,
  toilet: true,
  routeVerified: false,
};
const photo =
  "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=75";
export const demoPlaces: MapPlace[] = [
  ["red-fort", "Red Fort (Lal Qila)", "Heritage", 28.6562, 77.2410, 50, false, "https://images.unsplash.com/photo-1598598795009-f80c5072e665?auto=format&fit=crop&w=600&q=75", "Magnificent 17th-century UNESCO Mughal fortress in red sandstone."],
  ["india-gate", "India Gate & Kartavya Path", "Heritage", 28.6129, 77.2295, 0, false, "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=75", "Iconic national war memorial arch along the grand ceremonial boulevard."],
  ["qutub-minar", "Qutub Minar Complex", "Heritage", 28.5244, 77.1855, 40, false, "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=75", "73-meter medieval fluted minaret tower and UNESCO monument."],
  ["humayun-tomb", "Humayun's Tomb", "Heritage", 28.5933, 77.2507, 40, false, "https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&w=600&q=75", "Precursor to the Taj Mahal with Persian charbagh water gardens."],
  ["lotus-temple", "Lotus Temple", "Culture", 28.5535, 77.2588, 0, true, "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=75", "Architectural masterpiece shaped like a floating white lotus flower."],
  ["palace", "City Palace Jaipur", "Heritage", 26.9258, 75.8237, 300, false, photo, "Discover Jaipur through royal courtyards, textiles and architecture."],
  ["hawa-mahal", "Hawa Mahal (Palace of Winds)", "Heritage", 26.9239, 75.8267, 50, false, "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=75", "Honeycomb facade of 953 jharokha latticed windows."],
  ["museum", "Central Museum", "Culture", 26.9117, 75.8195, 30, true, photo, "State museum housing historic miniature paintings and crafts."],
  ["market", "Handicraft Market", "Shopping", 26.923, 75.827, 0, false, photo, "Traditional artisans selling handmade blue pottery and textiles."],
  ["garden", "Ram Niwas Garden", "Nature", 26.913, 75.818, 0, false, photo, "Lush historic green garden surrounding the Albert Hall Museum."],
  ["food", "Old City Kitchen", "Food", 26.924, 75.822, 200, true, photo, "Traditional authentic cuisine and freshly cooked regional breads."],
  [
    "craft",
    "Block Printing Workshop",
    "Experiences",
    26.922,
    75.819,
    350,
    true,
    photo,
    "Hands-on traditional hand block printing artisan session."
  ],
  ["hotel", "Pink City Courtyard", "Hotels", 26.92, 75.823, 0, true, photo, "Comfortable heritage stay in the heart of the historic district."],
  [
    "guide",
    "Asha · Heritage Guide",
    "Verified Guides",
    26.926,
    75.825,
    600,
    false,
    photo,
    "Certified multilingual historian offering curated heritage walks."
  ],
].map(([id, name, category, lat, lng, entryPrice, indoor, placePhoto, desc], i) => ({
  id: String(id),
  name: String(name),
  category: category as MapPlace["category"],
  coordinates: { lat: Number(lat), lng: Number(lng) },
  rating: 4.8,
  hours: "09:00–18:00",
  entryPrice: Number(entryPrice),
  accessibility: {
    ...access,
    wheelchair: i !== 8,
    entrance: { lat: Number(lat) - 0.0003, lng: Number(lng) + 0.0002 },
  },
  images: [placePhoto ? String(placePhoto) : photo],
  description: String(desc || "Iconic destination with rich cultural heritage."),
  indoor: Boolean(indoor),
  demo: true,
  visitMinutes: 45,
  heritageQR: category === "Heritage" ? "YATRA:palace" : undefined,
}));
export const hotels: Hotel[] = [
  {
    ...demoPlaces[6],
    verifiedPhotos: [photo],
    updatedAt: "2026-09-01",
    complaints: "2 sample noise complaints; 1 resolved",
    trust: "Demo photo verification; no live certification",
    priceCategory: "₹₹ · approximately ₹2,000–₹4,000/night",
  },
];
export const guides: Guide[] = [
  {
    ...demoPlaces[7],
    profileImage: photo,
    verified: true,
    languages: ["Hindi", "English"],
    specialization: "Heritage",
    pricePerHour: 600,
    availability: "Available today · demo",
  },
];
const seededAt = Date.now();
const seedReports: CommunityReport[] = Array.from({ length: 28 }, (_, i) => ({
  id: `seed-${i}`,
  category: i % 3 === 0 ? "Transport Scam" : "Overcharging",
  coordinates: {
    lat: 26.923 + (i % 4) * 0.00025,
    lng: 75.826 + Math.floor(i / 4) * 0.00015,
  },
  description:
    i % 3 === 0
      ? "A transport seller requested an additional unquoted fee."
      : "A visitor reported a price above the initially agreed amount.",
  timestamp: seededAt - i * 14 * 3600000,
  validations: i % 5,
  reliability: 0.6,
  demo: true,
}));
export const priceReports: PriceReport[] = [320, 350, 380, 400, 850].map(
  (amount, i) => ({
    id: `price-${i}`,
    service: "Local guide / hour",
    amount,
    timestamp: seededAt - i * 86400000,
  }),
);
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("yatra-map-data"));
}
export interface ReportRepository {
  list(): CommunityReport[];
  submit(report: CommunityReport): Promise<void>;
  validate(id: string, kind: string): Promise<void>;
}
export const CommunityReportService: ReportRepository = {
  list: () => [...read("yatra-shared-map-reports", []), ...read("yatra-map-reports", seedReports)],
  async submit(report) { await api('/map-reports',report);await refreshPlatform(); },
  async validate(id, kind) { await api(`/map-reports/${id}/vote`,{kind});await refreshPlatform(); },
};
export const SOSService = {
  list: (): SOSRequest[] => read("yatra-demo-sos", []),
  async submit(request: Omit<SOSRequest, "id" | "timestamp" | "status">) {
    const entry=await api('/sos',request);await refreshPlatform();return entry;
  },
};
export const AuthorityMapService = {
  snapshot() {
    const reports = CommunityReportService.list();
    return {
      demo: true,
      categories: Object.fromEntries(
        [...new Set(reports.map((r) => r.category))].map((c) => [
          c,
          reports.filter((r) => r.category === c).length,
        ]),
      ),
      concentrations: Array.from(
        new Set(
          reports.map(
            (r) =>
              `${r.coordinates.lat.toFixed(2)},${r.coordinates.lng.toFixed(2)}`,
          ),
        ),
      ).map((cell) => ({
        cell,
        count: reports.filter(
          (r) =>
            `${r.coordinates.lat.toFixed(2)},${r.coordinates.lng.toFixed(2)}` ===
            cell,
        ).length,
      })),
      footfall: [] as { area: string; count: number; period: string }[],
      requests: SOSService.list(),
    };
  },
};
export const PlaceService = {
  list: (contains: (c: Coordinates) => boolean) =>
    demoPlaces.filter((p) => contains(p.coordinates)),
};
export const HotelService = {
  get: (id: string) => hotels.find((h) => h.id === id),
};
export const GuideService = {
  get: (id: string) => guides.find((g) => g.id === id),
};
