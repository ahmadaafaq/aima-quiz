// Polyfill WebSocket for Node.js environment
import ws from 'ws';
(globalThis as any).WebSocket = ws;

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function decodePassword(stored: string): string {
  if (!stored) return '';
  if (stored.startsWith('aima_')) {
    try {
      return decodeURIComponent(escape(atob(stored.slice(5))));
    } catch {
      return stored;
    }
  }
  return stored;
}

async function syncPasswords() {
  console.log('Fetching participants...');
  const { data: participants, error: partErr } = await supabase
    .from('participants')
    .select('email, password_hash');

  if (partErr || !participants) {
    console.error('Failed to fetch participants:', partErr?.message);
    return;
  }

  const passMap = new Map<string, string>();
  for (const p of participants) {
    if (p.email && p.password_hash) {
      passMap.set(p.email.toLowerCase().trim(), decodePassword(p.password_hash));
    }
  }
  console.log(`Loaded ${passMap.size} participant passwords.`);

  console.log('Fetching registrations...');
  const { data: registrations, error: regErr } = await supabase
    .from('registrations')
    .select('id, registration_number, raw_data');

  if (regErr || !registrations) {
    console.error('Failed to fetch registrations:', regErr?.message);
    return;
  }

  let updatedCount = 0;

  for (const reg of registrations) {
    const raw = reg.raw_data || {};
    let changed = false;

    if (Array.isArray(raw.nominees)) {
      raw.nominees = raw.nominees.map((nom: any) => {
        if (!nom || !nom.email) return nom;
        const livePass = passMap.get(nom.email.toLowerCase().trim());
        if (livePass && livePass !== nom.password) {
          console.log(`[${reg.registration_number}] Updating nominee ${nom.email}: ${nom.password} -> ${livePass}`);
          changed = true;
          return { ...nom, password: livePass };
        }
        return nom;
      });
    }

    if (raw.participantPassword && Array.isArray(raw.nominees)) {
      const leader = raw.nominees.find((n: any) => n.isTeamLeader) || raw.nominees[0];
      if (leader && leader.email) {
        const livePass = passMap.get(leader.email.toLowerCase().trim());
        if (livePass && livePass !== raw.participantPassword) {
          console.log(`[${reg.registration_number}] Updating lead password: ${raw.participantPassword} -> ${livePass}`);
          changed = true;
          raw.participantPassword = livePass;
        }
      }
    }

    if (changed) {
      const { error: updErr } = await supabase
        .from('registrations')
        .update({ raw_data: raw })
        .eq('id', reg.id);

      if (updErr) {
        console.error(`Failed to update registration ${reg.registration_number}:`, updErr.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Successfully synced ${updatedCount} registrations.`);
}

syncPasswords().catch(console.error);

