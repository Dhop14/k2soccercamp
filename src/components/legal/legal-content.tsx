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
      <strong>Important:</strong> Placeholder language for development. Review before
      camp.
    </p>
  );
}

export function WaiverContent({ showRelatedForms = true }: { showRelatedForms?: boolean }) {
  return (
    <div className={proseClass}>
      <LegalDevNotice />
      <section className="space-y-4">
        <h2>Parent or legal guardian authority</h2>
        <p>
          By agreeing to this waiver, I represent that I am the parent or legal guardian of the
          minor player I am registering and have legal authority to sign this agreement on the
          player&apos;s behalf.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Assumption of risk</h2>
        <p>
          I understand that participation in soccer camp activities involves inherent and other
          risks, including but not limited to falls, collisions, contact with other participants,
          equipment-related incidents, weather-related conditions, and other risks that may result
          in serious injury, illness, permanent disability, or death. I voluntarily assume all
          risks associated with my child&apos;s participation, including travel to and from camp and
          activities on camp premises.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Medical fitness and participation requirements</h2>
        <p>
          I certify that my child is physically and medically able to participate in camp
          activities, except as disclosed in the health information provided during registration.
          I agree to provide complete and accurate health information and to promptly update K2
          Soccer Camp if my child&apos;s health status changes before or during camp.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Release of liability and covenant not to sue</h2>
        <p>
          To the fullest extent permitted by New Jersey law, on behalf of myself and my child, I
          release and discharge K2 Soccer Camp and its owners, directors, coaches, volunteers,
          staff, contractors, sponsors, host facilities, and affiliates from claims, demands,
          causes of action, damages, losses, or liabilities arising out of or related to camp
          participation, including claims based on ordinary negligence. This release does not apply
          to conduct that cannot be released under applicable law, including gross negligence or
          willful misconduct where prohibited. I further agree not to bring suit against released
          parties for covered claims.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Indemnification</h2>
        <p>
          To the fullest extent permitted by law, I agree to indemnify and hold harmless K2 Soccer
          Camp and released parties from third-party claims arising from my child&apos;s participation
          or my breach of this agreement, except to the extent caused by a released party&apos;s gross
          negligence or willful misconduct where prohibited by law.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Governing law, venue, and severability</h2>
        <p>
          This agreement is governed by New Jersey law. Any dispute related to this agreement or
          camp participation shall be brought in a court of competent jurisdiction in New Jersey,
          unless applicable law requires otherwise. If any provision is found unenforceable, the
          remaining provisions will remain in effect.
        </p>
      </section>
      <section className="space-y-4">
        <h2>Photo release is separate and optional</h2>
        <p>
          Consent for photography or media use is handled separately and is not required to
          participate in camp.
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
          this waiver, understand it affects legal rights, and intend my electronic acceptance to
          be legally binding for myself and the player I am registering.
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
          and agree to update K2 promptly if anything changes before or during camp.
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
          Staff may attempt to contact the parent/guardian and listed emergency contacts as soon as
          reasonably possible under the circumstances. You agree to be financially responsible for
          medical costs and to indemnify the camp only as permitted by New Jersey law. This
          authorization does not waive the camp&apos;s duty to exercise reasonable care.
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
