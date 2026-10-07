import React, { useState } from 'react';
import { RAW_LAND_CHANGES } from '../../data/publicDataset';
import { LandChangeDetection, IntelligenceEvent } from '../../types/intelligence';
import {
  TreePine,
  Layers,
  MapPin,
  TrendingDown,
  Navigation,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface LandChangeViewProps {
  onSelectEventByCode?: (eventCode: string) => void;
}

export const LandChangeView: React.FC<LandChangeViewProps> = ({ onSelectEventByCode }) => {
  const [filterZone, setFilterZone] = useState<string>('ALL');

  const filteredDetections = filterZone === 'ALL'
    ? RAW_LAND_CHANGES
    : RAW_LAND_CHANGES.filter((d) => d.forestZone.includes(filterZone));

  const totalHa = RAW_LAND_CHANGES.reduce((acc, curr) => acc + curr.areaHa, 0).toFixed(1);
  const riverBufferHa = RAW_LAND_CHANGES.filter((d) => d.nearRiver).reduce((acc, curr) => acc + curr.areaHa, 0).toFixed(1);
  const roadBufferHa = RAW_LAND_CHANGES.filter((d) => d.nearRoad).reduce((acc, curr) => acc + curr.areaHa, 0).toFixed(1);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header Module */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Modul A: Land Change Intelligence (Tutupan Lahan &amp; Vegetasi)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analisis multi-temporal spektral Copernicus Sentinel-2 L2A (10m) dan USGS Landsat-8/9 OLI (30m) untuk mendeteksi kehilangan kanopi di KPH Sintang Timur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter Zona:</span>
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="ALL">Semua Fungsi Kawasan</option>
            <option value="Hutan Lindung">Hutan Lindung (HL)</option>
            <option value="Hutan Produksi Terbatas">Hutan Produksi Terbatas (HPT)</option>
            <option value="Hutan Produksi Tetap">Hutan Produksi Tetap (HP)</option>
          </select>
        </div>
      </div>

      {/* Analytical Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Anomali Kanopi
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {totalHa} <span className="text-xs font-normal text-slate-400">Hektar</span>
          </div>
          <div className="text-[11px] text-slate-400">Periode 23 - 30 September 2026</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1 bg-cyan-950/10">
          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Buffer Sempadan Sungai</span>
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {riverBufferHa} <span className="text-xs font-normal text-slate-400">Ha (&lt;150m)</span>
          </div>
          <div className="text-[11px] text-slate-400">Sungai Melawi &amp; Kapuas Hulu</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/30 space-y-1 bg-orange-950/10">
          <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Koridor Akses Jalan</span>
            <Navigation className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-orange-300 font-mono">
            {roadBufferHa} <span className="text-xs font-normal text-slate-400">Ha (&lt;500m)</span>
          </div>
          <div className="text-[11px] text-slate-400">Rintisan Jalan Logistik Kebun</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Metode Sensor Terbuka
          </div>
          <div className="text-base font-bold text-slate-200">
            Sentinel-2 &amp; Landsat
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Index: dNDVI &amp; dNBR</div>
        </div>
      </div>

      {/* Detections Detail Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Daftar Deteksi Kehilangan Kanopi Vegetasi Terkini
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Menampilkan {filteredDetections.length} Anomali
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">ID Deteksi</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Lokasi / Kecamatan</th>
                <th className="p-3.5">Fungsi Kawasan</th>
                <th className="p-3.5">Luas (Ha)</th>
                <th className="p-3.5">Delta NDVI</th>
                <th className="p-3.5">Buffer Kedekatan</th>
                <th className="p-3.5">Instrumen Satelit</th>
                <th className="p-3.5 text-right">Audit Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredDetections.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                    {item.id}
                  </td>
                  <td className="p-3.5 font-mono">{item.dateDetected}</td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-200">{item.kecamatan}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {item.forestZone}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-300">
                    {item.areaHa} Ha
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="text-rose-400 font-bold">{item.ndviDelta}</span>
                    <span className="block text-[10px] text-slate-400">
                      ({item.ndviBefore} &rarr; {item.ndviAfter})
                    </span>
                  </td>
                  <td className="p-3.5 space-y-1">
                    {item.nearRiver && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800 mr-1">
                        Dekat Sungai (&lt;120m)
                      </span>
                    )}
                    {item.nearRoad && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 text-[10px] border border-orange-800">
                        Dekat Jalan (&lt;300m)
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <span className="font-medium">{item.sensor}</span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-400 text-[11px]">
                    <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
                      {item.provenanceId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodological Transparency Note */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Metodologi Normalisasi Data Publik Terbuka
        </div>
        <p className="leading-relaxed text-slate-400">
          Perhitungan indeks vegetasi NDVI dilakukan melalui normalisasi reflektansi kanal spektral inframerah dekat (NIR / Band 8 Sentinel-2) dan kanal merah tampak (Red / Band 4) dengan formula: <code className="text-emerald-400 font-mono">(NIR - Red) / (NIR + Red)</code>. Penurunan nilai di atas ambang batas 0.25 dalam interval 5–10 hari dikategorikan sebagai anomali kanopi potensial yang memerlukan verifikasi tutupan awan (cloud masking) sebelum inspeksi fisik lapangan.
        </p>
      </div>
    </div>
  );
};
