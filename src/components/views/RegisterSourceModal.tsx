import React, { useState } from 'react';
import {
  SOURCE_CATEGORIES,
  ACCESS_METHODS,
  SOURCE_STATUSES,
  SourceCategory,
  SourceAccessMethod,
  SourceStatus,
  PublicSourceRecord,
} from '../../types/registry';
import { SourceValidationService } from '../../services/sourceValidationService';
import { RegistryService } from '../../services/registryService';
import {
  X,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  Globe,
  FileCode,
} from 'lucide-react';

interface RegisterSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSource: PublicSourceRecord) => void;
}

export const RegisterSourceModal: React.FC<RegisterSourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<PublicSourceRecord>>({
    source_id: '',
    source_name: '',
    provider: '',
    category: 'GIS',
    access_method: 'REST API',
    endpoint: '',
    documentation_url: '',
    license: 'Data Terbuka Pemerintah RI / Creative Commons',
    coverage: 'KPH Sintang Timur & Kabupaten Sintang, Kalimantan Barat',
    data_type: '',
    format: 'JSON',
    update_frequency: 'Harian',
    status: 'UNVERIFIED', // Default compliant status
    reliability: 'HIGH - Official Public Agency',
    attribution: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleChange = (
    field: keyof PublicSourceRecord,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValidatePreview = () => {
    const result = SourceValidationService.validate(formData);
    setErrors(result.errors);
    setWarnings(result.warnings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setWarnings([]);

    // Client-side rule verification
    const validation = SourceValidationService.validate(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      setWarnings(validation.warnings);
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      status: validation.suggestedStatus || formData.status,
    };

    const res = await RegistryService.registerSource(payload);
    setLoading(false);

    if (res.success && res.source) {
      onSuccess(res.source);
      onClose();
    } else {
      setErrors(res.errors || ['Gagal mendaftarkan sumber data']);
      if (res.warnings) setWarnings(res.warnings);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Daftarkan Sumber Data Publik Baru
              </h2>
              <p className="text-xs text-slate-400">
                Single Source of Truth - Integrasi resmi sumber data eksternal tanpa mengubah source code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hard Constraint Advisory */}
        <div className="p-3.5 bg-amber-950/30 border-b border-amber-500/30 px-6 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <strong className="font-semibold block">Prinsip Kepatuhan Data Publik:</strong>
            Dilarang menggunakan endpoint internal KPH/patroli tertutup atau endpoint fiktif. Jika endpoint belum diuji koneksinya, sistem otomatis menetapkan status <span className="font-mono font-bold text-cyan-300">UNVERIFIED</span>. Jika terdapat ketidakpastian hukum/teknis, tandai <span className="font-mono font-bold text-purple-300">REQUIRES REVIEW</span>.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Error & Warning Banners */}
          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Validasi Ditolak ({errors.length} masalah):
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200/90 pl-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Peringatan Kepatuhan:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source ID */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Source ID <span className="text-emerald-400 font-mono">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SRC-KLHK-SIPUHT-KALBAR"
                value={formData.source_id}
                onChange={(e) => handleChange('source_id', e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500">Huruf kapital, angka, dash (-) atau underscore (_)</span>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Provider / Instansi Penerbit <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ditjen PKTL Kementerian LHK RI"
                value={formData.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Source Name */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Nama Lengkap Sumber Data <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Geoportal SIPUHT - Peta Pembagian Fungsi Kawasan Hutan Kalimantan Barat"
                value={formData.source_name}
                onChange={(e) => handleChange('source_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Kategori Resmi (18 Kategori) <span className="text-emerald-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {SOURCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Access Method */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Metode Akses (12 Metode) <span className="text-emerald-400">*</span>
              </label>
              <select
                value={formData.access_method}
                onChange={(e) => handleChange('access_method', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {ACCESS_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Endpoint */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>URL Endpoint Publik <span className="text-emerald-400">*</span></span>
                <span className="text-[10px] text-slate-500 font-normal">Wajib URL publik asli (bukan localhost/dummy)</span>
              </label>
              <input
                type="url"
                placeholder="https://geoportal.menlhk.go.id/arcgis/rest/services/..."
                value={formData.endpoint}
                onChange={(e) => handleChange('endpoint', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Documentation URL */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                URL Dokumentasi / Spesifikasi Data Publik <span className="text-emerald-400">*</span>
              </label>
              <input
                type="url"
                placeholder="https://sigap.menlhk.go.id/tentang-data"
                value={formData.documentation_url}
                onChange={(e) => handleChange('documentation_url', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* License */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Lisensi / Dasar Keterbukaan <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Satu Data Indonesia / CC-BY 4.0 / PermenLHK P.28"
                value={formData.license}
                onChange={(e) => handleChange('license', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Status Data Source <span className="text-emerald-400">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {SOURCE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st} {st === 'UNVERIFIED' ? '(Disarankan untuk sumber baru)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Coverage */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cakupan Wilayah</label>
              <input
                type="text"
                value={formData.coverage}
                onChange={(e) => handleChange('coverage', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Update Frequency */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Frekuensi Pembaruan</label>
              <input
                type="text"
                placeholder="e.g. Harian / NRT (~3 jam) / Tiap 5 hari"
                value={formData.update_frequency}
                onChange={(e) => handleChange('update_frequency', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Data Type & Format */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipe Data Spasial/Spesifik</label>
              <input
                type="text"
                placeholder="e.g. Vector Polygons / Surface Reflectance"
                value={formData.data_type}
                onChange={(e) => handleChange('data_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Format Pertukaran</label>
              <input
                type="text"
                placeholder="e.g. GeoJSON / CSV / Shapefile / WMS"
                value={formData.format}
                onChange={(e) => handleChange('format', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Reliability */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tingkat Keandalan (Reliability)</label>
              <input
                type="text"
                placeholder="e.g. HIGH - Official State Forestry Cadastre"
                value={formData.reliability}
                onChange={(e) => handleChange('reliability', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Attribution */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Klausul Atribusi Resmi</label>
              <input
                type="text"
                placeholder="e.g. Ditjen PKTL KLHK RI / BPS Sintang"
                value={formData.attribution}
                onChange={(e) => handleChange('attribution', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Deskripsi Teknis Sumber Data <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Jelaskan karakteristik data, peruntukan analisis di KPH Sintang Timur, dan metode penarikan..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Catatan Operasional &amp; Batasan Teknis</label>
              <textarea
                rows={2}
                placeholder="Catatan limitasi rate limit, kebutuhan token gratis, atau aspek hukum yang perlu dicermati..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleValidatePreview}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Uji Validasi Form</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-colors flex items-center gap-2"
              >
                {loading ? 'Menyimpan...' : 'Daftarkan ke Registry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
