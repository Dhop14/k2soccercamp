import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

const SCROLL_END_THRESHOLD_PX = 48;

export type LegalDocKey = "waiver" | "health" | "emergency";

type LegalDocumentReaderProps = {
  title: string;
  description?: string;
  fullPageTo: "/waiver" | "/health-emergency" | "/privacy";
  triggerLabel: string;
  children: React.ReactNode;
  /** When set with `onReachedEnd`, scroll-to-bottom in the modal unlocks the linked checkbox. */
  documentKey?: LegalDocKey;
  onReachedEnd?: () => void;
};

function isScrolledToEnd(el: HTMLElement): boolean {
  const { scrollTop, clientHeight, scrollHeight } = el;
  if (scrollHeight <= clientHeight + SCROLL_END_THRESHOLD_PX) {
    return true;
  }
  return scrollTop + clientHeight >= scrollHeight - SCROLL_END_THRESHOLD_PX;
}

export function LegalDocumentReader({
  title,
  description,
  fullPageTo,
  triggerLabel,
  children,
  documentKey,
  onReachedEnd,
}: LegalDocumentReaderProps) {
  const [open, setOpen] = useState(false);
  const [reachedEndInSession, setReachedEndInSession] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const endReportedRef = useRef(false);

  const requiresScrollGate = Boolean(documentKey && onReachedEnd);

  const reportReachedEnd = useCallback(() => {
    if (!onReachedEnd || endReportedRef.current) {
      return;
    }
    endReportedRef.current = true;
    setReachedEndInSession(true);
    onReachedEnd();
  }, [onReachedEnd]);

  const evaluateReadComplete = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !requiresScrollGate) {
      return;
    }
    if (isScrolledToEnd(scrollEl)) {
      reportReachedEnd();
    }
  }, [requiresScrollGate, reportReachedEnd]);

  const bindScrollContainer = useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      if (node && open && requiresScrollGate) {
        requestAnimationFrame(() => {
          requestAnimationFrame(evaluateReadComplete);
        });
      }
    },
    [open, requiresScrollGate, evaluateReadComplete],
  );

  useEffect(() => {
    if (!open || !requiresScrollGate) {
      return;
    }

    const scrollEl = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!scrollEl) {
      return;
    }

    evaluateReadComplete();

    const onScroll = () => evaluateReadComplete();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => evaluateReadComplete());
    resizeObserver.observe(scrollEl);

    let intersectionObserver: IntersectionObserver | undefined;
    if (sentinel) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            reportReachedEnd();
          }
        },
        { root: scrollEl, threshold: 0, rootMargin: "0px 0px 80px 0px" },
      );
      intersectionObserver.observe(sentinel);
    }

    const delayedChecks = [50, 150, 400].map((ms) =>
      window.setTimeout(() => evaluateReadComplete(), ms),
    );

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      delayedChecks.forEach((id) => window.clearTimeout(id));
    };
  }, [open, requiresScrollGate, evaluateReadComplete, reportReachedEnd]);

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
          "!flex max-h-[min(90dvh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
          "left-[50%] top-[50%] w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 pb-4 pt-6 pr-12 text-left">
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div
          ref={bindScrollContainer}
          onScroll={requiresScrollGate ? evaluateReadComplete : undefined}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6"
        >
          {children}
          {requiresScrollGate ? (
            <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
          ) : null}
        </div>
        <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:flex-wrap sm:justify-between">
          {requiresScrollGate && !reachedEndInSession ? (
            <p className="w-full text-sm text-muted-foreground sm:order-first sm:w-auto">
              Scroll to the bottom to continue.
            </p>
          ) : null}
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
