import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type LegalDocumentReaderProps = {
  title: string;
  description?: string;
  fullPageTo: "/waiver" | "/health-emergency" | "/privacy";
  triggerLabel: string;
  children: React.ReactNode;
};

export function LegalDocumentReader({
  title,
  description,
  fullPageTo,
  triggerLabel,
  children,
}: LegalDocumentReaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="cursor-pointer text-pitch underline underline-offset-2 hover:text-pitch/80"
      >
        {triggerLabel}
      </button>
      <DialogContent
        className={cn(
          "flex max-h-[min(90dvh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
          "left-[50%] top-[50%] w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 pb-4 pt-6 pr-12 text-left">
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
        <DialogFooter className="shrink-0 flex-row flex-wrap gap-3 border-t border-border px-6 py-4 sm:justify-between">
          <Link
            to={fullPageTo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:text-pitch hover:underline"
          >
            Open full page
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
