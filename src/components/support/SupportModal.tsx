import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { HelpCircle, LifeBuoy, Send, ShieldAlert, Upload, X } from 'lucide-react';

export const SupportModal: React.FC = () => {
  const { activeSupportModal, setActiveSupportModal, createSupportTicket, currentUser } = useCompetition();
  const [category, setCategory] = useState<'Technical' | 'Quiz' | 'Case Submission' | 'Payment' | 'Team Formation' | 'Regional Hub' | 'General'>('Technical');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical (War-Room)'>('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [hasFile, setHasFile] = useState(false);
  const [submittedTicketNo, setSubmittedTicketNo] = useState<string | null>(null);

  if (!activeSupportModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const ticket = createSupportTicket({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      category,
      priority,
      subject,
      description,
      screenshotUrl: hasFile ? 'screenshot_attached_system_log.png' : undefined,
    });

    setSubmittedTicketNo(ticket.ticketNumber);
  };

  const handleClose = () => {
    setActiveSupportModal(false);
    setSubmittedTicketNo(null);
    setSubject('');
    setDescription('');
    setHasFile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AIMA-ICRC Helpdesk & War-Room
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Round 1-4 technical support & emergency desk
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Confirmation */}
        <div className="p-6">
          {submittedTicketNo ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Ticket Created Successfully
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ticket Number:{' '}
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {submittedTicketNo}
                  </span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 max-w-sm mx-auto">
                  Our dedicated technical war-room engineers have received your inquiry and will respond to your registered email ({currentUser.email}) within 15 minutes.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Support Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Technical">Technical / Platform Issue</option>
                    <option value="Quiz">Round 1 Quiz Session</option>
                    <option value="Case Submission">Round 2 Case Deck</option>
                    <option value="Payment">Payment & GST Invoices</option>
                    <option value="Team Formation">Team Roster & Invites</option>
                    <option value="Regional Hub">Regional Hub & Slots</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className={`w-full text-xs rounded-lg border px-3 py-2 font-medium ${
                      priority.includes('Critical')
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <option value="Low">Low - General Query</option>
                    <option value="Medium">Medium - Standard Request</option>
                    <option value="High">High - Impending Deadline</option>
                    <option value="Critical (War-Room)">Critical (Live Quiz / Deadline War-Room)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brief disconnection during question 12"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your query or provide error details..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Error Screenshot / Log (Optional)
                </label>
                <div
                  onClick={() => setHasFile(!hasFile)}
                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    hasFile
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Upload className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">
                    {hasFile ? '✓ Attached: console_error_snapshot.png' : 'Click to simulate attaching screenshot'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Ticket
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
