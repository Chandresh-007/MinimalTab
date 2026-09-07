import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AlertTriangle, X } from "lucide-react";
import {
  FALLBACK_REASON_LABELS,
  getLastRouteFallback,
  logRouteFallback,
  subscribeRouteFallback,
} from "@/lib/route-fallback";

const DISMISS_SECONDS = 8;

/**
 * Route diagnostics overlay: shows the unmatched path, the redirect target,
 * the reason the fallback happened, and a countdown until it hides itself.
 */
export function RouteDiagnostics() {
  const location = useRouterState({ select: (s) => s.location });
  const matches = useRouterState({ select: (s) => s.matches });
  const matchedRouteId = matches.length ? matches[matches.length - 1].routeId : "none";

  const [entry, setEntry] = useState(null);
  const [seconds, setSeconds] = useState(DISMISS_SECONDS);

  // Pick up fallbacks logged during this session (client-side navigation).
  useEffect(() => subscribeRouteFallback((e) => {
    setEntry(e);
    setSeconds(DISMISS_SECONDS);
  }), []);

  // Pick up fallbacks that happened on the server (full page load redirect).
  useEffect(() => {
    const existing = getLastRouteFallback();
    if (existing) {
      setEntry(existing);
      setSeconds(DISMISS_SECONDS);
      return;
    }
    const from = location.search?.fallback;
    if (typeof from === "string" && from) {
      setEntry(
        logRouteFallback({ reason: "unmatched-route", from, to: "/" }),
      );
      setSeconds(DISMISS_SECONDS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!entry) return;
    if (seconds <= 0) {
      setEntry(null);
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [entry, seconds]);

  if (!entry) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2">
      <div className="pointer-events-auto rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-foreground">
              Redirected to the dashboard
            </div>
            <div className="mt-1 space-y-0.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <div className="truncate">reason: {FALLBACK_REASON_LABELS[entry.reason] ?? entry.reason}</div>
              <div className="truncate">unmatched: {entry.from}</div>
              <div className="truncate">redirected to: {entry.to}</div>
              <div className="truncate">now matched: {matchedRouteId}</div>
              {entry.detail && <div className="truncate">detail: {entry.detail}</div>}
              <div>hiding in {seconds}s</div>
            </div>
          </div>
          <button
            onClick={() => setEntry(null)}
            aria-label="Dismiss route diagnostics"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
