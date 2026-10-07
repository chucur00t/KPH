import React from 'react';
import { Flame, Droplets } from 'lucide-react';

interface TrendItem {
  period: string;
  hotspots: number;
  rainfallMm: number;
  fwi: string;
}

interface TrendChartProps {
  data?: TrendItem[];
}

const DEFAULT_DATA: TrendItem[] = [
  { period: '17-20 Sep', hotspots: 2, rainfallMm: 34.5, fwi: 'RENDAH' },
  { period: '21-23 Sep', hotspots: 1, rainfallMm: 18.2, fwi: 'SEDANG' },
  { period: '24-26 Sep', hotspots: 4, rainfallMm: 6.4, fwi: 'SEDANG' },
  { period: '27-28 Sep', hotspots: 6, rainfallMm: 2.1, fwi: 'TINGGI' },
  { period: '29-30 Sep', hotspots: 8, rainfallMm: 1.2, fwi: 'TINGGI' },
];

export const TrendChart: React.FC<TrendChartProps> = ({ data = DEFAULT_DATA }) => {
  const maxHotspots = Math.max(...data.map((d) => d.hotspots), 10);

  return (
    <div className="space-y-4">
      {/* Legend Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>Hotspot Satelit (VIIRS/MODIS)</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Droplets className="w-3.5 h-3.5" />
            <span>Curah Hujan (mm/hari)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Stasiun Susilo Sintang</span>
      </div>

      {/* Bar Chart Representation */}
      <div className="space-y-2.5">
        {data.map((item, idx) => {
          const barWidthPercent = (item.hotspots / maxHotspots) * 100;
          return (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-mono text-slate-400 text-[11px] w-20">
                  {item.period}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-amber-400">
                    {item.hotspots} Titik
                  </span>
                  <span className="font-mono text-cyan-300 text-[11px]">
                    {item.rainfallMm} mm
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      item.fwi === 'TINGGI'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    FWI: {item.fwi}
                  </span>
                </div>
              </div>

              {/* Graphical Bar */}
              <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(barWidthPercent, 8)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
