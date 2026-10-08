import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Lock } from 'lucide-react';
import type { Trip, ItineraryItem } from '../../types/travel';
import { usePlatform, journeyContext } from '../../services/journey';
import { loadGoogleMaps } from '../../services/googleMapsLoader';
import { AuthUser, isDemoUser, promptDemoRestriction } from '../../types/auth';

const QUICK_PICKS = [
  {
    id: 'qp-jaipur',
    title: '🏰 Jaipur Royal Heritage',
    destination: 'Jaipur, Rajasthan',
    days: 3,
    budget: 12000,
    interests: 'Rajput forts, palaces, Johari Bazar, authentic thali',
    prompt: 'Include Amber Fort, Hawa Mahal photo stop, and heritage craft bazaars.',
    tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'qp-varanasi',
    title: '🕉️ Spiritual Varanasi Ghats',
    destination: 'Varanasi, Uttar Pradesh',
    days: 3,
    budget: 8500,
    interests: 'Ganga Aarti, Assi morning boat ride, Kashi Vishwanath, silk weavers',
    prompt: 'Include Subah-e-Banaras at Assi Ghat and respectful river observation.',
    tag: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'qp-himachal',
    title: '🏔️ Serene Himachal & Manali',
    destination: 'Manali, Himachal Pradesh',
    days: 4,
    budget: 15000,
    interests: 'Pine forests, Solang Valley views, Tibetan cafes, peaceful mountain walks',
    prompt: 'Scenic nature walks, fresh local food, and old village trails.',
    tag: 'Scenic',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'qp-kerala',
    title: '🌴 Kerala Backwaters & Spices',
    destination: 'Kochi & Alleppey, Kerala',
    days: 4,
    budget: 18000,
    interests: 'Houseboats, spice plantations, Kathakali, coastal cuisine',
    prompt: 'Daytime canal cruising, fresh coastal meals, and Fort Kochi heritage stroll.',
    tag: 'Relaxing',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'qp-agra',
    title: '🕌 Mughal Splendors (Agra & Delhi)',
    destination: 'Agra & Delhi',
    days: 2,
    budget: 7500,
    interests: 'Taj Mahal sunrise, Agra Fort, Mehtab Bagh, Chandni Chowk street food',
    prompt: 'Early morning 6 AM Taj Mahal entry, Vande Bharat train connection, and safe food stops.',
    tag: 'Weekend',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
  }
];

