import { z } from "zod";

import {
  CAMP_GRADES,
  CAMP_MAX_AGE,
  CAMP_MIN_AGE,
  EMERGENCY_CONSENT_VERSION,
  HEALTH_FORM_VERSION,
  REGISTRATION_GRADE_BASIS,
  SKILL_LEVELS,
  WAIVER_VERSION,
} from "@/lib/camp";

const phoneRegex = /^[\d\s().+-]{10,}$/;

/** Base object schema — use .extend() on this, not on .superRefine() output. */
const registrationFormBaseSchema = z.object({
  player_name: z.string().trim().min(1, "Required").max(120),
  player_age: z.coerce
    .number()
    .int()
    .min(CAMP_MIN_AGE, `Min age ${CAMP_MIN_AGE}`)
    .max(CAMP_MAX_AGE, `Max age ${CAMP_MAX_AGE}`),
  player_grade: z.coerce
    .number()
    .int()
    .refine((g) => (CAMP_GRADES as readonly number[]).includes(g), "Grade must be 3–8"),
  skill_level: z.union([z.enum(SKILL_LEVELS), z.literal("")]).optional(),
  parent_name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(40)
    .regex(phoneRegex, "Enter a valid phone number"),
  emergency_contact_name: z.string().trim().min(1, "Required").max(120),
  emergency_contact_phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(40)
    .regex(phoneRegex, "Enter a valid phone number"),
  secondary_emergency_contact: z.string().trim().max(200).optional().or(z.literal("")),
  allergies: z.string().trim().min(1, "Required — enter “None known” if applicable").max(1000),
  medical_conditions: z.string().trim().max(2000).optional().or(z.literal("")),
  medications: z.string().trim().max(1000).optional().or(z.literal("")),
  activity_restrictions: z.string().trim().max(500).optional().or(z.literal("")),
  physician_name: z.string().trim().max(120).optional().or(z.literal("")),
  physician_phone: z.string().trim().max(40).optional().or(z.literal("")),
  immunization_notes: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  sibling_note: z.string().trim().max(500).optional().or(z.literal("")),
  eligibility_ack: z.boolean().refine((v) => v === true, { message: "Required" }),
  waiver_ack: z.boolean().refine((v) => v === true, { message: "Required" }),
  health_form_ack: z.boolean().refine((v) => v === true, { message: "Required" }),
  emergency_medical_consent_ack: z.boolean().refine((v) => v === true, { message: "Required" }),
  photo_release: z.boolean(),
  website: z.string().max(0).optional().or(z.literal("")),
  turnstile_token: z.string().optional(),
});

export const registrationFormSchema = registrationFormBaseSchema;

/** Raw form state (pre-parse); use with `useForm` first generic. */
export type RegistrationFormInput = z.input<typeof registrationFormBaseSchema>;

/** True when every field on this step passes the same Zod rules used on Continue. */
export function isRegistrationStepFieldsComplete(
  fields: readonly (keyof RegistrationFormInput)[],
  values: RegistrationFormInput,
): boolean {
  if (fields.length === 0) return false;

  const picker = Object.fromEntries(fields.map((field) => [field, true])) as Record<
    keyof RegistrationFormInput,
    true
  >;

  return registrationFormBaseSchema.pick(picker).safeParse(values).success;
}
/** Validated values after Zod parse; use for submit handlers. */
export type RegistrationFormValues = z.output<typeof registrationFormBaseSchema>;

export const registrationSubmitSchema = registrationFormBaseSchema
  .extend({
    waiver_version: z.literal(WAIVER_VERSION),
    health_form_version: z.literal(HEALTH_FORM_VERSION),
    emergency_consent_version: z.literal(EMERGENCY_CONSENT_VERSION),
  });

export type RegistrationSubmitPayload = z.infer<typeof registrationSubmitSchema>;

/** Server POST body — same rules as the form. */
export const registrationSubmitInputSchema = registrationFormBaseSchema;

export function formatEmergencyContactLegacy(data: {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  secondary_emergency_contact?: string | null;
}) {
  let line = `${data.emergency_contact_name} — ${data.emergency_contact_phone}`;
  if (data.secondary_emergency_contact?.trim()) {
    line += `; Alt: ${data.secondary_emergency_contact.trim()}`;
  }
  return line;
}

export function toRegistrationInsert(data: RegistrationSubmitPayload) {
  return {
    player_name: data.player_name,
    player_age: data.player_age,
    player_grade: data.player_grade,
    grade_basis: REGISTRATION_GRADE_BASIS,
    skill_level: data.skill_level || null,
    parent_name: data.parent_name,
    email: data.email,
    phone: data.phone,
    emergency_contact: formatEmergencyContactLegacy(data),
    emergency_contact_name: data.emergency_contact_name,
    emergency_contact_phone: data.emergency_contact_phone,
    secondary_emergency_contact: data.secondary_emergency_contact || null,
    allergies: data.allergies,
    medical_conditions: data.medical_conditions || null,
    medications: data.medications || null,
    activity_restrictions: data.activity_restrictions || null,
    physician_name: data.physician_name || null,
    physician_phone: data.physician_phone || null,
    immunization_status: null,
    immunization_notes: data.immunization_notes || null,
    notes: data.notes || null,
    sibling_note: data.sibling_note || null,
    eligibility_ack: data.eligibility_ack,
    waiver_version: data.waiver_version,
    health_form_version: data.health_form_version,
    emergency_consent_version: data.emergency_consent_version,
    photo_release: data.photo_release ?? false,
    health_form_ack: data.health_form_ack,
    emergency_medical_consent_ack: data.emergency_medical_consent_ack,
  };
}
