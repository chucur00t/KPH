import fs from 'fs';
import path from 'path';
import {
  SatelliteScene,
  LandObservation,
  LandChangeEvent,
  LandChangeDetectionResult,
} from '../../types/satellite';
import { SatelliteProviderRegistry } from './satelliteProviderRegistry';

export class SatelliteRepository {
  private static dataDir = path.resolve(process.cwd(), 'data');
  private static scenesFile = path.join(SatelliteRepository.dataDir, 'satellite_scenes.json');
  private static eventsFile = path.join(SatelliteRepository.dataDir, 'land_change_events.json');
  private static observationsFile = path.join(SatelliteRepository.dataDir, 'land_observations.json');
  private static detectionsFile = path.join(SatelliteRepository.dataDir, 'land_change_detections.json');

  private static initialized = false;
  private static scenesCache: SatelliteScene[] = [];
  private static eventsCache: LandChangeEvent[] = [];
  private static observationsCache: LandObservation[] = [];
  private static detectionsCache: LandChangeDetectionResult[] = [];

  public static init(): void {
    if (this.initialized) return;

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize scenes cache
    if (fs.existsSync(this.scenesFile)) {
      try {
        const raw = fs.readFileSync(this.scenesFile, 'utf-8');
        this.scenesCache = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading scenes file:', e);
        this.scenesCache = [];
      }
    }

    // If scenes cache empty, load from providers
    if (this.scenesCache.length === 0) {
      SatelliteProviderRegistry.init();
      SatelliteProviderRegistry.searchScenes({
        date_start: '2026-01-01T00:00:00.000Z',
        date_end: '2026-12-31T23:59:59.000Z',
      }).then((scenes) => {
        this.scenesCache = scenes;
        this.saveScenes();
      });
    }

    // Initialize events cache
    if (fs.existsSync(this.eventsFile)) {
      try {
        const raw = fs.readFileSync(this.eventsFile, 'utf-8');
        this.eventsCache = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading land change events file:', e);
        this.eventsCache = this.getSeedEvents();
        this.saveEvents();
      }
    } else {
      this.eventsCache = this.getSeedEvents();
      this.saveEvents();
    }

    // Initialize observations cache
    if (fs.existsSync(this.observationsFile)) {
      try {
        const raw = fs.readFileSync(this.observationsFile, 'utf-8');
        this.observationsCache = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading observations file:', e);
        this.observationsCache = [];
      }
    }

    // Initialize detections cache
    if (fs.existsSync(this.detectionsFile)) {
      try {
        const raw = fs.readFileSync(this.detectionsFile, 'utf-8');
        this.detectionsCache = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading detections file:', e);
        this.detectionsCache = [];
      }
    }

    this.initialized = true;
  }

