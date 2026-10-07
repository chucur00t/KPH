/**
 * KPH INTELLIGENCE - PHASE 10A: FORESTRY ILLEGAL ACTIVITY NEWS & REPORT MONITORING TYPES
 * Strict separation of: Public Report != Verified Fact != Legal Finding != Conviction.
 * 100% Public Data Only, Zero Private Channel Dependency, Source-First Provenance.
 */

export type ForestryNewsActivityCategory =
  | 'FORESTRY'
  | 'FIRE'
  | 'MINING'
  | 'PLANTATION'
  | 'WILDLIFE'
  | 'ENFORCEMENT'
  | 'COURT_CASE'
  | 'OTHER';

export type ForestryNewsActivityType =
  // Forestry
  | 'ILLEGAL_LOGGING'
  | 'FOREST_ENCROACHMENT'
  | 'FOREST_CLEARING'
  | 'UNAUTHORIZED_LAND_CLEARING'
  | 'FOREST_CONVERSION'
  | 'ILLEGAL_TIMBER_TRANSPORT'
  | 'ILLEGAL_TIMBER_TRADE'
  | 'ILLEGAL_TIMBER_STORAGE'
  | 'ILLEGAL_SAWMILL'
  | 'ILLEGAL_FOREST_USE'
  // Fire
  | 'ILLEGAL_BURNING'
  | 'FOREST_FIRE'
  | 'LAND_FIRE'
  | 'PEAT_FIRE'
  | 'FIRE_RELATED_LAND_CLEARING'
  // Mining
  | 'ILLEGAL_MINING'
  | 'UNAUTHORIZED_MINING'
  | 'MINING_IN_FOREST_AREA'
  | 'MINING_WITHOUT_PERMIT'
  | 'MINING_ENVIRONMENTAL_VIOLATION'
  // Plantation / Agriculture
  | 'UNAUTHORIZED_PLANTATION'
  | 'PLANTATION_ENCROACHMENT'
  | 'PLANTATION_ENVIRONMENTAL_VIOLATION'
  | 'UNAUTHORIZED_LAND_CONVERSION'
  // Wildlife
  | 'ILLEGAL_WILDLIFE_TRADE'
  | 'WILDLIFE_POACHING'
  | 'PROTECTED_SPECIES_TRAFFICKING'
  | 'HABITAT_DESTRUCTION'
  // Enforcement
  | 'TIMBER_SEIZURE'
  | 'ARREST'
  | 'INVESTIGATION'
  | 'POLICE_OPERATION'
  | 'FORESTRY_ENFORCEMENT'
  | 'MINING_ENFORCEMENT'
  | 'FIRE_ENFORCEMENT'
  | 'COURT_CASE'
  | 'PROSECUTION'
  | 'CONVICTION'
  | 'ADMINISTRATIVE_SANCTION'
  | 'PERMIT_REVOCATION';

export type NewsClaimType =
  | 'ALLEGATION'
  | 'PUBLIC_REPORT'
  | 'OFFICIAL_STATEMENT'
  | 'INVESTIGATION'
  | 'ENFORCEMENT'
  | 'LEGAL_FINDING'
  | 'CONVICTION';

export type NewsLegalStatus =
  | 'ALLEGED'
  | 'REPORTED'
  | 'UNDER_INVESTIGATION'
  | 'INVESTIGATION_ANNOUNCED'
  | 'ENFORCEMENT_REPORTED'
  | 'CHARGED'
  | 'PROSECUTED'
  | 'COURT_CASE'
  | 'CONVICTED'
  | 'ACQUITTED'
  | 'ADMINISTRATIVE_SANCTION'
  | 'PERMIT_REVOKED'
  | 'LEGAL_STATUS_UNKNOWN';

export type LocationPrecision =
  | 'EXACT'
  | 'VILLAGE'
  | 'DISTRICT'
  | 'REGENCY'
  | 'PROVINCE'
  | 'UNKNOWN';

export type NewsReportStatus =
  | 'ORIGINAL_REPORT'
  | 'UPDATED_REPORT'
  | 'CORRECTION'
  | 'RETRACTION'
  | 'DENIAL'
  | 'FOLLOW_UP';

export type NewsEventStatus =
  | 'REPORTED'
  | 'EXTRACTED'
  | 'CORRELATED'
  | 'REQUIRES_REVIEW'
  | 'CONFIRMED_BY_PUBLIC_AUTHORITY'
  | 'DISMISSED';

export type SourcePriority = 'AUTHORITATIVE' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SourceMonitoringHealth =
  | 'ACTIVE'
  | 'DEGRADED'
  | 'OFFLINE'
  | 'UNVERIFIED'
  | 'REQUIRES_REVIEW';

