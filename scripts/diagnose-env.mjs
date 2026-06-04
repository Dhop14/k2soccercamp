/**
 * Diagnose .env / Supabase project alignment (no secret values printed).
 */
import { readFileSync } from "fs";

function loadEnv() {
  const env = {};
  const rawVals = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    const raw = line.slice(i + 1).trim();
    let val = raw;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
    rawVals[key] = raw;
  }
  return { env, rawVals };
}

const { env, rawVals } = loadEnv();

function describe(name, v, raw) {
  if (!v) return `${name}: (missing)`;
  const ref = v.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
  const flags = [
    v.includes(" ") ? "has spaces" : null,
    /\r|\n/.test(v) ? "has newline" : null,
    v.length < 100 ? "suspiciously short" : null,
    raw && raw !== v ? "quotes stripped by parser" : null,
    v.startsWith('"') || v.endsWith('"') ? "CONTAINS QUOTE CHARS — remove quotes from .env value" : null,
    raw?.startsWith('"') && !raw?.endsWith('"') ? "unclosed quote in .env line" : null,
  ].filter(Boolean);
  const extra = ref ? ` projectRef=${ref}` : "";
  const warn = flags.length ? ` [${flags.join(", ")}]` : "";
  return `${name}: len=${v.length}${extra}${warn}`;
}

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const pubVite = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const pubServer = env.SUPABASE_PUBLISHABLE_KEY;
const pub = pubVite || pubServer;
const svc = env.SUPABASE_SERVICE_ROLE_KEY;

if (pubVite && pubServer && pubVite !== pubServer) {
  console.log(
    "WARNING: VITE_SUPABASE_PUBLISHABLE_KEY and SUPABASE_PUBLISHABLE_KEY differ.",
  );
  console.log(
    "  Server code prefers SUPABASE_PUBLISHABLE_KEY — delete it or paste the same value as VITE_.",
  );
  console.log("");
}
const urlRef = url?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
const configToml = readFileSync("supabase/config.toml", "utf8");
const configRef = configToml.match(/project_id\s*=\s*"([^"]+)"/)?.[1];

console.log(describe("VITE_SUPABASE_URL", env.VITE_SUPABASE_URL, rawVals.VITE_SUPABASE_URL));
console.log(describe("SUPABASE_URL", env.SUPABASE_URL, rawVals.SUPABASE_URL));
console.log(
  describe(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    env.VITE_SUPABASE_PUBLISHABLE_KEY,
    rawVals.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
);
console.log(
  describe(
    "SUPABASE_PUBLISHABLE_KEY",
    env.SUPABASE_PUBLISHABLE_KEY,
    rawVals.SUPABASE_PUBLISHABLE_KEY,
  ),
);
console.log(describe("SUPABASE_SERVICE_ROLE_KEY", svc, rawVals.SUPABASE_SERVICE_ROLE_KEY));
if (pub) {
  const kind = pub.startsWith("sb_publishable_")
    ? "new publishable (sb_publishable_)"
    : pub.startsWith("eyJ")
      ? "legacy JWT (anon)"
      : "unknown format";
  console.log("publishable key format:", kind);
}
console.log("");
console.log("supabase/config.toml project_id:", configRef);
console.log(
  "URL matches config.toml:",
  urlRef === configRef ? "YES" : `NO (URL ref=${urlRef ?? "?"})`,
);
if (pub && svc) {
  console.log("publishable === service_role:", pub === svc ? "SAME — wrong!" : "different — good");
}
if (env.VITE_SUPABASE_URL && env.SUPABASE_URL && env.VITE_SUPABASE_URL !== env.SUPABASE_URL) {
  console.log("WARNING: VITE_SUPABASE_URL and SUPABASE_URL differ");
}

// Probe which key Supabase accepts (no values printed)
import { createClient } from "@supabase/supabase-js";

async function probe(label, key) {
  if (!url || !key) return;
  const client = createClient(url, key);
  const { error } = await client.from("camp_settings").select("id").limit(1);
  if (!error) {
    console.log(`API test (${label}): OK`);
    return;
  }
  const msg = error.message;
  if (msg.includes("Invalid API key")) {
    console.log(`API test (${label}): Invalid API key — wrong key or wrong project URL`);
  } else if (msg.includes("schema cache") || msg.includes("does not exist")) {
    console.log(`API test (${label}): Key OK — table missing (run migrations)`);
  } else {
    console.log(`API test (${label}): ${msg}`);
  }
}

console.log("");
if (pubVite) await probe("VITE publishable", pubVite);
if (pubServer && pubServer !== pubVite) await probe("SUPABASE_PUBLISHABLE_KEY", pubServer);
if (!pubVite && pubServer) await probe("publishable", pubServer);
await probe("service_role", svc);
