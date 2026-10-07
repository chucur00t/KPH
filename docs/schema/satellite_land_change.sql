-- =========================================================================
-- KPH INTELLIGENCE - SATELLITE INTELLIGENCE & LAND CHANGE DETECTION SCHEMA
-- Target: KPH Sintang Timur & Kabupaten Sintang, Kalimantan Barat
-- Standard: PostGIS 3.3+ / PostgreSQL 15+
-- FASE 5: SATELLITE DATA ARCHITECTURE & LAND OBSERVATION SCHEMA
-- =========================================================================

-- 1. SATELLITE SCENES CATALOG
-- Stores verified public earth observation satellite scenes
CREATE TABLE IF NOT EXISTS satellite_scenes (
    scene_id VARCHAR(128) PRIMARY KEY,
    provider VARCHAR(64) NOT NULL, -- e.g., 'Copernicus', 'USGS', 'Element84'
    satellite VARCHAR(64) NOT NULL, -- 'Sentinel-2A', 'Sentinel-2B', 'Landsat-8', 'Landsat-9'
    sensor VARCHAR(64) NOT NULL, -- 'MSI', 'OLI-2'
    acquisition_date TIMESTAMPTZ NOT NULL,
    cloud_cover_percent DOUBLE PRECISION NOT NULL CHECK (cloud_cover_percent >= 0 AND cloud_cover_percent <= 100),
    processing_level VARCHAR(32) NOT NULL, -- 'Level-2A BOA', 'Collection 2 Level-2'
    footprint GEOMETRY(Polygon, 4326) NOT NULL,
    available_bands JSONB NOT NULL DEFAULT '[]',
    resolution_meters DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id) ON UPDATE CASCADE,
    source_url TEXT NOT NULL,
    thumbnail_url TEXT,
    tile_id VARCHAR(32), -- e.g., '49MCV', '49MCU', '120/060'
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sat_scenes_footprint ON satellite_scenes USING GIST (footprint);
CREATE INDEX IF NOT EXISTS idx_sat_scenes_acq_date ON satellite_scenes (acquisition_date);
CREATE INDEX IF NOT EXISTS idx_sat_scenes_sat ON satellite_scenes (satellite);
CREATE INDEX IF NOT EXISTS idx_sat_scenes_cloud ON satellite_scenes (cloud_cover_percent);

