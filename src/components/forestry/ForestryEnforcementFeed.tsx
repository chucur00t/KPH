import React from 'react';
import { ForestryEnforcementEvent } from '../../types/forestryActivity';
import { formatDateWib } from '../../utils/formatters';
import { Scale, ExternalLink, ShieldCheck, MapPin, FileCheck } from 'lucide-react';

interface ForestryEnforcementFeedProps {
  enforcements: ForestryEnforcementEvent[];
}

export const ForestryEnforcementFeed: React.FC<ForestryEnforcementFeedProps> = ({
  enforcements,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Registri Publik Tindakan Penegakan Hukum Kehutanan (Fase 10)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Data dihimpun eksklusif dari siaran pers resmi Gakkum KLHK, penetapan kepolisian publik, dan direktori putusan pengadilan yang dipublikasikan secara terbuka.
        </p>
      </div>

      <div className="space-y-3">
        {enforcements.map((enf) => (
          <div
            key={enf.enforcementEventId}
            className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {enf.enforcementEventId}
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                  {enf.eventType}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  Status: <strong>{enf.status}</strong>
                </span>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Tanggal Peristiwa: {formatDateWib(enf.eventDate).substring(0, 11)}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100">{enf.activityType}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{enf.description}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 text-xs space-y-1 border border-slate-800/80 text-[11px]">
              <div className="text-slate-400">
                Dasar Hukum: <span className="text-amber-300 font-medium">{enf.legalReference}</span>
              </div>
              <div className="text-slate-400">
                No. Registrasi / LP: <span className="font-mono text-slate-200">{enf.caseReference}</span>
              </div>
              <div className="text-slate-400">
                Instansi Pelaksana: <span className="text-slate-200 font-semibold">{enf.agency}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{enf.location}</span>
              </span>

              <a
                href={enf.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:underline font-medium"
              >
                <span>Tautan Bukti Siaran Pers Asli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
