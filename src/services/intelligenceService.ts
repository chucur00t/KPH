/**
 * Intelligence Service Layer
 * Clean abstraction separating UI components from data fetching logic.
 * Easily switchable between Mock Data (Fase 2) and Real Production API (Fase 3+).
 */

import {
  MOCK_DATA_SOURCES,
  MOCK_PROVENANCE_RECORDS,
  MOCK_WEATHER,
  MOCK_HOTSPOTS,
  MOCK_LAND_CHANGES,
  MOCK_OSINT_ARTICLES,
  MOCK_INTELLIGENCE_EVENTS,
  MOCK_EXECUTIVE_BRIEFING,
  MOCK_SYSTEM_HEALTH,
  MOCK_MONITORED_HECTARES,
} from '../mock/mockData';
import {
  MOCK_KPH_BOUNDARY,
  MOCK_KABUPATEN_ADMIN,
  MOCK_FOREST_ZONES,
  MOCK_PEATLAND,
  MOCK_RIVERS,
  MOCK_ROADS,
} from '../mock/mockSpatialLayers';
import {
  IntelligenceEvent,
  HotspotObservation,
  LandChangeDetection,
  OsintArticle,
  PublicDataSource,
  ProvenanceRecord,
  ExecutiveBriefing,
  SystemHealthStatus,
  WeatherCondition,
  GeoJsonFeatureCollection,
} from '../types';

// Configuration: Defaults to false in Phase 3 so real API is preferred with mock fallback
const PREFER_MOCK_FALLBACK = false;

class IntelligenceService {
  // 1. Executive KPIs
  async getExecutiveKpis(): Promise<{
    monitoredAreaHa: number;
    activeFireClusters: number;
    totalHotspots24h: number;
    canopyLossHa: number;
    highRiskAlerts: number;
    osintReportsCount: number;
    weather: WeatherCondition;
  }> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/kpi/executive');
        if (res.ok) return await res.json();
      }
    } catch (e) {
      // Fallback to mock
    }

    const totalLoss = MOCK_LAND_CHANGES.reduce((a, c) => a + c.areaHa, 0);
    const highAlerts = MOCK_INTELLIGENCE_EVENTS.filter((e) => e.confidenceScore >= 80).length;

    return {
      monitoredAreaHa: MOCK_MONITORED_HECTARES,
      activeFireClusters: 3,
      totalHotspots24h: MOCK_HOTSPOTS.length,
      canopyLossHa: Number(totalLoss.toFixed(1)),
      highRiskAlerts: highAlerts,
      osintReportsCount: MOCK_OSINT_ARTICLES.length,
      weather: MOCK_WEATHER,
    };
  }

  // 2. Events Registry
  async getEvents(filters?: {
    stage?: string;
    type?: string;
    kecamatan?: string;
  }): Promise<IntelligenceEvent[]> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const params = new URLSearchParams(filters as any).toString();
        const res = await fetch(`/api/v1/events?${params}`);
        if (res.ok) {
          const data = await res.json();
          return data.events || data;
        }
      }
    } catch (e) {
      // Fallback to mock
    }

    let result = [...MOCK_INTELLIGENCE_EVENTS];
    if (filters?.stage && filters.stage !== 'ALL') {
      result = result.filter(
        (e) => e.taxonomicStage.toUpperCase() === filters.stage?.toUpperCase()
      );
    }
    if (filters?.type && filters.type !== 'ALL') {
      result = result.filter(
        (e) => e.eventType.toUpperCase() === filters.type?.toUpperCase()
      );
    }
    if (filters?.kecamatan) {
      result = result.filter((e) =>
        e.location.kecamatan.toLowerCase().includes(filters.kecamatan!.toLowerCase())
      );
    }

    return result;
  }

  async getEventById(id: string): Promise<IntelligenceEvent | null> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch(`/api/v1/events/${id}`);
        if (res.ok) return await res.json();
      }
    } catch (e) {
      // Fallback
    }
    return (
      MOCK_INTELLIGENCE_EVENTS.find((e) => e.id === id || e.eventCode === id) || null
    );
  }

  // 3. Hotspots & Fire Intelligence
  async getHotspots(): Promise<{
    hotspots: HotspotObservation[];
    weather: WeatherCondition;
  }> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/fire-intelligence/hotspots');
        if (res.ok) return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    return {
      hotspots: MOCK_HOTSPOTS,
      weather: MOCK_WEATHER,
    };
  }

  // 4. Land Change Detections
  async getLandChanges(): Promise<LandChangeDetection[]> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/land-change/detections');
        if (res.ok) {
          const data = await res.json();
          return data.detections || data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_LAND_CHANGES;
  }

  // 5. OSINT Articles
  async getOsintArticles(): Promise<OsintArticle[]> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/osint/articles');
        if (res.ok) {
          const data = await res.json();
          return data.articles || data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_OSINT_ARTICLES;
  }

  // 6. Data Sources Catalog
  async getDataSources(): Promise<PublicDataSource[]> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/sources');
        if (res.ok) {
          const data = await res.json();
          return data.sources || data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_DATA_SOURCES;
  }

  // 7. Provenance Records
  async getProvenanceRecords(): Promise<ProvenanceRecord[]> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/provenance');
        if (res.ok) {
          const data = await res.json();
          return data.records || data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_PROVENANCE_RECORDS;
  }

  // 8. Executive Briefing
  async getLatestBriefing(): Promise<ExecutiveBriefing> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/briefings/latest');
        if (res.ok) return await res.json();
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_EXECUTIVE_BRIEFING;
  }

  // 9. System Health Status
  async getSystemHealth(): Promise<SystemHealthStatus> {
    try {
      if (!PREFER_MOCK_FALLBACK) {
        const res = await fetch('/api/v1/health');
        if (res.ok) {
          const data = await res.json();
          return data.system || data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return MOCK_SYSTEM_HEALTH;
  }

  // 10. Spatial GeoJSON Layers
  async getSpatialLayers(): Promise<{
    kphBoundary: GeoJsonFeatureCollection;
    kabupatenAdmin: GeoJsonFeatureCollection;
    forestZones: GeoJsonFeatureCollection;
    peatland: GeoJsonFeatureCollection;
    rivers: GeoJsonFeatureCollection;
    roads: GeoJsonFeatureCollection;
  }> {
    return {
      kphBoundary: MOCK_KPH_BOUNDARY,
      kabupatenAdmin: MOCK_KABUPATEN_ADMIN,
      forestZones: MOCK_FOREST_ZONES,
      peatland: MOCK_PEATLAND,
      rivers: MOCK_RIVERS,
      roads: MOCK_ROADS,
    };
  }

  // 11. AI Briefing Synthesis (Server endpoint with mock fallback)
  async synthesizeBriefing(payload: {
    focusArea: string;
    period: string;
  }): Promise<{ text: string; model: string }> {
    try {
      const res = await fetch('/api/v1/briefings/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          text: data.synthesizedText,
          model: data.modelUsed,
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      text: MOCK_EXECUTIVE_BRIEFING.executiveSummary,
      model: 'mock-ui-synthesizer',
    };
  }

  // 12. Grounded Q&A
  async askQuestion(question: string): Promise<{ answer: string; source: string }> {
    try {
      const res = await fetch('/api/v1/briefings/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          answer: data.answer,
          source: data.source,
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      answer: `[MOCK UI RESPONSE] Sistem memantau 2.163.500 Ha wilayah Sintang berdasarkan data terbuka. Pertanyaan Anda: "${question}" sedang diproses dalam simulasi UI shell.`,
      source: 'mock-grounded-kb',
    };
  }
}

export const intelligenceService = new IntelligenceService();
