-- ==============================================================================
-- AIMA India Case League 2026 — Round 2 Case Track Selection & Jury Evaluations
-- Migration File: migrations/jury_evaluations_migration.sql
-- ==============================================================================
--
-- This migration provisions:
-- 1. Dedicated 'jury_evaluations' table to store candidate/team locked case tracks
--    and jury scorecard evaluations (7 KPIs, attendance, marks, feedback).
-- 2. Dedicated track columns on 'participants' and 'registrations' for high-performance direct queries.
-- 3. Row-Level Security policies and indexes for fast lookups.
-- ==============================================================================

-- 1. Create dedicated jury_evaluations table
CREATE TABLE IF NOT EXISTS public.jury_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(100) NOT NULL,
  team_id VARCHAR(100),
  candidate_email VARCHAR(255),
  candidate_name VARCHAR(255),
  team_name VARCHAR(255),
  institute_name VARCHAR(255),
  round VARCHAR(50) NOT NULL DEFAULT 'round_2',
  track_id VARCHAR(100) NOT NULL,
  track_name VARCHAR(255) NOT NULL,
  track_badge VARCHAR(100),
  master_case_title TEXT,
  track_locked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  
  -- Official 7 Case Study Presentation KPIs (Max 100 Marks)
  problem_identification NUMERIC(5,2) DEFAULT 0,  -- Max 15
  case_question_1 NUMERIC(5,2) DEFAULT 0,         -- Max 15
  case_question_2 NUMERIC(5,2) DEFAULT 0,         -- Max 15
  case_question_3 NUMERIC(5,2) DEFAULT 0,         -- Max 15
  strategic_alternatives NUMERIC(5,2) DEFAULT 0,  -- Max 20
  execution_plan NUMERIC(5,2) DEFAULT 0,          -- Max 15
  case_data_evidence NUMERIC(5,2) DEFAULT 0,      -- Max 5
  
  -- Aggregate & Status Fields
  total_score NUMERIC(5,2) DEFAULT 0,
  attendance_verified BOOLEAN DEFAULT false,
  jury_feedback TEXT DEFAULT '',
  is_qualified BOOLEAN DEFAULT false,
  evaluated_by VARCHAR(255) DEFAULT 'AIMA National Jury Panel',
  evaluated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),

  CONSTRAINT unique_reg_round UNIQUE (registration_number, round)
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_jury_evaluations_reg_num ON public.jury_evaluations(registration_number);
CREATE INDEX IF NOT EXISTS idx_jury_evaluations_team_id ON public.jury_evaluations(team_id);
CREATE INDEX IF NOT EXISTS idx_jury_evaluations_track_id ON public.jury_evaluations(track_id);
CREATE INDEX IF NOT EXISTS idx_jury_evaluations_email ON public.jury_evaluations(candidate_email);
CREATE INDEX IF NOT EXISTS idx_jury_evaluations_round ON public.jury_evaluations(round);

-- 3. Add first-class track selection columns to participants and registrations
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS selected_track_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS selected_track_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS track_locked_at TIMESTAMPTZ;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS selected_track_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS selected_track_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS track_locked_at TIMESTAMPTZ;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.jury_evaluations ENABLE ROW LEVEL SECURITY;

-- 5. Create permissive RLS policies for application access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jury_evaluations' AND policyname = 'Allow public select on jury_evaluations'
  ) THEN
    CREATE POLICY "Allow public select on jury_evaluations"
      ON public.jury_evaluations FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jury_evaluations' AND policyname = 'Allow public insert on jury_evaluations'
  ) THEN
    CREATE POLICY "Allow public insert on jury_evaluations"
      ON public.jury_evaluations FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jury_evaluations' AND policyname = 'Allow public update on jury_evaluations'
  ) THEN
    CREATE POLICY "Allow public update on jury_evaluations"
      ON public.jury_evaluations FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 6. Grant privileges
GRANT ALL ON TABLE public.jury_evaluations TO anon, authenticated, service_role;

-- 7. Add helpful comments
COMMENT ON TABLE public.jury_evaluations IS 'Authoritative table storing candidate locked case tracks and jury scorecard evaluations across 7 KPIs.';
COMMENT ON COLUMN public.jury_evaluations.track_id IS 'ID of chosen case track (marketing_strategy, operations, finance_risk, etc.)';
COMMENT ON COLUMN public.jury_evaluations.track_badge IS 'Display badge such as TRACK 02 • MASTER CASE';
COMMENT ON COLUMN public.jury_evaluations.total_score IS 'Sum of the 7 KPIs (0-100)';
COMMENT ON COLUMN public.jury_evaluations.attendance_verified IS 'Whether team/candidate was physically present in presentation hall';
