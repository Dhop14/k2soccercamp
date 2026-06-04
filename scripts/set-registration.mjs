/**
 * Toggle camp registration open/closed via camp_settings.registrations_open.
 *
 * Usage:
 *   node scripts/set-registration.mjs status
 *   node scripts/set-registration.mjs open
 *   node scripts/set-registration.mjs close
 *   node scripts/set-registration.mjs close --env-file /etc/k2-preview/env
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  const positional = [];
  let envFile = ".env";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--env-file" && argv[i + 1]) {
      envFile = argv[++i];
    } else {
      positional.push(argv[i]);
    }
  }
  return { command: positional[0], envFile };
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

async function fetchStatus(client) {
  const { data, error } = await client.rpc("get_registration_status");
  if (error) throw new Error(`get_registration_status: ${error.message}`);
  return Boolean(data?.open);
}

async function setOpen(client, open) {
  const { data: row, error: readError } = await client
    .from("camp_settings")
    .select("id, registrations_open")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) throw new Error(`camp_settings read: ${readError.message}`);
  if (!row?.id) throw new Error("No camp_settings row found — apply Supabase migrations first.");

  const { error: updateError } = await client
    .from("camp_settings")
    .update({ registrations_open: open, updated_at: new Date().toISOString() })
    .eq("id", row.id);

  if (updateError) throw new Error(`camp_settings update: ${updateError.message}`);
  return row.registrations_open;
}

const { command, envFile } = parseArgs(process.argv.slice(2));
const valid = new Set(["status", "open", "close"]);

if (!valid.has(command)) {
  console.error("Usage: node scripts/set-registration.mjs <status|open|close> [--env-file PATH]");
  process.exit(1);
}

let env;
try {
  env = loadEnv(envFile);
} catch (err) {
  console.error(`Failed to read env file "${envFile}":`, err.message);
  process.exit(1);
}

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  console.error("Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const client = createClient(url, service);

try {
  if (command === "status") {
    const open = await fetchStatus(client);
    console.log(`Registration is ${open ? "OPEN" : "CLOSED"} (registrations_open=${open})`);
    process.exit(0);
  }

  const targetOpen = command === "open";
  const previous = await fetchStatus(client);
  if (previous === targetOpen) {
    console.log(`Registration already ${targetOpen ? "OPEN" : "CLOSED"} — no change.`);
    process.exit(0);
  }

  await setOpen(client, targetOpen);
  const confirmed = await fetchStatus(client);
  if (confirmed !== targetOpen) {
    throw new Error("Update did not take effect — check camp_settings and service role permissions.");
  }

  console.log(`Registration is now ${targetOpen ? "OPEN" : "CLOSED"}.`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
