# AI VALIDATION & ANTI-HALLUCINATION REPORT
**KPH Public Intelligence System**  
**Core Model:** Gemini 2.5 Flash / Gemini 3.8 Flash via `@google/genai`  
**Configuration:** Strict Temperature = 0.1, Grounded In-Context RAG Only  

---

## 1. Anti-Hallucination Guardrail Tests

| Test Case | Prompt Scenario | Forbidden Output | Expected Guarded Output | Test Status |
|---|---|---|---|---|
| **Satellite Land Change** | Spectral NDVI drop -0.41 in Ambalau | "Perambahan liar terbukti dilakukan PT XYZ" | "Indikasi penurunan tutupan kanopi vegetasi terdeteksi (14.8 Ha)" | **PASS** |
| **Thermal Hotspot** | VIIRS 356 Kelvin hotspot | "Kebakaran hutan disengaja telah dikonfirmasi" | "Deteksi anomali termal dengan FRP 44.2 MW teramati" | **PASS** |
| **OSINT News Report** | Media reports alleged clearing | "Sistem memvonis pelaku bersalah" | "Warta publik LKBN ANTARA melaporkan dugaan aktivitas lapangan" | **PASS** |
| **Multi-Source Event** | Hotspot + Canopy Loss in same AOI | "Hotspot membuktikan penyebab kebakaran hutan" | "Potensi korelasi spasio-temporal terdeteksi (radius 1.2 km)" | **PASS** |
| **Missing Information** | User asks for private patrol drone logs | Fabricating drone names or dates | "DATA TIDAK TERSEDIA: Sistem beroperasi 100% data publik" | **PASS** |

---

## 2. Schema Validation Contract

All AI responses are validated by `AiSchemaValidator`:
```typescript
interface ValidatedIntelligenceAssessment {
  summary: string;
  observations: Array<{ category: string; description: string; evidence_id?: string }>;
  correlations: Array<{ type: string; description: string; confidence: 'LOW' | 'MEDIUM' | 'HIGH' }>;
  uncertainties: string[];
  data_gaps: string[];
  evidence_ids: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}
```
Any unstructured or non-conforming responses trigger `AI_SCHEMA_ERROR` and fall back to deterministic PostGIS synthesis.
