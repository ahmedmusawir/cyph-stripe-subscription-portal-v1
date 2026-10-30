import { expect, test, type Page } from "@playwright/test";
import { recordContrast, textContrast, textFailures } from "./contrast";
import { assertGate, measure, record, setTheme, THEMES } from "./gate-m";

// REPAIR_004 anonymous regressions. No credentials are used here.
// R3-F01: a storage-v2 checkout binds a scope only from retained evidence; an R-011
//         open checkout edited before the upgrade is held, never confirmed.
// R3-F02: completed activation names only what the payment covered.
// R3-O03: the dark focus ring inside an alert clears 3:1 against both neighbours.
const KEY = "cyph-portal-demo:v1:public";
const ORIGINAL = "Example Main Street Pharmacy";
type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const snap = (page: Page) =>
  page.evaluate((k) => {
    const raw = JSON.parse(sessionStorage.getItem(k)!);
    const s = raw.state.s;
    return {
      version: raw.version as number,
      count: s.draft.requestedStoreCount as number,
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

/** Rewrite the saved state as an older build would have left it, then reload on `url`. */
async function asLegacy(page: Page, url: string, edit: (s: Json) => Json) {
  const raw = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!), KEY);
  delete raw.state.s.checkout.scope;
  await page.evaluate(({ k, v }) => sessionStorage.setItem(k, JSON.stringify(v)), { k: KEY, v: { state: { s: edit(raw.state.s) }, version: 2 } });
  await settle(page, url);
}

/** What the R-011 engine stored after a count edit while a checkout was open. */
const r011Edited = (s: Json) => ({
  ...s,
  quote: null,
  draft: {
    ...s.draft,
    requestedStoreCount: 2,
    pharmacies: [s.draft.pharmacies[0], { ...s.draft.pharmacies[0], id: "demo_reg_ph_2", name: "Legacy extra", ncpdp: "0000045", npi: "0000000045" }],
    revision: s.draft.revision + 1,
    state: "editing",
    consents: { termsAccepted: false, recurringChargeAccepted: false, priceChangeAccepted: false },
  },
});

test("R3-F01: an R-011 open checkout edited before the upgrade is held with no scope and no payment, across reloads", async ({ page }) => {
  await openCheckout(page);
  const key = (await snap(page)).key;
  await asLegacy(page, "/demo/stripe", r011Edited);
  for (let i = 0; i < 2; i++) {
    const hold = page.getByTestId("checkout-hold");
    await expect(hold).toContainText("We can't match this payment to your current details");
    await expect(hold).toContainText("Please don't pay again");
    await expect(hold).not.toContainText("after you paid");
    await expect(page.getByTestId("outcome-paid")).toHaveCount(0);
    await expect(page.getByTestId("restore-scope")).toHaveCount(0);
    await page.waitForTimeout(1200);
    await page.reload();
  }
  expect(await snap(page)).toMatchObject({ version: 3, count: 2, checkout: "pending", key, scope: null, payment: null });
  await settle(page, "/demo/activation");
  await expect(page.getByText("There's no payment to track yet")).toBeVisible();
});

test("R3-F01 known scope: an unedited legacy open checkout binds the quote it opened with and can be paid", async ({ page }) => {
  await openCheckout(page);
  await asLegacy(page, "/demo/stripe", (s) => s);
  expect(await snap(page)).toMatchObject({ version: 3, checkout: "pending", scope: { storeCount: 1, dueNowCents: 9900 } });
  await page.getByTestId("outcome-paid").click();
  await page.waitForURL("**/demo/activation");
  await expect(page.getByTestId("activation-tracks")).toContainText("Confirmed by Stripe · $99.00");
});

test("R3-F01 recovery: an edited legacy unknown payment stays unmatched; nothing charged → fresh quote → new key", async ({ page }) => {
  await openCheckout(page);
  const key = (await snap(page)).key;
  await page.getByTestId("outcome-unknown").click();
  await page.waitForURL("**/demo/checkout-incomplete");
  await asLegacy(page, "/demo/checkout-incomplete", r011Edited);
  await expect(page.getByTestId("unknown-hold")).toContainText("We can't match this payment to your current details");
  await expect(page.getByTestId("restore-scope")).toHaveCount(0);
  await expect(page.getByTestId("unknown-paid")).toBeDisabled();
  await page.getByTestId("unknown-not-charged").click();
  await page.getByTestId("incomplete-continue").click();
  await page.waitForURL("**/demo/register/review");
  await expect(page.getByTestId("due-today")).toHaveText("$148.00");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const fresh = await snap(page);
  expect(fresh).toMatchObject({ checkout: "pending", scope: { storeCount: 2, dueNowCents: 14800 } });
  expect(fresh.key).not.toBe(key);
});

const REPLACEMENT = { kind: "other", fullName: "Replacement Admin", email: "replacement@demo-pharmacy.example" };
const SAM = { kind: "other", fullName: "Sam Ortiz", email: "sam@demo-pharmacy.example" };

/** Pay for one pharmacy (optionally with a nominated admin), finish activation, then change the draft admin. */
async function completeThenNominate(page: Page, admin?: Json) {
  await load(page, "prefilled_one_store");
  if (admin)
    await page.evaluate(
      ({ k, admin }) => {
        const raw = JSON.parse(sessionStorage.getItem(k)!);
        raw.state.s.draft.pharmacies[0].adminAssignment = admin;
        sessionStorage.setItem(k, JSON.stringify(raw));
      },
      { k: KEY, admin },
    );
  await settle(page, "/demo/register/review");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await page.getByTestId("outcome-paid").click();
  await page.waitForURL("**/demo/activation");
  await page.getByTestId("activation-refresh").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're in. Check your email.");
  await page.evaluate(
    ({ k, admin }) => {
      const raw = JSON.parse(sessionStorage.getItem(k)!);
      raw.state.s.draft.pharmacies[0].adminAssignment = admin;
      sessionStorage.setItem(k, JSON.stringify(raw));
    },
    { k: KEY, admin: REPLACEMENT },
  );
  await settle(page, "/demo/activation");
}

const text = async (page: Page) => (await page.locator("main").innerText()).toLowerCase();

test("R3-F02: completed activation and its previews name no admin nominated after payment", async ({ page }) => {
  await completeThenNominate(page);
  const main = await text(page);
  expect(main).toContain("sent to j•••@demo-pharmacy.example.");
  expect(main).not.toContain("replacement admin");
  expect(main).not.toContain("invitation");
  for (const variant of ["owner", "store_admin"]) {
    await settle(page, `/demo/references/email?variant=${variant}`);
    expect(await text(page)).not.toContain("replacement admin");
  }
  const s = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!).state.s, KEY);
  expect(s.checkout.scope.pharmacies[0].adminAssignment).toEqual({ kind: "owner" });
  expect(s.activation).toMatchObject({ paymentState: "confirmed", provisioningState: "ready", emailState: "sent" });
});

