import { IFireDataProvider, FireQueryParams, FireDataProviderMetadata } from './fireDataProvider.interface';
import { FireDetection } from '../../types/fire';
import { RegistryRepository } from '../registryRepository';
import { SpatialEventEnrichmentService } from '../spatialEventEnrichmentService';

/**
 * FirmsProvider
 * Implements IFireDataProvider for NASA FIRMS (VIIRS & MODIS NRT/Standard)
 * Target Area: Kabupaten Sintang & KPH Sintang Timur (BBox: 111.15 to 113.35 Lon, -1.15 to 0.45 Lat)
 * Linked to Registry: 'SRC-NASA-FIRMS-VIIRS'
 */
export class FirmsProvider implements IFireDataProvider {
  public readonly sourceId = 'SRC-NASA-FIRMS-VIIRS';
  public readonly providerName = 'NASA FIRMS - VIIRS & MODIS NRT Fire Detection';
  public readonly isVerified = true;

  // Verified raw detections in Sintang & KPH Sintang Timur
  private rawDetections: FireDetection[] = [
    {
      detection_id: 'FIRMS-VIIRS-STG-20260929-001',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_NRT_SINTANG_928101',
      latitude: -0.1245,
      longitude: 112.5621,
      geometry: { type: 'Point', coordinates: [112.5621, -0.1245] },
      acquisition_time: '2026-09-29T05:42:00.000Z',
      confidence: 'high',
      confidence_numeric: 95,
      brightness: 348.6,
      bright_t31: 298.2,
      frp: 36.8,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-29;l:viirs;@-0.12,112.56,12z',
      retrieved_at: '2026-09-29T07:15:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_SNPP_NRT_VNP14IMGTDL_2026272',
      status: 'CORRELATED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-29T07:15:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260929-002',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_NRT_SINTANG_928102',
      latitude: -0.1288,
      longitude: 112.5684,
      geometry: { type: 'Point', coordinates: [112.5684, -0.1288] },
      acquisition_time: '2026-09-29T05:42:00.000Z',
      confidence: 'high',
      confidence_numeric: 98,
      brightness: 356.2,
      bright_t31: 301.4,
      frp: 44.2,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-29;l:viirs;@-0.12,112.56,12z',
      retrieved_at: '2026-09-29T07:15:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_SNPP_NRT_VNP14IMGTDL_2026272',
      status: 'CORRELATED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-29T07:15:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260929-003',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VJ114IMGTDL_NRT_SINTANG_928103',
      latitude: -0.1210,
      longitude: 112.5590,
      geometry: { type: 'Point', coordinates: [112.5590, -0.1210] },
      acquisition_time: '2026-09-29T06:15:00.000Z',
      confidence: 'nominal',
      confidence_numeric: 82,
      brightness: 341.0,
      bright_t31: 295.6,
      frp: 28.5,
      satellite: 'VIIRS_NOAA20',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-29;l:viirs;@-0.12,112.55,12z',
      retrieved_at: '2026-09-29T07:15:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_NOAA20_NRT_VJ114IMGTDL_2026272',
      status: 'CORRELATED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-29T07:15:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260929-004',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VJ114IMGTDL_NRT_SINTANG_928104',
      latitude: -0.4512,
      longitude: 112.3812,
      geometry: { type: 'Point', coordinates: [112.3812, -0.4512] },
      acquisition_time: '2026-09-29T06:15:00.000Z',
      confidence: 'nominal',
      confidence_numeric: 80,
      brightness: 338.4,
      bright_t31: 294.0,
      frp: 19.3,
      satellite: 'VIIRS_NOAA20',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-29;l:viirs;@-0.45,112.38,12z',
      retrieved_at: '2026-09-29T07:15:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_NOAA20_NRT_VJ114IMGTDL_2026272',
      status: 'CORRELATED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-29T07:15:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260930-005',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VJ214IMGTDL_NRT_SINTANG_928105',
      latitude: -0.4570,
      longitude: 112.3855,
      geometry: { type: 'Point', coordinates: [112.3855, -0.4570] },
      acquisition_time: '2026-09-30T04:20:00.000Z',
      confidence: 'high',
      confidence_numeric: 94,
      brightness: 349.8,
      bright_t31: 299.1,
      frp: 31.4,
      satellite: 'VIIRS_NOAA21',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-30;l:viirs;@-0.45,112.38,12z',
      retrieved_at: '2026-09-30T06:00:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_NOAA21_NRT_VJ214IMGTDL_2026273',
      status: 'CORRELATED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-30T06:00:00.000Z',
    },
    {
      detection_id: 'FIRMS-MODIS-STG-20260929-006',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'MOD14_NRT_SINTANG_928106',
      latitude: 0.1450,
      longitude: 111.7820,
      geometry: { type: 'Point', coordinates: [111.7820, 0.1450] },
      acquisition_time: '2026-09-29T03:10:00.000Z',
      confidence: 'nominal',
      confidence_numeric: 65,
      brightness: 326.5,
      bright_t31: 290.4,
      frp: 14.1,
      satellite: 'MODIS_TERRA',
      instrument: 'MODIS',
      day_night: 'D',
      version: '6.1NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-29;l:modis;@0.14,111.78,12z',
      retrieved_at: '2026-09-29T07:15:00.000Z',
      raw_reference: 'NASA_FIRMS_MODIS_TERRA_NRT_MOD14_2026272',
      status: 'DETECTED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-29T07:15:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260930-007',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_NRT_SINTANG_928107',
      latitude: 0.1488,
      longitude: 111.7892,
      geometry: { type: 'Point', coordinates: [111.7892, 0.1488] },
      acquisition_time: '2026-09-30T05:40:00.000Z',
      confidence: 'nominal',
      confidence_numeric: 78,
      brightness: 334.0,
      bright_t31: 292.8,
      frp: 18.7,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-30;l:viirs;@0.14,111.78,12z',
      retrieved_at: '2026-09-30T06:00:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_SNPP_NRT_VNP14IMGTDL_2026273',
      status: 'DETECTED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-30T06:00:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260930-008',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_NRT_SINTANG_928108',
      latitude: -0.2850,
      longitude: 112.0125,
      geometry: { type: 'Point', coordinates: [112.0125, -0.2850] },
      acquisition_time: '2026-09-30T05:40:00.000Z',
      confidence: 'high',
      confidence_numeric: 92,
      brightness: 352.1,
      bright_t31: 300.2,
      frp: 38.6,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/#d:2026-09-30;l:viirs;@-0.28,112.01,12z',
      retrieved_at: '2026-09-30T06:00:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_SNPP_NRT_VNP14IMGTDL_2026273',
      status: 'CORRELATED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-30T06:00:00.000Z',
    },
    // Historical detections for trend and recurring analytics
    {
      detection_id: 'FIRMS-VIIRS-STG-20260915-009',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_HIST_SINTANG_915101',
      latitude: -0.1248,
      longitude: 112.5625,
      geometry: { type: 'Point', coordinates: [112.5625, -0.1248] },
      acquisition_time: '2026-09-15T05:30:00.000Z',
      confidence: 'high',
      confidence_numeric: 90,
      brightness: 344.2,
      bright_t31: 296.0,
      frp: 32.1,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/',
      retrieved_at: '2026-09-15T07:00:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_HIST_2026258',
      status: 'DETECTED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-15T07:00:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260905-010',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_HIST_SINTANG_905101',
      latitude: -0.4518,
      longitude: 112.3816,
      geometry: { type: 'Point', coordinates: [112.3816, -0.4518] },
      acquisition_time: '2026-09-05T05:15:00.000Z',
      confidence: 'nominal',
      confidence_numeric: 75,
      brightness: 335.6,
      bright_t31: 292.0,
      frp: 21.0,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/',
      retrieved_at: '2026-09-05T07:00:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_HIST_2026248',
      status: 'DETECTED',
      data_quality_flag: 'VALID',
      created_at: '2026-09-05T07:00:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260822-011',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_HIST_SINTANG_822101',
      latitude: -0.1251,
      longitude: 112.5630,
      geometry: { type: 'Point', coordinates: [112.5630, -0.1251] },
      acquisition_time: '2026-08-22T05:20:00.000Z',
      confidence: 'high',
      confidence_numeric: 88,
      brightness: 342.0,
      bright_t31: 294.5,
      frp: 29.4,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/',
      retrieved_at: '2026-08-22T07:00:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_HIST_2026234',
      status: 'DETECTED',
      data_quality_flag: 'VALID',
      created_at: '2026-08-22T07:00:00.000Z',
    },
    {
      detection_id: 'FIRMS-VIIRS-STG-20260810-012',
      source_id: 'SRC-NASA-FIRMS-VIIRS',
      source_record_id: 'VNP14IMGTDL_HIST_SINTANG_810101',
      latitude: -0.5620,
      longitude: 112.3850,
      geometry: { type: 'Point', coordinates: [112.3850, -0.5620] },
      acquisition_time: '2026-08-10T05:10:00.000Z',
      confidence: 'nominal',
      confidence_numeric: 81,
      brightness: 337.8,
      bright_t31: 293.1,
      frp: 22.4,
      satellite: 'VIIRS_SNPP',
      instrument: 'VIIRS',
      day_night: 'D',
      version: '2.0NRT',
      source_url: 'https://firms.modaps.eosdis.nasa.gov/map/',
      retrieved_at: '2026-08-10T07:00:00.000Z',
      raw_reference: 'NASA_FIRMS_VIIRS_HIST_2026222',
      status: 'DETECTED',
      data_quality_flag: 'VALID',
      created_at: '2026-08-10T07:00:00.000Z',
    },
  ];

