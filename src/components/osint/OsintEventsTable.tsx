import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Calendar,
  Layers,
  Compass,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flame,
  TreePine,
  FileText,
} from 'lucide-react';
import { OsintEvent, OsintActivityType } from '../../types/osint';

interface OsintEventsTableProps {
  events: OsintEvent[];
  onSelectEvent: (event: OsintEvent) => void;
}

export const OsintEventsTable: React.FC<OsintEventsTableProps> = ({ events, onSelectEvent }) => {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('ALL');
  const [selectedActivity, setSelectedActivity] = useState<string>('ALL');
  const [onlyCorrelated, setOnlyCorrelated] = useState<boolean>(false);

  const kecamatans = Array.from(new Set(events.map((e) => e.kecamatan).filter(Boolean)));

  const filteredEvents = events.filter((e) => {
    const matchKec = selectedKecamatan === 'ALL' || e.kecamatan === selectedKecamatan;
    const matchAct = selectedActivity === 'ALL' || e.activity_type === selectedActivity;
    const matchCorr = !onlyCorrelated || e.is_spatial_correlated;
    return matchKec && matchAct && matchCorr;
  });

  const getActivityBadge = (type: OsintActivityType) => {
    switch (type) {
      case 'FIRE_INCIDENT_REPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
            <Flame className="w-3 h-3 text-amber-400" />
            Insiden Api Dilaporkan
          </span>
        );
      case 'LAND_CLEARING_REPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
            <TreePine className="w-3 h-3 text-emerald-400" />
            Bukaan Lahan Terlapor
          </span>
        );
      case 'TIMBER_TRANSPORT_REPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-950 text-purple-300 border border-purple-800">
            <Layers className="w-3 h-3 text-purple-400" />
            Lalu Lintas Kayu
          </span>
        );
      case 'REGULATION_PERMIT_ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950 text-blue-300 border border-blue-800">
            <FileText className="w-3 h-3 text-blue-400" />
            Regulasi / SK Terbit
          </span>
        );
      case 'SOCIAL_FORESTRY_REHAB_REPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-950 text-teal-300 border border-teal-800">
            <TreePine className="w-3 h-3 text-teal-400" />
            Perhutanan Sosial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Warta Lingkungan
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 font-medium">Filter Kejadian:</span>
          </div>

          <select
            value={selectedKecamatan}
            onChange={(e) => setSelectedKecamatan(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Kecamatan ({kecamatans.length})</option>
            {kecamatans.map((kec) => (
              <option key={kec} value={kec}>
                Kecamatan {kec}
              </option>
            ))}
          </select>

          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Tipe Aktivitas</option>
            <option value="FIRE_INCIDENT_REPORTED">Insiden Karhutla Dilaporkan</option>
            <option value="LAND_CLEARING_REPORTED">Bukaan Lahan Terlapor</option>
            <option value="TIMBER_TRANSPORT_REPORTED">Pengangkutan Kayu</option>
            <option value="REGULATION_PERMIT_ISSUED">Regulasi / Perbup Terbit</option>
            <option value="SOCIAL_FORESTRY_REHAB_REPORTED">Perhutanan Sosial</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={onlyCorrelated}
              onChange={(e) => setOnlyCorrelated(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Hanya yang Berkorelasi Spasial ({events.filter((e) => e.is_spatial_correlated).length})</span>
          </label>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Menampilkan {filteredEvents.length} dari {events.length} kejadian terstruktur
        </span>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.event_id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {evt.event_code}
                  </span>
                  {getActivityBadge(evt.activity_type)}
                </div>

                {evt.is_spatial_correlated ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-medium flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    Korelasi Spasial Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                    Belum Terkorelasi
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                {evt.title}
              </h4>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {evt.summary}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                  <MapPin className="w-3.5 h-3.5" />
                  Kecamatan {evt.kecamatan}
                </span>

                <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Fungsi: {evt.forest_zone}
                </span>

                <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
                  <Calendar className="w-3 h-3" />
                  {new Date(evt.published_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Keyakinan Sistem: <span className="font-mono text-cyan-300 font-semibold">{evt.confidence_score}%</span>
              </div>

              <button
                onClick={() => onSelectEvent(evt)}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-1 rounded-lg border border-cyan-800/60 transition-colors font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Detail &amp; Korelasi</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
