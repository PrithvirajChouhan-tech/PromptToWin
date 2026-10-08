import type { Express } from 'express';
import { GoogleGenAI } from '@google/genai';
import { INDIA_TRIPS } from './src/data/indiaTrips';
import { randomUUID } from 'node:crypto';

interface GeneratedDay {
  city: string;
  items: Array<{
    title: string;
    time: string;
    category: string;
    cost: number;
    duration: string;
    description: string;
    touristTip: string;
    coordinates?: { lat: number; lng: number };
  }>;
}

/**
 * Generate itinerary with Google Gemini models.
 * Tries multiple model tiers to guard against deprecations or quota limits.
 */
async function generateWithGemini(
  destination: string,
  days: number,
  budget: number,
  prompt: string,
  interests: string,
  wheelchair: boolean,
  language: string,
  catalogSeed: any[]
): Promise<{ days: GeneratedDay[]; source: string }> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY not configured or still set to placeholder');
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const contents = `Create a practical travel itinerary for ${destination}, ${days} days, total budget INR ${budget}. Interests: ${interests.slice(0, 400)}. Requests: ${prompt.slice(0, 1000)}. Wheelchair preference: ${wheelchair}. Language ${language === 'hi' ? 'Hindi' : 'English'}. Use actual named places, travel time, lodging and meals. Never claim verification, bookings or current availability. Return only JSON {"days":[{"city":"...","items":[{"title":"...","time":"09:00","category":"cultural_sight|transit|culinary|stay|cultural_buy","cost":100,"duration":"60 min","description":"...","touristTip":"..."}]}]}. Costs must be nonnegative estimates, total at or below budget when feasible. Include accessible alternatives but do not claim facilities are verified. Seed reference if relevant: ${JSON.stringify(catalogSeed.slice(0, 2)).slice(0, 8000)}`;

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: 7000
        }
      });

      const text = result.text || '{}';
      const output = JSON.parse(text);
      if (
        Array.isArray(output.days) &&
        output.days.length === days &&
        output.days.every((d: any) => Array.isArray(d.items) && d.items.length > 0 && d.items.length <= 12)
      ) {
        return { days: output.days, source: `AI-generated draft (Gemini / ${model})` };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[PlanRoute] Gemini attempt with model '${model}' failed:`, err?.message || err);
    }
  }

  throw lastError || new Error('All Gemini model candidates failed');
}

/**
 * Generate itinerary with Groq AI as a fast high-rate-limit fallback.
 */
async function generateWithGroq(
  destination: string,
  days: number,
  budget: number,
  prompt: string,
  interests: string,
  wheelchair: boolean,
  language: string
): Promise<{ days: GeneratedDay[]; source: string }> {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are an expert travel itinerary planner. Output ONLY valid JSON adhering strictly to: {"days":[{"city":"string","items":[{"title":"string","time":"09:00","category":"cultural_sight|transit|culinary|stay|cultural_buy","cost":100,"duration":"60 min","description":"string","touristTip":"string"}]}]}. Do NOT include markdown fences, comments, or extra text.'
            },
            {
              role: 'user',
              content: `Create a practical travel itinerary for ${destination}, exactly ${days} days, total budget INR ${budget}. Interests: ${interests.slice(0, 400)}. Special requests: ${prompt.slice(0, 800)}. Accessibility: ${wheelchair}. Language: ${language === 'hi' ? 'Hindi' : 'English'}. Return exactly ${days} days in the days array with 3 to 5 realistic items per day.`
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (res.ok) {
        const data: any = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (
            Array.isArray(parsed.days) &&
            parsed.days.length === days &&
            parsed.days.every((d: any) => Array.isArray(d.items) && d.items.length > 0)
          ) {
            return { days: parsed.days, source: `AI-generated draft (Groq / ${model})` };
          }
        }
      } else {
        const errText = await res.text();
        console.warn(`[PlanRoute] Groq '${model}' returned ${res.status}:`, errText);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[PlanRoute] Groq attempt with model '${model}' failed:`, err?.message || err);
    }
  }

  throw lastError || new Error('All Groq model candidates failed');
}

/**
 * Synthesizes a high-quality, realistic starter itinerary when neither AI provider
 * is configured or reachable, preventing complete 503 outage for new destinations.
 */
