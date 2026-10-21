const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config({ path: './.env' });

// Polyfill WebSocket for Node runtime
globalThis.WebSocket = WebSocket;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://setjjgjhuslevgnqcnhj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY is required to seed users.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper to decode legacy password hash (base64 + salt)
function decodeLegacyPassword(hash) {
  if (!hash) return null;
  try {
    const base64 = hash.replace(/^aima_/, '');
    return decodeURIComponent(escape(Buffer.from(base64, 'base64').toString('binary')));
  } catch (e) {
    return null;
  }
}

// Generate default password if none is found
function generateFallbackPassword(name, mobile) {
  const first = (name || 'aima').trim().split(' ')[0].toLowerCase();
  const last4 = (mobile || '2026').replace(/\D/g, '').slice(-4) || '2026';
  return `${first}@${last4}#AIMA2026`;
}

async function seedAllUsers() {
  console.log('--- Starting Safe Multi-Role User Seeding ---');
  console.log('Supabase Target:', SUPABASE_URL);

  // 1. Fetch current auth users to avoid duplicates
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list existing auth users:', listError);
    process.exit(1);
  }

  const existingAuthMap = new Map();
  (listData.users || []).forEach((u) => {
    if (u.email) existingAuthMap.set(u.email.toLowerCase().trim(), u);
  });
  console.log(`Found ${existingAuthMap.size} existing auth.users.`);

  // Function to create or update auth user and profile
  async function upsertUser({ email, password, role, name, mobile, orgName, regNumber, isLeader, program, semester, enrolment }) {
    const cleanEmail = email.toLowerCase().trim();
    let authUser = existingAuthMap.get(cleanEmail);

    if (!authUser) {
      console.log(`Creating auth.users account for: ${cleanEmail} (${role})`);
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { role, name },
      });

      if (createError) {
        console.error(`  Error creating auth user for ${cleanEmail}:`, createError.message);
        return false;
      }
      authUser = created.user;
      existingAuthMap.set(cleanEmail, authUser);
    } else {
      console.log(`Updating existing auth account: ${cleanEmail} (${role})`);
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: password,
        user_metadata: { role, name },
      });
    }

    // Upsert into public.profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: authUser.id,
      email: cleanEmail,
      role: role,
      name: name || cleanEmail.split('@')[0],
      mobile: mobile || null,
      organization_name: orgName || null,
      registration_number: regNumber || null,
      program: program || null,
      semester: semester || null,
      enrolment_number: enrolment || null,
      is_team_leader: !!isLeader,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileError) {
      console.warn(`  Notice updating profile for ${cleanEmail}:`, profileError.message);
    } else {
      console.log(`  Profile upserted for ${cleanEmail}`);
    }
    return true;
  }

  // A. Seed Super Admin (admin@aima.in)
  console.log('\n[1/4] Seeding Secretariat Super Admin...');
  await upsertUser({
    email: 'admin@aima.in',
    password: 'case-aima@123#league',
    role: 'admin',
    name: 'Dr. Rajan Saxena',
    mobile: '+91 98111 00000',
    orgName: 'AIMA Secretariat HQ',
    regNumber: 'AIMA-HQ-ADMIN',
    isLeader: false,
  });

  // B. Seed Real Participants from Backups
  console.log('\n[2/4] Seeding 36 Real Participants from backup...');
  const participantsFile = './backups/participants_backup_1792472725029.json';
  if (fs.existsSync(participantsFile)) {
    const participants = JSON.parse(fs.readFileSync(participantsFile, 'utf8'));
    console.log(`Loaded ${participants.length} participants from backup.`);

    for (const p of participants) {
      if (!p.email) continue;
      const decodedPassword = decodeLegacyPassword(p.password_hash) || generateFallbackPassword(p.name, p.mobile);
      await upsertUser({
        email: p.email,
        password: decodedPassword,
        role: p.is_team_leader ? 'team_leader' : 'student',
        name: p.name,
        mobile: p.mobile,
        orgName: p.institute_name,
        regNumber: p.registration_number,
        isLeader: p.is_team_leader,
        program: p.program,
        semester: p.semester,
        enrolment: p.enrolment_number,
      });
    }
  }

  // C. Seed Registered Nominees & Coordinators from Registrations Backup
  console.log('\n[3/4] Seeding Nominees from 28 Real Registrations backup...');
  const registrationsFile = './backups/registrations_backup_1792472711718.json';
  if (fs.existsSync(registrationsFile)) {
    const regs = JSON.parse(fs.readFileSync(registrationsFile, 'utf8'));
    console.log(`Loaded ${regs.length} registrations from backup.`);

    for (const r of regs) {
      // If institutional, also seed coordinator account
      if (r.registration_mode === 'institute' && r.coordinator_email) {
        const coordPass = generateFallbackPassword(r.coordinator_name || 'Coordinator', r.coordinator_phone || '2026');
        await upsertUser({
          email: r.coordinator_email,
          password: coordPass,
          role: 'institute_coordinator',
          name: r.coordinator_name || 'Institute Coordinator',
          mobile: r.coordinator_phone,
          orgName: r.institute_name,
          regNumber: r.registration_number,
          isLeader: false,
        });
      }

      // Nominees
      if (Array.isArray(r.nominees)) {
        for (const n of r.nominees) {
          if (!n.email) continue;
          const pass = n.password || generateFallbackPassword(n.name, n.mobile);
          await upsertUser({
            email: n.email,
            password: pass,
            role: n.isTeamLeader ? 'team_leader' : 'student',
            name: n.name,
            mobile: n.mobile,
            orgName: r.institute_name,
            regNumber: r.registration_number,
            isLeader: n.isTeamLeader,
            program: n.program,
            semester: n.semester,
            enrolment: n.enrolmentNumber,
          });
        }
      }
    }
  }

  // D. Seed Default Jury Evaluators
  console.log('\n[4/4] Seeding Primary Jury Evaluators...');
  const defaultJury = [
    { email: 'eval.vikram@iima.ac.in', name: 'Prof. Vikramaditya Rathore', org: 'IIM Ahmedabad', mobile: '+91 98220 11001' },
    { email: 'eval.nandini@isb.edu', name: 'Dr. Nandini Sundaram', org: 'Indian School of Business', mobile: '+91 98220 11002' },
    { email: 'eval.rajeshwari@mckinsey.com', name: 'Rajeshwari Iyer', org: 'McKinsey & Company', mobile: '+91 98220 11003' },
    { email: 'eval.amitav@bain.com', name: 'Amitav Ghosh', org: 'Bain & Company', mobile: '+91 98220 11004' },
  ];

  for (const j of defaultJury) {
    const juryPass = 'Jury@AIMA2026';
    await upsertUser({
      email: j.email,
      password: juryPass,
      role: 'evaluator',
      name: j.name,
      mobile: j.mobile,
      orgName: j.org,
      regNumber: 'AIMA-JURY-2026',
      isLeader: false,
    });
  }

  console.log('\n=== Multi-Role Seeding Complete! Real User Data Safely Preserved. ===\n');
}

seedAllUsers().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
