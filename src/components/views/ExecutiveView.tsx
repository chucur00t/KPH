import React from 'react';
import {
  INTELLIGENCE_EVENTS,
  RAW_HOTSPOTS,
  RAW_LAND_CHANGES,
  OSINT_RECORDS,
  CURRENT_WEATHER,
  SINTANG_MONITORED_HECTARES,
} from '../../data/publicDataset';
import { IntelligenceEvent } from '../../types/intelligence';
import { TaxonomyBadge } from '../common/TaxonomyBadge';
import {
  ShieldAlert,
  Flame,
  TreePine,
  Layers,
  Globe2,
  TrendingUp,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

interface ExecutiveViewProps {
  onSelectEvent: (event: IntelligenceEvent) => void;
  onNavigateTab: (tab: any) => void;
}

export const ExecutiveView: React.FC<ExecutiveViewProps> = ({
  onSelectEvent,
  onNavigateTab,
}) => {
  const highRiskEvents = INTELLIGENCE_EVENTS.filter((e) => e.confidenceScore >= 80);
  const totalHotspots = RAW_HOTSPOTS.length;
  const totalCanopyLossHa = RAW_LAND_CHANGES.reduce((a, c) => a + c.areaHa, 0).toFixed(1);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Status Pemantauan Intelijen Wilayah
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100">
            Sistem Deteksi Spasial KPH Sintang Timur &amp; Kabupaten Sintang
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Sintesis data publik satelit (NASA FIRMS &amp; Copernicus Sentinel-2), regulasi daerah (JDIH Sintang),
            dan keterbukaan informasi publik KLHK untuk pemantauan perlindungan kawasan hutan berkelanjutan.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('reports')}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-950/50 cursor-pointer"
        >
          <span>Executive Briefing Harian</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI METRIC CARDS (User Requirement) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Luas Wilayah Dipantau */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Wilayah Pantau</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 font-mono">
            2.16 <span className="text-xs font-normal text-slate-400">Juta Ha</span>
          </div>
          <div className="text-[10px] text-slate-400">Kabupaten Sintang</div>
        </div>

        {/* 2. Jumlah Fire Event */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Fire Events</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400 font-mono">
            3 <span className="text-xs font-normal text-slate-400">Kluster</span>
          </div>
          <div className="text-[10px] text-slate-400">Ambalau &amp; Serawai</div>
        </div>

        {/* 3. Jumlah Hotspot Satelit */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hotspot 24-48j</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">
            {totalHotspots} <span className="text-xs font-normal text-slate-400">Titik</span>
          </div>
          <div className="text-[10px] text-slate-400">VIIRS &amp; MODIS</div>
        </div>

        {/* 4. Land Change Event */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Perubahan Kanopi</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-300 font-mono">
            {totalCanopyLossHa} <span className="text-xs font-normal text-slate-400">Ha</span>
          </div>
          <div className="text-[10px] text-slate-400">Delta NDVI Sentinel-2</div>
        </div>

        {/* 5. OSINT Event */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">OSINT Publik</span>
            <Globe2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-400 font-mono">
            {OSINT_RECORDS.length} <span className="text-xs font-normal text-slate-400">Laporan</span>
          </div>
          <div className="text-[10px] text-slate-400">ANTARA &amp; Pemkab</div>
        </div>

        {/* 6. Active Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-red-500/30 space-y-1 bg-red-950/10">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">
              Active Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-extrabold text-red-400 font-mono">
            {highRiskEvents.length} <span className="text-xs font-normal text-slate-400">Prioritas</span>
          </div>
          <div className="text-[10px] text-red-400/80">Skor Confidence &gt; 80%</div>
        </div>
      </div>

      {/* Grid: Situation Map Preview + Trend Temporal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peta Situasi Ringkas (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Peta Situasi Geospasial KPH Sintang Timur
              </h3>
              <p className="text-xs text-slate-400">
                Pusat: Kabupaten Sintang (BBox: 111.15° – 113.35° BT, 0.50° LU – 1.15° LS)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Full GIS Map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Geographic Representation Canvas */}
          <div className="relative h-72 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Geographical Zones Representational Overlay */}
            <div className="relative z-10 grid grid-cols-3 gap-3">
              {/* Ambalau / Hutan Lindung */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                  <span>Hulu Ambalau (HL)</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="text-[10px] text-slate-400">Hutan Lindung KPH Sintang Timur</div>
                <div className="text-xs font-mono font-bold text-red-400">
                  3 Hotspot (FRP 44.2 MW)
                </div>
                <div className="text-[10px] text-slate-400">Kehilangan Kanopi: 14.8 Ha</div>
              </div>

              {/* Serawai / HPT */}
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                  <span>Serawai (HPT)</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400">Hutan Produksi Terbatas</div>
                <div className="text-xs font-mono font-bold text-amber-400">
                  2 Hotspot (Bukaan 22.4 Ha)
                </div>
                <div className="text-[10px] text-slate-400">Dekat Jalan Logistik: 240m</div>
              </div>

              {/* Ketungau / Gambut */}
              <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/40 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                  <span>Ketungau (KHG)</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <div className="text-[10px] text-slate-400">Kawasan Hidrologis Gambut</div>
                <div className="text-xs font-mono font-bold text-purple-300">
                  2 Hotspot APL
                </div>
                <div className="text-[10px] text-slate-400">Kubah Gambut Sedang</div>
              </div>
            </div>

            {/* River & Infrastructure Status Bar in map preview */}
            <div className="relative z-10 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-slate-300 font-medium">Sungai Kapuas &amp; Melawi:</span>
                <span className="text-slate-400 text-[11px]">Koridor buffer 100m aktif dipantau</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300 font-medium">Jalan Trans Kalimantan:</span>
                <span className="text-slate-400 text-[11px]">Buffer 500m</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Sistem Koordinat: WGS 84 (EPSG:4326)</span>
            <span className="text-emerald-400 font-mono">100% Open Data Verified</span>
          </div>
        </div>

        {/* Trend Temporal & Analisis Cuaca (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Tren Hotspot 14 Hari &amp; Curah Hujan
            </h3>
            <span className="text-[11px] font-mono text-slate-400">BMKG Susilo Sintang</span>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-2 pt-2">
            {[
              { day: '17-20 Sep', hotspots: 2, rainMm: 34.5, fwi: 'RENDAH' },
              { day: '21-23 Sep', hotspots: 1, rainMm: 18.2, fwi: 'SEDANG' },
              { day: '24-26 Sep', hotspots: 4, rainMm: 6.4, fwi: 'SEDANG' },
              { day: '27-28 Sep', hotspots: 6, rainMm: 2.1, fwi: 'TINGGI' },
              { day: '29-30 Sep', hotspots: 8, rainMm: 1.2, fwi: 'TINGGI' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-mono">{item.day}</span>
                  <div className="flex gap-3">
                    <span className="text-amber-400 font-mono font-semibold">
                      {item.hotspots} Titik Api
                    </span>
                    <span className="text-cyan-400 font-mono">{item.rainMm} mm hujan</span>
                    <span className="text-emerald-400 text-[10px] font-bold">{item.fwi}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.hotspots / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Environmental Insight Box */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
            <div className="font-semibold text-slate-200">Korelasi Cuaca &amp; Peningkatan Anomali</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Penurunan drastis curah hujan (dari 34.5 mm menjadi 1.2 mm) berkorelasi linear dengan lonjakan titik
              panas di kawasan perhuluan Sintang Timur. Kelembaban udara 68% memicu peningkatan status kerawanan
              api ke level <strong className="text-amber-400">TINGGI</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE SPATIAL ALERTS TABLE (Based on Evidence) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Active Spatial Intelligence Alerts (Evidence-Based)
            </h3>
            <p className="text-xs text-slate-400">
              Daftar kejadian spasial dengan tingkat keyakinan tinggi berdasarkan integrasi data publik
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('events')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua Event ({INTELLIGENCE_EVENTS.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800 overflow-x-auto">
          {INTELLIGENCE_EVENTS.map((event) => (
            <div
              key={event.id}
              className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-lg transition-colors cursor-pointer"
              onClick={() => onSelectEvent(event)}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {event.eventCode}
                  </span>
                  <TaxonomyBadge stage={event.taxonomicStage} size="sm" />
                  <span className="text-xs font-medium text-emerald-400">
                    {event.location.forestZone}
                  </span>
                  <span className="text-xs text-slate-400">
                    Kec. {event.location.kecamatan} ({event.location.desa})
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {event.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {event.summary}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {event.confidenceScore}% Confidence
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {event.evidenceChain.length} Rantai Bukti
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(event);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Inspeksi Bukti</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
