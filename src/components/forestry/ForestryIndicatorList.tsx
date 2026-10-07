import React, { useState } from 'react';
import {
  ForestryActivityIndicator,
  ForestryActivityType,
  ActivityPriority,
  VerificationPriority,
} from '../../types/forestryActivity';
import { formatDateWib } from '../../utils/formatters';
import {
  TreePine,
  Flame,
  Search,
  Filter,
  Layers,
  Calendar,
  AlertTriangle,
  Scale,
  Eye,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface ForestryIndicatorListProps {
  indicators: ForestryActivityIndicator[];
  onSelectIndicator: (indicator: ForestryActivityIndicator) => void;
}

export const ForestryIndicatorList: React.FC<ForestryIndicatorListProps> = ({
  indicators,
  onSelectIndicator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [functionFilter, setFunctionFilter] = useState<string>('ALL');

  const filtered = indicators.filter((item) => {
    if (typeFilter !== 'ALL' && item.indicatorType !== typeFilter) return false;
    if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
    if (verificationFilter !== 'ALL' && item.verificationPriority !== verificationFilter) return false;
    if (functionFilter !== 'ALL' && item.forestFunction !== functionFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.kecamatan.toLowerCase().includes(q) ||
        item.desa.toLowerCase().includes(q) ||
        item.indicatorId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'VERY_HIGH':
      case 'HIGH':
        return 'bg-red-950/80 text-red-400 border-red-800';
      case 'MODERATE':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getVerificationBadgeClass = (vp: string) => {
    switch (vp) {
      case 'URGENT':
        return 'bg-purple-950 text-purple-300 border-purple-800 font-bold';
      case 'HIGH':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Cari indikator, ID, kecamatan, atau desa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs cursor-pointer"
            >
              <option value="ALL">Semua Jenis Aktivitas</option>
              <option value="POTENTIAL_LOGGING">Potential Logging</option>
              <option value="POTENTIAL_ROAD_CONSTRUCTION">Potential Road</option>
              <option value="POTENTIAL_LAND_CLEARING">Land Clearing</option>
              <option value="POTENTIAL_MINING">Potential Mining</option>
              <option value="POTENTIAL_ENCROACHMENT">Potential Encroachment</option>
              <option value="FOREST_DISTURBANCE">Forest Disturbance</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs cursor-pointer"
            >
              <option value="ALL">Semua Verifikasi</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <select
              value={functionFilter}
              onChange={(e) => setFunctionFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs cursor-pointer"
            >
              <option value="ALL">Semua Fungsi Kawasan</option>
              <option value="HL">Hutan Lindung (HL)</option>
              <option value="HPT">Hutan Produksi Terbatas (HPT)</option>
              <option value="HP">Hutan Produksi (HP)</option>
              <option value="APL">Areal Penggunaan Lain (APL)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Menampilkan <strong>{filtered.length}</strong> dari {indicators.length} indikator terpantau</span>
          <span>Taksonomi Resmi: <strong>Section 4 Phase 10</strong></span>
        </div>
      </div>

      {/* List of Indicator Cards */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.indicatorId}
            onClick={() => onSelectIndicator(item)}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400">
                  {item.indicatorId}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                  {item.indicatorType.replace(/_/g, ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${getPriorityBadgeClass(item.priority)}`}>
                  Prioritas: {item.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${getVerificationBadgeClass(item.verificationPriority)}`}>
                  Verifikasi: {item.verificationPriority}
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                {formatDateWib(item.detectionDate)}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 hover:text-amber-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {item.description}
              </p>
            </div>

            {/* Badges bar */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-slate-800/60">
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                {item.areaHa} Ha di {item.forestFunction} ({item.kecamatan})
              </span>

              {item.peatlandOverlap && (
                <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300 font-bold">
                  Kubah Gambut KHG
                </span>
              )}

              {item.fireCorrelation && (
                <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-800 text-red-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400" />
                  <span>Korelasi Api ({item.hotspotsCount} Hotspot)</span>
                </span>
              )}

              {item.osintCorrelation && (
                <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                  Laporan Berita Publik
                </span>
              )}

              <span className="ml-auto font-mono text-emerald-400 text-xs font-semibold">
                Skor: {item.activityScore}
              </span>

              <span className="flex items-center gap-1 text-slate-400 hover:text-slate-200">
                <Eye className="w-3.5 h-3.5" />
                <span>Detail</span>
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            Tidak ada indikator yang sesuai dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
};
