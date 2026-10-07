import { useState, useEffect, useCallback } from 'react';
import { intelligenceService } from '../services/intelligenceService';
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
} from '../types';

export function useIntelligence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kpiData, setKpiData] = useState<{
    monitoredAreaHa: number;
    activeFireClusters: number;
    totalHotspots24h: number;
    canopyLossHa: number;
    highRiskAlerts: number;
    osintReportsCount: number;
    weather: WeatherCondition;
  } | null>(null);

  const [events, setEvents] = useState<IntelligenceEvent[]>([]);
  const [hotspots, setHotspots] = useState<HotspotObservation[]>([]);
  const [landChanges, setLandChanges] = useState<LandChangeDetection[]>([]);
  const [osintArticles, setOsintArticles] = useState<OsintArticle[]>([]);
  const [dataSources, setDataSources] = useState<PublicDataSource[]>([]);
  const [provenanceRecords, setProvenanceRecords] = useState<ProvenanceRecord[]>([]);
  const [briefing, setBriefing] = useState<ExecutiveBriefing | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        kpis,
        evtList,
        fireRes,
        changes,
        articles,
        sources,
        provs,
        brf,
        health,
      ] = await Promise.all([
        intelligenceService.getExecutiveKpis(),
        intelligenceService.getEvents(),
        intelligenceService.getHotspots(),
        intelligenceService.getLandChanges(),
        intelligenceService.getOsintArticles(),
        intelligenceService.getDataSources(),
        intelligenceService.getProvenanceRecords(),
        intelligenceService.getLatestBriefing(),
        intelligenceService.getSystemHealth(),
      ]);

      setKpiData(kpis);
      setEvents(evtList);
      setHotspots(fireRes.hotspots);
      setLandChanges(changes);
      setOsintArticles(articles);
      setDataSources(sources);
      setProvenanceRecords(provs);
      setBriefing(brf);
      setSystemHealth(health);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data intelijen.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    loading,
    error,
    refresh: loadAllData,
    kpiData,
    events,
    hotspots,
    landChanges,
    osintArticles,
    dataSources,
    provenanceRecords,
    briefing,
    systemHealth,
  };
}
