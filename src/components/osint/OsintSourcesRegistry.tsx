import React, { useState } from 'react';
import {
  Globe2,
  Server,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Plus,
  Play,
  RefreshCw,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  Code2,
} from 'lucide-react';
import { OsintSource, CollectorHarvestResult } from '../../types/osint';

interface OsintSourcesRegistryProps {
  sources: OsintSource[];
  onTriggerHarvest: () => Promise<CollectorHarvestResult | null>;
  onRegisterSource: (source: Partial<OsintSource>) => Promise<void>;
  harvesting: boolean;
}

export const OsintSourcesRegistry: React.FC<OsintSourcesRegistryProps> = ({
  sources,
  onTriggerHarvest,
  onRegisterSource,
  harvesting,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastHarvestResult, setLastHarvestResult] = useState<CollectorHarvestResult | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    source_name: '',
    provider: '',
    source_type: 'NEWS' as OsintSource['source_type'],
    base_url: '',
    rss_url: '',
    api_url: '',
    access_method: 'RSS',
    license: 'Data Terbuka Publik RI (UU 14/2008 KIP)',
    crawl_frequency: 'DAILY',
    reliability_score: 75,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleHarvestClick = async () => {
    const res = await onTriggerHarvest();
    if (res) {
      setLastHarvestResult(res);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.source_name || !formData.provider || !formData.base_url) {
      setFormError('Nama Sumber, Pengampu, dan URL Basis wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await onRegisterSource(formData);
      setShowAddModal(false);
      setFormData({
        source_name: '',
        provider: '',
        source_type: 'NEWS',
        base_url: '',
        rss_url: '',
        api_url: '',
        access_method: 'RSS',
        license: 'Data Terbuka Publik RI (UU 14/2008 KIP)',
        crawl_frequency: 'DAILY',
        reliability_score: 75,
        notes: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Gagal mendaftarkan sumber.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: OsintSource['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            AKTIF
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-medium">
            DEGRADED
          </span>
        );
      case 'ACCESS_RESTRICTED':
        return (
          <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-medium">
            ACCESS_RESTRICTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Harvest Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100">
              Registri Kolektor Web Publik Terbuka (Public Web Harvester)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mengatur crawler publik sopan (polite harvesting) berlandaskan robots.txt, pembatasan laju (rate limiting), dan audit hash SHA-256.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Tambah Sumber</span>
          </button>

          <button
            onClick={handleHarvestClick}
            disabled={harvesting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${harvesting ? 'animate-spin' : ''}`} />
            <span>{harvesting ? 'Memanen Data Publik...' : 'Jalankan Pemanenan'}</span>
          </button>
        </div>
      </div>

      {/* Harvest Feedback Banner */}
      {lastHarvestResult && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-slate-200 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Siklus Pemanenan OSINT Selesai ({lastHarvestResult.run_id})</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-[11px] pt-1">
            <span>Sumber Dipindai: {lastHarvestResult.total_sources_scanned}</span>
            <span>Ditemukan: {lastHarvestResult.items_discovered} item</span>
            <span className="text-emerald-300">Rekaman Baru: +{lastHarvestResult.records_ingested}</span>
            <span>Duplikat Dilewati: {lastHarvestResult.records_skipped_duplicate}</span>
          </div>
        </div>
      )}

      {/* Sources Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Nama Sumber Publik</th>
              <th className="py-3 px-4">Tipe / Kategori</th>
              <th className="py-3 px-4">Metode Akses</th>
              <th className="py-3 px-4">Robots.txt</th>
              <th className="py-3 px-4">Frekuensi</th>
              <th className="py-3 px-4">Skor Reliabilitas</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Tautan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sources.map((s) => (
              <tr key={s.source_id} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-100">{s.source_name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Pengampu: <span className="text-slate-300">{s.provider}</span>
                  </div>
                  <div className="font-mono text-[10px] text-cyan-400 mt-0.5">{s.source_id}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-medium">
                    {s.source_type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-cyan-300 text-[11px]">{s.access_method}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    s.robots_status === 'ALLOWED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : s.robots_status === 'DISALLOWED'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {s.robots_status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                  {s.crawl_frequency}
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-emerald-400">
                    {s.reliability_score.toFixed(1)}/100
                  </span>
                </td>
                <td className="py-3 px-4">{getStatusBadge(s.status)}</td>
                <td className="py-3 px-4 text-right">
                  <a
                    href={s.base_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <span>Kunjungi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Source */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Registrasi Sumber Data Publik Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nama Sumber Publik *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Portal Berita Pemprov Kalbar"
                  value={formData.source_name}
                  onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kustodian / Pengampu *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diskominfo Kalbar"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tipe Sumber</label>
                  <select
                    value={formData.source_type}
                    onChange={(e) => setFormData({ ...formData, source_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NEWS">NEWS (Berita Publik)</option>
                    <option value="GOVERNMENT_WEBSITE">GOVERNMENT_WEBSITE</option>
                    <option value="JDIH">JDIH (Produk Hukum)</option>
                    <option value="PUBLIC_DOCUMENT">PUBLIC_DOCUMENT</option>
                    <option value="ACADEMIC_PUBLICATION">ACADEMIC_PUBLICATION</option>
                    <option value="FORESTRY_PUBLICATION">FORESTRY_PUBLICATION</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL Basis *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">URL RSS/Feed (Opsional)</label>
                  <input
                    type="url"
                    placeholder="https://.../feed"
                    value={formData.rss_url}
                    onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Metode Akses</label>
                  <select
                    value={formData.access_method}
                    onChange={(e) => setFormData({ ...formData, access_method: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="RSS">RSS Feed</option>
                    <option value="HTML">HTML Scraper</option>
                    <option value="API">REST API</option>
                    <option value="SITEMAP">Sitemap XML</option>
                    <option value="DOCUMENT">File Document</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Memeriksa & Menyimpan...' : 'Daftarkan Sumber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
