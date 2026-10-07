import {
  OsintSource,
  OsintSourceRecord,
  OsintSnapshot,
  OsintEntity,
  OsintEvent,
  OsintSpatialCorrelation,
  CollectorHarvestResult,
  OsintAnalyticsSummary,
} from '../types/osint';

export class OsintApiService {
  /**
   * Fetch all registered OSINT sources
   */
  public static async getSources(): Promise<OsintSource[]> {
    try {
      const res = await fetch('/api/v1/osint/sources');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.sources || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch source by ID
   */
  public static async getSourceById(id: string): Promise<OsintSource | null> {
    try {
      const res = await fetch(`/api/v1/osint/sources/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.source || null;
    } catch {
      return null;
    }
  }

  /**
   * Register new public source
   */
  public static async registerSource(source: Partial<OsintSource>): Promise<OsintSource> {
    const res = await fetch('/api/v1/osint/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Failed to register source: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.source;
  }

  /**
   * Fetch raw source records with optional filters
   */
  public static async getRecords(params?: {
    source_id?: string;
    query?: string;
  }): Promise<OsintSourceRecord[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.source_id) queryParams.set('source_id', params.source_id);
      if (params?.query) queryParams.set('query', params.query);

      const res = await fetch(`/api/v1/osint/records?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.records || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch single record detail
   */
  public static async getRecordById(id: string): Promise<{
    record: OsintSourceRecord;
    snapshot?: OsintSnapshot;
    entities?: OsintEntity[];
  } | null> {
    try {
      const res = await fetch(`/api/v1/osint/records/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch intelligence events with optional filters
   */
  public static async getEvents(params?: {
    kecamatan?: string;
    activity_type?: string;
    correlated_only?: boolean;
    query?: string;
  }): Promise<OsintEvent[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.kecamatan) queryParams.set('kecamatan', params.kecamatan);
      if (params?.activity_type) queryParams.set('activity_type', params.activity_type);
      if (params?.correlated_only) queryParams.set('correlated_only', 'true');
      if (params?.query) queryParams.set('query', params.query);

      const res = await fetch(`/api/v1/osint/events?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.events || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch single event with correlations and entities
   */
  public static async getEventById(id: string): Promise<OsintEvent | null> {
    try {
      const res = await fetch(`/api/v1/osint/events/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.event || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch all spatial cross-module correlations
   */
  public static async getCorrelations(): Promise<OsintSpatialCorrelation[]> {
    try {
      const res = await fetch('/api/v1/osint/correlations');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.correlations || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch analytics metrics
   */
  public static async getAnalytics(): Promise<OsintAnalyticsSummary | null> {
    try {
      const res = await fetch('/api/v1/osint/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.analytics || null;
    } catch {
      return null;
    }
  }

  /**
   * Trigger polite public web harvest cycle
   */
  public static async triggerHarvest(): Promise<CollectorHarvestResult> {
    const res = await fetch('/api/v1/osint/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Failed to trigger harvest: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.harvestResult;
  }

  /**
   * Re-run NLP extraction & spatial correlation pipeline
   */
  public static async reprocessPipeline(): Promise<{
    success: boolean;
    events_count: number;
    correlations_count: number;
  }> {
    const res = await fetch('/api/v1/osint/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Failed to reprocess pipeline: HTTP ${res.status}`);
    }
    return await res.json();
  }
}
