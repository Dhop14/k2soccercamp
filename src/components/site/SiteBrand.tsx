import { cn } from "@/lib/utils";

import { K2Logo } from "@/components/site/K2Logo";

const BRAND_HEIGHT = "h-8";

type SiteBrandProps = {
  className?: string;
  logoTitle?: string;
};

/** K2 mark + “Soccer Camp” lockup, optically centered. */
export function SiteBrand({ className, logoTitle }: SiteBrandProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <K2Logo title={logoTitle} className={BRAND_HEIGHT} />
      {/* Fraunces sits high in its em-box; nudge down to match the K2 mark center */}
      <span className="translate-y-2 font-display text-lg leading-none">
        Soccer Camp
      </span>
    </div>
  );
}
