import React from 'react';
import { TaxonomicStage } from '../../types/intelligence';
import { Info } from 'lucide-react';

interface TaxonomyBadgeProps {
  stage: TaxonomicStage;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STAGE_CONFIG: Record<
  TaxonomicStage,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  OBSERVATION: {
    label: 'Observation',
    bg: 'bg-sky-950/70',
    text: 'text-sky-400',
    border: 'border-sky-500/40',
    desc: 'Fakta instrumen mentah langsung dari sensor satelit tanpa manipulasi interpretasi.',
  },
  DETECTION: {
    label: 'Detection',
    bg: 'bg-amber-950/70',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    desc: 'Anomali algoritmis teridentifikasi (contoh: delta NDVI kanopi melampaui batas ambang).',
  },
  CORRELATION: {
    label: 'Correlation',
    bg: 'bg-purple-950/70',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    desc: 'Pertemuan spasio-temporal multi-sumber (contoh: deteksi api di dalam zona Hutan Lindung).',
  },
  REPORTED: {
    label: 'Reported Info',
    bg: 'bg-teal-950/70',
    text: 'text-teal-400',
    border: 'border-teal-500/40',
    desc: 'Informasi sekunder bersumber dari publikasi media massa, lembaran daerah, atau rilis publik.',
  },
  VERIFIED: {
    label: 'Verification',
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    desc: 'Telah melalui peninjauan citra resolusi tinggi pembanding atau verifikasi lapangan independen.',
  },
};

export const TaxonomyBadge: React.FC<TaxonomyBadgeProps> = ({
  stage,
  showTooltip = true,
  size = 'md',
}) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.OBSERVATION;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} transition-all group relative cursor-help`}
      title={showTooltip ? config.desc : undefined}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{config.label}</span>
      {showTooltip && (
        <Info className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};
