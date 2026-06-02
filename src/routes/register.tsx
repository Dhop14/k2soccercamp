import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — K2 Soccer Camp" },
      {
        name: "description",
        content:
          "Reserve your player's spot at K2. Four days in July. Girls 3rd–8th grade. $225 per player.",
      },
      { property: "og:title", content: "Register for Camp" },
      {
        property: "og:description",
        content: "Sign your player up for four focused days of soccer in North Jersey.",
      },
    ],
  }),
  component: Register,
});

const schema = z.object({
  player_name: z.string().trim().min(1, "Required").max(120),
  player_age: z.coerce.number().int().min(5, "Min age 5").max(20, "Max age 20"),
  skill_level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  parent_name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(5, "Required").max(40),
  emergency_contact: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

function Register() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Errors;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const payload = {
      ...parsed.data,
      emergency_contact: parsed.data.emergency_contact || null,
      notes: parsed.data.notes || null,
      skill_level: parsed.data.skill_level || null,
    };
    const { error } = await supabase.from("registrations").insert(payload);
    setSubmitting(false);
    if (error) {
      setServerError("Something went wrong. Please try again or email us directly.");
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <section className="wrap py-32 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-pitch" />
          <h1 className="mt-8 font-display text-5xl md:text-6xl text-balance">
            You're <span className="italic text-pitch">in</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
            We've received the registration. You'll get a confirmation email
            shortly with payment details and what to bring on day one.
          </p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="wrap py-20 md:py-24">
          <p className="eyebrow">Register</p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl text-balance">
            Save your <span className="italic text-pitch">spot</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Four days in July · Morris County, NJ · Girls 3rd–8th grade · $225 per player
          </p>
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        <form onSubmit={onSubmit} className="mx-auto grid max-w-2xl gap-8">
          <Fieldset legend="01 — Player Info">
            <Field label="Player name" name="player_name" error={errors.player_name} required />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Age"
                name="player_age"
                type="number"
                min={5}
                max={20}
                error={errors.player_age}
                required
              />
              <SelectField
                label="Skill level"
                name="skill_level"
                options={["Beginner", "Intermediate", "Advanced"]}
                error={errors.skill_level}
              />
            </div>
          </Fieldset>

          <Fieldset legend="02 — Parent / Guardian">
            <Field label="Your name" name="parent_name" error={errors.parent_name} required />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Email"
                name="email"
                type="email"
                error={errors.email}
                required
              />
              <Field label="Phone" name="phone" type="tel" error={errors.phone} required />
            </div>
            <Field
              label="Emergency contact (name & phone)"
              name="emergency_contact"
              error={errors.emergency_contact}
            />
          </Fieldset>

          <Fieldset legend="03 — Anything we should know?">
            <Field
              label="Notes (allergies, medical, etc.)"
              name="notes"
              textarea
              error={errors.notes}
            />
          </Fieldset>

          {serverError && (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>Submit registration</>
            )}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            We'll follow up by email with more info and payment details. No charge today.
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-8">
      <legend className="eyebrow -mt-11 bg-background pr-4">{legend}</legend>
      <div className="grid gap-6">{children}</div>
    </fieldset>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  textarea?: boolean;
  min?: number;
  max?: number;
};

function Field({ label, name, type = "text", required, error, textarea, min, max }: FieldProps) {
  const base =
    "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors focus:border-pitch placeholder:text-muted-foreground/50";
  return (
    <label className="block">
      <span className="block text-sm font-medium">
        {label} {required && <span className="text-pitch">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} rows={3} className={base} />
      ) : (
        <input name={name} type={type} min={min} max={max} required={required} className={base} />
      )}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  error,
}: {
  label: string;
  name: string;
  options: string[];
  error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      <select
        name={name}
        defaultValue=""
        className="w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none focus:border-pitch"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
