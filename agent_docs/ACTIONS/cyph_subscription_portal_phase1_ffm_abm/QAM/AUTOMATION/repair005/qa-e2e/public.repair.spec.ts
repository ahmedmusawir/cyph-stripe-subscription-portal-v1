import { expect, test, type Page } from "@playwright/test";
import { focusRings, inputBoundaries, recordContrast, textContrast, textFailures } from "./contrast";
import { setTheme, THEMES } from "./gate-m";

// REPAIR_001 anonymous regressions. No credentials are used here.

// ── Q2-F03: repeated / re-ordered / mixed-case account modes never downgrade ──
const ACCOUNT_MARKERS = ["Your subscription", "Pharmacies on this plan", "Customer Portal", "Billing owner", "Jordan Ellis", "$148.00", "Demo controls"];
const ACCOUNT_QUERIES = [
  "mode=checkout&mode=portal",
  "mode=portal&mode=checkout",
  "mode=card&mode=card",
  "mode=checkout&mode=card",
  "mode=card&mode=portal",
  "mode=portal",
  "mode=card",
  "mode=Portal",
  "mode=%20portal%20",
  "mode=CARD&purpose=change_card",
  "mode=portal&purpose=cancel&purpose=manage",
  "mode=unknown",
  "mode=",
];
for (const q of ACCOUNT_QUERIES) {
  test(`F03 anonymous /demo/stripe?${q} → /login, no account payload (HTML and RSC)`, async ({ request }) => {
    const route = `/demo/stripe?${q}`;
    const html = await request.get(route, { maxRedirects: 0 });
    expect(html.status()).toBe(307);
    expect(html.headers()["location"]).toMatch(/\/login$/);
    const htmlBody = await html.text();
    for (const m of ACCOUNT_MARKERS) expect(htmlBody).not.toContain(m);

    const hop = await request.get(route, { maxRedirects: 0, headers: { RSC: "1" } });
    const rscUrl = hop.status() === 307 ? hop.headers()["location"] : route;
    const rsc = await request.get(rscUrl, { maxRedirects: 0, headers: { RSC: "1" } });
    const rscBody = await rsc.text();
    expect(rscBody).toContain("NEXT_REDIRECT;replace;/login;307");
    for (const m of ACCOUNT_MARKERS) expect(rscBody).not.toContain(m);
  });
}