test("R3-F02 control: an admin the payment covered is still the one named and previewed", async ({ page }) => {
  await completeThenNominate(page, SAM);
  const main = await text(page);
  expect(main).toContain("a separate store invitation went to sam ortiz");
  expect(main).not.toContain("replacement admin");
  await page.getByRole("link", { name: "Preview Sam Ortiz's invitation" }).click();
  await page.waitForURL("**/demo/references/email?variant=store_admin");
  await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
  const preview = await text(page);
  expect(preview).toContain("sam, you've been invited to manage example main street pharmacy");
  expect(preview).toContain("s•••@demo-pharmacy.example");
  expect(preview).not.toContain("replacement admin");
});

/** Ring colour vs the surface outside it and vs its inner offset, unrounded. */
const ringRatios = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const rgb = (s: string) => {
      const a = s.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
      return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1];
    };
    const blend = (f: number[], b: number[]) => [0, 1, 2].map((k) => f[k] * f[3] + b[k] * (1 - f[3]));
    const lum = (a: number[]) =>
      a.slice(0, 3).map((v) => ((v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))).reduce((s, v, k) => s + v * [0.2126, 0.7152, 0.0722][k], 0);
    const ratio = (a: number[], b: number[]) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
    const chain: HTMLElement[] = [];
    for (let a = el.parentElement; a; a = a.parentElement) chain.unshift(a);
    let outer = [255, 255, 255];
    for (const a of chain) outer = blend(rgb(getComputedStyle(a).backgroundColor), outer);
    const colours = (getComputedStyle(el).boxShadow.match(/rgba?\([^)]*\)/g) || []).map(rgb).filter((c) => c[3] > 0);
    const [offset, ring] = [colours[0], colours[colours.length - 1]];
    return { shadow: getComputedStyle(el).boxShadow, outer: ratio(blend(ring, outer), outer), inner: ratio(ring, offset) };
  });

test("R3-O03: the restore button's keyboard ring clears 3:1 against both neighbours in both themes; Enter still restores", async ({ page }) => {
  for (const theme of THEMES) {
    await openCheckout(page);
    await page.getByTestId("outcome-unknown").click();
    await page.waitForURL("**/demo/checkout-incomplete");
    await settle(page, "/demo/register/pharmacies");
    await page.locator("#ph-name").fill("Changed after submission");
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await page.waitForURL("**/demo/register/review");
    await settle(page, "/demo/checkout-incomplete");
    await setTheme(page, theme);
    await page.reload();
    await expect(page.getByTestId("restore-scope")).toBeVisible();
    await page.locator("body").click({ position: { x: 1, y: 1 } });
    let reached = false;
    for (let i = 0; i < 60 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await page.getByTestId("restore-scope").evaluate((el) => el === document.activeElement);
    }
    expect(reached).toBe(true);
    await page.waitForTimeout(350);
    const r = await ringRatios(page);
    recordContrast("focus-repair004.jsonl", { screen: "/demo/checkout-incomplete [restore-scope]", theme, ...r });
    expect(r.outer, `${theme} outer`).toBeGreaterThanOrEqual(3);
    expect(r.inner, `${theme} inner`).toBeGreaterThanOrEqual(3);
    await page.screenshot({ path: `test-results/repair004-focus-restore_${theme}.png` });
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("restore-scope")).toHaveCount(0);
    expect(await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!).state.s.draft.pharmacies[0].name, KEY)).toBe(ORIGINAL);
  }
});

test("REPAIR_004 screens at 375 and 1440, light and dark: Gate M, contrast, screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  const screens: { name: string; url: string; prepare: () => Promise<void>; ready: string }[] = [
    { name: "stripe-unmatched", url: "/demo/stripe", ready: "checkout-hold", prepare: async () => { await openCheckout(page); await asLegacy(page, "/demo/stripe", r011Edited); } },
    { name: "activation-completed", url: "/demo/activation", ready: "activation-tracks", prepare: () => completeThenNominate(page) },
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
        const g = await measure(page, `${sc.url} [REPAIR_004 ${sc.name}]`, width, theme);
        record("gate-m-repair004.jsonl", g);
        assertGate(g);
        const fails = textFailures(await textContrast(page));
        recordContrast("contrast-repair004.jsonl", { screen: `${sc.url} [REPAIR_004 ${sc.name}]`, width, theme, fails });
        expect.soft(fails, `${sc.name} ${theme} ${width}`).toEqual([]);
        await page.screenshot({ path: `test-results/repair004-${sc.name}_${theme}_${width}.png`, fullPage: true });
      }
  }
});
