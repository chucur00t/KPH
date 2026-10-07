/**
 * KPH INTELLIGENCE - MULTI-SOURCE FORESTRY ACTIVITY CORRELATION SERVICE (PHASE 10)
 * Correlates:
 * SATELLITE (Sentinel-2 dNDVI) + FIRE (FIRMS VIIRS) + GIS (Kawasan Hutan/Gambut) +
 * OSINT (News Reports) + PUBLIC AUTHORIZATION + PUBLIC ENFORCEMENT.
 *
 * CRITICAL PRINCIPLE:
 * Correlated multi-source activity is NEVER automatically "Confirmed Illegal Activity".
 * It is labeled MULTI_SOURCE_CORRELATED_ACTIVITY requiring verification.
 */

import {
  ForestryActivityIndicator,
  ForestryActivityEvidence,
  ForestryEnforcementEvent,
} from '../../types/forestryActivity';
import { ForestryActivityScoringEngine } from './forestryActivityScoringEngine';
import { ForestryAuthorizationCorrelationService } from './forestryAuthorizationCorrelationService';

export class ForestryActivityCorrelationService {
  /**
   * Enriches an indicator with multi-source evidence and correlation checks.
   */
  public static enrichIndicator(
    indicator: ForestryActivityIndicator,
    allEvidence: ForestryActivityEvidence[],
    enforcementEvents: ForestryEnforcementEvent[]
  ): ForestryActivityIndicator {
    // 1. Link matching evidence
    const matchingEvidence = allEvidence.filter(
      (ev) => ev.indicatorId === indicator.indicatorId
    );
    indicator.evidenceList = matchingEvidence;
    indicator.evidenceCount = matchingEvidence.length;

    // Count distinct sources
    const distinctSources = new Set(matchingEvidence.map((ev) => ev.sourceId));
    indicator.sourceCount = Math.max(indicator.sourceCount, distinctSources.size);

    // 2. Authorization spatial analysis
    const authEval = ForestryAuthorizationCorrelationService.evaluateLocation(indicator.centroid);
    indicator.authorizationStatus = authEval.status;
    if (authEval.matchingRecord) {
      indicator.authorizationReference = authEval.matchingRecord.decreeNumber;
      indicator.concessionName = authEval.matchingRecord.holderName;
      indicator.concessionOverlap = true;
    }
    indicator.authorizationNotes = authEval.notes;

    // 3. Enforcement event correlation check
    const nearbyEnforcement = enforcementEvents.find((enf) => {
      const [lon1, lat1] = indicator.centroid;
      const [lon2, lat2] = enf.centroid;
      const dKm = Math.hypot((lon1 - lon2) * 111, (lat1 - lat2) * 111);
      return dKm <= 5.0; // within 5km radius
    });

    if (nearbyEnforcement) {
      indicator.legalStatus = 'PUBLIC_ENFORCEMENT_REPORTED';
      indicator.legalStatusReason = `Terdapat laporan penegakan hukum publik resmi di sekitar lokasi: ${nearbyEnforcement.activityType} (${nearbyEnforcement.caseReference}) oleh ${nearbyEnforcement.agency}.`;
      indicator.status = 'CONFIRMED_BY_PUBLIC_SOURCE';
    }

    // 4. Deterministic score calculation
    indicator.activityScore = ForestryActivityScoringEngine.calculateActivityScore(indicator);
    indicator.priority = ForestryActivityScoringEngine.determinePriority(indicator.activityScore);
    indicator.verificationPriority = ForestryActivityScoringEngine.determineVerificationPriority(
      indicator.activityScore,
      indicator
    );
    indicator.evidenceStrength = ForestryActivityScoringEngine.evaluateEvidenceStrength(
      indicator.sourceCount,
      indicator.evidenceCount
    );

    return indicator;
  }
}
