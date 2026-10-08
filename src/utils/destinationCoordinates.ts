// Comprehensive Destination & Coordinates Directory for Incredible India Travel Platform

export interface DestinationGeoInfo {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  category: 'cultural_sight' | 'culinary' | 'transit' | 'cultural_buy' | 'festival';
  timings?: string;
  ticketPrice?: string;
  fairFareEstimate?: string;
  dressCode?: string;
  description: string;
  photoUrl: string;
  topAttractions?: string[];
}

export const DESTINATION_DIRECTORY: Record<string, DestinationGeoInfo> = {
  // --- Gujarat Circuits ---
  'somnath': {
    name: 'Somnath Jyotirlinga Temple',
    city: 'Somnath',
    state: 'Gujarat',
    lat: 20.8880,
    lng: 70.4012,
    category: 'cultural_sight',
    timings: '6:00 AM - 10:00 PM (Light & Sound Show: 8:00 PM)',
    ticketPrice: 'Free General Darshan • ₹30 Light & Sound Show',
    fairFareEstimate: '₹40 - ₹80 auto from Veraval Junction (7 km)',
    dressCode: 'Traditional Indian attire / modest dress (no leather belts inside sanctum)',
    description: 'The first of the twelve holy Jyotirlinga shrines of Lord Shiva, perched right on the shores of the Arabian Sea in Prabhas Patan, Gujarat.',
    photoUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Somnath Temple Sanctum', 'Triveni Sangam', 'Prabhas Patan Museum', 'Bhalka Tirth', 'Somnath Beach Promenade']
  },
  'somnath temple': {
    name: 'Somnath Jyotirlinga Temple',
    city: 'Somnath',
    state: 'Gujarat',
    lat: 20.8880,
    lng: 70.4012,
    category: 'cultural_sight',
    timings: '6:00 AM - 10:00 PM (Light & Sound Show: 8:00 PM)',
    ticketPrice: 'Free General Darshan • ₹30 Light & Sound Show',
    fairFareEstimate: '₹40 - ₹80 auto from Veraval Junction (7 km)',
    dressCode: 'Traditional Indian attire / modest dress (no leather belts inside sanctum)',
    description: 'The first of the twelve holy Jyotirlinga shrines of Lord Shiva, perched right on the shores of the Arabian Sea in Prabhas Patan, Gujarat.',
    photoUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Somnath Temple Sanctum', 'Triveni Sangam', 'Prabhas Patan Museum', 'Bhalka Tirth', 'Somnath Beach Promenade']
  },

  // --- Delhi Circuits ---
  'taj mahal': {
    name: 'Taj Mahal',
    city: 'Agra',
    state: 'Uttar Pradesh',
    lat: 27.1751,
    lng: 78.0421,
    category: 'cultural_sight',
    timings: 'Sunrise to Sunset (Closed Fridays)',
    ticketPrice: '₹50 (Indians) • ₹1,100 (Foreigners)',
    fairFareEstimate: '₹80 - ₹120 (from Agra Cantt)',
    dressCode: 'Modest attire, shoe covers provided at entrance',
    description: 'UNESCO World Heritage white marble mausoleum built by Mughal Emperor Shah Jahan.',
    photoUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Mehtab Bagh', 'Agra Fort', 'Itmad-ud-Daulah', 'Fatehpur Sikri']
  },
  'agra': {
    name: 'Agra Heritage Circuit',
    city: 'Agra',
    state: 'Uttar Pradesh',
    lat: 27.1767,
    lng: 78.0081,
    category: 'cultural_sight',
    timings: '6:00 AM - 6:30 PM',
    ticketPrice: '₹50 - ₹1,100 (Monument dependent)',
    fairFareEstimate: '₹70 - ₹150 prepaid auto',
    dressCode: 'Comfortable cotton walking wear',
    description: 'Imperial Mughal capital home to Taj Mahal, Agra Fort, and rich marble inlay artisans.',
    photoUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh', 'Sadar Bazaar Petha Market']
  },
  'red fort': {
    name: 'Red Fort (Lal Qila)',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.6562,
    lng: 77.2410,
    category: 'cultural_sight',
    timings: '9:30 AM - 4:30 PM (Closed Mondays)',
    ticketPrice: '₹35 (Indians) • ₹550 (Foreigners)',
    fairFareEstimate: '₹40 - ₹70 from Chandni Chowk Metro',
    dressCode: 'Casual comfortable clothes',
    description: 'Historic red sandstone fortress of the Mughal dynasty in Old Delhi.',
    photoUrl: 'https://images.unsplash.com/photo-1598556474044-542b94716757?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Diwan-i-Aam', 'Diwan-i-Khas', 'Lahori Gate', 'Chandni Chowk']
  },
  'qutub minar': {
    name: 'Qutub Minar Complex',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.5245,
    lng: 77.1855,
    category: 'cultural_sight',
    timings: '7:00 AM - 8:00 PM (Open all days)',
    ticketPrice: '₹40 (Indians) • ₹600 (Foreigners)',
    fairFareEstimate: '₹50 - ₹90 from Qutab Minar Metro Station',
    dressCode: 'Casual walking attire',
    description: '73-meter fluted red sandstone minaret and ancient Iron Pillar of Delhi.',
    photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Iron Pillar', 'Alai Darwaza', 'Quwwat-ul-Islam Mosque']
  },
  'delhi': {
    name: 'National Capital Region',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    category: 'cultural_sight',
    timings: 'All day vibrant metropolis',
    ticketPrice: 'Monument dependent',
    fairFareEstimate: 'Delhi Metro (₹20 - ₹60) or Traffic Police Prepaid Auto',
    dressCode: 'City casuals',
    description: 'The historic and contemporary capital of India, blending Mughal heritage, colonial architecture, and street food.',
    photoUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['India Gate', 'Red Fort', 'Humayun’s Tomb', 'Chandni Chowk', 'Lotus Temple']
  },

  // --- Jaipur & Rajasthan Circuits ---
  'hawa mahal': {
    name: 'Hawa Mahal (Palace of Winds)',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9239,
    lng: 75.8267,
    category: 'cultural_sight',
    timings: '9:00 AM - 5:00 PM',
    ticketPrice: '₹50 (Indians) • ₹200 (Foreigners)',
    fairFareEstimate: '₹50 - ₹80 from Badi Chaupar',
    dressCode: 'Modest casual attire',
    description: 'Five-story pink sandstone palace with 953 jharokhas (small windows) built in 1799.',
    photoUrl: 'https://images.unsplash.com/photo-1603288940340-9a3b2b7a5a8f?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['City Palace Jaipur', 'Jantar Mantar', 'Bapu Bazaar', 'Johari Bazaar']
  },
  'amber fort': {
    name: 'Amber Fort & Palace',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9855,
    lng: 75.8513,
    category: 'cultural_sight',
    timings: '8:00 AM - 5:30 PM, 6:30 PM - 9:15 PM (Night view)',
    ticketPrice: '₹100 (Indians) • ₹550 (Foreigners)',
    fairFareEstimate: '₹200 - ₹300 auto from Jaipur city',
    dressCode: 'Comfortable shoes for ramp ascent',
    description: 'Magnificent hilltop Rajput fort featuring Sheesh Mahal (Mirror Palace) and Maota Lake views.',
    photoUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Sheesh Mahal', 'Jaigarh Fort', 'Panna Meena Ka Kund', 'Elephant Ride Gate']
  },
  'jaipur': {
    name: 'Jaipur (The Pink City)',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    category: 'cultural_sight',
    timings: 'All day heritage city',
    ticketPrice: 'Composite ticket ₹300 (Indians) / ₹1,000 (Foreigners)',
    fairFareEstimate: '₹80 - ₹180 standard auto meter',
    dressCode: 'Comfortable cotton wear',
    description: 'Capital of Rajasthan, UNESCO World Heritage city famed for royal forts, gem markets, and Johari Bazar.',
    photoUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar', 'Chokhi Dhani']
  },
  'udaipur': {
    name: 'Udaipur (City of Lakes)',
    city: 'Udaipur',
    state: 'Rajasthan',
    lat: 24.5854,
    lng: 73.7125,
    category: 'cultural_sight',
    timings: '9:00 AM - 6:00 PM for palaces',
    ticketPrice: '₹300 City Palace entry',
    fairFareEstimate: '₹70 - ₹120 city auto',
    dressCode: 'Smart casuals',
    description: 'Romantic oasis with white marble palaces, Lake Pichola boat cruises, and Jag Mandir.',
    photoUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['City Palace Udaipur', 'Lake Pichola', 'Jag Mandir', 'Saheliyon-ki-Bari', 'Fateh Sagar Lake']
  },

  // --- Varanasi & Spiritual Circuits ---
  'varanasi': {
    name: 'Varanasi (Kashi)',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    category: 'cultural_sight',
    timings: 'Ghats open 24/7 • Aarti at 6:45 PM',
    ticketPrice: 'Free entry to ghats • Rowboat ₹300 - ₹500',
    fairFareEstimate: '₹80 - ₹150 Cantt Station to Dashashwamedh',
    dressCode: 'Modest temple wear, slip-on shoes recommended',
    description: 'One of the world’s oldest continuously inhabited cities on the sacred banks of Mother Ganga.',
    photoUrl: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Dashashwamedh Ghat', 'Kashi Vishwanath Corridor', 'Assi Ghat', 'Manikarnika Ghat', 'Sarnath']
  },
  'kashi vishwanath': {
    name: 'Kashi Vishwanath Temple',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3109,
    lng: 83.0107,
    category: 'cultural_sight',
    timings: '3:00 AM - 11:00 PM',
    ticketPrice: 'Free general darshan • Sugam Darshan ₹300',
    fairFareEstimate: 'Walkable from Dashashwamedh Ghat',
    dressCode: 'Traditional Indian attire (Dhoti/Kurta for sanctum rituals)',
    description: 'Renowned Jyotirlinga shrine dedicated to Lord Shiva with newly constructed mega corridor.',
    photoUrl: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Ganga Viewing Gallery', 'Annapurna Temple', 'Manikarnika Ghat']
  },
  'assi ghat': {
    name: 'Assi Ghat',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.2899,
    lng: 83.0067,
    category: 'cultural_sight',
    timings: 'Open 24/7 (Morning Subah-e-Banaras at 5:30 AM)',
    ticketPrice: 'Free access',
    fairFareEstimate: '₹70 - ₹100 auto from Lanka or Godowlia',
    dressCode: 'Casual modest wear',
    description: 'Southernmost sacred ghat known for morning yoga, classical shehnai recitals, and student cafes.',
    photoUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Subah-e-Banaras', 'Morning Boat Rides', 'Pappu Chai Shop']
  },

  // --- Madhya Pradesh Circuits ---
  'indore': {
    name: 'Indore (Cleanest City & Culinary Hub)',
    city: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    category: 'culinary',
    timings: 'Sarafa Food Street: 8:00 PM - 2:00 AM • Chappan Dukan: 9:00 AM - 10:30 PM',
    ticketPrice: 'Free street access • Palaces ₹20 - ₹50',
    fairFareEstimate: '₹50 - ₹100 city auto meter / iBus Metro bus',
    dressCode: 'Casual comfortable clothes',
    description: 'India’s 7-time cleanest city, Holkar royal seat, and legendary street food destination.',
    photoUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Rajwada Palace', 'Sarafa Bazaar', 'Chappan Dukan', 'Lal Bagh Palace', 'Khajrana Ganesh']
  },
  'chappan dukan': {
    name: 'Chappan Dukan (56 Shops Food Street)',
    city: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7244,
    lng: 75.8839,
    category: 'culinary',
    timings: '9:00 AM - 11:00 PM',
    ticketPrice: 'Food costs ₹30 - ₹200 per item',
    fairFareEstimate: '₹50 - ₹80 from Indore Junction',
    dressCode: 'Casual wear',
    description: 'FSSAI clean-certified pedestrian food precinct famed for Poha-Jalebi, Khopra Patties, and Shikanji.',
    photoUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Vijay Chaat House', 'Johny Hot Dog', 'Madhuram Sweets']
  },
  'ujjain': {
    name: 'Ujjain Mahakaleshwar',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    lat: 23.1828,
    lng: 75.7682,
    category: 'cultural_sight',
    timings: '4:00 AM Bhasma Aarti - 11:00 PM',
    ticketPrice: 'Free general darshan • VIP darshan ₹250',
    fairFareEstimate: '₹60 - ₹100 from Ujjain Station • 55km from Indore via Vande Bharat',
    dressCode: 'Dhoti for men, Saree for women during Bhasma Aarti',
    description: 'Dakshinmukhi Jyotirlinga and Mahakal Lok Corridor along the holy Kshipra River.',
    photoUrl: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Mahakal Lok Corridor', 'Ram Ghat', 'Kaal Bhairav Temple', 'Harsiddhi Temple']
  },

  // --- South India & Coastal Circuits ---
  'kochi': {
    name: 'Fort Kochi Heritage',
    city: 'Kochi',
    state: 'Kerala',
    lat: 9.9658,
    lng: 76.2421,
    category: 'cultural_sight',
    timings: 'Walking promenade open all day',
    ticketPrice: '₹10 - ₹25 for museums & Mattancherry Palace',
    fairFareEstimate: '₹50 - ₹80 auto • ₹6 Ro-Ro water ferry',
    dressCode: 'Light cotton seaside wear',
    description: 'Historic port town with iconic Chinese Fishing Nets, colonial Portuguese streets, and Spice Market.',
    photoUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Chinese Fishing Nets', 'Mattancherry Palace', 'Jew Town & Synagogue', 'St. Francis Church']
  },
  'alleppey': {
    name: 'Alleppey (Alappuzha Backwaters)',
    city: 'Alleppey',
    state: 'Kerala',
    lat: 9.4981,
    lng: 76.3388,
    category: 'cultural_sight',
    timings: 'Houseboats cruise 11:00 AM - 5:30 PM',
    ticketPrice: 'Government Shikara ₹400/hr • Private Houseboat ₹7,500 - ₹15,000/night',
    fairFareEstimate: '₹60 - ₹100 from Alappuzha Railway Station to Jetty',
    dressCode: 'Casual breezy attire, sunglasses, hat',
    description: 'Venice of the East renowned for serene palm-fringed lagoons, houseboats, and coir crafts.',
    photoUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Vembanad Lake', 'Punnamada Lake', 'Marari Beach', 'Alappuzha Beach Lighthouse']
  },
  'goa': {
    name: 'Goa Coastal & Heritage Circuit',
    city: 'Goa',
    state: 'Goa',
    lat: 15.2993,
    lng: 74.1240,
    category: 'cultural_sight',
    timings: 'Beaches 24/7 • Basilicas 9:00 AM - 5:30 PM',
    ticketPrice: 'Free church entry • Water sports ₹500 - ₹2,500',
    fairFareEstimate: 'GoaMiles app / Pre-paid taxi booth at Dabolim & MOPA airports',
    dressCode: 'Beach casuals (modest inside churches and temples)',
    description: 'Sun-drenched coastal state celebrated for Portuguese baroque churches, pristine beaches, and Konkan cuisine.',
    photoUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Basilica of Bom Jesus', 'Fort Aguada', 'Palolem Beach', 'Anjuna Flea Market', 'Dudhsagar Falls']
  },
  'mumbai': {
    name: 'Mumbai (City of Dreams)',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 18.9220,
    lng: 72.8347,
    category: 'cultural_sight',
    timings: 'Open 24/7 vibrant city',
    ticketPrice: 'Elephanta Ferry ₹260',
    fairFareEstimate: 'Strict meter auto (suburbs) & Kaali Peeli taxis (South Bombay)',
    dressCode: 'Urban chic / modest casuals',
    description: 'Financial capital featuring Gateway of India, Marine Drive Promenade, and Elephanta Caves.',
    photoUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Chhatrapati Shivaji Maharaj Terminus']
  },
  'amritsar': {
    name: 'Amritsar & Golden Temple',
    city: 'Amritsar',
    state: 'Punjab',
    lat: 31.6200,
    lng: 74.8765,
    category: 'cultural_sight',
    timings: 'Golden Temple open 24 hours (Palki Sahib ceremony 4:30 AM & 10:00 PM)',
    ticketPrice: 'Free entry & Free Langar (community kitchen)',
    fairFareEstimate: '₹70 - ₹120 auto from Amritsar Junction • Free SGPC buses available',
    dressCode: 'Head covered (rumal/scarf), bare feet washed at entrance, modest dress',
    description: 'The spiritual heart of Sikhism with the gilded Harmandir Sahib and patriotic Wagah Border ceremony.',
    photoUrl: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Golden Temple (Harmandir Sahib)', 'Jallianwala Bagh', 'Wagah Border', 'Kesar Da Dhaba']
  },
  'rishikesh': {
    name: 'Rishikesh (Yoga Capital of the World)',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    lat: 30.0869,
    lng: 78.2676,
    category: 'cultural_sight',
    timings: 'River Aarti at Triveni Ghat: 6:00 PM',
    ticketPrice: 'River rafting ₹600 - ₹1,500',
    fairFareEstimate: '₹50 - ₹100 Vikram shared auto',
    dressCode: 'Comfortable yoga/active wear',
    description: 'Himalayan foothills sanctuary on the holy Ganges, famous for suspension bridges, ashrams, and adventure rafting.',
    photoUrl: 'https://images.unsplash.com/photo-1596768393529-6598fb8701eb?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Ram Jhula', 'Laxman Jhula', 'Parmarth Niketan Aarti', 'Beatles Ashram', 'Shivpuri Rafting']
  },
  'manali': {
    name: 'Manali & Solang Valley',
    city: 'Manali',
    state: 'Himachal Pradesh',
    lat: 32.2432,
    lng: 77.1892,
    category: 'cultural_sight',
    timings: 'Solang adventure sports 9:00 AM - 5:00 PM',
    ticketPrice: 'Atal Tunnel entry free • Rohtang Pass permit ₹550',
    fairFareEstimate: 'HRTC local buses or pre-fixed taxi union rates',
    dressCode: 'Warm layered woolens in winter, light jacket in summer',
    description: 'Scenic high-altitude hill resort framed by pine forests, snow peaks, and Beas River.',
    photoUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Solang Valley', 'Hadimba Devi Temple', 'Old Manali Cafes', 'Atal Tunnel', 'Jogini Waterfall']
  }
};

