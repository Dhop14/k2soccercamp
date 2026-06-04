import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import {
  EmergencyConsentContent,
  HealthHistoryContent,
  PrivacyPolicyContent,
  WaiverContent,
} from "@/components/legal/legal-content";
import { type LegalDocKey, LegalDocumentReader } from "@/components/legal/LegalDocumentReader";
import { TurnstileWidget, isTurnstileEnabled } from "@/components/registration/TurnstileWidget";
import { SiteLayout } from "@/components/site/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CAMP_DATES_LABEL,
  CAMP_GRADES,
  CAMP_MAX_AGE,
  CAMP_MIN_AGE,
  CAMP_REGION,
  CAMP_TUITION_LABEL,
  EMERGENCY_CONSENT_VERSION,
  HEALTH_FORM_VERSION,
  REGISTRATION_CONTACT_EMAIL,
  SKILL_LEVELS,
  WAIVER_VERSION,
} from "@/lib/camp";
import {
  submitRegistration,
} from "@/lib/api/registration.functions";
import { RegistrationStatusBadge } from "@/components/registration/RegistrationStatusBadge";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import {
  type RegistrationFormInput,
  type RegistrationFormValues,
  registrationFormSchema,
} from "@/lib/registration-schema";

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

const inputClass =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors focus:border-pitch placeholder:text-muted-foreground/50";

