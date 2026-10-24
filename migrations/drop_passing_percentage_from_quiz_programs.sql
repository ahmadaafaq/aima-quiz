-- ==============================================================================
-- MIGRATION: Drop redundant passing_percentage column from quiz_programs
-- DATE: 2026-10-23
-- REASON: Standardized on cutoff_score (percentage) and passing_marks (score).
-- ==============================================================================

-- 1. Ensure cutoff_score has values from passing_percentage if null
UPDATE quiz_programs
SET cutoff_score = COALESCE(cutoff_score, passing_percentage, 60)
WHERE cutoff_score IS NULL;

-- 2. Drop the redundant passing_percentage column
ALTER TABLE quiz_programs
DROP COLUMN IF EXISTS passing_percentage;
