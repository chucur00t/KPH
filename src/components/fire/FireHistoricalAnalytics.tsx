import React, { useState } from 'react';
import {
  Calendar,
  BarChart3,
  Flame,
  Layers,
  MapPin,
  Clock,
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  FireHistorySummary,
  RecurringHotspotCluster,
  FireDensityGridCell,
} from '../../types/fire';

interface FireHistoricalAnalyticsProps {
  summary: FireHistorySummary | null;
  recurring: RecurringHotspotCluster[];
  densityGrid: FireDensityGridCell[];
  onPeriodChange: (period: '7d' | '30d' | '90d' | '180d' | '1y') => void;
  selectedPeriod: '7d' | '30d' | '90d' | '180d' | '1y';
}

export const FireHistoricalAnalytics: React.FC<FireHistoricalAnalyticsProps> = ({
  summary,
  recurring,
  densityGrid,
  onPeriodChange,
  selectedPeriod,
}) => {
  return (
    <div className="space-y-5">
      {/* Top Bar with Period Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Analisis Historis &amp; Tren Titik Panas Karhutla
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Agregasi temporal data observasi satelit terbuka Kabupaten Sintang &amp; KPH Sintang Timur.
          </p>
        </div>

        {/* Period Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          {(['7d', '30d', '90d', '180d', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                selectedPeriod === p
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total Hotspot</span>
            <div className="text-2xl font-extrabold text-rose-400 font-mono">
              {summary.total_hotspots} <span className="text-xs font-normal text-slate-400">titik</span>
            </div>
            <div className="text-[10px] text-slate-500">Periode {selectedPeriod.toUpperCase()}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Fire Events</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">
              {summary.total_fire_events} <span className="text-xs font-normal text-slate-400">kluster</span>
            </div>
            <div className="text-[10px] text-slate-500">Kluster terisolasi</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Lokasi Unik</span>
            <div className="text-2xl font-extrabold text-cyan-300 font-mono">
              {summary.unique_locations_count}
            </div>
            <div className="text-[10px] text-slate-500">Estimasi spasial mandiri</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Hotspot Berulang</span>
            <div className="text-2xl font-extrabold text-indigo-300 font-mono">
              {recurring.length} <span className="text-xs font-normal text-slate-400">zona</span>
            </div>
            <div className="text-[10px] text-slate-500">Rekurensi &gt;2x deteksi</div>
          </div>
        </div>
      )}

      {/* Breakdowns Grid */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* By Satellite */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Distribusi Sensor Satelit</span>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </h4>
            <div className="space-y-1.5 divide-y divide-slate-800/80">
              {Object.entries(summary.by_satellite).map(([sat, count]) => (
                <div key={sat} className="pt-1.5 flex items-center justify-between">
                  <span className="text-slate-300 font-mono">{sat}</span>
                  <span className="font-mono font-bold text-amber-300">{count} titik</span>
                </div>
              ))}
            </div>
          </div>

          {/* By District */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Distribusi per Kecamatan</span>
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            </h4>
            <div className="space-y-1.5 divide-y divide-slate-800/80">
              {Object.entries(summary.by_district).map(([kec, count]) => (
                <div key={kec} className="pt-1.5 flex items-center justify-between">
                  <span className="text-slate-300">{kec}</span>
                  <span className="font-mono font-bold text-emerald-400">{count} titik</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Forest Zone */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Fungsi Kawasan Hutan</span>
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </h4>
            <div className="space-y-1.5 divide-y divide-slate-800/80">
              {Object.entries(summary.by_forest_zone).map(([zone, count]) => (
                <div key={zone} className="pt-1.5 flex items-center justify-between">
                  <span className="text-slate-300 truncate max-w-[170px]">{zone}</span>
                  <span className="font-mono font-bold text-indigo-300">{count} titik</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recurring Hotspots Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Indikator Titik Panas Berulang (Recurring Thermal Anomaly)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Lokasi dengan anomali termal teramati lebih dari satu kali dalam siklus 7, 30, dan 90 hari.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{recurring.length} Lokasi Terdata</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">ID Kluster</th>
                <th className="p-3">Kecamatan / Koordinat</th>
                <th className="p-3">Fungsi Kawasan</th>
                <th className="p-3 text-center">Deteksi 7 Hari</th>
                <th className="p-3 text-center">Deteksi 30 Hari</th>
                <th className="p-3 text-center">Deteksi 90 Hari</th>
                <th className="p-3 text-right">Intensitas Rekurensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {recurring.map((r) => (
                <tr key={r.cluster_id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-emerald-400 font-bold">{r.cluster_id}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-200">{r.kecamatan}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                    </span>
                  </td>
                  <td className="p-3">{r.forest_zone}</td>
                  <td className="p-3 text-center font-mono font-bold text-cyan-300">{r.detections_7d}</td>
                  <td className="p-3 text-center font-mono font-bold text-amber-300">{r.detections_30d}</td>
                  <td className="p-3 text-center font-mono font-bold text-rose-400">{r.detections_90d}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.recurrence_intensity === 'CHRONIC'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : r.recurrence_intensity === 'HIGH'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {r.recurrence_intensity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detection Density Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Analisis Kepadatan Deteksi Spasial (Detection Density Grid 0.05°)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strict label: <strong>DETECTION DENSITY</strong> (bukan luas kebakaran atau klaim luasan terbakar).
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{densityGrid.length} Sel Grid Aktif</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">ID Sel Grid</th>
                <th className="p-3">Bounding Box (Lon/Lat)</th>
                <th className="p-3 text-center">Jumlah Deteksi</th>
                <th className="p-3 text-center">Kepadatan per km²</th>
                <th className="p-3 text-right">Tingkat Kepadatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {densityGrid.slice(0, 8).map((cell) => (
                <tr key={cell.cell_id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-cyan-400 font-bold">{cell.cell_id}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    [{cell.bbox[0].toFixed(2)}, {cell.bbox[1].toFixed(2)}] s/d [{cell.bbox[2].toFixed(2)}, {cell.bbox[3].toFixed(2)}]
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-amber-300">
                    {cell.detection_count}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-300">
                    {cell.density_per_sqkm} / km²
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cell.density_level === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : cell.density_level === 'HIGH'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : cell.density_level === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {cell.density_level}
                    </span>
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
