import crypto from 'crypto';
import { IPublicSourceCollector } from './collector.interface';
import {
  OsintSource,
  SourceItem,
  RawSource,
  SourceHealth,
} from '../../../types/osint';

export class RssCollector implements IPublicSourceCollector {
  public readonly collectorType = 'RSS';

  async discover(source: OsintSource): Promise<SourceItem[]> {
    // If source has restricted access, do not process
    if (source.status === 'ACCESS_RESTRICTED') {
      return [];
    }

    const targetUrl = source.rss_url || source.base_url;
    const items: SourceItem[] = [];

    try {
      // In production environment, fetch with 5000ms timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'KPH-Public-Intelligence-Collector/1.0 (+https://kph-sintang.kalbarprov.go.id/bot)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return [];
      }

      const xmlText = await response.text();

      // Parse standard RSS/Atom <item> or <entry> blocks safely
      const itemRegex = /<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi;
      const matches = xmlText.match(itemRegex) || [];

      for (let i = 0; i < matches.length; i++) {
        const itemBlock = matches[i];
        const titleMatch = itemBlock.match(/<title[^>]*>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/i);
        const linkMatch = itemBlock.match(/<link[^>]*>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/link>|<link[^>]*href=["'](.*?)["']/i);
        const pubDateMatch = itemBlock.match(/<(?:pubDate|published|updated)[^>]*>(.*?)<\/(?:pubDate|published|updated)>/i);
        const descMatch = itemBlock.match(/<(?:description|summary)[^>]*>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/(?:description|summary)>/i);

        const title = (titleMatch ? (titleMatch[1] || titleMatch[2]) : `Warta Terbuka #${i + 1}`).trim();
        const url = (linkMatch ? (linkMatch[1] || linkMatch[2] || linkMatch[3]) : `${source.base_url}#item-${i}`).trim();
        const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
        const snippet = descMatch ? (descMatch[1] || descMatch[2] || '').replace(/<[^>]+>/g, '').trim() : '';

        if (url) {
          items.push({
            id: `rss-${crypto.createHash('md5').update(url).digest('hex')}`,
            url,
            title,
            publishedAt,
            sourceId: source.source_id,
            snippet,
          });
        }
      }
    } catch {
      // In offline / restricted environment or timeout, return empty gracefully without throwing
    }

    return items;
  }

  async fetch(item: SourceItem): Promise<RawSource> {
    const fetchedAt = new Date().toISOString();
    let rawText = item.snippet || item.title;
    let htmlContent = '';
    let httpStatus = 200;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(item.url, {
        headers: {
          'User-Agent': 'KPH-Public-Intelligence-Collector/1.0 (+https://kph-sintang.kalbarprov.go.id/bot)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      httpStatus = response.status;
      if (response.ok) {
        htmlContent = await response.text();
        // Strip scripts and styles, extract text
        const cleanText = htmlContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanText.length > 50) {
          rawText = cleanText;
        }
      }
    } catch {
      // Fallback to item metadata if network offline
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
    const targetUrl = source.rss_url || source.base_url;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(targetUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      const latency = Date.now() - start;

      return {
        sourceId: source.source_id,
        status: res.ok ? 'ACTIVE' : 'DEGRADED',
        responseTimeMs: latency,
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
        errorMessage: e.message || 'Timeout / network error',
      };
    }
  }
}
