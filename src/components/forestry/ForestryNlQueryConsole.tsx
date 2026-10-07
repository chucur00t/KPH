import React, { useState } from 'react';
import {
  ForestryActivityApiService,
  NaturalLanguageQueryResult,
} from '../../services/forestryActivityApiService';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  FileText,
  Layers,
  Scale,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const ForestryNlQueryConsole: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NaturalLanguageQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const SUGGESTED_QUESTIONS = [
    'Apakah ada perubahan tutupan hutan yang mencurigakan bulan ini?',
    'Di mana terdapat indikator potensi pembukaan lahan?',
    'Apakah ada hotspot yang berkorelasi dengan perubahan tutupan lahan?',
    'Apakah ada laporan publik mengenai dugaan pembalakan liar?',
    'Apakah terdapat aktivitas yang berada di luar area perizinan publik yang tersedia?',
    'Mana indikator yang paling membutuhkan verifikasi?',
  ];

  const handleAsk = async (qText?: string) => {
    const textToQuery = qText || question;
    if (!textToQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await ForestryActivityApiService.askNaturalLanguageQuery(textToQuery);
      setResult(res);
      if (qText) setQuestion(qText);
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">
            Konsol Tanya Intelijen Kehutanan Terpadu (Grounded AI Engine)
          </h3>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono ml-auto">
            Strict Temp 0.1 &bull; Anti-Hallucination
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Ajukan pertanyaan berbasis fakta spasial KPH Sintang Timur. Jawaban dijamin berbasis bukti data publik dengan skema klasifikasi terstruktur (Observasi, Temuan Turunan, Korelasi, Klaim Publik, Status Hukum Resmi, Ketidakpastian, dan Prioritas Verifikasi).
        </p>

        {/* Suggested Queries */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-400">Pertanyaan Cepat Rekomendasi:</span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-[11px] text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-left disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ketik pertanyaan spasial atau intelijen kehutanan..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Menganalisis...</span>
            ) : (
              <>
                <span>Tanya</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Structured Result Display (Section 26) */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Main Answer Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-amber-500/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                  Ringkasan Sintesis Intelijen
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                CONFIDENCE: {result.confidence}
              </span>
            </div>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
              {result.answer}
            </p>
          </div>

          {/* Structured Schema Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Observasi Fisik */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Layers className="w-4 h-4" />
                <span>1. Observasi Spektral &amp; Sensor</span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                {result.observations?.map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            {/* 2. Temuan Turunan */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Compass className="w-4 h-4" />
                <span>2. Temuan Turunan Spasial (GIS)</span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                {result.derived_findings?.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>

            {/* 3. Korelasi Multi-Sensor */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <FileText className="w-4 h-4" />
                <span>3. Korelasi Lintas Sumber</span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                {result.correlations?.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* 4. Status Hukum & Rilis Resmi */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Scale className="w-4 h-4" />
                <span>4. Catatan Hukum Otoritatif</span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                {result.legal_findings?.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
            </div>

            {/* 5. Ketidakpastian & Gaps */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <HelpCircle className="w-4 h-4" />
                <span>5. Batasan Ketidakpastian Data</span>
              </div>
              <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px]">
                {result.uncertainties?.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>

            {/* 6. Rekomendasi Verifikasi */}
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/60 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>6. Rekomendasi Verifikasi Lapangan</span>
              </div>
              <ul className="space-y-1 text-purple-200 list-disc list-inside text-[11px]">
                {result.verification_priorities?.map((v, idx) => (
                  <li key={idx}>{v}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Traceable IDs footer */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Evidence IDs: {result.evidence_ids?.join(', ') || 'EV-FOR-001'}</span>
            <span>Source IDs: {result.source_ids?.join(', ') || 'SRC-ESA, SRC-KLHK, SRC-FIRMS'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
