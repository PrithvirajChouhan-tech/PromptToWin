import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Sparkles, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  ExternalLink, 
  Plus, 
  Check, 
  Search, 
  SlidersHorizontal, 
  AlertCircle, 
  Train, 
  Utensils, 
  Landmark, 
  ShoppingBag, 
  PhoneCall, 
  X,
  LocateFixed,
  Radio,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { ItineraryItem, ItineraryCategory, Trip } from '../types/travel';

interface SurroundingScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip: Trip;
  onAddStopToDay: (item: Omit<ItineraryItem, 'id'>) => void;
  userCoords: { lat: number; lng: number } | null;
  onUpdateUserCoords: (coords: { lat: number; lng: number; locationName: string }) => void;
  currentLocationName: string;
}

// Curated POIs with real GPS coordinates across Delhi, Agra, Jaipur, Kochi, Varanasi, and Indore circuits
interface SurroundingPOI {
  id: string;
  name: string;
  category: 'cultural_sight' | 'culinary' | 'transit' | 'cultural_buy' | 'police_emergency';
  city: string;
  lat: number;
  lng: number;
  address: string;
  badge: string;
  imageUrl: string;
  highlight: string;
  costEstimate: string;
  fairPriceVerified: boolean;
  openStatus: string;
  actionTip: string;
  emergencyPhone?: string;
}

