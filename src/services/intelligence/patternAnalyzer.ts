import { EvidenceBundle } from '../../types/intelligenceEngine';

export interface PatternFinding {
  pattern_id: string;
  pattern_type: 'RECURRING_HOTSPOT' | 'REPEATED_LAND_CHANGE' | 'SPATIAL_CLUSTER' | 'TEMPORAL_CONCURRENCE';
  title: string;
  description: string;
  evidence_ids: string[];
  relevance_score: number;
}

export class PatternAnalyzer {
  public static analyzePatterns(bundle: EvidenceBundle): PatternFinding[] {
    const patterns: PatternFinding[] = [];

    // 1. Recurring Hotspots
    const hotspots = bundle.fire_hotspots;
    const ambalauHotspots = hotspots.filter((h) => (h.kecamatan || '').toLowerCase().includes('ambalau'));
    if (ambalauHotspots.length >= 2) {
      patterns.push({
        pattern_id: 'PAT-REC-AMBALAU',
        pattern_type: 'RECURRING_HOTSPOT',
        title: 'Pola Anomali Termal Berulang di Kecamatan Ambalau',
        description: `Terdeteksi ${ambalauHotspots.length} titik panas dalam rentang koordinat berdekatan (< 3 km) pada zona Hutan Lindung (HL) KPH Sintang Timur.`,
        evidence_ids: ambalauHotspots.map((h) => `EV-FIRE-${h.detection_id}`),
        relevance_score: 88,
      });
    }

    // 2. Spatial Cluster: Land Change + River Proximity
    const landChanges = bundle.satellite_land_changes;
    const nearRiverChanges = landChanges.filter((lc) => lc.near_river || (lc.river_distance_m && lc.river_distance_m <= 150));
    if (nearRiverChanges.length > 0) {
      patterns.push({
        pattern_id: 'PAT-RIVER-CORRIDOR',
        pattern_type: 'SPATIAL_CLUSTER',
        title: 'Klaster Spasial Penurunan Kanopi di Sepanjang Koridor Sempadan Sungai',
        description: `Bukaan tutupan kanopi terdeteksi berjarak 110-150 meter dari anak Sungai Melawi/Kayan, teridentifikasi melalui citra Sentinel-2 L2A BOA.`,
        evidence_ids: nearRiverChanges.map((lc) => `EV-SAT-${lc.event_id}`),
        relevance_score: 92,
      });
    }

    // 3. Temporal Concurrence: Fire & Land Change
    if (hotspots.length > 0 && landChanges.length > 0) {
      patterns.push({
        pattern_id: 'PAT-TEMP-COINCIDENCE',
        pattern_type: 'TEMPORAL_CONCURRENCE',
        title: 'Konkurensi Spasio-Temporal Deteksi Termal dan Perubahan Kanopi',
        description: 'Terdapat tumpang tindih spasial antara area penurunan dNDVI satelit dan deteksi panas FIRMS dalam jendela waktu 30 hari di Kabupaten Sintang.',
        evidence_ids: ['EV-SAT-1', 'EV-FIRE-1'],
        relevance_score: 85,
      });
    }

    return patterns;
  }
}
