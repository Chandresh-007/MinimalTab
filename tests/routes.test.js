import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.TEST_BASE_URL || "http://localhost:8080";
const ROUTES_DIR = join(process.cwd(), "src", "routes");
const NOT_FOUND_RE = /page not found|>\s*404\s*</i;

/** Collect the URL path of every declared file route. */
function declaredRoutes() {
  return readdirSync(ROUTES_DIR)
    .filter((f) => /\.(jsx?|tsx?)$/.test(f) && !f.startsWith("__"))
    .map((f) => join(ROUTES_DIR, f))
    .map((p) => readFileSync(p, "utf8"))
    .map((src) => src.match(/createFileRoute\(\s*["'`]([^"'`]+)["'`]\s*\)/)?.[1])
    .filter(Boolean)
    .filter((path) => !path.includes("$")) // splat/dynamic handled separately
    .map((path) => path.replace(/\[\.\]/g, "."));
}

const routes = declaredRoutes();

describe("declared TanStack routes", () => {
  it("finds at least the index route", () => {
    expect(routes).toContain("/");
  });

  it.each(routes)("%s resolves without a platform 404", async (path) => {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
    expect(res.status).toBe(200);
    expect(NOT_FOUND_RE.test(body), `not-found UI for ${path}`).toBe(false);
    expect(body).toContain('<div id="root"');
  });
});

describe("unknown routes", () => {
  const unknown = ["/definitely-not-a-page", "/nested/missing/path"];

  it.each(unknown)("%s serves the app shell so the client can redirect", async (path) => {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
    expect(res.status).toBe(200);
    expect(NOT_FOUND_RE.test(body), `not-found UI for ${path}`).toBe(false);
    expect(body).toContain('<div id="root"');
  });
});
