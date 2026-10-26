/**
 * AIMA India Case League 2026 — Transactional Email Service
 * Directly dispatched via Node.js Server API (/api/send-email) with Falconide SMTP relay.
 * No third-party dashboard templates or rate-limits needed.
 */

const LOGIN_URL = 'https://research.aima.in';

// Sender configuration — Official institutional sender for AIMA
export const SENDER_EMAIL    = (import.meta as any).env?.VITE_EMAIL_FROM      || 'sjames@aima.in';
export const SENDER_NAME     = (import.meta as any).env?.VITE_EMAIL_FROM_NAME || 'AIMA Case Research Centre';
export const REPLY_TO_EMAIL  = (import.meta as any).env?.VITE_EMAIL_REPLY_TO  || 'sjames@aima.in';

// Direct backend email dispatcher
async function sendViaBackend(type: string, payload: Record<string, any>): Promise<void> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, payload }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[Email API] Error (${res.status}):`, errorText);
      return;
    }

    const data = await res.json();
    console.info(`[Email Sent] (${type}) to ${payload.toEmail || '(recipient)'}:`, data.messageId || 'OK');
  } catch (err) {
    // Non-blocking log — user flow never halts on email dispatch failures
    console.warn('[Email] Dispatch failed via backend:', err);
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
  username?: string;
  password?: string;
  loginUrl?: string;
  isIndividual?: boolean;
  roleInTeam?: string;
}

export async function sendRegistrationConfirmation(p: RegistrationEmailPayload): Promise<void> {
  const loginUrl = p.loginUrl || `${LOGIN_URL}/login`;
  return sendViaBackend('registration', {
    toName:             p.toName,
    toEmail:            p.toEmail,
    registrationNumber: p.registrationNumber,
    teamName:           p.teamName,
    instituteName:      p.instituteName,
    username:           p.username || p.toEmail,
    password:           p.password || '',
    loginUrl,
    isIndividual:       p.isIndividual,
    roleInTeam:         p.roleInTeam,
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
  return sendViaBackend('team_member', {
    toName:       p.toName,
    toEmail:      p.toEmail,
    teamName:     p.teamName,
    loginEmail:   p.toEmail,
    tempPassword: p.tempPassword,
    loginUrl:     LOGIN_URL,
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
  return sendViaBackend('r1_results', {
    toName:    p.toName,
    toEmail:   p.toEmail,
    teamName:  p.teamName,
    score:     p.score,
    qualified: p.qualified,
    loginUrl:  LOGIN_URL,
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
    // Brief spacing between dispatches
    await new Promise(r => setTimeout(r, 100));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FINAL RESULTS + CERTIFICATE
//    Sent to participants when the competition concludes.
// ─────────────────────────────────────────────────────────────────────────────
export interface FinalResultsEmailPayload {
  toName: string;
  toEmail: string;
  teamName: string;
  achievement: string;
  certNumber: string;
  certVerifyUrl: string;
}

export async function sendFinalResultsEmail(p: FinalResultsEmailPayload): Promise<void> {
  return sendViaBackend('final_results', {
    toName:        p.toName,
    toEmail:       p.toEmail,
    teamName:      p.teamName,
    achievement:   p.achievement,
    certNumber:    p.certNumber,
    certVerifyUrl: p.certVerifyUrl,
    loginUrl:      LOGIN_URL,
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
    await new Promise(r => setTimeout(r, 100));
  }
}
