import React, { useState, useEffect } from 'react';
import { PublicSourceRecord, SourceHealthLog, SourceProvenanceRecord } from '../../types/registry';
import { RegistryService } from '../../services/registryService';
import {
  X,
  Database,
  ExternalLink,
  ShieldCheck,
  Activity,
  Fingerprint,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface SourceDetailModalProps {
  source: PublicSourceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSourceUpdated?: (updated: PublicSourceRecord) => void;
}

export const SourceDetailModal: React.FC<SourceDetailModalProps> = ({
  source,
  isOpen,
  onClose,
  onSourceUpdated,
}) => {
  const [currentSource, setCurrentSource] = useState<PublicSourceRecord | null>(source);
  const [healthLogs, setHealthLogs] = useState<SourceHealthLog[]>([]);
  const [provenanceRecords, setProvenanceRecords] = useState<SourceProvenanceRecord[]>([]);
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{ latency?: number; error?: string; code?: number } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setCurrentSource(source);
    setProbeResult(null);
    if (source && isOpen) {
      loadDetail(source.source_id);
    }
  }, [source, isOpen]);

  const loadDetail = async (id: string) => {
    const detail = await RegistryService.getSourceDetail(id);
    if (detail.source) setCurrentSource(detail.source);
    setHealthLogs(detail.recentHealthLogs || []);

    const prov = await RegistryService.getProvenanceRecords({ source_id: id });
    setProvenanceRecords(prov);
  };

  if (!isOpen || !currentSource) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleProbe = async () => {
    setProbing(true);
    setProbeResult(null);
    const res = await RegistryService.runHealthCheck(currentSource.source_id);
    setProbing(false);

    if (res.success && res.source) {
      setCurrentSource(res.source);
      if (onSourceUpdated) onSourceUpdated(res.source);
      if (res.log) {
        setHealthLogs((prev) => [res.log!, ...prev.slice(0, 9)]);
        setProbeResult({
          latency: res.log.latency_ms,
          code: res.log.http_status_code,
          error: res.log.error_message,
        });
      }
    } else {
      setProbeResult({ error: res.error || 'Health check gagal' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE (Aktif &amp; Terverifikasi)
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> UNVERIFIED (Belum Terverifikasi)
          </span>
        );
      case 'REQUIRES REVIEW':
        return (
          <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" /> REQUIRES REVIEW (Kajian KIP/Hukum)
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5" /> DEGRADED (Terbatas / Latensi Tinggi)
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1.5 text-xs">
            <X className="w-3.5 h-3.5" /> OFFLINE (Tidak Terjangkau)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {currentSource.source_id}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentSource.category}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {currentSource.access_method}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100">{currentSource.source_name}</h2>
            <div className="text-xs text-slate-400">{currentSource.provider}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status & Live Probe Bar */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>{getStatusBadge(currentSource.status)}</div>
              <div className="text-[11px] text-slate-400">
                Update Terakhir:{' '}
                <span className="font-mono text-slate-200">
                  {currentSource.last_successful_update
                    ? new Date(currentSource.last_successful_update).toLocaleString('id-ID')
                    : 'Belum pernah tersinkronisasi'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleProbe}
                disabled={probing}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-colors flex items-center gap-1.5 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
                <span>{probing ? 'Menguji Endpoint...' : 'Uji Sambungan (Health Check)'}</span>
              </button>
            </div>
          </div>

          {/* Probe Result notification */}
          {probeResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                probeResult.error
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {probeResult.error ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {probeResult.error
                    ? `Hasil Pengujian: ${probeResult.error}`
                    : `Endpoint terjangkau secara sukses (HTTP ${probeResult.code || 200})`}
                </span>
              </div>
              {probeResult.latency !== undefined && (
                <span className="font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  Latensi: {probeResult.latency} ms
                </span>
              )}
            </div>
          )}

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Description */}
            <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                Deskripsi Teknis
              </span>
              <p className="text-slate-200 leading-relaxed">{currentSource.description}</p>
            </div>

            {/* Endpoint */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  Endpoint Publik
                </span>
                <button
                  onClick={() => handleCopy(currentSource.endpoint, 'endpoint')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                  title="Salin URL"
                >
                  {copied === 'endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="font-mono text-slate-200 text-[11px] break-all bg-slate-900 p-2 rounded border border-slate-800">
                {currentSource.endpoint}
              </div>
              <a
                href={currentSource.endpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] pt-1"
              >
                <span>Buka Endpoint di Tab Baru</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Documentation URL */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  Dokumentasi Resmi
                </span>
                <button
                  onClick={() => handleCopy(currentSource.documentation_url, 'doc')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                  title="Salin URL"
                >
                  {copied === 'doc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="font-mono text-slate-200 text-[11px] break-all bg-slate-900 p-2 rounded border border-slate-800">
                {currentSource.documentation_url}
              </div>
              <a
                href={currentSource.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] pt-1"
              >
                <span>Buka Spesifikasi Dokumentasi</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-slate-400 text-[11px]">Klausul Lisensi:</span>
                <div className="font-semibold text-slate-200">{currentSource.license}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Cakupan Spasial / Wilayah:</span>
                <div className="font-medium text-slate-200">{currentSource.coverage}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Tipe Data &amp; Format:</span>
                <div className="font-medium text-slate-200">
                  {currentSource.data_type} ({currentSource.format})
                </div>
              </div>
            </div>

            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-slate-400 text-[11px]">Frekuensi Pembaruan:</span>
                <div className="font-medium text-slate-200">{currentSource.update_frequency}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Tingkat Keandalan (Reliability):</span>
                <div className="font-medium text-slate-200">{currentSource.reliability}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Teks Atribusi Wajib:</span>
                <div className="font-medium text-slate-200">{currentSource.attribution}</div>
              </div>
            </div>

            {/* Operational Notes */}
            {currentSource.notes && (
              <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                  Catatan Operasional &amp; Batasan Teknis
                </span>
                <p className="text-slate-300 leading-relaxed">{currentSource.notes}</p>
              </div>
            )}
          </div>

          {/* Traceable Provenance Ingestions for this Source */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                Jejak Provenance Record Terkait ({provenanceRecords.length} Catatan)
              </h3>
            </div>

            {provenanceRecords.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-400 text-xs">
                Belum ada rekam jejak ingest data untuk sumber ini.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-2.5 font-semibold">Provenance ID</th>
                        <th className="p-2.5 font-semibold">Record ID Asli</th>
                        <th className="p-2.5 font-semibold">Waktu Penarikan</th>
                        <th className="p-2.5 font-semibold">Checksum SHA-256</th>
                        <th className="p-2.5 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {provenanceRecords.map((p) => (
                        <tr key={p.provenance_id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                          <td className="p-2.5 font-bold text-cyan-400">{p.provenance_id}</td>
                          <td className="p-2.5 text-slate-300 truncate max-w-xs">{p.source_record_id}</td>
                          <td className="p-2.5 text-slate-400">{new Date(p.retrieved_at).toLocaleString('id-ID')}</td>
                          <td className="p-2.5 text-slate-400 truncate max-w-xs">{p.raw_reference}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
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
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
