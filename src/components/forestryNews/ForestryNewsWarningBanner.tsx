import React from 'react';
import { Newspaper, Scale, ShieldAlert, ExternalLink, Radio } from 'lucide-react';

export const ForestryNewsWarningBanner: React.FC = () => {
  return (
    <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-cyan-950/20 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5 shrink-0 border border-cyan-500/30">
          <Newspaper className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-cyan-300">
              Pemantauan Warta &amp; Laporan Publik Terbuka (Fase 10A OSINT)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
              100% DATA TERBUKA
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono">
              PUBLIC REPORT ≠ FACT ≠ CONVICTION
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
              PRESUMPTION OF INNOCENCE
            </span>
          </div>

          <p className="text-slate-200 leading-relaxed font-medium">
            <strong>Sistem ini merupakan mesin pemantau warta dan laporan publik (OSINT), BUKAN sistem tuduhan pidana.</strong> Informasi berita dan rilis pers merupakan laporan awal yang belum tentu mencerminkan kebenaran materiil sebelum diuji dalam peradilan berkekuatan hukum tetap (inkracht). Asas praduga tak bersalah berlaku mutlak.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>Metodologi: <code className="text-cyan-300">FETCH → DEDUPLICATE → CLASSIFY → ENTITY/CLAIM → GIS &amp; SATELLITE CORRELATION</code></span>
            <span>Cakupan: <strong>Kabupaten Sintang &amp; KPH Sintang Timur</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
