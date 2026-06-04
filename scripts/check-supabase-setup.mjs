import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
function loadEnv() {
  const raw = readFileSync(".env", "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[line.slice(0, i).trim()] = val;
  }
  return env;
}
const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
// Prefer VITE_ when both exist — SUPABASE_PUBLISHABLE_KEY is often a stale duplicate.
const anon = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const urlOk = url && /^https:\/\/.+\.supabase\.co/.test(url);
console.log("URL:", urlOk ? "ok" : url ? "bad format" : "missing");
console.log("SERVICE_ROLE:", service ? "set" : "MISSING");
if (!urlOk || !anon) process.exit(1);
const client = createClient(url, anon);
const { data, error } = await client.rpc("get_registration_status");
console.log("get_registration_status:", error ? "FAIL " + error.message : "OK " + JSON.stringify(data));
const { data: s, error: se } = await client.from("camp_settings").select("registrations_open").limit(1).maybeSingle();
console.log("camp_settings:", se ? se.message : JSON.stringify(s));
