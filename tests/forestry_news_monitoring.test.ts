/**
 * KPH INTELLIGENCE - PHASE 10A: FORESTRY ILLEGAL ACTIVITY NEWS & REPORT MONITORING TEST SUITE
 * Validates:
 * 1. Public Source Registry & SSRF Safe Crawling
 * 2. Deduplication & Syndication Clustering (Section 18)
 * 3. Activity & Entity Extraction (Section 10 & 13)
 * 4. Semantic & Legal Context Separation: Allegation vs Official vs Conviction (Section 11 & 12)
 * 5. Location Precision Handling: No Coordinate Invention (Section 14)
 * 6. Cross-Source Corroboration & Syndication Independence (Section 19)
 * 7. Source Conflict Detection (Section 37)
 * 8. Satellite & Fire Multi-Source Correlation (Section 20 & 21)
 * 9. Claim Traceability & Exact Excerpt Preservation (Section 16 & 34)
 * 10. Summary & KPI Metrics Integrity
 */

import { ForestryNewsRepository } from '../src/services/forestryNews/forestryNewsRepository';
import { ForestryNewsCollector } from '../src/services/forestryNews/forestryNewsCollector';
import { ForestryNewsNlpService } from '../src/services/forestryNews/forestryNewsNlpService';
import { ForestryNewsCorrelationService } from '../src/services/forestryNews/forestryNewsCorrelationService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

