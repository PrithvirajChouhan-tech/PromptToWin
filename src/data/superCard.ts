export const SUPER_QUESTS = [
 {code:'VISIT:palace',title:'Visit City Palace',city:'Jaipur',description:'Explore the palace courtyards and check in near the site.',lat:26.9258,lng:75.8237,radius:300,points:10},
 {code:'VISIT:taj',title:'Visit the Taj Mahal',city:'Agra',description:'Visit the monument complex and check in from the gardens.',lat:27.1751,lng:78.0421,radius:300,points:10},
 {code:'VISIT:amer',title:'Explore Amer Fort',city:'Jaipur',description:'Discover the fort and its courtyards, then check in on site.',lat:26.9855,lng:75.8513,radius:300,points:10},
 {code:'VISIT:qutub',title:'Discover Qutub Minar',city:'Delhi',description:'Visit the historic complex and check in near the minaret.',lat:28.5244,lng:77.1855,radius:300,points:10},
];
// Illustrative demo prices only. No operator, official tariff or discount agreement is implied.
export const DEMO_HERITAGE_TICKETS = [
 {id:'taj',name:'Taj Mahal',city:'Agra',foreignPaise:100000,domesticPaise:20000},
 {id:'amer',name:'Amer Fort',city:'Jaipur',foreignPaise:80000,domesticPaise:15000},
 {id:'qutub',name:'Qutub Minar',city:'Delhi',foreignPaise:60000,domesticPaise:10000},
];
export const SUPER_DEMO_DISCOUNT_PERCENT = 10;
export function demoTicketQuote(siteId:string,visitor:string,quantity:number) {
 const site=DEMO_HERITAGE_TICKETS.find(s=>s.id===siteId);
 if(!site||!['foreign','domestic'].includes(visitor)||!Number.isInteger(quantity)||quantity<1||quantity>6)return null;
 const subtotal=(visitor==='foreign'?site.foreignPaise:site.domesticPaise)*quantity;
 const discount=Math.floor(subtotal*SUPER_DEMO_DISCOUNT_PERCENT/100);
 return {site,subtotal,discount,total:subtotal-discount};
}
export function visitCheckError(site:typeof SUPER_QUESTS[number], location:any, now=Date.now()):string|null {
 const {lat,lng,accuracy,timestamp}=location||{};
 if(![lat,lng,accuracy,timestamp].every(v=>typeof v==='number'&&Number.isFinite(v))||Math.abs(lat)>90||Math.abs(lng)>180||accuracy<0)return 'A valid device location is required to check in.';
 if(timestamp>now+5000||now-timestamp>120000)return 'Your location is out of date. Try checking in again.';
 if(accuracy>100)return 'Location accuracy is too low. Move to an open area and try again.';
 const rad=(n:number)=>n*Math.PI/180;
 const a=Math.sin(rad(lat-site.lat)/2)**2+Math.cos(rad(site.lat))*Math.cos(rad(lat))*Math.sin(rad(lng-site.lng)/2)**2;
 const distance=6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));
 if(distance+accuracy>site.radius)return `Check in within ${site.radius} metres of ${site.title.replace(/^(Visit |Explore |Discover )/,'')} to complete this quest.`;
 return null;
}
export const CULTURAL_REWARDS = [
 {id:'postcards',key:'super:postcards',title:'Heritage postcard set',cost:20,description:'A downloadable three-panel postcard sheet inspired by arches, stepwells and latticework.',filename:'yatra-heritage-postcards.svg'},
 {id:'craft-guide',key:'super:craft-guide',title:'Artisan discovery journal',cost:20,description:'A downloadable cultural journal with craft prompts, a maker interview and a souvenir checklist.',filename:'yatra-artisan-journal.md'},
 {id:'badge',key:'badge',title:'Cultural explorer badge',cost:30,description:'A downloadable SUPER member badge celebrating your cultural discoveries.',filename:'yatra-cultural-explorer.svg'},
];
export function culturalRewardFile(id:string):{content:string;type:string} {
 if(id==='craft-guide')return {type:'text/markdown',content:'# Yatra One · Artisan Discovery Journal\n\nA SUPER card cultural collectible\n\n## Meet a maker\nAsk permission before taking photos. Ask how the craft is made, how long one piece takes, and what materials are used. Write the maker’s own words here.\n\n## Look closely\n- Block printing: sketch a repeating pattern.\n- Pottery: describe the shape and glaze.\n- Weaving: compare the texture of two fabrics.\n\n## A thoughtful souvenir\nRecord the maker, place, material and price. Ask for a receipt and care instructions. Verify authenticity claims before purchasing.\n\n## Your story\nPlace:\nMaker:\nWhat I learned:\nA detail I want to remember:\n'};
 const badge=id==='badge';
 return {type:'image/svg+xml',content:`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><rect width="1200" height="600" rx="30" fill="#123c34"/><text x="60" y="75" font-family="Georgia,serif" font-size="36" fill="#f0d596">YATRA ONE · SUPER ${badge?'MEMBER':'CULTURAL COLLECTION'}</text>${badge?'<circle cx="600" cy="280" r="125" fill="none" stroke="#f0d596" stroke-width="6"/><path d="M520 325V260a80 80 0 0 1 160 0v65z" fill="#f0d596"/><text x="600" y="460" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#fff">Cultural Explorer</text>':'<path d="M90 440V280a110 110 0 0 1 220 0v160z" fill="#e6bba2"/><path d="M135 440V295a65 65 0 0 1 130 0v145z" fill="#123c34"/><path d="M420 440h300v-45H465v-45h210v-45H510v-45h120v-45h-75" fill="none" stroke="#f0d596" stroke-width="15"/><path d="M850 200l220 240m-220-180l170 180m-170-120l120 120m-120-60l60 60m160-240L850 440m220-180L905 440m165-120l-110 120" stroke="#df9176" stroke-width="8"/><text x="90" y="500" fill="#fff" font-size="23">ARCHES</text><text x="460" y="500" fill="#fff" font-size="23">STEPWELLS</text><text x="850" y="500" fill="#fff" font-size="23">LATTICEWORK</text>'}<text x="60" y="565" fill="#d8e6dc" font-family="sans-serif" font-size="18">Explore thoughtfully. Celebrate local culture.</text></svg>`};
}
