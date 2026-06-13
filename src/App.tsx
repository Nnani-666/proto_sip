import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  MessageSquare, 
  Crosshair, 
  Sun, 
  Moon, 
  MapPin, 
  Mail, 
  Globe,
  AlertOctagon,
  Copy,
  Share2,
  ExternalLink,
  Phone,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLocation } from './services/safetyService';
import SafetyDashboard from './components/SafetyDashboard';
import Chatbot from './components/Chatbot';
import HeatMapPage from './components/HeatMapPage';
import StatesPage from './components/StatesPage';
import AuthModal from './components/AuthModal';
import { useAuth, AuthProvider } from './context/AuthContext';

function AppContent() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'home' | 'heatmap' | 'states'>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Auth State
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Search & Safety Report State
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // SOS Panel State
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosLocation, setSosLocation] = useState<any>(null);
  const [sosTime, setSosTime] = useState('');
  const [trustedContacts, setTrustedContacts] = useState<{ name: string; phone: string }[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [sosCopied, setSosCopied] = useState(false);

  // Load theme, recent searches, and trusted contacts on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('color-scheme') || 'light';
    setTheme(savedTheme as 'dark' | 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    const savedSearches = localStorage.getItem('guest_searches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const savedContacts = localStorage.getItem('trusted_contacts');
    if (savedContacts) {
      setTrustedContacts(JSON.parse(savedContacts));
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem('color-scheme', nextTheme);
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setIsSearching(true);
    setErrorMsg('');
    setLocationData(null);
    setCurrentPage('home');

    try {
      const data = await searchLocation(searchQuery);
      setLocationData(data);
      
      const updatedSearches = [data.name, ...recentSearches.filter((s: string) => s !== data.name)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('guest_searches', JSON.stringify(updatedSearches));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Location safety search failed.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    setIsSearching(true);
    setSearchStep(1);
    setErrorMsg('');
    setQuery('');
    setLocationData(null);
    setCurrentPage('home');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
              headers: { 'User-Agent': 'SafeTour-App-V2' }
            });
            const data = await res.json();
            const cityName = data?.address?.city || data?.address?.town || data?.address?.state || data?.address?.country || "New York";
            handleSearch(cityName);
          } catch (err) {
            console.error('Reverse geocode failed', err);
            handleSearch('New York');
          }
        },
        (error) => {
          console.warn('Geolocation blocked or failed.', error);
          handleSearch('New York');
        }
      );
    } else {
      handleSearch('New York');
    }
  };

  // SOS Panel trigger effect
  useEffect(() => {
    if (isSosOpen) {
      setSosTime(new Date().toLocaleString());
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
                headers: { 'User-Agent': 'SafeTour-App-V2' }
              });
              const data = await res.json();
              const country = data?.address?.country || 'USA';
              const name = data?.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              
              const cKey = country.toLowerCase();
              const EMERGENCY_CONTACTS: any = {
                'india': { police: '112', ambulance: '108', fire: '101' },
                'united states': { police: '911', ambulance: '911', fire: '911' },
                'usa': { police: '911', ambulance: '911', fire: '911' },
                'united kingdom': { police: '999', ambulance: '999', fire: '999' },
                'uk': { police: '999', ambulance: '999', fire: '999' },
                'australia': { police: '000', ambulance: '000', fire: '000' },
                'japan': { police: '110', ambulance: '119', fire: '119' },
                'switzerland': { police: '117', ambulance: '144', fire: '118' },
              };
              
              const exactKey = Object.keys(EMERGENCY_CONTACTS).find(k => cKey.includes(k)) || 'united states';
              const emergency = EMERGENCY_CONTACTS[exactKey];

              setSosLocation({
                name,
                lat: latitude,
                lng: longitude,
                emergency
              });
            } catch (err) {
              setSosLocation({
                name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                lat: latitude,
                lng: longitude,
                emergency: { police: '911', ambulance: '911', fire: '911' }
              });
            }
          },
          (err) => {
            if (locationData) {
              setSosLocation({
                name: locationData.name,
                lat: locationData.lat,
                lng: locationData.lng,
                emergency: locationData.emergency
              });
            } else {
              setSosLocation({
                name: 'New York, USA',
                lat: 40.7128,
                lng: -74.0060,
                emergency: { police: '911', ambulance: '911', fire: '911' }
              });
            }
          }
        );
      }
    }
  }, [isSosOpen, locationData]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const list = [...trustedContacts, { name: newContactName.trim(), phone: newContactPhone.trim() }];
    setTrustedContacts(list);
    localStorage.setItem('trusted_contacts', JSON.stringify(list));
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveContact = (index: number) => {
    const list = trustedContacts.filter((_, idx) => idx !== index);
    setTrustedContacts(list);
    localStorage.setItem('trusted_contacts', JSON.stringify(list));
  };



  const generatedSosMsg = sosLocation 
    ? `I need assistance. My current location is ${sosLocation.name} (${sosLocation.lat.toFixed(4)}, ${sosLocation.lng.toFixed(4)}). Please contact me immediately.`
    : `I need assistance. Please contact me immediately.`;

  const copySosMessage = () => {
    navigator.clipboard.writeText(generatedSosMsg);
    setSosCopied(true);
    setTimeout(() => setSosCopied(false), 2000);
  };

  return (
    <>
      <div className="app-background"></div>
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-[var(--card-border)] bg-[var(--navbar-bg)] z-[1000] no-print">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          <button 
            onClick={() => { setCurrentPage('home'); setLocationData(null); }}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <Shield size={20} className="text-[var(--text-primary)]" />
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] uppercase">
              SafeTour
            </span>
          </button>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
            {(['home', 'heatmap', 'states'] as const).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  if (page !== 'home') setLocationData(null);
                }}
                className={`capitalize transition-colors cursor-pointer ${
                  currentPage === page 
                    ? 'text-[var(--text-primary)] font-bold border-b border-[var(--text-primary)] pb-0.5' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {page === 'heatmap' ? 'heat map' : page}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded border border-[var(--card-border)] hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--text-primary)] border-r border-[var(--card-border)] pr-3 font-mono">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="bg-transparent hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] border border-[var(--card-border)] py-1.5 px-3 rounded text-[11px] font-bold uppercase transition-all cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-black dark:bg-white text-white dark:text-black py-1.5 px-3.5 rounded text-[11px] font-bold uppercase hover:opacity-90 transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col gap-10 min-h-screen">
        <AnimatePresence mode="wait">
          
          {/* HOME PAGE VIEW */}
          {currentPage === 'home' && (
            <motion.div 
              key="home-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-8"
            >
              {/* Landing Page Content */}
              {!locationData && !loading && !isSearching && (
                <div className="max-w-xl mx-auto w-full text-center flex flex-col gap-8 py-12">
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      SafeTour Portal
                    </span>
                    <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight uppercase">
                      SafeTour
                    </h1>
                    <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                      Location Safety Analysis and Travel Risk Assessment
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed mt-2">
                      Analyze the safety of an area using location information, public data, and safety insights.
                    </p>
                  </div>

                  {/* Search Form */}
                  <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search city, area or country..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none py-3 px-4 rounded text-sm transition-colors text-[var(--text-primary)] text-center font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button" 
                        onClick={handleCurrentLocation}
                        className="bg-transparent hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] border border-[var(--card-border)] py-2.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase"
                      >
                        <Crosshair size={13} /> GPS Detect
                      </button>
                      <button 
                        type="submit"
                        className="bg-black dark:bg-white text-white dark:text-black py-2.5 px-3 rounded text-xs font-bold hover:opacity-90 transition-all cursor-pointer uppercase"
                      >
                        Search Area
                      </button>
                    </div>
                  </form>

                  {/* SOS Button on Main Welcome Page */}
                  <div className="border-t border-[var(--card-border)] pt-6 flex justify-center items-center">
                    <button 
                      type="button"
                      onClick={() => setIsSosOpen(true)}
                      className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white font-black tracking-wider transition-all cursor-pointer flex items-center justify-center text-lg border-2 border-red-700 shadow-lg shadow-red-900/20 active:scale-95"
                    >
                      SOS
                    </button>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-[var(--card-border)] pt-6 text-left">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                        Recent safety searches
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {recentSearches.map((search, i) => (
                          <button 
                            key={i}
                            onClick={() => handleSearch(search)}
                            className="flex items-center gap-1 bg-transparent hover:bg-[var(--card-hover-bg)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded border border-[var(--card-border)] transition-colors cursor-pointer"
                          >
                            <MapPin size={10} />
                            {search.split(',')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Examples */}
                  <div className="flex flex-col gap-2 text-left">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                      Quick risk report examples
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Tokyo', 'Zurich', 'Singapore', 'New York', 'New Delhi', 'Rio de Janeiro'].map((city, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(city)}
                          className="bg-transparent hover:bg-[var(--card-hover-bg)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded border border-[var(--card-border)] transition-all cursor-pointer"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search loading animation */}
              {isSearching && (
                <div className="py-24 text-center">
                  <div className="w-8 h-8 border border-[var(--text-primary)] border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)] font-medium">
                    Searching safety records...
                  </p>
                </div>
              )}

              {/* Error box */}
              {errorMsg && (
                <div className="glass-panel p-6 rounded border border-[var(--card-border)] text-center max-w-xl mx-auto my-12">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Location assessment failed</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">{errorMsg}</p>
                  <button 
                    onClick={() => setErrorMsg('')}
                    className="mt-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold py-2 px-4 rounded cursor-pointer"
                  >
                    Clear and retry
                  </button>
                </div>
              )}

              {/* Safety Dashboard Output */}
              {locationData && !loading && !errorMsg && (
                <div className="flex flex-col gap-4">
                  {/* Search Bar header so the user can easily re-search */}
                  <div className="glass-panel p-4 rounded flex flex-col md:flex-row gap-3 items-center justify-between no-print">
                    <span className="text-xs font-bold text-[var(--text-secondary)] hidden md:inline ml-2">
                      Safety assessment ready
                    </span>
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto md:min-w-[450px]">
                      <input 
                        type="text" 
                        placeholder="Search another location..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent py-2 px-4 rounded text-xs border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none text-[var(--text-primary)]"
                        required
                      />
                      <button 
                        type="submit"
                        className="bg-black dark:bg-white text-white dark:text-black font-bold py-2 px-4 rounded text-xs shrink-0 cursor-pointer"
                      >
                        Search
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCurrentLocation}
                        className="bg-transparent hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] border border-[var(--card-border)] p-2 rounded cursor-pointer"
                        title="Use GPS Location"
                      >
                        <Crosshair size={14} />
                      </button>
                    </form>
                  </div>
                  
                  <SafetyDashboard data={locationData} />
                </div>
              )}
            </motion.div>
          )}

          {/* HEAT MAP PAGE VIEW */}
          {currentPage === 'heatmap' && (
            <motion.div 
              key="heatmap-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <HeatMapPage />
            </motion.div>
          )}

          {/* STATES PAGE VIEW */}
          {currentPage === 'states' && (
            <motion.div 
              key="states-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <StatesPage onSelectState={handleSearch} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating AI Chatbot Assistant */}
      <AnimatePresence>
        {!isChatOpen && locationData && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black shadow-lg z-[1000] cursor-pointer no-print"
            title="Chat with Local Guide"
          >
            <MessageSquare size={20} />
          </motion.button>
        )}

        {isChatOpen && locationData && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[1050] w-80 sm:w-96 h-[500px] no-print"
          >
             <Chatbot location={locationData} onClose={() => setIsChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Panel slide-drawer */}
      <AnimatePresence>
        {isSosOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSosOpen(false)}
              className="fixed inset-0 bg-black z-[1999] no-print"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[var(--bg-color)] border-l border-[var(--card-border)] z-[2000] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between no-print"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)]">
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <AlertOctagon size={18} />
                    <span className="font-bold text-sm uppercase tracking-wider">Emergency SOS</span>
                  </div>
                  <button 
                    onClick={() => setIsSosOpen(false)}
                    className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Section 1: EMERGENCY CONTACTS */}
                <div className="py-4 border-b border-[var(--card-border)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Section 1: Local emergency numbers
                  </span>
                  
                  {sosLocation ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs p-2 border border-[var(--card-border)] rounded bg-[var(--card-bg)]">
                        <span className="font-bold">Police:</span>
                        <div className="flex gap-2">
                          <a href={`tel:${sosLocation.emergency.police}`} className="bg-black text-white px-2 py-0.5 rounded text-[10px] hover:opacity-90">Call ({sosLocation.emergency.police})</a>
                          <button 
                            onClick={() => navigator.clipboard.writeText(sosLocation.emergency.police)}
                            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs p-2 border border-[var(--card-border)] rounded bg-[var(--card-bg)]">
                        <span className="font-bold">Ambulance:</span>
                        <div className="flex gap-2">
                          <a href={`tel:${sosLocation.emergency.ambulance}`} className="bg-black text-white px-2 py-0.5 rounded text-[10px] hover:opacity-90">Call ({sosLocation.emergency.ambulance})</a>
                          <button 
                            onClick={() => navigator.clipboard.writeText(sosLocation.emergency.ambulance)}
                            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs p-2 border border-[var(--card-border)] rounded bg-[var(--card-bg)]">
                        <span className="font-bold">Fire Department:</span>
                        <div className="flex gap-2">
                          <a href={`tel:${sosLocation.emergency.fire}`} className="bg-black text-white px-2 py-0.5 rounded text-[10px] hover:opacity-90">Call ({sosLocation.emergency.fire})</a>
                          <button 
                            onClick={() => navigator.clipboard.writeText(sosLocation.emergency.fire)}
                            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)] mt-2">Locating emergency numbers...</p>
                  )}
                </div>

                {/* Section 2: QUICK ACTIONS */}
                <div className="py-4 border-b border-[var(--card-border)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Section 2: Quick actions
                  </span>
                  
                  {sosLocation ? (
                    <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                      <a 
                        href={`tel:${sosLocation.emergency.police}`}
                        className="border border-[var(--card-border)] p-2.5 rounded bg-[var(--card-bg)] hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] text-xs font-semibold"
                      >
                        Call emergency
                      </a>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(sosLocation.name);
                          alert('Address copied to clipboard.');
                        }}
                        className="border border-[var(--card-border)] p-2.5 rounded bg-[var(--card-bg)] hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
                      >
                        Copy address
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: 'My Location', text: generatedSosMsg });
                          } else {
                            copySosMessage();
                            alert('Location details copied to clipboard.');
                          }
                        }}
                        className="border border-[var(--card-border)] p-2.5 rounded bg-[var(--card-bg)] hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
                      >
                        Share location
                      </button>
                      <a 
                        href={`https://www.google.com/maps?q=${sosLocation.lat},${sosLocation.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-[var(--card-border)] p-2.5 rounded bg-[var(--card-bg)] hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] text-xs font-semibold"
                      >
                        Open in Maps
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)] mt-2">Checking services...</p>
                  )}
                </div>

                {/* Section 3: LOCATION DETAILS */}
                <div className="py-4 border-b border-[var(--card-border)] text-xs flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Section 3: Coordinates and details
                  </span>
                  {sosLocation ? (
                    <>
                      <div className="mt-2"><strong className="text-[var(--text-primary)]">Location:</strong> <span className="text-[var(--text-secondary)]">{sosLocation.name}</span></div>
                      <div><strong className="text-[var(--text-primary)]">Latitude:</strong> <span className="text-[var(--text-secondary)]">{sosLocation.lat.toFixed(5)}</span></div>
                      <div><strong className="text-[var(--text-primary)]">Longitude:</strong> <span className="text-[var(--text-secondary)]">{sosLocation.lng.toFixed(5)}</span></div>
                      <div><strong className="text-[var(--text-primary)]">As of:</strong> <span className="text-[var(--text-secondary)]">{sosTime}</span></div>
                    </>
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)] mt-2">Retrieving coordinates...</p>
                  )}
                </div>

                {/* Section 4: EMERGENCY MESSAGE GENERATOR */}
                <div className="py-4 border-b border-[var(--card-border)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Section 4: Message generator
                  </span>
                  <div className="mt-2 p-3 border border-[var(--card-border)] rounded bg-[var(--card-bg)] text-xs font-mono text-[var(--text-secondary)] break-words">
                    {generatedSosMsg}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    <button 
                      onClick={copySosMessage}
                      className="bg-black dark:bg-white text-white dark:text-black py-2 rounded text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy size={12} />
                      {sosCopied ? 'Copied' : 'Copy'}
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ text: generatedSosMsg });
                        } else {
                          copySosMessage();
                          alert('SOS message copied to clipboard.');
                        }
                      }}
                      className="border border-[var(--card-border)] py-2 rounded text-xs font-bold hover:bg-[var(--card-hover-bg)] flex items-center justify-center gap-1 cursor-pointer text-[var(--text-primary)]"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                  </div>
                </div>

                {/* Section 5: TRUSTED CONTACTS */}
                <div className="py-4 border-b border-[var(--card-border)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Section 5: Trusted contacts
                  </span>

                  <form onSubmit={handleAddContact} className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="Name" 
                      className="flex-1 bg-transparent border border-[var(--card-border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none"
                    />
                    <input 
                      type="text" 
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="Phone" 
                      className="flex-1 bg-transparent border border-[var(--card-border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none"
                    />
                    <button 
                      type="submit"
                      className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-xs font-bold hover:opacity-90"
                    >
                      Add
                    </button>
                  </form>

                  {trustedContacts.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3">
                      {trustedContacts.map((contact, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 border border-[var(--card-border)] rounded bg-[var(--card-bg)]">
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">{contact.name}</span>
                            <span className="text-[var(--text-secondary)] ml-2">{contact.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a 
                              href={`sms:${contact.phone}?body=${encodeURIComponent(generatedSosMsg)}`}
                              className="bg-black text-white px-2 py-0.5 rounded text-[10px]"
                            >
                              SMS
                            </a>
                            <button 
                              onClick={() => handleRemoveContact(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: SAFETY NOTICE */}
              <div className="pt-4 mt-4 text-[10px] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--card-border)] bg-[var(--card-bg)] p-3 rounded">
                <strong className="text-[var(--text-primary)] block mb-1">Section 6: Notice</strong>
                Use SOS only in genuine emergencies. Contact local emergency services immediately if you are in danger.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
