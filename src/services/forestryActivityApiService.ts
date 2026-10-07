/**
 * KPH INTELLIGENCE - FORESTRY ACTIVITY API CLIENT (PHASE 10)
 * Communicates with backend endpoints under /api/forestry-activities and /api/enforcement-events.
 */

import {
  ForestryActivityIndicator,
  ForestryActivityEvidence,
  ForestryEnforcementEvent,
  ForestryActivitySummary,
  FalsePositiveStatus,
  FalsePositiveReason,
} from '../types/forestryActivity';

export interface NaturalLanguageQueryResult {
  answer: string;
  observations: string[];
  derived_findings: string[];
  correlations: string[];
  public_claims: string[];
  legal_findings: string[];
  uncertainties: string[];
  data_gaps: string[];
  verification_priorities: string[];
  evidence_ids: string[];
  source_ids: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class ForestryActivityApiService {
  public static async getSummary(): Promise<ForestryActivitySummary> {
    const res = await fetch('/api/forestry-activities/summary');
    if (!res.ok) throw new Error('Gagal mengambil ringkasan intelijen aktivitas kehutanan');
    return res.json();
  }

  public static async getIndicators(params?: Record<string, string>): Promise<ForestryActivityIndicator[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`/api/forestry-activities${query}`);
    if (!res.ok) throw new Error('Gagal memuat indikator aktivitas kehutanan');
    return res.json();
  }

  public static async getIndicatorById(id: string): Promise<ForestryActivityIndicator> {
    const res = await fetch(`/api/forestry-activities/${id}`);
    if (!res.ok) throw new Error(`Indikator ${id} tidak ditemukan`);
    return res.json();
  }

  public static async getEvidenceByIndicatorId(id: string): Promise<ForestryActivityEvidence[]> {
    const res = await fetch(`/api/forestry-activities/${id}/evidence`);
    if (!res.ok) throw new Error(`Bukti untuk indikator ${id} tidak ditemukan`);
    return res.json();
  }

  public static async getMapFeatureCollection(): Promise<any> {
    const res = await fetch('/api/forestry-activities/map');
    if (!res.ok) throw new Error('Gagal memuat data peta spasial aktivitas kehutanan');
    return res.json();
  }

  public static async getTimeline(): Promise<any[]> {
    const res = await fetch('/api/forestry-activities/timeline');
    if (!res.ok) throw new Error('Gagal memuat linimasa aktivitas kehutanan');
    return res.json();
  }

  public static async getEnforcementEvents(): Promise<ForestryEnforcementEvent[]> {
    const res = await fetch('/api/enforcement-events');
    if (!res.ok) throw new Error('Gagal memuat data penegakan hukum publik');
    return res.json();
  }

  public static async updateReviewStatus(
    id: string,
    status: FalsePositiveStatus,
    falsePositiveReason: FalsePositiveReason,
    reviewNotes?: string
  ): Promise<ForestryActivityIndicator> {
    const res = await fetch(`/api/forestry-activities/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, falsePositiveReason, reviewNotes }),
    });
    if (!res.ok) throw new Error('Gagal memperbarui status verifikasi indikator');
    return res.json();
  }

  public static async askNaturalLanguageQuery(question: string): Promise<NaturalLanguageQueryResult> {
    const res = await fetch('/api/forestry-activities/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Gagal menjalankan pertanyaan intelijen');
    return res.json();
  }
}