const SURROUNDING_DATABASE: SurroundingPOI[] = [
  // Delhi
  {
    id: 'poi-del-1',
    name: 'Red Fort (Lal Qila) & Lahori Gate',
    category: 'cultural_sight',
    city: 'Delhi',
    lat: 28.6562,
    lng: 77.2410,
    address: 'Netaji Subhash Marg, Chandni Chowk, Delhi 110006',
    badge: 'UNESCO World Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    highlight: '17th-century Mughal red sandstone citadel built by Emperor Shah Jahan.',
    costEstimate: '₹50 (Indian) / ₹600 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Open • 09:30 AM – 04:30 PM (Closed Mondays)',
    actionTip: 'Book tickets online at asi.payumoney.com to skip the 45-minute queue.'
  },
  {
    id: 'poi-del-2',
    name: 'Chandni Chowk Metro Station (Gate 5)',
    category: 'transit',
    city: 'Delhi',
    lat: 28.6580,
    lng: 77.2300,
    address: 'Yellow Line, Chandni Chowk, Delhi',
    badge: 'DMRC Rapid Transit',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    highlight: 'Direct air-conditioned link to New Delhi Railway Station (4 min) and Connaught Place (8 min).',
    costEstimate: '₹20 – ₹40 token',
    fairPriceVerified: true,
    openStatus: 'Active • Trains every 3 min',
    actionTip: 'Use Gate 5 for direct pedestrian access into Chandni Chowk main heritage market.'
  },
  {
    id: 'poi-del-3',
    name: 'Pt. Gaya Prasad Shiv Charan Paranthe',
    category: 'culinary',
    city: 'Delhi',
    lat: 28.6564,
    lng: 77.2312,
    address: 'Shop 34, Gali Paranthe Wali, Chandni Chowk',
    badge: 'Heritage Since 1872',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    highlight: 'Pure desi-ghee fried paranthas stuffed with crushed cashews, khoya, or spicy mint potatoes.',
    costEstimate: '₹120 – ₹180 per plate (includes 3 free sabzis)',
    fairPriceVerified: true,
    openStatus: 'Open • 09:00 AM – 11:00 PM',
    actionTip: 'No bottled drinks sold inside; pair with their fresh salted lassi.'
  },
  {
    id: 'poi-del-4',
    name: 'Tourist Police Assistance Booth (Kotwali)',
    category: 'police_emergency',
    city: 'Delhi',
    lat: 28.6570,
    lng: 77.2325,
    address: 'Opposite Gurdwara Sis Ganj Sahib, Chandni Chowk',
    badge: 'Delhi Police 24x7 Help',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    highlight: 'Stationed officers fluent in English to assist tourists with tout harassment, lost items, and pre-paid rates.',
    costEstimate: 'Free Public Service',
    fairPriceVerified: true,
    openStatus: 'Staffed 24 Hours',
    actionTip: 'Report auto-drivers refusing meter here for instant mediation.',
    emergencyPhone: '112'
  },
  {
    id: 'poi-del-5',
    name: 'Khari Baoli Government Co-op Spice Lane',
    category: 'cultural_buy',
    city: 'Delhi',
    lat: 28.6582,
    lng: 77.2248,
    address: 'Near Fatehpuri Masjid, Western End of Chandni Chowk',
    badge: 'Asia Largest Spice Hub',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    highlight: 'Wholesale-rate vacuum-sealed green cardamom, Kashmiri Mogra saffron, and wild forest cloves.',
    costEstimate: '₹350 – ₹1,200 per 100g',
    fairPriceVerified: true,
    openStatus: 'Open • 10:00 AM – 08:00 PM (Closed Sundays)',
    actionTip: 'Ask for export-grade Grade 8mm+ pods; avoid street touts outside.'
  },
  {
    id: 'poi-del-6',
    name: 'Jama Masjid & Matia Mahal Food Lane',
    category: 'culinary',
    city: 'Delhi',
    lat: 28.6507,
    lng: 77.2334,
    address: 'Opposite Gate 1, Jama Masjid, Old Delhi 110006',
    badge: 'Legendary Mughlai Strip',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    highlight: 'World-renowned kebabs, mutton stew, shahi tukda, and butter chicken at historic eateries since 1913.',
    costEstimate: '₹200 – ₹450 per meal',
    fairPriceVerified: true,
    openStatus: 'Open • 12:00 PM – 11:30 PM',
    actionTip: 'Try the legendary seekh kebabs at Babu Bhai Kabab corner or Karim’s main courtyard.'
  },
  {
    id: 'poi-del-7',
    name: 'Gurdwara Sis Ganj Sahib & Community Langar',
    category: 'cultural_sight',
    city: 'Delhi',
    lat: 28.6565,
    lng: 77.2323,
    address: 'Chandni Chowk Main Rd, Delhi 110006',
    badge: 'Historic Sikh Sanctuary',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    highlight: '1783 gold-domed shrine commemorating Guru Tegh Bahadur; 24-hour community kitchen serving all free of cost.',
    costEstimate: 'Free entry & community meal',
    fairPriceVerified: true,
    openStatus: 'Open 24 Hours Daily',
    actionTip: 'Headscarves are provided free at the shoe depository entrance.'
  },
  {
    id: 'poi-del-8',
    name: 'New Delhi Railway Station & Airport Express Metro',
    category: 'transit',
    city: 'Delhi',
    lat: 28.6430,
    lng: 77.2195,
    address: 'Ajmeri Gate / Paharganj, New Delhi',
    badge: 'Interstate Transport Hub',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    highlight: 'Connect to Orange Line Airport Express (reaching IGI Terminal 3 in 19 min) and Vande Bharat trains.',
    costEstimate: '₹60 Airport Express token',
    fairPriceVerified: true,
    openStatus: 'Trains 04:45 AM – 11:30 PM',
    actionTip: 'Use the dedicated skywalk bridge connecting Yellow Line to Ajmeri Gate.'
  },

  // Agra
  {
    id: 'poi-agr-1',
    name: 'Taj Mahal (East Gate & VIP Ticket Pavilion)',
    category: 'cultural_sight',
    city: 'Agra',
    lat: 27.1751,
    lng: 78.0421,
    address: 'Dharmapuri, Forest Colony, Tajganj, Agra 282001',
    badge: 'UNESCO Wonder of the World',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    highlight: 'Ivory-white marble mausoleum on the southern bank of the Yamuna River.',
    costEstimate: '₹50 (Indian) / ₹1,100 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Sunrise to Sunset (Closed Fridays)',
    actionTip: 'Foreign tickets include complimentary shoe covers, 500ml water, and golf-cart shuttle from parking.'
  },
  {
    id: 'poi-agr-2',
    name: 'Tourist Police Station Tajganj',
    category: 'police_emergency',
    city: 'Agra',
    lat: 27.1685,
    lng: 78.0435,
    address: 'Near Shilpgram Complex, Taj East Gate Road, Agra',
    badge: 'UP Tourist Police Special Unit',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    highlight: 'Dedicated squad enforcing anti-lapka (anti-tout) regulations around the Taj monument perimeter.',
    costEstimate: 'Free Public Service',
    fairPriceVerified: true,
    openStatus: 'Active 24x7',
    actionTip: 'Call or visit directly if pressured by unbadged guides claiming official entry.',
    emergencyPhone: '1363'
  },
  {
    id: 'poi-agr-3',
    name: 'Panchhi Petha Certified Heritage Confectioner',
    category: 'culinary',
    city: 'Agra',
    lat: 27.1642,
    lng: 78.0350,
    address: 'Fatehabad Road, Near Purani Mandi Crossing, Agra',
    badge: 'GI Tag Delicacy',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    highlight: 'Ash-gourd translucent sweet steeped in kewra essence, kesar saffron, or chocolate.',
    costEstimate: '₹140 – ₹320 per 500g box',
    fairPriceVerified: true,
    openStatus: 'Open • 08:30 AM – 10:30 PM',
    actionTip: 'Verify the green holographic seal on the box to guarantee genuine Panchhi craftsmanship.'
  },
  {
    id: 'poi-agr-4',
    name: 'Agra Cantt Railway Station (Platform 1 Vande Bharat)',
    category: 'transit',
    city: 'Agra',
    lat: 27.1574,
    lng: 77.9912,
    address: 'Railway Station Road, Agra Cantt',
    badge: 'High-Speed Rail Gateway',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    highlight: 'Ultra-modern terminal for Vande Bharat 20172 / 20171 direct to Delhi (99 mins) and Gwalior.',
    costEstimate: 'Executive ₹1,250 / Chair ₹650',
    fairPriceVerified: true,
    openStatus: '24 Hours Operational',
    actionTip: 'Pre-paid taxi counter is situated outside Exit Gate 1 (fixed police regulated rates).'
  },
  {
    id: 'poi-agr-5',
    name: 'Agra Fort & Amar Singh Royal Gate',
    category: 'cultural_sight',
    city: 'Agra',
    lat: 27.1795,
    lng: 78.0211,
    address: 'Agra Fort, Rakabganj, Agra 282003',
    badge: 'UNESCO World Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    highlight: 'Mighty red sandstone fortress where Shah Jahan was confined overlooking the Taj Mahal.',
    costEstimate: '₹50 (Indian) / ₹650 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Sunrise to Sunset daily',
    actionTip: 'Show your same-day Taj Mahal entry ticket to get a discount on entry.'
  },
  {
    id: 'poi-agr-6',
    name: 'Mehtab Bagh Moonlight Riverfront Garden',
    category: 'cultural_sight',
    city: 'Agra',
    lat: 27.1800,
    lng: 78.0420,
    address: 'Opposite Taj Mahal across Yamuna, Nagla Devjit, Agra',
    badge: 'Sunset Panoramic Viewpoint',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    highlight: 'Charbagh Mughal garden aligned directly across the river for breathtaking sunset photos without crowds.',
    costEstimate: '₹25 (Indian) / ₹300 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Open • 06:00 AM – 06:00 PM',
    actionTip: 'Arrive 45 minutes before sunset for the golden reflection on the marble dome.'
  },

  // Jaipur
  {
    id: 'poi-jai-1',
    name: 'Hawa Mahal (Palace of Winds)',
    category: 'cultural_sight',
    city: 'Jaipur',
    lat: 26.9239,
    lng: 75.8267,
    address: 'Hawa Mahal Rd, Badi Choupad, Pink City, Jaipur 302002',
    badge: 'Iconic Rajput Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1603288940300-4b9985ac3340?auto=format&fit=crop&w=800&q=80',
    highlight: 'Five-tier pink sandstone palace with 953 honeycomb windows designed for royal breezes.',
    costEstimate: '₹50 (Indian) / ₹200 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Open • 09:00 AM – 05:00 PM',
    actionTip: 'Best frontal view photo is from the terrace of Wind View Cafe directly opposite.'
  },
  {
    id: 'poi-jai-2',
    name: 'LMB (Laxmi Mishthan Bhandar)',
    category: 'culinary',
    city: 'Jaipur',
    lat: 26.9205,
    lng: 75.8276,
    address: 'Johari Bazaar, Pink City, Jaipur',
    badge: 'Royal Kitchen Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    highlight: 'Renowned for pure ghee Dal Baati Churma, Ker Sangri desert beans, and fresh Mawa Ghewar.',
    costEstimate: '₹600 – ₹900 per person',
    fairPriceVerified: true,
    openStatus: 'Open • 08:00 AM – 10:30 PM',
    actionTip: 'Order the Special Royal Thali for an authentic multi-course Marwari experience.'
  },
  {
    id: 'poi-jai-3',
    name: 'Badi Chaupar Metro Station (Pink Line)',
    category: 'transit',
    city: 'Jaipur',
    lat: 26.9242,
    lng: 75.8278,
    address: 'Badi Chaupar Underground Concourse, Jaipur',
    badge: 'Underground Heritage Line',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    highlight: 'Connects the historic Walled Pink City directly to Jaipur Railway Junction and Mansarovar.',
    costEstimate: '₹12 – ₹25 per trip',
    fairPriceVerified: true,
    openStatus: 'Active • 06:20 AM – 09:50 PM',
    actionTip: 'Check out the subterranean mini-museum displaying 18th-century stepwell relics discovered during digging.'
  },
  {
    id: 'poi-jai-4',
    name: 'Kripal Kumbh GI-Certified Blue Pottery Atelier',
    category: 'cultural_buy',
    city: 'Jaipur',
    lat: 26.9312,
    lng: 75.7925,
    address: 'B-18, Shiv Marg, Bani Park, Jaipur',
    badge: 'Padma Shri Artisan Studio',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    highlight: 'Authentic lead-free quartz glaze ceramics with traditional floral and cobalt motifs.',
    costEstimate: '₹400 – ₹3,500',
    fairPriceVerified: true,
    openStatus: 'Open • 10:00 AM – 06:00 PM',
    actionTip: 'They provide professional bubble wrap and international door-to-door courier services.'
  },
  {
    id: 'poi-jai-5',
    name: 'City Palace & Chandra Mahal Museum',
    category: 'cultural_sight',
    city: 'Jaipur',
    lat: 26.9258,
    lng: 75.8236,
    address: 'Tulsi Marg, Gangori Bazaar, J.D.A. Market, Jaipur',
    badge: 'Living Royal Residence',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    highlight: 'Stunning fusion of Rajasthani and Mughal architecture featuring the famed peacock courtyards.',
    costEstimate: '₹300 (Indian) / ₹700 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Open • 09:30 AM – 05:00 PM',
    actionTip: 'Photograph the four seasonal gates representing the four Hindu gods in the Pritam Niwas Chowk.'
  },
  {
    id: 'poi-jai-6',
    name: 'Rawat Mishthan Bhandar (Original Pyaaz Kachori)',
    category: 'culinary',
    city: 'Jaipur',
    lat: 26.9205,
    lng: 75.7980,
    address: 'Station Road, Sindhi Camp, Jaipur',
    badge: 'Celebrated Culinary Landmark',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    highlight: 'Flaky golden kachoris stuffed with spiced caramelized onions, hing, and crushed coriander seeds.',
    costEstimate: '₹50 – ₹100 per person',
    fairPriceVerified: true,
    openStatus: 'Open • 06:00 AM – 10:30 PM',
    actionTip: 'Ask for them hot out of the kadai with their tangy tamarind chutney.'
  },
  {
    id: 'poi-jai-7',
    name: 'Pink City Tourist Police Desk (Badi Chaupar)',
    category: 'police_emergency',
    city: 'Jaipur',
    lat: 26.9230,
    lng: 75.8240,
    address: 'Near Tripolia Gate, Badi Chaupar, Jaipur',
    badge: 'Rajasthan Tourist Assistance',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    highlight: 'On-ground tourist assistance squad helping travelers verify government approved gemstone shops.',
    costEstimate: 'Free Public Service',
    fairPriceVerified: true,
    openStatus: 'Active 24 Hours',
    actionTip: 'Always verify jewel certification stamps before buying expensive emeralds or rubies.',
    emergencyPhone: '112'
  },

  // Kochi
  {
    id: 'poi-koc-1',
    name: 'Fort Kochi Chinese Fishing Nets & Promenade',
    category: 'cultural_sight',
    city: 'Kochi',
    lat: 9.9675,
    lng: 76.2427,
    address: 'River Road, Fort Kochi, Kochi 682001',
    badge: 'Living Maritime Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    highlight: 'Cantilevered shore-operated nets silhouetted against sunset on the Arabian Sea.',
    costEstimate: 'Free viewing • Optional ₹50 tip to pull nets',
    fairPriceVerified: true,
    openStatus: 'Active at dawn and sunset',
    actionTip: 'Walk along the Vasco da Gama Square promenade for cool sea breezes and spice stalls.'
  },
  {
    id: 'poi-koc-2',
    name: 'Kochi Electric Water Metro (Fort Kochi Terminal)',
    category: 'transit',
    city: 'Kochi',
    lat: 9.9680,
    lng: 76.2450,
    address: 'Water Metro Jetty, Fort Kochi',
    badge: 'Eco-Friendly Electric Ferry',
    imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    highlight: 'Air-conditioned battery catamarans crossing to High Court and Vypin Island in 15 minutes.',
    costEstimate: '₹20 – ₹40 token',
    fairPriceVerified: true,
    openStatus: 'Boats every 15 minutes',
    actionTip: 'Skip road traffic across bridges; stunning backwater panoramic views included.'
  },
  {
    id: 'poi-koc-3',
    name: 'Mattancherry Dutch Palace & Jewish Synagogue',
    category: 'cultural_sight',
    city: 'Kochi',
    lat: 9.9580,
    lng: 76.2590,
    address: 'Synagogue Lane, Jew Town, Mattancherry, Kochi',
    badge: '16th Century Spice Trade Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    highlight: 'Hand-painted Chinese blue willow tiles, Belgian glass chandeliers, and Ramayana temple murals.',
    costEstimate: '₹10 (Palace) / ₹10 (Synagogue)',
    fairPriceVerified: true,
    openStatus: 'Open • 10:00 AM – 05:00 PM (Closed Saturdays)',
    actionTip: 'Modest dress required; remove footwear at the courtyard gate.'
  },
  {
    id: 'poi-koc-4',
    name: 'Kashi Art Cafe & Fresh Malabar Roast',
    category: 'culinary',
    city: 'Kochi',
    lat: 9.9660,
    lng: 76.2420,
    address: 'Burgher St, Fort Kochi, Kochi 682001',
    badge: 'Artisanal Cafe & Gallery',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    highlight: 'Open courtyard cafe surrounded by modern sculptures serving chocolate pie and single-origin coffee.',
    costEstimate: '₹250 – ₹500 per person',
    fairPriceVerified: true,
    openStatus: 'Open • 08:30 AM – 10:00 PM',
    actionTip: 'Try their grilled fish with organic salad and house-made sour dough.'
  },
  {
    id: 'poi-koc-5',
    name: 'Jew Town Spice Mart & Certified Kerala Handlooms',
    category: 'cultural_buy',
    city: 'Kochi',
    lat: 9.9575,
    lng: 76.2595,
    address: 'Jew Town Road, Mattancherry, Kochi',
    badge: 'GI Spice & Kasavu Silks',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    highlight: 'Authentic Tellicherry black peppercorns, Wayanad cinnamon bark, and Kasavu gold-bordered handlooms.',
    costEstimate: '₹200 – ₹1,800',
    fairPriceVerified: true,
    openStatus: 'Open • 10:00 AM – 07:30 PM',
    actionTip: 'Look for the Spices Board of India certification mark on packed spice containers.'
  },

  // Varanasi
  {
    id: 'poi-var-1',
    name: 'Dashashwamedh Ghat & Evening Ganga Aarti',
    category: 'cultural_sight',
    city: 'Varanasi',
    lat: 25.3076,
    lng: 83.0104,
    address: 'Dashashwamedh Ghat Road, Godowlia, Varanasi 221001',
    badge: 'Spiritual Epicenter',
    imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
    highlight: 'Seven priests chanting Vedic hymns with multi-tiered flaming brass lamps at dusk.',
    costEstimate: 'Free to attend from stone ghat / ₹150–₹300 boat seat',
    fairPriceVerified: true,
    openStatus: 'Aarti commences at 06:30 PM sharp',
    actionTip: 'Arrive at 05:30 PM to secure a front row position on the stone ghat steps.'
  },
  {
    id: 'poi-var-2',
    name: 'Ram Bhandar Dawn Kachori & Jalebi',
    category: 'culinary',
    city: 'Varanasi',
    lat: 25.3120,
    lng: 83.0110,
    address: 'Thatheri Bazaar, Chowk, Varanasi',
    badge: '120-Year Morning Ritual',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    highlight: 'Crispy asafoetida (hing) kachoris served on leaf platters with spicy pumpkin curry and hot jalebis.',
    costEstimate: '₹60 – ₹100 per person',
    fairPriceVerified: true,
    openStatus: 'Morning only: 06:30 AM – 10:30 AM',
    actionTip: 'Go early; their fresh morning batch is often sold out by 10:00 AM.'
  },
  {
    id: 'poi-var-3',
    name: 'Kashi Vishwanath Corridor & Golden Temple',
    category: 'cultural_sight',
    city: 'Varanasi',
    lat: 25.3109,
    lng: 83.0107,
    address: 'Vishwanath Gali, Lahori Tola, Varanasi 221001',
    badge: 'Sacred Jyotirlinga',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    highlight: 'Grand 50-foot wide riverside corridor connecting Ganga river ghats directly to the ancient golden spire shrine.',
    costEstimate: 'Free General Entry (Sugam Darshan ₹300)',
    fairPriceVerified: true,
    openStatus: 'Open • 03:00 AM – 11:00 PM',
    actionTip: 'Electronic gadgets and leather items are stored in secure electronic lockers at Gate 4.'
  },
  {
    id: 'poi-var-4',
    name: 'Assi Ghat Morning Subah-e-Banaras',
    category: 'cultural_sight',
    city: 'Varanasi',
    lat: 25.2890,
    lng: 83.0060,
    address: 'Assi Ghat, Shivala, Varanasi',
    badge: 'Sunrise Music & Yoga',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    highlight: 'Classical shehnai and morning raga concerts followed by community yoga as the sun rises over the river.',
    costEstimate: 'Free Public Event',
    fairPriceVerified: true,
    openStatus: 'Daily 05:00 AM – 07:00 AM',
    actionTip: 'Finish your morning with lemon tea at the famous Pizzeria Vaatika cafe right on the ghat.'
  },
  {
    id: 'poi-var-5',
    name: 'Godowlia Pre-Paid E-Rickshaw & Transit Hub',
    category: 'transit',
    city: 'Varanasi',
    lat: 25.3090,
    lng: 83.0070,
    address: 'Godowlia Crossing, Varanasi',
    badge: 'Police Regulated Transit',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    highlight: 'Clean battery e-rickshaws operating at fixed traffic police tariff to Cantt Railway Station and BHU.',
    costEstimate: '₹20 – ₹50 shared / ₹100 private',
    fairPriceVerified: true,
    openStatus: 'Continuous 24 Hours',
    actionTip: 'Vehicular traffic is pedestrian-only towards Dashashwamedh Ghat from 04:00 PM onwards.'
  },
  {
    id: 'poi-var-6',
    name: 'Varanasi Handloom Weavers Silk Cooperative',
    category: 'cultural_buy',
    city: 'Varanasi',
    lat: 25.3140,
    lng: 83.0130,
    address: 'Kunj Gali, Chowk Precinct, Varanasi',
    badge: 'GI Certified Zari Silk',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    highlight: 'Buy directly from master pit-loom weavers; certified pure mulberry silk with gold and silver zari brocade.',
    costEstimate: '₹2,500 – ₹18,000',
    fairPriceVerified: true,
    openStatus: 'Open • 11:00 AM – 08:00 PM',
    actionTip: 'Request a burn test or check the Silk Mark Organization hologram label on the pallu.'
  },
  {
    id: 'poi-var-7',
    name: 'Tourist Police Help Desk (Godowlia Chowk)',
    category: 'police_emergency',
    city: 'Varanasi',
    lat: 25.3085,
    lng: 83.0080,
    address: 'Police Chowki, Godowlia, Varanasi',
    badge: 'UP Tourist Helpline',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    highlight: 'Instant support for fixed boat ride rates, boatman verification, and emergency medical assistance.',
    costEstimate: 'Free Public Service',
    fairPriceVerified: true,
    openStatus: 'Active 24x7',
    actionTip: 'Check the official District Magistrate boat tariff board displayed outside the booth.',
    emergencyPhone: '112'
  },

  // Indore
  {
    id: 'poi-ind-1',
    name: 'Rajwada Palace & Ahilyabai Courtyard',
    category: 'cultural_sight',
    city: 'Indore',
    lat: 22.7186,
    lng: 75.8553,
    address: 'Rajwada Chowk, MG Road, Indore 452002',
    badge: '18th-Century Holkar Dynasty',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    highlight: 'Majestic 7-story palace featuring Maratha-French architecture, wooden balconies, and evening sound & light show.',
    costEstimate: '₹20 (Indian) / ₹250 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Open • 10:00 AM – 05:00 PM (Closed Mondays)',
    actionTip: 'Visit the central courtyard statue of Rani Ahilya Bai Holkar and see the illuminated facade after sunset.'
  },
  {
    id: 'poi-ind-2',
    name: 'Sarafa Night Food Bazaar',
    category: 'culinary',
    city: 'Indore',
    lat: 22.7196,
    lng: 75.8577,
    address: 'Sarafa Bazaar, Rajwada Precinct, Indore',
    badge: 'Midnight Food Street (8 PM - 2 AM)',
    imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?auto=format&fit=crop&w=800&q=80',
    highlight: 'Jewelry shops transform into a midnight feast for Bhutte Ka Kees, crispy spiced Garadu, and flying Joshi Dahi Vada.',
    costEstimate: '₹150 – ₹350 per feast',
    fairPriceVerified: true,
    openStatus: 'Active • 08:30 PM – 02:00 AM every night',
    actionTip: 'Must try Joshi Dahi Vada tossed with 5 spices, steaming Bhutte Ka Kees, and jumbo Jaleba with Rabdi.'
  },
  {
    id: 'poi-ind-3',
    name: '56 Dukan (Chappan Dukan) Clean Street Food',
    category: 'culinary',
    city: 'Indore',
    lat: 22.7244,
    lng: 75.8839,
    address: '56 Dukan, New Palasia, Indore 452001',
    badge: 'FSSAI Certified Clean Street Food Hub',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    highlight: 'Zero-plastic pedestrian culinary hub famous for Indori Poha-Jalebi, Johnny Hot Dog, and Khopra Patties.',
    costEstimate: '₹60 – ₹200 per snack',
    fairPriceVerified: true,
    openStatus: 'Open • 07:00 AM – 11:00 PM daily',
    actionTip: 'Start your morning with steamy Poha garnished with double sev and wash it down with Madhuram Shikanji.'
  },
  {
    id: 'poi-ind-4',
    name: 'Lal Bagh Palace & Royal Estate',
    category: 'cultural_sight',
    city: 'Indore',
    lat: 22.7008,
    lng: 75.8427,
    address: 'Nai Duniya, Revenue Colony, Indore',
    badge: 'Holkar Royal Heritage Estate',
    imageUrl: 'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&w=800&q=80',
    highlight: 'Grand 28-acre palace with wrought-iron gates replicated after Buckingham Palace, Italian marble, and Belgian chandeliers.',
    costEstimate: '₹30 (Indian) / ₹300 (Foreigner)',
    fairPriceVerified: true,
    openStatus: 'Open • 10:00 AM – 05:00 PM (Closed Mondays)',
    actionTip: 'Marvel at the Durbar Hall ceiling murals painted by visiting European artists.'
  },
  {
    id: 'poi-ind-5',
    name: 'Khajrana Ganesh Temple',
    category: 'cultural_sight',
    city: 'Indore',
    lat: 22.7303,
    lng: 75.9038,
    address: 'Khajrana Road, Ganeshpuri, Indore 452016',
    badge: '1735 Ahilyabai Holkar Historic Shrine',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    highlight: 'Revered shrine believed to fulfill heartfelt wishes; pristine marble courtyards with gold-tipped spires.',
    costEstimate: 'Free entry (Prasad ₹50–₹100)',
    fairPriceVerified: true,
    openStatus: 'Open • 05:00 AM – 10:30 PM daily',
    actionTip: 'Tie a mauli thread on the temple wall and make a wish, as per local tradition.'
  },
  {
    id: 'poi-ind-6',
    name: 'Indore City Bus (i-Bus) Geeta Bhawan Station',
    category: 'transit',
    city: 'Indore',
    lat: 22.7180,
    lng: 75.8810,
    address: 'AB Road BRTS Corridor, Indore',
    badge: 'Dedicated Fast Transit',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    highlight: 'Air-conditioned dedicated bus rapid transit traversing the city spine with zero traffic delays.',
    costEstimate: '₹10 – ₹25 per ride',
    fairPriceVerified: true,
    openStatus: 'Active • 06:00 AM – 11:00 PM',
    actionTip: 'Buses run every 3 minutes during morning and evening rush hours.'
  },
  {
    id: 'poi-ind-7',
    name: 'Tourist Police Help Cell (Rajwada Chowki)',
    category: 'police_emergency',
    city: 'Indore',
    lat: 22.7180,
    lng: 75.8560,
    address: 'Rajwada Circle, Indore',
    badge: 'MP Police Assistance',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    highlight: 'Tourist support desk assisting with lost properties, night market inquiries, and registered auto-rickshaw rates.',
    costEstimate: 'Free Public Service',
    fairPriceVerified: true,
    openStatus: 'Active 24 Hours',
    actionTip: 'Indore is India’s cleanest city; strict littering fines apply in pedestrian food precincts.',
    emergencyPhone: '112'
  }
];

