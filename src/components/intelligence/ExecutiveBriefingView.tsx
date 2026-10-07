import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flame,
  TreePine,
  Download,
  Share2,
  Printer,
  Sparkles,
  HelpCircle,
  Database,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { ExecutiveBriefingObject, KeyIntelligenceEvent } from '../../types/intelligenceEngine';
import { IntelligenceApiService } from '../../services/intelligenceApiService';

interface ExecutiveBriefingViewProps {
  briefing: ExecutiveBriefingObject;
  onSelectEvent?: (event: KeyIntelligenceEvent) => void;
  onSelectCitation?: (sourceId: string) => void;
}

export const ExecutiveBriefingView: React.FC<ExecutiveBriefingViewProps> = ({
  briefing,
  onSelectEvent,
  onSelectCitation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'brief' | 'key_events' | 'uncertainties' | 'sources'>('brief');

  const handleExport = (format: 'html' | 'json' | 'csv' | 'pdf_view') => {
    window.open(IntelligenceApiService.getExportUrl(format), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Export Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {briefing.briefing_type}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {briefing.intelligence_id}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
              100% Data Publik Terbuka
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
            {briefing.title}
          </h2>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{briefing.period.label}</span>
            <span>&bull;</span>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{briefing.area.name}</span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleExport('html')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            title="Unduh HTML"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>HTML</span>
          </button>

          <button
            onClick={() => handleExport('json')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            title="Unduh JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            title="Unduh CSV Kejadian"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => handleExport('pdf_view')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors"
            title="Buka Cetak PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('brief')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeSubTab === 'brief'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ringkasan Eksekutif &amp; Situasi
        </button>

        <button
          onClick={() => setActiveSubTab('key_events')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeSubTab === 'key_events'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Kejadian Penting Berbasis Bukti ({briefing.key_events.length})
        </button>

        <button
          onClick={() => setActiveSubTab('uncertainties')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeSubTab === 'uncertainties'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ketidakpastian &amp; Keterbatasan ({briefing.uncertainties.length})
        </button>

        <button
          onClick={() => setActiveSubTab('sources')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeSubTab === 'sources'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Daftar Sitasi Sumber Terbuka ({briefing.source_list.length})
        </button>
      </div>

      {/* TAB 1: EXECUTIVE BRIEF & SITUATION */}
      {activeSubTab === 'brief' && (
        <div className="space-y-6">
          {/* Executive Summary (3 to 5 bullets - Section 22) */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                1. Ringkasan Eksekutif (Executive Summary — Grounded Facts)
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {briefing.executive_summary.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Situation Overview */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Gambaran Situasi Wilayah (Situation Overview)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {briefing.situation_overview}
            </p>
          </div>

          {/* Tri-Modal Situation Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fire Pillar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Situasi Termal / Kebakaran
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
                  Risiko: {briefing.fire_situation.risk_level}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {briefing.fire_situation.total_detections} <span className="text-xs font-normal text-slate-400">Hotspot</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Kejadian Api Terklaster: <strong>{briefing.fire_situation.fire_events_count}</strong></div>
                <div>Puncak Radiasi Termal: <strong>{briefing.fire_situation.max_frp_mw} MW</strong></div>
              </div>
            </div>

            {/* Land Change Pillar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <TreePine className="w-4 h-4" />
                  Perubahan Kanopi Satelit
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                  Sentinel-2 L2A
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {briefing.land_change_situation.total_loss_area_ha} <span className="text-xs font-normal text-slate-400">Hektar</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Klaster Terdeteksi: <strong>{briefing.land_change_situation.detected_change_events}</strong></div>
                <div>Rerata Indeks Delta: <strong>{briefing.land_change_situation.mean_ndvi_delta} dNDVI</strong></div>
              </div>
            </div>

            {/* OSINT Pillar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Publikasi Resmi &amp; Media
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                  OSINT Sub-D
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {briefing.osint_situation.total_public_reports} <span className="text-xs font-normal text-slate-400">Warta Terbuka</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Pemberitahuan Regulasi: <strong>{briefing.osint_situation.official_gazette_notices} SK/Perbup</strong></div>
                <div>Kustodian: <strong>ANTARA, Pemkab, JDIH</strong></div>
              </div>
            </div>
          </div>

          {/* Cross Source Correlation */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Korelasi Multimodal Lintas Sumber (Cross-Source Corroboration)</span>
            </h3>
            {briefing.cross_source_correlation.map((corr) => (
              <div
                key={corr.correlation_id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">{corr.headline}</span>
                  <span className="font-mono text-xs text-cyan-300 font-medium">Keyakinan: {corr.confidence}%</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{corr.details}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {corr.evidence_tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Risk Indicators Notice */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-300">
              <span className="font-bold text-amber-300">Pemberitahuan Kepatuhan KPH Intelligence:</span>
              <p className="text-[11px] leading-relaxed">
                {briefing.risk_indicators.disclaimer} {briefing.limitations}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEY EVENTS */}
      {activeSubTab === 'key_events' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <span>Kejadian diurutkan berdasarkan skor relevansi teknis transparan (tanpa evaluasi individu/organisasi).</span>
            <span className="font-mono text-cyan-400">{briefing.key_events.length} Kejadian Terpilih</span>
          </div>

          {briefing.key_events.map((evt) => (
            <div
              key={evt.event_id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {evt.event_id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-medium">
                    {evt.event_type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Skor Relevansi Teknis: <strong className="font-mono text-emerald-400">{evt.relevance_score}/100</strong>
                  </span>
                  {onSelectEvent && (
                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                    >
                      <span>Inspeksi Bukti</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100">{evt.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{evt.summary}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {evt.kecamatan} ({evt.forest_zone})
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(evt.detected_at).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span>Sitasi:</span>
                  {evt.evidence_citations.map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: UNCERTAINTIES & DATA GAPS */}
      {activeSubTab === 'uncertainties' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Ketidakpastian Teridentifikasi (Uncertainties)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {briefing.uncertainties.map((u, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Kesenjangan Data Terbuka (Data Gaps)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {briefing.data_gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong>Penjelasan Prinsip:</strong> Sistem dirancang secara khusus untuk mengakui apa yang belum diketahui secara terbuka (epistemic humility), menghindari ekstrapolasi berlebihan, dan secara eksplisit menyajikan limitasi observasi satelit dan laporan sekunder.
          </div>
        </div>
      )}

      {/* TAB 4: CITATION SOURCES */}
      {activeSubTab === 'sources' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            Daftar lengkap sumber data publik resmi yang menopang seluruh klaim dan observasi pada dokumen briefing ini.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {briefing.source_list.map((src) => (
              <div
                key={src.source_id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                      {src.source_id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Terverifikasi
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mt-2">{src.source_name}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">Pengampu: {src.provider}</div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[200px]">{src.license}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium"
                  >
                    <span>Endpoint Publik</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
