import { installSuperCard } from './superCardPlatform';
import { CULTURAL_REWARDS } from './src/data/superCard';
import type { Express, Request, Response, NextFunction } from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

type Role = 'tourist' | 'business' | 'authority';
type User = {id:string; name:string; email:string; role:Role; avatar:string; demo?:boolean};
const id = () => randomBytes(16).toString('hex');
const clean = (v:unknown, max=2000) => typeof v === 'string' ? v.trim().slice(0,max) : '';
export function installPlatform(app:Express) {
 const dir=resolve(process.env.YATRA_DATA_DIR || '.yatra-data'); mkdirSync(dir,{recursive:true,mode:0o700});
 const db=new DatabaseSync(resolve(dir,'platform.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE,password TEXT,data TEXT); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,userId TEXT,expires INTEGER); CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,kind TEXT,owner TEXT,data TEXT);`);
 const records=(kind:string):any[] => (db.prepare('SELECT data FROM records WHERE kind=?').all(kind) as any[]).map(r=>JSON.parse(r.data));
 const put=(kind:string,r:any) => {db.prepare('INSERT OR REPLACE INTO records VALUES(?,?,?,?)').run(r.id,kind,r.owner||'',JSON.stringify(r));return r;};
 if(records('contribution').length === 0){
  const seedContributions=[
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
  for(const c of seedContributions){put('contribution',c);}
 }
 if(process.env.YATRA_AUTHORITY_EMAIL && process.env.YATRA_AUTHORITY_PASSWORD && process.env.YATRA_AUTHORITY_PASSWORD.length>=12){const email=process.env.YATRA_AUTHORITY_EMAIL.toLowerCase();if(!db.prepare('SELECT id FROM users WHERE email=?').get(email)){const salt=id();const u:User={id:id(),name:'Platform reviewer',email,role:'authority',avatar:''};db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(u.id,email,`${salt}:${scryptSync(process.env.YATRA_AUTHORITY_PASSWORD,salt,64).toString('hex')}`,JSON.stringify(u));}}
 const publicUser=(r:any):User => JSON.parse(r.data);
 const getUser=(req:Request):User|undefined => {const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('yatra_session='))?.slice(14); if(!token)return; const r=db.prepare('SELECT users.data FROM users JOIN sessions ON users.id=sessions.userId WHERE token=? AND expires>?').get(createHash('sha256').update(token).digest('hex'),Date.now());return r?publicUser(r):undefined;};
 const session=(res:Response,u:User) => {const token=id()+id();db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),u.id,Date.now()+604800000);res.setHeader('Set-Cookie',`yatra_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV==='production'?'; Secure':''}`);};
 const auth=(req:Request,res:Response,next:NextFunction)=>{const u=getUser(req);if(!u){res.status(401).json({error:'Please sign in to continue.'});return;}res.locals.user=u;next();};
 const fail=(res:Response,message:string,status=400)=>res.status(status).json({error:message});
 const note=(owner:string,title:string,body:string,key?:string)=>{if(key&&records('notification').some(n=>n.owner===owner&&n.key===key))return;put('notification',{id:id(),owner,title,body,key,createdAt:Date.now(),read:false});};
 const reward=(owner:string,points:number,reason:string,key:string)=>{if(records('reward').some(r=>r.owner===owner&&r.key===key))return;put('reward',{id:id(),owner,points,reason,key,createdAt:Date.now()});note(owner,'Contribution rewarded',`${points} cultural tokens · ${reason}`,key);};
 app.use('/api/platform',(req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method)&&req.headers.origin){
   try {
     const originHost = new URL(req.headers.origin).host;
     const expectedHost = (req.headers['x-forwarded-host'] as string) || req.headers.host;
     const expectedProto = (req.headers['x-forwarded-proto'] as string) || req.protocol;
     const isHostMatch = originHost === expectedHost || originHost === req.headers.host;
     const isOriginMatch = req.headers.origin === `${expectedProto}://${expectedHost}`;
     if (!isHostMatch && !isOriginMatch) {
       fail(res,'Request origin not allowed.',403);
       return;
     }
   } catch {
     fail(res,'Request origin not allowed.',403);
     return;
   }
  }
  next();
 });
 const attempts=new Map<string,{count:number;until:number}>();
 app.post('/api/platform/auth',(req,res)=>{
  if(req.body.signup && req.body.role==='authority')return fail(res,'Authority accounts must be provisioned by an administrator. For this local prototype, use Open Authority Demo.',403);
  const ip=req.ip||'local';let attempt=attempts.get(ip);if(!attempt||attempt.until<Date.now()){attempt={count:0,until:Date.now()+600000};attempts.set(ip,attempt);}if(++attempt.count>30){fail(res,'Too many attempts. Try again in ten minutes.',429);return;}
  const email=clean(req.body.email,150).toLowerCase(),password=clean(req.body.password,200);
  if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8){fail(res,'Use a valid email and a password of at least 8 characters.');return;}
  const row=db.prepare('SELECT * FROM users WHERE email=?').get(email) as any;
  if(req.body.signup){if(row){fail(res,'An account already exists. Please sign in.');return;} const role:Role=req.body.role==='business'?'business':'tourist'; const salt=id();const u:User={id:id(),email,name:clean(req.body.name,100)||'Traveller',role,avatar:''};db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(u.id,email,`${salt}:${scryptSync(password,salt,64).toString('hex')}`,JSON.stringify(u));session(res,u);res.json(u);return;}
  if(!row?.password){fail(res,'Email or password is incorrect.',401);return;} const [salt,hash]=row.password.split(':');if(!timingSafeEqual(Buffer.from(hash,'hex'),scryptSync(password,salt,64))){fail(res,'Email or password is incorrect.',401);return;} const u=publicUser(row);if(req.body.role && req.body.role!==u.role)return fail(res,`This account belongs to the ${u.role} dashboard. Select that role or sign in with an authority account.`,403);session(res,u);res.json(u);
 });
 app.post('/api/platform/google',(req,res)=>{
  const email=clean(req.body.email,150).toLowerCase();
  const name=clean(req.body.name,100)||'Google Traveler';
  const avatar=clean(req.body.avatar,2000)||'';
  const role:Role=['tourist','business','authority'].includes(req.body.role)?req.body.role:'tourist';
  if(!email||!/^\S+@\S+\.\S+$/.test(email)){fail(res,'Valid Google email address required.');return;}
  let row=db.prepare('SELECT * FROM users WHERE email=?').get(email) as any;
  let u:User;
  if(row){
   u=publicUser(row);
   let updated = false;
   if(avatar && u.avatar !== avatar){
     u.avatar = avatar;
     updated = true;
   }
   if(name && name !== 'Google Traveler' && u.name !== name){
     u.name = name;
     updated = true;
   }
   if(updated){
     db.prepare('UPDATE users SET data=? WHERE id=?').run(JSON.stringify(u), u.id);
   }
  }else{
   u={id:id(),email,name,role,avatar};
   db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(u.id,email,'',JSON.stringify(u));
  }
  session(res,u);
  res.json(u);
 });
 // Demo roles are explicit and available only on a local development server.
 app.post('/api/platform/demo',(req,res)=>{
  if(process.env.DISABLE_DEMO_ACCOUNTS==='true'){
   fail(res,'Demo accounts are disabled.',403);
   return;
  }
  const role:Role=['tourist','business','authority'].includes(req.body.role)?req.body.role:'tourist';
  const u:User={id:`demo-${role}`,name:`Demo ${role}`,email:`${role}@demo.local`,role,avatar:'',demo:true};
  db.prepare('INSERT OR IGNORE INTO users VALUES(?,?,?,?)').run(u.id,u.email,'',JSON.stringify(u));
  const saved=publicUser(db.prepare('SELECT data FROM users WHERE id=?').get(u.id));
  session(res,saved);
  res.json(saved);
 });
 app.get('/api/platform/me',(req,res)=>res.json(getUser(req)||null));
 app.post('/api/platform/logout',(req,res)=>{const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('yatra_session='))?.slice(14);if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(createHash('sha256').update(token).digest('hex'));res.setHeader('Set-Cookie','yatra_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');res.json({ok:true});});
 app.use('/api/platform',auth);
 app.put('/api/platform/account',(req,res)=>{
  const u:User=res.locals.user;
  if(u.role!=='business')return fail(res,'Business access required.',403);
  const p=req.body;
  const name=clean(p.name,100),businessName=clean(p.businessName,150),email=clean(p.email,150).toLowerCase();
  if(!name||!businessName||!clean(p.businessLocation)||!clean(p.gstOrLicense)||!/^\S+@\S+\.\S+$/.test(email))return fail(res,'Complete your business name, owner, location, registration and valid email.');
  if(!['Hotel','Restaurant','Handicraft','Tour Agency','Transport'].includes(p.businessCategory))return fail(res,'Choose a valid business category.');
  const existing=db.prepare('SELECT id FROM users WHERE email=?').get(email) as {id:string}|undefined;
  if(existing&&existing.id!==u.id)return fail(res,'This email is already used by another account.',409);
  // Only editable business fields are accepted; identity and authority privileges stay server-owned.
  const updated={...u,name,email,businessName,businessLocation:clean(p.businessLocation,200),gstOrLicense:clean(p.gstOrLicense,150),businessCategory:p.businessCategory,phone:clean(p.phone,40),notificationPreferences:{grievance:!!p.notificationPreferences?.grievance,dailyReport:!!p.notificationPreferences?.dailyReport,authorityAlerts:!!p.notificationPreferences?.authorityAlerts}};
  db.prepare('UPDATE users SET email=?,data=? WHERE id=?').run(email,JSON.stringify(updated),u.id);
  res.json(updated);
 });
 app.get('/api/platform/state',(req,res)=>{const u:User=res.locals.user;const owned=(k:string)=>records(k).filter(r=>r.owner===u.id);const contributions=records('contribution').map(({evidence,...r})=>({...r,hasEvidence:!!evidence}));res.json({user:u,profile:owned('profile')[0]||{},contributions,guides:records('guide').filter(g=>g.status==='approved'||g.owner===u.id||u.role==='authority').map(({license,...g})=>{const reviews=records('booking').filter(b=>b.guideId===g.id&&b.review).map(b=>b.review);return {...g,reviewCount:reviews.length,rating:reviews.length?reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length:0,license:u.role==='authority'?license:undefined};}),bookings:records('booking').filter(b=>u.role==='authority'||b.owner===u.id||records('guide').some(g=>g.id===b.guideId&&g.owner===u.id)),packages:records('package').filter(p=>p.status==='approved'||u.role==='authority'||p.owner===u.id),notifications:owned('notification').slice(-50).reverse(),rewards:owned('reward'),assistance:u.role==='authority'?records('assistance'):owned('assistance'),hotels:records('hotel').filter(h=>h.status==='approved'||u.role==='authority'||h.owner===u.id),mapReports:records('map-report'),sos:u.role==='authority'?records('sos'):owned('sos'),quest:owned('quest'),superWallet:owned('super-wallet').map(({fingerprint,...entry})=>entry),trips:owned('trip'),analytics:{reviews:contributions.length,positive:contributions.filter(c=>c.rating>=4).length,negative:contributions.filter(c=>c.rating&&c.rating<=2).length,byPlace:contributions.reduce((a,c)=>({...a,[c.place]:(a[c.place]||0)+1}),{}),visits:records('visit').reduce((a,c)=>({...a,[c.place]:(a[c.place]||0)+1}),{})}});});
 app.put('/api/platform/profile',(req,res)=>{const u:User=res.locals.user;const p=req.body;res.json(put('profile',{id:`profile-${u.id}`,owner:u.id,name:clean(p.name,100)||u.name,language:['en','hi'].includes(p.language)?p.language:'en',interests:Array.isArray(p.interests)?p.interests.filter(x=>typeof x==='string').slice(0,10):[],budget:Math.max(0,Math.min(1e7,Number(p.budget)||0)),wheelchair:!!p.wheelchair,shareAnalytics:!!p.shareAnalytics}));});
 app.put('/api/platform/trips',(req,res)=>{const u:User=res.locals.user;const trips=req.body.trips;if(!Array.isArray(trips)||trips.length>30||JSON.stringify(trips).length>400000)return fail(res,'Trip data is too large.');for(const trip of trips){if(!trip.id||!Array.isArray(trip.days)||!trip.days.length)return fail(res,'Invalid trip.');}put('trip',{id:`trips-${u.id}`,owner:u.id,trips});res.json({ok:true});});
 app.post('/api/platform/contributions',(req,res)=>{const u:User=res.locals.user;const {kind,place,text,rating,evidence}=req.body;if(!['review','tip','experience','price','scam','accessibility'].includes(kind)||clean(place).length<2||clean(text).length<12)return fail(res,'Choose a place and write at least 12 characters.');if(evidence&&!/^data:image\/(png|jpeg|webp);base64,/.test(evidence))return fail(res,'Evidence must be a PNG, JPEG or WebP image.');if(evidence?.length>750000)return fail(res,'Evidence is too large.');const r={id:id(),owner:u.id,author:u.name,kind,place:clean(place,150),text:clean(text),rating:Math.max(1,Math.min(5,Number(rating)||5)),amount:Math.max(0,Number(req.body.amount)||0),evidence:evidence||'',votes:[],status:'unverified',createdAt:Date.now()};put('contribution',r);res.json(r);});
 app.post('/api/platform/contributions/:id/vote',(req,res)=>{const u:User=res.locals.user;const r=records('contribution').find(r=>r.id===req.params.id);if(!r)return fail(res,'Report not found.',404);if(r.owner===u.id)return fail(res,'You cannot validate your own contribution.');if(r.votes.includes(u.id))return fail(res,'You already validated this contribution.');r.votes.push(u.id);if(r.votes.length>=2){r.status='community-confirmed';reward(r.owner,20,'Community-confirmed contribution',`contribution-${r.id}`);}put('contribution',r);res.json(r);});
 app.post('/api/platform/guides',(req,res)=>{const u:User=res.locals.user;const p=req.body;if(!clean(p.name)||!clean(p.city)||!clean(p.license))return fail(res,'Name, city and registration reference are required.');const r={id:id(),owner:u.id,name:clean(p.name,100),city:clean(p.city,100),license:clean(p.license,150),languages:clean(p.languages,150),specialties:clean(p.specialties,200),price:Math.max(1,Number(p.price)||500),wheelchair:!!p.wheelchair,status:'pending',createdAt:Date.now()};put('guide',r);res.json(r);});
 app.post('/api/platform/review/:kind/:id',(req,res)=>{const u:User=res.locals.user;if(u.role!=='authority')return fail(res,'Authority access required.',403);const kind=String(req.params.kind);if(!['guide','package','hotel'].includes(kind))return fail(res,'Unknown review type.');const r=records(kind).find(r=>r.id===req.params.id);if(!r)return fail(res,'Record not found.',404);if(!['approved','rejected'].includes(req.body.status))return fail(res,'Choose approve or reject.');r.status=req.body.status;r.reviewNote=clean(req.body.note);r.reviewedAt=Date.now();r.reviewedBy=u.id;r.demoVerification=!!u.demo;put(kind,r);note(r.owner,`${kind} review updated`,`${r.name||r.title}: ${r.status}. ${r.reviewNote}`);res.json(r);});
 app.post('/api/platform/bookings',(req,res)=>{const u:User=res.locals.user;const g=records('guide').find(g=>g.id===req.body.guideId&&g.status==='approved');if(!g)return fail(res,'Choose an approved guide.');const date=clean(req.body.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<new Date().toISOString().slice(0,10))return fail(res,'Choose today or a future date.');if(records('booking').some(b=>b.guideId===g.id&&b.date===date&&b.status!=='cancelled'))return fail(res,'This guide is already booked that day.',409);const r={id:id(),owner:u.id,guideId:g.id,guideName:g.name,date,cost:g.price,status:'requested',createdAt:Date.now()};put('booking',r);note(u.id,'Guide booking requested',`${g.name} · ${date}. Payment and provider confirmation are not included.`);note(g.owner,'New booking request',`${g.name} · ${date}`);res.json(r);});
 app.post('/api/platform/bookings/:id',(req,res)=>{const u:User=res.locals.user;const r=records('booking').find(r=>r.id===req.params.id);const g=records('guide').find(g=>g.id===r?.guideId);if(!r||!(r.owner===u.id||g?.owner===u.id||u.role==='authority'))return fail(res,'Booking not found.',404);const action=req.body.action;if(action==='review'){if(r.owner!==u.id||r.status!=='completed'||r.review)return fail(res,'Reviews are available once after completing a tour.');if(clean(req.body.text).length<12)return fail(res,'Write at least 12 characters.');r.review={rating:Math.max(1,Math.min(5,Number(req.body.rating)||5)),text:clean(req.body.text)};reward(u.id,10,'Completed tour review',`booking-${r.id}`);}else{if(!['confirmed','completed','cancelled'].includes(action))return fail(res,'Invalid booking action.');if(action==='confirmed'&&g?.owner!==u.id&&u.role!=='authority')return fail(res,'Only the provider can confirm.',403);if(action==='completed'&&(r.status!=='confirmed'||r.date>new Date().toISOString().slice(0,10)))return fail(res,'Only confirmed tours that have taken place can be completed.');if(r.status==='cancelled'||r.status==='completed')return fail(res,'This booking is closed.');r.status=action;}put('booking',r);res.json(r);});
 app.post('/api/platform/packages',(req,res)=>{const u:User=res.locals.user;if(u.role!=='business')return fail(res,'Business access required.',403);const p=req.body;if(!clean(p.title)||!clean(p.city)||!clean(p.description))return fail(res,'Complete all package details.');res.json(put('package',{id:id(),owner:u.id,title:clean(p.title,150),city:clean(p.city,100),description:clean(p.description),price:Math.max(0,Number(p.price)||0),minutes:Math.max(30,Math.min(720,Number(p.minutes)||120)),accessible:!!p.accessible,status:'pending'}));});
 app.post('/api/platform/hotels',(req,res)=>{const u:User=res.locals.user;if(u.role!=='business')return fail(res,'Business access required.',403);if(!clean(req.body.name)||!clean(req.body.city))return fail(res,'Hotel name and city are required.');const photo=clean(req.body.photo,500);if(photo&&!/^https:\/\//.test(photo))return fail(res,'Use an HTTPS photo URL.');res.json(put('hotel',{id:id(),owner:u.id,name:clean(req.body.name,150),city:clean(req.body.city,100),photo,accessible:!!req.body.accessible,updatedAt:Date.now(),status:'pending'}));});
 app.post('/api/platform/assistance',(req,res)=>{const u:User=res.locals.user;if(!clean(req.body.place)||!clean(req.body.type))return fail(res,'Choose a place and assistance type.');const r={id:id(),owner:u.id,place:clean(req.body.place,150),type:clean(req.body.type,100),notes:clean(req.body.notes),status:'demo-pending',createdAt:Date.now()};put('assistance',r);res.json(r);});
 app.post('/api/platform/assistance/:id',(req,res)=>{if(res.locals.user.role!=='authority')return fail(res,'Authority access required.',403);const r=records('assistance').find(r=>r.id===req.params.id);if(!r)return fail(res,'Request not found.',404);r.status=req.body.status==='resolved'?'resolved':'acknowledged';put('assistance',r);note(r.owner,'Assistance request updated',`${r.place}: ${r.status} (demo coordination)`);res.json(r);});
 app.post('/api/platform/notifications',(req,res)=>{const u:User=res.locals.user;const key=clean(req.body.key,150);if(!key)return fail(res,'An event key is required.');note(u.id,clean(req.body.title,150),clean(req.body.body),key);res.json({ok:true});});
 app.post('/api/platform/notifications/read',(req,res)=>{records('notification').filter(r=>r.owner===res.locals.user.id).forEach(r=>put('notification',{...r,read:true}));res.json({ok:true});});
 installSuperCard(app,{records,put,reward,transaction(fn){db.exec('BEGIN IMMEDIATE');try{fn();db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}}});
 app.post('/api/platform/redeem',(req,res)=>{
  const u:User=res.locals.user;
  const item=CULTURAL_REWARDS.find(r=>r.id===(req.body.rewardId||'badge'));
  if(!item)return fail(res,'Choose a cultural reward from the catalogue.');
  if(records('reward').some(r=>r.owner===u.id&&r.key===item.key))return fail(res,'This reward is already in your collection.');
  const balance=records('reward').filter(r=>r.owner===u.id).reduce((s,r)=>s+r.points,0);
  if(balance<item.cost)return fail(res,`You need ${item.cost} points for this reward.`);
  reward(u.id,-item.cost,item.title,item.key);res.json({ok:true,rewardId:item.id});
 });
 app.post('/api/platform/visit',(req,res)=>{const u:User=res.locals.user;const p=records('profile').find(p=>p.owner===u.id);if(!p?.shareAnalytics)return res.json({ok:true});const place=clean(req.body.place,150);if(!place)return fail(res,'Place is required.');const key=createHash('sha256').update(`${u.id}:${place}:${new Date().toISOString().slice(0,10)}`).digest('hex');put('visit',{id:key,place,day:new Date().toISOString().slice(0,10)});res.json({ok:true});});

 app.post('/api/platform/map-reports',(req,res)=>{const u:User=res.locals.user;const p=req.body;const lat=Number(p.coordinates?.lat),lng=Number(p.coordinates?.lng);if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180||clean(p.description).length<12)return fail(res,'A location and description are required.');const r={id:id(),owner:u.id,category:clean(p.category,100),coordinates:{lat:Math.round(lat*100)/100,lng:Math.round(lng*100)/100},description:clean(p.description),timestamp:Date.now(),validations:0,reliability:0.2,demo:!!u.demo,votes:[]};put('map-report',r);res.json(r);});
 app.post('/api/platform/map-reports/:id/vote',(req,res)=>{const u:User=res.locals.user;const r=records('map-report').find(r=>r.id===req.params.id);if(!r)return fail(res,'Only shared reports can receive account validation.',404);if(r.owner===u.id||r.votes.includes(u.id))return fail(res,'Own reports and repeated validations are not permitted.');r.votes.push(u.id);r.validations=r.votes.length;r.reliability=Math.min(0.9,0.2+r.validations*0.1);put('map-report',r);res.json(r);});
 app.post('/api/platform/sos',(req,res)=>{const u:User=res.locals.user;const p=req.body;if(clean(p.location).length<3)return fail(res,'Enter your location.');const c=p.coordinates;const coordinates=c&&Number.isFinite(c.lat)&&Math.abs(c.lat)<=90&&Number.isFinite(c.lng)&&Math.abs(c.lng)<=180?{lat:c.lat,lng:c.lng}:undefined;const r={id:id(),owner:u.id,category:clean(p.category,100),location:clean(p.location,200),description:clean(p.description||p.evidence),coordinates,timestamp:Date.now(),status:'demo-pending'};put('sos',r);res.json(r);});
 app.get('/api/platform/evidence/:id',(req,res)=>{if(res.locals.user.role!=='authority')return fail(res,'Authority access required.',403);const c=records('contribution').find(c=>c.id===req.params.id);if(!c)return fail(res,'Not found.',404);res.json({evidence:c.evidence||null});});
 app.get('/api/platform/export',(req,res)=>{const u:User=res.locals.user;res.json(Object.fromEntries(['profile','contribution','booking','reward','quest','super-wallet','trip'].map(k=>[k,records(k).filter(r=>r.owner===u.id)])));});
 return {getUser};
}
