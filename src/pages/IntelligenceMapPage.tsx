import React from 'react';
import { IntelligenceMap } from '../components/map/IntelligenceMap';
import { IntelligenceEvent } from '../types';
import { MockNoticeBadge } from '../components/common/MockNoticeBadge';

interface IntelligenceMapPageProps {
  onSelectEvent: (event: IntelligenceEvent) => void;
}

export const IntelligenceMapPage: React.FC<IntelligenceMapPageProps> = ({ onSelectEvent }) => {
  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs px-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">GIS Intelligence Map Viewer</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-400">KPH Sintang Timur &amp; Kabupaten Sintang</span>
        </div>
        <MockNoticeBadge compact />
      </div>

      <div className="flex-1 relative">
        <IntelligenceMap onSelectEvent={onSelectEvent} heightClass="h-full" />
      </div>
    </div>
  );
};
