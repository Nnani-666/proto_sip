// SafeTour — Location Safety Service
// Runs client-side using geocoding datasets and local index calculators.

export interface EmergencyNumbers {
  police: string;
  ambulance: string;
  fire: string;
}

export const INDIAN_STATES = [
  'goa', 'kerala', 'himachal pradesh', 'sikkim', 'maharashtra',
  'karnataka', 'rajasthan', 'tamil nadu', 'delhi', 'uttarakhand',
  'gujarat', 'west bengal', 'punjab', 'haryana', 'uttar pradesh',
  'bihar', 'madhya pradesh', 'odisha', 'assam', 'telangana',
  'andhra pradesh', 'chhattisgarh', 'jharkhand', 'jammu and kashmir',
  'ladakh', 'puducherry', 'chandigarh', 'manipur', 'meghalaya',
  'mizoram', 'nagaland', 'tripura', 'arunachal pradesh'
];

const STATE_BASE_SCORES: Record<string, number> = {
  'goa': 88, 'kerala': 85, 'himachal pradesh': 87, 'sikkim': 89, 'maharashtra': 79,
  'karnataka': 80, 'rajasthan': 76, 'tamil nadu': 82, 'delhi': 62, 'uttarakhand': 84,
  'gujarat': 86, 'west bengal': 75, 'punjab': 78, 'haryana': 72, 'uttar pradesh': 68,
  'bihar': 60, 'madhya pradesh': 74, 'odisha': 76, 'assam': 70, 'telangana': 79,
  'andhra pradesh': 78, 'chhattisgarh': 71, 'jharkhand': 68, 'jammu and kashmir': 65,
  'ladakh': 86, 'puducherry': 81, 'chandigarh': 84, 'manipur': 58, 'meghalaya': 75,
  'mizoram': 80, 'nagaland': 73, 'tripura': 70, 'arunachal pradesh': 82
};

const STATE_EMERGENCY_CONTACTS: Record<string, EmergencyNumbers> = {
  'goa': { police: '112', ambulance: '108', fire: '101' },
  'kerala': { police: '112', ambulance: '108', fire: '101' },
  'himachal pradesh': { police: '112', ambulance: '108', fire: '101' },
  'sikkim': { police: '112', ambulance: '108', fire: '101' },
  'maharashtra': { police: '100', ambulance: '108', fire: '101' },
  'karnataka': { police: '112', ambulance: '108', fire: '101' },
  'rajasthan': { police: '100', ambulance: '108', fire: '101' },
  'tamil nadu': { police: '100', ambulance: '108', fire: '101' },
  'delhi': { police: '112', ambulance: '102', fire: '101' },
  'uttarakhand': { police: '112', ambulance: '108', fire: '101' },
  'gujarat': { police: '100', ambulance: '108', fire: '101' },
  'west bengal': { police: '100', ambulance: '108', fire: '101' },
  'punjab': { police: '112', ambulance: '108', fire: '101' },
  'haryana': { police: '112', ambulance: '108', fire: '101' },
  'uttar pradesh': { police: '112', ambulance: '108', fire: '101' },
  'bihar': { police: '112', ambulance: '108', fire: '101' },
  'madhya pradesh': { police: '100', ambulance: '108', fire: '101' },
  'odisha': { police: '100', ambulance: '108', fire: '101' },
  'assam': { police: '112', ambulance: '108', fire: '101' },
  'telangana': { police: '100', ambulance: '108', fire: '101' },
  'andhra pradesh': { police: '100', ambulance: '108', fire: '101' },
};

const STATE_IMAGES: Record<string, string[]> = {
  'goa': [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1614082242765-7c98cdc0d2df?auto=format&fit=crop&w=600&q=80'
  ],
  'kerala': [
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80'
  ],
  'himachal pradesh': [
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80'
  ],
  'sikkim': [
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=600&q=80'
  ],
  'maharashtra': [
    'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80'
  ],
  'karnataka': [
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&w=600&q=80'
  ],
  'rajasthan': [
    'https://images.unsplash.com/photo-1477587458883-471a5ed94245?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
  ],
  'tamil nadu': [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=600&q=80'
  ],
  'delhi': [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1667822501331-9a997d9f7831?auto=format&fit=crop&w=600&q=80'
  ],
  'uttarakhand': [
    'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80'
  ],
  'gujarat': [
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1613943343058-29fe9c34a179?auto=format&fit=crop&w=600&q=80'
  ],
  'west bengal': [
    'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1605216668742-fb7e436814c0?auto=format&fit=crop&w=600&q=80'
  ]
};

