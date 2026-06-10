import type { FieldErrors } from "react-hook-form";

import {
  type RegistrationFormInput,
  isRegistrationStepFieldsComplete,
  registrationFormSchema,
} from "@/lib/registration-schema";

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
    fields: ["player_name", "player_age", "player_grade", "shirt_size", "skill_level"],
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

export const REVIEW_STEP_INDEX = REGISTRATION_WIZARD_STEP_COUNT - 1;
export const DATA_STEP_COUNT = REVIEW_STEP_INDEX;

export type RegistrationWizardState = {
  /** Highest step index the user may jump to (inclusive). */
  maxReachableStep: number;
  progressPercent: number;
  completedDataSteps: number;
  isStepComplete: (stepIndex: number) => boolean;
};

/** Progress and navigation derived from validated field values, not the active step. */
export function getRegistrationWizardState(
  values: RegistrationFormInput,
): RegistrationWizardState {
  let completedDataSteps = 0;
  let firstIncomplete = REVIEW_STEP_INDEX;

  for (let i = 0; i < DATA_STEP_COUNT; i++) {
    const step = REGISTRATION_WIZARD_STEPS[i];
    const complete = isRegistrationStepFieldsComplete(step.fields, values);
    if (complete) {
      completedDataSteps++;
    } else if (firstIncomplete === REVIEW_STEP_INDEX) {
      firstIncomplete = i;
    }
  }

  const allDataComplete = completedDataSteps === DATA_STEP_COUNT;
  const maxReachableStep = allDataComplete ? REVIEW_STEP_INDEX : firstIncomplete;
  const progressPercent = allDataComplete
    ? 100
    : Math.round((completedDataSteps / REGISTRATION_WIZARD_STEP_COUNT) * 100);

  const isStepComplete = (stepIndex: number) => {
    const step = REGISTRATION_WIZARD_STEPS[stepIndex];
    if (!step || step.fields.length === 0) return false;
    return isRegistrationStepFieldsComplete(step.fields, values);
  };

  return {
    maxReachableStep,
    progressPercent,
    completedDataSteps,
    isStepComplete,
  };
}

/** First wizard step (in order) that has a react-hook-form error after submit. */
export function getFirstRegistrationStepWithErrors(
  errors: FieldErrors<RegistrationFormInput>,
): number | null {
  for (let i = 0; i < DATA_STEP_COUNT; i++) {
    const { fields } = REGISTRATION_WIZARD_STEPS[i];
    if (fields.some((field) => errors[field])) {
      return i;
    }
  }
  return null;
}

/** Resolve which step to show when full-form validation fails (do not default to step 0). */
export function getFirstRegistrationStepForInvalidForm(
  values: RegistrationFormInput,
): number {
  const parsed = registrationFormSchema.safeParse(values);
  if (!parsed.success) {
    for (let i = 0; i < DATA_STEP_COUNT; i++) {
      const { fields } = REGISTRATION_WIZARD_STEPS[i];
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          typeof field === "string" &&
          fields.includes(field as RegistrationWizardFieldName)
        ) {
          return i;
        }
      }
    }
  }

  for (let i = 0; i < DATA_STEP_COUNT; i++) {
    if (!isRegistrationStepFieldsComplete(REGISTRATION_WIZARD_STEPS[i].fields, values)) {
      return i;
    }
  }

  return REVIEW_STEP_INDEX > 0 ? REVIEW_STEP_INDEX - 1 : 0;
}
