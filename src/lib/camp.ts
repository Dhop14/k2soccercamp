/** General region where camp will be held. */
export const CAMP_REGION = "Morris County, NJ";

/** Specific field or facility — not finalized yet. */
export const CAMP_VENUE_SHORT = "Venue TBD";

/** One-line note for cards and summaries. */
export const CAMP_VENUE_LINE = `${CAMP_VENUE_SHORT} · ${CAMP_REGION}`;

/** Fuller placeholder for detail sections. */
export const CAMP_VENUE_NOTE =
  "We're finalizing the field in the Morris County area. Registered families will receive the exact address and directions before camp starts.";

export const CAMP_DATES_LABEL = "July 13–16, 2026";

export const CAMP_HOURS_LABEL = "9:00 AM – 12:00 PM";

export const CAMP_TUITION_LABEL = "$225 per player";

export const CAMP_GRADES = [3, 4, 5, 6, 7, 8] as const;

/** All registrations collect current school-year grade (stored in `grade_basis`). */
export const REGISTRATION_GRADE_BASIS = "current" as const;

export type CampGrade = (typeof CAMP_GRADES)[number];

export function isEligibleGrade(grade: number): grade is CampGrade {
  return CAMP_GRADES.includes(grade as CampGrade);
}

export const CAMP_MIN_AGE = 8;
export const CAMP_MAX_AGE = 15;

/** Liability / participation release — attorney review required before production. */
export const WAIVER_VERSION = "2026-06-06";

/** Camper health & safety attestation (collected for camp operations, not NJ youth-camp filing). */
export const HEALTH_FORM_VERSION = "2026-06-06";

/** Emergency medical treatment authorization when a parent cannot be reached. */
export const EMERGENCY_CONSENT_VERSION = "2026-06-06";

export const REGISTRATION_CONTACT_EMAIL = "info@k2soccercamp.com";

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

