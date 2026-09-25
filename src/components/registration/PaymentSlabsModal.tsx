import React from 'react';
import {
  X,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Users,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FEE_TIERS } from './RegistrationPage';

interface PaymentSlabsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier?: (tierId: string) => void;
}

export const PaymentSlabsModal: React.FC<PaymentSlabsModalProps> = ({
  isOpen,
  onClose,
  onSelectTier,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Official Schedule
                </span>
                <span className="text-xs text-blue-200 font-semibold hidden sm:inline">
                  SAC Code: 999293 • 18% GST
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                PARTICIPATION FEE SCHEDULE &amp; SLABS
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Fee Slabs Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Context Intro Notice */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold leading-relaxed">
                Please select or review the applicable nomination fee based on the number of participants nominated by your institution or delegation squad.
              </p>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                All fees are subject to 18% Goods &amp; Services Tax (GST) under SAC code 999293 (CGST 9% + SGST 9% for Delhi; IGST 18% for other States).
              </p>
            </div>
          </div>

          {/* Slabs Grid / Table */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Nomination Slabs &amp; Tier Rates</span>
              <span className="text-[11px] font-semibold text-slate-500">
                Transparent Pricing • No Hidden Costs
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {FEE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-blue-50/40 dark:hover:bg-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {tier.label}
                      </span>
                      {tier.isPackage && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          Institutional Pack
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tier.subLabel}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        Fee (Excl. GST)
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        ₹{tier.rateExclGst.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-500">
                          {tier.isPackage ? ' flat' : ' / person'}
                        </span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        Fee (Incl. 18% GST)
                      </span>
                      <span className="font-mono font-black text-sm sm:text-base text-blue-700 dark:text-blue-300">
                        ₹{tier.rateInclGst.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-blue-600/80 dark:text-blue-400/80">
                          {tier.isPackage ? ' flat' : ' / person'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Inclusions Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>What Is Included in the Nomination Fee:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Immediate Quiz Login Credentials for all Nominees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Round 1 Online Assessment &amp; Automated Analytics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Official Live Industry Case Deck Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Digital Verifiable Certificate of Participation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Statutory GST Tax Invoice / Proforma Generation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Automated Email Dispatch to Secretariat &amp; Candidates</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-5 sm:px-6 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Official All India Management Association (AIMA) Tariff</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-blue-500/20"
          >
            Close &amp; Continue Registration
          </button>
        </div>

      </div>
    </div>
  );
};
