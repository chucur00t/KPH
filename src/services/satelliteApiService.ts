import {
  SatelliteScene,
  SatelliteSceneMetadata,
  SceneSearchParams,
  LandChangeDetectionRequest,
  LandChangeDetectionResult,
  LandChangeEvent,
  LandObservation,
  SpectralIndexConfig,
} from '../types/satellite';
import { ProviderStatusInfo } from './satellite/satelliteProviderRegistry';

export class SatelliteApiService {
  private static baseUrl = '/api/v1/satellite';

  public static async getProviders(): Promise<ProviderStatusInfo[]> {
    try {
      const res = await fetch(`${this.baseUrl}/providers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.providers || [];
    } catch (err) {
      console.warn('API error fetching satellite providers:', err);
      return [];
    }
  }

  public static async searchScenes(params: SceneSearchParams): Promise<SatelliteScene[]> {
    try {
      const res = await fetch(`${this.baseUrl}/scenes/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.scenes || [];
    } catch (err) {
      console.warn('API error searching satellite scenes:', err);
      return [];
    }
  }

  public static async getSceneMetadata(sceneId: string): Promise<SatelliteSceneMetadata | null> {
    try {
      const res = await fetch(`${this.baseUrl}/scenes/${encodeURIComponent(sceneId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.metadata || null;
    } catch (err) {
      console.warn(`API error fetching scene metadata for ${sceneId}:`, err);
      return null;
    }
  }

  public static async runChangeDetection(
    req: LandChangeDetectionRequest
  ): Promise<LandChangeDetectionResult> {
    const res = await fetch(`${this.baseUrl}/change-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  public static async getChangeEvents(options?: {
    severity?: string;
    forest_zone?: string;
    status?: string;
    aoi_id?: string;
  }): Promise<LandChangeEvent[]> {
    try {
      const query = new URLSearchParams();
      if (options?.severity && options.severity !== 'ALL') query.set('severity', options.severity);
      if (options?.forest_zone && options.forest_zone !== 'ALL') query.set('forest_zone', options.forest_zone);
      if (options?.status && options.status !== 'ALL') query.set('status', options.status);
      if (options?.aoi_id && options.aoi_id !== 'ALL') query.set('aoi_id', options.aoi_id);

      const res = await fetch(`${this.baseUrl}/change-events?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.events || [];
    } catch (err) {
      console.warn('API error fetching land change events:', err);
      return [];
    }
  }

  public static async getChangeEventById(eventId: string): Promise<LandChangeEvent | null> {
    try {
      const res = await fetch(`${this.baseUrl}/change-events/${encodeURIComponent(eventId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.event || null;
    } catch (err) {
      console.warn(`API error fetching event ${eventId}:`, err);
      return null;
    }
  }

  public static async getSpectralIndices(): Promise<SpectralIndexConfig[]> {
    try {
      const res = await fetch(`${this.baseUrl}/indices`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.indices || [];
    } catch (err) {
      console.warn('API error fetching spectral indices:', err);
      return [];
    }
  }

  public static async createObservation(params: {
    scene_id: string;
    aoi_id: string;
    index_type?: string;
  }): Promise<LandObservation> {
    const res = await fetch(`${this.baseUrl}/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}
