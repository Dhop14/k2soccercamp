import { getSupabaseAdmin, getSupabaseServerAnon } from "@/integrations/supabase/client.server";

export type RegistrationStatus = {
  open: boolean;
  canSubmit: boolean;
};

const defaultStatus = (): RegistrationStatus => ({
  open: true,
  canSubmit: true,
});

export async function fetchRegistrationStatus(): Promise<RegistrationStatus> {
  const anon = getSupabaseServerAnon();
  if (anon) {
    const { data, error } = await anon.rpc("get_registration_status");
    if (!error && data && typeof data === "object" && "open" in data) {
      const open = Boolean((data as { open: boolean }).open);
      return { open, canSubmit: open };
    }
    if (error) {
      console.warn("[registration] get_registration_status RPC:", error.message);
    }
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return defaultStatus();
  }

  const { data: settings, error: settingsError } = await admin
    .from("camp_settings")
    .select("registrations_open")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (settingsError) {
    console.error("[registration] camp_settings:", settingsError.message);
    return defaultStatus();
  }

  const open = settings?.registrations_open ?? true;
  return { open, canSubmit: open };
}
