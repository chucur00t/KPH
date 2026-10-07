import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  TreePine,
  Compass,
  Radio,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  Database,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Server,
  HelpCircle,
} from 'lucide-react';
import { IntelligenceApiService } from '../services/intelligenceApiService';
import {
  ExecutiveBriefingObject,
  IntelligenceAlert,
  KeyIntelligenceEvent,
} from '../types/intelligenceEngine';
import { ExecutiveBriefingView } from '../components/intelligence/ExecutiveBriefingView';
import { NaturalLanguageQueryConsole } from '../components/intelligence/NaturalLanguageQueryConsole';
import { IntelligenceAlertsFeed } from '../components/intelligence/IntelligenceAlertsFeed';
import { AiModelAuditPanel } from '../components/intelligence/AiModelAuditPanel';

type SituationTab = 'briefing' | 'ask' | 'alerts' | 'audit';

export interface ExecutiveDashboardPageProps {
  onNavigate?: (page: any) => void;
  onSelectEvent?: (event: any) => void;
}

export const ExecutiveDashboardPage: React.FC<ExecutiveDashboardPageProps> = ({
  onNavigate,
  onSelectEvent: onSelectExternalEvent,
}) => {
  const [activeTab, setActiveTab] = useState<SituationTab>('briefing');
  const [briefing, setBriefing] = useState<ExecutiveBriefingObject | null>(null);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<KeyIntelligenceEvent | null>(null);

  const loadData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const [briefData, alertData] = await Promise.all([
        IntelligenceApiService.getLatestBriefing(forceRefresh),
        IntelligenceApiService.getAlerts(),
      ]);

      setBriefing(briefData);
      setAlerts(alertData);
    } catch (err) {
      console.error('Failed to load Situation Room data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcknowledgeAlert = async (alertId: string) => {
    await IntelligenceApiService.acknowledgeAlert(alertId);
    setAlerts((prev) =>
      prev.map((a) =>
        a.alert_id === alertId
          ? { ...a, status: 'ACKNOWLEDGED', acknowledged_at: new Date().toISOString() }
          : a
      )
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* 1. Header with Hard Constraints Notice */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-base sm:text-xl font-bold text-slate-100">
              KPH SITUATION ROOM &bull; RUANG OPERASI INTELIJEN TERPADU
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              FASE 8 PROD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Sistem sintesis analitis multimodal (Satelit Sentinel-2 &bull; FIRMS/SIPONGI &bull; GIS Sintang &bull; Warta OSINT) yang ditenagai Gemini AI Engine dengan kepatuhan mutlak 100% data publik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Sumber Terbuka Terverifikasi</span>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Segarkan Analisis"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Phase 10 Forestry Activity Intelligence Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">Fase 10: Intelijen Aktivitas &amp; Gangguan Kawasan Hutan</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono">
                5 Indikator Spasial
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              14.8 Ha HL Ambalau &bull; 22.4 Ha HPT Serawai &bull; 18.2 Ha Gambut Belitang &bull; 6.4 Ha Sungai Kayan &bull; 2 Rilis Penegakan Hukum
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('forestry')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
        >
          <span>Buka Modul Kehutanan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. CURRENT SITUATION BAR (Section 26) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Fire Situations 24h & 7d */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kejadian Api (24j / 7h)</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {briefing?.fire_situation.total_detections || 0}
            <span className="text-xs text-slate-500 font-normal"> / {briefing?.fire_situation.fire_events_count || 0} klaster</span>
          </div>
          <p className="text-[11px] text-slate-400">Puncak FRP: {briefing?.fire_situation.max_frp_mw || 0} MW</p>
        </div>

        {/* Land Change 30d */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bukaan Kanopi (30h)</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {briefing?.land_change_situation.total_loss_area_ha || 0}
            <span className="text-xs font-normal"> Ha</span>
          </div>
          <p className="text-[11px] text-slate-400">{briefing?.land_change_situation.detected_change_events || 0} klaster Sentinel-2</p>
        </div>

        {/* OSINT Reports 7d */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Warta Publik (7h)</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {briefing?.osint_situation.total_public_reports || 0}
            <span className="text-xs text-slate-500 font-normal"> rilis</span>
          </div>
          <p className="text-[11px] text-slate-400">LKBN ANTARA, Pemkab, JDIH</p>
        </div>

        {/* High Risk Areas */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Indikator Risiko</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {briefing?.risk_indicators.level || 'MODERAT'}
          </div>
          <p className="text-[11px] text-slate-400">Ambalau &bull; Serawai &bull; KHG</p>
        </div>

        {/* System Integrity & Quality */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kualitas Bukti</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400">
            {briefing?.confidence || 'HIGH'}
          </div>
          <p className="text-[11px] text-slate-400">{briefing?.provenance.total_evidence_items || 0} Bukti SHA-256</p>
        </div>
      </div>

      {/* 3. SITUATION ROOM MAIN NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('briefing')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'briefing'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Executive Intelligence Briefing</span>
        </button>

        <button
          onClick={() => setActiveTab('ask')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'ask'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Intelligence (Grounded Q&amp;A)</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'alerts'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Peringatan Dini ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'audit'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Model Registry &amp; Audit Log</span>
        </button>
      </div>

      {/* 4. ACTIVE TAB WORKSPACE */}
      <div>
        {activeTab === 'briefing' && briefing && (
          <ExecutiveBriefingView
            briefing={briefing}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        )}

        {activeTab === 'ask' && <NaturalLanguageQueryConsole />}

        {activeTab === 'alerts' && (
          <IntelligenceAlertsFeed
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
          />
        )}

        {activeTab === 'audit' && <AiModelAuditPanel />}
      </div>

      {/* 5. Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {selectedEvent.event_id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Skor Relevansi: {selectedEvent.relevance_score}/100
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-100"
              >
                &times;
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-100">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">{selectedEvent.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 text-xs border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Wilayah Administrasi:</span>
                <span className="text-slate-200 font-semibold">{selectedEvent.kecamatan}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Fungsi Kawasan Hutan:</span>
                <span className="text-slate-200 font-semibold">{selectedEvent.forest_zone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Jumlah Item Bukti:</span>
                <span className="text-cyan-300 font-mono">{selectedEvent.evidence_count} Bukti</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sumber Publik Terverifikasi:</span>
                <span className="text-emerald-400 font-mono">{selectedEvent.sources_count} Sumber</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
