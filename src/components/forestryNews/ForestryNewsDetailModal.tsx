import React, { useState, useEffect } from 'react';
import {
  ForestryNewsRecord,
  ForestryNewsClaim,
  ForestryNewsEvent,
} from '../../types/forestryNews';
import { formatDateWib } from '../../utils/formatters';
import { ForestryNewsApiService } from '../../services/forestryNewsApiService';
import {
  X,
  ExternalLink,
  Scale,
  Newspaper,
  Layers,
  MapPin,
  Calendar,
  Flame,
  TreePine,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface ForestryNewsDetailModalProps {
  record: ForestryNewsRecord | null;
  event?: ForestryNewsEvent | null;
  onClose: () => void;
}

export const ForestryNewsDetailModal: React.FC<ForestryNewsDetailModalProps> = ({
  record,
  event,
  onClose,
}) => {
  const [claims, setClaims] = useState<ForestryNewsClaim[]>([]);
  const [correlations, setCorrelations] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setLoading(true);
      Promise.all([
        ForestryNewsApiService.getClaimsByRecordId(record.recordId),
        event ? fetch(`/api/forestry-monitoring/${event.eventId}/correlations`).then((r) => r.json()) : Promise.resolve(null),
      ])
        .then(([claimsData, corrData]) => {
          setClaims(claimsData);
          setCorrelations(corrData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [record, event]);

  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400">
                {record.recordId}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold uppercase">
                {record.contentType}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                RELEVANSI: {record.relevanceScore}%
              </span>
              {record.isSyndicatedCopy && (
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px]">
                  SINDIKASI BERITA
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {record.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Penerbit: <strong className="text-slate-200">{record.publisher}</strong></span>
              <span>Penulis: <strong>{record.author || 'Tim Redaksi'}</strong></span>
              <span>Terbit: <strong>{formatDateWib(record.publishedAt)}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Article Text Content */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Naskah Asli Warta Publik</span>
              </div>
              <a
                href={record.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                <span>Buka Tautan Sumber Asli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-line">
              {record.textContent}
            </p>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>SHA-256 Hash: {record.contentHash.substring(0, 24)}...</span>
              <span>Diambil: {formatDateWib(record.retrievedAt)}</span>
            </div>
          </div>

          {/* Exact Claims & Excerpts (Section 16 & 34) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Klaim &amp; Kutipan Langsung Sumber Terbuka ({claims.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Setiap klaim terikat kutipan persis dari teks sumber
              </span>
            </div>

            <div className="space-y-2.5">
              {claims.map((clm) => (
                <div key={clm.claimId} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {clm.claimType}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400">
                      Confidence: {clm.confidence}
                    </span>
                  </div>

                  <p className="text-slate-200 font-medium text-xs">{clm.claimText}</p>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic font-serif">
                    &ldquo;{clm.sourceExcerpt}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event & Correlations Details */}
          {event && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Attributes */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Konteks Hukum &amp; Entitas Terkait</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div>Status Hukum Publik: <strong className="text-amber-300">{event.legalStatus}</strong></div>
                  <p className="text-slate-400">{event.legalStatusReason}</p>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Entitas yang Terlibat dalam Rilis:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {event.entities.map((ent, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                          {ent.name} ({ent.type})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* GIS & Correlation Context */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Korelasi Spasial &amp; Sensor</span>
                </span>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div>Lokasi: <strong>{event.locationName}</strong> (Presisi: <code>{event.locationPrecision}</code>)</div>
                  {event.gisContext && (
                    <div>
                      Kawasan: {event.gisContext.forestFunction || 'APL'} &bull; Sempadan Sungai: {event.gisContext.distanceToRiverM ?? 0}m &bull; Akses Jalan: {event.gisContext.distanceToRoadM ?? 0}m
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Korelasi Satelit Sentinel-2: <strong>{event.satelliteCorrelated ? 'TERDETEKSI' : 'NIHIL'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span>Korelasi Hotspot Termal VIIRS: <strong>{event.fireCorrelated ? 'TERDETEKSI' : 'NIHIL'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uncertainty & Limitations (Section 28) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <HelpCircle className="w-4 h-4" />
              <span>Batasan Ketidakpastian &amp; Data Gaps</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Pemberitaan media massa memuat fakta awal yang disampaikan narasumber atau rilis instansi. KPH Intelligence tidak melakukan penyimpulan sepihak atas pihak yang belum terbukti secara peradilan berkekuatan hukum tetap. Laporan ini merupakan bahan awal (lead intelligence) untuk diverifikasi oleh tim pengawas kehutanan resmi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950/60">
          <span className="text-slate-500 font-mono text-[11px]">
            Publisher: {record.publisher} &bull; Prioritas Sumber: {record.sourcePriority}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
