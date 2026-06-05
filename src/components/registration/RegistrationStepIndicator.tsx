import { cn } from "@/lib/utils";
import {
  REGISTRATION_WIZARD_STEP_COUNT,
  REGISTRATION_WIZARD_STEPS,
} from "@/lib/registration-steps";

type RegistrationStepIndicatorProps = {
  currentStep: number;
  maxReachableStep: number;
  progressPercent: number;
  isStepComplete: (stepIndex: number) => boolean;
  onStepClick?: (index: number) => void;
};

export function RegistrationStepIndicator({
  currentStep,
  maxReachableStep,
  progressPercent,
  isStepComplete,
  onStepClick,
}: RegistrationStepIndicatorProps) {
  const stepNumber = currentStep + 1;
  const current = REGISTRATION_WIZARD_STEPS[currentStep];

  return (
    <div className="space-y-6" aria-label="Registration progress">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            Step {stepNumber} of {REGISTRATION_WIZARD_STEP_COUNT}
          </p>
          <p className="mt-2 font-display text-2xl md:text-3xl">{current.title}</p>
          {current.description ? (
            <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
              {current.description}
            </p>
          ) : null}
        </div>
        <p className="eyebrow text-pitch tabular-nums">{progressPercent}%</p>
      </div>

      <div
        className="h-1 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Registration completion"
      >
        <div
          className="h-full bg-pitch transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ol className="hidden gap-2 sm:grid sm:grid-cols-7">
        {REGISTRATION_WIZARD_STEPS.map((step, index) => {
          const reachable = index <= maxReachableStep;
          const active = index === currentStep;
          const complete = isStepComplete(index);

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable || !onStepClick}
                onClick={() => onStepClick?.(index)}
                className={cn(
                  "w-full border-t-2 pt-3 text-left transition-colors",
                  active
                    ? "border-pitch"
                    : complete
                      ? "border-pitch/40 hover:border-pitch"
                      : "border-border",
                  reachable && onStepClick ? "cursor-pointer" : "cursor-default",
                  !reachable && "opacity-40",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span className="eyebrow block text-[0.65rem]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs font-medium leading-tight",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
