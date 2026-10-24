-- =====================================================================
-- ALL INDIA MANAGEMENT ASSOCIATION (AIMA) - INDIA CASE LEAGUE 2026
-- Supabase Migration: Round 1 Quiz Programs, Question Bank & Attempts
-- File: migrations/quiz_system_migration.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLE: quiz_programs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_programs (
  id                          TEXT PRIMARY KEY,
  code                        TEXT NOT NULL UNIQUE,
  title                       TEXT NOT NULL,
  tagline                     TEXT,
  description                 TEXT,
  stage                       TEXT NOT NULL DEFAULT 'round_1',
  category                    TEXT,
  status                      TEXT NOT NULL DEFAULT 'draft',
  start_time                  TIMESTAMPTZ,
  end_time                    TIMESTAMPTZ,
  duration_minutes            INT NOT NULL DEFAULT 45,
  total_questions             INT NOT NULL DEFAULT 25,
  total_marks                 NUMERIC NOT NULL DEFAULT 100,
  passing_marks               NUMERIC DEFAULT 65,
  passing_percentage          NUMERIC DEFAULT 65,
  cutoff_score                NUMERIC,
  negative_marking            BOOLEAN DEFAULT TRUE,
  negative_marks_per_question NUMERIC DEFAULT 0.5,
  marks_per_question          NUMERIC DEFAULT 4,
  fee                         NUMERIC DEFAULT 0,
  max_intake                  INT DEFAULT 15000,
  enrolled_count              INT DEFAULT 0,
  completed_count             INT DEFAULT 0,
  in_progress_count           INT DEFAULT 0,
  instructions                TEXT[] DEFAULT ARRAY[]::TEXT[],
  eligibility                 TEXT,
  proctoring_strictness       TEXT DEFAULT 'High (Webcam + Fullscreen + Tab Lock)',
  proctoring_mode             TEXT DEFAULT 'strict_lockdown',
  tags                        TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: quiz_programs
ALTER TABLE public.quiz_programs ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.quiz_programs FROM anon, authenticated;

DROP POLICY IF EXISTS "Public read quiz_programs" ON public.quiz_programs;
CREATE POLICY "Public read quiz_programs"
  ON public.quiz_programs FOR SELECT
  USING (true);

GRANT ALL ON public.quiz_programs TO service_role;
GRANT SELECT ON public.quiz_programs TO anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. TABLE: quiz_questions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id                    TEXT PRIMARY KEY,
  question_text         TEXT NOT NULL,
  options               TEXT[] NOT NULL,
  correct_answer_index  INT NOT NULL,
  marks                 NUMERIC NOT NULL DEFAULT 4,
  negative_marks        NUMERIC NOT NULL DEFAULT 1,
  difficulty            TEXT NOT NULL DEFAULT 'Medium',
  category              TEXT NOT NULL,
  explanation           TEXT,
  caselet_snippet       TEXT,
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: quiz_questions (Base table accessible ONLY by service_role)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_questions FROM anon, authenticated;
GRANT ALL ON public.quiz_questions TO service_role;

-- Public View for Questions (omits correct_answer_index to prevent cheating)
DROP VIEW IF EXISTS public.quiz_questions_public CASCADE;
CREATE OR REPLACE VIEW public.quiz_questions_public AS
  SELECT
    id,
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


-- ---------------------------------------------------------------------
-- 3. TABLE: quiz_attempts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
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
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_program ON public.quiz_attempts(program_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_email ON public.quiz_attempts(participant_email);

-- RLS: quiz_attempts (Inserted & evaluated strictly server-side)
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_attempts FROM anon, authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;

-- Public View for Live Results Leaderboard
DROP VIEW IF EXISTS public.quiz_attempts_leaderboard CASCADE;
CREATE OR REPLACE VIEW public.quiz_attempts_leaderboard AS
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
    COALESCE(p.name, qa.student_id) AS candidate_name,
    COALESCE(p.institute_name, 'National Management Institute') AS institute_name,
    COALESCE(p.registration_number, 'AIMA-CL26-00000') AS registration_number
  FROM public.quiz_attempts qa
  LEFT JOIN public.participants p ON (p.email = qa.participant_email OR p.id::text = qa.student_id)
  WHERE qa.is_completed = true;

GRANT SELECT ON public.quiz_attempts_leaderboard TO anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. SEED DATA: 4 Quiz Programs from mockData
-- ---------------------------------------------------------------------
INSERT INTO public.quiz_programs (
  id, code, title, tagline, description, stage, category, status,
  start_time, end_time, duration_minutes, total_questions, total_marks,
  passing_marks, passing_percentage, negative_marking, negative_marks_per_question,
  marks_per_question, fee, max_intake, enrolled_count, completed_count,
  in_progress_count, instructions, eligibility, proctoring_strictness, proctoring_mode, tags
) VALUES
(
  'qp_r1_national_2026',
  'AIMA-ICL-QZ-01',
  'Round 1: National Business Screening Assessment',
  'Mandatory individual timed screening test for all registered candidate teams',
  'Comprehensive 45-minute standardized online assessment testing business awareness, strategy concepts, data interpretation, financial fundamentals, and AI ethics with strict anti-cheating browser proctoring.',
  'round_1',
  'Corporate Strategy & Business Awareness',
  'live',
  '2026-09-10T10:00:00Z',
  '2026-09-15T22:00:00Z',
  45, 25, 100, 65, 65, true, 0.5, 4, 200, 15000, 9420, 6840, 342,
  ARRAY[
    'Each question carries 4 marks with a negative penalty of 0.5 marks for incorrect attempts.',
    'Full-screen lockdown is strictly enforced. Tab switches exceeding 3 violations trigger immediate session flag.',
    'Auto-save commits answer choices to cloud state continuously upon every click.',
    'Tie-breaker sequence: Score > Completion Time > Analytical Sub-score > Negative Accuracy.'
  ],
  'All verified undergraduate and postgraduate management students enrolled in accredited institutions.',
  'High (Webcam + Fullscreen + Tab Lock)',
  'strict_lockdown',
  ARRAY['National Screening', 'Round 1 Qualifier', 'Timer Enforced', 'Proctored']
),
(
  'qp_strategy_practice_mock',
  'AIMA-ICL-MOCK-02',
  'Executive Case & Strategy Mock Warm-up Test',
  'Practice simulation quiz designed for familiarization with UI & question topology',
  'Non-credit practice diagnostic test covering classic Harvard/ICRC business caselets, Porter five forces, unit economics, and ESG corporate governance frameworks.',
  'round_1',
  'Management Concepts & Case Analysis',
  'scheduled',
  '2026-09-05T00:00:00Z',
  '2026-09-25T23:59:00Z',
  30, 15, 60, 30, 50, false, 0, 4, 0, 20000, 4320, 3890, 88,
  ARRAY[
    'Open practice sandbox with unlimited retakes for registered student teams.',
    'Instant answer rationale and solution explanations revealed upon submission.',
    'No negative marking penalty applied.'
  ],
  'Open to all registered candidates and faculty mentors.',
  'Relaxed',
  'unmonitored',
  ARRAY['Practice Sandbox', 'Mock Assessment', 'Instant Rationale']
),
(
  'qp_ai_esg_special_challenge',
  'AIMA-ICL-SPEC-03',
  'Special Innovation Challenge: ESG & GenAI Strategy',
  'Special Corporate Partner sponsored assessment for sustainability leadership awards',
  'Advanced 30-minute analytical quiz sponsored by Tata Sons and McKinsey testing supply chain decarbonization models, Scope 1-3 carbon audits, and Generative AI enterprise deployment.',
  'round_2',
  'Sustainability & AI',
  'scheduled',
  '2026-09-20T10:00:00Z',
  '2026-09-30T18:00:00Z',
  30, 20, 80, 56, 70, true, 1, 4, 0, 3000, 1840, 920, 45,
  ARRAY[
    'Qualifying scores contribute to the Special Innovation & ESG Commendation trophy in the Grand Finale.',
    'Requires webcam verification and microphone ambient check.'
  ],
  'Round 1 Qualifiers and Corporate Track nominees.',
  'High (Webcam + Fullscreen + Tab Lock)',
  'strict_lockdown',
  ARRAY['Special Award', 'ESG Strategy', 'AI Innovation', 'Corporate Partner']
),
(
  'qp_regional_speed_round',
  'AIMA-ICL-REG-04',
  'Regional Live Hub Rapid-Fire Strategy Round',
  'On-premises buzzer and instant analytical quiz conducted at 5 Regional Hubs',
  'Synchronized live quiz challenge administered in auditoriums across Delhi, Mumbai, Bengaluru, Kolkata, and Bhopal during the Round 3 offline regional summits.',
  'round_3',
  'Economics & Policy',
  'draft',
  '2026-10-18T10:00:00Z',
  '2026-10-27T17:00:00Z',
  20, 15, 60, 45, 75, true, 1, 4, 2000, 200, 120, 0, 0,
  ARRAY[
    'Conducted strictly in-person with biometric QR hall-ticket check-in.',
    'Immediate live auditorium leaderboard broadcast on projection screens.'
  ],
  'Regional Hub Finalists (Top 120 teams nationwide).',
  'High (Webcam + Fullscreen + Tab Lock)',
  'strict_lockdown',
  ARRAY['Offline Hub', 'Rapid Fire', 'Regional Finale', 'Live Audience']
)
ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------
-- 5. SEED DATA: 10 Quiz Questions from mockData
-- ---------------------------------------------------------------------
INSERT INTO public.quiz_questions (
  id, question_text, options, correct_answer_index, marks, negative_marks,
  difficulty, category, explanation, caselet_snippet, is_active
) VALUES
(
  'q1',
  'A fast-moving consumer goods (FMCG) enterprise observes a 12% rise in gross margin while net sales volume drops by 4% in Q2. Which of the following strategic shifts best explains this financial outcome?',
  ARRAY[
    'Aggressive predatory pricing across tier-3 rural distributor networks',
    'Successful premiumisation pivot with increased average selling price (ASP)',
    'Unplanned warehouse inventory write-offs due to seasonal spoilage',
    'Expansion into capital-intensive contract manufacturing agreements'
  ],
  1, 4, 1, 'Medium', 'Corporate Strategy',
  'A rise in gross margin accompanied by a slight drop in total unit volume is the hallmark of a premiumisation strategy, where higher unit pricing outweighs volume contraction.',
  NULL, true
),
(
  'q2',
  'According to Michael Porter’s Five Forces framework, which condition leads to HIGH bargaining power of suppliers?',
  ARRAY[
    'The industry buyers face negligible switching costs between alternative suppliers',
    'Suppliers pose a credible threat of forward integration into the buyer industry',
    'Supplier products are commoditized with abundant synthetic substitutes',
    'The buyer industry represents the largest proportion of total supplier sales'
  ],
  1, 3, 1, 'Easy', 'Management Concepts',
  'When suppliers possess the capital and technical capability to credibly integrate forward into the buyers'' industry, their bargaining power is significantly elevated.',
  NULL, true
),
(
  'q3',
  'Caselet: "BharatFin Microcredit disbursed ₹450 Cr in Q1. Its gross Non-Performing Asset (NPA) ratio rose from 1.8% to 3.4% following unexpected monsoon flooding across three eastern agricultural belts." Which risk management instrument would most effectively insulate the loan book from future catastrophic climate events?',
  ARRAY[
    'Arbitrary interest rate hikes on subsequent lending tranches',
    'Parametric weather-index-linked credit default insurance bundling',
    'Immediate liquidation of all physical branch infrastructure in affected regions',
    'Extending 100% unsecured personal loans to replace agricultural facilities'
  ],
  1, 5, 1.5, 'Hard', 'Data Interpretation',
  'Parametric index insurance triggers immediate claims payout upon reaching predetermined rainfall/flood thresholds, directly servicing borrower EMIs and protecting portfolio asset quality.',
  'Portfolio: ₹450 Cr | Vulnerability: Crop-loss dependent rural borrowers | Current Gross NPA: 3.4%', true
),
(
  'q4',
  'In Indian macro-economic policy, the Reserve Bank of India’s "Standing Deposit Facility" (SDF) rate operates primarily to:',
  ARRAY[
    'Provide collateralized short-term liquidity loans to foreign portfolio investors',
    'Absorb surplus liquidity from commercial banks without collateral pledge requirements',
    'Set the ceiling on corporate municipal bond yields in primary auctions',
    'Regulate foreign exchange spot intervention in international offshore markets'
  ],
  1, 4, 1, 'Medium', 'Economics & Policy',
  'Introduced in April 2022, SDF serves as an uncollateralized liquidity absorption tool placed 25 bps below the policy Repo rate in the Liquidity Adjustment Facility corridor.',
  NULL, true
),
(
  'q5',
  'A B2B SaaS startup reports Customer Acquisition Cost (CAC) = ₹18,000, Average Revenue Per Account (ARPA) = ₹6,000/month with Gross Margin = 80%, and monthly logo churn = 2.5%. What is the approximate LTV to CAC ratio?',
  ARRAY[
    '2.5 : 1',
    '5.3 : 1',
    '10.7 : 1',
    '18.2 : 1'
  ],
  2, 5, 1.5, 'Hard', 'Finance & Marketing',
  'Average Customer Lifetime = 1 / 0.025 = 40 months. Gross margin per month = ₹6,000 * 0.8 = ₹4,800. LTV = 40 * ₹4,800 = ₹192,000. LTV/CAC = 192,000 / 18,000 = 10.67 (~10.7:1).',
  NULL, true
),
(
  'q6',
  'Under the ESG (Environmental, Social, and Governance) BRSR Core framework prescribed by SEBI for top 1000 listed Indian entities, Scope 3 greenhouse gas emissions refer to:',
  ARRAY[
    'Direct emissions from company-owned diesel generators and boilers',
    'Indirect emissions from purchased electricity, steam, heating, and cooling',
    'All other indirect value chain emissions including supplier transport and end-of-life product disposal',
    'Carbon offset credits purchased on voluntary international exchanges'
  ],
  2, 3, 1, 'Easy', 'Sustainability & AI',
  'Scope 3 encompasses upstream supply chain emissions, logistics, business travel, and downstream product use/disposal across the entire corporate lifecycle.',
  NULL, true
),
(
  'q7',
  'When deploying Large Language Models (LLMs) in corporate supply chain analytics, "Retrieval-Augmented Generation" (RAG) is principally utilized to:',
  ARRAY[
    'Re-train the foundation transformer model parameters from scratch on every user prompt',
    'Ground the model’s reasoning in proprietary enterprise databases while eliminating hallucinations',
    'Bypass all corporate data security firewalls and API encryption standards',
    'Compress 4K video surveillance streams for factory floor robotic assembly lines'
  ],
  1, 4, 1, 'Medium', 'Sustainability & AI',
  'RAG retrieves relevant private context chunks from internal vector embeddings and feeds them into the prompt window, delivering accurate domain-grounded synthesis.',
  NULL, true
),
(
  'q8',
  'An enterprise evaluating capital expenditure across two mutually exclusive solar projects finds Project A has higher NPV at a 10% discount rate, but Project B has a higher Internal Rate of Return (IRR). If the cost of capital is 8%, which project should be selected and why?',
  ARRAY[
    'Project B, because IRR is always independent of market reinvestment assumptions',
    'Project A, because NPV directly measures net shareholder wealth creation',
    'Neither project should be approved if IRR and NPV rankings diverge',
    'Both projects simultaneously using debt-heavy mezzanine financing'
  ],
  1, 4, 1, 'Medium', 'Finance & Marketing',
  'NPV is the gold standard for mutually exclusive capital budgeting because it calculates absolute economic dollar value added, whereas IRR assumes reinvestment at the IRR rate itself.',
  NULL, true
),
(
  'q9',
  'Which of the following blue ocean strategy tools is explicitly designed to identify which industry factors should be Eliminated, Reduced, Raised, and Created?',
  ARRAY[
    'The Boston Consulting Group (BCG) Growth-Share Matrix',
    'The Four Actions Framework (ERRC Grid)',
    'The Ansoff Product-Market Expansion Matrix',
    'McKinsey 7-S Organizational Alignment Framework'
  ],
  1, 3, 1, 'Easy', 'Corporate Strategy',
  'Kim and Mauborgne’s ERRC (Eliminate-Reduce-Raise-Create) Grid allows companies to reconstruct buyer value elements and unlock new uncontested market space.',
  NULL, true
),
(
  'q10',
  'In logistics management, the "Bullwhip Effect" is primarily aggravated by which operational behavior?',
  ARRAY[
    'Real-time point-of-sale (POS) data transparency across all distribution tiers',
    'Order batching, price fluctuations, and rationing gaming during supply pinches',
    'Vendor-Managed Inventory (VMI) partnerships with key supermarket retail anchors',
    'Adoption of Just-In-Time (JIT) continuous kanban replenishment schedules'
  ],
  1, 4, 1, 'Medium', 'Business Awareness',
  'Order batching, phantom ordering during shortages, and price promotions amplify demand variance exponentially upstream toward raw material suppliers.',
  NULL, true
)
ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------------
-- 6. SEED DATA: 2 Initial Attempts (from CompetitionContext)
-- ---------------------------------------------------------------------
INSERT INTO public.quiz_attempts (
  attempt_id, student_id, user_id, participant_email, team_id, program_id,
  start_time, submitted_at, answers, marked_for_review, score,
  analytical_score, time_taken_seconds, tab_switch_count, is_completed
) VALUES
(
  'att_usr_student_leader_1',
  'usr_student_leader_1',
  'usr_student_leader_1',
  'arjun.mehta@iima.ac.in',
  'team_stratapex',
  'qp_r1_national_2026',
  '2026-09-10T10:00:00Z',
  '2026-09-10T14:32:00Z',
  '{"q1": 1, "q2": 1, "q3": 1}'::jsonb,
  ARRAY[]::TEXT[],
  92, 36, 1840, 0, true
),
(
  'att_usr_student_member_1',
  'usr_student_member_1',
  'usr_student_member_1',
  'sneha.patel@iima.ac.in',
  'team_stratapex',
  'qp_r1_national_2026',
  '2026-09-10T10:15:00Z',
  '2026-09-10T14:45:00Z',
  '{"q1": 1, "q2": 1, "q3": 1}'::jsonb,
  ARRAY[]::TEXT[],
  89, 34, 1920, 0, true
)
ON CONFLICT (attempt_id) DO NOTHING;
