-- =====================================================================
-- ALL INDIA MANAGEMENT ASSOCIATION (AIMA) - INDIA CASE LEAGUE 2026
-- Supabase Migration: Link Student Registrations & Nominees to Stage 1 Quiz Program
-- File: migrations/link_registrations_to_quiz_program_migration.sql
-- =====================================================================

-- 1. Add quiz_program_id to participants table (individual student test accounts)
ALTER TABLE public.participants 
  ADD COLUMN IF NOT EXISTS quiz_program_id TEXT DEFAULT 'qp_case_comp_stage1_2026' 
  REFERENCES public.quiz_programs(id) ON DELETE SET NULL;

-- Backfill all existing participants to Stage 1 quiz program
UPDATE public.participants 
SET quiz_program_id = 'qp_case_comp_stage1_2026' 
WHERE quiz_program_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_participants_quiz_program 
  ON public.participants(quiz_program_id);


-- 2. Add quiz_program_id to registrations master table
ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS quiz_program_id TEXT DEFAULT 'qp_case_comp_stage1_2026' 
  REFERENCES public.quiz_programs(id) ON DELETE SET NULL;

-- Backfill all existing registrations to Stage 1 quiz program
UPDATE public.registrations 
SET quiz_program_id = 'qp_case_comp_stage1_2026' 
WHERE quiz_program_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_quiz_program 
  ON public.registrations(quiz_program_id);


-- 3. Function & Trigger: Automatically keep quiz_programs.enrolled_count synchronized
-- Every time a registration is inserted, updated, or removed, the intake capacity count
-- for the quiz program is dynamically recalculated from live registered student candidates.
CREATE OR REPLACE FUNCTION public.sync_quiz_program_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  target_prog_id TEXT;
  candidate_total INT;
BEGIN
  target_prog_id := COALESCE(NEW.quiz_program_id, 'qp_case_comp_stage1_2026');

  -- Sum of all candidate nominees for this quiz program
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
  FROM public.registrations r
  WHERE r.quiz_program_id = target_prog_id OR (target_prog_id = 'qp_case_comp_stage1_2026' AND r.quiz_program_id IS NULL);

  -- Update enrolled_count on quiz_programs
  UPDATE public.quiz_programs
  SET enrolled_count = candidate_total,
      updated_at = NOW()
  WHERE id = target_prog_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to public.registrations
DROP TRIGGER IF EXISTS trg_sync_quiz_program_enrollment ON public.registrations;
CREATE TRIGGER trg_sync_quiz_program_enrollment
  AFTER INSERT OR UPDATE OR DELETE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_quiz_program_enrollment();


-- 4. Initial Synchronization: Recalculate and commit current dynamic enrolled_count for Stage 1 Quiz
UPDATE public.quiz_programs qp
SET enrolled_count = (
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
  FROM public.registrations r
  WHERE r.quiz_program_id = 'qp_case_comp_stage1_2026' OR r.quiz_program_id IS NULL
),
updated_at = NOW()
WHERE qp.id = 'qp_case_comp_stage1_2026';

-- =====================================================================
-- Migration complete.
-- =====================================================================