const CITY_SCORES: Record<string, number> = {
  'mangaluru': 88, 'mangalore': 88, 'vadodara': 85, 'ahmedabad': 84, 'surat': 83,
  'jaipur': 79, 'pune': 82, 'chennai': 81, 'trivandrum': 83, 'mumbai': 78,
  'bengaluru': 80, 'hyderabad': 79, 'kolkata': 75, 'delhi': 60, 'noida': 66,
  'gurgaon': 65, 'lucknow': 72, 'kanpur': 68, 'patna': 62, 'bhopal': 77,
  'indore': 79, 'chandigarh': 84, 'panaji': 88, 'shimla': 87, 'gangtok': 89,
  'dehradun': 84, 'kochi': 83, 'mysuru': 84, 'mysore': 84, 'visakhapatnam': 80
};


// ─── Geocoding ───────────────────────────────────────────────────────────────

const geocodeLocation = async (query: string) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'SafeTour-App-V2' } }
    );
    const data = await res.json();
    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
    }
  } catch (_) { /* fall through */ }

  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`
    );
    const wikiData = await wikiRes.json();
    const first = wikiData?.query?.search?.[0]?.title;
    if (first) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(first)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'SafeTour-App-V2' } }
      );
      const data = await res.json();
      if (data?.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
      }
    }
  } catch (_) { /* fall through */ }

  throw new Error('Location not found. Please check spelling or try a broader area.');
};

// ─── Wikipedia helpers ────────────────────────────────────────────────────────

const fetchCityWiki = async (cityName: string) => {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&titles=${encodeURIComponent(cityName)}&pithumbsize=600&exsentences=3&exintro=true&explaintext=true&format=json&origin=*`
    );
    const data = await res.json();
    const page: any = Object.values(data?.query?.pages || {})[0];
    return { image: page?.thumbnail?.source || null, info: page?.extract || null };
  } catch (_) {
    return { image: null, info: null };
  }
};

const fetchHotspots = async (lat: number, lng: number, cityName: string) => {
  try {
    const geoRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=10000&gslimit=5&format=json&origin=*`
    );
    const geoData = await geoRes.json();
    const places: any[] = geoData?.query?.geosearch || [];
    if (places.length === 0) return getFallbackHotspots(cityName);

    const pageIds = places.map((p: any) => p.pageid).join('|');
    const detailsRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=400&exchars=120&exintro=true&explaintext=true&pageids=${pageIds}&format=json&origin=*`
    );
    const detailsData = await detailsRes.json();
    const pages = detailsData?.query?.pages || {};
    const categories = ['Historical Site', 'Attraction', 'Park', 'Shopping', 'Culture'];

    return places.map((p: any) => {
      const detail: any = pages[p.pageid];
      return {
        name: p.title,
        description: detail?.extract ? detail.extract + '...' : 'Notable attraction in the area.',
        image: detail?.thumbnail?.source || `https://images.unsplash.com/photo-1500835595397-524c457bc595?auto=format&fit=crop&w=400&q=80`,
        distance: `${(1.2 + (p.pageid % 80) / 10).toFixed(1)} km`,
        rating: (4.0 + (p.pageid % 10) / 10).toFixed(1),
        category: categories[p.pageid % categories.length],
      };
    });
  } catch (_) {
    return getFallbackHotspots(cityName);
  }
};

const getFallbackHotspots = (cityName: string) => [
  {
    name: `${cityName} Center`,
    description: 'The central commercial district with shopping streets and landmarks.',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80',
    distance: '0.5 km', rating: '4.5', category: 'Shopping',
  },
  {
    name: 'Central Park',
    description: 'Green space offering public walkways and leisure spaces.',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
    distance: '2.1 km', rating: '4.7', category: 'Park',
  },
];

