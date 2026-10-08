import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inferDestinations,prerequisites,contributorRanking} from './tourist';
import {INDIA_TRIPS} from '../data/indiaTrips';
import {CULTURAL_REWARDS,culturalRewardFile} from '../data/superCard';
const trip=INDIA_TRIPS[0];
test('domestic prerequisites follow the selected day without imposing international visas',()=>{
 const items=prerequisites(trip,trip.days[0],'India',inferDestinations(trip));
 assert.ok(items.some(i=>i.id==='domestic-id'));assert.ok(!items.some(i=>i.id==='visa'||i.id==='sim'));
 assert.ok(items.some(i=>i.id==='etiquette'));assert.ok(items.find(i=>i.id==='tickets')?.detail.includes('Jama Masjid'));
 assert.ok(prerequisites(trip,trip.days[1],'India',['India']).find(i=>i.id==='tickets')?.detail.includes('Taj Mahal'));
 for(const preset of INDIA_TRIPS)assert.deepEqual(inferDestinations(preset),['India']);
});
test('international and unknown routes require appropriate entry verification',()=>{
 const international=prerequisites(trip,trip.days[0],'France',['India','Singapore']);
 assert.ok(international.some(i=>i.id==='visa'&&i.kind==='Verify'));assert.ok(international.some(i=>i.id==='sim'&&i.kind==='Recommended'));
 assert.ok(prerequisites(trip,trip.days[0],'',[]).some(i=>i.id==='identity'));
 assert.deepEqual(inferDestinations({...trip,destinationCountries:undefined,days:[{...trip.days[0],city:'Unknown location'}]}),[]);
 const remote={...trip.days[0],city:'Leh',items:[]};assert.ok(prerequisites(trip,remote,'India',['India']).some(i=>i.id==='permits'));
});
test('community ranking totals distinct non-self votes per post and groups by account id',()=>{
 const rows=contributorRanking([{owner:'a',author:'Same name',votes:['a','b','b','c']},{owner:'a',author:'Same name',votes:['b']},{owner:'b',author:'Same name',votes:['a']},{owner:'c',author:'New traveller',votes:[]}]);
 assert.equal(rows.length,3);assert.equal(rows[0].id,'a');assert.equal(rows[0].upvotes,3);assert.equal(rows[0].posts,2);assert.equal(rows[1].upvotes,1);
});
test('every cultural redemption includes a downloadable collectible',()=>{for(const reward of CULTURAL_REWARDS){const file=culturalRewardFile(reward.id);assert.ok(file.content.length>300);assert.ok(file.type==='text/markdown'||file.content.startsWith('<svg'));}});

test('SUPER demo ticket quotes validate quantities and apply a separate cash discount',async()=>{
 const {demoTicketQuote,visitCheckError,SUPER_QUESTS}=await import('../data/superCard');
 assert.equal(demoTicketQuote('taj','foreign',2)?.total,180000);
 assert.equal(demoTicketQuote('taj','domestic',1)?.total,18000);
 assert.equal(demoTicketQuote('taj','foreign',1.5),null);
 assert.equal(demoTicketQuote('missing','foreign',1),null);
 const site=SUPER_QUESTS[0],now=Date.now();
 assert.equal(visitCheckError(site,{lat:site.lat,lng:site.lng,accuracy:20,timestamp:now},now),null);
 assert.ok(visitCheckError(site,{lat:0,lng:0,accuracy:20,timestamp:now},now));
 assert.ok(visitCheckError(site,{lat:site.lat,lng:site.lng,accuracy:20,timestamp:now+100000},now));
});
