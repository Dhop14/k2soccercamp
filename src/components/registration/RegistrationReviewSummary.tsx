import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { RegistrationFormInput } from "@/lib/registration-schema";
import { REGISTRATION_WIZARD_STEPS } from "@/lib/registration-steps";
import { CAMP_GRADES } from "@/lib/camp";

type RegistrationReviewSummaryProps = {
  form: UseFormReturn<RegistrationFormInput>;
  onEditStep: (stepIndex: number) => void;
};

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid gap-1 border-b border-border/60 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

function ReviewSection({
  stepIndex,
  title,
  onEdit,
  children,
}: {
  stepIndex: number;
  title: string;
  onEdit: (stepIndex: number) => void;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="eyebrow">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="text-sm font-medium text-pitch underline-offset-4 hover:underline"
        >
          Edit
        </button>
      </div>
      <dl>{children}</dl>
    </section>
  );
}

export function RegistrationReviewSummary({ form, onEditStep }: RegistrationReviewSummaryProps) {
  const v = form.getValues();

  const gradeLabel =
    v.player_grade != null && (CAMP_GRADES as readonly number[]).includes(v.player_grade)
      ? `Grade ${v.player_grade}`
      : "—";

  return (
    <div className="space-y-2">
      <ReviewSection
        stepIndex={0}
        title={REGISTRATION_WIZARD_STEPS[0].label}
        onEdit={onEditStep}
      >
        <ReviewRow label="Player" value={v.player_name} />
        <ReviewRow label="Grade" value={gradeLabel} />
        <ReviewRow label="Age" value={v.player_age != null ? String(v.player_age) : null} />
        <ReviewRow label="Shirt size" value={v.shirt_size} />
        <ReviewRow label="Skill level" value={v.skill_level || "Not specified"} />
      </ReviewSection>

      <ReviewSection
        stepIndex={1}
        title={REGISTRATION_WIZARD_STEPS[1].label}
        onEdit={onEditStep}
      >
        <ReviewRow label="Parent / guardian" value={v.parent_name} />
        <ReviewRow label="Email" value={v.email} />
        <ReviewRow label="Phone" value={v.phone} />
        <ReviewRow label="Sibling note" value={v.sibling_note} />
      </ReviewSection>

      <ReviewSection
        stepIndex={2}
        title={REGISTRATION_WIZARD_STEPS[2].label}
        onEdit={onEditStep}
      >
        <ReviewRow label="Allergies" value={v.allergies} />
        <ReviewRow label="Medical conditions" value={v.medical_conditions} />
        <ReviewRow label="Medications" value={v.medications} />
        <ReviewRow label="Activity restrictions" value={v.activity_restrictions} />
        <ReviewRow
          label="Physician"
          value={
            v.physician_name || v.physician_phone
              ? [v.physician_name, v.physician_phone].filter(Boolean).join(" · ")
              : null
          }
        />
        <ReviewRow label="Additional health notes" value={v.immunization_notes} />
      </ReviewSection>

      <ReviewSection
        stepIndex={3}
        title={REGISTRATION_WIZARD_STEPS[3].label}
        onEdit={onEditStep}
      >
        <ReviewRow label="Primary contact" value={v.emergency_contact_name} />
        <ReviewRow label="Primary phone" value={v.emergency_contact_phone} />
        <ReviewRow label="Secondary contact" value={v.secondary_emergency_contact} />
      </ReviewSection>

      <ReviewSection stepIndex={4} title="Notes" onEdit={onEditStep}>
        <ReviewRow label="Additional notes" value={v.notes || "None"} />
      </ReviewSection>

      <ReviewSection
        stepIndex={5}
        title={REGISTRATION_WIZARD_STEPS[5].label}
        onEdit={onEditStep}
      >
        <ReviewRow label="Eligibility" value={v.eligibility_ack ? "Confirmed" : "—"} />
        <ReviewRow label="Liability waiver" value={v.waiver_ack ? "Accepted" : "—"} />
        <ReviewRow label="Health form" value={v.health_form_ack ? "Confirmed" : "—"} />
        <ReviewRow
          label="Emergency medical"
          value={v.emergency_medical_consent_ack ? "Authorized" : "—"}
        />
        <ReviewRow
          label="Photo release"
          value={v.photo_release ? "Granted" : "Not granted"}
        />
      </ReviewSection>
    </div>
  );
}
