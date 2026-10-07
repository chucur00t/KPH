/**
 * KPH Intelligence - Fire Intelligence & Thermal Radiative Analytics Types
 * Strict compliance with Phase 6 Specification
 */

export type FireDetectionStatus =
  | 'DETECTED'
  | 'UNCONFIRMED'
  | 'CORRELATED'
  | 'REQUIRES_REVIEW'
  | 'CONFIRMED_BY_PUBLIC_SOURCE'
  | 'DISMISSED';

export type FireEventStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'CORRELATED'
  | 'CONFIRMED_BY_PUBLIC_SOURCE'
  | 'DISMISSED';

export type FireAlertSeverity = 'INFO' | 'LOW' | 'MODERATE' | 'HIGH';

export type FireRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export type SatelliteSensor =
  | 'VIIRS_SNPP'
  | 'VIIRS_NOAA20'
  | 'VIIRS_NOAA21'
  | 'MODIS_TERRA'
  | 'MODIS_AQUA';

export interface FireDetection {
  detection_id: string;
  source_id: string; // e.g. 'SRC-NASA-FIRMS-VIIRS'
  source_record_id: string;
  latitude: number;
  longitude: number;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lon, lat]
  };
  acquisition_time: string; // ISO 8601
  confidence: 'nominal' | 'high' | 'low' | string;
  confidence_numeric?: number; // 0 - 100
  brightness: number; // Kelvin
  bright_t31?: number | null; // Kelvin
  frp?: number | null; // Fire Radiative Power (MW)
  satellite: SatelliteSensor;
  instrument: 'VIIRS' | 'MODIS';
  day_night?: 'D' | 'N' | null;
  version: string;
  source_url: string;
  retrieved_at: string;
  raw_reference?: string;
  status: FireDetectionStatus;
  data_quality_flag: 'VALID' | 'DATA_QUALITY_ERROR' | 'DUPLICATE_SUSPECT';

  // Spatial enrichment attributes (derived from public layers via SpatialEventEnrichmentService)
  kph_unit?: string | null;
  kabupaten?: string | null;
  kecamatan?: string | null;
  desa?: string | null;
  forest_zone?: string | null;
  is_peatland?: boolean;
  peat_depth?: string | null;
  near_river?: boolean;
  river_distance_meters?: number | null;
  near_road?: boolean;
  road_distance_meters?: number | null;
  tutupan_lahan?: string | null;

  created_at: string;
}

export interface FireEventGeometry {
  type: 'Point' | 'MultiPoint' | 'Polygon';
  coordinates: any;
}

export interface FireEvent {
  event_id: string;
  event_type: 'FIRE_CLUSTER' | 'REPEATED_HOTSPOT' | 'ISOLATED_ANOMALY';
  geometry: FireEventGeometry;
  estimated_event_extent_ha?: number; // Strictly labeled as DERIVED ESTIMATE
  centroid: [number, number]; // [lon, lat]
  first_detected_at: string;
  last_detected_at: string;
  duration_hours: number;
  detection_count: number;
  source_count: number;
  max_brightness_kelvin: number;
  total_frp_mw?: number | null;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  status: FireEventStatus;
  analysis_run_id?: string;

  // Geospatial context
  kph_unit?: string | null;
  kabupaten?: string | null;
  kecamatan?: string | null;
  desa?: string | null;
  forest_zone?: string | null;
  is_peatland: boolean;
  peat_depth?: string | null;
  nearest_river_name?: string | null;
  distance_to_river_m?: number | null;
  nearest_road_name?: string | null;
  distance_to_road_m?: number | null;

  // Weather context
  weather_station?: string;
  temperature_c?: number;
  humidity_percent?: number;
  wind_speed_kmh?: number;
  wind_direction_deg?: number;
  rainfall_24h_mm?: number;
  rainfall_7d_mm?: number;
  fire_weather_index?: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'EKSTREM';

