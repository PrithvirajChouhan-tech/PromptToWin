import { journeyContext } from "../services/journey";
// Sahayak AI - Encyclopedic Travel & Location Intelligence Engine
// Trained to answer about ANY location's information, ANY thing related to a place, and all App features

export interface ActionChip {
  label: string;
  action: 
    | 'open_map' 
    | 'open_scanner' 
    | 'open_sos' 
    | 'open_trust' 
    | 'open_transit' 
    | 'open_accessibility' 
    | 'open_profile' 
    | 'open_guides'
    | 'open_ai_planner';
}

export interface AssistantResponse {
  text: string;
  actionChips?: ActionChip[];
  isOutOfScope: boolean;
  source?: 'gemini' | 'knowledge_base';
}

// 1. NON-TRAVEL STRICT GUARDRAIL FILTER
export function isQueryInScope(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Explicit forbidden topics unrelated to travel, geography, culture or app
  const forbiddenPatterns = [
    /\b(write code|javascript|typescript|python|c\+\+|java|react|css|sql|function|algorithm|debugger|syntax)\b/,
    /\b(politics|election|political party|bjp|congress|parliament debate|war|military|biden|modi political speech)\b/,
    /\b(celebrity gossip|hollywood drama|bollywood scandal|kardashian|pop stars)\b/,
    /\b(math homework|solve equation|calculus|trigonometry|physics formula|chemistry reaction)\b/,
    /\b(dating advice|relationship breakup|horoscope prediction|astrology chart)\b/,
    /\b(medical prescription|diagnose illness|cure cancer|pharma drugs)\b/
  ];

  // If query explicitly matches forbidden topics AND does not mention places, travel, tourism, or the app
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(q)) {
      const travelTokens = ['travel', 'trip', 'place', 'visit', 'city', 'country', 'monument', 'temple', 'app', 'map', 'tour', 'go', 'stay', 'food', 'hotel'];
      const hasTravelContext = travelTokens.some(t => q.includes(t));
      if (!hasTravelContext) {
        return false;
      }
    }
  }

  // Any other query mentioning places, locations, activities, geography, features is permitted
  return true;
}

// Curated Rich Destination Database for Indian & International hotspots
interface DestinationGuide {
  title: string;
  tagline: string;
  highlights: string[];
  howToReach: string;
  bestTime: string;
  timingsAndTickets: string;
  foodDelights: string[];
  shoppingCrafts: string;
  etiquette: string;
  safetyTips: string;
}

