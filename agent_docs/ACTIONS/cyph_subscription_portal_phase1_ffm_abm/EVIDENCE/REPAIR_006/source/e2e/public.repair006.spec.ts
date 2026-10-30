import { expect, test, type Page } from "@playwright/test";
import { recordContrast, textContrast, textFailures } from "./contrast";
import { assertGate, measure, record, setTheme, THEMES } from "./gate-m";

// REPAIR_006 anonymous regressions. No credentials are used here.
// R5-F01: Activation reads the payment phase first; paid never appears unpaid, failed or retryable.
// R5-F02: resend only for a paid checkout whose setup finished.
const KEY = "cyph-portal-demo:v1:public";
type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const snap = (page: Page) =>
  page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!).state.s;
    return { checkout: (s.checkout?.status ?? null) as string | null, key: (s.checkout?.operationKey ?? null) as string | null, payment: (s.activation?.paymentState ?? null) as string | null };
  }, KEY);

async function settle(page: Page, url: string) {
  await page.goto(url);
  await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
}

async function openCheckout(page: Page) {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption("prefilled_one_store");
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
}

async function completed(page: Page) {
  await openCheckout(page);
  await page.getByTestId("outcome-paid").click();
  await page.waitForURL("**/demo/activation");
  await page.getByTestId("activation-refresh").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're in. Check your email.");
}

async function storeActivation(page: Page, edit: (a: Json) => Json | null) {
  const raw = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), KEY);
  raw.state.s.activation = edit(raw.state.s.activation);
  await page.evaluate(({ k, v }) => sessionStorage.setItem(k, JSON.stringify(v)), { k: KEY, v: raw });
  await settle(page, "/demo/activation");
}

const FLAGS: Record<string, (a: Json) => Json | null> = {
  absent: () => null,
  pending: (a) => ({ ...a, paymentState: "pending", provisioningState: "not_started", emailState: "not_started" }),
  failed: (a) => ({ ...a, paymentState: "failed", provisioningState: "not_started", emailState: "not_started" }),
};

for (const [flag, edit] of Object.entries(FLAGS))
  test(`R5-F01 paid with ${flag} activation: shown paid, no setup/email claim, no retry/refresh/resend, reload-stable`, async ({ page }) => {
    await completed(page);
    const key = (await snap(page)).key;
    await storeActivation(page, edit);
    for (let i = 0; i < 2; i++) {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Payment confirmed");
      await expect(page.getByTestId("activation-paid-status-unavailable")).toContainText("Setup and access-email status aren't available");
      const text = await page.locator("main").innerText();
      for (const claim of ["Payment didn't go through", "Waiting for payment confirmation", "There's no payment to track yet", "set up in OwedBook", "Sent to "]) expect(text).not.toContain(claim);
      for (const name of ["Try payment again", "Refresh status", "Resend access email"]) await expect(page.getByRole("button", { name })).toHaveCount(0);
      expect(await snap(page)).toMatchObject({ checkout: "paid", key });
      await page.reload();
    }
    // Review and C14 also treat it as paid.
    await settle(page, "/demo/register/review");
    await page.waitForURL("**/demo/activation");
  });

test("R5-F01 actual unknown → nothing charged: terminal notice, then coherent recovery with a new key", async ({ page }) => {
  await openCheckout(page);
  const key = (await snap(page)).key;
  await page.getByTestId("outcome-unknown").click();
  await page.waitForURL("**/demo/checkout-incomplete");
  await page.getByTestId("unknown-not-charged").click();
  await expect(page.getByTestId("incomplete-abandoned")).toBeVisible();
  expect(await snap(page)).toEqual({ checkout: "abandoned", key, payment: null });
  for (let i = 0; i < 2; i++) {
    await settle(page, "/demo/activation");
    await expect(page.getByTestId("activation-not-charged")).toContainText("Nothing was charged for this payment");
    await expect(page.getByText("There's no payment to track yet")).toHaveCount(0);
    await expect(page.getByTestId("activation-refresh")).toHaveCount(0);
    await page.reload();
  }
  await page.getByRole("link", { name: "Continue my signup" }).click();
  await page.waitForURL("**/demo/checkout-incomplete");
  await page.getByTestId("incomplete-continue").click();
  await page.waitForURL("**/demo/register/review");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const fresh = await snap(page);
  expect(fresh.checkout).toBe("pending");
  expect(fresh.key).not.toBe(key);
});

test("R5-F02 preserved: valid paid resend, from the email-failed scenario and from a sent email", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption("activation_email_failed");
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await settle(page, "/demo/activation");
  await page.getByTestId("resend").click();
  await expect(page.getByRole("status").filter({ hasText: "Sent again at" })).toBeVisible();
  expect(await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!).state.s.activation.emailState, KEY)).toBe("sent");
  await completed(page);
  await page.getByTestId("resend").click();
  await expect(page.getByRole("status").filter({ hasText: "Sent again at" })).toBeVisible();
});

test("REPAIR_006 screen at 375 and 1440, light and dark: Gate M, contrast, screenshots", async ({ page }) => {
  await completed(page);
  await storeActivation(page, FLAGS.failed);
  for (const theme of THEMES)
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await settle(page, "/demo/activation");
      await setTheme(page, theme);
      await page.reload();
      await expect(page.getByTestId("activation-paid-status-unavailable")).toBeVisible();
      const g = await measure(page, "/demo/activation [REPAIR_006 paid-status-unavailable]", width, theme);
      record("gate-m-repair006.jsonl", g);
      assertGate(g);
      const fails = textFailures(await textContrast(page));
      recordContrast("contrast-repair006.jsonl", { screen: "/demo/activation [REPAIR_006 paid-status-unavailable]", width, theme, fails });
      expect.soft(fails, `${theme} ${width}`).toEqual([]);
      await page.screenshot({ path: `test-results/repair006-paid-status-unavailable_${theme}_${width}.png`, fullPage: true });
    }
});
