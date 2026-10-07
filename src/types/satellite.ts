/**
 * KPH Intelligence - Satellite & Land Change Domain Types
 * Strict compliance with Phase 5 Specification
 */

export type SatelliteProviderType = 'Copernicus' | 'USGS' | 'Element84' | 'Generic';
export type SatelliteName = 'Sentinel-2A' | 'Sentinel-2B' | 'Landsat-8' | 'Landsat-9';
export type SensorType = 'MSI' | 'OLI-2' | 'OLI';
export type SpectralIndexType = 'NDVI' | 'NDWI' | 'NBR';
export type ChangeSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type ChangeEventStatus = 'DETECTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
export type ChangeEventType = 'CANOPY_LOSS' | 'DEVEGETATION' | 'CLEARING' | 'FOREST_DISTURBANCE';

export interface SceneFootprint {
  type: 'Polygon';
  coordinates: number[][][]; // GeoJSON Polygon
}

export interface SatelliteScene {
  scene_id: string;
  provider: SatelliteProviderType;
  satellite: SatelliteName;
  sensor: SensorType;
  acquisition_date: string; // ISO 8601
  cloud_cover_percent: number;
  processing_level: string; // e.g. 'Level-2A BOA'
  footprint: SceneFootprint;
  available_bands: string[];
  resolution_meters: number;
  source_id: string; // Links to Phase 3 Registry (e.g. 'SRC-ESA-COPERNICUS-S2')
  source_url: string;
  thumbnail_url?: string | null;
  tile_id?: string; // e.g. '49MCV' (Sintang)
  retrieved_at: string;
}

export interface SatelliteSceneMetadata extends SatelliteScene {
  sun_elevation?: number;
  sun_azimuth?: number;
  projection?: string; // e.g. 'EPSG:32649'
  raster_assets?: Record<string, RasterAssetInfo>;
}

export interface RasterAssetInfo {
  band: string;
  href: string;
  media_type: string;
  title: string;
  resolution_meters: number;
}

export interface SceneSearchParams {
  aoi_id?: string;
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  polygon?: SceneFootprint;
  date_start: string; // ISO 8601
  date_end: string; // ISO 8601
  max_cloud_cover?: number; // 0 - 100
  satellite?: SatelliteName | 'ALL';
  sensor?: SensorType;
  limit?: number;
}

export interface ObservationStatistics {
  min: number;
  max: number;
  mean: number;
  std_dev: number;
  histogram?: { bin_start: number; bin_end: number; count: number }[];
  p10?: number;
  p50?: number;
  p90?: number;
}

export interface LandObservation {
  observation_id: string;
  scene_id: string;
  aoi_id: string;
  observation_date: string;
  geometry: SceneFootprint;
  index_type: SpectralIndexType;
  value: number; // Mean index value
  statistics: ObservationStatistics;
  processing_method: string;
  processing_version: string;
  source_id: string;
  created_at: string;
}

export interface LandChangeDetectionRequest {
  baseline_scene_id: string; // T0
  comparison_scene_id: string; // T1
  aoi_id: string;
  custom_polygon?: SceneFootprint;
  index_type: SpectralIndexType;
  sensitivity_threshold?: number; // e.g. -0.25 to -0.35
}

export interface LandChangeDetectionResult {
  detection_id: string;
  baseline_scene_id: string;
  comparison_scene_id: string;
  baseline_date: string;
  comparison_date: string;
  aoi_id: string;
  index_type: SpectralIndexType;
  threshold_applied: number;
  total_area_analyzed_ha: number;
  loss_area_ha: number;
  gain_area_ha: number;
  stable_area_ha: number;
  status: 'COMPLETED' | 'FAILED';
  processing_duration_ms: number;
  events_generated: LandChangeEvent[];
  detected_at: string;
}

export interface LandChangeEvent {
  event_id: string;
  detection_id?: string;
  detected_at?: string;
  baseline_date?: string;
  baseline_scene_id: string;
  comparison_scene_id: string;
  event_type: ChangeEventType;
  severity: ChangeSeverity;
  status: ChangeEventStatus;
  area_ha: number;
  mean_delta_index: number;
  geometry: SceneFootprint;
  centroid_latitude: number;
  centroid_longitude: number;
  aoi_id: string;
  kecamatan: string;
  desa?: string;
  forest_zone: string; // 'Hutan Lindung', 'Hutan Produksi Terbatas', 'Hutan Produksi Tetap', etc.
  in_kph: boolean;
  near_river: boolean;
  river_distance_m?: number;
  near_road?: boolean;
  road_distance_m?: number;
  in_peatland?: boolean;
  peat_depth?: string;
  confidence_score: number; // 0 - 100
  // Provenance attributes (Phase 3 & 4 alignment)
  source_id: string;
  source_name: string;
  source_url: string;
  acquisition_date: string;
  processing_date: string;
  processing_method: string;
  processing_version: string;
}

export interface SpectralBandMapping {
  nir: string;
  red?: string;
  green?: string;
  swir?: string;
}

export interface SpectralIndexConfig {
  index_id: SpectralIndexType;
  index_name: string;
  formula_expression: string;
  band_mappings: Record<string, SpectralBandMapping>;
  description: string;
  loss_threshold: number;
}
