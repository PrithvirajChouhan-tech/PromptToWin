import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FairPriceService,
  RiskAggregationService,
  ArrivalDetectionService,
  SafetyService,
} from "../intelligence";
import {
  CommunityReportService,
  SOSService,
  AuthorityMapService,
} from "../repository";
import { AccessibilityService, OpeningHoursService } from "../travel";
import { demoPlaces } from "../repository";
import type { CommunityReport } from "../models";
const now = 1000000000000;
const point = { lat: 26.9258, lng: 75.8237 };
const report = (timestamp = now): CommunityReport => ({
  id: "r",
  category: "Overcharging",
  coordinates: point,
  description: "A seeded test report only",
  timestamp,
  validations: 0,
  reliability: 0.2,
  demo: true,
});
test("price range excludes the unusual ₹850 without shifting the normal range", () => {
  const result = FairPriceService.aggregate(
    [320, 350, 380, 400, 850].map((amount, i) => ({
      id: String(i),
      service: "guide",
      amount,
      timestamp: now,
    })),
  )!;
  assert.deepEqual(result.range, [320, 400]);
  assert.deepEqual(result.outliers, [850]);
  assert.equal(result.median, 380);
  assert.equal(FairPriceService.aggregate([]), null);
});
test("one unverified report cannot create high confidence", () => {
  assert.equal(
    RiskAggregationService.aggregate([report()], 30, now)[0].confidence,
    "Limited Data",
  );
});
test("recent reports have greater influence, and periods exclude old reports", () => {
  const fresh = RiskAggregationService.aggregate([report()], 30, now)[0];
  const old = RiskAggregationService.aggregate(
    [report(now - 14 * 86400000)],
    30,
    now,
  )[0];
  assert.ok(fresh.weight > old.weight);
  assert.equal(
    RiskAggregationService.aggregate([report(now - 2 * 86400000)], 1, now)
      .length,
    0,
  );
});
test("arrival requires accurate recent samples and sustained dwell, not a single fix", () => {
  const service = new ArrivalDetectionService();
  const reading = (offset: number, accuracy = 10) => ({
    ...point,
    accuracy,
    timestamp: now + offset,
  });
  assert.equal(service.observe(reading(0), point, now), false);
  assert.equal(service.observe(reading(8000), point, now + 8000), false);
  assert.equal(service.observe(reading(16000), point, now + 16000), false);
  assert.equal(service.observe(reading(24000), point, now + 24000), true);
  assert.equal(service.observe(reading(30000, 90), point, now + 30000), false);
  assert.equal(service.observe(reading(32000), point, now + 60000), false);
});
test("movement out of geofence resets arrival confidence", () => {
  const s = new ArrivalDetectionService();
  for (const offset of [0, 8000, 16000])
    s.observe(
      { ...point, accuracy: 10, timestamp: now + offset },
      point,
      now + offset,
    );
  assert.equal(
    s.observe(
      {
        lat: point.lat + 0.01,
        lng: point.lng,
        accuracy: 10,
        timestamp: now + 24000,
      },
      point,
      now + 24000,
    ),
    false,
  );
});
test("route concern scoring checks segments rather than only endpoints", () => {
  const r = report(Date.now());
  const summary = SafetyService.route(
    {
      id: "route",
      points: [
        { lat: point.lat, lng: point.lng - 0.02 },
        { lat: point.lat, lng: point.lng + 0.02 },
      ],
      distance: 4000,
      minutes: 10,
      directions: [],
      demo: true,
    },
    [r],
  );
  assert.equal(summary.reports, 1);
  assert.equal(summary.recentReports, 1);
});
test("shared report cache reaches the authority summary without movement history", async () => {
  const store = new Map<string,string>();
  Object.defineProperty(globalThis,"localStorage",{value:{getItem:(key:string)=>store.get(key)||null,setItem:(key:string,value:string)=>store.set(key,value)},configurable:true});
  Object.defineProperty(globalThis,"window",{value:{dispatchEvent:()=>true},configurable:true});
  const originalFetch=globalThis.fetch;
  const shared={...report(),coordinates:{lat:26.93,lng:75.82},validations:1};
  const requests:any[]=[];
  globalThis.fetch=async(url,options)=>{
    requests.push(String(url));
    const payload=String(url).endsWith('/state')?{mapReports:[shared],sos:[{id:'sos-1',category:'other',location:'Demo test landmark',timestamp:Date.now(),status:'demo-pending'}]}:shared;
    return new Response(JSON.stringify(payload),{status:200,headers:{'Content-Type':'application/json'}});
  };
  try {
    await CommunityReportService.submit(report());
    assert.deepEqual(CommunityReportService.list()[0].coordinates,shared.coordinates);
    await CommunityReportService.validate('r','Useful');
    assert.ok(requests.some(url=>url.endsWith('/map-reports/r/vote')));
    assert.equal(CommunityReportService.list()[0].validations,1);
    const data=AuthorityMapService.snapshot();
    assert.equal(data.requests.length,1);
    assert.equal(data.requests[0].status,'demo-pending');
    assert.ok(!('history' in data));
  } finally {globalThis.fetch=originalFetch;}
});
test("accessibility chooses the ramp entrance and hours use destination time zone", () => {
  assert.deepEqual(
    AccessibilityService.destination(demoPlaces[0], true),
    demoPlaces[0].accessibility.entrance,
  );
  assert.equal(
    OpeningHoursService.status(demoPlaces[0], new Date("2026-09-19T06:00:00Z")),
    "Open",
  );
  assert.equal(
    OpeningHoursService.status(demoPlaces[0], new Date("2026-09-19T19:00:00Z")),
    "Closed",
  );
});
