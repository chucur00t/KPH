import React from 'react';
import { formatDateWib } from '../../utils/formatters';
import { Activity, Radio, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface ForestryNewsSourceHealthPanelProps {
  sources: any[];
}

export const ForestryNewsSourceHealthPanel: React.FC<ForestryNewsSourceHealthPanelProps> = ({
  sources,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Status Kesehatan Pipa Kolektor &amp; Crawler Warta Publik (Section 25)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Memantau ketersediaan endpoint RSS, API, dan laman portal media resmi dengan kepatuhan penuh terhadap robots.txt, pembatasan laju crawling, dan proteksi SSRF.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold">
                <th className="p-3">Sumber Data Warta</th>
                <th className="p-3">Status</th>
                <th className="p-3">Metode Crawl</th>
                <th className="p-3">Frekuensi</th>
                <th className="p-3">Prioritas</th>
                <th className="p-3">Artikel Terindeks</th>
                <th className="p-3">Sinkron Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sources.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{s.sourceName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.sourceId} &bull; {s.publisher}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {s.status} (HTTP {s.httpStatus})
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{s.crawlMethod}</td>
                  <td className="p-3 font-mono text-slate-400">{s.crawlFrequency}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                      {s.monitoringPriority}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-200 font-bold">{s.recordsCount} warta</td>
                  <td className="p-3 font-mono text-slate-400">
                    {s.lastSuccessAt ? formatDateWib(s.lastSuccessAt).substring(0, 16) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
