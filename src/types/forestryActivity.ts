/**
 * KPH INTELLIGENCE - FORESTRY ACTIVITY & DISTURBANCE INTELLIGENCE TYPES (PHASE 10)
 * Strict separation of Activity vs. Legal Status.
 * 100% Public Data Only, Evidence-First, Source-First.
 */

export type ForestryActivityType =
  | 'FOREST_DISTURBANCE'
  | 'POTENTIAL_LOGGING'
  | 'POTENTIAL_LAND_CLEARING'
  | 'POTENTIAL_ENCROACHMENT'
  | 'POTENTIAL_MINING'
  | 'POTENTIAL_PLANTATION_EXPANSION'
  | 'POTENTIAL_ROAD_CONSTRUCTION'
  | 'POTENTIAL_FOREST_FIRE_ACTIVITY';

export type LegalStatus =
  | 'UNKNOWN'
  | 'NOT_ASSESSED'
  | 'PUBLIC_LICENSE_RECORD_FOUND'
  | 'PUBLIC_AUTHORIZATION_RECORD_FOUND'
  | 'PUBLIC_RESTRICTION_RECORD_FOUND'
  | 'PUBLIC_VIOLATION_REPORTED'
  | 'PUBLIC_ENFORCEMENT_REPORTED'
  | 'PUBLIC_COURT_CASE_REPORTED'
  | 'PUBLIC_LEGAL_FINDING_AVAILABLE'
  | 'REQUIRES_VERIFICATION';

export type AuthorizationSpatialStatus =
  | 'WITHIN_PUBLIC_AUTHORIZED_AREA'
  | 'PARTIALLY_OVERLAPS_PUBLIC_AUTHORIZED_AREA'
  | 'OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA'
  | 'NO_PUBLIC_AUTHORIZATION_DATA';

export type ActivityTemporalPattern =
  | 'NEW'
  | 'INCREASING'
  | 'PERSISTENT'
  | 'RECURRING'
  | 'EXPANDING'
  | 'DECREASING'
  | 'RESOLVED'
  | 'UNKNOWN';

export type ActivityPriority = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export type VerificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type EvidenceClassification =
  | 'OBSERVATION'
  | 'DERIVED'
  | 'CORRELATION'
  | 'INTERPRETATION'
  | 'PUBLIC_CLAIM'
  | 'LEGAL_FINDING'
  | 'UNCERTAINTY';

export type FalsePositiveStatus =
  | 'DETECTED'
  | 'REVIEW_REQUIRED'
  | 'SUPPORTED_BY_MULTIPLE_SOURCES'
  | 'CONFIRMED_BY_PUBLIC_SOURCE'
  | 'DISMISSED';

export type FalsePositiveReason =
  | 'NONE'
  | 'CLOUD_OR_HAZE_ARTIFACT'
  | 'SEASONAL_AGRICULTURE_CYCLE'
  | 'LEGAL_HARVESTING_AUTHORIZED'
  | 'PLANTATION_MAINTENANCE'
  | 'NATURAL_DISTURBANCE_TREEFALL_FLOOD'
  | 'RIVER_BANK_EROSION_OR_MOVEMENT'
  | 'PERMITTED_INFRASTRUCTURE_WORK'
  | 'SENSOR_CALIBRATION_DIFFERENCE'
  | 'CLASSIFICATION_EDGE_ERROR'
  | 'PENDING_FIELD_GROUND_CHECK';

export interface SensitiveAreaOverlap {
  overlapType: 'HL' | 'HPT' | 'HP' | 'KSA_KPA' | 'PEATLAND_KHG' | 'SOCIAL_FORESTRY' | 'RIVER_BUFFER';
  layerName: string;
  overlapAreaHa: number;
  overlapPercentage: number;
  sourceDate: string;
  notes?: string;
}

export interface ForestryActivityEvidence {
  evidenceId: string;
  indicatorId: string;
  evidenceType: 'SATELLITE_SPECTRAL' | 'THERMAL_HOTSPOT' | 'GIS_OVERLAP' | 'OSINT_NEWS' | 'PUBLIC_REGULATION' | 'ENFORCEMENT_NOTICE';
  classification: EvidenceClassification;
  sourceId: string;
  sourceRecordId: string;
  sourceUrl: string;
  sourceDate: string;
  retrievedAt: string;
  description: string;
  sourceExcerpt: string;
  geometry?: any;
  evidenceStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  rawReference?: string;
  createdAt: string;
}

export interface ForestryActivityIndicator {
  indicatorId: string;
  indicatorType: ForestryActivityType;
  indicatorSubtype: string;
  title: string;
  description: string;
  geometry: {
    type: 'Polygon' | 'Point' | 'MultiPolygon';
    coordinates: any;
  };
  centroid: [number, number]; // [lon, lat]
  areaHa: number;
  detectionDate: string;
  dateBefore: string;
  dateAfter: string;

