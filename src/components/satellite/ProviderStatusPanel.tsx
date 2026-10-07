import React from 'react';
import {
  Satellite,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { ProviderStatusInfo } from '../../services/satellite/satelliteProviderRegistry';
import { SpectralIndexConfig } from '../../types/satellite';

interface ProviderStatusPanelProps {
  providers: ProviderStatusInfo[];
  indices: SpectralIndexConfig[];
}

export const ProviderStatusPanel: React.FC<ProviderStatusPanelProps> = ({
  providers,
  indices,
}) => {
  return (
    <div className="space-y-6">
      {/* Providers Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Integrasi Provider Data Satelit Publik (Fase 3 Registry Alignment)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Status operasional dan verifikasi legalitas sumber citra satelit publik berdasarkan Data Source Registry resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => {
            const isOnline = p.status === 'ACTIVE';

            return (
              <div
                key={p.source_id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">
                      {p.source_id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 mt-0.5">{p.provider_name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOnline
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <div>
                    Sensor Terdukung:{' '}
                    <span className="text-slate-200 font-medium">
                      {p.supported_satellites.join(', ')}
                    </span>
                  </div>
                  <div className="truncate">
                    Endpoint:{' '}
                    <span className="font-mono text-[11px] text-slate-300">{p.endpoint}</span>
                  </div>
                  <div>
                    Keandalan: <span className="text-slate-200">{p.reliability}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">
                    Update Terakhir: {p.last_successful_update ? new Date(p.last_successful_update).toLocaleDateString('id-ID') : 'Belum Diverifikasi'}
                  </span>
                  <a
                    href={p.documentation_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium"
                  >
                    Dokumentasi <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indices Reference Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Standar Formula Indeks Spektral Biofisik
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Matematika indeks dan pemetaan kanal (band mapping) per wahana satelit untuk deteksi tutupan lahan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indices.map((idx) => (
            <div
              key={idx.index_id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-mono">{idx.index_id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Ambang: {idx.loss_threshold}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200">{idx.index_name}</h4>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 text-center">
                {idx.formula_expression}
              </div>
              <p className="text-[11px] text-slate-400">{idx.description}</p>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Band Mapping:</div>
                <div>Sentinel-2: {JSON.stringify(idx.band_mappings['Sentinel-2'])}</div>
                <div>Landsat-8/9: {JSON.stringify(idx.band_mappings['Landsat-8'])}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