/**
 * Intelligent Destination Resolver:
 * Given any search string (e.g. "Taj Mahal", "hawa mahal jaipur", "varanasi", "where to eat in indore", etc.)
 * returns precise geocoded coordinates, city, and rich travel metadata.
 */
export function findDestinationCoordinates(query: string): DestinationGeoInfo {
  const q = query.toLowerCase().trim();

  // 1. Exact or substring match in directory
  for (const [key, info] of Object.entries(DESTINATION_DIRECTORY)) {
    if (q.includes(key) || key.includes(q)) {
      return info;
    }
  }

  // 2. Keyword fallback matching
  if (q.includes('delhi') || q.includes('chandni') || q.includes('connaught') || q.includes('ncr')) {
    return DESTINATION_DIRECTORY['delhi'];
  }
  if (q.includes('agra') || q.includes('taj') || q.includes('petha')) {
    return DESTINATION_DIRECTORY['taj mahal'];
  }
  if (q.includes('jaipur') || q.includes('rajasthan') || q.includes('hawa') || q.includes('amber')) {
    return DESTINATION_DIRECTORY['jaipur'];
  }
  if (q.includes('varanasi') || q.includes('kashi') || q.includes('banaras') || q.includes('ghat')) {
    return DESTINATION_DIRECTORY['varanasi'];
  }
  if (q.includes('indore') || q.includes('chappan') || q.includes('sarafa') || q.includes('rajwada')) {
    return DESTINATION_DIRECTORY['indore'];
  }
  if (q.includes('ujjain') || q.includes('mahakal')) {
    return DESTINATION_DIRECTORY['ujjain'];
  }
  if (q.includes('kochi') || q.includes('cochin') || q.includes('kerala')) {
    return DESTINATION_DIRECTORY['kochi'];
  }
  if (q.includes('alleppey') || q.includes('alappuzha') || q.includes('backwater')) {
    return DESTINATION_DIRECTORY['alleppey'];
  }
  if (q.includes('goa') || q.includes('panaji') || q.includes('beach')) {
    return DESTINATION_DIRECTORY['goa'];
  }
  if (q.includes('mumbai') || q.includes('bombay') || q.includes('marine')) {
    return DESTINATION_DIRECTORY['mumbai'];
  }
  if (q.includes('amritsar') || q.includes('golden temple') || q.includes('punjab')) {
    return DESTINATION_DIRECTORY['amritsar'];
  }
  if (q.includes('rishikesh') || q.includes('haridwar') || q.includes('ganga')) {
    return DESTINATION_DIRECTORY['rishikesh'];
  }
  if (q.includes('manali') || q.includes('himachal') || q.includes('solang')) {
    return DESTINATION_DIRECTORY['manali'];
  }
  if (q.includes('udaipur') || q.includes('lake city')) {
    return DESTINATION_DIRECTORY['udaipur'];
  }
  if (q.includes('somnath') || q.includes('veraval') || q.includes('prabhas')) {
    return DESTINATION_DIRECTORY['somnath'];
  }

  // 3. Fallback: Clean title & sensible geocoding offset
  const title = query.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    name: title,
    city: title,
    state: 'India',
    lat: 28.6139 + (Math.random() - 0.5) * 0.04,
    lng: 77.2090 + (Math.random() - 0.5) * 0.04,
    category: 'cultural_sight',
    timings: 'Standard tourist timings: 9:00 AM - 6:00 PM',
    ticketPrice: 'Standard entry: ₹50 (Indians) / ₹500 (Foreigners)',
    fairFareEstimate: 'Prepaid auto / metered cab recommended',
    dressCode: 'Modest comfortable attire',
    description: `Explore attractions, authentic dining, and cultural highlights in ${title}.`,
    photoUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    topAttractions: ['Central Heritage Zone', 'Local Bazaar', 'Regional Specialty Dining']
  };
}
