# Smart Safety Map

The tourist SAFETY MAP tab mounts `SmartSafetyMap` using the existing React,
Leaflet, Tailwind and itinerary state. Explore is the initial mode. Mode changes
replace layers without recreating the map or resetting its viewport.

## Data boundaries

- `models.ts`: domain models, coordinates and route contracts.
- `repository.ts`: cached local Jaipur demo listings, reports, prices and SOS.
  Replace these repositories with authenticated APIs for deployment. Browser
  storage is a hackathon simulation, not multi-user infrastructure or security.
- `travel.ts`: location lifecycle, weather, destination search, transport estimates,
  routing adapter, recommendations, accessibility entrances, itinerary mapping,
  opening hours and camera adapter.
- `intelligence.ts`: pure price, confidence, temporal/geographic aggregation,
  arrival and route-corridor calculations.
- `AuthorityMapIntelligence`: aggregated reports and explicitly initiated demo SOS.
  Footfall has a typed empty dataset until an anonymized source is available.

## Real versus demo

Google Maps JavaScript basemap, Google geocoding/search, Google directions,
Open-Meteo current weather and browser location are network integrations. Failures leave
manual map browsing, local search and retry paths available. Weather coordinates
are coarsened to one decimal. Location is shared with routing only on a user's
navigation action. No location history is persisted.

POIs beyond the itinerary, hotel trust, guide verification, reports, fares and
accessibility are labelled demo/unverified. Walking and bus use explicitly dashed
schematic previews; metro/train are unavailable without a timetable provider.
They must not be represented as verified turn-by-turn routes. The camera adapter
is a demo preview with a Map fallback; native ARKit/ARCore spatial tracking is not
implemented in this web project. Heritage QR accepts a seeded code with bilingual
text and browser speech synthesis. Camera QR decoding is a future adapter.

SOS never dispatches emergency services. It writes a `demo-pending` record to the
same-browser Authority Dashboard and includes precise coordinates only when the
user chooses to share them. This storage is not suitable for production sensitive
data. New community report coordinates are rounded to 0.01 degrees.

## Intelligence rules

Arrival requires at least four fresh samples, accuracy <=40 m, at least 20 seconds
of dwell, the uncertainty radius inside a 100 m geofence, and low recent movement.
A fresh reading is rechecked at confirmation. Itinerary changes require the user
to confirm arrival. Arrival does not occur from a timer or a single reading.

Price aggregation uses median absolute deviation and a relative floor. The
320/350/380/400/850 example produces a 320–400 typical range and an 850 outlier.
Small samples remain Limited Data. Confidence combines counts, recency,
validations and reliability; spatial grouping requires proximity. Report influence
decays with a seven-day time constant. Route reports are matched to segments
within 200 m, not merely route vertices. These are demo heuristics, not validated
risk predictions.

## Verification

Run `npm run lint`, `npm run build`, and
`node --import tsx --test src/services/smartMap/__tests__/intelligence.test.ts`.

Manual demo: open SAFETY MAP; search City Palace; inspect Details; select transport;
switch to Safety; select the report cluster; expand Evidence & fair prices; adjust
Risk Filter; submit a demo issue. SOS is visible globally and its saved request is
visible in the Authority Dashboard. Check location denial and manual browsing;
exercise native camera/location on a physical device before deployment.

## Google Maps / Street View

The supplied key is configured through `VITE_GOOGLE_MAPS_API_KEY` in `.env`.
The Google Maps loader uses that key for all Google basemap and Street View
requests.
The Maps JavaScript API loads on demand through `googleMapsLoader.ts`.
GoogleMutant preserves the existing Leaflet markers, heatmap and routes on the
Google basemap. Explore's 360° action opens actual Google Street View within
100 m of the selected destination or map center. The shared panorama component
also replaces the older photo simulation in other existing map views.

If Google returns an activation or authorization error, ensure Maps JavaScript
API, Street View, and the appropriate website referrers are enabled for the
key's Google Cloud project. No account settings were changed by this
implementation.
