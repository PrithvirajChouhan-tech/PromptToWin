# Connected Yatra One prototype

The app now has Home, Explore, My Trip, Community and Profile. Existing tools remain reachable in their original sections. Start with `npm run dev` and use a local demo account or register a tourist/business account.

## Connected workflows

- SQLite-backed accounts, password hashing, HTTP-only sessions, server-enforced role checks and account-owned trips/preferences.
- Destination AI planner through the existing Gemini integration, editable draft, geocoded stops, summed budgets, explicit curated fallback for supported cities.
- Current/next journey context for the assistant; forecast, rain-based indoor swaps and editable schedule shifts on Home.
- Live Google Home map; existing Explore, safety map and Pegman retained; walking and transit use Google directions when coverage is available.
- Shared reviews/tips/experiences/prices/issues, account-based voting, once-only rewards, contributor history and evidence review.
- Guide applications, authority review, provider-confirmed bookings, date availability checks, cancellation, completion and post-tour reviews.
- Package/hotel submissions and approval; affordable approved packages appear on matching city Home screens.
- Shared demo SOS and assistance records; private request coordinates visible only to the requester and authority.
- Camera QR scanning where BarcodeDetector is available, printed-code fallback, bilingual heritage audio and a three-stop sample quest.
- Token ledger, once-only digital badge redemption, account data export, English/Hindi main navigation and core preference labels.
- Optional confirmed-arrival aggregate counts, rather than continuous location histories.

## Required external setup / boundaries

The prototype does not dispatch emergency services, verify government IDs, collect payments, guarantee transport accessibility, or issue partner discounts. Demo-role approvals are labelled demo reviews. Existing curated listings remain samples. Full spatial AR requires a native AR/device implementation; the camera mode provides real route instructions and returns to the map if camera/GPS is unavailable. Camera QR scanning depends on browser support. Legacy content is primarily English; full translated destination content remains a content/provider task. Footfall counts are opt-in confirmed visits, not measured total visitors.

`GEMINI_API_KEY` must be valid for AI planning/chat. Google Maps API permissions and coverage control geocoding and directions. Real-time transit fares/vehicle accessibility and official verification integrations need provider agreements. Unsupported destinations fail honestly if AI is unavailable.

SQLite data is kept in `.yatra-data/platform.sqlite` (gitignored). Override with `YATRA_DATA_DIR`. Keep this directory persistent when deploying. Use HTTPS in production for Secure cookies. Provision an initial reviewer with `YATRA_AUTHORITY_EMAIL` and `YATRA_AUTHORITY_PASSWORD` (12+ characters); public registration cannot grant the authority role. Local demo sessions are disabled in production and for non-loopback clients. This is a single-server prototype, not a deployment-scale service.

## Validation

`npm run lint`, `npm run build`, `node --import tsx --test platform.test.ts src/services/smartMap/__tests__/intelligence.test.ts`.
