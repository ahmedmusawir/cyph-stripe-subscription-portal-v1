import { expect, test, type Page } from "@playwright/test";
import { recordContrast, textContrast, textFailures } from "./contrast";
import { assertGate, measure, record, setTheme, THEMES } from "./gate-m";

// REPAIR_004 addendum 1 anonymous regressions. No credentials are used here.
// R4-N01: a submitted (processing/unknown) payment can't be discarded or made
//         retryable from Review, back navigation, reload or the stand-in.
// Completed legacy record with no provable scope: honest unavailable history.
const KEY = "cyph-portal-demo:v1:public";
type Mode = "processing" | "unknown";

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

async function load(page: Page, scenario: string) {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption(scenario);
  await page.getByRole("button", { name: "Load", exact: true }).click();
}

async function openCheckout(page: Page) {
  await load(page, "prefilled_one_store");
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
}

async function submit(page: Page, mode: Mode) {
  await openCheckout(page);
  if (mode === "processing") await page.getByRole("button", { name: "Payment processing → activation (waiting)", exact: true }).click();
  else await page.getByTestId("outcome-unknown").click();
  await page.waitForURL(mode === "processing" ? "**/demo/activation" : "**/demo/checkout-incomplete");
  return snap(page);
}

for (const mode of ["processing", "unknown"] as const)
  test(`R4-N01 ${mode}: Review, reload, direct navigation and Back never close the submitted payment or open another`, async ({ page }) => {
    const before = await submit(page, mode);
    expect(before.checkout).toBe(mode === "processing" ? "pending" : "unknown");
    for (let i = 0; i < 2; i++) {
      await settle(page, "/demo/register/review");
      if (mode === "unknown") {
        // Review sends an unknown payment straight to C14 (existing), where payment stays locked.
        await page.waitForURL("**/demo/checkout-incomplete");
        await expect(page.getByTestId("incomplete-continue")).toBeDisabled();
      } else {
        await expect(page.getByTestId("review-submitted")).toContainText("already submitted a payment");
        await expect(page.getByTestId("continue-payment")).toBeDisabled();
      }
      await expect(page.getByRole("button", { name: "Edit my details instead" })).toHaveCount(0);
      await expect(page.getByText("Your checkout on Stripe is still open")).toHaveCount(0);
      await page.reload();
    }
    await settle(page, "/demo/stripe");
    await page.waitForTimeout(1200);
    for (const id of ["outcome-paid", "outcome-back", "outcome-closed", "outcome-unknown", "outcome-declined"]) await expect(page.getByTestId(id)).toHaveCount(0);
    if (mode === "processing") await expect(page.getByTestId("checkout-submitted")).toContainText("already submitted");
    // Browser Back to the stand-in page that once showed the outcome buttons.
    await settle(page, "/demo/register/review");
    await page.goBack();
    await page.waitForTimeout(1200);
    await expect(page.getByTestId("outcome-back")).toHaveCount(0);
    await settle(page, mode === "processing" ? "/demo/activation" : "/demo/checkout-incomplete");
    if (mode === "processing") await expect(page.getByRole("link", { name: "resume checkout" })).toHaveCount(0);
    expect(await snap(page)).toEqual(before);
  });

test("R4-N01 preserved: an unsubmitted open checkout can still be closed from Review and paid with a new key", async ({ page }) => {
  await openCheckout(page);
  const old = (await snap(page)).key;
  await settle(page, "/demo/register/review");
  await page.getByRole("button", { name: "Edit my details instead" }).click();
  await expect.poll(async () => (await snap(page)).checkout).toBeNull();
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const reopened = await snap(page);
  expect(reopened.checkout).toBe("pending");
  expect(reopened.key).not.toBe(old);
});

test("R4-N01 preserved: a genuine payment failure recovers through a fresh quote and a new checkout", async ({ page }) => {
  await load(page, "activation_payment_failed");
  await settle(page, "/demo/activation");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Payment didn't go through");
  const old = (await snap(page)).key;
  await page.getByRole("button", { name: "Try payment again" }).click();
  await page.waitForURL("**/demo/register/review");
  await expect(page.getByTestId("review-submitted")).toHaveCount(0);
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const fresh = await snap(page);
  expect(fresh.checkout).toBe("pending");
  expect(fresh.key).not.toBe(old);
});