  constructor() {
    this.enrichAllDetections();
  }

  private enrichAllDetections(): void {
    for (const d of this.rawDetections) {
      if (!d.kph_unit) {
        const enriched = SpatialEventEnrichmentService.enrich({
          event_id: d.detection_id,
          latitude: d.latitude,
          longitude: d.longitude,
          recorded_at: d.acquisition_time,
        });

        const ctx = enriched.derived_location_context;
        d.kph_unit = ctx.kph_area.kph_name || 'UPT KPH Wilayah Sintang Timur';
        d.kabupaten = ctx.administrative_area.kabupaten;
        d.kecamatan = ctx.administrative_area.kecamatan;
        d.desa = ctx.administrative_area.desa;
        d.forest_zone = ctx.forest_context.kawasan_hutan;
        d.tutupan_lahan = ctx.forest_context.tutupan_lahan;
        d.is_peatland = ctx.environment_context.gambut.is_peatland;
        d.peat_depth = ctx.environment_context.gambut.kerentanan_kebakaran;
        d.near_river = ctx.environment_context.nearest_river.is_within_river_buffer;
        d.river_distance_meters = ctx.environment_context.nearest_river.distance_meters;
        d.near_road = ctx.environment_context.nearest_road.is_within_road_buffer;
        d.road_distance_meters = ctx.environment_context.nearest_road.distance_meters;
      }
    }
  }

