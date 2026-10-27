import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { getRegistrationConfirmationEmail, sendEmail } from "../server/mailer";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://setjjgjhuslevgnqcnhj.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const APP_URL = process.env.APP_URL || "https://research.aima.in";
const LOGIN_URL = `${APP_URL.replace(/\/$/, "")}/login`;

interface RecipientTask {
  registrationId: string;
  registrationNumber: string;
  instituteName: string;
  teamName: string;
  isIndividual: boolean;
  toName: string;
  toEmail: string;
  password: string;
  roleInTeam: string;
}

export async function collectRecipients(): Promise<{
  recipients: RecipientTask[];
  registrations: any[];
}> {
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select("id, registration_number, registration_mode, candidate_name, candidate_email, candidate_phone, team_name, institute_name, nominees, raw_data")
    .neq("registration_number", "AIMA_SYSTEM_QUIZ_CONFIG")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch registrations: ${error.message}`);
  }

  const recipients: RecipientTask[] = [];

  for (const reg of registrations || []) {
    const rawData = reg.raw_data || {};
    const defaultPassword = rawData.participantPassword || "AIMA2026";
    const instName =
      reg.institute_name ||
      rawData.organizationName ||
      rawData.instituteName ||
      "AIMA Registered Institute";
    const isIndividual =
      reg.registration_mode === "individual" ||
      rawData.track === "corporate_individual" ||
      !reg.team_name;
    const teamName =
      reg.team_name ||
      rawData.teamName ||
      (isIndividual ? "Individual Entry" : "Team Entry");

    let nominees =
      Array.isArray(reg.nominees) && reg.nominees.length > 0
        ? reg.nominees
        : Array.isArray(rawData.nominees) && rawData.nominees.length > 0
        ? rawData.nominees
        : [];

    if (nominees.length === 0) {
      // Solo candidate without explicit nominee array
      const cEmail =
        reg.candidate_email ||
        rawData.candidate_email ||
        rawData.coordinator?.email;
      const cName =
        reg.candidate_name ||
        rawData.candidate_name ||
        rawData.coordinator?.name ||
        "Participant";

      if (cEmail && cEmail.includes("@")) {
        recipients.push({
          registrationId: reg.id,
          registrationNumber: reg.registration_number,
          instituteName: instName,
          teamName,
          isIndividual: true,
          toName: cName,
          toEmail: cEmail.trim().toLowerCase(),
          password: defaultPassword,
          roleInTeam: "Individual Candidate",
        });
      }
    } else {
      for (const nom of nominees) {
        const nomEmail = (nom.email || "").trim().toLowerCase();
        if (!nomEmail || !nomEmail.includes("@")) continue;

        const nomPass = nom.password || defaultPassword;
        const nomName = nom.name || "Participant";
        const role = nom.isTeamLeader
          ? "Team Leader"
          : isIndividual
          ? "Candidate"
          : "Team Member";

        recipients.push({
          registrationId: reg.id,
          registrationNumber: reg.registration_number,
          instituteName: instName,
          teamName,
          isIndividual,
          toName: nomName,
          toEmail: nomEmail,
          password: nomPass,
          roleInTeam: role,
        });
      }
    }
  }

  return { recipients, registrations: registrations || [] };
}

export async function broadcastWelcomeEmails(options: {
  dryRun?: boolean;
  delayMs?: number;
  onProgress?: (info: {
    current: number;
    total: number;
    recipient: RecipientTask;
    success: boolean;
    error?: string;
  }) => void;
}) {
  const { dryRun = false, delayMs = 250, onProgress } = options;

  console.log(`[Broadcast] Starting welcome email dispatch...`);
  console.log(`[Broadcast] Mode: ${dryRun ? "DRY RUN (no emails sent)" : "LIVE DISPATCH (Falconide SMTP)"}`);
  console.log(`[Broadcast] Login Portal URL: ${LOGIN_URL}`);

  const { recipients, registrations } = await collectRecipients();
  console.log(`[Broadcast] Found ${registrations.length} registrations with ${recipients.length} total recipients.`);

  const results = {
    totalRegistrations: registrations.length,
    totalRecipients: recipients.length,
    sentCount: 0,
    failCount: 0,
    failures: [] as { email: string; regNumber: string; error: string }[],
    startTime: new Date().toISOString(),
    endTime: "",
  };

  const processedRegIds = new Set<string>();

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const prefix = `[${i + 1}/${recipients.length}]`;

    try {
      const emailContent = getRegistrationConfirmationEmail({
        toName: r.toName,
        regNumber: r.registrationNumber,
        teamName: r.teamName,
        instituteName: r.instituteName,
        username: r.toEmail,
        password: r.password,
        loginUrl: LOGIN_URL,
        isIndividual: r.isIndividual,
        roleInTeam: r.roleInTeam,
      });

      if (!dryRun) {
        await sendEmail({
          to: r.toEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        // Track registration update
        processedRegIds.add(r.registrationId);
      }

      results.sentCount++;
      console.log(`${prefix} ✓ Successfully dispatched to ${r.toName} <${r.toEmail}> (${r.registrationNumber})`);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: recipients.length,
          recipient: r,
          success: true,
        });
      }
    } catch (err: any) {
      results.failCount++;
      results.failures.push({
        email: r.toEmail,
        regNumber: r.registrationNumber,
        error: err.message,
      });
      console.error(`${prefix} ✗ Failed to send to ${r.toName} <${r.toEmail}>:`, err.message);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: recipients.length,
          recipient: r,
          success: false,
          error: err.message,
        });
      }
    }

    // Delay between emails to respect SMTP pacing
    if (i < recipients.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Update Supabase records with timestamp if live
  if (!dryRun && processedRegIds.size > 0) {
    console.log(`[Broadcast] Updating audit timestamp for ${processedRegIds.size} registrations in Supabase...`);
    const nowIso = new Date().toISOString();

    for (const regId of processedRegIds) {
      const reg = registrations.find((item) => item.id === regId);
      if (reg) {
        const raw = reg.raw_data || {};
        const updatedRaw = {
          ...raw,
          welcomeEmailBroadcastAt: nowIso,
          welcomeEmailSentCount: (raw.welcomeEmailSentCount || 0) + 1,
        };
        await supabase
          .from("registrations")
          .update({ raw_data: updatedRaw })
          .eq("id", regId);
      }
    }
  }

  results.endTime = new Date().toISOString();
  console.log(`\n========================================`);
  console.log(`[Broadcast Finished]`);
  console.log(`Total Recipients: ${results.totalRecipients}`);
  console.log(`Successfully Sent: ${results.sentCount}`);
  console.log(`Failed: ${results.failCount}`);
  console.log(`========================================\n`);

  return results;
}

// CLI execution
if (process.argv[1]?.endsWith("broadcastWelcomeEmails.ts")) {
  const isDryRun = process.argv.includes("--dry-run");
  broadcastWelcomeEmails({ dryRun: isDryRun, delayMs: 200 })
    .then((res) => {
      console.log("Done:", JSON.stringify({ ...res, failures: res.failures.length }, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}