function generateSynthesizedFallback(
  destination: string,
  days: number,
  budget: number
): { days: GeneratedDay[]; source: string } {
  const dailyBudget = Math.max(100, Math.round(budget / days));
  const templates = [
    {
      titleSuffix: 'Arrival & City Orientation Walk',
      items: [
        {
          title: `Arrival & Local Transit in ${destination}`,
          time: '09:00',
          category: 'transit',
          costPercent: 0.1,
          duration: '45 min',
          description: `Settle into ${destination}, check in at accommodation and familiarize with local transport.`,
          touristTip: 'Use authorized taxi stands or metered auto-rickshaws with agreed rates.'
        },
        {
          title: `Historic & Cultural Landmarks of ${destination}`,
          time: '11:00',
          category: 'cultural_sight',
          costPercent: 0.15,
          duration: '90 min',
          description: `Explore the prominent monuments, historic squares, and landmark heritage of ${destination}.`,
          touristTip: 'Check official ticket counters and carry refillable drinking water.'
        },
        {
          title: `Authentic Regional Lunch & Specialties`,
          time: '13:30',
          category: 'culinary',
          costPercent: 0.2,
          duration: '60 min',
          description: `Enjoy traditional delicacies and authentic local recipes renowned in ${destination}.`,
          touristTip: 'Choose busy restaurants with high local footfall for freshest food.'
        },
        {
          title: `Local Handcraft Bazaar & Market Exploration`,
          time: '16:00',
          category: 'cultural_buy',
          costPercent: 0.2,
          duration: '120 min',
          description: `Stroll through vibrant markets featuring regional crafts, textiles, and local souvenirs.`,
          touristTip: 'Polite bargaining is customary in open bazaar stalls.'
        },
        {
          title: `Sunset Point & Scenic Evening Promenade`,
          time: '18:30',
          category: 'cultural_sight',
          costPercent: 0.05,
          duration: '60 min',
          description: `Unwind at the most beloved sunset viewpoint, riverfront, or scenic vantage point in ${destination}.`,
          touristTip: 'Arrive 30 minutes before sunset for best photography lighting.'
        }
      ]
    },
    {
      titleSuffix: 'Architectural Heritage & Art',
      items: [
        {
          title: `Heritage Sites & Prominent Sights`,
          time: '09:30',
          category: 'cultural_sight',
          costPercent: 0.2,
          duration: '120 min',
          description: `Discover revered architecture, heritage courtyards, and local museum galleries.`,
          touristTip: 'Licensed guides or audio tours offer valuable historical context.'
        },
        {
          title: `Classic Neighborhood Eatery Experience`,
          time: '13:00',
          category: 'culinary',
          costPercent: 0.2,
          duration: '60 min',
          description: `Savor authentic regional thali, specialty breads, or customary street food.`,
          touristTip: 'Ask the host for their signature dish of the day.'
        },
        {
          title: `Artisan Guilds & Handloom Emporiums`,
          time: '15:00',
          category: 'cultural_buy',
          costPercent: 0.2,
          duration: '90 min',
          description: `Observe master artisans creating traditional crafts, weaves, or local artworks.`,
          touristTip: 'Government-certified emporiums offer transparent fixed pricing.'
        },
        {
          title: `Evening Cultural Stroll & Lit Monuments`,
          time: '18:00',
          category: 'cultural_sight',
          costPercent: 0.1,
          duration: '75 min',
          description: `Experience the evening ambiance with illuminated buildings, music, or traditional gatherings.`,
          touristTip: 'Respect local customs and footwear protocols at religious locations.'
        }
      ]
    },
    {
      titleSuffix: 'Scenic Vistas & Nature Excursions',
      items: [
        {
          title: `Scenic Trails & Natural Landscapes`,
          time: '08:30',
          category: 'cultural_sight',
          costPercent: 0.15,
          duration: '120 min',
          description: `Morning exploration of panoramic hills, lush botanical gardens, or scenic waterways.`,
          touristTip: 'Wear sturdy walking footwear and carry a light jacket if in hill areas.'
        },
        {
          title: `Terrace / Garden Lunch with a View`,
          time: '12:30',
          category: 'culinary',
          costPercent: 0.2,
          duration: '75 min',
          description: `Relaxed dining experience with scenic outdoor views and freshly prepared seasonal produce.`,
          touristTip: 'Fresh coconut water or local herbal infusions are very refreshing.'
        },
        {
          title: `Hidden Lanes & Old Quarter Heritage`,
          time: '15:30',
          category: 'cultural_sight',
          costPercent: 0.1,
          duration: '90 min',
          description: `Discover tucked-away alleys, ancient archways, and peaceful courtyards away from the rush.`,
          touristTip: 'Politely ask before photographing residents in residential lanes.'
        },
        {
          title: `Farewell Feast & Night Market Experience`,
          time: '18:30',
          category: 'culinary',
          costPercent: 0.25,
          duration: '90 min',
          description: `Celebrate your stay in ${destination} with a curated culinary dinner of signature regional dishes.`,
          touristTip: 'Book a table in advance during peak festive or holiday periods.'
        }
      ]
    }
  ];

  const daysList: GeneratedDay[] = [];
  for (let i = 0; i < days; i++) {
    const tmpl = templates[i % templates.length];
    const items = tmpl.items.map(it => ({
      title: it.title,
      time: it.time,
      category: it.category,
      cost: Math.round(dailyBudget * it.costPercent),
      duration: it.duration,
      description: it.description,
      touristTip: it.touristTip
    }));
    daysList.push({
      city: destination,
      items
    });
  }

  return {
    days: daysList,
    source: 'Curated destination draft (Add GEMINI_API_KEY in host settings for custom AI generation)'
  };
}

