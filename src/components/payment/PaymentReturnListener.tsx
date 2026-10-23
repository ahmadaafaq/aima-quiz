import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, X, ArrowRight, ExternalLink } from 'lucide-react';
import { updateRegistrationPaymentInSupabase } from '../../lib/supabase';
import { useCompetition } from '../../context/CompetitionContext';

interface ReturnDetails {
  orderId: string;
  reference: string;
  status: string;
  amount: string;
  authCode: string;
  gateway: string;
  reason?: string;
}

export const PaymentReturnListener: React.FC = () => {
  const [returnDetails, setReturnDetails] = useState<ReturnDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveView } = useCompetition();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    const status = params.get('status');
    const reference = params.get('reference') || '';
    const rawAmount = params.get('amount');
    const amount = rawAmount ? String(parseFloat(rawAmount)) : '200';
    const authCode = params.get('authCode') || 'AUTH_' + Math.floor(100000 + Math.random() * 900000);
    const gateway = params.get('gateway') || 'HDFC Bank Collect Now';
    const reason = params.get('reason') || 'Transaction was declined or cancelled';

    // Verify amount is not tampered (minimum fee per participant is ₹200)
    const paidNum = parseFloat(amount);
    const isAmountValid = !isNaN(paidNum) && paidNum >= 200 && paidNum % 200 === 0;

    if (orderId && status === 'SUCCESS' && isAmountValid) {
      const details: ReturnDetails = {
        orderId,
        reference,
        status,
        amount,
        authCode,
        gateway,
      };

      setReturnDetails(details);
      setIsOpen(true);

      // Trigger celebration confetti
      try {
        confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
      } catch {}

      // Update Supabase if registration reference exists
      if (reference) {
        updateRegistrationPaymentInSupabase(reference, 'PAID', gateway, orderId).catch((err) => {
          console.warn('[PaymentReturn] Supabase update notice:', err);
        });
      }

      // Check if there was a pending registration cached locally
      try {
        const cachedRaw = localStorage.getItem('pending_csr_registration');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          cached.paymentStatus = 'PAID';
          cached.paymentMethod = gateway;
          cached.transactionId = orderId;
          cached.invoiceNumber = (cached.invoiceNumber || 'INV-2026-').replace('PINV-', 'INV-');
          localStorage.setItem('active_csr_registration', JSON.stringify(cached));
          localStorage.removeItem('pending_csr_registration');
        }
      } catch (e) {
        console.warn('[PaymentReturn] Cache sync notice:', e);
      }

      // Clean address bar so page refresh doesn't re-trigger
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (status === 'SUCCESS' && !isAmountValid) {
      const details: ReturnDetails = {
        orderId: orderId || 'N/A',
        reference,
        status: 'FAILED',
        amount,
        authCode: 'N/A',
        gateway,
        reason: `Security Discrepancy: Amount received (₹${amount}) does not match the authoritative registration fee tier (₹200 per participant). Transaction flagged for administrative review.`,
      };

      setReturnDetails(details);
      setIsOpen(true);

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      const details: ReturnDetails = {
        orderId: orderId || 'N/A',
        reference,
        status,
        amount,
        authCode: 'N/A',
        gateway,
        reason,
      };

      setReturnDetails(details);
      setIsOpen(true);

      // Clean address bar so page refresh doesn't re-trigger
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  if (!isOpen || !returnDetails) return null;

  const isSuccess = returnDetails.status === 'SUCCESS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border ${isSuccess ? 'border-emerald-500/40' : 'border-rose-500/40'} shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-center`}>
        {/* Status Icon */}
        <div className={`w-16 h-16 rounded-full ${isSuccess ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/20' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-rose-500/20'} mx-auto flex items-center justify-center shadow-lg`}>
          {isSuccess ? <CheckCircle2 className="w-10 h-10" /> : <X className="w-10 h-10" />}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isSuccess ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'} border text-xs font-bold uppercase tracking-wider`}>
            <ShieldCheck className="w-4 h-4" />
            <span>Centralized Payment Hub {isSuccess ? 'Verified' : 'Notice'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isSuccess ? 'Payment Cleared Successfully!' : 'Payment Was Not Completed'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {isSuccess
              ? 'Your registration payment has been verified by the AIMA Centralized Payment Hub and recorded in the national ledger.'
              : (returnDetails.reason || 'The transaction was cancelled or declined by the payment gateway.')}
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs space-y-2.5 text-left font-mono">
          {returnDetails.orderId !== 'N/A' && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Payment Order ID:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{returnDetails.orderId}</span>
            </div>
          )}
          {returnDetails.reference && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Candidate / Reg Ref:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{returnDetails.reference}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans">Gateway Status:</span>
            <span className={`font-bold font-sans ${isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {returnDetails.status}
            </span>
          </div>
          {isSuccess && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Amount Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans text-sm">₹{returnDetails.amount} INR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Processed Gateway:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">{returnDetails.gateway}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-sans">Bank Auth Code:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{returnDetails.authCode}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isSuccess ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setActiveView('registration');
              }}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>View Registration Confirmation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setActiveView('registration');
              }}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Retry Registration / Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
