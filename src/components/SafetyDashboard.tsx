import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  ThumbsUp, 
  Phone, 
  CloudSun, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  User, 
  Compass, 
  Activity, 
  ExternalLink,
  Copy,
  Download,
  Share2,
  List,
  Building,
  Heart,
  Pill,
  BookOpen
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';

interface Hotspot {
  name: string;
  description: string;
  category: string;
  rating: string;
  distance: string;
  image?: string;
}

interface UtilityItem {
  name: string;
  address: string;
  distance: string;
  phone?: string;
  description?: string;
}

interface SafetyReport {
  id: string;
  name: string;
  fullName: string;
  rating: number;
  lat: number;
  lng: number;
  country: string;
  flag: string;
  info: string;
  aiSummary: string;
  breakdown: {
    crimeRisk: number;
    nightSafety: number;
    touristFriendliness: number;
    womensSafety: number;
    publicTransport: number;
    emergencyServices: number;
  };
  stats: {
    crimeIndex: string;
    violentCrime: string;
    pettyCrime: string;
    policePresence: string;
  };
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
  };
  weather: string;
  localNotes: string[];
  images: string[];
  dos: string[];
  donts: string[];
  hotspots: Hotspot[];
  utilities?: {
    hospitals: UtilityItem[];
    policeStations: UtilityItem[];
    pharmacies: UtilityItem[];
    safeZones: UtilityItem[];
  };
}

