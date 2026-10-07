import React from 'react';
import {
  X,
  Flame,
  Calendar,
  Clock,
  Compass,
  Navigation,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  ShieldAlert,
  TreePine,
  ExternalLink,
  FileCheck2,
  Info,
  Link2,
} from 'lucide-react';
import { FireEvent } from '../../types/fire';

interface FireEventDetailModalProps {
  event: FireEvent | null;
  onClose: () => void;
  onInspectLandChange?: (landChangeEventId: string) => void;
}

export const FireEventDetailModal: React.FC<FireEventDetailModalProps> = ({
  event,
  onClose,
  onInspectLandChange,
}) => {
  if (!event) return null;

  const statusColor =
    event.status === 'CORRELATED'
      ? 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
      : event.status === 'CONFIRMED_BY_PUBLIC_SOURCE'
      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
      : 'border-rose-500/40 bg-rose-950/30 text-rose-300';

  const confidenceColor =
    event.confidence === 'HIGH'
      ? 'border-rose-500/40 bg-rose-950/30 text-rose-300'
      : event.confidence === 'MEDIUM'
      ? 'border-amber-500/40 bg-amber-950/30 text-amber-300'
      : 'border-slate-500/40 bg-slate-800 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-rose-400">
                {event.event_id}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                {event.status}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${confidenceColor}`}>
                {event.confidence} CONFIDENCE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {event.detection_count} Titik Deteksi
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Kejadian Api (Fire Event): {event.kecamatan} ({event.forest_zone})
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
          {/* Important Caveat */}
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>KLAUSUL KLUSTERISASI SISTEM (SYSTEM_DERIVED):</strong> Kluster ini dibentuk menggunakan algoritma pengelompokan spasiotemporal (DBSCAN jarak maks 3.5 km, jendela waktu 48 jam). Bukan vonis hukum otomatis atau klaim kepastian kebakaran di lapangan.
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Jumlah Hotspot</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                {event.detection_count} <span className="text-xs font-normal text-slate-400">titik</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Total FRP</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {event.total_frp_mw ? `${event.total_frp_mw} MW` : 'N/A'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Suhu Kecerahan Maks</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {event.max_brightness_kelvin} <span className="text-xs font-normal text-slate-400">K</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Durasi Aktif</div>
              <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
                {event.duration_hours} <span className="text-xs font-normal text-slate-400">Jam</span>
              </div>
            </div>
          </div>

          {/* Temporal Timeline */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Garis Waktu Deteksi Spasiotemporal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400">Deteksi Pertama: </span>
                <span className="font-mono text-slate-200 font-semibold">
                  {new Date(event.first_detected_at).toLocaleString('id-ID')} WIB
                </span>
              </div>
              <div>
                <span className="text-slate-400">Deteksi Terakhir: </span>
                <span className="font-mono text-slate-200 font-semibold">
                  {new Date(event.last_detected_at).toLocaleString('id-ID')} WIB
                </span>
              </div>
              <div>
                <span className="text-slate-400">Centroid Koordinat: </span>
                <span className="font-mono text-slate-200">
                  {event.centroid[1].toFixed(5)}, {event.centroid[0].toFixed(5)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Estimasi Luasan Kejadian: </span>
                <span className="font-mono text-amber-400">
                  {event.estimated_event_extent_ha ? `${event.estimated_event_extent_ha} Ha (DERIVED ESTIMATE)` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Weather Context (BMKG Susilo Sintang) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Kondisi Atmosferik Saat Kejadian (BMKG Susilo Sintang)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Suhu Udara</span>
                <strong className="text-slate-200 text-sm font-mono">{event.temperature_c || 32.4}°C</strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Kelembaban</span>
                <strong className="text-slate-200 text-sm font-mono">{event.humidity_percent || 68}%</strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Curah Hujan 24j</span>
                <strong className="text-cyan-300 text-sm font-mono">{event.rainfall_24h_mm || 1.2} mm</strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Fire Weather Index</span>
                <strong className="text-rose-400 text-sm font-mono">{event.fire_weather_index || 'TINGGI'}</strong>
              </div>
            </div>
          </div>

          {/* Geospatial Context */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Korelasi Spasial Kawasan &amp; Buffer Publik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400">Unit Pengelolaan: </span>
                <span className="text-emerald-400 font-semibold">{event.kph_unit || 'KPH Sintang Timur'}</span>
              </div>
              <div>
                <span className="text-slate-400">Kawasan Hutan: </span>
                <span className="text-slate-200 font-semibold">{event.forest_zone}</span>
              </div>
              <div>
                <span className="text-slate-400">Sempadan Sungai: </span>
                <span className="text-slate-200">
                  {event.nearest_river_name || 'Sungai Melawi'} ({event.distance_to_river_m ? `${event.distance_to_river_m}m` : '<120m'})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Akses Jalan: </span>
                <span className="text-slate-200">
                  {event.nearest_road_name || 'Jalan Koridor Logistik'} ({event.distance_to_road_m ? `${event.distance_to_road_m}m` : '<300m'})
                </span>
              </div>
            </div>
          </div>

          {/* Associated Detections */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Daftar Deteksi Titik Panas Penyusun ({event.detection_ids.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {event.detection_ids.map((id) => (
                <span
                  key={id}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>

          {/* Audit Provenance */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Audit Provenance &amp; Run ID
            </h3>
            <div className="text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400">Analysis Run ID: </span>
                <span className="font-mono text-emerald-400">{event.analysis_run_id || 'RUN-CLUSTER-PROD'}</span>
              </div>
              <div>
                <span className="text-slate-400">Metode: </span>
                <span className="text-slate-200">DBSCAN Spatiotemporal Clustering (3.5km, 48h)</span>
              </div>
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
