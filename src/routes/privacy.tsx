import { createFileRoute, Link } from "@tanstack/react-router";

import { PrivacyPolicyContent } from "@/components/legal/legal-content";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — K2 Soccer Camp" },
      { name: "description", content: "How K2 Soccer Camp collects and uses registration data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <article className="wrap py-20 md:py-28">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-6 font-display text-4xl text-balance md:text-5xl">Privacy Policy</h1>

        <div className="mt-12 max-w-3xl">
          <PrivacyPolicyContent />
        </div>

        <Link
          to="/register"
          className="mt-12 inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-medium hover:border-foreground"
        >
          Back to registration
        </Link>
      </article>
    </SiteLayout>
  );
}
