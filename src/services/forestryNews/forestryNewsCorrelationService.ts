/**
 * KPH INTELLIGENCE - FORESTRY NEWS CORRELATION SERVICE (PHASE 10A)
 * Correlates News reports with Satellite, Fire, Court, and Enforcement events.
 * Handles source conflicts and syndication deduplication.
 */

import {
  ForestryNewsEvent,
  ForestryNewsRecord,
} from '../../types/forestryNews';

export class ForestryNewsCorrelationService {
  /**
   * Evaluates cross-source corroboration strength.
   * Section 19: Syndicated copies of the same article do NOT count as independent sources.
   */
  public static evaluateCorroboration(
    event: ForestryNewsEvent,
    records: ForestryNewsRecord[]
  ): {
    independentSourceCount: number;
    syndicatedCopiesCount: number;
    corroborationStrength: 'SINGLE_SOURCE' | 'MODERATE' | 'STRONG';
  } {
    const relatedRecords = records.filter((r) =>
      event.sourceRecords.includes(r.recordId) || (r.clusterId && r.clusterId === event.recordId)
    );

    // Group by publisher
    const distinctPublishers = new Set(
      relatedRecords.filter((r) => !r.isSyndicatedCopy).map((r) => r.publisher)
    );

    const independentCount = Math.max(1, distinctPublishers.size);
    const syndicatedCount = relatedRecords.filter((r) => r.isSyndicatedCopy).length;

    let strength: 'SINGLE_SOURCE' | 'MODERATE' | 'STRONG' = 'SINGLE_SOURCE';
    if (independentCount >= 3 || (independentCount >= 2 && event.legalStatus === 'ENFORCEMENT_REPORTED')) {
      strength = 'STRONG';
    } else if (independentCount >= 2) {
      strength = 'MODERATE';
    }

    return {
      independentSourceCount: independentCount,
      syndicatedCopiesCount: syndicatedCount,
      corroborationStrength: strength,
    };
  }

  /**
   * Section 37: Checks for conflicting dates or facts across public sources.
   */
  public static detectSourceConflict(
    records: ForestryNewsRecord[]
  ): { hasConflict: boolean; notes?: string } {
    if (records.length <= 1) return { hasConflict: false };

    // Check if dates differ significantly between original reports
    const dates = records.map((r) => r.publishedAt.substring(0, 10));
    const uniqueDates = Array.from(new Set(dates));

    if (uniqueDates.length > 2) {
      return {
        hasConflict: true,
        notes: `Terdapat perbedaan tanggal publikasi lintas sumber publik (${uniqueDates.join(', ')}). Diperlukan verifikasi kronologi resmi.`,
      };
    }

    return { hasConflict: false };
  }
}
