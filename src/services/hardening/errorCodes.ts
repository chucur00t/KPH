/**
 * KPH INTELLIGENCE - PRODUCTION ERROR CODES & CLASSIFICATION (FASE 9)
 * Strict centralized taxonomy of operational and processing errors.
 */

export const ErrorCodes = {
  SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
  SOURCE_INVALID: 'SOURCE_INVALID',
  RATE_LIMITED: 'RATE_LIMITED',
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  GEOMETRY_INVALID: 'GEOMETRY_INVALID',
  DATA_PARSE_ERROR: 'DATA_PARSE_ERROR',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  AI_UNAVAILABLE: 'AI_UNAVAILABLE',
  AI_SCHEMA_ERROR: 'AI_SCHEMA_ERROR',
  AI_TIMEOUT: 'AI_TIMEOUT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  GIS_ERROR: 'GIS_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  PROVENANCE_ERROR: 'PROVENANCE_ERROR',
  SSRF_VIOLATION: 'SSRF_VIOLATION',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface SystemErrorDetail {
  code: ErrorCode;
  message: string;
  source_id?: string;
  record_id?: string;
  details?: Record<string, any>;
  timestamp: string;
}
