import React from 'react';
import { OSINT_RECORDS } from '../../data/publicDataset';
import { TaxonomyBadge } from '../common/TaxonomyBadge';
import {
  Globe2,
  ExternalLink,
  BookOpen,
  Calendar,
  Tag,
  MapPin,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const OsintView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Modul D: OSINT &amp; Keterbukaan Informasi Publik
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pengumpulan data informasi publik dari situs resmi pemerintah daerah (Pemkab Sintang), LKBN ANTARA Biro Kalbar, dan Jaringan Dokumentasi &amp; Informasi Hukum (JDIH).
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Media Publik Resmi &amp; Terbuka</span>
        </div>
      </div>

      {/* OSINT Records List */}
      <div className="space-y-4">
        {OSINT_RECORDS.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            {/* Top Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {item.sourceName}
                </span>
                <TaxonomyBadge stage={item.taxonomicStage} size="sm" />
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.publishedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
              >
                <span>Tautan Sumber Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Title & Author */}
            <div>
              <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
              <div className="text-xs text-slate-400 mt-0.5">
                Penerbit/Instansi: <span className="text-slate-300">{item.authorOrAgency}</span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              "{item.fullExcerpt}"
            </p>

            {/* Extracted Locations & Topics */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Entitas Lokasi Teridentifikasi:
                </span>
                {item.extractedLocations.map((loc, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium"
                  >
                    {loc}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3 h-3 text-slate-400" />
                {item.topics.map((t, i) => (
                  <span key={i} className="text-[11px] text-slate-400 font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Correlation Links */}
            {item.correlatedEventCodes.length > 0 && (
              <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 flex items-center gap-2 text-xs">
                <span className="text-purple-300 font-medium">Terkorelasi Spasial ke Event:</span>
                {item.correlatedEventCodes.map((code) => (
                  <span
                    key={code}
                    className="font-mono text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-500/40"
                  >
                    {code}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
