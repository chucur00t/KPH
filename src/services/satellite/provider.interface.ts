import {
  SatelliteScene,
  SatelliteSceneMetadata,
  SceneSearchParams,
  RasterAssetInfo,
  SceneFootprint,
} from '../../types/satellite';

export interface ISatelliteProvider {
  /**
   * Unique provider identifier matching Data Source Registry (e.g. 'SRC-ESA-COPERNICUS-S2')
   */
  readonly sourceId: string;
  readonly providerName: string;
  readonly supportedSatellites: string[];

  /**
   * Search available scenes by spatiotemporal filters and cloud threshold
   */
  getAvailableScenes(params: SceneSearchParams): Promise<SatelliteScene[]>;

  /**
   * Retrieve rich metadata for a specific scene
   */
  getSceneMetadata(sceneId: string): Promise<SatelliteSceneMetadata | null>;

  /**
   * Get geographic boundary/footprint polygon of a scene
   */
  getCoverage(sceneId: string): Promise<SceneFootprint | null>;

  /**
   * Get raster asset information and URLs for specific bands
   */
  getRaster(sceneId: string, bands: string[]): Promise<RasterAssetInfo[] | null>;

  /**
   * Get visual thumbnail or true-color preview URL
   */
  getPreview(sceneId: string): Promise<string | null>;

  /**
   * Get direct download/access URL for raster data or COG asset
   */
  getDownloadUrl(sceneId: string, band?: string): Promise<string | null>;
}
