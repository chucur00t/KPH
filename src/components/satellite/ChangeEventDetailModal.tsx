import React from 'react';
import {
  X,
  ShieldAlert,
  TreePine,
  ExternalLink,
  Compass,
  Navigation,
  Layers,
  FileCheck2,
  Calendar,
  MapPin,
  TrendingDown,
  Activity,
} from 'lucide-react';
import { LandChangeEvent } from '../../types/satellite';

interface ChangeEventDetailModalProps {
  event: LandChangeEvent | null;
  onClose: () => void;
}

export const ChangeEventDetailModal: React.FC<ChangeEventDetailModalProps> = ({
  event,
  onClose,
}) => {
  if (!event) return null;

  const severityColor =
    event.severity === 'HIGH'
      ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
      : event.severity === 'MEDIUM'
      ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
      : 'border-blue-500/40 bg-blue-950/20 text-blue-300';

  const statusColor =
    event.status === 'VERIFIED'
      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
      : event.status === 'UNDER_REVIEW'
      ? 'border-amber-500/40 bg-amber-950/30 text-amber-300'
      : 'border-slate-500/40 bg-slate-800 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400">
                {event.event_id}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${severityColor}`}>
                {event.severity} SEVERITY
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                {event.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-2">
              <TreePine className="w-5 h-5 text-emerald-400" />
              Deteksi Anomali Kanopi: {event.kecamatan} ({event.area_ha} Ha)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Luas Terdampak</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {event.area_ha} <span className="text-xs font-normal text-slate-400">Ha</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Delta Indeks (dNDVI)</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                {event.mean_delta_index}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Fungsi Kawasan</div>
              <div className="text-xs font-bold text-slate-200 mt-1 truncate">
                {event.forest_zone}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Confidence Score</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {event.confidence_score}%
              </div>
            </div>
          </div>

          {/* Bi-Temporal Scene Details */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Komparasi Citra Bi-Temporal (T0 Baseline vs T1 Target)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Citra Baseline (T0)</span>
                <p className="font-mono text-[11px] text-slate-200 break-all">{event.baseline_scene_id}</p>
                <div className="text-[10px] text-slate-400">Sensor: Sentinel-2 MSI L2A</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-emerald-400">Citra Target Deteksi (T1)</span>
                <p className="font-mono text-[11px] text-emerald-300 break-all">{event.comparison_scene_id}</p>
                <div className="text-[10px] text-slate-400">
                  Tanggal Akusisi: {new Date(event.acquisition_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </div>
              </div>
            </div>
          </div>

          {/* Spatial Correlations & Buffer Analysis */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Korelasi Spasial &amp; Analisis Buffer Lapangan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Kedekatan Sempadan Sungai</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {event.near_river ? (
                      <span className="text-cyan-300 font-bold">
                        Zona Kritis (&lt;120m) — Jarak ke Sungai: {event.river_distance_m} meter
                      </span>
                    ) : (
                      <span>Aman dari sempadan sungai ({event.river_distance_m || '> 500'} m)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <Navigation className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Koridor Akses Jalan Logistik</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {event.near_road ? (
                      <span className="text-orange-300 font-bold">
                        Akses Dekat Jalan (&lt;300m) — Jarak ke Jalan: {event.road_distance_m} meter
                      </span>
                    ) : (
                      <span>Jauh dari akses jalan utama ({event.road_distance_m || '> 1000'} m)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <Layers className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Yurisdiksi Pengelolaan KPH</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {event.in_kph ? (
                      <span className="text-emerald-300 font-bold">
                        Berada di dalam Wilayah Kelola KPH Sintang Timur
                      </span>
                    ) : (
                      <span>Di luar batas KPH Sintang Timur</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Kawasan Hidrologis Gambut (KHG)</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {event.in_peatland ? (
                      <span className="text-purple-300 font-bold">
                        Lahan Gambut ({event.peat_depth || 'Kedalaman Dangkal/Sedang'})
                      </span>
                    ) : (
                      <span>Bukan Lahan Gambut (Tanah Mineral)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Polygon Footprint Coordinates */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Geometri Poligon (WGS84 EPSG:4326)
            </h3>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-24">
              Centroid: {event.centroid_latitude.toFixed(5)}, {event.centroid_longitude.toFixed(5)} | Rings:{' '}
              {JSON.stringify(event.geometry.coordinates[0])}
            </div>
          </div>

          {/* Provenance Audit Trail */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Source Provenance &amp; Audit Trail (Fase 3 &amp; 4 Single Source of Truth)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Source Registry ID: </span>
                <span className="font-mono text-emerald-400 font-bold">{event.source_id}</span>
              </div>
              <div>
                <span className="text-slate-400">Processing Method: </span>
                <span className="text-slate-200">{event.processing_method}</span>
              </div>
              <div>
                <span className="text-slate-400">Processing Version: </span>
                <span className="font-mono text-slate-300">{event.processing_version}</span>
              </div>
              <div>
                <span className="text-slate-400">Processing Date: </span>
                <span className="font-mono text-slate-300">
                  {new Date(event.processing_date).toISOString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">{event.source_name}</span>
              <a
                href={event.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Buka di Copernicus Data Space <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
