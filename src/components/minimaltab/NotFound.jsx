import { useEffect, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";

const REDIRECT_SECONDS = 5;

export function NotFound({ autoRedirect = true }) {
  const router = useRouter();
  const location = useRouterState({ select: (s) => s.location });
  const matches = useRouterState({ select: (s) => s.matches });
  const matchedRouteId = matches.length ? matches[matches.length - 1].routeId : "none";
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
  const [cancelled, setCancelled] = useState(!autoRedirect);

  useEffect(() => {
    if (cancelled) return;
    if (seconds <= 0) {
      router.navigate({ to: "/", replace: true });
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, cancelled, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md text-center">
        <h1 className="text-7xl font-bold tracking-tight">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to dashboard
          </Link>
          {!cancelled && (
            <button
              onClick={() => setCancelled(true)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Stay here ({seconds}s)
            </button>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-muted/40 p-3 text-left font-mono text-[11px] leading-relaxed text-muted-foreground">
          <div className="mb-1 font-sans text-[10px] uppercase tracking-widest">
            Route debug
          </div>
          <div className="truncate">url: {location.href}</div>
          <div className="truncate">pathname: {location.pathname}</div>
          <div className="truncate">matched: {matchedRouteId}</div>
        </div>
      </div>
    </div>
  );
}
