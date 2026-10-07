/**
 * KPH INTELLIGENCE - PHASE 10: ILLEGAL FORESTRY ACTIVITY INTELLIGENCE TEST SUITE
 * Validates:
 * 1. GIS Spatial Overlap & Proximity Calculation (HL, HPT, Peatland, River, Road)
 * 2. Satellite Change Detection & False Positive Management
 * 3. Fire + Land Change Spatiotemporal Correlation
 * 4. OSINT Entity Extraction & Public News Attribution
 * 5. Legal Status Separation: NO_PUBLIC_LICENSE_RECORD DOES NOT become ILLEGAL
 * 6. Deterministic Activity & Verification Priority Scoring Engine
 * 7. AI Legal Safety Guard: Neutrality & Evidence-Based Uncertainty
 * 8. Public Enforcement Event Integrity & Traceability
 */

import { ForestryActivityRepository } from '../src/services/forestry/forestryActivityRepository';
import { ForestryActivityScoringEngine } from '../src/services/forestry/forestryActivityScoringEngine';
import { ForestryAuthorizationCorrelationService } from '../src/services/forestry/forestryAuthorizationCorrelationService';
import { ForestryActivityCorrelationService } from '../src/services/forestry/forestryActivityCorrelationService';
import { ForestryActivityIndicator } from '../src/types/forestryActivity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

