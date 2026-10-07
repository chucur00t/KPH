import React, { useState } from 'react';
import {
  Satellite,
  Search,
  Calendar,
  Cloud,
  Layers,
  ExternalLink,
  CheckCircle,
  Eye,
  Info,
} from 'lucide-react';
import { SatelliteScene } from '../../types/satellite';

interface SceneCatalogBrowserProps {
  scenes: SatelliteScene[];
  loading: boolean;
  selectedT0: SatelliteScene | null;
  selectedT1: SatelliteScene | null;
  onSelectT0: (scene: SatelliteScene) => void;
  onSelectT1: (scene: SatelliteScene) => void;
  onSearch: (params: {
    date_start: string;
    date_end: string;
    max_cloud_cover: number;
    satellite: string;
  }) => void;
}

export const SceneCatalogBrowser: React.FC<SceneCatalogBrowserProps> = ({
  scenes,
  loading,
  selectedT0,
  selectedT1,
  onSelectT0,
  onSelectT1,
  onSearch,
}) => {
  const [dateStart, setDateStart] = useState('2026-01-01');
  const [dateEnd, setDateEnd] = useState('2026-09-30');
  const [maxCloud, setMaxCloud] = useState(30);
  const [satellite, setSatellite] = useState('ALL');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      date_start: `${dateStart}T00:00:00.000Z`,
      date_end: `${dateEnd}T23:59:59.000Z`,
      max_cloud_cover: maxCloud,
      satellite,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4">
      {/* Search Header & Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Satellite className="w-4 h-4 text-emerald-400" />
              Katalog Citra Satelit Publik Terbuka
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pencarian citra multispektral BOA Sentinel-2 L2A &amp; Landsat-9 di wilayah Kabupaten Sintang &amp; KPH Sintang Timur (Tile MGRS 49MCV &amp; 49MCU).
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/50">
            {scenes.length} Scene Terverifikasi
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tanggal Mulai (T0)
            </label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tanggal Akhir (T1)
            </label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1"><Cloud className="w-3.5 h-3.5" /> Max Cloud Cover</span>
              <span className="font-mono text-emerald-400">{maxCloud}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={maxCloud}
              onChange={(e) => setMaxCloud(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-slate-400 font-medium mb-1">Wahana Satelit</label>
              <select
                value={satellite}
                onChange={(e) => setSatellite(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Sensor Publik</option>
                <option value="Sentinel-2A">Sentinel-2A (MSI L2A)</option>
                <option value="Sentinel-2B">Sentinel-2B (MSI L2A)</option>
                <option value="Landsat-9">Landsat-9 (USGS OLI-2)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded flex items-center gap-1 transition-colors"
            >
              <Search className="w-3.5 h-3.5" /> Filter
            </button>
          </div>
        </form>
      </div>

      {/* Scenes List */}
      <div className="p-4 pt-0">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Memuat katalog citra satelit publik...
          </div>
        ) : scenes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-1">
            <Info className="w-6 h-6 mx-auto text-slate-500 mb-2" />
            <p>Tidak ada citra satelit publik yang sesuai filter.</p>
            <p className="text-[11px] text-slate-500">Coba perlebar batas cloud cover atau rentang tanggal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenes.map((scene) => {
              const isT0 = selectedT0?.scene_id === scene.scene_id;
              const isT1 = selectedT1?.scene_id === scene.scene_id;

              return (
                <div
                  key={scene.scene_id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isT0
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-950/30'
                      : isT1
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/30'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {scene.satellite}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Tile {scene.tile_id || 'MGRS'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {scene.resolution_meters}m
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 mt-1 font-mono break-all line-clamp-1">
                        {scene.scene_id}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          scene.cloud_cover_percent <= 15
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : scene.cloud_cover_percent <= 30
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {scene.cloud_cover_percent}% Cloud
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      Tanggal:{' '}
                      <span className="text-slate-200 font-medium">
                        {new Date(scene.acquisition_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      Level: <span className="text-slate-200">{scene.processing_level}</span>
                    </div>
                  </div>

                  {/* Available Bands */}
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-500">Bands:</span>
                    {scene.available_bands.slice(0, 6).map((b) => (
                      <span
                        key={b}
                        className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                      >
                        {b}
                      </span>
                    ))}
                    {scene.available_bands.length > 6 && (
                      <span className="text-[10px] text-slate-500">
                        +{scene.available_bands.length - 6} more
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <a
                      href={scene.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> STAC
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectT0(scene)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          isT0
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                        }`}
                      >
                        {isT0 && <CheckCircle className="w-3 h-3" />}
                        Baseline (T0)
                      </button>

                      <button
                        onClick={() => onSelectT1(scene)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          isT1
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                        }`}
                      >
                        {isT1 && <CheckCircle className="w-3 h-3" />}
                        Target (T1)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
