import React, {useState} from 'react';
import {ClipboardCheck, ChevronDown} from 'lucide-react';
import type {Trip,DayPlan} from '../../types/travel';
import {inferDestinations,prerequisites} from '../../services/tourist';
import './tourist.css';
export const Prerequisites: React.FC<{trip:Trip;day:DayPlan;userId:string;nationality?:string}> = ({trip,day,userId,nationality}) => {
 const storageKey=`yatra-prerequisites:${userId}:${trip.id}`;
 const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'null')||{};}catch{return {};}});
 const [passport,setPassport]=useState<string>(saved.passport||nationality||'');
 const [destinations,setDestinations]=useState<string>(saved.destinations??inferDestinations(trip).join(', '));
 const [message,setMessage]=useState('');
 const countries=destinations.split(',').map(c=>c.trim()).filter(Boolean);
 const items=prerequisites(trip,day,passport,countries);
 const signature=JSON.stringify([passport.toLowerCase(),countries,trip.dateRange,day.date,day.city,day.items.map(i=>i.id)]);
 const checked=saved.checks?.[signature]||{};
 function persist(next:any){setSaved(next);try{localStorage.setItem(storageKey,JSON.stringify(next));setMessage('Saved on this device for this itinerary.');}catch{setMessage('Checklist updated for this visit; device storage is unavailable.');}}
 return <details className="tourist-prerequisites"><summary><ClipboardCheck size={19}/><span>Prerequisites <small>Before you visit {day.city}</small></span><span className="tourist-progress">{items.filter(i=>checked[i.id]).length}/{items.length} ready</span><ChevronDown size={17}/></summary>
  <div className="tourist-prep-body"><p>For {trip.title} · Day {day.dayNumber}. Check travel details below; entry requirements depend on your passport, route and travel dates.</p>
  <div className="tourist-two-col"><label>Passport country<input value={passport} placeholder="e.g. India" onChange={e=>{setPassport(e.target.value);persist({...saved,passport:e.target.value,destinations});}}/></label><label>Destination countries (including transit)<input value={destinations} placeholder="e.g. Japan, Singapore" onChange={e=>{setDestinations(e.target.value);persist({...saved,passport,destinations:e.target.value});}}/></label></div>
  <p className="tourist-muted">Verify these country names against your actual route. “Verify” means the rule must be checked, not that a visa or permit is always mandatory.</p>
  {items.map(item=><article key={item.id} className="tourist-prep-item"><label><input type="checkbox" checked={!!checked[item.id]} onChange={e=>persist({...saved,passport,destinations,checks:{...saved.checks,[signature]:{...checked,[item.id]:e.target.checked}}})}/><span>{item.title}<small>{item.kind}</small></span></label><p>{item.detail}</p>{item.url&&<a href={item.url} target="_blank" rel="noreferrer">Check official guidance ↗</a>}</article>)}<p role="status" className="tourist-muted">{message}</p></div>
 </details>;
}
