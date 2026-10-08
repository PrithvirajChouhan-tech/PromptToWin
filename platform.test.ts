import {SUPER_QUESTS} from './src/data/superCard';
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {installPlatform} from './platform';
const dir=mkdtempSync(join(tmpdir(),'yatra-test-'));process.env.YATRA_DATA_DIR=dir;
const app=express();app.use(express.json({limit:'1mb'}));installPlatform(app);
const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const base=`http://127.0.0.1:${(server.address() as any).port}/api/platform`;
async function call(path:string,body?:any,cookie='',method?:string){const res=await fetch(base+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]||''};}
function visitPayload(code:string){const site=SUPER_QUESTS.find(q=>q.code===code)!;return {code,location:{lat:site.lat,lng:site.lng,accuracy:15,timestamp:Date.now()}};}
async function signup(email:string,role='tourist'){return call('/auth',{signup:true,email,password:'testing-password-392',name:email.split('@')[0],role});}
after(async()=>{await new Promise<void>(r=>server.close(()=>r()));try{rmSync(dir,{recursive:true,force:true});}catch{}});
test('accounts, authority boundaries, shared reviews and once-only rewards',async()=>{
 assert.equal((await call('/state')).status,401);
 const a=await signup('alice@example.test'), b=await signup('bob@example.test'), c=await signup('carol@example.test');assert.equal(a.status,200);
 assert.equal((await call('/auth',{email:'alice@example.test',password:'wrong-pass'})).status,401);
 const escalation=await signup('intruder@example.test','authority');assert.equal(escalation.status,403);assert.equal(escalation.cookie,'');
 const mismatch=await call('/auth',{email:'alice@example.test',password:'testing-password-392',role:'authority'});assert.equal(mismatch.status,403);assert.equal(mismatch.cookie,'');
 const matching=await call('/auth',{email:'alice@example.test',password:'testing-password-392',role:'tourist'});assert.equal(matching.data.role,'tourist');
 const authorityDemo=await call('/demo',{role:'authority'});assert.equal(authorityDemo.data.role,'authority');assert.equal((await call('/me',undefined,authorityDemo.cookie)).data.role,'authority');
 const report=await call('/contributions',{kind:'review',place:'City Palace',text:'Helpful staff and a clearly marked entrance.',rating:5},a.cookie);assert.equal(report.status,200);
 assert.equal((await call(`/contributions/${report.data.id}/vote`,{},a.cookie)).status,400);
 assert.equal((await call(`/contributions/${report.data.id}/vote`,{},b.cookie)).status,200);
 assert.equal((await call(`/contributions/${report.data.id}/vote`,{},b.cookie)).status,400);
 assert.equal((await call(`/contributions/${report.data.id}/vote`,{},c.cookie)).status,200);
 const state=await call('/state',undefined,a.cookie);assert.equal(state.data.rewards.reduce((s,r)=>s+r.points,0),20);assert.equal(state.data.contributions[0].status,'community-confirmed');
 assert.equal((await call('/review/guide/missing',{status:'approved'},a.cookie)).status,403);
 await call('/profile',{name:'Alice',interests:['Heritage'],language:'hi',wheelchair:true,budget:5000},a.cookie,'PUT');assert.equal((await call('/state',undefined,a.cookie)).data.profile.language,'hi');assert.deepEqual((await call('/state',undefined,b.cookie)).data.profile,{});
 await call('/logout',{},a.cookie);assert.equal((await call('/state',undefined,a.cookie)).status,401);
});
test('guide approval, availability, provider confirmation and reviews',async()=>{
 const owner=await signup('guide@example.test','business'),traveller=await signup('traveller@example.test'),authority=await call('/demo',{role:'authority'});
 const g=await call('/guides',{name:'Test Guide',city:'Jaipur',license:'SAMPLE-01',languages:'Hindi, English',specialties:'Heritage',price:900},owner.cookie);assert.equal(g.data.status,'pending');
 const day=new Date().toISOString().slice(0,10);
 assert.equal((await call('/bookings',{guideId:g.data.id,date:day},traveller.cookie)).status,400);
 assert.equal((await call(`/review/guide/${g.data.id}`,{status:'approved',note:'Sample reviewed'},authority.cookie)).status,200);
 const booking=await call('/bookings',{guideId:g.data.id,date:day},traveller.cookie);assert.equal(booking.status,200);
 assert.equal((await call('/bookings',{guideId:g.data.id,date:day},traveller.cookie)).status,409);
 assert.equal((await call(`/bookings/${booking.data.id}`,{action:'confirmed'},traveller.cookie)).status,403);
 assert.equal((await call('/state',undefined,owner.cookie)).data.bookings.length,1);
 assert.equal((await call(`/bookings/${booking.data.id}`,{action:'confirmed'},owner.cookie)).status,200);
 assert.equal((await call(`/bookings/${booking.data.id}`,{action:'completed'},traveller.cookie)).status,200);
 assert.equal((await call(`/bookings/${booking.data.id}`,{action:'review',rating:4,text:'The tour was informative and easy to follow.'},traveller.cookie)).status,200);
 assert.equal((await call(`/bookings/${booking.data.id}`,{action:'review',rating:5,text:'Another review should not be accepted.'},traveller.cookie)).status,400);
});
test('map reports, private SOS, consent and trip isolation',async()=>{
 const a=await signup('map-user@example.test'),b=await signup('other-user@example.test');
 const r=await call('/map-reports',{category:'Overcharging',coordinates:{lat:26.925812,lng:75.823712},description:'An extra fare was requested after the ride.'},a.cookie);assert.equal(r.status,200);assert.equal(r.data.coordinates.lat,26.93);
 assert.equal((await call('/state',undefined,b.cookie)).data.mapReports.length,1);
 assert.equal((await call(`/map-reports/${r.data.id}/vote`,{},a.cookie)).status,400);
 assert.equal((await call(`/map-reports/${r.data.id}/vote`,{},b.cookie)).status,200);
 await call('/sos',{category:'other',location:'Sample station',coordinates:{lat:26.925812,lng:75.823712}},a.cookie);
 assert.equal((await call('/state',undefined,b.cookie)).data.sos.length,0);
 await call('/visit',{place:'Sample palace'},a.cookie);assert.deepEqual((await call('/state',undefined,a.cookie)).data.analytics.visits,{});
 await call('/profile',{shareAnalytics:true},a.cookie,'PUT');await call('/visit',{place:'Sample palace'},a.cookie);await call('/visit',{place:'Sample palace'},a.cookie);assert.equal((await call('/state',undefined,a.cookie)).data.analytics.visits['Sample palace'],1);
 await call('/trips',{trips:[{id:'trip-1',days:[{items:[]}]}]},a.cookie,'PUT');assert.equal((await call('/state',undefined,a.cookie)).data.trips.length,1);assert.equal((await call('/state',undefined,b.cookie)).data.trips.length,0);
});
test('visit quest rewards and redemption cannot be repeated',async()=>{const a=await signup('quest@example.test');for(const code of ['VISIT:palace','VISIT:taj','VISIT:amer'])assert.equal((await call('/quest',visitPayload(code),a.cookie)).status,200);assert.equal((await call('/quest',visitPayload('VISIT:palace'),a.cookie)).status,400);assert.equal((await call('/redeem',{},a.cookie)).status,200);assert.equal((await call('/redeem',{},a.cookie)).status,400);assert.equal((await call('/state',undefined,a.cookie)).data.rewards.reduce((s,r)=>s+r.points,0),0);});

