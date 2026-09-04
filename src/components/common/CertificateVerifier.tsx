import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { CertificateRecord } from '../../types';
import { Award, CheckCircle2, QrCode, Search, ShieldAlert, ShieldCheck, X } from 'lucide-react';

export const CertificateVerifier: React.FC = () => {
  const { activeVerifierModal, setActiveVerifierModal, verifyCertificateCode, setActiveCertificateModal } = useCompetition();
  const [searchCode, setSearchCode] = useState('');
  const [result, setResult] = useState<CertificateRecord | null | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);

  if (!activeVerifierModal) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const found = verifyCertificateCode(searchCode);
    setResult(found || null);
    setHasSearched(true);
  };

  const loadSample = (code: string) => {
    setSearchCode(code);
    const found = verifyCertificateCode(code);
    setResult(found || null);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AIMA-ICRC Certificate Verifier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authenticate official India Case League 2026 digital credentials
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveVerifierModal(false);
              setResult(undefined);
              setHasSearched(false);
              setSearchCode('');
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Enter Certificate ID or Scan QR Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={e => setSearchCode(e.target.value)}
                  placeholder="e.g. AIMA-ICL-2026-NAT-WIN-001"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Sample quick buttons */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
            <span>Try sample credentials:</span>
            <button
              type="button"
              onClick={() => loadSample('AIMA-ICL-2026-NAT-WIN-001')}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors font-mono cursor-pointer"
            >
              NAT-WIN-001
            </button>
            <button
              type="button"
              onClick={() => loadSample('AIMA-ICL-2026-REG-SOU-001')}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors font-mono cursor-pointer"
            >
              REG-SOU-001
            </button>
            <button
              type="button"
              onClick={() => loadSample('AIMA-ICL-2026-JURY-HON-044')}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors font-mono cursor-pointer"
            >
              JURY-HON-044
            </button>
          </div>

          {/* Results Display */}
          {hasSearched && (
            <div className="pt-2">
              {result ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      AUTHENTICATED & VERIFIED
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded font-semibold">
                      STATUS: ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Recipient</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{result.recipientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Achievement</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{result.achievement}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Institute</span>
                      <span className="text-slate-800 dark:text-slate-200">{result.institute}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Issue Date</span>
                      <span className="text-slate-800 dark:text-slate-200">{result.issueDate}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">Signatory: {result.authorizedSignatory}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCertificateModal(result);
                        setActiveVerifierModal(false);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" /> View Official Certificate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-rose-800 dark:text-rose-300">
                      Record Not Found
                    </div>
                    <div className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                      No verified record matched the certificate serial code entered. Please check for spelling mistakes or reach out to AIMA helpdesk.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          All certificates are cryptographically issued by All India Management Association (AIMA) and India Case Research Centre.
        </div>

      </div>
    </div>
  );
};