async function runPhase10Tests() {
  console.log('================================================================');
  console.log('🚀 MENJALANKAN FASE 10: ILLEGAL FORESTRY ACTIVITY TEST SUITE');
  console.log('================================================================');

  let passed = 0;

  // TEST 1: GIS SPATIAL OVERLAP & SENSITIVE AREA INTERSECTION
  const indicators = ForestryActivityRepository.getAllIndicators();
  assert(indicators.length >= 5, 'Repository memuat minimal 5 indikator aktivitas kehutanan terverifikasi');
  passed++;

  const ambalau = indicators.find((i) => i.indicatorId === 'IND-STG-2026-001');
  assert(!!ambalau, 'Indikator IND-STG-2026-001 (Ambalau) ditemukan');
  assert(ambalau!.forestFunction === 'HL', 'Indikator Ambalau berada di fungsi Hutan Lindung (HL)');
  assert(ambalau!.forestOverlapPercentage === 100.0, 'Irisan Hutan Lindung Ambalau terhitung 100%');
  assert(ambalau!.distanceToRiverM <= 150, 'Jarak ke sempadan sungai terhitung dekat (<= 150 meter)');
  passed++;

  // TEST 2: PEATLAND SENSITIVE AREA INTERSECTION
  const belitang = indicators.find((i) => i.indicatorId === 'IND-STG-2026-003');
  assert(!!belitang, 'Indikator IND-STG-2026-003 (Belitang) ditemukan');
  assert(belitang!.peatlandOverlap === true, 'Tumpang tindih Kesatuan Hidrologis Gambut (KHG) terdeteksi TRUE');
  assert(belitang!.peatlandName?.includes('Belitang') === true, 'Nama kubah gambut Belitang teridentifikasi');
  passed++;

  // TEST 3: SATELLITE CHANGE DETECTION & TEMPORAL PATTERN
  assert(new Date(ambalau!.dateBefore) < new Date(ambalau!.dateAfter), 'Urutan observasi satelit konsisten (dateBefore < dateAfter)');
  assert(typeof ambalau!.ndviDrop === 'number' && ambalau!.ndviDrop < -0.25, 'Penurunan kanopi vegetasi dNDVI terukur signifikan (< -0.25)');
  passed++;

  // TEST 4: FIRE + LAND CHANGE CORRELATION
  assert(ambalau!.fireCorrelation === true, 'Korelasi anomali termal VIIRS dan bukaan kanopi terdeteksi');
  assert((ambalau!.hotspotsCount || 0) >= 1, 'Jumlah titik panas terikat pada event karhutla terkait');
  passed++;

  // TEST 5: OSINT CORRELATION & CITATION
  const kayan = indicators.find((i) => i.indicatorId === 'IND-STG-2026-004');
  assert(!!kayan, 'Indikator IND-STG-2026-004 (Kayan Hilir) ditemukan');
  assert(kayan!.osintCorrelation === true, 'Korelasi pemberitaan OSINT publik terdeteksi TRUE');
  assert(!!kayan!.osintArticleHeadline, 'Judul siaran pers / berita OSINT tertera');
  passed++;

  // TEST 6: CRITICAL LEGAL SAFETY RULE - NO PUBLIC LICENSE != ILLEGAL
  const evalNoLicense = ForestryAuthorizationCorrelationService.evaluateLocation([112.565, -0.125]);
  assert(
    evalNoLicense.status === 'OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA',
    'Lokasi di luar izin konsesi publik terdeteksi OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA'
  );
  assert(
    evalNoLicense.suggestedLegalStatus === 'REQUIRES_VERIFICATION',
    'Ketiadaan izin publik terbuka ditetapkan sebagai REQUIRES_VERIFICATION'
  );
  assert(
    !evalNoLicense.suggestedLegalStatus.includes('ILLEGAL'),
    'Kritikal: Sistem DILARANG KERAS menetapkan status ILLEGAL semata karena ketiadaan izin publik'
  );
  assert(
    evalNoLicense.legalStatusReason.includes('BUKAN bukti tindakan ilegal'),
    'Alasan status legalitas secara eksplisit menyatakan ketiadaan izin bukan vonis kejahatan'
  );
  passed++;

  // TEST 7: PUBLIC AUTHORIZATION CONCESSION OVERLAP
  const serawai = indicators.find((i) => i.indicatorId === 'IND-STG-2026-002');
  assert(!!serawai, 'Indikator IND-STG-2026-002 (Serawai) ditemukan');
  assert(
    serawai!.authorizationStatus === 'WITHIN_PUBLIC_AUTHORIZED_AREA' ||
      serawai!.authorizationStatus === 'PARTIALLY_OVERLAPS_PUBLIC_AUTHORIZED_AREA',
    'Bukaan koridor Serawai terdeteksi beririsan atau berada di dalam konsesi resmi IUPHHK-HA'
  );
  assert(
    serawai!.legalStatus === 'PUBLIC_AUTHORIZATION_RECORD_FOUND',
    'Status legalitas koridor Serawai mengakui catatan perizinan publik resmi'
  );
  passed++;

  // TEST 8: DETERMINISTIC SCORING ENGINE INTEGRITY
  const testScore = ForestryActivityScoringEngine.calculateActivityScore({
    areaHa: 20.0,
    forestFunction: 'HL',
    peatlandOverlap: true,
    fireCorrelation: true,
    hotspotsCount: 3,
    distanceToRiverM: 100,
    distanceToRoadM: 100,
    osintCorrelation: true,
    temporalPattern: 'EXPANDING',
    sourceCount: 4,
  });
  assert(testScore >= 85.0, `Skor deterministik dihitung akurat (Hasil: ${testScore} >= 85.0)`);
  const prio = ForestryActivityScoringEngine.determinePriority(testScore);
  assert(prio === 'HIGH', 'Skor >= 80 diklasifikasikan sebagai prioritas HIGH');
  const verifPrio = ForestryActivityScoringEngine.determineVerificationPriority(testScore, {
    forestFunction: 'HL',
    peatlandOverlap: true,
    fireCorrelation: true,
    sourceCount: 4,
  });
  assert(verifPrio === 'URGENT', 'Indikator skor tinggi di HL dengan korelasi api berstatus verifikasi URGENT');
  passed++;

  // TEST 9: FALSE POSITIVE MANAGEMENT (Section 29)
  const dedai = indicators.find((i) => i.indicatorId === 'IND-STG-2026-005');
  assert(!!dedai, 'Indikator IND-STG-2026-005 (Dedai) ditemukan');
  assert(dedai!.status === 'REVIEW_REQUIRED', 'Indikator ladang tradisional berstatus REVIEW_REQUIRED');
  assert(dedai!.falsePositiveReason === 'SEASONAL_AGRICULTURE_CYCLE', 'Alasan False Positive teridentifikasi SEASONAL_AGRICULTURE_CYCLE');
  passed++;

  // TEST 10: PUBLIC ENFORCEMENT EVENT INTEGRITY (Section 14)
  const enforcements = ForestryActivityRepository.getEnforcementEvents();
  assert(enforcements.length >= 2, 'Registri penegakan hukum publik memuat data resmi');
  const seizure = enforcements.find((e) => e.eventType === 'TIMBER_SEIZURE');
  assert(!!seizure, 'Peristiwa penyitaan kayu olahan terdaftar');
  assert(
    seizure!.agency.includes('Gakkum') && seizure!.agency.includes('KLHK'),
    'Instansi penindak Gakkum KLHK terverifikasi'
  );
  assert(!!seizure!.caseReference, 'Nomor referensi kasus penindakan publik terdata');
  passed++;

  // TEST 11: EVIDENCE TRACEABILITY (100% CLAIM-TO-SOURCE)
  const evidenceList = ForestryActivityRepository.getAllEvidence();
  assert(evidenceList.length >= 8, 'Setiap indikator memiliki rantai bukti tersimpan (Total: ' + evidenceList.length + ')');
  for (const ev of evidenceList) {
    assert(ev.sourceUrl.startsWith('http'), `Bukti ${ev.evidenceId} memiliki URL publik resmi valid`);
    assert(!!ev.classification, `Bukti ${ev.evidenceId} memiliki klasifikasi baku`);
  }
  passed++;

  // TEST 12: SUMMARY METRICS INTEGRITY
  const summary = ForestryActivityRepository.getSummary();
  assert(summary.totalIndicators >= 5, 'Ringkasan KPI menghitung total indikator aktif');
  assert(summary.totalDisturbanceAreaHa > 50, 'Luasan indikatif total di atas 50 Ha');
  assert(summary.urgentVerificationCount >= 1, 'Terdapat indikator yang membutuhkan verifikasi segera');
  passed++;

  console.log('================================================================');
  console.log(`HASIL AKHIR TEST FASE 10: ${passed} LULUS, 0 GAGAL`);
  console.log('================================================================');
}

runPhase10Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
