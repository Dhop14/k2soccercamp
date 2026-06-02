import { createFileRoute, Link } from "@tanstack/react-router";

import { EmergencyConsentContent, HealthHistoryContent } from "@/components/legal/legal-content";
import { SiteLayout } from "@/components/site/Layout";
import { EMERGENCY_CONSENT_VERSION, HEALTH_FORM_VERSION } from "@/lib/camp";

export const Route = createFileRoute("/health-emergency")({
  head: () => ({
    meta: [
      { title: "Health & Emergency Forms — K2 Soccer Camp" },
      {
        name: "description",
        content:
          "Camper health information and emergency medical authorization for K2 Soccer Camp.",
      },
    ],
  }),
  component: HealthEmergencyPage,
});

function HealthEmergencyPage() {
  return (
    <SiteLayout>
      <article className="wrap py-20 md:py-28">
        <p className="eyebrow">Legal & health</p>
        <h1 className="mt-6 font-display text-4xl text-balance md:text-5xl">
          Health &amp; emergency care
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          K2 collects health and emergency contact information during registration to help keep
          players safe. This is not a substitute for advice from your physician or legal counsel.
          Versions: health {HEALTH_FORM_VERSION}, emergency {EMERGENCY_CONSENT_VERSION}.
        </p>

        <div className="mt-12 max-w-3xl space-y-12">
          <HealthHistoryContent />
          <EmergencyConsentContent />
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/register"
            className="inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
          >
            Back to registration
          </Link>
          <Link
            to="/waiver"
            className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-medium"
          >
            Liability waiver
          </Link>
        </div>
      </article>
    </SiteLayout>
  );
}
