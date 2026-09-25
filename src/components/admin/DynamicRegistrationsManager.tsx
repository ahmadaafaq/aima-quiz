import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  CSRBootcampRegistration,
  CSRBootcampNominee
} from '../../types';
import {
  fetchRegistrationsFromSupabase,
  updateRegistrationPaymentInSupabase,
  SUPABASE_URL,
  SUPABASE_SQL_SETUP_SCRIPT
} from '../../lib/supabase';
import { AimaInvoiceModal } from '../registration/AimaInvoiceModal';
import {
  Database,
  Search,
  RefreshCw,
  Download,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  KeyRound,
  Copy,
  Receipt,
  Eye,
  Building2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Code,
  Check,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface DynamicRegistrationsManagerProps {
  initialRegistrations?: CSRBootcampRegistration[];
}

export const DynamicRegistrationsManager: React.FC<DynamicRegistrationsManagerProps> = ({
  initialRegistrations = [],
}) => {
  const [registrations, setRegistrations] = useState<CSRBootcampRegistration[]>(initialRegistrations);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [syncSource, setSyncSource] = useState<'supabase' | 'local'>('local');
  const [tableExists, setTableExists] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'individual' | 'institute'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PENDING_INVOICE'>('all');

  // Modals
  const [activeNomineesModal, setActiveNomineesModal] = useState<CSRBootcampRegistration | null>(null);
  const [activeInvoiceReg, setActiveInvoiceReg] = useState<CSRBootcampRegistration | null>(null);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedLogins, setCopiedLogins] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Load from Supabase on mount
  const loadSupabaseData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await fetchRegistrationsFromSupabase();
      setRegistrations(result.registrations);
      setSyncSource(result.source);
      setTableExists(result.tableExists);
      if (result.error && !result.tableExists) {
        setErrorMessage(result.error);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to fetch from Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        reg.registrationNumber.toLowerCase().includes(query) ||
        reg.organizationName.toLowerCase().includes(query) ||
        reg.contactPersonName.toLowerCase().includes(query) ||
        reg.emailAddress.toLowerCase().includes(query) ||
        (reg.teamName && reg.teamName.toLowerCase().includes(query)) ||
        reg.nominees?.some((n) => n.name.toLowerCase().includes(query) || n.email.toLowerCase().includes(query));

      const isInst = reg.track === 'institutional' || reg.organizationType === 'Academic Institution';
      const matchesMode =
        modeFilter === 'all' ||
        (modeFilter === 'institute' && isInst) ||
        (modeFilter === 'individual' && !isInst);

      const matchesStatus = statusFilter === 'all' || reg.paymentStatus === statusFilter;

      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [registrations, searchQuery, modeFilter, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalRegs = registrations.length;
    const paidRegs = registrations.filter((r) => r.paymentStatus === 'PAID').length;
    const pendingRegs = registrations.filter((r) => r.paymentStatus !== 'PAID').length;
    const totalCandidates = registrations.reduce((acc, r) => acc + (r.participantCount || r.nominees?.length || 1), 0);
    const totalRevenue = registrations.reduce((acc, r) => acc + (r.paymentStatus === 'PAID' ? r.totalPayable : 0), 0);

    return { totalRegs, paidRegs, pendingRegs, totalCandidates, totalRevenue };
  }, [registrations]);

  // Toggle Payment Status
  const handleTogglePaymentStatus = async (reg: CSRBootcampRegistration) => {
    const nextStatus = reg.paymentStatus === 'PAID' ? 'PENDING_INVOICE' : 'PAID';
    const txnId = nextStatus === 'PAID' ? reg.transactionId || 'MANUAL-AIMA-' + Date.now().toString(36).toUpperCase() : undefined;

    // Optimistic update
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === reg.id || r.registrationNumber === reg.registrationNumber
          ? {
              ...r,
              paymentStatus: nextStatus,
              transactionId: txnId,
              invoiceNumber: nextStatus === 'PAID' ? r.invoiceNumber.replace('PINV-', 'INV-') : r.invoiceNumber,
            }
          : r
      )
    );

    await updateRegistrationPaymentInSupabase(reg.registrationNumber, nextStatus, reg.paymentMethod || 'gateway', txnId);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const rows = registrations.flatMap((reg) => {
      const isInst = reg.track === 'institutional' || reg.organizationType === 'Academic Institution';
      if (!reg.nominees || reg.nominees.length === 0) {
        return [
          {
            'Registration No.': reg.registrationNumber,
            'Registration Mode': isInst ? 'Institute' : 'Individual',
            'Institute Name': reg.organizationName,
            'Team Name': reg.teamName || 'N/A',
            'Participant Name': reg.contactPersonName,
            'Participant Email': reg.emailAddress,
            'Mobile': reg.mobileNumber,
            'Enrolment No': 'N/A',
            'Quiz Password': 'AimaQuiz@2026',
            'Payment Status': reg.paymentStatus,
            'Total Fee (INR)': reg.totalPayable,
            'Date Created': new Date(reg.createdAt).toLocaleDateString('en-IN'),
          },
        ];
      }

      return reg.nominees.map((nom, i) => ({
        'Registration No.': reg.registrationNumber,
        'Registration Mode': isInst ? 'Institute' : 'Individual',
        'Institute Name': reg.organizationName,
        'Team Name': reg.teamName || 'N/A',
        'Participant #': i + 1,
        'Participant Name': nom.name,
        'Role': nom.isTeamLeader ? 'Team Leader' : 'Nominee',
        'Participant Email': nom.email,
        'Mobile': nom.mobile,
        'DOB': nom.dob || 'N/A',
        'Gender': nom.gender || 'N/A',
        'Program / Course': nom.program || 'N/A',
        'Semester / Year': nom.semester || 'N/A',
        'Enrolment No': nom.enrolmentNumber || 'N/A',
        'Quiz Login Password': nom.password || 'AimaQuiz@2026',
        'Payment Status': reg.paymentStatus,
        'Total Fee (INR)': reg.totalPayable,
        'Date Created': new Date(reg.createdAt).toLocaleDateString('en-IN'),
      }));
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Supabase_Registrations');
    XLSX.writeFile(wb, `AIMA_CaseLeague_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Copy Nominees Logins
  const handleCopyNomineeLogins = (reg: CSRBootcampRegistration) => {
    const text = (reg.nominees || [])
      .map(
        (n, i) =>
          `[${i + 1}] ${n.name}\nEmail/Login: ${n.email}\nEnrolment: ${n.enrolmentNumber || 'N/A'}\nQuiz Password: ${n.password || 'AimaQuiz@2026'}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogins(true);
    setTimeout(() => setCopiedLogins(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Dynamic Sync</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Refreshed: {lastRefreshed}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Case League Registrations Master
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time candidate nominations, institutional cohorts, quiz access credentials, and GST invoicing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadSupabaseData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Supabase'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Roster (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="View Supabase SQL Table Schema"
          >
            <Code className="w-3.5 h-3.5" />
            <span>SQL Schema</span>
          </button>
        </div>
      </div>

      {/* Supabase Status Banner */}
      {!tableExists && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Supabase Database Notice: </span>
              <span>
                Connected to Supabase project (<code className="font-mono text-[11px]">{SUPABASE_URL}</code>). Registrations are actively stored in high-performance local memory and ready to sync to the <code className="font-mono text-[11px]">registrations</code> table.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
          >
            Run SQL in Supabase
          </button>
        </div>
      )}

      {/* Aggregate KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Total Registrations
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalRegs}
            </span>
            <span className="text-[10px] text-blue-600 font-bold">
              {registrations.filter((r) => r.track === 'institutional').length} Inst
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Nominated Candidates
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.totalCandidates}
            </span>
            <span className="text-[10px] text-slate-500">Active Logins</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Paid &amp; Cleared
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.paidRegs}
            </span>
            <span className="text-[10px] text-amber-500 font-bold">
              {stats.pendingRegs} Pending
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Gross Fee Cleared
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{(stats.totalRevenue / 1000).toFixed(0)}k
            </span>
            <span className="text-[10px] text-slate-500">Incl. GST</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Name, Institute, Email or Team..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Mode Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setModeFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              modeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Tracks
          </button>
          <button
            type="button"
            onClick={() => setModeFilter('individual')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              modeFilter === 'individual'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => setModeFilter('institute')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              modeFilter === 'institute'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Institutes
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Status
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PAID')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'PAID'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Paid
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING_INVOICE')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'PENDING_INVOICE'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Registrations Dynamic Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Registration ID</th>
                <th className="py-3.5 px-4">Mode / Squad</th>
                <th className="py-3.5 px-4">Candidate / Coordinator</th>
                <th className="py-3.5 px-4">Institution</th>
                <th className="py-3.5 px-4 text-center">Headcount</th>
                <th className="py-3.5 px-4 text-right">Fee (Incl. GST)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Database className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold">No registrations match current filter.</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const isInst = reg.track === 'institutional' || reg.organizationType === 'Academic Institution';
                  const isPaid = reg.paymentStatus === 'PAID';

                  return (
                    <tr
                      key={reg.id || reg.registrationNumber}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-black text-blue-600 dark:text-blue-400">
                          {reg.registrationNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Mode / Squad */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isInst
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                          }`}
                        >
                          {isInst ? 'Institutional' : reg.teamName ? 'Team Delegation' : 'Solo Candidate'}
                        </span>
                        {reg.teamName && (
                          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] mt-0.5">
                            {reg.teamName}
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {reg.contactPersonName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {reg.emailAddress}
                        </div>
                      </td>

                      {/* Institute */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={reg.organizationName}>
                        {reg.organizationName}
                      </td>

                      {/* Headcount */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveNomineesModal(reg)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs cursor-pointer transition-colors"
                          title="Click to view all participants & quiz logins"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{reg.participantCount || reg.nominees?.length || 1}</span>
                        </button>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-black text-slate-900 dark:text-white">
                          ₹{reg.totalPayable.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {reg.tierName || reg.tierId || 'Nomination'}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePaymentStatus(reg)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                          title="Click to toggle payment status"
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                          <span>{isPaid ? 'PAID' : 'PENDING'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveNomineesModal(reg)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                            title="View Quiz Login Credentials"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveInvoiceReg(reg)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                            title="View Official GST Invoice / Proforma"
                          >
                            <Receipt className="w-4 h-4" />
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

      {/* MODAL 1: CANDIDATE QUIZ CREDENTIALS VAULT */}
      {activeNomineesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {activeNomineesModal.registrationNumber} • {activeNomineesModal.organizationName}
                </div>
                <h3 className="text-base font-bold text-white">
                  Participant Quiz Login Credentials Vault
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNomineesModal(null)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {activeNomineesModal.nominees?.length || 1} Nominee(s) Registered
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyNomineeLogins(activeNomineesModal)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLogins ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLogins ? 'Copied' : 'Copy All Logins'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {(activeNomineesModal.nominees && activeNomineesModal.nominees.length > 0
                  ? activeNomineesModal.nominees
                  : [
                      {
                        id: 'lead',
                        name: activeNomineesModal.contactPersonName,
                        email: activeNomineesModal.emailAddress,
                        mobile: activeNomineesModal.mobileNumber,
                        password: 'AimaQuiz@2026',
                        isTeamLeader: true,
                      },
                    ]
                ).map((nom, idx) => (
                  <div
                    key={nom.id || idx}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {idx + 1}. {nom.name}
                      </span>
                      {nom.isTeamLeader && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          Leader
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>
                        Email (Login): <strong className="font-mono text-slate-900 dark:text-white">{nom.email}</strong>
                      </div>
                      <div>
                        Quiz Password: <strong className="font-mono text-amber-600 dark:text-amber-400">{nom.password || 'AimaQuiz@2026'}</strong>
                      </div>
                      <div>
                        Mobile: <strong>{nom.mobile || 'N/A'}</strong>
                      </div>
                      <div>
                        Enrolment: <strong className="font-mono">{nom.enrolmentNumber || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveNomineesModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INVOICE / RECEIPT MODAL */}
      <AimaInvoiceModal
        isOpen={!!activeInvoiceReg}
        onClose={() => setActiveInvoiceReg(null)}
        registration={activeInvoiceReg}
      />

      {/* MODAL 3: SUPABASE SQL TABLE SETUP HELPER */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-black text-sm">Supabase Database Setup Script</h3>
                  <p className="text-[11px] text-slate-400">
                    Run this SQL in your Supabase SQL Editor (<code className="font-mono">{SUPABASE_URL}</code>)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  SQL Table DDL &amp; Row Level Security Policy:
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                {SUPABASE_SQL_SETUP_SCRIPT}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <a
                href={`${SUPABASE_URL.replace('.supabase.co', '')}/sql`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
