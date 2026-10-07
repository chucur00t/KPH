/**
 * GIS & Spatial Intelligence Types & Domain Models
 * Phase 4: KPH Intelligence Geodetic & PostGIS Architecture
 * Target Area: KPH Sintang Timur & Kabupaten Sintang, Kalimantan Barat
 */

export const GIS_LAYER_CATEGORIES = [
  'KPH Boundary',
  'Kabupaten',
  'Kecamatan',
  'Desa',
  'Sungai',
  'Jalan',
  'Kawasan Hutan',
  'Fungsi Kawasan',
  'Tutupan Lahan',
  'Gambut',
  'Perhutanan Sosial',
  'Perkebunan',
  'Pertambangan',
  'Konsesi/Izin publik',
  'Infrastruktur publik',
  'Fire Events',
  'Land Change Events',
  'OSINT Events',
  'Intelligence Events',
] as const;

export type GisLayerCategory = (typeof GIS_LAYER_CATEGORIES)[number];

export const GIS_DATA_STATUSES = [
  'AVAILABLE',
  'PARTIAL',
  'NOT_AVAILABLE',
  'ERROR',
  'STALE',
] as const;

export type GisDataStatus = (typeof GIS_DATA_STATUSES)[number];

export type GisGeometryType =
  | 'Point'
  | 'MultiPoint'
  | 'LineString'
  | 'MultiLineString'
  | 'Polygon'
  | 'MultiPolygon'
  | 'GeometryCollection';

export interface LayerStyleConfig {
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  weight?: number;
  dashArray?: string;
  markerIcon?: string;
  markerColor?: string;
}

/**
 * Layer Registry Item
 * Corresponds to database table: gis_layers
 */
export interface GisLayerRecord {
  layer_id: string;
  layer_name: string;
  layer_code: string;
  category: GisLayerCategory;
  description: string;
  geometry_type: GisGeometryType;
  source_id: string;
  source_layer_name: string;
  source_url: string;
  license: string;
  attribution: string;
  srid: number; // e.g. 4326 (WGS84)
  style_config: LayerStyleConfig;
  visibility_default: boolean;
  enabled: boolean;
  last_updated: string;
  data_status: GisDataStatus;
  features_count?: number;
}

/**
 * Standard GeoJSON Feature for KPH Intelligence
 */
export interface GisSpatialFeature {
  feature_id: string;
  layer_id: string;
  type: 'Feature';
  geometry: {
    type: GisGeometryType;
    coordinates: any;
  };
  properties: Record<string, any>;
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  source_id: string;
  source_record_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GisFeatureCollection {
  type: 'FeatureCollection';
  layer_id?: string;
  features: GisSpatialFeature[];
  total_count?: number;
  page?: number;
  limit?: number;
}

/**
 * Spatial Event Location Model
 * Separates observed raw location from derived geospatial intelligence context
 */
export interface EventLocationModel {
  event_id: string;
  observed_location: {
    latitude: number;
    longitude: number;
    location_accuracy_meters?: number;
    location_source: string; // e.g. "NASA_VIIRS_SENSOR", "SENTINEL2_PIXEL", "OSINT_GAZETTEER"
    recorded_at: string;
  };
  derived_location_context: {
    administrative_area: {
      kabupaten: string | null;
      kecamatan: string | null;
      desa: string | null;
      data_status: GisDataStatus;
      source: string;
    };
    kph_area: {
      kph_name: string | null;
      kph_unit_code: string | null;
      is_inside_kph: boolean;
      data_status: GisDataStatus;
      source: string;
    };
    forest_context: {
      kawasan_hutan: string | null; // e.g. "Hutan Lindung (HL)", "Hutan Produksi Terbatas (HPT)"
      fungsi_kawasan: string | null;
      sk_penetapan: string | null;
      tutupan_lahan: string | null;
      data_status: GisDataStatus;
      source: string;
    };
    environment_context: {
      gambut: {
        is_peatland: boolean;
        khg_name: string | null;
        kerentanan_kebakaran: string | null;
        data_status: GisDataStatus;
        source: string;
      };
      nearest_river: {
        river_name: string | null;
        distance_meters: number | null;
        is_within_river_buffer: boolean; // 100m statutory river buffer
        data_status: GisDataStatus;
        source: string;
      };
      nearest_road: {
        road_name: string | null;
        distance_meters: number | null;
        is_within_road_buffer: boolean; // 500m access buffer
        data_status: GisDataStatus;
        source: string;
      };
    };
    public_activity_context: {
      perkebunan: {
        name: string | null;
        status_hgu: string | null;
        data_status: GisDataStatus;
        source: string;
        notes: string;
      };
      pertambangan: {
        wiup_name: string | null;
        tahap_izin: string | null;
        data_status: GisDataStatus;
        source: string;
      };
      perhutanan_sosial: {
        sk_skema: string | null;
        nama_lembaga: string | null;
        data_status: GisDataStatus;
        source: string;
      };
      konsesi_publik: {
        nama_konsesi: string | null;
        data_status: GisDataStatus;
        source: string;
        notes: string;
      };
    };
    spatial_summary_statement: string; // Anti-false certainty language
    enriched_at: string;
  };
}

export interface BoundingBoxQuery {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}