  // Source & Evidence metrics
  sourceCount: number;
  evidenceCount: number;
  evidenceList?: ForestryActivityEvidence[];

  // Spatial context & sensitive overlaps
  kecamatan: string;
  desa: string;
  kphUnit: string;
  forestOverlapAreaHa: number;
  forestOverlapPercentage: number;
  forestFunction: 'HL' | 'HPT' | 'HP' | 'KSA' | 'APL' | 'MIXED';
  sensitiveAreaOverlaps: SensitiveAreaOverlap[];
  peatlandOverlap: boolean;
  peatlandName?: string;
  socialForestryOverlap: boolean;
  concessionOverlap: boolean;
  concessionName?: string;
  plantationOverlap: boolean;
  miningOverlap: boolean;

  // Spatial proximity distances (meters)
  distanceToRoadM: number;
  distanceToRiverM: number;
  distanceToForestBoundaryM: number;

  // Cross-module correlations
  fireCorrelation: boolean;
  fireEventId?: string;
  hotspotsCount?: number;
  landChangeCorrelation: boolean;
  landChangeEventId?: string;
  ndviDrop?: number;
  osintCorrelation: boolean;
  osintEventId?: string;
  osintArticleHeadline?: string;

  // Authorization context (never implies illegality)
  authorizationStatus: AuthorizationSpatialStatus;
  authorizationReference?: string;
  authorizationNotes: string;

  // Deterministic scoring & priority
  activityScore: number; // 0 - 100
  scoreVersion: string;
  evidenceStrength: 'LOW' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: ActivityPriority;
  verificationPriority: VerificationPriority;
  temporalPattern: ActivityTemporalPattern;

  // Separate legal status dimension
  legalStatus: LegalStatus;
  legalStatusReason: string;

  // False positive management
  status: FalsePositiveStatus;
  falsePositiveReason: FalsePositiveReason;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  analysisRunId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForestryEnforcementEvent {
  enforcementEventId: string;
  eventType:
    | 'TIMBER_SEIZURE'
    | 'ILLEGAL_LOGGING_ENFORCEMENT'
    | 'MINING_ENFORCEMENT'
    | 'FOREST_ENCROACHMENT_ENFORCEMENT'
    | 'FIRE_ENFORCEMENT'
    | 'PLANTATION_ENFORCEMENT'
    | 'COURT_CASE'
    | 'ADMINISTRATIVE_SANCTION';
  agency: string; // e.g. "Gakkum KLHK Wilayah Kalimantan", "Polres Sintang", "BPPHLHK"
  location: string;
  kecamatan?: string;
  geometry: {
    type: 'Point' | 'Polygon';
    coordinates: any;
  };
  centroid: [number, number];
  eventDate: string;
  publicationDate: string;
  caseReference: string;
  organization?: string;
  publicEntity?: string;
  activityType: string;
  description: string;
  legalReference: string;
  legalStatus: LegalStatus;
  sourceId: string;
  sourceUrl: string;
  sourceExcerpt: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'REPORTED' | 'PROCEEDING' | 'DECIDED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface PublicAuthorizationRecord {
  authorizationId: string;
  permitType: 'IUPHHK_HA' | 'IUPHHK_HT' | 'HGU_PLANTATION' | 'IUP_MINING' | 'PERSETUJUAN_PENGGUNAAN_KAWASAN_HUTAN' | 'HUTAN_DESA_PERHUTANAN_SOSIAL';
  holderName: string;
  decreeNumber: string; // Nomor SK
  decreeDate: string;
  validUntil: string;
  commodity?: string;
  totalAreaHa: number;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  centroid: [number, number];
  kecamatan: string[];
  publicSourceUrl: string;
  sourceAgency: string;
  isPubliclyRegistered: boolean;
}

export interface ForestryActivitySummary {
  totalIndicators: number;
  activeIndicators: number;
  newIndicators: number;
  highPriorityIndicators: number;
  urgentVerificationCount: number;
  totalDisturbanceAreaHa: number;
  byActivityType: Record<ForestryActivityType, number>;
  byPriority: Record<ActivityPriority, number>;
  byVerificationPriority: Record<VerificationPriority, number>;
  byLegalStatus: Record<LegalStatus, number>;
  byAuthorizationStatus: Record<AuthorizationSpatialStatus, number>;
  byForestFunction: Record<string, number>;
  byFalsePositiveStatus: Record<FalsePositiveStatus, number>;
  correlationsCount: {
    withFire: number;
    withLandChange: number;
    withOsint: number;
    withEnforcement: number;
  };
  enforcementEventsCount: number;
  lastAnalysisDate: string;
  analysisRunId: string;
}
