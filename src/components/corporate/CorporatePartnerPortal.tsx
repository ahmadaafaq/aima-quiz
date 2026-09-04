import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  Award,
  Briefcase,
  Building,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  Lock,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from 'lucide-react';

export const CorporatePartnerPortal: React.FC = () => {
  const { institutions, teams, currentUser } = useCompetition();
  const [searchTerm, setSearchTerm] = useState('');
  const [talentFilter, setTalentFilter] = useState<'all' | 'high_di' | 'high_case'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Corporate partner executive sponsor (matches Vikramaditya Bajaj from Tata Sons)
  const executiveSponsor = currentUser.role === 'corporate_partner' ? currentUser.name : 'Vikramaditya Bajaj';

  // Top candidates extracted from institutions
  const candidates = [
    {
      id: 'usr-001',
      name: 'Aarav Singhania',
      institute: 'IIM Bangalore',
      program: 'MBA (Strategy & Finance)',
      gradYear: 2027,
      email: 'aarav.singhania@iimb.ac.in',
      r1Total: 92,
      diScore: 28,
      r2CaseRating: 91,
      skills: ['DCF Modeling', 'BaaS Economics', 'Supply Chain Optimization', 'ESG Syndication'],
      ppoStatus: 'PPO Interview Scheduled',
    },
    {
      id: 'usr-002',
      name: 'Meera Nambiar',
      institute: 'IIM Bangalore',
      program: 'MBA (Marketing & Analytics)',
      gradYear: 2027,
      email: 'meera.nambiar@iimb.ac.in',
      r1Total: 88,
      diScore: 26,
      r2CaseRating: 91,
      skills: ['Go-to-Market Strategy', 'Pricing Architecture', 'Loom Pitch Defense'],
      ppoStatus: 'Shortlisted for Summer Internship',
    },
    {
      id: 'usr-003',
      name: 'Rohan Deshmukh',
      institute: 'FMS Delhi',
      program: 'MBA (Operations)',
      gradYear: 2026,
      email: 'rohan.deshmukh@fms.edu',
      r1Total: 94,
      diScore: 30,
      r2CaseRating: 88,
      skills: ['Mathematical Modeling', 'Linear Programming', 'Logistics Infrastructure'],
      ppoStatus: 'Executive Review',
    },
    {
      id: 'usr-004',
      name: 'Ananya Sengupta',
      institute: 'XLRI Jamshedpur',
      program: 'PGDM (Human Resources & Strategy)',
      gradYear: 2026,
      email: 'ananya.s@xlri.ac.in',
      r1Total: 86,
      diScore: 24,
      r2CaseRating: 89,
      skills: ['Change Management', 'Corporate Governance', 'Public Policy'],
      ppoStatus: 'Shortlisted',
    },
  ];

  const filtered = candidates.filter(c => {
    const matches = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.institute.toLowerCase().includes(searchTerm.toLowerCase());
    if (talentFilter === 'high_di') return matches && c.diScore >= 26;
    if (talentFilter === 'high_case') return matches && c.r2CaseRating >= 90;
    return matches;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-2xl border border-cyan-500/30 shrink-0">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Tata Sons Corporate Strategy Group
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                Official Live Case Partner
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Executive Sponsor: <strong className="text-slate-800 dark:text-slate-200">{executiveSponsor}</strong> • Talent Acquisition & Strategic Case Office
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Live case dossier status: ACTIVE & ENCRYPTED. 120 teams actively evaluating GreenGrid Mobility problem.')}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Case NDA & Security Status</span>
          </button>
        </div>
      </div>

      {/* Talent Spotlight & Fast-Track Recruitment Station */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Executive Talent Acquisition & PPO Fast-Track (Section 3.7 & 27.1)
              </h3>
              <DocRequirementInfo specKey="corporate_talent_vault" variant="badge" badgeLabel="BRD §3.7 Talent Vault" colorTheme="amber" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identify top analytical problem solvers for Management Trainee, Pre-Placement Offers (PPOs), and Strategy Internships.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name or B-School..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <select
              value={talentFilter}
              onChange={e => setTalentFilter(e.target.value as any)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5"
            >
              <option value="all">All Top Performers</option>
              <option value="high_di">High DI / Analytical Score (26+)</option>
              <option value="high_case">Top Tier Case Deck (90%+)</option>
            </select>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{c.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300">
                      {c.gradYear} Batch
                    </span>
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {c.institute} • {c.program}
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {c.ppoStatus}
                </span>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quiz Total</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">{c.r1Total}%</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Data / DI Score</span>
                  <span className="font-black text-amber-600">{c.diScore}/30</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Case Rating</span>
                  <span className="font-black text-cyan-600">{c.r2CaseRating}/100</span>
                </div>
              </div>

              {/* Skills Tag Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {c.skills.map((skill, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">{c.email}</span>
                <button
                  onClick={() => alert(`Direct PPO Fast-Track Invitation dispatched to candidate: ${c.name} (${c.email}).`)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Issue Fast-Track PPO Invite
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
