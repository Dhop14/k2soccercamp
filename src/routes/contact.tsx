import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — K2" },
      {
        name: "description",
        content: "Questions about the camp? Reach out by email or phone, or register directly online.",
      },
      { property: "og:title", content: "Contact the Camp" },
      { property: "og:description", content: "Get in touch with K2." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <section className="wrap py-20 md:py-28">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl text-balance">
          Questions? <span className="italic text-pitch">Ask away</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          We're happy to talk through dates, what to bring, sibling discounts —
          anything you need to feel good about signing your player up.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <a
            href="mailto:info@k2soccercamp.com"
            className="group block rounded-sm border border-border p-8 transition-colors hover:border-foreground"
          >
            <Mail className="h-5 w-5 text-pitch" />
            <p className="eyebrow mt-6">Email</p>
            <p className="mt-2 font-sans text-xl font-medium leading-normal group-hover:text-pitch">
              info@k2soccercamp.com
            </p>
          </a>
          <a
            href="tel:+19735550199"
            className="group block rounded-sm border border-border p-8 transition-colors hover:border-foreground"
          >
            <Phone className="h-5 w-5 text-pitch" />
            <p className="eyebrow mt-6">Phone</p>
            <p className="mt-2 font-sans text-xl font-medium leading-normal group-hover:text-pitch">
              (973) 555-0199
            </p>
          </a>
          <div className="rounded-sm border border-border p-8">
            <MapPin className="h-5 w-5 text-pitch" />
            <p className="eyebrow mt-6">Location</p>
            <p className="mt-2 font-sans text-xl font-medium leading-normal">
              Morris County, NJ
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-sm bg-foreground p-10 text-background md:p-16">
          <h2 className="font-display text-3xl md:text-4xl text-balance">
            Ready to register?
          </h2>
          <p className="mt-4 max-w-lg text-background/70">
            Use our quick online form — about two minutes per player. Register each player
            separately; mention siblings in the notes field for discount coordination.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-pitch px-6 text-sm font-medium text-pitch-foreground"
          >
            Go to registration
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
