import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  KPH_SINTANG_TIMUR_BOUNDARY,
  KABUPATEN_SINTANG_ADMIN,
  FOREST_ZONES_LAYER,
  PEATLAND_LAYER,
  RIVERS_LAYER,
  ROADS_LAYER,
} from '../../data/spatialLayers';
import {
  RAW_HOTSPOTS,
  RAW_LAND_CHANGES,
  INTELLIGENCE_EVENTS,
  SINTANG_BBOX,
} from '../../data/publicDataset';
import { IntelligenceEvent, TaxonomicStage } from '../../types/intelligence';
import { TaxonomyBadge } from '../common/TaxonomyBadge';
import {
  Layers,
  Flame,
  TreePine,
  MapPin,
  Eye,
  EyeOff,
  Filter,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface MapViewProps {
  onSelectEvent: (event: IntelligenceEvent) => void;
}

export const MapView: React.FC<MapViewProps> = ({ onSelectEvent }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<Record<string, L.LayerGroup>>({});

  // Layer Visibility States
  const [layerVisibility, setLayerVisibility] = useState({
    kphBoundary: true,
    kabupatenAdmin: true,
    forestZones: true,
    peatland: true,
    rivers: true,
    roads: true,
    hotspots: true,
    canopyLoss: true,
    events: true,
  });

  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite' | 'osm'>('dark');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [selectedPopupEvent, setSelectedPopupEvent] = useState<IntelligenceEvent | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [SINTANG_BBOX.centerLat, SINTANG_BBOX.centerLon],
      zoom: 9,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initialize Layer Groups
    const groups: Record<string, L.LayerGroup> = {
      baseTile: L.layerGroup().addTo(map),
      kabupatenAdmin: L.layerGroup().addTo(map),
      kphBoundary: L.layerGroup().addTo(map),
      forestZones: L.layerGroup().addTo(map),
      peatland: L.layerGroup().addTo(map),
      rivers: L.layerGroup().addTo(map),
      roads: L.layerGroup().addTo(map),
      hotspots: L.layerGroup().addTo(map),
      canopyLoss: L.layerGroup().addTo(map),
      events: L.layerGroup().addTo(map),
    };

    layersGroupRef.current = groups;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const baseGroup = layersGroupRef.current.baseTile;
    if (!map || !baseGroup) return;

    baseGroup.clearLayers();

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

    if (baseMapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri, Earthstar Geographics';
    } else if (baseMapType === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(baseGroup);
  }, [baseMapType]);

  // Render Geospatial Vector Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const groups = layersGroupRef.current;

    // 1. Kabupaten Sintang Admin
    groups.kabupatenAdmin.clearLayers();
    if (layerVisibility.kabupatenAdmin) {
      L.geoJSON(KABUPATEN_SINTANG_ADMIN as any, {
        style: {
          color: '#64748b',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#334155',
          fillOpacity: 0.05,
        },
      }).addTo(groups.kabupatenAdmin);
    }

    // 2. KPH Sintang Timur Boundary
    groups.kphBoundary.clearLayers();
    if (layerVisibility.kphBoundary) {
      L.geoJSON(KPH_SINTANG_TIMUR_BOUNDARY as any, {
        style: {
          color: '#10b981',
          weight: 3,
          fillColor: '#059669',
          fillOpacity: 0.12,
        },
      }).addTo(groups.kphBoundary);
    }

    // 3. Forest Zonation (HL, HPT, HP, APL)
    groups.forestZones.clearLayers();
    if (layerVisibility.forestZones) {
      L.geoJSON(FOREST_ZONES_LAYER as any, {
        style: (feature) => ({
          color: feature?.properties.color || '#10b981',
          weight: 1.5,
          fillColor: feature?.properties.fillColor || '#10b981',
          fillOpacity: 0.25,
        }),
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(
            `<strong>${feature.properties.nama}</strong><br/>Fungsi: ${feature.properties.fungsi}<br/>Status: ${feature.properties.status}`,
            { className: 'bg-slate-900 text-slate-100 border border-slate-700 p-2 text-xs rounded' }
          );
        },
      }).addTo(groups.forestZones);
    }

    // 4. Peatland KHG
    groups.peatland.clearLayers();
    if (layerVisibility.peatland) {
      L.geoJSON(PEATLAND_LAYER as any, {
        style: {
          color: '#a855f7',
          weight: 1.5,
          dashArray: '3, 4',
          fillColor: '#7e22ce',
          fillOpacity: 0.35,
        },
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(
            `<strong>${feature.properties.nama}</strong><br/>Tipe: ${feature.properties.tipe}<br/>Kedalaman: ${feature.properties.kedalaman}<br/>Kerawanan: ${feature.properties.tingkat_rawan_api}`,
            { className: 'bg-slate-900 text-slate-100 border border-slate-700 p-2 text-xs rounded' }
          );
        },
      }).addTo(groups.peatland);
    }

    // 5. Rivers
    groups.rivers.clearLayers();
    if (layerVisibility.rivers) {
      L.geoJSON(RIVERS_LAYER as any, {
        style: {
          color: '#06b6d4',
          weight: 3.5,
          opacity: 0.85,
        },
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(`Sungai: <strong>${feature.properties.nama}</strong> (Koridor Buffer 100m)`, {
            className: 'bg-slate-900 text-slate-100 border border-slate-700 p-2 text-xs rounded',
          });
        },
      }).addTo(groups.rivers);
    }

    // 6. Roads
    groups.roads.clearLayers();
    if (layerVisibility.roads) {
      L.geoJSON(ROADS_LAYER as any, {
        style: {
          color: '#f59e0b',
          weight: 2.5,
          opacity: 0.75,
        },
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(`Jalan: <strong>${feature.properties.nama}</strong> (${feature.properties.kelas})`, {
            className: 'bg-slate-900 text-slate-100 border border-slate-700 p-2 text-xs rounded',
          });
        },
      }).addTo(groups.roads);
    }

    // 7. Hotspots (NASA FIRMS)
    groups.hotspots.clearLayers();
    if (layerVisibility.hotspots) {
      RAW_HOTSPOTS.forEach((spot) => {
        const marker = L.circleMarker([spot.latitude, spot.longitude], {
          radius: 7,
          fillColor: spot.brightnessKelvin > 350 ? '#ef4444' : '#f97316',
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindTooltip(
          `<strong>Hotspot NASA FIRMS (${spot.satellite})</strong><br/>
           Suhu Kecerahan: ${spot.brightnessKelvin} K<br/>
           Radiasi Termal (FRP): ${spot.frpMw} MW<br/>
           Zona: ${spot.forestZone}<br/>
           Kecamatan: ${spot.kecamatan}`,
          { className: 'bg-slate-900 text-slate-100 border border-slate-700 p-2 text-xs rounded' }
        );

        marker.addTo(groups.hotspots);
      });
    }

    // 8. Canopy Loss (Copernicus Sentinel-2)
    groups.canopyLoss.clearLayers();
    if (layerVisibility.canopyLoss) {
      RAW_LAND_CHANGES.forEach((loss) => {
        const circle = L.circle([loss.latitude, loss.longitude], {
          radius: Math.sqrt(loss.areaHa * 10000 / Math.PI),
          color: '#eab308',
          fillColor: '#ca8a04',
          fillOpacity: 0.45,
          weight: 2,
        });

        circle.bindTooltip(
          `<strong>Perubahan Tutupan Kanopi (${loss.sensor})</strong><br/>
           Luas Anomali: ~${loss.areaHa} Hektar<br/>
           Delta NDVI: ${loss.ndviDelta}<br/>
           Zona: ${loss.forestZone}`,
          { className: 'bg-slate-900 text-slate-100 border border-slate-700 p-2 text-xs rounded' }
        );

        circle.addTo(groups.canopyLoss);
      });
    }

    // 9. Intelligence Events (Interactive Pulsing Markers)
    groups.events.clearLayers();
    if (layerVisibility.events) {
      let filteredEvents = INTELLIGENCE_EVENTS;
      if (stageFilter !== 'ALL') {
        filteredEvents = filteredEvents.filter(
          (e) => e.taxonomicStage.toUpperCase() === stageFilter.toUpperCase()
        );
      }

      filteredEvents.forEach((ev) => {
        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
            <span class="relative w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg text-[10px] font-bold text-emerald-300">
              ⚡
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([ev.location.latitude, ev.location.longitude], {
          icon: customIcon,
        });

        marker.on('click', () => {
          setSelectedPopupEvent(ev);
        });

        marker.addTo(groups.events);
      });
    }
  }, [layerVisibility, stageFilter]);

  const toggleLayer = (key: keyof typeof layerVisibility) => {
    setLayerVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([SINTANG_BBOX.centerLat, SINTANG_BBOX.centerLon], 9);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-10 bg-slate-950" />

      {/* Top Left Floating Filter & Basemap Switcher */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-300">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>Filter Taksonomi:</span>
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="ALL">Semua Tahap (5 Stage)</option>
          <option value="OBSERVATION">Observation (Instrumen Langsung)</option>
          <option value="DETECTION">Detection (Anomali Kanopi/Titik)</option>
          <option value="CORRELATION">Correlation (Tumpang Spasial)</option>
          <option value="REPORTED">Reported (Berita Publik/JDIH)</option>
          <option value="VERIFIED">Verified (Terverifikasi)</option>
        </select>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        {/* Basemap Selection */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setBaseMapType('dark')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              baseMapType === 'dark'
                ? 'bg-emerald-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark Matter
          </button>
          <button
            onClick={() => setBaseMapType('satellite')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              baseMapType === 'satellite'
                ? 'bg-emerald-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satelit Esri
          </button>
          <button
            onClick={() => setBaseMapType('osm')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              baseMapType === 'osm'
                ? 'bg-emerald-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OpenStreetMap
          </button>
        </div>

        <button
          onClick={resetView}
          title="Reset Sudut Pandang Sintang"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-1 transition-colors"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Floating Layer Controls Panel (Top Right) */}
      <div className="absolute top-4 right-14 z-20 w-72 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Layer GIS Spasial
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">100% Data Publik</span>
        </div>

        <div className="space-y-1.5 text-xs max-h-72 overflow-y-auto pr-1">
          {[
            { key: 'events', label: 'Intelligence Events (Prioritas)', color: 'text-emerald-400' },
            { key: 'hotspots', label: 'Hotspot NASA FIRMS (VIIRS/MODIS)', color: 'text-rose-400' },
            { key: 'canopyLoss', label: 'Perubahan Kanopi Sentinel-2', color: 'text-yellow-400' },
            { key: 'kphBoundary', label: 'Batas KPH Sintang Timur', color: 'text-emerald-500' },
            { key: 'forestZones', label: 'Fungsi Kawasan Hutan (HL/HPT/HP)', color: 'text-amber-400' },
            { key: 'peatland', label: 'Kawasan Hidrologis Gambut (KHG)', color: 'text-purple-400' },
            { key: 'rivers', label: 'Sungai Kapuas & Melawi (Buffer 100m)', color: 'text-cyan-400' },
            { key: 'roads', label: 'Jaringan Jalan & Koridor 500m', color: 'text-orange-400' },
            { key: 'kabupatenAdmin', label: 'Batas Kabupaten Sintang', color: 'text-slate-400' },
          ].map((layer) => {
            const isVisible = layerVisibility[layer.key as keyof typeof layerVisibility];
            return (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key as keyof typeof layerVisibility)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                  isVisible ? 'bg-slate-800/80 text-slate-100 font-medium' : 'text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${layer.color} bg-current`} />
                  <span className="truncate">{layer.label}</span>
                </div>
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Details Floating Panel (When an Event is selected) */}
      {selectedPopupEvent && (
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  {selectedPopupEvent.eventCode}
                </span>
                <TaxonomyBadge stage={selectedPopupEvent.taxonomicStage} size="sm" />
              </div>
              <h4 className="text-xs font-bold text-slate-100">{selectedPopupEvent.title}</h4>
            </div>
            <button
              onClick={() => setSelectedPopupEvent(null)}
              className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">Lokasi:</span>{' '}
              <strong className="text-slate-200">
                Kec. {selectedPopupEvent.location.kecamatan} ({selectedPopupEvent.location.forestZone})
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Kedekatan Sungai:</span>{' '}
              <span className="text-cyan-300">
                {selectedPopupEvent.location.distanceToNearestRiverMeters}m ({selectedPopupEvent.location.nearestRiverName})
              </span>
            </div>
            <div>
              <span className="text-slate-400">Kedekatan Jalan:</span>{' '}
              <span className="text-amber-300">
                {selectedPopupEvent.location.distanceToNearestRoadMeters}m ({selectedPopupEvent.location.nearestRoadName})
              </span>
            </div>
            <div>
              <span className="text-slate-400">Keyakinan (Confidence):</span>{' '}
              <strong className="text-emerald-400 font-mono">
                {selectedPopupEvent.confidenceScore}%
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {selectedPopupEvent.evidenceChain.length} Bukti Terverifikasi
            </span>
            <button
              onClick={() => onSelectEvent(selectedPopupEvent)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors"
            >
              <span>Inspeksi Bukti Lengkap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
