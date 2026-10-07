/**
 * KPH INTELLIGENCE - FORESTRY NEWS API CLIENT (PHASE 10A)
 * Calls backend endpoints under /api/forestry-monitoring.
 */

import {
  ForestryNewsRecord,
  ForestryNewsClaim,
  ForestryNewsEvent,
  ForestryNewsSource,
  ForestryNewsSummary,
} from '../types/forestryNews';

export interface ForestryNewsNlQueryResult {
  summary: string;
  reported_activity: string[];
  event_date: string | null;
  publication_date: string | null;
  location: Record<string, any>;
  entities: Array<{ type: string; name: string }>;
  legal_status: string;
  source_assessment: string;
  correlations: string[];
  uncertainties: string[];
  data_gaps: string[];
  verification_priority: string;
  evidence_ids: string[];
  source_ids: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class ForestryNewsApiService {
  public static async getSummary(): Promise<ForestryNewsSummary> {
    const res = await fetch('/api/forestry-monitoring/summary');
    if (!res.ok) throw new Error('Gagal mengambil ringkasan pemantauan warta kehutanan');
    return res.json();
  }

  public static async getRecords(params?: Record<string, string>): Promise<ForestryNewsRecord[]> {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`/api/forestry-monitoring/reports${q}`);
    if (!res.ok) throw new Error('Gagal memuat catatan warta');
    return res.json();
  }

  public static async getRecordById(id: string): Promise<ForestryNewsRecord> {
    const res = await fetch(`/api/forestry-monitoring/reports/${id}`);
    if (!res.ok) throw new Error(`Warta ${id} tidak ditemukan`);
    return res.json();
  }

  public static async getEvents(params?: Record<string, string>): Promise<ForestryNewsEvent[]> {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`/api/forestry-monitoring/events${q}`);
    if (!res.ok) throw new Error('Gagal memuat kejadian warta');
    return res.json();
  }

  public static async getClaimsByRecordId(recordId: string): Promise<ForestryNewsClaim[]> {
    const res = await fetch(`/api/forestry-monitoring/${recordId}/evidence`);
    if (!res.ok) throw new Error('Gagal memuat kutipan klaim');
    return res.json();
  }

  public static async getTimeline(): Promise<any[]> {
    const res = await fetch('/api/forestry-monitoring/timeline');
    if (!res.ok) throw new Error('Gagal memuat linimasa warta');
    return res.json();
  }

  public static async getMapFeatureCollection(): Promise<any> {
    const res = await fetch('/api/forestry-monitoring/map');
    if (!res.ok) throw new Error('Gagal memuat data peta warta');
    return res.json();
  }

  public static async getSourceHealth(): Promise<any[]> {
    const res = await fetch('/api/forestry-monitoring/source-health');
    if (!res.ok) throw new Error('Gagal memuat status kesehatan sumber');
    return res.json();
  }

  public static async getKeywords(): Promise<{ keywords: Record<string, string[]>; monitoringArea: string }> {
    const res = await fetch('/api/forestry-monitoring/keywords');
    if (!res.ok) throw new Error('Gagal memuat konfigurasi kata kunci');
    return res.json();
  }

  public static async updateKeywords(category: string, keywords: string[]): Promise<any> {
    const res = await fetch('/api/forestry-monitoring/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, keywords }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan kata kunci');
    return res.json();
  }

  public static async askNlQuery(question: string): Promise<ForestryNewsNlQueryResult> {
    const res = await fetch('/api/forestry-monitoring/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Gagal memproses tanya jawab intelijen warta');
    return res.json();
  }
}
