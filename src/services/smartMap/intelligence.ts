import type {
  Coordinates,
  LocationReading,
  CommunityReport,
  SafetyHotspot,
  PriceReport,
  FairPriceSummary,
  MapRoute,
  RouteRiskSummary,
} from "./models";
export const distance = (a: Coordinates, b: Coordinates) => {
  const r = Math.PI / 180;
  const x =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) *
      Math.cos(b.lat * r) *
      Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const median = (a: number[]) =>
  (a[Math.floor((a.length - 1) / 2)] + a[Math.floor(a.length / 2)]) / 2;
export const FairPriceService = {
  aggregate(reports: PriceReport[]): FairPriceSummary | null {
    const valid = reports.filter(
      (r) => r.amount > 0 && Number.isFinite(r.amount),
    );
    if (!valid.length) return null;
    const amounts = valid.map((r) => r.amount).sort((a, b) => a - b);
    const mid = median(amounts);
    const mad = median(
      amounts.map((x) => Math.abs(x - mid)).sort((a, b) => a - b),
    );
    const threshold = Math.max(3 * mad, mid * 0.35);
    const typical = amounts.filter((x) => Math.abs(x - mid) <= threshold);
    return {
      range: [typical[0], typical.at(-1)!],
      median: mid,
      outliers: amounts.filter((x) => Math.abs(x - mid) > threshold),
      count: valid.length,
      latest: Math.max(...valid.map((r) => r.timestamp)),
      confidence: valid.length >= 20 ? "Moderate Confidence" : "Limited Data",
    };
  },
};
export const RiskAggregationService = {
  aggregate(
    reports: CommunityReport[],
    days: number,
    now = Date.now(),
  ): SafetyHotspot[] {
    const groups: CommunityReport[][] = [];
    reports
      .filter((r) => now - r.timestamp <= days * 86400000 && r.timestamp <= now)
      .forEach((r) => {
        const g = groups.find(
          (g) => distance(g[0].coordinates, r.coordinates) < 250,
        );
        g ? g.push(r) : groups.push([r]);
      });
    return groups.map((g) => {
      const weight = g.reduce(
        (s, r) =>
          s +
          Math.exp(-(now - r.timestamp) / 604800000) *
            Math.min(1, r.reliability) *
            (1 + Math.min(r.validations, 10) / 10),
        0,
      );
      const validations = g.reduce((s, r) => s + r.validations, 0);
      return {
        id: g[0].id,
        coordinates: g[0].coordinates,
        reports: g,
        weight,
        confidence:
          g.length >= 15 && validations >= 20 && weight >= 8
            ? "High Confidence"
            : g.length >= 5 && validations >= 5 && weight >= 2
              ? "Moderate Confidence"
              : "Limited Data",
      };
    });
  },
};
export class ArrivalDetectionService {
  private readings: LocationReading[] = [];
  reset() {
    this.readings = [];
  }
  observe(
    reading: LocationReading,
    destination: Coordinates,
    now = Date.now(),
  ) {
    if (
      reading.timestamp > now + 5000 ||
      now - reading.timestamp > 30000 ||
      reading.accuracy > 90
    ) {
      this.reset();
      return false;
    }
    const dist = distance(reading, destination);
    if (dist <= 40) return true;
    if (this.readings.at(-1)?.timestamp && this.readings.at(-1)!.timestamp >= reading.timestamp) return false;
    this.readings = [
      ...this.readings.filter((r) => reading.timestamp - r.timestamp <= 90000),
      reading,
    ];
    const near = this.readings.filter(
      (r) => distance(r, destination) <= Math.max(70, r.accuracy),
    );
    if (near.length !== this.readings.length) {
      this.readings = [reading];
      return false;
    }
    return (
      near.length >= 2 &&
      near.at(-1)!.timestamp - near[0].timestamp >= 8000 &&
      distance(near[0], near.at(-1)!) < 60
    );
  }
}
function segmentDistance(p: Coordinates, a: Coordinates, b: Coordinates) {
  const scale = Math.cos((p.lat * Math.PI) / 180);
  const x = (b.lng - a.lng) * scale,
    y = b.lat - a.lat;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((p.lng - a.lng) * scale * x + (p.lat - a.lat) * y) /
        (x * x + y * y || 1),
    ),
  );
  return distance(p, { lat: a.lat + t * y, lng: a.lng + t * (b.lng - a.lng) });
}
export const SafetyService = {
  route(route: MapRoute, reports: CommunityReport[]): RouteRiskSummary {
    const relevant = reports.filter(
      (r) =>
        Date.now() - r.timestamp < 30 * 86400000 &&
        route.points.some(
          (p, i) =>
            i > 0 &&
            segmentDistance(r.coordinates, route.points[i - 1], p) < 200,
        ),
    );
    const recent = relevant.filter(
      (r) => Date.now() - r.timestamp < 7 * 86400000,
    ).length;
    return {
      routeId: route.id,
      reports: relevant.length,
      recentReports: recent,
      description: `${recent} reports in the last 7 days within 200 m of this route. No route is guaranteed safe.`,
    };
  },
};
