/**
 * Print Supabase project ref embedded in API keys (no full secrets).
 */
import { readFileSync } from "fs";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function jwtRef(token, label) {
  if (!token) {
    console.log(`${label}: (missing)`);
    return null;
  }
  const parts = token.split(".");
  if (parts.length < 2) {
    console.log(`${label}: not a JWT (wrong key type?)`);
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const ref = payload.ref ?? payload.project_ref ?? "(no ref in payload)";
    const role = payload.role ?? "(no role)";
    console.log(`${label}: ref=${ref} role=${role}`);
    return ref;
  } catch {
    console.log(`${label}: could not decode JWT`);
    return null;
  }
}

const env = loadEnv();
const urlRef =
  (env.VITE_SUPABASE_URL || env.SUPABASE_URL)?.match(
    /https:\/\/([a-z0-9]+)\.supabase\.co/i,
  )?.[1] ?? "?";

console.log("URL project ref:", urlRef);
console.log("");
const pubRef = jwtRef(
  env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY,
  "publishable",
);
const svcRef = jwtRef(env.SUPABASE_SERVICE_ROLE_KEY, "service_role");
console.log("");
if (pubRef && svcRef && pubRef !== svcRef) {
  console.log("PROBLEM: publishable and service_role are from DIFFERENT projects.");
} else if (pubRef && pubRef !== urlRef) {
  console.log("PROBLEM: publishable key ref does not match URL.");
} else if (svcRef && svcRef === urlRef && pubRef !== urlRef) {
  console.log("PROBLEM: service_role matches URL but publishable does not — re-copy anon key.");
} else if (pubRef === urlRef) {
  console.log("publishable ref matches URL — if API still fails, key may be revoked; create new anon key in dashboard.");
}
