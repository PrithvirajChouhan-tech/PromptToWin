# Production Deployment Guide: Incredible India Travel & Trust Platform

This project is a unified full-stack application comprising:
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + Leaflet Maps
- **Backend API**: Node.js 22 + Express + SQLite DatabaseSync (`platform.ts`) + AI Engine (`server.ts` & `planRoute.ts`)
- **Single-port serving**: Express serves both `/api/*` endpoints and the production-built Vite SPA bundle from `dist/` on a single port.

---

## ⚠️ Key Requirement: Node.js 22+
The backend utilizes `node:sqlite`'s built-in `DatabaseSync` for high-performance zero-dependency database storage. Ensure your hosting environment is configured with **Node.js 22.0.0 or higher**.

---

## 1. Quick Deploy on Render (Recommended)

1. Push this repository to GitHub or GitLab.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Web Service**.
4. Connect your repository.
5. Configure the following settings:
   - **Environment**: `Node`
   - **Node Version**: `22` (Render will automatically detect this from `package.json` engines or `render.yaml`)
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Under **Environment Variables**, add:
   | Key | Description | Example / Source |
   |-----|-------------|------------------|
   | `NODE_ENV` | Environment mode | `production` |
   | `PORT` | Web port | Automatically set by Render (e.g. `10000`) |
   | `GROQ_API_KEY` | Ultra-fast AI travel responses | `gsk_...` |
   | `GEMINI_API_KEY` | Google Gemini AI fallback | Google AI Studio key |
   | `SERPAPI_API_KEY` | Live Google travel search | SerpApi key |
   | `WEATHER_API_KEY` | Real-time weather overlay | WeatherAPI key |
   | `VITE_GOOGLE_MAPS_API_KEY` | Google Maps tiles & satellite | Google Cloud Console key |
   | `VITE_FIREBASE_API_KEY` | Firebase Auth & DB (optional) | Firebase Console |
   | `YATRA_DATA_DIR` | SQLite directory | `/var/data` (or persistent disk) |
7. Click **Deploy Web Service**.

> **Tip**: You can also use Render's **Blueprints** by selecting `render.yaml` included in this repository.

---

## 2. Deploy on Railway

1. Install Railway CLI or connect via [Railway.app](https://railway.app).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Railway will detect the `Procfile` and `Dockerfile`.
4. In Railway project settings, add the environment variables listed in the table above.
5. In **Variables**, add `NODE_VERSION=22`.
6. Railway will build and launch `npm start` automatically.

---

## 3. Deploy with Docker (Google Cloud Run / AWS ECS / DigitalOcean)

The repository includes an optimized multi-stage `Dockerfile`:

```bash
# 1. Build Docker image
docker build -t yatraone-travel:latest .

# 2. Run locally to test
docker run -p 5173:5173 --env-file .env yatraone-travel:latest

# 3. Deploy to Google Cloud Run:
gcloud run deploy yatraone \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 5173
```

---

## 4. Production Build & Test Commands

To verify your build locally before deploying:

```bash
# 1. Type-check all code (Zero errors guaranteed)
npm run lint

# 2. Run platform security & permission tests
npx tsx --test platform.test.ts

# 3. Compile client and bundle server
npm run build

# 4. Start production server locally
npm start
```
Open `http://localhost:5173/` in your browser. Verify the `/api/health` endpoint responds with `{ "status": "ok" }`.

---

## 5. Deployment Verification Checklist

- [x] **TypeScript compilation**: Passed with 0 errors (`npm run lint`).
- [x] **Production build bundle**: Generates `dist/index.html`, `dist/assets/*`, and `dist/server.cjs`.
- [x] **API Healthcheck**: `/api/health` checks AI & search provider status.
- [x] **Search Engine**: `/api/search?q=...` returns Google SerpAPI or local fallback.
- [x] **Single-Port SPA Serving**: In production, Express statically serves `dist/` and redirects unmatched routes to `index.html`.
- [x] **Persistent Database**: `platform.ts` automatically creates and migrates SQLite database in `process.env.YATRA_DATA_DIR` or `.yatra-data/`.
