import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'blue';
  onClick?: () => void;
}

const COLOR_MAP = {
  emerald: {
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    bg: 'bg-emerald-950/10',
  },
  amber: {
    text: 'text-amber-400',
    icon: 'text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    bg: 'bg-amber-950/10',
  },
  rose: {
    text: 'text-rose-400',
    icon: 'text-rose-400',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    bg: 'bg-rose-950/10',
  },
  cyan: {
    text: 'text-cyan-400',
    icon: 'text-cyan-400',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    bg: 'bg-cyan-950/10',
  },
  purple: {
    text: 'text-purple-400',
    icon: 'text-purple-400',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    bg: 'bg-purple-950/10',
  },
  blue: {
    text: 'text-blue-400',
    icon: 'text-blue-400',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    bg: 'bg-blue-950/10',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  sublabel,
  icon: Icon,
  accentColor = 'emerald',
  onClick,
}) => {
  const c = COLOR_MAP[accentColor] || COLOR_MAP.emerald;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl bg-slate-900 border ${c.border} ${c.bg} transition-all space-y-1.5 ${
        onClick ? 'cursor-pointer hover:bg-slate-800/80 shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between text-slate-400 text-xs">
        <span className="font-semibold uppercase tracking-wider text-[11px] truncate">
          {label}
        </span>
        <Icon className={`w-4 h-4 shrink-0 ${c.icon}`} />
      </div>

      <div className={`text-xl font-mono font-extrabold ${c.text}`}>
        {value}{' '}
        {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
      </div>

      <div className="text-[10px] text-slate-400 truncate">{sublabel}</div>
    </div>
  );
};