-- 2. SPECTRAL INDEX CONFIGURATIONS
CREATE TABLE IF NOT EXISTS spectral_index_configs (
    index_id VARCHAR(32) PRIMARY KEY, -- 'NDVI', 'NDWI', 'NBR'
    index_name VARCHAR(64) NOT NULL,
    formula_expression TEXT NOT NULL,
    band_mappings JSONB NOT NULL, -- { "Sentinel-2": { "nir": "B08", "red": "B04" }, "Landsat-8": { "nir": "B5", "red": "B4" } }
    description TEXT NOT NULL,
    loss_threshold DOUBLE PRECISION NOT NULL DEFAULT -0.30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed default spectral indices
INSERT INTO spectral_index_configs (index_id, index_name, formula_expression, band_mappings, description, loss_threshold)
VALUES 
(
    'NDVI',
    'Normalized Difference Vegetation Index',
    '(NIR - RED) / (NIR + RED)',
    '{"Sentinel-2": {"nir": "B08", "red": "B04"}, "Landsat-8": {"nir": "B5", "red": "B4"}, "Landsat-9": {"nir": "B5", "red": "B4"}}',
    'Indeks kehijauan dan kerapatan kanopi vegetasi tropis.',
    -0.30
),
(
    'NDWI',
    'Normalized Difference Water Index',
    '(GREEN - NIR) / (GREEN + NIR)',
    '{"Sentinel-2": {"green": "B03", "nir": "B08"}, "Landsat-8": {"green": "B3", "nir": "B5"}, "Landsat-9": {"green": "B3", "nir": "B5"}}',
    'Indeks kandungan air permukaan, genangan rawa, dan kelembaban kanopi.',
    -0.25
),
(
    'NBR',
    'Normalized Burn Ratio',
    '(NIR - SWIR) / (NIR + SWIR)',
    '{"Sentinel-2": {"nir": "B08", "swir": "B12"}, "Landsat-8": {"nir": "B5", "swir": "B7"}, "Landsat-9": {"nir": "B5", "swir": "B7"}}',
    'Indeks deteksi keparahan bekas kebakaran dan bukaan lahan tanah terbuka.',
    -0.20
)
ON CONFLICT (index_id) DO NOTHING;

-- 3. LAND OBSERVATIONS
-- Discrete periodic measurement of spectral indices over defined AOIs
CREATE TABLE IF NOT EXISTS land_observations (
    observation_id VARCHAR(128) PRIMARY KEY,
    scene_id VARCHAR(128) NOT NULL REFERENCES satellite_scenes(scene_id) ON DELETE CASCADE,
    aoi_id VARCHAR(64) NOT NULL,
    observation_date TIMESTAMPTZ NOT NULL,
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    index_type VARCHAR(16) NOT NULL REFERENCES spectral_index_configs(index_id),
    mean_value DOUBLE PRECISION NOT NULL,
    min_value DOUBLE PRECISION NOT NULL,
    max_value DOUBLE PRECISION NOT NULL,
    std_dev DOUBLE PRECISION NOT NULL,
    statistics JSONB NOT NULL DEFAULT '{}',
    processing_method TEXT NOT NULL,
    processing_version VARCHAR(32) NOT NULL,
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_land_obs_geom ON land_observations USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_land_obs_scene ON land_observations (scene_id);
CREATE INDEX IF NOT EXISTS idx_land_obs_aoi ON land_observations (aoi_id);
CREATE INDEX IF NOT EXISTS idx_land_obs_date ON land_observations (observation_date);

-- 4. LAND CHANGE DETECTIONS (Bi-Temporal Analysis Runs)
CREATE TABLE IF NOT EXISTS land_change_detections (
    detection_id VARCHAR(128) PRIMARY KEY,
    baseline_scene_id VARCHAR(128) NOT NULL REFERENCES satellite_scenes(scene_id),
    comparison_scene_id VARCHAR(128) NOT NULL REFERENCES satellite_scenes(scene_id),
    aoi_id VARCHAR(64) NOT NULL,
    index_type VARCHAR(16) NOT NULL REFERENCES spectral_index_configs(index_id),
    threshold_applied DOUBLE PRECISION NOT NULL,
    total_area_analyzed_ha DOUBLE PRECISION NOT NULL,
    loss_area_ha DOUBLE PRECISION NOT NULL,
    gain_area_ha DOUBLE PRECISION NOT NULL,
    stable_area_ha DOUBLE PRECISION NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    processing_duration_ms INTEGER,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_change_det_baseline ON land_change_detections (baseline_scene_id);
CREATE INDEX IF NOT EXISTS idx_change_det_comp ON land_change_detections (comparison_scene_id);

-- 5. LAND CHANGE EVENTS (Verified Spatial Change Polygons)
CREATE TABLE IF NOT EXISTS land_change_events (
    event_id VARCHAR(128) PRIMARY KEY,
    detection_id VARCHAR(128) REFERENCES land_change_detections(detection_id) ON DELETE SET NULL,
    baseline_scene_id VARCHAR(128) NOT NULL REFERENCES satellite_scenes(scene_id),
    comparison_scene_id VARCHAR(128) NOT NULL REFERENCES satellite_scenes(scene_id),
    event_type VARCHAR(64) NOT NULL, -- 'CANOPY_LOSS', 'DEVEGETATION', 'CLEARING', 'FOREST_DISTURBANCE'
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(32) NOT NULL DEFAULT 'DETECTED' CHECK (status IN ('DETECTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED')),
    area_ha DOUBLE PRECISION NOT NULL,
    mean_delta_index DOUBLE PRECISION NOT NULL,
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    centroid_latitude DOUBLE PRECISION NOT NULL,
    centroid_longitude DOUBLE PRECISION NOT NULL,
    aoi_id VARCHAR(64) NOT NULL,
    kecamatan VARCHAR(128) NOT NULL,
    desa VARCHAR(128),
    forest_zone VARCHAR(128) NOT NULL,
    in_kph BOOLEAN NOT NULL DEFAULT TRUE,
    near_river BOOLEAN NOT NULL DEFAULT FALSE,
    river_distance_m DOUBLE PRECISION,
    near_road BOOLEAN NOT NULL DEFAULT FALSE,
    road_distance_m DOUBLE PRECISION,
    in_peatland BOOLEAN NOT NULL DEFAULT FALSE,
    peat_depth VARCHAR(64),
    confidence_score INTEGER NOT NULL DEFAULT 85 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id),
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    acquisition_date TIMESTAMPTZ NOT NULL,
    processing_date TIMESTAMPTZ NOT NULL,
    processing_method TEXT NOT NULL,
    processing_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_change_events_geom ON land_change_events USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_change_events_type ON land_change_events (event_type);
CREATE INDEX IF NOT EXISTS idx_change_events_severity ON land_change_events (severity);
CREATE INDEX IF NOT EXISTS idx_change_events_forest_zone ON land_change_events (forest_zone);
CREATE INDEX IF NOT EXISTS idx_change_events_acq_date ON land_change_events (acquisition_date);
