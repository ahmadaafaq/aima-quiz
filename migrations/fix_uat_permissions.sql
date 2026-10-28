-- ===========================================================================
-- AIMA India Case League 2026 — Fix UAT Schema Permissions
-- File: migrations/fix_uat_permissions.sql
--
-- Run this in Supabase Dashboard -> SQL Editor
-- This grants full operational permissions on the `uat` sandbox schema,
-- matching the public production schema so that all admin saves, quiz edits,
-- and attempts work smoothly without "permission denied" errors.
-- ===========================================================================

-- 1. Grant Schema Usage & Privileges
GRANT USAGE, CREATE ON SCHEMA uat TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA uat TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA uat TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA uat TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA uat GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA uat GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA uat GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Enable RLS and Grant Permissive Access for all UAT tables

-- uat.quiz_programs
ALTER TABLE uat.quiz_programs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.quiz_programs TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on quiz_programs" ON uat.quiz_programs;
DROP POLICY IF EXISTS "UAT Public read quiz_programs" ON uat.quiz_programs;
CREATE POLICY "UAT Allow all on quiz_programs"
    ON uat.quiz_programs FOR ALL USING (true) WITH CHECK (true);

-- uat.registrations
ALTER TABLE uat.registrations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.registrations TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on registrations" ON uat.registrations;
DROP POLICY IF EXISTS "UAT Allow anon submit and read registrations" ON uat.registrations;
CREATE POLICY "UAT Allow all on registrations"
    ON uat.registrations FOR ALL USING (true) WITH CHECK (true);

-- uat.participants
ALTER TABLE uat.participants ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.participants TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on participants" ON uat.participants;
CREATE POLICY "UAT Allow all on participants"
    ON uat.participants FOR ALL USING (true) WITH CHECK (true);

-- uat.quiz_questions
ALTER TABLE uat.quiz_questions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.quiz_questions TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on quiz_questions" ON uat.quiz_questions;
CREATE POLICY "UAT Allow all on quiz_questions"
    ON uat.quiz_questions FOR ALL USING (true) WITH CHECK (true);

-- uat.quiz_program_questions
ALTER TABLE uat.quiz_program_questions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.quiz_program_questions TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on quiz_program_questions" ON uat.quiz_program_questions;
CREATE POLICY "UAT Allow all on quiz_program_questions"
    ON uat.quiz_program_questions FOR ALL USING (true) WITH CHECK (true);

-- uat.quiz_attempts
ALTER TABLE uat.quiz_attempts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.quiz_attempts TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on quiz_attempts" ON uat.quiz_attempts;
CREATE POLICY "UAT Allow all on quiz_attempts"
    ON uat.quiz_attempts FOR ALL USING (true) WITH CHECK (true);

-- uat.profiles
ALTER TABLE uat.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.profiles TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on profiles" ON uat.profiles;
CREATE POLICY "UAT Allow all on profiles"
    ON uat.profiles FOR ALL USING (true) WITH CHECK (true);

-- uat.competition_config
ALTER TABLE uat.competition_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.competition_config TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on competition_config" ON uat.competition_config;
CREATE POLICY "UAT Allow all on competition_config"
    ON uat.competition_config FOR ALL USING (true) WITH CHECK (true);

-- uat.jury_evaluations
ALTER TABLE uat.jury_evaluations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.jury_evaluations TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on jury_evaluations" ON uat.jury_evaluations;
CREATE POLICY "UAT Allow all on jury_evaluations"
    ON uat.jury_evaluations FOR ALL USING (true) WITH CHECK (true);

-- uat.audit_logs
ALTER TABLE uat.audit_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.audit_logs TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "UAT Allow all on audit_logs" ON uat.audit_logs;
CREATE POLICY "UAT Allow all on audit_logs"
    ON uat.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 3. Ensure Super Admin profile exists in uat.profiles
INSERT INTO uat.profiles (
    id, email, role, name, mobile, organization_name, registration_number, is_team_leader, updated_at
)
SELECT 
    id, email, 'admin', COALESCE(raw_user_meta_data->>'name', 'Dr. Rajan Saxena'),
    '+91 98111 00000', 'AIMA Secretariat HQ', 'AIMA-HQ-ADMIN', false, now()
FROM auth.users
WHERE email = 'admin@aima.in'
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();

-- 4. Reload PostgREST to apply schema permissions immediately
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, uat';
NOTIFY pgrst, 'reload config';