  private static getSeedEvents(): LandChangeEvent[] {
    return [
      {
        event_id: 'LCE-2026-0928-ST01',
        baseline_scene_id: 'S2A_MSIL2A_20260908T025551_N0500_R032_T49MCV_20260908T062002',
        comparison_scene_id: 'S2B_MSIL2A_20260928T025549_N0500_R032_T49MCV_20260928T054512',
        event_type: 'CANOPY_LOSS',
        severity: 'HIGH',
        status: 'DETECTED',
        area_ha: 8.4,
        mean_delta_index: -0.38,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [112.582, -0.626],
              [112.587, -0.625],
              [112.589, -0.629],
              [112.584, -0.631],
              [112.582, -0.626],
            ],
          ],
        },
        centroid_latitude: -0.628,
        centroid_longitude: 112.585,
        aoi_id: 'AOI-KPH-SINTANG-TIMUR',
        kecamatan: 'Serawai',
        desa: 'Nanga Serawai',
        forest_zone: 'Hutan Lindung (HL)',
        in_kph: true,
        near_river: true,
        river_distance_m: 85,
        near_road: false,
        road_distance_m: 640,
        in_peatland: false,
        confidence_score: 92,
        source_id: 'SRC-ESA-COPERNICUS-S2',
        source_name: 'Copernicus Data Space Ecosystem - Sentinel-2 MSI Level-2A',
        source_url: 'https://dataspace.copernicus.eu/browser/?lat=-0.628&lng=112.585&zoom=14',
        acquisition_date: '2026-09-28T02:55:49.000Z',
        processing_date: '2026-09-28T07:15:00.000Z',
        processing_method: 'Bi-temporal Difference (dNDVI) with Geodesic PostGIS Clustering',
        processing_version: 'v2.4.0-COPERNICUS-L2A',
      },
      {
        event_id: 'LCE-2026-0923-ST02',
        baseline_scene_id: 'S2B_MSIL2A_20260819T025549_N0500_R032_T49MCV_20260819T054000',
        comparison_scene_id: 'S2A_MSIL2A_20260923T025551_N0500_R032_T49MCV_20260923T061245',
        event_type: 'DEVEGETATION',
        severity: 'HIGH',
        status: 'UNDER_REVIEW',
        area_ha: 14.2,
        mean_delta_index: -0.42,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [112.822, -0.742],
              [112.828, -0.741],
              [112.831, -0.746],
              [112.824, -0.748],
              [112.822, -0.742],
            ],
          ],
        },
        centroid_latitude: -0.745,
        centroid_longitude: 112.825,
        aoi_id: 'AOI-KPH-SINTANG-TIMUR',
        kecamatan: 'Ambalau',
        desa: 'Nanga Ambalau',
        forest_zone: 'Hutan Produksi Terbatas (HPT)',
        in_kph: true,
        near_river: true,
        river_distance_m: 110,
        near_road: true,
        road_distance_m: 195,
        in_peatland: false,
        confidence_score: 95,
        source_id: 'SRC-ESA-COPERNICUS-S2',
        source_name: 'Copernicus Data Space Ecosystem - Sentinel-2 MSI Level-2A',
        source_url: 'https://dataspace.copernicus.eu/browser/?lat=-0.745&lng=112.825&zoom=14',
        acquisition_date: '2026-09-23T02:55:51.000Z',
        processing_date: '2026-09-23T08:30:00.000Z',
        processing_method: 'Bi-temporal Difference (dNDVI) with Geodesic PostGIS Clustering',
        processing_version: 'v2.4.0-COPERNICUS-L2A',
      },
      {
        event_id: 'LCE-2026-0918-ST03',
        baseline_scene_id: 'S2A_MSIL2A_20260715T025551_N0500_R032_T49MCV_20260715T061012',
        comparison_scene_id: 'S2B_MSIL2A_20260918T025549_N0500_R032_T49MCU_20260918T053011',
        event_type: 'CLEARING',
        severity: 'MEDIUM',
        status: 'VERIFIED',
        area_ha: 5.6,
        mean_delta_index: -0.26,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [112.182, -0.413],
              [112.187, -0.412],
              [112.189, -0.417],
              [112.184, -0.418],
              [112.182, -0.413],
            ],
          ],
        },
        centroid_latitude: -0.415,
        centroid_longitude: 112.185,
        aoi_id: 'AOI-KPH-SINTANG-TIMUR',
        kecamatan: 'Kayan Hulu',
        desa: 'Nanga Tebidah',
        forest_zone: 'Hutan Produksi Tetap (HP)',
        in_kph: true,
        near_river: false,
        river_distance_m: 420,
        near_road: true,
        road_distance_m: 140,
        in_peatland: false,
        confidence_score: 87,
        source_id: 'SRC-ESA-COPERNICUS-S2',
        source_name: 'Copernicus Data Space Ecosystem - Sentinel-2 MSI Level-2A',
        source_url: 'https://dataspace.copernicus.eu/browser/?lat=-0.415&lng=112.185&zoom=14',
        acquisition_date: '2026-09-18T02:55:49.000Z',
        processing_date: '2026-09-18T09:40:00.000Z',
        processing_method: 'Bi-temporal Difference (dNDVI) with Geodesic PostGIS Clustering',
        processing_version: 'v2.4.0-COPERNICUS-L2A',
      },
      {
        event_id: 'LCE-2026-0908-ST04',
        baseline_scene_id: 'S2B_MSIL2A_20260510T025549_N0500_R032_T49MCU_20260510T053522',
        comparison_scene_id: 'S2A_MSIL2A_20260908T025551_N0500_R032_T49MCV_20260908T062002',
        event_type: 'FOREST_DISTURBANCE',
        severity: 'LOW',
        status: 'DETECTED',
        area_ha: 3.2,
        mean_delta_index: -0.19,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [112.383, -0.560],
              [112.387, -0.560],
              [112.388, -0.564],
              [112.384, -0.565],
              [112.383, -0.560],
            ],
          ],
        },
        centroid_latitude: -0.562,
        centroid_longitude: 112.385,
        aoi_id: 'AOI-KPH-SINTANG-TIMUR',
        kecamatan: 'Menukung',
        desa: 'Nanga Menukung',
        forest_zone: 'Hutan Produksi Terbatas (HPT)',
        in_kph: true,
        near_river: true,
        river_distance_m: 90,
        near_road: false,
        road_distance_m: 820,
        in_peatland: false,
        confidence_score: 81,
        source_id: 'SRC-ESA-COPERNICUS-S2',
        source_name: 'Copernicus Data Space Ecosystem - Sentinel-2 MSI Level-2A',
        source_url: 'https://dataspace.copernicus.eu/browser/?lat=-0.562&lng=112.385&zoom=14',
        acquisition_date: '2026-09-08T02:55:51.000Z',
        processing_date: '2026-09-08T10:00:00.000Z',
        processing_method: 'Bi-temporal Difference (dNDVI) with Geodesic PostGIS Clustering',
        processing_version: 'v2.4.0-COPERNICUS-L2A',
      },
    ];
  }

  private static saveScenes(): void {
    try {
      fs.writeFileSync(this.scenesFile, JSON.stringify(this.scenesCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save scenes cache:', e);
    }
  }

  private static saveEvents(): void {
    try {
      fs.writeFileSync(this.eventsFile, JSON.stringify(this.eventsCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save events cache:', e);
    }
  }

  private static saveObservations(): void {
    try {
      fs.writeFileSync(this.observationsFile, JSON.stringify(this.observationsCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save observations cache:', e);
    }
  }

  private static saveDetections(): void {
    try {
      fs.writeFileSync(this.detectionsFile, JSON.stringify(this.detectionsCache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save detections cache:', e);
    }
  }

  public static getChangeEvents(options?: {
    severity?: string;
    forest_zone?: string;
    status?: string;
    aoi_id?: string;
  }): LandChangeEvent[] {
    this.init();
    let result = [...this.eventsCache];

    if (options?.severity && options.severity !== 'ALL') {
      result = result.filter((e) => e.severity === options.severity);
    }
    if (options?.forest_zone && options.forest_zone !== 'ALL') {
      result = result.filter((e) => e.forest_zone.includes(options.forest_zone!));
    }
    if (options?.status && options.status !== 'ALL') {
      result = result.filter((e) => e.status === options.status);
    }
    if (options?.aoi_id && options.aoi_id !== 'ALL') {
      result = result.filter((e) => e.aoi_id === options.aoi_id);
    }

    return result.sort((a, b) => new Date(b.acquisition_date).getTime() - new Date(a.acquisition_date).getTime());
  }

  public static getChangeEventById(eventId: string): LandChangeEvent | null {
    this.init();
    return this.eventsCache.find((e) => e.event_id === eventId) || null;
  }

  public static saveDetectionResult(result: LandChangeDetectionResult): void {
    this.init();
    this.detectionsCache.unshift(result);
    this.saveDetections();

    // Append new events if any
    if (result.events_generated && result.events_generated.length > 0) {
      this.eventsCache.unshift(...result.events_generated);
      this.saveEvents();
    }
  }

  public static saveObservation(obs: LandObservation): void {
    this.init();
    this.observationsCache.unshift(obs);
    this.saveObservations();
  }

  public static getObservations(): LandObservation[] {
    this.init();
    return this.observationsCache;
  }
}
