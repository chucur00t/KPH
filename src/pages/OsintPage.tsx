import React, { useState, useEffect } from 'react';
import {
  Globe2,
  ExternalLink,
  Calendar,
  Tag,
  MapPin,
  ShieldCheck,
  Radio,
  FileText,
  Compass,
  Database,
  Layers,
  Sparkles,
  Flame,
  TreePine,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { OsintApiService } from '../services/osintApiService';
import {
  OsintSource,
  OsintSourceRecord,
  OsintEvent,
  OsintSpatialCorrelation,
  OsintAnalyticsSummary,
  CollectorHarvestResult,
  OsintSnapshot,
  OsintEntity,
} from '../types/osint';
import { OsintRecordModal } from '../components/osint/OsintRecordModal';
import { OsintEventModal } from '../components/osint/OsintEventModal';
import { OsintFeedStream } from '../components/osint/OsintFeedStream';
import { OsintEventsTable } from '../components/osint/OsintEventsTable';
import { OsintCorrelationMatrix } from '../components/osint/OsintCorrelationMatrix';
import { OsintSourcesRegistry } from '../components/osint/OsintSourcesRegistry';

type ActiveTab = 'feed' | 'events' | 'correlation' | 'sources';

export const OsintPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [sources, setSources] = useState<OsintSource[]>([]);
  const [records, setRecords] = useState<OsintSourceRecord[]>([]);
  const [events, setEvents] = useState<OsintEvent[]>([]);
  const [correlations, setCorrelations] = useState<OsintSpatialCorrelation[]>([]);
  const [analytics, setAnalytics] = useState<OsintAnalyticsSummary | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [harvesting, setHarvesting] = useState<boolean>(false);

  // Selected modals
  const [selectedRecord, setSelectedRecord] = useState<OsintSourceRecord | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<OsintSnapshot | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<OsintEntity[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<OsintEvent | null>(null);

  // Load all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [srcs, recs, evts, corrs, anly] = await Promise.all([
        OsintApiService.getSources(),
        OsintApiService.getRecords(),
        OsintApiService.getEvents(),
        OsintApiService.getCorrelations(),
        OsintApiService.getAnalytics(),
      ]);

      setSources(srcs);
      setRecords(recs);
      setEvents(evts);
      setCorrelations(corrs);
      setAnalytics(anly);
    } catch (err) {
      console.error('Failed to load OSINT data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRecord = async (record: OsintSourceRecord) => {
    try {
      const detail = await OsintApiService.getRecordById(record.record_id);
      if (detail) {
        setSelectedRecord(detail.record);
        setSelectedSnapshot(detail.snapshot || null);
        setSelectedEntities(detail.entities || []);
      } else {
        setSelectedRecord(record);
      }
    } catch {
      setSelectedRecord(record);
    }
  };

  const handleSelectEvent = (event: OsintEvent) => {
    setSelectedEvent(event);
  };

  const handleTriggerHarvest = async (): Promise<CollectorHarvestResult | null> => {
    try {
      setHarvesting(true);
      const result = await OsintApiService.triggerHarvest();
      await loadData();
      return result;
    } catch (err: any) {
      console.error('Harvest failed:', err);
      return null;
    } finally {
      setHarvesting(false);
    }
  };

  const handleRegisterSource = async (newSourceData: Partial<OsintSource>) => {
    await OsintApiService.registerSource(newSourceData);
    await loadData();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* 1. Header with Hard Constraints Notice */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Modul D: OSINT Intelligence &amp; Publikasi Terbuka
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              FASE 7
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Sistem pengumpulan, ekstraksi entitas, dan analisis informasi terbuka dari LKBN ANTARA Biro Kalbar, portal Pemkab Sintang, JDIH, dan publikasi riset resmi Kabupaten Sintang &amp; KPH Sintang Timur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Data Publik Terbuka</span>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sumber Terverifikasi</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {analytics?.active_sources || sources.filter((s) => s.status === 'ACTIVE').length}
            <span className="text-xs text-slate-500 font-normal"> / {sources.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">RSS, JDIH, Web, &amp; API Terdaftar</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rekaman Terarsip</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400">
            {analytics?.total_records || records.length}
          </div>
          <p className="text-[11px] text-slate-400">Tereduplikasi dengan SHA-256</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kejadian Terstruktur</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {analytics?.total_events || events.length}
          </div>
          <p className="text-[11px] text-slate-400">Ekstraksi Tanpa Kriminalisasi</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Korelasi Spasial Lintas Modul</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {analytics?.correlated_events_count || events.filter((e) => e.is_spatial_correlated).length}
          </div>
          <p className="text-[11px] text-slate-400">Terhubung Satelit &amp; Titik Panas</p>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'feed'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Warta &amp; Publikasi Terbuka ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'events'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Kejadian Intelijen Terstruktur ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('correlation')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'correlation'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Matriks Korelasi Spasio-Temporal ({correlations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'sources'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Registri Kolektor Web ({sources.length})</span>
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div>
        {activeTab === 'feed' && (
          <OsintFeedStream
            records={records}
            sources={sources}
            onSelectRecord={handleSelectRecord}
            onRefresh={loadData}
            loading={loading}
          />
        )}

        {activeTab === 'events' && (
          <OsintEventsTable
            events={events}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {activeTab === 'correlation' && (
          <OsintCorrelationMatrix
            correlations={correlations}
            events={events}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {activeTab === 'sources' && (
          <OsintSourcesRegistry
            sources={sources}
            onTriggerHarvest={handleTriggerHarvest}
            onRegisterSource={handleRegisterSource}
            harvesting={harvesting}
          />
        )}
      </div>

      {/* 5. Modals */}
      {selectedRecord && (
        <OsintRecordModal
          record={selectedRecord}
          snapshot={selectedSnapshot}
          entities={selectedEntities}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {selectedEvent && (
        <OsintEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
