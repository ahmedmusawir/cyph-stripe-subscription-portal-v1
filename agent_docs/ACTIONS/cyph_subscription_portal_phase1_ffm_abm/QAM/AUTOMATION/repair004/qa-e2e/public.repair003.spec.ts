import { expect, test, type Page } from "@playwright/test";
import { recordContrast, textContrast, textFailures } from "./contrast";
import { assertGate, measure, record, setTheme, THEMES } from "./gate-m";

// REPAIR_003 anonymous regressions (RULINGS R-013). No credentials are used here.
// R2-F01: a submitted (processing/unknown) payment stays bound to what it was quoted for.
// R2-F02: a closed checkout's operation key never opens another checkout.
const KEY = "cyph-portal-demo:v1:public";
const ORIGINAL = "Example Main Street Pharmacy";
type Mode = "processing" | "unknown";

const snap = (page: Page) =>
  page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!).state.s;
    return {
      count: s.draft.requestedStoreCount as number,
      names: s.draft.pharmacies.map((p: { name?: string }) => p.name) as string[],
      checkout: (s.checkout?.status ?? null) as string | null,
      key: (s.checkout?.operationKey ?? null) as string | null,
      scope: (s.checkout?.scope ?? null) as { storeCount: number; dueNowCents: number } | null,
      payment: (s.activation?.paymentState ?? null) as string | null,
    };
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

/** Open a checkout and submit payment on the stand-in without a confirmation yet. */
async function submit(page: Page, mode: Mode) {
  await openCheckout(page);
  if (mode === "processing") await page.getByRole("button", { name: "Payment processing → activation (waiting)", exact: true }).click();
  else await page.getByTestId("outcome-unknown").click();
  await page.waitForURL(mode === "processing" ? "**/demo/activation" : "**/demo/checkout-incomplete");
  const s = await snap(page);
  expect(s.scope).toMatchObject({ storeCount: 1, dueNowCents: 9900 });
  return s.key!;
}

const EDITS: Record<string, (page: Page) => Promise<void>> = {
  "pharmacy name": async (page) => {
    await settle(page, "/demo/register/pharmacies");
    await page.locator("#ph-name").fill("Changed after submission");
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await expect.poll(async () => (await snap(page)).names).toEqual(["Changed after submission"]);
  },
  "count 1 → 2 with a second pharmacy": async (page) => {
    await settle(page, "/demo/register/plan");
    await page.getByRole("button", { name: "More pharmacies" }).click();
    await expect(page.locator("output#stores")).toHaveText("2");
    await settle(page, "/demo/register/pharmacies?store=2");
    for (const [label, v] of [["Pharmacy name", "Added Pharmacy"], ["Street address", "2 Test Road"], ["City", "Springfield"], ["ZIP", "00000"], ["NCPDP number", "0000088"], ["NPI", "0000000088"], ["Store phone", "(555) 010-0102"]])
      await page.getByLabel(label).fill(v);
    await page.getByLabel("State").selectOption("Alabama");
    await page.getByLabel("Pharmacy software").selectOption("Liberty");
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await expect.poll(async () => (await snap(page)).names).toEqual([ORIGINAL, "Added Pharmacy"]);
  },
};

const page_ = (mode: Mode) => (mode === "processing" ? "/demo/activation" : "/demo/checkout-incomplete");
const holdId = (mode: Mode) => (mode === "processing" ? "activation-hold" : "unknown-hold");
const confirmId = (mode: Mode) => (mode === "processing" ? "activation-refresh" : "unknown-paid");

