import { Link } from "@tanstack/react-router";

import {
  EMERGENCY_CONSENT_VERSION,
  HEALTH_FORM_VERSION,
  REGISTRATION_CONTACT_EMAIL,
  WAIVER_VERSION,
} from "@/lib/camp";

const proseClass =
  "prose prose-neutral max-w-none space-y-6 text-muted-foreground dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:leading-relaxed";

export function LegalDevNotice() {
  return (
    <p className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground not-prose">
      <strong>Important:</strong> Placeholder text for development. Replace with attorney-reviewed
      language before accepting production registrations.
    </p>
  );
}

export function HealthDevNotice() {
  return (
    <p className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground not-prose">
      <strong>Important:</strong> Placeholder language for development. Have counsel review before
      camp.
    </p>
  );
}

export function WaiverContent({ showRelatedForms = true }: { showRelatedForms?: boolean }) {
  return (
    <div className={proseClass}>
      <LegalDevNotice />
      <section className="space-y-4">
        <h2>Assumption of risk</h2>
        <p>
          I understand that participation in soccer camp activities involves inherent risks,
          including but not limited to physical injury. I voluntarily assume all risks associated
          with my child&apos;s participation.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Release of liability</h2>
        <p>
          On behalf of myself and my child, I release K2 Soccer Camp, its coaches, volunteers, and
          affiliates from any claims arising from participation, except where prohibited by law.
        </p>
      </section>
      {showRelatedForms && (
        <section className="space-y-4">
          <h2>Related forms</h2>
          <p>
            Camper health information and emergency medical authorization are collected on the
            registration form. See{" "}
            <Link to="/health-emergency" className="text-pitch underline underline-offset-2">
              Health &amp; Emergency
            </Link>{" "}
            for full details.
          </p>
        </section>
      )}
      <section className="space-y-4">
        <h2>Acknowledgment</h2>
        <p>
          By checking the waiver box on the registration form, I confirm I have read and agree to
          this waiver for the player I am registering.
        </p>
      </section>
      <p className="text-sm not-prose text-muted-foreground">Version {WAIVER_VERSION}</p>
    </div>
  );
}

export function HealthHistoryContent() {
  return (
    <div className={proseClass}>
      <HealthDevNotice />
      <section className="space-y-4">
        <h2>Camper health information</h2>
        <p>
          Parents and guardians provide accurate health and safety information so coaches can care
          for your player during camp. K2 is a private soccer day camp and is not licensed as a New
          Jersey youth camp; we collect this information voluntarily for your child&apos;s safety.
        </p>
        <ul>
          <li>Known allergies (food, medication, environmental) and severity</li>
          <li>Physical and mental health conditions relevant to safe participation</li>
          <li>Current medications and use of devices (e.g. inhaler, EpiPen)</li>
          <li>Activity limitations ordered by a physician</li>
          <li>Primary care physician contact (recommended)</li>
          <li>Any other health details you want staff to know (optional)</li>
        </ul>
        <p>
          By checking the health attestation on the registration form, you confirm the information
          you entered in the Health section is complete and accurate to the best of your knowledge
          and agree to update K2 if anything changes before camp.
        </p>
      </section>
      <p className="text-sm not-prose text-muted-foreground">Version {HEALTH_FORM_VERSION}</p>
    </div>
  );
}

export function EmergencyConsentContent() {
  return (
    <div className={proseClass}>
      <section className="space-y-4">
        <h2>Emergency medical authorization</h2>
        <p>
          If a medical emergency occurs and the parent or guardian cannot be reached immediately,
          you authorize K2 Soccer Camp staff to:
        </p>
        <ul>
          <li>
            Arrange emergency first aid and transport via EMS to the nearest appropriate facility
          </li>
          <li>Share relevant health information with emergency personnel and providers</li>
          <li>
            Make routine emergency treatment decisions for your child when you are unreachable
          </li>
        </ul>
        <p>
          You agree to be financially responsible for medical costs and to indemnify the camp only
          as permitted by New Jersey law. This authorization does not waive the camp&apos;s duty to
          exercise reasonable care.
        </p>
        <p>
          Emergency contacts listed on registration may be contacted in order. Provide a secondary
          contact when possible.
        </p>
      </section>
      <p className="text-sm not-prose text-muted-foreground">Version {EMERGENCY_CONSENT_VERSION}</p>
    </div>
  );
}

export function PrivacyPolicyContent() {
  return (
    <div className={proseClass}>
      <section className="space-y-4">
        <h2>What we collect</h2>
        <p>
          When you register, we collect player and parent/guardian contact information, emergency
          contacts, health and safety information (allergies, conditions, medications, optional
          health notes), and agreement records (eligibility, liability waiver, health attestation,
          emergency medical authorization, optional photo release).
        </p>
      </section>
      <section className="space-y-4">
        <h2>How we use it</h2>
        <p>
          We use this information to manage camp registration, communicate about schedules and
          payment, and help keep players safe. We do not sell your data.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Where it is stored</h2>
        <p>
          Registration data is stored in Supabase (hosted database). Confirmation emails may be sent
          through Resend. Only camp organizers with authorized access can view submissions.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Retention &amp; requests</h2>
        <p>
          We retain registration records through the camp season and a reasonable period afterward.
          To request correction or deletion, contact{" "}
          <a href={`mailto:${REGISTRATION_CONTACT_EMAIL}`} className="text-pitch underline">
            {REGISTRATION_CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