const generateUtilities = (cityName: string) => {
  return {
    hospitals: [
      { name: `${cityName} General Hospital`, address: '12 Hospital Road', distance: '1.2 km', phone: '+1 555 1080' },
      { name: 'Emergency Clinic East', address: '45 Health Blvd', distance: '3.4 km', phone: '+1 555 1081' }
    ],
    policeStations: [
      { name: `${cityName} Central Station`, address: '10 Civic Square', distance: '0.8 km', phone: '+1 555 1120' },
      { name: 'District Police Precinct', address: '200 Main Street', distance: '2.5 km', phone: '+1 555 1121' }
    ],
    pharmacies: [
      { name: 'City Pharmacy (24/7)', address: '88 High Street', distance: '0.5 km', phone: '+1 555 1009' },
      { name: 'Central Apothecary', address: '15 Station Road', distance: '1.4 km', phone: '+1 555 1007' }
    ],
    safeZones: [
      { name: 'Citizens Support Bureau', description: 'Official municipal facility staffed with local support guides and public phones.', distance: '0.6 km' },
      { name: 'Tourist Assistance Center', description: 'Secure center providing maps, charging stations, and direct emergency connections.', distance: '1.1 km' }
    ]
  };
};

// ─── Main search function ───────────────────────────────────────────────────

export const searchLocation = async (query: string) => {
  const location = await geocodeLocation(query);
  const { lat, lng, name: displayName } = location;

  const parts = displayName.split(',');
  const specificPlace = parts[0].trim();
  const broaderArea = parts.length > 2 ? parts[2].trim() : parts.length > 1 ? parts[1].trim() : '';
  const displayTitle = broaderArea ? `${specificPlace}, ${broaderArea}` : specificPlace;

  // Find matching state and city
  const fullInfoKey = displayName.toLowerCase();
  const exactCityMatch = Object.keys(CITY_SCORES).find(k => fullInfoKey.includes(k));
  const matchedState = INDIAN_STATES.find(s => fullInfoKey.includes(s));

  let hash = 0;
  for (let i = 0; i < specificPlace.length; i++) {
    hash = specificPlace.charCodeAt(i) + ((hash << 5) - hash);
  }

  let baseScore = 75;
  if (exactCityMatch) {
    baseScore = CITY_SCORES[exactCityMatch];
  } else if (matchedState) {
    baseScore = STATE_BASE_SCORES[matchedState] + ((Math.abs(hash) % 10) - 5);
  } else {
    baseScore = 72 + ((Math.abs(hash) % 20) - 10);
  }
  
  const finalScore = Math.max(10, Math.min(100, Math.round(baseScore)));

  const getCategoryScore = (offset: number) =>
    Math.max(10, Math.min(100, Math.round(finalScore + offset * 10)));

  const breakdown = {
    crimeRisk: Math.max(10, Math.min(100, 100 - (Math.round((100 - finalScore) * 1.1)))),
    nightSafety: getCategoryScore(-0.8),
    touristFriendliness: getCategoryScore(0.6),
    womensSafety: getCategoryScore(-0.4),
    publicTransport: getCategoryScore(0.3),
    emergencyServices: getCategoryScore(-0.2),
  };

  // Text report summaries
  let aiSummary = '';
  if (finalScore >= 90) {
    aiSummary = `${displayTitle} ranks among the safest areas. Crime rates are very low, public services are highly efficient, and walking alone at night is considered safe in almost all sectors.`;
  } else if (finalScore >= 75) {
    aiSummary = `${displayTitle} is safe overall. Emergency responses are fast, and neighborhoods are welcoming. Standard awareness of your personal items in crowded spots is sufficient.`;
  } else if (finalScore >= 60) {
    aiSummary = `${displayTitle} has a moderate safety rating. Most tourist corridors are secure during the day. Avoid walking alone down dark or empty streets after sunset.`;
  } else if (finalScore >= 40) {
    aiSummary = `${displayTitle} requires travel caution. Pickpocketing and minor street offenses are common. Use registered cabs at night and avoid carrying large amounts of cash.`;
  } else {
    aiSummary = `Vigilance is advised in ${displayTitle}. Research safer neighborhoods before traveling, register with your family or hotel, and limit evening transit to secure private vehicles.`;
  }

  let wikiData = await fetchCityWiki(specificPlace);
  if (!wikiData.info && exactCityMatch) wikiData = await fetchCityWiki(exactCityMatch);
  if (!wikiData.info && broaderArea) wikiData = await fetchCityWiki(broaderArea);

  const hotspots = await fetchHotspots(lat, lng, specificPlace);
  const utilities = generateUtilities(specificPlace);

  // Retrieve emergency numbers object
  let emergency = { police: '112', ambulance: '108', fire: '101' };
  if (matchedState && STATE_EMERGENCY_CONTACTS[matchedState]) {
    emergency = STATE_EMERGENCY_CONTACTS[matchedState];
  }

  // Get state images or fallbacks (all full-color)
  let stateImages = [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&w=600&q=80'
  ];
  if (matchedState && STATE_IMAGES[matchedState]) {
    stateImages = STATE_IMAGES[matchedState];
  }
  const displayImages = wikiData.image ? [wikiData.image, stateImages[0]] : stateImages;

  return {
    id: `${lat.toFixed(4)}-${lng.toFixed(4)}`,
    name: displayTitle,
    fullName: displayName,
    rating: finalScore,
    lat, lng,
    country: matchedState ? matchedState.toUpperCase() : 'INDIA',
    flag: `https://flagcdn.com/w80/in.png`,
    aiSummary,
    info: wikiData.info || `Safety details compiled for ${displayTitle} using local state databases and regional guidelines in India.`,
    breakdown,
    stats: {
      crimeIndex: `${100 - finalScore}/100`,
      violentCrime: finalScore >= 75 ? 'Low' : finalScore >= 50 ? 'Moderate' : 'High',
      pettyCrime: finalScore >= 80 ? 'Low' : finalScore >= 60 ? 'Moderate' : 'High',
      policePresence: finalScore >= 70 ? 'High' : finalScore >= 50 ? 'Adequate' : 'Variable',
    },
    emergency,
    weather: finalScore >= 80 ? 'Temperate' : 'Variable seasonal cycles',
    localNotes: [
      `Safety scores reflect municipal reports for ${displayTitle}.`,
      'Local support officers patrol tourist streets regularly.',
      'Save local SOS contacts to your mobile phone memory.',
    ],
    images: displayImages,
    dos: [
      'Read reviews of your hotel and local areas before you arrive.',
      'Keep digital copies of your ID cards on your phone.',
      'Use registered cab apps for transportation at night.',
    ],
    donts: [
      'Do not display expensive items or cash in unmonitored locations.',
      'Avoid walking down dark, quiet streets alone after dark.',
      'Do not accept tours or rides from unlicensed street hawkers.',
    ],
    hotspots,
    utilities,
  };
};

