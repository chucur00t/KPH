import React from 'react';
import { IntelligenceEvent } from '../../types/intelligence';
import { TaxonomyBadge } from './TaxonomyBadge';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Flame,
  TreePine,
  Layers,
  FileText,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';

interface EvidenceModalProps {
  event: IntelligenceEvent | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {event.eventCode}
              </span>
              <TaxonomyBadge stage={event.taxonomicStage} size="sm" />
              <span className="text-xs text-slate-400 font-mono">
                Confidence: <strong className="text-emerald-400">{event.confidenceScore}%</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Summary Box */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/60 leading-relaxed">
            <p className="font-medium text-slate-200">{event.summary}</p>
          </div>

          {/* Location & Context Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Lokasi Spasial Terverifikasi
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Unit Pengelola:</span>
                  <div className="font-semibold text-slate-200">{event.location.kphUnit}</div>
                </div>
                <div>
                  <span className="text-slate-400">Kecamatan / Desa:</span>
                  <div className="font-semibold text-slate-200">
                    {event.location.kecamatan}, {event.location.desa || 'Data tidak tersedia'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Koordinat:</span>
                  <div className="font-mono text-slate-200">
                    {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Fungsi Kawasan:</span>
                  <div className="font-semibold text-emerald-300">{event.location.forestZone}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Analisis Buffer & Kedekatan
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Jarak ke Sungai:</span>
                  <div className="font-semibold text-slate-200">
                    {event.location.distanceToNearestRiverMeters} meter
                    <span className="block text-[10px] text-slate-400">
                      ({event.location.nearestRiverName})
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Jarak ke Jalan:</span>
                  <div className="font-semibold text-slate-200">
                    {event.location.distanceToNearestRoadMeters} meter
                    <span className="block text-[10px] text-slate-400 truncate">
                      ({event.location.nearestRoadName})
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Kawasan Gambut (KHG):</span>
                  <div className="font-semibold text-slate-200">
                    {event.location.isPeatland ? (
                      <span className="text-amber-400">Ya ({event.location.peatHydrologyUnit})</span>
                    ) : (
                      'Bukan Kawasan Gambut'
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Estimasi Luas Anomali:</span>
                  <div className="font-semibold text-amber-300">
                    {event.areaHectares ? `${event.areaHectares} Hektar` : 'Data tidak tersedia'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Chain Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Rantai Bukti Data Publik (Evidence
                Chain)
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {event.evidenceChain.length} Bukti Terverifikasi
              </span>
            </h3>

            <div className="space-y-2.5">
              {event.evidenceChain.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono font-semibold text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{ev.sourceName}</span>
                      <TaxonomyBadge stage={ev.taxonomicStage} size="sm" showTooltip={false} />
                    </div>
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      <span>Buka Sumber</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Metrik Observasi:</span>
                      <div className="font-semibold text-slate-300">{ev.metricLabel}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Nilai Terukur:</span>
                      <div className="font-mono text-emerald-300">{ev.metricValue}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Waktu Tercatat:</span>
                      <div className="text-slate-300 font-mono">
                        {new Date(ev.recordedAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic bg-slate-900/80 p-2 rounded border border-slate-800/80">
                    "{ev.snippet}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Anti-Criminalization Notice */}
          <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Klausul Kepatuhan & Non-Kriminalisasi Otomatis:</strong>
              <p className="text-amber-300/90 leading-relaxed">{event.publicNotes}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-emerald-500" />
            <span>Audit Provenance: 100% Data Publik Terbuka & Terlacak</span>
          </div>
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