export function ConnectedPlanner({
  currentTrip,
  currentUser,
  onApplyGeneratedTrip,
  accessibilityMode = false,
  initialDestination = ''
}: {
  currentTrip: Trip;
  currentUser?: AuthUser | null;
  onApplyGeneratedTrip: (trip: Trip) => void;
  accessibilityMode?: boolean;
  initialDestination?: string;
}) {
 const { profile } = usePlatform();
 const [destination, setDestination] = useState(
   initialDestination || journeyContext.current?.searchedLocation || ''
 );
 const [days, setDays] = useState(3);
 const [budget, setBudget] = useState(profile.budget || 10000);
 const [interests, setInterests] = useState(profile.interests?.join(', ') || 'Heritage, local food');
 const [prompt, setPrompt] = useState('');
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const [draft, setDraft] = useState<Trip | null>(null);
 const [source, setSource] = useState('');
 const [selectedQuickPick, setSelectedQuickPick] = useState<string | null>(null);

 useEffect(() => {
   if (initialDestination) {
     setDestination(initialDestination);
     if (journeyContext.current?.description && !prompt) {
       setPrompt(`Focus on: ${journeyContext.current.description.slice(0, 160)}`);
     }
   } else if (journeyContext.current?.searchedLocation && !destination) {
     setDestination(journeyContext.current.searchedLocation);
     if (journeyContext.current?.description && !prompt) {
       setPrompt(`Focus on: ${journeyContext.current.description.slice(0, 160)}`);
     }
   }
 }, [initialDestination]);

 function handleSelectQuickPick(qp: typeof QUICK_PICKS[0]){
   setSelectedQuickPick(qp.id);
   setDestination(qp.destination);
   setDays(qp.days);
   setBudget(qp.budget);
   setInterests(qp.interests);
   setPrompt(qp.prompt);
 }

 async function generate(){
   if (isDemoUser(currentUser)) {
     promptDemoRestriction(
       "AI Custom Trip Generator",
       "Generating multi-day custom AI travel itineraries with live budget calculations and AI optimization requires a free registered account. Please sign in or register to plan your trip."
     );
     return;
   }
   setBusy(true);
   setError('');
   try{
     const response=await fetch('/api/plan',{
       method:'POST',
       headers:{'Content-Type':'application/json'},
       credentials:'include',
       body:JSON.stringify({
         destination,
         days,
         budget,
         interests,
         prompt,
         wheelchair:accessibilityMode||profile.wheelchair,
         language:profile.language
       })
     });
     const contentType = response.headers.get('content-type') || '';
     let data: any = null;
     if (contentType.includes('application/json')) {
       data = await response.json();
     } else {
       if (response.status === 502 || response.status === 503 || response.status === 504) {
         throw new Error('The server is currently waking up or deploying. Please wait 15–30 seconds and click again.');
       }
       throw new Error(`Server returned ${response.status}. If newly deployed, please allow a moment for the server to finish starting.`);
     }
     if(!response.ok)throw Error(data.error || 'Failed to generate itinerary.');
     let trip=data.trip as Trip;
     setSource(data.source);
     try{
       const maps=await loadGoogleMaps();
       const geocoder=new maps.Geocoder();
       for(const day of trip.days){
         for(const item of day.items){
           try{
             const result=await geocoder.geocode({address:`${item.title}, ${day.city}, India`});
             const pos=result.results[0]?.geometry.location;
             if(pos)item.coordinates={lat:pos.lat(),lng:pos.lng()};
           }catch{/* Keep unlocated activities editable. */}
         }
       }
     }catch{
       setSource(data.source+' · Location lookup unavailable; confirm places before navigating.');
     }
     setDraft(trip);
   }catch(e:any){
     setError(e.message);
   }finally{
     setBusy(false);
   }
 }

 function edit(day:number,index:number,patch:Partial<ItineraryItem>){
   setDraft(t=>t?{...t,days:t.days.map((d,i)=>i!==day?d:{...d,items:d.items.map((it,j)=>j===index?{...it,...patch}:it)})}:t);
 }

 const total=draft?.days.flatMap(d=>d.items).reduce((s,i)=>s+i.cost,0)||0;

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
     {/* 1. Main Planner Form Panel */}
     <section className="journey-panel">
       <p className="journey-eyebrow">A plan built around you</p>
       <h1>Trip Planner</h1>
       <p>Customize your destination, days and budget below, or choose one of our recommended getaways below to auto-fill your plan.</p>
       {isDemoUser(currentUser) && (
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '16px', margin: '12px 0', fontSize: '12px', color: '#78350F' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <Lock size={15} color="#D97706" />
             <span><strong>Demo Mode:</strong> Full AI Trip Generation is restricted for demo accounts.</span>
           </div>
           <button
             type="button"
             onClick={() => promptDemoRestriction('AI Custom Trip Generator', 'Sign in or register a free account to unlock custom AI multi-day itinerary generation, budget planning, and personalized schedules.')}
             style={{ padding: '4px 10px', background: '#D97706', color: '#FFFFFF', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' }}
           >
             Log In to Unlock
           </button>
         </div>
       )}

       {/* Form Fields */}
       <div className="journey-grid">
         <label>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
             <span>Destination</span>
             {destination && (destination === journeyContext.current?.searchedLocation || destination === initialDestination) && (
               <span style={{ fontSize: '10px', fontWeight: 700, color: '#C84B31', background: '#FFF2EE', border: '1px solid #FED7CC', padding: '1px 6px', borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                 <Sparkles size={11} color="#C84B31" />
                 <span>From Search</span>
               </span>
             )}
           </div>
           <input value={destination} onChange={e=>{setDestination(e.target.value); setSelectedQuickPick(null);}} placeholder="e.g. Udaipur, Rajasthan" />
         </label>
         <label>
           Days (1–7)
           <input type="number" min="1" max="7" value={days} onChange={e=>setDays(Number(e.target.value))} />
         </label>
         <label>
           Total budget (₹)
           <input type="number" min="100" value={budget} onChange={e=>setBudget(Number(e.target.value))} />
         </label>
         <label>
           Interests
           <input value={interests} onChange={e=>setInterests(e.target.value)} placeholder="Heritage, local food, forts" />
         </label>
       </div>

       <label>
         Preferences or special requests
         <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Slow pace, vegetarian meals, step-free access, photography spots…" />
       </label>

       <button className="journey-primary" disabled={busy||!destination.trim()||days<1||days>7||budget<100} onClick={generate}>
         {busy ? 'Building your itinerary…' : draft ? 'Generate a new draft' : 'Create my itinerary'}
       </button>

       {error && <p role="alert" className="journey-error">{error}</p>}

       {draft && (
         <>
           <p className="journey-muted">{source}. Prices and opening hours are estimates, not verified bookings.</p>
           <div className="journey-summary">
             <strong>Estimated total ₹{total.toLocaleString()}</strong>
             <span>
               {total > budget 
                 ? `₹${(total - budget).toLocaleString()} over budget — adjust or remove an activity below.` 
                 : `₹${(budget - total).toLocaleString()} remaining within budget`}
             </span>
           </div>

           {draft.days.map((d, i) => (
             <section key={i}>
               <h2>Day {i + 1} · {d.city}</h2>
               {d.items.map((it, j) => (
                 <article className="journey-card" key={it.id}>
                   <div className="journey-grid">
                     <label>
                       Activity
                       <input value={it.title} onChange={e => edit(i, j, { title: e.target.value })} />
                     </label>
                     <label>
                       Time
                       <input type="time" value={it.time} onChange={e => edit(i, j, { time: e.target.value })} />
                     </label>
                     <label>
                       Estimate (₹)
                       <input type="number" min="0" value={it.cost} onChange={e => edit(i, j, { cost: Math.max(0, Number(e.target.value)) })} />
                     </label>
                   </div>
                   <p>{it.description}</p>
                   <small>{it.coordinates ? 'Map coordinates resolved.' : 'Check location before navigating.'}</small>
                   <div style={{ marginTop: 8 }}>
                     <button onClick={() => setDraft(t => ({ ...t!, days: t!.days.map((day, k) => k !== i ? day : { ...day, items: day.items.filter((_, n) => n !== j) }) }))}>
                       Remove activity
                     </button>
                   </div>
                 </article>
               ))}
             </section>
           ))}

           <div style={{ marginTop: 18 }}>
             <button className="journey-primary" disabled={!draft.days.some(d => d.items.length)} onClick={() => onApplyGeneratedTrip({ ...draft, baseBudget: budget })}>
               Save to My Trip
             </button>
           </div>
         </>
       )}
     </section>

     {/* 2. Recommended Quick Picks Section - Positioned BELOW the planner div with images */}
     <section className="journey-panel">
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <Sparkles size={18} color="#c84b31" />
           <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#191715' }}>
             Recommended Destinations & Quick Picks
           </h2>
         </div>
         <span style={{ fontSize: 11, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>
           1-Click Auto-Fill
         </span>
       </div>
       <p style={{ color: '#646e68', fontSize: 13, marginTop: -4, marginBottom: 16 }}>
         Select any verified Indian destination below to auto-populate duration, budget, and prompt in the planner above.
       </p>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
         {QUICK_PICKS.map(qp => {
           const isSelected = selectedQuickPick === qp.id;
           return (
             <div
               key={qp.id}
               onClick={() => {
                 handleSelectQuickPick(qp);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               style={{
                 borderRadius: 16,
                 border: isSelected ? '2px solid #c84b31' : '1px solid #e5e0d8',
                 background: isSelected ? '#fff9f6' : '#ffffff',
                 overflow: 'hidden',
                 cursor: 'pointer',
                 boxShadow: isSelected ? '0 4px 14px rgba(200,75,49,0.18)' : '0 2px 6px rgba(0,0,0,0.04)',
                 transition: 'all 0.2s ease',
                 display: 'flex',
                 flexDirection: 'column'
               }}
             >
               {/* Destination Image */}
               <div style={{ height: 135, width: '100%', position: 'relative', overflow: 'hidden' }}>
                 <img 
                   src={qp.image} 
                   alt={qp.title} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                 />
                 <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>
                   {qp.tag}
                 </div>
                 <div style={{ position: 'absolute', bottom: 8, left: 8, background: '#c84b31', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>
                   {qp.days} Days · ₹{qp.budget.toLocaleString()}
                 </div>
               </div>

               {/* Card Content */}
               <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                 <div>
                   <strong style={{ fontSize: 13, color: '#191715', display: 'block', marginBottom: 3 }}>
                     {qp.title}
                   </strong>
                   <span style={{ fontSize: 11, color: '#796140', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                     📍 {qp.destination}
                   </span>
                   <p style={{ fontSize: 11, color: '#646e68', margin: '0 0 10px', lineHeight: 1.4 }}>
                     {qp.interests}
                   </p>
                 </div>

                 <button
                   type="button"
                   style={{
                     width: '100%',
                     padding: '7px 10px',
                     borderRadius: 8,
                     border: 'none',
                     background: isSelected ? '#c84b31' : '#f4efe6',
                     color: isSelected ? '#ffffff' : '#191715',
                     fontSize: 11,
                     fontWeight: 700,
                     cursor: 'pointer',
                     transition: 'background 0.15s ease'
                   }}
                 >
                   {isSelected ? '✓ Loaded in Planner Above' : 'Use this destination ↑'}
                 </button>
               </div>
             </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
