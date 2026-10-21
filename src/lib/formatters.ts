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