function Register() {
  const status = useRegistrationStatus();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const turnstileTokenRef = useRef<string | undefined>(undefined);
  const [legalDocsRead, setLegalDocsRead] = useState<Record<LegalDocKey, boolean>>({
    waiver: false,
    health: false,
    emergency: false,
  });

  const markLegalDocRead = useCallback((key: LegalDocKey) => {
    setLegalDocsRead((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const onWaiverReachedEnd = useCallback(() => markLegalDocRead("waiver"), [markLegalDocRead]);
  const onHealthReachedEnd = useCallback(() => markLegalDocRead("health"), [markLegalDocRead]);
  const onEmergencyReachedEnd = useCallback(
    () => markLegalDocRead("emergency"),
    [markLegalDocRead],
  );

  const form = useForm<RegistrationFormInput, unknown, RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      player_name: "",
      player_age: undefined,
      player_grade: undefined,
      skill_level: "",
      parent_name: "",
      email: "",
      phone: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      secondary_emergency_contact: "",
      allergies: "",
      medical_conditions: "",
      medications: "",
      activity_restrictions: "",
      physician_name: "",
      physician_phone: "",
      immunization_notes: "",
      notes: "",
      sibling_note: "",
      eligibility_ack: false,
      waiver_ack: false,
      health_form_ack: false,
      emergency_medical_consent_ack: false,
      photo_release: false,
      website: "",
    },
  });

  async function onSubmit(values: RegistrationFormValues) {
    setServerError(null);
    setDuplicate(false);

    if (isTurnstileEnabled() && !turnstileTokenRef.current) {
      setServerError("Please complete the verification check.");
      return;
    }

    try {
      const result = await submitRegistration({
        data: {
          ...values,
          turnstile_token: turnstileTokenRef.current,
        },
      });

      if (result.duplicate) {
        setDuplicate(true);
        return;
      }

      if (result.ok) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
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
            We've received your registration. Check your inbox for a confirmation email with
            next steps and payment details.
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
            {CAMP_DATES_LABEL} · {CAMP_REGION} · Girls 3rd–8th grade · {CAMP_TUITION_LABEL}
          </p>
          <RegistrationStatusBadge open={status.open} className="mt-4" />
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        {!status.canSubmit ? (
          <ClosedRegistration />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto grid max-w-2xl gap-8"
              noValidate
            >
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden
                {...form.register("website")}
              />

              <Fieldset legend="01 — Player Info">
                <FormField
                  control={form.control}
                  name="player_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Player name <span className="text-pitch">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          autoComplete="name"
                          className={inputClass}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="player_grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Current grade (3rd–8th) <span className="text-pitch">*</span>
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            className={inputClass}
                            required
                          >
                            <option value="">Select…</option>
                            {CAMP_GRADES.map((g) => (
                              <option key={g} value={g}>
                                Grade {g}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="player_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Age <span className="text-pitch">*</span>
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="number"
                            min={CAMP_MIN_AGE}
                            max={CAMP_MAX_AGE}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            className={inputClass}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="skill_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill level</FormLabel>
                      <FormControl>
                        <select {...field} className={inputClass}>
                          <option value="">Select…</option>
                          {SKILL_LEVELS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Fieldset>

              <Fieldset legend="02 — Parent / Guardian">
                <FormField
                  control={form.control}
                  name="parent_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Your name <span className="text-pitch">*</span>
                      </FormLabel>
                      <FormControl>
                        <input {...field} autoComplete="name" className={inputClass} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-pitch">*</span>
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="email"
                            autoComplete="email"
                            className={inputClass}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone <span className="text-pitch">*</span>
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="tel"
                            autoComplete="tel"
                            className={inputClass}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="sibling_note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sibling / multiple players</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={2}
                          placeholder="Registering with a sibling? Note their name here for discount coordination."
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Fieldset>

              <Fieldset legend="03 — Health & safety">
                <p className="text-sm text-muted-foreground">
                  Helps our coaches care for your player. See{" "}
                  <LegalDocumentReader
                    title="Health & emergency care"
                    description={`Health ${HEALTH_FORM_VERSION}, emergency ${EMERGENCY_CONSENT_VERSION}`}
                    fullPageTo="/health-emergency"
                    triggerLabel="health & emergency details"
                  >
                    <div className="space-y-12">
                      <HealthHistoryContent />
                      <EmergencyConsentContent />
                    </div>
                  </LegalDocumentReader>
                  .
                </p>
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Allergies <span className="text-pitch">*</span>
                      </FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={2}
                          placeholder="List all known allergies and reactions, or write “None known”"
                          className={inputClass}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical conditions</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={2}
                          placeholder="Asthma, seizures, diabetes, recent injuries, etc."
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medications & devices</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={2}
                          placeholder="Daily meds, inhaler, EpiPen, when/how used"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activity_restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity restrictions</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          placeholder="Physician-ordered limits, if any"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="physician_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary care physician</FormLabel>
                        <FormControl>
                          <input {...field} className={inputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="physician_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physician phone</FormLabel>
                        <FormControl>
                          <input {...field} type="tel" className={inputClass} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="immunization_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional health notes (optional)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={2}
                          placeholder="Anything else staff should know (e.g. recent injury, vaccination concerns)"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Fieldset>

              <Fieldset legend="04 — Emergency contacts">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact name <span className="text-pitch">*</span>
                        </FormLabel>
                        <FormControl>
                          <input {...field} className={inputClass} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact phone <span className="text-pitch">*</span>
                        </FormLabel>
                        <FormControl>
                          <input {...field} type="tel" className={inputClass} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="secondary_emergency_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary emergency contact (optional)</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          placeholder="Name and phone"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Fieldset>

              <Fieldset legend="05 — Anything else?">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional notes</FormLabel>
                      <FormControl>
                        <textarea {...field} rows={2} className={inputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Fieldset>

              <Fieldset legend="06 — Agreements">
                <FormField
                  control={form.control}
                  name="eligibility_ack"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-snug">
                        <FormLabel className="font-normal">
                          I confirm my player is a girl in grades 3–8 (current school year) and
                          meets camp eligibility. <span className="text-pitch">*</span>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waiver_ack"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          disabled={!legalDocsRead.waiver}
                          onCheckedChange={(v) => {
                            if (legalDocsRead.waiver) {
                              field.onChange(v === true);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-snug">
                        <FormLabel className="font-normal">
                          I have read and agree to the{" "}
                          <LegalDocumentReader
                            title="Liability Waiver"
                            description={`Version ${WAIVER_VERSION}`}
                            fullPageTo="/waiver"
                            triggerLabel="Liability Waiver"
                            documentKey="waiver"
                            onReachedEnd={onWaiverReachedEnd}
                          >
                            <WaiverContent showRelatedForms={false} />
                          </LegalDocumentReader>{" "}
                          (version {WAIVER_VERSION}). <span className="text-pitch">*</span>
                        </FormLabel>
                        {!legalDocsRead.waiver ? (
                          <p className="text-xs text-muted-foreground">
                            Open the link above and scroll to the end to enable this box.
                          </p>
                        ) : null}
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="health_form_ack"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          disabled={!legalDocsRead.health}
                          onCheckedChange={(v) => {
                            if (legalDocsRead.health) {
                              field.onChange(v === true);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-snug">
                        <FormLabel className="font-normal">
                          I have completed the{" "}
                          <LegalDocumentReader
                            title="Camper health information"
                            description={`Version ${HEALTH_FORM_VERSION}`}
                            fullPageTo="/health-emergency"
                            triggerLabel="health information"
                            documentKey="health"
                            onReachedEnd={onHealthReachedEnd}
                          >
                            <HealthHistoryContent />
                          </LegalDocumentReader>{" "}
                          above is accurate (version {HEALTH_FORM_VERSION}).{" "}
                          <span className="text-pitch">*</span>
                        </FormLabel>
                        {!legalDocsRead.health ? (
                          <p className="text-xs text-muted-foreground">
                            Open the link above and scroll to the end to enable this box.
                          </p>
                        ) : null}
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergency_medical_consent_ack"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          disabled={!legalDocsRead.emergency}
                          onCheckedChange={(v) => {
                            if (legalDocsRead.emergency) {
                              field.onChange(v === true);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-snug">
                        <FormLabel className="font-normal">
                          I authorize emergency medical treatment per the{" "}
                          <LegalDocumentReader
                            title="Emergency medical authorization"
                            description={`Version ${EMERGENCY_CONSENT_VERSION}`}
                            fullPageTo="/health-emergency"
                            triggerLabel="emergency authorization"
                            documentKey="emergency"
                            onReachedEnd={onEmergencyReachedEnd}
                          >
                            <EmergencyConsentContent />
                          </LegalDocumentReader>{" "}
                          (version {EMERGENCY_CONSENT_VERSION}).{" "}
                          <span className="text-pitch">*</span>
                        </FormLabel>
                        {!legalDocsRead.emergency ? (
                          <p className="text-xs text-muted-foreground">
                            Open the link above and scroll to the end to enable this box.
                          </p>
                        ) : null}
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photo_release"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I grant permission for my player to appear in camp photos and videos used
                        for promotional purposes (optional).
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </Fieldset>

              {duplicate && (
                <p className="rounded-sm border border-border bg-muted/50 px-4 py-3 text-sm">
                  We already received a registration for this player in the last 24 hours. If you
                  need to make changes, email{" "}
                  <a href={`mailto:${REGISTRATION_CONTACT_EMAIL}`} className="text-pitch underline">
                    {REGISTRATION_CONTACT_EMAIL}
                  </a>
                  .
                </p>
              )}

              {serverError && (
                <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <TurnstileWidget
                onToken={(t) => {
                  turnstileTokenRef.current = t;
                }}
                onExpire={() => {
                  turnstileTokenRef.current = undefined;
                }}
              />

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>Submit registration</>
                )}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                We'll follow up by email with payment details. No charge today.{" "}
                <LegalDocumentReader
                  title="Privacy Policy"
                  fullPageTo="/privacy"
                  triggerLabel="Privacy policy"
                >
                  <PrivacyPolicyContent />
                </LegalDocumentReader>
              </p>
            </form>
          </Form>
        )}
      </section>
    </SiteLayout>
  );
}

function ClosedRegistration() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="text-lg text-muted-foreground">
        Online registration is closed for now. Please reach out and we'll help from there.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/contact"
          className="inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
        >
          Contact us
        </Link>
        <a
          href={`mailto:${REGISTRATION_CONTACT_EMAIL}`}
          className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-medium hover:border-foreground"
        >
          {REGISTRATION_CONTACT_EMAIL}
        </a>
      </div>
    </div>
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
