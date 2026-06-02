import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-script";

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

export function TurnstileWidget({ onToken, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    function renderWidget() {
      if (!containerRef.current || !window.turnstile) {
        return;
      }
      if (widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onToken,
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": () => {
          onExpire?.();
        },
      });
    }

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", renderWidget);
      return () => existing.removeEventListener("load", renderWidget);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [siteKey, onToken, onExpire]);

  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}

export function isTurnstileEnabled() {
  return Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
}
