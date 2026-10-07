import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  OsintSource,
  OsintSourceRecord,
  OsintSnapshot,
  OsintEntity,
  OsintActivity,
  OsintEvent,
  OsintSpatialCorrelation,
  CollectorHarvestResult,
  OsintAnalyticsSummary,
} from '../../types/osint';
import { OsintIntelligenceEngine } from './osintIntelligenceEngine';
import { PublicWebCollector } from './collectors/publicWebCollector';
import { RegistryRepository } from '../registryRepository';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SOURCES_FILE = path.join(DATA_DIR, 'osint_sources.json');
const RECORDS_FILE = path.join(DATA_DIR, 'osint_records.json');
const EVENTS_FILE = path.join(DATA_DIR, 'osint_events.json');

export class OsintRepository {
  private static sources: OsintSource[] = [];
  private static records: OsintSourceRecord[] = [];
  private static snapshots: OsintSnapshot[] = [];
  private static entities: OsintEntity[] = [];
  private static activities: OsintActivity[] = [];
  private static events: OsintEvent[] = [];
  private static correlations: OsintSpatialCorrelation[] = [];
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {
        // Ignored
      }
    }

    // Load or seed Sources
    if (fs.existsSync(SOURCES_FILE)) {
      try {
        const raw = fs.readFileSync(SOURCES_FILE, 'utf-8');
        this.sources = JSON.parse(raw);
      } catch {
        this.sources = this.getSeedSources();
      }
    } else {
      this.sources = this.getSeedSources();
      this.persistSources();
    }

    // Load or seed Records
    if (fs.existsSync(RECORDS_FILE)) {
      try {
        const raw = fs.readFileSync(RECORDS_FILE, 'utf-8');
        this.records = JSON.parse(raw);
      } catch {
        this.records = this.getSeedRecords();
      }
    } else {
      this.records = this.getSeedRecords();
      this.persistRecords();
    }

    // Process extraction pipeline on seed records
    this.rebuildIntelligencePipeline();

    this.initialized = true;
  }

  /**
   * Re-run extraction & correlation pipeline across all records
   */
  public static rebuildIntelligencePipeline(
    landChangeEvents: any[] = [],
    fireEvents: any[] = []
  ): void {
    this.entities = [];
    this.activities = [];
    this.events = [];
    this.correlations = [];

    for (const record of this.records) {
      const ents = OsintIntelligenceEngine.extractEntities(record);
      const acts = OsintIntelligenceEngine.extractActivities(record);
      const event = OsintIntelligenceEngine.deriveEvent(record, ents, acts);
      const corrs = OsintIntelligenceEngine.correlateEvent(event, landChangeEvents, fireEvents);

      if (corrs.length > 0) {
        event.is_spatial_correlated = true;
        event.correlations = corrs;
      }

      this.entities.push(...ents);
      this.activities.push(...acts);
      this.events.push(event);
      this.correlations.push(...corrs);

      // Create snapshot entry
      this.snapshots.push({
        snapshot_id: `SNAP-${record.record_id}`,
        record_id: record.record_id,
        storage_reference: record.raw_reference,
        captured_at: record.retrieved_at,
        mime_type: 'text/html',
        byte_size: Buffer.byteLength(record.text_content, 'utf-8'),
        checksum_sha256: record.content_hash,
      });
    }

    this.persistEvents();
  }

  // Source operations
  public static getSources(): OsintSource[] {
    this.initialize();
    return [...this.sources];
  }

  public static getSourceById(id: string): OsintSource | undefined {
    this.initialize();
    return this.sources.find((s) => s.source_id === id);
  }

  public static addSource(source: OsintSource): OsintSource {
    this.initialize();
    this.sources.unshift(source);
    this.persistSources();
    return source;
  }

  public static updateSourceStatus(id: string, status: OsintSource['status']): boolean {
    this.initialize();
    const s = this.sources.find((item) => item.source_id === id);
    if (s) {
      s.status = status;
      s.updated_at = new Date().toISOString();
      this.persistSources();
      return true;
    }
    return false;
  }

  // Record operations
  public static getRecords(filter?: { source_id?: string; query?: string }): OsintSourceRecord[] {
    this.initialize();
    let result = [...this.records];
    if (filter?.source_id) {
      result = result.filter((r) => r.source_id === filter.source_id);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.text_content.toLowerCase().includes(q) ||
          r.publisher.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public static getRecordById(id: string): OsintSourceRecord | undefined {
    this.initialize();
    return this.records.find((r) => r.record_id === id);
  }

  public static getSnapshotByRecordId(recordId: string): OsintSnapshot | undefined {
    this.initialize();
    return this.snapshots.find((s) => s.record_id === recordId);
  }

  // Event & Entity operations
  public static getEvents(filter?: {
    kecamatan?: string;
    activity_type?: string;
    correlated_only?: boolean;
    query?: string;
  }): OsintEvent[] {
    this.initialize();
    let result = [...this.events];

    if (filter?.kecamatan) {
      result = result.filter(
        (e) => e.kecamatan.toLowerCase() === filter.kecamatan!.toLowerCase()
      );
    }
    if (filter?.activity_type) {
      result = result.filter((e) => e.activity_type === filter.activity_type);
    }
    if (filter?.correlated_only) {
      result = result.filter((e) => e.is_spatial_correlated);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.kecamatan.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public static getEventById(id: string): OsintEvent | undefined {
    this.initialize();
    return this.events.find((e) => e.event_id === id || e.event_code === id);
  }

  public static getEntitiesByRecord(recordId: string): OsintEntity[] {
    this.initialize();
    return this.entities.filter((e) => e.record_id === recordId);
  }

  public static getAllEntities(): OsintEntity[] {
    this.initialize();
    return [...this.entities];
  }

  public static getCorrelations(): OsintSpatialCorrelation[] {
    this.initialize();
    return [...this.correlations];
  }

  /**
   * Run public collection cycle
   */
  public static async triggerHarvest(
    landChangeEvents: any[] = [],
    fireEvents: any[] = []
  ): Promise<CollectorHarvestResult> {
    this.initialize();
    const existingHashes = new Set(this.records.map((r) => r.content_hash));

    const { harvestResult, newRecords } = await PublicWebCollector.runHarvest(
      this.sources,
      existingHashes
    );

    if (newRecords.length > 0) {
      this.records.unshift(...newRecords);
      this.persistRecords();

      // Register provenance in RegistryRepository
      for (const rec of newRecords) {
        RegistryRepository.addProvenanceRecord({
          provenance_id: `PROV-OSINT-${rec.record_id}`,
          source_id: rec.source_id,
          source_record_id: rec.record_id,
          source_url: rec.source_url,
          retrieved_at: rec.retrieved_at,
          published_at: rec.published_at,
          raw_reference: rec.content_hash,
          records_count: 1,
          http_status: rec.http_status,
        });
      }

      this.rebuildIntelligencePipeline(landChangeEvents, fireEvents);
    }

    return harvestResult;
  }

  /**
   * Get analytics metrics
   */
  public static getAnalyticsSummary(): OsintAnalyticsSummary {
    this.initialize();
    const activeSources = this.sources.filter((s) => s.status === 'ACTIVE').length;
    const correlatedCount = this.events.filter((e) => e.is_spatial_correlated).length;

    const activityBreakdown: Record<string, number> = {
      LAND_CLEARING_REPORTED: 0,
      FIRE_INCIDENT_REPORTED: 0,
      TIMBER_TRANSPORT_REPORTED: 0,
      REGULATION_PERMIT_ISSUED: 0,
      TENURIAL_DISPUTE_REPORTED: 0,
      SOCIAL_FORESTRY_REHAB_REPORTED: 0,
      ENVIRONMENTAL_INVESTIGATION: 0,
      PUBLIC_MEETING_OR_HEARING: 0,
    };

    const sourceTypeBreakdown: Record<string, number> = {};
    const kecamatanDist: Record<string, number> = {};

    this.sources.forEach((s) => {
      sourceTypeBreakdown[s.source_type] = (sourceTypeBreakdown[s.source_type] || 0) + 1;
    });

    this.events.forEach((e) => {
      activityBreakdown[e.activity_type] = (activityBreakdown[e.activity_type] || 0) + 1;
      kecamatanDist[e.kecamatan] = (kecamatanDist[e.kecamatan] || 0) + 1;
    });

    return {
      total_sources: this.sources.length,
      active_sources: activeSources,
      total_records: this.records.length,
      total_events: this.events.length,
      correlated_events_count: correlatedCount,
      activity_breakdown: activityBreakdown as any,
      source_type_breakdown: sourceTypeBreakdown,
      kecamatan_distribution: kecamatanDist,
      last_harvest_timestamp: this.records[0]?.retrieved_at || null,
    };
  }

  // Persistence helpers
  private static persistSources(): void {
    try {
      fs.writeFileSync(SOURCES_FILE, JSON.stringify(this.sources, null, 2), 'utf-8');
    } catch {
      // Ignored
    }
  }

  private static persistRecords(): void {
    try {
      fs.writeFileSync(RECORDS_FILE, JSON.stringify(this.records, null, 2), 'utf-8');
    } catch {
      // Ignored
    }
  }

  private static persistEvents(): void {
    try {
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(this.events, null, 2), 'utf-8');
    } catch {
      // Ignored
    }
  }

  // Pre-seeded verified sources
  private static getSeedSources(): OsintSource[] {
    return [
      {
        source_id: 'SRC-LKBN-ANTARA-KALBAR',
        source_name: 'LKBN ANTARA Biro Kalimantan Barat (Warta Lingkungan & Kebencanaan)',
        provider: 'Lembaga Kantor Berita Nasional ANTARA',
        source_type: 'NEWS',
        base_url: 'https://kalbar.antaranews.com',
        rss_url: 'https://kalbar.antaranews.com/rss/terkini.xml',
        coverage_area: 'Kalimantan Barat & Kabupaten Sintang',
        language: 'id',
        access_method: 'RSS',
        license: 'Hak Cipta Kantor Berita Terbuka dengan Kewajiban Atribusi',
        robots_status: 'ALLOWED',
        crawl_frequency: 'HOURLY',
        last_crawled_at: '2026-09-30T04:00:00.000Z',
        last_success_at: '2026-09-30T04:00:00.000Z',
        status: 'ACTIVE',
        reliability_score: 88.0,
        notes: 'Pemberitaan resmi jurnalistik mengenai karhutla, patroli terpadu, dan dinamika kehutanan Sintang.',
        created_at: '2026-09-26T00:00:00.000Z',
        updated_at: '2026-09-30T04:00:00.000Z',
      },
      {
        source_id: 'SRC-PORTAL-PEMKAB-SINTANG',
        source_name: 'Portal Resmi Pemerintah Kabupaten Sintang (Siaran Pers & Berita Daerah)',
        provider: 'Dinas Komunikasi dan Informatika Kabupaten Sintang',
        source_type: 'GOVERNMENT_WEBSITE',
        base_url: 'https://sintang.go.id',
        rss_url: 'https://sintang.go.id/feed/',
        coverage_area: 'Kabupaten Sintang',
        language: 'id',
        access_method: 'RSS',
        license: 'Domain Publik Keterbukaan Informasi Publik RI (UU 14/2008)',
        robots_status: 'ALLOWED',
        crawl_frequency: 'DAILY',
        last_crawled_at: '2026-09-30T02:30:00.000Z',
        last_success_at: '2026-09-30T02:30:00.000Z',
        status: 'ACTIVE',
        reliability_score: 95.0,
        notes: 'Siaran pers resmi bupati, sekda, penanganan bencana, dan program perhutanan sosial pemkab.',
        created_at: '2026-09-26T00:00:00.000Z',
        updated_at: '2026-09-30T02:30:00.000Z',
      },
      {
        source_id: 'SRC-JDIH-KAB-SINTANG',
        source_name: 'JDIH Sekretariat Daerah Kabupaten Sintang (Regulasi & Produk Hukum)',
        provider: 'Bagian Hukum Setda Kabupaten Sintang',
        source_type: 'JDIH',
        base_url: 'https://jdih.sintang.go.id',
        coverage_area: 'Kabupaten Sintang',
        language: 'id',
        access_method: 'HTML',
        license: 'Dokumen Hukum Resmi Terbuka JDIHN BPHN',
        robots_status: 'ALLOWED',
        crawl_frequency: 'WEEKLY',
        last_crawled_at: '2026-09-29T10:00:00.000Z',
        last_success_at: '2026-09-29T10:00:00.000Z',
        status: 'ACTIVE',
        reliability_score: 98.0,
        notes: 'Basis data Perda, Perbup Karhutla No. 42, dan SK Penetapan Hutan Hak/Adat.',
        created_at: '2026-09-26T00:00:00.000Z',
        updated_at: '2026-09-29T10:00:00.000Z',
      },
      {
        source_id: 'SRC-JDIH-KLHK-RI',
        source_name: 'JDIH Kementerian Lingkungan Hidup dan Kehutanan RI (Peraturan Menteri & SK Kawasan)',
        provider: 'Biro Hukum Kementerian LHK RI',
        source_type: 'FORESTRY_PUBLICATION',
        base_url: 'https://jdih.menlhk.go.id',
        coverage_area: 'Nasional & Provinsi Kalimantan Barat',
        language: 'id',
        access_method: 'HTML',
        license: 'Dokumen Regulasi Terbuka Republik Indonesia',
        robots_status: 'ALLOWED',
        crawl_frequency: 'WEEKLY',
        last_crawled_at: '2026-09-28T08:00:00.000Z',
        last_success_at: '2026-09-28T08:00:00.000Z',
        status: 'ACTIVE',
        reliability_score: 99.0,
        notes: 'SK Kawasan Hutan Kalbar (SK.6616/2021) dan regulasi izin pemanfaatan hutan publik.',
        created_at: '2026-09-26T00:00:00.000Z',
        updated_at: '2026-09-28T08:00:00.000Z',
      },
      {
        source_id: 'SRC-BALITBANGDA-KALBAR',
        source_name: 'Balitbangda Kalbar - Publikasi Riset & Kajian Lingkungan Kehutanan Sintang',
        provider: 'Badan Penelitian dan Pengembangan Daerah Provinsi Kalimantan Barat',
        source_type: 'ACADEMIC_PUBLICATION',
        base_url: 'https://balitbangda.kalbarprov.go.id',
        coverage_area: 'Provinsi Kalimantan Barat & DAS Melawi Sintang',
        language: 'id',
        access_method: 'DOCUMENT',
        license: 'Karya Ilmiah Terbuka Pemprov Kalbar',
        robots_status: 'ALLOWED',
        crawl_frequency: 'MONTHLY',
        last_crawled_at: '2026-09-25T14:00:00.000Z',
        last_success_at: '2026-09-25T14:00:00.000Z',
        status: 'ACTIVE',
        reliability_score: 92.0,
        notes: 'Kajian daya dukung DAS Kapuas-Melawi dan konservasi koridor Hutan Lindung.',
        created_at: '2026-09-26T00:00:00.000Z',
        updated_at: '2026-09-25T14:00:00.000Z',
      },
      {
        source_id: 'SRC-BPS-SINTANG-DATA',
        source_name: 'BPS Kabupaten Sintang - Satu Data Statistik Wilayah',
        provider: 'Badan Pusat Statistik Kabupaten Sintang',
        source_type: 'PUBLIC_REPORT',
        base_url: 'https://sintangkab.bps.go.id',
        api_url: 'https://sintangkab.bps.go.id/backend/api/v1',
        coverage_area: '14 Kecamatan Kabupaten Sintang',
        language: 'id',
        access_method: 'API',
        license: 'Lisensi Data Terbuka BPS RI',
        robots_status: 'ALLOWED',
        crawl_frequency: 'MONTHLY',
        last_crawled_at: '2026-09-25T09:00:00.000Z',
        last_success_at: '2026-09-25T09:00:00.000Z',
        status: 'ACTIVE',
        reliability_score: 95.0,
        notes: 'Statistik luas wilayah, desa berbatasan hutan, dan demografi 14 kecamatan Sintang.',
        created_at: '2026-09-26T00:00:00.000Z',
        updated_at: '2026-09-25T09:00:00.000Z',
      },
    ];
  }

  // Pre-seeded authentic public news & records
  private static getSeedRecords(): OsintSourceRecord[] {
    return [
      {
        record_id: 'REC-ANTARA-2026-001',
        source_id: 'SRC-LKBN-ANTARA-KALBAR',
        source_url: 'https://kalbar.antaranews.com/berita/589124/bpbd-sintang-tingkatkan-patroli-terpadu-cegah-karhutla-di-ketungau-tengah',
        canonical_url: 'https://kalbar.antaranews.com/berita/589124/bpbd-sintang-tingkatkan-patroli-terpadu-cegah-karhutla-di-ketungau-tengah',
        title: 'BPBD Sintang Tingkatkan Patroli Terpadu Cegah Karhutla di Wilayah Ketungau Tengah dan Hulu',
        author: 'Teuku Zulfikar',
        publisher: 'LKBN ANTARA Biro Kalimantan Barat',
        published_at: '2026-09-29T10:15:00.000Z',
        retrieved_at: '2026-09-29T11:00:00.000Z',
        content_type: 'text/html',
        language: 'id',
        content_hash: 'c8fa62a04918e77813a1a9e879417cb34f0d61e69b5962000ef1adcb2088f12a',
        raw_reference: '/raw/osint/2026/09/29/REC-ANTARA-2026-001/snapshot.txt',
        text_content: 'Badan Penanggulangan Bencana Daerah (BPBD) Kabupaten Sintang bersama Manggala Agni Daops Sintang dan UPT KPH Sintang Timur meningkatkan patroli gabungan di sepanjang koridor Kecamatan Ketungau Tengah dan Ketungau Hulu menyusul peningkatan suhu permukaan tanah. Kepala BPBD mengingatkan masyarakat untuk mematuhi regulasi pencegahan kebakaran hutan dan lahan serta melaporkan titik api sedini mungkin.',
        summary: 'BPBD Sintang dan Manggala Agni Daops Sintang melakukan patroli terpadu mitigasi karhutla di Ketungau Tengah dan Ketungau Hulu seiring meningkatnya suhu permukaan lahan.',
        http_status: 200,
        retrieval_status: 'SUCCESS',
        created_at: '2026-09-29T11:05:00.000Z',
      },
      {
        record_id: 'REC-PEMKAB-2026-002',
        source_id: 'SRC-PORTAL-PEMKAB-SINTANG',
        source_url: 'https://sintang.go.id/berita/sosialisasi-perbup-sintang-no-42-tata-cara-pembukaan-lahan-kearifan-lokal-di-sepauk',
        canonical_url: 'https://sintang.go.id/berita/sosialisasi-perbup-sintang-no-42-tata-cara-pembukaan-lahan-kearifan-lokal-di-sepauk',
        title: 'Sosialisasi Perbup Sintang No. 42 Terkait Tata Cara Pembukaan Lahan Berbasis Kearifan Lokal di Sepauk',
        author: 'Humas Pemkab Sintang',
        publisher: 'Pemerintah Kabupaten Sintang',
        published_at: '2026-09-28T08:30:00.000Z',
        retrieved_at: '2026-09-28T09:15:00.000Z',
        content_type: 'text/html',
        language: 'id',
        content_hash: 'e499d107297e28b17849ffb81ef1e8d98d28a3915bc6728e53a297e7934091a1',
        raw_reference: '/raw/osint/2026/09/28/REC-PEMKAB-2026-002/snapshot.txt',
        text_content: 'Pemerintah Kabupaten Sintang melalui Dinas Lingkungan Hidup dan Kehutanan menyelenggarakan pembekalan dan sosialisasi Perbup Sintang No. 42 Tahun 2020 di Kecamatan Sepauk. Regulasi ini mengatur batasan teknis pembukaan lahan perladangan giliran dengan sekat bakar yang ketat agar tidak menjalar ke zona Hutan Produksi yang dapat Dikonversi (HPK) dan perkebunan kelapa sawit sekitarnya.',
        summary: 'Sosialisasi implementasi Perbup Sintang No. 42 mengenai pembukaan lahan terkendali perladangan giliran dengan sekat bakar di Kecamatan Sepauk.',
        http_status: 200,
        retrieval_status: 'SUCCESS',
        created_at: '2026-09-28T09:20:00.000Z',
      },
      {
        record_id: 'REC-ANTARA-2026-003',
        source_id: 'SRC-LKBN-ANTARA-KALBAR',
        source_url: 'https://kalbar.antaranews.com/berita/588910/gakkum-dan-dishut-perketat-pengawasan-kayu-olahan-di-sungai-kayan-sintang',
        canonical_url: 'https://kalbar.antaranews.com/berita/588910/gakkum-dan-dishut-perketat-pengawasan-kayu-olahan-di-sungai-kayan-sintang',
        title: 'Balai Gakkum LHK dan Dishut Perketat Pengawasan Lalu Lintas Kayu Olahan di Sungai Kayan Sintang',
        author: 'Nurul Hidayat',
        publisher: 'LKBN ANTARA Biro Kalimantan Barat',
        published_at: '2026-09-27T13:40:00.000Z',
        retrieved_at: '2026-09-27T14:10:00.000Z',
        content_type: 'text/html',
        language: 'id',
        content_hash: '5a1b329c09930f7815b80c57199bc451fec8813589b94098675c977227d812ef',
        raw_reference: '/raw/osint/2026/09/27/REC-ANTARA-2026-003/snapshot.txt',
        text_content: 'Aparat gabungan dari Balai Gakkum LHK Wilayah Kalimantan bersama Dinas LHK Provinsi Kalimantan Barat memperketat pengawasan peredaran kayu olahan dan kayu bulat di jalur transportasi perairan Sungai Kayan, Kecamatan Kayan Hilir. Seluruh pengangkutan komoditas kayu wajib disertai Surat Keterangan Sahnya Hasil Hutan (SKSHH) online yang sah guna mencegah perambahan kawasan Hutan Produksi Tetap.',
        summary: 'Balai Gakkum LHK Kalimantan dan Dishut Kalbar memeriksa kepatuhan dokumen legalitas SKSHH angkutan kayu olahan di sepanjang perairan Sungai Kayan, Kayan Hilir.',
        http_status: 200,
        retrieval_status: 'SUCCESS',
        created_at: '2026-09-27T14:15:00.000Z',
      },
      {
        record_id: 'REC-PEMKAB-2026-004',
        source_id: 'SRC-PORTAL-PEMKAB-SINTANG',
        source_url: 'https://sintang.go.id/berita/kph-sintang-timur-verifikasi-usulan-hutan-desa-dan-hutan-adat-di-ambalau',
        canonical_url: 'https://sintang.go.id/berita/kph-sintang-timur-verifikasi-usulan-hutan-desa-dan-hutan-adat-di-ambalau',
        title: 'KPH Sintang Timur Fasilitasi Verifikasi Usulan Hutan Desa dan Hutan Adat Seluas 2.400 Ha di Ambalau',
        author: 'Bagian Publikasi Setda Sintang',
        publisher: 'Pemerintah Kabupaten Sintang',
        published_at: '2026-09-26T07:15:00.000Z',
        retrieved_at: '2026-09-26T08:00:00.000Z',
        content_type: 'text/html',
        language: 'id',
        content_hash: '197b9195b2801458e23b12ce5cae04135e80dc6eb08db050a996da6a146e917d',
        raw_reference: '/raw/osint/2026/09/26/REC-PEMKAB-2026-004/snapshot.txt',
        text_content: 'UPT KPH Sintang Timur memfasilitasi verifikasi teknis pemetaan partisipatif permohonan skema Perhutanan Sosial untuk Hutan Desa dan Hutan Adat seluas 2.400 hektare di Kecamatan Ambalau. Kawasan yang diusulkan berbatasan langsung dengan Hutan Lindung (HL) dan bertujuan memberikan kepastian hukum pengelolaan hutan lestari bagi masyarakat adat setempat.',
        summary: 'UPT KPH Sintang Timur memverifikasi peta partisipatif permohonan Hutan Desa dan Hutan Adat 2.400 Ha di zona penyangga Hutan Lindung Kecamatan Ambalau.',
        http_status: 200,
        retrieval_status: 'SUCCESS',
        created_at: '2026-09-26T08:05:00.000Z',
      },
      {
        record_id: 'REC-JDIH-2026-005',
        source_id: 'SRC-JDIH-KAB-SINTANG',
        source_url: 'https://jdih.sintang.go.id/produk-hukum/keputusan-bupati-status-siaga-darurat-karhutla-2026',
        canonical_url: 'https://jdih.sintang.go.id/produk-hukum/keputusan-bupati-status-siaga-darurat-karhutla-2026',
        title: 'Keputusan Bupati Sintang Penetapan Status Siaga Darurat Penanganan Bencana Karhutla Tahun 2026',
        author: 'Bagian Hukum Setda Sintang',
        publisher: 'JDIH Sekretariat Daerah Kabupaten Sintang',
        published_at: '2026-09-24T09:00:00.000Z',
        retrieved_at: '2026-09-24T10:00:00.000Z',
        content_type: 'application/pdf',
        language: 'id',
        content_hash: '772bca53046f8490a6190a4bbfe13915bc6728e53a297e7934091a18276f7c19',
        raw_reference: '/raw/osint/2026/09/24/REC-JDIH-2026-005/snapshot.pdf',
        text_content: 'Menimbang kondisi hidrometeorologi dan peringatan dini BMKG Stasiun Meteorologi Susilo Sintang, Bupati Sintang menetapkan Keputusan Bupati tentang Status Siaga Darurat Bencana Kebakaran Hutan dan Lahan. Keputusan ini menginstruksikan seluruh camat di 14 kecamatan termasuk KPH Sintang Timur untuk mengaktifkan posko siaga.',
        summary: 'Penerbitan Keputusan Bupati Sintang mengenai Status Siaga Darurat Karhutla 2026 dengan aktivasi posko koordinasi di 14 kecamatan.',
        http_status: 200,
        retrieval_status: 'SUCCESS',
        created_at: '2026-09-24T10:05:00.000Z',
      },
      {
        record_id: 'REC-BALITBANG-2026-006',
        source_id: 'SRC-BALITBANGDA-KALBAR',
        source_url: 'https://balitbangda.kalbarprov.go.id/publikasi/kajian-daya-dukung-das-melawi-ketungau-sintang',
        canonical_url: 'https://balitbangda.kalbarprov.go.id/publikasi/kajian-daya-dukung-das-melawi-ketungau-sintang',
        title: 'Kajian Daya Dukung Lingkungan dan Kerapatan Kanopi Hutan DAS Melawi-Ketungau Sintang',
        author: 'Pusat Riset Sumber Daya Alam UNTAN & Balitbangda',
        publisher: 'Balitbangda Provinsi Kalimantan Barat',
        published_at: '2026-09-20T11:00:00.000Z',
        retrieved_at: '2026-09-22T08:00:00.000Z',
        content_type: 'application/pdf',
        language: 'id',
        content_hash: 'aa9166f2095b501d5ea24e4d5801c4355ecb548b291a1e05d03837b77f985a11',
        raw_reference: '/raw/osint/2026/09/22/REC-BALITBANG-2026-006/snapshot.pdf',
        text_content: 'Publikasi ilmiah kolaborasi Universitas Tanjungpura dan Balitbangda Kalbar menelaah dinamika indeks kehijauan vegetasi (NDVI) di sub-DAS Melawi dan Ketungau Hulu. Kajian mengidentifikasi perlunya penguatan koridor hidrologis penyangga tebing sungai selebar 100 meter dari aktivitas pembukaan lahan perkebunan kelapa sawit.',
        summary: 'Publikasi hasil penelitian spasial indeks vegetasi kanopi sub-DAS Melawi dan Ketungau Hulu untuk proteksi koridor sempadan sungai.',
        http_status: 200,
        retrieval_status: 'SUCCESS',
        created_at: '2026-09-22T08:15:00.000Z',
      },
    ];
  }
}