test('business dashboard account edits persist without changing identity or privileges',async()=>{
 const merchant=await signup('dashboard-merchant@example.test','business');
 const traveller=await signup('dashboard-traveller@example.test');
 const payload={name:'Merchant Owner',businessName:'Test Heritage Tours',businessCategory:'Tour Agency',businessLocation:'Jaipur',gstOrLicense:'TEST-REG-123',phone:'+91 00000 00000',email:'updated-merchant@example.test',notificationPreferences:{grievance:false,dailyReport:true,authorityAlerts:true},role:'authority',id:traveller.data.id};
 assert.equal((await call('/account',payload,'','PUT')).status,401);
 assert.equal((await call('/account',payload,traveller.cookie,'PUT')).status,403);
 const saved=await call('/account',payload,merchant.cookie,'PUT');
 assert.equal(saved.status,200);assert.equal(saved.data.id,merchant.data.id);assert.equal(saved.data.role,'business');
 const reloaded=await call('/me',undefined,merchant.cookie);
 assert.equal(reloaded.data.businessName,payload.businessName);assert.deepEqual(reloaded.data.notificationPreferences,payload.notificationPreferences);
 assert.equal((await call('/account',{...payload,email:'dashboard-traveller@example.test'},merchant.cookie,'PUT')).status,409);
 assert.equal((await call('/account',{...payload,businessCategory:'invalid'},merchant.cookie,'PUT')).status,400);
 assert.equal((await call('/auth',{email:payload.email,password:'testing-password-392',role:'business'})).status,200);
});

