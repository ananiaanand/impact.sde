import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LayersControl } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

interface HeatMapProps {
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const colorForDelta = (d: number | null | undefined) => {
  if (d === null || d === undefined) return '#888';
  if (d < 0) return '#2b6cb0'; // Cooling
  if (d < 1) return '#7ea34a'; // Mild warming
  if (d < 2) return '#e2b93b'; // Moderate warming
  return '#c0392b'; // Severe warming
};

const HeatMap: React.FC<HeatMapProps> = ({ onClose }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    // Fetch Heat Map Data
    fetch(`${API_URL}/map/heat`)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load map data:", err));
      
    // Fetch Hotspots Summary
    fetch(`${API_URL}/map/hotspots?n=5`)
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error("Failed to load hotspots:", err));
  }, []);

  const geoJsonStyle = (feature: any) => {
    const d = feature.properties.delta_c ?? feature.properties.delta;
    return {
      color: '#00000030',
      weight: 0.5,
      fillColor: colorForDelta(d),
      fillOpacity: 0.75,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const d = feature.properties.delta_c ?? feature.properties.delta;
    const formattedD = d !== undefined ? (typeof d === 'number' ? d.toFixed(2) : d) : '?';
    layer.bindPopup(`<strong>Δ LST: ${formattedD}°C</strong><br/>2012 → 2026`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm transition-opacity">
      <div className="bg-[#f2ead9] w-full max-w-6xl h-full max-h-[85vh] rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
        <header className="px-6 py-4 bg-[#2a2620] flex justify-between items-center shrink-0">
          <h3 className="text-[#f2ead9] font-mono text-lg font-bold tracking-wider">
            BENGALURU LAND SURFACE TEMP — 2012 VS 2026
          </h3>
          <button 
            onClick={onClose}
            className="text-[#f2ead9]/80 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </header>

        <div className="flex-grow relative bg-[#E5E3DF]">
          {geoData ? (
            <MapContainer 
              center={[12.9716, 77.5946]} 
              zoom={11} 
              style={{ height: '100%', width: '100%', zIndex: 10 }}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={15}
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="CartoDB Dark Matter">
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    maxZoom={15}
                  />
                </LayersControl.BaseLayer>
              </LayersControl>
              
              <GeoJSON 
                data={geoData} 
                style={geoJsonStyle} 
                onEachFeature={onEachFeature} 
              />
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2a2620]"></div>
            </div>
          )}
        </div>

        <div className="bg-[#efe6cc] px-6 py-3 shrink-0 flex flex-wrap items-center gap-6 text-sm text-[#5a5343] font-medium border-t border-[#d8cba5]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[#2b6cb0]"></span> Cooling
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[#7ea34a]"></span> Mild warming
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[#e2b93b]"></span> Moderate warming
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[#c0392b]"></span> Severe (Δ ≥ 2°C)
          </div>
          
          {summary?.city_summary && (
            <div className="ml-auto font-mono text-xs">
              AVG Δ: <span className="text-[#2a2620] font-bold">{summary.city_summary.avg_delta_c ?? summary.city_summary.avg_delta ?? '?'}°C</span> 
              <span className="mx-2 opacity-30">|</span> 
              HOTSPOTS: <span className="text-[#2a2620] font-bold">{summary.hotspots?.length || 0}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
