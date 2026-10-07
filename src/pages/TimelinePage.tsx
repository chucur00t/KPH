import React from 'react';
import { useIntelligence } from '../hooks/useIntelligence';
import { IntelligenceEvent } from '../types';
import { TaxonomyBadge } from '../components/common/TaxonomyBadge';
import { MockNoticeBadge } from '../components/common/MockNoticeBadge';
import {
  History,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface TimelinePageProps {
  onSelectEvent: (event: IntelligenceEvent) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ onSelectEvent }) => {
  const { events } = useIntelligence();

  const timelineItems = [
    {
      date: '30 Sep 2026, 11:40 WIB',
      type: 'FIRE',
      title: 'Deteksi Hotspot Persisten VIIRS di HPT Serawai (EVT-MOCK-2026-002)',
      desc: 'Satelit NOAA-21 mendeteksi titik panas lanjutan dengan suhu kecerahan 349.8 K di koridor rintisan jalan logistik.',
      badge: 'DETECTION',
      eventCode: 'EVT-MOCK-2026-002',
    },
    {
      date: '30 Sep 2026, 09:45 WIB',
      type: 'OSINT',
      title: 'Rilis Peringatan Terpadu BPBD Sintang di LKBN ANTARA Kalbar',
      desc: 'Imbauan siaga karhutla di perhuluan Sungai Melawi menyikapi curah hujan yang turun ke level 1.2 mm.',
      badge: 'REPORTED',
      link: 'https://kalbar.antaranews.com/',
    },
    {
      date: '29 Sep 2026, 12:42 WIB',
      type: 'FIRE',
      title: 'Kluster Termal Radiasi Tinggi 44.2 MW di Hutan Lindung Ambalau (EVT-MOCK-001)',
      desc: '3 titik hotspot beruntun di Desa Buntut Purun, berjarak 110 meter dari anak hulu Sungai Melawi.',
      badge: 'CORRELATION',
      eventCode: 'EVT-MOCK-2026-001',
    },
    {
      date: '28 Sep 2026, 21:15 WIB',
      type: 'LAND_CHANGE',
      title: 'Anomali Penurunan Kanopi 14.8 Ha Sentinel-2 L2A Ambalau',
      desc: 'Delta NDVI mencapai -0.41 pada perbandingan piksel 23 Sep vs 28 Sep 2026.',
      badge: 'DETECTION',
      eventCode: 'EVT-MOCK-2026-001',
    },
    {
      date: '27 Sep 2026, 15:30 WIB',
      type: 'OSINT',
      title: 'Surat Imbauan Bupati Sintang Kesiapsiagaan Karhutla 2026',
      desc: 'Surat resmi Bagian Prokopim Setda Sintang melarang pembakaran terbuka tanpa pengawasan.',
      badge: 'REPORTED',
      link: 'https://sintang.go.id/',
    },
    {
      date: '25 Sep 2026, 15:00 WIB',
      type: 'LAND_CHANGE',
      title: 'Deteksi Awal Penurunan Vegetasi Landsat-8/9 di HP Kayan Hilir',
      desc: 'Delta NDVI -0.29 seluas 8.6 Ha di Desa Nanga Mau.',
      badge: 'DETECTION',
      eventCode: 'EVT-MOCK-2026-004',
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <MockNoticeBadge />

      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">
            Timeline Kronologis Kejadian Spasio-Temporal
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Urutan waktu pengamatan sensor satelit publik, deteksi anomali vegetasi, dan publikasi resmi terkait KPH Sintang Timur.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
        {timelineItems.map((item, idx) => {
          const correspondingEvent = item.eventCode
            ? events.find((e) => e.eventCode === item.eventCode)
            : null;

          return (
            <div key={idx} className="relative group">
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
