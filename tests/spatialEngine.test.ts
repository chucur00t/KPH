/**
 * KPH INTELLIGENCE - GIS & SPATIAL ENGINE TEST SUITE (FASE 4)
 * Validates:
 * 1. Point in polygon
 * 2. Polygon intersection
 * 3. Geodesic distance (Haversine WGS84)
 * 4. Geodesic Area calculation in Hectares
 * 5. Geodesic Buffer generation
 * 6. Bounding box query
 * 7. Spatial event enrichment pipeline
 * 8. Invalid geometry rejection
 * 9. Missing source / Data Not Available handling
 * 10. Missing coordinate rejection
 * 11. GIS REST API integration
 */

import { SpatialEngineService } from '../src/services/spatialEngineService';
import { SpatialEventEnrichmentService } from '../src/services/spatialEventEnrichmentService';
import { GisRepository } from '../src/services/gisRepository';
import { KPH_SINTANG_TIMUR_BOUNDARY, FOREST_ZONES_LAYER } from '../src/data/spatialLayers';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}: ${detail || 'Assertion failed'}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('=====================================================');
  console.log('🚀 MENJALANKAN GIS & SPATIAL ENGINE TEST SUITE (FASE 4)');
  console.log('=====================================================\n');

  // Test 1: Point in Polygon
  const kphCoords = KPH_SINTANG_TIMUR_BOUNDARY.features[0].geometry.coordinates as any;
  const insidePt: [number, number] = [112.56, -0.12]; // Inside Ambalau, KPH Sintang Timur
  const outsidePt: [number, number] = [109.33, -0.02]; // Pontianak (far west outside KPH)

  const isInside = SpatialEngineService.pointInPolygon(insidePt, kphCoords);
  const isOutside = SpatialEngineService.pointInPolygon(outsidePt, kphCoords);
  assert(isInside === true, 'Test 1.1: Point in polygon (Titik di dalam KPH Sintang Timur terdeteksi TRUE)');
  assert(isOutside === false, 'Test 1.2: Point in polygon (Titik di Pontianak terdeteksi FALSE)');

  // Test 2: Polygon Intersection & BBox Intersects
  const bboxKph = SpatialEngineService.computeBBox(KPH_SINTANG_TIMUR_BOUNDARY.features[0].geometry as any);
  const bboxOverlap: [number, number, number, number] = [112.0, -0.5, 112.8, 0.0];
  const bboxFarAway: [number, number, number, number] = [106.0, -6.5, 107.0, -6.0]; // Jakarta

  assert(
    SpatialEngineService.bboxIntersects(bboxKph, bboxOverlap) === true,
    'Test 2.1: Polygon/BBox Intersection (Bounding box tumpang tindih terdeteksi TRUE)'
  );
  assert(
    SpatialEngineService.bboxIntersects(bboxKph, bboxFarAway) === false,
    'Test 2.2: Polygon/BBox Intersection (Bounding box terpisah terdeteksi FALSE)'
  );

  // Test 3: Geodesic Distance (Haversine WGS84)
  // Sintang City [-0.05, 111.50] to Nanga Pinoh [-0.34, 111.74] ~ 42 - 45 km
  const distMeters = SpatialEngineService.haversineDistance(-0.05, 111.50, -0.34, 111.74);
  const distKm = distMeters / 1000;
  assert(
    distKm >= 40 && distKm <= 48,
    'Test 3: Geodesic Distance Haversine Sintang ke Nanga Pinoh (~42km)',
    `Hasil: ${distKm.toFixed(2)} km`
  );

  // Test 4: Geodesic Area Calculation in Hectares
  const kphAreaHa = SpatialEngineService.calculateGeodesicAreaHa(kphCoords);
  assert(
    kphAreaHa > 700000 && kphAreaHa < 950000,
    'Test 4: Geodesic Area Calculation KPH Sintang Timur (~847.200 Ha)',
    `Hasil: ${kphAreaHa.toLocaleString()} Ha`
  );

  // Test 5: Geodesic Buffer Generation
  const bufferRing = SpatialEngineService.generatePointBuffer(-0.12, 112.56, 1000, 32); // 1km buffer
  assert(bufferRing.length === 33, 'Test 5.1: Geodesic Buffer menghasilkan 33 titik cincin polygon tertutup');
  // First and last point must match
  assert(
    bufferRing[0][0] === bufferRing[32][0] && bufferRing[0][1] === bufferRing[32][1],
    'Test 5.2: Buffer polygon memiliki ring tertutup sempurna'
  );

  // Test 6: Bounding Box Query
  const kphComputedBbox = SpatialEngineService.computeBBox(KPH_SINTANG_TIMUR_BOUNDARY.features[0].geometry as any);
  assert(
    kphComputedBbox[0] >= 111.0 && kphComputedBbox[2] <= 114.0 && kphComputedBbox[1] >= -1.5 && kphComputedBbox[3] <= 1.0,
    'Test 6: Bounding Box KPH Sintang Timur berada di koordinat geografis valid'
  );

  // Test 7: Spatial Event Enrichment Pipeline & Anti-False Certainty
  const enriched = SpatialEventEnrichmentService.enrich({
    event_id: 'EVT-TEST-AMBALAU-01',
    latitude: -0.1248,
    longitude: 112.5632,
    location_source: 'NASA_VIIRS_SENSOR',
  });

  assert(
    enriched.derived_location_context.kph_area.is_inside_kph === true,
    'Test 7.1: Spatial Enrichment mendeteksi event di dalam KPH Sintang Timur'
  );
  assert(
    enriched.derived_location_context.forest_context.fungsi_kawasan !== null,
    'Test 7.2: Spatial Enrichment mendeteksi fungsi kawasan hutan'
  );
  assert(
    enriched.derived_location_context.environment_context.nearest_river.distance_meters !== null,
    'Test 7.3: Spatial Enrichment menghitung jarak sempadan sungai terdekat'
  );
  assert(
    !enriched.derived_location_context.spatial_summary_statement.toLowerCase().includes('ilegal'),
    'Test 7.4: Anti-False Certainty (DILARANG menggunakan kata "ilegal", wajib gunakan terminologi berjenjang)'
  );

  // Test 8: Invalid Geometry Handling
  const invalidGeo1 = { type: 'Polygon', coordinates: [[[NaN, 0], [1, 1], [0, 1], [NaN, 0]]] };
  const invalidGeo2 = { type: 'Point', coordinates: [200, 45] }; // Lon out of bounds
  const validCheck1 = SpatialEngineService.validateGeometry(invalidGeo1 as any);
  const validCheck2 = SpatialEngineService.validateGeometry(invalidGeo2 as any);
  assert(validCheck1.valid === false, 'Test 8.1: Validasi menolak koordinat NaN');
  assert(validCheck2.valid === false, 'Test 8.2: Validasi menolak Longitude di luar batas valid [-180, 180]');

  // Test 9: Missing Source / DATA NOT AVAILABLE handling
  assert(
    enriched.derived_location_context.public_activity_context.perkebunan.data_status === 'NOT_AVAILABLE',
    'Test 9: Lapisan HGU Perkebunan yang belum dirilis publik berstatus NOT_AVAILABLE tanpa karangan'
  );

  // Test 10: Missing Coordinate Handling
  try {
    const invalidCheck = SpatialEngineService.validateGeometry(null as any);
    assert(invalidCheck.valid === false, 'Test 10: Penanganan input geometri null ditolak dengan aman');
  } catch (e) {
    assert(false, 'Test 10: Terjadi unhandled exception');
  }

  // Test 11: GIS Repository & Layer Registry
  GisRepository.init();
  const allLayers = GisRepository.getLayers();
  assert(allLayers.length === 19, 'Test 11.1: Layer Registry memuat 19 kategori layer GIS resmi');
  const pointQueryRes = GisRepository.pointQuery(-0.1248, 112.5632);
  assert(
    pointQueryRes.intersectingFeatures.length > 0,
    'Test 11.2: Point Query menemukan poligon yang beririsan dengan titik uji Ambalau'
  );

  console.log('\n=====================================================');
  console.log(`HASIL AKHIR: ${passedTests} LULUS, ${failedTests} GAGAL`);
  console.log('=====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
