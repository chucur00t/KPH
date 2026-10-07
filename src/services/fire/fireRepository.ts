import fs from 'fs';
import path from 'path';
import {
  FireDetection,
  FireEvent,
  FireAlert,
  FireLandChangeCorrelation,
  FireRiskEvaluation,
  FireHistorySummary,
  FireDensityGridCell,
  RecurringHotspotCluster,
  FireWeatherContext,
} from '../../types/fire';
import { FireProviderRegistry } from './fireProviderRegistry';
import { FireIntelligenceEngine, ClusteringOptions } from './fireIntelligenceEngine';
import { FireLandChangeCorrelationService } from './fireLandChangeCorrelationService';
import { CURRENT_WEATHER } from '../../data/publicDataset';

export class FireRepository {
  private static dataDir = path.resolve(process.cwd(), 'data');
  private static detectionsFile = path.join(FireRepository.dataDir, 'fire_detections.json');
  private static eventsFile = path.join(FireRepository.dataDir, 'fire_events.json');
  private static alertsFile = path.join(FireRepository.dataDir, 'fire_alerts.json');
  private static correlationsFile = path.join(FireRepository.dataDir, 'fire_correlations.json');

  private static initialized = false;
  private static detectionsCache: FireDetection[] = [];
  private static eventsCache: FireEvent[] = [];
  private static alertsCache: FireAlert[] = [];
  private static correlationsCache: FireLandChangeCorrelation[] = [];
  private static currentRiskEvaluation: FireRiskEvaluation | null = null;

  public static async init(): Promise<void> {
    if (this.initialized) return;

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    FireProviderRegistry.init();

    // 1. Load or fetch detections
    if (fs.existsSync(this.detectionsFile)) {
      try {
        const raw = fs.readFileSync(this.detectionsFile, 'utf-8');
        this.detectionsCache = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading fire detections file, refreshing from provider:', e);
        this.detectionsCache = await FireProviderRegistry.queryAllHotspots();
        this.saveDetections();
      }
    } else {
      this.detectionsCache = await FireProviderRegistry.queryAllHotspots();
      this.saveDetections();
    }

    // 2. Perform clustering and generate events if not yet stored
    if (fs.existsSync(this.eventsFile)) {
      try {
        const raw = fs.readFileSync(this.eventsFile, 'utf-8');
        this.eventsCache = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading fire events file:', e);
        this.runClustering();
      }
    } else {
      this.runClustering();
    }

    // 3. Evaluate Fire Risk
    this.currentRiskEvaluation = FireIntelligenceEngine.evaluateFireRisk(
      'AOI-KPH-SINTANG-TIMUR',
      'KPH Sintang Timur',
      this.detectionsCache.length,
      24
    );

    // 4. Generate early warning alerts
    const recurring = FireIntelligenceEngine.detectRecurringHotspots(this.detectionsCache);
    if (fs.existsSync(this.alertsFile)) {
      try {
        const raw = fs.readFileSync(this.alertsFile, 'utf-8');
        this.alertsCache = JSON.parse(raw);
      } catch (e) {
        this.alertsCache = FireIntelligenceEngine.generateAlerts(
          this.eventsCache,
          this.currentRiskEvaluation,
          recurring
        );
        this.saveAlerts();
      }
    } else {
      this.alertsCache = FireIntelligenceEngine.generateAlerts(
        this.eventsCache,
        this.currentRiskEvaluation,
        recurring
      );
      this.saveAlerts();
    }

    // 5. Correlate with Land Change events
    if (fs.existsSync(this.correlationsFile)) {
      try {
        const raw = fs.readFileSync(this.correlationsFile, 'utf-8');
        this.correlationsCache = JSON.parse(raw);
      } catch (e) {
        this.correlationsCache = FireLandChangeCorrelationService.correlateEvents(this.eventsCache);
        this.saveCorrelations();
      }
    } else {
      this.correlationsCache = FireLandChangeCorrelationService.correlateEvents(this.eventsCache);
      this.saveCorrelations();
    }

    this.initialized = true;
  }

  private static runClustering(options?: ClusteringOptions): void {
    const { events } = FireIntelligenceEngine.clusterHotspots(this.detectionsCache, options);
    this.eventsCache = events;
    this.saveEvents();
  }

