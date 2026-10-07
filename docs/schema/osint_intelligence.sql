-- =========================================================================
-- KPH INTELLIGENCE - OSINT INTELLIGENCE & OPEN-SOURCE INTELLIGENCE SCHEMA
-- Wilayah Target: Kabupaten Sintang & KPH Sintang Timur, Kalimantan Barat
-- Standard: PostGIS 3.3+ / PostgreSQL 15+
-- FASE 7: 100% PUBLIC OSINT INGESTION, PROVENANCE, EXTRACTION & CORRELATION
-- =========================================================================

-- 1. ENUMS FOR OSINT INTELLIGENCE
DO $$ BEGIN
    CREATE TYPE osint_source_type_enum AS ENUM (
        'NEWS',
        'GOVERNMENT_WEBSITE',
        'JDIH',
        'PUBLIC_DOCUMENT',
        'PUBLIC_REPORT',
        'PUBLIC_COMPANY_INFORMATION',
        'ACADEMIC_PUBLICATION',
        'ENVIRONMENTAL_PUBLICATION',
        'FORESTRY_PUBLICATION',
        'AGRICULTURE_PUBLICATION',
        'MINING_PUBLICATION',
        'PLANTATION_PUBLICATION',
        'SOCIAL_FORESTRY_PUBLICATION',
        'RSS',
        'PUBLIC_API',
        'PUBLIC_WEB'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE osint_source_status_enum AS ENUM (
        'ACTIVE',
        'DEGRADED',
        'OFFLINE',
        'UNVERIFIED',
        'BLOCKED',
        'REQUIRES_REVIEW',
        'ACCESS_RESTRICTED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE robots_status_enum AS ENUM (
        'ALLOWED',
        'DISALLOWED',
        'UNKNOWN',
        'NO_ROBOTS'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE osint_entity_type_enum AS ENUM (
        'ORGANIZATION',
        'COMPANY',
        'AGENCY',
        'LOCATION',
        'LEGAL_REGULATION',
        'COMMODITY',
        'PERSON'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE osint_activity_type_enum AS ENUM (
        'LAND_CLEARING_REPORTED',
        'FIRE_INCIDENT_REPORTED',
        'TIMBER_TRANSPORT_REPORTED',
        'REGULATION_PERMIT_ISSUED',
        'TENURIAL_DISPUTE_REPORTED',
        'SOCIAL_FORESTRY_REHAB_REPORTED',
        'ENVIRONMENTAL_INVESTIGATION',
        'PUBLIC_MEETING_OR_HEARING'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE extraction_confidence_enum AS ENUM (
        'HIGH',
        'MEDIUM',
        'LOW'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE geocoding_precision_enum AS ENUM (
        'COORDINATE_MENTIONED',
        'DESA',
        'KECAMATAN',
        'KABUPATEN',
        'PROVINSI',
        'NONE'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. OSINT SOURCES REGISTRY TABLE
-- Master registry of legal, open public sources
CREATE TABLE IF NOT EXISTS osint_sources (
    source_id VARCHAR(128) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    source_type osint_source_type_enum NOT NULL,
    base_url TEXT NOT NULL,
    rss_url TEXT,
    api_url TEXT,
    sitemap_url TEXT,
    coverage_area VARCHAR(255) NOT NULL DEFAULT 'Kabupaten Sintang & Kalimantan Barat',
    language VARCHAR(16) NOT NULL DEFAULT 'id',
    access_method VARCHAR(64) NOT NULL DEFAULT 'RSS',
    license TEXT NOT NULL,
    terms_url TEXT,
    robots_status robots_status_enum NOT NULL DEFAULT 'UNKNOWN',
    crawl_frequency VARCHAR(64) NOT NULL DEFAULT 'DAILY',
    last_crawled_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    status osint_source_status_enum NOT NULL DEFAULT 'UNVERIFIED',
    reliability_score NUMERIC(4, 2) NOT NULL DEFAULT 70.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RAW OSINT SOURCE RECORDS TABLE
-- Ingested raw public web / RSS / API items with content hash for deduplication
CREATE TABLE IF NOT EXISTS osint_source_records (
    record_id VARCHAR(128) PRIMARY KEY,
    source_id VARCHAR(128) NOT NULL REFERENCES osint_sources(source_id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    canonical_url TEXT,
    title TEXT NOT NULL,
    author VARCHAR(255),
    publisher VARCHAR(255) NOT NULL,
    published_at TIMESTAMPTZ,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content_type VARCHAR(64) NOT NULL DEFAULT 'text/html',
    language VARCHAR(16) NOT NULL DEFAULT 'id',
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 for deduplication
    raw_reference TEXT NOT NULL, -- Storage reference or raw snippet
    text_content TEXT NOT NULL, -- Extracted readable plain text
    summary TEXT,
    http_status INT NOT NULL DEFAULT 200,
    retrieval_status VARCHAR(64) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osint_records_hash ON osint_source_records(content_hash);
CREATE INDEX IF NOT EXISTS idx_osint_records_source_pub ON osint_source_records(source_id, published_at DESC);

-- 4. RAW SNAPSHOTS AUDIT TABLE
-- File-level audit snapshot storage tracking
CREATE TABLE IF NOT EXISTS osint_snapshots (
    snapshot_id VARCHAR(128) PRIMARY KEY,
    record_id VARCHAR(128) NOT NULL REFERENCES osint_source_records(record_id) ON DELETE CASCADE,
    storage_reference TEXT NOT NULL, -- e.g. /raw/osint/2026/09/30/record-id/snapshot.html
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mime_type VARCHAR(64) NOT NULL DEFAULT 'text/html',
    byte_size INT NOT NULL DEFAULT 0,
    checksum_sha256 VARCHAR(64) NOT NULL
);

-- 5. OSINT EXTRACTED ENTITIES TABLE
-- Discovered entities (Persons, Organizations, Companies, Regulations, Commodities, Locations)
CREATE TABLE IF NOT EXISTS osint_entities (
    entity_id VARCHAR(128) PRIMARY KEY,
    record_id VARCHAR(128) NOT NULL REFERENCES osint_source_records(record_id) ON DELETE CASCADE,
    entity_name VARCHAR(255) NOT NULL,
    entity_type osint_entity_type_enum NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    confidence extraction_confidence_enum NOT NULL DEFAULT 'MEDIUM',
    context_sentence TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osint_entities_norm ON osint_entities(normalized_name);
CREATE INDEX IF NOT EXISTS idx_osint_entities_type ON osint_entities(entity_type);

-- 6. OSINT ACTIVITIES TABLE
-- Reported activities extracted from text (without criminalization)
CREATE TABLE IF NOT EXISTS osint_activities (
    activity_id VARCHAR(128) PRIMARY KEY,
    record_id VARCHAR(128) NOT NULL REFERENCES osint_source_records(record_id) ON DELETE CASCADE,
    activity_type osint_activity_type_enum NOT NULL,
    activity_description TEXT NOT NULL,
    verbatim_quote TEXT NOT NULL,
    reported_date TIMESTAMPTZ,
    confidence extraction_confidence_enum NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. OSINT INTELLIGENCE EVENTS TABLE
-- Correlated, structured intelligence event derived from open source evidence
CREATE TABLE IF NOT EXISTS osint_events (
    event_id VARCHAR(128) PRIMARY KEY,
    event_code VARCHAR(64) NOT NULL UNIQUE, -- e.g. OSINT-EVT-STG-2026-001
    primary_record_id VARCHAR(128) NOT NULL REFERENCES osint_source_records(record_id),
    activity_type osint_activity_type_enum NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    taxonomic_stage VARCHAR(32) NOT NULL DEFAULT 'REPORTED',
    kabupaten VARCHAR(128) NOT NULL DEFAULT 'Kabupaten Sintang',
    kecamatan VARCHAR(128),
    desa VARCHAR(128),
    forest_zone VARCHAR(128) NOT NULL DEFAULT 'Data tidak tersedia',
    geocoding_precision geocoding_precision_enum NOT NULL DEFAULT 'KECAMATAN',
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    geometry GEOMETRY(Geometry, 4326),
    occurred_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ NOT NULL,
    source_count INT NOT NULL DEFAULT 1,
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 75.00,
    is_spatial_correlated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osint_events_geo ON osint_events USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_osint_events_kecamatan ON osint_events(kecamatan);

-- 8. OSINT SPATIAL CORRELATIONS TABLE
-- Connects OSINT event with Spatial/GIS layers, Satellite Land Change (Fase 5), and Fire Events (Fase 6)
CREATE TABLE IF NOT EXISTS osint_spatial_correlations (
    correlation_id VARCHAR(128) PRIMARY KEY,
    osint_event_id VARCHAR(128) NOT NULL REFERENCES osint_events(event_id) ON DELETE CASCADE,
    target_module VARCHAR(64) NOT NULL, -- 'GIS_FOREST_ZONE', 'GIS_PEATLAND', 'SATELLITE_LAND_CHANGE', 'FIRE_HOTSPOT'
    target_id VARCHAR(128) NOT NULL, -- ID of land change event, fire event, or GIS polygon
    correlation_type VARCHAR(64) NOT NULL, -- 'SPATIAL_COINCIDENCE', 'TEMPORAL_WINDOW_MATCH', 'JURISDICTION_INTERSECT'
    distance_meters NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    time_delta_hours NUMERIC(8, 2),
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 80.00,
    correlation_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osint_corr_event ON osint_spatial_correlations(osint_event_id);
CREATE INDEX IF NOT EXISTS idx_osint_corr_target ON osint_spatial_correlations(target_module, target_id);

-- 9. OSINT EXTRACTION RUNS TABLE
-- Execution audit trail for batch discovery, harvesting, and extraction runs
CREATE TABLE IF NOT EXISTS osint_extraction_runs (
    run_id VARCHAR(128) PRIMARY KEY,
    run_type VARCHAR(64) NOT NULL, -- 'HARVEST_RSS', 'EXTRACT_ENTITIES', 'SPATIAL_CORRELATION'
    collector_type VARCHAR(64) NOT NULL,
    sources_processed INT NOT NULL DEFAULT 0,
    records_ingested INT NOT NULL DEFAULT 0,
    entities_extracted INT NOT NULL DEFAULT 0,
    events_generated INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    duration_ms INT NOT NULL DEFAULT 0,
    error_summary TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);
