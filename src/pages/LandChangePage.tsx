import React, { useState, useEffect } from 'react';
import {
  TreePine,
  Layers,
  Compass,
  Navigation,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Satellite,
  Calendar,
  Filter,
  Eye,
  Sliders,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  SatelliteScene,
  LandChangeEvent,
  LandChangeDetectionResult,
  SpectralIndexType,
  SpectralIndexConfig,
} from '../types/satellite';
import { ProviderStatusInfo } from '../services/satellite/satelliteProviderRegistry';
import { SatelliteApiService } from '../services/satelliteApiService';
import { BiTemporalAnalysisStudio } from '../components/satellite/BiTemporalAnalysisStudio';
import { SceneCatalogBrowser } from '../components/satellite/SceneCatalogBrowser';
import { ChangeEventDetailModal } from '../components/satellite/ChangeEventDetailModal';
import { ProviderStatusPanel } from '../components/satellite/ProviderStatusPanel';

const SINTANG_AOIS = [
  { id: 'AOI-KPH-SINTANG-TIMUR', name: 'KPH Sintang Timur (~847.200 Ha)' },
  { id: 'AOI-KABUPATEN-SINTANG', name: 'Kabupaten Sintang (~2.163.500 Ha)' },
  { id: 'AOI-KEC-SERAWAI', name: 'Kecamatan Serawai' },
  { id: 'AOI-KEC-AMBALAU', name: 'Kecamatan Ambalau' },
  { id: 'AOI-KEC-KAYAN-HULU', name: 'Kecamatan Kayan Hulu' },
  { id: 'AOI-KEC-MENUKUNG', name: 'Kecamatan Menukung' },
  { id: 'AOI-KEC-KAYAN-HILIR', name: 'Kecamatan Kayan Hilir' },
  { id: 'AOI-KEC-DEDAI', name: 'Kecamatan Dedai' },
  { id: 'AOI-KEC-SEPAUK', name: 'Kecamatan Sepauk' },
  { id: 'AOI-KEC-TEMPUNAK', name: 'Kecamatan Tempunak' },
];

