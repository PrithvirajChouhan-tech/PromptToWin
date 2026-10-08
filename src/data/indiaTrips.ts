import { Trip } from '../types/travel';

export const INDIA_TRIPS: Trip[] = [
  {
    id: 'golden-triangle',
    title: 'The Royal Golden Triangle',
    destinationCountries: ['India'],
    region: 'North India (Delhi • Agra • Jaipur)',
    tagline: 'Mughal Architecture, Vande Bharat High-Speed Rail & Rajput Palaces',
    duration: '6 Days / 5 Nights',
    dateRange: '05/09/2026 – 10/09/2026',
    coverImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    baseBudget: 36500,
    travelers: [
      { name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
      { name: 'Priya N.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' }
    ],
    highlights: {
      transit: 'Vande Bharat Express & Delhi Metro Air-Conditioned Yellow Line',
      food: 'Old Delhi Street Food Trail & Rajasthani Dal Baati Churma',
      festival: 'Dilli Haat Heritage Crafts & Jaipur Deepotsav Lighting',
      shopping: 'Jaipur Blue Pottery & Authentic Sanganeri Block-Printed Silks'
    },
    days: [
      {
        dayNumber: 1,
        date: '05 Sep 2026',
        dayOfWeek: 'Saturday',
        city: 'Old & New Delhi',
        title: 'Mughal Heritage & Chandni Chowk Culinary Trail',
        weather: { temp: '29°C', condition: 'Clear Sky', icon: '☀️' },
        highlight: 'Rickshaw ride through spice markets & heritage culinary spots',
        items: [
          {
            id: 'd1-t1',
            time: '08:30 AM',
            title: 'Delhi Metro Express Transit (Yellow Line)',
            category: 'transit',
            location: 'New Delhi Metro Station -> Chandni Chowk',
            city: 'Delhi',
            duration: '25 min',
            cost: 40,
            rating: 4.8,
            reviewsCount: 3400,
            imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
            description: 'Fast, fully air-conditioned transit bypassing Delhi traffic straight into the historic walled city.',
            touristTip: 'Buy a DMRC Tourist Smart Card (₹200) for unlimited 1-day rides or use contactless UPI / WhatsApp QR ticketing.',
            transitDetails: {
              mode: 'metro',
              from: 'New Delhi Stn (Platform 2)',
              to: 'Chandni Chowk Gate 5',
              lineOrNumber: 'Yellow Line (Samaypur Badli route)',
              operator: 'Delhi Metro Rail Corporation',
              bookingTip: 'Avoid rush hours 08:30-10:00 AM on weekdays; coaches are cleanest at the front.'
            },
            coordinates: { lat: 28.6506, lng: 77.2303 }
          },
          {
            id: 'd1-c1',
            time: '09:30 AM',
            title: 'Red Fort (Lal Qila) Mughal Heritage Complex',
            category: 'cultural_sight',
            location: 'Netaji Subhash Marg, Lal Qila, Old Delhi',
            city: 'Delhi',
            duration: '2h 00m',
            cost: 500,
            rating: 4.9,
            reviewsCount: 14200,
            imageUrl: 'https://images.unsplash.com/photo-1598598795009-f80c5072e665?auto=format&fit=crop&w=800&q=80',
            description: "Magnificent 17th-century UNESCO World Heritage fortress of red sandstone constructed by Emperor Shah Jahan, showcasing the Diwan-i-Aam and royal pavilions.",
            touristTip: 'Enter via Lahori Gate; book ASI e-tickets in advance on the ASI monument portal to skip queue.',
            coordinates: { lat: 28.6562, lng: 77.2410 }
          },
          {
            id: 'd1-f1',
            time: '12:30 PM',
            title: 'Paranthe Wali Gali & Rabri Jalebi Tasting',
            category: 'culinary',
            location: 'Gali Paranthe Wali, Chandni Chowk',
            city: 'Delhi',
            duration: '1h 15m',
            cost: 450,
            rating: 4.7,
            reviewsCount: 4210,
            imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
            description: 'Century-old deep-fried stuffed flatbreads served with pumpkin sabzi, mint chutney, and banana-tamarind dip.',
            touristTip: 'Try the Khoya (sweet milk solids) and Kaju paranthas at Pt. Gaya Prasad Shiv Charan (established 1872).',
            culinaryDetails: {
              specialties: ['Rabri topped hot Jalebi', 'Aloo & Paneer Parantha', 'Nimbu Shikanji'],
              spiceLevel: 'Medium',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 28.6562, lng: 77.2315 }
          },
          {
            id: 'd1-s1',
            time: '03:30 PM',
            title: 'Khari Baoli Heritage Spices & Grade-A Saffron',
            category: 'cultural_buy',
            location: 'Khari Baoli Bazaar (Near Fatehpuri Masjid)',
            city: 'Delhi',
            duration: '1h 30m',
            cost: 1800,
            rating: 4.9,
            reviewsCount: 1540,
            imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
            description: 'Vibrant spice wholesale alley dating back to 17th century Mughal empire, offering vacuum-sealed spices ready for travel.',
            touristTip: 'Purchase authentic whole green cardamom (Grade 8mm+), Kashmiri saffron with dry stamens, and organic star anise.',
            culturalBuyDetails: {
              itemToBuy: 'Whole Spices & Grade-A Mogra Saffron',
              giTagCertified: true,
              bargainTip: 'Prices are mostly wholesale fixed; ask for vacuum-sealed tourist export packs.',
              authenticPriceRange: '₹350 - ₹1,200 per 100g'
            },
            coordinates: { lat: 28.658, lng: 77.225 }
          },
          {
            id: 'd1-fest',
            time: '06:30 PM',
            title: 'Dilli Haat Craft Bazaar & Terracotta Artisan Mela',
            category: 'festival',
            location: 'INA Market, Sri Aurobindo Marg',
            city: 'Delhi',
            duration: '2h 30m',
            cost: 200,
            rating: 4.9,
            reviewsCount: 3900,
            imageUrl: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&w=800&q=80',
            description: 'Open-air craft bazaar celebrating regional artisans with handcrafted terracotta lamps, folk dances, and cultural culinary pavilions.',
            touristTip: 'Watch master potters shaping clay oil lamps live; incredible souvenirs that directly support rural artisan cooperatives.',
            festivalDetails: {
              festivalName: 'Dilli Haat Cultural Artisan Mela',
              significance: 'Celebration of Indian rural craft traditions from all 28 states',
              dressCode: 'Comfortable semi-traditional Indian attire or smart casuals'
            },
            coordinates: { lat: 28.573, lng: 77.208 }
          }
        ]
      },
      {
        dayNumber: 2,
        date: '06 Sep 2026',
        dayOfWeek: 'Sunday',
        city: 'Delhi -> Agra',
        title: 'Vande Bharat High-Speed Train & Taj Mahal Sunset',
        weather: { temp: '30°C', condition: 'Sunny & Golden', icon: '🌤️' },
        highlight: 'Semi-high speed Vande Bharat Express & UNESCO Mughal wonder',
        items: [
          {
            id: 'd2-t1',
            time: '06:00 AM',
            title: 'Vande Bharat Express (Train No. 20172)',
            category: 'transit',
            location: 'Hazrat Nizamuddin (NZM) -> Agra Cantt (AGC)',
            city: 'Agra',
            duration: '1h 40m',
            cost: 1250,
            rating: 4.9,
            reviewsCount: 5120,
            imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
            description: "India's flagship indigenous semi-high speed train cruising smoothly at 160 km/h with panoramic sealed windows and onboard meal.",
            touristTip: 'Executive Chair Car (EC) includes hot Indian breakfast and rotating 360-degree seats.',
            transitDetails: {
              mode: 'train',
              from: 'Hazrat Nizamuddin Platform 1',
              to: 'Agra Cantt Platform 1',
              lineOrNumber: '20172 Vande Bharat Exp',
              operator: 'Indian Railways (IRCTC)',
              bookingTip: 'Book 30 days in advance on IRCTC website using the Foreign Tourist Quota (FTQ) if general is sold out.'
            },
            coordinates: { lat: 27.1574, lng: 77.9912 }
          },
          {
            id: 'd2-c1',
            time: '09:30 AM',
            title: 'Agra Fort & Diwan-i-Khas Hall of Private Audience',
            category: 'cultural_sight',
            location: 'Agra Fort Complex, Rakabganj',
            city: 'Agra',
            duration: '2h 00m',
            cost: 650,
            rating: 4.8,
            reviewsCount: 9800,
            imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            description: 'Vast 16th-century red sandstone fortress where Emperor Shah Jahan spent his final years gazing at the Taj Mahal.',
            touristTip: 'Hire an official ASI (Archaeological Survey of India) certified guide with a green badge at the Amar Singh Gate.',
            coordinates: { lat: 27.1795, lng: 78.0211 }
          },
          {
            id: 'd2-f1',
            time: '01:00 PM',
            title: 'Agra Mughlai Feast & Petha Tasting',
            category: 'culinary',
            location: 'Peshawri / Pinch of Spice, Fatehabad Road',
            city: 'Agra',
            duration: '1h 30m',
            cost: 1400,
            rating: 4.8,
            reviewsCount: 3100,
            imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
            description: 'Slow-cooked Dal Bukhara simmered for 18 hours, tender clay-oven kebabs, and authentic saffron Agra Petha sweet candy.',
            touristTip: 'Try Angoori Petha and Kesar Petha from Panchhi Petha (Sadik Bazaar branch - verify original holographic seal).',
            culinaryDetails: {
              specialties: ['Slow-simmered Dal Bukhara', 'Murgh Malai Kebab', 'Saffron Angoori Petha'],
              spiceLevel: 'Mild',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 27.162, lng: 78.038 }
          },
          {
            id: 'd2-s1',
            time: '03:30 PM',
            title: 'Pietra Dura Marble Inlay Workshop',
            category: 'cultural_buy',
            location: 'Artisans Quarter, Taj East Gate Road',
            city: 'Agra',
            duration: '1h 15m',
            cost: 3200,
            rating: 4.9,
            reviewsCount: 920,
            imageUrl: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
            description: 'Direct descendants of the craftsmen who inlaid semi-precious lapis lazuli, malachite, and mother of pearl into the Taj Mahal.',
            touristTip: 'Test authentic marble with lemon or scratch test: genuine Makrana marble will not scratch and glows when backlit with a flashlight.',
            culturalBuyDetails: {
              itemToBuy: 'Hand-carved Marble Inlay Coasters & Trinket Box',
              giTagCertified: true,
              bargainTip: 'Buy from state-recognized handicraft cooperatives with official GI certificates.',
              authenticPriceRange: '₹1,500 - ₹8,000'
            },
            coordinates: { lat: 27.172, lng: 78.046 }
          },
          {
            id: 'd2-c2',
            time: '05:00 PM',
            title: 'Taj Mahal Sunset Spectacle',
            category: 'cultural_sight',
            location: 'Dharmapuri, Forest Colony, Tajganj',
            city: 'Agra',
            duration: '2h 15m',
            cost: 1100,
            rating: 5.0,
            reviewsCount: 22000,
            imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
            description: 'Witness the iconic white marble mausoleum shift in tone from blazing gold to soft rose as dusk settles over the Yamuna River.',
            touristTip: 'Foreign tourists get a separate express security queue at the East Gate with shoe covers and bottled water included.',
            coordinates: { lat: 27.1751, lng: 78.0421 }
          }
        ]
      },
      {
        dayNumber: 3,
        date: '07 Sep 2026',
        dayOfWeek: 'Monday',
        city: 'Agra -> Jaipur',
        title: 'Stepwell of Abhaneri & Arrival in the Pink City',
        weather: { temp: '31°C', condition: 'Sunny & Warm', icon: '☀️' },
        highlight: 'Chand Baori ancient stepwell & Jaipur royal bazaar lighting',
        items: [
          {
            id: 'd3-t1',
            time: '08:00 AM',
            title: 'Private Chauffeur Transit via Abhaneri Stepwell',
            category: 'transit',
            location: 'Agra -> Abhaneri -> Jaipur Pink City',
            city: 'Jaipur',
            duration: '4h 30m',
            cost: 3800,
            rating: 4.8,
            reviewsCount: 1200,
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            description: 'Comfortable air-conditioned private vehicle passing through rural Rajasthan villages with a scenic stop at Chand Baori.',
            touristTip: 'Stop at roadside dhaba for clay-cup Chai (Kullad Chai) and freshly roasted chickpea snacks.',
            transitDetails: {
              mode: 'cab',
              from: 'Hotel in Agra',
              to: 'Jaipur Heritage Haveli',
              operator: 'Rajasthan Tourism Development Corp (RTDC) cab',
              bookingTip: 'Book state-verified drivers with fast-tag toll included.'
            },
            coordinates: { lat: 27.0075, lng: 76.6064 }
          },
          {
            id: 'd3-c1',
            time: '11:00 AM',
            title: 'Chand Baori 3,500-Step Geometry Wonder',
            category: 'cultural_sight',
            location: 'Abhaneri Village, Bandikui',
            city: 'Rajasthan',
            duration: '1h 15m',
            cost: 300,
            rating: 4.9,
            reviewsCount: 2800,
            imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
            description: 'One of the deepest and largest stepwells in the world, built in the 9th century with hypnotic mathematical symmetry.',
            touristTip: 'The lower temperature at the bottom of the well was ancient air-conditioning for royalty during scorching summers.',
            coordinates: { lat: 27.0076, lng: 76.6065 }
          },
          {
            id: 'd3-f1',
            time: '02:00 PM',
            title: 'LMB (Laxmi Mishthan Bhandar) Royal Thali',
            category: 'culinary',
            location: 'Johari Bazaar, Pink City',
            city: 'Jaipur',
            duration: '1h 30m',
            cost: 850,
            rating: 4.8,
            reviewsCount: 6500,
            imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
            description: 'Heritage dining institution operating since 1727, famed for authentic Rajasthani Dal Baati Churma and Paneer Ghewar.',
            touristTip: 'Order the Special Rajasthani Thali to sample Gatte ki Sabzi, Ker Sangri, and warm Baati dipped in pure cow ghee.',
            culinaryDetails: {
              specialties: ['Dal Baati Churma', 'Ker Sangri', 'Mawa & Malai Ghewar'],
              spiceLevel: 'Authentic Spicy',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 26.9205, lng: 75.8276 }
          },
          {
            id: 'd3-s1',
            time: '04:30 PM',
            title: 'Johari Bazaar Gems & Lac Bangles Making',
            category: 'cultural_buy',
            location: 'Johari Bazaar & Maniharon Ka Rasta',
            city: 'Jaipur',
            duration: '2h 00m',
            cost: 1500,
            rating: 4.9,
            reviewsCount: 1800,
            imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
            description: 'Centuries-old artisan lane where master craftsmen melt natural tree resin (lac) over coal embers to craft intricate bangles.',
            touristTip: 'The artisans can size the bangles directly onto your wrist using heat so they fit comfortably.',
            culturalBuyDetails: {
              itemToBuy: 'Traditional Hand-crafted Lac Bangles & Kundan Jewelry',
              giTagCertified: true,
              bargainTip: 'Gentle bargaining is welcome; standard sets start around ₹300-₹800.',
              authenticPriceRange: '₹300 - ₹2,500'
            },
            coordinates: { lat: 26.9201, lng: 75.8279 }
          }
        ]
      },
      {
        dayNumber: 4,
        date: '08 Sep 2026',
        dayOfWeek: 'Tuesday',
        city: 'Jaipur',
        title: 'Amer Fort, Hawa Mahal & Blue Pottery Studio',
        weather: { temp: '29°C', condition: 'Pleasant & Breezy', icon: '☀️' },
        highlight: 'Sheesh Mahal mirror palace & Jaipur GI-tagged turquoise pottery',
        items: [
          {
            id: 'd4-t1',
            time: '07:30 AM',
            title: 'Heritage Tuk-Tuk to Amer Fort & Maota Lake',
            category: 'transit',
            location: 'Pink City -> Amer Fort Hilltop',
            city: 'Jaipur',
            duration: '35 min',
            cost: 350,
            rating: 4.7,
            reviewsCount: 890,
            imageUrl: 'https://images.unsplash.com/photo-1555617778-02518510b9fa?auto=format&fit=crop&w=800&q=80',
            description: 'Breezy ride in a decorated green-yellow auto-rickshaw winding past Jal Mahal (Water Palace) in Man Sagar Lake.',
            touristTip: 'Negotiate the return journey wait time upfront (₹600 for round-trip with 3-hour waiting).',
            transitDetails: {
              mode: 'rickshaw',
              from: 'Badi Chaupar',
              to: 'Amer Fort Suraj Pol (Sun Gate)',
              bookingTip: 'Ask the driver to stop briefly at Jal Mahal viewpoint for early morning reflection photos.'
            },
            coordinates: { lat: 26.9855, lng: 75.8513 }
          },
          {
            id: 'd4-c1',
            time: '08:30 AM',
            title: 'Amer Fort & The Sheesh Mahal (Mirror Hall)',
            category: 'cultural_sight',
            location: 'Devisinghpura, Amer',
            city: 'Jaipur',
            duration: '2h 30m',
            cost: 550,
            rating: 4.9,
            reviewsCount: 14500,
            imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
            description: 'Magnificent Rajput stronghold overlooking rugged Aravalli hills, featuring thousands of convex Belgian glass mirrors.',
            touristTip: 'A single candle lit in the Sheesh Mahal ceiling reflects across mirrors to resemble a star-lit night sky.',
            coordinates: { lat: 26.9855, lng: 75.8513 }
          },
          {
            id: 'd4-s1',
            time: '01:30 PM',
            title: 'Kripal Kumbh Authentic Blue Pottery Atelier',
            category: 'cultural_buy',
            location: 'Bani Park / Kripal Kumbh Studio',
            city: 'Jaipur',
            duration: '1h 30m',
            cost: 2400,
            rating: 4.9,
            reviewsCount: 780,
            imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
            description: "Jaipur's world-renowned craft made without clay, using ground quartz stone, Fuller's earth, and copper oxide turquoise pigments.",
            touristTip: 'Genuine blue pottery is impervious to water, does not chip easily, and carries an official GI mark.',
            culturalBuyDetails: {
              itemToBuy: 'GI-Certified Blue Pottery Ceramic Plates, Vases & Drawer Knobs',
              giTagCertified: true,
              bargainTip: 'Atelier prices are fixed but 100% genuine; they ship internationally with safe bubble packaging.',
              authenticPriceRange: '₹400 - ₹3,500'
            },
            coordinates: { lat: 26.9312, lng: 75.7925 }
          },
          {
            id: 'd4-c2',
            time: '04:30 PM',
            title: 'Hawa Mahal (Palace of Winds) & Wind View Cafe',
            category: 'cultural_sight',
            location: 'Hawa Mahal Rd, Badi Choupad',
            city: 'Jaipur',
            duration: '1h 30m',
            cost: 200,
            rating: 4.8,
            reviewsCount: 18400,
            imageUrl: 'https://images.unsplash.com/photo-1603288940300-4b9985ac3340?auto=format&fit=crop&w=800&q=80',
            description: 'Five-story facade with 953 honeycombed jharokha windows built in 1799 so royal ladies could observe city street life unobserved.',
            touristTip: 'Cross the street to the 3rd floor terrace of Tattoo Cafe or Wind View Cafe for the classic unobstructed photo.',
            coordinates: { lat: 26.9239, lng: 75.8267 }
          },
          {
            id: 'd4-fest',
            time: '07:30 PM',
            title: 'Jaipur Walled City Bazaars & Architectural Lighting',
            category: 'festival',
            location: 'Tripolia Bazaar & Albert Hall Museum',
            city: 'Jaipur',
            duration: '2h 00m',
            cost: 0,
            rating: 5.0,
            reviewsCount: 5200,
            imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
            description: 'The pink sandstone gates and colonnaded bazaars of Jaipur come alive with warm evening illumination and vibrant night market stalls.',
            touristTip: 'Walk through Sireh Deori Bazaar and Johari Bazaar; try fresh Malai Kulfi from Pandit Kulfi near Sirah Deori.',
            festivalDetails: {
              festivalName: 'Pink City Night Bazaar & Illumination',
              significance: 'Historic nocturnal market trading tradition instituted by Maharaja Sawai Jai Singh II',
              dressCode: 'Comfortable walking shoes; carry cash for street snacks'
            },
            coordinates: { lat: 26.919, lng: 75.822 }
          }
        ]
      },
      {
        dayNumber: 5,
        date: '09 Sep 2026',
        dayOfWeek: 'Wednesday',
        city: 'Jaipur -> Delhi',
        title: 'City Palace Royal Chambers & Return Vande Bharat Express',
        weather: { temp: '30°C', condition: 'Sunny', icon: '☀️' },
        highlight: 'Chandra Mahal royal suites & seamless return high-speed transit',
        items: [
          {
            id: 'd5-c1',
            time: '09:00 AM',
            title: 'Jaipur City Palace & Pritam Niwas Chowk (Peacock Gate)',
            category: 'cultural_sight',
            location: 'Gangori Bazaar, J.D.A. Market, Pink City',
            city: 'Jaipur',
            duration: '2h 15m',
            cost: 700,
            rating: 4.9,
            reviewsCount: 11200,
            imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
            description: 'A blend of Rajasthani and Mughal architecture, housing royal costumes, carriage armory, and the famous four seasons doorway gates.',
            touristTip: 'Book the Composite Ticket which covers Jantar Mantar observatory right next door.',
            coordinates: { lat: 26.9258, lng: 75.8237 }
          },
          {
            id: 'd5-s1',
            time: '12:00 PM',
            title: 'Sanganer Block-Print Textile Workshop',
            category: 'cultural_buy',
            location: 'Sanganer Village, Southern Jaipur',
            city: 'Jaipur',
            duration: '1h 45m',
            cost: 2100,
            rating: 4.8,
            reviewsCount: 940,
            imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
            description: 'Observe master artisans hand-stamping pure cotton and silk mulmul using carved teak wood printing blocks with natural vegetable dyes.',
            touristTip: 'Try block-printing a scarf yourself at the artisan cooperative table.',
            culturalBuyDetails: {
              itemToBuy: 'GI-Tagged Sanganeri Block-Printed Bedspread & Pure Cotton Kurtas',
              giTagCertified: true,
              bargainTip: 'Cooperative prices are labeled; genuine natural dye prints will have slight beautiful imperfections.',
              authenticPriceRange: '₹600 - ₹3,200'
            },
            coordinates: { lat: 26.818, lng: 75.772 }
          },
          {
            id: 'd5-t1',
            time: '03:45 PM',
            title: 'Vande Bharat Express (Train No. 20977: Jaipur -> Delhi)',
            category: 'transit',
            location: 'Jaipur Junction (JP) -> Delhi Cantt (DEC)',
            city: 'Delhi',
            duration: '3h 40m',
            cost: 1150,
            rating: 4.9,
            reviewsCount: 3800,
            imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
            description: 'Ultra-smooth return journey across the Aravali mountain foothills with air-conditioning, USB charging, and complimentary evening tea.',
            touristTip: 'Executive Chair Car seats feature recline and audio jacks. Free Wi-Fi portal with Indian documentary content.',
            transitDetails: {
              mode: 'train',
              from: 'Jaipur Junction Platform 1',
              to: 'Delhi Cantt / New Delhi Stn',
              lineOrNumber: '20977 Ajmer-Delhi Vande Bharat',
              operator: 'Indian Railways',
              bookingTip: 'Arrive 30 minutes prior; luggage racks comfortably accommodate international check-in suitcases.'
            },
            coordinates: { lat: 26.920, lng: 75.787 }
          }
        ]
      },
      {
        dayNumber: 6,
        date: '10 Sep 2026',
        dayOfWeek: 'Thursday',
        city: 'New Delhi',
        title: "Humayun's Tomb, Qutub Minar & Craft Souvenirs Farewell",
        weather: { temp: '28°C', condition: 'Pleasant & Clear', icon: '☀️' },
        highlight: "UNESCO garden tomb inspiration for Taj Mahal & 12th century Qutub Minar",
        items: [
          {
            id: 'd6-c1',
            time: '09:00 AM',
            title: "Humayun's Tomb Garden Complex (UNESCO)",
            category: 'cultural_sight',
            location: 'Mathura Road, Nizamuddin East',
            city: 'Delhi',
            duration: '2h 00m',
            cost: 600,
            rating: 4.9,
            reviewsCount: 16800,
            imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
            description: 'Magnificent 16th-century Persian-style garden tomb with flowing water channels that directly inspired the architectural design of the Taj Mahal.',
            touristTip: 'Visit the newly opened underground museum at the entrance explaining Mughal restoration techniques.',
            coordinates: { lat: 28.5933, lng: 77.2507 }
          },
          {
            id: 'd6-c2',
            time: '12:00 PM',
            title: 'Qutub Minar & The 1,600-Year Rustless Iron Pillar',
            category: 'cultural_sight',
            location: 'Seth Sarai, Mehrauli',
            city: 'Delhi',
            duration: '1h 45m',
            cost: 600,
            rating: 4.8,
            reviewsCount: 21000,
            imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            description: 'The tallest brick minaret in the world standing at 72.5 meters, surrounded by ancient Hindu-Islamic carved sandstone colonnades.',
            touristTip: 'Inspect the 4th-century Gupta Empire iron pillar standing in the courtyard that has never rusted despite centuries of monsoon rains.',
            coordinates: { lat: 28.5244, lng: 77.1855 }
          },
          {
            id: 'd6-f1',
            time: '02:15 PM',
            title: 'Indian Accent / Cafe Lota Regional Tasting Lunch',
            category: 'culinary',
            location: 'National Crafts Museum, Bhairon Marg, Pragati Maidan',
            city: 'Delhi',
            duration: '1h 30m',
            cost: 950,
            rating: 4.9,
            reviewsCount: 4700,
            imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            description: 'Contemporary regional Indian lunch featuring Palak Patta Chaat, Sabudana Vada, and Filter Coffee set inside an open-air artisanal village museum.',
            touristTip: 'Stroll through the adjoining National Crafts Museum courtyard afterwards to see live tribal folk painters at work.',
            culinaryDetails: {
              specialties: ['Palak Patta Chaat', 'Kathal Biryani', 'South Indian Filter Kaapi'],
              spiceLevel: 'Medium',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 28.614, lng: 77.242 }
          }
        ]
      }
    ]
  },
  {
    id: 'kerala-backwaters',
    title: 'Kerala Spice & Backwaters Trail',
    destinationCountries: ['India'],
    region: 'South India (Kochi • Munnar • Alleppey)',
    tagline: 'Water Metros, Tea Plantations, Houseboats & Kathakali Dance',
    duration: '5 Days / 4 Nights',
    dateRange: '12/09/2026 – 16/09/2026',
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    baseBudget: 32000,
    travelers: [
      { name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80' },
      { name: 'Marcus W.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' }
    ],
    highlights: {
      transit: 'Kochi Electric Water Metro & Traditional Kettuvallam Houseboat',
      food: 'Traditional Sadhya Feast on Banana Leaf & Malabar Karimeen Fish',
      festival: 'Onam Harvest & Traditional Snake Boat Races (Vallam Kali)',
      shopping: 'Wayanad Cardamom, Malabar Peppercorns & Aranmula Metal Mirror'
    },
    days: [
      {
        dayNumber: 1,
        date: '12 Sep 2026',
        dayOfWeek: 'Saturday',
        city: 'Kochi (Cochin)',
        title: 'Kochi Water Metro, Chinese Fishing Nets & Fort Kochi',
        weather: { temp: '30°C', condition: 'Coastal Breeze', icon: '🌴' },
        highlight: "Asia's first integrated electric water metro & spice warehouses",
        items: [
          {
            id: 'k1-t1',
            time: '09:00 AM',
            title: 'Kochi Electric Water Metro (High Court -> Vypin)',
            category: 'transit',
            location: 'High Court Water Metro Terminal',
            city: 'Kochi',
            duration: '20 min',
            cost: 20,
            rating: 4.9,
            reviewsCount: 2200,
            imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
            description: "State-of-the-art silent battery-powered electric ferry gliding smoothly across the scenic backwater lagoon.",
            touristTip: 'Tap and pay with Kochi1 card or purchase a paper QR token at the automated kiosk.',
            transitDetails: {
              mode: 'boat',
              from: 'High Court Terminal Gate 2',
              to: 'Vypin Island Jetty',
              operator: 'Kochi Water Metro Ltd',
              bookingTip: 'Boats run every 15 minutes. Opt for a window seat for dolphins often spotted near the shipping channel.'
            },
            coordinates: { lat: 9.9816, lng: 76.2753 }
          },
          {
            id: 'k1-c1',
            time: '10:30 AM',
            title: 'Chinese Fishing Nets & St. Francis Church',
            category: 'cultural_sight',
            location: 'Fort Kochi Beach Promenade',
            city: 'Kochi',
            duration: '2h 00m',
            cost: 150,
            rating: 4.7,
            reviewsCount: 5400,
            imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
            description: 'Cantilevered shore-operated fishing nets introduced by 14th-century Chinese traders, operating with teak wood counterweights.',
            touristTip: 'The fishermen will invite you to pull the ropes with them; a customary tip of ₹50-₹100 is appreciated.',
            coordinates: { lat: 9.9675, lng: 76.2427 }
          },
          {
            id: 'k1-f1',
            time: '01:00 PM',
            title: 'Traditional Kerala Sadhya on Banana Leaf',
            category: 'culinary',
            location: 'Grand Pavilion / Pandhal Cafe, Fort Kochi',
            city: 'Kochi',
            duration: '1h 30m',
            cost: 650,
            rating: 4.9,
            reviewsCount: 4100,
            imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
            description: 'Vegetarian royal feast of 24 dishes including Avial, Sambar, Pachadi, and red Matta rice served on an organic banana leaf.',
            touristTip: 'Eat with your right hand fingertips. Fold the top of the banana leaf downwards towards you to signify deep culinary satisfaction.',
            culinaryDetails: {
              specialties: ['Matta Rice with Ghee & Parippu', 'Palada Payasam dessert', 'Crisp Banana Chips in Coconut Oil'],
              spiceLevel: 'Medium',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 9.965, lng: 76.241 }
          },
          {
            id: 'k1-s1',
            time: '03:30 PM',
            title: 'Jew Town Spice Warehouses & Kerala Antiques',
            category: 'cultural_buy',
            location: 'Synagogue Lane, Jew Town, Mattancherry',
            city: 'Kochi',
            duration: '2h 00m',
            cost: 2100,
            rating: 4.8,
            reviewsCount: 1620,
            imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
            description: 'Historic ginger and pepper godowns where aromas of whole nutmeg, cinnamon bark, and vanilla pods fill the colonial alleyways.',
            touristTip: 'Ask for Tellicherry Extra Bold (TGEB) black pepper and GI-tagged Malabar cardamoms.',
            culturalBuyDetails: {
              itemToBuy: 'Organic Malabar Pepper, Star Anise & Brass Nilavilakku Oil Lamp',
              giTagCertified: true,
              bargainTip: 'Fixed prices in government co-op stores; small spice merchants will let you smell and taste before weighing.',
              authenticPriceRange: '₹400 - ₹2,800'
            },
            coordinates: { lat: 9.9577, lng: 76.2592 }
          }
        ]
      },
      {
        dayNumber: 2,
        date: '13 Sep 2026',
        dayOfWeek: 'Sunday',
        city: 'Alleppey (Alappuzha)',
        title: 'Overnight Kettuvallam Houseboat Cruise on Lake Vembanad',
        weather: { temp: '29°C', condition: 'Gentle Tropical Breeze', icon: '⛵' },
        highlight: 'Private thatched boat with onboard chef and village canals',
        items: [
          {
            id: 'k2-t1',
            time: '11:00 AM',
            title: 'Traditional Thatched Houseboat (Kettuvallam)',
            category: 'transit',
            location: 'Punnamada Jetty -> Kuttanad Village Backwaters',
            city: 'Alleppey',
            duration: 'Full Day & Night',
            cost: 9500,
            rating: 5.0,
            reviewsCount: 1980,
            imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
            description: 'Handcrafted boat built from Anjili wood tied together with coir rope without a single iron nail, featuring sun deck and bedroom.',
            touristTip: 'Verify the Green Palm eco-certification from Kerala Department of Tourism before boarding.',
            transitDetails: {
              mode: 'boat',
              from: 'Punnamada Boat Jetty',
              to: 'Vembanad Lake serene anchorage',
              operator: 'Kerala Tourism Approved Houseboat Operator',
              bookingTip: 'Book air-conditioned houseboats with full glass front for insect-free panoramic evening views.'
            },
            coordinates: { lat: 9.5007, lng: 76.3574 }
          },
          {
            id: 'k2-f1',
            time: '01:30 PM',
            title: 'Karimeen Pollichathu Onboard Feast',
            category: 'culinary',
            location: 'Houseboat Dining Deck on Lake Vembanad',
            city: 'Alleppey',
            duration: '1h 30m',
            cost: 1200,
            rating: 5.0,
            reviewsCount: 1450,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
            description: 'Pearl spot fish marinated in shallots, ginger, green chilies, wrapped in fresh banana leaf and pan-roasted in pure coconut oil.',
            touristTip: 'The boat will stop briefly at a local village toddy shop if you want to sample fresh sweet coconut palm sap.',
            culinaryDetails: {
              specialties: ['Karimeen Pollichathu (Pearl Spot)', 'Kappa (Manioc) with spicy fish curry', 'Fresh tender coconut water'],
              spiceLevel: 'Authentic Spicy',
              isVegetarianFriendly: false
            },
            coordinates: { lat: 9.498, lng: 76.38 }
          },
          {
            id: 'k2-s1',
            time: '04:30 PM',
            title: 'Kuttanad Coir Weaving & Aranmula Kannadi Mirror',
            category: 'cultural_buy',
            location: 'Champakulam Backwater Village Stop',
            city: 'Alleppey',
            duration: '1h 00m',
            cost: 3500,
            rating: 4.9,
            reviewsCount: 650,
            imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
            description: 'Aranmula Kannadi is a rare front-surface metal alloy mirror made using a confidential copper-tin formula handed down over generations.',
            touristTip: 'Unlike glass mirrors that reflect from the back silver coating, this metal mirror eliminates secondary refraction.',
            culturalBuyDetails: {
              itemToBuy: 'GI-Certified Aranmula Metal Alloy Mirror (Valkannadi)',
              giTagCertified: true,
              bargainTip: 'Each mirror is cast by hand and carries a government hologram seal. No discounts are offered on genuine pieces.',
              authenticPriceRange: '₹2,500 - ₹12,000'
            },
            coordinates: { lat: 9.402, lng: 76.518 }
          }
        ]
      }
    ]
  },
  {
    id: 'varanasi-spiritual',
    title: 'Spiritual Varanasi & The Sacred Ganges',
    destinationCountries: ['India'],
    region: 'North India (Varanasi • Sarnath)',
    tagline: 'Ganga Aarti, Hand-Rowed Wooden Boats, Saffron Silk & Ancient Ghats',
    duration: '4 Days / 3 Nights',
    dateRange: '19/09/2026 – 22/09/2026',
    coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    baseBudget: 24000,
    travelers: [
      { name: 'Kavita S.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
      { name: 'Thomas L.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' }
    ],
    highlights: {
      transit: 'Hand-Rowed Wooden Sunrise Boat & Electric E-Rickshaws through Galis',
      food: 'Banarasi Tamatar Chaat, Malaiyyo Saffron Foam & Blue Lassi',
      festival: 'Dev Deepawali (Festival of the Gods with 1 Million Lamps)',
      shopping: 'Pure Gold & Silver Zari Banarasi Silk Sarees & Gulabi Meenakari'
    },
    days: [
      {
        dayNumber: 1,
        date: '19 Sep 2026',
        dayOfWeek: 'Saturday',
        city: 'Varanasi',
        title: 'Dawn Rowing Boat on Mother Ganga & Ghat Exploration',
        weather: { temp: '26°C', condition: 'Misty Golden Sunrise', icon: '🌅' },
        highlight: 'Subah-e-Banaras classical music & 84 continuous ghats',
        items: [
          {
            id: 'v1-t1',
            time: '05:15 AM',
            title: 'Hand-Rowed Wooden Boat at Dawn',
            category: 'transit',
            location: 'Assi Ghat -> Dashashwamedh -> Manikarnika Ghat',
            city: 'Varanasi',
            duration: '2h 00m',
            cost: 600,
            rating: 5.0,
            reviewsCount: 6800,
            imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
            description: 'Silent wooden boat gliding past morning bathers, sun salutations, ancient palace facades, and cremation ghats as the sun rises over the eastern sandbanks.',
            touristTip: 'Choose hand-rowed boats over noisy motorboats for peace and environmental preservation. Photography is strictly prohibited at Manikarnika cremation pyres.',
            transitDetails: {
              mode: 'boat',
              from: 'Assi Ghat Stone Steps',
              to: 'Scindia Ghat and back',
              operator: 'Local Boatmen (Mallah Community)',
              bookingTip: 'Agree on price beforehand (₹500-₹700 for 2 hours private boat).'
            },
            coordinates: { lat: 25.2925, lng: 83.0063 }
          },
          {
            id: 'v1-f1',
            time: '08:30 AM',
            title: 'Kachori Jalebi Breakfast & Banarasi Malaiyyo',
            category: 'culinary',
            location: 'Thatheri Bazaar & Ram Bhandar, Chowk',
            city: 'Varanasi',
            duration: '1h 15m',
            cost: 250,
            rating: 4.9,
            reviewsCount: 3800,
            imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            description: 'Malaiyyo is a seasonal delicacy: milk froth whisked under open-sky dew, infused with saffron, pistachio, and green cardamom.',
            touristTip: 'Served in disposable clay cups (Kullad); the foam literally evaporates into sweet saffron vapor on your tongue.',
            culinaryDetails: {
              specialties: ['Malaiyyo (Winter Dew Foam)', 'Hing Kachori with spicy aloo', 'Kulhad Tea'],
              spiceLevel: 'Mild',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 25.312, lng: 83.011 }
          },
          {
            id: 'v1-s1',
            time: '11:00 AM',
            title: 'Master Weavers of Banarasi Silk & Real Zari',
            category: 'cultural_buy',
            location: 'Madanpura & Peeli Kothi Weaver Colony',
            city: 'Varanasi',
            duration: '2h 00m',
            cost: 6500,
            rating: 4.9,
            reviewsCount: 1400,
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            description: 'Observe Muslim Ansari master weavers operating century-old Jacquard handlooms, intertwining pure mulberry silk with electroplated gold threads.',
            touristTip: 'Burn-test test thread: genuine pure silk burns with a smell like burnt hair and leaves soft ash; polyester melts into hard beads. Look for the Silk Mark label.',
            culturalBuyDetails: {
              itemToBuy: 'Silk Mark Certified Banarasi Silk Stole or Saree (Katan / Georgette)',
              giTagCertified: true,
              bargainTip: 'Buy directly from weaver cooperatives in Madanpura to save 40% compared to hotel retail stores.',
              authenticPriceRange: '₹3,500 - ₹25,000'
            },
            coordinates: { lat: 25.304, lng: 83.003 }
          },
          {
            id: 'v1-c1',
            time: '06:00 PM',
            title: 'Grand Ganga Aarti at Dashashwamedh Ghat',
            category: 'cultural_sight',
            location: 'Dashashwamedh Ghat Central Pavilion',
            city: 'Varanasi',
            duration: '1h 45m',
            cost: 200,
            rating: 5.0,
            reviewsCount: 19500,
            imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
            description: 'Seven young priests clad in saffron and silk robes chant Vedic hymns while swinging multi-tiered brass oil lamps in synchronized devotion.',
            touristTip: 'Arrive by 05:00 PM to secure a front row wooden boat seat facing the riverfront altars.',
            coordinates: { lat: 25.3076, lng: 83.0104 }
          }
        ]
      }
    ]
  },
  {
    id: 'indore-heritage-culinary',
    title: 'Indore: Royal Heritage & Street Food Capital',
    destinationCountries: ['India'],
    region: 'Central India (Indore • Mandu • Ujjain Circuit)',
    tagline: "India's Cleanest City — Rajwada Palace, Sarafa Night Food Bazaar, 56 Dukan & Lal Bagh",
    duration: '3 Days / 2 Nights',
    dateRange: '15/09/2026 – 17/09/2026',
    coverImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    baseBudget: 18500,
    travelers: [
      { name: 'Aarav M.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
      { name: 'Ananya S.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' }
    ],
    highlights: {
      transit: 'Indore iBus BRTS Air-Conditioned Electric Green Corridor & Heritage Metre-Gauge Rail',
      food: 'Midnight Sarafa Food Street (Bhutte Ka Kees, Garadu) & 56 Dukan Poha-Jalebi',
      festival: 'Ahilya Utsav, Rangpanchami Gair Festival & Deepawali at Khajrana Ganesh',
      shopping: 'GI Tagged Indori Ujjaini Sev, Authentic Maheshwari Silk Sarees & Sitlamata Bazaar'
    },
    days: [
      {
        dayNumber: 1,
        date: '15 Sep 2026',
        dayOfWeek: 'Tuesday',
        city: 'Indore',
        title: 'Holkar Dynastic Splendor & Sarafa Midnight Culinary Bazaar',
        weather: { temp: '28°C', condition: 'Pleasant & Clean', icon: '🌤️' },
        highlight: 'Rajwada 7-story palace, Krishnapura Chhatris & world-famous Sarafa night food',
        items: [
          {
            id: 'ind-d1-t1',
            time: '09:00 AM',
            title: 'Indore iBus BRTS Green Corridor Transit',
            category: 'transit',
            location: 'Indore Junction -> Rajwada Chowk',
            city: 'Indore',
            duration: '20 min',
            cost: 15,
            rating: 4.8,
            reviewsCount: 2950,
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
            description: 'Air-conditioned dedicated transit corridor traversing Indore with digital UPI ticketing and zero-emission electric buses.',
            touristTip: "Indore is ranked India's Cleanest City for 7 years in a row—stations have contactless Chalo smart card & strict dustbin sorting.",
            transitDetails: {
              mode: 'metro',
              from: 'Indore Junction Platform 1',
              to: 'Rajwada Chowk Stop',
              lineOrNumber: 'AB Road Green Line (iBus Corridor)',
              operator: 'AiCTSL (Atal Indore City Transport Services)',
              bookingTip: 'Fares start at ₹10; tap and go using Chalo App or scan QR ticket at turnstile.'
            },
            coordinates: { lat: 22.7196, lng: 75.8577 }
          },
          {
            id: 'ind-d1-c1',
            time: '10:00 AM',
            title: 'Rajwada Palace & Ahilyabai Holkar Courtyard',
            category: 'cultural_sight',
            location: 'Rajwada Chowk, MG Road, Indore',
            city: 'Indore',
            duration: '2h 00m',
            cost: 20,
            rating: 4.9,
            reviewsCount: 9200,
            imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
            description: 'Iconic 7-story Holkar Palace built in 1747 by Malhar Rao Holkar. Features a blend of Maratha, Mughal, and French architectural styles with massive wooden gateways and delicate stone jharokhas.',
            touristTip: 'Visit the central courtyard statue of Rani Ahilya Bai Holkar. Light & Sound show begins at 7:00 PM in Hindi & English.',
            coordinates: { lat: 22.7186, lng: 75.8553 }
          },
          {
            id: 'ind-d1-c2',
            time: '12:30 PM',
            title: 'Krishnapura Chhatris & Khan River Heritage Ghats',
            category: 'cultural_sight',
            location: 'Krishnapura, MG Road, Indore',
            city: 'Indore',
            duration: '1h 00m',
            cost: 0,
            rating: 4.7,
            reviewsCount: 4100,
            imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f443a96b?auto=format&fit=crop&w=800&q=80',
            description: 'Monumental stone cenotaphs built in memory of Holkar rulers on the banks of the Khan River. Carved intricately in Maratha style with soaring shikharas, arched pillared pavilions, and serene waterfront stone steps.',
            touristTip: 'Best captured in afternoon golden light when the sandstone carvings reflect in the calm river waters.',
            coordinates: { lat: 22.7169, lng: 75.8569 }
          },
          {
            id: 'ind-d1-s1',
            time: '03:30 PM',
            title: 'Sitlamata Bazaar & GI-Certified Maheshwari Weaves',
            category: 'cultural_buy',
            location: 'Sitlamata Bazaar, Rajwada Precinct',
            city: 'Indore',
            duration: '2h 00m',
            cost: 2200,
            rating: 4.8,
            reviewsCount: 3100,
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            description: 'Authentic handloom sarees with distinctive reversible zari borders, conceived by Maharani Ahilyabai Holkar in the 18th century.',
            touristTip: 'Look for the official Silk Mark and GI India registry logo on pure silk-cotton Maheshwari weaves.',
            culturalBuyDetails: {
              itemToBuy: 'Pure Silk-Cotton Maheshwari Saree & Chanderi Stoles',
              giTagCertified: true,
              bargainTip: 'Fixed-price artisan cooperatives near Rajwada offer verified prices from ₹1,200 to ₹4,500.',
              authenticPriceRange: '₹1,200 - ₹4,500'
            },
            coordinates: { lat: 22.7175, lng: 75.8540 }
          },
          {
            id: 'ind-d1-f1',
            time: '08:30 PM',
            title: 'Sarafa Night Food Bazaar (Bhutte Ka Kees & Joshi Dahi Vada)',
            category: 'culinary',
            location: 'Sarafa Bazaar, Adjacent to Rajwada Palace',
            city: 'Indore',
            duration: '2h 30m',
            cost: 350,
            rating: 5.0,
            reviewsCount: 14800,
            imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?auto=format&fit=crop&w=800&q=80',
            description: "India's only midnight street food bazaar. Jewelry shops shutter at 8 PM and transform into a bustling street food haven until 2 AM serving freshly grated Bhutte Ka Kees, crispy spiced Garadu, flying Joshi Dahi Vada, giant Jalebas, and rabdi.",
            touristTip: 'Watch Mr. Joshi catch the flying Dahi Vada in one hand before coating it with five secret spice powders! Do not miss freshly fried Garadu sprinkled with chaat masala and lemon.',
            culinaryDetails: {
              specialties: ['Bhutte Ka Kees', 'Spicy Crisp Garadu', 'Joshi Dahi Vada', 'Giant 250g Jaleba & Rabdi', 'Kulfi Falooda'],
              spiceLevel: 'Medium',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 22.7196, lng: 75.8577 }
          }
        ]
      },
      {
        dayNumber: 2,
        date: '16 Sep 2026',
        dayOfWeek: 'Wednesday',
        city: 'Indore',
        title: 'Chappan Dukan Culinary Boulevard, Lal Bagh Palace & Kanch Mandir',
        weather: { temp: '29°C', condition: 'Sunny & Crisp', icon: '☀️' },
        highlight: 'Breakfast at 56 Dukan, Buckingham gates at Lal Bagh & Belgian glass marvel at Kanch Mandir',
        items: [
          {
            id: 'ind-d2-f1',
            time: '08:00 AM',
            title: '56 Dukan (Chappan Dukan) Breakfast Feast (Poha-Jalebi & Johnny Hot Dog)',
            category: 'culinary',
            location: '56 Dukan, New Palasia, Indore',
            city: 'Indore',
            duration: '1h 30m',
            cost: 180,
            rating: 4.9,
            reviewsCount: 18200,
            imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            description: 'Clean, zero-plastic pedestrian food boulevard featuring 56 legendary specialty stalls. Savour steamy Indori Poha garnished with double sev, pomegranate seeds, and crispy hot Jalebi, followed by the world-famous Johnny Hot Dog (Uber Eats Global Award winner) and Vijay Chaat House Khopra Patties.',
            touristTip: 'Wash it down with Madhuram Sweets signature creamy Shikanji (a rich spiced milk shake, not lemon juice!).',
            culinaryDetails: {
              specialties: ['Indori Poha with Ratlami & Laung Sev', 'Hot Kesariya Jalebi', 'Johnny Hot Dog Veg Mutton Patties', 'Vijay Chaat Khopra Patties', 'Madhuram Shikanji'],
              spiceLevel: 'Mild',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 22.7244, lng: 75.8839 }
          },
          {
            id: 'ind-d2-c1',
            time: '10:30 AM',
            title: 'Lal Bagh Palace (Lalbagh Royal Estate)',
            category: 'cultural_sight',
            location: 'Nai Duniya, Revenue Colony, Indore',
            city: 'Indore',
            duration: '2h 00m',
            cost: 30,
            rating: 4.8,
            reviewsCount: 6500,
            imageUrl: 'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&w=800&q=80',
            description: 'Opulent 19th-century royal palace of the Holkar dynasty set across 28 acres. Features majestic wrought-iron entrance gates modeled after Buckingham Palace in London, grand ballroom with Italian marble columns, Persian rugs, and Belgian crystal chandeliers.',
            touristTip: 'Look up at the painted ceilings by European masters in the Durbar Hall. Photography inside the royal coin museum is permitted.',
            coordinates: { lat: 22.7008, lng: 75.8427 }
          },
          {
            id: 'ind-d2-c2',
            time: '01:30 PM',
            title: 'Kanch Mandir (Belgian Glass & Mirror Temple)',
            category: 'cultural_sight',
            location: 'Itwaria Bazaar, Indore',
            city: 'Indore',
            duration: '1h 15m',
            cost: 0,
            rating: 4.7,
            reviewsCount: 4800,
            imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            description: 'Stunning 20th-century Jain temple built by industrialist Sir Seth Hukamchand. The entire ceiling, walls, pillars, and chandeliers are covered with colored cut-glass and mirrors imported from Belgium, depicting 50+ elaborate Jain mythological scenes.',
            touristTip: 'Footwear must be deposited outside. The sanctum sanctorum houses a rare black onyx idol of Lord Shantinath flanked by colored mirror mosaics.',
            coordinates: { lat: 22.7161, lng: 75.8505 }
          },
          {
            id: 'ind-d2-c3',
            time: '03:30 PM',
            title: 'Khajrana Ganesh Temple (Rani Ahilyabai Shrine)',
            category: 'cultural_sight',
            location: 'Khajrana Road, Ganeshpuri, Indore',
            city: 'Indore',
            duration: '1h 30m',
            cost: 0,
            rating: 4.9,
            reviewsCount: 16500,
            imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
            description: 'Revered historic temple built in 1735 by Maharani Ahilyabai Holkar. The deity is believed to fulfill all heartfelt wishes. Surrounded by pristine paved walkways, traditional prasad stalls, and gold-plated dome spires.',
            touristTip: 'Devotees tie a sacred mauli thread and draw an inverted swastika on the temple wall for blessings, returning to straighten it when wishes are granted.',
            coordinates: { lat: 22.7303, lng: 75.9038 }
          },
          {
            id: 'ind-d2-s1',
            time: '05:30 PM',
            title: '56 Dukan Sweets & GI-Tagged Indori Sev Tasting',
            category: 'cultural_buy',
            location: 'Chappan Dukan Confectioneries, Indore',
            city: 'Indore',
            duration: '1h 30m',
            cost: 450,
            rating: 4.9,
            reviewsCount: 5200,
            imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
            description: 'Purchase authentic GI-tagged Indori Ujjaini Sev, spicy Laung Sev, Ratlami Sev, and Khatta Meetha mixture, packed vacuum-fresh for travel.',
            touristTip: 'Sample the freshly rolled Gulab Jamuns at Agarwal Sweets and pick up vacuum-sealed packs of spicy clove sev.',
            culturalBuyDetails: {
              itemToBuy: 'GI Indori Ujjaini Sev, Laung Sev & Ratlami Hing Sev',
              giTagCertified: true,
              bargainTip: 'Fixed standard pricing across Om Namkeen, Jain Mithai & Agarwal Sweets (~₹240/kg).',
              authenticPriceRange: '₹220 - ₹340 per kg'
            },
            coordinates: { lat: 22.7244, lng: 75.8839 }
          }
        ]
      },
      {
        dayNumber: 3,
        date: '17 Sep 2026',
        dayOfWeek: 'Thursday',
        city: 'Indore & Environs',
        title: 'Patalpani Waterfall, Heritage Ghats & Malwa Countryside',
        weather: { temp: '27°C', condition: 'Lush & Breezy', icon: '🌿' },
        highlight: '300-ft Patalpani cascading waterfall, scenic Mhow valley & Malwi Dal Bafla feast',
        items: [
          {
            id: 'ind-d3-c1',
            time: '08:30 AM',
            title: 'Patalpani Waterfall & Dr. Ambedkar Nagar Valley',
            category: 'cultural_sight',
            location: 'Patalpani, Mhow (35 km from Indore)',
            city: 'Indore',
            duration: '3h 00m',
            cost: 50,
            rating: 4.8,
            reviewsCount: 7800,
            imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
            description: 'Breathtaking 300-foot cascading waterfall cutting through deep gorges of the Vindhya Range, alongside the historic British-era metre-gauge heritage railway line.',
            touristTip: 'Remain behind the safety barricades at the designated viewing pavilion. The misty spray in morning hours creates vivid rainbows over the gorge.',
            coordinates: { lat: 22.5028, lng: 75.7892 }
          },
          {
            id: 'ind-d3-c2',
            time: '01:00 PM',
            title: 'Ralamandal Wildlife Sanctuary & Royal Shikargah',
            category: 'cultural_sight',
            location: 'Ralamandal, Bypass Road, Indore',
            city: 'Indore',
            duration: '2h 00m',
            cost: 40,
            rating: 4.6,
            reviewsCount: 3400,
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
            description: 'Oldest wildlife sanctuary in MP established in 1989. Features a scenic hilltop palace (ancient Holkar royal hunting lodge / Shikargah) offering panoramic 360-degree sunset views over Indore city.',
            touristTip: 'Trek or take an electric eco-cart to the summit lodge. Spot spotted deer, blackbucks, and blue bulls roaming the sanctuary trails.',
            coordinates: { lat: 22.6586, lng: 75.9189 }
          },
          {
            id: 'ind-d3-f1',
            time: '04:30 PM',
            title: 'Authentic Malwi Dal Bafla & Ladoos Feast',
            category: 'culinary',
            location: 'Rajhans / Guru Kripa Malwa Dhaba, Indore',
            city: 'Indore',
            duration: '1h 30m',
            cost: 320,
            rating: 4.9,
            reviewsCount: 8900,
            imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
            description: 'Traditional Central Indian feast: boiled then charcoal-baked wheat dough balls (Baflas) crushed and drenched in pure desi ghee, served with tangy toor dal, kadhi, garlic chutney, and crumbly churma ladoos.',
            touristTip: 'Crush the bafla thoroughly with your fingers before ladling hot dal and ghee on top for authentic Malwa flavor.',
            culinaryDetails: {
              specialties: ['Desi Ghee Malwi Bafla', 'Panchmel Dal', 'Spicy Garlic Chutney', 'Khatta Meetha Kadhi', 'Churma Ladoo'],
              spiceLevel: 'Medium',
              isVegetarianFriendly: true
            },
            coordinates: { lat: 22.7196, lng: 75.8577 }
          }
        ]
      }
    ]
  }
];

export const REGIONAL_FESTIVALS = [
  {
    name: 'Diwali (Festival of Lights)',
    region: 'All India (Best in Jaipur, Varanasi & Delhi)',
    place: 'Jaipur Bazaars & Delhi Old City',
    timing: '08 Nov 2026 (Kartik Amavasya)',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    description: 'Illumination of every home and temple with oil lamps, firework displays, and exchange of sweets.',
    touristEtiquette: 'Wear festive bright clothes, respect temple sanctums, avoid synthetic flammable garments.'
  },
  {
    name: 'Dev Deepawali (Diwali of the Gods)',
    region: 'Varanasi, Uttar Pradesh',
    place: 'Dashashwamedh & Assi Ghats, Varanasi',
    timing: '24 Nov 2026 (Kartik Purnima)',
    imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
    description: 'All 84 ghats of Varanasi are lined with over 1.2 million earthen oil lamps; a spellbinding river of flame.',
    touristEtiquette: 'Book boat reservations at least 2 months ahead. Crowd density is extremely high.'
  },
  {
    name: 'Pushkar Camel Fair (Mela)',
    region: 'Pushkar, Rajasthan',
    place: 'Thar Desert Fairgrounds, Pushkar',
    timing: '18 Nov – 24 Nov 2026',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    description: 'World largest camel and livestock trading spectacle with folk musicians, bridal competitions, and hot air balloons.',
    touristEtiquette: 'Great for photography; ask permission before close-up portraits of camel herders.'
  },
  {
    name: 'Onam & Vallam Kali (Snake Boat Race)',
    region: 'Alleppey & Aranmula, Kerala',
    place: 'Punnamada Lake & Aranmula Backwaters',
    timing: '26 Aug – 06 Sep 2026 (Ongoing Season)',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    description: 'Harvest celebration featuring 100-foot-long snake boats rowed rhythmically by 120 men chanting Vanchipattu songs.',
    touristEtiquette: 'Stand along the banks early; cheer alongside passionate village cheer squads.'
  },
  {
    name: 'Holi (Festival of Colors)',
    region: 'Mathura, Vrindavan & Jaipur',
    place: 'Banke Bihari Temple (Vrindavan) & City Palace (Jaipur)',
    timing: '03 Mar 2027 (Upcoming Spring)',
    imageUrl: 'https://images.unsplash.com/photo-1583244972934-8c887467776b?auto=format&fit=crop&w=800&q=80',
    description: 'Joyful celebration marking the arrival of spring with organic colored herbal powders (gulal) and flower petals.',
    touristEtiquette: 'Apply coconut oil to skin and hair beforehand; wear white clothes you are ready to discard; use only organic herbal powders.'
  }
];

export const TRANSIT_TOOLKIT = [
  {
    mode: 'Indian Railways & Vande Bharat',
    icon: 'Train',
    rating: '4.8 ★',
    speed: 'Up to 160 km/h',
    badge: 'Recommended for Intercity',
    place: 'New Delhi – Agra Cantt – Jaipur Route',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    summary: 'The backbone of Indian travel. Modern Vande Bharat trains provide airline-quality executive seating, sealed panoramic windows, and catered meals.',
    classes: [
      { code: 'EC / CC', name: 'Executive & Chair Car', tip: 'Air-conditioned luxury seating on daytime express trains like Vande Bharat.' },
      { code: '1A / 2A', name: 'First & Second AC Sleeper', tip: 'Quiet, clean, curtains, clean linen provided; best for overnight journeys.' },
      { code: '3A / 3E', name: 'Third AC Sleeper', tip: 'Economical, air-conditioned, sociable experience with linen.' }
    ],
    proTip: 'Foreign tourists can book through the official Foreign Tourist Quota (FTQ) on IRCTC or at International Tourist Bureaus in major stations with their passport.'
  },
  {
    mode: 'Metro Rail Networks',
    icon: 'Subway',
    rating: '4.9 ★',
    speed: 'Bypasses Traffic',
    badge: 'Urban Champion',
    place: 'Delhi Metro, Bengaluru Namma Metro & Kochi Subway',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    summary: 'Delhi, Bengaluru, Mumbai, and Kochi feature ultra-modern, spotlessly clean, fully air-conditioned subway networks.',
    classes: [
      { code: 'WhatsApp QR', name: 'Paperless Ticketing', tip: 'Send "Hi" to official Metro WhatsApp bots for instant QR entry tickets.' },
      { code: 'Tourist Card', name: 'Unlimited Day Pass', tip: 'Available at counter for ₹200 with unlimited hops across all lines.' },
      { code: 'Women Coach', name: 'Reserved First Coach', tip: 'First coach in moving direction is strictly reserved for women travelers.' }
    ],
    proTip: 'Security frisking is mandatory before platforms. Delhi Metro Airport Express connects T3 terminal to Central Delhi in just 19 minutes.'
  },
  {
    mode: 'Auto-Rickshaws & Tuk-Tuks',
    icon: 'Zap',
    rating: '4.6 ★',
    speed: 'Agile & Scenic',
    badge: 'Short Distance & Heritage Quarters',
    place: 'Old Delhi Chandni Chowk & Jaipur Walled City',
    imageUrl: 'https://images.unsplash.com/photo-1555617778-02518510b9fa?auto=format&fit=crop&w=800&q=80',
    summary: 'The authentic Indian three-wheeler experience for navigating buzzing lanes, spice markets, and monument precincts.',
    classes: [
      { code: 'Ola / Uber Auto', name: 'App-Based Metered Auto', tip: 'No price haggling; upfront fare confirmed in app with live GPS.' },
      { code: 'Pre-Paid Booth', name: 'Railway / Airport Counters', tip: 'Pay fixed government-approved rate at traffic police kiosk before boarding.' },
      { code: 'Street Hail', name: 'Negotiated Fare', tip: 'Always agree on the total price BEFORE entering. Mention clearly if it includes waiting.' }
    ],
    proTip: 'In Delhi, Mumbai, and Bengaluru, insist on "Meter please" ("Meter se chalo"). In tourist hubs, app-based autos eliminate all guesswork.'
  },
  {
    mode: 'Water Metro & Heritage Boats',
    icon: 'Ship',
    rating: '4.9 ★',
    speed: 'Scenic Slow Travel',
    badge: 'Coastal & River Regions',
    place: 'Alleppey Backwaters & Varanasi Ganges Ghats',
    imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    summary: 'From Kochi silent electric water ferries to Varanasi dawn rowboats and Kerala kettuvallam houseboats, waterways offer unmatched serenity.',
    classes: [
      { code: 'Kochi Water Metro', name: 'Electric Integrated Ferry', tip: 'State-of-the-art catamaran ferries connecting islands from ₹20.' },
      { code: 'Shikara / Rowboat', name: 'Varanasi & Dal Lake', tip: 'Zero engine noise; optimal for morning birdwatching and spiritual reflections.' },
      { code: 'Kettuvallam', name: 'Overnight Houseboat', tip: 'Floating hotel with private chef, sun deck, and bedroom on Vembanad Lake.' }
    ],
    proTip: 'Always verify life jackets are onboard and check state tourism eco-certifications.'
  }
];

export const CULINARY_SAFETY_TIPS = [
  {
    title: 'Drinking Water Protocol',
    icon: 'Droplets',
    tip: 'Drink exclusively bottled water with an unbroken tamper-evident seal (Bisleri, Kinley, Aquafina) or verified RO-filtered water. Avoid ice in roadside stalls.'
  },
  {
    title: 'High-Turnover Rule',
    icon: 'Flame',
    tip: 'Eat at street stalls crowded with local families and working professionals. High turnover guarantees ingredients are cooked fresh in piping hot oil or tandoors.'
  },
  {
    title: 'Spice Customization',
    icon: 'Pepper',
    tip: 'Politely say "Kam Theekha" (Less spicy) or "Bina Mirchi" (Without chili) when ordering. Order cooling curd raita or lassi to neutralize spice.'
  },
  {
    title: 'Probiotic Helpers',
    icon: 'ShieldCheck',
    tip: 'Enjoy fresh plain Dahi (curd) or Chaas (buttermilk) with cumin after meals; Indian yogurt contains rich active cultures that protect gut flora.'
  }
];

export const FAMOUS_CULTURAL_BUYS = [
  {
    region: 'Rajasthan',
    craft: 'Jaipur Blue Pottery & Block Prints',
    place: 'Bani Park Studios & Sanganer Artisan Village',
    giTag: true,
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    whatToLookFor: 'Glazed quartz and Fuller earth ceramics with Persian turquoise motifs. Sanganeri and Bagru hand-carved teak wooden block textile prints.',
    whereToBuy: 'Kripal Kumbh (Bani Park) & Anokhi Museum of Hand Printing'
  },
  {
    region: 'Uttar Pradesh',
    craft: 'Banarasi Brocade Silk & Meenakari',
    place: 'Madanpura & Peeli Kothi Weaver Colony, Varanasi',
    giTag: true,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    whatToLookFor: 'Intricate floral jaal designs woven with real gold/silver zari threads. Gulabi Meenakari pink enamel jewelry on silver.',
    whereToBuy: 'Ansari weaver lanes of Madanpura, Varanasi'
  },
  {
    region: 'Kerala',
    craft: 'Aranmula Metal Mirror & Malabar Spices',
    place: 'Jew Town Spice Warehouses, Fort Kochi & Aranmula',
    giTag: true,
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    whatToLookFor: 'Front-reflection copper-tin alloy mirror with handcrafted brass crest. Tellicherry Extra Bold black peppercorns and Alleppey green cardamom.',
    whereToBuy: 'Aranmula Heritage Village & Jew Town Spice Warehouses, Kochi'
  },
  {
    region: 'Kashmir',
    craft: 'Hand-woven Pashmina & Saffron',
    place: 'Pampore Saffron Valley & Srinagar Artisan Looms',
    giTag: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    whatToLookFor: 'Ultra-fine Changthangi goat underfleece that passes smoothly through a finger ring. Saffron with dark crimson trumpet stamens.',
    whereToBuy: 'Government Arts Emporium & Pampore saffron growers'
  }
];

export const POPULAR_CULINARY_DESTINATIONS = [
  {
    city: 'Old Delhi',
    name: 'Chandni Chowk & Paranthe Wali Gali',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    dishes: ['Piping hot stuffed paranthas', 'Daulat ki Chaat (winter foam)', 'Jalebi with Rabri', 'Natraj Dahi Bhalla'],
    hygieneRating: 'Family-Crowded High Turnover',
    description: 'The historic gastronomic heart of India. Stalls operating continuously since 1872 fry pure-ghee paranthas and churn saffron cream delicacies.',
    localEtiquette: 'Carry hand sanitizer; eat during peak meal hours (12-3 PM & 7-10 PM) when tandoors and oil are freshly fired.',
    mustTrySpecialty: 'Alu & Mawa Fried Parantha served with mint chutney and sweet pumpkin mash'
  },
  {
    city: 'Jaipur, Rajasthan',
    name: 'Royal Marwari Thali & Heritage Bazaars',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    dishes: ['Dal Baati Churma with Pure Ghee', 'Gatte ki Sabzi', 'Ker Sangri Desert Beans', 'Paneer Ghevar'],
    hygieneRating: 'Fine Heritage Dining',
    description: 'Rajasthan royal kitchen culinary legacy: slow-cooked lentils paired with wood-fired whole wheat baati dumplings and cardamom churma.',
    localEtiquette: 'Eat with your right hand; crush the baati into pieces and pour melted ghee generously over it before adding spicy dal.',
    mustTrySpecialty: 'Traditional Thali at LMB (Laxmi Misthan Bhandar) or Chokhi Dhani'
  },
  {
    city: 'Varanasi, Uttar Pradesh',
    name: 'Ghatside Sweets & Street Delicacies',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    dishes: ['Malaiyo (dew-condensed saffron foam)', 'Kachori Sabzi at Dawn', 'Blue Lassi with Pomegranate', 'Meetha Banarasi Paan'],
    hygieneRating: 'Fresh Morning Batch Only',
    description: 'Varanasi mornings begin with piping hot kachoris and clay earthen pots (kullhad) overflowing with sweet saffron milk foam.',
    localEtiquette: 'Order Malaiyo between 6 AM and 9 AM only, as morning dew gives it its ethereal cloud texture.',
    mustTrySpecialty: 'Shreeji Malaiyo in Chaukhamba lane followed by Paan from Keshav Tambool'
  },
  {
    city: 'Fort Kochi & Alleppey, Kerala',
    name: 'Coastal Seafood & Backwater Banana Leaf Sadya',
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    dishes: ['Karimeen Pollichathu (pearl spot in banana leaf)', 'Kerala Fish Curry with Kodampuli', 'Appam with Coconut Stew', 'Grand Vegetarian Sadya'],
    hygieneRating: 'Farm-Fresh Coastal Catch',
    description: 'Flavors defined by fresh grated coconut, curry leaves plucked seconds before, and black pepper grown in the Malabar hills.',
    localEtiquette: 'Always enjoy traditional Sadya served on a fresh plantain leaf with top tapered end pointing left.',
    mustTrySpecialty: 'Pearl spot fish marinated in shallots, ginger, and chili paste grilled over banana leaf wrap'
  },
  {
    city: 'Srinagar, Kashmir',
    name: 'Wazwan Banquet & Saffron Kahwa',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    dishes: ['Rogan Josh', 'Gushtaba (velvety yogurt meatballs)', 'Tabakhmaaz', 'Kashmiri Kahwa with Almonds & Saffron'],
    hygieneRating: 'Heritage Cookhouse Standard',
    description: 'Centuries-old Persian-Kashmiri culinary art prepared by master chefs (Wazas) over carved wood stoves in Srinagar old quarters.',
    localEtiquette: 'Sip warm Kahwa green tea brewed with whole green cardamom, cinnamon bark, and Kashmiri saffron threads after meals.',
    mustTrySpecialty: 'Authentic Kashmiri Wazwan Tarami platter at Ahdoos, Residency Road'
  }
];

export const EMERGENCY_CONTACTS = [
  {
    service: 'National Emergency All-in-One',
    number: '112',
    icon: 'PhoneCall',
    badge: '24x7 Pan-India',
    description: 'Universal emergency line equivalent to 911 or 999. Connects directly to Police, Ambulance, and Fire Rescue with live GPS triangulation.'
  },
  {
    service: 'Ministry of Tourism Tourist Infoline',
    number: '1363',
    icon: 'ShieldCheck',
    badge: 'Toll-Free in 12 Languages',
    description: 'Official Ministry of Tourism 24/7 hotline offering multi-lingual assistance in English, Hindi, French, German, Spanish, Japanese, Russian, and Italian.'
  },
  {
    service: 'Indian Railways Security & RailMadad',
    number: '139',
    icon: 'Train',
    badge: 'Onboard Railway Emergency',
    description: 'Instant assistance for medical attention on moving trains, security escorts, ticket rectification, or lost baggage claims.'
  },
  {
    service: 'Medical Ambulance & Trauma Services',
    number: '102 / 108',
    icon: 'HeartPulse',
    badge: 'Government Ambulance',
    description: 'Free emergency medical dispatch. Major private hospitals (Apollo, Fortis, Max) also offer direct 24x7 emergency ambulances.'
  }
];

export const OFFICIAL_TOURIST_GUIDES = [
  {
    id: 'guide-ftq-railways',
    title: 'IRCTC Foreign Tourist Quota (FTQ) Booking Protocol',
    category: 'Transit & Ticketing',
    format: 'PDF Guide',
    size: '1.8 MB',
    author: 'Indian Railway Catering & Tourism Corporation',
    summary: 'Complete instructions on how foreign passport holders can book guaranteed air-conditioned berths on waitlisted trains online or at major railway international bureaus.',
    lastUpdated: 'Updated for 2026/2027',
    verified: true
  },
  {
    id: 'guide-street-hygiene',
    title: 'Incredible India Culinary & Street Food Survival Manual',
    category: 'Health & Food Safety',
    format: 'PDF Guide',
    size: '2.4 MB',
    author: 'Ministry of Tourism & FSSAI',
    summary: 'The golden rules for avoiding Delhi Belly: tamper-evident water verification, high-turnover stalls, spice modulation, and natural gut probiotics.',
    lastUpdated: 'Season 2026 Edition',
    verified: true
  },
  {
    id: 'guide-delhi-metro-qr',
    title: 'Delhi & NCR Metro Airport Express & WhatsApp QR Ticketing',
    category: 'Urban Transit',
    format: 'PDF Guide',
    size: '3.1 MB',
    author: 'Delhi Metro Rail Corporation (DMRC)',
    summary: 'Instant QR code purchasing via WhatsApp, Airport T3 to Central Delhi route map (19 mins), tourist day cards, and luggage dimension allowances.',
    lastUpdated: 'Latest 2026 Release',
    verified: true
  },
  {
    id: 'guide-gi-artisan-directory',
    title: 'Official GI-Tagged Artisan Clusters & Anti-Counterfeit Checklist',
    category: 'Shopping & Heritage',
    format: 'Directory PDF',
    size: '4.2 MB',
    author: 'Handloom & Handicrafts Export Promotion Council',
    summary: 'State-by-state verified master weaver cooperatives, Government Emporiums, genuine silk burn tests, and fair price benchmarks.',
    lastUpdated: 'Verified 2026 Artisan Edition',
    verified: true
  }
];

export const ESSENTIAL_TRAVEL_RULES = [
  {
    title: 'SIM Cards & Connectivity',
    icon: 'Wifi',
    tip: 'International eSIMs (Airalo, Maya) work seamlessly before landing. For local physical SIMs, visit official Airtel or Jio kiosks in the airport arrivals hall with your passport, visa copy, and hotel address. Activation takes 2-4 hours.'
  },
  {
    title: 'UPI Payments for Foreign Tourists',
    icon: 'CreditCard',
    tip: 'Tourists can now pay at street stalls using UPI via specialized apps like Cheq or Transcorp UPI wallet with international credit cards. Always keep ₹2,000 in crisp ₹100 and ₹200 banknotes for remote monuments.'
  },
  {
    title: 'Sacred Temple & Shrine Etiquette',
    icon: 'Sparkles',
    tip: 'Remove shoes at shoe counters (Joota Ghar) outside sacred precincts. Wear modest attire covering knees and shoulders. In Sikh Gurdwaras (like Bangla Sahib), cover your head with scarves provided free at the entrance.'
  },
  {
    title: 'Tipping Norms & Fair Practice',
    icon: 'Coins',
    tip: 'In sit-down restaurants, 7-10% is customary if service charge is not included in the bill. For hotel bellboys, ₹50-100 per bag is standard. For full-day drivers, ₹300-500 per day tip is customary for hospitable service.'
  }
];