  private static saveDetections(): void {
    try {
      fs.writeFileSync(this.detectionsFile, JSON.stringify(this.detectionsCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save fire detections:', e);
    }
  }

  private static saveEvents(): void {
    try {
      fs.writeFileSync(this.eventsFile, JSON.stringify(this.eventsCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save fire events:', e);
    }
  }

  private static saveAlerts(): void {
    try {
      fs.writeFileSync(this.alertsFile, JSON.stringify(this.alertsCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save fire alerts:', e);
    }
  }

  private static saveCorrelations(): void {
    try {
      fs.writeFileSync(this.correlationsFile, JSON.stringify(this.correlationsCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save fire correlations:', e);
    }
  }

  // --- QUERY APIS ---

  public static getHotspots(options?: {
    satellite?: string;
    kph_unit?: string;
    kecamatan?: string;
    confidence?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): FireDetection[] {
    let result = [...this.detectionsCache];

    if (options?.satellite && options.satellite !== 'ALL') {
      result = result.filter((d) => d.satellite.includes(options.satellite!));
    }
    if (options?.kph_unit && options.kph_unit !== 'ALL') {
      result = result.filter((d) => d.kph_unit && d.kph_unit.includes(options.kph_unit!));
    }
    if (options?.kecamatan && options.kecamatan !== 'ALL') {
      result = result.filter((d) => d.kecamatan && d.kecamatan.toLowerCase().includes(options.kecamatan!.toLowerCase()));
    }
    if (options?.confidence && options.confidence !== 'ALL') {
      result = result.filter((d) => d.confidence.toLowerCase() === options.confidence!.toLowerCase());
    }
    if (options?.status && options.status !== 'ALL') {
      result = result.filter((d) => d.status === options.status);
    }

    if (options?.limit && options.limit > 0) {
      const offset = options.offset || 0;
      result = result.slice(offset, offset + options.limit);
    }

    return result;
  }

  public static getHotspotById(detectionId: string): FireDetection | null {
    return this.detectionsCache.find((d) => d.detection_id === detectionId) || null;
  }

  public static getEvents(options?: {
    status?: string;
    confidence?: string;
    kecamatan?: string;
  }): FireEvent[] {
    let result = [...this.eventsCache];

    if (options?.status && options.status !== 'ALL') {
      result = result.filter((e) => e.status === options.status);
    }
    if (options?.confidence && options.confidence !== 'ALL') {
      result = result.filter((e) => e.confidence === options.confidence);
    }
    if (options?.kecamatan && options.kecamatan !== 'ALL') {
      result = result.filter((e) => e.kecamatan && e.kecamatan.toLowerCase().includes(options.kecamatan!.toLowerCase()));
    }

    return result.sort((a, b) => new Date(b.first_detected_at).getTime() - new Date(a.first_detected_at).getTime());
  }

  public static getEventById(eventId: string): FireEvent | null {
    return this.eventsCache.find((e) => e.event_id === eventId) || null;
  }

  public static getAlerts(severity?: string, status?: string): FireAlert[] {
    let result = [...this.alertsCache];
    if (severity && severity !== 'ALL') {
      result = result.filter((a) => a.severity === severity);
    }
    if (status && status !== 'ALL') {
      result = result.filter((a) => a.status === status);
    }
    return result;
  }

  public static getCorrelations(): FireLandChangeCorrelation[] {
    if (this.correlationsCache.length === 0 && this.eventsCache.length > 0) {
      this.recalculateCorrelations();
    }
    return this.correlationsCache;
  }

  public static recalculateCorrelations(): FireLandChangeCorrelation[] {
    this.correlationsCache = FireLandChangeCorrelationService.correlateEvents(this.eventsCache);
    this.saveCorrelations();
    return this.correlationsCache;
  }

  public static getFireRisk(aoiId?: string): FireRiskEvaluation {
    if (!this.currentRiskEvaluation) {
      this.currentRiskEvaluation = FireIntelligenceEngine.evaluateFireRisk(
        aoiId || 'AOI-KPH-SINTANG-TIMUR',
        'KPH Sintang Timur',
        this.detectionsCache.length,
        24
      );
    }
    return this.currentRiskEvaluation;
  }

  public static getDensityGrid(): FireDensityGridCell[] {
    return FireIntelligenceEngine.calculateDensityGrid(this.detectionsCache);
  }

  public static getRecurringHotspots(): RecurringHotspotCluster[] {
    return FireIntelligenceEngine.detectRecurringHotspots(this.detectionsCache);
  }

  public static getWeatherContext(): FireWeatherContext {
    return {
      station_name: 'Stasiun Meteorologi Susilo Sintang (WALS)',
      distance_to_station_km: 18.4,
      observation_time: CURRENT_WEATHER.observationTimestamp,
      temperature_c: CURRENT_WEATHER.temperatureC,
      humidity_percent: CURRENT_WEATHER.humidityPercent,
      wind_speed_kmh: CURRENT_WEATHER.windSpeedKmh,
      wind_direction_deg: CURRENT_WEATHER.windDirectionDeg,
      wind_direction_cardinal: 'Tenggara (125°)',
      rainfall_24h_mm: CURRENT_WEATHER.rainfallLast24hMm,
      rainfall_3d_mm: 3.4,
      rainfall_7d_mm: 8.5,
      rainfall_14d_mm: 22.0,
      rainfall_30d_mm: 64.5,
      fire_weather_index: CURRENT_WEATHER.fireWeatherIndex,
      drought_code: 'Sangat Kering (Defisit presipitasi akumulatif)',
      source_id: 'SRC-BMKG-STASIUN-SUSILO',
      source_url: 'https://stamet.susilo.sintang.bmkg.go.id/',
    };
  }

  public static getHistoricalSummary(period: '7d' | '30d' | '90d' | '180d' | '1y' = '30d'): FireHistorySummary {
    const nowMs = Date.now();
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '180d') days = 180;
    else if (period === '1y') days = 365;

    const startMs = nowMs - days * 86400 * 1000;
    const filtered = this.detectionsCache.filter((d) => new Date(d.acquisition_time).getTime() >= startMs);

    const bySatellite: Record<string, number> = {};
    const byDistrict: Record<string, number> = {};
    const byForestZone: Record<string, number> = {};

    for (const d of filtered) {
      bySatellite[d.satellite] = (bySatellite[d.satellite] || 0) + 1;
      const kec = d.kecamatan || 'Kecamatan Sintang';
      byDistrict[kec] = (byDistrict[kec] || 0) + 1;
      const zone = d.forest_zone || 'Areal Penggunaan Lain (APL)';
      byForestZone[zone] = (byForestZone[zone] || 0) + 1;
    }

    // Daily trends
    const dailyMap = new Map<string, number>();
    for (const d of filtered) {
      const day = d.acquisition_time.split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    }

    const dailyTrend = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      hotspot_count: count,
      event_count: Math.ceil(count / 2),
    }));

    return {
      period,
      date_start: new Date(startMs).toISOString(),
      date_end: new Date(nowMs).toISOString(),
      total_hotspots: filtered.length,
      total_fire_events: this.eventsCache.length,
      unique_locations_count: Math.round(filtered.length * 0.8),
      repeated_hotspots_count: this.getRecurringHotspots().length,
      by_satellite: bySatellite,
      by_district: byDistrict,
      by_forest_zone: byForestZone,
      daily_trend: dailyTrend,
    };
  }

  public static triggerAnalysis(options?: ClusteringOptions): {
    events: FireEvent[];
    risk: FireRiskEvaluation;
    alerts: FireAlert[];
    correlations: FireLandChangeCorrelation[];
  } {
    this.runClustering(options);
    this.currentRiskEvaluation = FireIntelligenceEngine.evaluateFireRisk(
      'AOI-KPH-SINTANG-TIMUR',
      'KPH Sintang Timur',
      this.detectionsCache.length,
      24
    );

    const recurring = FireIntelligenceEngine.detectRecurringHotspots(this.detectionsCache);
    this.alertsCache = FireIntelligenceEngine.generateAlerts(
      this.eventsCache,
      this.currentRiskEvaluation,
      recurring
    );
    this.saveAlerts();

    this.correlationsCache = FireLandChangeCorrelationService.correlateEvents(this.eventsCache);
    this.saveCorrelations();

    return {
      events: this.eventsCache,
      risk: this.currentRiskEvaluation,
      alerts: this.alertsCache,
      correlations: this.correlationsCache,
    };
  }
}
