import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import { Team } from '../../types';
import {
  AlertCircle,
  Award,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  IndianRupee,
  Lock,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

export const InstitutePortal: React.FC = () => {
  const { institutions, currentUser, teams, createInstitutionalTeam } = useCompetition();
  
  const inst = institutions[0] || {
    id: 'inst_iimb',
    name: 'Indian Institute of Management Bangalore (IIMB)',
    ranking: 1,
    coordinatorName: 'Dr. Ananya Ray',
    coordinatorEmail: 'coordinator@iimb.ac.in',
    totalStudents: 140,
    registeredStudents: 128,
    teamsCreated: 34,
    totalPaidAmount: 25600,
  };

  const [activeTab, setActiveTab] = useState<'roster' | 'teams'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'qualified'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [isBulkPaid, setIsBulkPaid] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state for creating institutional team
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamHub, setNewTeamHub] = useState<'south' | 'north' | 'east' | 'west' | 'central'>('south');
  const [teamMembers, setTeamMembers] = useState<
    Array<{ studentId: string; name: string; email: string; mobile?: string; roleInTeam: string; isLeader: boolean }>
  >([
    {
      studentId: 'IIMB-PGP-25-089',
      name: 'Aarav Singhania',
      email: 'aarav.singhania@iimb.ac.in',
      mobile: '+91 98450 12345',
      roleInTeam: 'Team Leader & Lead Strategist',
      isLeader: true,
    },
    {
      studentId: 'IIMB-PGP-25-112',
      name: 'Meera Nambiar',
      email: 'meera.nambiar@iimb.ac.in',
      mobile: '+91 98450 54321',
      roleInTeam: 'Financial Modeler',
      isLeader: false,
    },
    {
      studentId: 'IIMB-PGP-25-045',
      name: 'Kunal Deshpande',
      email: 'kunal.d@iimb.ac.in',
      mobile: '+91 98450 67890',
      roleInTeam: 'Market Research & Tech Analyst',
      isLeader: false,
    },
  ]);

  const defaultRoster = [
    { id: 's1', name: 'Aarav Singhania', studentId: 'IIMB-PGP-25-089', email: 'aarav.singhania@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 92 },
    { id: 's2', name: 'Meera Nambiar', studentId: 'IIMB-PGP-25-112', email: 'meera.nambiar@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 88 },
    { id: 's3', name: 'Kunal Deshpande', studentId: 'IIMB-PGP-25-045', email: 'kunal.d@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 91 },
    { id: 's4', name: 'Sneha Venkatesh', studentId: 'IIMB-PGP-25-134', email: 'sneha.v@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 89 },
    { id: 's5', name: 'Rohan Sharma', studentId: 'IIMB-PGP-25-067', email: 'rohan.s@iimb.ac.in', teamName: 'Vanguard Strategy', feePaid: false, r1Score: 78 },
    { id: 's6', name: 'Priya Iyer', studentId: 'IIMB-PGP-25-023', email: 'priya.i@iimb.ac.in', teamName: 'Vanguard Strategy', feePaid: false, r1Score: 84 },
    { id: 's7', name: 'Varun Reddy', studentId: 'IIMB-PGP-25-156', email: 'varun.r@iimb.ac.in', teamName: 'Southern Titans', feePaid: true, r1Score: 86 },
    { id: 's8', name: 'Divya Nair', studentId: 'IIMB-PGP-25-178', email: 'divya.n@iimb.ac.in', teamName: 'Southern Titans', feePaid: true, r1Score: 90 },
    { id: 's9', name: 'Tanvi Agarwal', studentId: 'IIMB-PGP-25-201', email: 'tanvi.a@iimb.ac.in', teamName: '', feePaid: true, r1Score: 94 },
    { id: 's10', name: 'Aditya Sen', studentId: 'IIMB-PGP-25-215', email: 'aditya.s@iimb.ac.in', teamName: '', feePaid: true, r1Score: 87 },
  ];

  // Filtered mock roster
  const filteredRoster = defaultRoster.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'paid') return matchesSearch && s.feePaid;
    if (statusFilter === 'unpaid') return matchesSearch && !s.feePaid;
    if (statusFilter === 'qualified') return matchesSearch && s.r1Score && s.r1Score >= 65;
    return matchesSearch;
  });

  const unpaidCount = defaultRoster.filter(s => !s.feePaid).length;
  const totalUnpaidAmount = unpaidCount * 200;

  // Institute's teams
  const instituteTeams = teams.filter(
    t =>
      t.instituteName?.toLowerCase().includes('bangalore') ||
      t.instituteName?.toLowerCase().includes('iimb') ||
      t.instituteName === inst.name ||
      inst.name.toLowerCase().includes(t.instituteName?.toLowerCase() || '')
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddMember = () => {
    if (teamMembers.length >= 4) {
      alert('AIMA Competition Rule Section 5.2 restricts team capacity to maximum 4 members.');
      return;
    }
    const idx = teamMembers.length + 1;
    setTeamMembers(prev => [
      ...prev,
      {
        studentId: `IIMB-PGP-25-00${idx}`,
        name: `Candidate ${idx}`,
        email: `candidate${idx}@iimb.ac.in`,
        mobile: '+91 98000 00000',
        roleInTeam: 'Team Analyst',
        isLeader: false,
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length <= 3) {
      alert('AIMA Competition Rule Section 5.2 requires a minimum of 3 registered members per team.');
      return;
    }
    if (teamMembers[index].isLeader) {
      alert('Cannot remove team leader. Please designate another member as leader first.');
      return;
    }
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetLeader = (index: number) => {
    setTeamMembers(prev =>
      prev.map((m, i) => ({
        ...m,
        isLeader: i === index,
        roleInTeam: i === index ? 'Team Leader & Lead Strategist' : m.roleInTeam.replace('Team Leader & ', ''),
      }))
    );
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert('Please enter a valid Team Name.');
      return;
    }
    if (teamMembers.length < 3 || teamMembers.length > 4) {
      alert('Teams must consist of strictly 3 or 4 candidates (Section 5.2).');
      return;
    }

    const leader = teamMembers.find(m => m.isLeader) || teamMembers[0];

    const result = createInstitutionalTeam(inst.id, {
      name: newTeamName.trim(),
      preferredHub: newTeamHub,
      leaderStudentId: leader.studentId,
      members: teamMembers.map(m => ({
        studentId: m.studentId,
        name: m.name,
        email: m.email,
        mobile: m.mobile,
        roleInTeam: m.roleInTeam,
      })),
    });

    if (result.success) {
      alert(result.message);
      setShowCreateTeamModal(false);
      setNewTeamName('');
      setActiveTab('teams');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Institute Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-2xl border border-purple-500/30 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {inst.name}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                Rank #{inst.ranking} National Institutional Leaderboard
              </span>
              <DocRequirementInfo specKey="institute_leaderboard" variant="icon" size="xs" colorTheme="purple" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Faculty Coordinator: <strong className="text-slate-800 dark:text-slate-200">{inst.coordinatorName}</strong> ({inst.coordinatorEmail}) • NIRF Tier-1 Accredited
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Institutional Team</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Student Roster (CSV)</span>
          </button>

          <button
            onClick={() => alert(`Downloading consolidated B2B GST Tax Invoice for ${inst.name} (GSTIN: 29AABCI1234F1Z9). Total ₹25,600 settled.`)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GST Tax Invoice (PDF)</span>
          </button>
        </div>
      </div>

      {/* Institutional Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Enrolled Students</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">{inst.totalStudents || 140}</span>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block mt-0.5">Across MBA & PGP</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Institutional Teams</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
            {instituteTeams.length} Teams
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Section 5.2 Compliant</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 1 Pass Count</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{inst.registeredStudents || 128}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">91.4% Institute Pass Rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Regional Hub Allocation</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">South Hub</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Host Campus: IIM Bangalore</span>
        </div>
      </div>

      {/* Bulk Bursar Payment Banner if any unpaid */}
      {unpaidCount > 0 && !isBulkPaid && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IndianRupee className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Institutional Bursar Settlement Available
                </h4>
                <DocRequirementInfo specKey="institute_bursar" variant="icon" size="xs" colorTheme="amber" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {unpaidCount} students currently have pending Round 1 fees (₹{totalUnpaidAmount}). You may settle in a single transaction on behalf of the institution.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsBulkPaid(true);
              alert(`Successfully authorized institutional bulk transfer of ₹${totalUnpaidAmount} for ${unpaidCount} students.`);
            }}
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Settle ₹{totalUnpaidAmount} (Consolidated)
          </button>
        </div>
      )}

      {/* Navigation Tabs: Formed Teams vs Student Roster */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'teams'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Formed Institutional Teams ({instituteTeams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Candidate Registry ({filteredRoster.length})</span>
        </button>
      </div>

      {/* ----------------- TAB: FORMED INSTITUTIONAL TEAMS ----------------- */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Official Teams Representing {inst.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {instituteTeams.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each team comprises 3-4 enrolled MBA/PGP students with designated faculty endorsement and unique team code.
              </p>
            </div>

            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Form New Team</span>
            </button>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instituteTeams.map(t => {
              const deadlineDate = t.submissionDeadline ? new Date(t.submissionDeadline) : new Date('2026-10-28T23:59:59Z');
              const ext = t.extensionRequest;
              const sub = t.r2Submission;

              return (
                <div
                  key={t.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                        Assigned Regional Hub: {t.assignedHub?.toUpperCase() || 'SOUTH'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {t.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <span>{t.inviteCode}</span>
                        <button
                          onClick={() => handleCopyCode(t.inviteCode)}
                          className="text-slate-400 hover:text-purple-600 cursor-pointer"
                          title="Copy Team Code"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                      {copiedCode === t.inviteCode && (
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      )}
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Registered Members ({t.members.length}/4)
                    </span>
                    {t.members.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${m.isLeader ? 'bg-purple-600' : 'bg-slate-400'}`} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                          {m.isLeader && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{m.roleInTeam || 'Member'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stage Status & Round 2 Deadlines */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 1 Quiz</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Qualified (Avg {t.r1AvgScore || 85}%)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">R2 Submission Cut-off</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                        {deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, 23:59 IST
                      </span>
                    </div>
                  </div>

                  {/* Extension status if present */}
                  {ext && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          Deadline Extension: <strong>{ext.status}</strong> (+{ext.requestedExtensionDays}d)
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                        {ext.reasonCategory}
                      </span>
                    </div>
                  )}

                  {/* Submission status pill */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      R2 Case Deck: {sub ? <strong className="text-emerald-600">Uploaded ({sub.slideCount} slides)</strong> : <span className="text-amber-600">Pending Upload</span>}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      Institutional Endorsed ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- TAB: STUDENT ROSTER ----------------- */}
      {activeTab === 'roster' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-6">
          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Institutional Student Registry
              </h3>
              <span className="text-xs text-slate-400 font-mono">({filteredRoster.length} candidates)</span>
              <DocRequirementInfo specKey="institute_roster" variant="icon" size="xs" colorTheme="purple" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Fee Paid</option>
                <option value="unpaid">Payment Pending</option>
                <option value="qualified">Round 1 Qualified</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Student Name & ID</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Team Assignment</th>
                  <th className="p-3">Stage Fee</th>
                  <th className="p-3">R1 Quiz Score</th>
                  <th className="p-3 text-right">Academic Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRoster.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.studentId}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{s.email}</td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.teamName || 'Unassigned'}</span>
                    </td>
                    <td className="p-3">
                      {s.feePaid || isBulkPaid ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold border border-emerald-300">
                          Paid ₹200
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 font-bold border border-amber-300">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold">
                      {s.r1Score ? (
                        <span className={s.r1Score >= 65 ? 'text-emerald-600' : 'text-slate-500'}>
                          {s.r1Score}% {s.r1Score >= 65 ? '★' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not taken</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> ID Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Institutional Team */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Form Institutional Competition Team (Section 5.2)
                </h3>
              </div>
              <button onClick={() => setShowCreateTeamModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Register a vetted 3-4 member team on behalf of <strong className="text-slate-800 dark:text-slate-200">{inst.name}</strong>. An automated team code will be generated for student authentication.
            </p>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
              {/* Team Name & Preferred Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Team Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. StratApex Innovators"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Preferred Regional Hub:
                  </label>
                  <select
                    value={newTeamHub}
                    onChange={e => setNewTeamHub(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="south">Southern Regional Hub (IIM Bangalore)</option>
                    <option value="north">Northern Regional Hub (FMS Delhi)</option>
                    <option value="east">Eastern Regional Hub (IIM Calcutta)</option>
                    <option value="west">Western Regional Hub (JBIMS Mumbai)</option>
                    <option value="central">Central Regional Hub (IIFM Bhopal)</option>
                  </select>
                </div>
              </div>

              {/* Members Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Team Roster ({teamMembers.length} Members - Min 3, Max 4)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Designate 1 Team Leader who possesses authority to submit case decks and request deadline extensions.
                    </span>
                  </div>

                  {teamMembers.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add 4th Member</span>
                    </button>
                  )}
                </div>

                {/* Member Input Rows */}
                <div className="space-y-2.5">
                  {teamMembers.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Member #{idx + 1}
                          </span>
                          {m.isLeader ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold">
                              ★ Designated Team Leader
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetLeader(idx)}
                              className="text-[10px] text-purple-600 hover:underline font-semibold cursor-pointer"
                            >
                              Make Leader
                            </button>
                          )}
                        </div>

                        {teamMembers.length > 3 && !m.isLeader && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Candidate Full Name"
                          value={m.name}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, name: val } : item)));
                          }}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />

                        <input
                          type="email"
                          required
                          placeholder="Institutional Email"
                          value={m.email}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, email: val } : item)));
                          }}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />

                        <input
                          type="text"
                          required
                          placeholder="Roll No. / Student ID"
                          value={m.studentId}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, studentId: val } : item)));
                          }}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Functional Role (e.g. Lead Strategist, Financial Modeling, Presentation Lead)"
                          value={m.roleInTeam}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, roleInTeam: val } : item)));
                          }}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance checklist */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Competition Compliance Verification</span>
                </div>
                <ul className="text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-4">
                  <li>Minimum 3, maximum 4 members strictly enforced (Section 5.2).</li>
                  <li>Institutional endorsement applied automatically under Coordinator credentials.</li>
                  <li>Team leader enabled for Round 2 Case Deck uploads & deadline extensions.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Confirm & Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload CSV Roster */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                Upload Institutional Student Roster (Section 5.3)
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Upload an Excel (.xlsx) or CSV file with candidate full names, institutional email addresses, student roll numbers, and department codes.
            </p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/30">
              <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to select CSV roster or drag and drop
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Download sample template:{' '}
                <span className="text-purple-600 underline font-semibold">aima_roster_template.csv</span>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Bulk student roster uploaded and 128 student login invitations generated.');
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Process Roster & Send Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
