import { cn } from "@/lib/utils";

type RegistrationStatusBadgeProps = {
  open: boolean;
  className?: string;
};

export function RegistrationStatusBadge({ open, className }: RegistrationStatusBadgeProps) {
  if (open) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-pitch/10 px-3 py-1 text-xs font-medium text-pitch",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-pitch" />
        Registration open
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      Registration closed
    </span>
  );
}
