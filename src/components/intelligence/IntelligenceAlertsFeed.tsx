import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { IntelligenceAlert } from '../../types/intelligenceEngine';

interface IntelligenceAlertsFeedProps {
  alerts: IntelligenceAlert[];
  onAcknowledge: (alertId: string) => void;
}

export const IntelligenceAlertsFeed: React.FC<IntelligenceAlertsFeedProps> = ({
  alerts,
  onAcknowledge,
}) => {
  const getSeverityBadge = (level: IntelligenceAlert['alert_level']) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
            KRITIKAL / TINGGI
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
            MODERAT / WASPADA
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-950 text-blue-400 border border-blue-800">
            INFORMASI
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Peringatan dini diturunkan secara deterministik dengan penjelasan kausalitas dan bukti transparan.</span>
        <span className="font-mono text-cyan-400 font-bold">{alerts.length} Peringatan Aktif</span>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            Tidak ada peringatan dini aktif pada periode ini.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {alert.alert_id}
                  </span>
                  {getSeverityBadge(alert.alert_level)}
                  <span className="text-xs font-mono text-slate-400">
                    Pemicu: {alert.trigger_type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {alert.status === 'NEW' ? (
                    <button
                      onClick={() => onAcknowledge(alert.alert_id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      Konfirmasi (Acknowledge)
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Telah Dikonfirmasi
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h4 className="text-sm font-bold text-slate-100">{alert.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{alert.description}</p>
              </div>

              {/* Four-Factor Structured Alert Explanation (Section 37) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Mengapa Peringatan Diterbitkan (WHY_ALERTED):</span>
                  <span className="text-slate-200 font-medium">{alert.why_alerted}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ambang Batas Pengujian (THRESHOLD):</span>
                  <span className="text-cyan-300 font-mono text-[11px]">{alert.threshold_applied}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jendela Data Pantau (DATA_PERIOD):</span>
                  <span className="text-slate-300">{alert.data_period}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ketidakpastian Terkait (UNCERTAINTY):</span>
                  <span className="text-amber-300 text-[11px]">{alert.uncertainty}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
