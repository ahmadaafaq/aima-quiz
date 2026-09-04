import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizAttempt, UserProfile } from '../../types';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  FileSpreadsheet,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface QuizResultsLeaderboardProps {
  initialProgramId?: string;
}

export const QuizResultsLeaderboard: React.FC<QuizResultsLeaderboardProps> = ({
  initialProgramId,
}) => {
  const {
    quizPrograms,
    quizAttempts,
    users,
    teams,
    institutions,
    questions,
    config,
    addAuditLog,
  } = useCompetition();

  const [selectedProgramId, setSelectedProgramId] = useState<string>(initialProgramId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'qualified' | 'disqualified' | 'violations'>('all');
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<QuizAttempt | null>(null);

  // Combine attempts with user and team data
  const enrichedLeaderboard = users
    .map(user => {
      const attempt = quizAttempts.find(a => a.studentId === user.id || a.userId === user.id);
      const userTeam = teams.find(t => t.members.some(m => m.studentId === user.id));
      const institute = institutions.find(i => i.id === user.instituteId);

      const score = attempt?.score ?? user.quizScore ?? 0;
      const analyticalScore = attempt?.analyticalScore ?? Math.round(score * 0.4);
      const timeTaken = attempt?.timeTakenSeconds ?? 1800;
      const tabSwitches = attempt?.tabSwitchCount ?? 0;
      const isCompleted = !!attempt?.isCompleted || (user.quizScore !== undefined && user.quizScore > 0);
      const isQualified = score >= (config.r1CutoffScore || 75);

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        studentIdCardNumber: user.studentIdCardNumber,
        instituteName: institute?.name || 'Independent B-School',
        instituteCity: institute?.city || 'India',
        teamName: userTeam?.name || 'Individual Entry',
        teamId: userTeam?.id,
        score,
        analyticalScore,
        timeTaken,
        tabSwitches,
        isCompleted,
        isQualified,
        attemptData: attempt,
        userProfile: user,
      };
    })
    .filter(item => item.isCompleted);

  // Official Tie-breaker Sorting:
  // 1. Total Score (desc)
  // 2. Analytical Section Score (desc)
  // 3. Lowest Time Taken (asc)
  // 4. Lowest Tab Switches (asc)
  const sortedLeaderboard = [...enrichedLeaderboard].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.analyticalScore !== a.analyticalScore) return b.analyticalScore - a.analyticalScore;
    if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
    return a.tabSwitches - b.tabSwitches;
  });

  // Filtered by Search & Status
  const filteredList = sortedLeaderboard.filter((row, idx) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.teamName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'qualified' && row.isQualified) ||
      (filterStatus === 'disqualified' && !row.isQualified) ||
      (filterStatus === 'violations' && row.tabSwitches > 0);

    return matchesSearch && matchesStatus;
  });

  // Telemetry Aggregates
  const totalSubmissions = sortedLeaderboard.length;
  const topScore = sortedLeaderboard.length > 0 ? sortedLeaderboard[0].score : 0;
  const avgScore = totalSubmissions > 0 ? Math.round(sortedLeaderboard.reduce((a, b) => a + b.score, 0) / totalSubmissions) : 0;
  const qualifiedCount = sortedLeaderboard.filter(r => r.isQualified).length;
  const passRate = totalSubmissions > 0 ? Math.round((qualifiedCount / totalSubmissions) * 100) : 0;
  const tabViolationCount = sortedLeaderboard.filter(r => r.tabSwitches > 0).length;

  const handleExportMeritList = () => {
    const headers = ['National Rank', 'Candidate ID', 'Name', 'Email', 'Institute', 'Team', 'Total Score (100)', 'Analytical Score (40)', 'Time Taken (s)', 'Tab Switches', 'Qualification Status'];
    const rows = filteredList.map((r, idx) => [
      idx + 1,
      r.userId,
      `"${r.name}"`,
      r.email,
      `"${r.instituteName}"`,
      `"${r.teamName}"`,
      r.score,
      r.analyticalScore,
      r.timeTaken,
      r.tabSwitches,
      r.isQualified ? 'QUALIFIED FOR STAGE 2' : 'BELOW CUTOFF',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIMA_National_Quiz_Leaderboard_MeritList_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('Merit List Exported', 'Quiz', `Super Admin exported official leaderboard of ${filteredList.length} rankers`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                National Quiz Leaderboard & Candidate Rankings
              </h2>
              <DocRequirementInfo
                specKey="admin_tie_breaker"
                variant="badge"
                badgeLabel="BRD §7.4 Tie-Breaker"
                colorTheme="amber"
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated evaluation, analytical tie-breaker scoring, cutoff validation, and proctoring telemetry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportMeritList}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Official Merit List CSV</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>National Top Score</span>
            <Medal className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {topScore}/100
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            Rank 1: {sortedLeaderboard[0]?.name || 'N/A'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>National Average Score</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {avgScore}/100
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Standard cutoff: {config.r1CutoffScore || 75}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Qualification Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {passRate}%
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {qualifiedCount} qualified for Stage 2
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Evaluated Attempts</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubmissions}
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            100% automated scoring
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Integrity Violations</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {tabViolationCount} Flagged
          </div>
          <div className="text-xs text-red-600 font-medium mt-1">
            Tab switch detection
          </div>
        </div>
      </div>

      {/* Filter and Quiz Program Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Program Selector */}
          <select
            value={selectedProgramId}
            onChange={e => setSelectedProgramId(e.target.value)}
            className="text-xs font-bold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">📚 All Active Quiz Programs Combined</option>
            {quizPrograms.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.code})
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ranker, college, team..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'qualified', 'disqualified', 'violations'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Candidate & B-School</th>
                <th className="py-3.5 px-4">Affiliated Team</th>
                <th className="py-3.5 px-4 text-center">Total Score (100)</th>
                <th className="py-3.5 px-4 text-center">Analytical (40)</th>
                <th className="py-3.5 px-4 text-center">Time Taken</th>
                <th className="py-3.5 px-4 text-center">Integrity Status</th>
                <th className="py-3.5 px-4 text-right">Stage 2 Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No evaluated quiz attempts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((row, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const minutes = Math.floor(row.timeTaken / 60);
                  const seconds = row.timeTaken % 60;

                  return (
                    <tr
                      key={row.userId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isTop3 ? 'bg-amber-500/5 dark:bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs shadow-xs">
                            🥇 1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs shadow-xs">
                            🥈 2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-slate-500 text-sm">
                            #{rank}
                          </span>
                        )}
                      </td>

                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{row.name}</span>
                          {row.userProfile.isTeamLeader && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Leader
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.instituteName} ({row.instituteCity})
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {row.email}
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {row.teamName}
                        </span>
                      </td>

                      {/* Total Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-black text-base text-slate-900 dark:text-white">
                          {row.score}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          out of 100
                        </div>
                      </td>

                      {/* Analytical Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {row.analyticalScore}/40
                        </span>
                      </td>

                      {/* Time Taken */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {minutes}m {seconds < 10 ? '0' : ''}{seconds}s
                      </td>

                      {/* Integrity */}
                      <td className="py-3.5 px-4 text-center">
                        {row.tabSwitches === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Clean (0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            {row.tabSwitches} Switches
                          </span>
                        )}
                      </td>

                      {/* Qualification */}
                      <td className="py-3.5 px-4 text-right">
                        {row.isQualified ? (
                          <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                            Qualified R2
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Below Cutoff
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
