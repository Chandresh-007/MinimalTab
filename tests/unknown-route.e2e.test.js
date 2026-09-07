import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium } from "playwright";

const BASE = process.env.TEST_BASE_URL || "http://localhost:8080";
const NOT_FOUND_RE = /page not found|404/i;

let browser;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

describe("unknown path end-to-end", () => {
  it("never shows not-found UI and lands on the dashboard", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    const seenNotFound = [];
    const logs = [];
    page.on("console", (msg) => logs.push(msg.text()));

    // Sample the DOM throughout the redirect flow.
    const sampler = setInterval(async () => {
      try {
        const text = await page.evaluate(() => document.body?.innerText ?? "");
        if (NOT_FOUND_RE.test(text)) seenNotFound.push(text.slice(0, 120));
      } catch {
        /* navigation in flight */
      }
    }, 50);

    await page.goto(`${BASE}/definitely-not-a-page`, { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/(\?.*)?$/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    clearInterval(sampler);

    const body = await page.evaluate(() => document.body.innerText);
    expect(seenNotFound).toEqual([]);
    expect(body).toMatch(/Quick access/i);
    expect(new URL(page.url()).pathname).toBe("/");

    // The fallback reason is logged client-side.
    expect(logs.some((l) => l.includes("[route-fallback]"))).toBe(true);

    await context.close();
  }, 60_000);
});
