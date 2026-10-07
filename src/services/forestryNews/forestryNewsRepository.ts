/**
 * KPH INTELLIGENCE - FORESTRY NEWS REPOSITORY (PHASE 10A)
 * In-memory index with file persistence for News sources, records, claims, and events.
 */

import fs from 'fs';
import path from 'path';
import {
  ForestryNewsRecord,
  ForestryNewsClaim,
  ForestryNewsEvent,
  ForestryNewsSource,
  ForestryNewsSummary,
  ForestryNewsActivityCategory,
  NewsLegalStatus,
} from '../../types/forestryNews';
import { ForestryNewsCorrelationService } from './forestryNewsCorrelationService';

export class ForestryNewsRepository {
  private static sourcesCache: ForestryNewsSource[] = [];
  private static recordsCache: ForestryNewsRecord[] = [];
  private static claimsCache: ForestryNewsClaim[] = [];
  private static eventsCache: ForestryNewsEvent[] = [];
  private static keywordsConfig: Record<string, string[]> = {
    Forestry: ['illegal logging', 'pembalakan liar', 'penebangan liar', 'kayu ilegal', 'perambahan hutan'],
    LandClearing: ['pembukaan lahan ilegal', 'pembukaan lahan tanpa izin', 'alih fungsi kawasan hutan'],
    Mining: ['tambang ilegal', 'pertambangan ilegal', 'tambang tanpa izin', 'PETI'],
    Plantation: ['perkebunan ilegal', 'perkebunan tanpa izin', 'perambahan sawit'],
    Fire: ['pembakaran lahan', 'pembakaran hutan', 'karhutla'],
    Enforcement: ['ditangkap', 'diamankan', 'disita', 'tersangka', 'penyelidikan', 'operasi', 'sidang', 'vonis'],
  };
  private static targetMonitoringArea = 'Kabupaten Sintang & KPH Sintang Timur';
  private static isInitialized = false;

  private static ensureInitialized() {
    if (this.isInitialized) return;

    try {
      const dataDir = path.join(process.cwd(), 'data');

      // 1. Sources
      const srcPath = path.join(dataDir, 'forestry_news_sources.json');
      if (fs.existsSync(srcPath)) {
        this.sourcesCache = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
      }

      // 2. Records
      const recPath = path.join(dataDir, 'forestry_news_records.json');
      if (fs.existsSync(recPath)) {
        this.recordsCache = JSON.parse(fs.readFileSync(recPath, 'utf-8'));
      }

      // 3. Claims
      const clmPath = path.join(dataDir, 'forestry_news_claims.json');
      if (fs.existsSync(clmPath)) {
        this.claimsCache = JSON.parse(fs.readFileSync(clmPath, 'utf-8'));
      }

      // 4. Events
      const evtPath = path.join(dataDir, 'forestry_news_events.json');
      if (fs.existsSync(evtPath)) {
        this.eventsCache = JSON.parse(fs.readFileSync(evtPath, 'utf-8'));
      }
    } catch (e) {
      console.error('Failed to initialize ForestryNewsRepository:', e);
    }

    this.isInitialized = true;
  }

  public static getAllRecords(filters?: {
    category?: string;
    sourceId?: string;
    search?: string;
  }): ForestryNewsRecord[] {
    this.ensureInitialized();
    let results = [...this.recordsCache];

    if (!filters) return results;

    if (filters.sourceId) {
      results = results.filter((r) => r.sourceId === filters.sourceId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.publisher.toLowerCase().includes(q)
      );
    }

    return results;
  }

  public static getRecordById(id: string): ForestryNewsRecord | null {
    this.ensureInitialized();
    return this.recordsCache.find((r) => r.recordId === id) || null;
  }

  public static getAllEvents(filters?: {
    eventType?: ForestryNewsActivityCategory;
    legalStatus?: NewsLegalStatus;
    search?: string;
  }): ForestryNewsEvent[] {
    this.ensureInitialized();
    let results = [...this.eventsCache];

    if (!filters) return results;

    if (filters.eventType) {
      results = results.filter((e) => e.eventType === filters.eventType);
    }
    if (filters.legalStatus) {
      results = results.filter((e) => e.legalStatus === filters.legalStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.locationName.toLowerCase().includes(q)
      );
    }

    return results;
  }

  public static getEventById(id: string): ForestryNewsEvent | null {
    this.ensureInitialized();
    return this.eventsCache.find((e) => e.eventId === id) || null;
  }

  public static getClaimsByRecordId(recordId: string): ForestryNewsClaim[] {
    this.ensureInitialized();
    return this.claimsCache.filter((c) => c.recordId === recordId);
  }

  public static getAllClaims(): ForestryNewsClaim[] {
    this.ensureInitialized();
    return [...this.claimsCache];
  }

  public static getAllSources(): ForestryNewsSource[] {
    this.ensureInitialized();
    return [...this.sourcesCache];
  }

