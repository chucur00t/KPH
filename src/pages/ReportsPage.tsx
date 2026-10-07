import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  ShieldAlert,
  Bot,
  Cpu,
  RefreshCw,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { ExecutiveBriefingView } from '../components/intelligence/ExecutiveBriefingView';
import { IntelligenceAlertsFeed } from '../components/intelligence/IntelligenceAlertsFeed';
import { NaturalLanguageQueryConsole } from '../components/intelligence/NaturalLanguageQueryConsole';
import { AiModelAuditPanel } from '../components/intelligence/AiModelAuditPanel';
import { IntelligenceApiService } from '../services/intelligenceApiService';
import { ExecutiveBriefingObject, IntelligenceAlert } from '../types/intelligenceEngine';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'briefing' | 'alerts' | 'query' | 'audit'>('briefing');
  const [briefing, setBriefing] = useState<ExecutiveBriefingObject | null>(null);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [generatingCustom, setGeneratingCustom] = useState(false);

  // Custom Briefing Generator State
  const [selectedType, setSelectedType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AREA_SPECIFIC'>('DAILY');
  const [selectedArea, setSelectedArea] = useState('AOI-KPH-SINTANG-TIMUR');

  const loadData = async (forceRefresh = false) => {
    try {
      setLoadingBriefing(true);
      const b = await IntelligenceApiService.getLatestBriefing(forceRefresh);
      setBriefing(b);
    } catch (e) {
      console.error('Error fetching briefing:', e);
    } finally {
      setLoadingBriefing(false);
    }

    try {
      setLoadingAlerts(true);
      const a = await IntelligenceApiService.getAlerts();
      setAlerts(a);
    } catch (e) {
      console.error('Error fetching alerts:', e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateCustomBriefing = async () => {
    try {
      setGeneratingCustom(true);
      const customBriefing = await IntelligenceApiService.generateBriefing(selectedType, selectedArea);
      if (customBriefing) {
        setBriefing(customBriefing);
      }
    } catch (e) {
      console.error('Error generating custom briefing:', e);
    } finally {
      setGeneratingCustom(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    const success = await IntelligenceApiService.acknowledgeAlert(alertId);
    if (success) {
      setAlerts((prev) =>
        prev.map((item) =>
          item.alert_id === alertId ? { ...item, status: 'ACKNOWLEDGED' } : item
        )
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* 100% Public Compliance Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-400">
              KPH INTELLIGENCE SUITE — FASE 8 PRODUKSI
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            Executive Intelligence Briefings &amp; Grounded AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sintesis intelijen eksekutif berbasis 100% data publik (Satelit, Termal NASA FIRMS, OSINT Media, &amp; Spasial PostGIS). Strict Temperature 0.1 dengan Zero Halusinasi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={() => loadData(true)}
            disabled={loadingBriefing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingBriefing ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('briefing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'briefing'
              ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Executive Briefing</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Intelligence Alerts &amp; Pola</span>
          {alerts.filter((a) => a.status === 'NEW').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-950 text-red-300 border border-red-800">
              {alerts.filter((a) => a.status === 'NEW').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('query')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'query'
              ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Ask Intelligence (Grounded Q&amp;A)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Model Registry &amp; Data Quality Audit</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE BRIEFING */}
      {activeTab === 'briefing' && (
        <div className="space-y-6">
          {/* Custom Generator Controls */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Periode:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="DAILY">Harian (Daily Assessment)</option>
                  <option value="WEEKLY">Mingguan (Weekly Briefing)</option>
                  <option value="MONTHLY">Bulanan (Monthly Trend)</option>
                  <option value="AREA_SPECIFIC">Spesifik Wilayah (Area Focus)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Fokus Wilayah:</span>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="AOI-KPH-SINTANG-TIMUR">Seluruh KPH Sintang Timur (Prioritas)</option>
                  <option value="KEC-AMBALAU">Kecamatan Ambalau (Hutan Lindung)</option>
                  <option value="KEC-SERAWAI">Kecamatan Serawai (Hutan Produksi)</option>
                  <option value="KEC-KETUNGAU-HILIR">Kecamatan Ketungau Hilir &amp; Tengah</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateCustomBriefing}
              disabled={generatingCustom}
              className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generatingCustom ? 'Menyintesis Bukti...' : 'Generate Grounded Briefing'}</span>
            </button>
          </div>

          {loadingBriefing ? (
            <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Menyusun Rantai Bukti Data Publik...</p>
              <p className="text-xs text-slate-400">Mengambil observasi satelit Sentinel-2, deteksi anomali termal FIRMS, dan data OSINT</p>
            </div>
          ) : briefing ? (
            <ExecutiveBriefingView briefing={briefing} />
          ) : (
            <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              Briefing eksekutif belum tersedia. Klik &apos;Generate Grounded Briefing&apos; untuk memicu sintesis awal.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTELLIGENCE ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">
              Mesin Deteksi Anomali &amp; Peringatan Spasio-Temporal
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Evaluasi korelasi multi-sumber otomatis (Satelit + Titik Panas + OSINT), pola kebakaran berulang, dan bukaan tajam kanopi kanvas PostGIS.
            </p>
          </div>

          {loadingAlerts ? (
            <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              Memuat daftar peringatan intelijen...
            </div>
          ) : (
            <IntelligenceAlertsFeed alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
          )}
        </div>
      )}

      {/* TAB 3: ASK INTELLIGENCE CONSOLE */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          <NaturalLanguageQueryConsole />
        </div>
      )}

      {/* TAB 4: MODEL REGISTRY & AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <AiModelAuditPanel />
        </div>
      )}
    </div>
  );
};
