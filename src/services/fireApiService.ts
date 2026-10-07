import {
  FireDetection,
  FireEvent,
  FireAlert,
  FireLandChangeCorrelation,
  FireRiskEvaluation,
  FireHistorySummary,
  FireDensityGridCell,
  RecurringHotspotCluster,
  FireWeatherContext,
  FireProviderStatusInfo,
} from '../types/fire';

export class FireApiService {
  private static baseUrl = '/api/fire';

  public static async getProviders(): Promise<FireProviderStatusInfo[]> {
    try {
      const res = await fetch(`${this.baseUrl}/providers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.providers || [];
    } catch (err) {
      console.warn('API error fetching fire providers:', err);
      return [];
    }
  }

  public static async getHotspots(params?: {
    satellite?: string;
    kph_unit?: string;
    kecamatan?: string;
    confidence?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<FireDetection[]> {
    try {
      const q = new URLSearchParams();
      if (params?.satellite && params.satellite !== 'ALL') q.set('satellite', params.satellite);
      if (params?.kph_unit && params.kph_unit !== 'ALL') q.set('kph_unit', params.kph_unit);
      if (params?.kecamatan && params.kecamatan !== 'ALL') q.set('kecamatan', params.kecamatan);
      if (params?.confidence && params.confidence !== 'ALL') q.set('confidence', params.confidence);
      if (params?.status && params.status !== 'ALL') q.set('status', params.status);
      if (params?.limit) q.set('limit', String(params.limit));

      const res = await fetch(`${this.baseUrl}/hotspots?${q.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.detections || [];
    } catch (err) {
      console.warn('API error fetching hotspots:', err);
      return [];
    }
  }

  public static async getHotspotById(id: string): Promise<FireDetection | null> {
    try {
      const res = await fetch(`${this.baseUrl}/hotspots/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.detection || null;
    } catch (err) {
      console.warn(`API error fetching hotspot ${id}:`, err);
      return null;
    }
  }

  public static async getEvents(params?: {
    status?: string;
    confidence?: string;
    kecamatan?: string;
  }): Promise<FireEvent[]> {
    try {
      const q = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') q.set('status', params.status);
      if (params?.confidence && params.confidence !== 'ALL') q.set('confidence', params.confidence);
      if (params?.kecamatan && params.kecamatan !== 'ALL') q.set('kecamatan', params.kecamatan);

      const res = await fetch(`${this.baseUrl}/events?${q.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.events || [];
    } catch (err) {
      console.warn('API error fetching fire events:', err);
      return [];
    }
  }

  public static async getEventById(id: string): Promise<FireEvent | null> {
    try {
      const res = await fetch(`${this.baseUrl}/events/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.event || null;
    } catch (err) {
      console.warn(`API error fetching fire event ${id}:`, err);
      return null;
    }
  }

  public static async getHistoricalSummary(
    period: '7d' | '30d' | '90d' | '180d' | '1y' = '30d'
  ): Promise<FireHistorySummary | null> {
    try {
      const res = await fetch(`${this.baseUrl}/history?period=${period}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API error fetching fire history:', err);
      return null;
    }
  }

  public static async getDensityGrid(): Promise<FireDensityGridCell[]> {
    try {
      const res = await fetch(`${this.baseUrl}/density`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.grid || [];
    } catch (err) {
      console.warn('API error fetching density grid:', err);
      return [];
    }
  }

  public static async getRecurringHotspots(): Promise<RecurringHotspotCluster[]> {
    try {
      const res = await fetch(`${this.baseUrl}/recurring`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.recurring || [];
    } catch (err) {
      console.warn('API error fetching recurring hotspots:', err);
      return [];
    }
  }

  public static async getFireRisk(aoiId?: string): Promise<FireRiskEvaluation | null> {
    try {
      const q = aoiId ? `?aoi_id=${encodeURIComponent(aoiId)}` : '';
      const res = await fetch(`${this.baseUrl}/risk${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API error fetching fire risk:', err);
      return null;
    }
  }

  public static async getAlerts(severity?: string, status?: string): Promise<FireAlert[]> {
    try {
      const q = new URLSearchParams();
      if (severity && severity !== 'ALL') q.set('severity', severity);
      if (status && status !== 'ALL') q.set('status', status);

      const res = await fetch(`${this.baseUrl}/alerts?${q.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.alerts || [];
    } catch (err) {
      console.warn('API error fetching fire alerts:', err);
      return [];
    }
  }

  public static async getWeatherContext(): Promise<FireWeatherContext | null> {
    try {
      const res = await fetch(`${this.baseUrl}/weather-context`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API error fetching weather context:', err);
      return null;
    }
  }

  public static async getCorrelations(): Promise<FireLandChangeCorrelation[]> {
    try {
      const res = await fetch(`${this.baseUrl}/correlation/land-change`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.correlations || [];
    } catch (err) {
      console.warn('API error fetching correlations:', err);
      return [];
    }
  }

  public static async triggerAnalysis(options?: {
    maxSpatialDistanceMeters?: number;
    maxTemporalGapHours?: number;
    minDetectionCount?: number;
  }): Promise<{
    events: FireEvent[];
    risk: FireRiskEvaluation;
    alerts: FireAlert[];
    correlations: FireLandChangeCorrelation[];
  }> {
    const res = await fetch(`${this.baseUrl}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
}
