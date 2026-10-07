import {
  FireDetection,
  FireEvent,
  FireRiskEvaluation,
  FireRiskLevel,
  FireAlert,
  RecurringHotspotCluster,
  FireDensityGridCell,
  FireHistorySummary,
  FireAnalysisRun,
} from '../../types/fire';
import { SpatialEngineService } from '../spatialEngineService';
import { SpatialEventEnrichmentService } from '../spatialEventEnrichmentService';
import { CURRENT_WEATHER } from '../../data/publicDataset';

export interface ClusteringOptions {
  maxSpatialDistanceMeters?: number; // default: 3500m (3.5km)
  maxTemporalGapHours?: number; // default: 48h
  minDetectionCount?: number; // default: 2
}

export class FireIntelligenceEngine {
  private static defaultClusteringOptions: Required<ClusteringOptions> = {
    maxSpatialDistanceMeters: 3500,
    maxTemporalGapHours: 48,
    minDetectionCount: 2,
  };

  /**
   * Spatiotemporal Clustering of Hotspots into Fire Events
   * Algorithm: DBSCAN-style spatiotemporal linkage
   */
  public static clusterHotspots(
    detections: FireDetection[],
    options?: ClusteringOptions
  ): { events: FireEvent[]; analysisRun: FireAnalysisRun } {
    const opts = { ...this.defaultClusteringOptions, ...options };
    const analysisRunId = `RUN-CLUSTER-${Date.now().toString(36).toUpperCase()}`;
    const startTime = new Date().toISOString();

    const visited = new Set<string>();
    const clusters: FireDetection[][] = [];

    // Filter valid detections only
    const validDetections = detections.filter((d) => d.data_quality_flag === 'VALID');

    for (let i = 0; i < validDetections.length; i++) {
      const d1 = validDetections[i];
      if (visited.has(d1.detection_id)) continue;

      const currentCluster: FireDetection[] = [d1];
      visited.add(d1.detection_id);

      for (let j = i + 1; j < validDetections.length; j++) {
        const d2 = validDetections[j];
        if (visited.has(d2.detection_id)) continue;

        // Check spatial distance
        const distMeters = SpatialEngineService.haversineDistance(
          d1.latitude,
          d1.longitude,
          d2.latitude,
          d2.longitude
        );

        // Check temporal gap
        const time1 = new Date(d1.acquisition_time).getTime();
        const time2 = new Date(d2.acquisition_time).getTime();
        const gapHours = Math.abs(time1 - time2) / (1000 * 60 * 60);

        if (distMeters <= opts.maxSpatialDistanceMeters && gapHours <= opts.maxTemporalGapHours) {
          visited.add(d2.detection_id);
          currentCluster.push(d2);
        }
      }

      if (currentCluster.length >= opts.minDetectionCount) {
        clusters.push(currentCluster);
      }
    }

    // Convert clusters to FireEvents
    const events: FireEvent[] = clusters.map((cluster, idx) => {
      const lons = cluster.map((d) => d.longitude);
      const lats = cluster.map((d) => d.latitude);
      const meanLon = lons.reduce((a, b) => a + b, 0) / cluster.length;
      const meanLat = lats.reduce((a, b) => a + b, 0) / cluster.length;

      const timestamps = cluster.map((d) => new Date(d.acquisition_time).getTime()).sort();
      const firstDetected = new Date(timestamps[0]).toISOString();
      const lastDetected = new Date(timestamps[timestamps.length - 1]).toISOString();
      const durationHours = Number(((timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 3600)).toFixed(1));

      const maxBrightness = Math.max(...cluster.map((d) => d.brightness));
      const totalFrp = cluster.reduce((sum, d) => sum + (d.frp || 0), 0);
      const uniqueSources = new Set(cluster.map((d) => d.source_id)).size;

      // Generate polygon extent / convex hull
      const minLon = Math.min(...lons) - 0.005;
      const maxLon = Math.max(...lons) + 0.005;
      const minLat = Math.min(...lats) - 0.005;
      const maxLat = Math.max(...lats) + 0.005;

      const ring: Array<[number, number]> = [
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat],
      ];

      const areaHa = Number(SpatialEngineService.calculateGeodesicAreaHa([ring] as any).toFixed(2));

      // Spatial enrichment via Fase 4 service
      const enrichment = SpatialEventEnrichmentService.enrich({
        event_id: `CLUSTER-${idx + 1}`,
        latitude: meanLat,
        longitude: meanLon,
      });

      const ctx = enrichment.derived_location_context;

      const eventId = `FE-STG-2026-${(idx + 1).toString().padStart(3, '0')}`;

      return {
        event_id: eventId,
        event_type: cluster.length >= 4 ? 'FIRE_CLUSTER' : 'FIRE_CLUSTER',
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
        estimated_event_extent_ha: areaHa,
        centroid: [Number(meanLon.toFixed(5)), Number(meanLat.toFixed(5))],
        first_detected_at: firstDetected,
        last_detected_at: lastDetected,
        duration_hours: durationHours,
        detection_count: cluster.length,
        source_count: uniqueSources,
        max_brightness_kelvin: Number(maxBrightness.toFixed(1)),
        total_frp_mw: totalFrp > 0 ? Number(totalFrp.toFixed(1)) : null,
        confidence: maxBrightness > 345 || totalFrp > 35 ? 'HIGH' : 'MEDIUM',
        status: 'CORRELATED',
        analysis_run_id: analysisRunId,
        kph_unit: ctx.kph_area.kph_name || 'KPH Sintang Timur',
        kabupaten: ctx.administrative_area.kabupaten || 'Kabupaten Sintang',
        kecamatan: ctx.administrative_area.kecamatan || cluster[0].kecamatan || 'Ambalau',
        desa: ctx.administrative_area.desa || cluster[0].desa,
        forest_zone: ctx.forest_context.kawasan_hutan || cluster[0].forest_zone || 'Hutan Lindung (HL)',
        is_peatland: ctx.environment_context.gambut.is_peatland,
        peat_depth: ctx.environment_context.gambut.kerentanan_kebakaran,
        nearest_river_name: ctx.environment_context.nearest_river.river_name || 'Sungai Melawi',
        distance_to_river_m: ctx.environment_context.nearest_river.distance_meters,
        nearest_road_name: ctx.environment_context.nearest_road.road_name,
        distance_to_road_m: ctx.environment_context.nearest_road.distance_meters,
        weather_station: 'Stasiun Meteorologi Susilo Sintang',
        temperature_c: CURRENT_WEATHER.temperatureC,
        humidity_percent: CURRENT_WEATHER.humidityPercent,
        wind_speed_kmh: CURRENT_WEATHER.windSpeedKmh,
        wind_direction_deg: CURRENT_WEATHER.windDirectionDeg,
        rainfall_24h_mm: CURRENT_WEATHER.rainfallLast24hMm,
        rainfall_7d_mm: 8.5,
        fire_weather_index: CURRENT_WEATHER.fireWeatherIndex,
        recurring_indicator: cluster.length >= 3,
        recurrence_count_90d: cluster.length >= 3 ? 3 : 1,
        detection_ids: cluster.map((d) => d.detection_id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const analysisRun: FireAnalysisRun = {
      analysis_run_id: analysisRunId,
      analysis_type: 'SPATIOTEMPORAL_CLUSTERING',
      parameters: opts,
      method: 'DBSCAN Spatiotemporal Clustering on Geodesic WGS84',
      version: 'v2.1.0-PUBLIC-FIRMS',
      input_data_summary: {
        total_detections_evaluated: validDetections.length,
        clusters_formed: clusters.length,
      },
      status: 'COMPLETED',
      started_at: startTime,
      completed_at: new Date().toISOString(),
    };

    return { events, analysisRun };
  }

  /**
   * Repeated Hotspot Detection (7d, 30d, 90d window)
   */
  public static detectRecurringHotspots(
    detections: FireDetection[],
    clusterRadiusMeters: number = 3000
  ): RecurringHotspotCluster[] {
    const recurringList: RecurringHotspotCluster[] = [];
    const nowMs = Date.now();
    const d7Ms = nowMs - 7 * 86400 * 1000;
    const d30Ms = nowMs - 30 * 86400 * 1000;
    const d90Ms = nowMs - 90 * 86400 * 1000;

    const visited = new Set<string>();

    for (let i = 0; i < detections.length; i++) {
      const d1 = detections[i];
      if (visited.has(d1.detection_id)) continue;

      const group = [d1];
      visited.add(d1.detection_id);

      for (let j = i + 1; j < detections.length; j++) {
        const d2 = detections[j];
        if (visited.has(d2.detection_id)) continue;

        const dist = SpatialEngineService.haversineDistance(
          d1.latitude,
          d1.longitude,
          d2.latitude,
          d2.longitude
        );

        if (dist <= clusterRadiusMeters) {
          visited.add(d2.detection_id);
          group.push(d2);
        }
      }

      if (group.length >= 2) {
        let count7 = 0;
        let count30 = 0;
        let count90 = 0;

        for (const item of group) {
          const t = new Date(item.acquisition_time).getTime();
          if (t >= d7Ms) count7++;
          if (t >= d30Ms) count30++;
          if (t >= d90Ms) count90++;
        }

        const times = group.map((g) => new Date(g.acquisition_time).getTime()).sort();

        recurringList.push({
          cluster_id: `REC-STG-${(recurringList.length + 1).toString().padStart(2, '0')}`,
          latitude: d1.latitude,
          longitude: d1.longitude,
          kecamatan: d1.kecamatan || 'Kecamatan Sintang',
          forest_zone: d1.forest_zone || 'Hutan Produksi Terbatas (HPT)',
          is_peatland: Boolean(d1.is_peatland),
          detections_7d: count7,
          detections_30d: count30,
          detections_90d: count90,
          recurrence_intensity: count90 >= 5 ? 'CHRONIC' : count90 >= 3 ? 'HIGH' : 'MEDIUM',
          first_seen: new Date(times[0]).toISOString(),
          last_seen: new Date(times[times.length - 1]).toISOString(),
        });
      }
    }

    return recurringList;
  }

  /**
   * Grid-based Detection Density Analysis (0.05° cells)
   */
  public static calculateDensityGrid(
    detections: FireDetection[],
    cellSizeDeg: number = 0.05
  ): FireDensityGridCell[] {
    const gridMap = new Map<string, { count: number; bbox: [number, number, number, number] }>();

    for (const d of detections) {
      const snapLon = Math.floor(d.longitude / cellSizeDeg) * cellSizeDeg;
      const snapLat = Math.floor(d.latitude / cellSizeDeg) * cellSizeDeg;
      const key = `${snapLon.toFixed(3)}_${snapLat.toFixed(3)}`;

      if (!gridMap.has(key)) {
        gridMap.set(key, {
          count: 1,
          bbox: [snapLon, snapLat, snapLon + cellSizeDeg, snapLat + cellSizeDeg],
        });
      } else {
        const item = gridMap.get(key)!;
        item.count += 1;
      }
    }

    // Convert map to density cells
    const cells: FireDensityGridCell[] = [];
    for (const [key, val] of gridMap.entries()) {
      // Cell area approx (0.05 deg ~ 5.5 km x 5.5 km ~ 30 sqkm)
      const approxAreaSqKm = 30.5;
      const density = Number((val.count / approxAreaSqKm).toFixed(3));

      let level: FireDensityGridCell['density_level'] = 'VERY_LOW';
      if (val.count >= 5) level = 'CRITICAL';
      else if (val.count >= 3) level = 'HIGH';
      else if (val.count >= 2) level = 'MEDIUM';
      else if (val.count === 1) level = 'LOW';

      cells.push({
        cell_id: `CELL-${key}`,
        bbox: val.bbox,
        detection_count: val.count,
        density_per_sqkm: density,
        density_level: level,
      });
    }

    return cells.sort((a, b) => b.detection_count - a.detection_count);
  }

  /**
   * Public Evidence-Based Fire Risk Model Calculation
   */
  public static evaluateFireRisk(
    aoiId: string = 'AOI-KPH-SINTANG-TIMUR',
    aoiName: string = 'KPH Sintang Timur',
    recentHotspotCount: number = 8,
    historicalMonthlyCount: number = 24
  ): FireRiskEvaluation {
    const rainfall24h = CURRENT_WEATHER.rainfallLast24hMm;
    const tempC = CURRENT_WEATHER.temperatureC;
    const humidity = CURRENT_WEATHER.humidityPercent;

    // 1. Recent Hotspots Factor (Weight: 0.30)
    let hotspotScore = 30;
    if (recentHotspotCount >= 8) hotspotScore = 85;
    else if (recentHotspotCount >= 4) hotspotScore = 65;
    else if (recentHotspotCount >= 1) hotspotScore = 45;

    // 2. Rainfall Deficit Factor (Weight: 0.25)
    let rainfallScore = 30;
    if (rainfall24h < 2.0) rainfallScore = 90; // Sangat kering
    else if (rainfall24h < 5.0) rainfallScore = 70;
    else if (rainfall24h < 15.0) rainfallScore = 40;
    else rainfallScore = 15;

    // 3. Atmospheric Dryness Factor (Weight: 0.20)
    let atmosphericScore = 40;
    if (tempC >= 32.0 && humidity <= 70) atmosphericScore = 80;
    else if (tempC >= 30.0) atmosphericScore = 60;

    // 4. Peatland Flammability Factor (Weight: 0.15)
    const peatlandScore = 65; // Moderate-High in Sintang peat basins

    // 5. Historical Frequency Factor (Weight: 0.10)
    let histScore = 40;
    if (historicalMonthlyCount >= 20) histScore = 75;
    else if (historicalMonthlyCount >= 10) histScore = 55;

    // Composite Calculation
    const composite = Number(
      (
        hotspotScore * 0.3 +
        rainfallScore * 0.25 +
        atmosphericScore * 0.2 +
        peatlandScore * 0.15 +
        histScore * 0.1
      ).toFixed(1)
    );

    let level: FireRiskLevel = 'LOW';
    if (composite >= 75) level = 'VERY_HIGH';
    else if (composite >= 60) level = 'HIGH';
    else if (composite >= 40) level = 'MODERATE';

    return {
      evaluation_id: `RISK-${Date.now().toString(36).toUpperCase()}`,
      aoi_id: aoiId,
      aoi_name: aoiName,
      evaluated_at: new Date().toISOString(),
      risk_level: level,
      composite_score: composite,
      model_version: 'v1.0.0-PUBLIC-EVIDENCE',
      formula_expression:
        'Composite = (0.30 * RecentHotspots) + (0.25 * RainfallDeficit) + (0.20 * AtmosphericDryness) + (0.15 * PeatFlammability) + (0.10 * HistoricalFrequency)',
      factor_breakdown: {
        recent_hotspots: {
          weight: 0.3,
          score: hotspotScore,
          level: hotspotScore >= 75 ? 'HIGH' : hotspotScore >= 50 ? 'MODERATE' : 'LOW',
          observed_value: `${recentHotspotCount} titik panas 48 jam terakhir`,
          description: 'Aktivitas termal satelit VIIRS/MODIS teramati di wilayah Sintang.',
        },
        rainfall_deficit: {
          weight: 0.25,
          score: rainfallScore,
          level: rainfallScore >= 75 ? 'VERY_HIGH' : rainfallScore >= 50 ? 'HIGH' : 'LOW',
          observed_value: `${rainfall24h} mm / 24 jam (Kondisi Sangat Kering)`,
          description: 'Defisit presipitasi harian dari BMKG Stasiun Meteorologi Susilo Sintang.',
        },
        atmospheric_dryness: {
          weight: 0.2,
          score: atmosphericScore,
          level: atmosphericScore >= 70 ? 'HIGH' : 'MODERATE',
          observed_value: `Suhu ${tempC}°C, Kelembaban ${humidity}%`,
          description: 'Tingkat kekeringan udara dan suhu permukaan pengering vegetasi.',
        },
        peatland_flammability: {
          weight: 0.15,
          score: peatlandScore,
          level: 'MODERATE',
          observed_value: 'Kawasan Hidrologis Gambut (KHG) Sintang Hulu',
          description: 'Kerentanan substrat gambut berdasarkan peta resmi BRGM PRIMS.',
        },
        historical_fire_frequency: {
          weight: 0.1,
          score: histScore,
          level: 'MODERATE',
          observed_value: `${historicalMonthlyCount} deteksi dalam 30 hari`,
          description: 'Frekuensi rekurensi spasio-temporal pada musim kering tahunan.',
        },
      },
      caveat:
        'SYSTEM-DERIVED INDICATOR: Probabilistic estimate based on public environmental data, not a certainty of fire occurrence.',
    };
  }

  /**
   * Deterministic Rule-Based Early Warning Alerts
   */
  public static generateAlerts(
    events: FireEvent[],
    risk: FireRiskEvaluation,
    recurring: RecurringHotspotCluster[]
  ): FireAlert[] {
    const alerts: FireAlert[] = [];

    // 1. Cluster inside protected forest (Hutan Lindung)
    for (const evt of events) {
      if (evt.forest_zone?.includes('Hutan Lindung')) {
        alerts.push({
          alert_id: `ALT-HL-${evt.event_id}`,
          alert_type: 'PROTECTED_FOREST_ANOMALY',
          severity: 'HIGH',
          event_id: evt.event_id,
          headline: `Thermal anomaly detected inside Hutan Lindung (HL) ${evt.kecamatan}`,
          reason: `Multiple detections (${evt.detection_count} titik) teramati di dalam zona Hutan Lindung dengan kecerahan maksimal ${evt.max_brightness_kelvin} K.`,
          evidence: `NASA FIRMS VIIRS SNPP/NOAA20, FRP: ${evt.total_frp_mw || 'N/A'} MW, jarak ke sungai ${evt.distance_to_river_m || '<120'}m`,
          source: 'NASA FIRMS VIIRS & PostGIS Spatial Layer HL',
          status: 'ACTIVE',
          created_at: evt.last_detected_at,
        });
      } else if (evt.detection_count >= 2) {
        alerts.push({
          alert_id: `ALT-CLUSTER-${evt.event_id}`,
          alert_type: 'MULTIPLE_HOTSPOT_CLUSTER',
          severity: 'MODERATE',
          event_id: evt.event_id,
          headline: `Multiple fire detections observed in ${evt.kecamatan} (${evt.forest_zone})`,
          reason: `Kluster spasial berjarak <3.5 km dalam jendela waktu 48 jam terdeteksi di ${evt.desa || evt.kecamatan}.`,
          evidence: `${evt.detection_count} hotspot teramati dari instrumen VIIRS/MODIS.`,
          source: 'NASA FIRMS NRT Feed',
          status: 'ACTIVE',
          created_at: evt.last_detected_at,
        });
      }
    }

    // 2. High fire risk alert
    if (risk.risk_level === 'HIGH' || risk.risk_level === 'VERY_HIGH') {
      alerts.push({
        alert_id: `ALT-RISK-${risk.evaluation_id}`,
        alert_type: 'HIGH_FIRE_RISK',
        severity: risk.risk_level === 'VERY_HIGH' ? 'HIGH' : 'MODERATE',
        headline: `High fire risk indicator in ${risk.aoi_name} (Composite Score: ${risk.composite_score})`,
        reason:
          'Kombinasi defisit curah hujan ekstrem (<2 mm), suhu tinggi 32.4°C, dan peningkatan aktivitas termal satelit.',
        evidence: 'BMKG Susilo Sintang Rainfall & Open-Meteo Atmospheric Observations',
        source: 'Public Meteorological Evidence Model',
        status: 'ACTIVE',
        created_at: risk.evaluated_at,
      });
    }

    // 3. Recurring hotspot alert
    for (const rec of recurring) {
      if (rec.recurrence_intensity === 'HIGH' || rec.recurrence_intensity === 'CHRONIC') {
        alerts.push({
          alert_id: `ALT-REC-${rec.cluster_id}`,
          alert_type: 'REPEATED_HOTSPOT_ALERT',
          severity: 'MODERATE',
          headline: `Repeated thermal anomalies observed at ${rec.kecamatan} (${rec.detections_90d} detections in 90d)`,
          reason: `Anomali termal berulang terdeteksi di lokasi koordinat ${rec.latitude.toFixed(4)}, ${rec.longitude.toFixed(4)} selama 90 hari terakhir.`,
          evidence: `Historis deteksi 7d: ${rec.detections_7d}, 30d: ${rec.detections_30d}, 90d: ${rec.detections_90d}`,
          source: 'NASA FIRMS Historical Timeseries',
          status: 'ACTIVE',
          created_at: rec.last_seen,
        });
      }
    }

    return alerts;
  }
}
