import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { PrivacyPolicyContent } from "@/components/legal/legal-content";
import { type LegalDocKey, LegalDocumentReader } from "@/components/legal/LegalDocumentReader";
import { RegistrationStepIndicator } from "@/components/registration/RegistrationStepIndicator";
import { RegistrationStepPanels } from "@/components/registration/RegistrationStepPanels";
import { TurnstileWidget, isTurnstileEnabled } from "@/components/registration/TurnstileWidget";
import { RegistrationStatusBadge } from "@/components/registration/RegistrationStatusBadge";
import { SiteLayout } from "@/components/site/Layout";
import { Form } from "@/components/ui/form";
import {
  submitRegistration,
} from "@/lib/api/registration.functions";
import {
  CAMP_DATES_LABEL,
  CAMP_REGION,
  CAMP_TUITION_LABEL,
  REGISTRATION_CONTACT_EMAIL,
} from "@/lib/camp";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import {
  REGISTRATION_WIZARD_STEPS,
  REGISTRATION_WIZARD_STEP_COUNT,
} from "@/lib/registration-steps";
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

const REVIEW_STEP_INDEX = REGISTRATION_WIZARD_STEP_COUNT - 1;

function scrollToWizardTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Register() {
  const status = useRegistrationStatus();
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);
  const [maxReachableStep, setMaxReachableStep] = useState(0);
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

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index > maxReachableStep) return;
    setStep(index);
    scrollToWizardTop();
  }, [maxReachableStep]);

  const goNext = useCallback(async () => {
    const current = REGISTRATION_WIZARD_STEPS[step];
    if (current.fields.length > 0) {
      const ok = await form.trigger([...current.fields]);
      if (!ok) return;
    }
    const next = Math.min(step + 1, REVIEW_STEP_INDEX);
    setStep(next);
    setMaxReachableStep((prev) => Math.max(prev, next));
    scrollToWizardTop();
  }, [form, step]);

  const goBack = useCallback(() => {
    setStep((prev) => Math.max(0, prev - 1));
    scrollToWizardTop();
  }, []);

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

  const isReviewStep = step === REVIEW_STEP_INDEX;

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
          <p className="mt-3 text-sm text-muted-foreground">
            About 8–10 minutes · {REGISTRATION_WIZARD_STEP_COUNT} steps · no payment today
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
              className="mx-auto max-w-2xl"
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

              <RegistrationStepIndicator
                currentStep={step}
                maxReachableStep={maxReachableStep}
                onStepClick={goToStep}
              />

              <div className="mt-10 border-t border-border pt-10">
                <RegistrationStepPanels
                  step={step}
                  form={form}
                  legalDocsRead={legalDocsRead}
                  onWaiverReachedEnd={onWaiverReachedEnd}
                  onHealthReachedEnd={onHealthReachedEnd}
                  onEmergencyReachedEnd={onEmergencyReachedEnd}
                  onEditReviewStep={goToStep}
                />
              </div>

              {isReviewStep ? (
                <div className="mt-10 space-y-6">
                  {duplicate ? (
                    <p className="rounded-sm border border-border bg-muted/50 px-4 py-3 text-sm">
                      We already received a registration for this player in the last 24 hours. If
                      you need to make changes, email{" "}
                      <a
                        href={`mailto:${REGISTRATION_CONTACT_EMAIL}`}
                        className="text-pitch underline"
                      >
                        {REGISTRATION_CONTACT_EMAIL}
                      </a>
                      .
                    </p>
                  ) : null}

                  {serverError ? (
                    <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {serverError}
                    </p>
                  ) : null}

                  <TurnstileWidget
                    onToken={(t) => {
                      turnstileTokenRef.current = t;
                    }}
                    onExpire={() => {
                      turnstileTokenRef.current = undefined;
                    }}
                  />

                  <p className="text-sm text-muted-foreground">
                    We'll follow up by email with payment details. No charge today.
                  </p>
                </div>
              ) : null}

              <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-medium transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </button>

                {isReviewStep ? (
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background transition-transform hover:scale-[1.01] disabled:opacity-60"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Sending…
                      </>
                    ) : (
                      <>Submit registration</>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background transition-transform hover:scale-[1.01]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>

              {isReviewStep ? (
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  <LegalDocumentReader
                    title="Privacy Policy"
                    fullPageTo="/privacy"
                    triggerLabel="Privacy policy"
                  >
                    <PrivacyPolicyContent />
                  </LegalDocumentReader>
                </p>
              ) : null}
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
