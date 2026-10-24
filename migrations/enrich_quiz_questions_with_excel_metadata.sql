-- =====================================================================
-- ALL INDIA MANAGEMENT ASSOCIATION (AIMA) - INDIA CASE LEAGUE 2026
-- Supabase Migration: Enrich quiz_questions with full Excel Metadata
-- File: migrations/enrich_quiz_questions_with_excel_metadata.sql
-- =====================================================================

-- 1. Add 6 Metadata Columns to quiz_questions
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS q_no INT,
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'Main',
  ADD COLUMN IF NOT EXISTS benchmark_style TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT;

-- 2. Update Public View to expose the non-sensitive metadata to students
DROP VIEW IF EXISTS public.quiz_questions_public CASCADE;
CREATE OR REPLACE VIEW public.quiz_questions_public AS
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
  FROM public.quiz_questions
  WHERE is_active = true;

GRANT SELECT ON public.quiz_questions_public TO anon, authenticated;

-- 3. Align Master Competition Config Negative Marking to FALSE (Matches Excel)
UPDATE public.competition_config
SET r1_negative_marking = false,
    updated_at = NOW()
WHERE id = 'default';

-- 4. Enrich All 30 Questions with exact Excel Metadata
UPDATE public.quiz_questions
SET q_no = 1,
    section = 'A. Management Theory (Conceptual)',
    topic = 'Motivation – Herzberg',
    question_type = 'Main',
    benchmark_style = 'Concept caselet (international case-comp style)',
    source = '–'
WHERE id = 'q_cc_s1_01';
UPDATE public.quiz_questions
SET q_no = 2,
    section = 'A. Management Theory (Conceptual)',
    topic = 'Strategy – Porter''s Generic Strategies',
    question_type = 'Main',
    benchmark_style = 'Concept caselet',
    source = '–'
WHERE id = 'q_cc_s1_02';
UPDATE public.quiz_questions
SET q_no = 3,
    section = 'A. Management Theory (Conceptual)',
    topic = 'Innovation – Disruptive Innovation',
    question_type = 'Main',
    benchmark_style = 'Concept caselet',
    source = '–'
WHERE id = 'q_cc_s1_03';
UPDATE public.quiz_questions
SET q_no = 4,
    section = 'A. Management Theory (Conceptual)',
    topic = 'Strategy – Blue Ocean',
    question_type = 'Main',
    benchmark_style = 'Concept caselet',
    source = '–'
WHERE id = 'q_cc_s1_04';
UPDATE public.quiz_questions
SET q_no = 5,
    section = 'A. Management Theory (Conceptual)',
    topic = 'Portfolio – GE-McKinsey Matrix',
    question_type = 'Main',
    benchmark_style = 'Concept caselet',
    source = '–'
WHERE id = 'q_cc_s1_05';
UPDATE public.quiz_questions
SET q_no = 6,
    section = 'B. Companies in the News',
    topic = 'Jio Platforms IPO',
    question_type = 'Main',
    benchmark_style = 'Business current affairs (Tata Crucible style)',
    source = 'TechCrunch 14 Oct 2026; Free Press Journal 20 Oct 2026; IndiaIPO 20 Oct 2026'
WHERE id = 'q_cc_s1_06';
UPDATE public.quiz_questions
SET q_no = 7,
    section = 'B. Companies in the News',
    topic = 'Largest IPO in history',
    question_type = 'Main',
    benchmark_style = 'Business current affairs',
    source = 'Motley Fool (Oct 2026); BloFin IPO review citing Reuters/CNBC'
WHERE id = 'q_cc_s1_07';
UPDATE public.quiz_questions
SET q_no = 8,
    section = 'B. Companies in the News',
    topic = 'Ramp – fintech valuation',
    question_type = 'Main',
    benchmark_style = 'Current affairs + numerical',
    source = 'TechCrunch 15 Oct 2026; Bloomberg 9 Oct 2026'
WHERE id = 'q_cc_s1_08';
UPDATE public.quiz_questions
SET q_no = 9,
    section = 'B. Companies in the News',
    topic = 'Sun Pharma – Organon',
    question_type = 'Main',
    benchmark_style = 'Current affairs + strategy',
    source = 'Dealroom pending M&A list (Oct 2026); iPleaders M&A review 2026'
WHERE id = 'q_cc_s1_09';
UPDATE public.quiz_questions
SET q_no = 10,
    section = 'B. Companies in the News',
    topic = 'SUGAR Cosmetics – down round',
    question_type = 'Main',
    benchmark_style = 'Current affairs + startup/VC',
    source = 'Inc42, 4 Sep 2026 (based on MCA filings)'
WHERE id = 'q_cc_s1_10';
UPDATE public.quiz_questions
SET q_no = 11,
    section = 'C. Management Application',
    topic = 'Operations – Little''s Law',
    question_type = 'Main',
    benchmark_style = 'Numerical (operations)',
    source = '–'
WHERE id = 'q_cc_s1_11';
UPDATE public.quiz_questions
SET q_no = 12,
    section = 'C. Management Application',
    topic = 'Operations – Supply Chain',
    question_type = 'Main',
    benchmark_style = 'Operations caselet',
    source = '–'
