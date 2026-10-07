/**
 * KPH INTELLIGENCE - FORESTRY ACTIVITY DETERMINISTIC SCORING ENGINE (PHASE 10)
 * Computes activity_score, priority, and verification_priority deterministically.
 * AI models are strictly forbidden from calculating numeric scores or legal verdicts.
 */

import {
  ForestryActivityIndicator,
  ActivityPriority,
  VerificationPriority,
  ActivityTemporalPattern,
  ForestryActivityType,
} from '../../types/forestryActivity';

export interface ScoringWeights {
  disturbanceWeight: number; // 0.25
  spatialContextWeight: number; // 0.20
  fireCorrelationWeight: number; // 0.15
  roadRiverProximityWeight: number; // 0.15
  osintCorrelationWeight: number; // 0.10
  temporalPatternWeight: number; // 0.10
  sourceQualityWeight: number; // 0.05
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  disturbanceWeight: 0.25,
  spatialContextWeight: 0.20,
  fireCorrelationWeight: 0.15,
  roadRiverProximityWeight: 0.15,
  osintCorrelationWeight: 0.10,
  temporalPatternWeight: 0.10,
  sourceQualityWeight: 0.05,
};

export class ForestryActivityScoringEngine {
  public static readonly VERSION = 'v1.0.0-phase10';

  /**
   * Calculates the composite deterministic activity indicator priority score (0 - 100).
   * Note: This measures intelligence priority & urgency for field verification,
   * NOT probability of a crime.
   */
  public static calculateActivityScore(
    indicator: Partial<ForestryActivityIndicator>,
    weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
  ): number {
    // 1. Disturbance magnitude (area & NDVI drop)
    let disturbanceScore = 0;
    const area = indicator.areaHa || 0;
    if (area >= 20) disturbanceScore = 100;
    else if (area >= 10) disturbanceScore = 80;
    else if (area >= 5) disturbanceScore = 60;
    else disturbanceScore = Math.min(100, area * 12);

    if (indicator.ndviDrop && indicator.ndviDrop <= -0.40) {
      disturbanceScore = Math.min(100, disturbanceScore + 15);
    }

    // 2. Spatial Context (Function: HL > HPT > HP > APL, Peatland bonus)
    let spatialScore = 30;
    if (indicator.forestFunction === 'HL' || indicator.forestFunction === 'KSA') {
      spatialScore = 100;
    } else if (indicator.forestFunction === 'HPT') {
      spatialScore = 75;
    } else if (indicator.forestFunction === 'HP') {
      spatialScore = 60;
    } else if (indicator.forestFunction === 'APL') {
      spatialScore = 35;
    }

    if (indicator.peatlandOverlap) {
      spatialScore = Math.min(100, spatialScore + 20);
    }

    // 3. Fire correlation
    let fireScore = 0;
    if (indicator.fireCorrelation) {
      fireScore = 80;
      if ((indicator.hotspotsCount || 0) >= 3) fireScore = 100;
    }

    // 4. Proximity to road or river (corridors of potential timber/mineral transport)
    let proximityScore = 20;
    const riverDist = indicator.distanceToRiverM ?? 9999;
    const roadDist = indicator.distanceToRoadM ?? 9999;

    if (riverDist <= 150 || roadDist <= 150) {
      proximityScore = 100;
    } else if (riverDist <= 500 || roadDist <= 500) {
      proximityScore = 70;
    } else if (riverDist <= 1000 || roadDist <= 1000) {
      proximityScore = 40;
    }

    // 5. OSINT correlation
    let osintScore = 0;
    if (indicator.osintCorrelation) {
      osintScore = 85;
    }

    // 6. Temporal pattern
    let temporalScore = 40;
    switch (indicator.temporalPattern) {
      case 'EXPANDING':
        temporalScore = 100;
        break;
      case 'PERSISTENT':
        temporalScore = 85;
        break;
      case 'INCREASING':
        temporalScore = 80;
        break;
      case 'NEW':
        temporalScore = 70;
        break;
      case 'RECURRING':
        temporalScore = 65;
        break;
      case 'DECREASING':
      case 'RESOLVED':
        temporalScore = 20;
        break;
      default:
        temporalScore = 40;
    }

    // 7. Source and evidence quality
    let sourceScore = 30;
    const sources = indicator.sourceCount || 1;
    if (sources >= 4) sourceScore = 100;
    else if (sources === 3) sourceScore = 80;
    else if (sources === 2) sourceScore = 60;

    // Weighted aggregation
    const composite =
      disturbanceScore * weights.disturbanceWeight +
      spatialScore * weights.spatialContextWeight +
      fireScore * weights.fireCorrelationWeight +
      proximityScore * weights.roadRiverProximityWeight +
      osintScore * weights.osintCorrelationWeight +
      temporalScore * weights.temporalPatternWeight +
      sourceScore * weights.sourceQualityWeight;

    return Math.round(composite * 10) / 10;
  }

  /**
   * Maps activity score to general priority level.
   */
  public static determinePriority(score: number): ActivityPriority {
    if (score >= 80) return 'HIGH';
    if (score >= 60) return 'MODERATE';
    if (score >= 40) return 'LOW';
    return 'LOW';
  }

  /**
   * Deterministically assigns Verification Priority for patrol dispatch & field inspection.
   * Section 24: factors = evidence strength, source count, sensitivity, recency, persistence.
   */
  public static determineVerificationPriority(
    score: number,
    indicator: Partial<ForestryActivityIndicator>
  ): VerificationPriority {
    const isHL = indicator.forestFunction === 'HL';
    const isPeat = indicator.peatlandOverlap === true;
    const hasFire = indicator.fireCorrelation === true;
    const multiSource = (indicator.sourceCount || 0) >= 3;

    if (score >= 85 && (isHL || isPeat) && (hasFire || multiSource)) {
      return 'URGENT';
    }
    if (score >= 70) {
      return 'HIGH';
    }
    if (score >= 45) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Evaluates evidence strength classification.
   */
  public static evaluateEvidenceStrength(sourceCount: number, evidenceCount: number): 'LOW' | 'MODERATE' | 'STRONG' | 'VERY_STRONG' {
    if (sourceCount >= 3 && evidenceCount >= 3) return 'VERY_STRONG';
    if (sourceCount >= 2 && evidenceCount >= 2) return 'STRONG';
    if (sourceCount >= 1 && evidenceCount >= 1) return 'MODERATE';
    return 'LOW';
  }
}
