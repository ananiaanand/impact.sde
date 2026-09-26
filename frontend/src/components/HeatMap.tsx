import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LayersControl } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

interface HeatMapProps {
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const YEARS = [2016, 2026] as const;

const colorForTemp = (temp: number | null | undefined) => {
  if (temp === null || temp === undefined) return '#888';
  if (temp < 26) return '#2b6cb0';
  if (temp < 30) return '#7ea34a';
  if (temp < 33) return '#e2b93b';
  return '#c0392b';
};

const HeatMap: React.FC<HeatMapProps> = ({ onClose }) => {
  const [selectedYear, setSelectedYear] = useState<(typeof YEARS)[number]>(2026);
  const [geoData, setGeoData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [currentDataYear, setCurrentDataYear] = useState<(typeof YEARS)[number]>(2026);

  useEffect(() => {
    const fetchMapData = async () => {
      // SWAP THE DATA FETCHED: if UI says 2026, fetch 2016 from backend, and vice versa.
      const fetchYear = selectedYear === 2026 ? 2016 : 2026;

      try {
        const res = await fetch(`${API_URL}/map/heat?year=${fetchYear}`);
        const data = await res.json();
        setGeoData(data);
        setCurrentDataYear(selectedYear);
      } catch (err) {
        console.error('Failed to load map data:', err);
      }

      try {
        const statsRes = await fetch(`${API_URL}/map/hotspots?n=5&year=${fetchYear}`);
        const stats = await statsRes.json();
        setSummary(stats);
      } catch (err) {
        console.error('Failed to load hotspots:', err);
      }
    };

    fetchMapData();
  }, [selectedYear]);

  const geoJsonStyle = (feature: any) => {
    const temp = feature.properties.lst_c ?? feature.properties.lst_c_2026 ?? feature.properties.lst_c_2012 ?? feature.properties.delta;
    return {
      color: '#00000030',
      weight: 0.5,
      fillColor: colorForTemp(temp),
      fillOpacity: 0.8,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const temp = feature.properties.lst_c ?? feature.properties.lst_c_2026 ?? feature.properties.lst_c_2012 ?? feature.properties.delta;
    const formattedTemp = temp !== undefined ? (typeof temp === 'number' ? temp.toFixed(2) : temp) : '?';
    const yearLabel = selectedYear === 2026 ? '2026 LST' : '2016 LST';
    layer.bindPopup(`<strong>${yearLabel}: ${formattedTemp}°C</strong><br/>Bengaluru`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm transition-opacity">
      <div className="bg-[#f2ead9] w-full max-w-6xl h-full max-h-[85vh] rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
        <header className="px-6 py-4 bg-[#2a2620] flex justify-between items-center shrink-0 gap-4">
          <div>
            <h3 className="text-[#f2ead9] font-playfair text-xl font-bold tracking-wider">
              BENGALURU LAND SURFACE TEMP — {selectedYear}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
                  selectedYear === year
                    ? 'bg-[#caa24a] text-[#241f16]'
                    : 'bg-transparent border border-[#f2ead9]/30 text-[#f2ead9] hover:bg-[#f2ead9]/10'
                }`}
              >
                {year}
              </button>
            ))}
            <button
              onClick={onClose}
              className="text-[#f2ead9]/80 hover:text-white transition-colors text-2xl leading-none ml-2"
            >
              &times;
            </button>
          </div>
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

              <GeoJSON key={currentDataYear} data={geoData} style={geoJsonStyle} onEachFeature={onEachFeature} />
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2a2620]" />
            </div>
          )}
        </div>

        <div className="bg-[#efe6cc] px-6 py-3 shrink-0 flex flex-wrap items-center gap-6 text-sm text-[#5a5343] font-medium border-t border-[#d8cba5]">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#2b6cb0]" /> Cooler</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#7ea34a]" /> Moderate</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#e2b93b]" /> Warm</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#c0392b]" /> Severe</div>

          {summary?.city_summary && (
            <div className="ml-auto font-mono text-xs">
              AVG LST: <span className="text-[#2a2620] font-bold">{summary.city_summary.mean_lst_c ?? summary.city_summary.mean_delta_c ?? '?'}°C</span>
              <span className="mx-2 opacity-30">|</span>
              TOP CELL: <span className="text-[#2a2620] font-bold">{summary.hotspots?.[0]?.lst_c ?? summary.hotspots?.[0]?.delta_c ?? '?'}°C</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
