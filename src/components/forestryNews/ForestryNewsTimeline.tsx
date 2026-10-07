import React from 'react';
import { formatDateWib } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Scale,
  Newspaper,
  TreePine,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface ForestryNewsTimelineProps {
  timeline: any[];
  onSelectEventId?: (id: string) => void;
}

export const ForestryNewsTimeline: React.FC<ForestryNewsTimelineProps> = ({
  timeline,
  onSelectEventId,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Linimasa Kronologis Warta &amp; Tindakan Penegakan Hukum (Fase 10A)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Memetakan waktu terbit warta dan waktu kejadian faktual secara terpisah, memperlihatkan progresivitas laporan dari dugaan awal, pernyataan resmi, hingga proses peradilan.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[35px] top-1 p-1 rounded-full bg-slate-900 border-2 border-cyan-500 text-cyan-400">
              <Clock className="w-3.5 h-3.5" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 group-hover:border-cyan-500/40 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{item.id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                    {item.eventType} &bull; {item.activityType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                    {item.legalStatus}
                  </span>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div>Kejadian: <strong className="text-slate-200">{formatDateWib(item.eventDate).substring(0, 11)}</strong></div>
                  <div>Rilis: <span className="text-slate-400">{formatDateWib(item.publicationDate).substring(0, 11)}</span></div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Lokasi: <strong className="text-slate-300">{item.locationName}</strong></span>
                <span>Tipe Klaim: <strong>{item.claimType}</strong></span>
                {item.satelliteCorrelated && (
                  <span className="text-emerald-400 font-semibold">&bull; Korelasi Sentinel-2</span>
                )}
                {item.fireCorrelated && (
                  <span className="text-red-400 font-semibold">&bull; Korelasi Api</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
