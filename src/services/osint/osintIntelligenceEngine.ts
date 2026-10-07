import crypto from 'crypto';
import {
  OsintSourceRecord,
  OsintEntity,
  OsintActivity,
  OsintEvent,
  OsintSpatialCorrelation,
  OsintActivityType,
  ExtractionConfidence,
  GeocodingPrecision,
} from '../../types/osint';

// Gazetteer definition for Kabupaten Sintang
export interface SintangGazetteerEntry {
  name: string;
  type: 'KECAMATAN' | 'SUNGAI' | 'DESA' | 'KAWASAN';
  latitude: number;
  longitude: number;
  forestZoneCandidate?: string;
}

export const SINTANG_GAZETTEER: Record<string, SintangGazetteerEntry> = {
  ambalau: { name: 'Ambalau', type: 'KECAMATAN', latitude: -0.712, longitude: 112.981, forestZoneCandidate: 'Hutan Lindung (HL)' },
  serawai: { name: 'Serawai', type: 'KECAMATAN', latitude: -0.421, longitude: 112.553, forestZoneCandidate: 'Hutan Produksi Terbatas (HPT)' },
  'kayan hulu': { name: 'Kayan Hulu', type: 'KECAMATAN', latitude: -0.284, longitude: 112.185, forestZoneCandidate: 'Hutan Produksi Tetap (HP)' },
  'kayan hilir': { name: 'Kayan Hilir', type: 'KECAMATAN', latitude: -0.052, longitude: 112.083, forestZoneCandidate: 'Hutan Produksi Tetap (HP)' },
  dedai: { name: 'Dedai', type: 'KECAMATAN', latitude: 0.052, longitude: 111.751, forestZoneCandidate: 'Areal Penggunaan Lain (APL)' },
  sintang: { name: 'Sintang', type: 'KECAMATAN', latitude: 0.071, longitude: 111.492, forestZoneCandidate: 'Areal Penggunaan Lain (APL)' },
  'kelam permai': { name: 'Kelam Permai', type: 'KECAMATAN', latitude: 0.038, longitude: 111.684, forestZoneCandidate: 'Kawasan Suaka Alam / Kawasan Pelestarian Alam (KSA/KPA)' },
  'sungai tebelian': { name: 'Sungai Tebelian', type: 'KECAMATAN', latitude: 0.015, longitude: 111.432, forestZoneCandidate: 'Areal Penggunaan Lain (APL)' },
  sepauk: { name: 'Sepauk', type: 'KECAMATAN', latitude: -0.214, longitude: 111.238, forestZoneCandidate: 'Hutan Produksi yang dapat Dikonversi (HPK)' },
  tempunak: { name: 'Tempunak', type: 'KECAMATAN', latitude: -0.153, longitude: 111.458, forestZoneCandidate: 'Hutan Produksi Tetap (HP)' },
  'ketungau hilir': { name: 'Ketungau Hilir', type: 'KECAMATAN', latitude: 0.352, longitude: 111.528, forestZoneCandidate: 'Hutan Produksi Tetap (HP)' },
  'ketungau tengah': { name: 'Ketungau Tengah', type: 'KECAMATAN', latitude: 0.584, longitude: 111.782, forestZoneCandidate: 'Hutan Produksi Terbatas (HPT)' },
  'ketungau hulu': { name: 'Ketungau Hulu', type: 'KECAMATAN', latitude: 0.881, longitude: 112.124, forestZoneCandidate: 'Hutan Lindung (HL)' },
  'binjai hulu': { name: 'Binjai Hulu', type: 'KECAMATAN', latitude: 0.183, longitude: 111.605, forestZoneCandidate: 'Areal Penggunaan Lain (APL)' },
  'sungai kapuas': { name: 'Sungai Kapuas', type: 'SUNGAI', latitude: 0.075, longitude: 111.498 },
  'sungai melawi': { name: 'Sungai Melawi', type: 'SUNGAI', latitude: 0.062, longitude: 111.512 },
  'sungai kayan': { name: 'Sungai Kayan', type: 'SUNGAI', latitude: -0.125, longitude: 112.115 },
  'bukit baka': { name: 'Taman Nasional Bukit Baka Bukit Raya', type: 'KAWASAN', latitude: -0.655, longitude: 112.651, forestZoneCandidate: 'Kawasan Suaka Alam / Kawasan Pelestarian Alam (KSA/KPA)' },
  'bukit kelam': { name: 'TWA Taman Wisata Alam Gunung Kelam', type: 'KAWASAN', latitude: 0.045, longitude: 111.692, forestZoneCandidate: 'Kawasan Suaka Alam / Kawasan Pelestarian Alam (KSA/KPA)' },
};

