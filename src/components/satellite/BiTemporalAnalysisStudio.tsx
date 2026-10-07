import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Play,
  TrendingDown,
  Activity,
  Sliders,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  SatelliteScene,
  SpectralIndexType,
  LandChangeDetectionResult,
  LandChangeEvent,
} from '../../types/satellite';

interface BiTemporalAnalysisStudioProps {
  selectedT0: SatelliteScene | null;
  selectedT1: SatelliteScene | null;
  aoiName: string;
  onRunDetection: (indexType: SpectralIndexType, threshold: number) => Promise<void>;
  running: boolean;
  result: LandChangeDetectionResult | null;
  onInspectEvent: (event: LandChangeEvent) => void;
}

export const BiTemporalAnalysisStudio: React.FC<BiTemporalAnalysisStudioProps> = ({
  selectedT0,
  selectedT1,
  aoiName,
  onRunDetection,
  running,
  result,
  onInspectEvent,
}) => {
  const [indexType, setIndexType] = useState<SpectralIndexType>('NDVI');
  const [threshold, setThreshold] = useState(-0.30);

  const canRun = selectedT0 && selectedT1 && selectedT0.scene_id !== selectedT1.scene_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRun || running) return;
    await onRunDetection(indexType, threshold);
  };

  return (
    <div className="space-y-4">
      {/* Studio Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Studio Analisis Bi-Temporal Perubahan Tutupan Lahan
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Komparasi indeks spektral antara dua waktu akuisisi satelit untuk isolasi deforestasi, pembukaan tajuk, dan anomali biofisik.
            </p>
          </div>
          <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Wilayah Target: </span>
            <span className="text-emerald-400 font-bold">{aoiName}</span>
          </div>
        </div>

        {/* Selected Scenes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* Baseline T0 */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Baseline Citra (T0)
              </span>
              {selectedT0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedT0.satellite}
                </span>
              )}
            </div>

            {selectedT0 ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200 font-mono break-all line-clamp-1">
                  {selectedT0.scene_id}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>
                    Tanggal:{' '}
                    <strong className="text-slate-200">
                      {new Date(selectedT0.acquisition_date).toLocaleDateString('id-ID')}
                    </strong>
                  </span>
                  <span>
                    Cloud: <strong className="text-slate-200">{selectedT0.cloud_cover_percent}%</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                Pilih Citra T0 dari Katalog di bawah
              </div>
            )}
          </div>

          {/* Comparison T1 */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Target Deteksi (T1)
              </span>
              {selectedT1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {selectedT1.satellite}
                </span>
              )}
            </div>

            {selectedT1 ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200 font-mono break-all line-clamp-1">
                  {selectedT1.scene_id}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>
                    Tanggal:{' '}
                    <strong className="text-slate-200">
                      {new Date(selectedT1.acquisition_date).toLocaleDateString('id-ID')}
                    </strong>
                  </span>
                  <span>
                    Cloud: <strong className="text-slate-200">{selectedT1.cloud_cover_percent}%</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                Pilih Citra T1 dari Katalog di bawah
              </div>
            )}
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Indeks Spektral</label>
            <select
              value={indexType}
              onChange={(e) => setIndexType(e.target.value as SpectralIndexType)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="NDVI">NDVI - Vegetasi &amp; Kehijauan Kanopi ((B8 - B4) / (B8 + B4))</option>
              <option value="NDWI">NDWI - Kelembaban Air Lahan Basah ((B3 - B8) / (B3 + B8))</option>
              <option value="NBR">NBR - Indeks Bekas Kebakaran &amp; Lahan Terbuka ((B8 - B12) / (B8 + B12))</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium">Ambang Batas Kehilangan (dIndex)</label>
              <span className="font-mono text-amber-400 font-bold">{threshold}</span>
            </div>
            <input
              type="range"
              min="-0.45"
              max="-0.15"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Sensitif (-0.15)</span>
              <span>Standar (-0.30)</span>
              <span>Ketat (-0.45)</span>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!canRun || running}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                canRun && !running
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {running ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Mengkomputasi Delta d{indexType}...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Jalankan Deteksi Perubahan (d{indexType})
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-100">
                Hasil Analisis Bi-Temporal: {result.aoi_id}
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Durasi Komputasi: {result.processing_duration_ms} ms
            </span>
          </div>

          {/* Result Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Luas Dianalisis</span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                {result.total_area_analyzed_ha.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">Ha</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-[10px] font-semibold uppercase text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Kehilangan Tajuk
              </span>
              <div className="text-xl font-bold font-mono text-rose-300 mt-1">
                {result.loss_area_ha}{' '}
                <span className="text-xs font-normal text-slate-400">Ha</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] font-semibold uppercase text-emerald-400">Regrowth / Pemulihan</span>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                {result.gain_area_ha}{' '}
                <span className="text-xs font-normal text-slate-400">Ha</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Tutupan Stabil</span>
              <div className="text-xl font-bold font-mono text-slate-300 mt-1">
                {result.stable_area_ha.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">Ha</span>
              </div>
            </div>
          </div>

          {/* Generated Change Events List */}
          {result.events_generated.length > 0 && (
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Kluster Kejadian Terdeteksi ({result.events_generated.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.events_generated.map((evt) => (
                  <div
                    key={evt.event_id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {evt.event_id}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                          {evt.severity}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 font-medium mt-1">
                        {evt.kecamatan} ({evt.forest_zone})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Luas: <strong className="text-amber-400">{evt.area_ha} Ha</strong> | dNDVI:{' '}
                        <strong className="text-rose-400">{evt.mean_delta_index}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => onInspectEvent(evt)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Inspeksi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
