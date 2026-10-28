export interface CaseTrack {
  id: string;
  trackNumber: number;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  competenciesTested: string;
  masterCaseTitle?: string;
  masterCaseSummary?: string;
  caseDocFileName?: string;
  caseDocUrl?: string;
  accentColor: {
    bg: string;
    border: string;
    text: string;
    ring: string;
    gradient: string;
    badgeBg: string;
    badgeText: string;
  };
  focusQuestions: {
    code: 'Q1' | 'Q2' | 'Q3';
    title: string;
    weight: number;
    description: string;
  }[];
  keyEvaluationCriteria: string[];
}

export const OFFICIAL_CASE_TRACKS: CaseTrack[] = [
  {
    id: 'marketing_strategy',
    trackNumber: 1,
    name: 'Marketing Strategy',
    badge: 'TRACK 01',
    tagline: 'Asian Paints — Defending the Throne: When Market Leader Faces New Competition',
    description: 'Analyze Grasim Birla Opus’s aggressive entry (₹1,661 Cr paints revenue), dealer discounting, tinting machine monopolies, price elasticity, and Asian Paints’ market defense.',
    competenciesTested: 'Brand equity defense, dealer distribution network, competitive pricing response, and customer lifetime value.',
    masterCaseTitle: 'Asian Paints: Defending the Throne — When Market Leader Faces New Competition',
    masterCaseSummary: 'October 2026 scenario under MD & CEO Amit Syngle confronting Grasim Industries Birla Opus aggressive expansion and margin pressures.',
    caseDocFileName: 'AIMA_ICRC_Asian_Paints_Strategy _Case.pdf',
    caseDocUrl: '/AIMA_ICRC_Asian_Paints_Strategy%20_Case.pdf',
    accentColor: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      ring: 'ring-rose-500',
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-700 dark:text-rose-300',
    },
    focusQuestions: [
      {
        code: 'Q1',
        title: 'Competitor Threat & Market Share Vulnerability',
        weight: 20,
        description: 'Diagnose Birla Opus growth velocity, dealer incentives, and perception shifts across tier-1 and tier-2 decorative paint markets.',
      },
      {
        code: 'Q2',
        title: 'Dealer Channel Defense & Contractor Loyalty Architecture',
        weight: 25,
        description: 'Design dynamic pricing, contractor rebate structures, tinting machine lock-in programs, and direct-to-consumer digital touchpoints.',
      },
      {
        code: 'Q3',
        title: 'Brand Equity Restoration & Sustainable Leadership Roadmap',
        weight: 35,
        description: 'Formulate a 3-year strategic defense roadmap to protect 60%+ decorative market share while defending premium operating margins.',
      },
    ],
    keyEvaluationCriteria: [
      'Customer lifetime value & contractor network loyalty turnaround',
      'Defensive pricing and distributor retention mechanisms',
      'Long-term brand coherence and competitive moat reinforcement',
    ],
  },
  {
    id: 'operations',
    trackNumber: 2,
    name: 'Operations',
    badge: 'TRACK 02',
    tagline: 'IndiGo — Capacity, Resilient Execution & On-Time Performance',
    description: 'Solve the master case: "IndiGo: Restoring the On-Time Promise". Re-engineer crew planning, FDTL compliance, pilot reserves, winter fog disruption recovery, and cost of resilience.',
    competenciesTested: 'Capacity management, people, rostering algorithms, service reliability, FDTL compliance, and operational execution.',
    masterCaseTitle: 'IndiGo: Restoring the On-Time Promise — Growth, Reliability and the Cost of Resilience',
    masterCaseSummary: 'October 2026 scenario under new CEO Willie Walsh and Head of Operations following the December 2025 winter fog meltdown and DGCA FDTL shocks.',
    caseDocFileName: 'AIMA_ICRC_IndiGo_On time Promise_Annexures.pdf',
    caseDocUrl: '/AIMA_ICRC_IndiGo_On%20time%20Promise_Annexures.pdf',
    accentColor: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      ring: 'ring-blue-500',
      gradient: 'from-blue-600/15 via-blue-500/5 to-transparent',
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-700 dark:text-blue-300',
    },
    focusQuestions: [
      {
        code: 'Q1',
        title: 'Diagnose the Failure (Root Cause Analysis)',
        weight: 20,
        description: 'Root causes of the December 2025 meltdown across people, network, systems, leadership, and governance. Quantify the crew gap and planning underestimation.',
      },
      {
        code: 'Q2',
        title: 'Fix the Operation (Head of Operations Plan)',
        weight: 25,
        description: 'Design a resilient, FDTL-compliant 24-month operating model: pilot buffers, fatigue risk management (FRMS), schedule buffers, and cost-of-resilience funding.',
      },
      {
        code: 'Q3',
        title: 'Lead the Turnaround (CEO Willie Walsh Mandate)',
        weight: 35,
        description: 'Culture & accountability, crisis-communication protocol, regulator and pilot union relations, avoiding monopoly fatigue, and Board milestone roadmap.',
      },
    ],
    keyEvaluationCriteria: [
      'Quantified crew deficiency calculation based on case annexures',
      'FDTL strict regulatory compliance and buffer economics',
      'Realistic cost of resilience vs LCC unit cost (CASK) trade-offs',
    ],
  },
  {
    id: 'supply_chain',
    trackNumber: 3,
    name: 'Supply Chain & Energy Risk',
    badge: 'TRACK 03',
    tagline: 'ISPRL — Managing India’s Sovereign Crude Oil Price Risk',
    description: 'Address India’s 88.7% crude import dependence, underground strategic petroleum reserves (SPRs) in Mangalore, Padur and Visakhapatnam, geopolitical crises, and crude oil price hedging.',
    competenciesTested: 'Strategic inventory buffers, sovereign supply disruption mitigation, geopolitical risk hedging, and public policy logistics.',
    masterCaseTitle: 'ISPRL: Managing India’s Sovereign Crude Oil Price Risk & Strategic Reserves',
    masterCaseSummary: 'Managing Indian Strategic Petroleum Reserves Limited (ISPRL) sovereign reserves, underground rock caverns, and IEA 90-day net import stock compliance.',
    caseDocFileName: 'ISPRL_Managing_Crude_Oil_Price_Risk_2026_Geopolitical_Crisis_2026.pdf',
    caseDocUrl: '/ISPRL_Managing_Crude_Oil_Price_Risk_2026_Geopolitical_Crisis_2026.pdf',
    accentColor: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      ring: 'ring-emerald-500',
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    },
    focusQuestions: [
      {
        code: 'Q1',
        title: 'Sovereign Supply Vulnerability & Energy Security Audit',
        weight: 20,
        description: 'Assess 88.7% crude import exposure, geopolitical choke points (Strait of Hormuz), and emergency buffer requirements under IEA guidelines.',
      },
      {
        code: 'Q2',
        title: 'Strategic Petroleum Reserve Expansion & Commercial Logistics',
        weight: 25,
        description: 'Model underground rock cavern capacity optimization, commercial leasing to ADNOC/Saudi Aramco, and emergency release protocol logistics.',
      },
      {
        code: 'Q3',
        title: 'Crude Oil Financial Hedging & Sovereign Risk Management',
        weight: 35,
        description: 'Design structured derivative hedging strategies, options collars, and fiscal stabilization funds to shield India’s economy from geopolitical price shocks.',
      },
    ],
    keyEvaluationCriteria: [
      'Strategic inventory buffer optimization and emergency drawdown realism',
      'Financial derivative hedging structure against global crude volatility',
      'Public-private commercialization balance with sovereign energy security',
    ],
  },
  {
    id: 'finance',
    trackNumber: 4,
    name: 'Valuation, Finance and Strategy',
    badge: 'TRACK 04',
    tagline: 'SUGAR Cosmetics — The Way Forward: Growth Brand & Capital Restructuring',
    description: 'Deconstruct SUGAR Cosmetics’ ₹144.47 Cr CCPS funding from A91 Partners, contracting operating revenue, widening losses, DCF valuation multiples, and path to EBITDA breakeven.',
    competenciesTested: 'Financial statement restructuring, CCPS dilution analysis, discounted cash flow valuation, unit economics turnaround, and burn-rate reduction.',
    masterCaseTitle: 'SUGAR Cosmetics: The Way Forward — Capital Restructuring & Turnaround',
    masterCaseSummary: 'September 2026 briefing under A91 Partners ₹144.47 Cr convertible preference share injection into SUGAR Cosmetics amidst slowing D2C growth.',
    caseDocFileName: 'AIMA_ICRC_SUGAR_Cosmetics_The_Way_Forward_Competition_Case.pdf',
    caseDocUrl: '/AIMA_ICRC_SUGAR_Cosmetics_The_Way_Forward_Competition_Case.pdf',
    accentColor: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      ring: 'ring-amber-500',
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-700 dark:text-amber-300',
    },
    focusQuestions: [
      {
        code: 'Q1',
        title: 'Financial Distress & Unit Economics Diagnosis',
        weight: 20,
        description: 'Deconstruct the contraction in operating revenue, widening operating losses, CAC escalation, and working capital cash burn across online vs offline retail.',
      },
      {
        code: 'Q2',
        title: 'Capital Restructuring & CCPS Valuation Modeling',
        weight: 25,
        description: 'Analyze A91 Partners ₹144.47 Cr compulsorily convertible preference shares, evaluating dilution, liquidation preference, and enterprise valuation sensitivity.',
      },
      {
        code: 'Q3',
        title: 'Turnaround Roadmap to EBITDA Breakeven & Capital Efficiency',
        weight: 35,
        description: 'Architect a 24-month financial turnaround plan: store-level profitability thresholds, SKU rationalization, margin improvement, and path to sustainable IPO.',
      },
    ],
    keyEvaluationCriteria: [
      'Financial statement forensic analysis and unit economic margin spread',
      'Convertible equity valuation rigor and dilution impact',
      'Realistic cost-cutting and path to sustainable operating cash flows',
    ],
  },
  {
    id: 'business_model',
    trackNumber: 5,
    name: 'Strategy — Business Model',
    badge: 'TRACK 05',
    tagline: 'Blinkit — Life After Ten Minutes: Value Proposition & Quick-Commerce Delivery',
    description: 'Evaluate Albinder Dhindsa’s post-10-minute quick commerce strategy, dark store density vs delivery cost economics, Eternal group expansion, and sustainable monetization.',
    competenciesTested: 'Business model innovation, quick-commerce delivery economics, dark store network density, and monetization architectures.',
    masterCaseTitle: 'Blinkit: Life After Ten Minutes — What Market Leader Promises Next',
    masterCaseSummary: 'October 2026 strategic review under Albinder Dhindsa leading Eternal group to define the next phase of quick commerce beyond 10-minute speed.',
    caseDocFileName: 'AIMA_ICRC_Blinkit_Life_After_10_Minutes_Strategy _Case.pdf',
    caseDocUrl: '/AIMA_ICRC_Blinkit_Life_After_10_Minutes_Strategy%20_Case.pdf',
    accentColor: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      ring: 'ring-purple-500',
      gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      badgeBg: 'bg-purple-500/15',
      badgeText: 'text-purple-700 dark:text-purple-300',
    },
    focusQuestions: [
      {
        code: 'Q1',
        title: 'Quick-Commerce Unit Economics & The 10-Minute Limit',
        weight: 20,
        description: 'Analyze dark store capex, rider delivery costs, order density thresholds, and whether 10-minute delivery is profitable beyond dense tier-1 clusters.',
      },
      {
        code: 'Q2',
        title: 'Value Proposition Evolution ("Life After 10 Minutes")',
        weight: 25,
        description: 'Design the next-generation consumer promise: high-AOV electronics, lifestyle categories, curated private labels, and same-hour scheduled delivery.',
      },
      {
        code: 'Q3',
        title: 'Sustainable Monetization & Multi-Platform Moat',
        weight: 35,
        description: 'Formulate an advertising monetization model, platform handling fee strategy, and competitive defense against Zepto and Swiggy Instamart.',
      },
    ],
    keyEvaluationCriteria: [
      'Dark store unit economic model and contribution margin per order',
      'Category mix expansion feasibility without diluting delivery speed',
      'Platform monetization sustainability across the Eternal ecosystem',
    ],
  },
];

