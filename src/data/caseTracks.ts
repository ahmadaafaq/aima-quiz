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
    tagline: 'Brand Positioning, Customer Archetypes & Market Defense',
    description: 'Tackle aggressive domestic and international competitive dynamics, price elasticity, omnichannel customer journeys, and brand equity restoration.',
    competenciesTested: 'Brand positioning, customer segmentation, channels, pricing power, and competitive response strategy.',
    masterCaseTitle: 'Brand Equity, Monopoly Fatigue & Competitive Defense Strategy',
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
        title: 'Customer Sentiment & Market Perception Analysis',
        weight: 20,
        description: 'Diagnose perception erosion, passenger loyalty friction, and high-market-share "monopoly fatigue" across tier-1/tier-2 travelers.',
      },
      {
        code: 'Q2',
        title: 'Omnichannel & Pricing Strategy Architecture',
        weight: 25,
        description: 'Design dynamic pricing, corporate loyalty programs, and direct-to-consumer digital channels to preserve revenue premium without losing budget travelers.',
      },
      {
        code: 'Q3',
        title: 'Competitive Defense & International Positioning',
        weight: 35,
        description: 'Position premium dual-class seating and European long-haul routes while defending domestic low-cost leadership against emerging full-service rivals.',
      },
    ],
    keyEvaluationCriteria: [
      'Customer lifetime value & NPS turnaround',
      'Defensive pricing against full-service carriers',
      'Global brand coherence across domestic and international markets',
    ],
  },
  {
    id: 'operations',
    trackNumber: 2,
    name: 'Operations',
    badge: 'TRACK 02 • MASTER CASE',
    tagline: 'Capacity, Resilient Execution & On-Time Performance',
    description: 'Solve the master case: "IndiGo: Restoring the On-Time Promise". Re-engineer crew planning, FDTL compliance, pilot reserves, and disruption recovery.',
    competenciesTested: 'Capacity management, people, rostering algorithms, service reliability, FDTL compliance, and operational execution.',
    masterCaseTitle: 'IndiGo: Restoring the On-Time Promise — Growth, Reliability and the Cost of Resilience',
    masterCaseSummary: 'October 2026 scenario under new CEO Willie Walsh and Head of Operations following the December 2025 winter fog meltdown and DGCA FDTL shocks.',
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
    name: 'Supply Chain',
    badge: 'TRACK 03',
    tagline: 'Sourcing, Inventory Buffer, Distribution & Resilience',
    description: 'Address critical aircraft-on-ground (AOG) spare engine bottlenecks, global MRO turnaround cycles, aviation turbine fuel distribution, and vendor SLA agility.',
    competenciesTested: 'Sourcing strategy, parts inventory modeling, vendor SLAs, distribution networks, supply risk mitigation, and cost resilience.',
    masterCaseTitle: 'Critical Aviation Supply Chain, Engine MRO Cycles & Inventory Buffers',
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
        title: 'Supply Chain Bottleneck & AOG Vulnerability Diagnosis',
        weight: 20,
        description: 'Map global supply chain risks across Pratt & Whitney/CFM engines, spare parts lead times, and grounded fleet carrying costs.',
      },
      {
        code: 'Q2',
        title: 'Resilient Inventory Buffer & Regional MRO Network',
        weight: 25,
        description: 'Design optimal safety-stock inventory policies for high-failure components and negotiate agile MRO turnaround commitments across Indian hubs.',
      },
      {
        code: 'Q3',
        title: 'Dual-Sourcing Strategy & Resilient Procurement Governance',
        weight: 35,
        description: 'Structure multi-supplier contracts, risk-sharing agreements with aerospace OEMs, and a 24-month supply chain resilience roadmap.',
      },
    ],
    keyEvaluationCriteria: [
      'Aircraft-on-ground (AOG) downtime reduction model',
      'Working capital optimization for aviation spare parts inventory',
      'OEM contract negotiation and vendor SLA enforcement',
    ],
  },
  {
    id: 'finance',
    trackNumber: 4,
    name: 'Valuation, Finance and Strategy',
    badge: 'TRACK 04',
    tagline: 'Capital Allocation, Fleet Financing & Unit Economics',
    description: 'Model aircraft lease vs buy economics (A321XLR & A350 widebodies), jet fuel hedging policies, margin preservation, and shareholder valuation impact.',
    competenciesTested: 'Financial statement analysis, CASK/RASK unit economics, discounted cash flow valuation, credit rating preservation, and capital structure.',
    masterCaseTitle: 'Capital Allocation, Fleet Financing & Unit Economics under Expansion',
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
        title: 'Unit Economics & Financial Vulnerability Stress-Test',
        weight: 20,
        description: 'Deconstruct CASK (Cost per Available Seat Kilometer) impact of FDTL pilot hiring, delay compensation, and fuel volatility on operating margins.',
      },
      {
        code: 'Q2',
        title: 'Widebody Fleet Financing & Capital Expenditure Strategy',
        weight: 25,
        description: 'Model sale-and-leaseback vs direct operating lease finance for international wide-body induction while optimizing debt covenants and credit ratings.',
      },
      {
        code: 'Q3',
        title: 'Enterprise Valuation & Shareholder Value Creation Plan',
        weight: 35,
        description: 'Build a 3-year DCF valuation sensitivity model under varied load factor, crude price, and market share scenarios for institutional investors.',
      },
    ],
    keyEvaluationCriteria: [
      'CASK/RASK unit economic rigor and spread analysis',
      'Realistic capital budgeting for large aircraft orders',
      'Sensitivity testing on fuel price and foreign exchange shocks',
    ],
  },
  {
    id: 'business_model',
    trackNumber: 5,
    name: 'Strategy — Business Model',
    badge: 'TRACK 05',
    tagline: 'Value Proposition, Hybridization & Strategic Transformation',
    description: 'Evaluate IndiGo’s pivot from pure ultra-low-cost carrier (ULCC) to hybrid dual-class airline with loyalty tiers and long-haul international flights.',
    competenciesTested: 'Business model innovation, value proposition design, monetization architectures, and organizational pivot execution.',
    masterCaseTitle: 'From Pure LCC to Hybrid Carrier: Business Model Transformation',
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
        title: 'Diagnosis of Pure-LCC Growth Ceiling in Indian Aviation',
        weight: 20,
        description: 'Analyze why 65% domestic share creates diminishing returns in point-to-point budget travel, forcing expansion into business class and long-haul.',
      },
      {
        code: 'Q2',
        title: 'Hybrid Business Model Design & Ancillary Monetization',
        weight: 25,
        description: 'Architect IndiGo Stretch (business cabin), frequent flyer loyalty, corporate contracts, and cargo monetization without cannibalizing operational simplicity.',
      },
      {
        code: 'Q3',
        title: 'Strategic Transformation Roadmap & Cultural Alignment',
        weight: 35,
        description: 'Formulate a 3-year organizational roadmap to balance high-touch premium passenger service with low-cost operational discipline.',
      },
    ],
    keyEvaluationCriteria: [
      'Coherence of hybrid business model vs single-fleet simplicity',
      'Ancillary revenue diversification without alienating core base',
      'Strategic risk management of long-haul international corridors',
    ],
  },
  {
    id: 'sustainability',
    trackNumber: 6,
    name: 'Sustainability',
    badge: 'TRACK 06',
    tagline: 'ESG Impact, SAF Adoption, Carbon Decoupling & Governance',
    description: 'Design a credible decarbonization roadmap: Sustainable Aviation Fuel (SAF) blending, single-use plastic eradication, and carbon offset governance.',
    competenciesTested: 'Environmental corporate strategy, ESG regulatory disclosure, sustainable fuel supply economics, and stakeholder governance.',
    masterCaseTitle: 'Decarbonizing Aviation: Net-Zero Flight Paths & ESG Leadership',
    accentColor: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/20',
      border: 'border-cyan-200 dark:border-cyan-800',
      text: 'text-cyan-700 dark:text-cyan-300',
      ring: 'ring-cyan-500',
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      badgeBg: 'bg-cyan-500/15',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
    },
    focusQuestions: [
      {
        code: 'Q1',
        title: 'Carbon Footprint & Environmental Liability Diagnosis',
        weight: 20,
        description: 'Quantify fleet emissions trajectory under rapid capacity expansion, evaluating compliance risks under CORSIA and Indian aviation emissions regulations.',
      },
      {
        code: 'Q2',
        title: 'SAF Commercialization & Green Fleet Transition',
        weight: 25,
        description: 'Design a phased Sustainable Aviation Fuel (SAF) procurement strategy, evaluating price premiums, supply chain partnerships, and engine compatibility.',
      },
      {
        code: 'Q3',
        title: 'ESG Governance Framework & Green Financing Strategy',
        weight: 35,
        description: 'Structure green bonds and sustainability-linked aviation financing, transparent reporting mechanisms, and passenger carbon-offset participation.',
      },
    ],
    keyEvaluationCriteria: [
      'Plausibility of SAF economics and supply chain availability',
      'Scope 1, 2, and 3 emission abatement calculations',
      'Governance framework for verifiable, greenwash-free ESG leadership',
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
    title: 'India Case League — Common Instructions for All Participants',
    fileName: 'India Case League — Common Instructions for All Participants.docx',
    sanitizedFileName: 'India_Case_League_Common_Instructions.docx',
    fileUrl: '/India_Case_League_Common_Instructions.docx',
    fileSize: '18 KB',
    description: 'Overarching league rules: team eligibility, 6 track definitions, slide limits, data integrity, and jury evaluation rubric.',
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
