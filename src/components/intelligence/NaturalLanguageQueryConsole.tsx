import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Send,
  HelpCircle,
  ShieldCheck,
  Compass,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { NaturalLanguageQueryResponse } from '../../types/intelligenceEngine';
import { IntelligenceApiService } from '../../services/intelligenceApiService';

export const NaturalLanguageQueryConsole: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NaturalLanguageQueryResponse | null>(null);
  const [error, setError] = useState('');

  const quickPrompts = [
    'Apa perubahan utama di KPH Sintang Timur dalam 30 hari terakhir?',
    'Apakah ada korelasi antara titik panas dan bukaan lahan di Ambalau?',
    'Area mana yang memiliki anomali termal berulang?',
    'Bagaimana status kesiapsiagaan karhutla menurut warta publik dan regulasi daerah?',
  ];

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    try {
      setLoading(true);
      setError('');
      const resp = await IntelligenceApiService.askIntelligence(queryText);
      if (resp) {
        setResult(resp);
      } else {
        setError('Tidak ada respon dari mesin inteligensi.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memproses query.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Input Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Ask Intelligence (Pencarian Berbasis Bukti &amp; AI Anti-Halusinasi)
            </h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Strict Evidence Grounded
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Ajukan pertanyaan analitis terkait kawasan KPH Sintang Timur. Jawaban disusun secara ketat berbasis bukti faktual dari database publik dan citra satelit tanpa asumsi halusinatif.
        </p>

        {/* Input Box */}
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery(question)}
            placeholder="Tanyakan dinamika wilayah, korelasi kejadian, atau pola titik panas..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-850 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          />
          <button
            onClick={() => handleQuery(question)}
            disabled={loading || !question.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400">Pertanyaan Cepat Rekomendasi Operator:</span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(p);
                  handleQuery(p);
                }}
                className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Result Card (Section 32 Structured Format) */}
      {result && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5 animate-in fade-in">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Intent: {result.intent}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                Latensi: {result.latency_ms} ms
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Tingkat Keyakinan Bukti:</span>
              <span className="font-bold text-emerald-400 font-mono">{result.confidence}</span>
            </div>
          </div>

          {/* Core Answer */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Jawaban Intelijen Terstruktur (Grounded Answer)
            </span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {result.answer}
            </div>
          </div>

          {/* Observations & Correlations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Observasi Langsung Sensor (Observations)
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {result.observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Korelasi Spasio-Temporal (Correlations)
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {result.correlations.map((corr, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                    <span>{corr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Uncertainties & Data Gaps */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Ketidakpastian &amp; Kesenjangan Data Publik (Uncertainties &amp; Data Gaps)
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {result.uncertainties.map((u, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sources Citations (Section 42) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sitasi Sumber Bukti Terbuka (Source Provenance)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.source_citations.map((cite) => (
                <div
                  key={cite.citation_id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">
                      {cite.source_name}
                    </span>
                    <span className="font-mono text-[10px] text-cyan-400">{cite.citation_id}</span>
                  </div>
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 p-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
