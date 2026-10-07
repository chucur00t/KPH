/**
 * KPH Intelligence - OSINT & Open-Source Intelligence Domain Types
 * Strict compliance with Phase 7 Specification
 * Target: Kabupaten Sintang & KPH Sintang Timur, Kalimantan Barat
 */

export type OsintSourceType =
  | 'NEWS'
  | 'GOVERNMENT_WEBSITE'
  | 'JDIH'
  | 'PUBLIC_DOCUMENT'
  | 'PUBLIC_REPORT'
  | 'PUBLIC_COMPANY_INFORMATION'
  | 'ACADEMIC_PUBLICATION'
  | 'ENVIRONMENTAL_PUBLICATION'
  | 'FORESTRY_PUBLICATION'
  | 'AGRICULTURE_PUBLICATION'
  | 'MINING_PUBLICATION'
  | 'PLANTATION_PUBLICATION'
  | 'SOCIAL_FORESTRY_PUBLICATION'
  | 'RSS'
  | 'PUBLIC_API'
  | 'PUBLIC_WEB';

export type OsintSourceStatus =
  | 'ACTIVE'
  | 'DEGRADED'
  | 'OFFLINE'
  | 'UNVERIFIED'
  | 'BLOCKED'
  | 'REQUIRES_REVIEW'
  | 'ACCESS_RESTRICTED';

export type RobotsStatus = 'ALLOWED' | 'DISALLOWED' | 'UNKNOWN' | 'NO_ROBOTS';

export type OsintEntityType =
  | 'ORGANIZATION'
  | 'COMPANY'
  | 'AGENCY'
  | 'LOCATION'
  | 'LEGAL_REGULATION'
  | 'COMMODITY'
  | 'PERSON';

export type OsintActivityType =
  | 'LAND_CLEARING_REPORTED'
  | 'FIRE_INCIDENT_REPORTED'
  | 'TIMBER_TRANSPORT_REPORTED'
  | 'REGULATION_PERMIT_ISSUED'
  | 'TENURIAL_DISPUTE_REPORTED'
  | 'SOCIAL_FORESTRY_REHAB_REPORTED'
  | 'ENVIRONMENTAL_INVESTIGATION'
  | 'PUBLIC_MEETING_OR_HEARING';

export type ExtractionConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type GeocodingPrecision =
  | 'COORDINATE_MENTIONED'
  | 'DESA'
  | 'KECAMATAN'
  | 'KABUPATEN'
  | 'PROVINSI'
  | 'NONE';

/**
 * OSINT Source Model (matches table osint_sources)
 */
