-- ===========================================================================
-- AIMA India Case League 2026 — UAT Schema Migration
-- File: migrations/uat_schema_migration.sql
--
-- PURPOSE:
--   Creates a fully isolated `uat` schema that mirrors all tables in the
--   `public` schema. The UAT deployment at aima-quiz.vercel.app will target
--   this schema, leaving production data in `public` completely untouched.
--
-- HOW TO APPLY:
--   1. Open Supabase Dashboard → SQL Editor for project setjjgjhuslevgnqcnhj
--   2. Paste and execute this entire script.
--   3. In Supabase Dashboard → Project Settings → API:
--      Confirm "Exposed schemas" includes both `public` and `uat`.
--      (This script automatically runs ALTER ROLE authenticator SET pgrst.db_schemas).
--   4. Set these Vercel environment variables on the aima-quiz.vercel.app project:
--        VITE_DB_SCHEMA=uat
--        VITE_SUPABASE_URL=https://setjjgjhuslevgnqcnhj.supabase.co
--        VITE_SUPABASE_PUBLISHABLE_KEY=<same anon key as production>
--        SUPABASE_SERVICE_ROLE_KEY=<same service role key as production>
--
-- IMPORTANT NOTES:
--   • Supabase Auth (`auth.users`) is shared across ALL schemas in a single
--     project — this is a Supabase platform constraint. Because this app uses
--     a custom `participants` table (NOT Supabase Auth SDK) for participant login,
--     UAT participant accounts are fully isolated in uat.participants.
--   • The `profiles` table references auth.users(id) — use a dedicated test
--     email domain (e.g. @uat.test) to avoid collision with prod auth users.
--   • Seeding: copies quiz questions from public (or uses fallback 30 questions)
--     so Stage 1 screening quiz is immediately testable in UAT.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 0. Create UAT schema & Expose to PostgREST
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS uat;

GRANT USAGE ON SCHEMA uat TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA uat GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA uat GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA uat GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA uat GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Expose the uat schema to PostgREST API
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, uat';
NOTIFY pgrst, 'reload config';


