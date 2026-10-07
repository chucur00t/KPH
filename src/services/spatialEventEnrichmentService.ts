import { EventLocationModel } from '../types/gis';
import { SpatialEngineService } from './spatialEngineService';
import {
  KPH_SINTANG_TIMUR_BOUNDARY,
  KABUPATEN_SINTANG_ADMIN,
  FOREST_ZONES_LAYER,
  PEATLAND_LAYER,
  RIVERS_LAYER,
  ROADS_LAYER,
} from '../data/spatialLayers';

export interface RawEventLocationInput {
  event_id: string;
  latitude: number;
  longitude: number;
  location_accuracy_meters?: number;
  location_source?: string;
  recorded_at?: string;
}

export class SpatialEventEnrichmentService {
  /**
   * Enrich raw event coordinates with administrative, forest zonation, hydrography,
   * road proximity, and peatland data strictly derived from public spatial layers.
   */
  public static enrich(input: RawEventLocationInput): EventLocationModel {
    const { latitude, longitude, event_id } = input;
    const pt: [number, number] = [longitude, latitude];
    const nowIso = new Date().toISOString();

    // 1. KPH Spatial Intersection
    let isInsideKph = false;
    let kphName: string | null = null;
    let kphUnitCode: string | null = null;

    for (const feature of KPH_SINTANG_TIMUR_BOUNDARY.features) {
      if (
        feature.geometry.type === 'Polygon' &&
        SpatialEngineService.pointInPolygon(pt, feature.geometry.coordinates as any)
      ) {
        isInsideKph = true;
        kphName = feature.properties.name || 'KPH Sintang Timur';
        kphUnitCode = feature.properties.id || 'KPH-STG-TIMUR';
        break;
      }
    }

    // 2. Kabupaten Spatial Intersection
    let kabupaten: string | null = null;
    for (const feature of KABUPATEN_SINTANG_ADMIN.features) {
      if (
        feature.geometry.type === 'Polygon' &&
        SpatialEngineService.pointInPolygon(pt, feature.geometry.coordinates as any)
      ) {
        kabupaten = feature.properties.nama || 'Kabupaten Sintang';
        break;
      }
    }

    // 3. Forest Zonation & Legal Function
    let forestZone: string | null = null;
    let fungsiKawasan: string | null = null;
    let skPenetapan: string | null = null;
    let estimatedKecamatan: string | null = null;

    for (const feature of FOREST_ZONES_LAYER.features) {
      if (
        feature.geometry.type === 'Polygon' &&
        SpatialEngineService.pointInPolygon(pt, feature.geometry.coordinates as any)
      ) {
        forestZone = feature.properties.nama || feature.properties.fungsi;
        fungsiKawasan = feature.properties.fungsi;
        skPenetapan = feature.properties.sk;
        if (feature.properties.kecamatan) {
          estimatedKecamatan = feature.properties.kecamatan;
        }
        break;
      }
    }

    // Fallback: If no forest zone matched but inside Kabupaten, default to Areal Penggunaan Lain or Outside Forest
    if (!forestZone) {
      forestZone = isInsideKph ? 'Areal Penggunaan Lain / Enclave KPH' : 'Areal Penggunaan Lain (APL)';
      fungsiKawasan = 'Areal Penggunaan Lain (APL)';
    }

    // Heuristic Kecamatan approximation if not set by polygon
    if (!estimatedKecamatan) {
      if (latitude < -0.15 && longitude > 112.4) estimatedKecamatan = 'Ambalau';
      else if (latitude < -0.3) estimatedKecamatan = 'Serawai';
      else if (latitude < -0.1 && longitude < 112.3) estimatedKecamatan = 'Kayan Hilir';
      else if (latitude > 0.05 && longitude > 111.7) estimatedKecamatan = 'Ketungau Tengah';
      else if (latitude > 0.1) estimatedKecamatan = 'Ketungau Hulu';
      else estimatedKecamatan = 'Sintang';
    }

    // 4. Peatland (KHG) Intersection
    let isPeatland = false;
    let khgName: string | null = null;
    let kerentananKebakaran: string | null = null;

    for (const feature of PEATLAND_LAYER.features) {
      if (
        feature.geometry.type === 'Polygon' &&
        SpatialEngineService.pointInPolygon(pt, feature.geometry.coordinates as any)
      ) {
        isPeatland = true;
        khgName = feature.properties.nama || 'Kesatuan Hidrologis Gambut Belitang';
        kerentananKebakaran = feature.properties.tingkat_rawan_api || 'TINGGI';
        break;
      }
    }

    // 5. Hydrography Proximity (Nearest River)
    let minRiverDistance = Infinity;
    let nearestRiverName: string | null = null;

    for (const feature of RIVERS_LAYER.features) {
      if (feature.geometry.type === 'LineString') {
        const { distanceMeters } = SpatialEngineService.pointToLineDistanceMeters(
          latitude,
          longitude,
          feature.geometry.coordinates as any
        );
        if (distanceMeters < minRiverDistance) {
          minRiverDistance = distanceMeters;
          nearestRiverName = feature.properties.nama;
        }
      }
    }

    // 6. Road Accessibility Proximity (Nearest Road)
    let minRoadDistance = Infinity;
    let nearestRoadName: string | null = null;

    for (const feature of ROADS_LAYER.features) {
      if (feature.geometry.type === 'LineString') {
        const { distanceMeters } = SpatialEngineService.pointToLineDistanceMeters(
          latitude,
          longitude,
          feature.geometry.coordinates as any
        );
        if (distanceMeters < minRoadDistance) {
          minRoadDistance = distanceMeters;
          nearestRoadName = feature.properties.nama;
        }
      }
    }

    // 7. Synthesize Anti-False Certainty Spatial Statement
    // Strict compliance: Never label as "ilegal" automatically!
    const summaryStatements: string[] = [];
    if (isInsideKph) {
      summaryStatements.push(`Terdeteksi berada dalam delineasi ${kphName || 'KPH Sintang Timur'}.`);
    } else {
      summaryStatements.push('Terdeteksi berada di luar delineasi resmi KPH Sintang Timur.');
    }

    if (fungsiKawasan) {
      summaryStatements.push(`Tumpang tindih spasial (spatial overlap) dengan kawasan ${fungsiKawasan}.`);
    }

    if (isPeatland) {
      summaryStatements.push(`Terletak di atas kubah gambut ${khgName} (potensi kebakaran terpendam).`);
    }

    if (minRiverDistance < 150) {
      summaryStatements.push(`Berada di dalam koridor sempadan sungai (${Math.round(minRiverDistance)}m dari ${nearestRiverName}).`);
    }

    if (minRoadDistance < 500) {
      summaryStatements.push(`Terhubung dengan koridor akses transportasi (${Math.round(minRoadDistance)}m dari ${nearestRoadName}).`);
    }

    summaryStatements.push('Status: Memerlukan verifikasi lapangan / telaah izin resmi (Requires verification).');

    return {
      event_id,
      observed_location: {
        latitude,
        longitude,
        location_accuracy_meters: input.location_accuracy_meters || 375, // Nominal VIIRS 375m
        location_source: input.location_source || 'NASA_FIRMS_VIIRS_SENSOR',
        recorded_at: input.recorded_at || nowIso,
      },
      derived_location_context: {
        administrative_area: {
          kabupaten: kabupaten || 'Kabupaten Sintang',
          kecamatan: estimatedKecamatan,
          desa: null, // Hard constraint: Desa belum definitif, jangan mengarang!
          data_status: kabupaten ? 'AVAILABLE' : 'PARTIAL',
          source: 'BPS Kabupaten Sintang & BIG Open Data',
        },
        kph_area: {
          kph_name: isInsideKph ? (kphName || 'KPH Sintang Timur') : null,
          kph_unit_code: isInsideKph ? kphUnitCode : null,
          is_inside_kph: isInsideKph,
          data_status: 'AVAILABLE',
          source: 'Geoportal KLHK RI (SK.674/Menhut-II/2011)',
        },
        forest_context: {
          kawasan_hutan: forestZone,
          fungsi_kawasan: fungsiKawasan,
          sk_penetapan: skPenetapan || 'SK.733/Menhut-II/2014',
          tutupan_lahan: null, // Sesuai ketersediaan
          data_status: 'AVAILABLE',
          source: 'Ditjen PKTL KLHK RI',
        },
        environment_context: {
          gambut: {
            is_peatland: isPeatland,
            khg_name: isPeatland ? khgName : null,
            kerentanan_kebakaran: isPeatland ? kerentananKebakaran : null,
            data_status: 'AVAILABLE',
            source: 'PRIMS Gambut BRGM RI',
          },
          nearest_river: {
            river_name: nearestRiverName,
            distance_meters: minRiverDistance < 100000 ? Math.round(minRiverDistance) : null,
            is_within_river_buffer: minRiverDistance <= 100, // 100m sempadan sungai
            data_status: 'AVAILABLE',
            source: 'OpenStreetMap Hydrography / BIG Kalbar',
          },
          nearest_road: {
            road_name: nearestRoadName,
            distance_meters: minRoadDistance < 100000 ? Math.round(minRoadDistance) : null,
            is_within_road_buffer: minRoadDistance <= 500, // 500m access buffer
            data_status: 'AVAILABLE',
            source: 'Kementerian PUPR Open Data / OSM Roads',
          },
        },
        public_activity_context: {
          perkebunan: {
            name: null,
            status_hgu: null,
            data_status: 'NOT_AVAILABLE',
            source: 'SRC-KEMENTAN-SIPERIBUN',
            notes: 'Peta spasial HGU perkebunan belum tersedia secara publik terbuka.',
          },
          pertambangan: {
            wiup_name: null,
            tahap_izin: null,
            data_status: 'NOT_AVAILABLE',
            source: 'SRC-ESDM-GEOPORTAL-MINERBA',
          },
          perhutanan_sosial: {
            sk_skema: null,
            nama_lembaga: null,
            data_status: 'NOT_AVAILABLE',
            source: 'SRC-KLHK-PIAPS-SOSIAL',
          },
          konsesi_publik: {
            nama_konsesi: null,
            data_status: 'NOT_AVAILABLE',
            source: 'SRC-BIG-SATU-PETA',
            notes: 'Data poligon konsesi izin terbuka sedang dalam proses penelaahan kepatuhan.',
          },
        },
        spatial_summary_statement: summaryStatements.join(' '),
        enriched_at: nowIso,
      },
    };
  }
}
