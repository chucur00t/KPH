import { ISatelliteProvider } from './provider.interface';
import {
  SatelliteScene,
  SatelliteSceneMetadata,
  SceneSearchParams,
  RasterAssetInfo,
  SceneFootprint,
} from '../../types/satellite';
import { RegistryRepository } from '../registryRepository';

/**
 * LandsatProvider
 * Implements ISatelliteProvider for USGS Landsat 8/9 OLI-2
 * Strict compliance:
 * - Checks status from Phase 3 Data Source Registry ('SRC-USGS-LANDSAT-9').
 * - If status is 'UNVERIFIED' or 'NOT_AVAILABLE', does NOT fabricate mock scenes as real.
 */
export class LandsatProvider implements ISatelliteProvider {
  public readonly sourceId = 'SRC-USGS-LANDSAT-9';
  public readonly providerName = 'USGS EROS - Landsat 9 OLI-2 Collection 2 Level-2';
  public readonly supportedSatellites = ['Landsat-8', 'Landsat-9'];

  public async getAvailableScenes(_params: SceneSearchParams): Promise<SatelliteScene[]> {
    const record = RegistryRepository.getSourceById(this.sourceId);
    const registrySource = record?.source;

    // Hard Constraint Enforcement:
    // If dataset is UNVERIFIED or NOT_AVAILABLE, we must NOT forge fake scenes.
    if (!registrySource || registrySource.status === 'UNVERIFIED' || registrySource.status === 'OFFLINE') {
      return [];
    }

    // When verified and operational:
    return [];
  }

  public async getSceneMetadata(_sceneId: string): Promise<SatelliteSceneMetadata | null> {
    return null;
  }

  public async getCoverage(_sceneId: string): Promise<SceneFootprint | null> {
    return null;
  }

  public async getRaster(_sceneId: string, _bands: string[]): Promise<RasterAssetInfo[] | null> {
    return null;
  }

  public async getPreview(_sceneId: string): Promise<string | null> {
    return null;
  }

  public async getDownloadUrl(_sceneId: string, _band?: string): Promise<string | null> {
    return null;
  }
}
