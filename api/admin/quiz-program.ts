import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://setjjgjhuslevgnqcnhj.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V';
const DB_SCHEMA = process.env.VITE_DB_SCHEMA || process.env.DB_SCHEMA || 'public';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: DB_SCHEMA },
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

    const now = new Date().toISOString();

    if (req.method === 'POST' || req.method === 'PUT') {
      const { program } = body;
      if (!program || !program.id) {
        return res.status(400).json({ error: 'program payload with id is required' });
      }

      const row: any = {
        id: program.id,
        code: program.code || program.id,
        title: program.title || 'Untitled Program',
        tagline: program.tagline || null,
        description: program.description || '',
        stage: program.stage || 'round_1',
        category: program.category || null,
        status: program.status || 'draft',
        start_time: program.startTime || null,
        end_time: program.endTime || null,
        duration_minutes: Number(program.durationMinutes ?? 45),
        total_questions: Number(program.totalQuestions ?? 25),
        total_marks: Number(program.totalMarks ?? 100),
        passing_marks: Number(program.passingMarks ?? 65),
        passing_percentage: Number(program.passingPercentage ?? 65),
        cutoff_score: program.cutoffScore !== undefined && program.cutoffScore !== null ? Number(program.cutoffScore) : 40,
        negative_marking: Boolean(program.negativeMarking),
        negative_marks_per_question: Number(program.negativeMarksPerQuestion ?? 0.5),
        marks_per_question: Number(program.marksPerQuestion ?? 4),
        fee: Number(program.fee ?? 0),
        max_intake: Number(program.maxIntake ?? 15000),
        enrolled_count: Number(program.enrolledCount ?? 0),
        completed_count: Number(program.completedCount ?? 0),
        in_progress_count: Number(program.inProgressCount ?? 0),
        instructions: Array.isArray(program.instructions) ? program.instructions : [],
        eligibility: program.eligibility || null,
        proctoring_strictness: program.proctoringStrictness || 'High (Webcam + Fullscreen + Tab Lock)',
        proctoring_mode: program.proctoringMode || 'strict_lockdown',
        tags: Array.isArray(program.tags) ? program.tags : [],
        is_results_published: Boolean(program.isResultsPublished !== undefined ? program.isResultsPublished : program.is_results_published),
        updated_at: now,
      };

      // 1. Try upserting to quiz_programs table
      const { error: upsertErr } = await supabaseAdmin
        .from('quiz_programs')
        .upsert(row, { onConflict: 'id' });

      if (upsertErr) {
        console.warn('quiz_programs upsert error in handler (falling back to system config):', upsertErr.message);
      }

      // 2. Also update registrations system config
      try {
        const { data: existingSys } = await supabaseAdmin
          .from('registrations')
          .select('*')
          .eq('registration_number', 'AIMA_SYSTEM_QUIZ_CONFIG')
          .maybeSingle();

        const raw = existingSys?.raw_data || {};
        const programOverrides = raw.programOverrides || {};
        programOverrides[program.id] = {
          ...(programOverrides[program.id] || {}),
          cutoffScore: row.cutoff_score,
          isResultsPublished: row.is_results_published,
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
        console.warn('registrations fallback update warning:', sysErr?.message);
      }

      return res.status(200).json({ success: true, program: row });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || body?.id;
      if (!id) {
        return res.status(400).json({ error: 'Program id is required' });
      }
      await supabaseAdmin.from('quiz_programs').delete().eq('id', id);
      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('quiz_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data || []);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('quiz-program handler error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
