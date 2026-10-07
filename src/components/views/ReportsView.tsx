import React, { useState } from 'react';
import { LATEST_EXECUTIVE_BRIEFING, CURRENT_WEATHER } from '../../data/publicDataset';
import {
  FileSpreadsheet,
  Sparkles,
  Download,
  Printer,
  ShieldCheck,
  Send,
  MessageSquare,
  Bot,
  AlertCircle,
  ExternalLink,
  Flame,
  TreePine,
  CheckCircle2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [briefingText, setBriefingText] = useState<string>(
    LATEST_EXECUTIVE_BRIEFING.executiveSummary
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesizedResult, setSynthesizedResult] = useState<string | null>(null);

  // Q&A State
  const [question, setQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string; src: string }>>([
    {
      q: 'Berapa titik api yang terdeteksi di Hutan Lindung Ambalau?',
      a: 'Berdasarkan data NASA FIRMS VIIRS (S-NPP & NOAA-20), terdeteksi 3 titik hotspot di zona Hutan Lindung (HL) Kecamatan Ambalau dengan radiasi termal maksimum 44.2 MW dan penurunan tutupan kanopi Sentinel-2 sebesar 14.8 Hektar [Ref: EVT-STG-2026-0929-001].',
      src: 'Grounded Public Database',
    },
  ]);

  // Trigger Grounded AI Briefing Generator via Server
  const handleGenerateBriefing = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/v1/briefings/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: 'Harian (30 September 2026)',
          focusArea: 'Situasi Anomali Hutan Lindung Ambalau & Koridor Jalan HPT Serawai',
        }),
      });
      const data = await res.json();
      if (data.synthesizedText) {
        setSynthesizedResult(data.synthesizedText);
      }
    } catch (err) {
      console.error('Failed to synthesize briefing:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Submit Question to Grounded Q&A Assistant
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setQuestion('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/v1/briefings/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQ }),
      });
      const data = await res.json();
      setQaHistory((prev) => [
        ...prev,
        {
          q: userQ,
          a: data.answer || 'Data tidak tersedia untuk pertanyaan tersebut.',
          src: data.source || 'gemini-3.8-flash',
        },
      ]);
    } catch (err) {
      setQaHistory((prev) => [
        ...prev,
        {
          q: userQ,
          a: 'Gagal menghubungi layanan sintesis data publik.',
          src: 'Error',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const content = `# EXECUTIVE INTELLIGENCE BRIEFING: KPH SINTANG TIMUR
Tanggal: 30 September 2026
Wilayah: KPH Sintang Timur & Kabupaten Sintang, Kalimantan Barat
Prinsip: 100% Data Publik Terbuka (Tanpa Data Internal)

## Ringkasan Eksekutif
${synthesizedResult || briefingText}

## Temuan Kunci Berbasis Bukti
${LATEST_EXECUTIVE_BRIEFING.keyFindings.map((f) => `- [${f.category}] ${f.bulletText} (${f.evidenceCode})`).join('\n')}

## Peringatan Spasial Prioritas
${LATEST_EXECUTIVE_BRIEFING.spatialAlerts.map((a) => `### ${a.level}: ${a.location}\n- Situasi: ${a.summary}\n- Rekomendasi: ${a.recommendation}`).join('\n\n')}

## Rantai Sumber & Sitasi
${LATEST_EXECUTIVE_BRIEFING.groundedCitations.map((c) => `- [${c.citationId}] ${c.sourceName}: ${c.url}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kph-intelligence-briefing-2026-09-30.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Modul F: Executive Intelligence Briefings &amp; Grounded AI
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Laporan berkala berbasis bukti (Evidence-Based) untuk pimpinan. Didukung sintesis AI bebas halusinasi yang terikat 100% pada data publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateBriefing}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSynthesizing ? 'Menyintesis Data...' : 'Sintesis Grounded AI'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh Markdown</span>
          </button>
        </div>
      </div>

      {/* Main Executive Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {LATEST_EXECUTIVE_BRIEFING.id}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              {LATEST_EXECUTIVE_BRIEFING.headline}
            </h3>
            <div className="text-xs text-slate-400">
              Cakupan Waktu: {LATEST_EXECUTIVE_BRIEFING.periodLabel}
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400">Klasifikasi:</span>
            <div className="font-bold text-emerald-400">LAPORAN DATA TERBUKA RESMI</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Ringkasan Eksekutif Terkonsolidasi
          </h4>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 leading-relaxed text-sm text-slate-200 whitespace-pre-line">
            {synthesizedResult || LATEST_EXECUTIVE_BRIEFING.executiveSummary}
          </div>
        </div>

        {/* Key Findings List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Temuan Kunci Spasio-Temporal (Key Findings)
          </h4>
          <div className="space-y-2">
            {LATEST_EXECUTIVE_BRIEFING.keyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-400">[{finding.category}]</span>{' '}
                  <span className="text-slate-200">{finding.bulletText}</span>
                </div>
                <span className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {finding.evidenceCode}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spatial Alerts Matrix */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3. Rekomendasi Peringatan Spasial Prioritas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LATEST_EXECUTIVE_BRIEFING.spatialAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  alert.level === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider font-mono">
                    [{alert.level}]
                  </span>
                  <span className="font-medium text-slate-200">{alert.location}</span>
                </div>
                <p className="text-slate-200 font-medium">{alert.summary}</p>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Rekomendasi Tindakan:</strong>
                  {alert.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grounded Citations Chain */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            4. Sitasi &amp; Penelusuran Sumber Publik Asli
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {LATEST_EXECUTIVE_BRIEFING.groundedCitations.map((cit) => (
              <a
                key={cit.citationId}
                href={cit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <span className="font-medium truncate">
                  [{cit.citationId}] {cit.sourceName}
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Grounded Interactive Q&A Assistant Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Asisten Tanya Jawab Fakta KPH Sintang Timur (Grounded AI)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            Anti-Halusinasi: Hanya Menjawab Data Terverifikasi
          </span>
        </div>

        {/* Q&A Thread */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {qaHistory.map((item, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 text-slate-200 font-medium">
                <strong>Pertanyaan:</strong> {item.q}
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                <span className="text-emerald-400 font-bold block mb-1">
                  Jawaban Faktual ({item.src}):
                </span>
                {item.a}
              </div>
            </div>
          ))}
        </div>

        {/* Query Input */}
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="Tanyakan situasi titik panas, kanopi, atau cuaca di KPH Sintang..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isAsking}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAsking ? 'Menganalisis...' : 'Kirim'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
