import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Info, AlertTriangle } from 'lucide-react';

interface HeatMapState {
  name: string;
  score: number;
  description: string;
}

const HEATMAP_DATA: HeatMapState[] = [
  { name: 'Sikkim', score: 89, description: 'Very Safe. Clean, organic mountain state. Excellent safety index for solo female travelers.' },
  { name: 'Goa', score: 88, description: 'Very Safe. Active beach patrols, high tourist presence, and good local assistance.' },
  { name: 'Himachal Pradesh', score: 87, description: 'Very Safe. Peaceful mountain communities with extremely low crime rates.' },
  { name: 'Gujarat', score: 86, description: 'Very Safe. Exceptionally low crime rates, safe night markets, and structured law enforcement.' },
  { name: 'Kerala', score: 85, description: 'Very Safe. High social and literacy indices, hospitable culture, and tourist support.' },
  { name: 'Uttarakhand', score: 84, description: 'Very Safe. Safe pilgrim routes and peaceful Himalayan tourist towns.' },
  { name: 'Tamil Nadu', score: 82, description: 'Safe. Peaceful and well-policed cities like Chennai, Coimbatore, and Madurai.' },
  { name: 'Telangana', score: 79, description: 'Safe. Hyderabad has active police patrols and a well-monitored environment. Practice standard safety precautions.' },
  { name: 'Karnataka', score: 80, description: 'Safe. Bengaluru and heritage sites are active with regular evening police patrols.' },
  { name: 'Maharashtra', score: 79, description: 'Safe. High security in Mumbai and Pune, though take standard precautions in crowded local trains.' },
  { name: 'Andhra Pradesh', score: 78, description: 'Safe. Vizag and Tirupati have well-structured visitor facilities and active municipal police.' },
  { name: 'Punjab', score: 78, description: 'Safe. Warm hospitality and active local police support in tourist spots like Amritsar.' },
  { name: 'Rajasthan', score: 76, description: 'Safe. Rich history, though tourists should watch out for unregistered guides and vendors.' },
  { name: 'West Bengal', score: 75, description: 'Safe. Welcoming environment, though vigilance is advised in crowded markets and transit hubs.' },
  { name: 'Madhya Pradesh', score: 74, description: 'Safe. Central national parks and temples are well-managed. Practice standard caution.' },
  { name: 'Haryana', score: 72, description: 'Safe. Practice general safety awareness, especially in highway zones and late night transit.' },
  { name: 'Chhattisgarh', score: 71, description: 'Safe. Rich biodiversity and tribal culture. Stick to main transit routes.' },
  { name: 'Assam', score: 70, description: 'Safe. Standard precautions apply. Mapped safety indices are stable in main travel zones.' },
  { name: 'Odisha', score: 76, description: 'Safe. Peaceful temple towns like Bhubaneswar and Puri with helpful tourist guides.' },
  { name: 'Jharkhand', score: 68, description: 'Moderate Risk. Stick to daytime travel and use registered private transport in city centers.' },
  { name: 'Uttar Pradesh', score: 68, description: 'Moderate Risk. Safe in main heritage spots like Agra (Taj Mahal), but keep higher vigilance.' },
  { name: 'Jammu and Kashmir', score: 65, description: 'Moderate Risk. Beautiful valley areas are heavily policed; verify local advisories before traveling.' },
  { name: 'Delhi', score: 62, description: 'Moderate Risk. High vigilance is required, especially at late hours and in isolated locations.' },
  { name: 'Bihar', score: 60, description: 'Moderate Risk. Keep track of travel timings and stick to registered private transport.' }
];

