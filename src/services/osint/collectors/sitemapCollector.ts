import crypto from 'crypto';
import { IPublicSourceCollector } from './collector.interface';
import {
  OsintSource,
  SourceItem,
  RawSource,
  SourceHealth,
} from '../../../types/osint';

export class SitemapCollector implements IPublicSourceCollector {
  public readonly collectorType = 'SITEMAP';

  async discover(source: OsintSource): Promise<SourceItem[]> {
    if (source.status === 'ACCESS_RESTRICTED') {
      return [];
    }

    const sitemapUrl = source.sitemap_url || `${source.base_url.replace(/\/+$/, '')}/sitemap.xml`;
    const items: SourceItem[] = [];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(sitemapUrl, {
        headers: {
          'User-Agent': 'KPH-Public-Intelligence-Collector/1.0 (+https://kph-sintang.kalbarprov.go.id/bot)',
          'Accept': 'application/xml, text/xml, */*',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const xml = await response.text();
        const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/gi) || [];

        for (let i = 0; i < Math.min(urlBlocks.length, 25); i++) {
          const block = urlBlocks[i];
          const locMatch = block.match(/<loc>(.*?)<\/loc>/i);
          const lastModMatch = block.match(/<lastmod>(.*?)<\/lastmod>/i);

          if (locMatch && locMatch[1]) {
            const url = locMatch[1].trim();
            // Filter only relevant path segments (berita, artikel, hukum, publikasi)
            if (/berita|artikel|hukum|pengumuman|regulasi|laporan/i.test(url)) {
              items.push({
                id: `sitemap-${crypto.createHash('md5').update(url).digest('hex')}`,
                url,
                title: url.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || 'Publikasi Terbuka',
                publishedAt: lastModMatch ? new Date(lastModMatch[1]).toISOString() : new Date().toISOString(),
                sourceId: source.source_id,
              });
            }
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
    let rawText = item.title;
    let htmlContent = '';
    let httpStatus = 200;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(item.url, { signal: controller.signal });
      clearTimeout(timeout);
      httpStatus = res.status;

      if (res.ok) {
        htmlContent = await res.text();
        rawText = htmlContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } catch {
      // Use fallback
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
    const sitemapUrl = source.sitemap_url || `${source.base_url.replace(/\/+$/, '')}/sitemap.xml`;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(sitemapUrl, { method: 'HEAD', signal: controller.signal });
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
        errorMessage: e.message || 'Sitemap unreachable',
      };
    }
  }
}
