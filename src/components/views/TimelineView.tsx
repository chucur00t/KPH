import React, { useState } from 'react';
import { INTELLIGENCE_EVENTS, OSINT_RECORDS } from '../../data/publicDataset';
import { IntelligenceEvent } from '../../types/intelligence';
import { TaxonomyBadge } from '../common/TaxonomyBadge';
import {
  History,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Flame,
  TreePine,
  Globe2,
} from 'lucide-react';

interface TimelineViewProps {
  onSelectEvent: (event: IntelligenceEvent) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectEvent }) => {
  // Combine Events and OSINT entries into a chronological timeline
  const timelineItems = [
    {
      date: '2026-09-30 11:40 WIB',
      type: 'FIRE',
      title: 'Deteksi Hotspot Persisten VIIRS di HPT Serawai (EVT-STG-2026-0929-002)',
      desc: 'Satelit NOAA-21 mendeteksi titik panas lanjutan dengan suhu kecerahan 349.8 K di koridor rintisan jalan logistik.',
      badge: 'DETECTION',
      eventCode: 'EVT-STG-2026-0929-002',
    },
    {
      date: '2026-09-30 09:45 WIB',
      type: 'OSINT',
      title: 'Rilis Peringatan Terpadu BPBD Sintang di LKBN ANTARA Kalbar',
      desc: 'Imbauan siaga karhutla di perhuluan Sungai Melawi menyikapi curah hujan yang turun ke level 1.2 mm.',
      badge: 'REPORTED',
      link: 'https://kalbar.antaranews.com/',
    },
    {
      date: '2026-09-29 12:42 WIB',
      type: 'FIRE',
      title: 'Kluster Termal Radiasi Tinggi 44.2 MW di Hutan Lindung Ambalau (EVT-01)',
      desc: '3 titik hotspot beruntun di Desa Buntut Purun, berjarak 110 meter dari anak hulu Sungai Melawi.',
      badge: 'CORRELATION',
      eventCode: 'EVT-STG-2026-0929-001',
    },
    {
      date: '2026-09-28 21:15 WIB',
      type: 'LAND_CHANGE',
      title: 'Anomali Penurunan Kanopi 14.8 Ha Sentinel-2 L2A Ambalau',
      desc: 'Delta NDVI mencapai -0.41 pada perbandingan piksel 23 Sep vs 28 Sep 2026.',
      badge: 'DETECTION',
      eventCode: 'EVT-STG-2026-0929-001',
    },
    {
      date: '2026-09-27 15:30 WIB',
      type: 'OSINT',
      title: 'Surat Imbauan Bupati Sintang Kesiapsiagaan Karhutla 2026',
      desc: 'Surat resmi Bagian Prokopim Setda Sintang melarang pembakaran terbuka tanpa pengawasan.',
      badge: 'REPORTED',
      link: 'https://sintang.go.id/',
    },
    {
      date: '2026-09-25 15:00 WIB',
      type: 'LAND_CHANGE',
      title: 'Deteksi Awal Penurunan Vegetasi Landsat-8/9 di HP Kayan Hilir',
      desc: 'Delta NDVI -0.29 seluas 8.6 Ha di Desa Nanga Mau.',
      badge: 'DETECTION',
      eventCode: 'EVT-STG-2026-0930-004',
    }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">
            Timeline Kronologis Kejadian Spasio-Temporal
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Rekam jejak runut waktu pengamatan satelit, perubahan tutupan vegetasi, dan publikasi resmi terkait KPH Sintang Timur.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
        {timelineItems.map((item, idx) => {
          const correspondingEvent = item.eventCode
            ? INTELLIGENCE_EVENTS.find((e) => e.eventCode === item.eventCode)
            : null;

          return (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-emerald-400 group-hover:scale-125 transition-transform" />

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {item.date}
                    </span>
                    <TaxonomyBadge stage={item.badge as any} size="sm" />
                  </div>

                  {correspondingEvent && (
                    <button
                      onClick={() => onSelectEvent(correspondingEvent)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Rantai Bukti</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
