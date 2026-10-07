import React, { useEffect, useState } from 'react';
import { CURRENT_WEATHER } from '../../data/publicDataset';
import {
  ShieldCheck,
  CloudSun,
  Flame,
  Droplets,
  Wind,
  Bell,
  Radio,
  Clock,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenAlerts?: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAlerts, activeAlertsCount }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Pontianak', // WIB/WITA West Kalimantan
        }) + ' WIB'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-500/30">
          <ShieldCheck className="w-6 h-6 text-emerald-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-100 flex items-center gap-1.5 font-mono">
              <span>KPH</span>
              <span className="text-emerald-400">INTELLIGENCE</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              100% Public Data
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Monitoring Wilayah: <span className="text-slate-300 font-medium">KPH Sintang Timur</span> &amp; Kab. Sintang, Kalbar
          </p>
        </div>
      </div>

      {/* Weather & Live Instrument Metrics */}
      <div className="hidden lg:flex items-center gap-4 text-xs border-x border-slate-800 px-4">
        {/* Weather */}
        <div className="flex items-center gap-2 text-slate-300">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <span>
            Susilo Sintang: <strong className="text-slate-100">{CURRENT_WEATHER.temperatureC}°C</strong>
          </span>
        </div>

        {/* Rain */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hujan 24j: <strong className="text-slate-200">{CURRENT_WEATHER.rainfallLast24hMm} mm</strong></span>
        </div>

        {/* Wind */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Wind className="w-3.5 h-3.5 text-indigo-400" />
          <span>{CURRENT_WEATHER.windSpeedKmh} km/j (SE)</span>
        </div>

        {/* Fire Weather Index */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
          <Flame className="w-3.5 h-3.5" />
          <span>FWI: {CURRENT_WEATHER.fireWeatherIndex}</span>
        </div>
      </div>

      {/* Right Controls & Clock */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentTime || '04:00 WIB'}</span>
        </div>

        {/* Active Alerts Button */}
        <button
          onClick={onOpenAlerts}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
        >
          <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Alerts</span>
          {activeAlertsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
          <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
          <span>LIVE FEEDS</span>
        </div>
      </div>
    </header>
  );
};
