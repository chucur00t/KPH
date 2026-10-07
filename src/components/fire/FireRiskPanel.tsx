import React from 'react';
import {
  ShieldAlert,
  Flame,
  CloudRain,
  Thermometer,
  TreePine,
  Clock,
  Info,
  Layers,
} from 'lucide-react';
import { FireRiskEvaluation, FireRiskLevel } from '../../types/fire';

interface FireRiskPanelProps {
  evaluation: FireRiskEvaluation | null;
}

export const FireRiskPanel: React.FC<FireRiskPanelProps> = ({ evaluation }) => {
  if (!evaluation) return null;

  const levelColor =
    evaluation.risk_level === 'VERY_HIGH'
      ? 'text-rose-400 bg-rose-950/40 border-rose-500/50'
      : evaluation.risk_level === 'HIGH'
      ? 'text-orange-400 bg-orange-950/40 border-orange-500/50'
      : evaluation.risk_level === 'MODERATE'
      ? 'text-amber-400 bg-amber-950/40 border-amber-500/50'
      : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/50';

  const factors = [
    {
      key: 'recent_hotspots',
      label: 'Aktivitas Titik Panas Terkini (Bobot 30%)',
      data: evaluation.factor_breakdown.recent_hotspots,
      icon: Flame,
      color: 'text-rose-400',
    },
    {
      key: 'rainfall_deficit',
      label: 'Defisit Curah Hujan BMKG (Bobot 25%)',
      data: evaluation.factor_breakdown.rainfall_deficit,
      icon: CloudRain,
      color: 'text-cyan-400',
    },
    {
      key: 'atmospheric_dryness',
      label: 'Kekeringan Atmosfer & Suhu (Bobot 20%)',
      data: evaluation.factor_breakdown.atmospheric_dryness,
      icon: Thermometer,
      color: 'text-amber-400',
    },
    {
      key: 'peatland_flammability',
      label: 'Kerentanan Substrat Gambut KHG (Bobot 15%)',
      data: evaluation.factor_breakdown.peatland_flammability,
      icon: Layers,
      color: 'text-purple-400',
    },
    {
      key: 'historical_fire_frequency',
      label: 'Frekuensi Historis Karhutla (Bobot 10%)',
      data: evaluation.factor_breakdown.historical_fire_frequency,
      icon: Clock,
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Model Indikator Risiko Karhutla Berbasis Bukti Publik
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sistem deterministik tertimbang berbasis data observasi terbuka BMKG Susilo Sintang, NASA FIRMS, dan Peta KHG BRGM.
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs flex items-center gap-2 ${levelColor}`}>
          <span>LEVEL: {evaluation.risk_level}</span>
          <span className="text-slate-400">|</span>
          <span>Score: {evaluation.composite_score}/100</span>
        </div>
      </div>

      {/* Formula & Caveat Notice */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold text-[10px] uppercase">Formula Indikator Terbuka:</span>
          <span className="font-mono text-cyan-300 text-[11px]">{evaluation.formula_expression}</span>
        </div>
        <div className="text-[10px] text-slate-500 flex items-start gap-1">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{evaluation.caveat}</span>
        </div>
      </div>

      {/* 5 Factor Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {factors.map((f) => {
          const Icon = f.icon;
          const score = f.data.score;
          return (
            <div
              key={f.key}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${f.color}`} />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {f.data.level}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-2 line-clamp-1">{f.label}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">{f.data.observed_value}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Skor Sub-Indeks</span>
                  <span className="font-mono font-bold text-slate-300">{score}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= 75 ? 'bg-rose-500' : score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
