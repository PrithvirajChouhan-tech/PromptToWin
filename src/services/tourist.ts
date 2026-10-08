import type { Trip, DayPlan } from '../types/travel';
export type Prerequisite = { id: string; title: string; detail: string; kind: 'Prepare' | 'Verify' | 'Recommended'; url?: string };
export function inferDestinations(trip: Trip): string[] {
  if (trip.destinationCountries?.length) return trip.destinationCountries;
  // Only recognise known locations; an unknown destination needs traveller confirmation.
  const patterns: [RegExp,string][] = [[/\b(india|delhi|agra|jaipur|mumbai|kerala|kochi|munnar|alleppey|alappuzha|indore|mandu|ujjain|sarnath|goa|varanasi|rishikesh|ladakh|leh|sikkim|chennai|bengaluru|kolkata|udaipur)\b/i,'India'],[/\b(japan|tokyo|kyoto|osaka)\b/i,'Japan'],[/\b(france|paris|lyon)\b/i,'France'],[/\b(thailand|bangkok|phuket)\b/i,'Thailand'],[/\b(singapore)\b/i,'Singapore'],[/\b(uae|dubai|abu dhabi|united arab emirates)\b/i,'United Arab Emirates'],[/\b(nepal|kathmandu|pokhara)\b/i,'Nepal'],[/\b(united kingdom|london|edinburgh)\b/i,'United Kingdom']];
  const locations = trip.days.map(d=>d.city);
  const countries = locations.flatMap(city=>patterns.filter(([pattern])=>pattern.test(city)).map(([,country])=>country));
  if (locations.some(city=>!patterns.some(([pattern])=>pattern.test(city)))) return [];
  return [...new Set(countries)];
}
const normalize = (s:string) => ({indian:'india',usa:'united states',us:'united states',uk:'united kingdom',uae:'united arab emirates'}[s.trim().toLowerCase()] || s.trim().toLowerCase());
export function prerequisites(trip:Trip, day:DayPlan, passport:string, countries:string[]):Prerequisite[] {
 const result:Prerequisite[]=[];
 const foreign = countries.some(c=>normalize(c)!==normalize(passport));
 if (!passport.trim() || !countries.length) result.push({id:'identity',title:'Confirm your travel details',detail:'Add your passport country and every destination country, including transit stops, to tailor entry checks.',kind:'Verify'});
 else if (foreign) {
  result.push({id:'passport',title:'Passport & travel documents',detail:`For ${countries.join(', ')}, check passport validity, blank pages and onward travel documents for your passport country (${passport}).`,kind:'Verify',url:'https://www.iata.org/en/travel-centre/'});
  result.push({id:'visa',title:'Visa, entry authorisation & transit rules',detail:'Check each destination and transit country against your nationality, dates and purpose of travel. Apply where required; visa-free eligibility is not assumed.',kind:'Verify',url:countries.some(c=>normalize(c)==='india')?'https://indianvisaonline.gov.in/evisa/':'https://www.iata.org/en/travel-centre/'});
  result.push({id:'sim',title:'SIM / eSIM or roaming',detail:`Arrange connectivity for ${countries.join(', ')}. Check device compatibility and activation documents; this is a travel convenience, not an entry requirement.`,kind:'Recommended'});
  result.push({id:'insurance',title:'Insurance, payments & arrival plan',detail:'Check destination insurance requirements, arrange a working payment method and save your first stay and airport transfer offline.',kind:'Verify'});
 } else result.push({id:'domestic-id',title:'ID for transport & accommodation',detail:'Carry identification accepted by your booked carriers and accommodation. No international border crossing is listed in these destinations.',kind:'Prepare'});
 const tickets=day.items.filter(i=>i.category==='cultural_sight'&&i.cost>0);
 if(tickets.length)result.push({id:'tickets',title:'Entry tickets & opening hours',detail:`Check advance booking, entry slots and closure days for ${tickets.map(i=>i.title).join('; ')}.`,kind:'Verify',url:countries.length===1&&normalize(countries[0])==='india'?'https://asi.paygov.org.in/':undefined});
 const transit=day.items.filter(i=>i.category==='transit'&&['train','flight','boat'].includes(i.transitDetails?.mode||''));
 if(transit.length)result.push({id:'reservations',title:'Confirm transport reservations',detail:transit.map(i=>`${i.title}${i.transitDetails?.bookingTip?': '+i.transitDetails.bookingTip:''}`).join('; '),kind:'Prepare'});
 const text=[trip.region,day.city,...day.items.map(i=>i.title+' '+i.description)].join(' ');
 if(/permit|protected|restricted|ladakh|\bleh\b|sikkim|arunachal|bhutan|trek|safari|national park/i.test(text))result.push({id:'permits',title:'Route / park / restricted-area permits',detail:`Your ${day.city} route may involve controlled access. Confirm exact stops, traveller eligibility and permits with the local tourism or park authority before booking.`,kind:'Verify'});
 if(/temple|mosque|jama masjid|gurudwara|monastery|shrine/i.test(text))result.push({id:'etiquette',title:'Religious-site dress & entry etiquette',detail:'Pack clothing that covers shoulders and knees and easy-to-remove footwear. Check site-specific photography and entry rules.',kind:'Prepare'});
 result.push({id:'offline',title:'Save your day offline',detail:`Save the ${day.city} route, booking confirmations and accommodation contact; carry water and charge your phone.`,kind:'Recommended'});
 return result;
}
export function contributorRanking(contributions:any[]) {
 const people=new Map<string,{id:string;name:string;upvotes:number;posts:number}>();
 for(const c of contributions){if(!c.owner)continue;const row=people.get(c.owner)||{id:c.owner,name:c.author||'Traveller',upvotes:0,posts:0};row.posts++;row.upvotes+=new Set((Array.isArray(c.votes)?c.votes:[]).filter(id=>id!==c.owner)).size;people.set(c.owner,row);}
 return [...people.values()].sort((a,b)=>b.upvotes-a.upvotes||b.posts-a.posts||a.id.localeCompare(b.id));
}
