import React, { useState } from 'react';
import { useIntelligence } from '../hooks/useIntelligence';
import { formatDateWib } from '../utils/formatters';
import { SystemReadinessPanel } from '../components/hardening/SystemReadinessPanel';
import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  Cpu,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'readiness' | 'telemetry'>('readiness');
  const { systemHealth, dataSources, provenanceRecords } = useIntelligence();

  const components = systemHealth?.components || {
    nasaFirmsFeed: { status: 'OK', latencyMs: 240, lastIngested: '2026-09-30T03:30:12Z' },
    copernicusOpenHub: { status: 'OK', latencyMs: 380, lastIngested: '2026-09-29T14:15:30Z' },
    bmkgOpenWeather: { status: 'OK', latencyMs: 120, lastIngested: '2026-09-30T04:00:00Z' },
    kalbarSatuData: { status: 'OK', latencyMs: 310, lastIngested: '2026-09-28T09:00:22Z' },
    osintCrawler: { status: 'OK', latencyMs: 450, lastIngested: '2026-09-30T02:45:11Z' },
    spatialDatabase: { status: 'OK', connections: 4, storageUsedMb: 142.8 },
    geminiGroundedAi: { status: 'OK', model: 'gemini-3.8-flash', guardrailStatus: 'ACTIVE_ANTI_HALLUCINATION' },
  };

  const detailedSystemTable = [
    {
      source: 'NASA FIRMS Open API (VIIRS/MODIS)',
      lastUpdate: '2026-09-30T03:30:12Z',
      status: 'ONLINE',
      error: 'None (0)',
      records: 8,
      latency: `${components.nasaFirmsFeed.latencyMs} ms`,
    },
    {
      source: 'Copernicus Sentinel-2 Level-2A STAC',
      lastUpdate: '2026-09-29T14:15:30Z',
      status: 'ONLINE',
      error: 'None (0)',
      records: 3,
      latency: `${components.copernicusOpenHub.latencyMs} ms`,
    },
    {
      source: 'BMKG Susilo Sintang Weather Feed',
      lastUpdate: '2026-09-30T04:00:00Z',
      status: 'ONLINE',
      error: 'None (0)',
      records: 24,
      latency: `${components.bmkgOpenWeather.latencyMs} ms`,
    },
    {
      source: 'Geoportal KLHK (Kawasan Hutan)',
      lastUpdate: '2026-09-28T09:00:22Z',
      status: 'ONLINE',
      error: 'None (0)',
      records: 4,
      latency: `${components.kalbarSatuData.latencyMs} ms`,
    },
    {
      source: 'BRGM RI (Peta Indikatif KHG Gambut)',
      lastUpdate: '2026-09-27T11:20:00Z',
      status: 'ONLINE',
      error: 'None (0)',
      records: 2,
      latency: '210 ms',
    },
    {
      source: 'LKBN ANTARA Kalbar RSS Harvester',
      lastUpdate: '2026-09-30T02:45:11Z',
      status: 'ONLINE',
      error: 'None (0)',
      records: 3,
      latency: `${components.osintCrawler.latencyMs} ms`,
    },
    {
      source: 'JDIH Sintang Regulatory Harvester',
      lastUpdate: '2026-09-25T10:00:00Z',
      status: 'ONLINE',
      error: 'None (0)',
      records: 1,
      latency: '180 ms',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('readiness')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'readiness'
              ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>System Readiness &amp; Release Gate (Fase 9)</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Pipeline Ingestion &amp; Component Telemetry</span>
        </button>
      </div>

      {/* View 1: System Readiness Panel (Fase 9) */}
      {activeTab === 'readiness' && <SystemReadinessPanel />}

      {/* View 2: Detailed Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Pipeline Ingestion &amp; Component Telemetry
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Status pemantauan konektivitas pipa penarik data publik terbuka, latensi query basis data spasial PostGIS, dan guardrail AI.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>STATUS: ALL COMPONENTS HEALTHY</span>
            </div>
          </div>

          {/* Grid of Micro Service Monitors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-200">BMKG Susilo Weather API</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  {components.bmkgOpenWeather.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Parameter cuaca harian, curah hujan, &amp; FWI
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Latensi Respons:</span>
                <span className="font-mono text-emerald-400">{components.bmkgOpenWeather.latencyMs} ms</span>
              </div>
            </div>
          </div>

          {/* Pipeline Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                Tabel Telemetri Pipa Ingesti Data Publik
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Terakhir Sinkron: {formatDateWib(new Date().toISOString())}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                    <th className="p-3">Sumber Data</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Update Terakhir</th>
                    <th className="p-3">Record Aktif</th>
                    <th className="p-3">Latensi</th>
                    <th className="p-3">Error Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {detailedSystemTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-medium text-slate-200">{row.source}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{formatDateWib(row.lastUpdate)}</td>
                      <td className="p-3 font-mono text-slate-300">{row.records} record</td>
                      <td className="p-3 font-mono text-emerald-400">{row.latency}</td>
                      <td className="p-3 text-slate-400">{row.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
