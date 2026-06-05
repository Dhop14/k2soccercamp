import { cn } from "@/lib/utils";

type RegistrationQuickFillButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export function RegistrationQuickFillButton({
  label,
  active,
  onClick,
}: RegistrationQuickFillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-pitch bg-pitch/10 text-pitch"
          : "border-border bg-white text-muted-foreground hover:border-pitch/50 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
