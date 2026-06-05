import type { RegistrationFormInput } from "@/lib/registration-schema";

export const REGISTRATION_WIZARD_STEP_COUNT = 7;

export type RegistrationWizardFieldName = keyof RegistrationFormInput;

export type RegistrationWizardStep = {
  id: string;
  label: string;
  title: string;
  description?: string;
  fields: readonly RegistrationWizardFieldName[];
};

/** Data-entry steps validate on Continue; review submits the full form. */
export const REGISTRATION_WIZARD_STEPS: readonly RegistrationWizardStep[] = [
  {
    id: "player",
    label: "Player",
    title: "Player info",
    description: "Who's joining camp this summer?",
    fields: ["player_name", "player_age", "player_grade", "skill_level"],
  },
  {
    id: "parent",
    label: "Parent",
    title: "Parent / guardian",
    description: "How we reach you about your player.",
    fields: ["parent_name", "email", "phone", "sibling_note"],
  },
  {
    id: "health",
    label: "Health",
    title: "Health & safety",
    description: "Helps our coaches care for your player on the field.",
    fields: [
      "allergies",
      "medical_conditions",
      "medications",
      "activity_restrictions",
      "physician_name",
      "physician_phone",
      "immunization_notes",
    ],
  },
  {
    id: "emergency",
    label: "Emergency",
    title: "Emergency contacts",
    description: "Who we call if we can't reach you during camp.",
    fields: [
      "emergency_contact_name",
      "emergency_contact_phone",
      "secondary_emergency_contact",
    ],
  },
  {
    id: "notes",
    label: "Notes",
    title: "Anything else?",
    description: "Optional — tell us anything that helps before day one.",
    fields: ["notes"],
  },
  {
    id: "agreements",
    label: "Agreements",
    title: "Policies & consent",
    description: "Required to complete registration.",
    fields: [
      "eligibility_ack",
      "waiver_ack",
      "health_form_ack",
      "emergency_medical_consent_ack",
      "photo_release",
    ],
  },
  {
    id: "review",
    label: "Review",
    title: "Review & submit",
    description: "Confirm everything looks right, then send your registration.",
    fields: [],
  },
] as const;

export function registrationWizardProgressPercent(stepIndex: number): number {
  return Math.round(((stepIndex + 1) / REGISTRATION_WIZARD_STEP_COUNT) * 100);
}
