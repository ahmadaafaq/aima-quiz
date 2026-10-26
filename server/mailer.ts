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

// Helper for wrapping email content in a consistent AIMA branded layout
function wrapAimaLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.6; }
    .container { max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f2942 0%, #1e40af 100%); padding: 32px 36px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .content { padding: 36px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #0f2942; }
    .info-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; color: #475569; width: 40%; }
    .info-value { font-weight: 700; color: #0f2942; width: 60%; text-align: right; word-break: break-all; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; padding: 13px 32px; background: #1e40af; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px; box-shadow: 0 2px 6px rgba(30,64,175,0.3); }
    .footer { background-color: #f1f5f9; padding: 24px 36px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>All India Management Association</p>
      <h1>AIMA India Case League 2026</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p><strong>AIMA Case Research Centre (ICRC)</strong></p>
      <p>Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003</p>
      <p>For support or queries, contact: <a href="mailto:sjames@aima.in" style="color: #1e40af;">sjames@aima.in</a></p>
    </div>
  </div>
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
    <div class="greeting">Dear ${participantName},</div>
    <p><strong>Greetings from AIMA–India Case Research Centre (ICRC)!</strong></p>
    
    <p>We are delighted to welcome you to the <strong>AIMA–ICRC India Case League 2026 – South Zone Student Case Competition</strong>, being organised in collaboration with <strong>ICFAI Business School (IBS), Bengaluru</strong>, on <strong>Thursday, 29 October 2026</strong>.</p>
    
    <p>Thank you for registering for this exciting initiative. The India Case League aims to bring students together to apply classroom learning to real-world business challenges, demonstrate analytical and decision-making abilities, and present innovative solutions before an academic and industry jury.</p>
    
    <p>We look forward to your enthusiastic participation in this day-long competition.</p>

    <!-- Credentials Card -->
    <div style="background: linear-gradient(135deg, #0f2942 0%, #1e40af 100%); color: #ffffff; border-radius: 8px; padding: 22px 26px; margin: 26px 0; box-shadow: 0 4px 14px rgba(30, 64, 175, 0.25);">
      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px;">
        🔑 Your Participant Portal Login Credentials
      </div>
      <table width="100%" cellpadding="6" cellspacing="0" style="color: #ffffff; font-size: 14px;">
        <tr>
          <td style="width: 38%; color: #bfdbfe; font-weight: 600;">Portal Login Link:</td>
          <td style="width: 62%; font-weight: 700;"><a href="${loginPageUrl}" style="color: #ffffff; text-decoration: underline;" target="_blank">${loginPageUrl}</a></td>
        </tr>
        <tr>
          <td style="color: #bfdbfe; font-weight: 600;">Username / Email:</td>
          <td style="font-weight: 700; word-break: break-all;">${username}</td>
        </tr>
        <tr>
          <td style="color: #bfdbfe; font-weight: 600;">Password:</td>
          <td><code style="background: rgba(255,255,255,0.22); color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 15px; font-family: monospace; font-weight: bold; letter-spacing: 0.5px;">${password}</code></td>
        </tr>
        <tr>
          <td style="color: #bfdbfe; font-weight: 600;">Registration Ref:</td>
          <td style="font-weight: 700;">${p.regNumber}</td>
        </tr>
        <tr>
          <td style="color: #bfdbfe; font-weight: 600;">${isSolo ? 'Track:' : 'Team Name:'}</td>
          <td style="font-weight: 700;">${p.teamName || (isSolo ? 'Solo / Individual' : 'Team')}</td>
        </tr>
        <tr>
          <td style="color: #bfdbfe; font-weight: 600;">Institution:</td>
          <td style="font-weight: 700;">${p.instituteName}</td>
        </tr>
        ${p.roleInTeam ? `
        <tr>
          <td style="color: #bfdbfe; font-weight: 600;">Role in Team:</td>
          <td style="font-weight: 700;">${p.roleInTeam}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div class="btn-container">
      <a href="${loginPageUrl}" class="btn" target="_blank">Access Participant Login Portal</a>
    </div>

    <!-- Venue and Reporting Details Card -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #1e40af; border-radius: 8px; padding: 22px 24px; margin: 28px 0;">
      <h3 style="margin: 0 0 14px; font-size: 16px; color: #0f2942; font-weight: 700;">📍 Venue and Reporting Details</h3>
      
      <table width="100%" cellpadding="5" cellspacing="0" style="font-size: 14px; color: #1e293b;">
        <tr>
          <td style="width: 32%; font-weight: 600; color: #475569;">Date:</td>
          <td style="font-weight: 700; color: #0f2942;">Thursday, 29 October 2026</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #475569;">Reporting Time:</td>
          <td style="font-weight: 700; color: #0f2942;">9:00 AM</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #475569;">Programme Duration:</td>
          <td style="font-weight: 700; color: #0f2942;">9:00 AM – 6:00 PM</td>
        </tr>
      </table>

      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 13px; line-height: 1.6; color: #334155;">
        <strong style="color: #0f2942; display: block; margin-bottom: 4px;">Venue:</strong>
        ICFAI Business School (IBS), Bengaluru<br>
        ICFAI Foundation for Higher Education (IFHE)<br>
        #231, Near Check Post, Mysore Road,<br>
        Kengeri, Bengaluru – 560060, Karnataka
      </div>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
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
    <div class="greeting">Dear ${p.toName},</div>
    <p>You have been enrolled as an official team member for <strong>"${p.teamName}"</strong> in the <strong>AIMA India Case League 2026</strong>.</p>
    <p>Please find your portal credentials below:</p>
    
    <table class="info-card" width="100%" cellpadding="6" cellspacing="0">
      <tr>
        <td class="info-label">Portal URL:</td>
        <td class="info-value"><a href="${p.loginUrl}" style="color: #1e40af;">${p.loginUrl}</a></td>
      </tr>
      <tr>
        <td class="info-label">Login Email:</td>
        <td class="info-value">${p.loginEmail}</td>
      </tr>
      <tr>
        <td class="info-label">Password:</td>
        <td class="info-value"><code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-size: 15px;">${p.tempPassword}</code></td>
      </tr>
    </table>

    <p>Please log in before Round 1 begins to verify your profile and explore the practice questions.</p>
    <div class="btn-container">
      <a href="${p.loginUrl}" class="btn" target="_blank">Log In Now</a>
    </div>
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
    ? `<span style="color: #15803d; font-weight: 700;">QUALIFIED for Round 2</span>`
    : `<span style="color: #64748b; font-weight: 700;">Did Not Advance</span>`;

  const html = wrapAimaLayout(
    subject,
    `
    <div class="greeting">Dear ${p.toName},</div>
    <p>The preliminary evaluation for Round 1 of the AIMA India Case League 2026 is complete.</p>
    
    <table class="info-card" width="100%" cellpadding="6" cellspacing="0">
      <tr>
        <td class="info-label">Team:</td>
        <td class="info-value">${p.teamName}</td>
      </tr>
      <tr>
        <td class="info-label">Round 1 Score:</td>
        <td class="info-value">${p.score} pts</td>
      </tr>
      <tr>
        <td class="info-label">Status:</td>
        <td class="info-value">${statusBadge}</td>
      </tr>
    </table>

    <p>${p.qualified ? "Congratulations! Your team has qualified for Round 2. Check your team portal for the Round 2 case deck prompt and submission guidelines." : "Thank you for your active participation in Round 1. We commend your team's effort and dedication."}</p>
    
    <div class="btn-container">
      <a href="${p.loginUrl}" class="btn" target="_blank">View Leaderboard & Feedback</a>
    </div>
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
    <div class="greeting">Dear ${p.toName},</div>
    <p>The All India Management Association (AIMA) proudly announces the conclusion of the <strong>AIMA India Case League 2026</strong>.</p>
    
    <table class="info-card" width="100%" cellpadding="6" cellspacing="0">
      <tr>
        <td class="info-label">Team:</td>
        <td class="info-value">${p.teamName}</td>
      </tr>
      <tr>
        <td class="info-label">Achievement:</td>
        <td class="info-value" style="color: #b45309; font-weight: 700;">${p.achievement}</td>
      </tr>
      <tr>
        <td class="info-label">Certificate ID:</td>
        <td class="info-value">${p.certNumber}</td>
      </tr>
    </table>

    <p>Your verified digital certificate of completion/excellence is now ready:</p>
    
    <div class="btn-container">
      <a href="${p.certVerifyUrl}" class="btn" style="background: #16a34a;" target="_blank">Download Verified Certificate</a>
    </div>
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
