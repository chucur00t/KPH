import fs from 'fs';
import path from 'path';
import {
  PublicSourceRecord,
  SourceProvenanceRecord,
  SourceHealthLog,
  SourceCategory,
  SourceStatus,
  SourceAccessMethod,
} from '../types/registry';
import { SEED_PUBLIC_SOURCES, SEED_PROVENANCE_RECORDS } from '../data/seedRegistry';
import { SourceValidationService } from './sourceValidationService';
import { HealthCheckService } from './healthCheckService';

export interface SourceFilterQuery {
  category?: SourceCategory | 'ALL';
  status?: SourceStatus | 'ALL';
  access_method?: SourceAccessMethod | 'ALL';
  search?: string;
}

export class RegistryRepository {
  private static dataDir = path.resolve(process.cwd(), 'data');
  private static sourcesFilePath = path.join(RegistryRepository.dataDir, 'data_sources_registry.json');
  private static provenanceFilePath = path.join(RegistryRepository.dataDir, 'provenance_registry.json');
  private static healthLogsFilePath = path.join(RegistryRepository.dataDir, 'health_logs.json');

  private static initialized = false;
  private static sourcesCache: PublicSourceRecord[] = [];
  private static provenanceCache: SourceProvenanceRecord[] = [];
  private static healthLogsCache: SourceHealthLog[] = [];

  /**
   * Initialize data directory and load/seed records
   */
  public static init(): void {
    if (this.initialized) return;

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Load or seed sources
    if (fs.existsSync(this.sourcesFilePath)) {
      try {
        const raw = fs.readFileSync(this.sourcesFilePath, 'utf-8');
        this.sourcesCache = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading sources registry file, falling back to seed:', err);
        this.sourcesCache = [...SEED_PUBLIC_SOURCES];
        this.saveSources();
      }
    } else {
      this.sourcesCache = [...SEED_PUBLIC_SOURCES];
      this.saveSources();
    }

    // Load or seed provenance records
    if (fs.existsSync(this.provenanceFilePath)) {
      try {
        const raw = fs.readFileSync(this.provenanceFilePath, 'utf-8');
        this.provenanceCache = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading provenance file, falling back to seed:', err);
        this.provenanceCache = [...SEED_PROVENANCE_RECORDS];
        this.saveProvenance();
      }
    } else {
      this.provenanceCache = [...SEED_PROVENANCE_RECORDS];
      this.saveProvenance();
    }

    // Load health logs
    if (fs.existsSync(this.healthLogsFilePath)) {
      try {
        const raw = fs.readFileSync(this.healthLogsFilePath, 'utf-8');
        this.healthLogsCache = JSON.parse(raw);
      } catch (err) {
        this.healthLogsCache = [];
      }
    } else {
      this.healthLogsCache = [];
      this.saveHealthLogs();
    }

    this.initialized = true;
  }

