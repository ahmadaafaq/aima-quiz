import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { OfflineRoundResult } from '../../types';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  AlertCircle,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit2,
  Edit3,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  MapPin,
  Mic,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';

export const OfflineRoundsManager: React.FC = () => {
  const {
    offlineRoundResults,
    recordOfflineResultsBulk,
    updateOfflineResult,
    deleteOfflineResult,
    teams,
  } = useCompetition();

  const [activeRoundTab, setActiveRoundTab] = useState<'all' | 'round_3' | 'round_4'>('all');
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState<'all' | 'qualified' | 'champion' | 'attendance_verified'>('all');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRecordScoreModal, setShowRecordScoreModal] = useState(false);
  const [editingResult, setEditingResult] = useState<OfflineRoundResult | null>(null);

  // Form State for Manual Entry / Edit
  const [formTeamId, setFormTeamId] = useState('');
  const [formRound, setFormRound] = useState<'round_3' | 'round_4'>('round_3');
  const [formHubName, setFormHubName] = useState('Southern Regional Hub (IIM Bangalore)');
  const [formQuizScore, setFormQuizScore] = useState<number>(45);
  const [formPresentationScore, setFormPresentationScore] = useState<number>(44);
  const [formQaScore, setFormQaScore] = useState<number>(9);
  const [formAttendanceVerified, setFormAttendanceVerified] = useState(true);
  const [formQualifiedNextRound, setFormQualifiedNextRound] = useState(true);
  const [formAward, setFormAward] = useState<string>('');
  const [formNotes, setFormNotes] = useState('');

  // Bulk Upload File State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadRound, setUploadRound] = useState<'round_3' | 'round_4'>('round_3');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Filtered results
  const filteredResults = offlineRoundResults.filter(r => {
    if (activeRoundTab !== 'all' && r.round !== activeRoundTab) return false;
    if (selectedHub !== 'all' && !r.hubName.toLowerCase().includes(selectedHub.toLowerCase())) return false;

    const matchesSearch =
      r.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.instituteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hubName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (qualificationFilter === 'qualified') return r.qualifiedNextRound;
    if (qualificationFilter === 'champion') return r.award && r.award.includes('Champion');
    if (qualificationFilter === 'attendance_verified') return r.attendanceVerified;

    return true;
  });

  // Calculate statistics
  const r3Results = offlineRoundResults.filter(r => r.round === 'round_3');
  const r4Results = offlineRoundResults.filter(r => r.round === 'round_4');

  const r3AvgQuiz = r3Results.length > 0
    ? (r3Results.reduce((acc, r) => acc + (r.offlineQuizScore || 0), 0) / r3Results.length).toFixed(1)
    : '0';

  const r3AvgPres = r3Results.length > 0
    ? (r3Results.reduce((acc, r) => acc + (r.livePresentationScore || 0), 0) / r3Results.length).toFixed(1)
    : '0';

  const r3QualifiedCount = r3Results.filter(r => r.qualifiedNextRound).length;
  const r4ChampionsCount = r4Results.filter(r => !!r.award).length;

  const handleOpenCreateModal = () => {
    setEditingResult(null);
    const defaultTeam = teams[0];
    setFormTeamId(defaultTeam ? defaultTeam.id : '');
    setFormRound('round_3');
    setFormHubName(defaultTeam?.assignedHub === 'south' ? 'Southern Regional Hub (IIM Bangalore)' : 'Northern Regional Hub (FMS Delhi)');
    setFormQuizScore(45);
    setFormPresentationScore(44);
    setFormQaScore(9);
    setFormAttendanceVerified(true);
    setFormQualifiedNextRound(true);
    setFormAward('');
    setFormNotes('Physical attendance checked, ID verified, and viva defense completed in-person before jury.');
    setShowRecordScoreModal(true);
  };

  const handleOpenEditModal = (res: OfflineRoundResult) => {
    setEditingResult(res);
    setFormTeamId(res.teamId);
    setFormRound(res.round);
    setFormHubName(res.hubName);
    setFormQuizScore(res.offlineQuizScore || 0);
    setFormPresentationScore(res.livePresentationScore || 0);
    setFormQaScore(res.qaDefenseScore || 0);
    setFormAttendanceVerified(res.attendanceVerified);
    setFormQualifiedNextRound(!!res.qualifiedNextRound);
    setFormAward(res.award || '');
    setFormNotes(res.notes || '');
    setShowRecordScoreModal(true);
  };

  const handleSaveScoreForm = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTeamObj = teams.find(t => t.id === formTeamId);
    const teamName = selectedTeamObj ? selectedTeamObj.name : 'Sample Team';
    const instituteName = selectedTeamObj ? selectedTeamObj.instituteName : 'Management Institute';

    const aggregateScore = formQuizScore + formPresentationScore + (formQaScore || 0);

    if (editingResult) {
      updateOfflineResult(editingResult.id, {
        offlineQuizScore: formQuizScore,
        livePresentationScore: formPresentationScore,
        qaDefenseScore: formQaScore,
        aggregateScore,
        attendanceVerified: formAttendanceVerified,
        qualifiedNextRound: formRound === 'round_3' ? formQualifiedNextRound : undefined,
        award: formRound === 'round_4' ? (formAward || undefined) : undefined,
        notes: formNotes,
        hubName: formHubName,
      });
    } else {
      recordOfflineResultsBulk(
        [
          {
            teamId: formTeamId,
            teamName,
            instituteName,
            hubName: formHubName,
            round: formRound,
            attendanceVerified: formAttendanceVerified,
            offlineQuizScore: formQuizScore,
            livePresentationScore: formPresentationScore,
            qaDefenseScore: formQaScore,
            aggregateScore,
            qualifiedNextRound: formRound === 'round_3' ? formQualifiedNextRound : undefined,
            award: formRound === 'round_4' ? (formAward || undefined) : undefined,
            notes: formNotes,
            evaluatedBy: 'AIMA Board of Scrutineers',
          },
        ],
        formRound
      );
    }

    setShowRecordScoreModal(false);
  };

  const handleSimulateBulkUpload = () => {
    setIsProcessingUpload(true);
    setTimeout(() => {
      // Mock generated records representing bulk offline evaluation
      const importedRecords: Omit<OfflineRoundResult, 'id' | 'uploadedAt'>[] = [
        {
          teamId: 'team_delhi_titans',
          teamName: 'Capital Innovators',
          instituteName: 'Faculty of Management Studies (FMS Delhi)',
          hubName: 'Northern Regional Hub (FMS Delhi)',
          round: uploadRound,
          attendanceVerified: true,
          offlineQuizScore: 46,
          livePresentationScore: 47,
          qaDefenseScore: 9,
          aggregateScore: 102,
          rank: 1,
          qualifiedNextRound: uploadRound === 'round_3',
          award: uploadRound === 'round_4' ? 'National Champion (Gold Trophy)' : undefined,
          evaluatedBy: 'Regional Scrutineer Panel',
          notes: 'Flawless strategic and financial presentation. Outstanding responses during live cross-examination.',
        },
        {
          teamId: 'team_calcutta_vanguard',
          teamName: 'Eastern Pioneers',
          instituteName: 'Indian Institute of Management Calcutta (IIMC)',
          hubName: 'Eastern Regional Hub (IIM Calcutta)',
          round: uploadRound,
          attendanceVerified: true,
          offlineQuizScore: 44,
          livePresentationScore: 45,
          qaDefenseScore: 8,
          aggregateScore: 97,
          rank: 2,
          qualifiedNextRound: uploadRound === 'round_3',
          award: uploadRound === 'round_4' ? '1st Runner Up (Silver Shield)' : undefined,
          evaluatedBy: 'Regional Scrutineer Panel',
          notes: 'Strong logistical framework. ID verified at campus physical registration desk.',
        },
        {
          teamId: 'team_bhopal_ecoventure',
          teamName: 'Central Strategists',
          instituteName: 'Indian Institute of Forest Management (IIFM)',
          hubName: 'Central Regional Hub (IIFM Bhopal)',
          round: uploadRound,
          attendanceVerified: true,
          offlineQuizScore: 41,
          livePresentationScore: 43,
          qaDefenseScore: 8,
          aggregateScore: 92,
          rank: 3,
          qualifiedNextRound: false,
          evaluatedBy: 'Regional Scrutineer Panel',
          notes: 'Commendable presentation; missed cutoff for Grand Finale by 2 points.',
        },
      ];

      recordOfflineResultsBulk(uploadRound, importedRecords);
      setIsProcessingUpload(false);
      setShowUploadModal(false);
      setUploadFile(null);
      alert(`Successfully processed spreadsheet! Bulk recorded ${importedRecords.length} offline results for ${uploadRound === 'round_3' ? 'Round 3 Regional Live Round' : 'Round 4 Grand Finale'}.`);
    }, 600);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'team_id,team_name,institute_name,hub_name,round,attendance_verified,offline_quiz_score,live_presentation_score,qa_defense_score,qualified_next_round,award,notes\n' +
      'team_stratapex,StratApex Consultants,IIM Bangalore,Southern Regional Hub,round_3,true,47,46,9,true,,Excellent strategic clarity and defense\n' +
      'team_jbims_mavericks,JBIMS Mavericks,JBIMS Mumbai,Western Regional Hub,round_3,true,45,44,8,true,,Strong market expansion modeling\n' +
      'team_fms_ace,FMS Ace Strategists,FMS Delhi,Northern Regional Hub,round_4,true,48,47,9,false,National Champion,Unanimous top score by Grand Jury\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'aima_offline_round_results_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-2xl border border-purple-500/30 shrink-0">
            <Mic className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Offline Rounds 3 & 4 Results Management
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                Face-to-Face & Regional Hub Scrutiny
              </span>
              <DocRequirementInfo specKey="round3_regional" variant="icon" size="xs" colorTheme="purple" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Record, upload, and publish verified in-person offline quiz scores, live presentation jury marks, attendance registries, and Grand Finale podium awards.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Spreadsheet</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Team Score</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 3 Live Evaluated</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{r3Results.length}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Across 5 Regional Hubs</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">R3 Grand Finale Qualifiers</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{r3QualifiedCount}</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Advancing to National</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 4 Grand Finalists</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{r4Results.length}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">{r4ChampionsCount} Podium Awards Conferred</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Offline Quiz / Live Pres</span>
          <span className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
            {r3AvgQuiz}/50 • {r3AvgPres}/50
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">In-person jury calibration</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        
        {/* Navigation Tabs & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          
          {/* Round Toggle Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveRoundTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRoundTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Offline Rounds ({offlineRoundResults.length})
            </button>
            <button
              onClick={() => setActiveRoundTab('round_3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRoundTab === 'round_3'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Round 3: Regional Live Hubs ({r3Results.length})
            </button>
            <button
              onClick={() => setActiveRoundTab('round_4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRoundTab === 'round_4'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Round 4: Grand Finale ({r4Results.length})
            </button>
          </div>

          {/* Search & Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search team, institute, hub..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedHub}
              onChange={e => setSelectedHub(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Regional Hubs</option>
              <option value="North">North Hub (FMS)</option>
              <option value="South">South Hub (IIMB)</option>
              <option value="East">East Hub (IIMC)</option>
              <option value="West">West Hub (JBIMS)</option>
              <option value="Central">Central Hub (IIFM)</option>
              <option value="National">National Grand Finale</option>
            </select>

            <select
              value={qualificationFilter}
              onChange={e => setQualificationFilter(e.target.value as any)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Outcomes</option>
              <option value="qualified">Qualified for Grand Finale</option>
              <option value="champion">National Champions / Podium</option>
              <option value="attendance_verified">Attendance Verified Only</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">Team & Institute</th>
                <th className="p-3">Round & Regional Venue</th>
                <th className="p-3 text-center">Offline Quiz</th>
                <th className="p-3 text-center">Live Presentation</th>
                <th className="p-3 text-center">Q&A Defense</th>
                <th className="p-3 text-center">Aggregate Score</th>
                <th className="p-3">Rank & Outcome</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No offline round results match your current filters. Click "Record Team Score" or "Upload Spreadsheet" to add scores.
                  </td>
                </tr>
              ) : (
                filteredResults.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Team */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{r.teamName}</span>
                        {r.attendanceVerified && (
                          <span title="Physical Attendance Verified at Venue" className="text-emerald-600">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{r.instituteName}</div>
                      {r.notes && (
                        <div className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                          "{r.notes}"
                        </div>
                      )}
                    </td>

                    {/* Round & Venue */}
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 border ${
                          r.round === 'round_3'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-300'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300'
                        }`}
                      >
                        {r.round === 'round_3' ? 'Round 3 (Regional Live)' : 'Round 4 (National Grand Finale)'}
                      </span>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{r.hubName}</span>
                      </div>
                    </td>

                    {/* Offline Quiz Score */}
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {r.offlineQuizScore !== undefined ? `${r.offlineQuizScore} / 50` : '—'}
                      </span>
                    </td>

                    {/* Live Presentation Score */}
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {r.livePresentationScore !== undefined ? `${r.livePresentationScore} / 50` : '—'}
                      </span>
                    </td>

                    {/* Q&A Defense */}
                    <td className="p-3 text-center">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {r.qaDefenseScore !== undefined ? `${r.qaDefenseScore} / 10` : '—'}
                      </span>
                    </td>

                    {/* Aggregate Score */}
                    <td className="p-3 text-center">
                      <div className="font-black text-sm text-slate-900 dark:text-slate-100">
                        {r.aggregateScore || (r.offlineQuizScore || 0) + (r.livePresentationScore || 0) + (r.qaDefenseScore || 0)}
                      </div>
                      <span className="text-[10px] text-slate-400">Total Points</span>
                    </td>

                    {/* Rank & Outcome */}
                    <td className="p-3">
                      <div className="space-y-1">
                        {r.rank && (
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            Rank #{r.rank}
                          </span>
                        )}

                        {r.round === 'round_3' && (
                          <div>
                            {r.qualifiedNextRound ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                                <Trophy className="w-3 h-3" />
                                Qualified for Grand Finale
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Regional Finalist
                              </span>
                            )}
                          </div>
                        )}

                        {r.round === 'round_4' && r.award && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300">
                            <Award className="w-3 h-3 text-amber-600" />
                            {r.award}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Edit Score"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove offline result record for ${r.teamName}?`)) {
                              deleteOfflineResult(r.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Bulk Spreadsheet Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Bulk Upload Offline Round Scores (CSV / Excel)
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Upload tabulated scores compiled by Regional Hub Scrutineers or Grand Finale Jury Panels. Scores will immediately update national standings and advance qualified teams.
            </p>

            {/* Target Round selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Competition Stage:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUploadRound('round_3')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    uploadRound === 'round_3'
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs block">Round 3: Regional Live Hubs</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Live PPT defense + Offline quiz (IIMB, FMS, IIMC, JBIMS, IIFM)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadRound('round_4')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    uploadRound === 'round_4'
                      ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs block">Round 4: Grand Finale</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">National Boardroom Presentation at AIMA HQ New Delhi</span>
                </button>
              </div>
            </div>

            {/* Format Instructions */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Spreadsheet Column Specification:</span>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-purple-600 hover:text-purple-700 font-semibold underline text-[11px] cursor-pointer"
                >
                  Download Sample CSV
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto">
                team_id, team_name, institute_name, hub_name, round, attendance_verified, offline_quiz_score, live_presentation_score, qa_defense_score, qualified_next_round, award, notes
              </div>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => {
                const fakeFile = new File(['sample'], 'aima_round_scores.csv', { type: 'text/csv' });
                setUploadFile(fakeFile);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
            >
              <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {uploadFile ? `Selected: ${uploadFile.name} (Ready to Process)` : 'Click to select scorecard (.csv or .xlsx) or drop file here'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports automated schema normalization and duplicate prevention
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                disabled={isProcessingUpload}
                onClick={handleSimulateBulkUpload}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isProcessingUpload ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Spreadsheet...</span>
                  </>
                ) : (
                  <span>Import & Publish Scores</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Score Entry / Edit */}
      {showRecordScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingResult ? 'Update Offline Score Record' : 'Record In-Person Team Score'}
                </h3>
              </div>
              <button onClick={() => setShowRecordScoreModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveScoreForm} className="space-y-4 text-xs">
              {/* Select Team & Round */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Participating Team:
                  </label>
                  <select
                    value={formTeamId}
                    onChange={e => setFormTeamId(e.target.value)}
                    disabled={!!editingResult}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.instituteName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Competition Round:
                  </label>
                  <select
                    value={formRound}
                    onChange={e => setFormRound(e.target.value as any)}
                    disabled={!!editingResult}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="round_3">Round 3: Regional Live Hub</option>
                    <option value="round_4">Round 4: National Grand Finale</option>
                  </select>
                </div>
              </div>

              {/* Regional Hub Venue */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hub / Examination Venue:
                </label>
                <input
                  type="text"
                  value={formHubName}
                  onChange={e => setFormHubName(e.target.value)}
                  placeholder="e.g. Southern Regional Hub (IIM Bangalore)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Score breakdown: Quiz, Presentation, QA */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Offline Quiz (50):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formQuizScore}
                    onChange={e => setFormQuizScore(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Live PPT (50):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formPresentationScore}
                    onChange={e => setFormPresentationScore(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Q&A Defense (10):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formQaScore}
                    onChange={e => setFormQaScore(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center font-bold"
                  />
                </div>
              </div>

              {/* Attendance and Qualification switches */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formAttendanceVerified}
                    onChange={e => setFormAttendanceVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Physical Candidate Attendance Verified at Venue Desk</span>
                </label>

                {formRound === 'round_3' ? (
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-700 dark:text-emerald-400">
                    <input
                      type="checkbox"
                      checked={formQualifiedNextRound}
                      onChange={e => setFormQualifiedNextRound(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Qualified to Advance to Round 4 National Grand Finale</span>
                  </label>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Grand Finale Podium Award:
                    </label>
                    <select
                      value={formAward}
                      onChange={e => setFormAward(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">None / National Finalist</option>
                      <option value="National Champion (Gold Trophy & ₹1,00,000)">National Champion (Gold Trophy & ₹1,00,000)</option>
                      <option value="1st Runner Up (Silver Shield & ₹50,000)">1st Runner Up (Silver Shield & ₹50,000)</option>
                      <option value="2nd Runner Up (Bronze Shield & ₹25,000)">2nd Runner Up (Bronze Shield & ₹25,000)</option>
                      <option value="Best Business Model Innovation">Best Business Model Innovation</option>
                      <option value="Special Jury Commendation">Special Jury Commendation</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Scrutineer Notes */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Panel / Scrutineer Observations:
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Sharp financial sensitivity modeling; confident defense of supply chain questions."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecordScoreModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {editingResult ? 'Update Score' : 'Save & Publish Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