WHERE id = 'q_cc_s1_12';
UPDATE public.quiz_questions
SET q_no = 13,
    section = 'C. Management Application',
    topic = 'Marketing – Pricing',
    question_type = 'Main',
    benchmark_style = 'Marketing caselet (HUL L.I.M.E style)',
    source = '–'
WHERE id = 'q_cc_s1_13';
UPDATE public.quiz_questions
SET q_no = 14,
    section = 'C. Management Application',
    topic = 'Marketing – Ansoff Matrix',
    question_type = 'Main',
    benchmark_style = 'Marketing caselet',
    source = 'Business Standard'
WHERE id = 'q_cc_s1_14';
UPDATE public.quiz_questions
SET q_no = 15,
    section = 'C. Management Application',
    topic = 'HRD – Training Evaluation',
    question_type = 'Main',
    benchmark_style = 'HR caselet',
    source = '–'
WHERE id = 'q_cc_s1_15';
UPDATE public.quiz_questions
SET q_no = 16,
    section = 'C. Management Application',
    topic = 'HRD – Expectancy Theory',
    question_type = 'Main',
    benchmark_style = 'HR caselet',
    source = '–'
WHERE id = 'q_cc_s1_16';
UPDATE public.quiz_questions
SET q_no = 17,
    section = 'C. Management Application',
    topic = 'MIS – Analytics Architecture',
    question_type = 'Main',
    benchmark_style = 'MIS caselet',
    source = '–'
WHERE id = 'q_cc_s1_17';
UPDATE public.quiz_questions
SET q_no = 18,
    section = 'C. Management Application',
    topic = 'MIS – Types of Information Systems',
    question_type = 'Main',
    benchmark_style = 'MIS caselet',
    source = '–'
WHERE id = 'q_cc_s1_18';
UPDATE public.quiz_questions
SET q_no = 19,
    section = 'C. Management Application',
    topic = 'Finance – DuPont Analysis',
    question_type = 'Main',
    benchmark_style = 'Numerical (finance)',
    source = '–'
WHERE id = 'q_cc_s1_19';
UPDATE public.quiz_questions
SET q_no = 20,
    section = 'C. Management Application',
    topic = 'Finance – Working Capital',
    question_type = 'Main',
    benchmark_style = 'Numerical (finance)',
    source = '–'
WHERE id = 'q_cc_s1_20';
UPDATE public.quiz_questions
SET q_no = 21,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'VC – Pre- and Post-money',
    question_type = 'Main',
    benchmark_style = 'Numerical (startup/VC)',
    source = '–'
WHERE id = 'q_cc_s1_21';
UPDATE public.quiz_questions
SET q_no = 22,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'VC – Valuation in the news',
    question_type = 'Main',
    benchmark_style = 'Current affairs + numerical',
    source = 'TechStartups 19–20 Oct 2026'
WHERE id = 'q_cc_s1_22';
UPDATE public.quiz_questions
SET q_no = 23,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'VC – Liquidation Preference',
    question_type = 'Main',
    benchmark_style = 'Numerical (term sheet)',
    source = '–'
WHERE id = 'q_cc_s1_23';
UPDATE public.quiz_questions
SET q_no = 24,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'IPO structure – Cult.fit',
    question_type = 'Main',
    benchmark_style = 'Current affairs + finance',
    source = 'IndianStartupNews 17 Oct 2026'
WHERE id = 'q_cc_s1_24';
UPDATE public.quiz_questions
SET q_no = 25,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'Brands & Personalities – Amul',
    question_type = 'Main',
    benchmark_style = 'Indian business classic (Tata Crucible style)',
    source = '–'
WHERE id = 'q_cc_s1_25';
UPDATE public.quiz_questions
SET q_no = 26,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'Brand Architecture – Eternal',
    question_type = 'Reserve',
    benchmark_style = 'Brand strategy caselet',
    source = '–'
WHERE id = 'q_cc_s1_26';
UPDATE public.quiz_questions
SET q_no = 27,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'Positioning & Personalities – Tata Nano',
    question_type = 'Reserve',
    benchmark_style = 'Brand positioning classic',
    source = '–'
WHERE id = 'q_cc_s1_27';
UPDATE public.quiz_questions
SET q_no = 28,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'Valuation multiple – Zetwerk IPO',
    question_type = 'Reserve',
    benchmark_style = 'Current affairs + valuation',
    source = 'Business Today 15 Oct 2026; Energetica India 13 Oct 2026; Inc42'
WHERE id = 'q_cc_s1_28';
UPDATE public.quiz_questions
SET q_no = 29,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'Startup ecosystem trend',
    question_type = 'Reserve',
    benchmark_style = 'Current affairs (VC)',
    source = 'IndiaIPO Daily Update 19 Oct 2026'
WHERE id = 'q_cc_s1_29';
UPDATE public.quiz_questions
SET q_no = 30,
    section = 'D. Brands, Valuation, Personalities & Startup/VC',
    topic = 'Business model – Quick commerce',
    question_type = 'Reserve',
    benchmark_style = 'Operations/strategy caselet',
    source = '–'
WHERE id = 'q_cc_s1_30';
