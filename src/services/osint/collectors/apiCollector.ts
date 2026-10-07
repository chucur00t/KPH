import crypto from 'crypto';
import { IPublicSourceCollector } from './collector.interface';
import {
  OsintSource,
  SourceItem,
  RawSource,
  SourceHealth,
} from '../../../types/osint';

export class ApiCollector implements IPublicSourceCollector {
  public readonly collectorType = 'API';

  async discover(source: OsintSource): Promise<SourceItem[]> {
    if (source.status === 'ACCESS_RESTRICTED' || !source.api_url) {
      return [];
    }

    const items: SourceItem[] = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(source.api_url, {
        headers: {
          'User-Agent': 'KPH-Public-Intelligence-Collector/1.0 (+https://kph-sintang.kalbarprov.go.id/bot)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const json = await response.json();
        const records = Array.isArray(json) ? json : (json.data || json.results || json.records || []);

        records.slice(0, 20).forEach((entry: any, idx: number) => {
          const title = entry.title || entry.name || entry.subject || `API Record #${idx + 1}`;
          const url = entry.url || entry.link || `${source.api_url}#record-${idx}`;
          const publishedAt = entry.published_at || entry.created_at || entry.date || new Date().toISOString();
          const snippet = entry.description || entry.summary || entry.excerpt || JSON.stringify(entry).slice(0, 200);

          items.push({
            id: `api-${crypto.createHash('md5').update(url + title).digest('hex')}`,
            url,
            title,
            publishedAt,
            sourceId: source.source_id,
            author: entry.author || entry.publisher,
            snippet,
          });
        });
      }
    } catch {
      // Graceful fallback
    }

    return items;
  }

  async fetch(item: SourceItem): Promise<RawSource> {
    const fetchedAt = new Date().toISOString();
    let rawText = item.snippet || item.title;
    let httpStatus = 200;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(item.url, { signal: controller.signal });
      clearTimeout(timeout);
      httpStatus = res.status;
      if (res.ok) {
        const text = await res.text();
        rawText = text.slice(0, 5000);
      }
    } catch {
      // Use snippet
    }

    const contentHash = crypto.createHash('sha256').update(rawText).digest('hex');
    return {
      sourceItem: item,
      rawText,
      httpStatus,
      fetchedAt,
      contentHash,
      canonicalUrl: item.url,
    };
  }

  async healthCheck(source: OsintSource): Promise<SourceHealth> {
    const targetUrl = source.api_url || source.base_url;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(targetUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      return {
        sourceId: source.source_id,
        status: res.ok ? 'ACTIVE' : 'DEGRADED',
        responseTimeMs: Date.now() - start,
        httpStatusCode: res.status,
        robotsCompliant: true,
        lastChecked: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        sourceId: source.source_id,
        status: 'OFFLINE',
        responseTimeMs: Date.now() - start,
        httpStatusCode: 0,
        robotsCompliant: true,
        lastChecked: new Date().toISOString(),
        errorMessage: e.message || 'API endpoint unreachable',
      };
    }
  }
}
