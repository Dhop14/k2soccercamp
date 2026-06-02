import { createFileRoute, Link } from "@tanstack/react-router";

import { WaiverContent } from "@/components/legal/legal-content";
import { SiteLayout } from "@/components/site/Layout";
import { WAIVER_VERSION } from "@/lib/camp";

export const Route = createFileRoute("/waiver")({
  head: () => ({
    meta: [
      { title: "Liability Waiver — K2 Soccer Camp" },
      { name: "description", content: "K2 Soccer Camp liability waiver and release." },
    ],
  }),
  component: WaiverPage,
});

function WaiverPage() {
  return (
    <SiteLayout>
      <article className="wrap py-20 md:py-28">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-6 font-display text-4xl text-balance md:text-5xl">Liability Waiver</h1>
        <p className="mt-4 text-sm text-muted-foreground">Version {WAIVER_VERSION}</p>

        <div className="mt-12 max-w-3xl">
          <WaiverContent />
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