interface SafetyDashboardProps {
  data: SafetyReport;
}

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ data }) => {
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<number>(0);
  const [reportCopied, setReportCopied] = useState(false);

  // Progressive staggered entry of report sections
  useEffect(() => {
    setVisibleSections(0);
    const intervals = [100, 250, 400, 550, 700, 850, 1000, 1150];
    const timers = intervals.map((delay, index) => 
      setTimeout(() => {
        setVisibleSections(index + 1);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [data.id]);

  const getRatingLabel = (score: number) => {
    if (score >= 90) return 'Very Safe';
    if (score >= 75) return 'Safe';
    if (score >= 60) return 'Moderate Risk';
    if (score >= 40) return 'Caution';
    return 'High Risk';
  };

  const getRatingDescription = (score: number) => {
    if (score >= 90) return 'This area exhibits high general safety standards. Low crime rate, excellent public transport security, and helpful civil assistance.';
    if (score >= 75) return 'The location is secure for normal travel activities. Practice typical personal security measures in high-density corridors.';
    if (score >= 60) return 'Safety indicators are moderate. Standard precautions apply. Avoid walking alone down dark paths at late hours.';
    if (score >= 40) return 'Heightened awareness is advised. The area has higher rates of pickpocketing, scams, or transit offenses.';
    return 'Significant security warning. Limit outdoor activities to necessary transit, carry emergency devices, and remain in secure compounds.';
  };

  const categories = [
    { label: 'Crime rate', score: data.breakdown.crimeRisk, icon: ShieldAlert, desc: 'Incidence of property and physical safety offenses' },
    { label: 'Safety at night', score: data.breakdown.nightSafety, icon: Eye, desc: 'Perceived safety walking alone after dark' },
    { label: 'Tourist welcoming', score: data.breakdown.touristFriendliness, icon: Compass, desc: 'Local welcoming level and tourist support infrastructure' },
    { label: 'Safety for women', score: data.breakdown.womensSafety, icon: User, desc: 'General comfort index and local reports' },
    { label: 'Public transport', score: data.breakdown.publicTransport, icon: Activity, desc: 'Security measures on subways, bus networks, and depots' },
    { label: 'Emergency response', score: data.breakdown.emergencyServices, icon: Phone, desc: 'Civil service response times for medical and police units' },
  ];

  const handleScrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const copyReportText = () => {
    const text = `
SAFE TOUR TRAVEL SAFETY REPORT: ${data.name.toUpperCase()}
Score: ${data.rating}/100 - ${getRatingLabel(data.rating)}

SUMMARY:
${data.aiSummary}

OVERVIEW:
${data.info}

RISK BREAKDOWN:
- Crime rate: ${data.breakdown.crimeRisk}/100
- Safety at night: ${data.breakdown.nightSafety}/100
- Tourist welcoming: ${data.breakdown.touristFriendliness}/100
- Safety for women: ${data.breakdown.womensSafety}/100
- Public transport: ${data.breakdown.publicTransport}/100
- Emergency response: ${data.breakdown.emergencyServices}/100

EMERGENCY HELPLINES:
- Police: ${data.emergency.police}
- Ambulance: ${data.emergency.ambulance}
- Fire Department: ${data.emergency.fire}
    `.trim();
    navigator.clipboard.writeText(text);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2000);
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `SafeTour Report: ${data.name}`,
        text: `Travel safety assessment for ${data.name}: ${data.rating}/100 - ${getRatingLabel(data.rating)}.`,
        url: window.location.href,
      });
    } else {
      copyReportText();
      alert('Report details copied to share.');
    }
  };

  return (
    <div className="flex flex-col gap-8">

      {/* SECTION 1: LOCATION OVERVIEW */}
      {visibleSections >= 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
            Section 1
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-3">
            Location Overview
          </h3>
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  {data.name}
                </h2>
                <div className="border border-[var(--card-border)] px-2 py-0.5 rounded text-[10px] font-semibold text-[var(--text-secondary)] uppercase">
                  {data.country}
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                {data.info}
              </p>
            </div>
            
            <div className="flex gap-2 text-xs text-[var(--text-secondary)] shrink-0 bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded">
              <CloudSun size={14} className="text-[var(--text-primary)]" />
              <span>Weather: <strong>{data.weather}</strong></span>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 2: SAFETY SCORE */}
      {visibleSections >= 2 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
        >
          <div className="flex-1">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
              Section 2
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-3">
              Safety Score & Level
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xl">
              {getRatingDescription(data.rating)}
            </p>
          </div>
          
          <div className="shrink-0 border border-[var(--card-border)] p-5 rounded bg-[var(--card-bg)] min-w-[150px] flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-secondary)]">Area safety rating</span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-4xl font-black tracking-tighter text-[var(--text-primary)]">
                {data.rating}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">/ 100</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mt-1.5">
              {getRatingLabel(data.rating)}
            </span>
          </div>
        </motion.div>
      )}

      {/* SECTION 3: KEY FINDINGS */}
      {visibleSections >= 3 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
            Section 3
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-3">
            Key Findings
          </h3>
          <div className="flex items-start gap-3 p-3 border border-[var(--card-border)] rounded bg-[var(--card-bg)] text-xs text-[var(--text-primary)] leading-relaxed">
            <CheckCircle size={16} className="text-[var(--text-primary)] shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-1 font-bold">Safety Assessment Summary</strong>
              "{data.aiSummary}"
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 4: RISK FACTORS */}
      {visibleSections >= 4 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
            Section 4
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-4">
            Risk Factors & Safety Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, i) => (
              <div key={i} className="flex flex-col gap-1.5 p-3 border border-[var(--card-border)] rounded bg-[var(--card-bg)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)]">{cat.label}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{cat.score} / 100</span>
                </div>
                <div className="w-full h-1 bg-[var(--card-border)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--text-primary)]"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium leading-normal">{cat.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTION 5: SAFETY RECOMMENDATIONS */}
      {visibleSections >= 5 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Dos */}
          <div className="glass-panel p-6 border-t-2 border-t-[var(--text-primary)]">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
              Section 5A
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-4 flex items-center gap-1.5">
              <ThumbsUp size={14} />
              What to do
            </h3>
            <ul className="flex flex-col gap-3">
              {data.dos.map((item, idx) => (
                <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-[var(--text-secondary)]">
                  <span className="text-[var(--text-primary)] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="glass-panel p-6 border-t-2 border-t-[var(--text-primary)]">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
              Section 5B
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-4 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              What to avoid
            </h3>
            <ul className="flex flex-col gap-3">
              {data.donts.map((item, idx) => (
                <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-[var(--text-secondary)]">
                  <span className="text-[var(--text-primary)] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* SECTION 6: NEARBY EMERGENCY RESOURCES */}
      {visibleSections >= 6 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
            Section 6
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-4">
            Local Emergency & Support Services
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Hospitals */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider flex items-center gap-1">
                <Heart size={10} /> Medical / Hospitals
              </span>
              <div className="flex flex-col gap-2">
                {data.utilities?.hospitals.map((item, idx) => (
                  <div key={idx} className="p-2.5 border border-[var(--card-border)] rounded bg-[var(--card-bg)] text-xs">
                    <strong className="text-[var(--text-primary)] block">{item.name}</strong>
                    <span className="text-[var(--text-secondary)] block mt-0.5">{item.address} ({item.distance})</span>
                    <a href={`tel:${item.phone}`} className="text-[var(--text-primary)] underline font-semibold mt-1 block">Call: {item.phone}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Police */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider flex items-center gap-1">
                <ShieldAlert size={10} /> Police Stations
              </span>
              <div className="flex flex-col gap-2">
                {data.utilities?.policeStations.map((item, idx) => (
                  <div key={idx} className="p-2.5 border border-[var(--card-border)] rounded bg-[var(--card-bg)] text-xs">
                    <strong className="text-[var(--text-primary)] block">{item.name}</strong>
                    <span className="text-[var(--text-secondary)] block mt-0.5">{item.address} ({item.distance})</span>
                    <a href={`tel:${item.phone}`} className="text-[var(--text-primary)] underline font-semibold mt-1 block">Call: {item.phone}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Pharmacies */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider flex items-center gap-1">
                <Pill size={10} /> Pharmacies (24/7)
              </span>
              <div className="flex flex-col gap-2">
                {data.utilities?.pharmacies.map((item, idx) => (
                  <div key={idx} className="p-2.5 border border-[var(--card-border)] rounded bg-[var(--card-bg)] text-xs">
                    <strong className="text-[var(--text-primary)] block">{item.name}</strong>
                    <span className="text-[var(--text-secondary)] block mt-0.5">{item.address} ({item.distance})</span>
                    <span className="text-[var(--text-secondary)] block mt-0.5">Call: {item.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Zones */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider flex items-center gap-1">
                <List size={10} /> Public Safe Zones
              </span>
              <div className="flex flex-col gap-2">
                {data.utilities?.safeZones.map((item, idx) => (
                  <div key={idx} className="p-2.5 border border-[var(--card-border)] rounded bg-[var(--card-bg)] text-xs">
                    <strong className="text-[var(--text-primary)] block">{item.name}</strong>
                    <span className="text-[var(--text-secondary)] block mt-0.5 leading-relaxed mt-0.5">{item.description}</span>
                    <span className="text-[var(--text-primary)] font-bold mt-1 block">Distance: {item.distance}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* SECTION 7: DETAILED ANALYSIS */}
      {visibleSections >= 7 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Detailed stats */}
          <div className="lg:col-span-6 glass-panel p-6 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
                Section 7A
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-3">
                Local Risk Indicators
              </h3>
              <div className="flex flex-col gap-3 mt-4 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-secondary)]">Crime Index (Scaled):</span>
                  <span className="font-bold text-[var(--text-primary)]">{data.stats.crimeIndex}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-secondary)]">Violent Offenses Index:</span>
                  <span className="font-bold text-[var(--text-primary)]">{data.stats.violentCrime}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-secondary)]">Petty Offenses Index:</span>
                  <span className="font-bold text-[var(--text-primary)]">{data.stats.pettyCrime}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-secondary)]">Security Officer Presence:</span>
                  <span className="font-bold text-[var(--text-primary)]">{data.stats.policePresence}</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 border border-[var(--card-border)] rounded bg-[var(--card-bg)] text-xs text-[var(--text-secondary)] leading-relaxed mt-2">
              <strong className="text-[var(--text-primary)] block mb-0.5">Emergency SOS</strong>
              Country police SOS number: <strong className="text-[var(--text-primary)]">{data.emergency.police}</strong>. Access the persistent "Emergency SOS" button in the navigation header to register trusted contacts.
            </div>
          </div>

          {/* Interactive Map */}
          <div ref={mapSectionRef} className="lg:col-span-6 glass-panel p-6 flex flex-col justify-between gap-4 h-full no-print">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
                Section 7B
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-3">
                Local Area Security Map
              </h3>
            </div>
            
            <InteractiveMap 
              lat={data.lat}
              lng={data.lng}
              locationName={data.name}
              safetyRating={data.rating}
              hotspots={data.hotspots}
            />
          </div>
        </motion.div>
      )}

      {/* SECTION 8: SOURCES AND REFERENCES */}
      {visibleSections >= 8 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)] block mb-1">
            Section 8
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 mb-3 flex items-center gap-1.5">
            <BookOpen size={14} />
            Sources and References
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            This report aggregates data sourced from open public registries, mapping archives, and municipal indexes:
          </p>
          <ul className="list-disc pl-5 mt-3 text-[10px] text-[var(--text-secondary)] flex flex-col gap-1">
            <li><strong>Geocoding Indexes</strong>: OpenStreetMap Nominatim API under Open Database License (ODbL).</li>
            <li><strong>Regional Statistics</strong>: Wikipedia Content APIs under Creative Commons Attribution-ShareAlike License.</li>
            <li><strong>Global Embassy Advisories</strong>: Integrated country code indices mapping.</li>
          </ul>
        </motion.div>
      )}

      {/* Places of Interest */}
      {visibleSections >= 8 && (
        <div className="flex flex-col gap-4 mt-4 no-print">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wider">Places of interest</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Explore sightseeing locations near {data.name}. Mapped on local map.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.hotspots.map((spot, i) => (
              <div 
                key={i}
                className="glass-panel flex flex-col justify-between overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-neutral-900">
                  <img 
                    src={spot.image || `https://images.unsplash.com/photo-${1500000000000 + (i * 10000)}?auto=format&fit=crop&w=400&q=80`}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-[9px] font-bold tracking-wider uppercase bg-black text-white px-2 py-0.5 border border-neutral-800">
                    {spot.category}
                  </span>
                  <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 bg-black text-white border border-neutral-800">
                    Rating: {spot.rating}
                  </span>
                </div>

                {/* Info content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{spot.name}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>

                  {/* Footer specs */}
                  <div className="pt-2.5 border-t border-[var(--card-border)] flex justify-between items-center text-[10px]">
                    <span className="text-[var(--text-secondary)] font-medium">{spot.distance} away</span>
                    <button 
                      onClick={handleScrollToMap}
                      className="text-[var(--text-primary)] hover:underline font-bold flex items-center gap-0.5 group/btn cursor-pointer"
                    >
                      View on Map
                      <ExternalLink size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default SafetyDashboard;