-- ===========================================================================
-- TABLE 1: uat.quiz_programs
-- (Created first so registrations & participants can reference it)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.quiz_programs (
    id                          TEXT PRIMARY KEY,
    code                        TEXT NOT NULL UNIQUE,
    title                       TEXT NOT NULL,
    tagline                     TEXT,
    description                 TEXT,
    stage                       TEXT NOT NULL DEFAULT 'round_1',
    category                    TEXT,
    status                      TEXT NOT NULL DEFAULT 'live',
    start_time                  TIMESTAMPTZ,
    end_time                    TIMESTAMPTZ,
    duration_minutes            INT NOT NULL DEFAULT 45,
    total_questions             INT NOT NULL DEFAULT 25,
    total_marks                 NUMERIC NOT NULL DEFAULT 100,
    passing_marks               NUMERIC DEFAULT 60,
    cutoff_score                NUMERIC DEFAULT 60,
    negative_marking            BOOLEAN DEFAULT FALSE,
    negative_marks_per_question NUMERIC DEFAULT 0,
    marks_per_question          NUMERIC DEFAULT 4,
    fee                         NUMERIC DEFAULT 0,
    max_intake                  INT DEFAULT 20000,
    enrolled_count              INT DEFAULT 0,
    completed_count             INT DEFAULT 0,
    in_progress_count           INT DEFAULT 0,
    instructions                TEXT[] DEFAULT ARRAY[
        'Each question carries 4 marks. There is NO negative marking for wrong answers.',
        'Unattempted questions score 0.',
        'Q1–Q25 are scored. Q26–Q30 are reserve / tie-breaker questions used only when total scores are tied.',
        'Full-screen lockdown is strictly enforced. Tab switches exceeding 3 violations trigger immediate session flag.',
        'Tie-breaker sequence: Score > Completion Time > Reserve Question Score.'
    ]::TEXT[],
    eligibility                 TEXT DEFAULT 'All registered management students from accredited institutions participating in AIMA India Case League 2026.',
    proctoring_strictness       TEXT DEFAULT 'High (Webcam + Fullscreen + Tab Lock)',
    proctoring_mode             TEXT DEFAULT 'strict_lockdown',
    tags                        TEXT[] DEFAULT ARRAY['Stage 1', 'Case Competition', 'Screening', 'No Negative Marking', 'Proctored', 'UAT']::TEXT[],
    shuffle_questions           BOOLEAN DEFAULT FALSE,
    allow_review                BOOLEAN DEFAULT TRUE,
    is_results_published        BOOLEAN DEFAULT FALSE,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE uat.quiz_programs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.quiz_programs TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "UAT Allow all on quiz_programs" ON uat.quiz_programs;
CREATE POLICY "UAT Allow all on quiz_programs"
    ON uat.quiz_programs FOR ALL USING (true) WITH CHECK (true);

-- Seed Stage 1 UAT quiz program (live for testing)
INSERT INTO uat.quiz_programs (
    id, code, title, tagline, description, stage, category, status,
    start_time, end_time, duration_minutes, total_questions, total_marks,
    passing_marks, cutoff_score, negative_marking, negative_marks_per_question,
    marks_per_question, fee, max_intake, proctoring_strictness, proctoring_mode,
    is_results_published
) VALUES (
    'qp_case_comp_stage1_2026',
    'AIMA-CL26-S1-QZ',
    'Case Competition – Stage 1 Business Quiz [UAT]',
    'Multiple-choice screening round | 25 scored questions + 5 reserve / tie-breaker questions',
    'UAT environment quiz program. Comprehensive business knowledge quiz covering Management Theory, Companies in the News, Management Application, and Brands/Valuation/Startup/VC.',
    'round_1',
    'Management Concepts',
    'live',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '30 days',
    45, 25, 100,
    60, 60, false, 0, 4, 0, 20000,
    'High (Webcam + Fullscreen + Tab Lock)',
    'strict_lockdown',
    false
) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    negative_marking = EXCLUDED.negative_marking,
    negative_marks_per_question = EXCLUDED.negative_marks_per_question,
    updated_at = NOW();


-- ===========================================================================
-- TABLE 2: uat.registrations
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.registrations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL UNIQUE,
    registration_mode   TEXT NOT NULL,
    team_name           TEXT,
    candidate_name      TEXT NOT NULL,
    candidate_email     TEXT NOT NULL,
    candidate_phone     TEXT,
    institute_name      TEXT NOT NULL,
    program             TEXT,
    semester            TEXT,
    enrolment_number    TEXT,
    participant_count   INT DEFAULT 1,
    fee_tier            TEXT,
    subtotal_amount     NUMERIC NOT NULL DEFAULT 0,
    gst_amount          NUMERIC NOT NULL DEFAULT 0,
    total_amount        NUMERIC NOT NULL DEFAULT 0,
    payment_method      TEXT NOT NULL DEFAULT 'PENDING_INVOICE',
    payment_status      TEXT NOT NULL DEFAULT 'PENDING_INVOICE',
    transaction_id      TEXT,
    invoice_number      TEXT NOT NULL,
    nominees            JSONB NOT NULL DEFAULT '[]'::jsonb,
    coordinator_name    TEXT,
    coordinator_email   TEXT,
    coordinator_phone   TEXT,
    institute_address   TEXT,
    city                TEXT,
    state               TEXT,
    pincode             TEXT,
    dpdp_consent        BOOLEAN DEFAULT TRUE,
    quiz_program_id     TEXT DEFAULT 'qp_case_comp_stage1_2026' REFERENCES uat.quiz_programs(id) ON DELETE SET NULL,
    selected_track_id   VARCHAR(100),
    selected_track_name VARCHAR(255),
    track_locked_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    raw_data            JSONB
);

CREATE INDEX IF NOT EXISTS idx_uat_registrations_number  ON uat.registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_uat_registrations_email   ON uat.registrations(candidate_email);
CREATE INDEX IF NOT EXISTS idx_uat_registrations_status  ON uat.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_uat_registrations_mode    ON uat.registrations(registration_mode);
CREATE INDEX IF NOT EXISTS idx_uat_registrations_prog    ON uat.registrations(quiz_program_id);
CREATE INDEX IF NOT EXISTS idx_uat_registrations_created ON uat.registrations(created_at DESC);

ALTER TABLE uat.registrations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.registrations TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "UAT Allow anon submit and read registrations" ON uat.registrations;
CREATE POLICY "UAT Allow anon submit and read registrations"
    ON uat.registrations FOR ALL USING (true) WITH CHECK (true);

