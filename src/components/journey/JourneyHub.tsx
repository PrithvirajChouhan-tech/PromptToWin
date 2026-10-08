import { HomeMap } from "./HomeMap";
import React,{useEffect,useRef,useState} from 'react';
import {Bell,Compass,ArrowRight,Check,MapPin} from 'lucide-react';
import {api,mutate,notify,usePlatform,copy,journeyContext} from '../../services/journey';
import type {Trip,DayPlan,ItineraryItem} from '../../types/travel';
import type {MainNavTab} from '../BottomNavBar';
import './journey.css';
const money=(n:number)=>`₹${Number(n||0).toLocaleString()}`;
const date=(n:number)=>new Date(n).toLocaleDateString();
function useAction(){const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);async function run(fn:()=>Promise<any>,success='Saved'){setBusy(true);setMessage('');try{await fn();setMessage(success);}catch(e){setMessage(e.message);}finally{setBusy(false);}}return {message,busy,run};}
export function Notifications(){const {notifications,profile}=usePlatform();const [open,setOpen]=useState(false);const unread=notifications.filter(n=>!n.read).length;return <><button className="journey-action journey-bell" aria-label={`Notifications, ${unread} unread`} onClick={()=>setOpen(!open)}><Bell size={17}/>{unread>0&&<span>{unread}</span>}</button>{open&&<aside className="journey-panel journey-notifications" aria-label="Travel notifications"><div className="journey-actions"><h2>{profile.language==='hi'?'सूचनाएं':'Notifications'}</h2><button onClick={()=>setOpen(false)}>Close</button><button onClick={()=>mutate('/notifications/read',{}).catch(()=>{})}>Mark all read</button></div>{!notifications.length&&<p>No updates yet. Relevant trip and community events appear here.</p>}{notifications.map(n=><article className="journey-card" key={n.id}><strong>{n.title}</strong><p>{n.body}</p><small>{date(n.createdAt)}{!n.read?' · New':''}</small></article>)}</aside>}</>;}
export function JourneyHome({trip,day,onNavigate,onUpdate}:{trip:Trip;day:DayPlan;onNavigate:(t:MainNavTab)=>void;onUpdate:(trip:Trip)=>void}){
 const {profile,packages}=usePlatform();const t=copy[profile.language||'en'];const a=useAction();const [forecast,setForecast]=useState<any>(null);const [weatherError,setWeatherError]=useState('');const [weatherRetry,setWeatherRetry]=useState(0);const next=day.items.find(i=>!i.completed);const current=day.items.find(i=>i.id===day.currentActivityId);const completed=trip.days.flatMap(d=>d.items).filter(i=>i.completed);const planned=trip.days.flatMap(d=>d.items).reduce((s,i)=>s+i.cost,0);const spent=completed.reduce((s,i)=>s+i.cost,0);const lat=next?.coordinates?.lat,lng=next?.coordinates?.lng;
 useEffect(()=>{const controller=new AbortController();setForecast(null);setWeatherError('');if(lat===undefined||lng===undefined)return;fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(1)}&longitude=${lng.toFixed(1)}&current=temperature_2m,precipitation&hourly=precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=auto`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(setForecast).catch(e=>{if(e.name!=='AbortError')setWeatherError('Forecast unavailable. Retry when connected.');});return()=>controller.abort();},[lat,lng,weatherRetry]);
 const raining=forecast?.current?.precipitation>0||forecast?.daily?.precipitation_probability_max?.[0]>=70;
 useEffect(()=>{journeyContext.current={trip:trip.title,city:day.city,currentActivity:current?.title,nextActivity:next?.title,activities:day.items.map(({title,time,cost,completed})=>({title,time,cost,completed})),remainingBudget:trip.baseBudget-spent,weather:forecast?.current,preferences:profile};if(raining&&next)void notify(`rain-${next.id}-${new Date().toISOString().slice(0,10)}`,'Weather may affect your next stop',`Rain near ${day.city}. Review indoor alternatives before leaving.`);},[trip,day,forecast,profile]);
 useEffect(()=>{const tick=()=>{if(!next)return;const m=next.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);if(!m)return;let hour=Number(m[1]);if(m[3])hour=hour%12+(m[3].toUpperCase()==='PM'?12:0);const now=new Date();const time=new Date();time.setHours(hour,Number(m[2]),0,0);if(time.getTime()-now.getTime()>0&&time.getTime()-now.getTime()<900000)void notify(`upcoming-${next.id}-${now.toDateString()}`,'Your next activity starts soon',`${next.title} at ${next.time}`);};tick();const timer=setInterval(tick,60000);return()=>clearInterval(timer);},[next?.id,next?.time]);
 const indoor=day.items.find(i=>!i.completed&&i.id!==next?.id&&/museum|gallery|indoor|craft|cafe/i.test(i.title));
 const alternatives=packages.filter(p=>p.city.toLowerCase()===day.city.toLowerCase()&&p.price<=Math.max(0,trip.baseBudget-spent)&&(!profile.wheelchair||p.accessible));
 function moveNext(item:ItineraryItem){onUpdate({...trip,days:trip.days.map(d=>d.dayNumber!==day.dayNumber?d:{...d,items:[...d.items.filter(i=>i.completed),{...item,time:next?.time||'Flexible'},...d.items.filter(i=>!i.completed&&i.id!==item.id).map(i=>({...i,time:'Flexible'}))]})});}
 return <><section className="journey-panel"><p className="journey-eyebrow">{day.city} · Yatra One</p><h1>{t.today}</h1><p>{trip.title}</p><div className="journey-summary"><div><small>{current?'Current activity':t.next}</small><h2>{current?.title||next?.title||'You’ve completed today’s plan'}</h2><p>{next&&current?`${t.next}: ${next.title}`:next?.time}</p></div><button className="journey-primary" onClick={()=>onNavigate('map')}>Explore the map <ArrowRight size={15}/></button></div><div className="journey-grid"><div><small>Planned / trip budget</small><h2>{money(planned)} / {money(trip.baseBudget)}</h2><p>{money(Math.max(0,trip.baseBudget-spent))} remaining after completed activities</p></div><div><small>Trip progress</small><h2>{completed.length} / {trip.days.flatMap(d=>d.items).length} activities</h2><button onClick={()=>onNavigate('itinerary')}>View My Trip</button></div></div><div className="journey-actions"><button onClick={()=>onNavigate('ai_planner')}>{t.plan}</button><button onClick={()=>onNavigate('guides')}>Find a local guide</button><button onClick={()=>onNavigate('trust')}>Check fair prices</button></div></section><HomeMap day={day} onExplore={()=>onNavigate("map")}/><section className="journey-panel"><h2>{t.weather}</h2>{forecast?<><div className="journey-grid">{forecast.daily.time.map((d:string,i:number)=><div className="journey-card" key={d}><strong>{d}</strong><p>{forecast.daily.temperature_2m_min[i]}–{forecast.daily.temperature_2m_max[i]}°C</p><small>{forecast.daily.precipitation_probability_max[i]}% chance of rain</small></div>)}</div>{raining&&<div className="journey-card"><strong>Rain may affect outdoor activities</strong><p>{indoor?`Move ${indoor.title} to the next stop. The remaining activities will need new timings.`:'No confirmed indoor alternative in this day. Explore museums or ask the assistant for suggestions.'}</p>{indoor&&<button onClick={()=>a.run(async()=>moveNext(indoor),'Plan updated. Review the remaining timings.')}>Use indoor alternative</button>}</div>}</>:<p>{weatherError|| (lat===undefined?'Add a mapped activity to see a destination forecast.':'Loading forecast…')}</p>}{weatherError&&<button onClick={()=>setWeatherRetry(n=>n+1)}>Retry forecast</button>}{next&&<details><summary>Running late or finishing early?</summary><p>Shift the remaining timed activities. Completed activities are kept.</p><div className="journey-actions">{[-30,30,60].map(minutes=><button key={minutes} onClick={()=>a.run(async()=>{onUpdate({...trip,days:trip.days.map(d=>d.dayNumber!==day.dayNumber?d:{...d,items:d.items.map(item=>{if(item.completed)return item;const m=item.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);if(!m)return item;let h=Number(m[1]);if(m[3])h=h%12+(m[3].toUpperCase()==='PM'?12:0);const v=Math.max(0,Math.min(1439,h*60+Number(m[2])+minutes));return {...item,time:`${Math.floor(v/60).toString().padStart(2,'0')}:${(v%60).toString().padStart(2,'0')}`};})})});},'Schedule shifted. Check opening hours before leaving.')}>{minutes>0?'+':''}{minutes} min</button>)}</div></details>}{planned>trip.baseBudget&&<p className="journey-error">Plan exceeds your budget by {money(planned-trip.baseBudget)}. Edit costs or remove an optional activity in My Trip.</p>}<p role="status">{a.message}</p></section>{alternatives.length>0&&<section className="journey-panel"><h2>Local experiences within your budget</h2>{alternatives.map(p=><article className="journey-card" key={p.id}><h3>{p.title}</h3><p>{p.description} · {money(p.price)}</p><button onClick={()=>a.run(async()=>onUpdate({...trip,days:trip.days.map(d=>d.dayNumber!==day.dayNumber?d:{...d,items:[...d.items,{id:`package-${p.id}-${Date.now()}`,title:p.title,time:'Flexible',category:'cultural_sight',city:p.city,location:p.city,cost:p.price,duration:`${p.minutes} min`,description:p.description,touristTip:'Contact the provider to confirm availability. Adding does not make a booking.',imageUrl:''}]})}),'Added to My Trip')}>Add to today</button></article>)}</section>}</>;
}
const DEFAULT_COMMUNITY_POSTS = [
  {id:'seed-c-1',owner:'system',author:'Priya Sharma (Heritage Explorer)',kind:'review',place:'Taj Mahal, Agra',text:'The sunrise view from the Yamuna riverside garden (Mehtab Bagh) is unmatched. Avoid crowds by entering East Gate right at 6:00 AM opening time. ASI electronic security is smooth and well-managed.',rating:5,amount:50,evidence:'',votes:['user-1','user-2','user-3'],status:'community-confirmed',createdAt:Date.now()-172800000},
  {id:'seed-c-2',owner:'system',author:'Arjun Mehta (Solo Traveler)',kind:'review',place:'Amber Fort, Jaipur',text:'Magnificent Rajput architecture. Do not miss the Sheesh Mahal mirror work. The evening sound and light show at 7:30 PM is worth attending if staying in Jaipur overnight.',rating:5,amount:100,evidence:'',votes:['user-2','user-4'],status:'community-confirmed',createdAt:Date.now()-259200000},
  {id:'seed-c-3',owner:'system',author:'David Wilson (Cultural Tourist)',kind:'tip',place:'New Delhi Metro & Railway Station',text:'Skip 45-minute ticket queues at monuments by booking your official ASI e-tickets online beforehand. Also, Airport Express Metro line to NDLS is air-conditioned, takes only 19 minutes, and costs ₹60.',rating:5,amount:60,evidence:'',votes:['user-1','user-3','user-5'],status:'community-confirmed',createdAt:Date.now()-86400000},
  {id:'seed-c-4',owner:'system',author:'Sneha Patel (Architect)',kind:'tip',place:'Varanasi Old City Alleys',text:'Wear comfortable slip-on walking shoes when visiting Kashi Vishwanath corridor and ghats. Keep small change (₹10/₹20) handy for official temple shoe counters.',rating:4,amount:20,evidence:'',votes:['user-2','user-6'],status:'community-confirmed',createdAt:Date.now()-345600000},
  {id:'seed-c-5',owner:'system',author:'Vikramaditya Roy (Food & Culture Blogger)',kind:'experience',place:'Assi Ghat to Dashashwamedh, Varanasi',text:'Hired an early morning traditional wooden rowboat for ₹350 per person. Watching Subah-e-Banaras classical music followed by sunrise Ganga Aarti was an unforgettable spiritual highlight of India.',rating:5,amount:350,evidence:'',votes:['user-1','user-2','user-4','user-7'],status:'community-confirmed',createdAt:Date.now()-172800000},
  {id:'seed-c-6',owner:'system',author:'Claire Dupont (Artisan Enthusiast)',kind:'experience',place:'Bagru Artisan Village, Jaipur',text:'Attended a genuine natural Dabu block printing workshop with traditional Chippa families. Learned how indigo vats and hand-carved wooden blocks are used to create GI-certified textiles.',rating:5,amount:800,evidence:'',votes:['user-3','user-5'],status:'community-confirmed',createdAt:Date.now()-432000000},
  {id:'seed-c-7',owner:'system',author:'Rohan Gupta (Daily Commuter)',kind:'price',place:'NDLS Railway Station to Connaught Place, Delhi',text:'Official Delhi Traffic Police prepaid auto booth charges exactly ₹70. Outside unauthorized touts demand ₹300-₹400 claiming city traffic strikes. Always insist on official booth receipt.',rating:5,amount:70,evidence:'',votes:['user-1','user-3','user-4','user-8'],status:'community-confirmed',createdAt:Date.now()-86400000},
  {id:'seed-c-8',owner:'system',author:'Ananya Sen (Foodie Traveler)',kind:'price',place:'Laxmi Mishthan Bhandar (LMB), Johari Bazar, Jaipur',text:'Unlimited authentic pure ghee Rajasthani royal thali costs ₹380 per plate. Clean, air-conditioned heritage dining with free purified RO water.',rating:5,amount:380,evidence:'',votes:['user-2','user-5'],status:'community-confirmed',createdAt:Date.now()-259200000},
  {id:'seed-c-9',owner:'system',author:'Tourist Safety Sentinel',kind:'scam',place:'Paharganj / New Delhi Station Exit',text:'Watch out for people claiming "Your hotel has burned down" or "Main road blocked for festival". They will take you to a bogus agency in CP charging ₹40,000 for fake tours. Call your hotel directly.',rating:1,amount:0,evidence:'',votes:['user-1','user-2','user-6','user-9'],status:'community-confirmed',createdAt:Date.now()-172800000},
  {id:'seed-c-10',owner:'system',author:'ASI Verified Protection Alert',kind:'scam',place:'Taj East Gate Shilpgram, Agra',text:'Unauthorized touts posing as guides claim Taj Mahal main gate is closed for VIPs and try to sell fake paper tokens for ₹500. Buy only from official ASI counters or online portal.',rating:1,amount:0,evidence:'',votes:['user-2','user-4','user-7'],status:'community-confirmed',createdAt:Date.now()-345600000},
  {id:'seed-c-11',owner:'system',author:'Rajesh K. (Access Advocate)',kind:'accessibility',place:'Taj Mahal Monument Complex, Agra',text:'Taj Mahal East Gate has smooth stone wheelchair ramps from golf cart drop-off all the way to the inner gardens. Free wheelchairs available at the entrance with valid ID deposit.',rating:5,amount:0,evidence:'',votes:['user-1','user-5','user-8'],status:'community-confirmed',createdAt:Date.now()-259200000},
  {id:'seed-c-12',owner:'system',author:'Meera Nambiar (Accessible Travel)',kind:'accessibility',place:'Delhi Metro Red Fort & Chandni Chowk Stations',text:'Both stations feature wide accessible AFC flap gates, tactile flooring guide tracks for visually impaired travelers, and working elevators from street level directly to platform.',rating:5,amount:30,evidence:'',votes:['user-3','user-6'],status:'community-confirmed',createdAt:Date.now()-172800000}
];

export function CommunityContributions({searchQuery=''}:{searchQuery?:string}){
  const {contributions: liveContributions, user} = usePlatform();
  const a = useAction();
  const [kind, setKind] = useState('review');
  const [place, setPlace] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [amount, setAmount] = useState(0);
  const [evidence, setEvidence] = useState('');
  const [filter, setFilter] = useState('all');

  const sourceContributions = liveContributions.length > 0 ? liveContributions : DEFAULT_COMMUNITY_POSTS;

  const categories = [
    { key: 'all', label: 'All Community Stories' },
    { key: 'review', label: 'Monuments & Sights' },
    { key: 'tip', label: 'Travel Tips & Advice' },
    { key: 'experience', label: 'Cultural Experiences' },
    { key: 'price', label: 'Fair-Price Reports' },
    { key: 'scam', label: 'Scam & Tout Warnings' },
    { key: 'accessibility', label: 'Wheelchair & Accessibility' },
  ];

  const filteredPosts = sourceContributions.filter(c => {
    const matchFilter = filter === 'all' || c.kind.toLowerCase() === filter.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || `${c.place} ${c.text} ${c.author} ${c.kind}`.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });

  return (
    <section className="journey-panel">
      <p className="journey-eyebrow">Useful experiences, shared</p>
      <h2>Traveller stories & contributions</h2>

      <details>
        <summary>Share a review, tip or experience</summary>
        <form onSubmit={e => {
          e.preventDefault();
          a.run(async () => {
            await mutate('/contributions', { kind, place, text, rating, amount, evidence });
            setText('');
            setEvidence('');
          }, 'Published. Other travellers can validate your contribution.');
        }}>
          <div className="journey-grid">
            <label>
              Contribution Type
              <select value={kind} onChange={e => setKind(e.target.value)}>
                <option value="review">Monument / Sight Review</option>
                <option value="tip">Travel Tip & Advice</option>
                <option value="experience">Cultural Experience</option>
                <option value="price">Fair Price Paid</option>
                <option value="scam">Scam / Tout Warning</option>
                <option value="accessibility">Wheelchair / Accessibility</option>
              </select>
            </label>
            <label>
              Place or business
              <input required value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g. Amber Fort, Jaipur" />
            </label>
            <label>
              Rating
              <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </label>
            {kind === 'price' && (
              <label>
                Amount paid (₹)
                <input type="number" min="0" value={amount} onChange={e => setAmount(Number(e.target.value))} />
              </label>
            )}
          </div>
          <label>
            Your experience
            <textarea required minLength={12} maxLength={2000} value={text} onChange={e => setText(e.target.value)} placeholder="Write details about the visit, prices, timing, or helpful guidance for fellow tourists..." />
          </label>
          <label>
            Optional evidence (image under 500 KB)
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 500000) {
                a.run(async () => { throw Error('Choose an image under 500 KB.'); });
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setEvidence(String(reader.result));
              reader.readAsDataURL(file);
            }} />
          </label>
          <button disabled={a.busy} className="journey-primary">Publish contribution</button>
        </form>
      </details>

      {/* Filter Selector Dropdown */}
      <div style={{ margin: '14px 0 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, margin: 0 }}>
          <span>Filter category:</span>
          <select 
            id="community-category-filter-select"
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            style={{ minWidth: 200, padding: '8px 12px', borderRadius: 10, border: '1px solid #cdd6d0', background: '#fff', fontSize: 13, fontWeight: 650, cursor: 'pointer' }}
          >
            {categories.map(cat => {
              const count = cat.key === 'all' 
                ? sourceContributions.length 
                : sourceContributions.filter(c => c.kind.toLowerCase() === cat.key.toLowerCase()).length;
              return (
                <option key={cat.key} value={cat.key}>
                  {cat.label} ({count})
                </option>
              );
            })}
          </select>
        </label>
        {filter !== 'all' && (
          <button 
            type="button" 
            onClick={() => setFilter('all')} 
            className="journey-action"
            style={{ minHeight: 34, padding: '4px 10px', fontSize: 12 }}
          >
            Reset to all
          </button>
        )}
      </div>

      <p role="status">{a.message}</p>

      {filteredPosts.map(c => (
        <article className="journey-card" key={c.id}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <span className="journey-pill" style={{ textTransform: 'capitalize', fontWeight: 700 }}>{c.kind}</span>
            <span className="journey-pill">{c.status}</span>
          </div>
          <h3>{c.place}</h3>
          <p>{c.text}</p>
          <small>{c.author} · {date(c.createdAt)} · {c.rating}/5{c.hasEvidence ? ' · Evidence attached' : ''}{c.kind === 'price' ? ` · ${money(c.amount)}` : ''}</small>
          <div style={{ marginTop: 10 }}>
            <button disabled={a.busy || c.owner === user?.id || (c.votes && c.votes.includes(user?.id))} onClick={() => a.run(() => mutate(`/contributions/${c.id}/vote`, {}), 'Validation saved')}>
              Upvote · Useful ({c.votes?.length || 0})
            </button>
          </div>
        </article>
      ))}

      {filteredPosts.length === 0 && (
        <div className="journey-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 650, color: '#646e68' }}>
            No community posts found for "{categories.find(c => c.key === filter)?.label || filter}".
          </p>
          <button 
            type="button" 
            onClick={() => setFilter('all')}
            className="journey-action" 
            style={{ marginTop: 10 }}
          >
            Show All Contributions ({sourceContributions.length})
          </button>
        </div>
      )}
    </section>
  );
}
export function QRScanner({onCode}:{onCode:(code:string)=>void}){const video=useRef<HTMLVideoElement>(null);const [active,setActive]=useState(false),[error,setError]=useState('');useEffect(()=>{if(!active)return;let alive=true,stream:MediaStream|undefined,timer:any;async function start(){try{const Detector=(window as any).BarcodeDetector;if(!Detector)throw Error('Camera QR recognition is unsupported in this browser. Enter the printed heritage code below.');const supported=await Detector.getSupportedFormats();if(!supported.includes('qr_code'))throw Error('QR recognition unavailable. Enter the printed code.');stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});if(!alive){stream.getTracks().forEach(t=>t.stop());return;}if(video.current){video.current.srcObject=stream;await video.current.play();}const detector=new Detector({formats:['qr_code']});const scan=async()=>{if(!alive)return;try{const codes=await detector.detect(video.current);if(codes[0]?.rawValue){onCode(codes[0].rawValue);setActive(false);return;}}catch{}timer=setTimeout(scan,400);};scan();}catch(e){setError(e.message);setActive(false);}}start();return()=>{alive=false;clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());};},[active]);return <><button type="button" onClick={()=>{setError('');setActive(!active);}}>{active?'Stop camera':'Scan a heritage QR code'}</button>{active&&<video ref={video} muted playsInline/>}{error&&<p role="status">{error}</p>}</>;}
export function TravelPreferences(){const {profile,rewards,quest,contributions,user}=usePlatform();const a=useAction();const [draft,setDraft]=useState(profile);useEffect(()=>setDraft(profile),[profile]);const [code,setCode]=useState(''),[answer,setAnswer]=useState('');const balance=rewards.reduce((s,r)=>s+r.points,0);const t=copy[profile.language||'en'];return <section className="journey-panel"><h2>{t.preferences}</h2><p>{contributions.filter(c=>c.owner===user?.id&&c.status==='community-confirmed').length} community-confirmed contributions · {contributions.filter(c=>c.owner===user?.id&&c.status==='community-confirmed').length>=5?'Established contributor':'Growing contributor'}</p><form onSubmit={e=>{e.preventDefault();a.run(()=>mutate('/profile',draft,'PUT'),'Preferences saved and connected to your trip.');}}><div className="journey-grid"><label>Name<input value={draft.name||''} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Language / भाषा<select value={draft.language||'en'} onChange={e=>setDraft({...draft,language:e.target.value as 'en'|'hi'})}><option value="en">English</option><option value="hi">हिन्दी</option></select></label><label>Budget (₹)<input type="number" min="0" value={draft.budget||0} onChange={e=>setDraft({...draft,budget:Number(e.target.value)})}/></label><label>Interests, separated by commas<input value={draft.interests?.join(', ')||''} onChange={e=>setDraft({...draft,interests:e.target.value.split(',').map(s=>s.trim())})}/></label></div><label className="journey-check"><input type="checkbox" checked={!!draft.wheelchair} onChange={e=>setDraft({...draft,wheelchair:e.target.checked})}/>Prefer wheelchair-accessible places</label><label className="journey-check"><input type="checkbox" checked={!!draft.shareAnalytics} onChange={e=>setDraft({...draft,shareAnalytics:e.target.checked})}/>Contribute anonymous daily place-visit counts after I confirm arrival</label><button disabled={a.busy} className="journey-primary">{t.save}</button></form><p role="status">{a.message}</p><details><summary>Account data</summary><p>Your SUPER card above holds your cultural quests, points and collectibles.</p><button onClick={()=>a.run(async()=>{const data=await api('/export');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='yatra-one-data.json';link.click();URL.revokeObjectURL(url);},'Your export is ready')}>Export my data and saved trips</button><p>Saved itineraries remain available on this device when the app is open and the network drops. Map tiles and new searches need a connection.</p></details></section>;}
export function ConnectedMarketplace(){const {guides,bookings,user}=usePlatform();const a=useAction();const [city,setCity]=useState(''),[language,setLanguage]=useState(''),[max,setMax]=useState(10000),[accessible,setAccessible]=useState(false),[day,setDay]=useState(new Date().toISOString().slice(0,10));const [registration,setRegistration]=useState({name:'',city:'',license:'',languages:'',specialties:'',price:500,wheelchair:false});const [review,setReview]=useState('');return <section className="journey-panel"><h2>Book a reviewed local guide</h2><p>Availability is checked against saved bookings. Provider confirmation is required; no payment is collected here.</p><div className="journey-grid"><label>City<input value={city} onChange={e=>setCity(e.target.value)}/></label><label>Language<input value={language} onChange={e=>setLanguage(e.target.value)}/></label><label>Maximum price (₹)<input type="number" min="0" value={max} onChange={e=>setMax(Number(e.target.value))}/></label><label>Date<input type="date" min={new Date().toISOString().slice(0,10)} value={day} onChange={e=>setDay(e.target.value)}/></label></div><label className="journey-check"><input type="checkbox" checked={accessible} onChange={e=>setAccessible(e.target.checked)}/>Wheelchair assistance offered</label><p role="status">{a.message}</p>{guides.filter(g=>g.status==='approved'&&g.city.toLowerCase().includes(city.toLowerCase())&&g.languages.toLowerCase().includes(language.toLowerCase())&&g.price<=max&&(!accessible||g.wheelchair)).map(g=><article className="journey-card" key={g.id}><h3>{g.name} · {g.city}</h3><p>{g.specialties} · {g.languages}</p><p>{g.reviewCount?`${g.rating.toFixed(1)} ★ · ${g.reviewCount} completed-tour reviews`:"No completed-tour reviews yet"}</p><p>{money(g.price)} · {g.demoVerification?'Reviewed in demo dashboard':'Platform reviewed'}</p><button disabled={a.busy} onClick={()=>a.run(()=>mutate('/bookings',{guideId:g.id,date:day}),'Booking requested')}>Request this guide</button></article>)}{!guides.some(g=>g.status==='approved')&&<p>No approved guide applications yet. Existing sample listings remain available below.</p>}<details><summary>Register as a guide</summary><form onSubmit={e=>{e.preventDefault();a.run(()=>mutate('/guides',registration),'Application submitted for authority review.');}}><div className="journey-grid">{[['name','Name'],['city','City'],['license','Registration reference'],['languages','Languages'],['specialties','Specialties']].map(([key,label])=><label key={key}>{label}<input required value={registration[key]} onChange={e=>setRegistration({...registration,[key]:e.target.value})}/></label>)}<label>Daily price (₹)<input type="number" min="1" value={registration.price} onChange={e=>setRegistration({...registration,price:Number(e.target.value)})}/></label></div><label className="journey-check"><input type="checkbox" checked={registration.wheelchair} onChange={e=>setRegistration({...registration,wheelchair:e.target.checked})}/>Wheelchair assistance offered</label><button disabled={a.busy}>Submit for review</button></form>{guides.filter(g=>g.owner===user?.id).map(g=><p key={g.id}>{g.name}: {g.status} {g.reviewNote}</p>)}</details><details open={bookings.length>0}><summary>My bookings ({bookings.length})</summary><label>Post-tour review<textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="How was your tour?"/></label>{bookings.map(b=><article className="journey-card" key={b.id}><h3>{b.guideName}</h3><p>{b.date} · {money(b.cost)} · {b.status}</p><div className="journey-actions">{b.status==='requested'&&b.owner!==user?.id&&<button onClick={()=>a.run(()=>mutate(`/bookings/${b.id}`,{action:'confirmed'}),'Confirmed')}>Confirm request</button>}{b.status==='confirmed'&&<button onClick={()=>a.run(()=>mutate(`/bookings/${b.id}`,{action:'completed'}),'Tour completed')}>Mark tour completed</button>}{!['completed','cancelled'].includes(b.status)&&<button onClick={()=>a.run(()=>mutate(`/bookings/${b.id}`,{action:'cancelled'}),'Booking cancelled')}>Cancel booking</button>}{b.status==='completed'&&!b.review&&b.owner===user?.id&&[1,2,3,4,5].map(r=><button disabled={review.trim().length<12} key={r} onClick={()=>a.run(()=>mutate(`/bookings/${b.id}`,{action:'review',rating:r,text:review}),'Review saved')}>{r} ★</button>)}</div>{b.review&&<p>{b.review.rating} ★ · {b.review.text}</p>}</article>)}</details></section>;}
export function EcosystemWorkspace({role}:{role:'business'|'authority'}){const {guides,packages,hotels,assistance,analytics,contributions,bookings}=usePlatform();const a=useAction();const [pack,setPack]=useState({title:'',city:'',description:'',price:500,minutes:120,accessible:false});const [hotel,setHotel]=useState({name:'',city:'',photo:'',accessible:false});const [reviewNote,setReviewNote]=useState('');const [evidence,setEvidence]=useState('');return <section className="journey-panel"><p className="journey-eyebrow">Connected community workspace</p><h2>{role==='authority'?'Review & respond':'Your business and visitor feedback'}</h2><p>These records are shared between accounts on this server. Demo approvals do not represent government verification.</p><p role="status">{a.message}</p>{role==='business'?<><details><summary>List a local experience</summary><form onSubmit={e=>{e.preventDefault();a.run(()=>mutate('/packages',pack),'Package submitted for review');}}><div className="journey-grid">{['title','city','description'].map(key=><label key={key}>{key}<input required value={pack[key]} onChange={e=>setPack({...pack,[key]:e.target.value})}/></label>)}<label>Price (₹)<input type="number" min="0" value={pack.price} onChange={e=>setPack({...pack,price:Number(e.target.value)})}/></label><label>Duration in minutes<input type="number" min="30" value={pack.minutes} onChange={e=>setPack({...pack,minutes:Number(e.target.value)})}/></label></div><label className="journey-check"><input type="checkbox" checked={pack.accessible} onChange={e=>setPack({...pack,accessible:e.target.checked})}/>Accessible experience</label><button disabled={a.busy}>Submit package</button></form>{packages.map(p=><p key={p.id}>{p.title} · {p.status}</p>)}</details><details><summary>Update hotel trust information</summary><form onSubmit={e=>{e.preventDefault();a.run(()=>mutate('/hotels',hotel),'Hotel information submitted for review');}}>{['name','city','photo'].map(key=><label key={key}>{key==='photo'?'Current photo URL (HTTPS)':key}<input required={key!=='photo'} value={hotel[key]} onChange={e=>setHotel({...hotel,[key]:e.target.value})}/></label>)}<label className="journey-check"><input type="checkbox" checked={hotel.accessible} onChange={e=>setHotel({...hotel,accessible:e.target.checked})}/>Wheelchair access reported</label><button disabled={a.busy}>Submit hotel update</button></form></details></>:<><label>Review notes<textarea value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="Record what you checked and any remaining concerns."/></label>{[['guide',guides],['package',packages],['hotel',hotels]].map(([kind,rows]:any)=><details open key={kind}><summary>{kind} applications</summary>{rows.filter(r=>r.status==='pending').map(r=><article className="journey-card" key={r.id}><h3>{r.name||r.title} · {r.city}</h3><p>{r.description||r.specialties||'Hotel information update'}</p>{r.license&&<p>Registration reference: {r.license}</p>}{r.photo&&<a href={r.photo} target="_blank" rel="noreferrer">Review submitted photo</a>}<div className="journey-actions">{['approved','rejected'].map(status=><button disabled={a.busy||reviewNote.trim().length<5} key={status} onClick={()=>a.run(()=>mutate(`/review/${kind}/${r.id}`,{status,note:reviewNote}),'Review saved')}>{status==='approved'?'Approve':'Reject'}</button>)}</div></article>)}</details>)}<details open><summary>Assistance requests</summary>{assistance.map(r=><article className="journey-card" key={r.id}><h3>{r.place}</h3><p>{r.type} · {r.notes} · {r.status}</p><div className="journey-actions">{['acknowledged','resolved'].map(status=><button key={status} disabled={a.busy} onClick={()=>a.run(()=>mutate(`/assistance/${r.id}`,{status}),'Request updated')}>{status}</button>)}</div></article>)}</details><ConnectedMarketplace/></>}<h2>Community signals</h2>{evidence&&<div className="journey-card"><img src={evidence} alt="Submitted report evidence"/><button onClick={()=>setEvidence('')}>Close evidence</button></div>}<div className="journey-summary"><span>{analytics.reviews||0} contributions</span><span>{analytics.positive||0} positive ratings</span><span>{analytics.negative||0} ratings needing attention</span></div>{Object.entries(analytics.byPlace||{}).map(([place,count])=><p key={place}>{place}: {String(count)} contributions</p>)}<details><summary>Opt-in confirmed visit counts</summary><p>Counts come only from confirmed arrivals with analytics consent. They are not continuous movement tracking.</p>{Object.entries(analytics.visits||{}).map(([place,count])=><p key={place}>{place}: {String(count)}</p>)}{!Object.keys(analytics.visits||{}).length&&<p>No opt-in visits recorded.</p>}</details><details><summary>Recent visitor feedback</summary>{contributions.slice(-20).reverse().map(c=><p key={c.id}><strong>{c.place}</strong> · {c.text} · {c.status}{role==='authority'&&c.hasEvidence&&<button onClick={()=>a.run(async()=>setEvidence((await api(`/evidence/${c.id}`)).evidence),'Evidence opened')}>Review evidence</button>}</p>)}</details></section>;}
export function HotelDirectory(){const {hotels,contributions}=usePlatform();return hotels.length?<section className="journey-panel"><h2>Community hotel trust</h2>{hotels.filter(h=>h.status==='approved').map(h=><article key={h.id} className="journey-card"><h3>{h.name} · {h.city}</h3>{h.photo&&<img src={h.photo} alt={`Submitted photo of ${h.name}`} loading="lazy"/>}<p>Updated {date(h.updatedAt)} · {h.demoVerification?'Demo-reviewed':'Platform-reviewed'} · {h.accessible?'Wheelchair access reported':'Accessibility not confirmed'}</p><p>{contributions.filter(c=>c.place.toLowerCase()===h.name.toLowerCase()&&['scam','accessibility'].includes(c.kind)).length} community issues reported</p></article>)}</section>:null;}
