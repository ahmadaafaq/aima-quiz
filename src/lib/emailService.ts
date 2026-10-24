/**
 * AIMA India Case League 2026 — Transactional Email Service
 * Uses EmailJS (browser-side, free tier: 200 emails/month).
 *
 * Setup:
 *  1. Create a free account at https://www.emailjs.com
 *  2. Add a service (Gmail / SMTP) — note the Service ID
 *  3. Create 4 email templates (one per use-case below) — note each Template ID
 *  4. Copy your Public Key from Account → API Keys
 *  5. Set the five VITE_ env vars in .env / Vercel dashboard
 *
 * Template variables used per template:
 *  - registration_confirmation : to_name, to_email, reg_number, team_name, institute, login_url
 *  - team_member_added         : to_name, to_email, team_name, login_email, temp_password, login_url
 *  - r1_results                : to_name, to_email, team_name, r1_score, r1_status, login_url
 *  - final_results             : to_name, to_email, team_name, achievement, cert_number, cert_url
 */

import emailjs from '@emailjs/browser';

// ─────────────────────────────────────────────────────────────────────────────
// Config — injected from .env at build time
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_ID  = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID  || '';
const PUBLIC_KEY  = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY  || '';

const TEMPLATES = {
  registration: (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_REGISTRATION || '',
  teamMember:   (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_TEAM_MEMBER   || '',
  r1Results:    (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_R1_RESULTS    || '',
  finalResults: (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_FINAL_RESULTS || '',
};

const LOGIN_URL = 'https://research.aima.in';

// Sender configuration — Official institutional sender for AIMA
export const SENDER_EMAIL    = (import.meta as any).env?.VITE_EMAIL_FROM      || 'Sjames@aima.in';
export const SENDER_NAME     = (import.meta as any).env?.VITE_EMAIL_FROM_NAME || 'All India Management Association (AIMA)';
export const REPLY_TO_EMAIL  = (import.meta as any).env?.VITE_EMAIL_REPLY_TO  || 'Sjames@aima.in';

// Guard — silently skip if EmailJS is not configured (local dev without .env)
function isConfigured(): boolean {
  return Boolean(SERVICE_ID && PUBLIC_KEY);
}

// Fire-and-forget wrapper — never blocks the calling flow
async function send(templateId: string, params: Record<string, string>): Promise<void> {
  if (!isConfigured() || !templateId) {
    console.info('[Email] EmailJS not configured — skipping email to:', params.to_email || '(unknown)');
    return;
  }
  const payload = {
    from_name:    SENDER_NAME,
    from_email:   SENDER_EMAIL,
    reply_to:     REPLY_TO_EMAIL,
    sender_email: SENDER_EMAIL,
    ...params,
  };
  try {
    await emailjs.send(SERVICE_ID, templateId, payload, { publicKey: PUBLIC_KEY });
    console.info('[Email] Sent to', params.to_email, 'from', SENDER_EMAIL);
  } catch (err) {
    // Log but never surface to the user — email is non-blocking
    console.warn('[Email] Send failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. REGISTRATION CONFIRMATION
//    Sent to every nominee after successful team / individual registration
// ─────────────────────────────────────────────────────────────────────────────
export interface RegistrationEmailPayload {
  toName: string;
  toEmail: string;
  registrationNumber: string;
  teamName: string;
  instituteName: string;
}

export async function sendRegistrationConfirmation(p: RegistrationEmailPayload): Promise<void> {
  return send(TEMPLATES.registration, {
    to_name:    p.toName,
    to_email:   p.toEmail,
    reg_number: p.registrationNumber,
    team_name:  p.teamName,
    institute:  p.instituteName,
    login_url:  LOGIN_URL,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TEAM MEMBER ADDED
//    Sent to the newly added team member with their login credentials
// ─────────────────────────────────────────────────────────────────────────────
export interface TeamMemberEmailPayload {
  toName: string;
  toEmail: string;
  teamName: string;
  tempPassword: string;
}

export async function sendTeamMemberAddedEmail(p: TeamMemberEmailPayload): Promise<void> {
  return send(TEMPLATES.teamMember, {
    to_name:       p.toName,
    to_email:      p.toEmail,
    team_name:     p.teamName,
    login_email:   p.toEmail,
    temp_password: p.tempPassword,
    login_url:     LOGIN_URL,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROUND 1 RESULTS
//    Sent to each participant when the admin publishes R1 results
// ─────────────────────────────────────────────────────────────────────────────
export interface R1ResultsEmailPayload {
  toName: string;
  toEmail: string;
  teamName: string;
  score: number;
  qualified: boolean;
}

export async function sendR1ResultsEmail(p: R1ResultsEmailPayload): Promise<void> {
  return send(TEMPLATES.r1Results, {
    to_name:   p.toName,
    to_email:  p.toEmail,
    team_name: p.teamName,
    r1_score:  String(p.score),
    r1_status: p.qualified
      ? 'QUALIFIED — You have advanced to Round 2 (Offline Case Presentation at AIMA Venue).'
      : 'Not Qualified for Round 2.',
    login_url: LOGIN_URL,
  });
}

// Broadcast R1 results to a list of participants (admin-triggered)
export async function broadcastR1Results(
  participants: { name: string; email: string; teamName: string; score: number; qualified: boolean }[]
): Promise<void> {
  for (const p of participants) {
    await sendR1ResultsEmail({
      toName:    p.name,
      toEmail:   p.email,
      teamName:  p.teamName,
      score:     p.score,
      qualified: p.qualified,
    });
    // Small delay to respect EmailJS free-tier rate limits
    await new Promise(r => setTimeout(r, 300));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FINAL RESULTS + CERTIFICATE
//    Sent to participants when the competition concludes.
//    The certificate is referenced by its verification URL (free-tier compatible).
// ─────────────────────────────────────────────────────────────────────────────
export interface FinalResultsEmailPayload {
  toName: string;
  toEmail: string;
  teamName: string;
  achievement: string;    // e.g. "National Champion", "First Runner-Up", "Participant"
  certNumber: string;
  certVerifyUrl: string;  // e.g. https://icl2026.aima.in/verify/AIMA-ICL-2026-XXXX-1234
}

export async function sendFinalResultsEmail(p: FinalResultsEmailPayload): Promise<void> {
  return send(TEMPLATES.finalResults, {
    to_name:              p.toName,
    to_email:             p.toEmail,
    team_name:            p.teamName,
    achievement:          p.achievement,
    cert_number:          p.certNumber,
    cert_url:             p.certVerifyUrl,
    cert_attachment:      p.certVerifyUrl,
    certificate_link:     p.certVerifyUrl,
    login_url:            LOGIN_URL,
  });
}

// Broadcast final results + certs to a list of participants (admin-triggered)
export async function broadcastFinalResults(
  participants: {
    name: string;
    email: string;
    teamName: string;
    achievement: string;
    certNumber: string;
    certVerifyUrl: string;
  }[]
): Promise<void> {
  for (const p of participants) {
    await sendFinalResultsEmail({
      toName:        p.name,
      toEmail:       p.email,
      teamName:      p.teamName,
      achievement:   p.achievement,
      certNumber:    p.certNumber,
      certVerifyUrl: p.certVerifyUrl,
    });
    await new Promise(r => setTimeout(r, 300));
  }
}
