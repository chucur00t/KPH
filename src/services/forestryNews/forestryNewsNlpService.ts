/**
 * KPH INTELLIGENCE - FORESTRY NEWS NLP & ENTITY EXTRACTOR (PHASE 10A)
 * Extracts activities, claims, entities, location precision, and legal context.
 * Strictly avoids automated conviction from keywords.
 */

import {
  ForestryNewsActivityCategory,
  ForestryNewsActivityType,
  NewsClaimType,
  NewsLegalStatus,
  LocationPrecision,
} from '../../types/forestryNews';

export class ForestryNewsNlpService {
  /**
   * Classifies activity category and sub-type from Indonesian forestry text.
   */
  public static classifyActivity(text: string): {
    category: ForestryNewsActivityCategory;
    activityType: ForestryNewsActivityType;
  } {
    const lower = text.toLowerCase();

    // Enforcement & Court
    if (lower.includes('sidang') || lower.includes('perkara no.') || lower.includes('pid.sus') || lower.includes('putusan')) {
      return { category: 'COURT_CASE', activityType: 'COURT_CASE' };
    }
    if (lower.includes('disita') || lower.includes('penyitaan') || lower.includes('mengamankan rakit') || lower.includes('kayu olahan')) {
      return { category: 'ENFORCEMENT', activityType: 'TIMBER_SEIZURE' };
    }
    if (lower.includes('penertiban peti') || (lower.includes('peti') && lower.includes('polres'))) {
      return { category: 'ENFORCEMENT', activityType: 'MINING_ENFORCEMENT' };
    }

    // Forestry
    if (lower.includes('illegal logging') || lower.includes('pembalakan liar') || lower.includes('penebangan liar')) {
      return { category: 'FORESTRY', activityType: 'ILLEGAL_LOGGING' };
    }
    if (lower.includes('perambahan hutan') || lower.includes('merambah')) {
      return { category: 'FORESTRY', activityType: 'FOREST_ENCROACHMENT' };
    }

    // Mining
    if (lower.includes('tambang ilegal') || lower.includes('peti') || lower.includes('emas tanpa izin')) {
      return { category: 'MINING', activityType: 'ILLEGAL_MINING' };
    }

    // Fire
    if (lower.includes('gambut') && (lower.includes('titik api') || lower.includes('karhutla') || lower.includes('bakar'))) {
      return { category: 'FIRE', activityType: 'PEAT_FIRE' };
    }
    if (lower.includes('karhutla') || lower.includes('kebakaran hutan')) {
      return { category: 'FIRE', activityType: 'FOREST_FIRE' };
    }

    // Plantation
    if (lower.includes('perkebunan sawit') || lower.includes('hgu') || lower.includes('kebun ilegal')) {
      return { category: 'PLANTATION', activityType: 'UNAUTHORIZED_PLANTATION' };
    }

    return { category: 'FORESTRY', activityType: 'FOREST_DISTURBANCE' as any };
  }

