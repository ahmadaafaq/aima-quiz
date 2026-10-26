import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────────────────────
// SMTP Transporter Configuration
// ─────────────────────────────────────────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || "smtp.falconide.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || "aimain";
const SMTP_PASS = process.env.SMTP_PASS || "Metro$23456";
const SMTP_FROM = process.env.SMTP_FROM || '"AIMA Case Research Centre" <sjames@aima.in>';
const SMTP_REPLY_TO = process.env.SMTP_REPLY_TO || "sjames@aima.in";

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
});

// Helper for wrapping email content in a high-contrast, mobile- & dark-mode resilient layout
function wrapAimaLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${title}</title>
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #111827 !important; }
      .dark-card { background-color: #1f2937 !important; border-color: #374151 !important; }
      .dark-text { color: #f9fafb !important; }
      .dark-muted { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; width: 100%;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f2942; padding: 28px 32px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #93c5fd !important; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      All India Management Association
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff !important; margin: 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      AIMA India Case League 2026
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content Area -->
          <tr>
            <td style="padding: 32px 32px 28px; background-color: #ffffff; color: #374151; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #1e293b;">AIMA Case Research Centre (ICRC)</p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                For queries or support, contact: <a href="mailto:sjames@aima.in" style="color: #2563eb !important; font-weight: 600; text-decoration: underline;"><span style="color: #2563eb !important;">sjames@aima.in</span></a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML Email Templates (In Code)
// ─────────────────────────────────────────────────────────────────────────────

export function getRegistrationConfirmationEmail(p: {
  toName: string;
  regNumber: string;
  teamName: string;
  instituteName: string;
  username?: string;
  password?: string;
  loginUrl: string;
  isIndividual?: boolean;
  roleInTeam?: string;
}): { subject: string; html: string; text: string } {
  const isSolo = p.isIndividual || p.teamName?.toLowerCase().includes('individual') || p.teamName?.toLowerCase().includes('solo');
  const subject = `Welcome to AIMA–ICRC India Case League 2026 (South Zone) - Login Credentials (${p.regNumber})`;

  const loginPageUrl = p.loginUrl.includes('/login') ? p.loginUrl : `${p.loginUrl.replace(/\/$/, '')}/login`;
  const username = p.username || 'Your registered email';
  const password = p.password || 'Contact administrator';
  const participantName = p.toName || 'Participant';

  const html = wrapAimaLayout(
    subject,
    `
    <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Dear ${participantName},</div>
    
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #1e293b;">
      <strong style="color: #0f172a;">Greetings from AIMA–India Case Research Centre (ICRC)!</strong>
    </p>
    
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      We are delighted to welcome you to the <strong style="color: #0f172a;">AIMA–ICRC India Case League 2026 – South Zone Student Case Competition</strong>, being organised in collaboration with <strong style="color: #0f172a;">ICFAI Business School (IBS), Bengaluru</strong>, on <strong style="color: #0f172a;">Thursday, 29 October 2026</strong>.
    </p>
    
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Thank you for registering for this exciting initiative. The India Case League aims to bring students together to apply classroom learning to real-world business challenges, demonstrate analytical and decision-making abilities, and present innovative solutions before an academic and industry jury.
    </p>
    
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      We look forward to your enthusiastic participation in this day-long competition.
    </p>

    <!-- High-Contrast Clean Credentials Card (100% Readable on Mobile Light & Dark Mode) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 26px 0; background-color: #f8fafc; border: 2px solid #2563eb; border-radius: 10px; overflow: hidden;">
      <tr>
        <td style="background-color: #1e40af; padding: 12px 20px;">
          <span style="color: #ffffff !important; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            🔑 Your Participant Portal Login Credentials
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; background-color: #ffffff;">
          <table width="100%" cellpadding="8" cellspacing="0" border="0" style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            
            <!-- Portal Link -->
            <tr>
              <td style="width: 36%; color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9; padding: 10px 6px;">Portal Login Link:</td>
              <td style="width: 64%; border-bottom: 1px solid #f1f5f9; vertical-align: top; padding: 10px 6px;">
                <a href="${loginPageUrl}" target="_blank" style="color: #1d4ed8 !important; font-weight: 700; text-decoration: underline; word-break: break-all;">
                  <span style="color: #1d4ed8 !important; font-weight: 700;">${loginPageUrl}</span>
                </a>
              </td>
            </tr>

            <!-- Username -->
            <tr>
              <td style="color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9; padding: 10px 6px;">Username / Email:</td>
              <td style="color: #0f172a; font-weight: 800; word-break: break-all; border-bottom: 1px solid #f1f5f9; vertical-align: top; padding: 10px 6px;">
                <span style="color: #0f172a;">${username}</span>
              </td>
            </tr>

            <!-- Password (High-Contrast Amber Badge) -->
            <tr>
              <td style="color: #475569; font-weight: 600; vertical-align: middle; border-bottom: 1px solid #f1f5f9; padding: 10px 6px;">Password:</td>
              <td style="border-bottom: 1px solid #f1f5f9; vertical-align: middle; padding: 10px 6px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background-color: #fef3c7; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 5px 12px;">
                      <span style="color: #92400e !important; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 800; letter-spacing: 1.2px;">
                        ${password}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Registration Ref -->
            <tr>
              <td style="color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9; padding: 10px 6px;">Registration Ref:</td>
              <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; vertical-align: top; padding: 10px 6px;">
                <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 13px;">${p.regNumber}</span>
              </td>
            </tr>

            <!-- Track / Team -->
            <tr>
              <td style="color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9; padding: 10px 6px;">${isSolo ? 'Track:' : 'Team Name:'}</td>
              <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; vertical-align: top; padding: 10px 6px;">
                <span style="color: #0f172a;">${p.teamName || (isSolo ? 'Solo / Individual' : 'Team')}</span>
              </td>
            </tr>

            <!-- Institution -->
            <tr>
              <td style="color: #475569; font-weight: 600; vertical-align: top; ${p.roleInTeam ? 'border-bottom: 1px solid #f1f5f9;' : ''} padding: 10px 6px;">Institution:</td>
              <td style="color: #0f172a; font-weight: 700; vertical-align: top; ${p.roleInTeam ? 'border-bottom: 1px solid #f1f5f9;' : ''} padding: 10px 6px;">
                <span style="color: #0f172a;">${p.instituteName}</span>
              </td>
            </tr>

            ${p.roleInTeam ? `
            <tr>
              <td style="color: #475569; font-weight: 600; vertical-align: top; padding: 10px 6px;">Role in Team:</td>
              <td style="color: #0f172a; font-weight: 700; vertical-align: top; padding: 10px 6px;">
                <span style="color: #0f172a;">${p.roleInTeam}</span>
              </td>
            </tr>
            ` : ''}

          </table>
        </td>
      </tr>
    </table>

    <!-- Bulletproof CTA Button -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
      <tr>
        <td align="center">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #1e40af;">
                <a href="${loginPageUrl}" target="_blank" style="background-color: #1e40af; border: 14px solid #1e40af; padding: 0 24px; color: #ffffff !important; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
                  <span style="color: #ffffff !important; font-weight: bold;">Access Participant Login Portal &rarr;</span>
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Venue and Reporting Details Card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 5px solid #1e40af; border-radius: 8px; margin: 26px 0;">
      <tr>
        <td style="padding: 20px 22px;">
          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            📍 Venue and Reporting Details
          </div>
          
          <table width="100%" cellpadding="5" cellspacing="0" border="0" style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <tr>
              <td style="width: 32%; font-weight: 600; color: #475569; vertical-align: top;">Date:</td>
              <td style="font-weight: 700; color: #0f172a; vertical-align: top;">Thursday, 29 October 2026</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #475569; vertical-align: top;">Reporting Time:</td>
              <td style="font-weight: 700; color: #0f172a; vertical-align: top;">9:00 AM</td>
            </tr>
            <tr>
              <td style="font-weight: 600; color: #475569; vertical-align: top;">Programme Duration:</td>
              <td style="font-weight: 700; color: #0f172a; vertical-align: top;">9:00 AM – 6:00 PM</td>
            </tr>
          </table>

          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 13px; line-height: 1.6; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px; font-size: 13px;">Venue:</strong>
            ICFAI Business School (IBS), Bengaluru<br/>
            ICFAI Foundation for Higher Education (IFHE)<br/>
            #231, Near Check Post, Mysore Road,<br/>
            Kengeri, Bengaluru – 560060, Karnataka
          </div>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px; line-height: 1.5;">
      Please ensure you log into the participant portal before the reporting date to review preparatory guidelines and check competition materials.
    </p>
    `
  );

  const text = `Dear ${participantName},\n\nGreetings from AIMA–India Case Research Centre (ICRC)!\n\nWe are delighted to welcome you to the AIMA–ICRC India Case League 2026 – South Zone Student Case Competition, being organised in collaboration with ICFAI Business School (IBS), Bengaluru, on Thursday, 29 October 2026.\n\nThank you for registering for this exciting initiative. The India Case League aims to bring students together to apply classroom learning to real-world business challenges, demonstrate analytical and decision-making abilities, and present innovative solutions before an academic and industry jury.\n\nWe look forward to your enthusiastic participation in this day-long competition.\n\nYOUR PARTICIPANT PORTAL LOGIN CREDENTIALS:\nPortal Login Link: ${loginPageUrl}\nUsername / Email: ${username}\nPassword: ${password}\nRegistration Ref: ${p.regNumber}\n${isSolo ? 'Track: Solo / Individual' : 'Team: ' + p.teamName}\nInstitution: ${p.instituteName}\n\nVENUE AND REPORTING DETAILS:\nDate: Thursday, 29 October 2026\nReporting Time: 9:00 AM\nProgramme Duration: 9:00 AM – 6:00 PM\n\nVenue:\nICFAI Business School (IBS), Bengaluru\nICFAI Foundation for Higher Education (IFHE)\n#231, Near Check Post, Mysore Road,\nKengeri, Bengaluru – 560060, Karnataka\n\nAIMA Case Research Centre (ICRC)`;

  return { subject, html, text };
}

export function getTeamMemberEmail(p: {
  toName: string;
  teamName: string;
  loginEmail: string;
  tempPassword: string;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Your Credentials for Team ${p.teamName} - AIMA India Case League 2026`;
  const html = wrapAimaLayout(
    subject,
    `
    <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Dear ${p.toName},</div>
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      You have been enrolled as an official team member for <strong style="color: #0f172a;">"${p.teamName}"</strong> in the <strong style="color: #0f172a;">AIMA India Case League 2026</strong>.
    </p>
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Please find your portal credentials below:
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0; background-color: #ffffff; border: 2px solid #2563eb; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="background-color: #1e40af; padding: 10px 18px;">
          <span style="color: #ffffff !important; font-size: 13px; font-weight: 700; text-transform: uppercase;">Portal Credentials</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px;">
          <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 14px;">
            <tr>
              <td style="width: 35%; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Portal URL:</td>
              <td style="border-bottom: 1px solid #f1f5f9;">
                <a href="${p.loginUrl}" target="_blank" style="color: #1d4ed8 !important; font-weight: 700; text-decoration: underline;">
                  <span style="color: #1d4ed8 !important;">${p.loginUrl}</span>
                </a>
              </td>
            </tr>
            <tr>
              <td style="color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Login Email:</td>
              <td style="color: #0f172a; font-weight: 800; border-bottom: 1px solid #f1f5f9;">${p.loginEmail}</td>
            </tr>
            <tr>
              <td style="color: #475569; font-weight: 600;">Password:</td>
              <td>
                <span style="display: inline-block; background-color: #fef3c7; color: #92400e !important; border: 1.5px solid #f59e0b; padding: 4px 10px; border-radius: 5px; font-family: monospace; font-size: 15px; font-weight: 800;">
                  ${p.tempPassword}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${p.loginUrl}" target="_blank" style="background-color: #1e40af; border: 12px solid #1e40af; padding: 0 24px; color: #ffffff !important; display: inline-block; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px;">
            <span style="color: #ffffff !important;">Log In Now &rarr;</span>
          </a>
        </td>
      </tr>
    </table>
    `
  );

  const text = `Dear ${p.toName},\n\nYou have been added to Team "${p.teamName}" for AIMA India Case League 2026.\n\nLogin: ${p.loginEmail}\nPassword: ${p.tempPassword}\nPortal: ${p.loginUrl}\n\nAIMA Case Research Centre`;
  return { subject, html, text };
}

export function getR1ResultsEmail(p: {
  toName: string;
  teamName: string;
  score: number;
  qualified: boolean;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Round 1 Preliminary Results - Team ${p.teamName}`;
  const statusBadge = p.qualified
    ? `<span style="background-color: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 4px; font-weight: 700; border: 1px solid #bbf7d0;">QUALIFIED for Round 2</span>`
    : `<span style="background-color: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 4px; font-weight: 700; border: 1px solid #e2e8f0;">Did Not Advance</span>`;

  const html = wrapAimaLayout(
    subject,
    `
    <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Dear ${p.toName},</div>
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      The preliminary evaluation for Round 1 of the AIMA India Case League 2026 is complete.
    </p>
    
    <table width="100%" cellpadding="8" cellspacing="0" border="0" style="margin: 22px 0; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
      <tr>
        <td style="width: 35%; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Team:</td>
        <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${p.teamName}</td>
      </tr>
      <tr>
        <td style="color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Round 1 Score:</td>
        <td style="color: #0f172a; font-weight: 800; font-size: 16px; border-bottom: 1px solid #e2e8f0;">${p.score} pts</td>
      </tr>
      <tr>
        <td style="color: #475569; font-weight: 600;">Status:</td>
        <td>${statusBadge}</td>
      </tr>
    </table>

    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      ${p.qualified ? "Congratulations! Your team has qualified for Round 2. Check your team portal for the Round 2 case deck prompt and submission guidelines." : "Thank you for your active participation in Round 1. We commend your team's effort and dedication."}
    </p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${p.loginUrl}" target="_blank" style="background-color: #1e40af; border: 12px solid #1e40af; padding: 0 24px; color: #ffffff !important; display: inline-block; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px;">
            <span style="color: #ffffff !important;">View Leaderboard & Feedback &rarr;</span>
          </a>
        </td>
      </tr>
    </table>
    `
  );

  const text = `Dear ${p.toName},\n\nRound 1 results for Team "${p.teamName}":\nScore: ${p.score}\nStatus: ${p.qualified ? "QUALIFIED for Round 2" : "Did Not Advance"}\n\nView details: ${p.loginUrl}\n\nAIMA Case Research Centre`;
  return { subject, html, text };
}

export function getFinalResultsEmail(p: {
  toName: string;
  teamName: string;
  achievement: string;
  certNumber: string;
  certVerifyUrl: string;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Official Results & Certificate - AIMA India Case League 2026`;
  const html = wrapAimaLayout(
    subject,
    `
    <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Dear ${p.toName},</div>
    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      The All India Management Association (AIMA) proudly announces the conclusion of the <strong style="color: #0f172a;">AIMA India Case League 2026</strong>.
    </p>
    
    <table width="100%" cellpadding="8" cellspacing="0" border="0" style="margin: 22px 0; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
      <tr>
        <td style="width: 35%; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Team:</td>
        <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${p.teamName}</td>
      </tr>
      <tr>
        <td style="color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Achievement:</td>
        <td style="color: #b45309; font-weight: 800; font-size: 15px; border-bottom: 1px solid #e2e8f0;">${p.achievement}</td>
      </tr>
      <tr>
        <td style="color: #475569; font-weight: 600;">Certificate ID:</td>
        <td style="color: #0f172a; font-weight: 700; font-family: monospace;">${p.certNumber}</td>
      </tr>
    </table>

    <p style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Your verified digital certificate of completion/excellence is now ready:
    </p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${p.certVerifyUrl}" target="_blank" style="background-color: #16a34a; border: 12px solid #16a34a; padding: 0 24px; color: #ffffff !important; display: inline-block; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px;">
            <span style="color: #ffffff !important;">Download Verified Certificate &rarr;</span>
          </a>
        </td>
      </tr>
    </table>
    `
  );

  const text = `Dear ${p.toName},\n\nAIMA India Case League 2026 Results:\nTeam: ${p.teamName}\nAchievement: ${p.achievement}\nCertificate ID: ${p.certNumber}\n\nCertificate Link: ${p.certVerifyUrl}\n\nAIMA Case Research Centre`;
  return { subject, html, text };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      replyTo: SMTP_REPLY_TO,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });
    console.info(`[Email Sent] Message to ${to} id: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email Error] Failed to send email to ${to}:`, error.message);
    throw error;
  }
}
