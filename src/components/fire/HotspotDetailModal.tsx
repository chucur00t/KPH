import React from 'react';
import {
  X,
  Flame,
  Satellite,
  Compass,
  Navigation,
  Layers,
  FileCheck2,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Thermometer,
  Activity,
  Info,
} from 'lucide-react';
import { FireDetection } from '../../types/fire';

interface HotspotDetailModalProps {
  detection: FireDetection | null;
  onClose: () => void;
}

export const HotspotDetailModal: React.FC<HotspotDetailModalProps> = ({
  detection,
  onClose,
}) => {
  if (!detection) return null;

  const statusColor =
    detection.status === 'CORRELATED'
      ? 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
      : detection.status === 'CONFIRMED_BY_PUBLIC_SOURCE'
      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
      : 'border-rose-500/40 bg-rose-950/30 text-rose-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-rose-400">
                {detection.detection_id}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                {detection.status}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {detection.satellite} ({detection.instrument})
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Deteksi Anomali Termal: {detection.kecamatan || 'Kabupaten Sintang'}
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
          {/* Important Caveat Banner */}
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>SEMANTIK DATA RESMI (HOTSPOT ≠ FIRE CONFIRMED):</strong> Rekaman ini merupakan hasil observasi radiasi termal instrumen satelit (Thermal Anomaly). Status hukum kebakaran hanya dapat ditentukan oleh instansi berwenang di lapangan.
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Suhu Kecerahan</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {detection.brightness} <span className="text-xs font-normal text-slate-400">K</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Fire Radiative Power</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                {detection.frp !== null && detection.frp !== undefined ? `${detection.frp} MW` : 'N/A'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Confidence</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1 uppercase">
                {detection.confidence}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Waktu Akuisisi</div>
              <div className="text-xs font-bold text-slate-200 mt-1 truncate">
                {new Date(detection.acquisition_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </div>
            </div>
          </div>

          {/* Section 1: SOURCE DATA (Strict Observation) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              1. Data Observasi Satelit Publik (Source Data)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400">Koordinat Sensor: </span>
                <span className="font-mono text-slate-200 font-semibold">
                  {detection.latitude.toFixed(5)}, {detection.longitude.toFixed(5)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Waktu UTC: </span>
                <span className="font-mono text-slate-200">{detection.acquisition_time}</span>
              </div>
              <div>
                <span className="text-slate-400">Instrumen / Wahana: </span>
                <span className="text-slate-200 font-medium">
                  {detection.instrument} ({detection.satellite})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Brightness Temp Ch 31: </span>
                <span className="font-mono text-slate-200">{detection.bright_t31 || 'N/A'} K</span>
              </div>
              <div>
                <span className="text-slate-400">Day / Night: </span>
                <span className="text-slate-200">{detection.day_night === 'D' ? 'Day (Siang)' : 'Night (Malam)'}</span>
              </div>
              <div>
                <span className="text-slate-400">Algoritma / Versi: </span>
                <span className="font-mono text-slate-200">{detection.version}</span>
              </div>
            </div>
          </div>

          {/* Section 2: SYSTEM-DERIVED CONTEXT (Derived Intelligence) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              2. Konteks Spasial &amp; Lingkungan Publik (System-Derived)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Wilayah Administratif</span>
                <div className="font-medium text-slate-200">
                  {detection.kabupaten} &rarr; {detection.kecamatan || 'Kecamatan'} ({detection.desa || 'Desa'})
                </div>
                <div className="text-[10px] text-emerald-400">{detection.kph_unit || 'KPH Sintang Timur'}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Fungsi Kawasan Hutan</span>
                <div className="font-medium text-slate-200">{detection.forest_zone || 'Areal Penggunaan Lain'}</div>
                <div className="text-[10px] text-slate-400">Tutupan Lahan: {detection.tutupan_lahan || 'Hutan Lahan Kering Primer/Sekunder'}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Buffer Sempadan Sungai</span>
                <div className="font-medium text-slate-200">
                  {detection.near_river ? (
                    <span className="text-cyan-300 font-bold">
                      Dekat Sungai ({detection.river_distance_meters || '<120'}m)
                    </span>
                  ) : (
                    <span>Aman ({detection.river_distance_meters || '>500'}m)</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Buffer Akses Jalan</span>
                <div className="font-medium text-slate-200">
                  {detection.near_road ? (
                    <span className="text-orange-300 font-bold">
                      Dekat Koridor Jalan ({detection.road_distance_meters || '<300'}m)
                    </span>
                  ) : (
                    <span>Jauh dari jalan ({detection.road_distance_meters || '>1000'}m)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: PROVENANCE AUDIT TRAIL */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              3. Rekam Jejak Audit Provenance (Fase 3 Single Source of Truth)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Source Registry ID: </span>
                <span className="font-mono text-emerald-400 font-bold">{detection.source_id}</span>
              </div>
              <div>
                <span className="text-slate-400">Source Record ID: </span>
                <span className="font-mono text-slate-300">{detection.source_record_id}</span>
              </div>
              <div>
                <span className="text-slate-400">Waktu Penarikan Data: </span>
                <span className="font-mono text-slate-300">{detection.retrieved_at}</span>
              </div>
              <div>
                <span className="text-slate-400">Raw Reference: </span>
                <span className="font-mono text-slate-300">{detection.raw_reference || 'NASA_NRT'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">NASA FIRMS Earthdata NRT Feed</span>
              <a
                href={detection.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Buka di NASA FIRMS Web <ExternalLink className="w-3.5 h-3.5" />
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
