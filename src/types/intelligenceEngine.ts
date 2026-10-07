/**
 * KPH Intelligence - AI Intelligence Engine & Executive Briefing Types
 * Strict compliance with Phase 8 Specification
 * Target: Kabupaten Sintang & KPH Sintang Timur, Kalimantan Barat
 */

export type EvidenceObservationType =
  | 'OBSERVATION'    // Direct sensor / telemetry fact (e.g. thermal hotspot 350K, dNDVI -0.38)
  | 'DERIVED'        // System-derived calculation (e.g. area 14.8 Ha, DBSCAN cluster centroid)
  | 'CORRELATION'    // Spatio-temporal coincidence (e.g. hotspot within 200m of river & Hutan Lindung)
  | 'INTERPRETATION'; // Neutral contextual possibility with uncertainties stated

export type IntelligenceConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export type IntelligenceAlertLevel = 'INFO' | 'LOW' | 'MODERATE' | 'HIGH';

export type IntelligenceAlertTrigger =
  | 'NEW_HIGH_PRIORITY_EVENT'
  | 'MULTI_SOURCE_CORRELATION'
  | 'RECURRING_FIRE_PATTERN'
  | 'SIGNIFICANT_LAND_CHANGE'
  | 'RAPID_SITUATION_CHANGE'
  | 'HIGH_RISK_INDICATOR'
  | 'IMPORTANT_PUBLIC_REPORT'
  | 'DATA_ANOMALY';

export type DataQualityLevel = 'GOOD' | 'FAIR' | 'POOR' | 'INSUFFICIENT';

/**
 * Standard Evidence Item
 */
export interface EvidenceItemRef {
  evidence_id: string;
  source_id: string;
  source_name: string;
  source_url: string;
  source_date: string;
  retrieved_at: string;
  data_type: 'SATELLITE_RASTER' | 'THERMAL_HOTSPOT' | 'GIS_VECTOR' | 'PUBLIC_NEWS' | 'JDIH_GAZETTE' | 'WEATHER_TELEMETRY';
  confidence: IntelligenceConfidence;
  observation_type: EvidenceObservationType;
  summary: string;
  snippet?: string;
  metrics?: Record<string, any>;
  spatial_ref?: {
    latitude: number;
    longitude: number;
    kecamatan?: string;
    forest_zone?: string;
  };
}

/**
 * Complete Evidence Bundle retrieved by EvidenceRetriever
 */
export interface EvidenceBundle {
  bundle_id: string;
  subject: {
    type: 'KPH_UNIT' | 'KABUPATEN' | 'KECAMATAN' | 'EVENT' | 'TOPIC';
    id: string;
    name: string;
  };
  temporal_context: {
    start_date: string;
    end_date: string;
    period_label: string;
  };
  observations: EvidenceItemRef[];
  events: Array<{
    event_id: string;
    event_type: string;
    title: string;
    date: string;
    kecamatan: string;
  }>;
  satellite_land_changes: any[];
  fire_hotspots: any[];
  fire_events: any[];
  osint_records: any[];
  osint_events: any[];
  gis_context: {
    kph_unit: string;
    kabupaten: string;
    monitored_area_ha: number;
    forest_zones_summary: string[];
    peatland_khg: string[];
  };
  weather_context: {
    temperature_c: number;
    humidity_percent: number;
    rainfall_24h_mm: number;
    wind_speed_kmh: number;
    fire_weather_index: string;
  };
  sources: Array<{
    source_id: string;
    source_name: string;
    provider: string;
    category?: string;
    license: string;
    url: string;
  }>;
  uncertainties: string[];
  data_gaps: string[];
  data_quality: {
    quality_level: DataQualityLevel;
    notes: string;
  };
}

/**
 * Structured Intelligence Assessment Model
 */
export interface IntelligenceAssessment {
  assessment_id: string;
  subject_type: string;
  subject_id: string;
  assessment_type:
    | 'SITUATION'
    | 'TREND'
    | 'ANOMALY'
    | 'CORRELATION'
    | 'RISK_INDICATOR'
    | 'EVENT_SUMMARY'
    | 'AREA_SUMMARY'
    | 'EXECUTIVE_BRIEF';
  period_start: string;
  period_end: string;
  summary: string;
  observations: string[];
  derived_findings: string[];
  interpretations: string[];
  correlations: string[];
  uncertainties: string[];
  data_gaps: string[];
  confidence: IntelligenceConfidence;
  confidence_rationale: string;
  evidence_count: number;
  source_count: number;
  model_name: string;
  model_version: string;
  prompt_version: string;
  evidence_bundle_ref?: string;
  created_at: string;
}

