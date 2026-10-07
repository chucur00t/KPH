import React, { useEffect, useState } from 'react';
import {
  Cpu,
  FileCode,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Database,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { AiModelConfig, AiPromptConfig, DataQualityReport } from '../../types/intelligenceEngine';
import { IntelligenceApiService } from '../../services/intelligenceApiService';

export const AiModelAuditPanel: React.FC = () => {
  const [models, setModels] = useState<AiModelConfig[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [prompts, setPrompts] = useState<AiPromptConfig[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const [modelData, promptData, dqData] = await Promise.all([
        IntelligenceApiService.getModelConfigs(),
        IntelligenceApiService.getPromptConfigs(),
        IntelligenceApiService.getDataQuality(),
      ]);
      setModels(modelData.models);
      setUsage(modelData.usage);
      setPrompts(promptData);
      setDataQuality(dqData);
    } catch (err) {
      console.error('Audit data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Cost & Usage Monitoring (Section 47) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Permintaan Hari Ini</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {usage?.requests_today || 0}
          </div>
          <p className="text-[11px] text-slate-400">Panggilan Model Gemini</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Token Hari Ini</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400">
            {(usage?.tokens_today || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Input &amp; Output Tokens</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimasi Biaya Hari Ini</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            ${usage?.estimated_cost_usd?.toFixed(4) || '0.0000'}
          </div>
          <p className="text-[11px] text-slate-400">Tier Gratis / Pay-as-you-go</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Skor Kualitas Data</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {dataQuality?.completeness_score_percent || 90}%
          </div>
          <p className="text-[11px] text-slate-400">Status: {dataQuality?.overall_quality || 'GOOD'}</p>
        </div>
      </div>

      {/* 2. Model Registry (Section 44) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Registri Model AI Terdaftar (Model Registry)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Prioritas: gemini-3.8-flash via @google/genai</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Model ID / Nama</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Kegunaan (Purpose)</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3">Max Tokens</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {models.map((m) => (
                <tr key={m.model_id}>
                  <td className="py-2.5 px-3 text-slate-100 font-bold">{m.model_name}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">{m.provider}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-sans">{m.purpose}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.temperature}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.max_tokens}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                      AKTIF
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Prompt Registry (Section 45) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Registri Instruksi Sistem &amp; Prompt (Prompt Registry)
          </h3>
        </div>

        <div className="space-y-3">
          {prompts.map((p) => (
            <div key={p.prompt_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-cyan-300">{p.prompt_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {p.prompt_version}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{p.purpose}</span>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900/90 text-slate-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40 border border-slate-800/80">
                {p.prompt_text}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Data Quality & Gap Analysis (Sections 50, 51) */}
      {dataQuality && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Audit Kualitas Data &amp; Kesenjangan Informasi (Data Gap Analysis)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Terakhir diaudit: {new Date(dataQuality.audited_at).toLocaleDateString('id-ID')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Kesenjangan Data Publik Teridentifikasi:</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {dataQuality.data_gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block">Rekomendasi Pembenahan Sistem:</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {dataQuality.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
