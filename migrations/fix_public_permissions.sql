-- ===========================================================================
-- AIMA India Case League 2026 — Fix Public Schema Permissions
-- File: migrations/fix_public_permissions.sql
--
-- PURPOSE:
--   Restores and grants full operational permissions on the `public` schema
--   for `anon`, `authenticated`, and `service_role` roles.
--   SAFE EXECUTION:
--   • DOES NOT DROP OR TRUNCATE ANY TABLES.
--   • DOES NOT ALTER OR REMOVE ANY EXISTING DATA.
--   • ONLY GRANTS TABLE-LEVEL PRIVILEGES & ADDS PERMISSIVE RLS POLICIES.
-- ===========================================================================

-- 1. Grant Schema Usage & Privileges
GRANT USAGE, CREATE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Permissive RLS Policies on Public Tables (No data touched)

-- public.quiz_programs
ALTER TABLE public.quiz_programs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.quiz_programs TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on quiz_programs" ON public.quiz_programs;
CREATE POLICY "Public Allow all on quiz_programs"
    ON public.quiz_programs FOR ALL USING (true) WITH CHECK (true);

-- public.registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.registrations TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on registrations" ON public.registrations;
CREATE POLICY "Public Allow all on registrations"
    ON public.registrations FOR ALL USING (true) WITH CHECK (true);

-- public.participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.participants TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on participants" ON public.participants;
CREATE POLICY "Public Allow all on participants"
    ON public.participants FOR ALL USING (true) WITH CHECK (true);

-- public.quiz_questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.quiz_questions TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on quiz_questions" ON public.quiz_questions;
CREATE POLICY "Public Allow all on quiz_questions"
    ON public.quiz_questions FOR ALL USING (true) WITH CHECK (true);

-- public.quiz_program_questions
ALTER TABLE public.quiz_program_questions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.quiz_program_questions TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on quiz_program_questions" ON public.quiz_program_questions;
CREATE POLICY "Public Allow all on quiz_program_questions"
    ON public.quiz_program_questions FOR ALL USING (true) WITH CHECK (true);

-- public.quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.quiz_attempts TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Public Allow all on quiz_attempts"
    ON public.quiz_attempts FOR ALL USING (true) WITH CHECK (true);

-- public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on profiles" ON public.profiles;
CREATE POLICY "Public Allow all on profiles"
    ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- public.competition_config
ALTER TABLE public.competition_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.competition_config TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on competition_config" ON public.competition_config;
CREATE POLICY "Public Allow all on competition_config"
    ON public.competition_config FOR ALL USING (true) WITH CHECK (true);

-- public.jury_evaluations
ALTER TABLE public.jury_evaluations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.jury_evaluations TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on jury_evaluations" ON public.jury_evaluations;
CREATE POLICY "Public Allow all on jury_evaluations"
    ON public.jury_evaluations FOR ALL USING (true) WITH CHECK (true);

-- public.audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.audit_logs TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public Allow all on audit_logs" ON public.audit_logs;
CREATE POLICY "Public Allow all on audit_logs"
    ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
