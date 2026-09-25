import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  User,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Database,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  fetchInstituteRegistrations,
  fetchParticipantsByRegistration,
  SupabaseParticipantRow,
  SUPABASE_URL,
} from '../../lib/supabase';
import { CSRBootcampRegistration } from '../../types';

interface InstitutionWithParticipants {
  registration: CSRBootcampRegistration;
  participants: SupabaseParticipantRow[];
  isExpanded: boolean;
  isLoadingParticipants: boolean;
}

export const InstitutionsAdminPanel: React.FC = () => {
  const [institutions, setInstitutions] = useState<InstitutionWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncSource, setSyncSource] = useState<'supabase' | 'local'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PENDING_INVOICE'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [copiedCell, setCopiedCell] = useState<string>('');

  const loadInstitutions = async () => {
    setIsLoading(true);
    const result = await fetchInstituteRegistrations();
    setSyncSource(result.source);
    setInstitutions(
      result.registrations.map((reg) => ({
        registration: reg,
        participants: [],
        isExpanded: false,
        isLoadingParticipants: false,
      }))
    );
    setLastRefreshed(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const toggleExpand = async (registrationNumber: string) => {
    setInstitutions((prev) =>
      prev.map((inst) => {
        if (inst.registration.registrationNumber !== registrationNumber) return inst;

        if (!inst.isExpanded && inst.participants.length === 0) {
          // Load participants from Supabase
          const updated = { ...inst, isExpanded: true, isLoadingParticipants: true };
          fetchParticipantsByRegistration(registrationNumber).then((participants) => {
            setInstitutions((current) =>
              current.map((i) =>
                i.registration.registrationNumber === registrationNumber
                  ? { ...i, participants, isLoadingParticipants: false }
                  : i
              )
            );
          });
          return updated;
        }

        return { ...inst, isExpanded: !inst.isExpanded };
      })
    );
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCell(id);
      setTimeout(() => setCopiedCell(''), 2000);
    });
  };

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      const reg = inst.registration;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        reg.organizationName.toLowerCase().includes(query) ||
        reg.registrationNumber.toLowerCase().includes(query) ||
        reg.coordinator?.email.toLowerCase().includes(query) ||
        reg.city?.toLowerCase().includes(query) ||
        reg.state?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || reg.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [institutions, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = institutions.length;
    const paid = institutions.filter((i) => i.registration.paymentStatus === 'PAID').length;
    const pending = total - paid;
    const totalParticipants = institutions.reduce(
      (acc, i) => acc + (i.registration.participantCount || i.registration.nominees?.length || 0),
      0
    );
    return { total, paid, pending, totalParticipants };
  }, [institutions]);

  const handleExportExcel = () => {
    const rows: any[] = [];
    institutions.forEach((inst) => {
      const reg = inst.registration;
      (reg.nominees || []).forEach((nominee) => {
        rows.push({
          'Registration #': reg.registrationNumber,
          'Institution': reg.organizationName,
          'City': reg.city || '',
          'State': reg.state || '',
          'Coordinator Name': reg.coordinator?.name || '',
          'Coordinator Email': reg.coordinator?.email || '',
          'Payment Status': reg.paymentStatus,
          'Invoice #': reg.invoiceNumber,
          'Participant Name': nominee.name,
          'Participant Email': nominee.email,
          'Participant Mobile': nominee.mobile || '',
          'Program': nominee.program || '',
          'Semester': nominee.semester || '',
          'Enrolment #': nominee.enrolmentNumber || '',
          'Is Team Leader': nominee.isTeamLeader ? 'Yes' : 'No',
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Institutions');
    XLSX.writeFile(wb, `AIMA_Institutions_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            Registered Institutions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional registrations from Supabase with participant accounts
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            syncSource === 'supabase'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
          }`}>
            <Database className="w-3 h-3" />
            {syncSource === 'supabase' ? 'Live Supabase' : 'Local Cache'}
          </span>
          <button
            onClick={loadInstitutions}
            disabled={isLoading}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportExcel}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Institutions', value: stats.total, color: 'blue', icon: Building2 },
          { label: 'Payment Confirmed', value: stats.paid, color: 'emerald', icon: CheckCircle2 },
          { label: 'Pending Invoice', value: stats.pending, color: 'amber', icon: Clock },
          { label: 'Total Participants', value: stats.totalParticipants, color: 'purple', icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950/30 border border-${color}-100 dark:border-${color}-900/50`}
          >
            <div className={`flex items-center gap-1.5 text-${color}-600 dark:text-${color}-400 text-xs font-semibold mb-1`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
            <div className={`text-xl font-black text-${color}-700 dark:text-${color}-300`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search institution, registration #, email, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        >
          <option value="all">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING_INVOICE">Pending Invoice</option>
        </select>
      </div>

      {/* Institutions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading institutions from Supabase...</span>
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">No institutions found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {institutions.length === 0
                ? 'No institutional registrations in database yet. Run the SQL setup script first.'
                : 'No results match your filters.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInstitutions.map((inst) => {
            const reg = inst.registration;
            const isPaid = reg.paymentStatus === 'PAID';

            return (
              <div
                key={reg.registrationNumber}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Institution Row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => toggleExpand(reg.registrationNumber)}
                >
                  {/* Expand toggle */}
                  <div className="shrink-0">
                    {inst.isExpanded
                      ? <ChevronDown className="w-4 h-4 text-slate-400" />
                      : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>

                  {/* Institution icon */}
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {reg.organizationName}
                      </span>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-mono">{reg.registrationNumber}</span>
                      {reg.city && <span>{reg.city}, {reg.state}</span>}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {reg.participantCount || reg.nominees?.length || 0} participants
                      </span>
                    </div>
                  </div>

                  {/* Coordinator */}
                  <div className="hidden md:block shrink-0 text-right text-xs">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                      {reg.coordinator?.name}
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                      {reg.coordinator?.email}
                    </div>
                  </div>

                  {/* Invoice number */}
                  <div className="hidden lg:block shrink-0 text-right text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {reg.invoiceNumber}
                  </div>
                </div>

                {/* Expanded: Participants */}
                {inst.isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    {/* Coordinator detail strip */}
                    <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-xs">
                        <div className="text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Coordinator</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">{reg.coordinator?.name}</div>
                        <div className="text-slate-500 dark:text-slate-400">{reg.coordinator?.designation}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Contact</div>
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Mail className="w-3 h-3 text-blue-400" />
                          {reg.coordinator?.email}
                        </div>
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Phone className="w-3 h-3 text-blue-400" />
                          {reg.coordinator?.mobile}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Payment</div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">
                          ₹{reg.totalPayable?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">{reg.invoiceNumber}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Address</div>
                        <div className="text-slate-700 dark:text-slate-300">{reg.city}, {reg.state} – {reg.pinCode}</div>
                      </div>
                    </div>

                    {/* Participants table */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Participants ({reg.nominees?.length || 0})
                        </span>
                        {inst.isLoadingParticipants && (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400 ml-1" />
                        )}
                        {inst.participants.length > 0 && (
                          <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Accounts in Supabase
                          </span>
                        )}
                      </div>

                      {(reg.nominees || []).length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No nominees recorded for this registration.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                                <th className="pb-2 pr-3 font-bold text-slate-500 dark:text-slate-400">#</th>
                                <th className="pb-2 pr-3 font-bold text-slate-500 dark:text-slate-400">Name</th>
                                <th className="pb-2 pr-3 font-bold text-slate-500 dark:text-slate-400">Email / Username</th>
                                <th className="pb-2 pr-3 font-bold text-slate-500 dark:text-slate-400">Mobile</th>
                                <th className="pb-2 pr-3 font-bold text-slate-500 dark:text-slate-400">Program</th>
                                <th className="pb-2 pr-3 font-bold text-slate-500 dark:text-slate-400">Login Account</th>
                                <th className="pb-2 font-bold text-slate-500 dark:text-slate-400">Role</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {(reg.nominees || []).map((nominee, idx) => {
                                const supabaseAccount = inst.participants.find(
                                  (p) => p.email === nominee.email?.toLowerCase()
                                );
                                const copyId = `${reg.registrationNumber}-${idx}`;

                                return (
                                  <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-2 pr-3 text-slate-400">{idx + 1}</td>
                                    <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                                      {nominee.salutation} {nominee.name}
                                    </td>
                                    <td className="py-2 pr-3">
                                      <div className="flex items-center gap-1">
                                        <span className="text-blue-600 dark:text-blue-400 font-mono">{nominee.email}</span>
                                        <button
                                          onClick={() => copyText(nominee.email, copyId + '-email')}
                                          className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors"
                                          title="Copy email"
                                        >
                                          {copiedCell === copyId + '-email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{nominee.mobile || '—'}</td>
                                    <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">
                                      {nominee.program || '—'} {nominee.semester ? `/ Sem ${nominee.semester}` : ''}
                                    </td>
                                    <td className="py-2 pr-3">
                                      {supabaseAccount ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Account Active
                                        </span>
                                      ) : inst.isLoadingParticipants ? (
                                        <span className="text-slate-400 text-[10px]">Checking...</span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                                          <AlertCircle className="w-3 h-3" />
                                          No Account Yet
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2">
                                      {nominee.isTeamLeader ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                                          <Sparkles className="w-3 h-3" />
                                          Leader
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 text-[10px]">Member</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lastRefreshed && (
        <p className="text-[10px] text-slate-400 text-right">
          Last refreshed: {lastRefreshed}
        </p>
      )}
    </div>
  );
};
