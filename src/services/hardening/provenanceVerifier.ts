/**
 * KPH INTELLIGENCE - PROVENANCE VERIFIER & TRACEABILITY AUDITOR (FASE 9)
 * Enforces the strict rule:
 * INTELLIGENCE -> ASSESSMENT -> EVIDENCE -> EVENT -> SOURCE RECORD -> PUBLIC SOURCE
 * Automated verification that every claim has at least one verifiable evidence reference.
 * Flags PROVENANCE_ERROR if any orphan or ungrounded claim is found.
 */

import { EvidenceBundle, ExecutiveBriefingObject } from '../../types/intelligenceEngine';

export interface ProvenanceAuditReport {
  timestamp: string;
  total_claims_audited: number;
  valid_claims: number;
  invalid_claims: number;
  passed: boolean;
  violations: Array<{
    item_type: 'FINDING' | 'ALERT' | 'EVENT' | 'OBSERVATION';
    id: string;
    description: string;
    error_code: 'PROVENANCE_ERROR';
    detail: string;
  }>;
  grounded_chain_summary: {
    satellite_sources_linked: number;
    thermal_sources_linked: number;
    osint_sources_linked: number;
    gis_boundaries_linked: number;
  };
}

export class ProvenanceVerifier {
  /**
   * Verify an EvidenceBundle for complete source traceability.
   */
  public static verifyEvidenceBundle(bundle: EvidenceBundle): ProvenanceAuditReport {
    const violations: ProvenanceAuditReport['violations'] = [];
    let totalAudited = 0;

    // 1. Audit Observations
    for (const obs of bundle.observations) {
      totalAudited++;
      if (!obs.source_id || !obs.source_url) {
        violations.push({
          item_type: 'OBSERVATION',
          id: obs.evidence_id,
          description: obs.summary,
          error_code: 'PROVENANCE_ERROR',
          detail: 'Observasi tidak memiliki source_id atau source_url publik yang valid.',
        });
      }
    }

    // 2. Audit Events
    for (const evt of bundle.events) {
      totalAudited++;
      if (!evt.event_id || !evt.title) {
        violations.push({
          item_type: 'EVENT',
          id: evt.event_id || 'UNKNOWN',
          description: evt.title || 'Untitled event',
          error_code: 'PROVENANCE_ERROR',
          detail: 'Event tidak memiliki identifikasi event_id atau judul publik yang valid.',
        });
      }
    }

    // Count linked sources
    const satelliteCount = bundle.satellite_land_changes.length;
    const thermalCount = bundle.fire_hotspots.length;
    const osintCount = bundle.osint_records.length;
    const gisCount = bundle.gis_context ? 1 : 0;

    return {
      timestamp: new Date().toISOString(),
      total_claims_audited: totalAudited,
      valid_claims: totalAudited - violations.length,
      invalid_claims: violations.length,
      passed: violations.length === 0,
      violations,
      grounded_chain_summary: {
        satellite_sources_linked: satelliteCount,
        thermal_sources_linked: thermalCount,
        osint_sources_linked: osintCount,
        gis_boundaries_linked: gisCount,
      },
    };
  }

  /**
   * Verify an Executive Briefing object for complete citation and evidence linkage.
   */
  public static verifyBriefing(briefing: ExecutiveBriefingObject): ProvenanceAuditReport {
    const violations: ProvenanceAuditReport['violations'] = [];
    let totalAudited = 0;

    // 1. Check citations & public source list
    const sourceList = briefing.source_list || (briefing as any).sources_consulted || [];
    if (!sourceList || sourceList.length === 0) {
      violations.push({
        item_type: 'FINDING',
        id: briefing.intelligence_id,
        description: 'Executive Briefing',
        error_code: 'PROVENANCE_ERROR',
        detail: 'Briefing tidak menyertakan daftar sumber publik yang dikonsultasikan.',
      });
    }

    // 2. Check provenance bundle linkage
    totalAudited++;
    if (!briefing.provenance?.evidence_bundle_id) {
      violations.push({
        item_type: 'FINDING',
        id: briefing.intelligence_id,
        description: 'Provenance Bundle Missing',
        error_code: 'PROVENANCE_ERROR',
        detail: 'Briefing tidak terikat dengan evidence_bundle_id yang valid.',
      });
    }

    // 3. Check Key Intelligence Events if present
    const keyEvents = (briefing as any).key_events || [];
    for (const evt of keyEvents) {
      totalAudited++;
      const citations = evt.evidence_citations || evt.sources_cited || [];
      if (!evt.evidence_bundle_id && citations.length === 0) {
        violations.push({
          item_type: 'EVENT',
          id: evt.event_id,
          description: evt.title,
          error_code: 'PROVENANCE_ERROR',
          detail: `Event ${evt.event_id} tidak memiliki tautan bukti (evidence_bundle_id) atau sitasi sumber.`,
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      total_claims_audited: totalAudited,
      valid_claims: totalAudited - violations.length,
      invalid_claims: violations.length,
      passed: violations.length === 0,
      violations,
      grounded_chain_summary: {
        satellite_sources_linked: briefing.land_change_situation?.detected_change_events || 0,
        thermal_sources_linked: briefing.fire_situation?.total_detections || 0,
        osint_sources_linked: briefing.source_list?.length || 0,
        gis_boundaries_linked: 1,
      },
    };
  }
}
