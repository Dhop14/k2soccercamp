import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type RegistrationCtaVariant = "foreground" | "pitch";
type RegistrationCtaSize = "sm" | "md";

type RegistrationCtaProps = {
  open: boolean;
  variant?: RegistrationCtaVariant;
  size?: RegistrationCtaSize;
  openLabel?: string;
  closedLabel?: string;
  closedTo?: "/register" | "/contact";
  className?: string;
  showIcon?: boolean;
};

const sizeClasses: Record<RegistrationCtaSize, string> = {
  sm: "h-9 px-4",
  md: "h-12 px-6",
};

const variantClasses: Record<
  RegistrationCtaVariant,
  { open: string; closed: string }
> = {
  foreground: {
    open: "bg-foreground text-background hover:scale-[1.02]",
    closed: "border border-border bg-muted text-muted-foreground hover:border-foreground",
  },
  pitch: {
    open: "bg-pitch text-pitch-foreground hover:scale-[1.02]",
    closed:
      "border border-background/25 bg-background/15 text-background/80 hover:border-background/40",
  },
};

export function RegistrationCta({
  open,
  variant = "foreground",
  size = "md",
  openLabel = "Reserve a spot",
  closedLabel = "Registration closed",
  closedTo = "/contact",
  className,
  showIcon = false,
}: RegistrationCtaProps) {
  const to = open ? "/register" : closedTo;
  const label = open ? openLabel : closedLabel;
  const tone = open ? variantClasses[variant].open : variantClasses[variant].closed;

  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full text-sm font-medium transition-transform",
        sizeClasses[size],
        tone,
        className,
      )}
    >
      {label}
      {showIcon && (
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </Link>
  );
}
