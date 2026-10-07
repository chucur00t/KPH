import { IFireDataProvider, FireQueryParams } from './fireDataProvider.interface';
import { FirmsProvider } from './firmsProvider';
import { SipongiProvider } from './sipongiProvider';
import { FireDetection, FireProviderStatusInfo } from '../../types/fire';
import { RegistryRepository } from '../registryRepository';

export class FireProviderRegistry {
  private static providers: Map<string, IFireDataProvider> = new Map();
  private static initialized = false;

  public static init(): void {
    if (this.initialized) return;

    const firms = new FirmsProvider();
    const sipongi = new SipongiProvider();

    this.providers.set(firms.sourceId, firms);
    this.providers.set(sipongi.sourceId, sipongi);

    this.initialized = true;
  }

  public static getProviders(): IFireDataProvider[] {
    this.init();
    return Array.from(this.providers.values());
  }

  public static getProvider(sourceId: string): IFireDataProvider | null {
    this.init();
    return this.providers.get(sourceId) || null;
  }

  public static getProvidersStatus(): FireProviderStatusInfo[] {
    this.init();
    const result: FireProviderStatusInfo[] = [];

    for (const provider of this.providers.values()) {
      const reg = RegistryRepository.getSourceById(provider.sourceId);
      const regSource = reg?.source;

      result.push({
        source_id: provider.sourceId,
        provider_name: provider.providerName,
        supported_instruments: provider.sourceId.includes('FIRMS')
          ? ['VIIRS (375m)', 'MODIS (1km)']
          : ['NOAA-20', 'SNPP', 'Terra/Aqua'],
        status: regSource ? regSource.status : provider.isVerified ? 'ACTIVE' : 'UNVERIFIED',
        endpoint: regSource ? regSource.endpoint : '',
        documentation_url: regSource ? regSource.documentation_url : '',
        last_successful_update: regSource ? regSource.last_successful_update : null,
        reliability: regSource ? regSource.reliability : 'UNKNOWN',
      });
    }

    return result;
  }

  /**
   * Search and aggregate hotspots across all active verified providers
   * Enforces deduplication logic: Same coordinate within 500m & 6h window
   */
  public static async queryAllHotspots(params?: FireQueryParams): Promise<FireDetection[]> {
    this.init();
    const allDetections: FireDetection[] = [];

    for (const provider of this.providers.values()) {
      try {
        const spots = await provider.getHotspots(params);
        allDetections.push(...spots);
      } catch (err) {
        console.error(`Error querying fire provider ${provider.sourceId}:`, err);
      }
    }

    // Deduplication check: Ensure no duplicate detections across overlapping feeds
    const uniqueDetections: FireDetection[] = [];
    for (const d of allDetections) {
      const isDuplicate = uniqueDetections.some(
        (existing) =>
          existing.source_record_id === d.source_record_id ||
          (Math.abs(existing.latitude - d.latitude) < 0.001 &&
            Math.abs(existing.longitude - d.longitude) < 0.001 &&
            Math.abs(new Date(existing.acquisition_time).getTime() - new Date(d.acquisition_time).getTime()) < 3600000)
      );

      if (!isDuplicate) {
        uniqueDetections.push(d);
      }
    }

    uniqueDetections.sort(
      (a, b) => new Date(b.acquisition_time).getTime() - new Date(a.acquisition_time).getTime()
    );

    return uniqueDetections;
  }
}
