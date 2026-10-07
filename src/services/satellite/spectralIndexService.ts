import {
  SpectralIndexType,
  SpectralIndexConfig,
  SpectralBandMapping,
  SatelliteName,
} from '../../types/satellite';

export class SpectralIndexService {
  private static configs: Record<SpectralIndexType, SpectralIndexConfig> = {
    NDVI: {
      index_id: 'NDVI',
      index_name: 'Normalized Difference Vegetation Index',
      formula_expression: '(NIR - RED) / (NIR + RED)',
      description: 'Indeks kehijauan dan biomassa kanopi vegetasi tajuk lebat di Kalimantan Barat.',
      loss_threshold: -0.30,
      band_mappings: {
        'Sentinel-2': { nir: 'B08', red: 'B04' },
        'Sentinel-2A': { nir: 'B08', red: 'B04' },
        'Sentinel-2B': { nir: 'B08', red: 'B04' },
        'Landsat-8': { nir: 'B5', red: 'B4' },
        'Landsat-9': { nir: 'B5', red: 'B4' },
      },
    },
    NDWI: {
      index_id: 'NDWI',
      index_name: 'Normalized Difference Water Index',
      formula_expression: '(GREEN - NIR) / (GREEN + NIR)',
      description: 'Indeks kelembaban daun, genangan rawa gambut, dan badan air permukaan sungai.',
      loss_threshold: -0.25,
      band_mappings: {
        'Sentinel-2': { green: 'B03', nir: 'B08' },
        'Sentinel-2A': { green: 'B03', nir: 'B08' },
        'Sentinel-2B': { green: 'B03', nir: 'B08' },
        'Landsat-8': { green: 'B3', nir: 'B5' },
        'Landsat-9': { green: 'B3', nir: 'B5' },
      },
    },
    NBR: {
      index_id: 'NBR',
      index_name: 'Normalized Burn Ratio',
      formula_expression: '(NIR - SWIR) / (NIR + SWIR)',
      description: 'Indeks pendeteksi bekas kebakaran hutan, lahan terbakar, dan bukaan tanah terbuka.',
      loss_threshold: -0.20,
      band_mappings: {
        'Sentinel-2': { nir: 'B08', swir: 'B12' },
        'Sentinel-2A': { nir: 'B08', swir: 'B12' },
        'Sentinel-2B': { nir: 'B08', swir: 'B12' },
        'Landsat-8': { nir: 'B5', swir: 'B7' },
        'Landsat-9': { nir: 'B5', swir: 'B7' },
      },
    },
  };

  public static getIndices(): SpectralIndexConfig[] {
    return Object.values(this.configs);
  }

  public static getIndexConfig(type: SpectralIndexType): SpectralIndexConfig {
    return this.configs[type] || this.configs.NDVI;
  }

  public static getBandMapping(
    satellite: SatelliteName | string,
    indexType: SpectralIndexType
  ): SpectralBandMapping | null {
    const config = this.configs[indexType];
    if (!config) return null;

    if (config.band_mappings[satellite]) {
      return config.band_mappings[satellite];
    }
    if (satellite.startsWith('Sentinel-2') && config.band_mappings['Sentinel-2']) {
      return config.band_mappings['Sentinel-2'];
    }
    if (satellite.startsWith('Landsat') && config.band_mappings['Landsat-8']) {
      return config.band_mappings['Landsat-8'];
    }
    return null;
  }

  /**
   * Compute normalized index value from two band reflectances: (A - B) / (A + B)
   */
  public static computeNormalizedDifference(a: number, b: number): number {
    const denominator = a + b;
    if (denominator === 0 || isNaN(denominator)) return 0;
    const value = (a - b) / denominator;
    return Math.max(-1.0, Math.min(1.0, Number(value.toFixed(4))));
  }

  /**
   * Compute delta index: Delta = Index_T1 - Index_T0
   */
  public static computeDelta(t0Value: number, t1Value: number): number {
    return Number((t1Value - t0Value).toFixed(4));
  }

  /**
   * Classify change category from delta index
   */
  public static classifyChange(
    delta: number,
    indexType: SpectralIndexType = 'NDVI'
  ): 'SEVERE_LOSS' | 'MODERATE_LOSS' | 'STABLE' | 'REGROWTH' {
    if (indexType === 'NDVI') {
      if (delta <= -0.30) return 'SEVERE_LOSS';
      if (delta <= -0.15) return 'MODERATE_LOSS';
      if (delta >= 0.10) return 'REGROWTH';
      return 'STABLE';
    }
    if (indexType === 'NBR') {
      if (delta <= -0.25) return 'SEVERE_LOSS';
      if (delta <= -0.10) return 'MODERATE_LOSS';
      if (delta >= 0.10) return 'REGROWTH';
      return 'STABLE';
    }
    // NDWI
    if (delta <= -0.25) return 'SEVERE_LOSS';
    if (delta <= -0.12) return 'MODERATE_LOSS';
    if (delta >= 0.10) return 'REGROWTH';
    return 'STABLE';
  }
}