test('connected dashboard listings, reviews and assistance remain shared across roles',async()=>{
 const merchant=await signup('dashboard-listings@example.test','business');
 const traveller=await signup('dashboard-visitor@example.test');
 const authority=await call('/demo',{role:'authority'});
 const pack=await call('/packages',{title:'Test heritage walk',city:'Jaipur',description:'Local walking route for integration testing.',price:600,minutes:120},merchant.cookie);
 const hotel=await call('/hotels',{name:'Test heritage stay',city:'Jaipur',accessible:true},merchant.cookie);
 assert.equal(pack.data.status,'pending');assert.equal(hotel.data.status,'pending');
 const pending=await call('/state',undefined,authority.cookie);
 assert.ok(pending.data.packages.some(p=>p.id===pack.data.id));assert.ok(pending.data.hotels.some(h=>h.id===hotel.data.id));
 assert.equal((await call(`/review/package/${pack.data.id}`,{status:'approved',note:'Test application reviewed'},authority.cookie)).status,200);
 assert.equal((await call(`/review/hotel/${hotel.data.id}`,{status:'approved',note:'Test hotel reviewed'},authority.cookie)).status,200);
 const published=await call('/state',undefined,traveller.cookie);
 assert.ok(published.data.packages.some(p=>p.id===pack.data.id&&p.status==='approved'));
 assert.ok(published.data.hotels.some(h=>h.id===hotel.data.id&&h.status==='approved'));
 const request=await call('/assistance',{place:'Test station',type:'accessibility',notes:'Test assistance coordination'},traveller.cookie);
 assert.equal((await call(`/assistance/${request.data.id}`,{status:'resolved'},merchant.cookie)).status,403);
 assert.equal((await call(`/assistance/${request.data.id}`,{status:'acknowledged'},authority.cookie)).status,200);
 assert.equal((await call(`/assistance/${request.data.id}`,{status:'resolved'},authority.cookie)).status,200);
 assert.ok((await call('/state',undefined,traveller.cookie)).data.assistance.some(r=>r.id===request.data.id&&r.status==='resolved'));
});