const DESTINATIONS: Record<string, DestinationGuide> = {
  'delhi': {
    title: 'Delhi (National Capital Region)',
    tagline: 'Heart of India — Where Mughal Grandeur Meets Vibrant Modern Capital',
    highlights: [
      '**Red Fort (Lal Qila)**: Iconic 17th-century Mughal stronghold, Sound & Light show in evening.',
      '**Qutub Minar**: UNESCO World Heritage 73m victory tower and ancient iron pillar.',
      '**Humayun\'s Tomb**: The Persian-inspired garden tomb that was the precursor to the Taj Mahal.',
      '**Chandni Chowk & Jama Masjid**: Atmospheric labyrinth of narrow lanes, spice markets, and rickshaw rides.',
      '**India Gate & Kartavya Path**: War memorial boulevard; splendid evening strolls.'
    ],
    howToReach: 'Indira Gandhi International Airport (DEL); Major rail terminals: New Delhi (NDLS), Old Delhi (DLI), Hazrat Nizamuddin (NZM); World-class DMRC Metro connects all key attractions.',
    bestTime: 'October to March (pleasant 15°C–25°C). Avoid intense summer heat (May–June).',
    timingsAndTickets: 'ASI monuments open sunrise to sunset. ASI entry tickets: ₹50 for Indians, ₹600 for foreign visitors (QR code scanning available on entry). Red Fort and National Museum closed on Mondays.',
    foodDelights: [
      'Paranthe Wali Gali in Chandni Chowk (hot, stuffed fried flatbreads)',
      'Karim\'s & Al Jawahar (Mughlai mutton korma, seekh kebabs)',
      'Chole Bhature at Sita Ram Diwan Chand (Paharganj)',
      'Kulfi Falooda at Giani\'s Church Mission Road'
    ],
    shoppingCrafts: 'Dilli Haat (INA) for fixed-price verified GI craft clusters from all Indian states; Janpath & Sarojini Nagar for bargain apparel (counter-offer 50-60%); Dariba Kalan for silver jewellery.',
    etiquette: 'Remove footwear at Jama Masjid & Sis Ganj Gurudwara; cover head with scarves; dress modestly covering shoulders and knees.',
    safetyTips: 'Delhi Auto Meter Rule: ₹30 first 1.5 km, ₹11/km after. Insist on "Meter se chalo". Avoid unverified touts claiming "monument is closed". Use Delhi Metro for fastest transit.'
  },
  'agra': {
    title: 'Agra (Uttar Pradesh)',
    tagline: 'City of the Taj Mahal & Sublime Mughal Architecture',
    highlights: [
      '**Taj Mahal**: The world-renowned white marble mausoleum built by Shah Jahan.',
      '**Agra Fort**: Massive red sandstone bastion overlooking the Yamuna River.',
      '**Fatehpur Sikri**: Ghost city and monumental Buland Darwaza built by Emperor Akbar (37 km away).',
      '**Mehtab Bagh**: Moonlit garden across the river offering pristine sunset Taj views without crowds.'
    ],
    howToReach: 'Gatimaan Express or Vande Bharat Express from Delhi (1 hr 40 min); Yamuna Expressway by car (3-4 hrs); Agra Cantt (AGC) railway station.',
    bestTime: 'October to March. Sunrise viewing of Taj Mahal is mystical during winter mornings.',
    timingsAndTickets: '**CRITICAL: Taj Mahal is CLOSED on FRIDAYS** for prayers. Open sunrise to sunset all other days. Tickets: ₹50 (Indians), ₹1,100 (Foreign tourists + includes water bottle & shoe covers). Night viewing allowed 5 nights around full moon.',
    foodDelights: [
      'Petha (translucent ash-gourd sweet; Panchhi Petha is the genuine brand)',
      'Bedai & Jalebi for breakfast in Kinari Bazaar',
      'Mughlai Dum Biryani'
    ],
    shoppingCrafts: 'Pietra Dura marble inlay work (marble tables, coaster sets), Agra leather footwear, Zardozi embroidery. Warning: beware driver commissions at marble factories.',
    etiquette: 'No tripods, drones, or large bags allowed inside Taj Mahal. Deposit electronics at entry cloakrooms. Wear shoe covers on marble platform.',
    safetyTips: 'Purchase tickets online at official ASI portal (asi.payumoney.com) to bypass ticket counter touts. Ignore "marble factory" touts claiming government endorsement.'
  },
  'jaipur': {
    title: 'Jaipur (Pink City, Rajasthan)',
    tagline: 'Royal Palaces, Hilltop Forts & Desert Regal Splendor',
    highlights: [
      '**Amber (Amer) Fort**: Majestically perched hilltop fortress with mirror-worked Sheesh Mahal.',
      '**Hawa Mahal (Palace of Winds)**: 953 honeycomb sandstone windows overlooking Badi Chaupar.',
      '**City Palace & Jantar Mantar**: Royal residence museum and UNESCO astronomical observatory.',
      '**Nahargarh & Jaigarh Forts**: Sunset panoramic vistas over the Pink City ramparts.'
    ],
    howToReach: 'Jaipur International Airport (JAI); Vande Bharat Express from Delhi (3.5 hrs); Delhi-Mumbai Expressway by road.',
    bestTime: 'November to February (sunny winter days, cool evenings).',
    timingsAndTickets: 'Amber Fort open 8:00 AM - 5:30 PM (and night tourism 6:30 PM - 9:15 PM). Composite tickets available for all major monuments (saves 40%).',
    foodDelights: [
      'Dal Baati Churma at LMB (Laxmi Misthan Bhandar) in Johari Bazaar',
      'Pyaaz Kachori at Rawat Misthan Bhandar',
      'Laal Maas (fiery royal mutton curry cooked with Mathania chilies)',
      'Lassi in earthen kulhads on MI Road'
    ],
    shoppingCrafts: 'Jaipur Blue Pottery (GI-certified), Sanganeri block-printed cotton quilts (Jaipuri Razai), Gemstone jewellery in Johari Bazaar, Mojari leather slip-ons.',
    etiquette: 'Respect royal private family quarters at City Palace. Greet locals with "Khamma Ghani".',
    safetyTips: 'Beware of gem scams where touts offer export deals for commission. Fixed prices are standard at Rajasthan Government Rajasthali Emporium.'
  },
  'varanasi': {
    title: 'Varanasi / Kashi (Uttar Pradesh)',
    tagline: 'The World’s Oldest Living City & Spiritual Gateway on the Holy Ganga',
    highlights: [
      '**Dashashwamedh Ghat Evening Ganga Aarti**: Mesmerizing synchronized fire ritual at 6:45 PM.',
      '**Kashi Vishwanath Temple**: Sacred Jyotirlinga shrine connected via the Kashi Vishwanath Corridor.',
      '**Sunrise Boat Ride**: Row along the crescent curve of the 84 ghats from Assi to Manikarnika.',
      '**Sarnath**: Deer Park where Lord Buddha delivered his first sermon (10 km away).'
    ],
    howToReach: 'Lal Bahadur Shastri Airport (VNS); Varanasi Junction (BSB) and Banaras (BSBS) stations. Vande Bharat Express connects directly to Delhi.',
    bestTime: 'October to March (cool mornings, clear skies). Dev Deepavali (full moon after Diwali) is unforgettable.',
    timingsAndTickets: 'Ghats accessible 24/7. Morning boat rides best at 5:30 AM. Kashi Vishwanath Temple open 3:00 AM - 11:00 PM (Sparsh Darshan has dedicated slots; electronic lockers available).',
    foodDelights: [
      'Banarasi Paan (Tamul/Meetha paan at Keshav Tambool)',
      'Tamatar Chaat at Kashi Chaat Bhandar (mashed spiced tomatoes served in clay bowls)',
      'Malaiyo (winter saffron milk froth foam served at Thatheri Bazaar)',
      'Blue Lassi near Manikarnika Ghat'
    ],
    shoppingCrafts: 'Authentic Banarasi Silk Sarees (GI Tagged) with zari brocade in Chowk and Peeli Kothi weaver colonies; wooden lacquer toys; brass idols.',
    etiquette: 'Strictly **NO photography** at Manikarnika and Harishchandra burning ghats out of respect for cremation rites. Dress modestly covering limbs.',
    safetyTips: 'Fix boat ride fares beforehand (typically ₹300-₹500 for a rowboat for 1-2 hours). Never donate money to cremation wood scam artists near burning ghats.'
  },
  'kochi': {
    title: 'Kochi / Cochin (Kerala)',
    tagline: 'Queen of the Arabian Sea — Colonial Spice Port & Serene Backwaters',
    highlights: [
      '**Fort Kochi Chinese Fishing Nets**: Giant cantilevered shore-operated nets against coastal sunset.',
      '**Mattancherry Palace (Dutch Palace)**: 16th-century murals illustrating Hindu epics.',
      '**Jew Town & Paradesi Synagogue**: 1568 synagogue with hand-painted Belgian glass chandeliers.',
      '**Kathakali Dance Performances**: Classical drama with intricate facial makeup at Kerala Kathakali Centre.'
    ],
    howToReach: 'Cochin International Airport (COK) — world\'s first fully solar-powered airport; Ernakulam Junction (ERS); Kochi Water Metro connects islands seamlessly.',
    bestTime: 'September to March. Monsoon (June-August) is famed for authentic Ayurvedic rejuvenation.',
    timingsAndTickets: 'Synagogue open 10 AM - 5 PM (closed Fridays, Saturdays & Jewish holidays). Water Metro ticket is just ₹20-₹40.',
    foodDelights: [
      'Kerala Sadya served on banana leaf',
      'Appam with Vegetable Stew or Kerala Fish Curry (Meen Moilee)',
      'Karimeen Pollichathu (pearl spot fish baked in banana leaf)',
      'Fresh tender coconut and banana fritters (Pazham Pori)'
    ],
    shoppingCrafts: 'Cardamom, tellicherry black pepper, cinnamon from Jew Town spice godowns; Aranmula Kannadi metal mirrors; Kasavu gold-bordered handloom saris.',
    etiquette: 'Leave shoes outside synagogues and heritage temples; Kerala is environmentally conscious—avoid single-use plastics.',
    safetyTips: 'Use the Kochi Water Metro and KSRTC ferries for budget-friendly backwater trips instead of overpriced private speedboats.'
  },
  'goa': {
    title: 'Goa',
    tagline: 'Sun, Sand, Portuguese Architecture & Tropical Susegad',
    highlights: [
      '**Old Goa Basilicas**: Basilica of Bom Jesus (relics of St. Francis Xavier) & Se Cathedral.',
      '**South Goa Pristine Beaches**: Palolem, Agonda, Benaulim, and Butterfly Beach for serene relaxation.',
      '**North Goa Vibrance**: Anjuna flea market, Vagator cliffs, Chapora Fort, and watersports at Calangute.',
      '**Fontainhas (Latin Quarter, Panaji)**: Colorful Portuguese villas with tiled terracotta roofs.',
      '**Dudhsagar Waterfalls**: Tiered 310m waterfall inside Bhagwan Mahavir Wildlife Sanctuary.'
    ],
    howToReach: 'Dabolim Airport (GOI) & Manohar International Airport Mopa (GOX); Madgaon (MAO) and Thivim (THVM) railway stations.',
    bestTime: 'November to February for beach weather; July to September for lush green waterfalls and spice plantations.',
    timingsAndTickets: 'Churches open 9:00 AM - 5:30 PM. Beach access is public and free 24/7.',
    foodDelights: [
      'Goan Fish Thali with Kingfish Rava Fry and Sol Kadi',
      'Pork or Chicken Vindaloo and Sorpotel',
      'Bebinca (traditional multi-layered Goan coconut milk pudding)',
      'Fresh crab xacuti and poee (crusty Goan bread)'
    ],
    shoppingCrafts: 'Cashews from local co-ops, Feni (GI-certified cashew liquor), Azulejos ceramic hand-painted tiles, bohemian attire at Wednesday Anjuna market.',
    etiquette: 'Wear beachwear only on beaches—dress respectfully when walking in towns or visiting churches. Do not take photos of people sunbathing without consent.',
    safetyTips: 'Always wear a helmet when renting two-wheelers (police fines are strict). Red flags on beaches mean dangerous undercurrents—never swim during monsoon.'
  },
  'udaipur': {
    title: 'Udaipur (City of Lakes, Rajasthan)',
    tagline: 'Venice of the East — White Marble Palaces & Calm Azure Waters',
    highlights: [
      '**City Palace Udaipur**: Rajasthan\'s largest palace complex overlooking Lake Pichola.',
      '**Lake Pichola Boat Cruise**: Gliding past Taj Lake Palace and Jag Mandir island palace.',
      '**Jagdish Temple**: 1651 carved Indo-Aryan temple dedicated to Lord Vishnu.',
      '**Saheliyon-ki-Bari**: Courtyard of the Maids with marble elephant fountains.'
    ],
    howToReach: 'Maharana Pratap Airport (UDR); Udaipur City (UDZ) railway station.',
    bestTime: 'October to March. Pleasant winter breezes over the lakes.',
    timingsAndTickets: 'City Palace open 9:00 AM - 5:30 PM. Combined entry & museum ticket ₹300-₹400.',
    foodDelights: ['Dal Baati Churma', 'Gatte ki Sabzi', 'Ker Sangri', 'Jalebi & Rabdi at Jagdish Chowk'],
    shoppingCrafts: 'Miniature Pichwai paintings on silk, camel leather journals, Bandhani dupattas, silver crafts.',
    etiquette: 'Heritage boats require life jackets at all times. Modest attire recommended in old city ghats.',
    safetyTips: 'Compare boat cruise prices: government boats at Dudh Talai cost ₹150-₹300 vs private luxury boats costing ₹800+.'
  },
  'ladakh': {
    title: 'Leh Ladakh (Jammu & Kashmir)',
    tagline: 'Land of High Mountain Passes, Tibetan Monasteries & Starlit Skies',
    highlights: [
      '**Pangong Tso Lake**: Hypnotic color-changing saltwater lake at 14,270 ft extending into Tibet.',
      '**Nubra Valley & Hunder Sand Dunes**: Double-humped Bactrian camels amid cold desert.',
      '**Thiksey & Hemis Monasteries**: Grand gompas adorned with ancient thankas and giant Buddha statues.',
      '**Khardung La**: One of the highest motorable mountain passes in the world (17,582 ft).'
    ],
    howToReach: 'Kushok Bakula Rimpochee Airport (IXL) in Leh. Scenic road routes: Manali-Leh Highway (475 km) or Srinagar-Leh Highway (open May-October).',
    bestTime: 'May to September (accessible mountain roads, clear skies, pleasant 15°C–20°C days).',
    timingsAndTickets: '**CRITICAL: Inner Line Permit (ILP)** is mandatory for domestic and foreign travelers visiting Pangong, Nubra, and Tso Moriri (can be obtained online at lahdclehpermit.in).',
    foodDelights: ['Steamed Momos & Thukpa', 'Butter Tea (Gur Gur Chai)', 'Tingmo (Tibetan steamed bread)', 'Skyu (traditional Ladakhi pasta stew)'],
    shoppingCrafts: 'Pashmina shawls (pure Changthangi goat wool), Tibetan prayer wheels, sea buckthorn tea and dried apricots.',
    etiquette: 'Walk clockwise around chortens and prayer wheels. **ACCLIMATIZATION RULE**: Rest completely for the first 24-48 hours in Leh to prevent Acute Mountain Sickness (AMS). Drink plenty of water.',
    safetyTips: 'Keep Diamox handy after consulting a physician. Carry sufficient Indian cash as ATMs are sparse beyond Leh town.'
  },
  'hampi': {
    title: 'Hampi (Karnataka)',
    tagline: 'UNESCO Bolder-Strewn Ruins of the 14th-century Vijayanagara Empire',
    highlights: [
      '**Virupaksha Temple**: Active 7th-century Dravidian temple complex dedicated to Lord Shiva.',
      '**Vijaya Vittala Temple**: Famed Stone Chariot (featured on ₹50 note) and musical pillars.',
      '**Matanga Hill Sunrise**: 360-degree panorama of boulder hills and banana plantations.',
      '**Hippie Island (Anegundi)**: Relaxed boulder-hopping, coracle rides across Tungabhadra river.'
    ],
    howToReach: 'Nearest airport: Hubballi (HBX) or Jindal Vijayanagar (VDY); Nearest major railhead: Hosapete Junction (HPT) (13 km away).',
    bestTime: 'October to February. Avoid scorching summer heat (March–May).',
    timingsAndTickets: 'Monuments open 6:00 AM - 6:00 PM. ASI composite ticket covers Vittala Temple and Zenana Enclosure.',
    foodDelights: ['Karnataka Thali on banana leaf', 'Mangalore buns & filter coffee', 'Crispy Dosa at Mango Tree restaurant'],
    shoppingCrafts: 'Banana fiber handicrafts, stone replicas of the Hampi chariot, Lambani tribal embroidered mirrors.',
    etiquette: 'Do not climb on ancient stone pillars or temple sculptures; protect historical heritage.',
    safetyTips: 'Rent a bicycle or electric scooter to explore the sprawling 25 sq km ruins. Carry sun hats and plenty of water.'
  },
  'mumbai': {
    title: 'Mumbai (Maharashtra)',
    tagline: 'City of Dreams — Colonial Heritage, Bollywood & Marine Drive Skyline',
    highlights: [
      '**Gateway of India**: Majestic basalt triumphal arch built in 1924 overlooking Mumbai harbor.',
      '**Marine Drive ("Queen\'s Necklace")**: 3.6 km seaside promenade; magical evening breeze.',
      '**Chhatrapati Shivaji Maharaj Terminus (CSMT)**: UNESCO Victorian Gothic railway palace.',
      '**Elephanta Caves**: Rock-cut cave temples dedicated to Lord Shiva on Elephanta Island (ferry from Gateway).'
    ],
    howToReach: 'Chhatrapati Shivaji Maharaj International Airport (BOM); CSMT, Mumbai Central (MMCT), and Bandra Terminus; Mumbai Suburban Railway local trains and Metro.',
    bestTime: 'November to February for pleasant weather. Monsoon (June-September) has dramatic coastal beauty.',
    timingsAndTickets: 'Gateway of India is free & open 24/7. Elephanta ferry runs every 30 min (₹200-₹260 return; caves closed Mondays).',
    foodDelights: [
      'Vada Pav at Ashok Vada Pav (Kirti College) or Aram at CSMT',
      'Pav Bhaji at Sardar Refreshments (Tardeo) or Cannon Pav Bhaji',
      'Bombay Bhel Puri & Sev Puri at Chowpatty Beach',
      'Irani Chai & Bun Maska at Britannia & Co. or Kyani & Co.'
    ],
    shoppingCrafts: 'Colaba Causeway for vintage brass, leather bags & bohemian jewellery; Crawford Market for spices and dry fruits; Chor Bazaar for antique collectables.',
    etiquette: 'Mumbai is fast-paced; stand to the side when exiting local train compartments during rush hours (8-10 AM, 5-8 PM).',
    safetyTips: 'Mumbai local auto-rickshaws run strictly by calibrated digital meters in the suburbs. In South Mumbai (Colaba, Fort), autos are not allowed; use Premier Padmini / Kaali-Peeli metered cabs.'
  },
  'indore': {
    title: 'Indore (Madhya Pradesh)',
    tagline: "India's Cleanest City for 7 Years — Royal Holkar Palaces & World-Famous Street Food Capital",
    highlights: [
      '**Rajwada Palace**: 7-story 18th-century Holkar dynasty royal palace blending Maratha, Mughal, and French architecture with wooden carved jharokhas.',
      '**Sarafa Bazaar Midnight Food Street**: Jewelers shut down at 8 PM, turning the alley into India\'s only midnight food haven (open till 2 AM) for Bhutte Ka Kees and flying Joshi Dahi Vada.',
      '**56 Dukan (Chappan Dukan)**: World-famous, spotlessly clean pedestrian food boulevard with 56 legendary food stalls (Indori Poha-Jalebi, Johnny Hot Dog, Khopra Patties, and Shikanji).',
      '**Lal Bagh Palace**: Grand 28-acre Holkar royal palace with wrought-iron gates modeled after Buckingham Palace, Italian marble floors, and European crystal chandeliers.',
      '**Kanch Mandir (Glass Temple)**: Breathtaking 20th-century Jain temple lined entirely with imported Belgian cut-glass and mirror mosaics.',
      '**Khajrana Ganesh Temple**: Historic 1735 shrine built by Rani Ahilyabai Holkar, revered for wish fulfillment and vibrant festive prasad stalls.',
      '**Krishnapura Chhatris**: Magnificent carved stone cenotaphs of Holkar rulers on the banks of Khan river.'
    ],
    howToReach: 'Devi Ahilyabai Holkar International Airport (IDR); Indore Junction (INDB) with Vande Bharat connectivity to Bhopal, Delhi, and Mumbai; Atal Indore City Transport iBus BRTS corridor.',
    bestTime: 'October to March for crisp, sunny days (20°C–28°C) and cool evenings. Also thrilling during Rangpanchami Gair and Ahilya Utsav.',
    timingsAndTickets: 'Rajwada: 10:00 AM – 05:00 PM (₹20; Light & Sound show at 7:00 PM). Lal Bagh Palace: 10:00 AM – 05:00 PM (₹30; closed Mondays). 56 Dukan opens from 7:00 AM; Sarafa starts at 8:30 PM until 02:00 AM.',
    foodDelights: [
      'Indori Poha with double Ratlami Sev & Kesariya Jalebi at 56 Dukan',
      'Bhutte Ka Kees (grated spiced corn cooked in milk and ghee) at Sarafa',
      'Crispy Spiced Garadu (fried yam tossed with secret spices & lemon)',
      'Joshi Dahi Vada (famous flying dahi vada with 5 spices)',
      'Johnny Hot Dog (Uber Eats Global Award winning veg & egg patties)',
      'Malwi Dal Bafla with pure desi ghee, toor dal, and churma ladoo',
      'Madhuram Shikanji (thick spiced dry-fruit milkshake)'
    ],
    shoppingCrafts: 'GI-tagged Indori & Ujjaini Sev (Laung, Ratlami, Hing), authentic Maheshwari Silk & Cotton Sarees at Sitlamata Bazaar, Chanderi fabrics, and leather toys.',
    etiquette: 'Indore has a zero-tolerance policy on littering. Strict fines apply for dropping trash outside designated green/blue/black bins. Remove shoes before entering Kanch Mandir and Khajrana Ganesh.',
    safetyTips: 'Indore is extremely safe, even for solo travelers and families visiting Sarafa late at night. Auto-rickshaws and e-rickshaws are abundant; use the Chalo App for real-time iBus routes and digital bus passes.'
  },
  'dewas': {
    title: 'Dewas (Madhya Pradesh)',
    tagline: 'Sacred Abode of Maa Chamunda & Tulja Bhavani on Chamunda Tekri — Royal Maratha Heritage',
    highlights: [
      '**Chamunda Mata & Tulja Bhavani Tekri**: Conical 300-foot holy hill in the heart of Dewas featuring twin Goddess shrines, panoramic sunset views, and modern ropeway cable car.',
      '**Pawar Dynasty Royal Palaces**: Historical palaces of the Senior and Junior Maratha royal branches with distinctive wood carvings and stone courtyards.',
      '**Meetha Talab (Sweet Lake)**: Serene freshwater lake with a landscaped walking promenade and leisure boating.',
      '**Kavadia Hills**: Fascinating geological wonder near Dewas with rare interlocking hexagonal basalt rock columns.',
      '**Kaila Devi Temple**: Sprawling temple complex featuring a colossal 51-foot statue of Lord Hanuman and white marble pavilions.'
    ],
    howToReach: 'Directly on the Indore-Bhopal-Agra NH-52 corridor, only 35 km from Indore (40 mins via 6-lane highway) and 35 km from Ujjain (45 mins). Dewas Junction (DWX) has extensive express train stops. Nearest airport is Indore (IDR, 40 km).',
    bestTime: 'October to March for crisp, pleasant weather. Especially vibrant during Shardiya Navratri when thousands ascend the Tekri for midnight darshan and lighting.',
    timingsAndTickets: 'Chamunda Tekri Temple: Open 05:00 AM – 10:00 PM (24 hours during Navratri). General darshan is free. Ropeway ticket is ~₹50 return.',
    foodDelights: [
      'Authentic Malwi Poha with spicy Laung Sev and hot crispy Jalebi',
      'Desi Ghee Dal Bafla with garlic chutney and churma',
      'Crispy Spiced Garadu tossed with special Malwi masala in winter',
      'Fresh Rabdi & Malpua at foothill sweet stalls'
    ],
    shoppingCrafts: 'Famous Dewas and Ratlami spicy sev, handloom textiles, leather handicrafts, brass puja samagri.',
    etiquette: 'Remove shoes before entering the Goddess temples on the hill. Dress respectfully covering shoulders and knees. Ropeway is recommended for seniors.',
    safetyTips: 'Dewas is very peaceful and safe. Frequent AC and non-AC buses run between Indore, Dewas, and Ujjain every 10 minutes.'
  },
  'ujjain': {
    title: 'Ujjain (Madhya Pradesh)',
    tagline: 'City of Mahakal — Ancient Capital of King Vikramaditya & Sacred Simhastha Kumbh on the Kshipra',
    highlights: [
      '**Mahakaleshwar Jyotirlinga**: One of the 12 sacred Jyotirlingas, housing the divine Dakshinmukhi lingam, globally renowned for the pre-dawn **Bhasma Aarti**.',
      '**Shri Mahakal Lok Corridor**: World-class 900-meter heritage promenade adorned with 108 grand sculpted Shiva pillars, ornate fountains, murals, and nighttime light displays.',
      '**Ram Ghat on Kshipra River**: Holy bathing ghat where millions gather during Simhastha Kumbh; serene daily evening Kshipra Aarti.',
      '**Kal Bhairav Temple**: Famous ancient temple where liquor is traditionally offered as sacred prasad in an age-old tantric ritual.',
      '**Harsiddhi Mata Temple**: Sacred 51 Shaktipeeth featuring two iconic 40-foot deepstambhas (lamp towers) illuminated with over 1,000 oil lamps during evening sandhya.',
      '**Mangalnath Temple**: Revered according to Vedic astronomy as the cosmic birthplace of Planet Mars (Mangal Graha).',
      '**Vedh Shala (Jantar Mantar)**: 18th-century stone astronomical observatory built by Maharaja Sawai Jai Singh II with functional sundials.'
    ],
    howToReach: 'Ujjain Junction (UJN) with direct Vande Bharat and superfast express connectivity to Delhi, Mumbai, Varanasi, and Bhopal; 55 km from Indore Devi Ahilyabai Airport (IDR, 1 hr via 4-lane expressway).',
    bestTime: 'October to March. Also spiritually momentous during Shravan Month (July-August) for the royal Mahakal Sawari palanquin processions.',
    timingsAndTickets: 'Mahakaleshwar Temple open 04:00 AM – 11:00 PM. Bhasma Aarti (04:00 AM – 06:00 AM) requires prior online booking at shrimahakaleshwar.com or token counter. General darshan is free; VIP protocol pass is ₹250. Mobile phones must be deposited in electronic lockers.',
    foodDelights: [
      'Ujjaini Poha garnished with double Ratlami Sev, pomegranate & Jeeravan',
      'Royal Malwi Dal Bafla with pure desi ghee and baati dal',
      'Kshipra Ramghat thick Rabdi, Malpua & Kulfi',
      'Bhang Thandai from licensed government authorized outlets',
      'Kesariya Mawa Bati & Gulab Jamun at Tower Chowk'
    ],
    shoppingCrafts: 'GI-tagged Batik print sarees and kurtas at Bherugarh artisan cluster, holy Rudraksha malas, stone Nandi and Shiva lingams, pure brass pooja items, aromatic Ujjaini Hing.',
    etiquette: 'Strict traditional dress code inside Garbhagriha / Jalabhisheka: Men must wear pure unstitched Dhoti and Angavastram; Women must wear Saree. Leather belts and wallets not permitted in inner sanctum.',
    safetyTips: 'Never buy fake Bhasma Aarti passes from touts outside. Always book via the official temple trust portal (shrimahakaleshwar.com). E-rickshaws charge standard ₹20-₹40 within city limits.'
  }
};

