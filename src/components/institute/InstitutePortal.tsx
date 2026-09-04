import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  Award,
  Building,
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  IndianRupee,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UserCheck,
  Users
} from 'lucide-react';

export const InstitutePortal: React.FC = () => {
  const { institutions, currentUser, teams } = useCompetition();
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'qualified'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isBulkPaid, setIsBulkPaid] = useState(false);

  const defaultRoster = [
    { id: 's1', name: 'Aarav Singhania', studentId: 'IIMB-PGP-25-089', email: 'aarav.singhania@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 92 },
    { id: 's2', name: 'Meera Nambiar', studentId: 'IIMB-PGP-25-112', email: 'meera.nambiar@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 88 },
    { id: 's3', name: 'Kunal Deshpande', studentId: 'IIMB-PGP-25-045', email: 'kunal.d@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 91 },
    { id: 's4', name: 'Sneha Venkatesh', studentId: 'IIMB-PGP-25-134', email: 'sneha.v@iimb.ac.in', teamName: 'StratApex Consultants', feePaid: true, r1Score: 89 },
    { id: 's5', name: 'Rohan Sharma', studentId: 'IIMB-PGP-25-067', email: 'rohan.s@iimb.ac.in', teamName: 'Vanguard Strategy', feePaid: false, r1Score: 78 },
    { id: 's6', name: 'Priya Iyer', studentId: 'IIMB-PGP-25-023', email: 'priya.i@iimb.ac.in', teamName: 'Vanguard Strategy', feePaid: false, r1Score: 84 },
    { id: 's7', name: 'Varun Reddy', studentId: 'IIMB-PGP-25-156', email: 'varun.r@iimb.ac.in', teamName: 'Southern Titans', feePaid: true, r1Score: 86 },
    { id: 's8', name: 'Divya Nair', studentId: 'IIMB-PGP-25-178', email: 'divya.n@iimb.ac.in', teamName: 'Southern Titans', feePaid: true, r1Score: 90 },
  ];

  // Filtered mock roster
  const filteredRoster = defaultRoster.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'paid') return matchesSearch && s.feePaid;
    if (statusFilter === 'unpaid') return matchesSearch && !s.feePaid;
    if (statusFilter === 'qualified') return matchesSearch && s.r1Score && s.r1Score >= 65;
    return matchesSearch;
  });

  const unpaidCount = defaultRoster.filter(s => !s.feePaid).length;
  const totalUnpaidAmount = unpaidCount * 200;

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

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Student Roster (CSV)</span>
            </button>
            <DocRequirementInfo specKey="institute_bulk_upload" variant="icon" size="xs" colorTheme="slate" />
          </div>
          
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => alert(`Downloading consolidated B2B GST Tax Invoice for ${inst.name} (GSTIN: 29AABCI1234F1Z9). Total ₹25,600 settled.`)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>GST Tax Invoice (PDF)</span>
            </button>
            <DocRequirementInfo specKey="institute_gst_invoice" variant="icon" size="xs" colorTheme="slate" />
          </div>
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
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Formed Teams</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">{inst.teamsCreated || 34} Teams</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">100% Roster Compliance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 1 Qualified</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{inst.registeredStudents || 128}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">91.4% Institute Pass Rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Regional Finalists</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">8 Teams</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Assigned to South Hub</span>
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

      {/* Student Roster Table */}
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

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
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
