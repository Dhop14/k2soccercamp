import type { UseFormReturn } from "react-hook-form";

import {
  EmergencyConsentContent,
  HealthHistoryContent,
  WaiverContent,
} from "@/components/legal/legal-content";
import { type LegalDocKey, LegalDocumentReader } from "@/components/legal/LegalDocumentReader";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CAMP_GRADES,
  CAMP_MAX_AGE,
  CAMP_MIN_AGE,
  EMERGENCY_CONSENT_VERSION,
  HEALTH_FORM_VERSION,
  SKILL_LEVELS,
  WAIVER_VERSION,
} from "@/lib/camp";
import type { RegistrationFormInput, RegistrationFormValues } from "@/lib/registration-schema";
import { RegistrationReviewSummary } from "@/components/registration/RegistrationReviewSummary";

export const registrationInputClass =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors focus:border-pitch placeholder:text-muted-foreground/50";

type RegistrationStepPanelsProps = {
  step: number;
  form: UseFormReturn<RegistrationFormInput, unknown, RegistrationFormValues>;
  legalDocsRead: Record<LegalDocKey, boolean>;
  onWaiverReachedEnd: () => void;
  onHealthReachedEnd: () => void;
  onEmergencyReachedEnd: () => void;
  onEditReviewStep: (stepIndex: number) => void;
};

export function RegistrationStepPanels({
  step,
  form,
  legalDocsRead,
  onWaiverReachedEnd,
  onHealthReachedEnd,
  onEmergencyReachedEnd,
  onEditReviewStep,
}: RegistrationStepPanelsProps) {
  const inputClass = registrationInputClass;

  switch (step) {
    case 0:
      return (
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="player_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Player name <span className="text-pitch">*</span>
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
                <FormLabel>Skill level (optional)</FormLabel>
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
        </div>
      );

    case 1:
      return (
        <div className="grid gap-6">
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
                <FormLabel>Sibling / multiple players (optional)</FormLabel>
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
        </div>
      );

    case 2:
      return (
        <div className="grid gap-6">
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
                    placeholder='List all known allergies and reactions, or write "None known"'
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
        </div>
      );

    case 3:
      return (
        <div className="grid gap-6">
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
                  <input {...field} placeholder="Name and phone" className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 4:
      return (
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional notes (optional)</FormLabel>
                <FormControl>
                  <textarea {...field} rows={3} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 5:
      return (
        <div className="grid gap-6">
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
                    I confirm my player is a girl in grades 3–8 (current school year) and meets
                    camp eligibility. <span className="text-pitch">*</span>
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
                    (version {EMERGENCY_CONSENT_VERSION}). <span className="text-pitch">*</span>
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
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">
                  I grant permission for my player to appear in camp photos and videos used for
                  promotional purposes (optional).
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      );

    case 6:
      return <RegistrationReviewSummary form={form} onEditStep={onEditReviewStep} />;

    default:
      return null;
  }
}
