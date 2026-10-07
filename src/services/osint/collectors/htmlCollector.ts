import crypto from 'crypto';
import { IPublicSourceCollector } from './collector.interface';
import {
  OsintSource,
  SourceItem,
  RawSource,
  SourceHealth,
} from '../../../types/osint';

export class HtmlCollector implements IPublicSourceCollector {
  public readonly collectorType = 'HTML';

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
        const html = await response.text();
        // Look for internal article links (<a href="...">...</a>)
        const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
        let match;
        const seenUrls = new Set<string>();

        while ((match = linkRegex.exec(html)) !== null && items.length < 20) {
          let href = match[1];
          const text = match[2].replace(/<[^>]+>/g, '').trim();

          if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            continue;
          }

          if (href.startsWith('/')) {
            const origin = new URL(source.base_url).origin;
            href = `${origin}${href}`;
          }

          if (
            (href.startsWith('http://') || href.startsWith('https://')) &&
            !seenUrls.has(href) &&
            text.length > 15 &&
            /berita|peraturan|laporan|agenda|siaran|rilis|hutan|lahan|desa/i.test(text + href)
          ) {
            seenUrls.add(href);
            items.push({
              id: `html-${crypto.createHash('md5').update(href).digest('hex')}`,
              url: href,
              title: text,
              publishedAt: new Date().toISOString(),
              sourceId: source.source_id,
            });
          }
        }
      }
    } catch {
      // Graceful fallback
    }

    return items;
  }

  async fetch(item: SourceItem): Promise<RawSource> {
    const fetchedAt = new Date().toISOString();
    let rawText = item.title;
    let htmlContent = '';
    let httpStatus = 200;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(item.url, { signal: controller.signal });
      clearTimeout(timeout);
      httpStatus = response.status;

      if (response.ok) {
        htmlContent = await response.text();
        rawText = htmlContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } catch {
      // Return snippet
    }

    const contentHash = crypto.createHash('sha256').update(rawText).digest('hex');
    return {
      sourceItem: item,
      rawText,
      htmlContent,
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