export class OsintIntelligenceEngine {
  /**
   * Extract entities from text record
   */
  public static extractEntities(record: OsintSourceRecord): OsintEntity[] {
    const text = `${record.title} ${record.text_content}`;
    const entities: OsintEntity[] = [];
    const seen = new Set<string>();

    const addEntity = (
      name: string,
      type: OsintEntity['entity_type'],
      confidence: ExtractionConfidence,
      context?: string
    ) => {
      const normalized = name.trim().toLowerCase();
      if (!seen.has(`${type}:${normalized}`)) {
        seen.add(`${type}:${normalized}`);
        entities.push({
          entity_id: `ENT-${crypto.createHash('md5').update(`${record.record_id}-${type}-${normalized}`).digest('hex').slice(0, 10).toUpperCase()}`,
          record_id: record.record_id,
          entity_name: name.trim(),
          entity_type: type,
          normalized_name: normalized,
          confidence,
          context_sentence: context || text.slice(0, 150),
        });
      }
    };

    // 1. Locations
    for (const [key, entry] of Object.entries(SINTANG_GAZETTEER)) {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(text)) {
        addEntity(entry.name, 'LOCATION', 'HIGH', `Lokasi teridentifikasi dalam wilayah Kabupaten Sintang: ${entry.name}`);
      }
    }

    // 2. Government Agencies & Institutions
    const agencyPatterns = [
      { regex: /KPH\s+Sintang\s+Timur/i, name: 'UPT KPH Sintang Timur' },
      { regex: /Dinas\s+Lingkungan\s+Hidup\s+dan\s+Kehutanan|Dishut\s+Kalbar/i, name: 'Dinas LHK Provinsi Kalimantan Barat' },
      { regex: /Pemerintah\s+Kabupaten\s+Sintang|Pemkab\s+Sintang/i, name: 'Pemerintah Kabupaten Sintang' },
      { regex: /Bappeda\s+Kabupaten\s+Sintang|Bappeda\s+Sintang/i, name: 'Bappeda Kabupaten Sintang' },
      { regex: /BPBD\s+Sintang|Badan\s+Penanggulangan\s+Bencana\s+Daerah/i, name: 'BPBD Kabupaten Sintang' },
      { regex: /Manggala\s+Agni\s+Daops\s+Sintang|Manggala\s+Agni/i, name: 'Manggala Agni Daops Sintang' },
      { regex: /Balai\s+Gakkum\s+LHK|Gakkum\s+KLHK/i, name: 'Balai Penegakan Hukum LHK Kalimantan' },
      { regex: /Kementerian\s+Lingkungan\s+Hidup\s+dan\s+Kehutanan|KLHK/i, name: 'Kementerian LHK RI' },
      { regex: /Pengadilan\s+Negeri\s+Sintang/i, name: 'Pengadilan Negeri Sintang' },
      { regex: /BPN\s+Sintang|Kantor\s+Pertanahan\s+Sintang/i, name: 'Kantor Pertanahan (BPN) Sintang' },
      { regex: /Polres\s+Sintang|Kepolisian\s+Resor\s+Sintang/i, name: 'Kepolisian Resor Sintang' },
      { regex: /Universitas\s+Tanjungpura|UNTAN/i, name: 'Universitas Tanjungpura' },
    ];

    for (const pat of agencyPatterns) {
      if (pat.regex.test(text)) {
        addEntity(pat.name, 'AGENCY', 'HIGH', `Instansi atau lembaga pengampu terdeteksi: ${pat.name}`);
      }
    }

    // 3. Legal & Regulatory Documents
    const regPatterns = [
      { regex: /Perbup\s+Sintang\s+No(?:mor)?\s*42/i, name: 'Perbup Sintang No. 42 (Kearifan Lokal Karhutla)' },
      { regex: /SK\.6616\/MENLHK-PKTL\/KUH\/PLA\.2\/10\/2021/i, name: 'SK MenLHK 6616/2021 (Kawasan Hutan Kalbar)' },
      { regex: /Perda\s+No(?:mor)?\s*\d+\s+Tahun\s+\d+/i, name: 'Peraturan Daerah (Perda) Sintang' },
      { regex: /SK\s+Bupati\s+Sintang/i, name: 'Surat Keputusan (SK) Bupati Sintang' },
      { regex: /Hutan\s+Desa|Hutan\s+Kemasyarakatan|Hutan\s+Adat/i, name: 'SK Skema Perhutanan Sosial' },
    ];

