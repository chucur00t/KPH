import React, { useState, useEffect } from 'react';
import { ForestryNewsApiService } from '../../services/forestryNewsApiService';
import { Settings, Plus, X, Check, Globe2, Tag } from 'lucide-react';

export const ForestryNewsKeywordConfig: React.FC = () => {
  const [keywords, setKeywords] = useState<Record<string, string[]>>({});
  const [monitoringArea, setMonitoringArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Forestry');
  const [newKeyword, setNewKeyword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    ForestryNewsApiService.getKeywords().then((data) => {
      setKeywords(data.keywords || {});
      setMonitoringArea(data.monitoringArea || 'Kabupaten Sintang & KPH Sintang Timur');
    });
  }, []);

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const currentList = keywords[selectedCategory] || [];
    if (!currentList.includes(newKeyword.trim())) {
      const updated = {
        ...keywords,
        [selectedCategory]: [...currentList, newKeyword.trim()],
      };
      setKeywords(updated);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (cat: string, kw: string) => {
    const updated = {
      ...keywords,
      [cat]: (keywords[cat] || []).filter((k) => k !== kw),
    };
    setKeywords(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await ForestryNewsApiService.updateKeywords(selectedCategory, keywords[selectedCategory] || []);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span>Konfigurasi Kata Kunci &amp; Wilayah Pemantauan (Section 3, 6, &amp; 7)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Sesuaikan profil kata kunci query warta publik dan ubah target pemantauan wilayah secara dinamis (KPH, Kecamatan, Kabupaten, atau Provinsi).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monitoring Area Config */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>Target Wilayah Pemantauan (Section 3)</span>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Cakupan Wilayah Aktif</label>
            <input
              type="text"
              value={monitoringArea}
              onChange={(e) => setMonitoringArea(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Secara baku sistem mengarahkan kolektor ke <strong>Kabupaten Sintang</strong> dan <strong>KPH Sintang Timur</strong>. Pengguna dapat mengubah ke tingkat kecamatan (Ambalau, Serawai, Kayan, Ketungau) atau provinsi (Kalimantan Barat).
          </p>
        </div>

        {/* Right Column: Keyword Groups */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Tag className="w-4 h-4 text-cyan-400" />
              <span>Grup Kata Kunci Pemantauan Warta (Section 6)</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="Forestry">Kehutanan (Forestry)</option>
              <option value="LandClearing">Pembukaan Lahan (Land Clearing)</option>
              <option value="Mining">Pertambangan (Mining / PETI)</option>
              <option value="Plantation">Perkebunan (Plantation)</option>
              <option value="Fire">Kebakaran Hutan (Fire)</option>
              <option value="Enforcement">Penegakan Hukum (Enforcement)</option>
            </select>
          </div>

          {/* Add Keyword Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Tambah kata kunci baru untuk kategori ${selectedCategory}...`}
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleAddKeyword}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          {/* Keywords List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(keywords[selectedCategory] || []).map((kw, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                <span>{kw}</span>
                <button
                  onClick={() => handleRemoveKeyword(selectedCategory, kw)}
                  className="text-slate-500 hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-500">
              Total {(keywords[selectedCategory] || []).length} kata kunci terdaftar dalam grup ini
            </span>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Konfigurasi Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Konfigurasi</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
