/**
 * Client-side log of why a navigation fell back to the dashboard.
 * Reasons: "unmatched-route" | "root-not-found" | "init-error"
 */

const MAX_ENTRIES = 20;
const listeners = new Set();
const entries = [];

export function logRouteFallback({ reason, from, to = "/", detail }) {
  const entry = {
    reason,
    from,
    to,
    detail: detail ? String(detail) : undefined,
    at: new Date().toISOString(),
  };
  entries.unshift(entry);
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  if (typeof console !== "undefined") {
    console.warn(
      `[route-fallback] ${reason}: "${from}" -> "${entry.to}"`,
      entry.detail ?? "",
    );
  }
  listeners.forEach((fn) => fn(entry));
  return entry;
}

export function getLastRouteFallback() {
  return entries[0];
}

export function getRouteFallbacks() {
  return [...entries];
}

export function subscribeRouteFallback(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const FALLBACK_REASON_LABELS = {
  "unmatched-route": "Unmatched route (no page declared for this URL)",
  "root-not-found": "Router not-found boundary",
  "init-error": "Route initialization error",
};
