-- Migration: Add is_results_published column to quiz_programs
-- Allows per-program publishing of results independent of master competition_config

ALTER TABLE public.quiz_programs
  ADD COLUMN IF NOT EXISTS is_results_published BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.quiz_programs.is_results_published IS 'Indicates whether the official results and leaderboard for this quiz have been published to candidates.';
