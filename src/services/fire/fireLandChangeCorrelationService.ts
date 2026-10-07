import { FireEvent, FireLandChangeCorrelation } from '../../types/fire';
import { LandChangeEvent } from '../../types/satellite';
import { SpatialEngineService } from '../spatialEngineService';
import { SatelliteRepository } from '../satellite/satelliteRepository';

export class FireLandChangeCorrelationService {
  /**
   * Correlate Fire Events with Satellite Land Change Events (Phase 5)
   * Spatial Threshold: <= 3000m
   * Temporal Threshold: <= 30 days
   */
  public static correlateEvents(
    fireEvents: FireEvent[],
    landChangeEvents?: LandChangeEvent[]
  ): FireLandChangeCorrelation[] {
    const lcEvents = landChangeEvents || SatelliteRepository.getChangeEvents();
    const correlations: FireLandChangeCorrelation[] = [];

    for (const fe of fireEvents) {
      const [fLon, fLat] = fe.centroid;
      const fTime = new Date(fe.first_detected_at).getTime();

      for (const lce of lcEvents) {
        const [lcLon, lcLat] = [lce.centroid_longitude, lce.centroid_latitude];
        const lcTime = new Date(lce.acquisition_date).getTime();

        // 1. Calculate Geodesic Distance in meters
        const distanceMeters = Math.round(
          SpatialEngineService.haversineDistance(fLat, fLon, lcLat, lcLon)
        );

        // 2. Calculate Temporal Difference in days
        const diffDays = Math.round(Math.abs(fTime - lcTime) / (1000 * 3600 * 24) * 10) / 10;

        // Spatial threshold: <= 3000m (3km) & temporal <= 45 days
        if (distanceMeters <= 3000 && diffDays <= 45) {
          // Spatial Relationship Classification
          let spatialRel: FireLandChangeCorrelation['spatial_relationship'] = 'NEARBY';
          if (distanceMeters <= 250) spatialRel = 'OVERLAPPING';
          else if (distanceMeters <= 500) spatialRel = 'WITHIN_BUFFER_500M';
          else if (distanceMeters <= 1000) spatialRel = 'WITHIN_BUFFER_1KM';

          // Temporal Relationship Classification
          let temporalRel: FireLandChangeCorrelation['temporal_relationship'] = 'CONCURRENT';
          if (fTime < lcTime - 86400000) {
            temporalRel = 'FIRE_PRECEDED_CHANGE';
          } else if (fTime > lcTime + 86400000) {
            temporalRel = 'CHANGE_PRECEDED_FIRE';
          }

          // Correlation Score Calculation (0 - 100)
          // Closer distance + closer time = higher correlation
          const distScore = Math.max(0, 100 - (distanceMeters / 3000) * 50); // 50 to 100
          const timeScore = Math.max(0, 100 - (diffDays / 45) * 50); // 50 to 100
          const correlationScore = Math.round((distScore * 0.6 + timeScore * 0.4));

          correlations.push({
            correlation_id: `CORR-${fe.event_id}-${lce.event_id}`,
            fire_event_id: fe.event_id,
            land_change_event_id: lce.event_id,
            spatial_relationship: spatialRel,
            distance_meters: distanceMeters,
            temporal_relationship: temporalRel,
            time_difference_days: diffDays,
            correlation_score: correlationScore,
            method: 'Spatiotemporal Intersection & Buffer Proximity Analysis',
            causality_caveat:
              'Potential spatial correlation: Identifies co-location and temporal proximity between thermal anomaly and canopy loss. Does not establish legal or causal proof of land clearing.',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Sort by highest correlation score
    return correlations.sort((a, b) => b.correlation_score - a.correlation_score);
  }
}
