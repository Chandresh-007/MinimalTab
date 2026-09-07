import { describe, it, expect } from "vitest";

const BASE = process.env.TEST_BASE_URL || "http://localhost:8080";
const NOT_FOUND_RE = /page not found|>\s*404\s*</i;

/** Walk the whole redirect chain, inspecting every hop's body. */
async function walk(path, maxHops = 5) {
  const hops = [];
  let url = `${BASE}${path}`;
  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(url, { redirect: "manual" });
    const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
    hops.push({ url, status: res.status, body });
    const loc = res.headers.get("location");
    if (!loc) break;
    url = new URL(loc, BASE).toString();
  }
  return hops;
}

describe("unknown path end-to-end redirect flow", () => {
  const unknown = ["/definitely-not-a-page", "/nested/missing/path", "/refresh/deep/link"];

  it.each(unknown)("%s renders the dashboard, never a not-found screen", async (path) => {
    const hops = await walk(path);

    // No hop in the flow may render not-found UI.
    for (const hop of hops) {
      expect(NOT_FOUND_RE.test(hop.body), `not-found UI at ${hop.url}`).toBe(false);
    }

    const last = hops[hops.length - 1];
    expect(last.status).toBe(200);
    expect(new URL(last.url).pathname).toBe("/");
    expect(last.body).toMatch(/Quick access/i);
  });

  it("passes the unmatched path along so the diagnostics overlay can report it", async () => {
    const hops = await walk("/definitely-not-a-page");
    const target = hops[hops.length - 1].url;
    expect(target).toContain("fallback=");
  });
});
