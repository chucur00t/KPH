import React, { useState, useEffect } from 'react';
import {
  ForestryActivityIndicator,
  ForestryActivitySummary,
  ForestryEnforcementEvent,
  FalsePositiveStatus,
  FalsePositiveReason,
} from '../types/forestryActivity';
import { ForestryActivityApiService } from '../services/forestryActivityApiService';
import { ForestryWarningBanner } from '../components/forestry/ForestryWarningBanner';
import { ForestryIndicatorList } from '../components/forestry/ForestryIndicatorList';
import { ForestrySituationRoom } from '../components/forestry/ForestrySituationRoom';
import { ForestryEnforcementFeed } from '../components/forestry/ForestryEnforcementFeed';
import { ForestryNlQueryConsole } from '../components/forestry/ForestryNlQueryConsole';
import { ForestryActivityDetailModal } from '../components/forestry/ForestryActivityDetailModal';
import {
  TreePine,
  ShieldAlert,
  Radio,
  Scale,
  Bot,
  RefreshCw,
  Layers,
  MapPin,
} from 'lucide-react';

interface ForestryActivityPageProps {
  onNavigateToMap?: () => void;
}

export const ForestryActivityPage: React.FC<ForestryActivityPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'indicators' | 'situation' | 'enforcement' | 'ask'>('situation');
  const [indicators, setIndicators] = useState<ForestryActivityIndicator[]>([]);
  const [summary, setSummary] = useState<ForestryActivitySummary | null>(null);
  const [enforcements, setEnforcements] = useState<ForestryEnforcementEvent[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<ForestryActivityIndicator | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [indData, sumData, enfData] = await Promise.all([
        ForestryActivityApiService.getIndicators(),
        ForestryActivityApiService.getSummary(),
        ForestryActivityApiService.getEnforcementEvents(),
      ]);
      setIndicators(indData);
      setSummary(sumData);
      setEnforcements(enfData);
    } catch (err) {
      console.error('Failed to load forestry activity data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: FalsePositiveStatus,
    reason: FalsePositiveReason,
    notes?: string
  ) => {
    const updated = await ForestryActivityApiService.updateReviewStatus(id, status, reason, notes);
    setIndicators((prev) => prev.map((i) => (i.indicatorId === id ? updated : i)));
    setSelectedIndicator(updated);
    // Reload summary counts
    const sum = await ForestryActivityApiService.getSummary();
    setSummary(sum);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* 1. Mandated Legal Warning Banner */}
      <ForestryWarningBanner />

      {/* 2. Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-slate-100">
              Intelijen Aktivitas &amp; Gangguan Kawasan Hutan (Fase 10)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sistem pemantauan indikator gangguan kawasan hutan, korelasi perizinan spasial terbuka, dan registri tindakan penegakan hukum publik.
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

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('situation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'situation'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Ruang Situasi KPH</span>
        </button>

        <button
          onClick={() => setActiveTab('indicators')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'indicators'
              ? 'bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Daftar Indikator Aktivitas ({indicators.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enforcement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'enforcement'
              ? 'bg-cyan-600 text-slate-950 font-bold shadow-md shadow-cyan-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Penegakan Hukum Publik ({enforcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ask')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'ask'
              ? 'bg-purple-600 text-slate-950 font-bold shadow-md shadow-purple-950/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Tanya Intelijen AI</span>
        </button>
      </div>

      {/* 4. Tab Views */}
      {activeTab === 'situation' && (
        <ForestrySituationRoom
          summary={summary}
          indicators={indicators}
          enforcements={enforcements}
          onSelectIndicator={setSelectedIndicator}
        />
      )}

      {activeTab === 'indicators' && (
        <ForestryIndicatorList
          indicators={indicators}
          onSelectIndicator={setSelectedIndicator}
        />
      )}

      {activeTab === 'enforcement' && (
        <ForestryEnforcementFeed enforcements={enforcements} />
      )}

      {activeTab === 'ask' && <ForestryNlQueryConsole />}

      {/* 5. Activity Detail Modal */}
      <ForestryActivityDetailModal
        indicator={selectedIndicator}
        onClose={() => setSelectedIndicator(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
