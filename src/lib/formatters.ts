/**
 * Global UI Text & String Formatting Utilities
 * AIMA-ICRC India Case League 2026
 *
 * Provides reusable helpers to sanitize, remove underscores/hyphens,
 * and format labels, stages, roles, and status strings across all UI components.
 */

/**
 * Removes underscores from any string and replaces them with clean spaces.
 * Optionally trims multiple spaces and applies uppercase formatting.
 *
 * @example
 * removeUnderscores("round_1") // "round 1"
 * removeUnderscores("round_1", true) // "ROUND 1"
 * removeUnderscores("TEAM_LEADER", false) // "TEAM LEADER"
 */
export function removeUnderscores(
  str: string | null | undefined,
  uppercase = false
): string {
  if (!str) return '';
  const cleaned = str.replace(/_+/g, ' ').trim();
  return uppercase ? cleaned.toUpperCase() : cleaned;
}

/**
 * Converts a snake_case, kebab-case, or underscore-separated string into Clean Title Case.
 *
 * @example
 * toTitleCase("round_1") // "Round 1"
 * toTitleCase("team_leader") // "Team Leader"
 * toTitleCase("pending_invoice") // "Pending Invoice"
 * toTitleCase("corporate_partner") // "Corporate Partner"
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(word => {
      if (!word) return '';
      // Keep roman numerals or specific acronyms intact (e.g. AI, R1, R2, CSR)
      if (/^(r[1-4]|ai|csr|gst|icl|aima|icrc)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Formats competition stage identifiers for display in headers, badges, and cards.
 *
 * @example
 * formatPhaseName("round_1") // "ROUND 1"
 * formatPhaseName("round_2", false) // "Round 2"
 */
export function formatPhaseName(
  stageId: string | null | undefined,
  uppercase = true
): string {
  if (!stageId) return uppercase ? 'ROUND 1' : 'Round 1';
  const clean = stageId.replace(/[_-]+/g, ' ').trim();
  return uppercase ? clean.toUpperCase() : toTitleCase(clean);
}

/**
 * General purpose formatter for user roles, statuses, and category keys.
 * Replaces underscores and hyphens with spaces, returning a neat, human-readable label.
 */
export function formatLabel(str: string | null | undefined): string {
  if (!str) return '';
  return toTitleCase(str);
}

/**
 * Parses any date/time string stored in DB as Indian Standard Time (IST, UTC+05:30).
 * Prevents UTC browser shifts (e.g. 10:00 AM stored in DB shifting to 03:30 PM).
 */
export function parseISTTimestamp(val?: string | null): number {
  if (!val) return NaN;
  // Match YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss
  const match = val.match(/(\d{4})[-/](\d{2})[-/](\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const sec = match[6] || '00';
    return new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${sec}+05:30`).getTime();
  }
  return new Date(val).getTime();
}

/**
 * Formats a raw date string (ISO, YYYY-MM-DD HH:mm, or timestamp) into a clean, human-readable date & time.
 * e.g. "2026-10-01T09:00:00+00:00" -> "01 Oct 2026, 09:00 AM"
 * e.g. "2026-10-15 23:59" -> "15 Oct 2026, 11:59 PM"
 */
export function formatQuizScheduleDate(dStr?: string | null): string {
  if (!dStr) return 'TBD';

  // Direct regex extraction to preserve the exact scheduled time without timezone shifts
  const match = dStr.match(/(\d{4})[-/](\d{2})[-/](\d{2})[T\s](\d{2}):(\d{2})/);
  if (match) {
    const y = match[1];
    const m = parseInt(match[2], 10) - 1;
    const d = match[3];
    const hh = parseInt(match[4], 10);
    const mm = match[5];
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${monthNames[m]} ${y}, ${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
  }

  // Fallback to Date parser with explicit Asia/Kolkata (IST) timezone
  const parsed = new Date(dStr);
  if (!isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(parsed);
  }

  return dStr;
}

export function formatQuizDateRange(startStr?: string | null, endStr?: string | null): {
  startFormatted: string;
  endFormatted: string;
} {
  return {
    startFormatted: formatQuizScheduleDate(startStr),
    endFormatted: formatQuizScheduleDate(endStr),
  };
}

/**
 * Universal date/time formatter that strictly outputs in Indian Standard Time (IST, UTC+05:30).
 */
export function formatISTDateTime(val?: string | number | Date | null): string {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

