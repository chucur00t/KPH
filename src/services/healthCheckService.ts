import { PublicSourceRecord, SourceHealthLog, SourceStatus } from '../types/registry';

export interface HealthCheckOptions {
  timeoutMs?: number;
  maxRedirects?: number;
}

export class HealthCheckService {
  /**
   * Perform an automated probe to verify network reachability, latency, and HTTP response
   * of a public data source endpoint.
   */
  public static async checkSource(
    source: PublicSourceRecord,
    options: HealthCheckOptions = {}
  ): Promise<{
    updatedSource: PublicSourceRecord;
    log: SourceHealthLog;
  }> {
    const timeoutMs = options.timeoutMs || 5000;
    const startTime = Date.now();
    let httpStatusCode: number | undefined = undefined;
    let newStatus: SourceStatus = source.status;
    let errorMessage: string | undefined = undefined;
    let latencyMs = 0;
    let verified = false;

    // Preserve REQUIRES REVIEW status unless explicitly overridden
    if (source.status === 'REQUIRES REVIEW') {
      const log: SourceHealthLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        source_id: source.source_id,
        checked_at: new Date().toISOString(),
        status: 'REQUIRES REVIEW',
        error_message: 'Pemeriksaan otomatis dilewati: status sumber membutuhkan telaah kepatuhan hukum/teknis.',
        verified: false,
      };
      return { updatedSource: source, log };
    }

    try {
      // Craft test URL (handle WMS GetCapabilities query string if applicable)
      let testUrl = source.endpoint;
      if (source.access_method === 'WMS' && !testUrl.toLowerCase().includes('request=')) {
        const separator = testUrl.includes('?') ? '&' : '?';
        testUrl = `${testUrl}${separator}service=WMS&request=GetCapabilities`;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      // Attempt probe with HEAD or GET
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'KPH-Intelligence-Registry/1.0 (Public Forest Data Health Monitor)',
          Accept: '*/*',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);
      latencyMs = Date.now() - startTime;
      httpStatusCode = response.status;

      if (response.ok || (httpStatusCode >= 200 && httpStatusCode < 400)) {
        newStatus = 'ACTIVE';
        verified = true;
      } else if (httpStatusCode === 401 || httpStatusCode === 403 || httpStatusCode === 429) {
        newStatus = 'DEGRADED';
        errorMessage = `HTTP ${httpStatusCode} - Akses dibatasi atau memerlukan parameter registrasi terbuka.`;
      } else {
        newStatus = 'OFFLINE';
        errorMessage = `HTTP ${httpStatusCode} - Server merespons dengan kode galat.`;
      }
    } catch (err: any) {
      latencyMs = Date.now() - startTime;
      if (err.name === 'AbortError') {
        newStatus = 'DEGRADED';
        errorMessage = `Request timeout melebihi batas toleransi ${timeoutMs}ms.`;
      } else {
        newStatus = 'OFFLINE';
        errorMessage = err.message || 'Koneksi jaringan gagal menjangkau host endpoint.';
      }
    }

    const nowIso = new Date().toISOString();
    const updatedSource: PublicSourceRecord = {
      ...source,
      status: newStatus,
      last_successful_update: verified ? nowIso : source.last_successful_update,
      updated_at: nowIso,
    };

    const log: SourceHealthLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      source_id: source.source_id,
      checked_at: nowIso,
      status: newStatus,
      http_status_code: httpStatusCode,
      latency_ms: latencyMs,
      error_message: errorMessage,
      verified,
    };

    return { updatedSource, log };
  }
}
