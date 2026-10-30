import { createClient } from '@supabase/supabase-js';

// Polyfill WebSocket for Node 20 if running without --experimental-websocket
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class FakeWebSocket {
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://setjjgjhuslevgnqcnhj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false },
});

interface NomineeInfo {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isLeader?: boolean;
}

async function runMigration() {
  console.log('--- Starting All Teams Certificate Synchronization ---');

  // 1. Fetch all registrations
  const { data: registrations, error: regErr } = await supabase
    .from('registrations')
    .select('*');

  if (regErr || !registrations) {
    console.error('Failed to fetch registrations:', regErr);
    process.exit(1);
  }
  console.log(`Fetched ${registrations.length} registrations from Supabase.`);

  // 2. Fetch all participants to enrich team rosters
  const { data: participants, error: partErr } = await supabase
    .from('participants')
    .select('*');

  if (partErr) {
    console.warn('Warning: Could not fetch participants table:', partErr);
  } else {
    console.log(`Fetched ${participants?.length || 0} participants from Supabase.`);
  }

  // 3. Fetch quiz_programs for existing publishedCertificates
  const { data: programRow, error: progErr } = await supabase
    .from('quiz_programs')
    .select('*')
    .eq('id', 'qp_case_comp_stage1_2026')
    .single();

  let existingProgramEligibility: any = {};
  let currentPublishedCerts: any[] = [];
  if (programRow?.eligibility) {
    try {
      existingProgramEligibility = JSON.parse(programRow.eligibility);
      if (Array.isArray(existingProgramEligibility?.publishedCertificates)) {
        currentPublishedCerts = existingProgramEligibility.publishedCertificates;
      }
    } catch (e) {
      console.warn('Could not parse quiz_programs eligibility:', e);
    }
  }
  console.log(`Found ${currentPublishedCerts.length} published certificates currently in quiz_programs.`);

  // Map existing published certificates by certificateNumber / id / registrationNumber
  const publishedMap = new Map<string, any>();
  for (const c of currentPublishedCerts) {
    if (c?.certificateNumber) publishedMap.set(c.certificateNumber, c);
  }

  const allUpdatedCertificates: any[] = [];
  let updatedTeamCount = 0;
  let updatedMemberCertCount = 0;

  for (const reg of registrations) {
    const raw = reg.raw_data || {};
    const regNum = reg.registration_number;
    const regSuffix = regNum.replace('AIMA-CL26-', '').replace('AIMA-CL26', '00000');
    const isTeam = reg.registration_mode === 'team' || Boolean(reg.team_name) || (raw.nominees && raw.nominees.length > 1);
    const teamName = reg.team_name || raw.teamName || reg.candidate_name;
    const instituteName = reg.institute_name || raw.instituteName || 'ICFAI Business School';

    // Build authoritative roster for this registration
    const members: NomineeInfo[] = [];

    if (Array.isArray(raw.nominees) && raw.nominees.length > 0) {
      raw.nominees.forEach((nom: any, idx: number) => {
        if (nom && nom.name) {
          members.push({
            name: String(nom.name).trim(),
            email: String(nom.email || '').toLowerCase().trim(),
            phone: nom.phone || nom.mobile,
            role: idx === 0 || nom.role === 'Team Leader' ? 'Team Leader' : 'Squad Member',
            isLeader: idx === 0 || nom.role === 'Team Leader',
          });
        }
      });
    }

    // Merge in any members from participants table
    if (participants && participants.length > 0) {
      const regParts = participants.filter((p: any) =>
        p.registration_number === regNum ||
        (reg.team_name && p.team_name && p.team_name.toLowerCase().trim() === reg.team_name.toLowerCase().trim())
      );
      for (const p of regParts) {
        const pEmail = (p.email || '').toLowerCase().trim();
        const existing = members.find(m => m.email === pEmail);
        if (!existing && p.name) {
          members.push({
            name: String(p.name).trim(),
            email: pEmail,
            phone: p.phone,
            role: p.role || 'Squad Member',
            isLeader: p.role === 'Team Leader',
          });
        }
      }
    }

    // Fallback if no nominees array exists
    if (members.length === 0) {
      members.push({
        name: String(reg.candidate_name).trim(),
        email: String(reg.candidate_email || '').toLowerCase().trim(),
        phone: reg.candidate_phone,
        role: isTeam ? 'Team Leader' : 'Solo Participant',
        isLeader: true,
      });
    }

    const allMemberNames = members.map(m => m.name.toUpperCase());
    const memberNamesDisplay = allMemberNames.join(', ');

    // Check if team or candidate is an official Grand Finalist / Winner
    const existingTeamCert =
      (raw.certificates && Array.isArray(raw.certificates) && raw.certificates.find((c: any) =>
        c.type === 'SELECTION_FINALE' || c.type === 'ACHIEVEMENT_TOP1' || c.certificateCategory === 'selection' || c.certificateCategory === 'achievement' ||
        (c.achievement && (c.achievement.includes('GRAND FINALE') || c.achievement.includes('TOP 1') || c.achievement.includes('WINNER') || c.achievement.includes('SELECTION')))
      )) ||
      (raw.certificate && (
        raw.certificate.type === 'SELECTION_FINALE' || raw.certificate.type === 'ACHIEVEMENT_TOP1' || raw.certificate.certificateCategory === 'selection' || raw.certificate.certificateCategory === 'achievement' ||
        (raw.certificate.achievement && (raw.certificate.achievement.includes('GRAND FINALE') || raw.certificate.achievement.includes('TOP 1') || raw.certificate.achievement.includes('WINNER') || raw.certificate.achievement.includes('SELECTION')))
      ) ? raw.certificate : null) ||
      currentPublishedCerts.find((c: any) =>
        c.registrationNumber === regNum &&
        (c.type === 'SELECTION_FINALE' || c.type === 'ACHIEVEMENT_TOP1' || c.certificateCategory === 'selection' || c.certificateCategory === 'achievement' ||
         (c.achievement && (c.achievement.includes('GRAND FINALE') || c.achievement.includes('TOP 1') || c.achievement.includes('WINNER') || c.achievement.includes('SELECTION'))))
      );

    const regCerts: any[] = [];

    if (existingTeamCert) {
      // 1. GRAND FINALIST / WINNER: Issue ONLY the official Team Grand Finale / Top 1 Certificate with all team members
      const isWinner = existingTeamCert.achievement?.includes('WINNER') || existingTeamCert.achievement?.includes('TOP 1') || existingTeamCert.certificateCategory === 'achievement';
      const cleanCertNum = existingTeamCert.certificateNumber ? existingTeamCert.certificateNumber.replace(/-M\d+$/, '') : `AIMA-ICL-2026-${isWinner ? 'ACH' : 'SEL'}-${regSuffix}`;

      const selectionCert = {
        ...existingTeamCert,
        id: existingTeamCert.id ? existingTeamCert.id.replace(/-m\d+$/, '') : `cert-selection-${regNum}`,
        certificateNumber: cleanCertNum,
        recipientName: isTeam ? teamName : members[0].name.toUpperCase(),
        recipientEmail: reg.candidate_email || members[0]?.email,
        recipientRole: isTeam ? 'Grand Finalist Team' : 'Grand Finalist',
        teamName: isTeam ? teamName : undefined,
        teamMembers: isTeam ? allMemberNames : undefined,
        memberNamesDisplay: isTeam ? memberNamesDisplay : undefined,
        institute: instituteName.toUpperCase(),
        stage: 'grand_finale',
        achievement: isWinner ? 'CERTIFICATE OF ACHIEVEMENT - TOP 1 POSITION' : 'CERTIFICATE OF SELECTION - GRAND FINALE',
        certificateCategory: isWinner ? 'achievement' : 'selection',
        type: isWinner ? 'ACHIEVEMENT_TOP1' : 'SELECTION_FINALE',
        issueDate: existingTeamCert.issueDate || '29 October 2026',
        eventDate: existingTeamCert.eventDate || '29 October 2026',
        venue: 'ICFAI Foundation for Higher Education (IFHE), Bangalore',
        track: raw.selectedTrackName || existingTeamCert.track || 'India Case League 2026',
        qrVerificationUrl: `https://research.aima.in/verify/${cleanCertNum}`,
        registrationNumber: regNum,
        status: 'issued',
      };

      regCerts.push(selectionCert);
      allUpdatedCertificates.push(selectionCert);
      updatedMemberCertCount++;

      // In raw.nominees, attach the official Grand Finale selection certificate to all members
      let updatedNominees = raw.nominees;
      if (Array.isArray(updatedNominees)) {
        updatedNominees = updatedNominees.map((nom: any) => ({
          ...nom,
          certificate: selectionCert,
        }));
      }

      const updatedRaw = {
        ...raw,
        certificate: selectionCert,
        certificates: [selectionCert],
        nominees: updatedNominees,
        isCertificatePublished: true,
        certificatePublishedAt: raw.certificatePublishedAt || new Date().toISOString(),
      };

      const { error: updErr } = await supabase
        .from('registrations')
        .update({ raw_data: updatedRaw })
        .eq('id', reg.id);

      if (updErr) {
        console.error(`Failed to update Grand Finalist registration ${regNum}:`, updErr);
      } else {
        updatedTeamCount++;
        console.log(`[GRAND FINALIST UPDATED] ${regNum} | Team: "${teamName}" | Members: [${memberNamesDisplay}] | Cert: ${selectionCert.certificateNumber} (${selectionCert.achievement})`);
      }
    } else {
      // 2. NON-GRAND FINALIST: Issue personalized Participation Certificate to each squad member
      members.forEach((member, mIdx) => {
        const certId = `cert-${regNum}-m${mIdx + 1}`;
        const certNum = `AIMA-ICL-2026-PAR-${regSuffix}-${String(mIdx + 1).padStart(3, '0')}`;

        const existing =
          (raw.certificates && Array.isArray(raw.certificates) && raw.certificates.find((c: any) => c.recipientEmail?.toLowerCase() === member.email)) ||
          (raw.nominees && Array.isArray(raw.nominees) && raw.nominees.find((n: any) => n.email?.toLowerCase() === member.email)?.certificate) ||
          currentPublishedCerts.find((c: any) => c.registrationNumber === regNum && c.recipientEmail?.toLowerCase() === member.email);

        const partCert = {
          id: existing?.id || certId,
          certificateNumber: existing?.certificateNumber || certNum,
          recipientName: member.name.toUpperCase(),
          recipientEmail: member.email,
          recipientRole: member.role || (member.isLeader ? 'Team Leader' : 'Squad Member'),
          teamName: isTeam ? teamName : undefined,
          teamMembers: isTeam ? allMemberNames : undefined,
          memberNamesDisplay: isTeam ? memberNamesDisplay : undefined,
          institute: instituteName.toUpperCase(),
          stage: 'round_1',
          achievement: 'CERTIFICATE OF PARTICIPATION',
          certificateCategory: 'participation',
          type: 'PARTICIPATION',
          issueDate: existing?.issueDate || '29 October 2026',
          eventDate: existing?.eventDate || '29 October 2026',
          venue: 'ICFAI Foundation for Higher Education (IFHE), Bangalore',
          track: raw.selectedTrackName || existing?.track || 'India Case League 2026',
          score: existing?.score,
          percentage: existing?.percentage,
          status: 'issued',
          registrationNumber: regNum,
        };

        regCerts.push(partCert);
        allUpdatedCertificates.push(partCert);
        updatedMemberCertCount++;
      });

      // Attach to nominees inside raw.nominees
      let updatedNominees = raw.nominees;
      if (Array.isArray(updatedNominees)) {
        updatedNominees = updatedNominees.map((nom: any) => {
          const nomEmail = (nom.email || '').toLowerCase().trim();
          const personalCert = regCerts.find(c => c.recipientEmail?.toLowerCase().trim() === nomEmail);
          return personalCert ? { ...nom, certificate: personalCert } : nom;
        });
      }

      const primaryCert =
        regCerts.find(c => c.recipientRole === 'Team Leader') ||
        regCerts[0];

      const updatedRaw = {
        ...raw,
        certificate: primaryCert,
        certificates: regCerts,
        nominees: updatedNominees,
        isCertificatePublished: true,
        certificatePublishedAt: raw.certificatePublishedAt || new Date().toISOString(),
      };

      const { error: updErr } = await supabase
        .from('registrations')
        .update({ raw_data: updatedRaw })
        .eq('id', reg.id);

      if (updErr) {
        console.error(`Failed to update registration ${regNum}:`, updErr);
      } else {
        updatedTeamCount++;
        if (teamName === 'CRESCENT TECH' || updatedTeamCount <= 5) {
          console.log(`[PARTICIPATION UPDATED] ${regNum} | Team: "${teamName}" | Members: [${memberNamesDisplay}] | Certs: ${regCerts.length}`);
        }
      }
    }
  }

  // 4. Update quiz_programs with the complete array of all updated certificates
  console.log(`\nTotal generated certificates across all candidates: ${allUpdatedCertificates.length}`);
  const updatedEligibilityPayload = JSON.stringify({
    ...existingProgramEligibility,
    publishedCertificates: allUpdatedCertificates,
    publishedAt: existingProgramEligibility.publishedAt || new Date().toISOString(),
    lastSynchronizedAt: new Date().toISOString(),
  });

  const { error: progUpdateErr } = await supabase
    .from('quiz_programs')
    .update({ eligibility: updatedEligibilityPayload, updated_at: new Date().toISOString() })
    .eq('id', 'qp_case_comp_stage1_2026');

  if (progUpdateErr) {
    console.error('Failed to update quiz_programs table:', progUpdateErr);
  } else {
    console.log('Successfully updated quiz_programs with all published team & individual certificates!');
  }

  console.log('\n--- Migration Complete ---');
  console.log(`Registrations processed & updated: ${updatedTeamCount}`);
  console.log(`Individual Member Certificates generated: ${updatedMemberCertCount}`);
  console.log(`Total Published Certificates in program: ${allUpdatedCertificates.length}`);
}

runMigration().catch(err => {
  console.error('Migration failed with unexpected error:', err);
  process.exit(1);
});
