import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  TreePine,
  Flame,
  Globe2,
  ListTree,
  Database,
  History,
  FileSpreadsheet,
  Activity,
  ShieldAlert,
} from 'lucide-react';

export type NavTab =
  | 'executive'
  | 'map'
  | 'landchange'
  | 'fire'
  | 'osint'
  | 'events'
  | 'sources'
  | 'timeline'
  | 'reports'
  | 'health';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts: {
    hotspots: number;
    canopyLoss: number;
    events: number;
    osint: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, counts }) => {
  const NAV_ITEMS: Array<{
    id: NavTab;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'executive',
      label: 'Executive Dashboard',
      sublabel: 'Ringkasan & Peta Situasi',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      label: 'Intelligence Map',
      sublabel: 'GIS Viewer & Layer Analisis',
      icon: MapIcon,
      badge: 'GIS',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    },
    {
      id: 'landchange',
      label: 'Land Change',
      sublabel: 'Perubahan Tutupan & Buffer',
      icon: TreePine,
      badge: `${counts.canopyLoss} Ha`,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    },
    {
      id: 'fire',
      label: 'Fire Intelligence',
      sublabel: 'NASA FIRMS & Cuaca BMKG',
      icon: Flame,
      badge: counts.hotspots,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    },
    {
      id: 'osint',
      label: 'OSINT & Berita',
      sublabel: 'Media Publik & JDIH Sintang',
      icon: Globe2,
      badge: counts.osint,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
    },
    {
      id: 'events',
      label: 'Event Registry',
      sublabel: 'Direktori Bukti Berjenjang',
      icon: ListTree,
      badge: counts.events,
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
    },
    {
      id: 'timeline',
      label: 'Timeline Kronologis',
      sublabel: 'Rekam Jejak Spasio-Temporal',
      icon: History,
    },
    {
      id: 'sources',
      label: 'Data Sources & Provenance',
      sublabel: 'Audit Trail 100% Data Publik',
      icon: Database,
    },
    {
      id: 'reports',
      label: 'Executive Briefings',
      sublabel: 'Sintesis Grounded AI & PDF',
      icon: FileSpreadsheet,
    },
    {
      id: 'health',
      label: 'System Health',
      sublabel: 'Monitoring Ingestion & Kuota',
      icon: Activity,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
      {/* Target Area Identifier */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Wilayah Operasional
        </div>
        <div className="text-xs font-semibold text-slate-200">
          KPH SINTANG TIMUR
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
          <span>Kabupaten Sintang, Kalbar</span>
          <span className="font-mono text-emerald-400">2.16 M Ha</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/40 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.sublabel}</div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`ml-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Compliance Notice */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Prinsip Kepatuhan</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Hanya menggunakan data terbuka publik. Tanpa data internal KPH &amp; tanpa vonis hukum otomatis.
        </p>
      </div>
    </aside>
  );
};
