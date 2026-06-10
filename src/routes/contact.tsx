import { createFileRoute } from "@tanstack/react-router";
import { RegistrationCta } from "@/components/registration/RegistrationCta";
import { SiteLayout } from "@/components/site/Layout";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
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
  const registration = useRegistrationStatus();

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
              (973) 349-4146, (732) 691-1605
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
            {registration.open ? "Ready to register?" : "Registration is closed"}
          </h2>
          <p className="mt-4 max-w-lg text-background/70">
            {registration.open
              ? "Use our quick online form — about two minutes per player. Register each player separately; mention siblings in the notes field for discount coordination."
              : "Online registration is closed for now. Email or call us and we'll help from there."}
          </p>
          <RegistrationCta
            open={registration.open}
            variant="pitch"
            openLabel="Go to registration"
            closedLabel="Registration closed"
            closedTo="/register"
            className="mt-8"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
