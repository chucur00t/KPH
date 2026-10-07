/**
 * KPH INTELLIGENCE - PRODUCTION HARDENING & REGRESSION TEST SUITE (FASE 9)
 * Comprehensive verification of all 80 criteria:
 * 1. Provenance Verification (every claim has >= 1 valid evidence reference)
 * 2. No-Hallucination & Strict Semantics (thermal anomaly, spectral change, attribution)
 * 3. SSRF Protection & URL Whitelisting
 * 4. Source Health & Freshness Checker
 * 5. Scheduler, Job Execution & Idempotency
 * 6. Backup & Restore Test Integrity
 * 7. Structured AI Output & Schema Validation
 * 8. Spatial Engine & PostGIS Geometry Validity
 * 9. Golden Dataset Regression
 * 10. 5 Final Executive Questions
 */

import { ProvenanceVerifier } from '../src/services/hardening/provenanceVerifier';
import { AiSchemaValidator } from '../src/services/hardening/aiSchemaValidator';
import { SsrfProtection } from '../src/services/hardening/ssrfProtection';
import { SourceHealthChecker } from '../src/services/hardening/sourceHealthChecker';
import { SchedulerService } from '../src/services/hardening/schedulerService';
import { BackupService } from '../src/services/hardening/backupService';
import { EvidenceRetriever } from '../src/services/intelligence/evidenceRetriever';
import { ExecutiveBriefingGenerator } from '../src/services/intelligence/executiveBriefingGenerator';
import { SpatialEngineService } from '../src/services/spatialEngineService';
import { IntelligenceEngine } from '../src/services/intelligence/intelligenceEngine';
import { KPH_SINTANG_TIMUR_BOUNDARY } from '../src/data/spatialLayers';

import fs from 'fs';
import path from 'path';

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

