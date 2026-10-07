import React from 'react';
import { INITIAL_SYSTEM_HEALTH } from '../../data/publicDataset';
import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  Radio,
  Cpu,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';

export const HealthView: React.FC = () => {
  const { components, overallStatus, checkedAt } = INITIAL_SYSTEM_HEALTH;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Modul: System Health &amp; Ingestion Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Status kesehatan pipa konektivitas penarik data publik terbuka, latensi query basis data spasial PostGIS, dan guardrail AI.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SISTEM BEROPERASI NORMAL</span>
        </div>
      </div>

      {/* Grid Status Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. NASA FIRMS */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-200">NASA FIRMS API Feed</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              {components.nasaFirmsFeed.status}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Penarikan data NRT VIIRS 375m &amp; MODIS BBox Sintang
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Latensi Respons:</span>
            <span className="font-mono text-emerald-400">{components.nasaFirmsFeed.latencyMs} ms</span>
          </div>
        </div>

        {/* 2. Copernicus Sentinel-2 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-200">Copernicus STAC OpenHub</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              {components.copernicusOpenHub.status}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Katalog citra Sentinel-2 L2A Tile 49MDN/MEN
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Latensi Respons:</span>
            <span className="font-mono text-emerald-400">{components.copernicusOpenHub.latencyMs} ms</span>
          </div>
        </div>

        {/* 3. BMKG Open Weather */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-200">BMKG / Open-Meteo API</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              {components.bmkgOpenWeather.status}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Prakiraan cuaca &amp; curah hujan Stasiun Susilo Sintang
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Latensi Respons:</span>
            <span className="font-mono text-emerald-400">{components.bmkgOpenWeather.latencyMs} ms</span>
          </div>
        </div>

        {/* 4. Kalbar Satu Data */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-200">Ina-Geoportal / Satu Data</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              {components.kalbarSatuData.status}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Vektor batas kawasan hutan KLHK &amp; KHG BRGM
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Latensi Respons:</span>
            <span className="font-mono text-emerald-400">{components.kalbarSatuData.latencyMs} ms</span>
          </div>
        </div>

        {/* 5. PostGIS Database */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-200">PostgreSQL + PostGIS</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              CONNECTED
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Spatial indexing GIST pada geometri batas KPH Sintang
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Koneksi Aktif:</span>
            <span className="font-mono text-emerald-400">{components.spatialDatabase.connections} Pools</span>
          </div>
        </div>

        {/* 6. Gemini Grounded AI Engine */}
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-emerald-300">Gemini Grounded Synthesizer</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              ONLINE
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Model: <strong className="text-slate-200">{components.geminiGroundedAi.model}</strong> (Strict Grounding)
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Guardrail Anti-Halusinasi:</span>
            <span className="text-emerald-400 font-bold text-[10px]">AKTIF (100%)</span>
          </div>
        </div>
      </div>

      {/* Pipeline Architecture Diagram in UI */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Arsitektur Aliran Data (Data Integrity Pipeline)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tahap 1</div>
            <div className="font-bold text-slate-200 mt-1">PUBLIC DATA</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Open Harvest</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tahap 2</div>
            <div className="font-bold text-slate-200 mt-1">INGESTION</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">BBox Filter</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tahap 3</div>
            <div className="font-bold text-slate-200 mt-1">VALIDATION</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">SHA-256 Hash</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tahap 4</div>
            <div className="font-bold text-slate-200 mt-1">NORMALIZATION</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">WGS 84 PostGIS</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tahap 5</div>
            <div className="font-bold text-slate-200 mt-1">CORRELATION</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">5-Stage Tax</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tahap 6</div>
            <div className="font-bold text-slate-200 mt-1">BRIEFING</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Grounded AI</div>
          </div>
        </div>
      </div>
    </div>
  );
};
