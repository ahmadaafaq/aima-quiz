-- =====================================================================
-- ALL INDIA MANAGEMENT ASSOCIATION (AIMA) - INDIA CASE LEAGUE 2026
-- Supabase Migration: Quiz Program Questions Junction & Program Flags
-- File: migrations/quiz_program_questions_migration.sql
-- =====================================================================

-- 1. Add shuffle_questions and allow_review flags to quiz_programs if not present
ALTER TABLE public.quiz_programs 
  ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT TRUE;

-- 2. Create quiz_program_questions junction table
CREATE TABLE IF NOT EXISTS public.quiz_program_questions (
  id                  TEXT PRIMARY KEY,
  program_id          TEXT NOT NULL REFERENCES public.quiz_programs(id) ON DELETE CASCADE,
  question_id         TEXT NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  order_index         INT NOT NULL DEFAULT 1,
  custom_marks        NUMERIC,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_program_question UNIQUE(program_id, question_id)
);

-- Index for fast lookup by program and ordering
CREATE INDEX IF NOT EXISTS idx_qpq_program_id ON public.quiz_program_questions(program_id);
CREATE INDEX IF NOT EXISTS idx_qpq_order_index ON public.quiz_program_questions(program_id, order_index);

-- Enable RLS
ALTER TABLE public.quiz_program_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_program_questions FROM anon, authenticated;

-- Public read access so candidates can load question ordering for tests
DROP POLICY IF EXISTS "Public read quiz_program_questions" ON public.quiz_program_questions;
CREATE POLICY "Public read quiz_program_questions"
  ON public.quiz_program_questions FOR SELECT
  USING (true);

-- Admin / service_role write access
GRANT ALL ON public.quiz_program_questions TO service_role;
GRANT SELECT ON public.quiz_program_questions TO anon, authenticated;

-- 3. Initial Seed: Link existing questions to default programs so they are not empty
-- Map first 10 questions to 'qp_round1_screening_2026'
INSERT INTO public.quiz_program_questions (id, program_id, question_id, order_index)
SELECT 
  'qpq_r1_' || q.id,
  'qp_round1_screening_2026',
  q.id,
  ROW_NUMBER() OVER (ORDER BY q.created_at ASC)
FROM public.quiz_questions q
WHERE EXISTS (SELECT 1 FROM public.quiz_programs WHERE id = 'qp_round1_screening_2026')
ON CONFLICT (program_id, question_id) DO NOTHING;

-- Map first 5 questions to 'qp_strategy_practice_mock'
INSERT INTO public.quiz_program_questions (id, program_id, question_id, order_index)
SELECT 
  'qpq_mock_' || q.id,
  'qp_strategy_practice_mock',
  q.id,
  ROW_NUMBER() OVER (ORDER BY q.created_at ASC)
FROM public.quiz_questions q
WHERE EXISTS (SELECT 1 FROM public.quiz_programs WHERE id = 'qp_strategy_practice_mock')
LIMIT 5
ON CONFLICT (program_id, question_id) DO NOTHING;
