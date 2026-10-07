import React from 'react';
import {
  Link2,
  Flame,
  TreePine,
  Clock,
  Compass,
  Info,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { FireLandChangeCorrelation } from '../../types/fire';

interface FireLandChangeCorrelationViewProps {
  correlations: FireLandChangeCorrelation[];
  onInspectFireEvent: (fireEventId: string) => void;
}

export const FireLandChangeCorrelationView: React.FC<FireLandChangeCorrelationViewProps> = ({
  correlations,
  onInspectFireEvent,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-400" />
            Korelasi Spasio-Temporal Kejadian Api &amp; Perubahan Tutupan Lahan (Fase 5 &amp; 6)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Analisis ko-lokasi spasial dan kedekatan waktu antara anomali termal NASA FIRMS dan deteksi penurunan tajuk kanopi Sentinel-2 dNDVI.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800">
          {correlations.length} Korelasi Spasial Teridentifikasi
        </span>
      </div>

      {/* Mandatory Causality Disclaimer */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">KLAUSUL BATASAN HUKUM:</strong> Korelasi spasio-temporal adalah metrik observasional berbasis kedekatan jarak (&lt;3 km) dan jendela waktu (&lt;45 hari). Sistem secara tegas <strong>melarang klaim pembuktian sebab-akibat</strong> bahwa api otomatis menjadi penyebab bukaan lahan tanpa bukti faktual lapangan.
        </div>
      </div>

      {/* Correlation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {correlations.map((corr) => (
          <div
            key={corr.correlation_id}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400 font-bold">
                {corr.correlation_id}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Skor Korelasi: {corr.correlation_score}/100
              </span>
            </div>

            {/* Pair Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                  <Flame className="w-3.5 h-3.5" /> Fire Event
                </div>
                <div className="font-mono font-bold text-slate-200 mt-1">{corr.fire_event_id}</div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <TreePine className="w-3.5 h-3.5" /> Land Change Event
                </div>
                <div className="font-mono font-bold text-slate-200 mt-1">{corr.land_change_event_id}</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>
                Jarak Spasial: <strong className="text-slate-200">{corr.distance_meters} meter</strong>{' '}
                <span className="text-[10px] text-slate-500">({corr.spatial_relationship})</span>
              </div>
              <div>
                Selisih Waktu: <strong className="text-slate-200">{corr.time_difference_days} hari</strong>{' '}
                <span className="text-[10px] text-slate-500">({corr.temporal_relationship})</span>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Metode: Spatiotemporal Buffer Proximity</span>
              <button
                onClick={() => onInspectFireEvent(corr.fire_event_id)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                Lihat Detail Korelasi <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
