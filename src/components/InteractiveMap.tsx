import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issues in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Delete default _getIconUrl to avoid issues
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Hotspot {
  name: string;
  description: string;
  category: string;
  rating: string;
  distance: string;
}

interface InteractiveMapProps {
  lat: number;
  lng: number;
  locationName: string;
  safetyRating: number;
  hotspots: Hotspot[];
}

// Custom component to dynamically pan/zoom map when location coordinates change
const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ lat, lng, locationName, safetyRating, hotspots }) => {
  const center: [number, number] = [lat, lng];

  const safetyColor = '#7f7f7f'; // Neutral gray for monochrome theme

  return (
    <div className="relative w-full h-[450px] rounded-lg overflow-hidden border border-[var(--card-border)] shadow z-1">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Core Location Marker */}
        <Marker position={center}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">{locationName}</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Safety: {safetyRating} / 100</p>
            </div>
          </Popup>
        </Marker>

        {/* Safety overlay circle */}
        <Circle
          center={center}
          pathOptions={{ 
            fillColor: safetyColor, 
            color: safetyColor, 
            weight: 1.5, 
            fillOpacity: 0.1 
          }}
          radius={2000} // 2km radius safety indicator zone
        />

        {/* Hotspots Markers */}
        {hotspots.map((spot, index) => {
          // Generate a deterministic coordinate offset for each hotspot marker
          const offsetLat = lat + (index * 0.003 - 0.005);
          const offsetLng = lng + (index * 0.003 - 0.004);
          const spotPosition: [number, number] = [offsetLat, offsetLng];

          return (
            <Marker key={index} position={spotPosition}>
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <span className="text-[9px] uppercase font-bold text-white bg-black px-2 py-0.5 border border-neutral-800 rounded">
                    {spot.category}
                  </span>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] mt-1.5">{spot.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{spot.description}</p>
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-[var(--card-border)]">
                    <span className="text-[10px] text-[var(--text-primary)] font-semibold">Rating: {spot.rating}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{spot.distance} away</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 z-[1000] text-xs pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-500"></span>
          <span className="font-bold text-[var(--text-primary)]">Safety Alert Zone (2km)</span>
        </div>
        <p className="text-[var(--text-secondary)] mt-1 font-semibold">
          Status: {safetyRating >= 70 ? 'High safety' : safetyRating >= 40 ? 'Moderate safety' : 'Low safety'}
        </p>
      </div>
    </div>
  );
};

export default InteractiveMap;
