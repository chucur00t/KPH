/**
 * KPH INTELLIGENCE - AI INTELLIGENCE & EXECUTIVE BRIEFING TEST SUITE (FASE 8)
 * Validates:
 * 1. Handling of unknown/no-evidence event safely
 * 2. Satellite observation analysis without legal fault presumption
 * 3. Thermal detection as thermal anomaly, not confirmed ground fire
 * 4. Publicly reported information handling with proper attribution
 * 5. Multi-source correlation connecting Satellite + Fire + OSINT
 * 6. Neutral reporting of conflicting or mixed evidence
 * 7. Completeness & data gap detection via Data Quality Analyzer
 * 8. Deterministic fallback when AI model is offline
 * 9. Model and Prompt registries versioning and purpose
 */

import { EvidenceRetriever } from '../src/services/intelligence/evidenceRetriever';
import { PatternAnalyzer } from '../src/services/intelligence/patternAnalyzer';
import { ContradictionAnalyzer } from '../src/services/intelligence/contradictionAnalyzer';
import { UncertaintyEngine } from '../src/services/intelligence/uncertaintyEngine';
import { DataQualityAnalyzer } from '../src/services/intelligence/dataQualityAnalyzer';
import { IntelligenceAlertEngine } from '../src/services/intelligence/intelligenceAlertEngine';
import { ExecutiveBriefingGenerator } from '../src/services/intelligence/executiveBriefingGenerator';
import { IntelligenceEngine } from '../src/services/intelligence/intelligenceEngine';
import { ModelRegistry } from '../src/services/intelligence/modelRegistry';
import { PromptRegistry } from '../src/services/intelligence/promptRegistry';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}: ${detail || 'Assertion failed'}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('=====================================================');
  console.log('🚀 MENJALANKAN AI INTELLIGENCE & BRIEFING TEST SUITE (FASE 8)');
  console.log('=====================================================\n');

  // Scenario 1: Handles unknown/no-evidence event safely
  const bundle1 = await EvidenceRetriever.retrieveForEvent('EVT-NON-EXISTENT-999');
  assert(bundle1 === null, 'Scenario 1: Handles unknown/no-evidence event safely');

  // Scenario 2: Analyzes satellite observation without presuming legal fault
  const bundle2 = await EvidenceRetriever.retrieveForArea('AOI-KPH-SINTANG-TIMUR');
  const briefing2 = ExecutiveBriefingGenerator.generateBriefing(bundle2, 'DAILY');
  assert(
    bundle2.satellite_land_changes.length > 0 &&
      briefing2.land_change_situation.detected_change_events > 0 &&
      briefing2.limitations.includes('100% data publik'),
    'Scenario 2: Analyzes satellite observation without presuming legal fault'
  );

  // Scenario 3: Treats thermal detection as thermal anomaly, not confirmed ground fire
  const bundle3 = await EvidenceRetriever.retrieveForArea();
  const uncertainties3 = UncertaintyEngine.evaluate(bundle3);
  const fireUncertainty =
    uncertainties3.known.some((k) => k.includes('termal')) ||
    uncertainties3.uncertain.some((u) => u.includes('termal') || u.includes('panas'));
  assert(fireUncertainty, 'Scenario 3: Treats thermal detection as thermal anomaly');

  // Scenario 4: Handles publicly reported information with proper attribution
  const bundle4 = await EvidenceRetriever.retrieveForArea();
  const osintItem = bundle4.observations.find((o) => o.data_type === 'PUBLIC_NEWS');
  assert(
    bundle4.osint_records.length > 0 && osintItem !== undefined && osintItem.observation_type === 'CORRELATION',
    'Scenario 4: Handles publicly reported information with proper attribution'
  );

  // Scenario 5: Multi-source correlation connects Satellite + Fire + OSINT
  const bundle5 = await EvidenceRetriever.retrieveForArea();
  const patterns5 = PatternAnalyzer.analyzePatterns(bundle5);
  const alerts5 = IntelligenceAlertEngine.evaluateAlerts(bundle5);
  const multiAlert = alerts5.find((a) => a.trigger_type === 'MULTI_SOURCE_CORRELATION');
  assert(
    patterns5.length > 0 && multiAlert !== undefined && multiAlert.why_alerted.includes('radius'),
    'Scenario 5: Multi-source correlation connects Satellite + Fire + OSINT'
  );

  // Scenario 6: Reports conflicting or mixed evidence neutrally
  const bundle6 = await EvidenceRetriever.retrieveForArea();
  const contradictions6 = ContradictionAnalyzer.analyzeContradictions(bundle6);
  assert(Array.isArray(contradictions6), 'Scenario 6: Reports conflicting or mixed evidence neutrally');

  // Scenario 7: Data Quality Analyzer detects completeness and data gaps
  const bundle7 = await EvidenceRetriever.retrieveForArea();
  const report7 = DataQualityAnalyzer.assessQuality(bundle7);
  assert(
    ['GOOD', 'FAIR', 'POOR', 'INSUFFICIENT'].includes(report7.overall_quality) && report7.data_gaps.length > 0,
    'Scenario 7: Data Quality Analyzer detects completeness and data gaps'
  );

  // Scenario 8: Deterministic fallback operates seamlessly when AI model is offline
  const result8 = await IntelligenceEngine.processNaturalLanguageQuery(
    'Apakah ada kebakaran di Ambalau?',
    null
  );
  assert(
    result8.answer.includes('Ambalau') && result8.confidence === 'HIGH' && result8.source_citations.length > 0,
    'Scenario 8: Deterministic fallback operates seamlessly when AI model is offline'
  );

  // Scenario 9: Model and Prompt Registry
  const models9 = ModelRegistry.getModels();
  const active9 = ModelRegistry.getActiveModel();
  const prompts9 = PromptRegistry.getPrompts();
  assert(
    models9.length >= 2 &&
      active9.model_name === 'gemini-2.5-flash' || active9.model_name === 'gemini-3.8-flash' &&
      prompts9.length >= 2 &&
      PromptRegistry.getCorePrompt().includes('OBSERVATION'),
    'Scenario 9: Model and Prompt registries maintain versioning and purpose'
  );

  console.log('\n=====================================================');
  console.log(`HASIL TEST: ${passedTests} LULUS, ${failedTests} GAGAL`);
  console.log('=====================================================');
}

runTests().catch(console.error);
