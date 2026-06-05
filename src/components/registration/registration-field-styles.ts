import { cn } from "@/lib/utils";

/** Shared “filled” field look — white fields on bone background, still editorial. */
const registrationFieldBase = cn(
  "w-full rounded-sm border border-border bg-white px-3 py-2.5 text-base text-foreground",
  "dark:bg-card dark:focus:bg-card",
  "shadow-[inset_0_1px_2px_oklch(0_0_0_/_0.04)]",
  "outline-none transition-[border-color,box-shadow,background-color]",
  "placeholder:text-muted-foreground/55",
  "focus:border-pitch focus:bg-white focus:ring-2 focus:ring-pitch/20",
  "aria-invalid:border-destructive/80 aria-invalid:ring-2 aria-invalid:ring-destructive/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export const registrationInputClass = registrationFieldBase;

const selectChevron =
  "[background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b6560' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] [background-position:right_0.75rem_center] [background-size:1.125rem] bg-no-repeat";

/** Native select — `bg-white` must not share the `bg-*` slot with chevron image utilities. */
export const registrationSelectClass = cn(
  registrationFieldBase,
  "registration-select cursor-pointer appearance-none bg-white pr-10",
  "focus:bg-white dark:focus:bg-card",
  selectChevron,
);

export const registrationTextareaClass = cn(
  registrationFieldBase,
  "min-h-[4.5rem] resize-y py-3 leading-relaxed",
);
