-- =========================================================================
-- KPH INTELLIGENCE - PUBLIC DATA SOURCE REGISTRY SCHEMA
-- Wilayah Target: KPH Sintang Timur & Kabupaten Sintang, Kalimantan Barat
-- Standard: PostGIS / PostgreSQL 15+
-- FASE 3: DATABASE SCHEMA SPECIFICATION
-- =========================================================================

-- 1. ENUM TYPES & DOMAINS
CREATE TYPE source_category_enum AS ENUM (
    'Satellite',
    'Fire',
    'Weather',
    'Air Quality',
    'GIS',
    'Administrative',
    'Forest',
    'Land Cover',
    'Peatland',
    'Infrastructure',
    'Agriculture',
    'Mining',
    'Plantation',
    'Social Forestry',
    'Regulation',
    'News',
    'Public Web',
    'Company Public Information'
);

CREATE TYPE source_access_method_enum AS ENUM (
    'REST API',
    'WMS',
    'WFS',
    'WMTS',
    'GeoJSON',
    'CSV',
    'JSON',
    'RSS',
    'HTML',
    'File Download',
    'STAC',
    'Other'
);

CREATE TYPE source_status_enum AS ENUM (
    'ACTIVE',
    'DEGRADED',
    'OFFLINE',
    'UNVERIFIED',
    'REQUIRES REVIEW'
);

-- 2. PUBLIC DATA SOURCE REGISTRY TABLE
-- Single Source of Truth for all external public data ingestion
CREATE TABLE IF NOT EXISTS public_data_source_registry (
    source_id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    category source_category_enum NOT NULL,
    description TEXT NOT NULL,
    coverage VARCHAR(255) NOT NULL,
    data_type VARCHAR(128) NOT NULL,
    format VARCHAR(64) NOT NULL,
    access_method source_access_method_enum NOT NULL,
    endpoint TEXT NOT NULL,
    documentation_url TEXT NOT NULL,
    license VARCHAR(255) NOT NULL,
    update_frequency VARCHAR(128) NOT NULL,
    last_successful_update TIMESTAMPTZ,
    status source_status_enum NOT NULL DEFAULT 'UNVERIFIED',
    reliability VARCHAR(128) NOT NULL,
    attribution TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Hard constraint: Unverified endpoint must have UNVERIFIED status
    CONSTRAINT chk_endpoint_not_empty CHECK (LENGTH(endpoint) > 0),
    CONSTRAINT chk_doc_url_not_empty CHECK (LENGTH(documentation_url) > 0),
    CONSTRAINT chk_source_id_format CHECK (source_id ~ '^[A-Z0-9_\-]+$')
);

-- 3. SOURCE PROVENANCE RECORDS
-- Enforces mandatory data provenance traceability for all ingested data
CREATE TABLE IF NOT EXISTS source_provenance_records (
    provenance_id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    source_record_id VARCHAR(128) NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ,
    source_url TEXT NOT NULL,
    raw_reference TEXT NOT NULL, -- SHA-256 or storage object URI
    http_status SMALLINT,
    records_count INTEGER DEFAULT 1,
    hash_sha256 VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. SOURCE HEALTH CHECK LOGS
-- Audit trail of automated and manual endpoint health checks
CREATE TABLE IF NOT EXISTS source_health_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(64) NOT NULL REFERENCES public_data_source_registry(source_id) ON UPDATE CASCADE ON DELETE CASCADE,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status source_status_enum NOT NULL,
    http_status_code SMALLINT,
    latency_ms INTEGER,
    error_message TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. INDEXES FOR HIGH-THROUGHPUT FILTERING & AUDITING
CREATE INDEX idx_registry_category ON public_data_source_registry(category);
CREATE INDEX idx_registry_status ON public_data_source_registry(status);
CREATE INDEX idx_registry_access_method ON public_data_source_registry(access_method);
CREATE INDEX idx_provenance_source_id ON source_provenance_records(source_id);
CREATE INDEX idx_provenance_retrieved_at ON source_provenance_records(retrieved_at DESC);
CREATE INDEX idx_provenance_source_record ON source_provenance_records(source_record_id);
CREATE INDEX idx_health_logs_source ON source_health_logs(source_id, checked_at DESC);

-- 6. AUTOMATED UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_registry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registry_updated_at ON public_data_source_registry;
CREATE TRIGGER trg_registry_updated_at
BEFORE UPDATE ON public_data_source_registry
FOR EACH ROW EXECUTE FUNCTION update_registry_timestamp();
