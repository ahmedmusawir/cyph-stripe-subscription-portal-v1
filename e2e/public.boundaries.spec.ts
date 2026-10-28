import { expect, test } from "@playwright/test";

// Anonymous access boundaries (R-008/R-009). No credentials used.
const ACCOUNT_ROUTES = [
  "/dashboard",
  "/demo/stores/add",
  "/demo/stores/confirm",
  "/demo/stores/result",
  "/demo/references/owedbook",
  "/demo/stripe?mode=portal",
  "/demo/stripe?mode=portal&purpose=cancel",
  "/demo/stripe?mode=card",
];
// Text that only account screens render; must never appear in a signed-out body.
// (Static route <title> metadata such as "Confirm your new price — Pharmacy Books"
// is not account data; markers are body content and synthetic account values.)
const ACCOUNT_MARKERS = ["Your subscription", "Pharmacies on this plan", "Add a pharmacy to your account", "Price change", "Customer Portal", "Billing owner", "Jordan Ellis", "$148.00", "Demo controls"];

for (const route of ACCOUNT_ROUTES) {
  test(`anonymous ${route} → /login with no account payload (HTML and RSC)`, async ({ request }) => {
    // Document request: a real HTTP 307 to /login.
    const html = await request.get(route, { maxRedirects: 0 });
    expect(html.status()).toBe(307);
    expect(html.headers()["location"]).toMatch(/\/login$/);
    const htmlBody = await html.text();
    for (const marker of ACCOUNT_MARKERS) expect(htmlBody).not.toContain(marker);

    // Client-navigation (RSC) request: Next first adds its `_rsc` cache-buster,
    // then answers with a redirect instruction to /login and no page payload.
    const hop = await request.get(route, { maxRedirects: 0, headers: { RSC: "1" } });
    const rscUrl = hop.status() === 307 ? hop.headers()["location"] : route;
    const rsc = await request.get(rscUrl, { maxRedirects: 0, headers: { RSC: "1" } });
    const rscBody = await rsc.text();
    expect(rscBody).toContain("NEXT_REDIRECT;replace;/login;307");
    for (const marker of ACCOUNT_MARKERS) expect(rscBody).not.toContain(marker);
  });
}

const PUBLIC_ROUTES = [
  "/demo/register/plan",
  "/demo/register/owner",
  "/demo/register/pharmacies",
  "/demo/register/review",
  "/demo/stripe",
  "/demo/activation",
  "/demo/checkout-incomplete",
  "/demo/access-link",
  "/demo/references/email",
  "/login",
];
for (const route of PUBLIC_ROUTES) {
  test(`public ${route} → 200 without login`, async ({ request }) => {
    const res = await request.get(route, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
}

test("forged role values in query, cookies and storage grant nothing", async ({ page, context, baseURL }) => {
  await context.addCookies([
    { name: "role", value: "superadmin", url: baseURL! },
    { name: "sb-access-token", value: "forged", url: baseURL! },
    { name: "user_roles", value: "admin", url: baseURL! },
  ]);
  await page.goto("/demo/register/plan");
  await page.evaluate(() => {
    sessionStorage.setItem("cyph-portal-demo:v1:account:0123456789abcdef", JSON.stringify({ state: { s: { persona: "billing_owner" } }, version: 1 }));
    localStorage.setItem("role", "superadmin");
  });
  for (const url of ["/dashboard?role=admin", "/dashboard?persona=billing_owner&staff=1", "/demo/stores/add?role=superadmin", "/demo/stripe?mode=portal&role=admin"]) {
    await page.goto(url);
    await expect(page).toHaveURL(/\/login$/);
  }
  // /login clears any account demo namespace on mount.
  const leftover = await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.includes(":account:")));
  expect(leftover).toEqual([]);
});

test("foundation regressions: GET login 405, removed routes 404, /demo/sign-in → /login", async ({ request }) => {
  expect((await request.get("/api/auth/login")).status()).toBe(405);
  for (const r of ["/onboarding", "/owners", "/stores", "/audit-log"]) expect((await request.get(r)).status()).toBe(404);
  const s = await request.get("/demo/sign-in", { maxRedirects: 0 });
  expect(s.status()).toBe(307);
  expect(s.headers()["location"]).toMatch(/\/login$/);
});

test("session expired banner via enum only", async ({ page }) => {
  await page.goto("/login?reason=session_expired");
  await expect(page.getByText("Your session expired")).toBeVisible();
  await page.goto("/login?reason=<b>x</b>");
  await expect(page.getByText("Your session expired")).toHaveCount(0);
});
