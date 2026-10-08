import { installPlatform } from "./platform";
import { installPlanner } from "./planRoute";
import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const DEFAULT_PORT = Number(process.env.PORT) || 5173;

// Lazy initialization of GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      genAIClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return genAIClient;
}

const SYSTEM_INSTRUCTION = `You are Sahayak AI, the official intelligent travel assistant and cultural guide for the "Incredible India Travel & Trust Platform" application.

YOUR MISSION & EXPERTISE:
1. ANY LOCATION'S INFORMATION: You are trained to answer questions about ANY location on Earth, with exhaustive specialization in India (every state, city, village, monument, fort, temple, wildlife park, hill station, beach, river ghat, bazaar, food lane, museum, hiking route, or landmark, as well as international destinations).
2. ANY PLACE-RELATED INQUIRIES: When asked about any place or anything related to a particular place, provide detailed, practical, and culturally authentic advice covering:
   - Overview, history & architectural/cultural significance
   - Top must-see attractions, hidden gems & authentic experiences
   - How to reach (nearest airports, express trains like Vande Bharat, state transport, metro, auto-rickshaw/cab)
   - Best season to visit, weather & ideal trip duration
   - Entry timings, ticket prices (domestic vs foreign rates), weekly closures (e.g. Taj Mahal on Fridays), and online booking tips
   - Authentic regional cuisine, must-try delicacies, famous street food joints & hygienic dining rules
   - Shopping, GI-certified handicrafts, famous bazaars & fair bargaining guidelines
   - Cultural etiquette, temple dress codes, shoe storage rules & photography restrictions
   - Safety guidelines, tourist police helplines, auto meter fare calculations & anti-scam warnings
3. APP FEATURE GUIDANCE: You also provide complete assistance on how to use all features of this application:
   - Live Turn-by-Turn GPS Map Navigation with walking, auto meter fare estimation, metro tokens, and cab modes
   - Live Surrounding Area Radar Scanner for real-time detection of nearby FSSAI safe food, ASI monuments, and GI crafts
   - Fair-Price Scam Engine & Auto-Rickshaw Meter Rate Calculator
   - Emergency SOS 112 button (docked permanently in the bottom right corner of the screen) with GPS incident transmission
   - Accessibility Mode & on-ground Sahayak helper dispatch at major railway stations and monuments
   - B2B & Verified Tour Guides directory and multi-modal transit ribbon
4. STRICT DOMAIN GUARDRAILS:
   - Politely DECLINE non-travel or non-place questions (e.g., writing software code, solving math homework, celebrity gossip, partisan politics). Remind the user with Indian warmth (Namaste 🙏) that your expertise is dedicated to travel destinations, places, and app features.
5. TONE & FORMAT:
   - Friendly, warm, hospitable (Atithi Devo Bhava), structured with clear markdown headings (###), crisp bullet points, and bold key terms. Keep answers scannable and immediately actionable.`;

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(express.json({limit: "1mb"}));
  const platform = installPlatform(app);
  installPlanner(app, platform.getUser);

  // API Health Check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ 
      status: "ok", 
      service: "Sahayak AI Travel Engine",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
      hasSerpApiKey: Boolean(process.env.SERPAPI_API_KEY)
    });
  });

  // In-memory cache for SerpAPI results (15-minute TTL)
  const searchCache = new Map<string, { timestamp: number; data: any }>();
  const SEARCH_CACHE_TTL_MS = 15 * 60 * 1000;

  // SerpAPI Live Travel Search Endpoint
  app.get("/api/search", async (req: Request, res: Response) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) {
      return res.json({
        query: "",
        knowledgeGraph: null,
        places: [],
        organicResults: [],
        source: "empty"
      });
    }

    const cacheKey = query.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    const apiKey = (
      process.env.SERPAPI_API_KEY ||
      (process.env as any)["SERPAPI_API_KEY "] ||
      ""
    ).trim().replace(/^["']|["']$/g, "");

    if (apiKey) {
      try {
        const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&gl=in&hl=en&api_key=${apiKey}`;
        const serpRes = await fetch(serpUrl);
        if (serpRes.ok) {
          const data: any = await serpRes.json();

          // Knowledge Graph if present
          let knowledgeGraph: any = null;
          if (data.knowledge_graph) {
            const kg = data.knowledge_graph;
            knowledgeGraph = {
              title: kg.title || query,
              type: kg.type || "Travel Destination / Attraction",
              description: kg.description || "",
              thumbnail: kg.header_images?.[0]?.image || kg.thumbnail || null,
              website: kg.website || null,
              source: kg.source?.name || "Google Knowledge Graph"
            };
          }

          // Local / Attraction places if present
          const places = Array.isArray(data.local_results?.places)
            ? data.local_results.places.slice(0, 4).map((p: any) => ({
                title: p.title || "",
                rating: p.rating || null,
                reviews: p.reviews || null,
                type: p.type || "",
                address: p.address || "",
                thumbnail: p.thumbnail || null
              }))
            : [];

          // Organic results
          const organicResults = Array.isArray(data.organic_results)
            ? data.organic_results.slice(0, 5).map((item: any) => ({
                title: item.title || "",
                snippet: item.snippet || "",
                link: item.link || "",
                displayedLink: item.displayed_link || "",
                thumbnail: item.thumbnail || null
              }))
            : [];

          const payload = {
            query,
            knowledgeGraph,
            places,
            organicResults,
            source: "serpapi"
          };

          searchCache.set(cacheKey, { timestamp: Date.now(), data: payload });
          return res.json(payload);
        } else {
          console.warn(`[SerpAPI] returned HTTP status ${serpRes.status} for query: ${query}`);
        }
      } catch (err: any) {
        console.warn("[SerpAPI] Fetch failed, falling back to local results:", err?.message || err);
      }
    }

    // Graceful local fallback for Indian destinations
    const fallbackPayload = {
      query,
      knowledgeGraph: {
        title: query,
        type: "Indian Destination Search",
        description: `Explore verified attractions, local dining, and culturally authentic itineraries for ${query} across Incredible India.`,
        thumbnail: null,
        website: null,
        source: "Incredible India Knowledge Base"
      },
      places: [],
      organicResults: [
        {
          title: `Discover ${query} with Sahayak AI Trip Planner`,
          snippet: `Get personalized routes, fair auto fares, and monument timings for ${query}.`,
          link: "#",
          displayedLink: "yatraone.in › explore"
        }
      ],
      source: "local"
    };

    return res.json(fallbackPayload);
  });

  // Helper to query Groq with llama / gpt-oss models for fast travel intelligence
  async function queryGroqAI(message: string, context: any): Promise<string | null> {
    const apiKey = (process.env.GROQ_API_KEY || "").trim();
    if (!apiKey) return null;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { 
              role: "user", 
              content: `Traveller question: ${message}\nCurrent trip context: ${JSON.stringify(context || {}).slice(0, 3000)}\nAnswer directly and concisely in markdown. Immediately highlight the top famous places/monuments, famous local foods/dishes, exact opening hours/timings, and transit instructions. Never use generic introductory filler.`
            }
          ],
          temperature: 0.6,
          max_tokens: 1200
        })
      });

      if (res.ok) {
        const data: any = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && typeof content === "string") {
          return content;
        }
      } else {
        const errText = await res.text();
        console.warn("[Groq AI] Response error:", res.status, errText);
      }
    } catch (err: any) {
      console.warn("[Groq AI] Request failed:", err?.message || err);
    }
    return null;
  }

  // Assistant Query Endpoint
  app.post("/api/assistant", async (req: Request, res: Response) => {
    const { message, history, context } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Query message is required." });
    }

    try {
      let replyText: string | null = null;
      let source: "groq" | "gemini" | "local" = "local";

      // 1. Try Groq AI (Ultra-fast & configured in .env)
      if (process.env.GROQ_API_KEY) {
        replyText = await queryGroqAI(message, context);
        if (replyText) {
          source = "groq";
        }
      }

      // 2. Try Gemini AI if Groq was unavailable
      if (!replyText) {
        const ai = getGenAI();
        if (ai) {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Traveller question: ${message}\nCurrent trip context: ${JSON.stringify(context || {}).slice(0, 12000)}\nReply with detailed travel recommendations and practical advice.`,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
              maxOutputTokens: 1200,
            }
          });
          if (response.text) {
            replyText = response.text;
            source = "gemini";
          }
        }
      }

      if (replyText) {
        // Determine relevant action chips based on query and reply
        const lower = (message + " " + replyText).toLowerCase();
        const actionChips: Array<{ label: string; action: string }> = [];

        if (lower.includes("map") || lower.includes("navigat") || lower.includes("direct") || lower.includes("reach") || lower.includes("locat") || lower.includes("dewas") || lower.includes("ujjain")) {
          actionChips.push({ label: "🧭 View on Interactive Map", action: "open_map" });
        }
        if (lower.includes("scan") || lower.includes("radar") || lower.includes("nearby") || lower.includes("surround") || lower.includes("food") || lower.includes("temple") || lower.includes("monument")) {
          actionChips.push({ label: "📡 Scan Surrounding Area", action: "open_scanner" });
        }
        if (lower.includes("price") || lower.includes("fare") || lower.includes("meter") || lower.includes("scam") || lower.includes("auto") || lower.includes("bargain")) {
          actionChips.push({ label: "⚖️ Fair-Price Calculator", action: "open_trust" });
        }
        if (lower.includes("sos") || lower.includes("emergency") || lower.includes("danger") || lower.includes("police") || lower.includes("safe")) {
          actionChips.push({ label: "🚨 Emergency SOS 112", action: "open_sos" });
        }
        if (lower.includes("train") || lower.includes("transit") || lower.includes("metro") || lower.includes("vande bharat") || lower.includes("bus")) {
          actionChips.push({ label: "🚆 Transit Hub", action: "open_transit" });
        }
        if (lower.includes("accessib") || lower.includes("wheelchair") || lower.includes("sahayak")) {
          actionChips.push({ label: "♿ Request On-Ground Sahayak", action: "open_accessibility" });
        }

        return res.json({
          reply: replyText,
          actionChips: actionChips.slice(0, 3),
          source
        });
      } else {
        // Inform client to fall back to the dynamic built-in knowledge synthesizer
        return res.json({
          useFallback: true,
          reason: "no_ai_response"
        });
      }
    } catch (err: any) {
      console.warn("AI Assistant API error (falling back to knowledge base):", err?.message || err);
      return res.json({
        useFallback: true,
        reason: err?.message || "ai_error"
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const { port } = await startServerOnAvailablePort(app, DEFAULT_PORT);
  console.log(`\n  Sahayak Travel Assistant server running at:`);
  console.log(`  ➜  Local:   http://localhost:${port}/`);
  console.log(`  ➜  Network: http://0.0.0.0:${port}/\n`);
}

function startServerOnAvailablePort(
  app: express.Express,
  initialPort: number,
  host = "0.0.0.0"
): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve, reject) => {
    const maxPort = initialPort + 100;

    function tryPort(port: number) {
      const server = http.createServer(app);

      server.once("listening", () => {
        resolve({ server, port });
      });

      server.once("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.log(`Port ${port} is in use, trying ${port + 1}...`);
          if (port < maxPort) {
            tryPort(port + 1);
          } else {
            reject(
              new Error(
                `Could not find an available port between ${initialPort} and ${maxPort}`
              )
            );
          }
        } else {
          reject(err);
        }
      });

      server.listen(port, host);
    }

    tryPort(initialPort);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
