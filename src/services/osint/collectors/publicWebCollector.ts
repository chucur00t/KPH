import crypto from 'crypto';
import { IPublicSourceCollector } from './collector.interface';
import { RssCollector } from './rssCollector';
import { ApiCollector } from './apiCollector';
import { SitemapCollector } from './sitemapCollector';
import { HtmlCollector } from './htmlCollector';
import { DocumentCollector } from './documentCollector';
import {
  OsintSource,
  OsintSourceRecord,
  SourceHealth,
  CollectorHarvestResult,
  RobotsStatus,
} from '../../../types/osint';

export class PublicWebCollector {
  private static collectors: Map<string, IPublicSourceCollector> = new Map<string, IPublicSourceCollector>([
    ['RSS', new RssCollector()],
    ['API', new ApiCollector()],
    ['SITEMAP', new SitemapCollector()],
    ['HTML', new HtmlCollector()],
    ['DOCUMENT', new DocumentCollector()],
  ]);

  /**
   * Check robots.txt politely
   */
  public static async checkRobots(baseUrl: string): Promise<RobotsStatus> {
    try {
      const url = new URL(baseUrl);
      const robotsUrl = `${url.origin}/robots.txt`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(robotsUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return 'NO_ROBOTS';
      }

      const txt = await res.text();
      // If Disallow: / or Disallow: /* is for all agents
      if (/user-agent:\s*\*\s*\n(?:.*\n)*?disallow:\s*\/\s*$/im.test(txt)) {
        return 'DISALLOWED';
      }
      return 'ALLOWED';
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Run collection cycle on a list of registered public sources
   */
  public static async runHarvest(
    sources: OsintSource[],
    existingHashes: Set<string>
  ): Promise<{
    harvestResult: CollectorHarvestResult;
    newRecords: OsintSourceRecord[];
  }> {
    const startedAt = new Date().toISOString();
    const runId = `RUN-HARVEST-${Date.now()}`;
    const newRecords: OsintSourceRecord[] = [];
    const details: CollectorHarvestResult['details'] = [];

    let totalDiscovered = 0;
    let skippedDuplicate = 0;
    let errorsCount = 0;

    for (const source of sources) {
      if (source.status === 'OFFLINE' || source.status === 'BLOCKED' || source.status === 'ACCESS_RESTRICTED') {
        details.push({
          source_id: source.source_id,
          items_count: 0,
          status: `SKIPPED_${source.status}`,
        });
        continue;
      }

      const collector = this.getCollector(source.access_method);
      if (!collector) {
        continue;
      }

      try {
        // 1. Discover items
        const items = await collector.discover(source);
        totalDiscovered += items.length;
        let sourceNewCount = 0;

        // 2. Fetch and deduplicate with polite throttle (max 5 items per source per run)
        for (const item of items.slice(0, 5)) {
          const raw = await collector.fetch(item);

          if (existingHashes.has(raw.contentHash)) {
            skippedDuplicate++;
            continue;
          }

          existingHashes.add(raw.contentHash);
          const recordId = `REC-${crypto.createHash('md5').update(raw.contentHash + item.url).digest('hex').slice(0, 12).toUpperCase()}`;

          const record: OsintSourceRecord = {
            record_id: recordId,
            source_id: source.source_id,
            source_url: item.url,
            canonical_url: raw.canonicalUrl || item.url,
            title: item.title,
            author: item.author || source.provider,
            publisher: source.provider,
            published_at: item.publishedAt || new Date().toISOString(),
            retrieved_at: raw.fetchedAt,
            content_type: 'text/html',
            language: source.language || 'id',
            content_hash: raw.contentHash,
            raw_reference: `/raw/osint/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${recordId}/snapshot.txt`,
            text_content: raw.rawText,
            summary: raw.rawText.slice(0, 240) + '...',
            http_status: raw.httpStatus,
            retrieval_status: 'SUCCESS',
            created_at: new Date().toISOString(),
          };

          newRecords.push(record);
          sourceNewCount++;
        }

        details.push({
          source_id: source.source_id,
          items_count: sourceNewCount,
          status: 'SUCCESS',
        });
      } catch (err: any) {
        errorsCount++;
        details.push({
          source_id: source.source_id,
          items_count: 0,
          status: `ERROR: ${err.message || 'Harvester exception'}`,
        });
      }
    }

    const finishedAt = new Date().toISOString();
    const harvestResult: CollectorHarvestResult = {
      run_id: runId,
      started_at: startedAt,
      finished_at: finishedAt,
      total_sources_scanned: sources.length,
      items_discovered: totalDiscovered,
      records_ingested: newRecords.length,
      records_skipped_duplicate: skippedDuplicate,
      errors_count: errorsCount,
      details,
    };

    return { harvestResult, newRecords };
  }

  /**
   * Health check single source
   */
  public static async checkHealth(source: OsintSource): Promise<SourceHealth> {
    const collector = this.getCollector(source.access_method);
    if (!collector) {
      return {
        sourceId: source.source_id,
        status: 'UNVERIFIED',
        responseTimeMs: 0,
        httpStatusCode: 0,
        robotsCompliant: false,
        lastChecked: new Date().toISOString(),
        errorMessage: `No collector registered for method ${source.access_method}`,
      };
    }
    return collector.healthCheck(source);
  }

  private static getCollector(accessMethod: string): IPublicSourceCollector | undefined {
    const upper = accessMethod.toUpperCase();
    if (upper.includes('RSS') || upper.includes('ATOM')) return this.collectors.get('RSS');
    if (upper.includes('API') || upper.includes('JSON')) return this.collectors.get('API');
    if (upper.includes('SITEMAP')) return this.collectors.get('SITEMAP');
    if (upper.includes('DOC') || upper.includes('FILE')) return this.collectors.get('DOCUMENT');
    return this.collectors.get('HTML');
  }
}
