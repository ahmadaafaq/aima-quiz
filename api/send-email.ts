import {
  sendEmail,
  getRegistrationConfirmationEmail,
  getTeamMemberEmail,
  getR1ResultsEmail,
  getFinalResultsEmail,
} from '../server/mailer';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const { type, payload } = body;
    if (!type || !payload) {
      return res.status(400).json({ error: 'Missing type or payload' });
    }

    const toEmail = payload.toEmail;
    if (!toEmail) {
      return res.status(400).json({ error: 'Missing recipient toEmail' });
    }

    const loginUrl = payload.loginUrl || process.env.APP_URL || 'https://research.aima.in/login';
    let emailData: { subject: string; html: string; text: string };

    switch (type) {
      case 'registration':
        emailData = getRegistrationConfirmationEmail({
          toName: payload.toName || 'Participant',
          regNumber: payload.registrationNumber || payload.regNumber || '',
          teamName: payload.teamName || '',
          instituteName: payload.instituteName || payload.institute || '',
          username: payload.username || toEmail,
          password: payload.password || '',
          loginUrl,
          isIndividual: Boolean(payload.isIndividual),
          roleInTeam: payload.roleInTeam || '',
        });
        break;
      case 'team_member':
        emailData = getTeamMemberEmail({
          toName: payload.toName || 'Participant',
          teamName: payload.teamName || '',
          loginEmail: payload.loginEmail || toEmail,
          tempPassword: payload.tempPassword || '',
          loginUrl,
        });
        break;
      case 'r1_results':
        emailData = getR1ResultsEmail({
          toName: payload.toName || 'Participant',
          teamName: payload.teamName || '',
          score: Number(payload.score || 0),
          qualified: Boolean(payload.qualified),
          loginUrl,
        });
        break;
      case 'final_results':
        emailData = getFinalResultsEmail({
          toName: payload.toName || 'Participant',
          teamName: payload.teamName || '',
          achievement: payload.achievement || 'Participant',
          certNumber: payload.certNumber || '',
          certVerifyUrl: payload.certVerifyUrl || payload.certUrl || '',
          loginUrl,
        });
        break;
      case 'custom':
        emailData = {
          subject: payload.subject || 'AIMA India Case League 2026 Notification',
          html: payload.html || payload.message || '',
          text: payload.text || '',
        };
        break;
      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    const result = await sendEmail({
      to: toEmail,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return res.status(200).json({ success: true, messageId: result.messageId });
  } catch (err: any) {
    console.error('[API send-email error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch email' });
  }
}
