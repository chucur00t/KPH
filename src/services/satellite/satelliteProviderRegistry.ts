import { ISatelliteProvider } from './provider.interface';
import { SentinelProvider } from './sentinelProvider';
import { LandsatProvider } from './landsatProvider';
import { RegistryRepository } from '../registryRepository';
import { SatelliteScene, SatelliteSceneMetadata, SceneSearchParams } from '../../types/satellite';

export interface ProviderStatusInfo {
  source_id: string;
  provider_name: string;
  supported_satellites: string[];
  status: string;
  endpoint: string;
  documentation_url: string;
  last_successful_update: string | null;
  reliability: string;
}

export class SatelliteProviderRegistry {
  private static providers: Map<string, ISatelliteProvider> = new Map();
  private static initialized = false;

  public static init(): void {
    if (this.initialized) return;

    const sentinel = new SentinelProvider();
    const landsat = new LandsatProvider();

    this.providers.set(sentinel.sourceId, sentinel);
    this.providers.set(landsat.sourceId, landsat);

    this.initialized = true;
  }

  public static getProviders(): ISatelliteProvider[] {
    this.init();
    return Array.from(this.providers.values());
  }

  public static getProviderBySourceId(sourceId: string): ISatelliteProvider | null {
    this.init();
    return this.providers.get(sourceId) || null;
  }

  public static getProvidersStatus(): ProviderStatusInfo[] {
    this.init();
    const result: ProviderStatusInfo[] = [];

    for (const provider of this.providers.values()) {
      const record = RegistryRepository.getSourceById(provider.sourceId);
      const reg = record?.source;
      result.push({
        source_id: provider.sourceId,
        provider_name: provider.providerName,
        supported_satellites: provider.supportedSatellites,
        status: reg ? reg.status : 'NOT_AVAILABLE',
        endpoint: reg ? reg.endpoint : '',
        documentation_url: reg ? reg.documentation_url : '',
        last_successful_update: reg ? reg.last_successful_update : null,
        reliability: reg ? reg.reliability : 'UNKNOWN',
      });
    }

    return result;
  }

  /**
   * Search scenes across all active providers matching parameters
   */
  public static async searchScenes(params: SceneSearchParams): Promise<SatelliteScene[]> {
    this.init();
    const allScenes: SatelliteScene[] = [];

    for (const provider of this.providers.values()) {
      // If satellite is filtered, check if provider supports it
      if (params.satellite && params.satellite !== 'ALL') {
        if (!provider.supportedSatellites.includes(params.satellite)) {
          continue;
        }
      }

      try {
        const scenes = await provider.getAvailableScenes(params);
        allScenes.push(...scenes);
      } catch (err) {
        console.error(`Error querying satellite provider ${provider.sourceId}:`, err);
      }
    }

    // Sort newest first
    allScenes.sort((a, b) => new Date(b.acquisition_date).getTime() - new Date(a.acquisition_date).getTime());

    if (params.limit && params.limit > 0) {
      return allScenes.slice(0, params.limit);
    }
    return allScenes;
  }

  /**
   * Get metadata by searching through providers
   */
  public static async getSceneMetadata(sceneId: string): Promise<SatelliteSceneMetadata | null> {
    this.init();
    for (const provider of this.providers.values()) {
      const meta = await provider.getSceneMetadata(sceneId);
      if (meta) return meta;
    }
    return null;
  }
}
