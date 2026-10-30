import { expect, test, type Page } from "@playwright/test";
import { recordContrast, textContrast, textFailures } from "./contrast";
import { assertGate, measure, record, setTheme, THEMES } from "./gate-m";

// REPAIR_005 anonymous regressions. No credentials are used here.
// R4-F01: a nothing-charged legacy record can't become paid through a stale Refresh.
// R4-F02: an unknown legacy record with a stale failed flag can't be discarded by "Try payment again".
const KEY = "cyph-portal-demo:v1:public";
type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const snap = (page: Page) =>
  page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!).state.s;
    return {
      checkout: (s.checkout?.status ?? null) as string | null,
      key: (s.checkout?.operationKey ?? null) as string | null,
      payment: (s.activation?.paymentState ?? null) as string | null,
    };
  }, KEY);

async function settle(page: Page, url: string) {
  await page.goto(url);
  await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
}

async function processing(page: Page) {
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
  await page.getByRole("button", { name: "Payment processing → activation (waiting)", exact: true }).click();
  await page.waitForURL("**/demo/activation");
  return (await snap(page)).key!;
}

/** Store the state as the d6fe678 engine left it, then open `url`. */
async function asLegacy(page: Page, url: string, edit: (s: Json) => Json) {
  const raw = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), KEY);
  raw.state.s = edit(raw.state.s);
  await page.evaluate(({ k, v }) => sessionStorage.setItem(k, JSON.stringify(v)), { k: KEY, v: raw });
  await settle(page, url);
}
// d6fe678 accepted "unknown" on a processing checkout and kept the pending activation; then the current
// nothing-charged resolution closed the checkout but (before REPAIR_005) kept that activation.
const notChargedStale = (s: Json) => ({ ...s, checkout: { ...s.checkout, status: "abandoned" }, draft: { ...s.draft, state: "abandoned" } });
// d6fe678 accepted "unknown" after a payment failure and kept the failed activation.
const unknownWithFailed = (s: Json) => ({ ...s, checkout: { ...s.checkout, status: "unknown" }, activation: { ...s.activation, paymentState: "failed", retryAvailable: true } });

test("R4-F01: nothing-charged legacy record: no Refresh on activation, reload-stable, then valid recovery with a new key", async ({ page }) => {
  const key = await processing(page);
  await asLegacy(page, "/demo/activation", notChargedStale);
  for (let i = 0; i < 2; i++) {
    await expect(page.getByTestId("activation-not-charged")).toContainText("Nothing was charged");
    await expect(page.getByTestId("activation-refresh")).toHaveCount(0);
    expect(await snap(page)).toEqual({ checkout: "abandoned", key, payment: "pending" });
    await page.reload();
  }
  await page.getByRole("link", { name: "Continue my signup" }).click();
  await page.waitForURL("**/demo/checkout-incomplete");
  await expect(page.getByTestId("incomplete-abandoned")).toBeVisible();
  await page.getByTestId("incomplete-continue").click();
  await page.waitForURL("**/demo/register/review");
  expect(await snap(page)).toEqual({ checkout: null, key: null, payment: null });
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const fresh = await snap(page);
  expect(fresh.checkout).toBe("pending");
  expect(fresh.key).not.toBe(key);
});

test("R4-F02: unknown legacy record with a failed flag: no retry, no resume, reload-stable; C14 resolves it first, then recovery", async ({ page }) => {
  const key = await processing(page);
  await asLegacy(page, "/demo/activation", unknownWithFailed);
  for (let i = 0; i < 2; i++) {
    await expect(page.getByTestId("activation-unknown")).toContainText("still checking whether a payment went through");
    await expect(page.getByRole("button", { name: "Try payment again" })).toHaveCount(0);
    await expect(page.getByTestId("activation-refresh")).toHaveCount(0);
    expect(await snap(page)).toEqual({ checkout: "unknown", key, payment: "failed" });
    await page.reload();
  }
  // Review and the stand-in treat it as submitted.
  await settle(page, "/demo/register/review");
  await page.waitForURL("**/demo/checkout-incomplete");
  await settle(page, "/demo/stripe");
  await page.waitForTimeout(1200);
  await expect(page.getByTestId("outcome-paid")).toHaveCount(0);
  // Authoritative resolution first.
  await settle(page, "/demo/checkout-incomplete");
  await expect(page.getByTestId("incomplete-continue")).toBeDisabled();
  await page.getByTestId("unknown-not-charged").click();
  await expect(page.getByTestId("incomplete-abandoned")).toBeVisible();
  expect(await snap(page)).toEqual({ checkout: "abandoned", key, payment: null });
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

test("R4-F02 paid branch: the same record can still be confirmed by Stripe", async ({ page }) => {
  await processing(page);
  await asLegacy(page, "/demo/checkout-incomplete", unknownWithFailed);
  await page.getByTestId("unknown-paid").click();
  await page.waitForURL("**/demo/activation");
  await expect(page.getByTestId("activation-tracks")).toContainText("Confirmed by Stripe · $99.00");
  expect(await snap(page)).toMatchObject({ checkout: "paid", payment: "confirmed" });
});

test("REPAIR_005 screens at 375 and 1440, light and dark: Gate M, contrast, screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  const screens: { name: string; ready: string; edit: (s: Json) => Json }[] = [
    { name: "activation-not-charged", ready: "activation-not-charged", edit: notChargedStale },
    { name: "activation-unknown", ready: "activation-unknown", edit: unknownWithFailed },
  ];
  for (const sc of screens) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await processing(page);
    await asLegacy(page, "/demo/activation", sc.edit);
    for (const theme of THEMES)
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await settle(page, "/demo/activation");
        await setTheme(page, theme);
        await page.reload();
        await expect(page.getByTestId(sc.ready)).toBeVisible({ timeout: 5000 });
        const g = await measure(page, `/demo/activation [REPAIR_005 ${sc.name}]`, width, theme);
        record("gate-m-repair005.jsonl", g);
        assertGate(g);
        const fails = textFailures(await textContrast(page));
        recordContrast("contrast-repair005.jsonl", { screen: `/demo/activation [REPAIR_005 ${sc.name}]`, width, theme, fails });
        expect.soft(fails, `${sc.name} ${theme} ${width}`).toEqual([]);
        await page.screenshot({ path: `test-results/repair005-${sc.name}_${theme}_${width}.png`, fullPage: true });
      }
  }
});
