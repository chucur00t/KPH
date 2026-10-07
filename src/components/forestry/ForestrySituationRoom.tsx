import React from 'react';
import {
  ForestryActivitySummary,
  ForestryActivityIndicator,
  ForestryEnforcementEvent,
} from '../../types/forestryActivity';
import {
  ShieldAlert,
  Flame,
  Radio,
  Clock,
  Compass,
  AlertTriangle,
  Scale,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { formatDateWib } from '../../utils/formatters';

interface ForestrySituationRoomProps {
  summary: ForestryActivitySummary | null;
  indicators: ForestryActivityIndicator[];
  enforcements: ForestryEnforcementEvent[];
  onSelectIndicator: (indicator: ForestryActivityIndicator) => void;
}

export const ForestrySituationRoom: React.FC<ForestrySituationRoomProps> = ({
  summary,
  indicators,
  enforcements,
  onSelectIndicator,
}) => {
  const urgentIndicators = indicators.filter(
    (i) => i.verificationPriority === 'URGENT' || i.priority === 'HIGH'
  );

  return (
    <div className="space-y-6">
      {/* 1. Top Executive KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Indikator Aktif</span>
          <div className="text-2xl font-black font-mono text-slate-100">
            {summary?.activeIndicators ?? indicators.length}
          </div>
          <div className="text-[10px] text-slate-400">
            Luas Indikatif: <strong>{summary?.totalDisturbanceAreaHa ?? 65.6} Ha</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-purple-900/50 space-y-1">
          <span className="text-[11px] text-purple-300 uppercase font-semibold">Verifikasi Mendesak</span>
          <div className="text-2xl font-black font-mono text-purple-400">
            {summary?.urgentVerificationCount ?? urgentIndicators.length}
          </div>
          <div className="text-[10px] text-purple-300/80">Kawasan Lindung &amp; Multi-Sensor</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-red-900/40 space-y-1">
          <span className="text-[11px] text-red-300 uppercase font-semibold">Korelasi Api + Tutupan</span>
          <div className="text-2xl font-black font-mono text-red-400">
            {summary?.correlationsCount.withFire ?? 2}
          </div>
          <div className="text-[10px] text-red-300/80">Spatiotemporal DBSCAN</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-900/40 space-y-1">
          <span className="text-[11px] text-cyan-300 uppercase font-semibold">Rilis Penegakan Hukum Publik</span>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {enforcements.length}
          </div>
          <div className="text-[10px] text-cyan-300/80">Gakkum KLHK &amp; Kepolisian</div>
        </div>
      </div>

      {/* 2. Situation Highlights & Spatial Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recommended Verification Priorities (Section 23 & 24) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Rekomendasi Prioritas Verifikasi Lapangan (Patrol Ground Check)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Bukan Perintah Penindakan Operasional
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Daftar lokasi yang direkomendasikan untuk pemeriksaan keabsahan faktual lapangan oleh tim patroli terpadu berdasarkan bobot sensitivitas kawasan lindung dan konfirmasi multi-sumber:
            </p>

            <div className="space-y-3">
              {urgentIndicators.map((ind) => (
                <div
                  key={ind.indicatorId}
                  onClick={() => onSelectIndicator(ind)}
                  className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">
                        {ind.indicatorId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {ind.verificationPriority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {ind.forestFunction} &bull; {ind.kecamatan}
                      </span>
                    </div>

                    <span className="font-mono text-emerald-400 text-xs font-bold">
                      Skor: {ind.activityScore}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200">
                    {ind.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Luas: <strong>{ind.areaHa} Ha</strong></span>
                    <span>Sempadan Sungai: <strong>{ind.distanceToRiverM} m</strong></span>
                    <span>Status Izin: <strong className="text-amber-300">{ind.authorizationStatus}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spatial Hotspots Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Kluster Spasial Menurut Fungsi Kawasan Hutan
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Hutan Lindung (HL)</span>
                <div className="text-base font-bold text-red-400 mt-1">1 Indikator</div>
                <span className="text-[10px] text-slate-500">14.8 Ha di Ambalau</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">HPT (Terbatas)</span>
                <div className="text-base font-bold text-amber-400 mt-1">1 Indikator</div>
                <span className="text-[10px] text-slate-500">22.4 Ha di Serawai</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Hutan Produksi (HP)</span>
                <div className="text-base font-bold text-blue-400 mt-1">2 Indikator</div>
                <span className="text-[10px] text-slate-500">Kayan Hilir &amp; Dedai</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">APL Gambut</span>
                <div className="text-base font-bold text-emerald-400 mt-1">1 Indikator</div>
                <span className="text-[10px] text-slate-500">18.2 Ha di Belitang</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Public Enforcement & Data Gaps */}
        <div className="space-y-4">
          {/* Public Enforcement Feed */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Penegakan Hukum Publik Terkini
              </h3>
            </div>

            <div className="space-y-3">
              {enforcements.map((enf) => (
                <div key={enf.enforcementEventId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                      {enf.eventType}
                    </span>
                    <span className="text-slate-400">{enf.eventDate}</span>
                  </div>

                  <h5 className="font-bold text-slate-200">{enf.activityType}</h5>
                  <p className="text-[11px] text-slate-400 leading-snug">{enf.description}</p>

                  <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Instansi: <strong>{enf.agency}</strong></span>
                    <a
                      href={enf.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Sumber</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uncertainty & Data Limitations Notice */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Transparansi Keterbatasan Data</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Analisis ini mengandalkan ketersediaan sensor data satelit publik (Sentinel-2 dan VIIRS). Pada musim hujan dengan tutupan awan tebal di perhuluan Sintang, pengamatan optik dapat mengalami jeda (data gap). Seluruh hasil analisis harus dipandang sebagai bahan intelijen indikatif.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
