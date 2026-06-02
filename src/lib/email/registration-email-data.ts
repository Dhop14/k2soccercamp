import { EMERGENCY_CONSENT_VERSION, HEALTH_FORM_VERSION, WAIVER_VERSION } from "@/lib/camp";

export type RegistrationEmailData = {
  submittedAt: string;
  playerName: string;
  parentName: string;
  email: string;
  phone: string;
  playerGrade: number;
  playerAge: number;
  skillLevel: string | null;
  siblingNote: string | null;
  allergies: string;
  medicalConditions: string | null;
  medications: string | null;
  activityRestrictions: string | null;
  healthNotes: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  secondaryEmergencyContact: string | null;
  physicianName: string | null;
  physicianPhone: string | null;
  notes: string | null;
  photoRelease: boolean;
  waiverVersion: string;
  healthFormVersion: string;
  emergencyConsentVersion: string;
};

export type RegistrationSummarySection = {
  title: string;
  rows: [string, string][];
};

function display(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function registrationSummarySections(
  data: RegistrationEmailData,
): RegistrationSummarySection[] {
  return [
    {
      title: "Player",
      rows: [
        ["Name", data.playerName],
        [
          "Age / Grade",
          `${data.playerAge} · Grade ${data.playerGrade} (current grade)`,
        ],
        ["Skill level", display(data.skillLevel)],
        ["Sibling note", display(data.siblingNote)],
      ],
    },
    {
      title: "Parent / guardian",
      rows: [
        ["Name", data.parentName],
        ["Email", data.email],
        ["Phone", data.phone],
      ],
    },
    {
      title: "Health",
      rows: [
        ["Allergies", data.allergies],
        ["Medical conditions", display(data.medicalConditions)],
        ["Medications", display(data.medications)],
        ["Activity restrictions", display(data.activityRestrictions)],
        ["Additional health notes", display(data.healthNotes)],
        [
          "Physician",
          [data.physicianName, data.physicianPhone].filter(Boolean).join(" · ") || "—",
        ],
      ],
    },
    {
      title: "Emergency contacts",
      rows: [
        ["Primary", `${data.emergencyContactName} — ${data.emergencyContactPhone}`],
        ["Secondary", display(data.secondaryEmergencyContact)],
      ],
    },
    {
      title: "Notes & preferences",
      rows: [
        ["Additional notes", display(data.notes)],
        ["Photo release", data.photoRelease ? "Yes" : "No"],
      ],
    },
    {
      title: "Agreements",
      rows: [
        ["Eligibility", "Acknowledged"],
        [`Liability waiver (${data.waiverVersion})`, "Acknowledged"],
        [`Health history (${data.healthFormVersion})`, "Acknowledged"],
        [`Emergency medical consent (${data.emergencyConsentVersion})`, "Acknowledged"],
      ],
    },
  ];
}

/** Flat list (e.g. legacy callers). */
export function registrationSummaryRows(data: RegistrationEmailData): [string, string][] {
  return registrationSummarySections(data).flatMap((section) => section.rows);
}

export function registrationPdfFilename(playerName: string, submittedAt: string) {
  const slug =
    playerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "player";
  const date = submittedAt.slice(0, 10);
  return `k2-registration-${slug}-${date}.pdf`;
}

/** Default consent versions when building from DB row without explicit versions. */
export const DEFAULT_CONSENT_VERSIONS = {
  waiverVersion: WAIVER_VERSION,
  healthFormVersion: HEALTH_FORM_VERSION,
  emergencyConsentVersion: EMERGENCY_CONSENT_VERSION,
} as const;