const HeatMapPage: React.FC = () => {
  const center: [number, number] = [22.9734, 78.6569]; // Center of India
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load India GeoJSON:', err);
        setLoading(false);
      });
  }, []);

  const getSafetyColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald Green
    if (score >= 70) return '#f59e0b'; // Amber Gold
    return '#f43f5e'; // Rose Red
  };

  const getSafetyLabel = (score: number) => {
    if (score >= 80) return 'High Safety';
    if (score >= 70) return 'Moderate Safety';
    return 'Caution Advised';
  };

  const onEachFeature = (feature: any, layer: any) => {
    const rawStateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.state || '';
    const stateName = rawStateName.trim();

    const matchedState = HEATMAP_DATA.find(s => {
      const s1 = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const s2 = stateName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!s2 || !s1) return false;
      return s1 === s2 || s1.includes(s2) || s2.includes(s1);
    });

    if (matchedState) {
      const color = getSafetyColor(matchedState.score);
      layer.setStyle({
        fillColor: color,
        fillOpacity: 0.45,
        color: '#000000',
        opacity: 1.0,
        weight: 2.5
      });

      // Bind detailed popup
      layer.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid var(--card-border); padding-bottom: 4px;">
            <strong style="font-size: 13px; color: var(--text-primary);">${matchedState.name}</strong>
            <span style="font-size: 9px; font-weight: bold; background: ${color}; color: #ffffff; padding: 2px 6px; border-radius: 3px;">
              ${matchedState.score}/100
            </span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
            Status: ${getSafetyLabel(matchedState.score)}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; font-weight: 500;">
            ${matchedState.description}
          </div>
        </div>
      `);

      // Hover triggers
      layer.on({
        mouseover: (e: any) => {
          const l = e.target;
          l.setStyle({
            fillOpacity: 0.65,
            weight: 3.5,
            color: '#000000',
            opacity: 1.0
          });
        },
        mouseout: (e: any) => {
          const l = e.target;
          l.setStyle({
            fillOpacity: 0.45,
            weight: 2.5,
            color: '#000000',
            opacity: 1.0
          });
        }
      });
    } else {
      // Fallback styling for Union Territories or regions with no data
      layer.setStyle({
        fillColor: '#888888',
        fillOpacity: 0.1,
        color: '#000000',
        opacity: 1.0,
        weight: 2.5
      });
      layer.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
          <strong style="font-size: 12px; color: var(--text-primary);">${stateName}</strong>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; margin-bottom: 0;">
            Safety guidelines are managed under general national index.
          </p>
        </div>
      `);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Safety Heat Map
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Interactive geographical visualization of safety indices styled to state boundaries.
        </p>
      </div>

      {/* Grid Layout: Map & Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Map Container */}
        <div className="lg:col-span-9 glass-panel p-4 h-[550px] relative z-1 flex items-center justify-center">
          {loading ? (
            <div className="text-center flex flex-col gap-3">
              <div className="w-8 h-8 border-2 border-[var(--text-primary)] border-t-transparent rounded-full mx-auto animate-spin" />
              <p className="text-xs text-[var(--text-secondary)] font-medium">Loading geographical boundaries...</p>
            </div>
          ) : (
            <div className="w-full h-full rounded-lg overflow-hidden border border-[var(--card-border)] relative">
              <MapContainer 
                center={center} 
                zoom={5} 
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {geoJsonData && (
                  <GeoJSON 
                    data={geoJsonData} 
                    onEachFeature={onEachFeature}
                  />
                )}
              </MapContainer>
            </div>
          )}
        </div>

        {/* Sidebar Legend and Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6 justify-between">
          
          {/* Legend Panel */}
          <div className="glass-panel p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
              Map Legend
            </h3>
            
            <div className="flex flex-col gap-3.5 mt-2">
              <div className="flex items-start gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] shrink-0 mt-0.5 opacity-80" />
                <div className="text-xs">
                  <strong className="text-[var(--text-primary)] block">High Safety (80+)</strong>
                  <span className="text-[var(--text-secondary)]">Area is secure. Standard caution is sufficient.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shrink-0 mt-0.5 opacity-80" />
                <div className="text-xs">
                  <strong className="text-[var(--text-primary)] block">Moderate Safety (70-79)</strong>
                  <span className="text-[var(--text-secondary)]">Generally safe. Avoid unlit regions late at night.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#f43f5e] shrink-0 mt-0.5 opacity-80" />
                <div className="text-xs">
                  <strong className="text-[var(--text-primary)] block">Caution Advised (&lt; 70)</strong>
                  <span className="text-[var(--text-secondary)]">Vigilance is recommended. Pre-plan travel transit.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Summary Panel */}
          <div className="glass-panel p-5 flex flex-col gap-3">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-secondary)]">Safety Tip</span>
            <div className="flex gap-2 items-start text-xs text-[var(--text-secondary)] leading-relaxed">
              <Info size={14} className="text-[var(--text-primary)] shrink-0 mt-0.5" />
              <span>
                Click inside any state's border boundary to view detailed scores, classification levels, and safety notes.
              </span>
            </div>
          </div>

          {/* Dangerous Zones Disclaimer */}
          <div className="glass-panel p-5 border-l-2 border-l-red-500 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
              <AlertTriangle size={13} className="text-red-500" />
              General Disclaimer
            </h4>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Geographical indicators are based on aggregated statistics. Localized safety can vary widely between cities and neighborhoods within the same state.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default HeatMapPage;