export const LandChangePage: React.FC = () => {
  // State
  const [selectedAoi, setSelectedAoi] = useState(SINTANG_AOIS[0]);
  const [activeTab, setActiveTab] = useState<'studio' | 'events' | 'scenes' | 'providers'>('studio');

  // Satellite Catalog State
  const [scenes, setScenes] = useState<SatelliteScene[]>([]);
  const [scenesLoading, setScenesLoading] = useState(false);
  const [selectedT0, setSelectedT0] = useState<SatelliteScene | null>(null);
  const [selectedT1, setSelectedT1] = useState<SatelliteScene | null>(null);

  // Detection Run State
  const [detectionRunning, setDetectionRunning] = useState(false);
  const [latestResult, setLatestResult] = useState<LandChangeDetectionResult | null>(null);

  // Events Catalog State
  const [events, setEvents] = useState<LandChangeEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [inspectingEvent, setInspectingEvent] = useState<LandChangeEvent | null>(null);

  // Providers & Indices
  const [providers, setProviders] = useState<ProviderStatusInfo[]>([]);
  const [indices, setIndices] = useState<SpectralIndexConfig[]>([]);

  // Initial Data Fetch
  const loadInitialData = async () => {
    setScenesLoading(true);
    setEventsLoading(true);

    try {
      const [scenesRes, eventsRes, providersRes, indicesRes] = await Promise.all([
        SatelliteApiService.searchScenes({
          date_start: '2026-01-01T00:00:00.000Z',
          date_end: '2026-09-30T23:59:59.000Z',
        }),
        SatelliteApiService.getChangeEvents(),
        SatelliteApiService.getProviders(),
        SatelliteApiService.getSpectralIndices(),
      ]);

      setScenes(scenesRes);
      setEvents(eventsRes);
      setProviders(providersRes);
      setIndices(indicesRes);

      // Pre-select recent T0 & T1 for quick demo
      if (scenesRes.length >= 2) {
        setSelectedT1(scenesRes[0]); // Newest (2026-09-28)
        setSelectedT0(scenesRes[3] || scenesRes[1]); // Baseline (2026-09-08)
      }
    } catch (err) {
      console.error('Error loading initial satellite intelligence data:', err);
    } finally {
      setScenesLoading(false);
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter scenes
  const handleSceneSearch = async (params: {
    date_start: string;
    date_end: string;
    max_cloud_cover: number;
    satellite: string;
  }) => {
    setScenesLoading(true);
    try {
      const res = await SatelliteApiService.searchScenes({
        date_start: params.date_start,
        date_end: params.date_end,
        max_cloud_cover: params.max_cloud_cover,
        satellite: params.satellite as any,
        aoi_id: selectedAoi.id,
      });
      setScenes(res);
    } catch (err) {
      console.error('Error searching scenes:', err);
    } finally {
      setScenesLoading(false);
    }
  };

  // Run Change Detection
  const handleRunDetection = async (indexType: SpectralIndexType, threshold: number) => {
    if (!selectedT0 || !selectedT1) return;
    setDetectionRunning(true);

    try {
      const res = await SatelliteApiService.runChangeDetection({
        baseline_scene_id: selectedT0.scene_id,
        comparison_scene_id: selectedT1.scene_id,
        aoi_id: selectedAoi.id,
        index_type: indexType,
        sensitivity_threshold: threshold,
      });

      setLatestResult(res);

      // Refresh events
      const updatedEvents = await SatelliteApiService.getChangeEvents();
      setEvents(updatedEvents);
    } catch (err: any) {
      console.error('Detection run failed:', err);
    } finally {
      setDetectionRunning(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (filterZone !== 'ALL' && !e.forest_zone.includes(filterZone)) return false;
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    return true;
  });

  // Aggregated KPI Metrics
  const totalLossHa = events.reduce((sum, e) => sum + e.area_ha, 0).toFixed(1);
  const riverBufferHa = events
    .filter((e) => e.near_river)
    .reduce((sum, e) => sum + e.area_ha, 0)
    .toFixed(1);
  const roadBufferHa = events
    .filter((e) => e.near_road)
    .reduce((sum, e) => sum + e.area_ha, 0)
    .toFixed(1);

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Public Data Compliance Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-emerald-300">
              FASE 5: SATELLITE INTELLIGENCE &amp; LAND CHANGE DETECTION (100% DATA PUBLIK)
            </div>
            <div className="text-[11px] text-slate-400">
              Analisis berbasis citra terbuka Copernicus Sentinel-2 MSI Level-2A (10m) terdaftar di Registry (SRC-ESA-COPERNICUS-S2). Tanpa data internal, bebas koordinat fiktif, dilengkapi jejak audit provenance.
            </div>
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">
          STAC API Verified
        </span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Modul A: Land Change Intelligence (Perubahan Tutupan Lahan)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deteksi kehilangan biomassa tajuk dan bukaan tutupan kanopi berbasis bi-temporal dNDVI/dNBR di {selectedAoi.name}.
          </p>
        </div>

        {/* AOI Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Wilayah Analisis (AOI):</span>
          <select
            value={selectedAoi.id}
            onChange={(e) => {
              const aoi = SINTANG_AOIS.find((a) => a.id === e.target.value);
              if (aoi) setSelectedAoi(aoi);
            }}
            className="bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            {SINTANG_AOIS.map((aoi) => (
              <option key={aoi.id} value={aoi.id}>
                {aoi.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Kehilangan Kanopi
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {totalLossHa} <span className="text-xs font-normal text-slate-400">Hektar</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {events.length} kluster anomali terisolasi
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1 bg-cyan-950/10">
          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Buffer Sempadan Sungai</span>
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {riverBufferHa} <span className="text-xs font-normal text-slate-400">Ha (&lt;120m)</span>
          </div>
          <div className="text-[11px] text-slate-400">Hulu Melawi &amp; Kapuas Sintang</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/30 space-y-1 bg-orange-950/10">
          <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Buffer Koridor Akses Jalan</span>
            <Navigation className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-orange-300 font-mono">
            {roadBufferHa} <span className="text-xs font-normal text-slate-400">Ha (&lt;300m)</span>
          </div>
          <div className="text-[11px] text-slate-400">Akses Jalan Logistik Kebun &amp; Konsesi</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Sensor Satelit Terbuka
          </div>
          <div className="text-base font-bold text-slate-200">
            Sentinel-2 MSI Level-2A
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Tile 49MCV &amp; 49MCU (10m BOA)</div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-800 gap-2 text-xs">
        <button
          onClick={() => setActiveTab('studio')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'studio'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Studio Analisis Bi-Temporal
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Kejadian Perubahan Terdeteksi ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('scenes')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'scenes'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Satellite className="w-3.5 h-3.5" /> Katalog Citra STAC ({scenes.length})
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'providers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Provider &amp; Indeks Spektral
        </button>
      </div>

      {/* Tab 1: Studio */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          <BiTemporalAnalysisStudio
            selectedT0={selectedT0}
            selectedT1={selectedT1}
            aoiName={selectedAoi.name}
            onRunDetection={handleRunDetection}
            running={detectionRunning}
            result={latestResult}
            onInspectEvent={(evt) => setInspectingEvent(evt)}
          />

          <SceneCatalogBrowser
            scenes={scenes}
            loading={scenesLoading}
            selectedT0={selectedT0}
            selectedT1={selectedT1}
            onSelectT0={(s) => setSelectedT0(s)}
            onSelectT1={(s) => setSelectedT1(s)}
            onSearch={handleSceneSearch}
          />
        </div>
      )}

      {/* Tab 2: Detected Events */}
      {activeTab === 'events' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Daftar Kejadian Perubahan Tutupan Lahan Terisolasi
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hasil komputasi dNDVI / dNBR dengan perpotongan spasial batas KPH, fungsi kawasan hutan, buffer sempadan, dan rekam jejak audit.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Severity</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="LOW">Low Severity</option>
              </select>

              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Kawasan</option>
                <option value="Hutan Lindung">Hutan Lindung (HL)</option>
                <option value="Hutan Produksi Terbatas">Hutan Produksi Terbatas (HPT)</option>
                <option value="Hutan Produksi Tetap">Hutan Produksi Tetap (HP)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3.5">ID Kejadian</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Kecamatan / Koordinat</th>
                  <th className="p-3.5">Fungsi Kawasan</th>
                  <th className="p-3.5">Luas (Ha)</th>
                  <th className="p-3.5">Delta Indeks</th>
                  <th className="p-3.5">Buffer Kedekatan</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredEvents.map((item) => (
                  <tr key={item.event_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      {item.event_id}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {new Date(item.acquisition_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200">{item.kecamatan}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {item.centroid_latitude.toFixed(4)}, {item.centroid_longitude.toFixed(4)}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {item.forest_zone}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-amber-300">
                      {item.area_ha} Ha
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="text-rose-400 font-bold">{item.mean_delta_index}</span>
                      <span className="block text-[10px] text-slate-400">dNDVI</span>
                    </td>
                    <td className="p-3.5 space-y-1">
                      {item.near_river && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800 mr-1">
                          Sungai ({item.river_distance_m || '<120'}m)
                        </span>
                      )}
                      {item.near_road && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 text-[10px] border border-orange-800">
                          Jalan ({item.road_distance_m || '<300'}m)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.severity === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : item.severity === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setInspectingEvent(item)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                      >
                        Inspeksi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Scenes Catalog Browser */}
      {activeTab === 'scenes' && (
        <SceneCatalogBrowser
          scenes={scenes}
          loading={scenesLoading}
          selectedT0={selectedT0}
          selectedT1={selectedT1}
          onSelectT0={(s) => setSelectedT0(s)}
          onSelectT1={(s) => setSelectedT1(s)}
          onSearch={handleSceneSearch}
        />
      )}

      {/* Tab 4: Providers & Indices */}
      {activeTab === 'providers' && (
        <ProviderStatusPanel providers={providers} indices={indices} />
      )}

      {/* Event Detail Modal */}
      {inspectingEvent && (
        <ChangeEventDetailModal
          event={inspectingEvent}
          onClose={() => setInspectingEvent(null)}
        />
      )}
    </div>
  );
};
