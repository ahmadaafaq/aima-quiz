import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  FileText,
  ShieldCheck,
  Building2,
  MapPin,
  Scale,
  Briefcase,
  HelpCircle,
  Copy,
  Check,
  Flame,
  Zap,
} from 'lucide-react';
import { useCompetition } from '../../context/CompetitionContext';
import { UserRole } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButtons?: {
    label: string;
    icon?: any;
    action: () => void;
    color?: string;
  }[];
  category?: string;
  isQuick?: boolean;
}

interface SmartSuggestion {
  label: string;
  query: string;
  icon: any;
  category: string;
}

export const ChatAssistant: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    quizAttempts,
    caseSubmissions,
    evaluations,
    switchRole,
    navigateToFeature,
    isChatOpen,
    setIsChatOpen,
    initialChatQuery,
  } = useCompetition();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Role-specific smart placeholder questions for dynamic cycling
  const rolePlaceholders: Record<string, string[]> = {
    admin: [
      'Ask: Who is leading the competition right now?',
      'Ask: How many participants completed the quiz?',
      'Ask: What is our total revenue collected & GST?',
      'Ask: How many case decks are pending evaluation?',
      'Ask: Check plagiarism flags or jury conflicts (Sec 3.6)',
      'Ask: Jump to Live Telemetry or Financial Ledger',
    ],
    student: [
      'Ask: What is the Round 2 case deck deadline & slide limit?',
      'Ask: How does the Round 1 quiz marking scheme work?',
      'Ask: What are the prize money amounts for winners?',
      'Ask: How do I invite team members or lock my roster?',
      'Ask: How do I download my verified certificate?',
    ],
    team_leader: [
      'Ask: What is the maximum slide limit for Round 2?',
      'Ask: How do I submit our PPTX/PDF presentation deck?',
      'Ask: How do I generate my team invite code?',
      'Ask: What are the 8 evaluation criteria weights?',
    ],
    institute_coordinator: [
      'Ask: How do I upload a batch CSV of 50+ students?',
      'Ask: Where can I see our college conversion funnel?',
      'Ask: Can our faculty mentor join team discussions?',
      'Ask: How are institutional excellence trophies awarded?',
    ],
    regional_hub: [
      'Ask: What are the 4 Regional Hub venues and presentation dates?',
      'Ask: How does QR check-in work for arriving teams?',
      'Ask: How many minutes are allocated for live jury pitches?',
      'Ask: How are presentation rooms assigned to evaluators?',
    ],
    corporate_partner: [
      'Ask: How do I search and filter top 10% analytical talent?',
      'Ask: How do I issue Pre-Placement Interview (PPI) invitations?',
      'Ask: What case tracks are available for corporate branding?',
    ],
    evaluator: [
      'Ask: What are the 8 rubric evaluation weights?',
      'Ask: How do I recuse myself due to Conflict of Interest (3.6)?',
      'Ask: How does the Gemini AI Benchmark advisory work?',
      'Ask: What is the minimum word count for qualitative jury remarks?',
    ],
  };

  const currentPlaceholders = rolePlaceholders[currentUser.role] || rolePlaceholders.student;

  // Cycle placeholder prompt every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % currentPlaceholders.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [currentPlaceholders]);

  // Role-specific smart quick chips
  const getSuggestionsForRole = (): SmartSuggestion[] => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { label: '🏆 Who is leading?', query: 'Who is leading the competition right now?', icon: Award, category: 'Rankings' },
          { label: '📊 Quiz Statistics', query: 'How many students took the Round 1 quiz and what are average scores?', icon: Users, category: 'Telemetry' },
          { label: '💰 Revenue & GST', query: 'What is our gross revenue collected, 18% GST, and net prize pool?', icon: DollarSign, category: 'Finances' },
          { label: '🔍 Pending Case Decks', query: 'How many case decks are submitted vs pending jury evaluation?', icon: FileText, category: 'Submissions' },
          { label: '⚠️ Plagiarism & COI Logs', query: 'Show me all plagiarism flags and evaluator recusal logs (Rule 3.6)', icon: ShieldCheck, category: 'Governance' },
        ];
      case 'student':
      case 'team_leader':
        return [
          { label: '📅 Round 2 Deadline & Slide Rules', query: 'What is the Round 2 case deck deadline and maximum slide limit?', icon: FileText, category: 'Rules' },
          { label: '📝 Quiz Marking Scheme', query: 'What is the quiz marking pattern, question count, and duration?', icon: Zap, category: 'Quiz' },
          { label: '🏆 Prize Money & Awards', query: 'What are the national and regional prize pool amounts?', icon: Award, category: 'Prizes' },
          { label: '👥 Team Roster Rules', query: 'How many members are allowed per team and how do I lock roster?', icon: Users, category: 'Team' },
          { label: '📜 Certificate Verification', query: 'How do I download and verify my participation certificate?', icon: ShieldCheck, category: 'Credentials' },
        ];
      case 'institute_coordinator':
        return [
          { label: '📁 Bulk CSV Upload Format', query: 'How do I format and upload batch student registrations via CSV?', icon: FileText, category: 'Roster' },
          { label: '📈 Campus Funnel Analytics', query: 'How do I view our college participant count and conversion funnel?', icon: TrendingUp, category: 'Analytics' },
          { label: '🏫 Institutional Trophy Rules', query: 'What are the criteria for the Best Management Institution Award?', icon: Building2, category: 'Awards' },
        ];
      case 'regional_hub':
        return [
          { label: '📍 Hub Venues & Pitch Timings', query: 'What are the 4 Regional Hub locations and live pitch duration?', icon: MapPin, category: 'Venues' },
          { label: '🎟️ In-Person QR Check-in', query: 'How do I scan team QR passes for physical attendance on pitch day?', icon: ShieldCheck, category: 'Operations' },
          { label: '⚖️ Jury Allocation Schedule', query: 'How are evaluators mapped to regional presentation tracks?', icon: Scale, category: 'Jury' },
        ];
      case 'corporate_partner':
        return [
          { label: '💼 Top Talent Search & PPIs', query: 'How do I filter top 10% analytical candidates and issue PPIs?', icon: Briefcase, category: 'Recruitment' },
          { label: '🎯 Case Track Sponsorships', query: 'What industry domains and case problem briefs are active?', icon: FileText, category: 'Sponsorship' },
        ];
      case 'evaluator':
        return [
          { label: '⚖️ 8-Factor Rubric Weights', query: 'What are the 8 evaluation criteria weights and score breakdown?', icon: Scale, category: 'Rubric' },
          { label: '🛡️ Conflict of Interest (3.6)', query: 'What is the procedure if I recognize a candidate or college from my alumni network?', icon: ShieldCheck, category: 'Ethics' },
          { label: '🤖 Gemini AI Benchmark', query: 'How does the Gemini AI Benchmark Advisory assist jury scoring?', icon: Sparkles, category: 'AI Advisory' },
        ];
      default:
        return [
          { label: 'ℹ️ About ICL 2026', query: 'What is AIMA-ICRC India Case League 2026 and how does the 4-stage funnel work?', icon: HelpCircle, category: 'General' },
          { label: '🏆 Prize Pool ₹15,00,000', query: 'What are the prize awards and corporate hiring opportunities?', icon: Award, category: 'Prizes' },
        ];
    }
  };

  // Initial welcome message tailored to current user role
  useEffect(() => {
    if (messages.length === 0) {
      const getWelcomeGreeting = () => {
        const name = currentUser.name || 'Participant';
        switch (currentUser.role) {
          case 'admin':
            return {
              text: `👋 Greetings **${name}** (Secretariat Command). I am the **ICL Secretariat AI Copilot**.\n\nI have real-time telemetry access to **3,420 registered candidates**, **944 case teams**, **₹9.38L revenue ledger**, and **live jury queues**. Ask me anything about rankings, leaderboard leaders, quiz completion, or governance logs.`,
              actionButtons: [
                { label: '🏆 Who is Leading?', action: () => handleSend('Who is leading the competition right now?') },
                { label: '📊 Quiz Statistics', action: () => handleSend('How many students completed the quiz?') },
                { label: '💰 Revenue Report', action: () => handleSend('What is our gross revenue and GST breakdown?') },
              ],
            };
          case 'student':
          case 'team_leader':
            return {
              text: `👋 Welcome **${name}**! I am your **ICL 2026 Competition Assistant**.\n\nI can help you with **Round 2 Case Deck guidelines (12 slides max)**, **Round 1 Quiz proctoring rules**, **team roster locks**, and **certificate generation**. What can I help you with today?`,
              actionButtons: [
                { label: '📅 Round 2 Deadline & Slide Rules', action: () => handleSend('What is the Round 2 case deck deadline and maximum slide limit?') },
                { label: '📝 Quiz Marking Rules', action: () => handleSend('What is the quiz marking pattern and duration?') },
                { label: '🏆 Prize Pool Breakdown', action: () => handleSend('What is the prize money breakdown for national winners?') },
              ],
            };
          case 'institute_coordinator':
            return {
              text: `👋 Welcome **${name}** (${currentUser.institution || 'Institutional Partner'}).\n\nI can assist you with **batch student roster CSV uploads**, **campus conversion funnel statistics**, and **institutional championship rankings**.`,
              actionButtons: [
                { label: '📁 Bulk CSV Upload Format', action: () => handleSend('How do I format and upload batch student registrations via CSV?') },
                { label: '📈 Campus Conversion Funnel', action: () => handleSend('How do I track our college participant conversion funnel?') },
              ],
            };
          case 'regional_hub':
            return {
              text: `👋 Welcome **${name}** (Regional Hub Desk).\n\nI can assist you with **in-person team QR attendance check-in**, **presentation slot scheduling (15m pitch + 10m Q&A)**, and **local jury desk coordination**.`,
              actionButtons: [
                { label: '📍 Hub Venues & Pitch Timings', action: () => handleSend('What are the 4 Regional Hub locations and live pitch duration?') },
                { label: '🎟️ In-Person QR Check-in', action: () => handleSend('How do I scan team QR passes on pitch day?') },
              ],
            };
          case 'corporate_partner':
            return {
              text: `👋 Welcome **${name}** (Corporate Partner Desk).\n\nI can help you filter **top 10% analytical talent**, schedule **Pre-Placement Interviews (PPIs)**, and access real-time case submission analytics.`,
              actionButtons: [
                { label: '💼 Search Top Talent & PPIs', action: () => handleSend('How do I filter top 10% analytical candidates and issue PPIs?') },
                { label: '🎯 Case Track Details', action: () => handleSend('What case tracks and problem statements are live?') },
              ],
            };
          case 'evaluator':
            return {
              text: `👋 Welcome **${name}** (Jury Evaluator).\n\nI can guide you through the **8-Factor Dual-Blind Rubric**, **Section 3.6 Conflict of Interest recusal protocols**, and **Gemini AI Benchmark Advisory** interpretations.`,
              actionButtons: [
                { label: '⚖️ 8-Factor Rubric Weights', action: () => handleSend('What are the 8 evaluation criteria weights and score breakdown?') },
                { label: '🛡️ Conflict of Interest Rule 3.6', action: () => handleSend('What is the procedure if I recognize a candidate or college?') },
              ],
            };
          default:
            return {
              text: `👋 Welcome to **AIMA-ICRC India Case League 2026**! I am your interactive AI assistant. Ask me anything about registration, competition stages, prize pools, or evaluation criteria.`,
              actionButtons: [
                { label: 'ℹ️ About ICL 2026', action: () => handleSend('What is AIMA-ICRC India Case League 2026?') },
                { label: '🏆 Prize Money', action: () => handleSend('What are the national prize awards?') },
              ],
            };
        }
      };

      const greeting = getWelcomeGreeting();
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'bot',
          text: greeting.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: greeting.actionButtons,
        },
      ]);
    }
  }, [currentUser.role]);

  // Handle opening with pre-filled query
  useEffect(() => {
    if (initialChatQuery && isChatOpen) {
      handleSend(initialChatQuery);
    }
  }, [initialChatQuery, isChatOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isChatOpen]);

  // Intelligent Response Generation Engine with live state context
  const generateIntelligentResponse = (query: string): { text: string; actionButtons?: ChatMessage['actionButtons'] } => {
    const q = query.toLowerCase().trim();

    // 1. LEADING TEAMS / WHO IS LEADING / LEADERBOARD
    if (q.includes('who is leading') || q.includes('which team is leading') || q.includes('top team') || q.includes('leaderboard') || q.includes('rank 1') || q.includes('leading')) {
      const topTeams = [
        { rank: 1, name: 'Team Alpha Mavericks', inst: 'IIM Ahmedabad', track: 'Sustainability & EV', score: 94.2, hub: 'West (Mumbai)' },
        { rank: 2, name: 'Stratagem Nexus', inst: 'ISB Hyderabad', track: 'FinTech Lending', score: 91.8, hub: 'South (Bengaluru)' },
        { rank: 3, name: 'Quantum Consulting', inst: 'FMS Delhi', track: 'Healthcare AI', score: 89.5, hub: 'North (Delhi)' },
        { rank: 4, name: 'Blitzkrieg Analytics', inst: 'IIM Bangalore', track: 'AgriTech Logistics', score: 88.0, hub: 'South (Bengaluru)' },
        { rank: 5, name: 'Synergy Pioneers', inst: 'XLRI Jamshedpur', track: 'Supply Chain Optimization', score: 87.4, hub: 'East (Kolkata)' },
      ];

      return {
        text: `🏆 **Current Competition Leaderboard & Top Standings**:\n\n` +
          `1. 🥇 **${topTeams[0].name}** (${topTeams[0].inst})\n` +
          `   • **Score**: **${topTeams[0].score}/100** • **Track**: ${topTeams[0].track} • **Regional Hub**: ${topTeams[0].hub}\n\n` +
          `2. 🥈 **${topTeams[1].name}** (${topTeams[1].inst})\n` +
          `   • **Score**: **${topTeams[1].score}/100** • **Track**: ${topTeams[1].track} • **Regional Hub**: ${topTeams[1].hub}\n\n` +
          `3. 🥉 **${topTeams[2].name}** (${topTeams[2].inst})\n` +
          `   • **Score**: **${topTeams[2].score}/100** • **Track**: ${topTeams[2].track} • **Regional Hub**: ${topTeams[2].hub}\n\n` +
          `4. **${topTeams[3].name}** (${topTeams[3].inst}) — ${topTeams[3].score}/100\n` +
          `5. **${topTeams[4].name}** (${topTeams[4].inst}) — ${topTeams[4].score}/100\n\n` +
          `*Note: Standings aggregate Round 1 Proctored Quiz (40% weight) and Round 2 Dual-Blind Case Deck Evaluation (60% weight).*`,
        actionButtons: [
          {
            label: '⚡ Jump to Leaderboard View',
            icon: Award,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'student', tab: 'leaderboard' });
            },
          },
          {
            label: '📊 Admin Secretariat Command',
            icon: ExternalLink,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'admin', tab: 'evaluations', persona: 'admin' });
            },
          },
        ],
      };
    }

    // 2. QUIZ PARTICIPANTS / NUMBER OF PARTICIPANTS / STATS
    if (q.includes('quiz participant') || q.includes('number of participant') || q.includes('how many participant') || q.includes('quiz stat') || q.includes('quiz count') || q.includes('completion rate')) {
      return {
        text: `📊 **Round 1 National Screening Quiz Telemetry**:\n\n` +
          `• **Total Registered Candidates**: **3,420 students** (across 118 accredited management institutions)\n` +
          `• **Completed Quiz Attempts**: **2,840 participants** (**83.0% completion rate**)\n` +
          `• **In-Progress / Scheduled**: **580 participants**\n` +
          `• **National Mean Score**: **41.6 / 60 points** (Median: 43.0)\n` +
          `• **Highest Score Recorded**: **56.0 / 60** (by *Aarav Sharma - IIM Ahmedabad*)\n` +
          `• **Proctoring Anomaly Flags**: **14 flagged** (AI gaze tracking / tab-switch violations resolved)\n` +
          `• **Qualifying Cutoff Percentile**: Top 60th Percentile advances to Round 2 Team Formation.`,
        actionButtons: [
          {
            label: '📝 Inspect Quiz Question Bank',
            icon: FileText,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'admin', tab: 'quiz', persona: 'admin' });
            },
          },
          {
            label: '📈 Live Telemetry Dashboard',
            icon: TrendingUp,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'admin', tab: 'telemetry', persona: 'admin' });
            },
          },
        ],
      };
    }

    // 3. REVENUE / FINANCES / GST / CASH PRIZE POOL
    if (q.includes('revenue') || q.includes('finance') || q.includes('gst') || q.includes('collected') || q.includes('fee') || q.includes('ledger') || q.includes('financial')) {
      return {
        text: `💰 **Official Financial Ledger & Prize Pool Status (Section 6.3 & 16.3)**:\n\n` +
          `• **Gross Fee Collections**: **₹9,38,000 INR** (1,876 individual / team transaction tokens)\n` +
          `• **Statutory GST (18%)**: **₹1,43,085 INR** (Remitted to Govt of India Tax Pool)\n` +
          `• **Net Registration Corpus**: **₹7,94,915 INR**\n` +
          `• **Total Dedicated Prize Pool**: **₹15,00,000 INR** (Co-sponsored by Corporate Partners & AIMA Reserve)\n\n` +
          `**Prize Disbursal Architecture**:\n` +
          `  🥇 **National Champion**: ₹5,00,000 + Gold Trophy + PPO Fast-Track\n` +
          `  🥈 **1st Runner-Up**: ₹3,00,000 + Silver Trophy\n` +
          `  🥉 **2nd Runner-Up**: ₹2,00,000 + Bronze Trophy\n` +
          `  🏅 **4 Regional Winners**: ₹50,000 each (₹2,00,000 total)\n` +
          `  🎖️ **Special Track Awards**: Best Female-Led Team, Best Sustainability Strategy, Best ESG Strategy (₹3,00,000 total).`,
        actionButtons: [
          {
            label: '📊 Open Financial Ledger & Invoices',
            icon: DollarSign,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'admin', tab: 'financials', persona: 'admin' });
            },
          },
        ],
      };
    }

    // 4. CASE SUBMISSIONS & EVALUATION QUEUE
    if (q.includes('case deck') || q.includes('pending evaluation') || q.includes('submitted deck') || q.includes('submission count') || q.includes('evaluation queue')) {
      return {
        text: `📁 **Round 2 Case Deck Submissions & Evaluation Pipeline (Section 8 & 9)**:\n\n` +
          `• **Total Teams Formed**: **944 Teams** (3,180 verified students)\n` +
          `• **Case Decks Uploaded**: **764 Decks** (**80.9% submission index**)\n` +
          `• **Evaluations Completed**: **612 Decks** (Dual-blind scoring completed)\n` +
          `• **Pending Evaluation Queue**: **152 Decks** (Assigned across 32 active jury members)\n` +
          `• **Plagiarism Scan Status**: 100% scanned via Cosine Vector Engine (2 flagged above 20% threshold)\n` +
          `• **Average Evaluator Turnaround**: 18.4 minutes per submission.`,
        actionButtons: [
          {
            label: '⚖️ Open Jury Evaluation Station',
            icon: Scale,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'evaluator', persona: 'evaluator' });
            },
          },
          {
            label: '📄 View Case Submissions Tab',
            icon: FileText,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'admin', tab: 'evaluations', persona: 'admin' });
            },
          },
        ],
      };
    }

    // 5. PLAGIARISM & SIMILARITY & CONFLICT OF INTEREST
    if (q.includes('plagiarism') || q.includes('similarity') || q.includes('conflict of interest') || q.includes('recusal') || q.includes('rule 3.6') || q.includes('coi') || q.includes('flag')) {
      return {
        text: `🛡️ **Integrity & Governance Protocols (Sections 9.3, 18 & 23)**:\n\n` +
          `• **AI Similarity Engine**: 3-gram Shingling + Cosine TF-IDF vector scanner indexing prior AIMA editions & internet repositories.\n` +
          `• **Flagging Threshold**: Cases with **>20% similarity** trigger automatic Secretariat freeze.\n` +
          `• **Current Flagged Submissions**: **2 Teams** under review (Team Zenith at 24.5%, Case #08).\n\n` +
          `**Section 3.6: Mandatory Jury Conflict of Interest (COI) Rule**:\n` +
          `• Evaluators MUST recuse themselves immediately if assigned a team from their current institution, alma mater, or family relation.\n` +
          `• **Recusal Logs**: 1 evaluator recusal logged (*Dr. R. Sharma - recused from IIMB submission; reassigned seamlessly to West Hub Pool*).`,
        actionButtons: [
          {
            label: '📑 View SRS Section 9.3 (AI & Plagiarism)',
            icon: FileText,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'requirements', sectionId: 'sec-9', clauseId: 'clause-9-3' });
            },
          },
          {
            label: '⚖️ Jury Ethical Recusal Guidelines',
            icon: Scale,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'evaluator', persona: 'evaluator' });
            },
          },
        ],
      };
    }

    // 6. ROUND 2 DEADLINE & SLIDE LIMITS (FOR STUDENTS)
    if (q.includes('deadline') || q.includes('slide limit') || q.includes('slides') || q.includes('round 2 rule') || q.includes('case rule') || q.includes('file size') || q.includes('format')) {
      return {
        text: `📅 **Round 2 Case Deck Submission Specifications (Section 8.2)**:\n\n` +
          `• **Final Submission Deadline**: **October 15, 2026 at 23:59 IST** (Strict server-side timestamp lock)\n` +
          `• **Maximum Slide Limit**: **Strictly 12 Content Slides** (Excluding mandatory Title Slide & optional Appendix)\n` +
          `• **Supported File Formats**: **PDF** or **PowerPoint (.pptx)**\n` +
          `• **Maximum File Size**: **25 MB**\n` +
          `• **Mandatory Anonymity Rule**: Do NOT include your names or college logos anywhere inside the deck content (Only use your assigned Team Code, e.g., \`ICL-26-XXXX\`). Violations result in 10-mark deduction.`,
        actionButtons: [
          {
            label: '📤 Upload Case Deck Now',
            icon: FileText,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'student', tab: 'case_deck' });
            },
          },
          {
            label: '📑 View Official SRS Section 8',
            icon: ExternalLink,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'requirements', sectionId: 'sec-8' });
            },
          },
        ],
      };
    }

    // 7. QUIZ RULES & MARKING PATTERN
    if (q.includes('marking') || q.includes('quiz rule') || q.includes('negative mark') || q.includes('quiz pattern') || q.includes('questions') || q.includes('duration') || q.includes('round 1')) {
      return {
        text: `📝 **Round 1 Proctored Screening Quiz Architecture (Section 7)**:\n\n` +
          `• **Format**: 30 Multiple Choice Questions (Business Acumen, Data Interpretation, Strategy, Financial Ratios)\n` +
          `• **Total Duration**: **45 Minutes** (Auto-submits on timer expiry)\n` +
          `• **Scoring Pattern**: **+2.0 Marks** for Correct Answer, **-0.5 Marks** Negative Marking for Incorrect, **0 Marks** for Unattempted.\n` +
          `• **Maximum Score**: 60 Points\n` +
          `• **Proctoring Shield**: Fullscreen lock, active webcam gaze tracker, clipboard disable, tab-switch counter (3 strikes auto-terminates exam).`,
        actionButtons: [
          {
            label: '🚀 Launch Proctored Quiz Simulator',
            icon: Zap,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'student', tab: 'quiz' });
            },
          },
        ],
      };
    }

    // 8. TEAM FORMATION & ROSTER
    if (q.includes('team') || q.includes('roster') || q.includes('invite') || q.includes('members') || q.includes('code') || q.includes('lock team')) {
      return {
        text: `👥 **Team Formation & Roster Rules (Section 4.2 & 5.2)**:\n\n` +
          `• **Team Size**: Exactly **3 to 4 Students** (Cross-specialization within same institute or inter-college permitted).\n` +
          `• **Team Leader Role**: Created by Team Leader who receives a unique **Team Join Code** (e.g. \`ICL-NX7-941\`).\n` +
          `• **Roster Lock**: Once the 3rd/4th member accepts the invitation, the Team Leader clicks **Lock Roster**. After locking, no member changes are allowed without Secretariat approval.\n` +
          `• **Single Team Rule**: A student can only belong to ONE team across the entire competition.`,
        actionButtons: [
          {
            label: '👥 Manage Team Roster',
            icon: Users,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'student', tab: 'overview' });
            },
          },
        ],
      };
    }

    // 9. CERTIFICATES & QR VERIFICATION
    if (q.includes('certificate') || q.includes('verify') || q.includes('credential') || q.includes('qr') || q.includes('download cert')) {
      return {
        text: `📜 **Cryptographically Verifiable Credentials (Section 14)**:\n\n` +
          `• Every participant who completes the competition receives an **AIMA-ICRC National Certificate**.\n` +
          `• **Verification Protocol**: Each certificate embeds an authentic **SHA-256 Hash Token** and a verifiable **QR Code**.\n` +
          `• Employers, universities, and LinkedIn recruiters can verify credentials instantly via the National Certificate Verifier desk at \`/verify\`.`,
        actionButtons: [
          {
            label: '🔍 Open Certificate Verifier',
            icon: ShieldCheck,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'public', modal: 'verifier' });
            },
          },
          {
            label: '📜 View Sample Certificate',
            icon: Award,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'public', modal: 'certificate' });
            },
          },
        ],
      };
    }

    // 10. JURY EVALUATION RUBRIC & GEMINI AI ADVISORY
    if (q.includes('rubric') || q.includes('criteria') || q.includes('weight') || q.includes('gemini') || q.includes('ai advisory') || q.includes('evaluat')) {
      return {
        text: `⚖️ **Official 8-Factor Dual-Blind Jury Rubric (Section 9.2)**:\n\n` +
          `1. **Problem Structuring & Root Cause Analysis**: 15%\n` +
          `2. **Evidence Quality & Quantitative Rigor**: 20%\n` +
          `3. **Strategic Alternatives & Strategic Fit**: 15%\n` +
          `4. **Innovation, Originality & Differentiation**: 15%\n` +
          `5. **Commercial & Financial Feasibility**: 15%\n` +
          `6. **Implementation Roadmap & Operational Milestones**: 10%\n` +
          `7. **ESG, Governance & Risk Mitigation**: 5%\n` +
          `8. **Executive Presentation & Narrative Clarity**: 5%\n\n` +
          `🤖 **Gemini AI Benchmark Advisory (Section 9.3)**:\n` +
          `Provides evaluators with an objective, neutral baseline analysis score and highlights missing financial projections or risks to calibrate dual-blind scoring variance.`,
        actionButtons: [
          {
            label: '⚖️ Open Jury Evaluation Station',
            icon: Scale,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'evaluator', persona: 'evaluator' });
            },
          },
          {
            label: '📑 SRS Section 9: Evaluation System',
            icon: FileText,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'requirements', sectionId: 'sec-9' });
            },
          },
        ],
      };
    }

    // 11. REGIONAL HUBS & LOCATIONS
    if (q.includes('hub') || q.includes('regional') || q.includes('venue') || q.includes('pitch') || q.includes('delhi') || q.includes('mumbai') || q.includes('bengaluru') || q.includes('kolkata')) {
      return {
        text: `📍 **Round 3: Regional Semi-Final Hubs (Section 10 & 11)**:\n\n` +
          `• **North Hub**: New Delhi (AIMA Management House & IIT Delhi campus)\n` +
          `• **West Hub**: Mumbai (SPJIMR Campus, Andheri West)\n` +
          `• **South Hub**: Bengaluru (IIM Bangalore Executive Center, Bannerghatta)\n` +
          `• **East Hub**: Kolkata (IIM Calcutta Auditorium, Joka)\n\n` +
          `**Pitch Protocol**: **15 Minutes** live case presentation + **10 Minutes** interactive Jury Q&A. Top 2 teams from each Regional Hub advance to the National Grand Finale in New Delhi!`,
        actionButtons: [
          {
            label: '📍 Open Regional Hub Portal',
            icon: MapPin,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'hub', persona: 'regional_hub' });
            },
          },
        ],
      };
    }

    // 12. INSTITUTION & BULK CSV UPLOADS
    if (q.includes('institute') || q.includes('bulk') || q.includes('csv') || q.includes('college') || q.includes('dean') || q.includes('faculty')) {
      return {
        text: `🏫 **Institutional Portal & Batch Enrollment (Section 4.3 & 5.3)**:\n\n` +
          `• **Bulk CSV Uploader**: College coordinators can onboard batches of up to 250 students in a single \`.csv\` upload containing \`Full Name, Email, Enrollment ID, Year, Specialization\`.\n` +
          `• **Institutional Analytics**: Real-time conversion funnel tracking registered students -> quiz completions -> teams qualified -> finalists.\n` +
          `• **Championship Trophy**: Top institution with highest aggregated student performance receives the *AIMA National Institutional Excellence Trophy 2026*.`,
        actionButtons: [
          {
            label: '🏫 Open Institute Portal',
            icon: Building2,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'institute', persona: 'institute_coordinator' });
            },
          },
        ],
      };
    }

    // 13. CORPORATE PARTNERS & PPIs
    if (q.includes('corporate') || q.includes('recruitment') || q.includes('ppi') || q.includes('placement') || q.includes('talent') || q.includes('hiring') || q.includes('partner')) {
      return {
        text: `💼 **Corporate Partner Desk & Talent Fast-Track (Section 3.7 & 27.1)**:\n\n` +
          `• **Talent Radar**: Corporate sponsors can query the top 10th percentile performers filtered by specialization, problem domain, and regional hub.\n` +
          `• **Pre-Placement Interviews (PPIs)**: Direct 1-click invitation pipeline for summer internships and management trainee leadership roles.\n` +
          `• **Active Case Problem Tracks**: EV Energy Transition, NeoBanking MSME Lending, Omni-Channel Health, Sustainable Cold Chain Logistics.`,
        actionButtons: [
          {
            label: '💼 Open Corporate Partner Portal',
            icon: Briefcase,
            action: () => {
              setIsChatOpen(false);
              navigateToFeature({ view: 'corporate', persona: 'corporate_partner' });
            },
          },
        ],
      };
    }

    // DEFAULT FALLBACK RESPONSE
    return {
      text: `🤖 **ICL Intelligence Summary for "${query}"**:\n\n` +
        `I am indexed with the complete **AIMA-ICRC India Case League 2026** operational architecture.\n\n` +
        `Here are quick topics you can ask me:\n` +
        `• *"Who is leading right now?"* (Live Rankings)\n` +
        `• *"How many participants completed the quiz?"* (Telemetry)\n` +
        `• *"What is the gross revenue and GST ledger?"* (Finances)\n` +
        `• *"What is the Round 2 case deck deadline and slide limit?"* (Rules)\n` +
        `• *"What are the 8 rubric evaluation criteria?"* (Jury Scoring)\n` +
        `• *"How do I download and verify my certificate?"* (Credentials)`,
      actionButtons: [
        {
          label: '📑 Open Full Requirements Spec (SRS)',
          icon: FileText,
          action: () => {
            setIsChatOpen(false);
            navigateToFeature({ view: 'requirements' });
          },
        },
        {
          label: '🏆 Who is Leading?',
          action: () => handleSend('Who is leading the competition right now?'),
        },
        {
          label: '📊 Quiz Statistics',
          action: () => handleSend('How many students completed the quiz?'),
        },
      ],
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate smart cognitive processing
    setTimeout(() => {
      const response = generateIntelligentResponse(text);
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: response.actionButtons,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([]);
    setTimeout(() => {
      handleSend('Hello! Give me a quick summary of what I can do.');
    }, 100);
  };

  const suggestions = getSuggestionsForRole();

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING LAUNCHER TRIGGER (ALWAYS ACCESSIBLE IN BOTTOM-RIGHT) */}
      {/* ========================================================================= */}
      {!isChatOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
          {/* Smart Tooltip Bubble */}
          <div
            onClick={() => setIsChatOpen(true)}
            className="hidden md:flex items-center gap-2 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-700/60 cursor-pointer hover:border-blue-500 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Need help? Ask **ICL Assistant**</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
              AI Powered
            </span>
          </div>

          {/* Circular Bot Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            id="open-icl-ai-chatbot"
            aria-label="Open ICL AI Assistant Chatbot"
            className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white flex items-center justify-center shadow-2xl hover:shadow-blue-500/40 hover:scale-108 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
          >
            <Bot className="w-7 h-7 text-white drop-shadow-md" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-900"></span>
            </span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHAT MODAL WINDOW (FLOATING / EXPANDABLE) */}
      {/* ========================================================================= */}
      {isChatOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-10 max-w-5xl mx-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] md:w-[480px] h-[640px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md border border-white/10 shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    ICL Smart Copilot
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Live Competition Knowledge & Instant Actions
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={resetChat}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Restore Size' : 'Maximize Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer ml-1"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Context Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 px-4 py-2 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 overflow-hidden truncate">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 truncate">
                Role: <strong className="text-blue-700 dark:text-blue-300 capitalize">{currentUser.role.replace('_', ' ')}</strong> ({currentUser.name})
              </span>
            </div>
            <button
              onClick={() => {
                setIsChatOpen(false);
                navigateToFeature({ view: 'requirements' });
              }}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer ml-2"
            >
              <span>Full SRS</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Speech Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                    }`}
                  >
                    {/* Formatted Text Content */}
                    <div className="whitespace-pre-line break-words space-y-1">
                      {msg.text.split('\n').map((line, idx) => {
                        // Highlight markdown-like bold text
                        if (line.startsWith('•') || line.startsWith('-')) {
                          return (
                            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
                              <span className="text-blue-500 font-bold shrink-0">•</span>
                              <span dangerouslySetInnerHTML={{ __html: line.substring(1).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={idx}
                            dangerouslySetInnerHTML={{
                              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Copy Button */}
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        title="Copy Answer"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Action Buttons if provided */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.actionButtons.map((btn, bIdx) => {
                        const IconComponent = btn.icon || ChevronRight;
                        return (
                          <button
                            key={bIdx}
                            onClick={btn.action}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                          >
                            <IconComponent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>{btn.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] text-slate-400 mt-1 px-1 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips Section */}
          <div className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Smart Prompts for {currentUser.role.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug.query)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  <sug.icon className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentPlaceholders[placeholderIndex]}
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 py-1.5"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputQuery.trim()}
                className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
              <span>Powered by AIMA-ICRC Intelligence Core</span>
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Enter</kbd> to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
