import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://setjjgjhuslevgnqcnhj.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
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
      } catch {
        body = {};
      }
    }
    body = body || {};

    const { programId, isPublished } = body;
    if (!programId) {
      return res.status(400).json({ error: 'programId is required' });
    }

    const nextPublished = Boolean(isPublished);
    const now = new Date().toISOString();

    // 1. Update quiz_programs table in Supabase
    const { error: progError } = await supabaseAdmin
      .from('quiz_programs')
      .update({
        is_results_published: nextPublished,
        updated_at: now,
      })
      .eq('id', programId);

    if (progError) {
      console.warn('quiz_programs table update error (will try system fallback):', progError.message);
    }

    // 2. Persist publication state to registrations table system config row (universal fallback)
    try {
      const { data: existingSys } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('registration_number', 'AIMA_SYSTEM_QUIZ_CONFIG')
        .maybeSingle();

      const raw = existingSys?.raw_data || {};
      const programOverrides = raw.programOverrides || {};
      programOverrides[programId] = {
        ...(programOverrides[programId] || {}),
        isResultsPublished: nextPublished,
        updatedAt: now,
      };

      if (existingSys) {
        await supabaseAdmin
          .from('registrations')
          .update({
            raw_data: { ...raw, programOverrides },
          })
          .eq('id', existingSys.id);
      } else {
        await supabaseAdmin.from('registrations').insert([
          {
            registration_number: 'AIMA_SYSTEM_QUIZ_CONFIG',
            contact_email: 'system@aima.in',
            team_name: 'AIMA System Settings',
            raw_data: { programOverrides },
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    } catch (sysErr: any) {
      console.warn('registrations system row update warning:', sysErr?.message);
    }

    return res.status(200).json({
      success: true,
      programId,
      isPublished: nextPublished,
      updatedAt: now,
    });
  } catch (err: any) {
    console.error('toggle-publication handler error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
