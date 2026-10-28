import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { getRegistrationConfirmationEmail, sendEmail } from "../server/mailer";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://setjjgjhuslevgnqcnhj.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V";

const supabaseUat = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: "uat" },
});

const supabasePub = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: "public" },
});

const APP_URL = "https://research.aima.in";
const LOGIN_URL = `${APP_URL}/login`;

async function main() {
  console.log("==================================================================");
  console.log(" MIGRATING TEAM FROM UAT TO PRODUCTION (PUBLIC) SCHEMA");
  console.log(" Registration: AIMA-CL26-65974 | Team: The insight Makers | ISBR");
  console.log("==================================================================\n");

  // 1. Fetch from UAT
  const { data: uatReg, error: regErr } = await supabaseUat
    .from("registrations")
    .select("*")
    .eq("registration_number", "AIMA-CL26-65974")
    .single();

  if (regErr || !uatReg) {
    throw new Error(`Failed to find UAT registration: ${regErr?.message}`);
  }
  console.log("✓ Found UAT registration:", uatReg.registration_number, uatReg.team_name);

  const { data: uatParts, error: partErr } = await supabaseUat
    .from("participants")
    .select("*")
    .eq("registration_number", "AIMA-CL26-65974");

  if (partErr || !uatParts || uatParts.length === 0) {
    throw new Error(`Failed to find UAT participants: ${partErr?.message}`);
  }
  console.log(`✓ Found ${uatParts.length} UAT participants for AIMA-CL26-65974:`);
  uatParts.forEach(p => console.log(`   - ${p.name} <${p.email}> (${p.is_team_leader ? "Leader" : "Member"})`));

  // 2. Insert or Upsert into public.registrations
  console.log("\n--- Step 1: Copying registration to public.registrations ---");
  const { data: existingPubReg } = await supabasePub
    .from("registrations")
    .select("id, registration_number")
    .eq("registration_number", "AIMA-CL26-65974")
    .maybeSingle();

  const regToInsert = {
    ...uatReg,
    raw_data: {
      ...uatReg.raw_data,
      migratedFromUatAt: new Date().toISOString(),
      migrationNote: "Transferred from uat schema to production (public) schema",
      welcomeEmailSentCount: 4,
    },
  };

  if (existingPubReg) {
    console.log("AIMA-CL26-65974 already exists in public.registrations, updating...");
    const { error: updErr } = await supabasePub
      .from("registrations")
      .update(regToInsert)
      .eq("registration_number", "AIMA-CL26-65974");
    if (updErr) throw new Error(`Failed to update public registration: ${updErr.message}`);
    console.log("✓ Updated registration in public.registrations");
  } else {
    console.log("Inserting AIMA-CL26-65974 into public.registrations...");
    const { error: insErr } = await supabasePub
      .from("registrations")
      .insert([regToInsert]);
    if (insErr) throw new Error(`Failed to insert public registration: ${insErr.message}`);
    console.log("✓ Successfully inserted registration into public.registrations");
  }

  // 3. Update / Insert each participant in public.participants
  console.log("\n--- Step 2: Copying participants to public.participants ---");
  for (const part of uatParts) {
    const email = part.email.trim().toLowerCase();
    const { data: existingPubPart } = await supabasePub
      .from("participants")
      .select("id, email, registration_number")
      .ilike("email", email)
      .maybeSingle();

    const participantData = {
      registration_number: "AIMA-CL26-65974",
      registration_mode: "individual",
      institute_name: "ISBR COLLEGE ",
      username: email,
      email: email,
      password_hash: part.password_hash || "aima_SVNCUjExMjI=", // ISBR1122
      name: part.name.trim(),
      mobile: part.mobile,
      program: part.program || "MBA",
      semester: part.semester,
      enrolment_number: part.enrolment_number,
      is_team_leader: Boolean(part.is_team_leader),
      coordinator_name: "Dhanshree Raval ",
      coordinator_email: "dhanashreeraval16@gmail.com",
      quiz_program_id: "qp_case_comp_stage1_2026",
    };

    if (existingPubPart) {
      console.log(`Updating existing participant <${email}> (was ${existingPubPart.registration_number} -> now AIMA-CL26-65974)...`);
      const { error: pUpdErr } = await supabasePub
        .from("participants")
        .update(participantData)
        .eq("id", existingPubPart.id);
      if (pUpdErr) throw new Error(`Failed to update participant ${email}: ${pUpdErr.message}`);
      console.log(`✓ Updated participant <${email}>`);
    } else {
      console.log(`Inserting new participant <${email}>...`);
      const { error: pInsErr } = await supabasePub
        .from("participants")
        .insert([participantData]);
      if (pInsErr) throw new Error(`Failed to insert participant ${email}: ${pInsErr.message}`);
      console.log(`✓ Inserted participant <${email}>`);
    }
  }

  // 4. Mark old solo registrations as superseded in public.registrations
  console.log("\n--- Step 3: Annotating old individual registrations in public.registrations ---");
  const oldRegNums = ["AIMA-CL26-34946", "AIMA-CL26-73599", "AIMA-CL26-37495"];
  for (const oldNum of oldRegNums) {
    const { data: oldReg } = await supabasePub
      .from("registrations")
      .select("id, registration_number, raw_data")
      .eq("registration_number", oldNum)
      .maybeSingle();

    if (oldReg) {
      const updatedRaw = {
        ...oldReg.raw_data,
        supersededBy: "AIMA-CL26-65974",
        supersededReason: "Team consolidated under The insight Makers (AIMA-CL26-65974)",
        supersededAt: new Date().toISOString(),
      };
      await supabasePub
        .from("registrations")
        .update({ raw_data: updatedRaw })
        .eq("id", oldReg.id);
      console.log(`✓ Marked ${oldNum} as superseded by AIMA-CL26-65974`);
    }
  }

  // 5. Send Welcome Emails with Credentials to all 4 members
  console.log("\n--- Step 4: Dispatching Welcome Emails via Falconide SMTP ---");
  const recipients = [
    {
      toName: "Dhanshree Raval",
      toEmail: "dhanashreeraval16@gmail.com",
      role: "Team Leader",
      password: "ISBR1122",
    },
    {
      toName: "Bhavya Dave",
      toEmail: "davebhavya04@gmail.com",
      role: "Team Member",
      password: "ISBR1122",
    },
    {
      toName: "Anusha Shetty",
      toEmail: "Anushashetty0417@gmail.com",
      role: "Team Member",
      password: "ISBR1122",
    },
    {
      toName: "Jeet Tank",
      toEmail: "jeet.mba26030@isbr.edu.in",
      role: "Team Member",
      password: "ISBR1122",
    },
  ];

  for (let i = 0; i < recipients.length; i++) {
    const rec = recipients[i];
    console.log(`[${i + 1}/4] Generating email for ${rec.toName} <${rec.toEmail}>...`);

    const { subject, html, text } = getRegistrationConfirmationEmail({
      toName: rec.toName,
      regNumber: "AIMA-CL26-65974",
      teamName: "The insight Makers",
      instituteName: "ISBR COLLEGE",
      username: rec.toEmail,
      password: rec.password,
      loginUrl: LOGIN_URL,
      roleInTeam: rec.role,
      isSolo: false,
    });

    console.log(`      Sending to ${rec.toEmail} ...`);
    const sendResult = await sendEmail({
      to: rec.toEmail,
      subject,
      html,
      text,
    });
    console.log(`      ✓ Dispatched! Message ID: ${sendResult.messageId}`);
    // Brief 500ms delay between dispatches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n==================================================================");
  console.log(" ALL 4 TEAM MEMBERS SUCCESSFULLY MIGRATED & WELCOME EMAILS SENT!");
  console.log("==================================================================\n");
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
