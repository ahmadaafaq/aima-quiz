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
    // In Vercel Node.js Serverless Functions, body may be parsed or raw string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const {
      answers,
      markedForReview,
      timeTaken,
      tabSwitches,
      studentId,
      teamId,
      participantEmail,
      programId,
    } = body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required for quiz submission.' });
    }

    let targetProgramId = programId || 'qp_case_comp_stage1_2026';
    if (targetProgramId === 'qp_r1_national_2026' || !targetProgramId) {
      targetProgramId = 'qp_case_comp_stage1_2026';
    }
    const { data: prog } = await supabaseAdmin
      .from('quiz_programs')
      .select(
        'negative_marking, negative_marks_per_question, cutoff_score, passing_marks, marks_per_question, total_marks, total_questions'
      )
      .eq('id', targetProgramId)
      .maybeSingle();

    const negativeMarking = prog ? Boolean(prog.negative_marking) : false;
    const negativeMarks = negativeMarking ? Number(prog.negative_marks_per_question ?? 0) : 0;
    const cutoffScore = Number(prog?.cutoff_score ?? 60);
    const marksPerQuestion = Number(prog?.marks_per_question ?? 4);
    const totalProgramMarks = Number(prog?.total_marks ?? 100);

    // 2. Fetch program questions in exact sequential order
    let questions: any[] = [];
    const { data: progQuestions } = await supabaseAdmin
      .from('quiz_program_questions')
      .select('order_index, custom_marks, quiz_questions (*)')
      .eq('program_id', targetProgramId)
      .order('order_index', { ascending: true });

    if (Array.isArray(progQuestions) && progQuestions.length > 0) {
      questions = progQuestions
        .map((row: any) => {
          const q = row.quiz_questions;
          if (!q) return null;
          return {
            id: q.id,
            order_index: row.order_index,
            marks:
              row.custom_marks !== null && row.custom_marks !== undefined
                ? Number(row.custom_marks)
                : Number(q.marks ?? 4),
            negative_marks: Number(q.negative_marks ?? 0),
            category: q.category,
            correct_answer_index: q.correct_answer_index,
          };
        })
        .filter(Boolean);
    }

    if (questions.length === 0) {
      const { data: allQ } = await supabaseAdmin
        .from('quiz_questions')
        .select('id, marks, negative_marks, category, correct_answer_index')
        .eq('is_active', true);
      questions = (allQ || []).map((q: any, i: number) => ({ ...q, order_index: i + 1 }));
    }

    // 3. Compute score:
    // Core 25 questions: Main Score (out of 100)
    // Reserve 5 questions: Tie-Breaker Score (out of 20)
    let coreEarnedMarks = 0;
    let corePenaltyMarks = 0;
    let tieBreakerScore = 0;
    const cleanAnswers: Record<string, number> =
      typeof answers === 'object' && answers !== null ? answers : {};

    questions.forEach((q: any, idx: number) => {
      const orderNo = q.order_index || idx + 1;
      const isReserve = orderNo > 25;
      const selected = cleanAnswers[q.id];

      if (selected !== undefined && selected !== null) {
        const isCorrect = Number(selected) === Number(q.correct_answer_index);
        const qMarks = Number(q.marks || marksPerQuestion);

        if (isReserve) {
          if (isCorrect) {
            tieBreakerScore += qMarks;
          }
        } else {
          if (isCorrect) {
            coreEarnedMarks += qMarks;
          } else if (negativeMarking && negativeMarks > 0) {
            corePenaltyMarks += negativeMarks;
          }
        }
      }
    });

    const mainScore = Math.min(
      totalProgramMarks,
      Math.max(0, coreEarnedMarks - corePenaltyMarks)
    );
    const isQualified = mainScore >= cutoffScore;
    const attemptId = 'att_' + studentId;
    const submittedAt = new Date().toISOString();

    // 4. Persist to quiz_attempts table in Supabase
    let savedToQuizAttempts = false;
    let quizAttemptsError: string | null = null;

    const attemptPayload = {
      attempt_id: attemptId,
      student_id: studentId,
      user_id: studentId,
      participant_email: participantEmail || null,
      team_id: teamId || null,
      program_id: targetProgramId,
      start_time: new Date(Date.now() - (Number(timeTaken) || 0) * 1000).toISOString(),
      submitted_at: submittedAt,
      answers: cleanAnswers,
      marked_for_review: Array.isArray(markedForReview) ? markedForReview : [],
      score: mainScore,
      analytical_score: tieBreakerScore,
      time_taken_seconds: Number(timeTaken) || 0,
      tab_switch_count: Number(tabSwitches) || 0,
      is_completed: true,
    };

    try {
      const { error: attErr } = await supabaseAdmin.from('quiz_attempts').upsert(
        attemptPayload,
        { onConflict: 'attempt_id' }
      );
      if (attErr) {
        quizAttemptsError = attErr.message;
        console.warn('quiz_attempts table write notice:', attErr.message);
      } else {
        savedToQuizAttempts = true;
      }
    } catch (attErr: any) {
      quizAttemptsError = attErr?.message || String(attErr);
      console.warn('quiz_attempts exception in serverless function:', quizAttemptsError);
    }

    // 5. Dual-persistence: Also write attempt into registrations raw_data
    try {
      let regNum = '';
      let candidateName = '';
      let instituteName = '';

      if (studentId || participantEmail) {
        const isStudentUuid = typeof studentId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
        let partQuery = supabaseAdmin
          .from('participants')
          .select('registration_number, name, institute_name, email');

        if (isStudentUuid) {
          partQuery = partQuery.or(`id.eq.${studentId},email.eq.${participantEmail || studentId}`);
        } else {
          partQuery = partQuery.eq('email', participantEmail || studentId);
        }

        const { data: partRow } = await partQuery.maybeSingle();

        if (partRow) {
          regNum = partRow.registration_number || '';
          candidateName = partRow.name || '';
          instituteName = partRow.institute_name || '';
        }
      }

      let regQuery = supabaseAdmin.from('registrations').select('id, raw_data, registration_number');
      if (regNum) {
        regQuery = regQuery.eq('registration_number', regNum);
      } else if (teamId) {
        const isTeamUuid = typeof teamId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teamId);
        if (isTeamUuid) {
          regQuery = regQuery.or(`registration_number.eq.${teamId},id.eq.${teamId}`);
        } else {
          regQuery = regQuery.eq('registration_number', teamId);
        }
      }

      const { data: regRows } = await regQuery.limit(1);
      const existingReg = regRows?.[0];

      if (existingReg) {
        const raw = existingReg.raw_data || {};
        const prevAttempts = Array.isArray(raw.quizAttempts) ? raw.quizAttempts : [];
        const fullAttempt = {
          ...attemptPayload,
          candidateName: candidateName || raw.coordinator?.name || '',
          instituteName: instituteName || raw.organizationName || '',
          registrationNumber: existingReg.registration_number,
        };
        const updatedAttempts = [
          fullAttempt,
          ...prevAttempts.filter((a: any) => a.attempt_id !== attemptId && a.student_id !== studentId)
        ];

        await supabaseAdmin
          .from('registrations')
          .update({
            raw_data: {
              ...raw,
              quizAttempts: updatedAttempts,
              latestQuizAttempt: fullAttempt,
            },
          })
          .eq('id', existingReg.id);
      }
    } catch (regSaveErr: any) {
      console.warn('Backup registration attempt write notice:', regSaveErr?.message);
    }

    return res.status(200).json({
      success: true,
      score: mainScore,
      tieBreakerScore,
      analyticalScore: tieBreakerScore,
      isQualified,
      attemptId,
      submittedAt,
      savedToQuizAttempts,
      quizAttemptsError,
    });
  } catch (err: any) {
    console.error('Error in /api/quiz/submit serverless handler:', err);
    return res.status(500).json({ error: 'Failed to evaluate quiz: ' + err.message });
  }
}