test("R4-N01 preserved: unknown → nothing charged recovers through a fresh quote and a new checkout", async ({ page }) => {
  const before = await submit(page, "unknown");
  await page.getByTestId("unknown-not-charged").click();
  await page.getByTestId("incomplete-continue").click();
  await page.waitForURL("**/demo/register/review");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const fresh = await snap(page);
  expect(fresh.checkout).toBe("pending");
  expect(fresh.key).not.toBe(before.key);
});

/** Pay and finish activation, edit the draft afterwards, then store it as a pre-R-013 build would (no scope). */
async function completedLegacy(page: Page) {
  await openCheckout(page);
  await page.getByTestId("outcome-paid").click();
  await page.waitForURL("**/demo/activation");
  await page.getByTestId("activation-refresh").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're in. Check your email.");
  const raw = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), KEY);
  const s = raw.state.s;
  delete s.checkout.scope;
  s.quote = null;
  s.draft = { ...s.draft, requestedStoreCount: 2, revision: s.draft.revision + 1, pharmacies: [{ ...s.draft.pharmacies[0], name: "Edited after payment" }, { ...s.draft.pharmacies[0], id: "demo_reg_ph_2", name: "Added after payment" }] };
  await page.evaluate(({ k, v }) => sessionStorage.setItem(k, JSON.stringify(v)), { k: KEY, v: { state: { s }, version: 2 } });
  await settle(page, "/demo/activation");
}

test("completed legacy record without a provable scope: completed status kept, unavailable history, no edited names or amount, no payment prompt", async ({ page }) => {
  await completedLegacy(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're in. Check your email.");
  const tracks = page.getByTestId("activation-tracks");
  await expect(tracks).toContainText("Confirmed by Stripe");
  await expect(tracks).not.toContainText("$");
  await expect(page.getByTestId("history-unavailable")).toContainText("can't show which pharmacies or what amount");
  const main = (await page.locator("main").innerText()).toLowerCase();
  for (const word of ["edited after payment", "added after payment", "try payment again", "pay again now"]) expect(main).not.toContain(word);
  const s = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!).state.s, KEY);
  expect(s.checkout.status).toBe("paid");
  expect(s.checkout.scope).toBeUndefined();
  expect(s.activation).toMatchObject({ paymentState: "confirmed", provisioningState: "ready", emailState: "sent" });
  await settle(page, "/demo/references/email?variant=owner");
  const preview = (await page.locator("main").innerText()).toLowerCase();
  expect(preview).not.toContain("edited after payment");
  expect(preview).not.toContain("added after payment");
});

test("REPAIR_004 addendum screens at 375 and 1440, light and dark: Gate M, contrast, screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  const screens: { name: string; url: string; ready: string; prepare: () => Promise<unknown> }[] = [
    { name: "review-submitted", url: "/demo/register/review", ready: "review-submitted", prepare: () => submit(page, "processing") },
    { name: "stripe-submitted", url: "/demo/stripe", ready: "checkout-submitted", prepare: () => submit(page, "processing") },
    { name: "activation-history-unavailable", url: "/demo/activation", ready: "history-unavailable", prepare: () => completedLegacy(page) },
  ];
  for (const sc of screens) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await sc.prepare();
    for (const theme of THEMES)
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await settle(page, sc.url);
        await setTheme(page, theme);
        await page.reload();
        await expect(page.getByTestId(sc.ready)).toBeVisible({ timeout: 5000 });
        const g = await measure(page, `${sc.url} [REPAIR_004 addendum ${sc.name}]`, width, theme);
        record("gate-m-repair004-addendum.jsonl", g);
        assertGate(g);
        const fails = textFailures(await textContrast(page));
        recordContrast("contrast-repair004-addendum.jsonl", { screen: `${sc.url} [REPAIR_004 addendum ${sc.name}]`, width, theme, fails });
        expect.soft(fails, `${sc.name} ${theme} ${width}`).toEqual([]);
        await page.screenshot({ path: `test-results/repair004a-${sc.name}_${theme}_${width}.png`, fullPage: true });
      }
  }
});