export const OFFICIAL_INSTRUCTION_DOCS = {
  participantInstructions: {
    title: 'Participant Instructions for Case Presentation',
    fileName: 'Participnat Instruction for Case presentation.docx',
    sanitizedFileName: 'Participant_Instruction_for_Case_presentation.docx',
    fileUrl: '/Participant_Instruction_for_Case_presentation.docx',
    directUrl: '/Participnat Instruction for Case presentation.docx',
    fileSize: '17 KB',
    description: 'Complete guidelines for the offline case presentation in front of Jury members at the AIMA Hall / Venue.',
  },
  commonInstructions: {
    title: 'AIMA ICRC South Zone Student Instructions',
    fileName: 'AIMA_ICRC_South_Zone_Student_Instructions.pdf',
    sanitizedFileName: 'AIMA_ICRC_South_Zone_Student_Instructions.pdf',
    fileUrl: '/AIMA_ICRC_South_Zone_Student_Instructions.pdf',
    fileSize: '185 KB',
    description: 'Overarching league rules: team eligibility, 5 track definitions, slide limits, data integrity, and jury evaluation rubric.',
  },
  masterCaseStudy: {
    title: 'Master Case: IndiGo — Restoring the On-Time Promise',
    fileName: 'AIMA_ICRC_IndiGo_Operation Strategy _Case_.docx',
    sanitizedFileName: 'AIMA_ICRC_IndiGo_Operations_Strategy_Case.docx',
    fileUrl: '/AIMA_ICRC_IndiGo_Operations_Strategy_Case.docx',
    fileSize: '53 KB',
    description: 'Official AIMA ICRC case study and baseline data for the IndiGo turnaround and operational resilience challenge.',
  },
};

