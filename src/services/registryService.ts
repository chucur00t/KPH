import {
  PublicSourceRecord,
  SourceProvenanceRecord,
  SourceHealthLog,
  SourceCategory,
  SourceStatus,
  SourceAccessMethod,
} from '../types/registry';
import { SEED_PUBLIC_SOURCES, SEED_PROVENANCE_RECORDS } from '../data/seedRegistry';

export interface RegistryFilterParams {
  category?: SourceCategory | 'ALL';
  status?: SourceStatus | 'ALL';
  access_method?: SourceAccessMethod | 'ALL';
  search?: string;
}

export interface RegistryStats {
  totalSources: number;
  active: number;
  degraded: number;
  offline: number;
  unverified: number;
  requiresReview: number;
  totalProvenanceRecords: number;
  byCategory: Record<string, number>;
  byAccessMethod: Record<string, number>;
}

export class RegistryService {
  /**
   * Fetch all registered public data sources with filtering
   */
  public static async getSources(filters?: RegistryFilterParams): Promise<{
    sources: PublicSourceRecord[];
    stats: RegistryStats;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.access_method && filters.access_method !== 'ALL') params.append('access_method', filters.access_method);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`/api/v1/registry/sources?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          sources: data.sources || [],
          stats: data.stats || this.computeLocalStats(data.sources || []),
        };
      }
    } catch (e) {
      console.warn('API error fetching registry sources, falling back to local seed:', e);
    }

    // Fallback to in-memory seeds
    let list = [...SEED_PUBLIC_SOURCES];
    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((s) => s.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.access_method && filters.access_method !== 'ALL') {
      list = list.filter((s) => s.access_method.toLowerCase() === filters.access_method?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.source_name.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.source_id.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    return {
      sources: list,
      stats: this.computeLocalStats(SEED_PUBLIC_SOURCES),
    };
  }

  /**
   * Fetch details of a single source with audit logs
   */
  public static async getSourceDetail(id: string): Promise<{
    source: PublicSourceRecord | null;
    recentHealthLogs: SourceHealthLog[];
    provenanceCount: number;
  }> {
    try {
      const res = await fetch(`/api/v1/registry/sources/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API error fetching source detail:', e);
    }

    const s = SEED_PUBLIC_SOURCES.find((x) => x.source_id === id) || null;
    const pCount = SEED_PROVENANCE_RECORDS.filter((p) => p.source_id === id).length;
    return {
      source: s,
      recentHealthLogs: [],
      provenanceCount: pCount,
    };
  }

  /**
   * Register a new public data source dynamically without modifying code
   */
  public static async registerSource(candidate: Partial<PublicSourceRecord>): Promise<{
    success: boolean;
    source?: PublicSourceRecord;
    errors?: string[];
    warnings?: string[];
  }> {
    try {
      const res = await fetch('/api/v1/registry/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          errors: data.errors || [data.error || 'Gagal mendaftarkan sumber data'],
          warnings: data.warnings,
        };
      }
      return {
        success: true,
        source: data.source,
        warnings: data.warnings,
      };
    } catch (e: any) {
      return {
        success: false,
        errors: [e.message || 'Koneksi ke server registry gagal'],
      };
    }
  }

  /**
   * Trigger on-demand health check / ping to endpoint
   */
  public static async runHealthCheck(id: string): Promise<{
    success: boolean;
    source?: PublicSourceRecord;
    log?: SourceHealthLog;
    error?: string;
  }> {
    try {
      const res = await fetch(`/api/v1/registry/sources/${encodeURIComponent(id)}/health-check`, {
        method: 'POST',
      });
      return await res.json();
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Gagal menghubungi server health check',
      };
    }
  }

  /**
   * Fetch provenance records
   */
  public static async getProvenanceRecords(filters?: {
    source_id?: string;
    search?: string;
  }): Promise<SourceProvenanceRecord[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.source_id && filters.source_id !== 'ALL') params.append('source_id', filters.source_id);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`/api/v1/registry/provenance?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.records || [];
      }
    } catch (e) {
      console.warn('API error fetching provenance records:', e);
    }
    return SEED_PROVENANCE_RECORDS;
  }

  /**
   * Compute local stats from a list of sources
   */
  private static computeLocalStats(sources: PublicSourceRecord[]): RegistryStats {
    const stats: RegistryStats = {
      totalSources: sources.length,
      active: sources.filter((s) => s.status === 'ACTIVE').length,
      degraded: sources.filter((s) => s.status === 'DEGRADED').length,
      offline: sources.filter((s) => s.status === 'OFFLINE').length,
      unverified: sources.filter((s) => s.status === 'UNVERIFIED').length,
      requiresReview: sources.filter((s) => s.status === 'REQUIRES REVIEW').length,
      totalProvenanceRecords: SEED_PROVENANCE_RECORDS.length,
      byCategory: {},
      byAccessMethod: {},
    };

    for (const s of sources) {
      stats.byCategory[s.category] = (stats.byCategory[s.category] || 0) + 1;
      stats.byAccessMethod[s.access_method] = (stats.byAccessMethod[s.access_method] || 0) + 1;
    }

    return stats;
  }
}