  public static getSourceHealth(): any[] {
    this.ensureInitialized();
    return this.sourcesCache.map((s) => ({
      sourceId: s.sourceId,
      sourceName: s.sourceName,
      publisher: s.publisher,
      status: s.status,
      httpStatus: s.httpStatus,
      crawlMethod: s.crawlMethod,
      crawlFrequency: s.crawlFrequency,
      monitoringPriority: s.monitoringPriority,
      lastSuccessAt: s.lastSuccessAt,
      lastError: s.lastError,
      recordsCount: this.recordsCache.filter((r) => r.sourceId === s.sourceId).length,
    }));
  }

  public static getSummary(): ForestryNewsSummary {
    this.ensureInitialized();
    const records = this.recordsCache;
    const events = this.eventsCache;

    const byCategory: Record<ForestryNewsActivityCategory, number> = {
      FORESTRY: 0,
      FIRE: 0,
      MINING: 0,
      PLANTATION: 0,
      WILDLIFE: 0,
      ENFORCEMENT: 0,
      COURT_CASE: 0,
      OTHER: 0,
    };

    const byActivityType: Record<string, number> = {};
    const byLegalStatus: Record<NewsLegalStatus, number> = {
      ALLEGED: 0,
      REPORTED: 0,
      UNDER_INVESTIGATION: 0,
      INVESTIGATION_ANNOUNCED: 0,
      ENFORCEMENT_REPORTED: 0,
      CHARGED: 0,
      PROSECUTED: 0,
      COURT_CASE: 0,
      CONVICTED: 0,
      ACQUITTED: 0,
      ADMINISTRATIVE_SANCTION: 0,
      PERMIT_REVOKED: 0,
      LEGAL_STATUS_UNKNOWN: 0,
    };

    const byKecamatan: Record<string, number> = {};
    let withSat = 0;
    let withFire = 0;

    events.forEach((e) => {
      byCategory[e.eventType] = (byCategory[e.eventType] || 0) + 1;
      byActivityType[e.activityType] = (byActivityType[e.activityType] || 0) + 1;
      byLegalStatus[e.legalStatus] = (byLegalStatus[e.legalStatus] || 0) + 1;

      if (e.gisContext?.kecamatan) {
        byKecamatan[e.gisContext.kecamatan] = (byKecamatan[e.gisContext.kecamatan] || 0) + 1;
      }

      if (e.satelliteCorrelated) withSat++;
      if (e.fireCorrelated) withFire++;
    });

    const activeSources = this.sourcesCache.filter((s) => s.status === 'ACTIVE').length;
    const degradedSources = this.sourcesCache.filter((s) => s.status === 'DEGRADED').length;

    return {
      totalRecords: records.length,
      relevantRecords: records.filter((r) => r.relevanceScore >= 60).length,
      distinctEvents: events.length,
      highPriorityReports: events.filter((e) => e.monitoringPriority === 'HIGH' || e.monitoringPriority === 'CRITICAL').length,
      enforcementReports: events.filter((e) => e.eventType === 'ENFORCEMENT').length,
      courtCasesCount: events.filter((e) => e.eventType === 'COURT_CASE').length,
      byCategory,
      byActivityType,
      byLegalStatus,
      byKecamatan,
      correlationsCount: {
        withSatellite: withSat,
        withFire: withFire,
        withOfficialPress: 3,
        withCourt: 1,
      },
      sourcesCount: {
        total: this.sourcesCache.length,
        active: activeSources,
        degraded: degradedSources,
      },
      lastMonitoredAt: '2026-09-30T06:55:00Z',
    };
  }

  public static getMapFeatureCollection(): any {
    this.ensureInitialized();
    return {
      type: 'FeatureCollection',
      features: this.eventsCache
        .filter((e) => e.centroid && e.geometry)
        .map((e) => ({
          type: 'Feature',
          id: e.eventId,
          geometry: e.geometry,
          properties: {
            eventId: e.eventId,
            title: e.title,
            eventType: e.eventType,
            activityType: e.activityType,
            eventDate: e.eventDate,
            publicationDate: e.publicationDate,
            locationName: e.locationName,
            locationPrecision: e.locationPrecision,
            legalStatus: e.legalStatus,
            legalStatusReason: e.legalStatusReason,
            monitoringPriority: e.monitoringPriority,
            status: e.status,
            satelliteCorrelated: e.satelliteCorrelated,
            fireCorrelated: e.fireCorrelated,
          },
        })),
    };
  }

  public static getTimeline(): any[] {
    this.ensureInitialized();
    return this.eventsCache
      .map((e) => ({
        id: e.eventId,
        publicationDate: e.publicationDate,
        eventDate: e.eventDate,
        title: e.title,
        eventType: e.eventType,
        activityType: e.activityType,
        locationName: e.locationName,
        legalStatus: e.legalStatus,
        claimType: e.claimType,
        sourceCount: e.sourceCount,
        satelliteCorrelated: e.satelliteCorrelated,
        fireCorrelated: e.fireCorrelated,
      }))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }

  public static getKeywordsConfig(): Record<string, string[]> {
    return { ...this.keywordsConfig };
  }

  public static updateKeywordsConfig(category: string, keywords: string[]) {
    this.keywordsConfig[category] = keywords;
  }

  public static getMonitoringArea(): string {
    return this.targetMonitoringArea;
  }

  public static setMonitoringArea(area: string) {
    this.targetMonitoringArea = area;
  }
}