// Haversine formula for calculating real distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const PRESET_LOCATIONS = [
  { name: 'Chandni Chowk, Old Delhi', lat: 28.6562, lng: 77.2315, city: 'Delhi' },
  { name: 'Taj East Gate, Agra', lat: 27.1751, lng: 78.0421, city: 'Agra' },
  { name: 'Hawa Mahal, Jaipur', lat: 26.9239, lng: 75.8267, city: 'Jaipur' },
  { name: 'Fort Kochi Promenade, Kerala', lat: 9.9675, lng: 76.2427, city: 'Kochi' },
  { name: 'Dashashwamedh Ghat, Varanasi', lat: 25.3076, lng: 83.0104, city: 'Varanasi' },
  { name: 'Rajwada Chowk, Indore', lat: 22.7186, lng: 75.8553, city: 'Indore' }
];

export const SurroundingScannerModal: React.FC<SurroundingScannerModalProps> = ({
  isOpen,
  onClose,
  currentTrip,
  onAddStopToDay,
  userCoords,
  onUpdateUserCoords,
  currentLocationName,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  // Proximity radius options in kilometers: default to 15km for city/local vicinity
  const [radiusFilterKm, setRadiusFilterKm] = useState<number>(15);
  // Toggle: only show nearest to my location (default true to strictly respect user's location)
  const [onlyNearest, setOnlyNearest] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  // Smart fallback coordinates based on active trip destination if userCoords is not yet granted
  const defaultCoords = useMemo(() => {
    const cityStr = (currentTrip?.days?.[0]?.city || currentTrip?.region || '').toLowerCase();
    if (cityStr.includes('agra')) return { lat: 27.1751, lng: 78.0421, name: 'Taj East Gate, Agra' };
    if (cityStr.includes('jaipur') || cityStr.includes('rajasthan')) return { lat: 26.9239, lng: 75.8267, name: 'Hawa Mahal, Jaipur' };
    if (cityStr.includes('kochi') || cityStr.includes('kerala')) return { lat: 9.9675, lng: 76.2427, name: 'Fort Kochi Promenade, Kerala' };
    if (cityStr.includes('varanasi')) return { lat: 25.3076, lng: 83.0104, name: 'Dashashwamedh Ghat, Varanasi' };
    if (cityStr.includes('indore') || cityStr.includes('ujjain')) return { lat: 22.7186, lng: 75.8553, name: 'Rajwada Chowk, Indore' };
    return { lat: 28.6562, lng: 77.2315, name: 'Chandni Chowk, Old Delhi' };
  }, [currentTrip]);

  // Effective location coordinates
  const activeLat = userCoords?.lat ?? defaultCoords.lat;
  const activeLng = userCoords?.lng ?? defaultCoords.lng;
  const activeLocationTitle = currentLocationName || defaultCoords.name;

  // Request real-time browser GPS location
  const handleRequestLiveLocation = () => {
    setIsScanning(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please select one of our verified destination hubs.');
      setIsScanning(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Determine closest known city/region
        let closestName = 'Current GPS Location';
        let minD = Infinity;
        for (const loc of PRESET_LOCATIONS) {
          const d = calculateDistanceKm(latitude, longitude, loc.lat, loc.lng);
          if (d < minD) {
            minD = d;
            if (d < 50) {
              closestName = `${loc.city} (${d < 1 ? 'Within 1 km' : `${d.toFixed(1)} km from ${loc.name}`})`;
            }
          }
        }

        onUpdateUserCoords({
          lat: latitude,
          lng: longitude,
          locationName: closestName
        });
        setIsScanning(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let errorMsg = 'Could not retrieve your live location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. You can select your current circuit hub below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Satellite location is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS request timed out. Please try selecting a hub below.';
        }
        setGeoError(errorMsg);
        setIsScanning(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // 1. Calculate real geodesic distances from current location to all POIs
  const allPOIsWithDistance = useMemo(() => {
    return SURROUNDING_DATABASE.map((poi) => {
      const distanceKm = calculateDistanceKm(activeLat, activeLng, poi.lat, poi.lng);
      return {
        ...poi,
        distanceKm,
        formattedDistance: distanceKm < 1 
          ? `${Math.round(distanceKm * 1000)} m away` 
          : `${distanceKm.toFixed(1)} km away`,
        walkTime: distanceKm < 3 
          ? `${Math.max(2, Math.round(distanceKm * 12))} min walk`
          : distanceKm < 15
            ? `${Math.round(distanceKm * 3)} min drive/metro`
            : `${(distanceKm / 40).toFixed(1)}h transit`
      };
    });
  }, [activeLat, activeLng]);

  // Determine the minimum distance to any known POI
  const minDistanceToAnyPOI = useMemo(() => {
    if (allPOIsWithDistance.length === 0) return 0;
    return Math.min(...allPOIsWithDistance.map((p) => p.distanceKm));
  }, [allPOIsWithDistance]);

  // Adaptive threshold: if the user is slightly outside a city center (e.g. 22 km away), adapt radius to include nearest cluster
  const effectiveMaxRadius = useMemo(() => {
    if (!onlyNearest) return 9999;
    if (minDistanceToAnyPOI > radiusFilterKm && minDistanceToAnyPOI < 60) {
      return Math.ceil(minDistanceToAnyPOI + 10);
    }
    return radiusFilterKm;
  }, [onlyNearest, minDistanceToAnyPOI, radiusFilterKm]);

  // Filtered and ranked POIs: STRICTLY nearest to the user's location
  const rankedPOIs = useMemo(() => {
    return allPOIsWithDistance
      .filter((poi) => {
        // Nearest location constraint: only show searches and items within surrounding vicinity of the user's location
        if (onlyNearest && poi.distanceKm > effectiveMaxRadius) {
          return false;
        }

        // Exclude emergency/police items from Explore Nearby scanner
        if (poi.category === 'police_emergency') {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all' && poi.category !== filterCategory) {
          return false;
        }

        // Search query filter: only searches within this nearest vicinity
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = poi.name.toLowerCase().includes(q);
          const matchAddress = poi.address.toLowerCase().includes(q);
          const matchHighlight = poi.highlight.toLowerCase().includes(q);
          const matchActionTip = poi.actionTip.toLowerCase().includes(q);
          const matchBadge = poi.badge.toLowerCase().includes(q);
          return matchName || matchAddress || matchHighlight || matchActionTip || matchBadge;
        }

        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm); // Closest to farthest
  }, [allPOIsWithDistance, onlyNearest, effectiveMaxRadius, filterCategory, searchQuery]);

  // Count matches that exist outside the current location radius (for helpful user guidance)
  const distantMatchesCount = useMemo(() => {
    if (!searchQuery.trim() || rankedPOIs.length > 0) return 0;
    const q = searchQuery.toLowerCase().trim();
    return allPOIsWithDistance.filter((p) => 
      p.distanceKm > effectiveMaxRadius &&
      (p.name.toLowerCase().includes(q) || p.highlight.toLowerCase().includes(q) || p.badge.toLowerCase().includes(q))
    ).length;
  }, [searchQuery, rankedPOIs, allPOIsWithDistance, effectiveMaxRadius]);

  // Handler to add a discovered POI directly into current trip itinerary
  const handleAddPOIToTrip = (poi: typeof rankedPOIs[0]) => {
    let cat: ItineraryCategory = 'cultural_sight';
    if (poi.category === 'culinary') cat = 'culinary';
    else if (poi.category === 'transit') cat = 'transit';
    else if (poi.category === 'cultural_buy') cat = 'cultural_buy';
    else if (poi.category === 'police_emergency') cat = 'transit';

    onAddStopToDay({
      title: poi.name,
      category: cat,
      time: '02:00 PM',
      duration: '1h 30m',
      location: poi.address,
      city: poi.city,
      cost: poi.costEstimate.includes('Free') ? 0 : 250,
      rating: 4.9,
      reviewsCount: 320,
      imageUrl: poi.imageUrl,
      description: poi.highlight,
      touristTip: poi.actionTip,
      coordinates: { lat: poi.lat, lng: poi.lng }
    });

    setAddedItemIds((prev) => new Set([...prev, poi.id]));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#191715]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="surrounding-scanner-dialog"
        className="bg-[#FAF8F5] rounded-3xl w-full max-w-5xl h-[95dvh] sm:h-[88vh] flex flex-col shadow-2xl border border-[#E8E2D9] overflow-hidden"
      >
        
        {/* Sleek Heritage Dark Header */}
        <div className="bg-gradient-to-r from-[#191715] via-[#2A241E] to-[#191715] text-white px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#C84B31]/20 border border-[#C84B31]/40 flex items-center justify-center text-[#FFA07A] shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-serif-display tracking-wide truncate">
                  Explore Nearby
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#6EE7B7] text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Live Vicinity</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A8A096] truncate mt-0.5">
                <span className="flex items-center gap-1 text-[#FFA07A] truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activeLocationTitle}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline font-mono text-[11px] text-[#A8A096]">
                  {activeLat.toFixed(3)}°N, {activeLng.toFixed(3)}°E
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="request-live-gps-btn"
              onClick={handleRequestLiveLocation}
              disabled={isScanning}
              className="px-3.5 py-2 bg-[#C84B31] hover:bg-[#B83E26] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              title="Use GPS Coordinates"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isScanning ? 'Acquiring...' : 'Scan GPS'}</span>
            </button>
            <button
              id="close-scanner-modal-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Circuit Switcher Strip */}
        <div className="bg-[#FFFFFF] px-5 sm:px-7 py-2.5 border-b border-[#E8E2D9] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#C84B31]" />
            <span>Circuits:</span>
          </span>
          {PRESET_LOCATIONS.map((loc) => {
            const isSelected = Math.abs(loc.lat - activeLat) < 0.01 && Math.abs(loc.lng - activeLng) < 0.01;
            return (
              <button
                key={loc.name}
                onClick={() => {
                  onUpdateUserCoords({ lat: loc.lat, lng: loc.lng, locationName: loc.name });
                }}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#191715] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#5A524C] border border-[#E8E2D9] hover:border-[#191715] hover:text-[#191715]'
                }`}
              >
                {loc.city}
              </button>
            );
          })}
          {geoError && (
            <span className="text-[11px] text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded ml-auto truncate">
              {geoError}
            </span>
          )}
        </div>

        {/* Search, Categories & Radius Bar */}
        <div className="bg-[#FAF8F5] px-5 sm:px-7 py-3 border-b border-[#E8E2D9] space-y-2.5 shrink-0">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search spots near ${activeLocationTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E8E2D9] rounded-xl pl-9 pr-8 py-2 text-xs text-[#191715] placeholder-[#8C827A] focus:outline-none focus:border-[#C84B31] shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#191715] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-[#E8E2D9] self-start sm:self-auto">
              <span className="text-[10px] font-bold text-[#8C827A] px-2 uppercase tracking-wider hidden sm:inline">
                Radius:
              </span>
              {[5, 15, 30, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRadiusFilterKm(r);
                    setOnlyNearest(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    radiusFilterKm === r
                      ? 'bg-[#C84B31] text-white shadow-2xs'
                      : 'text-[#665E55] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips with Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {[
              { id: 'all', label: 'All Sights', icon: Compass },
              { id: 'cultural_sight', label: 'Monuments', icon: Landmark },
              { id: 'culinary', label: 'Street Food', icon: Utensils },
              { id: 'transit', label: 'Transit & Metro', icon: Train },
              { id: 'cultural_buy', label: 'GI Shopping', icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = filterCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#191715] text-white shadow-xs'
                      : 'bg-white text-[#665E55] border border-[#E8E2D9] hover:bg-[#F5F2EB]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#C84B31]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4">
          
          <div className="flex items-center justify-between text-xs text-[#665E55]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#191715]">
                {rankedPOIs.length} {rankedPOIs.length === 1 ? 'place' : 'places'} within {effectiveMaxRadius} km
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#166534]/10 text-[#166534] font-bold text-[10px]">
                Nearest first
              </span>
            </div>
            <span className="hidden sm:inline text-[#8C827A] text-[11px]">
              Tap "Add to Itinerary" to link to your trip
            </span>
          </div>

          {rankedPOIs.length === 0 ? (
            /* Clean Empty State */
            <div className="text-center py-16 space-y-4 bg-white rounded-3xl border border-[#E8E2D9] p-8 shadow-xs">
              <div className="w-14 h-14 rounded-3xl bg-[#FFF2EE] text-[#C84B31] flex items-center justify-center mx-auto shadow-2xs">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#191715] font-serif-display">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No spots found within this radius'}
                </h3>
                <p className="text-xs text-[#665E55] max-w-md mx-auto leading-relaxed">
                  We strictly filter stops within {effectiveMaxRadius} km of {activeLocationTitle} to give you accurate walking and auto distances.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-[#FAF8F5] border border-[#E8E2D9] hover:bg-white text-[#191715] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={() => {
                    setRadiusFilterKm(50);
                    setOnlyNearest(true);
                  }}
                  className="px-4 py-2 bg-[#C84B31] text-white font-bold text-xs rounded-xl hover:bg-[#B83E26] transition-colors cursor-pointer shadow-xs"
                >
                  Expand Radius to 50 km
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rankedPOIs.map((poi, idx) => {
                const isAdded = addedItemIds.has(poi.id);
                const isClosest = idx === 0;

                return (
                  <div
                    key={poi.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between group shadow-xs ${
                      isClosest 
                        ? 'border-[#C84B31]/60 shadow-md ring-1 ring-[#C84B31]/20' 
                        : 'border-[#E8E2D9] hover:border-[#C84B31]/50 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Media Header with Cover Image and Overlay Badges */}
                      <div className="relative h-44 w-full overflow-hidden bg-[#191715]">
                        <img 
                          src={poi.imageUrl} 
                          alt={poi.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-black flex items-center gap-1.5 shadow-md ${
                            isClosest
                              ? 'bg-[#C84B31] text-white ring-2 ring-white/40'
                              : 'bg-black/60 backdrop-blur-md text-white border border-white/20'
                          }`}>
                            <Navigation className="w-3 h-3 rotate-45 text-[#FFA07A]" />
                            <span>{poi.formattedDistance}</span>
                            <span className="text-[10px] font-sans font-normal text-white/80">
                              • {poi.walkTime}
                            </span>
                          </span>

                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#191715] shadow-xs">
                            {poi.badge}
                          </span>
                        </div>

                        {/* Bottom Overlay Info on Image */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFA07A] block">
                              {poi.city} Circuit
                            </span>
                            <h3 className="text-base font-extrabold text-white truncate font-serif-display drop-shadow-sm">
                              {poi.name}
                            </h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-[#10B981] text-white text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Verified</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Body Details */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-[#665E55] flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
                            <span className="truncate">{poi.address}</span>
                          </span>
                          <span className="font-extrabold text-[#166534] shrink-0 flex items-center gap-0.5">
                            <IndianRupee className="w-3 h-3" />
                            <span>{poi.costEstimate}</span>
                          </span>
                        </div>

                        {/* Cultural Highlight / Local Tip Box */}
                        <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC] space-y-1">
                          <p className="text-xs text-[#5A524C] leading-relaxed line-clamp-2">
                            {poi.highlight}
                          </p>
                          <div className="text-[11px] text-[#C84B31] font-semibold flex items-center gap-1 pt-0.5">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span className="truncate">Tip: {poi.actionTip}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#8C827A]">
                          <Clock className="w-3 h-3 text-[#C84B31] shrink-0" />
                          <span>{poi.openStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-[#F0ECE4] flex items-center justify-between gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${activeLat},${activeLng}&destination=${poi.lat},${poi.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#191715] text-xs font-bold rounded-xl border border-[#E8E2D9] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Directions</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#C84B31]" />
                      </a>

                      {poi.emergencyPhone ? (
                        <a
                          href={`tel:${poi.emergencyPhone}`}
                          className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call {poi.emergencyPhone}</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => handleAddPOIToTrip(poi)}
                          disabled={isAdded}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                              : 'bg-[#191715] hover:bg-[#C84B31] text-white shadow-xs'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Added to Plan</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Itinerary</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Bottom Status Bar */}
        <div className="bg-white px-5 sm:px-7 py-3 border-t border-[#E8E2D9] flex items-center justify-between text-xs text-[#665E55] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[11px] text-[#8C827A]">
              Live GPS Vicinity Scanner • Real-time distance calculation
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF8F5] hover:bg-[#E8E2D9] text-[#191715] font-bold text-xs rounded-xl transition-colors cursor-pointer border border-[#EAE5DC]"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

