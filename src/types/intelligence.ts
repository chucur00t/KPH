/**
 * Types & Domain Models for KPH Intelligence
 * Target Area: KPH Sintang Timur & Kabupaten Sintang, Kalimantan Barat
 */

export type TaxonomicStage = 
  | 'OBSERVATION'    // Direct instrument fact (thermal anomaly, raw reflectance)
  | 'DETECTION'      // Algorithmic anomaly (e.g. DBSCAN cluster, NDVI change > threshold)
  | 'CORRELATION'    // Multi-source geospatial overlap (e.g. cluster inside Hutan Lindung & near river)
  | 'REPORTED'       // Secondary OSINT information (public news, press release, JDIH)
  | 'VERIFIED';      // High-resolution multi-temporal check or independent verification

export type EventType =
  | 'FIRE_CLUSTER'
  | 'CANOPY_ANOMALY'
  | 'RIVER_BUFFER_ENCROACHMENT'
  | 'ROAD_BUFFER_ENCROACHMENT'
  | 'PEATLAND_DEGRADATION'
  | 'OSINT_CORRELATED';

export type ForestZone = 
  | 'Hutan Lindung (HL)'
  | 'Hutan Produksi Terbatas (HPT)'
  | 'Hutan Produksi Tetap (HP)'
  | 'Hutan Produksi yang dapat Dikonversi (HPK)'
  | 'Kawasan Suaka Alam / Kawasan Pelestarian Alam (KSA/KPA)'
  | 'Areal Penggunaan Lain (APL)'
  | 'Data tidak tersedia';

export interface PublicDataSource {
  id: string;
  sourceCode: string;
  sourceName: string;
  custodian: string;
  category: 'SATELLITE' | 'GEOPORTAL' | 'WEATHER' | 'OSINT' | 'REGULATORY';
  baseUrl: string;
  license: string;
  updateFrequency: string;
  reliability: 'OFFICIAL_GOV' | 'SATELLITE_INSTRUMENT' | 'PUBLIC_MEDIA' | 'OPEN_COMMUNITY';
  coverageArea: string;
  lastSyncedAt: string;
  status: 'ONLINE' | 'DEGRADED' | 'RATE_LIMITED';
  sha256Hash: string;
}

export interface ProvenanceRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  retrievalUrl: string;
  retrievedAt: string;
  sha256Checksum: string;
  recordsCount: number;
  httpStatus: number;
  licenseClause: string;
  dataCurator: string;
}

export interface EvidenceItem {
  id: string;
  evidenceType: 'SATELLITE_HOTSPOT' | 'SPECTRAL_INDEX_DELTA' | 'PUBLIC_NEWS' | 'JDIH_REGULATION' | 'SPATIAL_INTERSECTION';
  sourceName: string;
  sourceUrl: string;
  recordedAt: string;
  taxonomicStage: TaxonomicStage;
  metricLabel: string;
  metricValue: string;
  snippet: string;
  provenanceId: string;
}

export interface IntelligenceEvent {
  id: string;
  eventCode: string; // e.g. "EVT-STG-2026-0926-001"
  eventType: EventType;
  taxonomicStage: TaxonomicStage;
  title: string;
  summary: string;
  firstDetectedAt: string;
  lastDetectedAt: string;
  location: {
    latitude: number;
    longitude: number;
    kphUnit: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    forestZone: ForestZone;
    isPeatland: boolean;
    peatHydrologyUnit?: string;
    distanceToNearestRiverMeters: number;
    nearestRiverName: string;
    distanceToNearestRoadMeters: number;
    nearestRoadName: string;
  };
  areaHectares?: number;
  confidenceScore: number; // 0 - 100
  confidenceRationale: string;
  verificationStatus: 'UNVERIFIED' | 'DESK_VERIFIED' | 'PENDING_INSPECTION' | 'INCONCLUSIVE';
  evidenceChain: EvidenceItem[];
  relatedEventCodes: string[];
  publicNotes: string;
}

export interface HotspotObservation {
  id: string;
  satellite: 'VIIRS_SNPP' | 'VIIRS_NOAA20' | 'VIIRS_NOAA21' | 'MODIS_TERRA' | 'MODIS_AQUA';
  acqDate: string;
  acqTimeUtc: string;
  latitude: number;
  longitude: number;
  brightnessKelvin: number;
  frpMw: number; // Fire Radiative Power
  confidence: 'nominal' | 'high' | 'low';
  forestZone: ForestZone;
  kecamatan: string;
  clusterId?: string;
  provenanceId: string;
}

export interface LandChangeDetection {
  id: string;
  dateDetected: string;
  latitude: number;
  longitude: number;
  areaHa: number;
  ndviBefore: number;
  ndviAfter: number;
  ndviDelta: number; // negative indicates canopy loss
  sensor: 'Sentinel-2 L2A' | 'Landsat-8/9 OLI';
  forestZone: ForestZone;
  kecamatan: string;
  nearRiver: boolean;
  nearRoad: boolean;
  provenanceId: string;
}

export interface OsintArticle {
  id: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  title: string;
  authorOrAgency: string;
  fullExcerpt: string;
  topics: string[];
  extractedLocations: string[];
  approximateCoords?: {
    latitude: number;
    longitude: number;
  };
  geocodingPrecision: 'DESA' | 'KECAMATAN' | 'KABUPATEN' | 'NONE';
  taxonomicStage: TaxonomicStage;
  correlatedEventCodes: string[];
  provenanceId: string;
}

export interface WeatherCondition {
  kabupaten: string;
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  rainfallLast24hMm: number;
  fireWeatherIndex: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'EKSTREM';
  observationTimestamp: string;
  dataSource: string;
  sourceUrl: string;
}

export interface ExecutiveBriefing {
  id: string;
  briefingType: 'DAILY' | 'WEEKLY' | 'SPECIAL_ALERT';
  generatedAt: string;
  periodLabel: string;
  headline: string;
  executiveSummary: string;
  kpiOverview: {
    monitoredAreaHa: number;
    activeFireClusters: number;
    totalHotspots24h: number;
    canopyLossHa: number;
    highRiskAlerts: number;
    osintReportsCount: number;
  };
  keyFindings: Array<{
    category: string;
    bulletText: string;
    evidenceCode: string;
  }>;
  spatialAlerts: Array<{
    level: 'CRITICAL' | 'WARNING' | 'INFORMATIONAL';
    location: string;
    summary: string;
    recommendation: string;
  }>;
  groundedCitations: Array<{
    citationId: string;
    sourceName: string;
    url: string;
  }>;
}

export interface SystemHealthStatus {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE';
  checkedAt: string;
  components: {
    nasaFirmsFeed: { status: 'OK' | 'SLOW' | 'ERROR'; latencyMs: number; lastIngested: string };
    copernicusOpenHub: { status: 'OK' | 'SLOW' | 'ERROR'; latencyMs: number; lastIngested: string };
    bmkgOpenWeather: { status: 'OK' | 'SLOW' | 'ERROR'; latencyMs: number; lastIngested: string };
    kalbarSatuData: { status: 'OK' | 'SLOW' | 'ERROR'; latencyMs: number; lastIngested: string };
    osintCrawler: { status: 'OK' | 'SLOW' | 'ERROR'; latencyMs: number; lastIngested: string };
    spatialDatabase: { status: 'OK'; connections: number; storageUsedMb: number };
    geminiGroundedAi: { status: 'OK'; model: string; guardrailStatus: 'ACTIVE_ANTI_HALLUCINATION' };
  };
}

export * from './registry';

