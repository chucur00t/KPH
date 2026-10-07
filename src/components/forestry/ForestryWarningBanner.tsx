import React from 'react';
import { ShieldAlert, AlertTriangle, Scale, ExternalLink } from 'lucide-react';

export const ForestryWarningBanner: React.FC = () => {
  return (
    <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0 border border-amber-500/30">
          <Scale className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-amber-300">
              Prinsip Kepatuhan Hukum &amp; Keamanan Semantik (Fase 10)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
              100% DATA PUBLIK TERBUKA
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono">
              AKTIVITAS ≠ STATUS HUKUM
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-mono">
              ZERO AUTOMATIC ACCUSATION
            </span>
          </div>

          <p className="text-slate-200 leading-relaxed font-medium">
            <strong>Informasi ini merupakan hasil analisis data publik dan indikator intelijen.</strong> Indikator aktivitas tidak sama dengan bukti pelanggaran hukum. Status legalitas memerlukan verifikasi berdasarkan data otoritatif dan/atau proses resmi. Ketiadaan catatan izin publik terbuka bukan merupakan kesimpulan otomatis aktivitas ilegal.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>Dimensi Pengamatan: <code className="text-amber-300">OBSERVATION → INDICATOR → CORRELATION → VERIFICATION</code></span>
            <span>Wilayah: <strong>KPH Sintang Timur (2.163.500 Ha)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