// 2. DYNAMIC LOCATION SYNTHESIS ENGINE (FOR ANY PLACE ON EARTH)
export function generateGenericLocationGuide(locationName: string, query: string): AssistantResponse {
  const cleanName = locationName.trim().replace(/^about\s+/i, '').replace(/^the\s+/i, '');
  const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  const text = `### 📍 Essential Travel Guide: **${capitalized}**

Here is comprehensive travel, transit, cultural, and safety guidance for **${capitalized}**:

#### 1. 🏛️ Overview & Cultural Significance
- **Essence**: ${capitalized} is celebrated for its unique local heritage, architectural character, and scenic environment.
- **Top Experiences**: Explore landmark heritage sights, scenic view spots, historic bazaars, and walking circuits.
- **Atmosphere**: Rich in cultural traditions, local festivals, and warm hospitality.

#### 2. 🚆 How to Reach & Transit
- **Nearest Transit Hubs**: Connect via the nearest regional airport, express railway junctions, or national highway corridors.
- **Local Commute**: Navigate using metered auto-rickshaws, city buses, app cabs, or walk along pedestrian bazaar lanes.
- **App Navigation**: Tap the button below to locate ${capitalized} and compute multi-modal walking or auto meter routes!

#### 3. ☀️ Best Time to Visit & Climate
- **Peak Season**: **October to March** typically offers the most comfortable sightseeing weather with moderate temperatures.
- **What to Pack**: Light cotton clothing for sunny days; carry a light jacket or shawl for evenings and air-conditioned transit.

#### 4. 🎟️ Timings, Entry Fees & Ticketing
- **General Timings**: Most public monuments, parks, and museums operate from **sunrise to sunset** (approx. 9:00 AM – 5:30 PM).
- **Weekly Closures**: Check official tourism portals in advance as many regional museums or heritage complexes close on Mondays or Fridays.
- **Ticketing**: Look for official government or ASI QR code counters to bypass unofficial middleman queues.

#### 5. 🍛 Food & Culinary Highlights
- **Local Cuisine**: Savor authentic regional recipes, freshly prepared hot snacks, and traditional sweets.
- **Hygiene Rule**: Choose busy food stalls with high customer turnover where items are prepared fresh before you. Always drink sealed packaged mineral water (FSSAI/BIS certified) or UV-filtered water.

#### 6. 🛍️ Shopping & Local Crafts
- **Souvenirs**: Support local artisans by purchasing regional handicrafts, textiles, handloom weaves, and traditional spices.
- **Fair Bargaining**: In open street markets, polite counter-offers around 50%–60% of the initial quote are customary. Fixed-price government emporiums (like Khadi India) guarantee authenticity.

#### 7. 🛕 Etiquette & Dress Codes
- **Sacred Sites**: Remove footwear before entering temples, shrines, or sanctums. Dress respectfully with shoulders and knees covered.
- **Photography**: Look for signage regarding photography permissions, especially around sanctum sanctorums.

#### 8. 🛡️ Safety, Scam Alerts & Fair Prices
- **Auto/Taxi Meter**: Always insist on metered fares or agree on prevailing government rates before boarding.
- **Emergency Protection**: In any distress or dispute, call national helpline **112** or tap the **Emergency SOS button** in the bottom right corner of our app!`;

  return {
    text,
    actionChips: [
      { label: `✨ Plan ${capitalized} Itinerary`, action: 'open_ai_planner' },
      { label: `🧭 View ${capitalized} on Map`, action: 'open_map' },
      { label: '📡 Scan Surrounding Sights', action: 'open_scanner' },
      { label: '⚖️ Fair Price Calculator', action: 'open_trust' },
      { label: '🚨 Emergency SOS 112', action: 'open_sos' }
    ],
    isOutOfScope: false,
    source: 'knowledge_base'
  };
}