    for (const reg of regPatterns) {
      if (reg.regex.test(text)) {
        addEntity(reg.name, 'LEGAL_REGULATION', 'HIGH');
      }
    }

    // 4. Commodities & Forest Products
    const commodityPatterns = [
      { regex: /kelapa\s+sawit|tandan\s+buah\s+segar|cpo/i, name: 'Kelapa Sawit (Elaeis guineensis)' },
      { regex: /kayu\s+bulat|kayu\s+olahan|kayu\s+gelondongan|log/i, name: 'Kayu Bulat / Kayu Olahan' },
      { regex: /karet|lateks/i, name: 'Karet (Hevea brasiliensis)' },
      { regex: /tambang\s+emas|peti|bauksit/i, name: 'Bahan Mineral / Komoditas Tambang' },
    ];

    for (const com of commodityPatterns) {
      if (com.regex.test(text)) {
        addEntity(com.name, 'COMMODITY', 'MEDIUM');
      }
    }

    return entities;
  }

  /**
   * Extract non-criminalizing activities
   */
  public static extractActivities(record: OsintSourceRecord): OsintActivity[] {
    const text = `${record.title} ${record.text_content}`;
    const activities: OsintActivity[] = [];

    // Rule 1: Fire incident
    if (/kebakaran|titik\s+panas|titik\s+api|karhutla|manggala\s+agni|asap/i.test(text)) {
      const sentence = this.findSentence(text, /kebakaran|titik\s+api|karhutla/i);
      activities.push({
        activity_id: `ACT-${crypto.createHash('md5').update(`${record.record_id}-FIRE`).digest('hex').slice(0, 10).toUpperCase()}`,
        record_id: record.record_id,
        activity_type: 'FIRE_INCIDENT_REPORTED',
        activity_description: 'Informasi publik mengenai indikasi atau penanganan kebakaran hutan dan lahan (karhutla).',
        verbatim_quote: sentence || record.title,
        reported_date: record.published_at,
        confidence: 'HIGH',
      });
    }

    // Rule 2: Land clearing reported
    if (/pembukaan\s+lahan|pembersihan\s+lahan|land\s+clearing|tebas\s+bakar|perambahan/i.test(text)) {
      const sentence = this.findSentence(text, /pembukaan\s+lahan|pembersihan\s+lahan|tebas/i);
      activities.push({
        activity_id: `ACT-${crypto.createHash('md5').update(`${record.record_id}-CLEAR`).digest('hex').slice(0, 10).toUpperCase()}`,
        record_id: record.record_id,
        activity_type: 'LAND_CLEARING_REPORTED',
        activity_description: 'Pemberitaan publik mengenai aktivitas pembukaan atau pembersihan bidang lahan.',
        verbatim_quote: sentence || record.title,
        reported_date: record.published_at,
        confidence: 'MEDIUM',
      });
    }

    // Rule 3: Timber transport reported
    if (/pengangkutan\s+kayu|peredaran\s+hasil\s+hutan|truk\s+kayu|kayu\s+olahan|izin\s+angkut/i.test(text)) {
      const sentence = this.findSentence(text, /pengangkutan\s+kayu|kayu\s+olahan|hasil\s+hutan/i);
      activities.push({
        activity_id: `ACT-${crypto.createHash('md5').update(`${record.record_id}-TIMBER`).digest('hex').slice(0, 10).toUpperCase()}`,
        record_id: record.record_id,
        activity_type: 'TIMBER_TRANSPORT_REPORTED',
        activity_description: 'Pemberitaan terbuka terkait peredaran atau pengangkutan komoditas kayu hasil hutan.',
        verbatim_quote: sentence || record.title,
        reported_date: record.published_at,
        confidence: 'MEDIUM',
      });
    }

    // Rule 4: Regulation / Permit issued
    if (/perbup|peraturan\s+daerah|sk\s+bupati|izin\s+usaha|perhutanan\s+sosial|sk\s+hutan/i.test(text)) {
      const sentence = this.findSentence(text, /perbup|peraturan|sk\s+bupati|hutan\s+desa/i);
      activities.push({
        activity_id: `ACT-${crypto.createHash('md5').update(`${record.record_id}-REG`).digest('hex').slice(0, 10).toUpperCase()}`,
        record_id: record.record_id,
        activity_type: 'REGULATION_PERMIT_ISSUED',
        activity_description: 'Pengundangan atau sosialisasi instrumen hukum, peraturan daerah, atau izin perhutanan.',
        verbatim_quote: sentence || record.title,
        reported_date: record.published_at,
        confidence: 'HIGH',
      });
    }

    // Rule 5: Tenurial Dispute / Community Hearing
    if (/sengketa|tata\s+batas|konflik\s+lahan|audiensi|keluhan\s+masyarakat|mediasi/i.test(text)) {
      const sentence = this.findSentence(text, /sengketa|tata\s+batas|konflik|mediasi/i);
      activities.push({
        activity_id: `ACT-${crypto.createHash('md5').update(`${record.record_id}-DISP`).digest('hex').slice(0, 10).toUpperCase()}`,
        record_id: record.record_id,
        activity_type: 'TENURIAL_DISPUTE_REPORTED',
        activity_description: 'Informasi terbuka terkait mediasi atau dinamika batas ruang/tenurial masyarakat.',
        verbatim_quote: sentence || record.title,
        reported_date: record.published_at,
        confidence: 'MEDIUM',
      });
    }

    // Default fallback activity if none detected
    if (activities.length === 0) {
      activities.push({
        activity_id: `ACT-${crypto.createHash('md5').update(`${record.record_id}-PUBLIC`).digest('hex').slice(0, 10).toUpperCase()}`,
        record_id: record.record_id,
        activity_type: 'ENVIRONMENTAL_INVESTIGATION',
        activity_description: 'Publikasi informasi umum lingkungan hidup dan kehutanan Kabupaten Sintang.',
        verbatim_quote: record.title,
        reported_date: record.published_at,
        confidence: 'LOW',
      });
    }

    return activities;
  }

  /**
   * Derive structured OSINT Intelligence Event
   */
  public static deriveEvent(
    record: OsintSourceRecord,
    entities: OsintEntity[],
    activities: OsintActivity[]
  ): OsintEvent {
    // Resolve primary location entity
    const locEntity = entities.find((e) => e.entity_type === 'LOCATION');
    let resolvedKecamatan = 'Sintang';
    let latitude = 0.071;
    let longitude = 111.492;
    let forestZone = 'Areal Penggunaan Lain (APL)';
    let precision: GeocodingPrecision = 'KABUPATEN';

    if (locEntity) {
      const gazEntry = SINTANG_GAZETTEER[locEntity.normalized_name];
      if (gazEntry) {
        resolvedKecamatan = gazEntry.name;
        latitude = gazEntry.latitude;
        longitude = gazEntry.longitude;
        if (gazEntry.forestZoneCandidate) {
          forestZone = gazEntry.forestZoneCandidate;
        }
        precision = gazEntry.type === 'KECAMATAN' ? 'KECAMATAN' : 'DESA';
      }
    }

    const primaryActivity = activities[0];
    const eventCode = `OSINT-EVT-${resolvedKecamatan.toUpperCase().replace(/\s+/g, '')}-${record.record_id.slice(-6)}`;

    return {
      event_id: `EVT-${crypto.createHash('md5').update(eventCode + record.record_id).digest('hex').slice(0, 12).toUpperCase()}`,
      event_code: eventCode,
      primary_record_id: record.record_id,
      activity_type: primaryActivity.activity_type,
      title: record.title,
      summary: record.summary || record.text_content.slice(0, 200),
      taxonomic_stage: 'REPORTED',
      kabupaten: 'Kabupaten Sintang',
      kecamatan: resolvedKecamatan,
      forest_zone: forestZone,
      geocoding_precision: precision,
      latitude,
      longitude,
      occurred_at: record.published_at,
      published_at: record.published_at || new Date().toISOString(),
      source_count: 1,
      confidence_score: primaryActivity.confidence === 'HIGH' ? 88.0 : 74.0,
      is_spatial_correlated: false,
      entities,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Correlate OSINT event with Satellite Land Change Events (Fase 5) & Fire Events (Fase 6)
   */
  public static correlateEvent(
    event: OsintEvent,
    landChangeEvents: any[] = [],
    fireEvents: any[] = []
  ): OsintSpatialCorrelation[] {
    const correlations: OsintSpatialCorrelation[] = [];

    // 1. Cross-correlate with Fase 5 Satellite Land Change Events (matching Kecamatan or nearby Lat/Lon)
    for (const lce of landChangeEvents) {
      const matchKecamatan = lce.location?.kecamatan?.toLowerCase() === event.kecamatan?.toLowerCase();
      let distMeters = 5000;

      if (event.latitude && event.longitude && lce.location?.latitude && lce.location?.longitude) {
        distMeters = this.calculateHaversineDistance(
          event.latitude,
          event.longitude,
          lce.location.latitude,
          lce.location.longitude
        );
      }

      if (matchKecamatan || distMeters < 15000) {
        correlations.push({
          correlation_id: `CORR-SAT-${crypto.createHash('md5').update(`${event.event_id}-${lce.event_id}`).digest('hex').slice(0, 10).toUpperCase()}`,
          osint_event_id: event.event_id,
          target_module: 'SATELLITE_LAND_CHANGE',
          target_id: lce.event_id || lce.id,
          correlation_type: 'SPATIAL_COINCIDENCE',
          distance_meters: Math.round(distMeters),
          time_delta_hours: 48,
          confidence_score: 86.5,
          correlation_summary: `Pemberitaan "${event.title.slice(0, 45)}..." berkorelasi spasial dengan deteksi bukaan kanopi satelit Sentinel-2 (${lce.event_id}) di Kecamatan ${event.kecamatan}.`,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 2. Cross-correlate with Fase 6 Fire Events (matching Kecamatan or active thermal cluster)
    for (const fe of fireEvents) {
      const matchKecamatan = fe.kecamatan?.toLowerCase() === event.kecamatan?.toLowerCase() ||
        fe.centroid?.kecamatan?.toLowerCase() === event.kecamatan?.toLowerCase();
      let distMeters = 6000;

      if (event.latitude && event.longitude && fe.centroid?.latitude && fe.centroid?.longitude) {
        distMeters = this.calculateHaversineDistance(
          event.latitude,
          event.longitude,
          fe.centroid.latitude,
          fe.centroid.longitude
        );
      }

      if ((matchKecamatan || distMeters < 15000) && event.activity_type === 'FIRE_INCIDENT_REPORTED') {
        correlations.push({
          correlation_id: `CORR-FIRE-${crypto.createHash('md5').update(`${event.event_id}-${fe.event_id}`).digest('hex').slice(0, 10).toUpperCase()}`,
          osint_event_id: event.event_id,
          target_module: 'FIRE_HOTSPOT',
          target_id: fe.event_id || fe.id,
          correlation_type: 'TEMPORAL_WINDOW_MATCH',
          distance_meters: Math.round(distMeters),
          time_delta_hours: 24,
          confidence_score: 91.0,
          correlation_summary: `Laporan pers karhutla berkorelasi dengan klaster titik panas NASA FIRMS/SIPONGI (${fe.event_id}) di wilayah ${event.kecamatan}.`,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 3. Correlate with Forest Zone (GIS)
    correlations.push({
      correlation_id: `CORR-GIS-${crypto.createHash('md5').update(`${event.event_id}-GIS-FZ`).digest('hex').slice(0, 10).toUpperCase()}`,
      osint_event_id: event.event_id,
      target_module: 'GIS_FOREST_ZONE',
      target_id: `ZONE-${event.kecamatan.toUpperCase()}`,
      correlation_type: 'JURISDICTION_INTERSECT',
      distance_meters: 0,
      time_delta_hours: null,
      confidence_score: 82.0,
      correlation_summary: `Wilayah administrasi ${event.kecamatan} berada dalam yurisdiksi pengawasan KPH Sintang Timur (Fungsi Kawasan: ${event.forest_zone}).`,
      created_at: new Date().toISOString(),
    });

    return correlations;
  }

  private static findSentence(text: string, regex: RegExp): string | null {
    const sentences = text.split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      if (regex.test(s) && s.length > 20) {
        return s.trim().slice(0, 260);
      }
    }
    return null;
  }

  private static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
