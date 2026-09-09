import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  HelpCircle,
  History,
  Hourglass,
  Layers,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  XCircle,
} from 'lucide-react';

export const CaseDeckDeadlinesManager: React.FC = () => {
  const { teams, reviewDeadlineExtension, updateTeamDeadline } = useCompetition();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_extension' | 'submitted' | 'unsubmitted'>('all');
  const [selectedHub, setSelectedHub] = useState<string>('all');

  // Modal states
  const [activeExtensionModalTeam, setActiveExtensionModalTeam] = useState<any | null>(null);
  const [activeDeadlineEditTeam, setActiveDeadlineEditTeam] = useState<any | null>(null);
  const [newDeadlineInput, setNewDeadlineInput] = useState<string>('');
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [customApprovedDays, setCustomApprovedDays] = useState<number>(2);

  // Teams eligible for / participating in Round 2
  const r2Teams = teams.filter(t => t.r1Qualified !== false);

  const pendingExtensionCount = r2Teams.filter(t => t.extensionRequest?.status === 'PENDING').length;
  const submittedCount = r2Teams.filter(t => !!t.r2Submission).length;

  const filteredTeams = r2Teams.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.instituteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHub = selectedHub === 'all' || t.assignedHub === selectedHub;

    if (!matchesSearch || !matchesHub) return false;

    if (filterStatus === 'pending_extension') return t.extensionRequest?.status === 'PENDING';
    if (filterStatus === 'submitted') return !!t.r2Submission;
    if (filterStatus === 'unsubmitted') return !t.r2Submission;

    return true;
  });

  const handleOpenReviewModal = (team: any) => {
    setActiveExtensionModalTeam(team);
    setReviewRemarks('');
    setCustomApprovedDays(team.extensionRequest?.requestedExtensionDays || 2);
  };

  const handleApproveExtension = () => {
    if (!activeExtensionModalTeam) return;

    // Calculate proposed new deadline
    const curr = activeExtensionModalTeam.submissionDeadline || '2026-10-28T23:59:59Z';
    const currDate = new Date(curr);
    const newDate = new Date(currDate.getTime() + customApprovedDays * 24 * 60 * 60 * 1000);
    const newDeadlineIso = newDate.toISOString();

    reviewDeadlineExtension(
      activeExtensionModalTeam.id,
      'APPROVED',
      reviewRemarks || `Extension of +${customApprovedDays} days granted on academic merits.`,
      newDeadlineIso
    );

    setActiveExtensionModalTeam(null);
  };

  const handleRejectExtension = () => {
    if (!activeExtensionModalTeam) return;
    reviewDeadlineExtension(
      activeExtensionModalTeam.id,
      'REJECTED',
      reviewRemarks || 'Declined as per uniform league timing rules.'
    );
    setActiveExtensionModalTeam(null);
  };

  const handleOpenEditDeadline = (team: any) => {
    setActiveDeadlineEditTeam(team);
    const curr = team.submissionDeadline || '2026-10-28T23:59:59Z';
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const dateObj = new Date(curr);
    const localStr = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setNewDeadlineInput(localStr);
  };

  const handleSaveDeadline = () => {
    if (!activeDeadlineEditTeam || !newDeadlineInput) return;
    const isoString = new Date(newDeadlineInput).toISOString();
    updateTeamDeadline(activeDeadlineEditTeam.id, isoString);
    setActiveDeadlineEditTeam(null);
  };

  const handleBulkSetDeadline = (daysFromNow: number) => {
    const targetDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    targetDate.setHours(23, 59, 59, 0);
    const iso = targetDate.toISOString();
    r2Teams.forEach(t => updateTeamDeadline(t.id, iso));
    alert(`Submission deadline synchronized to ${targetDate.toLocaleDateString()} 23:59 IST for all ${r2Teams.length} Round 2 teams.`);
  };

  const formatDeadlineDate = (iso?: string) => {
    if (!iso) return '28 Oct 2026, 23:59 IST';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateDaysLeft = (iso?: string) => {
    const target = new Date(iso || '2026-10-28T23:59:59Z').getTime();
    const now = Date.now();
    const diffHours = Math.round((target - now) / (1000 * 60 * 60));
    if (diffHours < 0) return { text: 'Expired', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-300' };
    const days = Math.floor(diffHours / 24);
    const hrs = diffHours % 24;
    return {
      text: `${days}d ${hrs}h left`,
      color: days <= 2 ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-300' : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300',
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Stat Cards */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl border border-blue-500/30 shrink-0">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Round 2 Case Decks & Submission Deadlines
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                AIMA-ICRC Section 8.2 & 8.3
              </span>
              <DocRequirementInfo specKey="round2_case" variant="icon" size="xs" colorTheme="blue" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure submission timelines, monitor deck uploads (12-slide maximum), and adjudicate team extension appeals.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleBulkSetDeadline(14)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Set All to +14 Days</span>
          </button>
          <button
            onClick={() => alert(`Exporting Round 2 Submission Register for ${r2Teams.length} teams with anonymized IDs, slide counts, and extension statuses.`)}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Register (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 2 Finalists</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">{r2Teams.length}</span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">Cleared Round 1</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Decks Received</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{submittedCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">{Math.round((submittedCount / (r2Teams.length || 1)) * 100)}% Upload Rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Extension Requests</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{pendingExtensionCount}</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">Pending Review</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Standard Cut-Off</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">Oct 28, 2026 23:59</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Uniform Indian Standard Time</span>
        </div>
      </div>

      {/* Pending Extension Review Notification Banner */}
      {pendingExtensionCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {pendingExtensionCount} Team Deadline Extension Request{pendingExtensionCount > 1 ? 's' : ''} Awaiting Secretariat Adjudication
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Team leaders have submitted formal extension requests with institutional justification. Review appeals below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('pending_extension')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Filter Pending Requests ({pendingExtensionCount})
          </button>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Round 2 Teams Roster & Deadlines
            </h3>
            <span className="text-xs text-slate-400 font-mono">({filteredTeams.length} teams)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search team, institute, leader..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48 sm:w-60"
              />
            </div>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Teams ({r2Teams.length})</option>
              <option value="pending_extension">Pending Extension ({pendingExtensionCount})</option>
              <option value="submitted">Deck Submitted ({submittedCount})</option>
              <option value="unsubmitted">Awaiting Deck ({r2Teams.length - submittedCount})</option>
            </select>

            <select
              value={selectedHub}
              onChange={e => setSelectedHub(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Regional Hubs</option>
              <option value="north">North (FMS Delhi)</option>
              <option value="south">South (IIM Bangalore)</option>
              <option value="east">East (IIM Calcutta)</option>
              <option value="west">West (JBIMS Mumbai)</option>
              <option value="central">Central (IIFM Bhopal)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">Team & Institute</th>
                <th className="p-3">Team Leader</th>
                <th className="p-3">Submission Deadline</th>
                <th className="p-3">Extension Appeal</th>
                <th className="p-3">Submission Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredTeams.map(t => {
                const sub = t.r2Submission;
                const ext = t.extensionRequest;
                const daysLeft = calculateDaysLeft(t.submissionDeadline);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Team */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{t.name}</div>
                      <div className="text-[10px] text-slate-400">{t.instituteName}</div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                        Hub: {t.assignedHub?.toUpperCase() || 'SOUTH'}
                      </div>
                    </td>

                    {/* Leader */}
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{t.leaderName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t.members.find(m => m.isLeader)?.email || `${t.leaderName.toLowerCase().replace(/\s+/g, '.')}@inst.ac.in`}
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="p-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDeadlineDate(t.submissionDeadline)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${daysLeft.color}`}>
                          {daysLeft.text}
                        </span>
                        <button
                          onClick={() => handleOpenEditDeadline(t)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
                        >
                          Modify
                        </button>
                      </div>
                    </td>

                    {/* Extension Status */}
                    <td className="p-3">
                      {ext ? (
                        <div className="space-y-1">
                          {ext.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300">
                              <Clock className="w-3 h-3" />
                              Pending Review (+{ext.requestedExtensionDays}d)
                            </span>
                          )}
                          {ext.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved (+{ext.requestedExtensionDays}d)
                            </span>
                          )}
                          {ext.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300">
                              <XCircle className="w-3 h-3" />
                              Declined
                            </span>
                          )}
                          <div className="text-[10px] text-slate-500 font-medium">
                            Reason: <span className="text-slate-700 dark:text-slate-300">{ext.reasonCategory}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No request</span>
                      )}
                    </td>

                    {/* Submission Status */}
                    <td className="p-3">
                      {sub ? (
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Deck Uploaded
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                            {sub.deckFileName || 'CaseDeck.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {sub.slideCount || 12} slides • {sub.deckFileSize || '14 MB'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                          Awaiting Deck
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {ext?.status === 'PENDING' ? (
                          <button
                            onClick={() => handleOpenReviewModal(t)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Review Appeal
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenEditDeadline(t)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          >
                            Edit Deadline
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Extension Request Modal */}
      {activeExtensionModalTeam && activeExtensionModalTeam.extensionRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Adjudicate Deadline Extension Appeal
                </h3>
              </div>
              <button
                onClick={() => setActiveExtensionModalTeam(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Team details */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Team:</span>
                <strong className="text-slate-800 dark:text-slate-200">{activeExtensionModalTeam.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="text-slate-700 dark:text-slate-300">{activeExtensionModalTeam.instituteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Team Leader:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">
                  {activeExtensionModalTeam.leaderName} ({activeExtensionModalTeam.extensionRequest.leaderEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Deadline:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDeadlineDate(activeExtensionModalTeam.submissionDeadline)}
                </span>
              </div>
            </div>

            {/* Appeal Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Reason Category:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-300">
                  {activeExtensionModalTeam.extensionRequest.reasonCategory}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Circumstances / Explanation</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{activeExtensionModalTeam.extensionRequest.reasonDetails}"
                </p>
                {activeExtensionModalTeam.extensionRequest.supportingDocName && (
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 pt-1 font-mono flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attached: {activeExtensionModalTeam.extensionRequest.supportingDocName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Controls */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Extension Days to Grant:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCustomApprovedDays(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        customApprovedDays === d
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      +{d} Day{d > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Secretariat Remarks / Rationale:
                </label>
                <textarea
                  rows={2}
                  value={reviewRemarks}
                  onChange={e => setReviewRemarks(e.target.value)}
                  placeholder="e.g., Granted based on verified university exam schedule clashes."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleRejectExtension}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200"
              >
                Decline Appeal
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveExtensionModalTeam(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveExtension}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Approve +{customApprovedDays} Days
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Specific Team Deadline Modal */}
      {activeDeadlineEditTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Adjust Submission Deadline
              </h3>
              <button onClick={() => setActiveDeadlineEditTeam(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Set a customized submission cut-off for team <strong className="text-slate-800 dark:text-slate-200">{activeDeadlineEditTeam.name}</strong> ({activeDeadlineEditTeam.instituteName}).
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                New Cut-Off Date & Time (IST):
              </label>
              <input
                type="datetime-local"
                value={newDeadlineInput}
                onChange={e => setNewDeadlineInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveDeadlineEditTeam(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDeadline}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save New Deadline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
