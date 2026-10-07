import React from 'react';
import { EventLocationModel, GisDataStatus } from '../../types/gis';
import {
  X,
  MapPin,
  Building,
  TreePine,
  Waves,
  Navigation,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';

interface SpatialIntelligencePanelProps {
  data: EventLocationModel | null;
  onClose: () => void;
  onSelectEvent?: (eventId: string) => void;
}

export const SpatialIntelligencePanel: React.FC<SpatialIntelligencePanelProps> = ({
  data,
  onClose,
  onSelectEvent,
}) => {
  if (!data) return null;

  const { observed_location, derived_location_context } = data;
  const {
    administrative_area,
    kph_area,
    forest_context,
    environment_context,
    public_activity_context,
    spatial_summary_statement,
    enriched_at,
  } = derived_location_context;

  const renderStatusBadge = (status: GisDataStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            AVAILABLE
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            PARTIAL
          </span>
        );
      case 'NOT_AVAILABLE':
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
            DATA NOT AVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] w-96 max-h-[calc(100vh-6rem)] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Spatial Intelligence Panel</h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Event ID: {data.event_id}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body scroll */}
      <div className="p-4 overflow-y-auto space-y-4">
        {/* Anti-False Certainty Advisory Banner */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Kaidah Penilaian Spasial Objektif:</span>
          </div>
          <p className="text-slate-300 text-[10px] leading-tight">
            {spatial_summary_statement}
          </p>
        </div>

        {/* 1. LOCATION (OBSERVED RAW) */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Observed Location (Koordinat Asli)
            </span>
            <span className="text-slate-500 font-mono">EPSG:4326</span>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[9px] block">LATITUDE</span>
              <span className="text-slate-100 font-bold">{observed_location.latitude.toFixed(6)}°</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[9px] block">LONGITUDE</span>
              <span className="text-slate-100 font-bold">{observed_location.longitude.toFixed(6)}°</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Sumber Sensor: <strong className="text-slate-200">{observed_location.location_source}</strong></span>
            <span>Akurasi: ±{observed_location.location_accuracy_meters}m</span>
          </div>
        </div>

        {/* 2. ADMINISTRATIVE CONTEXT */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-amber-400" /> Administrative Context
            </span>
            {renderStatusBadge(administrative_area.data_status)}
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Kabupaten:</span>
              <span className="text-slate-200 font-medium">{administrative_area.kabupaten || 'Kabupaten Sintang'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kecamatan:</span>
              <span className="text-slate-200 font-medium">{administrative_area.kecamatan || 'Data tidak tersedia'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Desa:</span>
              <span className="text-slate-400 italic">
                {administrative_area.desa || 'Batas definitif desa belum tersedia'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Sumber: {administrative_area.source}
            </div>
          </div>
        </div>

        {/* 3. FOREST CONTEXT */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            <span className="flex items-center gap-1">
              <TreePine className="w-3.5 h-3.5 text-emerald-400" /> Forest &amp; KPH Context
            </span>
            {renderStatusBadge(forest_context.data_status)}
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Unit KPH:</span>
              <span className="text-emerald-300 font-semibold">
                {kph_area.is_inside_kph ? (kph_area.kph_name || 'KPH Sintang Timur') : 'Di Luar Unit KPH'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fungsi Kawasan:</span>
              <span className="text-slate-100 font-medium">{forest_context.fungsi_kawasan || 'Areal Penggunaan Lain (APL)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dasar Hukum SK:</span>
              <span className="text-slate-300 font-mono text-[10px]">{forest_context.sk_penetapan || 'SK Menhut'}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Sumber: {forest_context.source}
            </div>
          </div>
        </div>

        {/* 4. ENVIRONMENT & BUFFER CONTEXT */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            <span className="flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-sky-400" /> Environment &amp; Buffer
            </span>
            {renderStatusBadge(environment_context.gambut.data_status)}
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Ekosistem Gambut (KHG):</span>
              <span className={`font-semibold ${environment_context.gambut.is_peatland ? 'text-amber-400' : 'text-slate-300'}`}>
                {environment_context.gambut.is_peatland ? `${environment_context.gambut.khg_name} (Rawan)` : 'Bukan Kawasan Gambut'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sungai Terdekat:</span>
              <span className="text-slate-200">
                {environment_context.nearest_river.river_name || 'Aliran air terdekat'}{' '}
                <strong className="text-cyan-400 font-mono">
                  ({environment_context.nearest_river.distance_meters !== null ? `${environment_context.nearest_river.distance_meters}m` : '-'})
                </strong>
              </span>
            </div>
            {environment_context.nearest_river.is_within_river_buffer && (
              <div className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                ⚠️ Terletak dalam sempadan sungai (&le;100 meter)
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Jalan Akses Terdekat:</span>
              <span className="text-slate-200">
                {environment_context.nearest_road.road_name || 'Jalan rintisan'}{' '}
                <strong className="text-orange-400 font-mono">
                  ({environment_context.nearest_road.distance_meters !== null ? `${environment_context.nearest_road.distance_meters}m` : '-'})
                </strong>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Sumber: {environment_context.nearest_river.source} &amp; BRGM PRIMS
            </div>
          </div>
        </div>

        {/* 5. PUBLIC ACTIVITY CONTEXT (CONCESSIONS / LICENSES) */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Public Activity &amp; Concessions
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">HGU Perkebunan Sawit:</span>
              {renderStatusBadge(public_activity_context.perkebunan.data_status)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Izin Usaha Pertambangan (IUP):</span>
              {renderStatusBadge(public_activity_context.pertambangan.data_status)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Perhutanan Sosial (PIAPS):</span>
              {renderStatusBadge(public_activity_context.perhutanan_sosial.data_status)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Konsesi Kehutanan Terbuka:</span>
              {renderStatusBadge(public_activity_context.konsesi_publik.data_status)}
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 italic">
              Kepatuhan KPH: Tidak ada spekulasi izin. Jika layer belum dirilis terbuka, status mutlak &apos;DATA NOT AVAILABLE&apos;.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Enriched: {new Date(enriched_at).toLocaleTimeString('id-ID')}</span>
        <span>KPH Intelligence Engine v4.0</span>
      </div>
    </div>
  );
};