// 3. MAIN KNOWLEDGE BASE PROCESSOR
export function processAssistantQueryOffline(query: string): AssistantResponse {
  const q = query.toLowerCase().trim();

  // Guardrail check
  if (!isQueryInScope(q)) {
    return {
      text: `Namaste! 🙏 I am **Sahayak AI**, your dedicated India Travel & App Feature Guide.\n\nI am exclusively trained to assist with **travel information for ANY location or place** (monuments, transit, timings, food, culture, safety, best seasons) and **guiding you through all the features of this application**.\n\nI cannot answer questions about general topics like coding, politics, homework, or non-travel subjects.\n\nPlease ask me about any city, monument, destination, or app feature!`,
      actionChips: [
        { label: '🧭 Open Live Map Navigation', action: 'open_map' },
        { label: '📡 Scan Surrounding Area', action: 'open_scanner' },
        { label: '⚖️ Check Fair Price Calculator', action: 'open_trust' },
        { label: '🚨 Emergency SOS Info', action: 'open_sos' }
      ],
      isOutOfScope: true,
      source: 'knowledge_base'
    };
  }

  // Check against our rich curated destinations
  for (const [key, dest] of Object.entries(DESTINATIONS)) {
    if (q.includes(key)) {
      const text = `### 📍 Travel Guide: **${dest.title}**
*${dest.tagline}*

#### 1. 🌟 Top Must-Visit Highlights
${dest.highlights.map(h => `- ${h}`).join('\n')}

#### 2. 🚆 How to Reach & Transit
${dest.howToReach}

#### 3. ☀️ Best Time to Visit
${dest.bestTime}

#### 4. 🎟️ Timings, Entry Fees & Rules
${dest.timingsAndTickets}

#### 5. 🍛 Authentic Food & Culinary Specialties
${dest.foodDelights.map(f => `- ${f}`).join('\n')}

#### 6. 🛍️ Shopping & GI Crafts
${dest.shoppingCrafts}

#### 7. 🛕 Cultural Etiquette & Dress Code
${dest.etiquette}

#### 8. 🛡️ Safety, Scam Alerts & Fair Rates
${dest.safetyTips}`;

      return {
        text,
        actionChips: [
          { label: '✨ Plan Full Itinerary', action: 'open_ai_planner' },
          { label: `🧭 View ${dest.title.split(' ')[0]} on Map`, action: 'open_map' },
          { label: '📡 Scan Surrounding Area', action: 'open_scanner' },
          { label: '⚖️ Check Fair Price Meter', action: 'open_trust' },
          { label: '🚨 Emergency SOS 112', action: 'open_sos' }
        ],
        isOutOfScope: false,
        source: 'knowledge_base'
      };
    }
  }

  // App Features Specific Matchers
  if (q.includes('map') || q.includes('navigation') || q.includes('direction') || q.includes('turn by turn') || q.includes('gps')) {
    return {
      text: `### 🧭 Interactive Route Map & Turn-by-Turn GPS Navigation\n\nOur map is built for navigating Indian cities and heritage zones:\n\n1. **Live GPS Tracking**: Shows your current position with a blue pulsing beacon and accuracy radius. Click the **Locate Me** button to snap to your live location.\n2. **Calibration Presets**: If you are testing, select presets like *Chandni Chowk Old Delhi*, *Taj Ganj Agra*, or *Assi Ghat Varanasi* from the top GPS menu.\n3. **Multi-Modal Directions**: Choose between **Walking** (heritage lanes), **Auto Rickshaw** (with official meter rate calculations), **Metro** (token fare slabs), and **Cab**.\n4. **Turn-by-Turn Navigation HUD**: Click **"Start Live Navigation"** to enter the heads-up display with large turn icons, upcoming landmarks, and **Voice Guidance (TTS)**.\n5. **Google Maps Companion**: Tap the external link icon anytime to launch Google Maps for driving navigation.`,
      actionChips: [
        { label: '🗺️ Open Interactive Map', action: 'open_map' },
        { label: '📡 Scan Nearby with Radar', action: 'open_scanner' }
      ],
      isOutOfScope: false,
      source: 'knowledge_base'
    };
  }

  if (q.includes('scanner') || q.includes('scan') || q.includes('radar') || q.includes('surrounding') || q.includes('nearby')) {
    return {
      text: `### 📡 Live Surrounding Area Scanner\n\nThe Scanner uses GPS to inspect what is around you in real-time:\n\n- **Adjustable Radius**: Scan **1 km** (Walking), **3 km** (Auto Rickshaw), **5 km** (Metro), or **10 km** (Exploration).\n- **FSSAI Safe Food Filter**: Highlights verified street food and historic dining spots with high hygiene scores and safe filtered drinking water.\n- **ASI Heritage Monuments**: Displays verified entry gate coordinates, official ASI ticketing links, and photography guidelines.\n- **GI-Certified Craft Buys**: Verified government emporiums and fair price ranges to prevent middleman commission traps.\n- **1-Click Add to Itinerary**: Click "Add Stop" on any discovered landmark to instantly add it to your day plan!`,
      actionChips: [
        { label: '📡 Launch Radar Scanner', action: 'open_scanner' },
        { label: '🗺️ View on Map', action: 'open_map' }
      ],
      isOutOfScope: false,
      source: 'knowledge_base'
    };
  }

  if (q.includes('sos') || q.includes('emergency') || q.includes('police') || q.includes('danger') || q.includes('hospital') || q.includes('helpline')) {
    return {
      text: `### 🚨 Emergency SOS & Tourist Safety Network\n\nYour safety is protected 24/7 across India:\n\n- **Bottom Right Corner SOS Button**: A prominent crimson **"SOS 112"** button is docked permanently in the bottom right corner of your screen for instantaneous 1-tap activation.\n- **Multi-Category Incident Dispatch**: Choose from *Physical Danger / Medical*, *Auto / Taxi Harassment*, *Scam & Extortion Dispute*, or *Accessibility Emergency*.\n- **Live Transmission**: Packages your exact GPS coordinates, local police station jurisdiction, blood group, and ICE emergency contacts.\n- **Key Emergency Numbers**:\n  • **112**: National Emergency All-in-One (Police, Ambulance, Fire)\n  • **1363**: Ministry of Tourism 24/7 Multi-Lingual Tourist Helpline\n  • **1091**: Women's Safety Helpline`,
      actionChips: [
        { label: '🚨 Open Emergency SOS Modal', action: 'open_sos' },
        { label: '👤 Check Emergency Profile / ICE', action: 'open_profile' }
      ],
      isOutOfScope: false,
      source: 'knowledge_base'
    };
  }

  if (q.includes('fair price') || q.includes('scam') || q.includes('bargain') || q.includes('overcharg') || q.includes('tout') || q.includes('commission')) {
    return {
      text: `### ⚖️ Fair-Price Scam Engine & Anti-Tout Protection\n\nProtects travelers from common overcharging traps:\n\n1. **Auto-Rickshaw Meter Calculator**: Delhi & Rajasthan rule is **₹30 for the first 1.5 km, then ₹11 per km**. Always insist on: *"Meter se chalo"* (Run by the meter).\n2. **Common Scam Alerts**:\n   • *"Monument is closed today for VIP"* → Almost always fake; touts want to divert you to expensive private shops.\n   • *"Official Government Emporium"* on a side street → Only buy from verified Khadi India or Central Cottage Industries.\n3. **Bargaining Formula**: In street markets (like Janpath or Sarojini), counter-offer around **50% to 60%** of the quoted opening price with a friendly smile. Never bargain in MRP retail stores or ASI ticket counters.`,
      actionChips: [
        { label: '⚖️ Open Fair-Price Engine', action: 'open_trust' },
        { label: '🛍️ View Verified GI Crafts', action: 'open_transit' }
      ],
      isOutOfScope: false,
      source: 'knowledge_base'
    };
  }

  // Check if active searched location matches the query
  const searchedLoc = journeyContext.current?.searchedLocation;
  if (searchedLoc && typeof searchedLoc === 'string' && q.includes(searchedLoc.toLowerCase().trim())) {
    const locClean = searchedLoc.trim();
    // Check if in curated DESTINATIONS
    for (const [key, dest] of Object.entries(DESTINATIONS)) {
      if (locClean.toLowerCase().includes(key)) {
        const text = `### 📍 Travel Guide: **${dest.title}**\n*${dest.tagline}*\n\n#### 1. 🌟 Top Must-Visit Highlights\n${dest.highlights.map(h => `- ${h}`).join('\n')}\n\n#### 2. 🚆 How to Reach & Transit\n${dest.howToReach}\n\n#### 3. ☀️ Best Time to Visit\n${dest.bestTime}\n\n#### 4. 🎟️ Timings, Entry Fees & Rules\n${dest.timingsAndTickets}\n\n#### 5. 🍛 Authentic Food & Culinary Specialties\n${dest.foodDelights.map(f => `- ${f}`).join('\n')}\n\n#### 6. 🛍️ Shopping & GI Crafts\n${dest.shoppingCrafts}\n\n#### 7. 🛕 Cultural Etiquette & Dress Code\n${dest.etiquette}\n\n#### 8. 🛡️ Safety, Scam Alerts & Fair Rates\n${dest.safetyTips}`;
        return {
          text,
          actionChips: [
            { label: '✨ Plan Full Itinerary', action: 'open_ai_planner' },
            { label: `🧭 View ${dest.title.split(' ')[0]} on Map`, action: 'open_map' },
            { label: '📡 Scan Surrounding Area', action: 'open_scanner' },
            { label: '⚖️ Check Fair Price Meter', action: 'open_trust' },
            { label: '🚨 Emergency SOS 112', action: 'open_sos' }
          ],
          isOutOfScope: false,
          source: 'knowledge_base'
        };
      }
    }
    return generateGenericLocationGuide(locClean, q);
  }

  // Extract place from phrases like "tell me about X", "information on X", "where is X", "what to do in X", etc.
  const placeExtractPatterns = [
    /(?:tell me about|information about|information on|guide to|visit|travel to|explore|how is|what about|about|in)\s+([^,:;?\.\n]+?)(?:\s+(?:and|with|for|famous|in|at)\b|:|,|\.|\?|$)/i,
    /([a-zA-Z\s]{2,25})\s+(?:information|guide|history|places|attractions|food|weather|itinerary)/i
  ];

  for (const pat of placeExtractPatterns) {
    const match = q.match(pat);
    if (match && match[1]) {
      const extractedPlace = match[1].trim();
      const stopWords = ['the', 'a', 'an', 'this', 'app', 'my', 'trip', 'place', 'location', 'travel', 'visit'];
      if (!stopWords.includes(extractedPlace.toLowerCase()) && extractedPlace.length > 2) {
        return generateGenericLocationGuide(extractedPlace, q);
      }
    }
  }

  // If a single word or short phrase was entered, treat it as a location query!
  const words = q.split(/\s+/);
  if (words.length <= 4 && !q.includes('help') && !q.includes('hello') && !q.includes('hi')) {
    return generateGenericLocationGuide(q, q);
  }

  // Default hospitality overview
  return {
    text: `### 🇮🇳 Sahayak AI: Destination & Feature Guide\n\nNamaste! I am trained to give you in-depth information about **ANY location or destination** and **ANY aspect of a place**, including:\n\n- **Monuments & Heritage**: History, architecture, opening hours, entry tickets, and rules.\n- **Transit & Routes**: How to reach by flight, train (Vande Bharat/Rajdhani), metro, or metered auto-rickshaw.\n- **Local Cuisine & Food Safety**: Must-try authentic dishes, famous eateries, and FSSAI safe food practices.\n- **Shopping & Craft Clusters**: GI-certified souvenirs, authentic bazaars, and fair bargaining rates.\n- **Cultural Etiquette**: Attire guidelines for temples, mosques, gurdwaras, and footwear customs.\n- **App Features**: Live GPS navigation, Surrounding Area Scanner, Fair-Price Calculator, and Emergency SOS.\n\n*Try asking: "Tell me about Hampi", "Food and timings in Jaipur", "How to reach Taj Mahal from Delhi", or "How to use live navigation!"*`,
    actionChips: [
      { label: '🧭 Open Live Map Navigation', action: 'open_map' },
      { label: '📡 Scan Surrounding Area', action: 'open_scanner' },
      { label: '⚖️ Check Fair Price Calculator', action: 'open_trust' },
      { label: '🚨 Emergency SOS Info', action: 'open_sos' }
    ],
    isOutOfScope: false,
    source: 'knowledge_base'
  };
}

// 4. HYBRID ASYNC ASSISTANT DISPATCHER (Hits Gemini API with fallback to Knowledge Base)
export async function processAssistantQuery(query: string): Promise<AssistantResponse> {
  // First, verify scope
  if (!isQueryInScope(query)) {
    return processAssistantQueryOffline(query);
  }

  try {
    // Attempt to call server API for live Gemini response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch('/api/assistant', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, context: journeyContext.current }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.reply && !data.useFallback) {
        return {
          text: data.reply,
          actionChips: data.actionChips || [
            { label: '🧭 Open Live Map', action: 'open_map' },
            { label: '📡 Scan Nearby', action: 'open_scanner' }
          ],
          isOutOfScope: false,
          source: data.source || 'gemini'
        };
      }
    }
  } catch (e) {
    // Server route unavailable or timed out, gracefully use rich local knowledge engine
  }

  // Fallback to our deep encyclopedic knowledge base
  return processAssistantQueryOffline(query);
}
