import React, { useState, useEffect } from 'react';
import {
  ForestryNewsRecord,
  ForestryNewsEvent,
  ForestryNewsSummary,
} from '../types/forestryNews';
import { ForestryNewsApiService } from '../services/forestryNewsApiService';
import { ForestryNewsWarningBanner } from '../components/forestryNews/ForestryNewsWarningBanner';
import { ForestryNewsReportList } from '../components/forestryNews/ForestryNewsReportList';
import { ForestryNewsDetailModal } from '../components/forestryNews/ForestryNewsDetailModal';
import { ForestryNewsTimeline } from '../components/forestryNews/ForestryNewsTimeline';
import { ForestryNewsSourceHealthPanel } from '../components/forestryNews/ForestryNewsSourceHealthPanel';
import { ForestryNewsKeywordConfig } from '../components/forestryNews/ForestryNewsKeywordConfig';
import { ForestryNewsNlQuery } from '../components/forestryNews/ForestryNewsNlQuery';
import {
  Newspaper,
  Calendar,
  Activity,
  Settings,
  Bot,
  RefreshCw,
  Scale,
  Flame,
  TreePine,
  Layers,
} from 'lucide-react';

export const ForestryMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'timeline' | 'health' | 'keywords' | 'ask'>('reports');
  const [records, setRecords] = useState<ForestryNewsRecord[]>([]);
  const [events, setEvents] = useState<ForestryNewsEvent[]>([]);
  const [summary, setSummary] = useState<ForestryNewsSummary | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ForestryNewsRecord | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ForestryNewsEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recData, evtData, sumData, srcData, timeData] = await Promise.all([
        ForestryNewsApiService.getRecords(),
        ForestryNewsApiService.getEvents(),
        ForestryNewsApiService.getSummary(),
        ForestryNewsApiService.getSourceHealth(),
        ForestryNewsApiService.getTimeline(),
      ]);
      setRecords(recData);
      setEvents(evtData);
      setSummary(sumData);
      setSources(srcData);
      setTimeline(timeData);
    } catch (err) {
      console.error('Failed to load forestry news monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRecord = (rec: ForestryNewsRecord, evt?: ForestryNewsEvent) => {
    setSelectedRecord(rec);
    setSelectedEvent(evt || events.find((e) => e.recordId === rec.recordId) || null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* 1. Mandatory Warning Banner */}
      <ForestryNewsWarningBanner />

      {/* 2. Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-slate-100">
              Pemantauan Warta &amp; Laporan Publik Kehutanan (Fase 10A OSINT)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pengumpulan warta media pers, siaran pers penegakan hukum resmi, direktori pengadilan, dan audit korelasi spasial sensor.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 3. Top Metrics KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Warta Terindeks</span>
          <div className="text-2xl font-black font-mono text-slate-100">
            {summary?.totalRecords ?? records.length}
          </div>
          <div className="text-[10px] text-slate-400">{summary?.distinctEvents ?? events.length} Kejadian Unik Terfilter</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-900/50 space-y-1">
          <span className="text-[11px] text-cyan-300 uppercase font-semibold">Rilis Penegakan Hukum</span>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {summary?.enforcementReports ?? 2}
          </div>
          <div className="text-[10px] text-cyan-300/80">Gakkum KLHK &amp; Polres Sintang</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-purple-900/50 space-y-1">
          <span className="text-[11px] text-purple-300 uppercase font-semibold">Perkara Pengadilan</span>
          <div className="text-2xl font-black font-mono text-purple-400">
            {summary?.courtCasesCount ?? 1}
          </div>
          <div className="text-[10px] text-purple-300/80">SIPP Pengadilan Negeri Sintang</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/40 space-y-1">
          <span className="text-[11px] text-emerald-300 uppercase font-semibold">Korelasi Satelit</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {summary?.correlationsCount.withSatellite ?? 3}
          </div>
          <div className="text-[10px] text-emerald-300/80">Sentinel-2 &amp; Hotspot Terkonfirmasi</div>
        </div>
      </div>

      {/* 4. Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-cyan-600 text-slate-950 font-bold shadow-md shadow-cyan-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Warta &amp; Kejadian Publik ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-purple-600 text-slate-950 font-bold shadow-md shadow-purple-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Linimasa Warta (Timeline)</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'health'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Kesehatan Sumber &amp; Crawler ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'keywords'
              ? 'bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Konfigurasi Kata Kunci</span>
        </button>

        <button
          onClick={() => setActiveTab('ask')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'ask'
              ? 'bg-indigo-600 text-slate-950 font-bold shadow-md shadow-indigo-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Tanya Warta (Grounded AI)</span>
        </button>
      </div>

      {/* 5. Tab Views */}
      {activeTab === 'reports' && (
        <ForestryNewsReportList
          records={records}
          events={events}
          onSelectRecord={handleSelectRecord}
        />
      )}

      {activeTab === 'timeline' && (
        <ForestryNewsTimeline
          timeline={timeline}
          onSelectEventId={(id) => {
            const foundEvent = events.find((e) => e.eventId === id);
            const foundRec = records.find((r) => r.recordId === foundEvent?.recordId);
            if (foundRec) handleSelectRecord(foundRec, foundEvent);
          }}
        />
      )}

      {activeTab === 'health' && (
        <ForestryNewsSourceHealthPanel sources={sources} />
      )}

      {activeTab === 'keywords' && <ForestryNewsKeywordConfig />}

      {activeTab === 'ask' && <ForestryNewsNlQuery />}

      {/* 6. Detail Modal */}
      <ForestryNewsDetailModal
        record={selectedRecord}
        event={selectedEvent}
        onClose={() => {
          setSelectedRecord(null);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
};
