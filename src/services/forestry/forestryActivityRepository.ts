/**
 * KPH INTELLIGENCE - FORESTRY ACTIVITY INTELLIGENCE REPOSITORY (PHASE 10)
 * Stores and manages indicators, traceable evidence, enforcement events, and public permits.
 * 100% in-memory fast indexing with JSON file persistence backup.
 */

import fs from 'fs';
import path from 'path';
import {
  ForestryActivityIndicator,
  ForestryActivityEvidence,
  ForestryEnforcementEvent,
  PublicAuthorizationRecord,
  ForestryActivitySummary,
  ForestryActivityType,
  ActivityPriority,
  VerificationPriority,
  LegalStatus,
  AuthorizationSpatialStatus,
  FalsePositiveStatus,
} from '../../types/forestryActivity';
import { ForestryActivityCorrelationService } from './forestryActivityCorrelationService';
import { ForestryAuthorizationCorrelationService } from './forestryAuthorizationCorrelationService';

export class ForestryActivityRepository {
  private static indicatorsCache: ForestryActivityIndicator[] = [];
  private static evidenceCache: ForestryActivityEvidence[] = [];
  private static enforcementCache: ForestryEnforcementEvent[] = [];
  private static isInitialized = false;

  private static ensureInitialized() {
    if (this.isInitialized) return;

    try {
      const dataDir = path.join(process.cwd(), 'data');

      // 1. Evidence
      const evPath = path.join(dataDir, 'forestry_activity_evidence.json');
      if (fs.existsSync(evPath)) {
        const rawEv = JSON.parse(fs.readFileSync(evPath, 'utf-8'));
        this.evidenceCache = rawEv.map((raw: any) => ({
          evidenceId: raw.evidence_id || raw.evidenceId,
          indicatorId: raw.indicator_id || raw.indicatorId,
          evidenceType: raw.evidence_type || raw.evidenceType,
          classification: raw.classification,
          sourceId: raw.source_id || raw.sourceId,
          sourceRecordId: raw.source_record_id || raw.sourceRecordId,
          sourceUrl: raw.source_url || raw.sourceUrl,
          sourceDate: raw.source_date || raw.sourceDate,
          retrievedAt: raw.retrieved_at || raw.retrievedAt,
          description: raw.description,
          sourceExcerpt: raw.source_excerpt || raw.sourceExcerpt,
          geometry: raw.geometry,
          evidenceStrength: raw.evidence_strength || raw.evidenceStrength,
          reliability: raw.reliability,
          rawReference: raw.raw_reference || raw.rawReference,
          createdAt: raw.created_at || raw.createdAt,
        }));
      }

      // 2. Enforcement
      const enfPath = path.join(dataDir, 'forestry_enforcement_events.json');
      if (fs.existsSync(enfPath)) {
        const rawEnf = JSON.parse(fs.readFileSync(enfPath, 'utf-8'));
        this.enforcementCache = rawEnf.map((raw: any) => ({
          enforcementEventId: raw.enforcement_event_id || raw.enforcementEventId,
          eventType: raw.event_type || raw.eventType,
          agency: raw.agency,
          location: raw.location,
          kecamatan: raw.kecamatan,
          geometry: raw.geometry,
          centroid: raw.centroid,
          eventDate: raw.event_date || raw.eventDate,
          publicationDate: raw.publication_date || raw.publicationDate,
          caseReference: raw.case_reference || raw.caseReference,
          organization: raw.organization,
          publicEntity: raw.public_entity || raw.publicEntity,
          activityType: raw.activity_type || raw.activityType,
          description: raw.description,
          legalReference: raw.legal_reference || raw.legalReference,
          legalStatus: raw.legal_status || raw.legalStatus,
          sourceId: raw.source_id || raw.sourceId,
          sourceUrl: raw.source_url || raw.sourceUrl,
          sourceExcerpt: raw.source_excerpt || raw.sourceExcerpt,
          confidence: raw.confidence || 'HIGH',
          status: raw.status || 'REPORTED',
          createdAt: raw.created_at || raw.createdAt,
          updatedAt: raw.updated_at || raw.updatedAt,
        }));
      }

      // 3. Indicators
      const indPath = path.join(dataDir, 'forestry_activity_indicators.json');
      if (fs.existsSync(indPath)) {
        const rawIndicators: any[] = JSON.parse(fs.readFileSync(indPath, 'utf-8'));
        this.indicatorsCache = rawIndicators.map((raw) => {
          const ind: ForestryActivityIndicator = {
            indicatorId: raw.indicator_id || raw.indicatorId,
            indicatorType: raw.indicator_type || raw.indicatorType,
            indicatorSubtype: raw.indicator_subtype || raw.indicatorSubtype,
            title: raw.title,
            description: raw.description,
            geometry: raw.geometry,
            centroid: raw.centroid,
            areaHa: raw.area_ha ?? raw.areaHa ?? 0,
            detectionDate: raw.detection_date || raw.detectionDate,
            dateBefore: raw.date_before || raw.dateBefore,
            dateAfter: raw.date_after || raw.dateAfter,
            sourceCount: raw.source_count ?? raw.sourceCount ?? 1,
            evidenceCount: raw.evidence_count ?? raw.evidenceCount ?? 1,
            kecamatan: raw.kecamatan,
            desa: raw.desa,
            kphUnit: raw.kph_unit || raw.kphUnit || 'KPH Sintang Timur',
            forestOverlapAreaHa: raw.forest_overlap_area_ha ?? raw.forestOverlapAreaHa ?? 0,
            forestOverlapPercentage: raw.forest_overlap_percentage ?? raw.forestOverlapPercentage ?? 0,
            forestFunction: raw.forest_function || raw.forestFunction || 'HL',
            sensitiveAreaOverlaps: (raw.sensitive_area_overlaps || raw.sensitiveAreaOverlaps || []).map((s: any) => ({
              overlapType: s.overlap_type || s.overlapType,
              layerName: s.layer_name || s.layerName,
              overlapAreaHa: s.overlap_area_ha ?? s.overlapAreaHa ?? 0,
              overlapPercentage: s.overlap_percentage ?? s.overlapPercentage ?? 0,
              sourceDate: s.source_date || s.sourceDate,
              notes: s.notes,
            })),
            peatlandOverlap: raw.peatland_overlap ?? raw.peatlandOverlap ?? false,
            peatlandName: raw.peatland_name || raw.peatlandName,
            socialForestryOverlap: raw.social_forestry_overlap ?? raw.socialForestryOverlap ?? false,
            concessionOverlap: raw.concession_overlap ?? raw.concessionOverlap ?? false,
            concessionName: raw.concession_name || raw.concessionName,
            plantationOverlap: raw.plantation_overlap ?? raw.plantationOverlap ?? false,
            miningOverlap: raw.mining_overlap ?? raw.miningOverlap ?? false,
            distanceToRoadM: raw.distance_to_road_m ?? raw.distanceToRoadM ?? 0,
            distanceToRiverM: raw.distance_to_river_m ?? raw.distanceToRiverM ?? 0,
            distanceToForestBoundaryM: raw.distance_to_forest_boundary_m ?? raw.distanceToForestBoundaryM ?? 0,
            fireCorrelation: raw.fire_correlation ?? raw.fireCorrelation ?? false,
            fireEventId: raw.fire_event_id || raw.fireEventId,
            hotspotsCount: raw.hotspots_count ?? raw.hotspotsCount ?? 0,
            landChangeCorrelation: raw.land_change_correlation ?? raw.landChangeCorrelation ?? false,
            landChangeEventId: raw.land_change_event_id || raw.landChangeEventId,
            ndviDrop: raw.ndvi_drop ?? raw.ndviDrop,
            osintCorrelation: raw.osint_correlation ?? raw.osintCorrelation ?? false,
            osintEventId: raw.osint_event_id || raw.osintEventId,
            osintArticleHeadline: raw.osint_article_headline || raw.osintArticleHeadline,
            authorizationStatus: raw.authorization_status || raw.authorizationStatus || 'OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA',
            authorizationReference: raw.authorization_reference || raw.authorizationReference,
            authorizationNotes: raw.authorization_notes || raw.authorizationNotes || '',
            activityScore: raw.activity_score ?? raw.activityScore ?? 50,
            scoreVersion: raw.score_version || raw.scoreVersion || 'v1.0.0-phase10',
            evidenceStrength: raw.evidence_strength || raw.evidenceStrength || 'MODERATE',
            confidence: raw.confidence || 'HIGH',
            priority: raw.priority || 'MODERATE',
            verificationPriority: raw.verification_priority || raw.verificationPriority || 'MEDIUM',
            temporalPattern: raw.temporal_pattern || raw.temporalPattern || 'NEW',
            legalStatus: raw.legal_status || raw.legalStatus || 'REQUIRES_VERIFICATION',
            legalStatusReason: raw.legal_status_reason || raw.legalStatusReason || '',
            status: raw.status || 'DETECTED',
            falsePositiveReason: raw.false_positive_reason || raw.falsePositiveReason || 'NONE',
            reviewNotes: raw.review_notes || raw.reviewNotes,
            reviewedBy: raw.reviewed_by || raw.reviewedBy,
            reviewedAt: raw.reviewed_at || raw.reviewedAt,
            analysisRunId: raw.analysis_run_id || raw.analysisRunId || 'RUN-PHASE10-20260930-001',
            createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
            updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
          };
          return ForestryActivityCorrelationService.enrichIndicator(ind, this.evidenceCache, this.enforcementCache);
        });
      }
    } catch (err) {
      console.error('Failed to initialize ForestryActivityRepository:', err);
    }

    this.isInitialized = true;
  }