export interface OsintSource {
  source_id: string;
  source_name: string;
  provider: string;
  source_type: OsintSourceType;
  base_url: string;
  rss_url?: string;
  api_url?: string;
  sitemap_url?: string;
  coverage_area: string;
  language: string;
  access_method: string;
  license: string;
  terms_url?: string;
  robots_status: RobotsStatus;
  crawl_frequency: string;
  last_crawled_at: string | null;
  last_success_at: string | null;
  status: OsintSourceStatus;
  reliability_score: number; // 0 - 100
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * Raw Source Record (matches table osint_source_records)
 */
export interface OsintSourceRecord {
  record_id: string;
  source_id: string;
  source_url: string;
  canonical_url?: string;
  title: string;
  author?: string;
  publisher: string;
  published_at: string | null;
  retrieved_at: string;
  content_type: string;
  language: string;
  content_hash: string; // SHA-256 for deduplication
  raw_reference: string;
  text_content: string;
  summary?: string;
  http_status: number;
  retrieval_status: 'SUCCESS' | 'FAILED' | 'CACHED' | 'RATE_LIMITED';
  created_at: string;
}

/**
 * Raw Snapshot Metadata (matches table osint_snapshots)
 */
export interface OsintSnapshot {
  snapshot_id: string;
  record_id: string;
  storage_reference: string; // /raw/osint/YYYY/MM/DD/...
  captured_at: string;
  mime_type: string;
  byte_size: number;
  checksum_sha256: string;
}

/**
 * Discovered Entity
 */
export interface OsintEntity {
  entity_id: string;
  record_id: string;
  entity_name: string;
  entity_type: OsintEntityType;
  normalized_name: string;
  confidence: ExtractionConfidence;
  context_sentence?: string;
  metadata?: Record<string, any>;
}

/**
 * Extracted Activity (Non-criminalizing reported activity)
 */
export interface OsintActivity {
  activity_id: string;
  record_id: string;
  activity_type: OsintActivityType;
  activity_description: string;
  verbatim_quote: string;
  reported_date: string | null;
  confidence: ExtractionConfidence;
}

/**
 * Structured OSINT Intelligence Event
 */
export interface OsintEvent {
  event_id: string;
  event_code: string; // e.g. OSINT-EVT-STG-2026-001
  primary_record_id: string;
  activity_type: OsintActivityType;
  title: string;
  summary: string;
  taxonomic_stage: 'REPORTED' | 'OBSERVATION' | 'DETECTION' | 'CORRELATION' | 'VERIFIED';
  kabupaten: string;
  kecamatan: string;
  desa?: string;
  forest_zone: string;
  geocoding_precision: GeocodingPrecision;
  latitude?: number;
  longitude?: number;
  occurred_at: string | null;
  published_at: string;
  source_count: number;
  confidence_score: number;
  is_spatial_correlated: boolean;
  correlations?: OsintSpatialCorrelation[];
  entities?: OsintEntity[];
  created_at: string;
  updated_at: string;
}

/**
 * Spatial & Cross-Module Correlation (OSINT <-> GIS / Land Change / Fire)
 */
export interface OsintSpatialCorrelation {
  correlation_id: string;
  osint_event_id: string;
  target_module: 'GIS_FOREST_ZONE' | 'GIS_PEATLAND' | 'SATELLITE_LAND_CHANGE' | 'FIRE_HOTSPOT' | 'INFRASTRUCTURE';
  target_id: string;
  correlation_type: 'SPATIAL_COINCIDENCE' | 'TEMPORAL_WINDOW_MATCH' | 'JURISDICTION_INTERSECT' | 'DIRECT_EVIDENCE';
  distance_meters: number;
  time_delta_hours: number | null;
  confidence_score: number;
  correlation_summary: string;
  created_at: string;
}

/**
 * Public Web Collector Architecture Interfaces
 */
export interface SourceItem {
  id: string;
  url: string;
  title: string;
  publishedAt?: string;
  sourceId: string;
  author?: string;
  snippet?: string;
}

export interface RawSource {
  sourceItem: SourceItem;
  rawText: string;
  htmlContent?: string;
  httpStatus: number;
  headers?: Record<string, string>;
  fetchedAt: string;
  contentHash: string;
  canonicalUrl?: string;
}

export interface SourceHealth {
  sourceId: string;
  status: OsintSourceStatus;
  responseTimeMs: number;
  httpStatusCode: number;
  robotsCompliant: boolean;
  lastChecked: string;
  errorMessage?: string;
}

export interface PublicSourceCollector {
  collectorType: 'RSS' | 'API' | 'SITEMAP' | 'HTML' | 'DOCUMENT';
  discover(source: OsintSource): Promise<SourceItem[]>;
  fetch(item: SourceItem): Promise<RawSource>;
  healthCheck(source: OsintSource): Promise<SourceHealth>;
}

export interface CollectorHarvestResult {
  run_id: string;
  started_at: string;
  finished_at: string;
  total_sources_scanned: number;
  items_discovered: number;
  records_ingested: number;
  records_skipped_duplicate: number;
  errors_count: number;
  details: Array<{
    source_id: string;
    items_count: number;
    status: string;
  }>;
}

export interface OsintAnalyticsSummary {
  total_sources: number;
  active_sources: number;
  total_records: number;
  total_events: number;
  correlated_events_count: number;
  activity_breakdown: Record<OsintActivityType, number>;
  source_type_breakdown: Record<string, number>;
  kecamatan_distribution: Record<string, number>;
  last_harvest_timestamp: string | null;
}