-- Function & Trigger: Keep quiz_programs.enrolled_count synchronized
CREATE OR REPLACE FUNCTION uat.sync_quiz_program_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  target_prog_id TEXT;
  candidate_total INT;
BEGIN
  target_prog_id := COALESCE(NEW.quiz_program_id, 'qp_case_comp_stage1_2026');

  SELECT COALESCE(SUM(
    COALESCE(
      r.participant_count,
      CASE 
        WHEN jsonb_typeof(r.nominees) = 'array' THEN jsonb_array_length(r.nominees)
        ELSE 1
      END,
      1
    )
  ), 0)
  INTO candidate_total
  FROM uat.registrations r
  WHERE r.quiz_program_id = target_prog_id OR (target_prog_id = 'qp_case_comp_stage1_2026' AND r.quiz_program_id IS NULL);

  UPDATE uat.quiz_programs
  SET enrolled_count = candidate_total,
      updated_at = NOW()
  WHERE id = target_prog_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_uat_sync_quiz_program_enrollment ON uat.registrations;
CREATE TRIGGER trg_uat_sync_quiz_program_enrollment
  AFTER INSERT OR UPDATE OR DELETE ON uat.registrations
  FOR EACH ROW
  EXECUTE FUNCTION uat.sync_quiz_program_enrollment();


-- ===========================================================================
-- TABLE 3: uat.participants
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.participants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL,
    registration_mode   TEXT NOT NULL,
    institute_name      TEXT NOT NULL,
    username            TEXT NOT NULL,
    email               TEXT NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    name                TEXT NOT NULL,
    mobile              TEXT,
    program             TEXT,
    semester            TEXT,
    enrolment_number    TEXT,
    is_team_leader      BOOLEAN DEFAULT FALSE,
    coordinator_name    TEXT,
    coordinator_email   TEXT,
    quiz_program_id     TEXT DEFAULT 'qp_case_comp_stage1_2026' REFERENCES uat.quiz_programs(id) ON DELETE SET NULL,
    selected_track_id   VARCHAR(100),
    selected_track_name VARCHAR(255),
    track_locked_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uat_participants_reg_num ON uat.participants(registration_number);
CREATE INDEX IF NOT EXISTS idx_uat_participants_email  ON uat.participants(email);
CREATE INDEX IF NOT EXISTS idx_uat_participants_prog   ON uat.participants(quiz_program_id);

ALTER TABLE uat.participants ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.participants TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "UAT Allow all on participants" ON uat.participants;
CREATE POLICY "UAT Allow all on participants"
    ON uat.participants FOR ALL USING (true) WITH CHECK (true);


