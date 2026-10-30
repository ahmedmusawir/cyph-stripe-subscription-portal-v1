import { expect, test, type Page } from "@playwright/test";
import { demoState, trackHosts } from "./helpers";

// ANONYMOUS browser journeys (RULINGS R-009). No credentials are used here.
const PUBLIC_KEY = "cyph-portal-demo:v1:public";

async function fillOwner(page: Page) {
  await page.getByLabel("First name").fill("Jordan");
  await page.getByLabel("Last name").fill("Ellis");
  await page.getByLabel("Work email").fill("jordan@demo-pharmacy.example");
  await page.getByLabel("Mobile phone").fill("(555) 010-0144");
  await page.getByRole("checkbox", { name: /I confirm that I am the pharmacy owner/ }).check(); // R-011
}

async function fillPharmacy(page: Page, n: number, other?: { name: string; email: string }) {
  await page.getByLabel("Pharmacy name").fill(`Example Test Pharmacy ${n}`);
  await page.getByLabel("Street address").fill(`${n} Test Street`);
  await page.getByLabel("City").fill("Springfield");
  await page.getByLabel("State").selectOption("Alabama");
  await page.getByLabel("ZIP").fill("00000");
  await page.getByLabel("NCPDP number").fill(`000001${n}`);
  await page.getByLabel("NPI").fill(`000000001${n}`);
  await page.getByLabel("Store phone").fill("(555) 010-0199");
  await page.getByLabel("Pharmacy software").selectOption("Liberty");
  if (other) {
    await page.getByLabel("Someone else").check();
    await page.getByLabel("Admin's full name").fill(other.name);
    await page.getByLabel("Admin's email").fill(other.email);
  }
}

async function registerTo(page: Page, stores: number, nominate = false) {
  await page.goto("/demo/register/plan");
  for (let i = 1; i < stores; i++) await page.getByRole("button", { name: "More pharmacies" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/demo\/register\/owner/);
  await fillOwner(page);
  await page.getByRole("button", { name: "Continue" }).click();
  for (let n = 1; n <= stores; n++) {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(stores === 1 ? "Your pharmacy" : `Pharmacy ${n} of ${stores}`);
    await fillPharmacy(page, n, nominate && n === stores ? { name: "Sam Ortiz", email: "sam@demo-pharmacy.example" } : undefined);
    await page.getByRole("button", { name: n === stores ? "Continue to review" : `Continue to pharmacy ${n + 1} of ${stores}` }).click();
  }
  await expect(page).toHaveURL(/\/demo\/register\/review/);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
});

test("/ opens the public plan screen with a sign-in path to the real /login", async ({ page, request }) => {
  const res = await request.get("/", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toMatch(/\/demo\/register\/plan$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/demo\/register\/plan$/);
  await expect(page.getByRole("heading", { name: "Choose your plan" })).toBeVisible();
  await expect(page.getByText("Already subscribed?").first()).toBeVisible();
  await page.getByTestId("public-sign-in").click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("anonymous 1-store registration end to end, never asked to log in, no external hosts", async ({ page }) => {
  const hosts = trackHosts(page);
  await registerTo(page, 1);
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await expect(page.getByTestId("recurring")).toHaveText("$99.00");

  // Consent missing → summary takes focus, both boxes invalid.
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("consent-error")).toBeFocused();
  await expect(page.locator("#c1")).toHaveAttribute("aria-invalid", "true");

  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page).toHaveURL(/\/demo\/stripe$/);
  await expect(page.getByTestId("checkout-preview")).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId("stripe-due")).toContainText("$99.00");
  await expect(page.locator('[data-testid="checkout-preview"] input')).toHaveCount(0); // no card fields

  await page.getByTestId("outcome-paid").click();
  await expect(page).toHaveURL(/\/demo\/activation$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Payment confirmed. Setting up your pharmacies…");
  await page.getByTestId("activation-refresh").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're in. Check your email.");

  await page.getByRole("link", { name: "Preview the access email" }).click();
  await expect(page.getByTestId("email-owner")).toContainText("Welcome, Jordan.");
  await expect(page.getByTestId("email-to")).toHaveText("j•••@demo-pharmacy.example");
  await page.getByRole("link", { name: "Set up my account" }).click();
  await expect(page.getByTestId("link-valid")).toBeVisible();
  await page.getByRole("button", { name: "Continue to account setup" }).click();
  await expect(page.getByTestId("downstream-setup")).toContainText("does not create an account, grant a role or sign you in");

  // Mock payment never signs anyone in: account management is still gated.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect([...hosts].filter((h) => h !== new URL(test.info().project.use.baseURL!).host)).toEqual([]);
});

test("3 stores: $197.00, DEMO10 changes due-now only, nominated admin carries through", async ({ page }) => {
  await registerTo(page, 3, true);
  await expect(page.getByTestId("review-pharmacy")).toHaveCount(3);
  await expect(page.getByTestId("due-today")).toHaveText("$197.00");
  await page.getByLabel(/Discount or APA member code/).fill("demo10");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByTestId("due-today")).toHaveText("$187.00");
  await expect(page.getByTestId("recurring")).toHaveText("$197.00");
  await expect(page.getByText("Demo code; this doesn't establish APA membership.")).toBeVisible();
  await expect(page.getByText("Sam Ortiz")).toBeVisible();

  // Reload keeps the draft (same tab).
  await page.reload();
  await expect(page.getByTestId("review-pharmacy")).toHaveCount(3);
  const saved = (await demoState(page, PUBLIC_KEY)) as { state: { s: { draft: { pharmacies: { ncpdp: string }[] } } } };
  expect(saved.state.s.draft.pharmacies.map((p) => p.ncpdp)).toEqual(["0000011", "0000012", "0000013"]);
  expect(JSON.stringify(saved)).not.toMatch(/password|token|access_token/i);
});

