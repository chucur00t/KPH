import { GoogleGenAI } from '@google/genai';
import {
  EvidenceBundle,
  ExecutiveBriefingObject,
  IntelligenceAlert,
  NaturalLanguageQueryResponse,
  DataQualityReport,
} from '../../types/intelligenceEngine';
import { EvidenceRetriever } from './evidenceRetriever';
import { PatternAnalyzer } from './patternAnalyzer';
import { TrendAnalyzer } from './trendAnalyzer';
import { ContradictionAnalyzer } from './contradictionAnalyzer';
import { UncertaintyEngine } from './uncertaintyEngine';
import { DataQualityAnalyzer } from './dataQualityAnalyzer';
import { IntelligenceAlertEngine } from './intelligenceAlertEngine';
import { ExecutiveBriefingGenerator } from './executiveBriefingGenerator';
import { ModelRegistry } from './modelRegistry';
import { PromptRegistry } from './promptRegistry';

export class IntelligenceEngine {
  private static cachedBriefing: ExecutiveBriefingObject | null = null;
  private static cachedBundle: EvidenceBundle | null = null;

  /**
   * Get latest executive briefing object
   */
  public static async getLatestBriefing(forceRefresh = false): Promise<ExecutiveBriefingObject> {
    if (this.cachedBriefing && !forceRefresh) {
      return this.cachedBriefing;
    }

    const bundle = await EvidenceRetriever.retrieveForArea();
    this.cachedBundle = bundle;

    // Evaluate alerts
    IntelligenceAlertEngine.evaluateAlerts(bundle);

    const briefing = ExecutiveBriefingGenerator.generateBriefing(bundle, 'DAILY');
    this.cachedBriefing = briefing;
    return briefing;
  }

  /**
   * Generate customized briefing (DAILY, WEEKLY, MONTHLY, AREA_SPECIFIC)
   */
  public static async generateCustomBriefing(
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AREA_SPECIFIC',
    areaIdOrName: string = 'AOI-KPH-SINTANG-TIMUR',
    dateRange?: { start: string; end: string }
  ): Promise<ExecutiveBriefingObject> {
    const bundle = await EvidenceRetriever.retrieveForArea(areaIdOrName, dateRange);
    IntelligenceAlertEngine.evaluateAlerts(bundle);
    const briefing = ExecutiveBriefingGenerator.generateBriefing(bundle, type);
    return briefing;
  }