  private static saveSources(): void {
    try {
      fs.writeFileSync(this.sourcesFilePath, JSON.stringify(this.sourcesCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write sources registry file:', err);
    }
  }

  private static saveProvenance(): void {
    try {
      fs.writeFileSync(this.provenanceFilePath, JSON.stringify(this.provenanceCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write provenance file:', err);
    }
  }

  private static saveHealthLogs(): void {
    try {
      fs.writeFileSync(this.healthLogsFilePath, JSON.stringify(this.healthLogsCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write health logs file:', err);
    }
  }

  // --- CRUD & QUERY METHODS ---

  public static getSources(filters?: SourceFilterQuery): PublicSourceRecord[] {
    this.init();
    let result = [...this.sourcesCache];

    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter((s) => s.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.access_method && filters.access_method !== 'ALL') {
      result = result.filter((s) => s.access_method.toLowerCase() === filters.access_method?.toLowerCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.source_id.toLowerCase().includes(q) ||
          s.source_name.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.endpoint.toLowerCase().includes(q) ||
          s.coverage.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public static getSourceById(id: string): {
    source: PublicSourceRecord | null;
    recentHealthLogs: SourceHealthLog[];
    provenanceCount: number;
  } {
    this.init();
    const source = this.sourcesCache.find((s) => s.source_id === id) || null;
    const recentHealthLogs = this.healthLogsCache
      .filter((l) => l.source_id === id)
      .slice(-10)
      .reverse();
    const provenanceCount = this.provenanceCache.filter((p) => p.source_id === id).length;

    return { source, recentHealthLogs, provenanceCount };
  }

  public static addSource(candidate: Partial<PublicSourceRecord>): {
    success: boolean;
    source?: PublicSourceRecord;
    errors?: string[];
    warnings?: string[];
  } {
    this.init();

    // Check duplicate
    if (candidate.source_id && this.sourcesCache.some((s) => s.source_id === candidate.source_id)) {
      return {
        success: false,
        errors: [`source_id '${candidate.source_id}' sudah terdaftar dalam registry. Gunakan ID unik lain.`],
      };
    }

    // Strict validation
    const validation = SourceValidationService.validate(candidate);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    const nowIso = new Date().toISOString();
    const newRecord: PublicSourceRecord = {
      source_id: candidate.source_id!.trim(),
      source_name: candidate.source_name!.trim(),
      provider: candidate.provider!.trim(),
      category: candidate.category as SourceCategory,
      description: candidate.description!.trim(),
      coverage: candidate.coverage!.trim(),
      data_type: candidate.data_type!.trim(),
      format: candidate.format!.trim(),
      access_method: candidate.access_method as SourceAccessMethod,
      endpoint: candidate.endpoint!.trim(),
      documentation_url: candidate.documentation_url!.trim(),
      license: candidate.license!.trim(),
      update_frequency: candidate.update_frequency!.trim(),
      last_successful_update: candidate.last_successful_update || null,
      status: (validation.suggestedStatus || candidate.status) as SourceStatus,
      reliability: candidate.reliability!.trim(),
      attribution: candidate.attribution!.trim(),
      notes: (candidate.notes || '').trim(),
      created_at: nowIso,
      updated_at: nowIso,
    };

    this.sourcesCache.unshift(newRecord);
    this.saveSources();

    return {
      success: true,
      source: newRecord,
      warnings: validation.warnings,
    };
  }

  public static updateSource(
    id: string,
    updates: Partial<PublicSourceRecord>
  ): {
    success: boolean;
    source?: PublicSourceRecord;
    errors?: string[];
    warnings?: string[];
  } {
    this.init();
    const index = this.sourcesCache.findIndex((s) => s.source_id === id);
    if (index === -1) {
      return { success: false, errors: [`Sumber data dengan ID '${id}' tidak ditemukan.`] };
    }

    const existing = this.sourcesCache[index];
    const candidate: PublicSourceRecord = {
      ...existing,
      ...updates,
      source_id: existing.source_id, // Prevent altering PK
      updated_at: new Date().toISOString(),
    };

    const validation = SourceValidationService.validate(candidate);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    this.sourcesCache[index] = candidate;
    this.saveSources();

    return {
      success: true,
      source: candidate,
      warnings: validation.warnings,
    };
  }

  public static deleteSource(id: string): { success: boolean; message: string } {
    this.init();
    const index = this.sourcesCache.findIndex((s) => s.source_id === id);
    if (index === -1) {
      return { success: false, message: `Sumber data '${id}' tidak ditemukan.` };
    }

    // Check if there are active provenance records linked
    const linkedProvenance = this.provenanceCache.filter((p) => p.source_id === id).length;
    if (linkedProvenance > 0) {
      // Soft-retire to OFFLINE to protect audit trail
      this.sourcesCache[index].status = 'OFFLINE';
      this.sourcesCache[index].notes = `[ARCHIVED] Sumber dinonaktifkan tetapi dipertahankan karena memiliki ${linkedProvenance} rekam jejak provenance audit.`;
      this.sourcesCache[index].updated_at = new Date().toISOString();
      this.saveSources();
      return {
        success: true,
        message: `Sumber data memiliki ${linkedProvenance} rekam jejak audit provenance. Status diubah menjadi OFFLINE untuk melindungi jejak audit.`,
      };
    }

    this.sourcesCache.splice(index, 1);
    this.saveSources();
    return { success: true, message: `Sumber data '${id}' berhasil dihapus dari registry.` };
  }

  public static async probeSource(id: string): Promise<{
    success: boolean;
    source?: PublicSourceRecord;
    log?: SourceHealthLog;
    error?: string;
  }> {
    this.init();
    const index = this.sourcesCache.findIndex((s) => s.source_id === id);
    if (index === -1) {
      return { success: false, error: `Sumber data '${id}' tidak ditemukan.` };
    }

    const source = this.sourcesCache[index];
    const { updatedSource, log } = await HealthCheckService.checkSource(source);

    this.sourcesCache[index] = updatedSource;
    this.saveSources();

    this.healthLogsCache.push(log);
    // Keep last 200 logs
    if (this.healthLogsCache.length > 200) {
      this.healthLogsCache = this.healthLogsCache.slice(-200);
    }
    this.saveHealthLogs();

    return { success: true, source: updatedSource, log };
  }

  // --- PROVENANCE METHODS ---

  public static getProvenanceRecords(filters?: {
    source_id?: string;
    search?: string;
    limit?: number;
  }): SourceProvenanceRecord[] {
    this.init();
    let list = [...this.provenanceCache];

    if (filters?.source_id && filters.source_id !== 'ALL') {
      list = list.filter((p) => p.source_id === filters.source_id);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.provenance_id.toLowerCase().includes(q) ||
          p.source_record_id.toLowerCase().includes(q) ||
          p.source_url.toLowerCase().includes(q) ||
          p.raw_reference.toLowerCase().includes(q)
      );
    }

    const limit = filters?.limit || 100;
    return list.slice(0, limit);
  }

  public static addProvenanceRecord(candidate: Partial<SourceProvenanceRecord>): {
    success: boolean;
    record?: SourceProvenanceRecord;
    error?: string;
  } {
    this.init();

    if (!candidate.source_id) {
      return { success: false, error: 'source_id wajib dicantumkan.' };
    }
    const sourceExists = this.sourcesCache.some((s) => s.source_id === candidate.source_id);
    if (!sourceExists) {
      return {
        success: false,
        error: `source_id '${candidate.source_id}' tidak terdaftar dalam Public Data Source Registry resmi.`,
      };
    }
    if (!candidate.source_record_id) {
      return { success: false, error: 'source_record_id wajib dicantumkan.' };
    }
    if (!candidate.source_url) {
      return { success: false, error: 'source_url wajib dicantumkan.' };
    }
    if (!candidate.raw_reference) {
      return { success: false, error: 'raw_reference (SHA-256 hash atau storage key) wajib dicantumkan.' };
    }

    const newRecord: SourceProvenanceRecord = {
      provenance_id: candidate.provenance_id || `PRV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source_id: candidate.source_id,
      source_record_id: candidate.source_record_id,
      retrieved_at: candidate.retrieved_at || new Date().toISOString(),
      published_at: candidate.published_at || null,
      source_url: candidate.source_url,
      raw_reference: candidate.raw_reference,
      http_status: candidate.http_status || 200,
      records_count: candidate.records_count || 1,
      hash_sha256: candidate.hash_sha256 || (candidate.raw_reference.startsWith('sha256:') ? candidate.raw_reference.substring(7) : undefined),
    };

    this.provenanceCache.unshift(newRecord);
    this.saveProvenance();

    return { success: true, record: newRecord };
  }

  // --- STATS & AUDIT SUMMARY ---

  public static getStats() {
    this.init();
    const totalSources = this.sourcesCache.length;
    const active = this.sourcesCache.filter((s) => s.status === 'ACTIVE').length;
    const degraded = this.sourcesCache.filter((s) => s.status === 'DEGRADED').length;
    const offline = this.sourcesCache.filter((s) => s.status === 'OFFLINE').length;
    const unverified = this.sourcesCache.filter((s) => s.status === 'UNVERIFIED').length;
    const requiresReview = this.sourcesCache.filter((s) => s.status === 'REQUIRES REVIEW').length;

    const byCategory: Record<string, number> = {};
    for (const s of this.sourcesCache) {
      byCategory[s.category] = (byCategory[s.category] || 0) + 1;
    }

    const byAccessMethod: Record<string, number> = {};
    for (const s of this.sourcesCache) {
      byAccessMethod[s.access_method] = (byAccessMethod[s.access_method] || 0) + 1;
    }

    return {
      totalSources,
      active,
      degraded,
      offline,
      unverified,
      requiresReview,
      totalProvenanceRecords: this.provenanceCache.length,
      byCategory,
      byAccessMethod,
    };
  }
}
