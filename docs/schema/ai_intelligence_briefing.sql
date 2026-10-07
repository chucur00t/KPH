-- =========================================================================
-- KPH INTELLIGENCE - AI INTELLIGENCE ENGINE & EXECUTIVE BRIEFING SCHEMA
-- Wilayah Target: Kabupaten Sintang & KPH Sintang Timur, Kalimantan Barat
-- Standard: PostGIS 3.3+ / PostgreSQL 15+
-- FASE 8: 100% PUBLIC DATA, EVIDENCE BUNDLING, GROUNDED GEMINI & BRIEFINGS
-- =========================================================================

-- 1. ENUMS FOR AI INTELLIGENCE
DO $$ BEGIN
    CREATE TYPE intelligence_assessment_type_enum AS ENUM (
        'SITUATION',
        'TREND',
        'ANOMALY',
        'CORRELATION',
        'RISK_INDICATOR',
        'EVENT_SUMMARY',
        'AREA_SUMMARY',
        'EXECUTIVE_BRIEF'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_observation_type_enum AS ENUM (
        'OBSERVATION',
        'DERIVED',
        'CORRELATION',
        'INTERPRETATION'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE intelligence_confidence_enum AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE intelligence_alert_trigger_enum AS ENUM (
        'NEW_HIGH_PRIORITY_EVENT',
        'MULTI_SOURCE_CORRELATION',
        'RECURRING_FIRE_PATTERN',
        'SIGNIFICANT_LAND_CHANGE',
        'RAPID_SITUATION_CHANGE',
        'HIGH_RISK_INDICATOR',
        'IMPORTANT_PUBLIC_REPORT',
        'DATA_ANOMALY'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE data_quality_level_enum AS ENUM (
        'GOOD',
        'FAIR',
        'POOR',
        'INSUFFICIENT'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. AI MODEL REGISTRY TABLE
-- Track approved LLM models, parameters, and task purposes
CREATE TABLE IF NOT EXISTS ai_model_registry (
    model_id VARCHAR(64) PRIMARY KEY,
    provider VARCHAR(64) NOT NULL DEFAULT 'Google DeepMind',
    model_name VARCHAR(128) NOT NULL, -- e.g. 'gemini-3.8-flash'
    model_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    purpose VARCHAR(64) NOT NULL, -- 'EXTRACTION', 'SUMMARIZATION', 'CORRELATION_EXPLANATION', 'BRIEFING', 'NATURAL_LANGUAGE_QUERY'
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.10,
    max_tokens INT NOT NULL DEFAULT 4096,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AI PROMPT REGISTRY TABLE
-- Version-controlled system prompts enforcing zero-hallucination and evidence grounding
CREATE TABLE IF NOT EXISTS ai_prompt_registry (
    prompt_id VARCHAR(64) PRIMARY KEY,
    prompt_name VARCHAR(128) NOT NULL,
    prompt_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    prompt_text TEXT NOT NULL,
    purpose VARCHAR(64) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INTELLIGENCE ASSESSMENTS TABLE
-- Structured assessments synthesized from evidence bundles
CREATE TABLE IF NOT EXISTS intelligence_assessments (
    assessment_id VARCHAR(128) PRIMARY KEY,
    subject_type VARCHAR(64) NOT NULL, -- 'KPH_UNIT', 'EVENT', 'CORRELATION', 'TIMELINE'
    subject_id VARCHAR(128) NOT NULL,
    assessment_type intelligence_assessment_type_enum NOT NULL DEFAULT 'EXECUTIVE_BRIEF',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    summary TEXT NOT NULL,
    observations JSONB NOT NULL DEFAULT '[]',
    derived_findings JSONB NOT NULL DEFAULT '[]',
    interpretations JSONB NOT NULL DEFAULT '[]',
    correlations JSONB NOT NULL DEFAULT '[]',
    uncertainties JSONB NOT NULL DEFAULT '[]',
    data_gaps JSONB NOT NULL DEFAULT '[]',
    confidence intelligence_confidence_enum NOT NULL DEFAULT 'MEDIUM',
    confidence_rationale TEXT NOT NULL,
    evidence_count INT NOT NULL DEFAULT 0,
    source_count INT NOT NULL DEFAULT 0,
    model_name VARCHAR(128) NOT NULL DEFAULT 'gemini-3.8-flash',
    model_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    prompt_version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    evidence_bundle_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_assess_period ON intelligence_assessments(period_start, period_end);

-- 5. INTELLIGENCE ALERTS TABLE
-- Early warnings with strict explanation (WHY_ALERTED, THRESHOLD, EVIDENCE, UNCERTAINTY)
CREATE TABLE IF NOT EXISTS intelligence_alerts (
    alert_id VARCHAR(128) PRIMARY KEY,
    alert_level VARCHAR(32) NOT NULL, -- 'INFO', 'LOW', 'MODERATE', 'HIGH'
    trigger_type intelligence_alert_trigger_enum NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    why_alerted TEXT NOT NULL,
    threshold_applied TEXT NOT NULL,
    data_period TEXT NOT NULL,
    source_count INT NOT NULL DEFAULT 1,
    uncertainty TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW', -- 'NEW', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'
    evidence_bundle_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_intel_alerts_level ON intelligence_alerts(alert_level, status);

-- 6. AI AUDIT LOGS TABLE
-- Complete traceable log for every AI generation query with latency and token usage
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    request_id VARCHAR(128) PRIMARY KEY,
    user_query TEXT,
    intent_detected VARCHAR(64),
    context_ids JSONB NOT NULL DEFAULT '[]',
    model_id VARCHAR(64) NOT NULL,
    prompt_id VARCHAR(64) NOT NULL,
    response TEXT NOT NULL,
    evidence_ids JSONB NOT NULL DEFAULT '[]',
    source_ids JSONB NOT NULL DEFAULT '[]',
    confidence intelligence_confidence_enum NOT NULL DEFAULT 'MEDIUM',
    latency_ms INT NOT NULL DEFAULT 0,
    token_usage JSONB NOT NULL DEFAULT '{"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_created ON ai_audit_logs(created_at DESC);

-- 7. INTELLIGENCE MEMORY & HISTORY TABLE
-- Historical comparative intelligence store (Today vs Last Week vs Last Month)
CREATE TABLE IF NOT EXISTS intelligence_history (
    history_id VARCHAR(128) PRIMARY KEY,
    assessment_id VARCHAR(128) NOT NULL REFERENCES intelligence_assessments(assessment_id) ON DELETE CASCADE,
    period_label VARCHAR(64) NOT NULL, -- 'DAILY_2026_09_30', 'WEEK_39_2026', 'MONTH_09_2026'
    area_id VARCHAR(128) NOT NULL DEFAULT 'AOI-KPH-SINTANG-TIMUR',
    summary TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}',
    evidence_ids JSONB NOT NULL DEFAULT '[]',
    source_ids JSONB NOT NULL DEFAULT '[]',
    model_version VARCHAR(32) NOT NULL,
    prompt_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