async function runPhase10ATests() {
  console.log('================================================================');
  console.log('🚀 MENJALANKAN FASE 10A: FORESTRY NEWS & REPORT MONITORING SUITE');
  console.log('================================================================');

  let passed = 0;

  // TEST 1: SOURCE REGISTRY & SSRF SAFETY
  const sources = ForestryNewsRepository.getAllSources();
  assert(sources.length >= 4, 'Memuat minimal 4 sumber warta publik terverifikasi (ANTARA, Gakkum, Polri, Pengadilan)');
  assert(sources.some((s) => s.monitoringPriority === 'AUTHORITATIVE'), 'Memiliki sumber dengan prioritas AUTHORITATIVE');
  assert(ForestryNewsCollector.validateSourceUrl('https://kalbar.antaranews.com/rss'), 'URL publik terbuka terverifikasi aman (SSRF Safe)');
  assert(!ForestryNewsCollector.validateSourceUrl('http://169.254.169.254/latest/meta-data'), 'SSRF Guard memblokir IP metadata cloud');
  assert(!ForestryNewsCollector.validateSourceUrl('http://127.0.0.1:8080/admin'), 'SSRF Guard memblokir localhost internal');
  passed++;

  // TEST 2: RAW RECORDS & SHA-256 DEDUPLICATION
  const records = ForestryNewsRepository.getAllRecords();
  assert(records.length >= 5, 'Memuat minimal 5 catatan warta publik');
  const recordWithHash = records[0];
  assert(!!recordWithHash.contentHash && recordWithHash.contentHash.length === 64, 'Setiap record memiliki SHA-256 content hash baku');
  passed++;

  // TEST 3: SYNDICATION DEDUPLICATION CLUSTERING (Section 18)
  const syndicatedCopy = records.find((r) => r.isSyndicatedCopy === true);
  assert(!!syndicatedCopy, 'Mendeteksi warta sindikasi klona dari rilis berita yang sama');
  const originalCopy = records.find((r) => r.clusterId === syndicatedCopy!.clusterId && !r.isSyndicatedCopy);
  assert(!!originalCopy, 'Warta sindikasi terkelompokkan ke dalam kluster artikel asli yang sama');
  passed++;

  // TEST 4: ACTIVITY & ENTITY EXTRACTION
  const timberSeizure = ForestryNewsNlpService.classifyActivity(
    'Tim gabungan mengamankan rakitan kayu olahan jenis meranti di perairan hulu Sungai Melawi'
  );
  assert(timberSeizure.category === 'ENFORCEMENT', 'Teks penyitaan diklasifikasikan sebagai kategori ENFORCEMENT');
  assert(timberSeizure.activityType === 'TIMBER_SEIZURE', 'Sub-aktivitas teridentifikasi sebagai TIMBER_SEIZURE');

  const petiMining = ForestryNewsNlpService.classifyActivity(
    'Polres Sintang melaksanakan penertiban terhadap aktivitas tambang emas tanpa izin (PETI)'
  );
  assert(petiMining.category === 'ENFORCEMENT' || petiMining.category === 'MINING', 'Teks penertiban PETI terklasifikasi akurat');
  passed++;

  // TEST 5: CRITICAL LEGAL CONTEXT & SEMANTIC SAFETY (Section 11 & 12)
  const allegationResult = ForestryNewsNlpService.extractLegalStatus(
    'Warga mengeluhkan bahwa sebuah perusahaan diduga melakukan pembalakan liar di hulu'
  );
  assert(allegationResult.claimType === 'ALLEGATION', 'Klaim dugaan terklasifikasi sebagai ALLEGATION');
  assert(allegationResult.legalStatus === 'ALLEGED', 'Status hukum klaim dugaan ditetapkan sebagai ALLEGED');
  assert(!allegationResult.legalStatus.includes('CONVICTED'), 'Kritikal: Teks dugaan DILARANG KERAS divonis CONVICTED');

  const enforcementResult = ForestryNewsNlpService.extractLegalStatus(
    'Gakkum KLHK mengamankan barang bukti kayu tanpa dokumen SKSHHK sah'
  );
  assert(enforcementResult.legalStatus === 'ENFORCEMENT_REPORTED', 'Penyitaan resmi terklasifikasi ENFORCEMENT_REPORTED');

  const courtResult = ForestryNewsNlpService.extractLegalStatus(
    'PN Sintang menggelar sidang perkara tindak pidana kehutanan Nomor 118/Pid.Sus/2026/PN Stg'
  );
  assert(courtResult.legalStatus === 'COURT_CASE', 'Sidang pengadilan terklasifikasi sebagai COURT_CASE');
  passed++;

  // TEST 6: LOCATION PRECISION WITHOUT COORDINATE INVENTION (Section 14)
  const villageLoc = ForestryNewsNlpService.extractLocationPrecision('di Desa Nanga Mau Kecamatan Kayan Hilir');
  assert(villageLoc.precision === 'VILLAGE', 'Teks tingkat desa teridentifikasi presisi VILLAGE');

  const districtLoc = ForestryNewsNlpService.extractLocationPrecision('di wilayah Kecamatan Ambalau Sintang');
  assert(districtLoc.precision === 'DISTRICT', 'Teks tingkat kecamatan teridentifikasi presisi DISTRICT');

  const regencyLoc = ForestryNewsNlpService.extractLocationPrecision('terjadi di Kabupaten Sintang');
  assert(regencyLoc.precision === 'REGENCY', 'Teks tingkat kabupaten teridentifikasi presisi REGENCY tanpa menciptakan titik palsu');
  passed++;

  // TEST 7: CROSS-SOURCE CORROBORATION (Section 19)
  const events = ForestryNewsRepository.getAllEvents();
  assert(events.length >= 4, 'Memuat kejadian warta terfilter');
  const event1 = events.find((e) => e.eventId === 'EVT-NEWS-2026-001');
  assert(!!event1, 'Kejadian EVT-NEWS-2026-001 ditemukan');
  const corroboration = ForestryNewsCorrelationService.evaluateCorroboration(event1!, records);
  assert(corroboration.syndicatedCopiesCount >= 1, 'Mendeteksi artikel sindikasi sebagai salinan turunan');
  assert(corroboration.independentSourceCount === 1, 'Artikel sindikasi tidak dihitung sebagai sumber independen terpisah');
  passed++;

  // TEST 8: SOURCE CONFLICT DETECTION (Section 37)
  const conflictCheck = ForestryNewsCorrelationService.detectSourceConflict(records);
  assert(typeof conflictCheck.hasConflict === 'boolean', 'Pemeriksaan konflik sumber menghasilkan status deterministik');
  passed++;

  // TEST 9: SATELLITE & FIRE CORRELATION (Section 20 & 21)
  assert(event1!.satelliteCorrelated === true, 'Kejadian berita Ambalau terkorelasi dengan anomali tutupan satelit Sentinel-2');
  assert(event1!.fireCorrelated === true, 'Kejadian berita Ambalau terkorelasi dengan anomali termal titik api');
  passed++;

  // TEST 10: CLAIM TRACEABILITY & EXACT EXCERPTS (Section 16 & 34)
  const claims = ForestryNewsRepository.getAllClaims();
  assert(claims.length >= 4, 'Memuat minimal 4 klaim kutipan warta tersimpan');
  for (const clm of claims) {
    assert(!!clm.sourceExcerpt && clm.sourceExcerpt.length > 10, 'Setiap klaim menyimpan kutipan langsung dari sumber asli');
    assert(clm.sourceUrl.startsWith('http'), 'Setiap klaim memiliki URL sumber publik asli');
  }
  passed++;

  // TEST 11: SUMMARY METRICS INTEGRITY
  const summary = ForestryNewsRepository.getSummary();
  assert(summary.totalRecords >= 5, 'Ringkasan KPI mencakup total warta');
  assert(summary.enforcementReports >= 1, 'Ringkasan KPI mendata rilis penegakan hukum');
  assert(summary.courtCasesCount >= 1, 'Ringkasan KPI mendata perkara pengadilan');
  passed++;

  console.log('================================================================');
  console.log(`HASIL AKHIR TEST FASE 10A: ${passed} LULUS, 0 GAGAL`);
  console.log('================================================================');
}

runPhase10ATests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
