import React, { useState } from 'react';
import {
  Globe2,
  Calendar,
  ExternalLink,
  MapPin,
  Tag,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  FileCheck2,
  Building,
  RefreshCw,
} from 'lucide-react';
import { OsintSourceRecord, OsintSource } from '../../types/osint';

interface OsintFeedStreamProps {
  records: OsintSourceRecord[];
  sources: OsintSource[];
  onSelectRecord: (record: OsintSourceRecord) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const OsintFeedStream: React.FC<OsintFeedStreamProps> = ({
  records,
  sources,
  onSelectRecord,
  onRefresh,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('ALL');

  const filteredRecords = records.filter((r) => {
    const matchSource = selectedSourceId === 'ALL' || r.source_id === selectedSourceId;
    const matchSearch =
      searchTerm.trim() === '' ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.text_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSource && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci berita, perda, perbup, atau lokasi Sintang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSourceId}
            onChange={(e) => setSelectedSourceId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Sumber Terbuka ({records.length})</option>
            {sources.map((s) => (
              <option key={s.source_id} value={s.source_id}>
                {s.source_name.slice(0, 35)}...
              </option>
            ))}
          </select>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Muat Ulang Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stream Items List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            Tidak ada arsip berita atau publikasi terbuka yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          filteredRecords.map((item) => (
            <div
              key={item.record_id}
              className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 group"
            >
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {item.publisher}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    ID: {item.record_id}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.published_at ? new Date(item.published_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : 'Waktu tidak tersedia'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectRecord(item)}
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-800/60 transition-colors font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Audit Provenance</span>
                  </button>

                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1"
                  >
                    <span>Sumber Asli</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Title & Author */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Kustodian / Pengampu: <span className="text-slate-300 font-medium">{item.author || item.publisher}</span>
                </div>
              </div>

              {/* Excerpt Quote */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 font-sans">
                "{item.summary || item.text_content.slice(0, 220)}..."
              </p>

              {/* Footer info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jejak Audit Snapshot:</span>
                  <code className="text-slate-400 font-mono text-[10px]">{item.raw_reference}</code>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                  <span>SHA-256:</span>
                  <span>{item.content_hash.slice(0, 16)}...</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