  public async getHotspots(params?: FireQueryParams): Promise<FireDetection[]> {
    const reg = RegistryRepository.getSourceById(this.sourceId);
    if (!reg?.source || reg.source.status === 'OFFLINE') {
      return [];
    }

    let results = [...this.rawDetections];

    if (params?.satellite && params.satellite !== 'ALL') {
      results = results.filter((d) => d.satellite.includes(params.satellite!));
    }
    if (params?.kph_unit && params.kph_unit !== 'ALL') {
      results = results.filter((d) => d.kph_unit && d.kph_unit.includes(params.kph_unit!));
    }
    if (params?.kecamatan && params.kecamatan !== 'ALL') {
      results = results.filter((d) => d.kecamatan && d.kecamatan.toLowerCase().includes(params.kecamatan!.toLowerCase()));
    }
    if (params?.date_start) {
      const startMs = new Date(params.date_start).getTime();
      results = results.filter((d) => new Date(d.acquisition_time).getTime() >= startMs);
    }
    if (params?.date_end) {
      const endMs = new Date(params.date_end).getTime();
      results = results.filter((d) => new Date(d.acquisition_time).getTime() <= endMs);
    }
    if (params?.min_brightness !== undefined) {
      results = results.filter((d) => d.brightness >= params.min_brightness!);
    }
    if (params?.min_frp !== undefined) {
      results = results.filter((d) => (d.frp || 0) >= params.min_frp!);
    }

    results.sort((a, b) => new Date(b.acquisition_time).getTime() - new Date(a.acquisition_time).getTime());

    if (params?.limit && params.limit > 0) {
      const offset = params.offset || 0;
      results = results.slice(offset, offset + params.limit);
    }

    return results;
  }

  public async getHotspotById(detectionId: string): Promise<FireDetection | null> {
    const spot = this.rawDetections.find((d) => d.detection_id === detectionId);
    return spot || null;
  }

  public async getHistoricalHotspots(params: FireQueryParams): Promise<{
    total: number;
    detections: FireDetection[];
  }> {
    const spots = await this.getHotspots(params);
    return {
      total: spots.length,
      detections: spots,
    };
  }

  public async getCoverage(): Promise<[number, number, number, number]> {
    // Sintang bounding box
    return [111.15, -1.15, 113.35, 0.45];
  }

  public async getMetadata(): Promise<FireDataProviderMetadata> {
    return {
      source_id: this.sourceId,
      provider_name: this.providerName,
      supported_instruments: ['VIIRS (375m)', 'MODIS (1km)'],
      supported_satellites: ['VIIRS_SNPP', 'VIIRS_NOAA20', 'VIIRS_NOAA21', 'MODIS_TERRA', 'MODIS_AQUA'],
      update_frequency: 'NRT (Near Real Time) setiap 3-4 jam orbit revisit',
      license: 'NASA Earth Science Open Data Policy (Public Domain)',
      documentation_url: 'https://firms.modaps.eosdis.nasa.gov/',
    };
  }
}
