import React from 'react';
import {
  X,
  FileText,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Hash,
  Server,
  Building,
  MapPin,
  Scale,
  Package,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { OsintSourceRecord, OsintSnapshot, OsintEntity } from '../../types/osint';

interface OsintRecordModalProps {
  record: OsintSourceRecord | null;
  snapshot?: OsintSnapshot | null;
  entities?: OsintEntity[];
  onClose: () => void;
}

export const OsintRecordModal: React.FC<OsintRecordModalProps> = ({
  record,
  snapshot,
  entities = [],
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!record) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(record.content_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {record.record_id}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  HTTP {record.http_status} {record.retrieval_status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 line-clamp-1 mt-0.5">
                {record.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Penerbit Resmi / Media:</span>
              <span className="font-semibold text-slate-200">{record.publisher}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Penulis / Kontributor:</span>
              <span className="font-semibold text-slate-200">{record.author || 'Redaksi Publik'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tanggal Publikasi Terbuka:</span>
              <span className="font-mono text-slate-200">
                {record.published_at ? new Date(record.published_at).toLocaleString('id-ID') : 'Tidak dicantumkan'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Waktu Pengambilan Sistem:</span>
              <span className="font-mono text-slate-200">
                {new Date(record.retrieved_at).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Full Verbatim Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Teks Verbatim Sumber Publik
              </span>
              <a
                href={record.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <span>Buka URL Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-56 overflow-y-auto">
              "{record.text_content}"
            </div>
          </div>

          {/* Extracted Entities */}
          {entities.length > 0 && (
            <div>
              <span className="font-semibold text-slate-200 block mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Entitas Terdeteksi ({entities.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {entities.map((ent) => (
                  <div
                    key={ent.entity_id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    {ent.entity_type === 'LOCATION' && <MapPin className="w-3.5 h-3.5 text-emerald-400" />}
                    {ent.entity_type === 'AGENCY' && <Building className="w-3.5 h-3.5 text-blue-400" />}
                    {ent.entity_type === 'LEGAL_REGULATION' && <Scale className="w-3.5 h-3.5 text-amber-400" />}
                    {ent.entity_type === 'COMMODITY' && <Package className="w-3.5 h-3.5 text-purple-400" />}
                    <span className="font-medium">{ent.entity_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({ent.entity_type})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provenance & Cryptographic Audit */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Integritas Kriptografis &amp; Jejak Audit Provenance
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                100% Data Publik Terbuka
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  SHA-256 Content Hash:
                </span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {record.content_hash}
                  </code>
                  <button
                    onClick={copyHash}
                    className="p-1 hover:text-slate-100 text-slate-400 transition-colors"
                    title="Salin Hash"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Penyimpanan Snapshot Audit:</span>
                <code className="font-mono text-slate-300">{record.raw_reference}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-400">
          <span>KPH Intelligence — Sub-Modul D: OSINT &amp; Web Harvester</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
