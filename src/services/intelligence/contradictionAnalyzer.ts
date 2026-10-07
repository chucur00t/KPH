import { EvidenceBundle } from '../../types/intelligenceEngine';

export interface ContradictionFinding {
  is_mixed: boolean;
  topic: string;
  source_a_claim: string;
  source_b_claim: string;
  synthesis_note: string;
}

export class ContradictionAnalyzer {
  public static analyzeContradictions(bundle: EvidenceBundle): ContradictionFinding[] {
    const findings: ContradictionFinding[] = [];

    // Check if there are OSINT fire reports without corresponding high-confidence satellite detections
    const osintFireReports = bundle.osint_events.filter((e) => e.activity_type === 'FIRE_INCIDENT_REPORTED');
    const highConfHotspots = bundle.fire_hotspots.filter((h) => h.confidence === 'high');

    if (osintFireReports.length > 0 && highConfHotspots.length === 0) {
      findings.push({
        is_mixed: true,
        topic: 'Status Verifikasi Fisik Laporan Karhutla',
        source_a_claim: 'Media publik melaporkan peningkatan patroli pencegahan potensi karhutla di Ketungau.',
        source_b_claim: 'Sensor satelit VIIRS/MODIS hanya mencatat deteksi dengan tingkat kepercayaan nominal/rendah tanpa pixel saturasi ekstrem.',
        synthesis_note: 'Bukti bersifat campuran (mixed evidence). Laporan kesiapsiagaan patroli belum tentu menandakan kejadian kebakaran berskala besar di lapangan.',
      });
    }

    return findings;
  }
}
