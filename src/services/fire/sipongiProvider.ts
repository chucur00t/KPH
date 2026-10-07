import { IFireDataProvider, FireQueryParams, FireDataProviderMetadata } from './fireDataProvider.interface';
import { FireDetection } from '../../types/fire';
import { RegistryRepository } from '../registryRepository';

/**
 * SipongiProvider
 * Implements IFireDataProvider adapter for KLHK SIPONGI (Sistem Informasi Karhutla)
 * Compliance & Hard Constraint:
 * - Marked as unverified until official open machine-to-machine public API is legally verified.
 * - Does NOT forge fake endpoints or fake hotspots.
 */
export class SipongiProvider implements IFireDataProvider {
  public readonly sourceId = 'SRC-KLHK-SIPONGI';
  public readonly providerName = 'KLHK SIPONGI - Sistem Informasi Deteksi Dini Karhutla';
  public readonly isVerified = false;

  public async getHotspots(_params?: FireQueryParams): Promise<FireDetection[]> {
    const reg = RegistryRepository.getSourceById(this.sourceId);

    // Hard Constraint: If not verified or offline, do NOT forge fake hotspots
    if (!reg?.source || reg.source.status === 'UNVERIFIED' || reg.source.status === 'OFFLINE' || reg.source.status === 'REQUIRES REVIEW') {
      return [];
    }

    return [];
  }

  public async getHotspotById(_detectionId: string): Promise<FireDetection | null> {
    return null;
  }

  public async getHistoricalHotspots(_params: FireQueryParams): Promise<{
    total: number;
    detections: FireDetection[];
  }> {
    return { total: 0, detections: [] };
  }

  public async getCoverage(): Promise<[number, number, number, number]> {
    return [111.15, -1.15, 113.35, 0.45];
  }

  public async getMetadata(): Promise<FireDataProviderMetadata> {
    return {
      source_id: this.sourceId,
      provider_name: this.providerName,
      supported_instruments: ['NOAA-20', 'SNPP', 'Terra/Aqua', 'Himawari-9'],
      supported_satellites: ['VIIRS', 'MODIS'],
      update_frequency: 'Harian (Publikasi Portal Web)',
      license: 'Data Terbuka Kehutanan Republik Indonesia (Permen LHK No. P.28/2018)',
      documentation_url: 'https://sipongi.menlhk.go.id/',
    };
  }
}