test("count reduction asks before discarding entered pharmacies", async ({ page }) => {
  await registerTo(page, 2);
  await page.goto("/demo/register/plan");
  await page.getByRole("button", { name: "Fewer pharmacies" }).click();
  await expect(page.getByTestId("reduce-confirm")).toContainText("Remove Example Test Pharmacy 2 from this signup?");
  await page.getByRole("button", { name: "Keep 2 pharmacies" }).click();
  await expect(page.locator("#stores")).toHaveText("2");
  await page.getByRole("button", { name: "Fewer pharmacies" }).click();
  await page.getByRole("button", { name: "Remove and continue with 1" }).click();
  await expect(page.locator("#stores")).toHaveText("1");
  await expect(page.getByTestId("estimate-total")).toContainText("$99.00");
});

test("validation keeps input, focuses the summary, flags duplicates without naming the owner", async ({ page }) => {
  await page.goto("/demo/register/owner");
  // Deep link without a draft is fine for owner; submit empty.
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("error-summary")).toBeFocused();
  await expect(page.getByLabel("Work email")).toHaveAttribute("aria-invalid", "true");
  await fillOwner(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillPharmacy(page, 1);
  await page.getByLabel("NCPDP number").fill("00099");
  await page.getByRole("button", { name: "Continue to review" }).click();
  await expect(page.getByTestId("error-summary")).toContainText("NCPDP number");
  await expect(page.getByLabel("NCPDP number")).toHaveValue("00099");
  await page.getByLabel("NCPDP number").fill("0000099");
  await page.getByRole("button", { name: "Continue to review" }).click();
  await expect(page.getByTestId("duplicate-alert")).toContainText("already uses NCPDP 0000099");
  await expect(page.getByTestId("duplicate-alert")).not.toContainText("@");
  await expect(page.getByLabel("Pharmacy name")).toHaveValue("Example Test Pharmacy 1");
});

test("abandoned checkout resumes with values; unknown payment pauses payment", async ({ page }) => {
  await registerTo(page, 1);
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await page.getByTestId("outcome-closed").click();
  await expect(page.getByTestId("incomplete-abandoned")).toContainText("Nothing has been charged");
  await page.getByTestId("incomplete-continue").click();
  await expect(page).toHaveURL(/\/demo\/register\/review/);
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await expect(page.locator("#c1")).not.toBeChecked(); // fresh quote needs fresh consent

  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await page.getByTestId("outcome-unknown").click();
  await expect(page.getByTestId("incomplete-unknown")).toContainText("Please don't pay again");
  await expect(page.getByTestId("incomplete-continue")).toBeDisabled();
  await page.getByTestId("unknown-paid").click();
  await expect(page).toHaveURL(/\/demo\/activation$/);
});

test("forged success URL or direct visits change nothing", async ({ page }) => {
  await page.goto("/demo/activation?success=true");
  await expect(page.getByText("There's no payment to track yet")).toBeVisible();
  await page.goto("/demo/stripe?success=true&mode=checkout");
  await expect(page.getByText("There's no checkout open")).toBeVisible();
  const s = (await demoState(page, PUBLIC_KEY)) as { state: { s: { checkout: unknown; activation: unknown } } } | null;
  expect(s?.state.s.checkout ?? null).toBeNull();
  expect(s?.state.s.activation ?? null).toBeNull();
});

test("hostile text renders as text", async ({ page }) => {
  await page.goto("/demo/register/owner");
  await fillOwner(page);
  await page.getByLabel("First name").fill('<img src=x onerror="window.__xss=1">');
  await page.getByRole("button", { name: "Continue" }).click();
  await fillPharmacy(page, 1);
  await page.getByLabel("Pharmacy name").fill("<script>window.__xss=2</script>");
  await page.getByRole("button", { name: "Continue to review" }).click();
  await expect(page.getByText("<script>window.__xss=2</script>", { exact: false }).first()).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
});