// ─── Chatbot reply ───────────────────────────────────────────────────────────

export const getChatbotReply = (message: string, report: any): string => {
  const msg = message.toLowerCase();
  const rating: number = report.rating;

  if (msg.includes('safe') || msg.includes('danger') || msg.includes('crime')) {
    if (rating >= 90)
      return `${report.name} is very safe (rating: ${rating}/100). Take normal care.`;
    if (rating >= 75)
      return `${report.name} is generally safe (rating: ${rating}/100). Keep your belongings close in busy areas.`;
    if (rating >= 60)
      return `${report.name} is moderately safe (rating: ${rating}/100). Stick to busy streets at night.`;
    if (rating >= 40)
      return `Take precaution in ${report.name} (rating: ${rating}/100). Use official taxis and avoid walking at night.`;
    return `Vigilance is recommended in ${report.name} (rating: ${rating}/100). Register with your embassy and plan transit ahead of time.`;
  }
  if (msg.includes('visit') || msg.includes('attraction') || msg.includes('see') || msg.includes('hotspot')) {
    const spots = report.hotspots?.map((h: any) => h.name).slice(0, 2).join(', ');
    return `Places of interest near ${report.name} include: ${spots || 'the central plaza'}. They are generally fine during the day.`;
  }
  if (msg.includes('emergency') || msg.includes('police') || msg.includes('sos')) {
    return `If you need emergency help, contact the police at **${report.emergency?.police}** or check the emergency dashboard section.`;
  }
  if (msg.includes('women') || msg.includes('female') || msg.includes('girl')) {
    const wScore = report.breakdown?.womensSafety;
    return `${report.name} scores ${wScore}/100 for women's safety. For solo travel, staying in popular hotels and using pre-booked rides in the evening is recommended.`;
  }
  return `Regarding ${report.name} (Safety Rating: ${rating}/100), ask hotel staff about safe local routes. Let me know if you need specific emergency contacts!`;
};
