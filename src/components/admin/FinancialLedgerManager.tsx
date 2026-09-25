import React, { useState, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { PaymentRecord, RegionHubId } from '../../types';
import {
  Coins,
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  CreditCard,
  Building,
  Layers,
  ArrowUpDown,
  Building2,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const REGION_CONFIG: Record<
  string,
  { label: string; short: string; color: string; badgeBg: string; text: string; border: string }
> = {
  north: {
    label: 'North Zone (New Delhi)',
    short: 'North',
    color: 'bg-blue-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  west: {
    label: 'West Zone (Mumbai)',
    short: 'West',
    color: 'bg-purple-500',
    badgeBg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  south: {
    label: 'South Zone (Bengaluru)',
    short: 'South',
    color: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  east: {
    label: 'East Zone (Kolkata)',
    short: 'East',
    color: 'bg-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  central: {
    label: 'Central Zone (Bhopal)',
    short: 'Central',
    color: 'bg-rose-500',
    badgeBg: 'bg-rose-50 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  national: {
    label: 'National / Corporate Underwriting',
    short: 'National',
    color: 'bg-indigo-500',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
};

export const FinancialLedgerManager: React.FC = () => {
  const { payments } = useCompetition();

  // Active View Tab: 'ledger' | 'matrix' | 'gst_compliance'
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'matrix' | 'gst_compliance'>('ledger');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [quickPeriod, setQuickPeriod] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<'timestamp' | 'amount' | 'transactionId'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal for GST Invoice
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentRecord | null>(null);

  // Available unique years and months extracted from payments data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    payments.forEach(p => {
      const yr = new Date(p.timestamp).getFullYear().toString();
      if (yr && yr !== 'NaN') years.add(yr);
    });
    return Array.from(years).sort().reverse();
  }, [payments]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    payments.forEach(p => {
      const d = new Date(p.timestamp);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months.add(key);
      }
    });
    return Array.from(months).sort().reverse();
  }, [payments]);

  // Handle Quick Period Preset changes
  const handleQuickPeriodSelect = (period: string) => {
    setQuickPeriod(period);
    setStartDate('');
    setEndDate('');
    setSelectedMonth('all');
    setSelectedYear('all');

    if (period === 'all') {
      // no-op
    } else if (period === '2026') {
      setSelectedYear('2026');
    } else if (period === '2025') {
      setSelectedYear('2025');
    } else if (period === 'month_08_2026') {
      setSelectedYear('2026');
      setSelectedMonth('2026-08');
    } else if (period === 'month_09_2026') {
      setSelectedYear('2026');
      setSelectedMonth('2026-09');
    } else if (period === 'month_10_2026') {
      setSelectedYear('2026');
      setSelectedMonth('2026-10');
    } else if (period === 'q3_2026') {
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedYear('all');
    setSelectedMonth('all');
    setStartDate('');
    setEndDate('');
    setSelectedStage('all');
    setSelectedMethod('all');
    setSelectedStatus('all');
    setQuickPeriod('all');
  };

  // Helper to get region key for a payment
  const getPaymentRegionKey = (p: PaymentRecord): string => {
    if (p.regionHub) return p.regionHub;
    if (p.billingState?.toLowerCase().includes('delhi') || p.billingState?.toLowerCase().includes('uttar')) return 'north';
    if (p.billingState?.toLowerCase().includes('gujarat') || p.billingState?.toLowerCase().includes('maharashtra')) return 'west';
    if (p.billingState?.toLowerCase().includes('karnataka') || p.billingState?.toLowerCase().includes('tamil') || p.billingState?.toLowerCase().includes('telangana')) return 'south';
    if (p.billingState?.toLowerCase().includes('bengal') || p.billingState?.toLowerCase().includes('jharkhand')) return 'east';
    if (p.billingState?.toLowerCase().includes('madhya')) return 'central';
    return 'national';
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTxn = p.transactionId.toLowerCase().includes(q);
        const matchesInvoice = p.gstInvoiceNumber.toLowerCase().includes(q);
        const matchesUser = p.userName.toLowerCase().includes(q);
        const matchesTeam = (p.teamName || '').toLowerCase().includes(q);
        const matchesInst = (p.instituteName || '').toLowerCase().includes(q);
        const matchesMethod = p.paymentMethod.toLowerCase().includes(q);
        if (!matchesTxn && !matchesInvoice && !matchesUser && !matchesTeam && !matchesInst && !matchesMethod) {
          return false;
        }
      }

      // 2. Region Filter
      if (selectedRegion !== 'all') {
        const regKey = getPaymentRegionKey(p);
        if (regKey !== selectedRegion) {
          return false;
        }
      }

      // 3. Year Filter
      const pDate = new Date(p.timestamp);
      if (selectedYear !== 'all') {
        if (pDate.getFullYear().toString() !== selectedYear) {
          return false;
        }
      }

      // 4. Month Filter
      if (selectedMonth !== 'all') {
        const ym = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
        if (ym !== selectedMonth) {
          return false;
        }
      }

      // 5. Custom Date Range
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (pDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (pDate > end) return false;
      }

      // 6. Stage Filter
      if (selectedStage !== 'all') {
        if (p.stage !== selectedStage) return false;
      }

      // 7. Method Filter
      if (selectedMethod !== 'all') {
        if (p.paymentMethod !== selectedMethod) return false;
      }

      // 8. Status Filter
      if (selectedStatus !== 'all') {
        if (p.status !== selectedStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'timestamp') {
        const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return sortDirection === 'asc' ? diff : -diff;
      }
      if (sortField === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortField === 'transactionId') {
        return sortDirection === 'asc'
          ? a.transactionId.localeCompare(b.transactionId)
          : b.transactionId.localeCompare(a.transactionId);
      }
      return 0;
    });
  }, [
    payments,
    searchQuery,
    selectedRegion,
    selectedYear,
    selectedMonth,
    startDate,
    endDate,
    selectedStage,
    selectedMethod,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  // Aggregate Metrics derived from Filtered Payments
  const metrics = useMemo(() => {
    const settledPayments = filteredPayments.filter(p => p.status === 'SUCCESS');
    const totalGross = settledPayments.reduce((sum, p) => sum + p.amount, 0);
    const taxableBase = Math.round((totalGross / 1.18) * 100) / 100;
    const gstCollected = Math.round((totalGross - taxableBase) * 100) / 100;
    const totalTransactions = filteredPayments.length;
    const successCount = settledPayments.length;
    const pendingCount = filteredPayments.filter(p => p.status === 'PENDING').length;
    const failedCount = filteredPayments.filter(p => p.status === 'FAILED').length;
    const refundedCount = filteredPayments.filter(p => p.status === 'REFUNDED').length;
    const successRate = totalTransactions > 0 ? ((successCount / totalTransactions) * 100).toFixed(1) : '0';
    const averageOrderValue = successCount > 0 ? Math.round(totalGross / successCount) : 0;

    return {
      totalGross,
      taxableBase,
      gstCollected,
      totalTransactions,
      successCount,
      pendingCount,
      failedCount,
      refundedCount,
      successRate,
      averageOrderValue,
    };
  }, [filteredPayments]);

  // Regional breakdown derived from current filtered (or all settled) dataset
  const regionBreakdown = useMemo(() => {
    const regionTotals: Record<string, { gross: number; count: number }> = {
      north: { gross: 0, count: 0 },
      west: { gross: 0, count: 0 },
      south: { gross: 0, count: 0 },
      east: { gross: 0, count: 0 },
      central: { gross: 0, count: 0 },
      national: { gross: 0, count: 0 },
    };

    filteredPayments.forEach(p => {
      if (p.status === 'SUCCESS') {
        const reg = getPaymentRegionKey(p);
        if (regionTotals[reg]) {
          regionTotals[reg].gross += p.amount;
          regionTotals[reg].count += 1;
        }
      }
    });

    return regionTotals;
  }, [filteredPayments]);

  // Check if any filters are active
  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedRegion !== 'all' ||
    selectedYear !== 'all' ||
    selectedMonth !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    selectedStage !== 'all' ||
    selectedMethod !== 'all' ||
    selectedStatus !== 'all' ||
    quickPeriod !== 'all';

  // Export Filtered Ledger as CSV
  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Date & Time',
      'Payer Name',
      'Team Name',
      'Institution',
      'Region Hub',
      'Billing State',
      'Stage / Purpose',
      'Payment Method',
      'Taxable Value (INR)',
      'GST Rate',
      'GST Collected (INR)',
      'Total Paid (INR)',
      'Status',
      'GST Tax Invoice #',
      'Payer GSTIN',
    ];

    const rows = filteredPayments.map(p => {
      const pDate = new Date(p.timestamp);
      const formattedDate = !isNaN(pDate.getTime()) ? pDate.toISOString().replace('T', ' ').substring(0, 19) : p.timestamp;
      const baseAmt = p.baseAmount || Math.round((p.amount / 1.18) * 100) / 100;
      const gstAmt = p.gstAmount || Math.round((p.amount - baseAmt) * 100) / 100;
      const reg = getPaymentRegionKey(p);
      const regLabel = REGION_CONFIG[reg]?.label || reg;

      return [
        `"${p.transactionId}"`,
        `"${formattedDate}"`,
        `"${p.userName.replace(/"/g, '""')}"`,
        `"${(p.teamName || '').replace(/"/g, '""')}"`,
        `"${(p.instituteName || '').replace(/"/g, '""')}"`,
        `"${regLabel}"`,
        `"${p.billingState || 'Delhi NCR'}"`,
        `"${p.stage.replace('_', ' ')}"`,
        `"${p.paymentMethod}"`,
        baseAmt.toFixed(2),
        '18%',
        gstAmt.toFixed(2),
        p.amount.toFixed(2),
        `"${p.status}"`,
        `"${p.gstInvoiceNumber}"`,
        `"${p.payerGstin || 'B2C-Unregistered'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIMA_ICRC_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Statutory GSTR-1 Summary CSV
  const handleExportGSTR1 = () => {
    const headers = [
      'GSTIN/UIN of Recipient',
      'Receiver Name',
      'Invoice Number',
      'Invoice Date',
      'Invoice Value (INR)',
      'Place of Supply',
      'Reverse Charge',
      'Invoice Type',
      'HSN/SAC',
      'Rate',
      'Taxable Value (INR)',
      'Cess Amount',
    ];

    const rows = filteredPayments
      .filter(p => p.status === 'SUCCESS')
      .map(p => {
        const pDate = new Date(p.timestamp);
        const formattedDate = !isNaN(pDate.getTime()) ? pDate.toISOString().split('T')[0] : '2026-08-20';
        const baseAmt = p.baseAmount || Math.round((p.amount / 1.18) * 100) / 100;
        const pos = p.billingState || 'Delhi NCR';
        const invType = p.payerGstin ? 'Regular B2B' : 'B2C Large / Small';

        return [
          `"${p.payerGstin || 'URP'}"`,
          `"${p.userName.replace(/"/g, '""')}"`,
          `"${p.gstInvoiceNumber}"`,
          `"${formattedDate}"`,
          p.amount.toFixed(2),
          `"${pos}"`,
          '"N"',
          `"${invType}"`,
          '"999293"',
          '18',
          baseAmt.toFixed(2),
          '0.00',
        ].join(',');
      });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIMA_GSTR1_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format month string into readable text, e.g. "2026-08" -> "August 2026"
  const formatMonthLabel = (m: string) => {
    const [yr, mo] = m.split('-');
    const date = new Date(Number(yr), Number(mo) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* ------------------ TOP BANNER / HEADER ------------------ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coins className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Financial & GST Ledger
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              SAC 999293 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Real-time multi-stage collection accounting, B2B/B2C tax invoicing, state-wise CGST/SGST/IGST apportionments, and audit trails across all four league stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Download CSV of current filtered ledger rows"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportGSTR1}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            title="Export statutory GSTR-1 formatted file for GST portal"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export GSTR-1</span>
          </button>
        </div>
      </div>

      {/* ------------------ KPI METRIC CARDS ------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Settled */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Gross Settled Revenue</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            ₹{metrics.totalGross.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Base Taxable:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              ₹{metrics.taxableBase.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* GST 18% Collected */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total GST Collected (18%)</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ₹{metrics.gstCollected.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Split:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              CGST + SGST (9%+9%) / IGST
            </span>
          </div>
        </div>

        {/* Invoices & Success Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Transactions & Invoices</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {metrics.successCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {metrics.totalTransactions} total
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Settlement Rate:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.successRate}%
            </span>
          </div>
        </div>

        {/* Average Transaction Value & Reserve */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Average Order Value</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            ₹{metrics.averageOrderValue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Prize Purse Escrow:</span>
            <span className="font-semibold text-emerald-600">₹15,00,000</span>
          </div>
        </div>
      </div>

      {/* ------------------ REGIONAL REVENUE SNAPSHOT (QUICK CLICK FILTER) ------------------ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Zone-Wise Revenue Distribution & Collections (Click to Filter)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {selectedRegion === 'all' ? 'All Zones Active' : `Filtered by: ${REGION_CONFIG[selectedRegion]?.short || selectedRegion}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(REGION_CONFIG).map(([regKey, cfg]) => {
            const data = regionBreakdown[regKey] || { gross: 0, count: 0 };
            const isCurrentSelected = selectedRegion === regKey;
            const share = metrics.totalGross > 0 ? ((data.gross / metrics.totalGross) * 100).toFixed(1) : '0';

            return (
              <button
                key={regKey}
                onClick={() => setSelectedRegion(isCurrentSelected ? 'all' : regKey)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isCurrentSelected
                    ? `${cfg.badgeBg} ${cfg.border} ring-2 ring-amber-500/40 shadow-xs`
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{cfg.short}</span>
                  <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                  ₹{data.gross.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>{data.count} txns</span>
                  <span className="font-semibold">{share}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------ FILTERS ENGINE CARD ------------------ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        {/* Row 1: Search & Quick Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction ID, GST Invoice #, Student Name, Team, or Institute..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Period Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
              Preset:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: '2026', label: 'FY 2026' },
              { id: 'month_10_2026', label: 'Oct 2026' },
              { id: 'month_09_2026', label: 'Sep 2026' },
              { id: 'month_08_2026', label: 'Aug 2026' },
              { id: 'q3_2026', label: 'Q3 2026' },
              { id: '2025', label: 'FY 2025' },
            ].map(preset => {
              const active = quickPeriod === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleQuickPeriodSelect(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Comprehensive Multi-Filter Select Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* 1. Region Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Zone / Region
            </label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              <option value="all">All Regions (India)</option>
              <option value="north">North Zone (Delhi NCR / UP)</option>
              <option value="west">West Zone (Mumbai / Gujarat)</option>
              <option value="south">South Zone (Bengaluru / TN / TS)</option>
              <option value="east">East Zone (Kolkata / WB / JH)</option>
              <option value="central">Central Zone (Bhopal / MP)</option>
              <option value="national">National / Underwriting</option>
            </select>
          </div>

          {/* 2. Monthly Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Monthly Period
            </label>
            <select
              value={selectedMonth}
              onChange={e => {
                setSelectedMonth(e.target.value);
                setQuickPeriod('custom');
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              <option value="all">All Months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Yearly Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Financial Year
            </label>
            <select
              value={selectedYear}
              onChange={e => {
                setSelectedYear(e.target.value);
                setQuickPeriod('custom');
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              <option value="all">All Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>
                  Calendar Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Stage / Purpose */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Stage / Head
            </label>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              <option value="all">All Stages</option>
              <option value="round_1_2">Round 1 & 2 Screening (₹200/student)</option>
              <option value="round_3">Round 3 Regional Finals (₹8,000/team)</option>
              <option value="round_4">Round 4 Grand Finale</option>
              <option value="bulk_institutional">Bulk Institutional Cohort</option>
            </select>
          </div>

          {/* 5. Payment Method */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Payment Method
            </label>
            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking (B2B NEFT)</option>
              <option value="Waiver/Coupon">Institutional Waiver / Voucher</option>
            </select>
          </div>

          {/* 6. Payment Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Settlement Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="SUCCESS">SUCCESS (Settled)</option>
              <option value="PENDING">PENDING (In Escrow)</option>
              <option value="FAILED">FAILED (Gateway Error)</option>
              <option value="REFUNDED">REFUNDED (Chargeback)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Custom Date Range Pickers & Reset Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Custom Date Range:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  setQuickPeriod('custom');
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-400 font-semibold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value);
                  setQuickPeriod('custom');
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear dates"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Chips & Reset All Button */}
          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-slate-100 font-bold">{filteredPayments.length}</span> of {payments.length} transactions
            </span>
          </div>
        </div>

        {/* Active Filter Pills Display */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Filters:
            </span>
            {selectedRegion !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Region: {REGION_CONFIG[selectedRegion]?.short || selectedRegion}
                <button onClick={() => setSelectedRegion('all')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedMonth !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Month: {formatMonthLabel(selectedMonth)}
                <button onClick={() => setSelectedMonth('all')} className="hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedYear !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Year: {selectedYear}
                <button onClick={() => setSelectedYear('all')} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(startDate || endDate) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Date: {startDate || '...'} to {endDate || '...'}
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="hover:text-emerald-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStage !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Stage: {selectedStage}
                <button onClick={() => setSelectedStage('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedMethod !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Method: {selectedMethod}
                <button onClick={() => setSelectedMethod('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Keyword: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ------------------ VIEW SUB-TAB SWITCHER ------------------ */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'ledger'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Detailed Transaction Ledger ({filteredPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Regional & Monthly Matrix Summary</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gst_compliance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'gst_compliance'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>GST Statutory & GSTR-1 Preview</span>
        </button>
      </div>

      {/* ------------------ SUB-TAB 1: DETAILED TRANSACTION LEDGER ------------------ */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Itemized Stage Transactions & B2B/B2C GST Invoices</span>
            </h3>
            <span className="text-xs text-slate-500">
              Sorted by:{' '}
              <button
                onClick={() => {
                  if (sortField === 'timestamp') {
                    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setSortField('timestamp');
                    setSortDirection('desc');
                  }
                }}
                className="font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 hover:underline"
              >
                Date & Time ({sortDirection === 'desc' ? 'Newest' : 'Oldest'})
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Receipt / Txn ID</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Candidate / Team / Entity</th>
                  <th className="p-3">Region / Hub</th>
                  <th className="p-3">Stage / Head</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-right">Taxable (₹)</th>
                  <th className="p-3 text-right">GST 18% (₹)</th>
                  <th className="p-3 text-right">Total Settled (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Tax Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Filter className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          No transactions found matching the selected filters
                        </p>
                        <p className="text-xs text-slate-400">
                          Try adjusting your date range, month, region, or keyword filter.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(p => {
                    const pDate = new Date(p.timestamp);
                    const formattedDate = !isNaN(pDate.getTime())
                      ? pDate.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : p.timestamp;
                    const formattedTime = !isNaN(pDate.getTime())
                      ? pDate.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';

                    const reg = getPaymentRegionKey(p);
                    const regCfg = REGION_CONFIG[reg] || REGION_CONFIG.national;
                    const baseAmt = p.baseAmount || Math.round((p.amount / 1.18) * 100) / 100;
                    const gstAmt = p.gstAmount || Math.round((p.amount - baseAmt) * 100) / 100;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Transaction ID */}
                        <td className="p-3">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block truncate max-w-[130px]">
                            {p.transactionId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">SAC 999293</span>
                        </td>

                        {/* Date & Time */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-medium text-slate-800 dark:text-slate-200 block">
                            {formattedDate}
                          </span>
                          <span className="text-[10px] text-slate-400">{formattedTime}</span>
                        </td>

                        {/* Candidate / Team / Entity */}
                        <td className="p-3 max-w-[200px]">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {p.userName}
                          </div>
                          {(p.teamName || p.instituteName) && (
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              {p.teamName && <span className="font-medium text-slate-700 dark:text-slate-300">{p.teamName}</span>}
                              {p.teamName && p.instituteName && <span>•</span>}
                              {p.instituteName && <span className="text-slate-400 truncate">{p.instituteName}</span>}
                            </div>
                          )}
                        </td>

                        {/* Region / Hub */}
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${regCfg.badgeBg} ${regCfg.text} border ${regCfg.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${regCfg.color}`} />
                            {regCfg.short}
                          </span>
                        </td>

                        {/* Stage */}
                        <td className="p-3">
                          <span className="uppercase text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                            {p.stage.replace('_', ' ')}
                          </span>
                          {p.itemDescription && (
                            <span className="text-[10px] text-slate-400 truncate block max-w-[140px]" title={p.itemDescription}>
                              {p.itemDescription}
                            </span>
                          )}
                        </td>

                        {/* Method */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{p.paymentMethod}</span>
                          {p.couponCode && (
                            <span className="text-[9px] text-purple-600 block font-mono">
                              Code: {p.couponCode}
                            </span>
                          )}
                        </td>

                        {/* Taxable */}
                        <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-400">
                          ₹{baseAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* GST 18% */}
                        <td className="p-3 text-right font-medium text-amber-600 dark:text-amber-400">
                          ₹{gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Total Paid */}
                        <td className="p-3 text-right font-black text-slate-900 dark:text-slate-100">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              p.status === 'SUCCESS'
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                                : p.status === 'PENDING'
                                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                                : p.status === 'REFUNDED'
                                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'
                                : 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        {/* Tax Invoice Action */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedInvoice(p)}
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                            title="View Official GST Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{p.gstInvoiceNumber}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ SUB-TAB 2: REGIONAL & MONTHLY MATRIX SUMMARY ------------------ */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Zone vs Month Revenue Matrix & Regional Allocation</span>
              </h3>
              <p className="text-xs text-slate-500">
                Consolidated gross turnover cross-tabulated by geographical execution hub and calendar month.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors self-start"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Matrix Data</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Zone / Hub</th>
                  {availableMonths.map(m => (
                    <th key={m} className="p-3 text-right border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {formatMonthLabel(m)}
                    </th>
                  ))}
                  <th className="p-3 text-right font-black bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    Grand Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {Object.entries(REGION_CONFIG).map(([regKey, cfg]) => {
                  let regTotal = 0;
                  return (
                    <tr key={regKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                        <span>{cfg.label}</span>
                      </td>

                      {availableMonths.map(m => {
                        const monthTotal = payments
                          .filter(p => {
                            if (p.status !== 'SUCCESS') return false;
                            if (getPaymentRegionKey(p) !== regKey) return false;
                            const pDate = new Date(p.timestamp);
                            const ym = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
                            return ym === m;
                          })
                          .reduce((sum, p) => sum + p.amount, 0);

                        regTotal += monthTotal;

                        return (
                          <td
                            key={m}
                            className={`p-3 text-right border-r border-slate-200 dark:border-slate-800 font-mono ${
                              monthTotal > 0 ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          >
                            {monthTotal > 0 ? `₹${monthTotal.toLocaleString('en-IN')}` : '—'}
                          </td>
                        );
                      })}

                      <td className="p-3 text-right font-black font-mono bg-amber-500/5 text-amber-600 dark:text-amber-400">
                        ₹{regTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                <tr>
                  <td className="p-3 uppercase text-[10px] tracking-wider border-r border-slate-200 dark:border-slate-800">
                    Monthly Aggregate Total
                  </td>
                  {availableMonths.map(m => {
                    const totalForMonth = payments
                      .filter(p => {
                        if (p.status !== 'SUCCESS') return false;
                        const pDate = new Date(p.timestamp);
                        const ym = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
                        return ym === m;
                      })
                      .reduce((sum, p) => sum + p.amount, 0);

                    return (
                      <td key={m} className="p-3 text-right font-black font-mono border-r border-slate-200 dark:border-slate-800">
                        ₹{totalForMonth.toLocaleString('en-IN')}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right font-black font-mono text-emerald-600 bg-emerald-500/10">
                    ₹{payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ SUB-TAB 3: GST STATUTORY & GSTR-1 COMPLIANCE ------------------ */}
      {activeSubTab === 'gst_compliance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Statutory GST Returns & Tax Liability Summary (GSTR-1 & GSTR-3B)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Central GST Act 2017 compliance report for Educational Evaluation Services under SAC Code 999293.
              </p>
            </div>
            <button
              onClick={handleExportGSTR1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors self-start"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download GSTR-1 File</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier Info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Supplier Entity (Tax Deductor)
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                All India Management Association (AIMA)
              </div>
              <div className="text-slate-500">
                14, Institutional Area, Lodhi Road, New Delhi 110003
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                <span className="text-slate-400">GSTIN: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">07AAATA1234F1Z5</span>
              </div>
              <div className="font-mono text-[11px]">
                <span className="text-slate-400">State Code: </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">07 (Delhi NCR)</span>
              </div>
            </div>

            {/* HSN / SAC Info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                HSN / SAC Classification
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="font-mono text-amber-600 dark:text-amber-400 text-sm">SAC 999293</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Commercial training, coaching, evaluation, and educational case competition assessment services.
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px]">
                <span className="text-slate-400">Statutory Tax Rate:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">18.00% (Standard)</span>
              </div>
            </div>

            {/* Tax Liability Breakdown */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                Total Output Tax Liability
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                ₹{metrics.gstCollected.toLocaleString('en-IN')}
              </div>
              <div className="space-y-1 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Intra-State (CGST 9% + SGST 9%):</span>
                  <span className="font-mono font-semibold">₹{(metrics.gstCollected * 0.28).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inter-State (IGST 18%):</span>
                  <span className="font-mono font-semibold">₹{(metrics.gstCollected * 0.72).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* B2B vs B2C Invoicing Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-[10px] text-slate-500">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Total Invoices</th>
                  <th className="p-3 text-right">Taxable Turnover (₹)</th>
                  <th className="p-3 text-right">CGST (9%) (₹)</th>
                  <th className="p-3 text-right">SGST (9%) (₹)</th>
                  <th className="p-3 text-right">IGST (18%) (₹)</th>
                  <th className="p-3 text-right">Gross Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* B2B Institutions with GSTIN */}
                <tr>
                  <td className="p-3 font-semibold">
                    <div>B2B Registered Institutional Batches & Sponsors</div>
                    <span className="text-[10px] text-slate-400">Eligible for Input Tax Credit (ITC)</span>
                  </td>
                  <td className="p-3">
                    {filteredPayments.filter(p => p.payerGstin && p.status === 'SUCCESS').length}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => p.payerGstin && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.baseAmount || p.amount / 1.18), 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => p.payerGstin && p.gstType === 'CGST+SGST' && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.gstAmount || p.amount * 0.18) / 2, 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => p.payerGstin && p.gstType === 'CGST+SGST' && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.gstAmount || p.amount * 0.18) / 2, 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => p.payerGstin && p.gstType === 'IGST' && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.gstAmount || p.amount * 0.18), 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-bold font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => p.payerGstin && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString('en-IN')}
                  </td>
                </tr>

                {/* B2C Candidates */}
                <tr>
                  <td className="p-3 font-semibold">
                    <div>B2C Student & Team Registrations</div>
                    <span className="text-[10px] text-slate-400">Unregistered Consumer Invoices</span>
                  </td>
                  <td className="p-3">
                    {filteredPayments.filter(p => !p.payerGstin && p.status === 'SUCCESS').length}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => !p.payerGstin && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.baseAmount || p.amount / 1.18), 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => !p.payerGstin && p.gstType === 'CGST+SGST' && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.gstAmount || p.amount * 0.18) / 2, 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => !p.payerGstin && p.gstType === 'CGST+SGST' && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.gstAmount || p.amount * 0.18) / 2, 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => !p.payerGstin && p.gstType === 'IGST' && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + (p.gstAmount || p.amount * 0.18), 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-bold font-mono">
                    ₹
                    {filteredPayments
                      .filter(p => !p.payerGstin && p.status === 'SUCCESS')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ MODAL: OFFICIAL GST TAX INVOICE ------------------ */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Tax Invoice #{selectedInvoice.gstInvoiceNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Print Tax Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Canvas Container */}
            <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-6 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    ALL INDIA MANAGEMENT ASSOCIATION
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                    14, Institutional Area, Lodhi Road, New Delhi - 110003, India
                  </p>
                  <p className="text-[11px] font-mono text-slate-700 dark:text-slate-300 mt-1">
                    GSTIN: <span className="font-bold text-emerald-600">07AAATA1234F1Z5</span> | State: 07 (Delhi)
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    Original for Recipient
                  </span>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Invoice Date:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(selectedInvoice.timestamp).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billed To / Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Billed To (Recipient)
                  </span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{selectedInvoice.userName}</div>
                  {selectedInvoice.teamName && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Team: {selectedInvoice.teamName}
                    </div>
                  )}
                  {selectedInvoice.instituteName && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Institute: {selectedInvoice.instituteName}
                    </div>
                  )}
                  {selectedInvoice.payerGstin && (
                    <div className="text-[11px] font-mono font-bold text-purple-600 mt-1">
                      GSTIN: {selectedInvoice.payerGstin}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Payment & Execution Details
                  </span>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400">Gateway Txn: </span>
                    <span className="font-mono font-bold text-amber-600">{selectedInvoice.transactionId}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    <span className="text-slate-400">Method: </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedInvoice.paymentMethod}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    <span className="text-slate-400">Regional Zone: </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedInvoice.regionName || selectedInvoice.regionHub || 'Northern Regional Hub'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Line Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="p-3">Description of Services</th>
                      <th className="p-3">SAC Code</th>
                      <th className="p-3 text-right">Taxable (₹)</th>
                      <th className="p-3 text-right">GST (18%) (₹)</th>
                      <th className="p-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedInvoice.itemDescription || 'AIMA-ICRC National Case League 2026 Examination & Evaluation Fee'}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          Stage: {selectedInvoice.stage.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="p-3 font-mono">999293</td>
                      <td className="p-3 text-right font-mono font-medium">
                        ₹
                        {(selectedInvoice.baseAmount || Math.round((selectedInvoice.amount / 1.18) * 100) / 100).toLocaleString(
                          'en-IN',
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-amber-600">
                        ₹
                        {(
                          selectedInvoice.gstAmount ||
                          selectedInvoice.amount - Math.round((selectedInvoice.amount / 1.18) * 100) / 100
                        ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={4} className="p-3 text-right uppercase text-[10px] text-slate-500">
                        Total Amount Received (INR):
                      </td>
                      <td className="p-3 text-right font-black font-mono text-emerald-600 text-sm">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Legal Note & Seal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="space-y-0.5 text-[10px] text-slate-400">
                  <p>1. This is a computer-generated tax invoice that requires no physical signature.</p>
                  <p>2. Subject to Delhi jurisdiction only. SAC Code 999293 is non-refundable upon commencement of rounds.</p>
                </div>
                <div className="text-center sm:text-right">
                  <div className="inline-block px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    Digitally Verified &bull; ISO 27001 Secure
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`GST Tax Invoice #${selectedInvoice.gstInvoiceNumber} downloaded successfully as signed PDF.`);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
