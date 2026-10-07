import { GisLayerRecord, GisSpatialFeature, GisFeatureCollection, EventLocationModel } from '../types/gis';
import { SEED_GIS_LAYERS } from '../data/seedGisLayers';
import { SpatialEngineService } from './spatialEngineService';
import { SpatialEventEnrichmentService, RawEventLocationInput } from './spatialEventEnrichmentService';

export class GisApiService {
  /**
   * Fetch all registered GIS layers
   */
  public static async getLayers(category?: string, status?: string): Promise<GisLayerRecord[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);
      if (status && status !== 'ALL') params.append('status', status);

      const res = await fetch(`/api/gis/layers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.layers || [];
      }
    } catch (e) {
      console.warn('API error fetching GIS layers, using fallback:', e);
    }
    return SEED_GIS_LAYERS;
  }

  /**
   * Fetch features of a specific layer or viewport
   */
  public static async getFeatures(options?: {
    layer_id?: string;
    bbox?: [number, number, number, number];
    page?: number;
    limit?: number;
  }): Promise<GisFeatureCollection> {
    try {
      const params = new URLSearchParams();
      if (options?.layer_id) params.append('layer_id', options.layer_id);
      if (options?.bbox) params.append('bbox', options.bbox.join(','));
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));

      const res = await fetch(`/api/gis/features?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API error fetching GIS features:', e);
    }

    return {
      type: 'FeatureCollection',
      features: [],
      total_count: 0,
    };
  }

  /**
   * Point Query (Point in Polygon inspection)
   */
  public static async queryPoint(lat: number, lon: number): Promise<{
    latitude: number;
    longitude: number;
    intersectingFeatures: Array<{
      layer_id: string;
      layer_name: string;
      category: string;
      properties: Record<string, any>;
    }>;
  }> {
    try {
      const res = await fetch(`/api/gis/point-query?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API error queryPoint:', e);
    }

    return {
      latitude: lat,
      longitude: lon,
      intersectingFeatures: [],
    };
  }

  /**
   * Spatial Event Enrichment Pipeline
   */
  public static async enrichEventLocation(input: RawEventLocationInput): Promise<EventLocationModel> {
    try {
      const res = await fetch('/api/gis/enrichment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API error enriching event location, using local engine:', e);
    }

    // Local geodesic fallback
    return SpatialEventEnrichmentService.enrich(input);
  }

  /**
   * Calculate geodesic area in Hectares
   */
  public static async calculateArea(coords: Array<Array<[number, number]>>): Promise<{ areaHectares: number }> {
    try {
      const res = await fetch('/api/gis/area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: coords }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Local calculation
    }
    const ha = SpatialEngineService.calculateGeodesicAreaHa(coords);
    return { areaHectares: ha };
  }

  /**
   * Calculate distance between two coordinates
   */
  public static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return Math.round(SpatialEngineService.haversineDistance(lat1, lon1, lat2, lon2));
  }

  /**
   * Generate point buffer in meters
   */
  public static generateBuffer(lat: number, lon: number, distanceMeters: number): Array<[number, number]> {
    return SpatialEngineService.generatePointBuffer(lat, lon, distanceMeters);
  }
}
