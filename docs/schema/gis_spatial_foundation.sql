-- =========================================================================
-- KPH INTELLIGENCE - GIS & SPATIAL INTELLIGENCE FOUNDATION
-- Target: KPH Sintang Timur & Kabupaten Sintang, Kalimantan Barat
-- Standard: PostGIS 3.3+ / PostgreSQL 15+
-- FASE 4: SPATIAL DATA MODEL & EXTENSION SCHEMA
-- =========================================================================

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. ENUMS FOR GIS LAYERS
CREATE TYPE gis_layer_category_enum AS ENUM (
    'KPH Boundary',
    'Kabupaten',
    'Kecamatan',
    'Desa',
    'Sungai',
    'Jalan',
    'Kawasan Hutan',
    'Fungsi Kawasan',
    'Tutupan Lahan',
    'Gambut',
    'Perhutanan Sosial',
    'Perkebunan',
    'Pertambangan',
    'Konsesi/Izin publik',
    'Infrastruktur publik',
    'Fire Events',
    'Land Change Events',
    'OSINT Events',
    'Intelligence Events'
);

CREATE TYPE gis_data_status_enum AS ENUM (
    'AVAILABLE',
    'PARTIAL',
    'NOT_AVAILABLE',
    'ERROR',
    'STALE'
);

-- 2. GIS LAYER REGISTRY TABLE
-- Single Source of Truth for all spatial layer definitions
CREATE TABLE IF NOT EXISTS gis_layers (
    layer_id VARCHAR(64) PRIMARY KEY,
    layer_name VARCHAR(255) NOT NULL,
    layer_code VARCHAR(64) NOT NULL UNIQUE,
    category gis_layer_category_enum NOT NULL,
    description TEXT NOT NULL,
    geometry_type VARCHAR(32) NOT NULL, -- Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id) ON UPDATE CASCADE,
    source_layer_name VARCHAR(255) NOT NULL,
    source_url TEXT NOT NULL,
    license VARCHAR(255) NOT NULL,
    attribution TEXT NOT NULL,
    srid INTEGER NOT NULL DEFAULT 4326, -- Default WGS84
    style_config JSONB NOT NULL DEFAULT '{"color": "#10b981", "weight": 2, "fillOpacity": 0.2}',
    visibility_default BOOLEAN NOT NULL DEFAULT TRUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status gis_data_status_enum NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SPATIAL FEATURES TABLE
-- Normalized storage for all vector features across layers with GiST indexing
CREATE TABLE IF NOT EXISTS gis_spatial_features (
    feature_id VARCHAR(128) PRIMARY KEY,
    layer_id VARCHAR(64) NOT NULL REFERENCES gis_layers(layer_id) ON DELETE CASCADE,
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id),
    source_record_id VARCHAR(128),
    properties JSONB NOT NULL DEFAULT '{}',
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    bbox GEOMETRY(Polygon, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. SPATIAL GIST INDEXES
CREATE INDEX IF NOT EXISTS idx_gis_features_geom ON gis_spatial_features USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_gis_features_bbox ON gis_spatial_features USING GIST (bbox);
CREATE INDEX IF NOT EXISTS idx_gis_features_layer ON gis_spatial_features(layer_id);
CREATE INDEX IF NOT EXISTS idx_gis_features_source ON gis_spatial_features(source_id);
CREATE INDEX IF NOT EXISTS idx_gis_layers_cat ON gis_layers(category);
CREATE INDEX IF NOT EXISTS idx_gis_layers_status ON gis_layers(data_status);

-- 5. SPATIAL FUNCTIONS FOR GEODESIC CALCULATIONS & ENRICHMENT

-- 5.1 Geodesic Distance in Meters using Geography cast (WGS 84 Ellipsoid)
CREATE OR REPLACE FUNCTION fn_geodesic_distance_meters(
    geom1 GEOMETRY,
    geom2 GEOMETRY
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_Distance(geom1::geography, geom2::geography);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5.2 Geodesic Polygon Area in Hectares
CREATE OR REPLACE FUNCTION fn_geodesic_area_ha(
    geom GEOMETRY
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    -- ST_Area on geography returns square meters; 1 hectare = 10,000 sq meters
    RETURN ST_Area(geom::geography) / 10000.0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5.3 Point-in-Polygon Query Function
CREATE OR REPLACE FUNCTION fn_point_in_polygon(
    pt_lat DOUBLE PRECISION,
    pt_lon DOUBLE PRECISION,
    target_layer_id VARCHAR(64)
) RETURNS TABLE (
    feature_id VARCHAR(128),
    properties JSONB
) AS $$
DECLARE
    pt GEOMETRY;
BEGIN
    pt := ST_SetSRID(ST_MakePoint(pt_lon, pt_lat), 4326);
    RETURN QUERY
    SELECT f.feature_id, f.properties
    FROM gis_spatial_features f
    WHERE f.layer_id = target_layer_id
      AND ST_Contains(f.geometry, pt);
END;
$$ LANGUAGE plpgsql STABLE;

-- 5.4 Geodesic Buffer Generation (Distance in Meters)
CREATE OR REPLACE FUNCTION fn_geodesic_buffer(
    geom GEOMETRY,
    distance_meters DOUBLE PRECISION
) RETURNS GEOMETRY AS $$
BEGIN
    RETURN ST_Transform(
        ST_Buffer(geom::geography, distance_meters)::geometry,
        4326
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