export const OFFICIAL_EVALUATION_RUBRIC = [
  { criterion: 'Diagnosis of Root Causes (Q1)', focusQuestion: 'Q1', weight: 20, description: 'Comprehensive diagnosis of meltdown causes across people, network, systems, leadership, and governance. Quantified crew gap.' },
  { criterion: 'Operations Plan (Q2 - Head of Ops)', focusQuestion: 'Q2', weight: 25, description: 'Resilient 24-month FDTL-compliant operating model, crew buffers, fatigue management, and funded cost of resilience.' },
  { criterion: 'Leadership, Culture & Governance (Q3 - CEO)', focusQuestion: 'Q3', weight: 20, description: 'Culture, internal accountability, regulator relations, pilot union alignment, and Board milestone roadmap.' },
  { criterion: 'Brand & Stakeholder Recovery (Q3 - CEO)', focusQuestion: 'Q3', weight: 15, description: 'Preserving brand promise, managing 65% monopoly perception, and international expansion positioning.' },
  { criterion: 'Financial Realism & Trade-offs', focusQuestion: 'All', weight: 10, description: 'Realistic numbers, costs, and timelines without breaching FDTL or sacrificing cost leadership.' },
  { criterion: 'Roadmap, KPIs & Coherence', focusQuestion: 'All', weight: 10, description: 'Cross-functional alignment between CEO and Head of Operations with tracked KPI targets.' },
];
