-- ============================================================================
-- KPH INTELLIGENCE - PHASE 10: ILLEGAL FORESTRY ACTIVITY & DISTURBANCE SCHEMA
-- Database: PostgreSQL 15+ with PostGIS 3.3+ (EPSG:4326)
-- Target Region: Kesatuan Pengelolaan Hutan (KPH) Sintang Timur, Kalimantan Barat
-- 100% Public Data Only, Zero Private Channel Dependency, Source-First Provenance
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Public Authorizations & Concessions (Permits & Hak Guna Usaha publicly disclosed)
CREATE TABLE IF NOT EXISTS public_authorizations (
    authorization_id VARCHAR(64) PRIMARY KEY,
    permit_type VARCHAR(64) NOT NULL, -- IUPHHK_HA, IUPHHK_HT, HGU_PLANTATION, IUP_MINING, PERHUTANAN_SOSIAL
    holder_name VARCHAR(255) NOT NULL,
    decree_number VARCHAR(128) NOT NULL,
    decree_date DATE NOT NULL,
    valid_until DATE,
    commodity VARCHAR(128),
    total_area_ha NUMERIC(12, 2) NOT NULL,
    boundary_geom GEOMETRY(Geometry, 4326) NOT NULL,
    centroid_geom GEOMETRY(Point, 4326),
    source_agency VARCHAR(128) NOT NULL,
    public_source_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_public_authorizations_geom ON public_authorizations USING GIST(boundary_geom);
CREATE INDEX IF NOT EXISTS idx_public_authorizations_permit_type ON public_authorizations(permit_type);

-- 2. Forestry Activity Indicators
CREATE TABLE IF NOT EXISTS forestry_activity_indicators (
    indicator_id VARCHAR(64) PRIMARY KEY,
    indicator_type VARCHAR(64) NOT NULL, -- FOREST_DISTURBANCE, POTENTIAL_LOGGING, POTENTIAL_LAND_CLEARING, etc.
    indicator_subtype VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Spatial Properties
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    area_ha NUMERIC(10, 2) NOT NULL,
    
    -- Temporal Observation Dates
    detection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    date_before TIMESTAMP WITH TIME ZONE,
    date_after TIMESTAMP WITH TIME ZONE,
    
    -- Source and Evidence counts
    source_count INTEGER DEFAULT 1,
    evidence_count INTEGER DEFAULT 1,
    
    -- Spatial Context & Sensitive Area Overlap
    kecamatan VARCHAR(100),
    desa VARCHAR(100),
    kph_unit VARCHAR(100) DEFAULT 'KPH Sintang Timur',
    forest_overlap_area_ha NUMERIC(10, 2) DEFAULT 0.0,
    forest_overlap_percentage NUMERIC(5, 2) DEFAULT 0.0,
    forest_function VARCHAR(32) NOT NULL, -- HL, HPT, HP, KSA, APL, MIXED
    peatland_overlap BOOLEAN DEFAULT FALSE,
    peatland_name VARCHAR(128),
    social_forestry_overlap BOOLEAN DEFAULT FALSE,
    concession_overlap BOOLEAN DEFAULT FALSE,
    concession_name VARCHAR(128),
    plantation_overlap BOOLEAN DEFAULT FALSE,
    mining_overlap BOOLEAN DEFAULT FALSE,
    
    -- Proximity Analysis (Meters)
    distance_to_road_m NUMERIC(10, 2),
    distance_to_river_m NUMERIC(10, 2),
    distance_to_forest_boundary_m NUMERIC(10, 2),
    
    -- Cross-Module Correlations
    fire_correlation BOOLEAN DEFAULT FALSE,
    fire_event_id VARCHAR(64),
    hotspots_count INTEGER DEFAULT 0,
    land_change_correlation BOOLEAN DEFAULT FALSE,
    land_change_event_id VARCHAR(64),
    ndvi_drop NUMERIC(5, 3),
    osint_correlation BOOLEAN DEFAULT FALSE,
    osint_event_id VARCHAR(64),
    
    -- Public Authorization Spatial Context
    authorization_status VARCHAR(64) NOT NULL, -- WITHIN_PUBLIC_AUTHORIZED_AREA, OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA, etc.
    authorization_reference VARCHAR(128),
    authorization_notes TEXT,
    
    -- Deterministic Scoring (Section 11)
    activity_score NUMERIC(5, 2) NOT NULL, -- 0 to 100
    score_version VARCHAR(32) DEFAULT 'v1.0.0-phase10',
    evidence_strength VARCHAR(32) NOT NULL, -- LOW, MODERATE, STRONG, VERY_STRONG
    confidence VARCHAR(32) NOT NULL, -- LOW, MEDIUM, HIGH
    priority VARCHAR(32) NOT NULL, -- LOW, MODERATE, HIGH, VERY_HIGH
    verification_priority VARCHAR(32) NOT NULL, -- LOW, MEDIUM, HIGH, URGENT
    temporal_pattern VARCHAR(32) NOT NULL, -- NEW, INCREASING, PERSISTENT, RECURRING, EXPANDING
    
    -- Legal Status Model (Section 5 - strictly separated from Activity)
    legal_status VARCHAR(64) NOT NULL, -- UNKNOWN, NOT_ASSESSED, PUBLIC_VIOLATION_REPORTED, REQUIRES_VERIFICATION
    legal_status_reason TEXT NOT NULL,
    
    -- False Positive Management (Section 29)
    status VARCHAR(64) DEFAULT 'DETECTED', -- DETECTED, REVIEW_REQUIRED, SUPPORTED_BY_MULTIPLE_SOURCES, CONFIRMED_BY_PUBLIC_SOURCE, DISMISSED
    false_positive_reason VARCHAR(64) DEFAULT 'NONE',
    review_notes TEXT,
    reviewed_by VARCHAR(128),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    analysis_run_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forestry_act_geom ON forestry_activity_indicators USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_forestry_act_type ON forestry_activity_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_forestry_act_priority ON forestry_activity_indicators(priority);
CREATE INDEX IF NOT EXISTS idx_forestry_act_verif_priority ON forestry_activity_indicators(verification_priority);
CREATE INDEX IF NOT EXISTS idx_forestry_act_legal_status ON forestry_activity_indicators(legal_status);

-- 3. Forestry Activity Evidence (Traceable to public sources)
CREATE TABLE IF NOT EXISTS forestry_activity_evidence (
    evidence_id VARCHAR(64) PRIMARY KEY,
    indicator_id VARCHAR(64) REFERENCES forestry_activity_indicators(indicator_id) ON DELETE CASCADE,
    evidence_type VARCHAR(64) NOT NULL, -- SATELLITE_SPECTRAL, THERMAL_HOTSPOT, GIS_OVERLAP, OSINT_NEWS, ENFORCEMENT_NOTICE
    classification VARCHAR(64) NOT NULL, -- OBSERVATION, DERIVED, CORRELATION, PUBLIC_CLAIM, LEGAL_FINDING, UNCERTAINTY
    source_id VARCHAR(64) NOT NULL,
    source_record_id VARCHAR(128) NOT NULL,
    source_url TEXT NOT NULL,
    source_date TIMESTAMP WITH TIME ZONE NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    source_excerpt TEXT,
    geometry GEOMETRY(Geometry, 4326),
    evidence_strength VARCHAR(32) NOT NULL,
    reliability VARCHAR(32) NOT NULL,
    raw_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forestry_evidence_indicator ON forestry_activity_evidence(indicator_id);
CREATE INDEX IF NOT EXISTS idx_forestry_evidence_type ON forestry_activity_evidence(evidence_type);

-- 4. Forestry Enforcement Events (Public enforcement notices, seizures, police/Gakkum court records)
CREATE TABLE IF NOT EXISTS forestry_enforcement_events (
    enforcement_event_id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL, -- TIMBER_SEIZURE, ILLEGAL_LOGGING_ENFORCEMENT, MINING_ENFORCEMENT, etc.
    agency VARCHAR(128) NOT NULL,
    location VARCHAR(255) NOT NULL,
    kecamatan VARCHAR(100),
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    event_date DATE NOT NULL,
    publication_date DATE NOT NULL,
    case_reference VARCHAR(128) NOT NULL,
    organization VARCHAR(255),
    public_entity VARCHAR(255),
    activity_type VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    legal_reference VARCHAR(255) NOT NULL,
    legal_status VARCHAR(64) NOT NULL,
    source_id VARCHAR(64) NOT NULL,
    source_url TEXT NOT NULL,
    source_excerpt TEXT,
    confidence VARCHAR(32) DEFAULT 'HIGH',
    status VARCHAR(32) DEFAULT 'REPORTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enforcement_events_geom ON forestry_enforcement_events USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_enforcement_events_agency ON forestry_enforcement_events(agency);
CREATE INDEX IF NOT EXISTS idx_enforcement_events_type ON forestry_enforcement_events(event_type);