  /**
   * Section 11 & 12: Classifies claim type and legal status.
   * STRICT SAFETY RULE:
   * "Diduga melakukan pembalakan liar" -> ALLEGED, NOT CONVICTED.
   */
  public static extractLegalStatus(text: string): {
    claimType: NewsClaimType;
    legalStatus: NewsLegalStatus;
    reason: string;
  } {
    const lower = text.toLowerCase();

    // 1. Conviction (only if explicit public court judgment exists)
    if (lower.includes('divonis bersalah') || lower.includes('putusan berkekuatan hukum tetap') || lower.includes('inkracht')) {
      return {
        claimType: 'LEGAL_FINDING',
        legalStatus: 'CONVICTED',
        reason: 'Terdapat amar putusan pengadilan yang menyatakan vonis pidana resmi.',
      };
    }

    // 2. Court Proceeding
    if (lower.includes('sidang') || lower.includes('perkara no.') || lower.includes('pemeriksaan saksi')) {
      return {
        claimType: 'LEGAL_FINDING',
        legalStatus: 'COURT_CASE',
        reason: 'Perkara sedang disidangkan di pengadilan negeri; asas praduga tak bersalah berlaku.',
      };
    }

    // 3. Official Enforcement / Seizure
    if (lower.includes('mengamankan') || lower.includes('disita') || lower.includes('penertiban') || lower.includes('operasi gabungan')) {
      return {
        claimType: 'ENFORCEMENT',
        legalStatus: 'ENFORCEMENT_REPORTED',
        reason: 'Terdapat tindakan penyitaan barang bukti atau penertiban resmi oleh instansi penegak hukum.',
      };
    }

    // 4. Investigation
    if (lower.includes('penyelidikan') || lower.includes('penyidikan') || lower.includes('dalam pemeriksaan')) {
      return {
        claimType: 'INVESTIGATION',
        legalStatus: 'UNDER_INVESTIGATION',
        reason: 'Instansi berwenang sedang melakukan proses penyelidikan atau penyidikan.',
      };
    }

    // 5. Official statement without seizure
    if (lower.includes('mengimbau') || lower.includes('siaran pers') || lower.includes('kepala balai menyatakan')) {
      return {
        claimType: 'OFFICIAL_STATEMENT',
        legalStatus: 'REPORTED',
        reason: 'Pernyataan resmi dari instansi pemerintah terkait imbauan kepatuhan atau situasi umum.',
      };
    }

    // 6. Allegation / Rumor
    if (lower.includes('diduga') || lower.includes('dugaan') || lower.includes('warga mengeluhkan') || lower.includes('dituding')) {
      return {
        claimType: 'ALLEGATION',
        legalStatus: 'ALLEGED',
        reason: 'Klaim publik bersifat dugaan atau pengaduan awal yang belum diverifikasi secara hukum.',
      };
    }

    return {
      claimType: 'PUBLIC_REPORT',
      legalStatus: 'LEGAL_STATUS_UNKNOWN',
      reason: 'Status hukum tidak dapat dipastikan secara definitif dari teks berita yang tersedia.',
    };
  }

  /**
   * Section 14: Extracts location precision without coordinate invention.
   */
  public static extractLocationPrecision(text: string): {
    locationName: string;
    precision: LocationPrecision;
    centroid?: [number, number];
  } {
    const lower = text.toLowerCase();

    // Village level
    if (lower.includes('nanga mau')) {
      return {
        locationName: 'Desa Nanga Mau, Kecamatan Kayan Hilir',
        precision: 'VILLAGE',
        centroid: [112.185, -0.285],
      };
    }
    if (lower.includes('nanga menantak')) {
      return {
        locationName: 'Desa Nanga Menantak, Kecamatan Ambalau',
        precision: 'VILLAGE',
        centroid: [112.565, -0.125],
      };
    }

    // District level
    if (lower.includes('ambalau')) {
      return {
        locationName: 'Kecamatan Ambalau',
        precision: 'DISTRICT',
        centroid: [112.56, -0.12],
      };
    }
    if (lower.includes('serawai')) {
      return {
        locationName: 'Kecamatan Serawai',
        precision: 'DISTRICT',
        centroid: [112.50, -0.42],
      };
    }
    if (lower.includes('kayan hilir')) {
      return {
        locationName: 'Kecamatan Kayan Hilir',
        precision: 'DISTRICT',
        centroid: [112.18, -0.28],
      };
    }
    if (lower.includes('ketungau tengah')) {
      return {
        locationName: 'Kecamatan Ketungau Tengah',
        precision: 'DISTRICT',
        centroid: [111.89, 0.03],
      };
    }

    // Regency level
    if (lower.includes('sintang')) {
      return {
        locationName: 'Kabupaten Sintang',
        precision: 'REGENCY',
        centroid: [111.498, 0.076],
      };
    }

    return {
      locationName: 'Kalimantan Barat',
      precision: 'PROVINCE',
      centroid: [111.0, 0.0],
    };
  }
}
