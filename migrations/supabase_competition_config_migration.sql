-- ==============================================================
-- ALL INDIA MANAGEMENT ASSOCIATION (AIMA) - INDIA CASE LEAGUE 2026
-- Supabase Migration: Dynamic Phase Progression Gates & Audit Vault
-- ==============================================================

-- 1. Table: competition_config
CREATE TABLE IF NOT EXISTS public.competition_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    league_name TEXT NOT NULL DEFAULT 'AIMA-ICRC India Case League',
    year TEXT NOT NULL DEFAULT '2026',
    edition TEXT NOT NULL DEFAULT 'Inaugural National Edition',
    active_stage TEXT NOT NULL DEFAULT 'round_2',
    registration_open BOOLEAN NOT NULL DEFAULT TRUE,
    r1_quiz_start_time TIMESTAMPTZ DEFAULT '2026-09-10T10:00:00Z',
    r1_quiz_end_time TIMESTAMPTZ DEFAULT '2026-09-10T22:00:00Z',
    r1_duration_minutes INT NOT NULL DEFAULT 45,
    r1_negative_marking BOOLEAN NOT NULL DEFAULT TRUE,
    r1_cutoff_score NUMERIC NOT NULL DEFAULT 65,
    r2_submission_deadline TIMESTAMPTZ DEFAULT '2026-09-25T23:59:59Z',
    r2_max_slide_count INT NOT NULL DEFAULT 12,
    r2_max_file_size_mb INT NOT NULL DEFAULT 25,
    r2_evaluators_per_deck INT NOT NULL DEFAULT 2,
    r3_regional_start_date TIMESTAMPTZ DEFAULT '2026-10-15T09:00:00Z',
    r3_max_teams_per_hub INT NOT NULL DEFAULT 24,
    r4_national_finale_date TIMESTAMPTZ DEFAULT '2026-11-05T09:00:00Z',
    fee_r1_r2 NUMERIC NOT NULL DEFAULT 200,
    fee_r3 NUMERIC NOT NULL DEFAULT 2000,
    fee_r4 NUMERIC NOT NULL DEFAULT 2000,
    is_results_locked_r1 BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r2 BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r3 BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r4 BOOLEAN NOT NULL DEFAULT FALSE,
    is_public_results_published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- Seed initial row if absent
INSERT INTO public.competition_config (
    id, active_stage, registration_open, r1_negative_marking, is_public_results_published, updated_at
) VALUES (
    'default', 'round_2', TRUE, TRUE, TRUE, NOW()
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.competition_config ENABLE ROW LEVEL SECURITY;

-- Security Rule: REVOKE all direct client-side mutation privileges from anon & authenticated
REVOKE INSERT, UPDATE, DELETE ON public.competition_config FROM anon, authenticated;

-- Allow public read access to competition_config
DROP POLICY IF EXISTS "Allow public read access to competition_config" ON public.competition_config;
CREATE POLICY "Allow public read access to competition_config"
  ON public.competition_config FOR SELECT
  USING (true);

-- Grant full control only to service_role (used by server backend)
GRANT ALL ON public.competition_config TO service_role;
GRANT SELECT ON public.competition_config TO anon, authenticated;

-- 2. Table: audit_logs (Immutable Server-Side Audit Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    admin_id TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT NOT NULL,
    changed_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    result TEXT NOT NULL DEFAULT 'SUCCESS',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs(admin_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Restrict all mutations on audit_logs from client keys
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;

-- Allow authenticated users to view audit logs
DROP POLICY IF EXISTS "Allow authenticated read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated read audit_logs"
  ON public.audit_logs FOR SELECT
  USING (true);

GRANT ALL ON public.audit_logs TO service_role;
GRANT SELECT ON public.audit_logs TO anon, authenticated;

-- Enable realtime replication for competition_config
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_config;