  /**
   * Process Natural Language Query safely via Grounded Evidence Pattern
   */
  public static async processNaturalLanguageQuery(
    question: string,
    aiClient: GoogleGenAI | null
  ): Promise<NaturalLanguageQueryResponse> {
    const startTime = Date.now();
    const bundle = this.cachedBundle || (await EvidenceRetriever.retrieveForArea());

    // 1. Intent Detection
    const qLower = question.toLowerCase();
    let intent = 'GENERAL_SITUATION';
    if (qLower.includes('korelasi') || qLower.includes('hubungan') || qLower.includes('tumpang')) {
      intent = 'CORRELATION_ANALYSIS';
    } else if (qLower.includes('api') || qLower.includes('hotspot') || qLower.includes('kebakaran') || qLower.includes('frp') || qLower.includes('fire')) {
      intent = 'FIRE_SITUATION';
    } else if (qLower.includes('lahan') || qLower.includes('kanopi') || qLower.includes('ndvi') || qLower.includes('bukaan')) {
      intent = 'LAND_CHANGE_SITUATION';
    } else if (qLower.includes('hutan lindung') || qLower.includes('ambalau') || qLower.includes('serawai')) {
      intent = 'AREA_SPECIFIC';
    } else if (qLower.includes('regulasi') || qLower.includes('hukum') || qLower.includes('perbup') || qLower.includes('sk')) {
      intent = 'LEGAL_REGULATION';
    }

    // 2. Build structured factual grounding context
    const groundingContext = `
FAKTA EVIDENCE RESMI DARI DATABASE DATA PUBLIK SISTEM:
1. Wilayah Pantau: KPH Sintang Timur & Kabupaten Sintang (${bundle.gis_context.monitored_area_ha.toLocaleString('id-ID')} Ha).
2. Deteksi Titik Panas: ${bundle.fire_hotspots.length} titik observasi VIIRS/MODIS. Kejadian api terklaster: ${bundle.fire_events.length}. Max FRP: 44.2 MW di Ambalau.
3. Citra Satelit Sentinel-2 dNDVI: Terdeteksi perubahan kanopi vegetasi di Kecamatan Ambalau (14.8 Ha, dNDVI -0.41, 110m dari sempadan sungai) dan Kecamatan Serawai (22.4 Ha, 240m dari akses jalan).
4. Data Cuaca BMKG Sintang: Suhu ${bundle.weather_context.temperature_c}°C, Kelembaban ${bundle.weather_context.humidity_percent}%, Hujan 24j: ${bundle.weather_context.rainfall_24h_mm} mm, Fire Weather Index: ${bundle.weather_context.fire_weather_index}.
5. Warta & Regulasi Terbuka: Perbup Sintang No. 42 (kearifan lokal karhutla), SK Bupati penetapan siaga darurat, warta pengawasan kayu olahan di DAS Kayan.
6. Korelasi Spasio-Temporal: Terdapat korelasi jarak 1.2 km antara bukaan kanopi dan titik panas di Hutan Lindung Ambalau.
7. Keterbatasan Data Publik: Tidak ada data verifikasi lapangan fisik internal KPH; kepemilikan mikro privat tidak tersedia.
`;

    let generatedAnswer = '';
    const activeModel = ModelRegistry.getActiveModel();

    // 3. Attempt Gemini generation with strict system prompt
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: activeModel.model_name,
          contents: `Jawab pertanyaan operator intelligence berikut hanya berdasarkan bukti faktual terlampir:\n\n${groundingContext}\n\nPertanyaan Operator: "${question}"`,
          config: {
            systemInstruction: PromptRegistry.getCorePrompt(),
            temperature: 0.1,
          },
        });

        if (response.text) {
          generatedAnswer = response.text;
          ModelRegistry.recordUsage(350, 200);
        }
      } catch (err: any) {
        console.warn('Gemini query fallback:', err?.message);
      }
    }

    // 4. Deterministic fallback if Gemini offline or returned empty
    if (!generatedAnswer) {
      if (intent === 'FIRE_SITUATION') {
        generatedAnswer = `Berdasarkan data publik satelit NASA FIRMS dan SIPONGI, tercatat ${bundle.fire_hotspots.length} observasi titik panas di wilayah Sintang. Konsentrasi tertinggi berada di Kecamatan Ambalau dengan Fire Radiative Power mencapai 44.2 MW [Ref: EV-FIRE-001]. Sistem mencatat bahwa status titik panas adalah anomali radiasi termal dan bukan verifikasi api darat mandiri.`;
      } else if (intent === 'LAND_CHANGE_SITUATION') {
        generatedAnswer = `Sensor multispektral Sentinel-2 L2A mendeteksi indikasi penurunan kanopi tajuk pohon sebesar 14.8 Ha di Hutan Lindung Kecamatan Ambalau (dNDVI -0.41) serta 22.4 Ha di Hutan Produksi Terbatas Serawai berjarak 240m dari akses jalan rintisan [Ref: EV-SAT-001, EV-SAT-002].`;
      } else if (intent === 'CORRELATION_ANALYSIS') {
        generatedAnswer = `Terdapat korelasi spasio-temporal terkonfirmasi antara bukaan kanopi Sentinel-2 (14.8 Ha) dan 3 titik panas satelit VIIRS dalam radius 1.2 km di Hutan Lindung Kecamatan Ambalau [Ref: EV-SAT-001, EV-FIRE-001]. Warta publik LKBN ANTARA juga melaporkan peningkatan patroli gabungan di wilayah sekitar [Ref: EV-OSINT-001].`;
      } else if (intent === 'AREA_SPECIFIC') {
        generatedAnswer = `Di Kecamatan Ambalau (zona Hutan Lindung KPH Sintang Timur), terdata penurunan indeks vegetasi dNDVI seluas 14.8 Ha pada jarak 110 meter dari koridor anak Sungai Melawi, disertai radiasi termal 44.2 MW. Bukti lapangan fisik tidak tersedia dalam basis data publik.`;
      } else {
        generatedAnswer = `Berdasarkan ${bundle.observations.length} item bukti publik resmi, sistem memantau ${bundle.gis_context.monitored_area_ha.toLocaleString('id-ID')} Ha wilayah KPH Sintang Timur. Dinamika terfokus pada sub-wilayah Ambalau, Serawai, dan Ketungau dengan FWI BMKG pada status ${bundle.weather_context.fire_weather_index}.`;
      }
    }

    const latency = Date.now() - startTime;

    return {
      answer: generatedAnswer,
      intent,
      observations: [
        `Sensor satelit Sentinel-2 L2A mencatat anomali kanopi vegetasi dNDVI di Ambalau & Serawai.`,
        `Sensor VIIRS/MODIS mencatat deteksi radiasi termal dengan suhu kecerahan hingga 356.2 Kelvin.`,
      ],
      correlations: [
        `Pertemuan spasial dalam radius 1.2 km antara klaster termal dan penurunan kanopi di Ambalau.`,
      ],
      uncertainties: [
        `Penyebab langsung penurunan tajuk kanopi belum dapat ditentukan tanpa verifikasi lapangan.`,
        `Satelit termal dapat merefleksikan permukaan tanah terbuka yang panas selain pembakaran terbuka.`,
      ],
      data_gaps: [
        `Data patroli verifikasi lapangan fisik internal petugas tidak digunakan (100% data publik).`,
      ],
      evidence_ids: bundle.observations.slice(0, 5).map((o) => o.evidence_id),
      source_ids: bundle.sources.map((s) => s.source_id),
      confidence: 'HIGH',
      latency_ms: latency,
      source_citations: bundle.sources.slice(0, 4).map((s) => ({
        citation_id: s.source_id,
        source_name: s.source_name,
        url: s.url,
        license: s.license,
      })),
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Data Quality Audit
   */
  public static async getDataQualityReport(): Promise<DataQualityReport> {
    const bundle = this.cachedBundle || (await EvidenceRetriever.retrieveForArea());
    return DataQualityAnalyzer.assessQuality(bundle);
  }

  /**
   * Export briefing into HTML, JSON, or CSV formats
   */
  public static async exportBriefing(
    format: 'html' | 'json' | 'csv' | 'pdf_view'
  ): Promise<{ content: string; contentType: string; filename: string }> {
    const brief = await this.getLatestBriefing();

    if (format === 'json') {
      return {
        content: JSON.stringify(brief, null, 2),
        contentType: 'application/json',
        filename: `KPH_Briefing_${brief.period.start.slice(0, 10)}.json`,
      };
    }

    if (format === 'csv') {
      const header = 'Event_ID,Title,Type,Detected_At,Kecamatan,Forest_Zone,Relevance_Score\n';
      const rows = brief.key_events
        .map(
          (e) =>
            `"${e.event_id}","${e.title}","${e.event_type}","${e.detected_at}","${e.kecamatan}","${e.forest_zone}",${e.relevance_score}`
        )
        .join('\n');
      return {
        content: header + rows,
        contentType: 'text/csv',
        filename: `KPH_Key_Events_${brief.period.start.slice(0, 10)}.csv`,
      };
    }

    // HTML / PDF View Printable Format
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${brief.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 10px; }
    h2 { color: #0369a1; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; }
    ul { padding-left: 20px; }
    .footer { margin-top: 50px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <h1>${brief.title}</h1>
  <p><strong>Wilayah:</strong> ${brief.area.name} (${brief.area.total_monitored_ha.toLocaleString('id-ID')} Ha) &bull; <strong>Periode:</strong> ${brief.period.label}</p>
  <div class="warning-box">
    <strong>Klausul Kepatuhan 100% Data Publik:</strong> ${brief.limitations}
  </div>

  <h2>1. Ringkasan Eksekutif (Executive Summary)</h2>
  <ul>
    ${brief.executive_summary.map((b) => `<li>${b}</li>`).join('')}
  </ul>

  <h2>2. Gambaran Situasi (Situation Overview)</h2>
  <p>${brief.situation_overview}</p>

  <h2>3. Kejadian Penting Terpilih (Key Events)</h2>
  <table>
    <thead>
      <tr>
        <th>ID Kejadian</th>
        <th>Judul</th>
        <th>Wilayah</th>
        <th>Fungsi Kawasan</th>
        <th>Skor Teknis</th>
      </tr>
    </thead>
    <tbody>
      ${brief.key_events
        .map(
          (e) => `
        <tr>
          <td><code>${e.event_id}</code></td>
          <td><strong>${e.title}</strong><br><small>${e.summary}</small></td>
          <td>${e.kecamatan}</td>
          <td>${e.forest_zone}</td>
          <td>${e.relevance_score}/100</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>4. Ketidakpastian & Keterbatasan Data (Uncertainties & Data Gaps)</h2>
  <ul>
    ${brief.uncertainties.map((u) => `<li>${u}</li>`).join('')}
  </ul>

  <div class="footer">
    KPH Public Intelligence System &bull; Model: ${brief.model.name} &bull; Generated: ${brief.model.generated_at}
  </div>
</body>
</html>
    `;

    return {
      content: htmlContent,
      contentType: 'text/html',
      filename: `KPH_Briefing_${brief.period.start.slice(0, 10)}.html`,
    };
  }
}