  public static getAllIndicators(filters?: {
    indicatorType?: ForestryActivityType;
    priority?: ActivityPriority;
    verificationPriority?: VerificationPriority;
    legalStatus?: LegalStatus;
    forestFunction?: string;
    status?: FalsePositiveStatus;
    kecamatan?: string;
    search?: string;
  }): ForestryActivityIndicator[] {
    this.ensureInitialized();
    let result = [...this.indicatorsCache];

    if (!filters) return result;

    if (filters.indicatorType) {
      result = result.filter((i) => i.indicatorType === filters.indicatorType);
    }
    if (filters.priority) {
      result = result.filter((i) => i.priority === filters.priority);
    }
    if (filters.verificationPriority) {
      result = result.filter((i) => i.verificationPriority === filters.verificationPriority);
    }
    if (filters.legalStatus) {
      result = result.filter((i) => i.legalStatus === filters.legalStatus);
    }
    if (filters.forestFunction) {
      result = result.filter((i) => i.forestFunction === filters.forestFunction);
    }
    if (filters.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters.kecamatan) {
      result = result.filter((i) => i.kecamatan.toLowerCase() === filters.kecamatan?.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.indicatorId.toLowerCase().includes(q) ||
          i.desa.toLowerCase().includes(q) ||
          i.kecamatan.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public static getIndicatorById(id: string): ForestryActivityIndicator | null {
    this.ensureInitialized();
    const ind = this.indicatorsCache.find((i) => i.indicatorId === id);
    if (!ind) return null;
    ind.evidenceList = this.getEvidenceByIndicatorId(id);
    return ind;
  }

  public static getEvidenceByIndicatorId(indicatorId: string): ForestryActivityEvidence[] {
    this.ensureInitialized();
    return this.evidenceCache.filter((ev) => ev.indicatorId === indicatorId);
  }

  public static getAllEvidence(): ForestryActivityEvidence[] {
    this.ensureInitialized();
    return [...this.evidenceCache];
  }

  public static getEnforcementEvents(): ForestryEnforcementEvent[] {
    this.ensureInitialized();
    return [...this.enforcementCache];
  }

  public static getEnforcementEventById(id: string): ForestryEnforcementEvent | null {
    this.ensureInitialized();
    return this.enforcementCache.find((e) => e.enforcementEventId === id) || null;
  }

  public static getPublicAuthorizations(): PublicAuthorizationRecord[] {
    return ForestryAuthorizationCorrelationService.getPublicAuthorizations();
  }

  public static getSummary(): ForestryActivitySummary {
    this.ensureInitialized();
    const indicators = this.indicatorsCache;

    const byActivityType: Record<ForestryActivityType, number> = {
      FOREST_DISTURBANCE: 0,
      POTENTIAL_LOGGING: 0,
      POTENTIAL_LAND_CLEARING: 0,
      POTENTIAL_ENCROACHMENT: 0,
      POTENTIAL_MINING: 0,
      POTENTIAL_PLANTATION_EXPANSION: 0,
      POTENTIAL_ROAD_CONSTRUCTION: 0,
      POTENTIAL_FOREST_FIRE_ACTIVITY: 0,
    };

    const byPriority: Record<ActivityPriority, number> = {
      LOW: 0,
      MODERATE: 0,
      HIGH: 0,
      VERY_HIGH: 0,
    };

    const byVerificationPriority: Record<VerificationPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    const byLegalStatus: Record<LegalStatus, number> = {
      UNKNOWN: 0,
      NOT_ASSESSED: 0,
      PUBLIC_LICENSE_RECORD_FOUND: 0,
      PUBLIC_AUTHORIZATION_RECORD_FOUND: 0,
      PUBLIC_RESTRICTION_RECORD_FOUND: 0,
      PUBLIC_VIOLATION_REPORTED: 0,
      PUBLIC_ENFORCEMENT_REPORTED: 0,
      PUBLIC_COURT_CASE_REPORTED: 0,
      PUBLIC_LEGAL_FINDING_AVAILABLE: 0,
      REQUIRES_VERIFICATION: 0,
    };

    const byAuthorizationStatus: Record<AuthorizationSpatialStatus, number> = {
      WITHIN_PUBLIC_AUTHORIZED_AREA: 0,
      PARTIALLY_OVERLAPS_PUBLIC_AUTHORIZED_AREA: 0,
      OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA: 0,
      NO_PUBLIC_AUTHORIZATION_DATA: 0,
    };

    const byFalsePositiveStatus: Record<FalsePositiveStatus, number> = {
      DETECTED: 0,
      REVIEW_REQUIRED: 0,
      SUPPORTED_BY_MULTIPLE_SOURCES: 0,
      CONFIRMED_BY_PUBLIC_SOURCE: 0,
      DISMISSED: 0,
    };

    const byForestFunction: Record<string, number> = {};
    let totalDisturbanceAreaHa = 0;
    let withFire = 0;
    let withLandChange = 0;
    let withOsint = 0;

    indicators.forEach((i) => {
      byActivityType[i.indicatorType] = (byActivityType[i.indicatorType] || 0) + 1;
      byPriority[i.priority] = (byPriority[i.priority] || 0) + 1;
      byVerificationPriority[i.verificationPriority] = (byVerificationPriority[i.verificationPriority] || 0) + 1;
      byLegalStatus[i.legalStatus] = (byLegalStatus[i.legalStatus] || 0) + 1;
      byAuthorizationStatus[i.authorizationStatus] = (byAuthorizationStatus[i.authorizationStatus] || 0) + 1;
      byFalsePositiveStatus[i.status] = (byFalsePositiveStatus[i.status] || 0) + 1;
      byForestFunction[i.forestFunction] = (byForestFunction[i.forestFunction] || 0) + 1;

      totalDisturbanceAreaHa += i.areaHa;
      if (i.fireCorrelation) withFire++;
      if (i.landChangeCorrelation) withLandChange++;
      if (i.osintCorrelation) withOsint++;
    });

    return {
      totalIndicators: indicators.length,
      activeIndicators: indicators.filter((i) => i.status !== 'DISMISSED').length,
      newIndicators: indicators.filter((i) => i.temporalPattern === 'NEW').length,
      highPriorityIndicators: indicators.filter((i) => i.priority === 'HIGH' || i.priority === 'VERY_HIGH').length,
      urgentVerificationCount: indicators.filter((i) => i.verificationPriority === 'URGENT').length,
      totalDisturbanceAreaHa: Math.round(totalDisturbanceAreaHa * 10) / 10,
      byActivityType,
      byPriority,
      byVerificationPriority,
      byLegalStatus,
      byAuthorizationStatus,
      byForestFunction,
      byFalsePositiveStatus,
      correlationsCount: {
        withFire,
        withLandChange,
        withOsint,
        withEnforcement: this.enforcementCache.length,
      },
      enforcementEventsCount: this.enforcementCache.length,
      lastAnalysisDate: '2026-09-30T06:30:00Z',
      analysisRunId: 'RUN-PHASE10-20260930-001',
    };
  }

  public static getMapFeatureCollection(): any {
    this.ensureInitialized();
    return {
      type: 'FeatureCollection',
      features: this.indicatorsCache.map((ind) => ({
        type: 'Feature',
        id: ind.indicatorId,
        geometry: ind.geometry,
        properties: {
          indicatorId: ind.indicatorId,
          indicatorType: ind.indicatorType,
          indicatorSubtype: ind.indicatorSubtype,
          title: ind.title,
          areaHa: ind.areaHa,
          centroid: ind.centroid,
          detectionDate: ind.detectionDate,
          priority: ind.priority,
          verificationPriority: ind.verificationPriority,
          activityScore: ind.activityScore,
          confidence: ind.confidence,
          forestFunction: ind.forestFunction,
          kecamatan: ind.kecamatan,
          desa: ind.desa,
          legalStatus: ind.legalStatus,
          status: ind.status,
          fireCorrelation: ind.fireCorrelation,
          landChangeCorrelation: ind.landChangeCorrelation,
          osintCorrelation: ind.osintCorrelation,
          authorizationStatus: ind.authorizationStatus,
          sourceCount: ind.sourceCount,
          evidenceCount: ind.evidenceCount,
        },
      })),
    };
  }

  public static getTimeline(): any[] {
    this.ensureInitialized();
    const timelineItems: any[] = [];

    this.indicatorsCache.forEach((ind) => {
      timelineItems.push({
        id: ind.indicatorId,
        date: ind.detectionDate,
        title: ind.title,
        type: ind.indicatorType,
        category: 'ACTIVITY_INDICATOR',
        kecamatan: ind.kecamatan,
        areaHa: ind.areaHa,
        priority: ind.priority,
        legalStatus: ind.legalStatus,
      });
    });

    this.enforcementCache.forEach((enf) => {
      timelineItems.push({
        id: enf.enforcementEventId,
        date: enf.eventDate,
        title: enf.activityType,
        type: enf.eventType,
        category: 'PUBLIC_ENFORCEMENT',
        agency: enf.agency,
        kecamatan: enf.kecamatan,
        caseReference: enf.caseReference,
        legalStatus: enf.legalStatus,
      });
    });

    return timelineItems.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public static updateReviewStatus(
    id: string,
    status: FalsePositiveStatus,
    falsePositiveReason: any,
    reviewNotes?: string,
    reviewedBy: string = 'KPH Sintang Intelligence Officer'
  ): ForestryActivityIndicator | null {
    this.ensureInitialized();
    const ind = this.indicatorsCache.find((i) => i.indicatorId === id);
    if (!ind) return null;

    ind.status = status;
    ind.falsePositiveReason = falsePositiveReason;
    if (reviewNotes) ind.reviewNotes = reviewNotes;
    ind.reviewedBy = reviewedBy;
    ind.reviewedAt = new Date().toISOString();
    ind.updatedAt = new Date().toISOString();

    return ind;
  }
}
