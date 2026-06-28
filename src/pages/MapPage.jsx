import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayersControl } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

const BASE = import.meta.env.VITE_API_URL;

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 21, { duration: 1.5 });
  }, [lat, lng]);
  return null;
}

function FitBounds({ trees }) {
  const map = useMap();
  const [fitted, setFitted] = useState(false);
  useEffect(() => {
    if (!fitted && trees.length > 0) {
      map.fitBounds(trees.map(t => [t.latitude, t.longitude]), { padding: [50, 50] });
      setFitted(true);
    }
  }, [trees]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusLat = parseFloat(searchParams.get('lat'));
  const focusLng = parseFloat(searchParams.get('lng'));
  const focusId  = searchParams.get('id');

  const [trees,    setTrees]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(focusId || null);
  const [mapStyle, setMapStyle] = useState('satellite'); // satellite | street | hybrid

  useEffect(() => {
    axios.get(`${BASE}/trees/map`)
      .then(r => { setTrees(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? trees.filter(t =>
        t.common_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.botanical_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.area?.toLowerCase().includes(search.toLowerCase())
      )
    : trees;

  const palette = ['#00e676','#ffeb3b','#ff6b6b','#40c4ff','#ff9800','#ea80fc','#69f0ae','#f48fb1','#80d8ff','#ccff90'];
  const speciesIndex = {};
  [...new Set(trees.map(t => t.common_name))].forEach((sp, i) => { speciesIndex[sp] = i; });
  const getColor = (name) => palette[speciesIndex[name] % palette.length] || '#00e676';

  const defaultCenter = [11.6781, 78.1276]; // your campus center

  // Tile layers
  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 23,
      maxNativeZoom: 19,
      label: '🛰 Satellite'
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 22,
      maxNativeZoom: 19,
      label: '🗺 Street'
    },
    hybrid: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
      maxZoom: 23,
      maxNativeZoom: 19,
      label: '🌍 Hybrid'
    }
  };

  return (
    <div className="map-page page-enter">
      {/* Header */}
      <div className="map-header">
        <div className="map-header-inner">
          <h1>Campus Tree Map</h1>
          <p>{filtered.length.toLocaleString()} trees • Zoom in to see individual trees</p>
        </div>

        {/* Map style switcher */}
        <div className="map-style-switcher">
          {Object.entries(tileLayers).map(([key, val]) => (
            <button
              key={key}
              className={`style-btn ${mapStyle === key ? 'active' : ''}`}
              onClick={() => setMapStyle(key)}
            >{val.label}</button>
          ))}
        </div>

        <div className="map-search-wrap">
          <input
            className="map-search"
            placeholder="Filter by name or area…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="map-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {/* Map */}
      <div className="map-container">
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/><p>Loading {trees.length} trees…</p></div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={17}
            maxZoom={23}
            className="leaflet-map"
          >
            <TileLayer
              key={mapStyle}
              url={tileLayers[mapStyle].url}
              attribution={tileLayers[mapStyle].attribution}
              maxZoom={tileLayers[mapStyle].maxZoom}
              maxNativeZoom={tileLayers[mapStyle].maxNativeZoom}
            />

            {/* Labels overlay on satellite/hybrid */}
            {(mapStyle === 'satellite' || mapStyle === 'hybrid') && (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.35}
                maxZoom={22}
              />
            )}

            {focusLat && focusLng
              ? <FlyTo lat={focusLat} lng={focusLng} />
              : <FitBounds trees={filtered} />
            }

            {filtered.map(tree => (
              <CircleMarker
                key={tree._id}
                center={[tree.latitude, tree.longitude]}
                radius={selected === tree._id ? 13 : 8}
                pathOptions={{
                  fillColor:   getColor(tree.common_name),
                  fillOpacity: selected === tree._id ? 1 : 0.9,
                  color:       '#000',
                  weight:      selected === tree._id ? 2 : 1,
                }}
                eventHandlers={{ click: () => setSelected(tree._id) }}
              >
                <Popup className="tree-popup">
                  <div className="popup-inner">
                    <span className="popup-id">{tree.tree_id}</span>
                    <strong>{tree.common_name}</strong>
                    <em>{tree.botanical_name}</em>
                    <span className="popup-area">📍 {tree.area}</span>
                    <button className="popup-btn" onClick={() => navigate(`/tree/${tree._id}`)}>
                      View full details →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Bottom bar */}
      <div className="map-legend">
        <span>🔍 Scroll to zoom • Click any dot to identify the tree • Switch to Satellite to see real trees</span>
        <span className="legend-count">{filtered.length} trees shown</span>
      </div>
    </div>
  );
}