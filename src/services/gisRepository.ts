import fs from 'fs';
import path from 'path';
import { GisLayerRecord, GisSpatialFeature, GisDataStatus, GisFeatureCollection } from '../types/gis';
import { SEED_GIS_LAYERS, SEED_SPATIAL_FEATURES } from '../data/seedGisLayers';
import { SpatialEngineService } from './spatialEngineService';
import { SpatialEventEnrichmentService, RawEventLocationInput } from './spatialEventEnrichmentService';

export class GisRepository {
  private static dataDir = path.resolve(process.cwd(), 'data');
  private static layersFilePath = path.join(GisRepository.dataDir, 'gis_layers_registry.json');
  private static featuresFilePath = path.join(GisRepository.dataDir, 'gis_spatial_features.json');

  private static initialized = false;
  private static layersCache: GisLayerRecord[] = [];
  private static featuresCache: GisSpatialFeature[] = [];

  public static init(): void {
    if (this.initialized) return;

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Load or seed layers
    if (fs.existsSync(this.layersFilePath)) {
      try {
        const raw = fs.readFileSync(this.layersFilePath, 'utf-8');
        this.layersCache = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading GIS layers file, fallback to seed:', err);
        this.layersCache = [...SEED_GIS_LAYERS];
        this.saveLayers();
      }
    } else {
      this.layersCache = [...SEED_GIS_LAYERS];
      this.saveLayers();
    }

    // Load or seed spatial features
    if (fs.existsSync(this.featuresFilePath)) {
      try {
        const raw = fs.readFileSync(this.featuresFilePath, 'utf-8');
        this.featuresCache = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading GIS features file, fallback to seed:', err);
        this.featuresCache = [...SEED_SPATIAL_FEATURES];
        this.saveFeatures();
      }
    } else {
      this.featuresCache = [...SEED_SPATIAL_FEATURES];
      this.saveFeatures();
    }

    // Sync features_count in layers
    for (const layer of this.layersCache) {
      const count = this.featuresCache.filter((f) => f.layer_id === layer.layer_id).length;
      if (layer.features_count !== undefined) {
        layer.features_count = count > 0 ? count : layer.features_count;
      }
    }

    this.initialized = true;
  }

