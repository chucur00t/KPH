import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GisLayerRecord, EventLocationModel } from '../../types/gis';
import { IntelligenceEvent } from '../../types';
import { GisApiService } from '../../services/gisApiService';
import { SpatialIntelligencePanel } from '../gis/SpatialIntelligencePanel';
import {
  Layers,
  Filter,
  Compass,
  Calendar,
  Eye,
  EyeOff,
  ExternalLink,
  Flame,
  TreePine,
  ShieldCheck,
  Maximize2,
  MapPin,
  RefreshCw,
  Search,
  Ruler,
  Radio,
  Sliders,
  X,
} from 'lucide-react';

interface IntelligenceMapProps {
  onSelectEvent?: (event: IntelligenceEvent) => void;
  heightClass?: string;
}

export const IntelligenceMap: React.FC<IntelligenceMapProps> = ({
  onSelectEvent,
  heightClass = 'h-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});

  // Layers & Features State
  const [gisLayers, setGisLayers] = useState<GisLayerRecord[]>([]);
  const [activeLayerIds, setActiveLayerIds] = useState<Record<string, boolean>>({
    'LAYER-KPH-BOUNDARY': true,
    'LAYER-KABUPATEN-ADMIN': true,
    'LAYER-FUNGSI-KAWASAN': true,
    'LAYER-GAMBUT-KHG': true,
    'LAYER-SUNGAI-HIDRO': true,
    'LAYER-JALAN-AKSES': true,
    'LAYER-FIRE-EVENTS': true,
    'LAYER-LAND-CHANGE-EVENTS': true,
    'LAYER-INTELLIGENCE-EVENTS': true,
  });
  const [layerOpacity, setLayerOpacity] = useState<Record<string, number>>({});

  // Basemap & Tool State
  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite' | 'osm'>('dark');
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);

  // Spatial Intelligence Panel Selection
  const [selectedSpatialData, setSelectedSpatialData] = useState<EventLocationModel | null>(null);
  const [bufferToolActive, setBufferToolActive] = useState(false);
  const [bufferDistanceMeters, setBufferDistanceMeters] = useState(500);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on KPH Sintang Timur / Kabupaten Sintang
    const map = L.map(mapContainerRef.current, {
      center: [-0.065, 112.185],
      zoom: 9,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer groups
    const groups: Record<string, L.LayerGroup> = {
      baseTile: L.layerGroup().addTo(map),
      vectors: L.layerGroup().addTo(map),
      events: L.layerGroup().addTo(map),
      bufferOverlay: L.layerGroup().addTo(map),
    };
    layerGroupsRef.current = groups;

    // Mouse coordinate tracker
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Math.round(e.latlng.lat * 100000) / 100000,
        lon: Math.round(e.latlng.lng * 100000) / 100000,
      });
    });

    // Map Click -> Trigger Spatial Intelligence Point Query & Enrichment
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const lat = Math.round(e.latlng.lat * 1000000) / 1000000;
      const lon = Math.round(e.latlng.lng * 1000000) / 1000000;

      const enriched = await GisApiService.enrichEventLocation({
        event_id: `INSPECT-COORD-${Date.now()}`,
        latitude: lat,
        longitude: lon,
        location_source: 'INTERACTIVE_MAP_CLICK',
      });
      setSelectedSpatialData(enriched);

      // Draw interactive buffer if buffer tool is active
      if (groups.bufferOverlay) {
        groups.bufferOverlay.clearLayers();
        const bufferCoords = GisApiService.generateBuffer(lat, lon, bufferDistanceMeters);
        const latLngs = bufferCoords.map(([bLon, bLat]) => [bLat, bLon] as [number, number]);
        L.polygon(latLngs, {
          color: '#38bdf8',
          weight: 2,
          dashArray: '4, 4',
          fillColor: '#0284c7',
          fillOpacity: 0.2,
        }).addTo(groups.bufferOverlay);
      }
    });

    mapInstanceRef.current = map;
    loadLayersAndFeatures();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current.baseTile) return;
    const baseGroup = layerGroupsRef.current.baseTile;
    baseGroup.clearLayers();

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

    if (baseMapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (baseMapType === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(baseGroup);
  }, [baseMapType]);

  // Load Layers from API
  const loadLayersAndFeatures = async () => {
    setLoading(true);
    const layers = await GisApiService.getLayers();
    setGisLayers(layers);
    renderAllLayers(layers);
    setLoading(false);
  };

  const renderAllLayers = async (layers: GisLayerRecord[]) => {
    if (!mapInstanceRef.current || !layerGroupsRef.current.vectors) return;
    const vectorGroup = layerGroupsRef.current.vectors;
    const eventsGroup = layerGroupsRef.current.events;
    vectorGroup.clearLayers();
    eventsGroup.clearLayers();

    // Fetch features for available layers
    for (const layer of layers) {
      if (!activeLayerIds[layer.layer_id] || layer.data_status === 'NOT_AVAILABLE') {
        continue;
      }

      const res = await GisApiService.getFeatures({ layer_id: layer.layer_id, limit: 100 });
      if (!res.features || res.features.length === 0) continue;

      const isEventLayer = layer.category.includes('Events');
      const targetGroup = isEventLayer ? eventsGroup : vectorGroup;

      for (const feat of res.features) {
        const { geometry, properties } = feat;
        const style = layer.style_config || {};

        if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
          const latLngs =
            geometry.type === 'Polygon'
              ? geometry.coordinates.map((ring: any) =>
                  ring.map(([lon, lat]: [number, number]) => [lat, lon])
                )
              : geometry.coordinates.map((poly: any) =>
                  poly.map((ring: any) =>
                    ring.map(([lon, lat]: [number, number]) => [lat, lon])
                  )
                );

          const poly = L.polygon(latLngs, {
            color: style.color || '#10b981',
            weight: style.weight || 2,
            fillColor: style.fillColor || style.color || '#10b981',
            fillOpacity: style.fillOpacity || 0.2,
            dashArray: style.dashArray,
          }).addTo(targetGroup);

          // Rich government popup with full attribution & provenance
          const popupContent = `
            <div style="font-family: inherit; font-size: 11px; line-height: 1.4; color: #1e293b;">
              <div style="font-weight: 700; font-size: 12px; color: #0f172a; margin-bottom: 2px;">
                ${properties.nama || properties.name || layer.layer_name}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
                Tipe: <strong>${layer.category}</strong> (${geometry.type})
              </div>
              <div style="background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 6px;">
                <div>Sumber: <strong>${layer.attribution}</strong></div>
                <div>Dasar Hukum/SK: ${properties.sk || properties.sk_penetapan || 'Satu Data'}</div>
                <div>Status Data: <span style="color: #059669; font-weight: bold;">AVAILABLE</span></div>
              </div>
              <div style="font-size: 9px; color: #94a3b8;">
                Klik lokasi untuk rincian analisis geospasial mendalam.
              </div>
            </div>
          `;
          poly.bindPopup(popupContent);
        } else if (geometry.type === 'LineString') {
          const latLngs = geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
          const line = L.polyline(latLngs, {
            color: style.color || '#38bdf8',
            weight: style.weight || 2.5,
          }).addTo(targetGroup);

          line.bindPopup(`
            <div style="font-family: inherit; font-size: 11px; color: #1e293b;">
              <div style="font-weight: 700;">${properties.nama || layer.layer_name}</div>
              <div>Kategori: ${layer.category}</div>
              <div>Sumber: ${layer.attribution}</div>
            </div>
          `);
        } else if (geometry.type === 'Point') {
          const [lon, lat] = geometry.coordinates;
          const markerColor = style.color || '#ef4444';

          const marker = L.circleMarker([lat, lon], {
            radius: 7,
            fillColor: markerColor,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          }).addTo(targetGroup);

          marker.on('click', async (e) => {
            L.DomEvent.stopPropagation(e);
            const enriched = await GisApiService.enrichEventLocation({
              event_id: properties.id || properties.eventCode || `FEAT-${Date.now()}`,
              latitude: lat,
              longitude: lon,
              location_source: layer.layer_name,
            });
            setSelectedSpatialData(enriched);
          });

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 11px; color: #1e293b;">
              <div style="font-weight: 700; color: #0f172a;">${properties.title || properties.nama || layer.layer_name}</div>
              <div>Kategori: <strong>${layer.category}</strong></div>
              <div>Koordinat: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°</div>
              <div>Sumber: ${layer.attribution}</div>
            </div>
          `);
        }
      }
    }
  };

  // Toggle Layer Visibility
  const toggleLayer = (layerId: string) => {
    setActiveLayerIds((prev) => {
      const next = { ...prev, [layerId]: !prev[layerId] };
      setTimeout(() => renderAllLayers(gisLayers), 50);
      return next;
    });
  };

  const resetViewToKph = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-0.065, 112.185], 9);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} bg-slate-950 overflow-hidden font-sans select-none`}>
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Navigation & Controls */}
      <div className="absolute top-4 left-4 z-[900] flex flex-col gap-2">
        {/* Quick Toolbar */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-1.5 shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs">
          {/* Base Map Switcher */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setBaseMapType('dark')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                baseMapType === 'dark' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setBaseMapType('satellite')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                baseMapType === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Citra Satelit
            </button>
            <button
              onClick={() => setBaseMapType('osm')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                baseMapType === 'osm' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Topografi
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Layer Control Button */}
          <button
            onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              isLayerControlOpen
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Katalog Layer ({Object.values(activeLayerIds).filter(Boolean).length})</span>
          </button>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              isFilterOpen
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Spasial</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={resetViewToKph}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Pusatkan ke KPH Sintang Timur"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layer Switcher Panel Drawer */}
        {isLayerControlOpen && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md w-80 max-h-[70vh] overflow-y-auto space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" /> Layer Geospasial (19 Kategori)
              </span>
              <button
                onClick={() => setIsLayerControlOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {gisLayers.map((layer) => {
                const isActive = !!activeLayerIds[layer.layer_id];
                const isAvailable = layer.data_status !== 'NOT_AVAILABLE';

                return (
                  <div
                    key={layer.layer_id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      !isAvailable
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : isActive
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: layer.style_config.color || '#10b981' }}
                        />
                        <span className="font-semibold text-slate-100 truncate text-[11px]">
                          {layer.layer_name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {layer.category} &bull; {layer.attribution}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {layer.data_status === 'NOT_AVAILABLE' ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          N/A
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleLayer(layer.layer_id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                          title={isActive ? 'Sembunyikan Layer' : 'Tampilkan Layer'}
                        >
                          {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Panel Drawer */}
        {isFilterOpen && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md w-80 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-cyan-400" /> Filter Spasial &amp; Temporal
              </span>
              <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Wilayah (Kecamatan) */}
            <div>
              <label className="text-[11px] text-slate-400 font-semibold mb-1 block">Wilayah Kecamatan:</label>
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Kecamatan (Kabupaten Sintang)</option>
                <option value="Ambalau">Kecamatan Ambalau (Hutan Lindung)</option>
                <option value="Serawai">Kecamatan Serawai (HPT)</option>
                <option value="Kayan Hulu">Kecamatan Kayan Hulu</option>
                <option value="Kayan Hilir">Kecamatan Kayan Hilir (HP)</option>
                <option value="Ketungau Hulu">Kecamatan Ketungau Hulu (Perbatasan)</option>
                <option value="Ketungau Tengah">Kecamatan Ketungau Tengah (KHG Gambut)</option>
                <option value="Ketungau Hilir">Kecamatan Ketungau Hilir</option>
                <option value="Sintang">Kecamatan Sintang (Kota)</option>
              </select>
            </div>

            {/* Filter Waktu */}
            <div>
              <label className="text-[11px] text-slate-400 font-semibold mb-1 block">Rentang Waktu:</label>
              <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                {(['today', '7d', '30d', 'all'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setTimeFilter(w)}
                    className={`py-1 rounded border uppercase font-bold transition-colors ${
                      timeFilter === w
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Buffer Measurement Tool */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-sky-400" /> Buffer Tool
                </span>
                <button
                  onClick={() => setBufferToolActive(!bufferToolActive)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    bufferToolActive
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {bufferToolActive ? 'AKTIF' : 'NONAKTIF'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Klik titik pada peta untuk membuat buffer analitis:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={bufferDistanceMeters}
                  onChange={(e) => setBufferDistanceMeters(Number(e.target.value))}
                  className="flex-1 accent-sky-400"
                />
                <span className="font-mono text-sky-400 font-bold text-[11px] w-14 text-right">
                  {bufferDistanceMeters}m
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Spatial Intelligence Panel (When clicked) */}
      {selectedSpatialData && (
        <SpatialIntelligencePanel
          data={selectedSpatialData}
          onClose={() => setSelectedSpatialData(null)}
          onSelectEvent={(id) => {
            if (onSelectEvent) {
              // trigger modal
            }
          }}
        />
      )}

      {/* Bottom Status Bar: Coordinates, Scale, & System Integrity */}
      <div className="absolute bottom-4 left-4 z-[900] bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {mouseCoords
              ? `${mouseCoords.lat.toFixed(5)}°, ${mouseCoords.lon.toFixed(5)}°`
              : 'Arahkan kursor pada peta'}
          </span>
        </div>

        <div className="h-3 w-px bg-slate-700" />

        <div className="text-[11px] text-slate-400 font-sans flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>PostGIS EPSG:4326 | WGS84 Geodesic</span>
        </div>
      </div>
    </div>
  );
};
