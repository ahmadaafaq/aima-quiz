-- =================================================================
-- AIMA India Case League 2026 - Case Competition Stage 1 Business Quiz
-- Migration: Client Quiz Program + 30 Questions (25 Main + 5 Reserve)
-- File: migrations/case_competition_stage1_quiz_migration.sql
-- Generated: 2026-10-22T04:56:10.345Z
-- =================================================================

-- 1. Insert / upsert the quiz program
INSERT INTO public.quiz_programs (
  id, code, title, tagline, description, stage, category, status,
  start_time, end_time, duration_minutes, total_questions, total_marks,
  passing_marks, passing_percentage, negative_marking, negative_marks_per_question,
  marks_per_question, fee, max_intake, enrolled_count, completed_count,
  in_progress_count, instructions, eligibility, proctoring_strictness, proctoring_mode, tags
) VALUES (
  'qp_case_comp_stage1_2026',
  'AIMA-CL26-S1-QZ',
  'Case Competition – Stage 1 Business Quiz',
  'Multiple-choice screening round | 25 scored questions + 5 reserve / tie-breaker questions',
  'Comprehensive business knowledge quiz covering Management Theory, Companies in the News, Management Application, and Brands/Valuation/Startup/VC. 25 scored questions at 4 marks each. No negative marking applies. 5 reserve questions are used only as tie-breakers.',
  'round_1',
  'Management Concepts',
  'live',
  '2026-11-01T10:00:00Z',
  '2026-11-30T22:00:00Z',
  45, 25, 100,
  60, 60,
  false, 0, 4, 0, 20000, 0, 0, 0,
  ARRAY[
    'Each question carries 4 marks. There is NO negative marking for wrong answers.',
    'Unattempted questions score 0.',
    'Q1–Q25 are scored. Q26–Q30 are reserve / tie-breaker questions used only when total scores are tied.',
    'Full-screen lockdown is strictly enforced. Tab switches exceeding 3 violations trigger immediate session flag.',
    'Tie-breaker sequence: Score > Completion Time > Reserve Question Score.'
  ],
  'All registered management students from accredited institutions participating in AIMA India Case League 2026.',
  'High (Webcam + Fullscreen + Tab Lock)',
  'strict_lockdown',
  ARRAY['Stage 1', 'Case Competition', 'Screening', 'No Negative Marking', 'Proctored']
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  negative_marking = EXCLUDED.negative_marking,
  negative_marks_per_question = EXCLUDED.negative_marks_per_question,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- 2. Insert / upsert 30 quiz questions (25 Main + 5 Reserve)
INSERT INTO public.quiz_questions (
  id, question_text, options, correct_answer_index, marks, negative_marks,
  difficulty, category, explanation, caselet_snippet, is_active
) VALUES
(
  'q_cc_s1_01',
  'An Indian IT services firm raised salaries by 15% and upgraded its cafeteria and office interiors. Six months later, exit-interview data shows dissatisfaction has dropped, but engagement and discretionary effort have NOT risen. Which theory best explains this outcome?',
  ARRAY['Herzberg''s Two-Factor Theory – pay and working conditions are hygiene factors: they reduce dissatisfaction but do not create motivation', 'McClelland''s Theory – employees have a high need for power that pay cannot satisfy', 'Maslow''s Hierarchy – employees have jumped straight to self-actualisation', 'McGregor''s Theory X – employees are inherently lazy and respond only to control'],
  0, 4, 0,
  'Medium', 'Management Concepts',
  'Herzberg separates hygiene factors (salary, policies, working conditions) from motivators (achievement, recognition, responsibility, growth). Fixing hygiene removes dissatisfaction; engagement needs motivators such as job enrichment and recognition.',
  NULL, true
),
(
  'q_cc_s1_02',
  'A mid-sized apparel brand tries to undercut discount chains on price while also funding premium designer collaborations, across all customer segments. It ends up with neither the lowest cost nor a clear premium image, and loses share to focused rivals. Michael Porter would describe this firm as:',
  ARRAY['Pursuing a Blue Ocean strategy', 'Stuck in the middle', 'Executing a successful cost-focus strategy', 'Achieving an integrated low-cost/differentiation advantage'],
  1, 4, 0,
  'Medium', 'Management Concepts',
  'Porter argued that firms which fail to commit to cost leadership, differentiation or focus become ''stuck in the middle'', with lower profitability than committed rivals.',
  NULL, true
),
(
  'q_cc_s1_03',
  'According to Clayton Christensen, which scenario is the clearest example of DISRUPTIVE (not sustaining) innovation?',
  ARRAY['An incumbent smartphone maker adds a better camera to its flagship model each year', 'A luxury carmaker launches a faster, more expensive sports variant', 'A new entrant offers a cheaper, ''good-enough'' product to overlooked low-end or non-consumers, then steadily moves upmarket', 'A market leader cuts prices temporarily to block a competitor''s launch'],
  2, 4, 0,
  'Medium', 'Management Concepts',
  'Disruption starts at the low end or with non-consumption, where incumbents are happy to cede margin-poor customers; the entrant then improves and moves upmarket. Better features for existing best customers are sustaining innovations.',
  NULL, true
),
(
  'q_cc_s1_04',
  'Cirque du Soleil removed animal acts and star performers, reduced thrill-and-danger elements, raised the venue experience, and created theme-based artistic storylines. Which framework did this exactly follow?',
  ARRAY['BCG Growth-Share Matrix', 'McKinsey 7-S Framework', 'Ansoff Product-Market Matrix', 'Four Actions Framework / ERRC Grid (Eliminate-Reduce-Raise-Create)'],
  3, 4, 0,
  'Medium', 'Management Concepts',
  'Kim & Mauborgne''s Blue Ocean Strategy uses the Four Actions Framework (Eliminate, Reduce, Raise, Create) to break the value-cost trade-off and open uncontested market space. Cirque du Soleil is the book''s flagship case.',
  NULL, true
),
(
  'q_cc_s1_05',
  'A conglomerate rates its packaged-foods unit as MEDIUM on industry attractiveness but HIGH on business-unit strength, using weighted multi-factor scores. On the GE-McKinsey nine-cell matrix, what is the recommended strategic posture?',
  ARRAY['Invest/Grow – the unit falls in the green zone, so allocate capital to build share', 'Harvest/Divest – maximise cash and plan an exit', 'Hold/Selectivity – maintain position and invest only in promising segments', 'Classify it as a ''Question Mark'' and decide later'],
  0, 4, 0,
  'Medium', 'Management Concepts',
  'In the GE-McKinsey matrix, the three top-left cells (High-High, High-Medium, Medium-High) are the ''invest/grow'' zone; the diagonal is ''selectivity/hold''; the bottom-right is ''harvest/divest''. Unlike the BCG matrix (market growth vs relative share), GE uses composite, weighted factors. ''Question Mark'' is BCG terminology – a deliberate distractor.',
  NULL, true
),
(
  'q_cc_s1_06',
  'Jio Platforms opens its IPO on 21 Oct 2026 (price band Rs 1,065–1,119). Why is this issue a landmark for Indian capital markets?',
  ARRAY['It is the first Indian company to list directly on Nasdaq', 'At ~Rs 30,213 crore it is India''s largest-ever IPO, and it is entirely a fresh issue with no offer-for-sale', 'Reliance is selling its entire telecom stake to exit the business', 'It is the first SME-platform IPO above Rs 10,000 crore'],
  1, 4, 0,
  'Medium', 'Business Awareness',
  'The ~Rs 30,213 cr issue surpasses Hyundai Motor India''s Rs 27,870 cr IPO (2024). It is all fresh issue (no OFS); up to ~Rs 27,500 cr goes to repaying debt at Reliance Jio Infocomm. Valuation ~US$108 bn at the upper band; anchors put in ~Rs 8,110 cr. Management angle: using equity to deleverage before the AI/cloud push.',
  NULL, true
),
(
  'q_cc_s1_07',
  'In June 2026, which company''s listing (raising ~US$75 bn at a ~US$1.77 trn valuation) displaced Saudi Aramco''s 2019 record as the largest IPO in history?',
  ARRAY['OpenAI', 'Stripe', 'SpaceX', 'Databricks'],
  2, 4, 0,
  'Medium', 'Business Awareness',
  'SpaceX listed on 12 June 2026. Discussion point for a case round: Starlink''s subscription revenue converted a lumpy launch-contract business into a recurring-revenue model – yet the company still reported a net loss in 2025, and some analysts called the IPO price heavily overvalued.',
  NULL, true
),
(
  'q_cc_s1_08',
  'Spend-management fintech Ramp raised US$1.85 bn at a US$60 bn valuation in Oct 2026, just four months after raising at US$44 bn. What is the approximate valuation step-up between the two rounds?',
  ARRAY['16%', '27%', '60%', '36%'],
  3, 4, 0,
  'Medium', 'Business Awareness',
  '(60 − 44) / 44 = 36.4%. Ramp sells corporate cards and AI-driven expense/spend management; annualised revenue crossed US$2 bn with ~85,000 customers, so the round implies roughly 30x revenue – a talking point on AI-premium valuations.',
  NULL, true
),
(
  'q_cc_s1_09',
  'Sun Pharma''s ~US$11.75 bn all-cash acquisition of Organon (pending close, expected early 2027) is the largest-ever acquisition by an Indian pharma company. What is the primary strategic logic?',
  ARRAY['Inorganic entry and scale in global women''s health – a related diversification that adds brands and a US/global commercial footprint', 'Backward integration into Active Pharmaceutical Ingredient (API) manufacturing', 'A merger of equals executed through a share swap', 'Exiting the US market by selling its American subsidiaries'],
  0, 4, 0,
  'Medium', 'Business Awareness',
  'The deal buys the Merck spin-off to build a global women''s-health franchise. Being all-cash (not a share swap), it raises leverage and integration-risk questions – good material for a finance/strategy case discussion.',
  NULL, true
),
(
  'q_cc_s1_10',
  'Vineeta Singh-led SUGAR Cosmetics raised ~Rs 145 crore from A91 Partners (Sept 2026) at a post-money valuation estimated ~75-80% below its Nov 2024 round, after FY25 revenue fell ~20% and losses roughly doubled. In VC terms this is a ____, and the term-sheet clause that gives earlier investors the MOST protection in it is ____.',
  ARRAY['Bridge round; pro-rata rights', 'Up round; drag-along rights', 'Down round; full-ratchet anti-dilution', 'Down round; weighted-average anti-dilution'],
  2, 4, 0,
  'Medium', 'Business Awareness',
  'A round priced below the previous one is a down round. Full ratchet resets earlier investors'' conversion price to the new, lower price – the most investor-friendly (and founder-dilutive) protection; broad-based weighted average is the more common, milder version. Case angle: reports linked SUGAR''s slide to aggressive offline expansion, with a sizeable share of new stores shut due to per-store losses – a lesson in channel economics for D2C brands.',
  NULL, true
),
(
  'q_cc_s1_11',
  'A quick-commerce dark store processes 120 orders per hour. On average an order spends 15 minutes from receipt to dispatch. Using Little''s Law, how many orders are in process at any moment, on average?',
  ARRAY['8', '30', '15', '480'],
  1, 4, 0,
  'Hard', 'Management Concepts',
  'L = λ × W = 120 orders/hr × 0.25 hr = 30 orders. Managers use this to size picker headcount and staging space.',
  NULL, true
),
(
  'q_cc_s1_12',
  'A detergent brand sees retail sales vary by only ±5% week to week, but orders arriving at its factory swing by ±40%. What is this phenomenon and the most effective remedy?',
  ARRAY['Pareto effect – adopt ABC inventory classification', 'Theory of Constraints – add capacity at the bottleneck', 'Learning curve – increase production volume', 'Bullwhip effect – share point-of-sale data upstream, use vendor-managed inventory and reduce order batching'],
  3, 4, 0,
  'Medium', 'Management Concepts',
  'Demand distortion amplifies as it moves upstream (bullwhip effect), driven by order batching, forecast updating, price promotions and shortage gaming. Information sharing and VMI dampen it.',
  NULL, true
),
(
  'q_cc_s1_13',
  'A new OTT platform enters a crowded Indian market at Rs 49/month – far below incumbents – aiming to build a large subscriber base quickly and benefit from scale and word-of-mouth. This is:',
  ARRAY['Penetration pricing', 'Price skimming', 'Prestige pricing', 'Cost-plus pricing'],
  0, 4, 0,
  'Medium', 'Management Concepts',
  'Penetration pricing sets a low entry price to win share fast in price-sensitive markets with scale economies; skimming does the opposite (high initial price, lowered over time).',
  NULL, true
),
(
  'q_cc_s1_14',
  'Godrej Consumer Products, best known for home insecticides (Good Knight) and personal care, committed Rs 500 crore over five years to enter the pet-care business. On the Ansoff matrix this is:',
  ARRAY['Market penetration', 'Market development', 'Diversification', 'Product development in an existing market'],
  2, 4, 0,
  'Medium', 'Management Concepts',
  'New products (pet food/care) for a new customer market (pet owners) = diversification (here, related diversification leveraging FMCG distribution and brand-building skills).',
  NULL, true
),
(
  'q_cc_s1_15',
  'After a leadership programme, an HR team measures whether managers actually changed how they run team meetings and give feedback, three months later on the job. Which Kirkpatrick level is this?',
  ARRAY['Level 1 – Reaction', 'Level 3 – Behaviour', 'Level 2 – Learning', 'Level 4 – Results'],
  1, 4, 0,
  'Medium', 'Management Concepts',
  'Kirkpatrick: L1 Reaction (satisfaction), L2 Learning (knowledge/skill gain), L3 Behaviour (transfer to the job), L4 Results (business outcomes such as productivity or attrition).',
  NULL, true
),
(
  'q_cc_s1_16',
  'A sales firm offers a very attractive Thailand trip for reaching a quarterly target, and the firm always honours its rewards. Yet most reps make no extra effort because they believe the target is impossible to hit. In Vroom''s model (M = E × I × V), which element is failing?',
  ARRAY['Valence', 'Instrumentality', 'Equity', 'Expectancy'],
  3, 4, 0,
  'Medium', 'Management Concepts',
  'Expectancy is the belief that effort leads to performance. Valence (attractive trip) and instrumentality (rewards are honoured) are high, but because the terms multiply, near-zero expectancy collapses motivation. Fix: realistic targets, training, resources.',
  NULL, true
),
(
  'q_cc_s1_17',
  'A retail chain wants to analyse five years of sales by region, product and month (slice-and-dice, drill-down) without slowing its live billing system. The most appropriate solution is:',
  ARRAY['Run complex queries directly on the transaction processing (OLTP) database', 'Add more cashier terminals', 'A data warehouse with OLAP tools', 'A CRM system'],
  2, 4, 0,
  'Medium', 'Management Concepts',
  'OLTP systems are optimised for fast transactions. Historical, multi-dimensional analysis belongs in a separate data warehouse with OLAP cubes, protecting operational performance.',
  NULL, true
),
(
  'q_cc_s1_18',
  'A CFO uses a model to test ''what if crude rises 10%, the rupee falls 3% and volumes drop 5%?'' across several scenarios before deciding on price increases. Which type of information system is this?',
  ARRAY['Decision Support System (DSS)', 'Transaction Processing System (TPS)', 'Office Automation System', 'Enterprise Resource Planning (ERP) system'],
  0, 4, 0,
  'Medium', 'Management Concepts',
  'A DSS supports semi-structured decisions with models, what-if and sensitivity analysis. A TPS records routine transactions; ERP integrates processes on a common database.',
  NULL, true
),
(
  'q_cc_s1_19',
  'A company has a net profit margin of 8%, asset turnover of 1.5x and an equity multiplier of 2.0x. What is its Return on Equity (ROE)?',
  ARRAY['11.5%', '12%', '3.2%', '24%'],
  3, 4, 0,
  'Hard', 'Management Concepts',
  'ROE = Net margin × Asset turnover × Equity multiplier = 8% × 1.5 × 2.0 = 24%. The DuPont split shows how much ROE comes from leverage rather than operations.',
  NULL, true
),
(
  'q_cc_s1_20',
  'A firm''s Days Inventory Outstanding = 45, Days Sales Outstanding = 30 and Days Payables Outstanding = 40. What is its Cash Conversion Cycle?',
  ARRAY['115 days', '35 days', '55 days', '25 days'],
  1, 4, 0,
  'Hard', 'Management Concepts',
  'CCC = DIO + DSO − DPO = 45 + 30 − 40 = 35 days – the number of days cash is tied up in operations.',
  NULL, true
),
(
  'q_cc_s1_21',
  'A startup raises Rs 20 crore from a VC at a pre-money valuation of Rs 80 crore. What stake does the VC hold after the round?',
  ARRAY['25%', '16%', '20%', '80%'],
  2, 4, 0,
  'Medium', 'Finance & Marketing',
  'Post-money = 80 + 20 = Rs 100 cr. VC stake = 20 / 100 = 20%. (25% is the common error of dividing by pre-money.)',
  NULL, true
),
(
  'q_cc_s1_22',
  'AI-chip startup Tenstorrent raised US$1.5 bn in a Series E at a US$6.2 bn POST-money valuation (Oct 2026). What was the implied PRE-money valuation?',
  ARRAY['US$4.7 bn', 'US$7.7 bn', 'US$6.2 bn', 'US$1.5 bn'],
  0, 4, 0,
  'Medium', 'Finance & Marketing',
  'Pre-money = Post-money − New money = 6.2 − 1.5 = US$4.7 bn. New investors own about 1.5/6.2 ≈ 24%.',
  NULL, true
),
(
  'q_cc_s1_23',
  'A VC invested US$10 mn for 25% with a 1x NON-participating liquidation preference. The company is sold for US$30 mn. How much does the VC receive?',
  ARRAY['US$7.5 mn', 'US$10 mn', 'US$15 mn', 'US$2.5 mn'],
  1, 4, 0,
  'Hard', 'Finance & Marketing',
  'Non-participating: the VC takes the higher of (a) its 1x preference = $10 mn or (b) converting to common = 25% × 30 = $7.5 mn. It takes $10 mn; common holders share $20 mn. ($15 mn would apply only with a participating preference.)',
  NULL, true
),
(
  'q_cc_s1_24',
  'Cult.fit received SEBI approval (Oct 2026) for an IPO with a Rs 950 crore fresh issue plus an offer-for-sale (OFS) of up to 17.86 crore shares. Who receives the money raised through the OFS portion?',
  ARRAY['The company, to fund new gym openings', 'SEBI, as a listing fee', 'It is split equally between the company and its lenders', 'The existing shareholders who sell their shares'],
  3, 4, 0,
  'Medium', 'Finance & Marketing',
  'Fresh issue proceeds go to the company (new shares, dilution). OFS proceeds go to selling shareholders (no new shares, an exit route for early investors/founders). Cult.fit''s FY26 loss also nearly halved – a useful profitability-before-IPO talking point.',
  NULL, true
),
(
  'q_cc_s1_25',
  'Amul''s three-tier cooperative structure – village milk societies, district unions and a state federation (GCMMF) – championed by Dr Verghese Kurien, is popularly known as the:',
  ARRAY['Anand Pattern', 'Operation Flood Model', 'Mondragon Model', 'Kibbutz Model'],
  0, 4, 0,
  'Medium', 'Finance & Marketing',
  'The Anand Pattern (named after Anand, Gujarat) was replicated nationwide under Operation Flood, the programme that scaled it. Producer ownership lets Amul run thin margins while returning most of the consumer rupee to farmers.',
  NULL, true
),
(
  'q_cc_s1_26',
  'In 2025, Zomato Ltd renamed its listed parent company ''Eternal Ltd'', while keeping Zomato, Blinkit, District and Hyperpure as separate consumer-facing brands. This move is best described as:',
  ARRAY['A line extension of the Zomato brand', 'Co-branding with a partner company', 'A shift toward a ''house of brands'' architecture with a distinct corporate parent', 'Repositioning Zomato as a budget brand'],
  2, 4, 0,
  'Medium', 'Finance & Marketing',
  'Separating the corporate parent from its flagship brand lets each business (food delivery, quick commerce, going-out, B2B supplies) build its own identity, and signals to investors that the group is more than food delivery.',
  NULL, true
),
(
  'q_cc_s1_27',
  'The Tata Nano, Ratan Tata''s ''people''s car'', sold far below expectations. Which positioning lesson is most often drawn from its failure?',
  ARRAY['The car was priced too high for two-wheeler owners', 'Positioning it as the ''cheapest car'' clashed with the aspirational, status value Indian buyers attach to owning a car', 'Too much advertising spend created unrealistic expectations', 'It was positioned as a luxury product for urban elites'],
  1, 4, 0,
  'Medium', 'Finance & Marketing',
  'Ratan Tata himself later acknowledged that calling it the cheapest car was a mistake. For many buyers, a car signals status; ''cheapest'' carried a stigma (along with early fire incidents and the Singur plant relocation).',
  NULL, true
),
(
  'q_cc_s1_28',
  'Zetwerk''s Oct 2026 IPO (price band Rs 143–151) implied a market capitalisation of ~Rs 25,583 crore against FY26 revenue of ~Rs 15,913 crore. The commonly quoted multiple for this pricing is:',
  ARRAY['P/E of 1.6x', 'Price-to-Book of 16x', 'EV/EBITDA of 1.6x', 'Price-to-Sales of ~1.6x'],
  3, 4, 0,
  'Hard', 'Finance & Marketing',
  '25,583 / 15,913 ≈ 1.6x revenue (Price-to-Sales). Low-margin, asset-light manufacturing platforms are often compared on revenue multiples. About Rs 2,160 cr of the fresh issue is earmarked for debt repayment.',
  NULL, true
),
(
  'q_cc_s1_29',
  'Indian startups raised US$10.9 bn across 1,253 rounds in Jan–Oct 2026, up 6.8% year-on-year. Which trend did reports highlight in how this capital was deployed?',
  ARRAY['Investors concentrated larger cheques in fewer startups, especially deeptech', 'A ''spray-and-pray'' boom in thousands of small seed cheques', 'Funding collapsed by more than half versus 2025', 'Consumer social-media apps took the majority of funding'],
  0, 4, 0,
  'Medium', 'Finance & Marketing',
  'Fewer, larger rounds signal a ''flight to quality'' and a tilt toward deeptech (semiconductors, AI infrastructure) – e.g., Tessolve Semiconductor''s US$75 mn round in mid-October.',
  NULL, true
),
(
  'q_cc_s1_30',
  'Blinkit, Zepto and Swiggy Instamart promise 10-minute delivery. The core operational asset enabling this is a dense network of small, closed-to-public urban fulfilment centres called:',
  ARRAY['Cross-docking hubs', 'Cloud (dark) kitchens', 'Dark stores', 'Drop-shipping warehouses'],
  2, 4, 0,
  'Medium', 'Finance & Marketing',
  'Dark stores stock a curated assortment of ~a few thousand SKUs close to demand clusters, cutting last-mile time. Key economics: order density, average order value and store throughput (see Little''s Law, Q11). Cloud kitchens are the food-prep equivalent, not a grocery store.',
  NULL, true
)
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer_index = EXCLUDED.correct_answer_index,
  marks = EXCLUDED.marks,
  negative_marks = EXCLUDED.negative_marks,
  explanation = EXCLUDED.explanation,
  is_active = EXCLUDED.is_active;

-- 3. Link all 30 questions to the quiz program (order_index matches Q number)
INSERT INTO public.quiz_program_questions (id, program_id, question_id, order_index)
VALUES
  ('qpq_cc_s1_01', 'qp_case_comp_stage1_2026', 'q_cc_s1_01', 1),
  ('qpq_cc_s1_02', 'qp_case_comp_stage1_2026', 'q_cc_s1_02', 2),
  ('qpq_cc_s1_03', 'qp_case_comp_stage1_2026', 'q_cc_s1_03', 3),
  ('qpq_cc_s1_04', 'qp_case_comp_stage1_2026', 'q_cc_s1_04', 4),
  ('qpq_cc_s1_05', 'qp_case_comp_stage1_2026', 'q_cc_s1_05', 5),
  ('qpq_cc_s1_06', 'qp_case_comp_stage1_2026', 'q_cc_s1_06', 6),
  ('qpq_cc_s1_07', 'qp_case_comp_stage1_2026', 'q_cc_s1_07', 7),
  ('qpq_cc_s1_08', 'qp_case_comp_stage1_2026', 'q_cc_s1_08', 8),
  ('qpq_cc_s1_09', 'qp_case_comp_stage1_2026', 'q_cc_s1_09', 9),
  ('qpq_cc_s1_10', 'qp_case_comp_stage1_2026', 'q_cc_s1_10', 10),
  ('qpq_cc_s1_11', 'qp_case_comp_stage1_2026', 'q_cc_s1_11', 11),
  ('qpq_cc_s1_12', 'qp_case_comp_stage1_2026', 'q_cc_s1_12', 12),
  ('qpq_cc_s1_13', 'qp_case_comp_stage1_2026', 'q_cc_s1_13', 13),
  ('qpq_cc_s1_14', 'qp_case_comp_stage1_2026', 'q_cc_s1_14', 14),
  ('qpq_cc_s1_15', 'qp_case_comp_stage1_2026', 'q_cc_s1_15', 15),
  ('qpq_cc_s1_16', 'qp_case_comp_stage1_2026', 'q_cc_s1_16', 16),
  ('qpq_cc_s1_17', 'qp_case_comp_stage1_2026', 'q_cc_s1_17', 17),
  ('qpq_cc_s1_18', 'qp_case_comp_stage1_2026', 'q_cc_s1_18', 18),
  ('qpq_cc_s1_19', 'qp_case_comp_stage1_2026', 'q_cc_s1_19', 19),
  ('qpq_cc_s1_20', 'qp_case_comp_stage1_2026', 'q_cc_s1_20', 20),
  ('qpq_cc_s1_21', 'qp_case_comp_stage1_2026', 'q_cc_s1_21', 21),
  ('qpq_cc_s1_22', 'qp_case_comp_stage1_2026', 'q_cc_s1_22', 22),
  ('qpq_cc_s1_23', 'qp_case_comp_stage1_2026', 'q_cc_s1_23', 23),
  ('qpq_cc_s1_24', 'qp_case_comp_stage1_2026', 'q_cc_s1_24', 24),
  ('qpq_cc_s1_25', 'qp_case_comp_stage1_2026', 'q_cc_s1_25', 25),
  ('qpq_cc_s1_26', 'qp_case_comp_stage1_2026', 'q_cc_s1_26', 26),
  ('qpq_cc_s1_27', 'qp_case_comp_stage1_2026', 'q_cc_s1_27', 27),
  ('qpq_cc_s1_28', 'qp_case_comp_stage1_2026', 'q_cc_s1_28', 28),
  ('qpq_cc_s1_29', 'qp_case_comp_stage1_2026', 'q_cc_s1_29', 29),
  ('qpq_cc_s1_30', 'qp_case_comp_stage1_2026', 'q_cc_s1_30', 30)
ON CONFLICT (program_id, question_id) DO NOTHING;

-- =================================================================
-- Migration complete.
-- Quiz Program ID: qp_case_comp_stage1_2026
-- Questions: 25 Main + 5 Reserve
-- Correct answer distribution: {"A":8,"B":7,"C":8,"D":7}
-- =================================================================