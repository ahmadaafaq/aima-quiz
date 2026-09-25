import React, { useState } from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Building,
  User,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { CSREmailLog, CSRBootcampRegistration } from '../../types';

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailLog: CSREmailLog | null;
  registration: CSRBootcampRegistration | null;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
  isOpen,
  onClose,
  emailLog,
  registration,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !emailLog) return null;

  const handleCopy = () => {
    const text = `
To: ${emailLog.to}
CC: ${emailLog.cc || 'N/A'}
Subject: ${emailLog.subject}
Date: ${new Date(emailLog.timestamp).toLocaleString('en-IN')}

REGISTRATION DETAILS
Registration Ref: ${emailLog.registrationNumber}
Organization: ${emailLog.organizationName}
Participants Nominated: ${emailLog.participantCount}
Invoice Ref: ${emailLog.invoiceNumber}
Total Amount: ₹${emailLog.totalAmount.toLocaleString('en-IN')} (Incl. 18% GST)

SUMMARY:
${emailLog.bodySnippet}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Secretariat Email Dispatched</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Delivered
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Official registration details transmitted to Ms Ekta Nayyar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice bar */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 px-5 py-2.5 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Captured &amp; emailed irrespective of immediate payment clearance (PSU &amp; Govt PO compliant).
          </span>
        </div>

        {/* Email Envelope Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 font-sans text-xs">
          {/* Metadata Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 font-medium">To: </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 underline decoration-blue-500">
                  {emailLog.to} (Ms Ekta Nayyar, AIMA)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">CC: </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {emailLog.cc || 'Registrant Email'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-medium">Subject: </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {emailLog.subject}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Time: </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date(emailLog.timestamp).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Reg Ref: </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {emailLog.registrationNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Email HTML Transcript */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-950 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                All India Management Association (AIMA)
              </div>
              <div className="text-[11px] text-slate-400">Secretariat Automated Notification</div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Dear Ms Ekta Nayyar / AIMA CSR Secretariat,
            </p>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              A new online registration form has been initiated and logged for the upcoming <strong>Certified CSR Leader Bootcamp</strong> scheduled for <strong>27–28 October 2026 at AIMA, Lajpat Nagar, New Delhi</strong>.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Organisation: <span className="font-bold text-slate-900 dark:text-white">{emailLog.organizationName}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                Nominees Count: <span className="font-bold text-slate-900 dark:text-white">{emailLog.participantCount} participant(s)</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                Invoice Reference: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{emailLog.invoiceNumber}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                Total Fee (Incl. 18% GST): <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{emailLog.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                Payment Status:{' '}
                <span className={`font-bold ${registration?.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {registration?.paymentStatus === 'PAID' ? 'PAID & CLEARED VIA GATEWAY' : 'PENDING PROFORMA INVOICE / PO DISBURSEMENT'}
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                DPDP Act 2023 Consent:{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Affirmative Consent Granted by Registrant
                </span>
              </div>
            </div>

            {registration && registration.nominees.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">Nominee Roster:</div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                  {registration.nominees.map((n, idx) => (
                    <div key={n.id || idx} className="p-2 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{n.salutation} {n.name}</span>
                        <span className="text-slate-500"> — {n.designation} ({n.department})</span>
                      </div>
                      <div className="text-slate-500 font-mono">{n.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
              This message was automatically generated upon registration form submission.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Details' : 'Copy Email Log'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
          >
            Close Notification
          </button>
        </div>
      </div>
    </div>
  );
};
