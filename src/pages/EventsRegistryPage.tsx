import React, { useState } from 'react';
import { useIntelligence } from '../hooks/useIntelligence';
import { IntelligenceEvent } from '../types';
import { TaxonomyBadge } from '../components/common/TaxonomyBadge';
import { MockNoticeBadge } from '../components/common/MockNoticeBadge';
import { formatDateWib, exportAsJsonFile } from '../utils/formatters';
import {
  ListTree,
  Search,
  Download,
  ExternalLink,
  Filter,
} from 'lucide-react';

interface EventsRegistryPageProps {
  onSelectEvent: (event: IntelligenceEvent) => void;
}

export const EventsRegistryPage: React.FC<EventsRegistryPageProps> = ({ onSelectEvent }) => {
  const { events } = useIntelligence();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.eventCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.forestZone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'ALL' || e.taxonomicStage === stageFilter;
    const matchesType = typeFilter === 'ALL' || e.eventType === typeFilter;

    return matchesSearch && matchesStage && matchesType;
  });

  const exportGeoJson = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: filteredEvents.map((e) => ({
        type: 'Feature',
        properties: {
          eventCode: e.eventCode,
          title: e.title,
          stage: e.taxonomicStage,
          confidence: e.confidenceScore,
          kecamatan: e.location.kecamatan,
          forestZone: e.location.forestZone,
          status: e.verificationStatus,
        },
        geometry: {
          type: 'Point',
          coordinates: [e.location.longitude, e.location.latitude],
        },
      })),
    };

    exportAsJsonFile(geojson, `kph-intelligence-events-${new Date().toISOString().slice(0, 10)}.geojson`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <MockNoticeBadge />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ListTree className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">
              Modul E: Intelligence Events Registry (KPH Sintang Timur)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Direktori kejadian intelijen terstruktur dengan pengelompokan taksonomi 5-tahap dan pembuktian rantai bukti (Evidence Chain).
          </p>
        </div>

        <button
          onClick={exportGeoJson}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export GeoJSON</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode event, judul, kecamatan, zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Tahap:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Tahap</option>
            <option value="OBSERVATION">Observation</option>
            <option value="DETECTION">Detection</option>
            <option value="CORRELATION">Correlation</option>
            <option value="REPORTED">Reported</option>
            <option value="VERIFIED">Verified</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Tipe:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="FIRE_CLUSTER">Fire Cluster</option>
            <option value="CANOPY_ANOMALY">Canopy Anomaly</option>
            <option value="ROAD_BUFFER_ENCROACHMENT">Road Corridors</option>
            <option value="PEATLAND_DEGRADATION">Peatland</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Kode Event</th>
                <th className="p-3.5">Tahap Taksonomi</th>
                <th className="p-3.5">Judul Kejadian</th>
                <th className="p-3.5">Lokasi &amp; Fungsi Kawasan</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Waktu Deteksi</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">
                    {event.eventCode}
                  </td>
                  <td className="p-3.5">
                    <TaxonomyBadge stage={event.taxonomicStage} size="sm" />
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <div className="font-semibold text-slate-200 truncate">{event.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{event.summary}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-200">
                      Kec. {event.location.kecamatan}
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      {event.location.forestZone}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-emerald-400">
                      {event.confidenceScore}%
                    </div>
                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${event.confidenceScore}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {formatDateWib(event.firstDetectedAt)}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] uppercase font-bold font-mono">
                      {event.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Detail</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
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
