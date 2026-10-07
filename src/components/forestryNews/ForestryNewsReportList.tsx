import React, { useState } from 'react';
import {
  ForestryNewsRecord,
  ForestryNewsEvent,
} from '../../types/forestryNews';
import { formatDateWib } from '../../utils/formatters';
import {
  Search,
  Filter,
  Newspaper,
  Scale,
  Flame,
  TreePine,
  ExternalLink,
  Eye,
  Layers,
  Calendar,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface ForestryNewsReportListProps {
  records: ForestryNewsRecord[];
  events: ForestryNewsEvent[];
  onSelectRecord: (record: ForestryNewsRecord, event?: ForestryNewsEvent) => void;
}

export const ForestryNewsReportList: React.FC<ForestryNewsReportListProps> = ({
  records,
  events,
  onSelectRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredEvents = events.filter((evt) => {
    if (categoryFilter !== 'ALL' && evt.eventType !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && evt.legalStatus !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.locationName.toLowerCase().includes(q) ||
        evt.eventId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'ENFORCEMENT':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'COURT_CASE':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'FIRE':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'MINING':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Cari berita kehutanan, topik, kecamatan, atau nomor kasus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs cursor-pointer"
            >
              <option value="ALL">Semua Kategori Aktivitas</option>
              <option value="FORESTRY">Kehutanan (Pembalakan / Perambahan)</option>
              <option value="ENFORCEMENT">Penegakan Hukum (Gakkum / Polri)</option>
              <option value="COURT_CASE">Peradilan (Sidang Pengadilan)</option>
              <option value="FIRE">Kebakaran Hutan / Gambut</option>
              <option value="MINING">Pertambangan Ilegal (PETI)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs cursor-pointer"
            >
              <option value="ALL">Semua Status Legalitas</option>
              <option value="ENFORCEMENT_REPORTED">Penindakan Terlapor</option>
              <option value="COURT_CASE">Dalam Proses Pengadilan</option>
              <option value="REPORTED">Imbauan / Laporan Resmi</option>
              <option value="UNDER_INVESTIGATION">Dalam Penyelidikan</option>
              <option value="ALLEGED">Dugaan / Laporan Publik</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Menampilkan <strong>{filteredEvents.length}</strong> kejadian dari {records.length} artikel terindeks</span>
          <span>Deduplikasi Kluster: <strong>Section 18 Terverifikasi</strong></span>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => {
          const rec = records.find((r) => r.recordId === evt.recordId);
          return (
            <div
              key={evt.eventId}
              onClick={() => rec && onSelectRecord(rec, evt)}
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {evt.eventId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCategoryBadgeClass(evt.eventType)}`}>
                    {evt.eventType} &bull; {evt.activityType.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">
                    {evt.legalStatus}
                  </span>
                  {evt.sourceCount > 1 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                      {evt.sourceCount} Sumber Terbuka
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {formatDateWib(evt.publicationDate)}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              {/* Bottom Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-medium">
                  {evt.locationName} ({evt.locationPrecision})
                </span>

                {evt.satelliteCorrelated && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 flex items-center gap-1 font-semibold">
                    <TreePine className="w-3 h-3 text-emerald-400" />
                    <span>Korelasi Sentinel-2</span>
                  </span>
                )}

                {evt.fireCorrelated && (
                  <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-800 text-red-300 flex items-center gap-1 font-semibold">
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>Korelasi Titik Api</span>
                  </span>
                )}

                <span className="ml-auto flex items-center gap-1 text-cyan-400 hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen &amp; Kutipan</span>
                </span>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            Tidak ada warta publik yang sesuai dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
};
