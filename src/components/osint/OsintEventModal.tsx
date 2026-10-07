import React from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  Calendar,
  Layers,
  Flame,
  TreePine,
  ExternalLink,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { OsintEvent, OsintSpatialCorrelation } from '../../types/osint';

interface OsintEventModalProps {
  event: OsintEvent | null;
  onClose: () => void;
}

export const OsintEventModal: React.FC<OsintEventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                  {event.event_code}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Taksonomi: {event.taxonomic_stage}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Keyakinan: {event.confidence_score}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 line-clamp-1 mt-0.5">
                {event.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Spatial & Administrative Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Kabupaten / Wilayah:</span>
              <span className="font-semibold text-slate-200">{event.kabupaten}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Kecamatan Teridentifikasi:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.kecamatan} ({event.geocoding_precision})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Fungsi Kawasan Hutan Terdekat:</span>
              <span className="font-medium text-slate-200">{event.forest_zone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Waktu Publikasi / Kejadian:</span>
              <span className="font-mono text-slate-200">
                {new Date(event.published_at).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Activity Description */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 block">Ringkasan Aktivitas Terlapor:</span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-300">
              {event.summary}
            </div>
          </div>

          {/* Cross-Module Spatial Correlations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Korelasi Spasial Lintas Modul ({event.correlations?.length || 0})
              </span>
              <span className="text-[11px] text-slate-400">
                Fase 4 (GIS) &bull; Fase 5 (Satelit) &bull; Fase 6 (Kebakaran)
              </span>
            </div>

            {(!event.correlations || event.correlations.length === 0) ? (
              <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400">
                Tidak ada korelasi spasial terdeteksi untuk kejadian ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {event.correlations.map((corr) => (
                  <div
                    key={corr.correlation_id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {corr.target_module === 'SATELLITE_LAND_CHANGE' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-medium flex items-center gap-1">
                            <TreePine className="w-3 h-3" />
                            Fase 5 — Satelit Tutupan Lahan
                          </span>
                        )}
                        {corr.target_module === 'FIRE_HOTSPOT' && (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-medium flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Fase 6 — Titik Panas FIRMS/SIPONGI
                          </span>
                        )}
                        {corr.target_module === 'GIS_FOREST_ZONE' && (
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-medium flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            Fase 4 — Yurisdiksi Kawasan Hutan
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400">
                          ID: {corr.target_id}
                        </span>
                      </div>
                      <span className="text-[11px] text-cyan-300 font-mono">
                        Skor: {corr.confidence_score}%
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {corr.correlation_summary}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                      <span>Jarak Geodesik: {corr.distance_meters > 0 ? `${(corr.distance_meters / 1000).toFixed(1)} km` : 'Tepat di dalam batas'}</span>
                      {corr.time_delta_hours !== null && (
                        <span>Rentang Waktu: &plusmn;{corr.time_delta_hours} jam</span>
                      )}
                      <span>Tipe: {corr.correlation_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>KPH Public Intelligence System — Zero-Hallucination Compliance</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