/**
 * Key Event Highlight for Executive Brief
 */
export interface KeyIntelligenceEvent {
  event_id: string;
  title: string;
  event_type: string;
  detected_at: string;
  kecamatan: string;
  forest_zone: string;
  relevance_score: number; // 0 - 100 based on technical factors
  evidence_count: number;
  sources_count: number;
  summary: string;
  evidence_citations: string[];
}

/**
 * Executive Intelligence Brief Structure
 */
export interface ExecutiveBriefingObject {
  intelligence_id: string;
  briefing_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AREA_SPECIFIC';
  title: string;
  period: {
    start: string;
    end: string;
    label: string;
  };
  area: {
    id: string;
    name: string;
    total_monitored_ha: number;
  };
  executive_summary: string[]; // 3 to 5 concise bullet points
  situation_overview: string;
  key_events: KeyIntelligenceEvent[];
  spatial_situation: {
    active_kecamatans: string[];
    affected_forest_zones: string[];
    peatland_alerts: number;
  };
  fire_situation: {
    total_detections: number;
    fire_events_count: number;
    max_frp_mw: number;
    risk_level: string;
  };
  land_change_situation: {
    detected_change_events: number;
    total_loss_area_ha: number;
    mean_ndvi_delta: number;
  };
  osint_situation: {
    total_public_reports: number;
    activities_reported: string[];
    official_gazette_notices: number;
  };
  cross_source_correlation: Array<{
    correlation_id: string;
    headline: string;
    details: string;
    evidence_tags: string[];
    confidence: number;
  }>;
  emerging_patterns: string[];
  risk_indicators: {
    level: string;
    factors: string[];
    disclaimer: string;
  };
  uncertainties: string[];
  data_gaps: string[];
  source_list: Array<{
    source_id: string;
    source_name: string;
    provider: string;
    category?: string;
    url: string;
    license: string;
  }>;
  limitations: string;
  confidence: IntelligenceConfidence;
  status: 'REQUIRES_REVIEW' | 'DESK_VERIFIED';
  model: {
    name: string;
    version: string;
    provider: string;
    generated_at: string;
  };
  provenance: {
    evidence_bundle_id: string;
    total_evidence_items: number;
    sources_count: number;
  };
}

/**
 * Intelligence Early Warning Alert
 */
export interface IntelligenceAlert {
  alert_id: string;
  alert_level: IntelligenceAlertLevel;
  trigger_type: IntelligenceAlertTrigger;
  title: string;
  description: string;
  why_alerted: string;
  threshold_applied: string;
  data_period: string;
  source_count: number;
  uncertainty: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  evidence_bundle_id?: string;
  created_at: string;
  acknowledged_at?: string;
}

/**
 * AI Model Registry Item
 */
export interface AiModelConfig {
  model_id: string;
  provider: string;
  model_name: string;
  model_version: string;
  purpose: string;
  temperature: number;
  max_tokens: number;
  active: boolean;
  created_at: string;
}

/**
 * AI Prompt Registry Item
 */
export interface AiPromptConfig {
  prompt_id: string;
  prompt_name: string;
  prompt_version: string;
  prompt_text: string;
  purpose: string;
  active: boolean;
  created_at: string;
}

/**
 * AI Audit Log
 */
export interface AiAuditLog {
  request_id: string;
  user_query?: string;
  intent_detected?: string;
  context_ids: string[];
  model_id: string;
  prompt_id: string;
  response: string;
  evidence_ids: string[];
  source_ids: string[];
  confidence: IntelligenceConfidence;
  latency_ms: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  created_at: string;
}

/**
 * Natural Language Query Response
 */
export interface NaturalLanguageQueryResponse {
  answer: string;
  intent: string;
  observations: string[];
  correlations: string[];
  uncertainties: string[];
  data_gaps: string[];
  evidence_ids: string[];
  source_ids: string[];
  confidence: IntelligenceConfidence;
  latency_ms: number;
  source_citations: Array<{
    citation_id: string;
    source_name: string;
    url: string;
    license: string;
  }>;
  generated_at: string;
}

/**
 * Data Quality Audit Report
 */
export interface DataQualityReport {
  overall_quality: DataQualityLevel;
  completeness_score_percent: number;
  missing_locations_count: number;
  missing_dates_count: number;
  duplicate_records_prevented: number;
  stale_sources_count: number;
  offline_sources_count: number;
  data_gaps: string[];
  recommendations: string[];
  audited_at: string;
}
