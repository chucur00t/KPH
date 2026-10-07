import { FireDetection } from '../../types/fire';

export interface FireQueryParams {
  date_start?: string;
  date_end?: string;
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  kph_unit?: string;
  kecamatan?: string;
  satellite?: string;
  confidence?: string;
  min_brightness?: number;
  min_frp?: number;
  limit?: number;
  offset?: number;
}

export interface FireDataProviderMetadata {
  source_id: string;
  provider_name: string;
  supported_instruments: string[];
  supported_satellites: string[];
  update_frequency: string;
  license: string;
  documentation_url: string;
}

export interface IFireDataProvider {
  readonly sourceId: string;
  readonly providerName: string;
  readonly isVerified: boolean;

  /**
   * Retrieve active/recent fire detections matching query parameters
   */
  getHotspots(params?: FireQueryParams): Promise<FireDetection[]>;

  /**
   * Retrieve single hotspot detection by ID
   */
  getHotspotById(detectionId: string): Promise<FireDetection | null>;

  /**
   * Query historical fire detections across temporal window
   */
  getHistoricalHotspots(params: FireQueryParams): Promise<{
    total: number;
    detections: FireDetection[];
  }>;

  /**
   * Geographic bounding box coverage of provider feed
   */
  getCoverage(): Promise<[number, number, number, number]>;

  /**
   * Get technical metadata and provenance specification
   */
  getMetadata(): Promise<FireDataProviderMetadata>;
}
