import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { UserProfile, UserRole } from '../../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Building2,
  GraduationCap,
  Download,
  Mail,
  Phone,
  ArrowUpDown,
  FileSpreadsheet,
  Award,
  Eye,
  Check,
  X,
  CreditCard,
  Layers,
} from 'lucide-react';

export const ParticipantsManager: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    verifyUserStudentId,
    updateUserQualification,
    teams,
    institutions,
    quizAttempts,
    addAuditLog,
  } = useCompetition();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstitute, setFilterInstitute] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<'all' | 'verified' | 'pending'>('all');
  const [filterStage, setFilterStage] = useState<'all' | 'r1' | 'r2' | 'r3' | 'r4'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserProfile | null>(null);

  // Form State for Create/Edit User
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [programme, setProgramme] = useState('MBA (Finance & Strategy)');
  const [studentIdCardNumber, setStudentIdCardNumber] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isVerified, setIsVerified] = useState(true);
  const [hasPaidR1R2, setHasPaidR1R2] = useState(true);
  const [quizScore, setQuizScore] = useState<number>(85);
  const [r1Qualified, setR1Qualified] = useState(true);
  const [r2Qualified, setR2Qualified] = useState(false);
  const [r3Qualified, setR3Qualified] = useState(false);
  const [r4Finalist, setR4Finalist] = useState(false);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setMobile('+91 98');
    setInstituteId(institutions[0]?.id || 'inst_1');
    setProgramme('MBA (Strategy & Finance)');
    setStudentIdCardNumber(`ID-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setRole('student');
    setIsVerified(true);
    setHasPaidR1R2(true);
    setQuizScore(80);
    setR1Qualified(true);
    setR2Qualified(false);
    setR3Qualified(false);
    setR4Finalist(false);
    setShowAddUserModal(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setMobile(u.mobile || '');
    setInstituteId(u.instituteId || institutions[0]?.id || '');
    setProgramme(u.programme || '');
    setStudentIdCardNumber(u.studentIdCardNumber || '');
    setRole(u.role);
    setIsVerified(!!u.isVerified);
    setHasPaidR1R2(!!u.hasPaidR1R2);
    setQuizScore(u.quizScore || 0);
    setR1Qualified(!!u.qualificationStatus?.r1Qualified);
    setR2Qualified(!!u.qualificationStatus?.r2Qualified);
    setR3Qualified(!!u.qualificationStatus?.r3Qualified);
    setR4Finalist(!!u.qualificationStatus?.r4Finalist);
    setShowAddUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please fill in candidate name and email.');
      return;
    }

    const payload: Partial<UserProfile> = {
      name,
      email,
      mobile,
      instituteId,
      programme,
      studentIdCardNumber,
      role,
      isVerified,
      hasPaidR1R2,
      quizScore: Number(quizScore),
      quizCompleted: Number(quizScore) > 0,
      qualificationStatus: {
        r1Qualified,
        r2Qualified,
        r3Qualified,
        r4Finalist,
      },
    };

    if (editingUser) {
      updateUser(editingUser.id, payload);
    } else {
      addUser(payload as any);
    }

    setShowAddUserModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['Candidate ID', 'Name', 'Email', 'Mobile', 'Institute ID', 'Programme', 'Student ID Card', 'Verified', 'Paid R1/R2', 'Quiz Score', 'R1 Qualified', 'R2 Qualified', 'R3 Qualified', 'R4 Finalist'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.mobile || '',
      u.instituteId || '',
      `"${u.programme || ''}"`,
      u.studentIdCardNumber || '',
      u.isVerified ? 'YES' : 'NO',
      u.hasPaidR1R2 ? 'PAID' : 'UNPAID',
      u.quizScore || 0,
      u.qualificationStatus?.r1Qualified ? 'YES' : 'NO',
      u.qualificationStatus?.r2Qualified ? 'YES' : 'NO',
      u.qualificationStatus?.r3Qualified ? 'YES' : 'NO',
      u.qualificationStatus?.r4Finalist ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIMA_ICL2026_Participants_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('Participant Roster Exported', 'System', `Super Admin exported CSV for ${filteredUsers.length} participants`);
  };

  // Filtered list
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.mobile && u.mobile.includes(searchQuery)) ||
      (u.studentIdCardNumber && u.studentIdCardNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.programme && u.programme.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInstitute = filterInstitute === 'all' || u.instituteId === filterInstitute;
    const matchesVerification =
      filterVerification === 'all' ||
      (filterVerification === 'verified' && u.isVerified) ||
      (filterVerification === 'pending' && !u.isVerified);

    const matchesPayment =
      filterPayment === 'all' ||
      (filterPayment === 'paid' && u.hasPaidR1R2) ||
      (filterPayment === 'unpaid' && !u.hasPaidR1R2);

    const matchesStage =
      filterStage === 'all' ||
      (filterStage === 'r1' && u.qualificationStatus?.r1Qualified) ||
      (filterStage === 'r2' && u.qualificationStatus?.r2Qualified) ||
      (filterStage === 'r3' && u.qualificationStatus?.r3Qualified) ||
      (filterStage === 'r4' && u.qualificationStatus?.r4Finalist);

    return matchesSearch && matchesInstitute && matchesVerification && matchesPayment && matchesStage;
  });

  const verifiedCount = users.filter(u => u.isVerified).length;
  const paidCount = users.filter(u => u.hasPaidR1R2).length;
  const r1QualifiedCount = users.filter(u => u.qualificationStatus?.r1Qualified).length;
  const r2QualifiedCount = users.filter(u => u.qualificationStatus?.r2Qualified).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Candidate Registry & Participant Master List
            </h2>
            <p className="text-xs text-slate-500">
              Verify student credentials, manage individual stage qualification, audit fee receipts, and register students.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Roster CSV ({filteredUsers.length})</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Candidate</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Enrolled Roster</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {users.length.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Across {institutions.length} AICTE/UGC B-schools
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Verified Student IDs</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {verifiedCount} / {users.length}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {Math.round((verifiedCount / (users.length || 1)) * 100)}% identity compliance
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Fee Paid / Sponsored</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {paidCount} Paid
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            Stage 1 & 2 Access Granted
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>R1 Quiz Qualified</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {r1QualifiedCount} Pass
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            {r2QualifiedCount} Advanced to Stage 3
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, email, college ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Institute Filter */}
          <select
            value={filterInstitute}
            onChange={e => setFilterInstitute(e.target.value)}
            className="text-xs font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">🏢 All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name.length > 25 ? inst.name.slice(0, 25) + '...' : inst.name}
              </option>
            ))}
          </select>

          {/* Verification Filter */}
          <select
            value={filterVerification}
            onChange={e => setFilterVerification(e.target.value as any)}
            className="text-xs font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">🛡️ All Verifications</option>
            <option value="verified">✅ Verified IDs Only</option>
            <option value="pending">⏳ Pending Verification</option>
          </select>

          {/* Stage Qualification */}
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value as any)}
            className="text-xs font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">🏆 All Stages</option>
            <option value="r1">Stage 1: Quiz Pass</option>
            <option value="r2">Stage 2: Case Qualified</option>
            <option value="r3">Stage 3: Regional Hub Finalist</option>
            <option value="r4">Stage 4: Grand Finale Finalist</option>
          </select>

          {/* Payment Status */}
          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value as any)}
            className="text-xs font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">💳 All Payments</option>
            <option value="paid">Paid / Sponsored</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Candidate & Contact</th>
                <th className="py-3.5 px-4">Institution & Programme</th>
                <th className="py-3.5 px-4">Student ID & Badge</th>
                <th className="py-3.5 px-4">Quiz Score / Rank</th>
                <th className="py-3.5 px-4">Stage Status</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No participants found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const inst = institutions.find(i => i.id === u.instituteId);
                  const userTeam = teams.find(t => t.members.some(m => m.studentId === u.id));
                  const isPass = (u.quizScore || 0) >= 75;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isTeamLeader && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  Leader
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{u.email}</span>
                              {u.mobile && <span>• {u.mobile}</span>}
                            </div>
                            {userTeam && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                Team: {userTeam.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {inst ? inst.name : u.instituteId || 'Independent B-School'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {u.programme || 'MBA General'}
                        </div>
                      </td>

                      {/* Student ID & Verification */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                          {u.studentIdCardNumber || 'N/A'}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <button
                            onClick={() => verifyUserStudentId(u.id, !u.isVerified)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                              u.isVerified
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-600'
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-emerald-500/10 hover:text-emerald-600'
                            }`}
                            title={u.isVerified ? 'Click to revoke verification' : 'Click to verify ID card'}
                          >
                            {u.isVerified ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Verify ID</span>
                              </>
                            )}
                          </button>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.hasPaidR1R2
                                ? 'bg-purple-500/10 text-purple-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {u.hasPaidR1R2 ? 'Fee Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </td>

                      {/* Quiz Score */}
                      <td className="py-3.5 px-4">
                        {u.quizScore !== undefined ? (
                          <div>
                            <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.quizScore}/100</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  isPass
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-red-500/10 text-red-600'
                                }`}
                              >
                                {isPass ? 'Pass' : 'Below Cutoff'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Analytical: {Math.round((u.quizScore * 0.4))} pts
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not Attempted</span>
                        )}
                      </td>

                      {/* Stage Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <span
                            onClick={() =>
                              updateUserQualification(u.id, {
                                r1Qualified: !u.qualificationStatus?.r1Qualified,
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                              u.qualificationStatus?.r1Qualified
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                            title="Toggle Stage 1 status"
                          >
                            R1
                          </span>
                          <span
                            onClick={() =>
                              updateUserQualification(u.id, {
                                r2Qualified: !u.qualificationStatus?.r2Qualified,
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                              u.qualificationStatus?.r2Qualified
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                            title="Toggle Stage 2 Case status"
                          >
                            R2
                          </span>
                          <span
                            onClick={() =>
                              updateUserQualification(u.id, {
                                r3Qualified: !u.qualificationStatus?.r3Qualified,
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                              u.qualificationStatus?.r3Qualified
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                            title="Toggle Stage 3 Regional status"
                          >
                            R3
                          </span>
                          <span
                            onClick={() =>
                              updateUserQualification(u.id, {
                                r4Finalist: !u.qualificationStatus?.r4Finalist,
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                              u.qualificationStatus?.r4Finalist
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                            title="Toggle Grand Finale status"
                          >
                            R4
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedUserDetails(u)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title="View Candidate Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title="Edit Candidate Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove candidate ${u.name} from the competition roster?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600"
                            title="Delete Candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingUser ? 'Update Candidate Profile' : 'Enroll New Competition Candidate'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin direct roster registration and stage qualification provisioning.
                </p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sengupta"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. candidate@fms.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Student ID Card No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FMS-2026-889"
                    value={studentIdCardNumber}
                    onChange={e => setStudentIdCardNumber(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Role Perspective
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="student">Student Leader / Member</option>
                    <option value="evaluator">Jury Evaluator</option>
                    <option value="institute_coordinator">Institute Coordinator</option>
                    <option value="regional_hub">Regional Hub Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Institutional Affiliation
                  </label>
                  <select
                    value={instituteId}
                    onChange={e => setInstituteId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enrolled Programme
                  </label>
                  <input
                    type="text"
                    value={programme}
                    onChange={e => setProgramme(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quiz Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizScore}
                    onChange={e => setQuizScore(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chkVerified"
                    checked={isVerified}
                    onChange={e => setIsVerified(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="chkVerified" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Student ID Verified
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chkPaid"
                    checked={hasPaidR1R2}
                    onChange={e => setHasPaidR1R2(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="chkPaid" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Stage Fee Paid / Sponsored
                  </label>
                </div>
              </div>

              {/* Stage Qualification Checkboxes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Stage Qualification Gates:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r1Qualified}
                      onChange={e => setR1Qualified(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>R1 Quiz Pass</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r2Qualified}
                      onChange={e => setR2Qualified(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>R2 Case Deck Pass</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r3Qualified}
                      onChange={e => setR3Qualified(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>R3 Regional Winner</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={r4Finalist}
                      onChange={e => setR4Finalist(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>R4 Grand Finalist</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition"
                >
                  {editingUser ? 'Save Changes' : 'Enroll Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL DRAWER / MODAL */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-base flex items-center justify-center">
                  {selectedUserDetails.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedUserDetails.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUserDetails.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Candidate ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedUserDetails.id}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Student Card ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedUserDetails.studentIdCardNumber || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Institution</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {institutions.find(i => i.id === selectedUserDetails.instituteId)?.name || 'Independent B-School'}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Programme: {selectedUserDetails.programme || 'MBA'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Quiz Score</span>
                  <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                    {selectedUserDetails.quizScore || 0}/100
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">ID Verified</span>
                  <span className="text-xs font-bold text-emerald-600 mt-1 block">
                    {selectedUserDetails.isVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Stage Status</span>
                  <span className="text-xs font-bold text-blue-600 mt-1 block">
                    {selectedUserDetails.qualificationStatus?.r4Finalist
                      ? 'R4 Finale'
                      : selectedUserDetails.qualificationStatus?.r3Qualified
                      ? 'R3 Regional'
                      : selectedUserDetails.qualificationStatus?.r2Qualified
                      ? 'R2 Case'
                      : selectedUserDetails.qualificationStatus?.r1Qualified
                      ? 'R1 Quiz'
                      : 'Enrolled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  const u = selectedUserDetails;
                  setSelectedUserDetails(null);
                  openEditModal(u);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
