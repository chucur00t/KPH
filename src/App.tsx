/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageId, IntelligenceEvent } from './types';
import { AppLayout } from './layouts/AppLayout';
import { ExecutiveDashboardPage } from './pages/ExecutiveDashboardPage';
import { IntelligenceMapPage } from './pages/IntelligenceMapPage';
import { LandChangePage } from './pages/LandChangePage';
import { FireIntelligencePage } from './pages/FireIntelligencePage';
import { OsintPage } from './pages/OsintPage';
import { EventsRegistryPage } from './pages/EventsRegistryPage';
import { TimelinePage } from './pages/TimelinePage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { ForestryActivityPage } from './pages/ForestryActivityPage';
import { ForestryMonitoringPage } from './pages/ForestryMonitoringPage';
import { EventDetailModal } from './components/common/EventDetailModal';
import { useIntelligence } from './hooks/useIntelligence';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('executive');
  const [selectedEvent, setSelectedEvent] = useState<IntelligenceEvent | null>(null);

  const { events, kpiData } = useIntelligence();

  const activeAlertsCount = events.filter((e) => e.confidenceScore >= 80).length;

  const handleSelectRelatedEvent = (code: string) => {
    const found = events.find((e) => e.eventCode === code);
    if (found) {
      setSelectedEvent(found);
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      activeAlertsCount={activeAlertsCount}
      temperatureC={kpiData?.weather.temperatureC}
      rainfallMm={kpiData?.weather.rainfallLast24hMm}
    >
      {/* 1. Executive Dashboard */}
      {currentPage === 'executive' && (
        <ExecutiveDashboardPage
          onNavigate={setCurrentPage}
          onSelectEvent={setSelectedEvent}
        />
      )}

      {/* 2. Intelligence Map */}
      {currentPage === 'map' && (
        <IntelligenceMapPage onSelectEvent={setSelectedEvent} />
      )}

      {/* 2.5 Forestry Activity Intelligence (Phase 10) */}
      {currentPage === 'forestry' && <ForestryActivityPage />}

      {/* 2.6 Forestry News Monitoring (Phase 10A) */}
      {currentPage === 'forestry-monitoring' && <ForestryMonitoringPage />}

      {/* 3. Land Change Intelligence */}
      {currentPage === 'landchange' && <LandChangePage />}

      {/* 4. Fire Intelligence */}
      {currentPage === 'fire' && <FireIntelligencePage />}

      {/* 5. OSINT Intelligence */}
      {currentPage === 'osint' && <OsintPage />}

      {/* 6. Intelligence Events Registry */}
      {currentPage === 'events' && (
        <EventsRegistryPage onSelectEvent={setSelectedEvent} />
      )}

      {/* 7. Timeline */}
      {currentPage === 'timeline' && (
        <TimelinePage onSelectEvent={setSelectedEvent} />
      )}

      {/* 8. Data Sources & Provenance */}
      {currentPage === 'sources' && <DataSourcesPage />}

      {/* 9. Executive Reports */}
      {currentPage === 'reports' && <ReportsPage />}

      {/* 10. System Health */}
      {currentPage === 'health' && <SystemHealthPage />}

      {/* Global Event Detail & Evidence Inspector Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSelectRelatedEvent={handleSelectRelatedEvent}
      />
    </AppLayout>
  );
}