for (const q of ["", "mode=checkout", "mode=checkout&mode=checkout", "mode=CHECKOUT"]) {
  test(`F03 public initial checkout stays public: /demo/stripe${q ? "?" + q : ""}`, async ({ request }) => {
    const res = await request.get(`/demo/stripe${q ? "?" + q : ""}`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const body = await res.text();
    for (const m of ACCOUNT_MARKERS) expect(body).not.toContain(m);
  });
}

// ── AC-26 evidence gap: malformed auth-confirm links fail safe ──────────────
// Cases without token_hash never reach the auth provider; the two with a
// syntactically fake hash make one rejected verification call each.
for (const q of [
  "",
  "type=email",
  "token_hash=",
  "token_hash=not-a-real-hash&type=bogus",
  "token_hash=not-a-real-hash&type=email",
  "token_hash=not-a-real-hash&type=email&next=https://evil.example/",
  "type=recovery&next=//evil.example",
]) {
  test(`AC-26 /api/auth/confirm?${q} → same-origin /login, no session`, async ({ request, baseURL }) => {
    const res = await request.get(`/api/auth/confirm?${q}`, { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    const loc = new URL(res.headers()["location"], baseURL);
    expect(loc.origin).toBe(new URL(baseURL!).origin);
    expect(loc.pathname).toBe("/login");
    expect(res.headers()["set-cookie"] ?? "").not.toMatch(/sb-[^=]*-auth-token=[^;]+/);
    // Following it lands on the sign-in form, never on account management.
    const followed = await request.get(loc.pathname + loc.search);
    expect(followed.status()).toBe(200);
    expect(await followed.text()).not.toContain("Your subscription");
  });
}

// ── Q2-G06: no 20-store cap ─────────────────────────────────────────────────
test("G06: plan counter passes 20; 21 stores price by repeat-N", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/demo/register/plan");
  const more = page.getByRole("button", { name: "More pharmacies" });
  for (let i = 1; i < 21; i++) await more.click();
  await expect(page.locator("output#stores")).toHaveText("21");
  await expect(more).toBeEnabled();
  await expect(page.locator("main")).toContainText("$1,079.00");
  await more.click();
  await expect(page.locator("output#stores")).toHaveText("22");
  await expect(page.locator("main")).toContainText("$1,128.00");
});

// ── Q2-F01: rendered contrast on public surfaces, both themes ───────────────
async function seed(page: Page, scenario: string) {
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption(scenario);
  await page.getByRole("button", { name: "Load" }).click();
  await page.waitForLoadState("networkidle");
}
const SCREENS: { scenario: string; route: string; act?: (p: Page) => Promise<void> }[] = [
  { scenario: "fresh", route: "/demo/register/plan" },
  { scenario: "quote_unavailable", route: "/demo/register/plan" },
  { scenario: "prefilled_two_store", route: "/demo/register/owner" },
  {
    scenario: "fresh",
    route: "/demo/register/owner",
    act: async (p) => {
      await p.getByRole("button", { name: "Continue" }).click();
      await expect(p.getByRole("alert").first()).toBeVisible();
    },
  },
  { scenario: "prefilled_two_store", route: "/demo/register/pharmacies?store=2" },
  { scenario: "prefilled_three_store", route: "/demo/register/review" },
  { scenario: "prefilled_one_store", route: "/demo/stripe" },
  { scenario: "checkout_abandoned", route: "/demo/checkout-incomplete" },
  { scenario: "checkout_declined", route: "/demo/checkout-incomplete" },
  { scenario: "checkout_unknown", route: "/demo/checkout-incomplete" },
  { scenario: "checkout_expired", route: "/demo/checkout-incomplete" },
  { scenario: "activation_waiting", route: "/demo/activation" },
  { scenario: "activation_delayed", route: "/demo/activation" },
  { scenario: "activation_email_failed", route: "/demo/activation" },
  { scenario: "activation_payment_failed", route: "/demo/activation" },
  { scenario: "activation_ready", route: "/demo/activation" },
  { scenario: "link_expired", route: "/demo/access-link" },
  { scenario: "link_used", route: "/demo/access-link" },
  { scenario: "link_request_error", route: "/demo/access-link" },
  { scenario: "prefilled_two_store", route: "/demo/references/email?variant=owner" },
  { scenario: "fresh", route: "/login" },
  { scenario: "fresh", route: "/login?reason=session_expired" },
];

for (const s of SCREENS) {
  test(`F01 contrast: ${s.route} [${s.scenario}]`, async ({ page }) => {
    test.setTimeout(90_000);
    for (const theme of THEMES) {
      await seed(page, s.scenario);
      await page.setViewportSize({ width: 1024, height: 900 });
      await page.goto(s.route);
      await setTheme(page, theme);
      await page.reload(); // theme applied at load: no colour transition in flight
      await page.waitForLoadState("networkidle");
      await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
      if (s.act) await s.act(page);
      const summary = page.locator("summary", { hasText: "Demo controls" });
      if ((await summary.count()) && !(await page.locator("details[open]").count())) await summary.click();
      const rows = await textContrast(page);
      const fails = textFailures(rows);
      const boundaries = await inputBoundaries(page);
      const rings = await focusRings(page, 30);
      recordContrast("repair-contrast-public.jsonl", { screen: `${s.route} [${s.scenario}]`, theme, rows: rows.length, fails, faded: rows.filter((r) => r.faded && !r.disabled), boundaries, rings });
      expect.soft(fails, `${s.route} ${theme}: text below threshold`).toEqual([]);
      expect.soft(boundaries.filter((b) => b.ratio < b.required), `${s.route} ${theme}: input boundary`).toEqual([]);
      expect.soft(rings.filter((r) => r.ratio < r.required), `${s.route} ${theme}: focus ring`).toEqual([]);
    }
  });
}
