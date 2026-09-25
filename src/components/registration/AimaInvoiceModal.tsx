import React from 'react';
import {
  X,
  Printer,
  Download,
  Building,
  CheckCircle2,
  Landmark,
  FileText,
  Mail,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { CSRBootcampRegistration } from '../../types';

interface AimaInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: CSRBootcampRegistration | null;
}

export const AimaInvoiceModal: React.FC<AimaInvoiceModalProps> = ({
  isOpen,
  onClose,
  registration,
}) => {
  if (!isOpen || !registration) return null;

  const isProforma = registration.paymentStatus !== 'PAID';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Actions bar at top */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              {isProforma ? 'AIMA Official Proforma Invoice' : 'AIMA Statutory GST Tax Invoice'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between border-b pb-6 gap-4">
            <div className="space-y-1">
              <img
                src="https://www.aima.in/img/logo.png"
                alt="AIMA"
                className="h-10 w-auto object-contain mb-2"
                referrerPolicy="no-referrer"
              />
              <div className="font-black text-sm tracking-tight text-slate-900">
                ALL INDIA MANAGEMENT ASSOCIATION
              </div>
              <div className="text-[11px] text-slate-600 max-w-xs">
                Management House, 14 Institutional Area, Lodhi Road, New Delhi - 110003, India
              </div>
              <div className="text-[11px] text-slate-600">
                GSTIN: <strong className="font-mono">07AAATA1234F1Z5</strong> | PAN: <strong className="font-mono">AAATA1234F</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Contact: Ms Ekta Nayyar | enayyar@aima.in | +91 11 47673000 Extn: 732
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                isProforma ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {isProforma ? 'PROFORMA TAX INVOICE' : 'ORIGINAL TAX INVOICE'}
              </span>
              <div className="font-mono font-bold text-sm text-slate-900 pt-1">
                {registration.invoiceNumber}
              </div>
              <div className="text-slate-500 text-[11px]">
                Date: {new Date(registration.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-slate-500 text-[11px]">
                Reg Ref: <strong className="font-mono">{registration.registrationNumber}</strong>
              </div>
              {registration.poNumber && (
                <div className="text-blue-700 font-semibold text-[11px]">
                  PO / Sanction Ref: {registration.poNumber}
                </div>
              )}
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Billed To (Organization):
              </div>
              <div className="font-bold text-sm text-slate-900">{registration.organizationName}</div>
              <div className="text-slate-600 text-[11px] pt-1">{registration.address}</div>
              <div className="text-slate-600 text-[11px]">{registration.city}, {registration.state} - {registration.pinCode}</div>
              <div className="text-slate-700 text-[11px] pt-1">
                GSTIN: <span className="font-mono font-bold">{registration.gstin || 'Unregistered / Exempt'}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nominating Officer / Contact:
              </div>
              <div className="font-bold text-slate-900">
                {registration.coordinator.salutation ? `${registration.coordinator.salutation} ` : ''}{registration.coordinator.name}
              </div>
              <div className="text-slate-600 text-[11px]">
                {registration.coordinator.designation}{registration.coordinator.department ? ` — ${registration.coordinator.department}` : ''}
              </div>
              <div className="text-slate-600 text-[11px]">Email: {registration.coordinator.email}</div>
              <div className="text-slate-600 text-[11px]">Mobile: {registration.coordinator.mobile}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Service Description</th>
                  <th className="p-3">SAC Code</th>
                  <th className="p-3 text-center">Nominees</th>
                  <th className="p-3 text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                <tr>
                  <td className="p-3 font-medium">1</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">India Case League 2026 • National Student Competition</div>
                    <div className="text-[11px] text-slate-500">
                      Tier: {registration.tierLabel} • Includes National Online Quiz &amp; Case Challenge
                    </div>
                  </td>
                  <td className="p-3 font-mono">999293</td>
                  <td className="p-3 text-center font-bold">{registration.participantCount}</td>
                  <td className="p-3 text-right font-mono font-bold">
                    ₹{registration.subtotalExclGst.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Calculation */}
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Excl. GST):</span>
                <span className="font-mono">₹{registration.subtotalExclGst.toLocaleString('en-IN')}</span>
              </div>
              {registration.gstType === 'CGST+SGST' ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{(registration.gstAmount / 2).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{(registration.gstAmount / 2).toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>IGST (18%):</span>
                  <span className="font-mono">₹{registration.gstAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-300 text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700 font-mono">₹{registration.totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Nominee Roster Summary on Invoice */}
          <div className="space-y-1">
            <div className="font-bold text-xs text-slate-800">Nominated Participants:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {registration.nominees.map((n, i) => (
                <div key={n.id || i} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px]">
                  <strong>{i + 1}. {n.salutation ? `${n.salutation} ` : ''}{n.name}</strong> {n.designation ? `— ${n.designation}` : ''} {n.email ? `(${n.email})` : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details for NEFT/RTGS */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1 text-slate-700">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>AIMA Bank Remittance Details (For NEFT / RTGS Clearance):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div>Bank Name: <strong>State Bank of India (SBI)</strong></div>
              <div>Account Name: <strong>All India Management Association</strong></div>
              <div>Account Number: <strong className="font-mono">100293847291</strong></div>
              <div>IFSC Code: <strong className="font-mono">SBIN0000691</strong></div>
              <div>Branch: <strong>Lodhi Road Branch, New Delhi</strong></div>
              <div>MICR Code: <strong className="font-mono">110002072</strong></div>
            </div>
          </div>

          {/* Footer Clearance Terms */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
            <p>1. Fees are non-refundable. Nominee substitution permitted with intimation 48 hours prior to Bootcamp.</p>
            <p>2. Please quote Invoice Reference <strong>{registration.invoiceNumber}</strong> while effecting RTGS/NEFT payment.</p>
            <p>3. This is a computer-generated official document issued under the authority of AIMA CSR Secretariat.</p>
            <p>4. Data Privacy: Personal data is collected and processed with explicit consent under the Digital Personal Data Protection (DPDP) Act, 2023.</p>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Status:{' '}
            <strong className={isProforma ? 'text-amber-600' : 'text-emerald-600'}>
              {isProforma ? 'Pending Clearance / PO' : 'Cleared & Confirmed'}
            </strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
