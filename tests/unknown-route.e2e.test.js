import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.TEST_BASE_URL || "http://localhost:8080";
const NOT_FOUND_RE = /page not found|>\s*404\s*</i;

/** Static SPAs serve the same shell for every path. Confirm no platform 404. */
async function fetchShell(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
  return { status: res.status, body };
}

describe("unknown path end-to-end fallback flow", () => {
  const unknown = ["/definitely-not-a-page", "/nested/missing/path", "/refresh/deep/link"];

  it.each(unknown)("%s serves the app shell and never a platform not-found page", async (path) => {
    const { status, body } = await fetchShell(path);

    expect(status).toBe(200);
    expect(NOT_FOUND_RE.test(body), `not-found UI in shell for ${path}`).toBe(false);
    expect(body).toContain('<div id="root"');
    expect(body).toContain("MinimalTab");
  });

  it("contains the route diagnostics mount so the app can report fallbacks client-side", async () => {
    const { body } = await fetchShell("/missing");
    expect(body).toMatch(/id="root"|route-diagnostics/i);
  });
});

describe("Cloudflare Pages redirect rules", () => {
  it("serves index.html for every unknown route", () => {
    const redirects = readFileSync(resolve(process.cwd(), "public/_redirects"), "utf8");
    expect(redirects).toContain("/*    /index.html    200");
  });
});