export interface ForestryNewsSource {
  sourceId: string;
  sourceName: string;
  publisher: string;
  sourceCategory: 'OFFICIAL_GOV' | 'POLICE_JUDICIARY' | 'NEWS_WIRE' | 'REGIONAL_PRESS' | 'NGO_PORTAL';
  sourceRegion: string;
  sourceLanguage: string;
  baseUrl: string;
  rssSupported: boolean;
  rssUrl?: string;
  apiSupported: boolean;
  crawlMethod: 'RSS' | 'API' | 'HTML_SCRAPE';
  crawlFrequency: 'REALTIME' | 'HOURLY' | 'DAILY';
  monitoringPriority: SourcePriority;
  monitoringEnabled: boolean;
  keywordProfile: string[];
  lastSuccessAt: string | null;
  lastError: string | null;
  status: SourceMonitoringHealth;
  httpStatus: number;
}

export interface ForestryNewsRecord {
  recordId: string;
  sourceId: string;
  sourceUrl: string;
  canonicalUrl: string;
  title: string;
  subtitle?: string;
  publisher: string;
  author?: string;
  publishedAt: string;
  retrievedAt: string;
  language: string;
  contentType: 'NEWS_ARTICLE' | 'PRESS_RELEASE' | 'COURT_NOTICE' | 'REGULATORY_GAZETTE';
  contentHash: string; // SHA-256 for deduplication
  rawReference?: string;
  textContent: string;
  summary: string;
  relevanceScore: number; // 0 - 100
  sourcePriority: SourcePriority;
  retrievalStatus: 'SUCCESS' | 'CONTENT_NOT_AVAILABLE' | 'FETCH_ERROR';
  clusterId?: string; // Grouping syndicated duplicate articles
  isSyndicatedCopy?: boolean;
  reportStatus: NewsReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ForestryNewsClaim {
  claimId: string;
  recordId: string;
  claimText: string;
  claimType: NewsClaimType;
  subject: string;
  predicate: string;
  object: string;
  eventDate?: string;
  locationName?: string;
  sourceExcerpt: string;
  sourceUrl: string;
  extractionMethod: 'NLP_EXTRACTOR' | 'GEMINI_STRUCTURED' | 'REGEX_RULE';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

export interface ForestryNewsEvent {
  eventId: string;
  recordId: string;
  sourceCount: number; // Distinct independent sources (not syndicate clones)
  sourceRecords: string[];
  eventType: ForestryNewsActivityCategory;
  activityType: ForestryNewsActivityType;
  title: string;
  description: string;
  eventDate: string; // incident date
  publicationDate: string; // article publish date
  locationName: string;
  locationPrecision: LocationPrecision;
  locationConfidence: 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  geometry?: {
    type: 'Point' | 'Polygon';
    coordinates: any;
  };
  centroid?: [number, number]; // [lon, lat]
  entities: Array<{
    type: 'PERSON' | 'ORGANIZATION' | 'COMPANY' | 'GOVERNMENT_AGENCY' | 'POLICE_UNIT' | 'KPH' | 'COMMUNITY' | 'RIVER' | 'FOREST_AREA';
    name: string;
    role: 'REPORTED_PARTY' | 'ENFORCEMENT_AGENCY' | 'WITNESS' | 'LEGAL_ENTITY' | 'AFFECTED_AREA';
  }>;
  legalStatus: NewsLegalStatus;
  legalStatusReason: string;
  claimType: NewsClaimType;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  monitoringPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: NewsEventStatus;

  // Cross-module correlations
  satelliteCorrelated: boolean;
  satelliteEventId?: string;
  fireCorrelated: boolean;
  fireEventId?: string;
  gisContext?: {
    kphUnit: string;
    kecamatan: string;
    forestFunction?: string;
    peatland?: boolean;
    distanceToRiverM?: number;
    distanceToRoadM?: number;
  };

  hasSourceConflict: boolean;
  sourceConflictNotes?: string;
  reportStatus: NewsReportStatus;

  createdAt: string;
  updatedAt: string;
}

export interface ForestryNewsSummary {
  totalRecords: number;
  relevantRecords: number;
  distinctEvents: number;
  highPriorityReports: number;
  enforcementReports: number;
  courtCasesCount: number;
  byCategory: Record<ForestryNewsActivityCategory, number>;
  byActivityType: Record<string, number>;
  byLegalStatus: Record<NewsLegalStatus, number>;
  byKecamatan: Record<string, number>;
  correlationsCount: {
    withSatellite: number;
    withFire: number;
    withOfficialPress: number;
    withCourt: number;
  };
  sourcesCount: {
    total: number;
    active: number;
    degraded: number;
  };
  lastMonitoredAt: string;
}