export function installPlanner(app: Express, getUser: (req: any) => any) {
  app.post('/api/plan', async (req, res) => {
    const user = getUser(req);

    const destination = String(req.body.destination || '').trim().slice(0, 150);
    const days = Number(req.body.days);
    const budget = Number(req.body.budget);

    if (
      !destination ||
      !Number.isInteger(days) ||
      days < 1 ||
      days > 7 ||
      !Number.isFinite(budget) ||
      budget < 100 ||
      budget > 1e7
    ) {
      return res.status(400).json({ error: 'Enter a destination, 1–7 days and a valid budget.' });
    }

    const prompt = String(req.body.prompt || '');
    const interests = String(req.body.interests || '');
    const wheelchair = Boolean(req.body.wheelchair);
    const language = String(req.body.language || 'en');

    const catalog = INDIA_TRIPS.flatMap(t => t.days).filter(
      d =>
        destination.toLowerCase().includes(d.city.toLowerCase()) ||
        d.city.toLowerCase().includes(destination.toLowerCase())
    );

    let planned: GeneratedDay[];
    let source: string;

    // 1. Try Google Gemini AI
    try {
      const result = await generateWithGemini(
        destination,
        days,
        budget,
        prompt,
        interests,
        wheelchair,
        language,
        catalog
      );
      planned = result.days;
      source = result.source;
    } catch (geminiErr: any) {
      console.warn('[PlanRoute] Gemini generation unavailable, trying Groq AI fallback:', geminiErr?.message);

      // 2. Try Groq AI Fallback
      try {
        const groqResult = await generateWithGroq(
          destination,
          days,
          budget,
          prompt,
          interests,
          wheelchair,
          language
        );
        planned = groqResult.days;
        source = groqResult.source;
      } catch (groqErr: any) {
        console.warn('[PlanRoute] Groq generation unavailable:', groqErr?.message);

        // 3. Fallback to matching curated catalog if available
        if (catalog.length > 0) {
          planned = Array.from({ length: days }, (_, i) => catalog[i % catalog.length] as unknown as GeneratedDay);
          source = 'Curated destination plan (AI unavailable)';
        } else {
          // 4. Synthesize realistic destination starter itinerary so the user is never blocked by a 503 error
          const fallback = generateSynthesizedFallback(destination, days, budget);
          planned = fallback.days;
          source = fallback.source;
        }
      }
    }

    const first = INDIA_TRIPS[0];
    const trip = {
      ...first,
      id: `plan-${randomUUID()}`,
      title: `${days} days in ${destination}`,
      region: destination,
      tagline: 'Your editable travel plan',
      duration: `${days} days`,
      dateRange: 'Choose your travel dates',
      baseBudget: budget,
      days: planned.map((d, i) => ({
        dayNumber: i + 1,
        date: `Day ${i + 1}`,
        dayOfWeek: '',
        title: `Explore ${d.city || destination}`,
        city: String(d.city || destination).slice(0, 150),
        weather: { temp: '—', condition: 'Check live forecast', icon: 'Sun' },
        highlight: d.items[0]?.title || destination,
        items: d.items.map(it => ({
          id: randomUUID(),
          title: String(it.title || 'Activity').slice(0, 180),
          time: /^\d{2}:\d{2}$/.test(it.time) ? it.time : '09:00',
          category: ['transit', 'culinary', 'stay', 'cultural_buy', 'cultural_sight'].includes(it.category)
            ? it.category
            : 'cultural_sight',
          location: String(it.title || destination).slice(0, 180),
          city: String(d.city || destination).slice(0, 150),
          cost: Math.max(0, Math.min(1e7, Number(it.cost) || 0)),
          duration: String(it.duration || '60 min').slice(0, 50),
          description: String(it.description || '').slice(0, 1500),
          touristTip: String(it.touristTip || 'Confirm current prices and opening hours.').slice(0, 1000),
          imageUrl: '',
          ...(it.coordinates ? { coordinates: it.coordinates } : {})
        }))
      }))
    };

    res.json({ trip, source });
  });
}
