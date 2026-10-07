import React, { useState } from 'react';
import {
  ForestryActivityIndicator,
  FalsePositiveStatus,
  FalsePositiveReason,
} from '../../types/forestryActivity';
import { formatDateWib } from '../../utils/formatters';
import {
  X,
  Scale,
  ShieldAlert,
  Flame,
  Globe2,
  TreePine,
  Layers,
  Calendar,
  ExternalLink,
  Compass,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  HelpCircle,
  Check,
} from 'lucide-react';

interface ForestryActivityDetailModalProps {
  indicator: ForestryActivityIndicator | null;
  onClose: () => void;
  onUpdateStatus?: (
    id: string,
    status: FalsePositiveStatus,
    reason: FalsePositiveReason,
    notes?: string
  ) => void;
}

export const ForestryActivityDetailModal: React.FC<ForestryActivityDetailModalProps> = ({
  indicator,
  onClose,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'spatial' | 'timeline' | 'review'>('overview');
  const [reviewStatus, setReviewStatus] = useState<FalsePositiveStatus>(indicator?.status || 'DETECTED');
  const [reviewReason, setReviewReason] = useState<FalsePositiveReason>(indicator?.falsePositiveReason || 'NONE');
  const [reviewNotes, setReviewNotes] = useState(indicator?.reviewNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!indicator) return null;

  const handleSaveReview = async () => {
    if (!onUpdateStatus) return;
    setIsSaving(true);
    try {
      await onUpdateStatus(indicator.indicatorId, reviewStatus, reviewReason, reviewNotes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'VERY_HIGH':
      case 'HIGH':
        return 'bg-red-950/80 text-red-400 border-red-800';
      case 'MODERATE':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getVerificationPriorityClass = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-purple-950 text-purple-300 border-purple-800 animate-pulse';
      case 'HIGH':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">
                {indicator.indicatorId}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                {indicator.indicatorType.replace(/_/g, ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadgeClass(indicator.priority)}`}>
                PRIORITAS: {indicator.priority}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getVerificationPriorityClass(indicator.verificationPriority)}`}>
                VERIFIKASI: {indicator.verificationPriority}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {indicator.title}
            </h2>
            <p className="text-xs text-slate-400">
              {indicator.kecamatan}, {indicator.desa} &bull; Koordinat Centroid: [{indicator.centroid.map((c) => c.toFixed(4)).join(', ')}]
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto text-xs font-semibold py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ikhtisar &amp; Penilaian
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'evidence'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rantai Bukti ({indicator.evidenceCount})
          </button>
          <button
            onClick={() => setActiveTab('spatial')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'spatial'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Konteks Spasial &amp; Izin
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linimasa Observasi
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'review'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit &amp; False Positive
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimasi Luasan</span>
                  <div className="text-base font-bold font-mono text-amber-400">
                    {indicator.areaHa.toFixed(1)} <span className="text-xs text-slate-400 font-normal">Ha</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Fungsi: {indicator.forestFunction}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Skor Aktivitas (0-100)</span>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {indicator.activityScore}
                  </div>
                  <div className="text-[10px] text-slate-400">Versi: {indicator.scoreVersion}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Kekuatan Bukti</span>
                  <div className="text-base font-bold text-cyan-400">
                    {indicator.evidenceStrength}
                  </div>
                  <div className="text-[10px] text-slate-400">{indicator.sourceCount} Sumber Publik</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Pola Temporal</span>
                  <div className="text-base font-bold text-indigo-400">
                    {indicator.temporalPattern}
                  </div>
                  <div className="text-[10px] text-slate-400">Deteksi: {formatDateWib(indicator.detectionDate).substring(0, 11)}</div>
                </div>
              </div>

              {/* Description & Taxonomy */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <TreePine className="w-4 h-4 text-emerald-400" />
                  <span>Deskripsi &amp; Subtipe Aktivitas</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {indicator.description}
                </p>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/60 flex items-center justify-between">
                  <span>Subtipe Taksonomi: <strong className="text-slate-200">{indicator.indicatorSubtype}</strong></span>
                  <span>Unit Pengelola: <strong className="text-slate-200">{indicator.kphUnit}</strong></span>
                </div>
              </div>

              {/* Dual Dimension: Activity vs Legal Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-cyan-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <Layers className="w-4 h-4" />
                    <span>Dimensi 1: Observasi Fisik Terukur</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li>Bukaan vegetasi: {indicator.areaHa} Ha di {indicator.forestFunction}</li>
                    <li>dNDVI Delta: {indicator.ndviDrop ? indicator.ndviDrop : 'N/A (analisis visual optik)'}</li>
                    <li>Jarak sungai terdekat: {indicator.distanceToRiverM} m</li>
                    <li>Jarak akses jalan: {indicator.distanceToRoadM} m</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-amber-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Scale className="w-4 h-4" />
                    <span>Dimensi 2: Status Legalitas Publik</span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-amber-200 uppercase">
                      {indicator.legalStatus.replace(/_/g, ' ')}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {indicator.legalStatusReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uncertainty & Data Gaps (Section 17) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Batasan Ketidakpastian &amp; Data Gaps</span>
                </div>
                <div className="space-y-1 text-slate-400 leading-relaxed text-[11px]">
                  <p>&bull; <strong>Ketidakpastian:</strong> Citra satelit membuktikan perubahan kanopi fisik, tetapi tidak dapat menentukan subjek pelaku, niat kesengajaan, atau status kepemilikan tanpa ground check lapangan resmi.</p>
                  <p>&bull; <strong>Data Gaps:</strong> Peta batas ulayat desa adat dan izin non-kehutanan lokal yang tidak terdaftar di geoportal kementerian belum tercakup dalam analisis ini.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  Daftar Bukti Publik Terverifikasi ({indicator.evidenceList?.length || 0} Bukti)
                </span>
                <span className="text-[11px] text-slate-400">
                  Setiap klaim terikat pada ID Sumber &amp; URL Publik Asli
                </span>
              </div>

              <div className="space-y-3">
                {indicator.evidenceList && indicator.evidenceList.length > 0 ? (
                  indicator.evidenceList.map((ev, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold">{ev.evidenceId}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                            {ev.evidenceType}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                            {ev.classification}
                          </span>
                        </div>
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline cursor-pointer"
                        >
                          <span>Buka Sumber</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <p className="text-slate-200 font-medium">{ev.description}</p>

                      {ev.sourceExcerpt && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                          &ldquo;{ev.sourceExcerpt}&rdquo;
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>Sumber: <strong className="text-slate-300">{ev.sourceId}</strong> ({ev.sourceRecordId})</span>
                        <span>Waktu Observasi: {formatDateWib(ev.sourceDate)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    Tidak ada catatan bukti yang terlampir.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SPATIAL CONTEXT & AUTHORIZATION */}
          {activeTab === 'spatial' && (
            <div className="space-y-4">
              {/* Public Authorization Context */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Konteks Perizinan / Konsesi Publik</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {indicator.authorizationStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {indicator.authorizationNotes}
                </p>

                {indicator.concessionName && (
                  <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-slate-300 border border-slate-800">
                    Konsesi Terdaftar: <strong>{indicator.concessionName}</strong>
                    {indicator.authorizationReference && (
                      <span className="block text-slate-400 font-mono text-[10px] mt-0.5">
                        Ref SK: {indicator.authorizationReference}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sensitive Areas Overlap */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Tumpang Tindih Kawasan Sensitif &amp; Lindung</span>
                </div>

                <div className="space-y-2">
                  {indicator.sensitiveAreaOverlaps && indicator.sensitiveAreaOverlaps.length > 0 ? (
                    indicator.sensitiveAreaOverlaps.map((overlap, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div>
                          <span className="font-semibold text-slate-200">{overlap.layerName}</span>
                          <span className="block text-[10px] text-slate-400">Tipe: {overlap.overlapType}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-amber-400 font-bold">{overlap.overlapAreaHa.toFixed(1)} Ha</span>
                          <span className="block text-[10px] text-slate-400">({overlap.overlapPercentage}%)</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">Tidak ada tumpang tindih kawasan lindung tercatat.</div>
                  )}
                </div>
              </div>

              {/* Distances */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Jarak Sempadan Sungai</span>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                    {indicator.distanceToRiverM} m
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Jarak Jalan Logistik</span>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">
                    {indicator.distanceToRoadM} m
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Jarak Batas Terluar Hutan</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {indicator.distanceToForestBoundaryM} m
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <span className="font-semibold text-slate-200">Linimasa Progresif Observasi</span>

              <div className="relative border-l-2 border-slate-800 ml-3 pl-4 space-y-4">
                <div className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-slate-600" />
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatDateWib(indicator.dateBefore)}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200">Baseline Observasi Citra Bebas Awan</h4>
                  <p className="text-slate-400 text-[11px]">
                    Kondisi kanopi sebelum anomali terdeteksi; NDVI acuan stabil tanpa indikasi gangguan.
                  </p>
                </div>

                {indicator.fireCorrelation && (
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-mono text-red-400">
                      {formatDateWib(indicator.detectionDate)}
                    </span>
                    <h4 className="text-xs font-bold text-red-300">Anomali Termal Panas Satelit VIIRS</h4>
                    <p className="text-slate-400 text-[11px]">
                      Sensor NASA FIRMS mendeteksi {indicator.hotspotsCount} titik anomali termal radiasi di area yang berdekatan.
                    </p>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-mono text-amber-400">
                    {formatDateWib(indicator.detectionDate)}
                  </span>
                  <h4 className="text-xs font-bold text-amber-200">Deteksi Perubahan Spektral Sentinel-2</h4>
                  <p className="text-slate-400 text-[11px]">
                    Penurunan vegetasi kanopi terhitung seluas {indicator.areaHa} Hektar di {indicator.forestFunction}.
                  </p>
                </div>

                {indicator.osintCorrelation && (
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-cyan-500" />
                    <span className="text-[10px] font-mono text-cyan-400">
                      Laporan Publik Terbit
                    </span>
                    <h4 className="text-xs font-bold text-cyan-200">{indicator.osintArticleHeadline}</h4>
                    <p className="text-slate-400 text-[11px]">
                      Pemberitaan media massa publik melaporkan adanya aktivitas di wilayah tersebut.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT & FALSE POSITIVE REVIEW */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">
                    Pengelolaan False Positive &amp; Catatan Verifikasi (Section 29)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Status Saat Ini: <strong>{indicator.status}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Status Verifikasi</label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as FalsePositiveStatus)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    >
                      <option value="DETECTED">DETECTED (Baru Terdeteksi)</option>
                      <option value="REVIEW_REQUIRED">REVIEW_REQUIRED (Butuh Kajian Lanjutan)</option>
                      <option value="SUPPORTED_BY_MULTIPLE_SOURCES">SUPPORTED_BY_MULTIPLE_SOURCES (Didukung Bukti Multi-Sensor)</option>
                      <option value="CONFIRMED_BY_PUBLIC_SOURCE">CONFIRMED_BY_PUBLIC_SOURCE (Dikonfirmasi Rilis Publik)</option>
                      <option value="DISMISSED">DISMISSED (Dibatalkan / False Positive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Penyebab False Positive (Jika Ada)</label>
                    <select
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value as FalsePositiveReason)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    >
                      <option value="NONE">NONE (Bukan False Positive)</option>
                      <option value="CLOUD_OR_HAZE_ARTIFACT">Artifak Awan / Kabut Asap Optik</option>
                      <option value="SEASONAL_AGRICULTURE_CYCLE">Siklus Rotasi Ladang Musiman Tradisional</option>
                      <option value="LEGAL_HARVESTING_AUTHORIZED">Pemanenan Berizin Resmi dalam RKT</option>
                      <option value="PLANTATION_MAINTENANCE">Pemeliharaan Rutin Areal Perkebunan</option>
                      <option value="NATURAL_DISTURBANCE_TREEFALL_FLOOD">Gangguan Alami (Banjir / Pohon Roboh)</option>
                      <option value="RIVER_BANK_EROSION_OR_MOVEMENT">Pergeseran / Erosi Alami Sempadan Sungai</option>
                      <option value="PERMITTED_INFRASTRUCTURE_WORK">Pembangunan Infrastruktur Berizin</option>
                      <option value="SENSOR_CALIBRATION_DIFFERENCE">Variasi Kalibrasi Sudut Sensor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Catatan Verifikator Lapangan</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Masukkan hasil penelaahan atau rekomendasi koordinasi ground patrol..."
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500">
                    ID Run Analisis: <code className="text-slate-400">{indicator.analysisRunId}</code>
                  </span>

                  <button
                    onClick={handleSaveReview}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersimpan!</span>
                      </>
                    ) : (
                      <>
                        <span>Simpan Status Audit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950/60">
          <span className="text-slate-500 font-mono text-[11px]">
            Diperbarui: {formatDateWib(indicator.updatedAt)}
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
