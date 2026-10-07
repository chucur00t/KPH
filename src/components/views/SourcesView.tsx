import React, { useState, useEffect } from 'react';
import {
  PublicSourceRecord,
  SourceProvenanceRecord,
  SourceCategory,
  SourceStatus,
  SourceAccessMethod,
  SOURCE_CATEGORIES,
  ACCESS_METHODS,
  SOURCE_STATUSES,
} from '../../types/registry';
import { RegistryService, RegistryStats } from '../../services/registryService';
import { RegisterSourceModal } from './RegisterSourceModal';
import { SourceDetailModal } from './SourceDetailModal';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Activity,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Clock,
  Radio,
  BookOpen,
  Info,
  Server,
  FileCode,
  ArrowUpDown,
  Lock,
} from 'lucide-react';

export const SourcesView: React.FC = () => {
  const [sources, setSources] = useState<PublicSourceRecord[]>([]);
  const [provenanceRecords, setProvenanceRecords] = useState<SourceProvenanceRecord[]>([]);
  const [stats, setStats] = useState<RegistryStats>({
    totalSources: 0,
    active: 0,
    degraded: 0,
    offline: 0,
    unverified: 0,
    requiresReview: 0,
    totalProvenanceRecords: 0,
    byCategory: {},
    byAccessMethod: {},
  });

  // Filters
  const [activeTab, setActiveTab] = useState<'sources' | 'provenance'>('sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAccessMethod, setSelectedAccessMethod] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modals & Inspection
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedSourceForDetail, setSelectedSourceForDetail] = useState<PublicSourceRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [probingSourceId, setProbingSourceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, selectedAccessMethod, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    const { sources: fetchedSources, stats: fetchedStats } = await RegistryService.getSources({
      category: selectedCategory as any,
      status: selectedStatus as any,
      access_method: selectedAccessMethod as any,
      search: searchQuery || undefined,
    });
    setSources(fetchedSources);
    setStats(fetchedStats);

    const prov = await RegistryService.getProvenanceRecords();
    setProvenanceRecords(prov);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRunHealthCheck = async (source: PublicSourceRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setProbingSourceId(source.source_id);
    const result = await RegistryService.runHealthCheck(source.source_id);
    setProbingSourceId(null);

    if (result.success && result.source) {
      setSources((prev) =>
        prev.map((s) => (s.source_id === result.source!.source_id ? result.source! : s))
      );
      showToast(
        `Health check sukses untuk ${source.source_id}: Status ${result.source.status} (${result.log?.latency_ms || 0}ms)`
      );
    } else {
      showToast(`Health check gagal: ${result.error || 'Server tidak merespons'}`);
    }
  };

  const handleOpenDetail = (source: PublicSourceRecord) => {
    setSelectedSourceForDetail(source);
    setIsDetailModalOpen(true);
  };

  const handleSourceRegistered = (newSource: PublicSourceRecord) => {
    setSources((prev) => [newSource, ...prev]);
    showToast(`Sumber data '${newSource.source_id}' berhasil didaftarkan ke registry resmi!`);
    loadData();
  };

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> ACTIVE
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <AlertTriangle className="w-3 h-3" /> UNVERIFIED
          </span>
        );
      case 'REQUIRES REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Lock className="w-3 h-3" /> REQUIRES REVIEW
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Activity className="w-3 h-3" /> DEGRADED
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" /> OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Subtitle */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Public Data Source Registry (Satu Sumber Kebenaran Data Publik)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Satu-satunya referensi resmi aplikasi terhadap sumber data eksternal untuk pemantauan KPH Sintang Timur &amp; Kabupaten Sintang. Mematuhi batasan mutlak: 100% data publik terverifikasi tanpa data internal maupun endpoint fiktif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all flex items-center gap-2 text-xs shadow-lg shadow-emerald-950"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Daftarkan Sumber Publik Baru</span>
          </button>
        </div>
      </div>

      {/* Hard Constraint Compliance Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="text-emerald-300 font-semibold block">
            Jaminan Integritas &amp; Audit Provenance (Zero Internal / Zero Fictitious Endpoint)
          </strong>
          <p className="text-slate-400 leading-relaxed">
            Setiap endpoint dalam katalog ini merupakan server publik riil yang terikat dengan dokumentasi resmi, klausul lisensi terbuka, dan jejak rekam audit penarikan data (<span className="text-cyan-300 font-mono">source_provenance</span>) dengan verifikasi hash SHA-256 anti-manipulasi.
          </p>
        </div>
      </div>

      {/* KPI Stats Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Total Sumber</span>
          <div className="text-xl font-bold font-mono text-slate-100">{stats.totalSources}</div>
          <span className="text-[10px] text-slate-500 block">Katalog Resmi</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-1">
          <span className="text-[11px] text-emerald-400 font-medium block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ACTIVE
          </span>
          <div className="text-xl font-bold font-mono text-emerald-300">{stats.active}</div>
          <span className="text-[10px] text-slate-500 block">Teruji &amp; Tersinkron</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-sky-500/20 space-y-1">
          <span className="text-[11px] text-sky-400 font-medium block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> UNVERIFIED
          </span>
          <div className="text-xl font-bold font-mono text-sky-300">{stats.unverified}</div>
          <span className="text-[10px] text-slate-500 block">Perlu Uji Koneksi</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/20 space-y-1">
          <span className="text-[11px] text-purple-400 font-medium block flex items-center gap-1">
            <Lock className="w-3 h-3" /> REQUIRES REVIEW
          </span>
          <div className="text-xl font-bold font-mono text-purple-300">{stats.requiresReview}</div>
          <span className="text-[10px] text-slate-500 block">Telaah Hukum/KIP</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/20 space-y-1">
          <span className="text-[11px] text-amber-400 font-medium block flex items-center gap-1">
            <Activity className="w-3 h-3" /> DEGRADED/OFFLINE
          </span>
          <div className="text-xl font-bold font-mono text-amber-300">
            {stats.degraded + stats.offline}
          </div>
          <span className="text-[10px] text-slate-500 block">Keterbatasan Akses</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/20 space-y-1">
          <span className="text-[11px] text-cyan-400 font-medium block flex items-center gap-1">
            <Fingerprint className="w-3 h-3" /> PROVENANCE
          </span>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {stats.totalProvenanceRecords}
          </div>
          <span className="text-[10px] text-slate-500 block">Audit Log Terikat</span>
        </div>
      </div>

      {/* Tabs & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'sources'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Katalog Sumber Data Resmi ({sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('provenance')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'provenance'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Jejak Provenance Record ({provenanceRecords.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari ID, nama, instansi, URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={loadData}
            title="Refresh Registry Data"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
          {/* Category Filter */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium mb-1 block">Kategori Resmi:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Kategori (18 Kategori)</option>
              {SOURCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium mb-1 block">Status Kepatuhan:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              {SOURCE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Access Method Filter */}
          <div>
            <label className="text-[11px] text-slate-400 font-medium mb-1 block">Metode Akses:</label>
            <select
              value={selectedAccessMethod}
              onChange={(e) => setSelectedAccessMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Metode Akses (12 Metode)</option>
              {ACCESS_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: SOURCES CATALOG */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          {sources.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <Info className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-slate-300 font-medium text-xs">
                Tidak ada sumber data publik yang cocok dengan filter yang dipilih.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedAccessMethod('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-emerald-400 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sources.map((source) => (
                <div
                  key={source.source_id}
                  onClick={() => handleOpenDetail(source)}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-3.5 shadow-sm hover:shadow-md"
                >
                  {/* Top Bar: ID, Category, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {source.source_id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {source.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {source.access_method}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 hover:text-emerald-400 transition-colors pt-0.5">
                        {source.source_name}
                      </h4>
                      <div className="text-xs text-slate-400">{source.provider}</div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {getStatusBadge(source.status)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {source.description}
                  </p>

                  {/* Spec Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Lisensi / Legalitas:</span>
                      <div className="font-medium text-slate-200 truncate">{source.license}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Frekuensi Pembaruan:</span>
                      <div className="font-medium text-slate-200">{source.update_frequency}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Cakupan Wilayah:</span>
                      <div className="font-medium text-slate-200 truncate">{source.coverage}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Sinkron Terakhir:</span>
                      <div className="font-mono text-slate-200 text-[11px]">
                        {source.last_successful_update
                          ? new Date(source.last_successful_update).toLocaleDateString('id-ID')
                          : 'Belum diverifikasi'}
                      </div>
                    </div>
                  </div>

                  {/* Endpoint & Quick Action Bar */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs flex items-center gap-1.5">
                      <span className="text-slate-500">Endpoint:</span>
                      <span className="truncate">{source.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleRunHealthCheck(source, e)}
                        disabled={probingSourceId === source.source_id}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 transition-colors text-xs flex items-center gap-1 border border-slate-700"
                        title="Uji keterjangkauan endpoint"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${probingSourceId === source.source_id ? 'animate-spin text-emerald-400' : ''}`}
                        />
                        <span>{probingSourceId === source.source_id ? 'Ping...' : 'Cek Ping'}</span>
                      </button>

                      <a
                        href={source.endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                        title="Buka Endpoint Publik"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROVENANCE AUDIT TRAIL */}
      {activeTab === 'provenance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-0">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                Catatan Rantai Bukti Provenance (Audit Trail Ingestion)
              </h3>
              <p className="text-[11px] text-slate-400">
                Setiap observasi satelit, deteksi perubahan, dan laporan OSINT tertaut secara deterministik ke record ini
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
              {provenanceRecords.length} Record Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-3 font-semibold">Provenance ID</th>
                  <th className="p-3 font-semibold">Source ID</th>
                  <th className="p-3 font-semibold">Record ID Asli (Provider)</th>
                  <th className="p-3 font-semibold">Waktu Penarikan (Retrieved)</th>
                  <th className="p-3 font-semibold">URL Sumber Asli</th>
                  <th className="p-3 font-semibold">Raw Reference (SHA-256)</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {provenanceRecords.map((p) => (
                  <tr key={p.provenance_id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                    <td className="p-3 font-bold text-cyan-400 whitespace-nowrap">
                      {p.provenance_id}
                    </td>
                    <td className="p-3 text-emerald-400 font-semibold whitespace-nowrap">
                      {p.source_id}
                    </td>
                    <td className="p-3 text-slate-200 truncate max-w-xs">{p.source_record_id}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {new Date(p.retrieved_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-slate-400 truncate max-w-xs">
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{p.source_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="p-3 text-slate-400 truncate max-w-xs font-mono">
                      {p.raw_reference}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {p.http_status || 200} OK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <RegisterSourceModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleSourceRegistered}
      />

      <SourceDetailModal
        source={selectedSourceForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSourceUpdated={(updated) => {
          setSources((prev) =>
            prev.map((s) => (s.source_id === updated.source_id ? updated : s))
          );
        }}
      />
    </div>
  );
};
