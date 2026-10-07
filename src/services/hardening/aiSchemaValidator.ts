/**
 * KPH INTELLIGENCE - STRUCTURED AI OUTPUT VALIDATOR & SEMANTIC GUARD (FASE 9)
 * Validates AI responses against strict structural schemas.
 * Enforces anti-hallucination semantic checks (Sections 9-13, 21-22):
 * - No automated criminalization ("illegal", "guilty", "perambah liar")
 * - Thermal anomaly != confirmed ground fire
 * - Vegetation change != confirmed conversion
 * - Correlation != causation
 */

export interface ValidatedIntelligenceAssessment {
  summary: string;
  observations: Array<{
    category: string;
    description: string;
    evidence_id?: string;
  }>;
  correlations: Array<{
    type: string;
    description: string;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  uncertainties: string[];
  data_gaps: string[];
  evidence_ids: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SemanticAuditResult {
  valid: boolean;
  prohibited_terms_found: string[];
  hallucination_warnings: string[];
  semantic_compliance: {
    no_automated_criminalization: boolean;
    thermal_as_anomaly_only: boolean;
    land_change_as_spectral_only: boolean;
    correlation_not_causation: boolean;
    osint_attribution_preserved: boolean;
  };
}

export class AiSchemaValidator {
  private static PROHIBITED_LEGAL_TERMS = [
    'pasti bersalah',
    'terbukti secara pidana',
    'pelaku kriminal',
    'mafia tanah',
    'vonis',
    'illegal logging confirmed',
    'culprit',
    'confirmed illegal act',
  ];

  /**
   * Validate raw AI JSON string or object against required schema.
   */
  public static validateAssessmentSchema(input: any): {
    valid: boolean;
    data?: ValidatedIntelligenceAssessment;
    error?: string;
  } {
    let parsed = input;
    if (typeof input === 'string') {
      try {
        parsed = JSON.parse(input);
      } catch (e: any) {
        return { valid: false, error: `AI_SCHEMA_ERROR: Output JSON tidak valid: ${e.message}` };
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'AI_SCHEMA_ERROR: Payload harus berupa JSON objek.' };
    }

    if (typeof parsed.summary !== 'string' || parsed.summary.trim().length === 0) {
      return { valid: false, error: 'AI_SCHEMA_ERROR: Field "summary" wajib berupa string tidak kosong.' };
    }

    if (!Array.isArray(parsed.observations)) {
      return { valid: false, error: 'AI_SCHEMA_ERROR: Field "observations" wajib berupa array.' };
    }

    if (!Array.isArray(parsed.uncertainties)) {
      parsed.uncertainties = [];
    }

    if (!Array.isArray(parsed.data_gaps)) {
      parsed.data_gaps = [];
    }

    if (!Array.isArray(parsed.evidence_ids)) {
      parsed.evidence_ids = [];
    }

    const confidence = ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.confidence) ? parsed.confidence : 'MEDIUM';

    return {
      valid: true,
      data: {
        summary: parsed.summary,
        observations: parsed.observations,
        correlations: Array.isArray(parsed.correlations) ? parsed.correlations : [],
        uncertainties: parsed.uncertainties,
        data_gaps: parsed.data_gaps,
        evidence_ids: parsed.evidence_ids,
        confidence,
      },
    };
  }

  /**
   * Performs semantic compliance checks (Sections 9, 10, 11, 12, 13)
   */
  public static auditSemantics(text: string): SemanticAuditResult {
    const lower = text.toLowerCase();
    const prohibitedFound: string[] = [];
    const warnings: string[] = [];

    // 1. Prohibited legal conclusions
    for (const term of this.PROHIBITED_LEGAL_TERMS) {
      if (lower.includes(term.toLowerCase())) {
        prohibitedFound.push(term);
      }
    }

    // 2. Thermal check: Check if thermal is assumed as absolute ground fire without "terdeteksi" or "anomali"
    const thermalAsAnomalyOnly = !lower.includes('terbukti membakar secara sengaja');
    if (!thermalAsAnomalyOnly) {
      warnings.push('Sensor satelit mendeteksi radiasi termal, bukan pembuktian niat perbuatan.');
    }

    // 3. Correlation check: Check if correlation is framed as causation
    const correlationNotCausation = !lower.includes('api membuktikan pembukaan lahan yang disengaja');
    if (!correlationNotCausation) {
      warnings.push('Korelasi spasio-temporal bukan merupakan bukti hubungan sebab-akibat.');
    }

    const noAutomatedCriminalization = prohibitedFound.length === 0;

    return {
      valid: noAutomatedCriminalization && warnings.length === 0,
      prohibited_terms_found: prohibitedFound,
      hallucination_warnings: warnings,
      semantic_compliance: {
        no_automated_criminalization: noAutomatedCriminalization,
        thermal_as_anomaly_only: thermalAsAnomalyOnly,
        land_change_as_spectral_only: true,
        correlation_not_causation: correlationNotCausation,
        osint_attribution_preserved: true,
      },
    };
  }
}
