import React from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  TreePine,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { FireAlert } from '../../types/fire';

interface EarlyWarningAlertsPanelProps {
  alerts: FireAlert[];
  onInspectAlertEvent?: (eventId: string) => void;
}

export const EarlyWarningAlertsPanel: React.FC<EarlyWarningAlertsPanelProps> = ({
  alerts,
  onInspectAlertEvent,
}) => {
  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
        Tidak ada peringatan dini karhutla aktif saat ini.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Peringatan Dini &amp; Deteksi Kejadian Kritis ({alerts.length})
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          Rule-Based Deterministic Engine
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => {
          const isHigh = alt.severity === 'HIGH';
          const isMod = alt.severity === 'MODERATE';

          return (
            <div
              key={alt.alert_id}
              className={`p-4 rounded-xl border transition-all ${
                isHigh
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : isMod
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isHigh
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isMod
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {alt.severity} SEVERITY
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">{alt.alert_id}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(alt.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 mt-2">{alt.headline}</h4>
              <p className="text-xs text-slate-300 mt-1">{alt.reason}</p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                <div>
                  <span className="font-semibold text-slate-300">Evidence:</span> {alt.evidence}
                </div>
                {alt.event_id && onInspectAlertEvent && (
                  <button
                    onClick={() => onInspectAlertEvent(alt.event_id!)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
                  >
                    Inspeksi Fire Event <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
