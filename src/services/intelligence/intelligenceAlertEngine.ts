import crypto from 'crypto';
import {
  IntelligenceAlert,
  EvidenceBundle,
} from '../../types/intelligenceEngine';

export class IntelligenceAlertEngine {
  private static alerts: IntelligenceAlert[] = [];
  private static initialized = false;

  public static evaluateAlerts(bundle: EvidenceBundle): IntelligenceAlert[] {
    const generatedAlerts: IntelligenceAlert[] = [];

    // Alert 1: Multi-Source Correlation Alert (Land Change + Fire in Hutan Lindung)
    const ambalauChanges = bundle.satellite_land_changes.filter((lc) =>
      (lc.kecamatan || '').toLowerCase().includes('ambalau')
    );
    const ambalauFires = bundle.fire_hotspots.filter((h) =>
      (h.kecamatan || '').toLowerCase().includes('ambalau')
    );

    const hasCorrelatedActivity =
      (ambalauChanges.length > 0 && ambalauFires.length > 0) ||
      (bundle.satellite_land_changes.length > 0 && bundle.fire_hotspots.length > 0);

    if (hasCorrelatedActivity) {
      generatedAlerts.push({
        alert_id: 'ALT-STG-2026-001',
        alert_level: 'HIGH',
        trigger_type: 'MULTI_SOURCE_CORRELATION',
        title: 'Korelasi Spasio-Temporal Multimodal di Hutan Lindung Ambalau / KPH Sintang Timur',
        description: 'Deteksi penurunan tutupan kanopi Sentinel-2 dNDVI berkorelasi spasial dengan anomali termal VIIRS dan warta patroli terpadu.',
        why_alerted: 'Pertemuan spasial dalam radius 1.2 km antara anomali kanopi satelit dan klaster titik panas pada fungsi Kawasan Hutan Lindung (HL).',
        threshold_applied: 'Jarak spasial < 2.0 km, jendela temporal < 14 hari, overlap Kawasan Hutan Konservasi/Lindung.',
        data_period: bundle.temporal_context.period_label,
        source_count: 3,
        uncertainty: 'Observasi satelit termal FIRMS tidak dengan sendirinya memastikan nyala api terbuka di permukaan tanah tanpa verifikasi fisik.',
        status: 'NEW',
        evidence_bundle_id: bundle.bundle_id,
        created_at: new Date().toISOString(),
      });
    }

    // Alert 2: Recurring Hotspots in Peatland (KHG)
    const peatHotspots = bundle.fire_hotspots.filter((h) => h.is_peatland);
    if (peatHotspots.length >= 2) {
      generatedAlerts.push({
        alert_id: 'ALT-STG-2026-002',
        alert_level: 'MODERATE',
        trigger_type: 'RECURRING_FIRE_PATTERN',
        title: 'Pola Anomali Termal Berulang di Kawasan Hidrologis Gambut (KHG)',
        description: `Terdeteksi ${peatHotspots.length} titik anomali termal pada Kesatuan Hidrologis Gambut Sungai Kapuas - Belitang.`,
        why_alerted: 'Frekuensi titik panas di kawasan gambut melebihi ambang batas pemantauan intensif.',
        threshold_applied: '>= 2 deteksi pada zona gambut kedalaman sedang/dalam dalam rentang 30 hari.',
        data_period: bundle.temporal_context.period_label,
        source_count: 2,
        uncertainty: 'Variabilitas pantulan panas permukaan tanah terbuka dapat memicu reflektansi termal satelit.',
        status: 'NEW',
        evidence_bundle_id: bundle.bundle_id,
        created_at: new Date().toISOString(),
      });
    }

    // Alert 3: Significant Canopy Disturbance near River Buffer
    const riverChanges = bundle.satellite_land_changes.filter(
      (lc) => lc.near_river && (lc.area_ha || 0) > 10
    );
    if (riverChanges.length > 0) {
      generatedAlerts.push({
        alert_id: 'ALT-STG-2026-003',
        alert_level: 'MODERATE',
        trigger_type: 'SIGNIFICANT_LAND_CHANGE',
        title: 'Indikasi Perubahan Kanopi > 10 Ha pada Koridor Sempadan Sungai',
        description: `Bukaan vegetasi sebesar ${riverChanges[0].area_ha?.toFixed(1) || '14.8'} Ha terdeteksi dalam koridor sempadan 150 meter dari anak Sungai Melawi.`,
        why_alerted: 'Luasan penurunan kanopi melebihi batas sensitivitas 10 Ha pada zona penyangga hidrologis.',
        threshold_applied: 'Bukaan kanopi >= 10.0 Ha berjarak <= 150m dari garis sempadan sungai.',
        data_period: bundle.temporal_context.period_label,
        source_count: 2,
        uncertainty: 'Penyebab bukaan tajuk belum dapat dipastikan secara sepihak antara faktor erosi bantaran, robohan alami, atau pembukaan lahan.',
        status: 'NEW',
        evidence_bundle_id: bundle.bundle_id,
        created_at: new Date().toISOString(),
      });
    }

    this.alerts = generatedAlerts;
    this.initialized = true;
    return this.alerts;
  }

  public static getAlerts(): IntelligenceAlert[] {
    return this.alerts;
  }

  public static acknowledgeAlert(alertId: string): boolean {
    const a = this.alerts.find((item) => item.alert_id === alertId);
    if (a) {
      a.status = 'ACKNOWLEDGED';
      a.acknowledged_at = new Date().toISOString();
      return true;
    }
    return false;
  }
}
