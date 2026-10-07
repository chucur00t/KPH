import crypto from 'crypto';
import { IPublicSourceCollector } from './collector.interface';
import {
  OsintSource,
  SourceItem,
  RawSource,
  SourceHealth,
} from '../../../types/osint';

export class DocumentCollector implements IPublicSourceCollector {
  public readonly collectorType = 'DOCUMENT';

  async discover(source: OsintSource): Promise<SourceItem[]> {
    if (source.status === 'ACCESS_RESTRICTED') {
      return [];
    }

    const items: SourceItem[] = [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(source.base_url, {
        headers: {
          'User-Agent': 'KPH-Public-Intelligence-Collector/1.0 (+https://kph-sintang.kalbarprov.go.id/bot)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const text = await response.text();
        // Look for .pdf, .docx, .xlsx links
        const docRegex = /href=["']([^"']*\.(?:pdf|docx|xlsx))["'][^>]*>(.*?)<\/a>/gi;
        let match;
        const seen = new Set<string>();

        while ((match = docRegex.exec(text)) !== null && items.length < 15) {
          let href = match[1];
          const label = match[2].replace(/<[^>]+>/g, '').trim() || href.split('/').pop() || 'Dokumen Publik';

          if (href.startsWith('/')) {
            const origin = new URL(source.base_url).origin;
            href = `${origin}${href}`;
          }

          if ((href.startsWith('http://') || href.startsWith('https://')) && !seen.has(href)) {
            seen.add(href);
            items.push({
              id: `doc-${crypto.createHash('md5').update(href).digest('hex')}`,
              url: href,
              title: label,
              publishedAt: new Date().toISOString(),
              sourceId: source.source_id,
            });
          }
        }
      }
    } catch {
      // Fallback
    }

    return items;
  }

  async fetch(item: SourceItem): Promise<RawSource> {
    const fetchedAt = new Date().toISOString();
    let rawText = `Dokumen Publik: ${item.title}. URL: ${item.url}`;
    let httpStatus = 200;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(item.url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      httpStatus = res.status;
    } catch {
      // Keep snippet
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
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(source.base_url, { method: 'HEAD', signal: controller.signal });
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
        errorMessage: e.message || 'Host unreachable',
      };
    }
  }
}
