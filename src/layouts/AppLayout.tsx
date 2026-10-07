import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { MockNoticeBadge } from '../components/common/MockNoticeBadge';
import {
  LayoutDashboard,
  Map as MapIcon,
  TreePine,
  Flame,
  Globe2,
  ListTree,
  History,
  Database,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Newspaper,
  Bell,
  Clock,
  CloudSun,
  Menu,
  X,
  Compass,
} from 'lucide-react';

interface AppLayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  activeAlertsCount: number;
  temperatureC?: number;
  rainfallMm?: number;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  activeAlertsCount,
  temperatureC = 32.4,
  rainfallMm = 1.2,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTimeWib, setCurrentTimeWib] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeWib(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Pontianak',
        }) + ' WIB'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const NAV_ITEMS: Array<{
    id: PageId;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'executive',
      label: 'Executive Dashboard',
      sublabel: 'KPI & Peta Situasi',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      label: 'Intelligence Map',
      sublabel: 'GIS Viewer & Layer',
      icon: MapIcon,
    },
    {
      id: 'forestry',
      label: 'Forestry Activity',
      sublabel: 'Aktivitas & Kepatuhan',
      icon: ShieldAlert,
    },
    {
      id: 'forestry-monitoring',
      label: 'News Monitoring',
      sublabel: 'OSINT Warta & Sidang',
      icon: Newspaper,
    },
    {
      id: 'landchange',
      label: 'Land Change',
      sublabel: 'Tutupan & Buffer',
      icon: TreePine,
    },
    {
      id: 'fire',
      label: 'Fire Intelligence',
      sublabel: 'Hotspots & Cuaca',
      icon: Flame,
    },
    {
      id: 'osint',
      label: 'OSINT Intelligence',
      sublabel: 'Berita & JDIH Sintang',
      icon: Globe2,
    },
    {
      id: 'events',
      label: 'Intelligence Events',
      sublabel: 'Direktori Bukti',
      icon: ListTree,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      sublabel: 'Kronologi Spasial',
      icon: History,
    },
    {
      id: 'sources',
      label: 'Data Sources',
      sublabel: 'Audit Trail Provenance',
      icon: Database,
    },
    {
      id: 'reports',
      label: 'Reports',
      sublabel: 'Executive Briefing',
      icon: FileSpreadsheet,
    },
    {
      id: 'health',
      label: 'System Health',
      sublabel: 'Pipa & Ingestion Status',
      icon: Activity,
    },
  ];

  const handleSelectNav = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Application Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-100 font-mono flex items-center gap-1">
                <span>KPH</span>
                <span className="text-emerald-400">INTELLIGENCE</span>
              </h1>
              <MockNoticeBadge compact />
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Monitoring: <strong className="text-slate-300 font-medium">KPH Sintang Timur</strong> &amp; Kab. Sintang, Kalbar
            </p>
          </div>
        </div>

        {/* Center: Live Meteorological Indicator */}
        <div className="hidden lg:flex items-center gap-4 text-xs border-x border-slate-800 px-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span>Susilo Sintang: <strong className="text-slate-100">{temperatureC}°C</strong></span>
          </div>
          <div className="text-slate-400">
            Hujan 24j: <strong className="text-slate-200 font-mono">{rainfallMm} mm</strong>
          </div>
          <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px]">
            FWI: TINGGI
          </div>
        </div>

        {/* Right: Clock & Alerts */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentTimeWib || '04:00 WIB'}</span>
          </div>

          <button
            onClick={() => onNavigate('events')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="hidden sm:inline">Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Desktop) */}
        <aside
          className={`fixed md:static inset-y-16 md:inset-auto left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-transform md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Target Territory Banner */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              Wilayah Operasional
            </div>
            <div className="text-xs font-bold text-slate-200">
              KPH SINTANG TIMUR
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
              <span>Kabupaten Sintang</span>
              <span className="font-mono text-emerald-400">2.16 M Ha</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/40 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
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
                </button>
              );
            })}
          </nav>

          {/* Bottom Hard Constraints Assurance */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <Compass className="w-3.5 h-3.5" />
              <span>Prinsip Kepatuhan Data</span>
            </div>
            <p className="leading-tight text-slate-400">
              100% Data Publik Terbuka. Tanpa data internal KPH &amp; tanpa kesimpulan vonis otomatis.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-slate-950 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
