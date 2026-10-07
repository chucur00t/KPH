import React from 'react';
import { IntelligenceEvent } from '../../types';
import { TaxonomyBadge } from './TaxonomyBadge';
import { formatDateWib, formatCoords } from '../../utils/formatters';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Layers,
  AlertTriangle,
  Fingerprint,
  Tag,
  Link2,
  Compass,
} from 'lucide-react';

interface EventDetailModalProps {
  event: IntelligenceEvent | null;
  onClose: () => void;
  onSelectRelatedEvent?: (code: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onSelectRelatedEvent,
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {event.eventCode}
              </span>
              <TaxonomyBadge stage={event.taxonomicStage} size="sm" />
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Type: <strong>{event.eventType}</strong>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Confidence: <strong className="text-emerald-400">{event.confidenceScore}%</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Summary Box */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 leading-relaxed text-slate-200">
            {event.summary}
          </div>

          {/* Grid Metadata: Location, Geometry & Buffer Proximity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Location & Geometry */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Lokasi &amp; Geometri Terverifikasi
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Unit Pengelola:</span>
                  <div className="font-semibold text-slate-200">{event.location.kphUnit}</div>
                </div>
                <div>
                  <span className="text-slate-400">Kabupaten:</span>
                  <div className="font-semibold text-slate-200">{event.location.kabupaten}</div>
                </div>
                <div>
                  <span className="text-slate-400">Kecamatan &amp; Desa:</span>
                  <div className="font-semibold text-slate-200">
                    {event.location.kecamatan}, {event.location.desa || 'Data tidak tersedia'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Fungsi Kawasan:</span>
                  <div className="font-semibold text-emerald-300">{event.location.forestZone}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Koordinat (WGS 84):</span>
                  <div className="font-mono text-emerald-300 font-medium">
                    {formatCoords(event.location.latitude, event.location.longitude)}
                    <span className="text-slate-400 ml-2">
                      ({event.location.latitude.toFixed(6)}, {event.location.longitude.toFixed(6)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Proximity Buffers & Dates */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Analisis Kedekatan &amp; Waktu Deteksi
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Pertama Terdeteksi:</span>
                  <div className="font-mono text-slate-200">
                    {formatDateWib(event.firstDetectedAt)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Deteksi Terakhir:</span>
                  <div className="font-mono text-slate-200">
                    {formatDateWib(event.lastDetectedAt)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Jarak ke Sungai Terdekat:</span>
                  <div className="font-semibold text-cyan-300">
                    {event.location.distanceToNearestRiverMeters} meter
                    <span className="block text-[10px] text-slate-400 truncate">
                      ({event.location.nearestRiverName})
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Jarak ke Jalan Terdekat:</span>
                  <div className="font-semibold text-amber-300">
                    {event.location.distanceToNearestRoadMeters} meter
                    <span className="block text-[10px] text-slate-400 truncate">
                      ({event.location.nearestRoadName})
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Ekosistem Gambut (KHG):</span>
                  <div className="font-semibold text-slate-200">
                    {event.location.isPeatland ? (
                      <span className="text-purple-400">Ya ({event.location.peatHydrologyUnit})</span>
                    ) : (
                      'Bukan Ekosistem Gambut'
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Status Verifikasi:</span>
                  <div className="font-bold text-slate-200 uppercase font-mono text-[11px]">
                    {event.verificationStatus}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Chain Section (Source Traceability) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Rantai Bukti Data Publik (Evidence Chain &amp; Source Traceability)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {event.evidenceChain.length} Bukti Terverifikasi
              </span>
            </h3>

            <div className="space-y-2.5">
              {event.evidenceChain.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{ev.sourceName}</span>
                      <TaxonomyBadge stage={ev.taxonomicStage} size="sm" showTooltip={false} />
                    </div>

                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
                    >
                      <span>Buka Sumber Data Asli</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Metrik Observasi:</span>
                      <div className="font-semibold text-slate-300">{ev.metricLabel}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Nilai Terukur:</span>
                      <div className="font-mono text-emerald-300">{ev.metricValue}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Waktu Tercatat:</span>
                      <div className="text-slate-300 font-mono text-[11px]">
                        {formatDateWib(ev.recordedAt)}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                    "{ev.snippet}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Events */}
          {event.relatedEventCodes.length > 0 && (
            <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Related Events (Kejadian Terkorelasikan):
              </span>
              <div className="flex gap-2 flex-wrap">
                {event.relatedEventCodes.map((code) => (
                  <button
                    key={code}
                    onClick={() => onSelectRelatedEvent && onSelectRelatedEvent(code)}
                    className="font-mono text-xs px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 transition-colors cursor-pointer"
                  >
                    {code} &rarr;
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Anti-Criminalization Note */}
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-semibold">Klausul Kepatuhan &amp; Non-Kriminalisasi Otomatis:</strong>
              <p className="text-amber-300/90 leading-relaxed text-[11px]">{event.publicNotes}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-emerald-500" />
            <span>100% Data Publik Terbuka &amp; Terlacak (Schema Validated)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