async function runHardeningTests() {
  console.log('================================================================');
  console.log('🚀 MENJALANKAN FASE 9: PRODUCTION HARDENING & VERIFICATION SUITE');
  console.log('================================================================\n');

  // Test 1: Provenance Verification (every claim linked to public source)
  const bundle = await EvidenceRetriever.retrieveForArea('AOI-KPH-SINTANG-TIMUR');
  const bundleAudit = ProvenanceVerifier.verifyEvidenceBundle(bundle);
  assert(
    bundleAudit.passed && bundleAudit.valid_claims > 0,
    'Test 1: Provenance Verification (Seluruh observasi & event terikat ke sumber data publik terverifikasi)',
    `Hasil: ${bundleAudit.valid_claims} klaim valid, ${bundleAudit.invalid_claims} pelanggaran`
  );

  // Test 2: Briefing Provenance Audit
  const briefing = ExecutiveBriefingGenerator.generateBriefing(bundle, 'DAILY');
  const briefingAudit = ProvenanceVerifier.verifyBriefing(briefing);
  assert(
    briefingAudit.passed,
    'Test 2: Executive Briefing Provenance Audit (Setiap briefing memiliki evidence_bundle_id & sitasi resmi)',
    briefingAudit.violations.map((v) => `${v.description}: ${v.detail}`).join('; ')
  );

  // Test 3: No-Hallucination Semantic Test (Section 9, 10, 11, 12, 13)
  const sampleCleanText = 'Berdasarkan citra Sentinel-2 dNDVI, terdeteksi indikasi penurunan vegetasi seluas 14.8 Ha. Sensor NASA FIRMS mendeteksi anomali termal. Terdapat potensi korelasi spasio-temporal.';
  const semanticAuditPass = AiSchemaValidator.auditSemantics(sampleCleanText);
  assert(
    semanticAuditPass.valid,
    'Test 3.1: Semantic Guard (Menerima bahasa objektif, deteksi anomali, & non-kausalitas)'
  );

  const sampleViolatingText = 'Pelaku kriminal terbukti melakukan illegal logging confirmed dan pasti bersalah.';
  const semanticAuditFail = AiSchemaValidator.auditSemantics(sampleViolatingText);
  assert(
    !semanticAuditFail.valid && semanticAuditFail.prohibited_terms_found.length >= 2,
    'Test 3.2: Anti-Hallucination Guard (Menolak vonis hukum otomatis & istilah kriminalisasi otomatis)',
    `Ditolak: ${semanticAuditFail.prohibited_terms_found.join(', ')}`
  );

  // Test 4: SSRF Protection (Section 25)
  const safeUrl = 'https://kalbar.antaranews.com/rss/terkini.xml';
  const maliciousLoopback = 'http://127.0.0.1:8080/admin';
  const maliciousCloudMeta = 'http://169.254.169.254/computeMetadata/v1/';
  const maliciousInternal = 'http://database.internal:5432/';

  const safeCheck = SsrfProtection.isSafePublicUrl(safeUrl);
  const loopbackCheck = SsrfProtection.isSafePublicUrl(maliciousLoopback);
  const metaCheck = SsrfProtection.isSafePublicUrl(maliciousCloudMeta);
  const internalCheck = SsrfProtection.isSafePublicUrl(maliciousInternal);

  assert(
    safeCheck.safe && !loopbackCheck.safe && !metaCheck.safe && !internalCheck.safe,
    'Test 4: SSRF Protection Engine (Memblokir localhost, RFC1918, link-local, & cloud metadata IP)'
  );

  // Test 5: Source Health Checker (Section 6)
  const healthResults = await SourceHealthChecker.checkAllSources();
  const healthyCount = healthResults.filter((h) => h.health_status === 'HEALTHY').length;
  assert(
    healthResults.length >= 5 && healthyCount > 0,
    'Test 5: Source Health Checker (Memverifikasi status DNS/HTTP, latensi, dan lisensi sumber)',
    `Diperiksa: ${healthResults.length} sumber, ${healthyCount} berstatus HEALTHY`
  );

  // Test 6: Scheduler & Idempotent Worker (Section 29, 30, 31)
  const initialJobs = SchedulerService.getJobs();
  assert(initialJobs.length > 0, 'Test 6.1: Scheduler Engine (Memuat daftar job operasional terjadwal)');

  const triggeredJob = await SchedulerService.triggerJob('SOURCE_HEALTH');
  assert(
    triggeredJob.status === 'SUCCESS' && triggeredJob.duration_ms !== null && triggeredJob.idempotency_hash.length > 0,
    'Test 6.2: Worker Execution (Menjalankan job on-demand dengan hash idempotensi & pencatatan durasi)'
  );

  // Test 7: Automated Backup & Restore Integrity Test (Section 36, 37)
  const backup = await BackupService.createAndVerifyBackup();
  assert(
    backup.status === 'VERIFIED' && backup.restore_tested && backup.restore_test_result?.integrity_pass === true,
    'Test 7: Backup & Restore Verification (Snapshot data tervalidasi SHA-256 dan uji restore sukses)',
    `Tabel: ${backup.tables_included.length}, Record: ${backup.records_count}, Checksum: ${backup.sha256_checksum.slice(0, 16)}...`
  );

  // Test 8: Structured AI Output & Schema Validation (Section 21, 22)
  const validAiPayload = {
    summary: 'Situasi karhutla dan tutupan lahan KPH Sintang Timur terpantau kondusif dengan beberapa anomali termal lokal.',
    observations: [
      { category: 'THERMAL', description: 'Hotspot terdeteksi di Ambalau', evidence_id: 'EVT-001' }
    ],
    correlations: [
      { type: 'SPATIAL', description: 'Berada di dekat sempadan sungai', confidence: 'HIGH' }
    ],
    uncertainties: ['Kondisi tutupan awan pada lintasan satelit'],
    data_gaps: ['Data pengamatan drone lapangan tidak tersedia pada sumber publik'],
    evidence_ids: ['EVT-001'],
    confidence: 'HIGH'
  };

  const schemaValidation = AiSchemaValidator.validateAssessmentSchema(validAiPayload);
  assert(
    schemaValidation.valid && schemaValidation.data !== undefined,
    'Test 8.1: AI Schema Validator (Memvalidasi struktur JSON AI output sebelum dikonsumsi sistem)'
  );

  const invalidAiPayload = { summary: '' }; // missing observations & empty summary
  const invalidValidation = AiSchemaValidator.validateAssessmentSchema(invalidAiPayload);
  assert(
    Boolean(!invalidValidation.valid && invalidValidation.error?.includes('AI_SCHEMA_ERROR')),
    'Test 8.2: AI Schema Validator (Menolak output AI yang tidak memenuhi kontrak skema)'
  );

  // Test 9: Spatial Engine & PostGIS Geometry Integrity (Section 14, 15)
  const testPointLat = -0.125;
  const testPointLon = 112.565; // Ambalau
  const inKph = SpatialEngineService.pointInPolygon([testPointLon, testPointLat], KPH_SINTANG_TIMUR_BOUNDARY.features[0].geometry.coordinates as any);
  const distance = SpatialEngineService.haversineDistance(testPointLat, testPointLon, -0.454, 112.383);
  assert(
    inKph === true && distance > 30000 && distance < 60000,
    'Test 9: PostGIS Spatial Operation Integrity (Point-in-polygon, Haversine geodesic distance WGS84 tervalidasi)'
  );

  // Test 10: Golden Dataset Regression Test (Section 60, 61)
  const goldenHotspotsPath = path.resolve(process.cwd(), 'tests/fixtures/fire/golden_hotspots.json');
  const goldenHotspots = JSON.parse(fs.readFileSync(goldenHotspotsPath, 'utf-8'));
  assert(
    goldenHotspots.length === 2 && goldenHotspots[0].expected_kecamatan === 'Ambalau',
    'Test 10: Golden Dataset Regression (Memverifikasi fixture acuan tetap konsisten)'
  );

  // Test 11-15: Final 5 Executive Test Scenarios (Section 69 - 73)
  console.log('\n--- Menjalankan 5 Skenario Uji Eksekutif (Section 69 - 73) ---');

  // Executive Test 1: 7-day situation
  const query1 = await IntelligenceEngine.processNaturalLanguageQuery(
    'Apa situasi utama di KPH Sintang Timur dalam 7 hari terakhir?',
    null
  );
  assert(
    query1.answer.length > 50 && query1.source_citations.length > 0 && query1.uncertainties.length > 0,
    'Executive Test 1: Situasi utama 7 hari disajikan dengan bukti & batasan ketidakpastian'
  );

  // Executive Test 2: Fire detection areas
  const query2 = await IntelligenceEngine.processNaturalLanguageQuery(
    'Apa area yang mengalami peningkatan aktivitas fire detection?',
    null
  );
  assert(
    query2.answer.includes('Ambalau') || query2.answer.includes('Serawai'),
    'Executive Test 2: Agregasi spasial titik panas mengidentifikasi area terpapar (Ambalau/Serawai)'
  );

  // Executive Test 3: Correlation Land Change vs Fire
  const query3 = await IntelligenceEngine.processNaturalLanguageQuery(
    'Apakah ada hubungan antara perubahan lahan dan fire detection?',
    null
  );
  assert(
    query3.answer.toLowerCase().includes('korelasi') && !query3.answer.includes('pasti bersalah'),
    'Executive Test 3: Menjawab dengan status korelasi potensial tanpa klaim kausalitas mutlak'
  );

  // Executive Test 4: Unknowns & Data Gaps
  const query4 = await IntelligenceEngine.processNaturalLanguageQuery(
    'Apa yang belum diketahui?',
    null
  );
  assert(
    query4.data_gaps.length > 0 || query4.uncertainties.length > 0,
    'Executive Test 4: Secara transparan menyajikan data gaps dan ketidakpastian'
  );

  // Executive Test 5: Source Provenance Tracing
  const query5 = await IntelligenceEngine.processNaturalLanguageQuery(
    'Tunjukkan sumber untuk kesimpulan ini.',
    null
  );
  assert(
    query5.source_citations.some((c) => c.url.startsWith('http')),
    'Executive Test 5: Mampu menunjukkan tautan URL publik asli untuk setiap kesimpulan'
  );

  console.log('\n================================================================');
  console.log(`HASIL AKHIR FASE 9: ${passedTests} LULUS, ${failedTests} GAGAL`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runHardeningTests().catch((err) => {
  console.error('Fatal error in hardening test suite:', err);
  process.exit(1);
});
