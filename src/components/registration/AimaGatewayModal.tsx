import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Receipt
} from 'lucide-react';
import { CSRBootcampRegistration } from '../../types';

interface AimaGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: CSRBootcampRegistration | null;
  onPaymentSuccess: (paymentMethod: string, transactionId: string) => void;
}

export const AimaGatewayModal: React.FC<AimaGatewayModalProps> = ({
  isOpen,
  onClose,
  registration,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'upi_qr' | 'upi_vpa' | 'cards' | 'netbanking'>('upi_qr');
  const [upiId, setUpiId] = useState('pay.executive@okaxis');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardHolder, setCardHolder] = useState('AIMA NOMINEE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  if (!isOpen || !registration) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setProcessingStatus('Connecting to AIMA Payment Gateway...');

    setTimeout(() => {
      setProcessingStatus('Verifying 3D-Secure / UPI clearance...');
      setTimeout(() => {
        setProcessingStatus('Payment successful! Generating AIMA GST Tax Invoice...');
        setTimeout(() => {
          setIsProcessing(false);
          const txn = 'TXN-AIMA-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
          const methodLabel = method === 'upi_qr' || method === 'upi_vpa' ? 'UPI' : method === 'cards' ? 'Credit Card' : 'Net Banking';
          onPaymentSuccess(methodLabel, txn);
        }, 800);
      }, 900);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl">
              <img
                src="https://www.aima.in/img/logo.png"
                alt="AIMA"
                className="h-6 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">AIMA Payment Gateway</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  256-bit SSL
                </span>
              </div>
              <p className="text-xs text-blue-200">
                India Case League 2026 • AIMA-ICRC National Competition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-500 dark:text-slate-400">Payer / Organization</div>
            <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{registration.organizationName}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 dark:text-slate-400">Total Payable (Incl. 18% GST)</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{registration.totalPayable.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Gateway Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('upi_qr')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                method === 'upi_qr'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <div className="text-xs font-bold">UPI QR Code</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('cards')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                method === 'cards'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <div className="text-xs font-bold">Cards (Visa/MC/RuPay)</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('netbanking')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                method === 'netbanking'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Building className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <div className="text-xs font-bold">Net Banking</div>
            </button>
          </div>

          {/* Method Content */}
          {method === 'upi_qr' && (
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=aima.bootcamp@sbi&pn=All%20India%20Management%20Association&am=${registration.totalPayable}&cu=INR`}
                  alt="AIMA UPI QR"
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Scan with <strong>BHIM UPI, Google Pay, PhonePe, or Paytm</strong>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                VPA: <strong>aima.bootcamp@sbi</strong>
              </div>
            </div>
          )}

          {method === 'cards' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                />
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                <option value="State Bank of India">State Bank of India (AIMA Preferred)</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Punjab National Bank">Punjab National Bank (PSU Priority)</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Canara Bank">Canara Bank</option>
              </select>
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-[11px] text-blue-800 dark:text-blue-300">
                Corporate netbanking enabled. Instant e-receipt and digital clearance generated immediately.
              </div>
            </div>
          )}

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">{processingStatus}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Cancel / Pay Later
          </button>

          <button
            type="button"
            onClick={handlePayNow}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Pay ₹{registration.totalPayable.toLocaleString('en-IN')} Securely</span>
          </button>
        </div>
      </div>
    </div>
  );
};