  recurring_indicator: boolean;
  recurrence_count_90d: number;
  detection_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface FireLandChangeCorrelation {
  correlation_id: string;
  fire_event_id: string;
  land_change_event_id: string; // Links to LandChangeEvent in Phase 5
  spatial_relationship: 'OVERLAPPING' | 'WITHIN_BUFFER_500M' | 'WITHIN_BUFFER_1KM' | 'NEARBY';
  distance_meters: number;
  temporal_relationship: 'CONCURRENT' | 'FIRE_PRECEDED_CHANGE' | 'CHANGE_PRECEDED_FIRE';
  time_difference_days: number;
  correlation_score: number; // 0 - 100
  method: string;
  causality_caveat: string; // "Potential correlation, not legal proof of cause"
  analysis_run_id?: string;
  created_at: string;
}

export interface RiskFactor {
  weight: number;
  score: number; // 0 - 100
  level: FireRiskLevel;
  observed_value: string;
  description: string;
}

export interface FireRiskEvaluation {
  evaluation_id: string;
  aoi_id: string;
  aoi_name: string;
  evaluated_at: string;
  risk_level: FireRiskLevel;
  composite_score: number; // 0 - 100
  model_version: string;
  formula_expression: string;
  factor_breakdown: {
    recent_hotspots: RiskFactor;
    rainfall_deficit: RiskFactor;
    atmospheric_dryness: RiskFactor;
    peatland_flammability: RiskFactor;
    historical_fire_frequency: RiskFactor;
  };
  caveat: string;
}

export interface FireAlert {
  alert_id: string;
  alert_type:
    | 'MULTIPLE_HOTSPOT_CLUSTER'
    | 'REPEATED_HOTSPOT_ALERT'
    | 'HIGH_DENSITY_ALERT'
    | 'HIGH_FIRE_RISK'
    | 'CORRELATED_LAND_CHANGE'
    | 'PROTECTED_FOREST_ANOMALY';
  severity: FireAlertSeverity;
  event_id?: string;
  detection_id?: string;
  headline: string;
  reason: string;
  evidence: string;
  source: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export interface FireHistorySummary {
  period: '7d' | '30d' | '90d' | '180d' | '1y' | 'custom';
  date_start: string;
  date_end: string;
  total_hotspots: number;
  total_fire_events: number;
  unique_locations_count: number;
  repeated_hotspots_count: number;
  by_satellite: Record<string, number>;
  by_district: Record<string, number>;
  by_forest_zone: Record<string, number>;
  daily_trend: Array<{ date: string; hotspot_count: number; event_count: number }>;
}

export interface FireDensityGridCell {
  cell_id: string;
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  detection_count: number;
  density_per_sqkm: number;
  density_level: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RecurringHotspotCluster {
  cluster_id: string;
  latitude: number;
  longitude: number;
  kecamatan: string;
  forest_zone: string;
  is_peatland: boolean;
  detections_7d: number;
  detections_30d: number;
  detections_90d: number;
  recurrence_intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CHRONIC';
  first_seen: string;
  last_seen: string;
}

export interface FireWeatherContext {
  station_name: string;
  distance_to_station_km: number;
  observation_time: string;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_direction_cardinal: string;
  rainfall_24h_mm: number;
  rainfall_3d_mm: number;
  rainfall_7d_mm: number;
  rainfall_14d_mm: number;
  rainfall_30d_mm: number;
  fire_weather_index: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'EKSTREM';
  drought_code: string;
  source_id: string;
  source_url: string;
}

export interface FireAnalysisRun {
  analysis_run_id: string;
  analysis_type: string;
  parameters: Record<string, any>;
  method: string;
  version: string;
  input_data_summary: Record<string, any>;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface FireProviderStatusInfo {
  source_id: string;
  provider_name: string;
  supported_instruments: string[];
  status: string;
  endpoint: string;
  documentation_url: string;
  last_successful_update: string | null;
  reliability: string;
}
