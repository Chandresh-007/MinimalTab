import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";
const ROUTES_DIR = join(process.cwd(), "src", "routes");

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

  it.each(routes)("%s resolves without a 404", async (path) => {
    const res = await fetch(`${BASE}${path}`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).not.toMatch(/Page not found/i);
  });
});

describe("unknown routes", () => {
  const unknown = ["/definitely-not-a-page", "/nested/missing/path"];

  it.each(unknown)("%s renders the custom not-found screen", async (path) => {
    const res = await fetch(`${BASE}${path}`);
    const body = await res.text();
    expect(body).toMatch(/Page not found/i);
    expect(body).toMatch(/Back to dashboard/i);
  });
});
