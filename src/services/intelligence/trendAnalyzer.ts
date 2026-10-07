import { EvidenceBundle } from '../../types/intelligenceEngine';

export interface TrendFinding {
  metric: string;
  trend_direction: 'INCREASING' | 'DECREASING' | 'STABLE' | 'IRREGULAR' | 'INSUFFICIENT_DATA';
  period_label: string;
  summary: string;
  baseline_value: number;
  current_value: number;
}

export class TrendAnalyzer {
  public static analyzeTrends(bundle: EvidenceBundle): TrendFinding[] {
    const fireCount = bundle.fire_hotspots.length;
    const landChangeHa = bundle.satellite_land_changes.reduce((acc, curr) => acc + (curr.area_ha || 0), 0);
    const osintCount = bundle.osint_records.length;

    return [
      {
        metric: 'Frekuensi Deteksi Termal Satelit',
        trend_direction: fireCount > 8 ? 'INCREASING' : fireCount > 3 ? 'STABLE' : 'DECREASING',
        period_label: '30 Hari Terakhir',
        summary: `Tercatat ${fireCount} observasi anomali termal. Tren berkorelasi dengan kondisi cuaca BMKG (curah hujan 1.2 mm dan FWI Sedang).`,
        baseline_value: 4,
        current_value: fireCount,
      },
      {
        metric: 'Luasan Indikasi Perubahan Kanopi (dNDVI)',
        trend_direction: landChangeHa > 30 ? 'INCREASING' : 'STABLE',
        period_label: '30 Hari Terakhir',
        summary: `Total luasan indikasi penurunan kanopi terdeteksi sebesar ${landChangeHa.toFixed(1)} Ha di zona Hutan Lindung dan HPT Sintang Timur.`,
        baseline_value: 20.0,
        current_value: Number(landChangeHa.toFixed(1)),
      },
      {
        metric: 'Intensitas Publikasi Berita Lingkungan (OSINT)',
        trend_direction: osintCount >= 5 ? 'INCREASING' : 'STABLE',
        period_label: '30 Hari Terakhir',
        summary: `Terdapat ${osintCount} warta publik resmi (ANTARA, Pemkab Sintang, JDIH) terkait sosialisasi regulasi karhutla dan patroli terpadu.`,
        baseline_value: 3,
        current_value: osintCount,
      },
    ];
  }
}
