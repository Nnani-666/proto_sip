import React, { useState } from 'react';
import { Search, MapPin, Star } from 'lucide-react';

interface StateItem {
  name: string;
  safetyScore: number;
  touristRating: string;
  description: string;
  capital: string;
  safeZones: string;
  imageUrl: string;
}

interface StatesPageProps {
  onSelectState: (name: string) => void;
}

const StatesPage: React.FC<StatesPageProps> = ({ onSelectState }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const states: StateItem[] = [
    { 
      name: 'Goa', 
      safetyScore: 88, 
      touristRating: '4.8', 
      capital: 'Panaji', 
      safeZones: 'High safety', 
      description: 'A very popular coastal destination. Generally very safe for both domestic and international tourists, with active beach patrols and tourist assistance.',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Kerala', 
      safetyScore: 85, 
      touristRating: '4.7', 
      capital: 'Thiruvananthapuram', 
      safeZones: 'High safety', 
      description: 'Known for high social indices, hospitable local culture, clean environment, and extremely safe conditions for solo travelers.',
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Himachal Pradesh', 
      safetyScore: 87, 
      touristRating: '4.6', 
      capital: 'Shimla', 
      safeZones: 'High safety', 
      description: 'A peaceful mountain state with very low crime rates. Local communities are welcoming, and local tourism departments are highly supportive.',
      imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Sikkim', 
      safetyScore: 89, 
      touristRating: '4.8', 
      capital: 'Gangtok', 
      safeZones: 'High safety', 
      description: 'Extremely clean, organic, and well-managed state in northeast India. Known as one of the safest regions for solo female travelers.',
      imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Maharashtra', 
      safetyScore: 79, 
      touristRating: '4.4', 
      capital: 'Mumbai', 
      safeZones: 'Moderate safety', 
      description: 'Financial hub. Mumbai is widely recognized for having safe public transits and night environments, though standard caution is advised in crowded local trains.',
      imageUrl: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Karnataka', 
      safetyScore: 80, 
      touristRating: '4.3', 
      capital: 'Bengaluru', 
      safeZones: 'Moderate safety', 
      description: 'Tech capital of India. Generally safe with active night patrolling, though watch out for traffic congestion and negotiate auto-rickshaw fares in advance.',
      imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Rajasthan', 
      safetyScore: 76, 
      touristRating: '4.5', 
      capital: 'Jaipur', 
      safeZones: 'Moderate safety', 
      description: 'Rich historical sites. Safe in major tourist corridors, though visitors should be vigilant against persistent vendors and unregistered guides.',
      imageUrl: 'https://images.unsplash.com/photo-1477587458883-471a5ed94245?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Tamil Nadu', 
      safetyScore: 82, 
      touristRating: '4.4', 
      capital: 'Chennai', 
      safeZones: 'High safety', 
      description: 'Culturally vibrant and peaceful. Low crime rates and highly structured civil management in major cities like Chennai, Coimbatore, and Madurai.',
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Delhi', 
      safetyScore: 62, 
      touristRating: '4.1', 
      capital: 'New Delhi', 
      safeZones: 'Caution advised', 
      description: 'National capital territory. Home to incredible historical sites, but requires travelers to practice high vigilance, especially when returning late at night.',
      imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Uttarakhand', 
      safetyScore: 84, 
      touristRating: '4.6', 
      capital: 'Dehradun', 
      safeZones: 'High safety', 
      description: 'Land of Gods. Very safe pilgrim routes, peaceful Himalayan towns, and low urban crime rates across Rishikesh and Haridwar.',
      imageUrl: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Gujarat', 
      safetyScore: 86, 
      touristRating: '4.3', 
      capital: 'Gandhinagar', 
      safeZones: 'High safety', 
      description: 'Very low violent crime rate, dry state regulations, and exceptionally safe urban environments with night street food markets open late.',
      imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'West Bengal', 
      safetyScore: 75, 
      touristRating: '4.2', 
      capital: 'Kolkata', 
      safeZones: 'Moderate safety', 
      description: 'Cultural center. Kolkata is widely considered friendly and safe for solo travelers, though standard care should be taken in crowded bazaars and transport hubs.',
      imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const filteredStates = states.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.capital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Indian States
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Browse safety indices and guidelines by state in India.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search states..."
            className="w-full pl-9 bg-transparent border border-[var(--card-border)] focus:border-[var(--text-primary)] outline-none rounded-lg py-2 text-xs text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStates.map((s, idx) => (
          <div 
            key={idx}
            className="glass-panel flex flex-col justify-between overflow-hidden rounded-lg group"
          >
            {/* Image Container (Full color) */}
            <div className="relative h-48 overflow-hidden bg-neutral-900">
              <img 
                src={s.imageUrl} 
                alt={`${s.name} Landmark`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              
              {/* Score badge */}
              <span className="absolute top-3 right-3 text-[9px] font-bold bg-black text-white px-2 py-0.5 border border-neutral-800">
                {s.safetyScore} / 100
              </span>
            </div>

            {/* Content info */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {s.name}
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium">Capital City: {s.capital}</p>
                
                <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Actions & Rating */}
              <div className="pt-4 border-t border-[var(--card-border)] flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">Rating:</span>
                  <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    <Star size={12} className="fill-[var(--text-primary)] text-[var(--text-primary)]" />
                    {s.touristRating}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">Security Level:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {s.safeZones}
                  </span>
                </div>

                <button 
                  onClick={() => onSelectState(s.name)}
                  className="w-full mt-1 bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-color)] text-xs font-bold py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin size={12} />
                  View safety report
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredStates.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-[var(--text-secondary)]">
            No states found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatesPage;
