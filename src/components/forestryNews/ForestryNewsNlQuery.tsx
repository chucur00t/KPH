import React, { useState } from 'react';
import {
  ForestryNewsApiService,
  ForestryNewsNlQueryResult,
} from '../../services/forestryNewsApiService';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  FileText,
  Scale,
  TreePine,
  ShieldAlert,
  Newspaper,
  Compass,
} from 'lucide-react';

export const ForestryNewsNlQuery: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForestryNewsNlQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const SUGGESTED_QUERIES = [
    'Ada berita terbaru tentang illegal logging di Sintang?',
    'Ada laporan tambang ilegal di wilayah KPH?',
    'Apa berita aktivitas ilegal kehutanan minggu ini?',
    'Di kecamatan mana paling banyak laporan?',
    'Apakah ada laporan pembukaan lahan di kawasan hutan?',
    'Apakah ada berita penindakan kehutanan?',
    'Ada kasus kehutanan yang masuk pengadilan?',
  ];

  const handleAsk = async (qText?: string) => {
    const textToQuery = qText || question;
    if (!textToQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await ForestryNewsApiService.askNlQuery(textToQuery);
      setResult(res);
      if (qText) setQuestion(qText);
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses pertanyaan warta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Instructions */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">
            Tanya Intelijen Warta &amp; Laporan Publik (Grounded OSINT AI)
          </h3>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono ml-auto">
            Strict Temp 0.1 &bull; Anti-Hallucination
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Ajukan pertanyaan berbasis artikel warta dan siaran pers publik resmi KPH Sintang Timur. Jawaban dijamin mengutip sumber publik asli, membedakan antara klaim dugaan dengan putusan peradilan, dan menolak tuduhan otomatis.
        </p>

        {/* Suggested Queries */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-400">Pertanyaan Cepat Rekomendasi:</span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-left disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ketik pertanyaan terkait berita illegal logging, PETI, atau penindakan..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
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

      {/* Structured Result Display (Section 29) */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Main Answer Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                  Ringkasan Warta &amp; Konteks Hukum
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                CONFIDENCE: {result.confidence}
              </span>
            </div>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
              {result.summary}
            </p>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Legal Status & Source Assessment */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Scale className="w-4 h-4" />
                <span>Status Proses Hukum &amp; Kredibilitas Sumber</span>
              </div>
              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div>Status Hukum Publik: <strong className="text-cyan-300">{result.legal_status}</strong></div>
                <p className="text-slate-400">{result.source_assessment}</p>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Entitas yang Disebut:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.entities?.map((ent, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                        {ent.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Correlations */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <TreePine className="w-4 h-4" />
                <span>Korelasi Lintas Sensor (Satelit &amp; Hotspot)</span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                {result.correlations?.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* 3. Uncertainties */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <HelpCircle className="w-4 h-4" />
                <span>Batasan Ketidakpastian Fakta</span>
              </div>
              <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px]">
                {result.uncertainties?.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>

            {/* 4. Verification Priority */}
            <div className="p-4 rounded-xl bg-slate-900 border border-purple-900/60 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Prioritas Pemantauan &amp; Tindak Lanjut</span>
              </div>
              <div className="space-y-1 text-purple-200 text-[11px]">
                <div>Prioritas: <strong>{result.verification_priority}</strong></div>
                <p className="text-slate-400">
                  Rekomendasi pengecekan silang dengan dokumen penatausahaan hasil hutan (SIPUHH) dan izin perhutanan sosial setempat.
                </p>
              </div>
            </div>
          </div>

          {/* Traceable IDs */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Evidence IDs: {result.evidence_ids?.join(', ') || 'N/A'}</span>
            <span>Source IDs: {result.source_ids?.join(', ') || 'N/A'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