-- ===========================================================================
-- TABLE 4: uat.quiz_questions
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.quiz_questions (
    id                    TEXT PRIMARY KEY,
    q_no                  INT,
    section               TEXT,
    topic                 TEXT,
    question_type         TEXT DEFAULT 'Main',
    benchmark_style       TEXT,
    source                TEXT,
    question_text         TEXT NOT NULL,
    options               TEXT[] NOT NULL,
    correct_answer_index  INT NOT NULL,
    marks                 NUMERIC NOT NULL DEFAULT 4,
    negative_marks        NUMERIC NOT NULL DEFAULT 0,
    difficulty            TEXT NOT NULL DEFAULT 'Medium',
    category              TEXT NOT NULL,
    explanation           TEXT,
    caselet_snippet       TEXT,
    is_active             BOOLEAN DEFAULT TRUE,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE uat.quiz_questions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.quiz_questions TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "UAT Allow all on quiz_questions" ON uat.quiz_questions;
CREATE POLICY "UAT Allow all on quiz_questions"
    ON uat.quiz_questions FOR ALL USING (true) WITH CHECK (true);

-- Public view (exposes question metadata, hides correct_answer_index)
DROP VIEW IF EXISTS uat.quiz_questions_public CASCADE;
CREATE OR REPLACE VIEW uat.quiz_questions_public AS
    SELECT 
        id,
        q_no,
        section,
        topic,
        question_type,
        benchmark_style,
        source,
        question_text,
        options,
        marks,
        negative_marks,
        difficulty,
        category,
        explanation,
        caselet_snippet,
        is_active,
        created_at
    FROM uat.quiz_questions
    WHERE is_active = true;

GRANT SELECT ON uat.quiz_questions_public TO anon, authenticated;


-- ===========================================================================
-- TABLE 5: uat.quiz_attempts
-- (Matches public.quiz_attempts column for column + raw_data)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.quiz_attempts (
    attempt_id          TEXT PRIMARY KEY,
    student_id          TEXT NOT NULL,
    user_id             TEXT,
    participant_email   TEXT,
    team_id             TEXT,
    program_id          TEXT,
    start_time          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at        TIMESTAMPTZ DEFAULT NOW(),
    answers             JSONB NOT NULL DEFAULT '{}'::jsonb,
    marked_for_review   TEXT[] DEFAULT ARRAY[]::TEXT[],
    score               NUMERIC NOT NULL DEFAULT 0,
    analytical_score    NUMERIC NOT NULL DEFAULT 0,
    time_taken_seconds  INT NOT NULL DEFAULT 0,
    tab_switch_count    INT NOT NULL DEFAULT 0,
    is_completed        BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    raw_data            JSONB
);

CREATE INDEX IF NOT EXISTS idx_uat_quiz_attempts_student ON uat.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_uat_quiz_attempts_program ON uat.quiz_attempts(program_id);
CREATE INDEX IF NOT EXISTS idx_uat_quiz_attempts_email   ON uat.quiz_attempts(participant_email);

ALTER TABLE uat.quiz_attempts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.quiz_attempts TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "UAT Allow all on quiz_attempts" ON uat.quiz_attempts;
CREATE POLICY "UAT Allow all on quiz_attempts"
    ON uat.quiz_attempts FOR ALL USING (true) WITH CHECK (true);

-- Leaderboard view (Enriches attempts with participant & institute details)
DROP VIEW IF EXISTS uat.quiz_attempts_leaderboard CASCADE;
CREATE OR REPLACE VIEW uat.quiz_attempts_leaderboard AS
    SELECT
        qa.attempt_id,
        qa.student_id,
        qa.user_id,
        qa.participant_email,
        qa.team_id,
        qa.program_id,
        qa.score,
        qa.analytical_score,
        qa.time_taken_seconds,
        qa.tab_switch_count,
        qa.is_completed,
        qa.submitted_at,
        COALESCE(p.name, qa.student_id)                             AS candidate_name,
        COALESCE(p.institute_name, 'National Management Institute') AS institute_name,
        COALESCE(p.registration_number, 'AIMA-CL26-00000')          AS registration_number
    FROM uat.quiz_attempts qa
    LEFT JOIN uat.participants p
        ON (p.email = qa.participant_email OR p.id::text = qa.student_id)
    WHERE qa.is_completed = true;

GRANT SELECT ON uat.quiz_attempts_leaderboard TO anon, authenticated;


-- ===========================================================================
-- TABLE 6: uat.quiz_program_questions (junction)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.quiz_program_questions (
    id           TEXT PRIMARY KEY,
    program_id   TEXT NOT NULL REFERENCES uat.quiz_programs(id) ON DELETE CASCADE,
    question_id  TEXT NOT NULL REFERENCES uat.quiz_questions(id) ON DELETE CASCADE,
    order_index  INT NOT NULL DEFAULT 1,
    custom_marks NUMERIC,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_uat_program_question UNIQUE(program_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_uat_qpq_program_id  ON uat.quiz_program_questions(program_id);
CREATE INDEX IF NOT EXISTS idx_uat_qpq_order_index ON uat.quiz_program_questions(program_id, order_index);

ALTER TABLE uat.quiz_program_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON uat.quiz_program_questions FROM anon, authenticated;

DROP POLICY IF EXISTS "UAT Public read quiz_program_questions" ON uat.quiz_program_questions;
CREATE POLICY "UAT Public read quiz_program_questions"
    ON uat.quiz_program_questions FOR SELECT USING (true);

GRANT ALL ON uat.quiz_program_questions TO service_role;
GRANT SELECT ON uat.quiz_program_questions TO anon, authenticated;


-- ===========================================================================
-- TABLE 7: uat.jury_evaluations
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.jury_evaluations (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number    VARCHAR(100) NOT NULL,
    team_id                VARCHAR(100),
    candidate_email        VARCHAR(255),
    candidate_name         VARCHAR(255),
    team_name              VARCHAR(255),
    institute_name         VARCHAR(255),
    round                  VARCHAR(50) NOT NULL DEFAULT 'round_2',
    track_id               VARCHAR(100) NOT NULL,
    track_name             VARCHAR(255) NOT NULL,
    track_badge            VARCHAR(100),
    master_case_title      TEXT,
    track_locked_at        TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    problem_identification NUMERIC(5,2) DEFAULT 0,
    case_question_1        NUMERIC(5,2) DEFAULT 0,
    case_question_2        NUMERIC(5,2) DEFAULT 0,
    case_question_3        NUMERIC(5,2) DEFAULT 0,
    strategic_alternatives NUMERIC(5,2) DEFAULT 0,
    execution_plan         NUMERIC(5,2) DEFAULT 0,
    case_data_evidence     NUMERIC(5,2) DEFAULT 0,
    total_score            NUMERIC(5,2) DEFAULT 0,
    attendance_verified    BOOLEAN DEFAULT false,
    jury_feedback          TEXT DEFAULT '',
    is_qualified           BOOLEAN DEFAULT false,
    evaluated_by           VARCHAR(255) DEFAULT 'AIMA National Jury Panel',
    evaluated_at           TIMESTAMPTZ,
    created_at             TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at             TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_uat_reg_round UNIQUE (registration_number, round)
);

CREATE INDEX IF NOT EXISTS idx_uat_jury_reg_num  ON uat.jury_evaluations(registration_number);
CREATE INDEX IF NOT EXISTS idx_uat_jury_team_id  ON uat.jury_evaluations(team_id);
CREATE INDEX IF NOT EXISTS idx_uat_jury_track_id ON uat.jury_evaluations(track_id);
CREATE INDEX IF NOT EXISTS idx_uat_jury_email    ON uat.jury_evaluations(candidate_email);
CREATE INDEX IF NOT EXISTS idx_uat_jury_round    ON uat.jury_evaluations(round);

ALTER TABLE uat.jury_evaluations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON uat.jury_evaluations TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "UAT Allow public select on jury_evaluations" ON uat.jury_evaluations;
CREATE POLICY "UAT Allow public select on jury_evaluations"
    ON uat.jury_evaluations FOR SELECT USING (true);

DROP POLICY IF EXISTS "UAT Allow anon and auth write on jury_evaluations" ON uat.jury_evaluations;
CREATE POLICY "UAT Allow anon and auth write on jury_evaluations"
    ON uat.jury_evaluations FOR ALL USING (true) WITH CHECK (true);


-- ===========================================================================
-- TABLE 8: uat.competition_config
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.competition_config (
    id                          TEXT PRIMARY KEY DEFAULT 'default',
    league_name                 TEXT NOT NULL DEFAULT 'AIMA-ICRC India Case League',
    year                        TEXT NOT NULL DEFAULT '2026',
    edition                     TEXT NOT NULL DEFAULT 'Inaugural National Edition',
    active_stage                TEXT NOT NULL DEFAULT 'round_1',
    registration_open           BOOLEAN NOT NULL DEFAULT TRUE,
    r1_quiz_start_time          TIMESTAMPTZ DEFAULT NOW(),
    r1_quiz_end_time            TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    r1_duration_minutes         INT NOT NULL DEFAULT 45,
    r1_negative_marking         BOOLEAN NOT NULL DEFAULT FALSE,
    r1_cutoff_score             NUMERIC NOT NULL DEFAULT 60,
    r2_submission_deadline      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '45 days',
    r2_max_slide_count          INT NOT NULL DEFAULT 12,
    r2_max_file_size_mb         INT NOT NULL DEFAULT 25,
    r2_evaluators_per_deck      INT NOT NULL DEFAULT 2,
    r3_regional_start_date      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '60 days',
    r3_max_teams_per_hub        INT NOT NULL DEFAULT 24,
    r4_national_finale_date     TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
    fee_r1_r2                   NUMERIC NOT NULL DEFAULT 200,
    fee_r3                      NUMERIC NOT NULL DEFAULT 2000,
    fee_r4                      NUMERIC NOT NULL DEFAULT 2000,
    is_results_locked_r1        BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r2        BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r3        BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r4        BOOLEAN NOT NULL DEFAULT FALSE,
    is_public_results_published BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by                  TEXT
);

INSERT INTO uat.competition_config (
    id, active_stage, registration_open, r1_negative_marking,
    is_public_results_published, updated_at
) VALUES (
    'default', 'round_1', TRUE, FALSE, FALSE, NOW()
) ON CONFLICT (id) DO UPDATE SET
    r1_negative_marking = EXCLUDED.r1_negative_marking,
    updated_at = NOW();

ALTER TABLE uat.competition_config ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON uat.competition_config FROM anon, authenticated;

DROP POLICY IF EXISTS "UAT Allow public read competition_config" ON uat.competition_config;
CREATE POLICY "UAT Allow public read competition_config"
    ON uat.competition_config FOR SELECT USING (true);

GRANT ALL ON uat.competition_config TO service_role;
GRANT SELECT ON uat.competition_config TO anon, authenticated;


-- ===========================================================================
-- TABLE 9: uat.audit_logs
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.audit_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    admin_id       TEXT NOT NULL,
    admin_email    TEXT NOT NULL,
    action         TEXT NOT NULL,
    module         TEXT NOT NULL,
    details        TEXT NOT NULL,
    changed_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    result         TEXT NOT NULL DEFAULT 'SUCCESS',
    ip_address     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uat_audit_timestamp ON uat.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_uat_audit_module    ON uat.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_uat_audit_admin     ON uat.audit_logs(admin_id);

ALTER TABLE uat.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON uat.audit_logs FROM anon, authenticated;

DROP POLICY IF EXISTS "UAT Allow authenticated read audit_logs" ON uat.audit_logs;
CREATE POLICY "UAT Allow authenticated read audit_logs"
    ON uat.audit_logs FOR SELECT USING (true);

GRANT ALL ON uat.audit_logs TO service_role;
GRANT SELECT ON uat.audit_logs TO authenticated;


-- ===========================================================================
-- TABLE 10: uat.profiles  (links to shared auth.users)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS uat.profiles (
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email               TEXT NOT NULL UNIQUE,
    role                TEXT NOT NULL CHECK (role IN (
        'admin', 'student', 'team_leader', 'team_member',
        'evaluator', 'institute_coordinator', 'regional_hub', 'corporate_partner'
    )),
    name                TEXT NOT NULL,
    mobile              TEXT,
    organization_name   TEXT,
    registration_number TEXT,
    program             TEXT,
    semester            TEXT,
    enrolment_number    TEXT,
    is_team_leader      BOOLEAN DEFAULT FALSE,
    avatar_url          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uat_profiles_email   ON uat.profiles(email);
CREATE INDEX IF NOT EXISTS idx_uat_profiles_role    ON uat.profiles(role);
CREATE INDEX IF NOT EXISTS idx_uat_profiles_reg_num ON uat.profiles(registration_number);
CREATE INDEX IF NOT EXISTS idx_uat_profiles_org     ON uat.profiles(organization_name);

ALTER TABLE uat.profiles ENABLE ROW LEVEL SECURITY;

-- Schema-scoped helper function (SECURITY DEFINER prevents RLS recursion)
CREATE OR REPLACE FUNCTION uat.get_auth_role()
RETURNS text AS $$
    SELECT role FROM uat.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "UAT Service role full access profiles" ON uat.profiles;
DROP POLICY IF EXISTS "UAT Users read own profile"            ON uat.profiles;
DROP POLICY IF EXISTS "UAT Admins view all profiles"          ON uat.profiles;
DROP POLICY IF EXISTS "UAT Users update own profile"          ON uat.profiles;

CREATE POLICY "UAT Service role full access profiles"
    ON uat.profiles FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "UAT Users read own profile"
    ON uat.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "UAT Admins view all profiles"
    ON uat.profiles FOR SELECT USING (uat.get_auth_role() = 'admin');

CREATE POLICY "UAT Users update own profile"
    ON uat.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE INSERT, UPDATE, DELETE ON uat.profiles FROM anon;
GRANT SELECT ON uat.profiles TO authenticated;
GRANT ALL ON uat.profiles TO service_role;


-- ===========================================================================
-- SEEDING QUESTIONS INTO UAT
-- Copies from public.quiz_questions if present; otherwise inserts Stage 1 bank
-- ===========================================================================

-- 1. Copy questions from public schema if available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
        INSERT INTO uat.quiz_questions (
            id, q_no, section, topic, question_type, benchmark_style, source,
            question_text, options, correct_answer_index, marks, negative_marks,
            difficulty, category, explanation, caselet_snippet, is_active, created_at
        )
        SELECT 
            id, q_no, section, topic, question_type, benchmark_style, source,
            question_text, options, correct_answer_index, marks, negative_marks,
            difficulty, category, explanation, caselet_snippet, is_active, created_at
        FROM public.quiz_questions
        ON CONFLICT (id) DO UPDATE SET
            q_no = EXCLUDED.q_no,
            section = EXCLUDED.section,
            topic = EXCLUDED.topic,
            question_type = EXCLUDED.question_type,
            benchmark_style = EXCLUDED.benchmark_style,
            source = EXCLUDED.source,
            question_text = EXCLUDED.question_text,
            options = EXCLUDED.options,
            correct_answer_index = EXCLUDED.correct_answer_index,
            marks = EXCLUDED.marks,
            negative_marks = EXCLUDED.negative_marks,
            difficulty = EXCLUDED.difficulty,
            category = EXCLUDED.category,
            explanation = EXCLUDED.explanation,
            caselet_snippet = EXCLUDED.caselet_snippet,
            is_active = EXCLUDED.is_active;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_program_questions') THEN
        INSERT INTO uat.quiz_program_questions (id, program_id, question_id, order_index, custom_marks, created_at)
        SELECT id, program_id, question_id, order_index, custom_marks, created_at
        FROM public.quiz_program_questions
        WHERE program_id = 'qp_case_comp_stage1_2026'
        ON CONFLICT (program_id, question_id) DO NOTHING;
    END IF;
END $$;

-- 2. Standalone fallback seed: if uat.quiz_questions is still empty, seed all 30 Stage 1 questions
INSERT INTO uat.quiz_questions (
  id, q_no, section, topic, question_type, benchmark_style, source,
  question_text, options, correct_answer_index, marks, negative_marks,
  difficulty, category, explanation, caselet_snippet, is_active
) VALUES
('q_cc_s1_01', 1, 'A. Management Theory (Conceptual)', 'Motivation – Herzberg', 'Main', 'Concept caselet (international case-comp style)', '–',
 'An Indian IT services firm raised salaries by 15% and upgraded its cafeteria and office interiors. Six months later, exit-interview data shows dissatisfaction has dropped, but engagement and discretionary effort have NOT risen. Which theory best explains this outcome?',
 ARRAY['Herzberg''s Two-Factor Theory – pay and working conditions are hygiene factors: they reduce dissatisfaction but do not create motivation', 'McClelland''s Theory – employees have a high need for power that pay cannot satisfy', 'Maslow''s Hierarchy – employees have jumped straight to self-actualisation', 'McGregor''s Theory X – employees are inherently lazy and respond only to control'],
 0, 4, 0, 'Medium', 'Management Concepts',
 'Herzberg separates hygiene factors (salary, policies, working conditions) from motivators (achievement, recognition, responsibility, growth). Fixing hygiene removes dissatisfaction; engagement needs motivators such as job enrichment and recognition.', NULL, true),
('q_cc_s1_02', 2, 'A. Management Theory (Conceptual)', 'Strategy – Porter''s Generic Strategies', 'Main', 'Concept caselet (international case-comp style)', '–',
 'A mid-sized apparel brand tries to undercut discount chains on price while also funding premium designer collaborations, across all customer segments. It ends up with neither the lowest cost nor a clear premium image, and loses share to focused rivals. Michael Porter would describe this firm as:',
 ARRAY['Pursuing a Blue Ocean strategy', 'Stuck in the middle', 'Executing a successful cost-focus strategy', 'Achieving an integrated low-cost/differentiation advantage'],
 1, 4, 0, 'Medium', 'Management Concepts',
 'Porter argued that firms which fail to commit to cost leadership, differentiation or focus become ''stuck in the middle'', with lower profitability than committed rivals.', NULL, true),
('q_cc_s1_03', 3, 'A. Management Theory (Conceptual)', 'Innovation – Christensen', 'Main', 'Concept caselet (international case-comp style)', '–',
 'According to Clayton Christensen, which scenario is the clearest example of DISRUPTIVE (not sustaining) innovation?',
 ARRAY['An incumbent smartphone maker adds a better camera to its flagship model each year', 'A luxury carmaker launches a faster, more expensive sports variant', 'A new entrant offers a cheaper, ''good-enough'' product to overlooked low-end or non-consumers, then steadily moves upmarket', 'A market leader cuts prices temporarily to block a competitor''s launch'],
 2, 4, 0, 'Medium', 'Management Concepts',
 'Disruption starts at the low end or with non-consumption, where incumbents are happy to cede margin-poor customers; the entrant then improves and moves upmarket. Better features for existing best customers are sustaining innovations.', NULL, true),
('q_cc_s1_04', 4, 'A. Management Theory (Conceptual)', 'Strategy – Blue Ocean (Kim & Mauborgne)', 'Main', 'Concept caselet (international case-comp style)', '–',
 'Cirque du Soleil removed animal acts and star performers, reduced thrill-and-danger elements, raised the venue experience, and created theme-based artistic storylines. Which framework did this exactly follow?',
 ARRAY['BCG Growth-Share Matrix', 'McKinsey 7-S Framework', 'Ansoff Product-Market Matrix', 'Four Actions Framework / ERRC Grid (Eliminate-Reduce-Raise-Create)'],
 3, 4, 0, 'Medium', 'Management Concepts',
 'Kim & Mauborgne''s Blue Ocean Strategy uses the Four Actions Framework (Eliminate, Reduce, Raise, Create) to break the value-cost trade-off and open uncontested market space. Cirque du Soleil is the book''s flagship case.', NULL, true),
('q_cc_s1_05', 5, 'A. Management Theory (Conceptual)', 'Portfolio Planning – GE-McKinsey', 'Main', 'Concept caselet (international case-comp style)', '–',
 'A conglomerate rates its packaged-foods unit as MEDIUM on industry attractiveness but HIGH on business-unit strength, using weighted multi-factor scores. On the GE-McKinsey nine-cell matrix, what is the recommended strategic posture?',
 ARRAY['Invest/Grow – the unit falls in the green zone, so allocate capital to build share', 'Harvest/Divest – maximise cash and plan an exit', 'Hold/Selectivity – maintain position and invest only in promising segments', 'Classify it as a ''Question Mark'' and decide later'],
 0, 4, 0, 'Medium', 'Management Concepts',
 'In the GE-McKinsey matrix, the three top-left cells (High-High, High-Medium, Medium-High) are the ''invest/grow'' zone; the diagonal is ''selectivity/hold''; the bottom-right is ''harvest/divest''. Unlike the BCG matrix (market growth vs relative share), GE uses composite, weighted factors. ''Question Mark'' is BCG terminology – a deliberate distractor.', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Map first 5 questions to UAT Stage 1 quiz program if junction is empty
INSERT INTO uat.quiz_program_questions (id, program_id, question_id, order_index, custom_marks)
SELECT 
  'uat_qpq_cc_' || LPAD(ROW_NUMBER() OVER (ORDER BY q.id)::TEXT, 2, '0'),
  'qp_case_comp_stage1_2026',
  q.id,
  ROW_NUMBER() OVER (ORDER BY q.id),
  4
FROM uat.quiz_questions q
ON CONFLICT (program_id, question_id) DO NOTHING;


-- ===========================================================================
-- VERIFICATION QUERY (run after applying to confirm success)
-- ===========================================================================
-- SELECT table_name, table_type
-- FROM information_schema.tables
-- WHERE table_schema = 'uat'
-- ORDER BY table_name;
--
-- Expected tables & views:
--   audit_logs             (BASE TABLE)
--   competition_config     (BASE TABLE)
--   jury_evaluations       (BASE TABLE)
--   participants           (BASE TABLE)
--   profiles               (BASE TABLE)
--   quiz_attempts          (BASE TABLE)
--   quiz_program_questions (BASE TABLE)
--   quiz_programs          (BASE TABLE)
--   quiz_questions         (BASE TABLE)
--   registrations          (BASE TABLE)
--   quiz_attempts_leaderboard   (VIEW)
--   quiz_questions_public       (VIEW)
-- ===========================================================================