test('SUPER card quests award once and cultural redemptions cannot overspend or duplicate',async()=>{
 const user=await signup('super-card@example.test');
 assert.equal((await call('/redeem',{rewardId:'postcards'},user.cookie)).status,400);
 assert.equal((await call('/quest',{code:'YATRA:craft',answer:'wrong'},user.cookie)).status,400);
 for(const code of ['VISIT:palace','VISIT:qutub']){
  assert.equal((await call('/quest',visitPayload(code),user.cookie)).status,200);
  assert.equal((await call('/quest',visitPayload(code),user.cookie)).status,400);
 }
 const redemptions=await Promise.all([call('/redeem',{rewardId:'postcards'},user.cookie),call('/redeem',{rewardId:'postcards'},user.cookie)]);
 assert.deepEqual(redemptions.map(r=>r.status).sort(),[200,400]);
 const saved=await call('/state',undefined,user.cookie);assert.equal(saved.data.rewards.reduce((s,r)=>s+r.points,0),0);assert.equal(saved.data.rewards.filter(r=>r.key==='super:postcards').length,1);
 assert.equal((await call('/redeem',{rewardId:'craft-guide'},user.cookie)).status,400);
 assert.equal((await call('/redeem',{rewardId:'unknown'},user.cookie)).status,400);
});

test('visit quests reject quiz answers, distant, stale and inaccurate locations',async()=>{
 const a=await signup('visit-validation@example.test');
 assert.equal((await call('/quest',{code:'YATRA:taj',answer:'agra'},a.cookie)).status,400);
 assert.equal((await call('/quest',{code:'VISIT:taj'},a.cookie)).status,400);
 for(const patch of [{lat:0,lng:0},{accuracy:300},{timestamp:Date.now()-180000},{lat:'27.1751'},{accuracy:-1}]){
  const payload=visitPayload('VISIT:taj');assert.equal((await call('/quest',{...payload,location:{...payload.location,...patch}},a.cookie)).status,400);
 }
 const results=await Promise.all([call('/quest',visitPayload('VISIT:taj'),a.cookie),call('/quest',visitPayload('VISIT:taj'),a.cookie)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
 const state=(await call('/state',undefined,a.cookie)).data;
 assert.equal(state.rewards.reduce((s,r)=>s+r.points,0),10);assert.equal(state.quest[0].method,'device-location');assert.equal(state.quest[0].location,undefined);
});

test('demo wallet recharges, member discounts and bookings are isolated and idempotent',async()=>{
 const a=await signup('wallet-a@example.test'),b=await signup('wallet-b@example.test');
 const authority=await call('/demo',{role:'authority'});
 const recharge={requestId:'recharge-reference-0001',amount:2000,method:'cash-desk'};
 assert.equal((await call('/super-wallet/recharge',recharge)).status,401);
 assert.equal((await call('/super-wallet/recharge',recharge,authority.cookie)).status,403);
 assert.equal((await call('/super-wallet/recharge',{...recharge,amount:-10},a.cookie)).status,400);
 const topups=await Promise.all([call('/super-wallet/recharge',recharge,a.cookie),call('/super-wallet/recharge',recharge,a.cookie)]);
 assert.ok(topups.every(r=>r.status===200));assert.equal(topups[0].data.id,topups[1].data.id);
 assert.equal((await call('/super-wallet/recharge',{...recharge,amount:3000},a.cookie)).status,409);
 const booking={requestId:'booking-reference-0001',siteId:'taj',visitor:'foreign',quantity:2,date:new Date().toISOString().slice(0,10),total:1,discount:100};
 const booked=await call('/super-wallet/book',booking,a.cookie);assert.equal(booked.status,200);assert.equal(booked.data.amountPaise,-180000);assert.equal(booked.data.discountPaise,20000);assert.equal(booked.data.demo,true);
 assert.equal((await call('/super-wallet/book',booking,a.cookie)).data.id,booked.data.id);
 assert.equal((await call('/super-wallet/book',{...booking,requestId:'booking-reference-0002'},a.cookie)).status,400);
 const state=(await call('/state',undefined,a.cookie)).data;assert.equal(state.superWallet.length,2);assert.equal(state.superWallet.reduce((sum,e)=>sum+e.amountPaise,0),20000);assert.equal(state.rewards.length,0);
 assert.equal((await call('/state',undefined,b.cookie)).data.superWallet.length,0);
});
