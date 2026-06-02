import { createServerFn } from "@tanstack/react-start";
import {
  EMERGENCY_CONSENT_VERSION,
  HEALTH_FORM_VERSION,
  WAIVER_VERSION,
} from "@/lib/camp";
import { sendRegistrationEmails } from "@/lib/email/registration-mails.server";
import { registrationSubmitInputSchema, toRegistrationInsert } from "@/lib/registration-schema";
import { fetchRegistrationStatus } from "@/lib/registration-status.server";
import { verifyTurnstileToken } from "@/lib/turnstile.server";
import { getSupabaseAdmin } from "@/integrations/supabase/client.server";

export const getRegistrationStatus = createServerFn({ method: "GET" }).handler(
  async () => fetchRegistrationStatus(),
);

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator(registrationSubmitInputSchema)
  .handler(async ({ data }) => {
    const admin = getSupabaseAdmin();
    if (!admin) {
      throw new Error(
        "Registration is temporarily unavailable (server configuration). Please email us directly.",
      );
    }

    if (data.website) {
      return { ok: true as const, duplicate: false };
    }

    const turnstileOk = await verifyTurnstileToken(data.turnstile_token);
    if (!turnstileOk) {
      throw new Error("Bot verification failed. Please try again.");
    }

    if (!data.health_form_ack || !data.emergency_medical_consent_ack) {
      throw new Error("Health and emergency consent are required.");
    }

    const statusRes = await fetchRegistrationStatus();
    if (!statusRes.canSubmit) {
      throw new Error("Registration is currently closed. Please contact us.");
    }

    const email = data.email.toLowerCase().trim();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await admin
      .from("registrations")
      .select("id")
      .eq("email", email)
      .eq("player_name", data.player_name)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      return { ok: false as const, duplicate: true as const };
    }

    const insert = toRegistrationInsert({
      ...data,
      waiver_version: WAIVER_VERSION,
      health_form_version: HEALTH_FORM_VERSION,
      emergency_consent_version: EMERGENCY_CONSENT_VERSION,
      eligibility_ack: true,
      waiver_ack: true,
      health_form_ack: true,
      emergency_medical_consent_ack: true,
    });

    const { data: result, error } = await admin.rpc("submit_registration", {
      p_player_name: insert.player_name,
      p_player_age: insert.player_age,
      p_player_grade: insert.player_grade,
      p_grade_basis: insert.grade_basis,
      p_parent_name: insert.parent_name,
      p_email: email,
      p_phone: insert.phone,
      p_emergency_contact: insert.emergency_contact,
      p_eligibility_ack: insert.eligibility_ack,
      p_waiver_version: insert.waiver_version,
      p_photo_release: insert.photo_release,
      p_allergies: insert.allergies,
      p_immunization_status: insert.immunization_status,
      p_emergency_contact_name: insert.emergency_contact_name,
      p_emergency_contact_phone: insert.emergency_contact_phone,
      p_health_form_version: insert.health_form_version,
      p_emergency_consent_version: insert.emergency_consent_version,
      p_health_form_ack: data.health_form_ack,
      p_emergency_medical_consent_ack: data.emergency_medical_consent_ack,
      p_skill_level: insert.skill_level,
      p_notes: insert.notes,
      p_sibling_note: insert.sibling_note,
      p_medical_conditions: insert.medical_conditions,
      p_medications: insert.medications,
      p_activity_restrictions: insert.activity_restrictions,
      p_physician_name: insert.physician_name,
      p_physician_phone: insert.physician_phone,
      p_immunization_notes: insert.immunization_notes,
      p_secondary_emergency_contact: insert.secondary_emergency_contact,
    });

    if (error) {
      const msg = error.message;
      if (msg.includes("registration_closed")) {
        throw new Error("Registration is currently closed. Please contact us.");
      }
      if (msg.includes("consent_required")) {
        throw new Error("Health and emergency consent are required.");
      }
      console.error("[registration] submit:", msg);
      throw new Error("Something went wrong. Please try again or email us directly.");
    }

    if (!result) {
      console.error("[registration] submit: no result");
      throw new Error("Something went wrong. Please try again or email us directly.");
    }

    await sendRegistrationEmails({
      submittedAt: new Date().toISOString(),
      playerName: insert.player_name,
      parentName: insert.parent_name,
      email,
      phone: insert.phone,
      playerGrade: insert.player_grade,
      playerAge: insert.player_age,
      skillLevel: insert.skill_level,
      siblingNote: insert.sibling_note,
      allergies: insert.allergies,
      medicalConditions: insert.medical_conditions,
      medications: insert.medications,
      activityRestrictions: insert.activity_restrictions,
      healthNotes: insert.immunization_notes,
      emergencyContactName: insert.emergency_contact_name,
      emergencyContactPhone: insert.emergency_contact_phone,
      secondaryEmergencyContact: insert.secondary_emergency_contact,
      physicianName: insert.physician_name,
      physicianPhone: insert.physician_phone,
      notes: insert.notes,
      photoRelease: insert.photo_release,
      waiverVersion: insert.waiver_version,
      healthFormVersion: insert.health_form_version,
      emergencyConsentVersion: insert.emergency_consent_version,
    });

    return { ok: true as const, duplicate: false as const };
  });