for (const mode of ["processing", "unknown"] as const)
  for (const [edit, apply] of Object.entries(EDITS))
    test(`R2-F01 ${mode}: after a ${edit} edit the payment can't confirm the edit; "Use the details I paid for" confirms the original`, async ({ page }) => {
      const key = await submit(page, mode);
      await apply(page);
      await settle(page, page_(mode));
      const hold = page.getByTestId(holdId(mode));
      await expect(hold).toContainText("Your details changed after you paid");
      await expect(hold).toContainText(`This payment is for 1 pharmacy (${ORIGINAL}), $99.00`);
      await expect(page.getByTestId(confirmId(mode))).toBeDisabled();
      // Still held after a wait and a reload; the payment record is untouched.
      await page.waitForTimeout(1500);
      await page.reload();
      await expect(page.getByTestId(confirmId(mode))).toBeDisabled();
      expect(await snap(page)).toMatchObject({ key, checkout: mode === "processing" ? "pending" : "unknown", payment: mode === "processing" ? "pending" : null });
      // The stand-in offers no payment outcome either.
      if (mode === "processing") {
        await settle(page, "/demo/stripe");
        await page.waitForTimeout(1200);
        await expect(page.getByTestId("checkout-hold")).toContainText("only go ahead for the details you submitted");
        await expect(page.getByTestId("outcome-paid")).toHaveCount(0);
        await settle(page, page_(mode));
      }
      await page.getByTestId("restore-scope").click();
      await expect(page.getByTestId(holdId(mode))).toHaveCount(0);
      await expect(page.getByTestId(confirmId(mode))).toBeEnabled();
      await page.getByTestId(confirmId(mode)).click();
      if (mode === "unknown") await page.waitForURL("**/demo/activation");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Payment confirmed. Setting up your pharmacies…");
      await expect(page.getByTestId("activation-tracks")).toContainText("Confirmed by Stripe · $99.00");
      await expect(page.getByTestId("activation-tracks")).toContainText(`Setting up ${ORIGINAL}.`);
      expect(await snap(page)).toMatchObject({ count: 1, names: [ORIGINAL], key, checkout: "paid", payment: "confirmed", scope: { storeCount: 1, dueNowCents: 9900 } });
    });

test("R2-F01 valid recovery for the edited details: unknown → nothing charged → fresh quote for 2 → new checkout with a new key", async ({ page }) => {
  const key = await submit(page, "unknown");
  await EDITS["count 1 → 2 with a second pharmacy"](page);
  await settle(page, "/demo/checkout-incomplete");
  await page.getByTestId("unknown-not-charged").click();
  await expect(page.getByTestId("incomplete-abandoned")).toBeVisible();
  await page.getByTestId("incomplete-continue").click();
  await page.waitForURL("**/demo/register/review");
  await expect(page.getByTestId("due-today")).toHaveText("$148.00");
  await expect(page.locator("#c1")).not.toBeChecked();
  await expect(page.locator("#c2")).not.toBeChecked();
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const fresh = await snap(page);
  expect(fresh).toMatchObject({ checkout: "pending", scope: { storeCount: 2, dueNowCents: 14800 } });
  expect(fresh.key).not.toBe(key);
  await page.getByTestId("outcome-paid").click();
  await page.waitForURL("**/demo/activation");
  await expect(page.getByTestId("activation-tracks")).toContainText("Confirmed by Stripe · $148.00");
});

test("R2-F02: closing a checkout from the review page and paying again on the same page uses a new key", async ({ page }) => {
  await openCheckout(page);
  const old = (await snap(page)).key;
  await settle(page, "/demo/register/review");
  await expect(page.getByText("Your checkout on Stripe is still open")).toBeVisible();
  await page.getByRole("button", { name: "Edit my details instead" }).click();
  await expect.poll(async () => (await snap(page)).checkout).toBeNull();
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  await expect(page.getByText("Checkout couldn't start")).toHaveCount(0);
  const reopened = await snap(page);
  expect(reopened).toMatchObject({ checkout: "pending" });
  expect(reopened.key).not.toBe(old);
});

test("R-013 holds at 375 and 1440, light and dark: Gate M, contrast, screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  for (const mode of ["processing", "unknown"] as const) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await submit(page, mode);
    await EDITS["pharmacy name"](page);
    const screens = mode === "processing" ? ["/demo/activation", "/demo/stripe"] : ["/demo/checkout-incomplete"];
    for (const theme of THEMES)
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const url of screens) {
          await settle(page, url);
          await setTheme(page, theme);
          await page.reload();
          await expect(page.getByTestId(url === "/demo/stripe" ? "checkout-hold" : holdId(mode))).toBeVisible({ timeout: 5000 });
          await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
          const g = await measure(page, `${url} [R-013 scope hold]`, width, theme);
          record("gate-m-repair003.jsonl", g);
          assertGate(g);
          const fails = textFailures(await textContrast(page));
          recordContrast("contrast-repair003.jsonl", { screen: `${url} [R-013 scope hold]`, width, theme, fails });
          expect.soft(fails, `${url} ${theme} ${width}`).toEqual([]);
          await page.screenshot({ path: `test-results/repair003-${url.split("/").pop()}-scope-hold_${theme}_${width}.png`, fullPage: true });
        }
      }
  }
});
