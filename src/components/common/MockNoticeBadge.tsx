import React from 'react';
import { AlertCircle, Terminal } from 'lucide-react';

interface MockNoticeBadgeProps {
  className?: string;
  compact?: boolean;
}

export const MockNoticeBadge: React.FC<MockNoticeBadgeProps> = ({
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}
        title="Mode Fase 2: UI & Application Shell menggunakan skema data simulasi (Mock Data)"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>FASE 2: MOCK UI SHELL</span>
      </span>
    );
  }

  return (
    <div
      className={`px-4 py-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold tracking-wide">FASE 2: USER INTERFACE &amp; APPLICATION SHELL AKTIF</span>
          <p className="text-[11px] text-amber-300/80">
            Frontend dapat dinavigasi penuh. Seluruh data berlabel <code className="bg-amber-950 px-1 py-0.2 rounded font-mono">[MOCK DATA]</code> menggunakan skema produksi namun belum dihubungkan ke pipa ingestion publik (Fase 3+).
          </p>
        </div>
      </div>
      <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700">
        <Terminal className="w-3 h-3 text-emerald-400" />
        <span>Schema-Compliant</span>
      </span>
    </div>
  );
};
