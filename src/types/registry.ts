/**
 * KPH Intelligence - Public Data Source Registry Schema
 * Strict Domain Model compliant with Phase 3 Specifications
 */

export const SOURCE_CATEGORIES = [
  'Satellite',
  'Fire',
  'Weather',
  'Air Quality',
  'GIS',
  'Administrative',
  'Forest',
  'Land Cover',
  'Peatland',
  'Infrastructure',
  'Agriculture',
  'Mining',
  'Plantation',
  'Social Forestry',
  'Regulation',
  'News',
  'Public Web',
  'Company Public Information',
] as const;

export type SourceCategory = (typeof SOURCE_CATEGORIES)[number];

export const ACCESS_METHODS = [
  'REST API',
  'WMS',
  'WFS',
  'WMTS',
  'GeoJSON',
  'CSV',
  'JSON',
  'RSS',
  'HTML',
  'File Download',
  'STAC',
  'Other',
] as const;

export type SourceAccessMethod = (typeof ACCESS_METHODS)[number];

export const SOURCE_STATUSES = [
  'ACTIVE',
  'DEGRADED',
  'OFFLINE',
  'UNVERIFIED',
  'REQUIRES REVIEW',
] as const;

export type SourceStatus = (typeof SOURCE_STATUSES)[number];

/**
 * Public Data Source Entity
 * The single source of truth for external public data ingestion
 */
export interface PublicSourceRecord {
  source_id: string;
  source_name: string;
  provider: string;
  category: SourceCategory;
  description: string;
  coverage: string;
  data_type: string;
  format: string;
  access_method: SourceAccessMethod;
  endpoint: string;
  documentation_url: string;
  license: string;
  update_frequency: string;
  last_successful_update: string | null;
  status: SourceStatus;
  reliability: string;
  attribution: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Source Provenance Record
 * Every record entering the system must trace back to this provenance
 */
export interface SourceProvenanceRecord {
  provenance_id: string;
  source_id: string;
  source_record_id: string;
  retrieved_at: string;
  published_at: string | null;
  source_url: string;
  raw_reference: string;
  http_status?: number;
  records_count?: number;
  hash_sha256?: string;
}

/**
 * Health Check Log Record
 */
export interface SourceHealthLog {
  id: string;
  source_id: string;
  checked_at: string;
  status: SourceStatus;
  http_status_code?: number;
  latency_ms?: number;
  error_message?: string;
  verified: boolean;
}

export interface SourceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestedStatus?: SourceStatus;
}
