-- =========================================================================
-- KPH INTELLIGENCE - FIRE INTELLIGENCE & THERMAL RADIATIVE ANALYTICS SCHEMA
-- Wilayah Target: Kabupaten Sintang & KPH Sintang Timur, Kalimantan Barat
-- Standard: PostGIS 3.3+ / PostgreSQL 15+
-- FASE 6: PUBLIC FIRE DATA ARCHITECTURE, CLUSTERING & CORRELATION SCHEMA
-- =========================================================================

-- 1. ENUMS FOR FIRE INTELLIGENCE
DO $$ BEGIN
    CREATE TYPE fire_detection_status_enum AS ENUM (
        'DETECTED',
        'UNCONFIRMED',
        'CORRELATED',
        'REQUIRES_REVIEW',
        'CONFIRMED_BY_PUBLIC_SOURCE',
        'DISMISSED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fire_event_status_enum AS ENUM (
        'DETECTED',
        'UNDER_REVIEW',
        'CORRELATED',
        'CONFIRMED_BY_PUBLIC_SOURCE',
        'DISMISSED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fire_alert_severity_enum AS ENUM (
        'INFO',
        'LOW',
        'MODERATE',
        'HIGH'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fire_risk_level_enum AS ENUM (
        'LOW',
        'MODERATE',
        'HIGH',
        'VERY_HIGH'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. FIRE ANALYSIS RUNS
-- Stores all clustering, risk evaluation, and correlation execution runs
CREATE TABLE IF NOT EXISTS fire_analysis_runs (
    analysis_run_id VARCHAR(128) PRIMARY KEY,
    analysis_type VARCHAR(64) NOT NULL, -- 'SPATIOTEMPORAL_CLUSTERING', 'FIRE_RISK_EVALUATION', 'LAND_CHANGE_CORRELATION', 'RECURRING_HOTSPOT_DETECTION'
    parameters JSONB NOT NULL DEFAULT '{}',
    method VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0-PROD',
    input_data_summary JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED', -- 'RUNNING', 'COMPLETED', 'FAILED'
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 3. FIRE DETECTIONS (RAW & ENRICHED HOTSPOTS)
-- Stores verified public satellite thermal detections (NASA FIRMS VIIRS & MODIS)
CREATE TABLE IF NOT EXISTS fire_detections (
    detection_id VARCHAR(128) PRIMARY KEY,
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id) ON UPDATE CASCADE,
    source_record_id VARCHAR(128) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    geometry GEOMETRY(Point, 4326) NOT NULL,
    acquisition_time TIMESTAMPTZ NOT NULL,
    confidence VARCHAR(32) NOT NULL, -- 'nominal', 'high', 'low' or percentage string
    confidence_numeric INTEGER CHECK (confidence_numeric >= 0 AND confidence_numeric <= 100),
    brightness DOUBLE PRECISION NOT NULL, -- Kelvin (e.g. 325.4)
    bright_t31 DOUBLE PRECISION, -- Channel 31 brightness temperature in Kelvin (or NULL)
    frp DOUBLE PRECISION, -- Fire Radiative Power in MegaWatts (or NULL)
    satellite VARCHAR(64) NOT NULL, -- 'VIIRS_SNPP', 'VIIRS_NOAA20', 'VIIRS_NOAA21', 'MODIS_TERRA', 'MODIS_AQUA'
    instrument VARCHAR(32) NOT NULL, -- 'VIIRS', 'MODIS'
    day_night CHAR(1), -- 'D', 'N', or NULL
    version VARCHAR(32) NOT NULL DEFAULT '2.0NRT',
    source_url TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    raw_reference TEXT,
    status fire_detection_status_enum NOT NULL DEFAULT 'DETECTED',
    data_quality_flag VARCHAR(32) NOT NULL DEFAULT 'VALID', -- 'VALID', 'DATA_QUALITY_ERROR', 'DUPLICATE_SUSPECT'

    -- Spatial Enrichment Attributes (Derived via SpatialEventEnrichmentService)
    kph_unit VARCHAR(128),
    kabupaten VARCHAR(128),
    kecamatan VARCHAR(128),
    desa VARCHAR(128),
    forest_zone VARCHAR(128),
    is_peatland BOOLEAN NOT NULL DEFAULT FALSE,
    peat_depth VARCHAR(64),
    near_river BOOLEAN NOT NULL DEFAULT FALSE,
    river_distance_meters DOUBLE PRECISION,
    near_road BOOLEAN NOT NULL DEFAULT FALSE,
    road_distance_meters DOUBLE PRECISION,
    tutupan_lahan VARCHAR(128),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fire_det_geom ON fire_detections USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_fire_det_acq_time ON fire_detections (acquisition_time);
CREATE INDEX IF NOT EXISTS idx_fire_det_satellite ON fire_detections (satellite);
CREATE INDEX IF NOT EXISTS idx_fire_det_source ON fire_detections (source_id);
CREATE INDEX IF NOT EXISTS idx_fire_det_status ON fire_detections (status);
CREATE INDEX IF NOT EXISTS idx_fire_det_kph ON fire_detections (kph_unit);
CREATE INDEX IF NOT EXISTS idx_fire_det_kecamatan ON fire_detections (kecamatan);

-- 4. FIRE EVENTS (SYSTEM-DERIVED CLUSTERS)
-- Aggregated spatiotemporal clusters of fire detections
CREATE TABLE IF NOT EXISTS fire_events (
    event_id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL DEFAULT 'FIRE_CLUSTER', -- 'FIRE_CLUSTER', 'REPEATED_HOTSPOT', 'ISOLATED_ANOMALY'
    geometry GEOMETRY(Geometry, 4326) NOT NULL, -- Convex Hull or buffered multipoint
    estimated_event_extent_ha DOUBLE PRECISION, -- Derived estimate only (strictly labeled DERIVED ESTIMATE)
    centroid GEOMETRY(Point, 4326) NOT NULL,
    centroid_latitude DOUBLE PRECISION NOT NULL,
    centroid_longitude DOUBLE PRECISION NOT NULL,
    first_detected_at TIMESTAMPTZ NOT NULL,
    last_detected_at TIMESTAMPTZ NOT NULL,
    duration_hours DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    detection_count INTEGER NOT NULL CHECK (detection_count >= 1),
    source_count INTEGER NOT NULL DEFAULT 1,
    max_brightness_kelvin DOUBLE PRECISION NOT NULL,
    total_frp_mw DOUBLE PRECISION,
    confidence VARCHAR(32) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    status fire_event_status_enum NOT NULL DEFAULT 'DETECTED',
    analysis_run_id VARCHAR(128) REFERENCES fire_analysis_runs(analysis_run_id),

    -- Derived Geospatial Context
    kph_unit VARCHAR(128),
    kabupaten VARCHAR(128),
    kecamatan VARCHAR(128),
    desa VARCHAR(128),
    forest_zone VARCHAR(128),
    is_peatland BOOLEAN NOT NULL DEFAULT FALSE,
    peat_depth VARCHAR(64),
    nearest_river_name VARCHAR(128),
    distance_to_river_m DOUBLE PRECISION,
    nearest_road_name VARCHAR(128),
    distance_to_road_m DOUBLE PRECISION,

    -- Weather Context at Detection Time
    weather_station VARCHAR(128) DEFAULT 'Stasiun Meteorologi Susilo Sintang',
    temperature_c DOUBLE PRECISION,
    humidity_percent DOUBLE PRECISION,
    wind_speed_kmh DOUBLE PRECISION,
    wind_direction_deg DOUBLE PRECISION,
    rainfall_24h_mm DOUBLE PRECISION,
    rainfall_7d_mm DOUBLE PRECISION,
    fire_weather_index VARCHAR(32) DEFAULT 'TINGGI',

    recurring_indicator BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_count_90d INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fire_events_geom ON fire_events USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_fire_events_centroid ON fire_events USING GIST (centroid);
CREATE INDEX IF NOT EXISTS idx_fire_events_first_time ON fire_events (first_detected_at);
CREATE INDEX IF NOT EXISTS idx_fire_events_status ON fire_events (status);
CREATE INDEX IF NOT EXISTS idx_fire_events_kph ON fire_events (kph_unit);

-- 5. FIRE EVENT TO DETECTION JUNCTION TABLE
CREATE TABLE IF NOT EXISTS fire_event_detections (
    event_id VARCHAR(128) NOT NULL REFERENCES fire_events(event_id) ON DELETE CASCADE,
    detection_id VARCHAR(128) NOT NULL REFERENCES fire_detections(detection_id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, detection_id)
);

-- 6. FIRE + LAND CHANGE CORRELATION TABLE (FASE 5 TO FASE 6 BRIDGE)
CREATE TABLE IF NOT EXISTS fire_land_change_correlations (
    correlation_id VARCHAR(128) PRIMARY KEY,
    fire_event_id VARCHAR(128) NOT NULL REFERENCES fire_events(event_id) ON DELETE CASCADE,
    land_change_event_id VARCHAR(128) NOT NULL, -- Links to land_change_events(event_id) from Fase 5
    spatial_relationship VARCHAR(64) NOT NULL, -- 'OVERLAPPING', 'WITHIN_BUFFER_500M', 'WITHIN_BUFFER_1KM', 'NEARBY'
    distance_meters DOUBLE PRECISION NOT NULL,
    temporal_relationship VARCHAR(64) NOT NULL, -- 'CONCURRENT', 'FIRE_PRECEDED_CHANGE', 'CHANGE_PRECEDED_FIRE'
    time_difference_days DOUBLE PRECISION NOT NULL,
    correlation_score INTEGER NOT NULL CHECK (correlation_score >= 0 AND correlation_score <= 100),
    method VARCHAR(128) NOT NULL DEFAULT 'Spatiotemporal Intersection & Buffer Proximity',
    causality_caveat TEXT NOT NULL DEFAULT 'Correlation is an observational metric and does not constitute causal or legal proof of land clearing.',
    analysis_run_id VARCHAR(128) REFERENCES fire_analysis_runs(analysis_run_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_corr_fire_event ON fire_land_change_correlations (fire_event_id);
CREATE INDEX IF NOT EXISTS idx_corr_lc_event ON fire_land_change_correlations (land_change_event_id);

-- 7. FIRE RISK EVALUATIONS (PUBLIC EVIDENCE-BASED RISK MODEL)
CREATE TABLE IF NOT EXISTS fire_risk_evaluations (
    evaluation_id VARCHAR(128) PRIMARY KEY,
    aoi_id VARCHAR(64) NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    risk_level fire_risk_level_enum NOT NULL,
    composite_score DOUBLE PRECISION NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
    model_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0-PUBLIC-EVIDENCE',
    formula_expression TEXT NOT NULL,
    factor_breakdown JSONB NOT NULL,
    -- {
    --   "recent_hotspots": { "weight": 0.30, "score": 85, "level": "HIGH" },
    --   "rainfall_deficit": { "weight": 0.25, "score": 90, "level": "VERY_HIGH" },
    --   "atmospheric_dryness": { "weight": 0.20, "score": 75, "level": "HIGH" },
    --   "peatland_flammability": { "weight": 0.15, "score": 60, "level": "MODERATE" },
    --   "historical_fire_frequency": { "weight": 0.10, "score": 70, "level": "MODERATE" }
    -- }
    caveat TEXT NOT NULL DEFAULT 'SYSTEM-DERIVED INDICATOR: Probabilistic estimate based on public environmental data, not a certainty of fire occurrence.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. FIRE EARLY WARNING ALERTS
CREATE TABLE IF NOT EXISTS fire_alerts (
    alert_id VARCHAR(128) PRIMARY KEY,
    alert_type VARCHAR(64) NOT NULL, -- 'MULTIPLE_HOTSPOT_CLUSTER', 'REPEATED_HOTSPOT_ALERT', 'HIGH_DENSITY_ALERT', 'HIGH_FIRE_RISK', 'CORRELATED_LAND_CHANGE', 'PROTECTED_FOREST_ANOMALY'
    severity fire_alert_severity_enum NOT NULL,
    event_id VARCHAR(128) REFERENCES fire_events(event_id) ON DELETE SET NULL,
    detection_id VARCHAR(128) REFERENCES fire_detections(detection_id) ON DELETE SET NULL,
    headline VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    evidence TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_sev ON fire_alerts (severity);
CREATE INDEX IF NOT EXISTS idx_alerts_time ON fire_alerts (created_at);