  private static saveLayers(): void {
    try {
      fs.writeFileSync(this.layersFilePath, JSON.stringify(this.layersCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save GIS layers file:', e);
    }
  }

  private static saveFeatures(): void {
    try {
      fs.writeFileSync(this.featuresFilePath, JSON.stringify(this.featuresCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save GIS features file:', e);
    }
  }

  // --- QUERY APIS ---

  public static getLayers(category?: string, status?: string): GisLayerRecord[] {
    this.init();
    let result = [...this.layersCache];
    if (category && category !== 'ALL') {
      result = result.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== 'ALL') {
      result = result.filter((l) => l.data_status.toLowerCase() === status.toLowerCase());
    }
    return result;
  }

  public static getLayerById(layerId: string): GisLayerRecord | null {
    this.init();
    return this.layersCache.find((l) => l.layer_id === layerId || l.layer_code === layerId) || null;
  }

  public static getFeatures(options?: {
    layer_id?: string;
    bbox?: [number, number, number, number];
    page?: number;
    limit?: number;
  }): GisFeatureCollection {
    this.init();
    let list = [...this.featuresCache];

    if (options?.layer_id) {
      list = list.filter((f) => f.layer_id === options.layer_id);
    }

    if (options?.bbox) {
      list = list.filter((f) => {
        const featureBbox = f.bbox || SpatialEngineService.computeBBox(f.geometry as any);
        return SpatialEngineService.bboxIntersects(featureBbox, options.bbox!);
      });
    }

    const total = list.length;
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 50));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      type: 'FeatureCollection',
      layer_id: options?.layer_id,
      features: paginated,
      total_count: total,
      page,
      limit,
    };
  }

  public static getFeatureById(featureId: string): GisSpatialFeature | null {
    this.init();
    return this.featuresCache.find((f) => f.feature_id === featureId) || null;
  }

  /**
   * Point Query (Point in Polygon across all active vector layers)
   */
  public static pointQuery(lat: number, lon: number): {
    latitude: number;
    longitude: number;
    intersectingFeatures: Array<{
      layer_id: string;
      layer_name: string;
      category: string;
      feature_id: string;
      properties: Record<string, any>;
    }>;
  } {
    this.init();
    const pt: [number, number] = [lon, lat];
    const matches: any[] = [];

    for (const feature of this.featuresCache) {
      const layer = this.layersCache.find((l) => l.layer_id === feature.layer_id);
      if (!layer || layer.data_status === 'NOT_AVAILABLE') continue;

      if (feature.geometry.type === 'Polygon') {
        if (SpatialEngineService.pointInPolygon(pt, feature.geometry.coordinates)) {
          matches.push({
            layer_id: layer.layer_id,
            layer_name: layer.layer_name,
            category: layer.category,
            feature_id: feature.feature_id,
            properties: feature.properties,
          });
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        if (SpatialEngineService.pointInMultiPolygon(pt, feature.geometry.coordinates)) {
          matches.push({
            layer_id: layer.layer_id,
            layer_name: layer.layer_name,
            category: layer.category,
            feature_id: feature.feature_id,
            properties: feature.properties,
          });
        }
      }
    }

    return {
      latitude: lat,
      longitude: lon,
      intersectingFeatures: matches,
    };
  }

  /**
   * Nearby Query: finds features within maxDistanceMeters
   */
  public static nearbyQuery(
    lat: number,
    lon: number,
    maxDistanceMeters = 5000,
    category?: string
  ) {
    this.init();
    const results: Array<{
      feature_id: string;
      layer_id: string;
      layer_name: string;
      distanceMeters: number;
      properties: Record<string, any>;
    }> = [];

    for (const f of this.featuresCache) {
      const layer = this.layersCache.find((l) => l.layer_id === f.layer_id);
      if (!layer || (category && layer.category.toLowerCase() !== category.toLowerCase())) {
        continue;
      }

      if (f.geometry.type === 'LineString') {
        const { distanceMeters } = SpatialEngineService.pointToLineDistanceMeters(
          lat,
          lon,
          f.geometry.coordinates
        );
        if (distanceMeters <= maxDistanceMeters) {
          results.push({
            feature_id: f.feature_id,
            layer_id: layer.layer_id,
            layer_name: layer.layer_name,
            distanceMeters,
            properties: f.properties,
          });
        }
      } else if (f.geometry.type === 'Point') {
        const [fLon, fLat] = f.geometry.coordinates;
        const dist = SpatialEngineService.haversineDistance(lat, lon, fLat, fLon);
        if (dist <= maxDistanceMeters) {
          results.push({
            feature_id: f.feature_id,
            layer_id: layer.layer_id,
            layer_name: layer.layer_name,
            distanceMeters: Math.round(dist),
            properties: f.properties,
          });
        }
      }
    }

    results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return results;
  }

  /**
   * Ingest new spatial feature with strict validation
   */
  public static ingestFeature(candidate: Partial<GisSpatialFeature>): {
    success: boolean;
    feature?: GisSpatialFeature;
    error?: string;
  } {
    this.init();

    if (!candidate.layer_id) {
      return { success: false, error: 'layer_id wajib disertakan.' };
    }
    const layer = this.layersCache.find((l) => l.layer_id === candidate.layer_id);
    if (!layer) {
      return { success: false, error: `Layer '${candidate.layer_id}' tidak ditemukan dalam GIS Layer Registry.` };
    }

    const validation = SpatialEngineService.validateGeometry(candidate.geometry as any);
    if (!validation.valid) {
      return { success: false, error: `Geometri tidak valid: ${validation.error}` };
    }

    const bbox = SpatialEngineService.computeBBox(candidate.geometry as any);
    const nowIso = new Date().toISOString();

    const newFeature: GisSpatialFeature = {
      feature_id: candidate.feature_id || `FEAT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      layer_id: candidate.layer_id,
      type: 'Feature',
      geometry: candidate.geometry as any,
      properties: candidate.properties || {},
      bbox,
      source_id: candidate.source_id || layer.source_id,
      source_record_id: candidate.source_record_id,
      created_at: nowIso,
      updated_at: nowIso,
    };

    this.featuresCache.unshift(newFeature);
    this.saveFeatures();

    layer.features_count = (layer.features_count || 0) + 1;
    layer.last_updated = nowIso;
    this.saveLayers();

    return { success: true, feature: newFeature };
  }

  /**
   * Enrich event location via SpatialEventEnrichmentService
   */
  public static enrichEvent(input: RawEventLocationInput) {
    return SpatialEventEnrichmentService.enrich(input);
  }
}
