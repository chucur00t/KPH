import React from 'react';
import {
  Compass,
  Layers,
  TreePine,
  Flame,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { OsintSpatialCorrelation, OsintEvent } from '../../types/osint';

interface OsintCorrelationMatrixProps {
  correlations: OsintSpatialCorrelation[];
  events: OsintEvent[];
  onSelectEvent: (event: OsintEvent) => void;
}

export const OsintCorrelationMatrix: React.FC<OsintCorrelationMatrixProps> = ({
  correlations,
  events,
  onSelectEvent,
}) => {
  const satelliteCorrelations = correlations.filter((c) => c.target_module === 'SATELLITE_LAND_CHANGE');
  const fireCorrelations = correlations.filter((c) => c.target_module === 'FIRE_HOTSPOT');
  const forestZoneCorrelations = correlations.filter((c) => c.target_module === 'GIS_FOREST_ZONE');

  return (
    <div className="space-y-6">
      {/* Intro Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400">
          <Compass className="w-5 h-5" />
          <h3 className="text-sm font-bold text-slate-100">
            Matriks Korelasi Spasio-Temporal Multimodal KPH Sintang Timur
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Modul ini menautkan narasi publik dari berita daerah dan siaran resmi JDIH/Pemkab Sintang (Sub-Modul D) dengan bukti fisik penginderaan jauh satelit Sentinel-2 Level-2A (Fase 5), titik panas termal NASA FIRMS/SIPONGI (Fase 6), serta batas yurisdiksi kawasan hutan (Fase 4).
        </p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Korelasi Satelit (Fase 5)</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {satelliteCorrelations.length}
          </div>
          <p className="text-[11px] text-slate-400">Bukaan kanopi Sentinel-2 dNDVI</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Korelasi Titik Panas (Fase 6)</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {fireCorrelations.length}
          </div>
          <p className="text-[11px] text-slate-400">Klaster termal FIRMS &amp; SIPONGI</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Yurisdiksi Kawasan Hutan (Fase 4)</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {forestZoneCorrelations.length}
          </div>
          <p className="text-[11px] text-slate-400">HL, HPT, HP &amp; Gambut Sintang</p>
        </div>
      </div>

      {/* Cross-Module Link Items */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>Daftar Bukti Bersilang (Cross-Referenced Evidence Chain)</span>
          <span className="font-mono text-cyan-400 text-xs font-semibold">({correlations.length} Korelasi)</span>
        </h4>

        <div className="space-y-3">
          {correlations.map((corr) => {
            const parentEvent = events.find((e) => e.event_id === corr.osint_event_id);
            return (
              <div
                key={corr.correlation_id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {corr.correlation_id}
                    </span>

                    {corr.target_module === 'SATELLITE_LAND_CHANGE' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-medium flex items-center gap-1">
                        <TreePine className="w-3 h-3 text-emerald-400" />
                        Terkorelasi Satelit (Fase 5)
                      </span>
                    )}
                    {corr.target_module === 'FIRE_HOTSPOT' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-medium flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Terkorelasi Titik Panas (Fase 6)
                      </span>
                    )}
                    {corr.target_module === 'GIS_FOREST_ZONE' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-400" />
                        Yurisdiksi KPH Sintang Timur
                      </span>
                    )}

                    <span className="text-slate-400 text-[11px] font-mono">
                      Target: {corr.target_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-cyan-300 font-medium">
                      Kepercayaan: {corr.confidence_score}%
                    </span>

                    {parentEvent && (
                      <button
                        onClick={() => onSelectEvent(parentEvent)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                      >
                        <span>Lihat Kejadian</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {corr.correlation_summary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      Jarak: {corr.distance_meters > 0 ? `${(corr.distance_meters / 1000).toFixed(1)} km` : 'Tepat di Wilayah'}
                    </span>
                    {corr.time_delta_hours !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        Jendela Waktu: &plusmn;{corr.time_delta_hours} jam
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[10px] text-slate-400">
                    Tipe: {corr.correlation_type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
