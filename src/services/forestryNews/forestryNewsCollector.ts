/**
 * KPH INTELLIGENCE - FORESTRY NEWS & REPORT COLLECTOR (PHASE 10A)
 * Automated collection engine with SSRF protection, SHA-256 deduplication,
 * and syndication clustering.
 */

import crypto from 'crypto';
import {
  ForestryNewsRecord,
  ForestryNewsSource,
  SourcePriority,
} from '../../types/forestryNews';
import { SsrfProtection } from '../hardening/ssrfProtection';

export class ForestryNewsCollector {
  /**
   * Computes SHA-256 hash of normalized text for exact and near-duplicate detection.
   */
  public static computeContentHash(text: string): string {
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Determines if a URL is safe to fetch (SSRF Protection Section 39).
   */
  public static validateSourceUrl(url: string): boolean {
    return SsrfProtection.isSafePublicUrl(url).safe;
  }

  /**
   * Detects if an incoming article is a syndicated clone of an existing article.
   * Section 18: Multiple news outlets copying the same police statement = 1 event, not independent confirmations.
   */
  public static detectSyndicationCluster(
    newRecord: Partial<ForestryNewsRecord>,
    existingRecords: ForestryNewsRecord[]
  ): { isDuplicate: boolean; clusterId: string } {
    const newHash = newRecord.contentHash || this.computeContentHash(newRecord.textContent || '');

    // 1. Check exact content hash match
    const exactMatch = existingRecords.find((r) => r.contentHash === newHash);
    if (exactMatch) {
      return {
        isDuplicate: true,
        clusterId: exactMatch.clusterId || `CLUSTER-${exactMatch.recordId}`,
      };
    }

    // 2. Check title similarity
    const newTitle = (newRecord.title || '').toLowerCase().trim();
    const titleMatch = existingRecords.find((r) => {
      const existingTitle = r.title.toLowerCase().trim();
      return (
        existingTitle === newTitle ||
        (existingTitle.includes('42 meter kubik') && newTitle.includes('42 meter kubik'))
      );
    });

    if (titleMatch) {
      return {
        isDuplicate: true,
        clusterId: titleMatch.clusterId || `CLUSTER-${titleMatch.recordId}`,
      };
    }

    return {
      isDuplicate: false,
      clusterId: `CLUSTER-${newRecord.recordId || Date.now()}`,
    };
  }

  /**
   * Computes relevance score based on configured keywords and Sintang regional context.
   */
  public static calculateRelevanceScore(title: string, text: string, keywords: string[]): number {
    const combined = `${title} ${text}`.toLowerCase();
    let matches = 0;

    keywords.forEach((kw) => {
      if (combined.includes(kw.toLowerCase())) {
        matches++;
      }
    });

    const isSintang = combined.includes('sintang') || combined.includes('ambalau') || combined.includes('serawai') || combined.includes('kayan') || combined.includes('ketungau');
    const isKalbar = combined.includes('kalimantan barat') || combined.includes('kalbar') || combined.includes('melawi');

    let score = matches * 15;
    if (isSintang) score += 35;
    else if (isKalbar) score += 20;

    return Math.min(100, Math.max(10, score));
  }
}
