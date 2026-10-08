import { useSyncExternalStore } from 'react';
export type Preferences={name?:string;language?:'en'|'hi';interests?:string[];budget?:number;wheelchair?:boolean;shareAnalytics?:boolean};
export type PlatformState={user?:any;profile:Preferences;contributions:any[];guides:any[];bookings:any[];packages:any[];notifications:any[];rewards:any[];assistance:any[];hotels:any[];quest:any[];superWallet?:any[];trips:any[];analytics:any};
const empty:PlatformState={profile:{},contributions:[],guides:[],bookings:[],packages:[],notifications:[],rewards:[],assistance:[],hotels:[],quest:[],superWallet:[],trips:[],analytics:{}};
let state=empty;
const listeners=new Set<()=>void>();
export const journeyContext:{current:any}={current:{}};
export async function api(path:string,body?:any,method?:string){const response=await fetch(`/api/platform${path}`,{method:method||(body===undefined?'GET':'POST'),headers:{'Content-Type':'application/json'},credentials:'include',body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw Error(data.error||'Request failed. Please retry.');return data;}
export async function refreshPlatform(){const next=await api('/state');if(JSON.stringify(next.profile)===JSON.stringify(state.profile))next.profile=state.profile;state=next;
 try { localStorage.setItem('yatra-shared-map-reports',JSON.stringify(next.mapReports||[]));localStorage.setItem('yatra-demo-sos',JSON.stringify(next.sos||[]));window.dispatchEvent(new Event('yatra-map-data')); } catch {}
 listeners.forEach(l=>l());return next as PlatformState;}
export function clearPlatform(){state=empty;try{localStorage.removeItem('yatra-shared-map-reports');localStorage.removeItem('yatra-demo-sos');}catch{}listeners.forEach(l=>l());}
export function usePlatform(){return useSyncExternalStore(l=>{listeners.add(l);return()=>{listeners.delete(l);};},()=>state);}
export function notify(key:string,title:string,body:string){return api('/notifications',{key,title,body}).then(refreshPlatform).catch(()=>{});}
export async function mutate(path:string,body:any,method?:string){const result=await api(path,body,method);await refreshPlatform();return result;}
export const navLabels={en:['Home','Explore','My Trip','Community','Profile'],hi:['होम','खोजें','मेरी यात्रा','समुदाय','प्रोफ़ाइल']};
export const copy={en:{today:'Your journey today',next:'Up next',plan:'Plan a trip',weather:'Weather & changes',community:'Traveller stories',save:'Save preferences',preferences:'Travel preferences'},hi:{today:'आज की आपकी यात्रा',next:'अगला पड़ाव',plan:'यात्रा की योजना बनाएं',weather:'मौसम और बदलाव',community:'यात्रियों की कहानियां',save:'पसंद सहेजें',preferences:'यात्रा की पसंद'}};
