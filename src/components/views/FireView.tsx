import React, { useState } from 'react';
import { RAW_HOTSPOTS, CURRENT_WEATHER } from '../../data/publicDataset';
import {
  Flame,
  CloudRain,
  Wind,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ExternalLink,
  Filter,
} from 'lucide-react';

export const FireView: React.FC = () => {
  const [filterSatellite, setFilterSatellite] = useState<string>('ALL');

  const filteredSpots = filterSatellite === 'ALL'
    ? RAW_HOTSPOTS
    : RAW_HOTSPOTS.filter((s) => s.satellite.includes(filterSatellite));

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-100">
              Modul B: Fire Intelligence &amp; Hotspot Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data radiasi termal Near Real-Time dari instrumen NASA FIRMS (VIIRS 375m pada satelit Suomi-NPP, NOAA-20, NOAA-21 dan MODIS 1km) dipadukan data atmosfer BMKG Susilo Sintang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sensor Satelit:</span>
          <select
            value={filterSatellite}
            onChange={(e) => setFilterSatellite(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-rose-500 font-medium"
          >
            <option value="ALL">Semua Sensor (VIIRS + MODIS)</option>
            <option value="VIIRS">Hanya VIIRS 375m (Resolusi Tinggi)</option>
            <option value="MODIS">Hanya MODIS 1km (Terra/Aqua)</option>
          </select>
        </div>
      </div>

      {/* Atmospheric & Weather Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Suhu Udara</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            {CURRENT_WEATHER.temperatureC}°C
          </div>
          <div className="text-[11px] text-slate-400">Kelembaban: {CURRENT_WEATHER.humidityPercent}%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Curah Hujan 24j</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            {CURRENT_WEATHER.rainfallLast24hMm} mm
          </div>
          <div className="text-[11px] text-rose-400 font-semibold">Kondisi Sangat Kering</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Kecepatan Angin</span>
            <Wind className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300 font-mono">
            {CURRENT_WEATHER.windSpeedKmh} km/j
          </div>
          <div className="text-[11px] text-slate-400">Arah Tenggara (125°)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1 bg-amber-950/15">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <span>Fire Weather Index</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {CURRENT_WEATHER.fireWeatherIndex}
          </div>
          <div className="text-[11px] text-amber-300/80">Potensi Perambatan Tinggi</div>
        </div>
      </div>

      {/* Hotspots Raw Observation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            Tabel Observasi Titik Panas Terbuka NASA FIRMS
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {filteredSpots.length} Titik Terdeteksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">ID Titik</th>
                <th className="p-3.5">Satelit / Sensor</th>
                <th className="p-3.5">Tanggal &amp; Waktu (UTC)</th>
                <th className="p-3.5">Koordinat (Lat, Lon)</th>
                <th className="p-3.5">Kecamatan</th>
                <th className="p-3.5">Fungsi Kawasan KPH</th>
                <th className="p-3.5">Suhu Kecerahan</th>
                <th className="p-3.5">Radiasi Termal (FRP)</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Kluster Terkorelasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
              {filteredSpots.map((spot) => (
                <tr key={spot.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 text-rose-400 font-bold">{spot.id}</td>
                  <td className="p-3.5 text-slate-200 font-sans font-medium">{spot.satellite}</td>
                  <td className="p-3.5">
                    {spot.acqDate} <span className="text-slate-400">{spot.acqTimeUtc} UTC</span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                  </td>
                  <td className="p-3.5 font-sans font-semibold text-slate-200">{spot.kecamatan}</td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {spot.forestZone}
                    </span>
                  </td>
                  <td className="p-3.5 text-amber-300 font-bold">{spot.brightnessKelvin} K</td>
                  <td className="p-3.5 text-rose-400 font-bold">{spot.frpMw} MW</td>
                  <td className="p-3.5 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        spot.confidence === 'high'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {spot.confidence}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px] font-sans">
                    {spot.clusterId || 'Titik Terisolasi'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cluster Analysis Box */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Kompilasi Kluster Spasio-Temporal (Algoritma DBSCAN: Radius 1.5 km, Window 48 Jam)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-red-400">CLUSTER-2026-AMB-01</div>
            <div className="text-slate-300">Kecamatan Ambalau (Hutan Lindung KPH)</div>
            <div className="text-slate-400 text-[11px]">
              3 titik berhimpitan, FRP Maksimum 44.2 MW. Terkorelasikan dengan anomali kanopi 14.8 Ha.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400">CLUSTER-2026-SRW-02</div>
            <div className="text-slate-300">Kecamatan Serawai (Hutan Produksi Terbatas)</div>
            <div className="text-slate-400 text-[11px]">
              2 titik persisten 2 hari, berjarak 240m dari akses jalan rintisan.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-purple-400">CLUSTER-2026-KTG-03</div>
            <div className="text-slate-300">Kecamatan Ketungau Tengah (KHG Gambut Belitang)</div>
            <div className="text-slate-400 text-[11px]">
              2 titik di atas lapisan gambut APL. Suhu kecerahan 334.0 K.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
