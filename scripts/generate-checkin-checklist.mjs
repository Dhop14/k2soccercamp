/**
 * Generate a PDF check-in checklist from Supabase registrations.
 *
 * Usage examples:
 *   node scripts/generate-checkin-checklist.mjs --env-file /etc/k2-preview/env
 *   node scripts/generate-checkin-checklist.mjs --env-file /etc/k2-preview/env --output /var/www/k2-preview/exports/checkin.pdf
 *   node scripts/generate-checkin-checklist.mjs --include-all-statuses --camp-day "July 13, 2026"
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";

import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";

function parseAdminRecipients(raw) {
  const recipients = (raw ?? "")
    .split(/[;,\n]+/)
    .map((entry) => entry.trim().replace(/^['\"]|['\"]$/g, ""))
    .filter(Boolean);

  const uniqueRecipients = [...new Set(recipients)];
  if (uniqueRecipients.length === 0) {
    throw new Error("REGISTRATION_ADMIN_EMAIL is missing. Set at least one admin recipient.");
  }
  if (uniqueRecipients.length === 1) return uniqueRecipients[0];
  return uniqueRecipients;
}

async function sendResendEmail(params) {
  const apiKey = params.apiKey;
  const body = {
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    attachments: params.attachments,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error (${response.status}): ${text}`);
  }
}

function printUsage() {
  console.log(`Usage: node scripts/generate-checkin-checklist.mjs [options]\n
Options:
  --env-file PATH              Env file with Supabase credentials (default: .env)
  --output PATH                PDF output path (default: ./exports/checkin-YYYY-MM-DD.pdf)
  --camp-day LABEL             Label shown in the checklist header (default: Camp day 1)
  --status VALUE               Filter by one registration status (default: submitted)
  --include-all-statuses       Include every status (overrides --status)
  --help                       Show this help message\n
Required env vars (from --env-file):
  SUPABASE_URL (or VITE_SUPABASE_URL)
  SUPABASE_SERVICE_ROLE_KEY
  RESEND_API_KEY
  REGISTRATION_ADMIN_EMAIL`);
}

function parseArgs(argv) {
  const args = {
    envFile: ".env",
    output: null,
    campDay: "Camp day 1",
    status: "submitted",
    includeAllStatuses: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }

    if (token === "--include-all-statuses") {
      args.includeAllStatuses = true;
      continue;
    }

    if (token === "--env-file" && argv[i + 1]) {
      args.envFile = argv[++i];
      continue;
    }

    if (token === "--output" && argv[i + 1]) {
      args.output = argv[++i];
      continue;
    }

    if (token === "--camp-day" && argv[i + 1]) {
      args.campDay = argv[++i];
      continue;
    }

    if (token === "--status" && argv[i + 1]) {
      args.status = argv[++i].trim().toLowerCase();
      continue;
    }

    throw new Error(`Unknown option: ${token}`);
  }

  return args;
}

function loadEnv(filePath) {
  const env = {};
  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();

    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    env[line.slice(0, i).trim()] = val;
  }

  return env;
}

function formatTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function normalizeAlertText(row) {
  const alerts = [];

  const allergies = row.allergies?.trim();
  if (allergies && allergies.toLowerCase() !== "none" && allergies.toLowerCase() !== "none known") {
    alerts.push(`Allergies: ${allergies}`);
  }

  if (row.medical_conditions?.trim()) alerts.push(`Medical: ${row.medical_conditions.trim()}`);
  if (row.medications?.trim()) alerts.push(`Meds: ${row.medications.trim()}`);
  if (row.activity_restrictions?.trim()) alerts.push(`Restrictions: ${row.activity_restrictions.trim()}`);

  return alerts.join(" | ");
}

async function fetchRegistrations(client, status) {
  const query = client
    .from("registrations")
    .select(
      [
        "id",
        "player_name",
        "player_grade",
        "parent_name",
        "emergency_contact_name",
        "emergency_contact_phone",
        "allergies",
        "medical_conditions",
        "medications",
        "activity_restrictions",
        "status",
        "created_at",
      ].join(", "),
    )
    .order("player_name", { ascending: true })
    .order("created_at", { ascending: true });

  const { data, error } = status ? await query.eq("status", status) : await query;

  if (error) {
    throw new Error(`registrations read: ${error.message}`);
  }

  return data ?? [];
}

function drawHeader(doc, options) {
  const top = doc.page.margins.top;

  doc.font("Helvetica-Bold").fontSize(18).fillColor("#111111").text("K2 Soccer Camp Check-In");
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(10).fillColor("#444444");
  doc.text(`Camp day: ${options.campDay}`);
  doc.text(`Generated: ${options.generatedAt}`);
  doc.text(`Total registrants: ${options.total}`);
  doc.moveDown(0.5);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc
    .save()
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(0.7)
    .strokeColor("#c8c8c8")
    .stroke()
    .restore();

  doc.moveDown(0.4);

  const rowTop = doc.y;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#222222");
  doc.text("IN", left + 2, rowTop, { width: 24 });
  doc.text("PLAYER", left + 30, rowTop, { width: 150 });
  doc.text("GRADE", left + 185, rowTop, { width: 38 });
  doc.text("PARENT", left + 225, rowTop, { width: 130 });
  doc.text("EMERGENCY", left + 358, rowTop, { width: 125 });
  doc.text("HEALTH ALERTS", left + 486, rowTop, { width: right - (left + 486) });

  doc.moveDown(0.8);

  doc
    .save()
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(0.7)
    .strokeColor("#e0e0e0")
    .stroke()
    .restore();

  doc.moveDown(0.2);

  if (doc.y < top + 110) {
    doc.y = top + 110;
  }
}

function rowHeight(doc, row) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const alertText = normalizeAlertText(row) || "-";
  const h1 = doc.heightOfString(row.player_name || "-", { width: 150 });
  const h2 = doc.heightOfString(row.parent_name || "-", { width: 130 });
  const emergency = `${row.emergency_contact_name || "-"} (${row.emergency_contact_phone || "-"})`;
  const h3 = doc.heightOfString(emergency, { width: 125 });
  const h4 = doc.heightOfString(alertText, { width: right - (left + 486) });

  return Math.max(18, h1, h2, h3, h4) + 8;
}

function drawRow(doc, row, index) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const y = doc.y;

  if (index % 2 === 0) {
    doc
      .save()
      .rect(left, y - 2, right - left, rowHeight(doc, row) + 2)
      .fillColor("#fafafa")
      .fill()
      .restore();
  }

  doc
    .save()
    .rect(left + 3, y + 2, 10, 10)
    .lineWidth(0.8)
    .strokeColor("#555555")
    .stroke()
    .restore();

  doc.font("Helvetica").fontSize(8.8).fillColor("#111111");

  doc.text(row.player_name || "-", left + 30, y, { width: 150 });
  doc.text(String(row.player_grade ?? "-"), left + 185, y, { width: 38 });
  doc.text(row.parent_name || "-", left + 225, y, { width: 130 });

  const emergency = `${row.emergency_contact_name || "-"} (${row.emergency_contact_phone || "-"})`;
  doc.text(emergency, left + 358, y, { width: 125 });

  const alerts = normalizeAlertText(row) || "-";
  doc.text(alerts, left + 486, y, { width: right - (left + 486) });

  const h = rowHeight(doc, row);

  doc
    .save()
    .moveTo(left, y + h)
    .lineTo(right, y + h)
    .lineWidth(0.4)
    .strokeColor("#ebebeb")
    .stroke()
    .restore();

  doc.y = y + h + 2;
}

async function buildChecklistPdf(registrations, outputPath, campDay, appliedStatusFilter) {
  const doc = new PDFDocument({ size: "LETTER", margin: 28 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const bufferPromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const generatedAt = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  drawHeader(doc, {
    campDay,
    generatedAt: `${generatedAt} (Eastern Time)`,
    total: registrations.length,
  });

  if (appliedStatusFilter) {
    doc
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor("#666666")
      .text(`Status filter: ${appliedStatusFilter}`);
    doc.moveDown(0.4);
  }

  if (registrations.length === 0) {
    doc.font("Helvetica").fontSize(12).fillColor("#222222").text("No registrations matched this filter.");
    doc.end();
    const buffer = await bufferPromise;
    writeFileSync(outputPath, buffer);
    return buffer;
  }

  for (let i = 0; i < registrations.length; i++) {
    const row = registrations[i];
    const needed = rowHeight(doc, row) + 8;
    const bottom = doc.page.height - doc.page.margins.bottom;

    if (doc.y + needed > bottom) {
      doc.addPage();
      drawHeader(doc, {
        campDay,
        generatedAt: `${generatedAt} (Eastern Time)`,
        total: registrations.length,
      });
    }

    drawRow(doc, row, i);
  }

  doc.end();

  const buffer = await bufferPromise;
  writeFileSync(outputPath, buffer);
  return buffer;
}

async function main() {
  let args;

  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    printUsage();
    process.exit(1);
  }

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  let env;
  try {
    env = loadEnv(args.envFile);
  } catch (error) {
    console.error(`Failed to read env file "${args.envFile}": ${error.message}`);
    process.exit(1);
  }

  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = env.RESEND_API_KEY;
  const from = env.REGISTRATION_FROM_EMAIL || "K2 Soccer Camp <noreply@k2soccercamp.com>";

  if (!url || !serviceKey) {
    console.error("Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  if (!resendApiKey) {
    console.error("Missing RESEND_API_KEY.");
    process.exit(1);
  }

  const defaultOutput = resolve(process.cwd(), "exports", `checkin-${formatTodayDate()}.pdf`);
  const outputPath = resolve(process.cwd(), args.output || defaultOutput);
  const outputDir = dirname(outputPath);

  try {
    if (statSync(outputDir).isDirectory() === false) {
      mkdirSync(outputDir, { recursive: true });
    }
  } catch {
    mkdirSync(outputDir, { recursive: true });
  }

  const client = createClient(url, serviceKey);
  const statusFilter = args.includeAllStatuses ? null : args.status;

  try {
    const registrations = await fetchRegistrations(client, statusFilter);
    const pdfBuffer = await buildChecklistPdf(registrations, outputPath, args.campDay, statusFilter);
    const adminRecipients = parseAdminRecipients(env.REGISTRATION_ADMIN_EMAIL);
    const subjectDate = formatTodayDate();
    const subject = `K2 check-in checklist - ${args.campDay} (${subjectDate})`;
    const html = [
      `<p>Attached is the K2 check-in checklist PDF for <strong>${args.campDay}</strong>.</p>`,
      `<p>Registrant count: ${registrations.length}</p>`,
      `<p>Generated file path: ${outputPath}</p>`,
    ].join("");

    await sendResendEmail({
      apiKey: resendApiKey,
      from,
      to: adminRecipients,
      subject,
      html,
      attachments: [
        {
          filename: `k2-checkin-${subjectDate}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    console.log(`Generated checklist: ${outputPath}`);
    console.log(`Registrant count: ${registrations.length}`);
    const recipientCount = Array.isArray(adminRecipients) ? adminRecipients.length : 1;
    console.log(`Admin email sent (${recipientCount} recipient${recipientCount === 1 ? "" : "s"}).`);
    if (statusFilter) {
      console.log(`Status filter: ${statusFilter}`);
    } else {
      console.log("Status filter: none (all statuses)");
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

await main();
