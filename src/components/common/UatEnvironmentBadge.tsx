import React, { useState } from 'react';
import { DB_SCHEMA } from '../../lib/supabase';
import { FlaskConical, Database, X, ChevronUp, ChevronDown } from 'lucide-react';

export const UatEnvironmentBadge: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If in public/production schema, render absolutely nothing
  if (DB_SCHEMA === 'public' || isDismissed) {
    return null;
  }

  return (
    <aside 
      aria-label="UAT Environment Indicator"
      className="fixed bottom-4 left-4 z-[9999] select-none font-sans"
    >
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/95 dark:bg-amber-600/95 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all border border-amber-300/40 backdrop-blur-md text-xs font-semibold tracking-wide hover:scale-105 active:scale-95 cursor-pointer"
          title="Click to inspect active environment details"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <FlaskConical className="w-3.5 h-3.5" />
          <span>UAT STAGING MODE</span>
          <ChevronUp className="w-3 h-3 opacity-80" />
        </button>
      ) : (
        <div className="w-80 rounded-2xl bg-white dark:bg-slate-900 border border-amber-400/50 dark:border-amber-500/40 shadow-2xl p-4 text-xs space-y-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-amber-600 dark:amber-400 font-bold">
              <FlaskConical className="w-4 h-4 text-amber-500" />
              <span>Isolated UAT Environment</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                title="Collapse"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                title="Dismiss badge for this session"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Schema:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                uat
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Host:</span>
              <span className="font-mono text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Live Production:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Protected (public)</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            All registrations, tests, and mock submissions in this window are isolated to the <code className="text-amber-600 dark:text-amber-400">uat</code> database.
          </p>
        </div>
      )}
    </aside>
  );
};
