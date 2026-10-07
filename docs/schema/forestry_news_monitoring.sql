-- ============================================================================
-- KPH INTELLIGENCE - PHASE 10A: FORESTRY ILLEGAL ACTIVITY NEWS & REPORT SCHEMA
-- Database: PostgreSQL 15+ with PostGIS 3.3+ (EPSG:4326)
-- Target Region: Kabupaten Sintang, KPH Sintang Timur, Kalimantan Barat
-- 100% Public Data Only, Zero Private Channel Dependency, Source-First Provenance
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Forestry News & OSINT Sources
CREATE TABLE IF NOT EXISTS forestry_news_sources (
    source_id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    source_category VARCHAR(64) NOT NULL, -- OFFICIAL_GOV, POLICE_JUDICIARY, NEWS_WIRE, REGIONAL_PRESS, NGO_PORTAL
    source_region VARCHAR(128) DEFAULT 'Kalimantan Barat',
    source_language VARCHAR(32) DEFAULT 'id',
    base_url TEXT NOT NULL,
    rss_supported BOOLEAN DEFAULT FALSE,
    rss_url TEXT,
    api_supported BOOLEAN DEFAULT FALSE,
    crawl_method VARCHAR(32) DEFAULT 'RSS',
    crawl_frequency VARCHAR(32) DEFAULT 'HOURLY',
    monitoring_priority VARCHAR(32) DEFAULT 'HIGH', -- AUTHORITATIVE, HIGH, MEDIUM, LOW
    monitoring_enabled BOOLEAN DEFAULT TRUE,
    keyword_profile JSONB DEFAULT '[]'::jsonb,
    last_success_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, DEGRADED, OFFLINE, UNVERIFIED
    http_status INTEGER DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forestry_sources_status ON forestry_news_sources(status);
CREATE INDEX IF NOT EXISTS idx_forestry_sources_priority ON forestry_news_sources(monitoring_priority);

-- 2. Raw Public News Records (with content hash for deduplication)
CREATE TABLE IF NOT EXISTS forestry_news_records (
    record_id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) REFERENCES forestry_news_sources(source_id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    subtitle TEXT,
    publisher VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    language VARCHAR(32) DEFAULT 'id',
    content_type VARCHAR(64) DEFAULT 'NEWS_ARTICLE',
    content_hash VARCHAR(64) NOT NULL, -- SHA-256
    raw_reference TEXT,
    text_content TEXT NOT NULL,
    summary TEXT,
    relevance_score NUMERIC(5, 2) DEFAULT 0.0,
    source_priority VARCHAR(32) NOT NULL,
    retrieval_status VARCHAR(64) DEFAULT 'SUCCESS',
    cluster_id VARCHAR(64), -- Syndication group ID
    is_syndicated_copy BOOLEAN DEFAULT FALSE,
    report_status VARCHAR(64) DEFAULT 'ORIGINAL_REPORT', -- ORIGINAL_REPORT, UPDATED_REPORT, CORRECTION, RETRACTION
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forestry_records_hash ON forestry_news_records(content_hash);
CREATE INDEX IF NOT EXISTS idx_forestry_records_published_at ON forestry_news_records(published_at);
CREATE INDEX IF NOT EXISTS idx_forestry_records_cluster ON forestry_news_records(cluster_id);
CREATE INDEX IF NOT EXISTS idx_forestry_records_relevance ON forestry_news_records(relevance_score);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_forestry_records_fts ON forestry_news_records USING GIN(to_tsvector('indonesian', title || ' ' || COALESCE(summary, '') || ' ' || text_content));

-- 3. Extracted Forestry News Claims (Preserving exact quotes)
CREATE TABLE IF NOT EXISTS forestry_news_claims (
    claim_id VARCHAR(64) PRIMARY KEY,
    record_id VARCHAR(64) REFERENCES forestry_news_records(record_id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    claim_type VARCHAR(64) NOT NULL, -- ALLEGATION, PUBLIC_REPORT, OFFICIAL_STATEMENT, INVESTIGATION, ENFORCEMENT, LEGAL_FINDING, CONVICTION
    subject VARCHAR(255),
    predicate VARCHAR(255),
    object VARCHAR(255),
    event_date TIMESTAMP WITH TIME ZONE,
    location_name VARCHAR(255),
    source_excerpt TEXT NOT NULL,
    source_url TEXT NOT NULL,
    extraction_method VARCHAR(64) DEFAULT 'NLP_EXTRACTOR',
    confidence VARCHAR(32) DEFAULT 'HIGH',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forestry_claims_record ON forestry_news_claims(record_id);
CREATE INDEX IF NOT EXISTS idx_forestry_claims_type ON forestry_news_claims(claim_type);

-- 4. Extracted Forestry News Events (With location precision & cross-module correlation)
CREATE TABLE IF NOT EXISTS forestry_news_events (
    event_id VARCHAR(64) PRIMARY KEY,
    record_id VARCHAR(64) REFERENCES forestry_news_records(record_id) ON DELETE CASCADE,
    source_count INTEGER DEFAULT 1,
    source_records JSONB DEFAULT '[]'::jsonb,
    event_type VARCHAR(64) NOT NULL, -- FORESTRY, FIRE, MINING, PLANTATION, WILDLIFE, ENFORCEMENT, COURT_CASE
    activity_type VARCHAR(64) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    location_precision VARCHAR(32) NOT NULL, -- EXACT, VILLAGE, DISTRICT, REGENCY, PROVINCE
    location_confidence VARCHAR(32) NOT NULL,
    geometry GEOMETRY(Geometry, 4326),
    centroid GEOMETRY(Point, 4326),
    entities JSONB DEFAULT '[]'::jsonb,
    legal_status VARCHAR(64) NOT NULL, -- ALLEGED, REPORTED, UNDER_INVESTIGATION, ENFORCEMENT_REPORTED, CONVICTED, etc.
    legal_status_reason TEXT NOT NULL,
    claim_type VARCHAR(64) NOT NULL,
    confidence VARCHAR(32) DEFAULT 'HIGH',
    monitoring_priority VARCHAR(32) DEFAULT 'HIGH',
    status VARCHAR(64) DEFAULT 'REPORTED', -- REPORTED, EXTRACTED, CORRELATED, REQUIRES_REVIEW, CONFIRMED_BY_PUBLIC_AUTHORITY, DISMISSED
    
    -- Cross-Module Correlations
    satellite_correlated BOOLEAN DEFAULT FALSE,
    satellite_event_id VARCHAR(64),
    fire_correlated BOOLEAN DEFAULT FALSE,
    fire_event_id VARCHAR(64),
    gis_context JSONB,
    
    has_source_conflict BOOLEAN DEFAULT FALSE,
    source_conflict_notes TEXT,
    report_status VARCHAR(64) DEFAULT 'ORIGINAL_REPORT',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forestry_events_geom ON forestry_news_events USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_forestry_events_activity ON forestry_news_events(activity_type);
CREATE INDEX IF NOT EXISTS idx_forestry_events_legal ON forestry_news_events(legal_status);
CREATE INDEX IF NOT EXISTS idx_forestry_events_priority ON forestry_news_events(monitoring_priority);
CREATE INDEX IF NOT EXISTS idx_forestry_events_date ON forestry_news_events(event_date);
