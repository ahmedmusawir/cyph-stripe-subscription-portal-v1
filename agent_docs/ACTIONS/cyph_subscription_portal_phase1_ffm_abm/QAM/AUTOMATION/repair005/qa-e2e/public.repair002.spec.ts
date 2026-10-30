import { expect, test, type Page } from "@playwright/test";
import { focusRings, recordContrast, textContrast, textFailures } from "./contrast";
import { assertGate, measure, record, setTheme, THEMES } from "./gate-m";

// REPAIR_002 anonymous regressions (RULINGS R-012). No credentials are used here.
const KEY = "cyph-portal-demo:v1:public";
type Snap = { accepted: unknown; quoteCleared: boolean; checkout: string | null; closedReason: string | null; key: string | null; payment: string | null; version: number };

const snap = (page: Page): Promise<Snap> =>
  page.evaluate((k) => {
    const v = JSON.parse(sessionStorage.getItem(k)!);
    const s = v.state.s;
    return {
      accepted: s.draft.owner.ownerDeclarationAccepted,
      quoteCleared: s.quote === null,
      checkout: s.checkout?.status ?? null,
      closedReason: s.checkout?.closedReason ?? null,
      key: s.checkout?.operationKey ?? null,
      payment: s.activation?.paymentState ?? null,
      version: v.version,
    };
  }, KEY);

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

/** Revisit the stand-in directly and wait past its 900 ms "leaving" phase. */
async function revisitStripe(page: Page) {
  await page.goto("/demo/stripe");
  await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
  await page.waitForTimeout(1500);
}

/** Owner re-accepts → review → fresh quote → fresh consent → new checkout → paid. */
async function recoverAndPay(page: Page, oldKey: string | null, closedBanner = true) {
  await page.goto("/demo/register/owner");
  const box = page.locator("#owner-declaration");
  await expect(box).not.toBeChecked();
  await expect(page.getByLabel("First name")).toHaveValue("Jordan");
  await box.check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/pharmacies\?store=1/);
  await page.goto("/demo/register/review");
  if (closedBanner) {
    await expect(page.getByText("Welcome back — your details are saved")).toBeVisible();
    await page.getByRole("button", { name: "Get a fresh quote" }).click();
  }
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await expect(page.locator("#c1")).not.toBeChecked();
  await expect(page.locator("#c2")).not.toBeChecked();
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  const reopened = await snap(page);
  expect(reopened).toMatchObject({ accepted: true, checkout: "pending", closedReason: null });
  expect(reopened.key).not.toBe(oldKey);
  await page.getByTestId("outcome-paid").click();
  await page.waitForURL("**/demo/activation");
  expect(await snap(page)).toMatchObject({ accepted: true, checkout: "paid", payment: "confirmed" });
}

// ── CR-F01 A: current UI ─────────────────────────────────────────────────────
test("CR-F01 A: unchecking the declaration closes the open checkout; direct revisit and reload offer no payment; recovery works", async ({ page }) => {
  await openCheckout(page);
  const opened = await snap(page);
  await page.goto("/demo/register/owner");
  await page.locator("#owner-declaration").uncheck();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#owner-declaration-err")).toHaveText("Confirm that you are the pharmacy owner to continue.");
  expect(await snap(page)).toMatchObject({ accepted: false, checkout: "abandoned", closedReason: "owner_declaration", quoteCleared: true, payment: null });

  for (let i = 0; i < 2; i++) {
    await revisitStripe(page);
    await expect(page.getByTestId("checkout-closed")).toContainText("The owner declaration was withdrawn after checkout opened");
    await expect(page.getByTestId("outcome-paid")).toHaveCount(0);
    await page.reload();
  }
  // Activation and the incomplete page don't offer a back door either.
  await page.goto("/demo/activation");
  await expect(page.getByText("There's no payment to track yet")).toBeVisible();
  await page.goto("/demo/checkout-incomplete");
  await expect(page.getByTestId("incomplete-abandoned")).toContainText("The owner declaration was withdrawn");
  await page.getByTestId("incomplete-continue").click();
  await expect(page).toHaveURL(/\/demo\/register\/owner/); // review guard → owner step
  expect(await snap(page)).toMatchObject({ checkout: null, payment: null }); // resumed: closed record cleared, fresh quote next

  await recoverAndPay(page, opened.key, false);
});

test("CR-F01 A (Back): leaving the owner step unticked via Back also closes the checkout", async ({ page }) => {
  await openCheckout(page);
  await page.goto("/demo/register/owner");
  await page.locator("#owner-declaration").uncheck();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page).toHaveURL(/\/demo\/register\/plan/);
  expect(await snap(page)).toMatchObject({ accepted: false, checkout: "abandoned", closedReason: "owner_declaration" });
  await revisitStripe(page);
  await expect(page.getByTestId("outcome-paid")).toHaveCount(0);
});

// ── CR-F01 B: legacy draft restored over a pending checkout ──────────────────
test("CR-F01 B: a storage-v1 draft over a pending checkout migrates closed and unaccepted; recovery works", async ({ page }) => {
  await openCheckout(page);
  const opened = await snap(page);
  await page.evaluate((k) => {
    const v = JSON.parse(sessionStorage.getItem(k)!);
    delete v.state.s.draft.owner.ownerDeclarationAccepted;
    v.state.s.draft.owner.businessRole = "owner";
    v.version = 1;
    sessionStorage.setItem(k, JSON.stringify(v));
  }, KEY);
  await page.reload();
  await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("outcome-paid")).toHaveCount(0);
  await expect(page.getByTestId("checkout-closed")).toBeVisible();
  const migrated = await snap(page);
  expect(migrated).toMatchObject({ version: 3, accepted: false, quoteCleared: true, checkout: "abandoned", closedReason: "owner_declaration", payment: null });
  await recoverAndPay(page, opened.key);
});

// ── Stored state already unaccepted (no transition): held, not payable ───────
test("a stored open checkout whose declaration is false is held on the stand-in, keyboard path to details", async ({ page }) => {
  await openCheckout(page);
  await page.evaluate((k) => {
    const v = JSON.parse(sessionStorage.getItem(k)!);
    v.state.s.draft.owner.ownerDeclarationAccepted = false;
    sessionStorage.setItem(k, JSON.stringify(v));
  }, KEY);
  await revisitStripe(page);
  await expect(page.getByTestId("checkout-hold")).toContainText("Confirm the owner declaration before paying");
  await expect(page.getByRole("button", { name: /Payment succeeds|Payment processing/ })).toHaveCount(0);
  // Keyboard-only: Tab to the details link and follow it.
  const link = page.getByRole("link", { name: "Go to my details" });
  for (let i = 0; i < 40 && !(await link.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/demo\/register\/owner/);
  expect(await snap(page)).toMatchObject({ checkout: "pending", payment: null });
});

test("processing payment with the declaration withdrawn waits on activation (refresh disabled) until accepted again", async ({ page }) => {
  await openCheckout(page);
  await page.getByRole("button", { name: /Payment processing/ }).click();
  await page.waitForURL("**/demo/activation");
  await page.goto("/demo/register/owner");
  await page.locator("#owner-declaration").uncheck();
  await page.getByRole("button", { name: "Back" }).click();
  await page.goto("/demo/activation");
  await expect(page.getByTestId("activation-hold")).toContainText("Confirm the owner declaration to continue");
  await expect(page.getByTestId("activation-refresh")).toBeDisabled();
  expect(await snap(page)).toMatchObject({ checkout: "pending", payment: "pending", closedReason: null });
  await page.goto("/demo/register/owner");
  await page.locator("#owner-declaration").check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/pharmacies\?store=1/);
  await page.goto("/demo/activation");
  await page.getByTestId("activation-refresh").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Payment confirmed. Setting up your pharmacies…");
});

test("unknown payment with the declaration withdrawn: confirm-paid unavailable, nothing-charged available", async ({ page }) => {
  await load(page, "checkout_unknown");
  await page.goto("/demo/register/owner");
  await page.locator("#owner-declaration").uncheck();
  await page.getByRole("button", { name: "Back" }).click();
  await page.goto("/demo/checkout-incomplete");
  await expect(page.getByTestId("unknown-hold")).toBeVisible();
  await expect(page.getByTestId("unknown-paid")).toBeDisabled();
  await page.getByTestId("unknown-not-charged").click();
  await expect.poll(async () => (await snap(page)).checkout).toBe("abandoned");
  expect((await snap(page)).payment).toBeNull();
});

// ── R2-N01: a material edit closes the open checkout ─────────────────────────
test("R2-N01: changing the store count while checkout is open closes it", async ({ page }) => {
  await openCheckout(page);
  await page.goto("/demo/register/plan");
  await page.getByRole("button", { name: "More pharmacies" }).click();
  expect(await snap(page)).toMatchObject({ checkout: "abandoned", closedReason: "details_changed", quoteCleared: true });
  await revisitStripe(page);
  await expect(page.getByTestId("checkout-closed")).toContainText("Your signup details changed after checkout opened");
  await expect(page.getByTestId("outcome-paid")).toHaveCount(0);
});

// ── Valid replay / repeated operation still work ─────────────────────────────
test("valid open checkout: review ↔ stand-in round trips and reloads replay one checkout, then pay once", async ({ page }) => {
  await openCheckout(page);
  const first = await snap(page);
  await page.goto("/demo/register/review");
  await expect(page.getByText("Your checkout on Stripe is still open")).toBeVisible();
  await page.getByRole("link", { name: "Back to checkout" }).click();
  await page.waitForURL("**/demo/stripe");
  await page.reload();
  await expect(page.getByTestId("checkout-preview")).toBeVisible({ timeout: 5000 });
  expect((await snap(page)).key).toBe(first.key);
  await page.getByTestId("outcome-paid").click();
  await page.waitForURL("**/demo/activation");
  await page.goto("/demo/stripe");
  await expect(page.getByText("This checkout already has an outcome")).toBeVisible();
  expect(await snap(page)).toMatchObject({ key: first.key, checkout: "paid", payment: "confirmed" });
});

// ── CR-F02: bounded count-driven work ────────────────────────────────────────
test("R2-N02: pharmacy step 100 of 100 is reachable (no hidden two-digit step limit)", async ({ page }) => {
  await load(page, "prefilled_one_store");
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await page.evaluate((k) => {
    const v = JSON.parse(sessionStorage.getItem(k)!);
    const d = v.state.s.draft;
    d.requestedStoreCount = 100;
    d.pharmacies = Array.from({ length: 99 }, (_, i) => ({ ...d.pharmacies[0], id: `demo_reg_ph_${i + 1}`, name: `Example Pharmacy ${i + 1}` }));
    v.state.s.quote = null;
    sessionStorage.setItem(k, JSON.stringify(v));
  }, KEY);
  await page.goto("/demo/register/pharmacies?store=100");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pharmacy 100 of 100");
  await expect(page).toHaveURL(/store=100/);
  await page.goto("/demo/register/review");
  await expect(page).toHaveURL(/pharmacies\?store=100/);
});

test("CR-F02: a restored billion-store draft renders, prices exactly and deep links fill in order", async ({ page }) => {
  await load(page, "prefilled_one_store");
  await expect(page.getByTestId("due-today")).toHaveText("$99.00");
  await page.evaluate((k) => {
    const v = JSON.parse(sessionStorage.getItem(k)!);
    v.state.s.draft.requestedStoreCount = 1_000_000_000;
    v.state.s.quote = null;
    sessionStorage.setItem(k, JSON.stringify(v));
  }, KEY);
  const started = Date.now();
  await page.goto("/demo/register/plan");
  await expect(page.locator("output#stores")).toHaveText("1000000000");
  await expect(page.locator("main")).toContainText("$49,000,000,050.00");
  await page.goto("/demo/register/pharmacies?store=999999999");
  await expect(page).toHaveURL(/pharmacies\?store=2/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pharmacy 2 of 1000000000");
  expect(Date.now() - started).toBeLessThan(15_000);
  const sizes = await page.evaluate((k) => {
    const raw = sessionStorage.getItem(k)!;
    return { bytes: raw.length, entries: JSON.parse(raw).state.s.draft.pharmacies.length };
  }, KEY);
  expect(sizes.entries).toBeLessThanOrEqual(2);
  expect(sizes.bytes).toBeLessThan(20_000);
});

test("CR-F02: count reduction asks before discarding; restoring the count refills the missing step in order", async ({ page }) => {
  await load(page, "prefilled_three_store");
  await page.goto("/demo/register/plan");
  await page.getByRole("button", { name: "Fewer pharmacies" }).click();
  await expect(page.getByTestId("reduce-confirm")).toContainText("Hillside"); // names the pharmacy it would discard
  await page.getByRole("button", { name: "Remove and continue with 2" }).click();
  await expect(page.locator("output#stores")).toHaveText("2");
  await page.getByRole("button", { name: "More pharmacies" }).click();
  await expect(page.locator("output#stores")).toHaveText("3");
  const entries = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!).state.s.draft.pharmacies.length, KEY);
  expect(entries).toBe(2); // the restored third store is not pre-allocated
  await page.goto("/demo/register/review");
  await expect(page).toHaveURL(/pharmacies\?store=3/);
  await expect(page.getByLabel("Pharmacy name")).toHaveValue("");
  for (const [label, v] of [["Pharmacy name", "Example Restored Pharmacy"], ["Street address", "3 Test Road"], ["City", "Springfield"], ["ZIP", "00000"], ["NCPDP number", "0000399"], ["NPI", "0000000399"], ["Store phone", "(555) 010-0101"]])
    await page.getByLabel(label).fill(v);
  await page.getByLabel("State").selectOption("Alabama");
  await page.getByLabel("Pharmacy software").selectOption("Liberty");
  await page.getByRole("button", { name: "Continue to review", exact: true }).click();
  await expect(page.getByTestId("review-pharmacy")).toHaveCount(3);
  await expect(page.getByTestId("due-today")).toHaveText("$197.00");
});

test("21 pharmacies: full journey through review, checkout and activation at $1,079.00", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/demo/register/plan");
  for (let i = 1; i < 21; i++) await page.getByRole("button", { name: "More pharmacies" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (const [label, v] of [["First name", "Jordan"], ["Last name", "Ellis"], ["Work email", "jordan@demo-pharmacy.example"], ["Mobile phone", "(555) 010-0101"]]) await page.getByLabel(label).fill(v);
  await page.locator("#owner-declaration").check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (let n = 1; n <= 21; n++) {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Pharmacy ${n} of 21`);
    const pad = String(n).padStart(2, "0");
    for (const [label, v] of [["Pharmacy name", `Example Large Journey ${n}`], ["Street address", `${n} Test Road`], ["City", "Springfield"], ["ZIP", "00000"], ["NCPDP number", `00001${pad}`], ["NPI", `00000001${pad}`], ["Store phone", "(555) 010-0101"]])
      await page.getByLabel(label).fill(v);
    await page.getByLabel("State").selectOption("Alabama");
    await page.getByLabel("Pharmacy software").selectOption("Liberty");
    await page.getByRole("button", { name: n === 21 ? "Continue to review" : `Continue to pharmacy ${n + 1} of 21`, exact: true }).click();
  }
  await expect(page.getByTestId("review-pharmacy")).toHaveCount(21);
  await expect(page.getByTestId("due-today")).toHaveText("$1,079.00");
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("stripe-due")).toContainText("$1,079.00");
  await page.getByTestId("outcome-paid").click();
  await page.getByTestId("activation-refresh").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're in. Check your email.");
  const x = await page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!).state.s;
    return { count: s.draft.pharmacies.length, names: new Set(s.draft.pharmacies.map((p: { name: string }) => p.name)).size, due: s.quote.dueNowCents, payment: s.activation.paymentState };
  }, KEY);
  expect(x).toEqual({ count: 21, names: 21, due: 107900, payment: "confirmed" });
});

// ── New R-012 surfaces: Gate M (375/1440) and contrast, both themes ─────────
const HOLD_SURFACES: { name: string; route: string; prepare: (p: Page) => Promise<void> }[] = [
  {
    name: "stand-in closed",
    route: "/demo/stripe",
    prepare: async (p) => {
      await openCheckout(p);
      await p.goto("/demo/register/owner");
      await p.locator("#owner-declaration").uncheck();
      await p.getByRole("button", { name: "Back" }).click();
    },
  },
  {
    name: "stand-in hold",
    route: "/demo/stripe",
    prepare: async (p) => {
      await openCheckout(p);
      await p.evaluate((k) => {
        const v = JSON.parse(sessionStorage.getItem(k)!);
        v.state.s.draft.owner.ownerDeclarationAccepted = false;
        sessionStorage.setItem(k, JSON.stringify(v));
      }, KEY);
    },
  },
  {
    name: "activation hold",
    route: "/demo/activation",
    prepare: async (p) => {
      await load(p, "activation_waiting");
      await p.goto("/demo/register/owner");
      await p.locator("#owner-declaration").uncheck();
      await p.getByRole("button", { name: "Back" }).click();
    },
  },
  {
    name: "unknown hold",
    route: "/demo/checkout-incomplete",
    prepare: async (p) => {
      await load(p, "checkout_unknown");
      await p.goto("/demo/register/owner");
      await p.locator("#owner-declaration").uncheck();
      await p.getByRole("button", { name: "Back" }).click();
    },
  },
];

for (const s of HOLD_SURFACES) {
  test(`R-012 surface: ${s.name} — Gate M 375/1440 and contrast, light/dark`, async ({ page }) => {
    test.setTimeout(120_000);
    await s.prepare(page);
    for (const theme of THEMES) {
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(s.route);
        await setTheme(page, theme);
        await page.reload();
        await page.waitForLoadState("networkidle");
        await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
        await page.waitForTimeout(1200);
        const r = await measure(page, `${s.route} [${s.name}]`, width, theme);
        record("gate-m-repair002.jsonl", r);
        assertGate(r);
        const rows = await textContrast(page);
        const fails = textFailures(rows);
        const rings = await focusRings(page, 20);
        recordContrast("contrast-repair002.jsonl", { screen: `${s.route} [${s.name}]`, width, theme, rows: rows.length, fails, rings });
        expect.soft(fails, `${s.name} ${theme} ${width}: text below threshold`).toEqual([]);
        expect.soft(rings.filter((x) => x.ratio < x.required), `${s.name} ${theme} ${width}: focus ring`).toEqual([]);
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur()); // focus probe leaves focus on the skip link
        await page.screenshot({ path: `test-results/repair002-${s.name.replace(/\s+/g, "-")}_${theme}_${width}.png`, fullPage: true });
      }
    }
  });
}

// ── Manual-review addendum: C14 introduction matches the payment state ───────
const C14_INTRO: { scenario: string; intro: string; locked: boolean }[] = [
  { scenario: "checkout_unknown", intro: "Your details are saved. We're checking your payment status. Please don't pay again yet.", locked: true },
  { scenario: "checkout_abandoned", intro: "Your details for 2 pharmacies are saved. Payment wasn't completed, so your account isn't active yet.", locked: false },
  { scenario: "checkout_declined", intro: "Your details for 2 pharmacies are saved. Payment wasn't completed, so your account isn't active yet.", locked: false },
];
for (const c of C14_INTRO) {
  test(`C14 intro [${c.scenario}]: state-appropriate wording; lock/recovery unchanged; 375/1440 light/dark`, async ({ page }) => {
    test.setTimeout(90_000);
    await load(page, c.scenario);
    for (const theme of THEMES) {
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/demo/checkout-incomplete");
        await setTheme(page, theme);
        await page.reload();
        await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
        const main = page.locator("main");
        await expect(main).toContainText(c.intro);
        if (c.locked) {
          await expect(main).not.toContainText("Payment wasn't completed");
          await expect(main).toContainText("We're checking whether a payment went through");
        }
        await expect(page.getByTestId("incomplete-continue")).toBeEnabled({ enabled: !c.locked });
        const r = await measure(page, `/demo/checkout-incomplete [${c.scenario}]`, width, theme);
        record("gate-m-c14-intro.jsonl", r);
        assertGate(r);
        const fails = textFailures(await textContrast(page));
        recordContrast("contrast-c14-intro.jsonl", { screen: `/demo/checkout-incomplete [${c.scenario}]`, width, theme, fails });
        expect.soft(fails, `${c.scenario} ${theme} ${width}: text below threshold`).toEqual([]);
        await page.screenshot({ path: `test-results/c14-intro-${c.scenario}_${theme}_${width}.png`, fullPage: true });
      }
    }
    if (c.locked) {
      // Recovery still resolves explicitly: "nothing charged" → resumable.
      await page.getByTestId("unknown-not-charged").click();
      await expect(page.getByTestId("incomplete-abandoned")).toBeVisible();
      await expect(page.locator("main")).toContainText("Payment wasn't completed");
    }
  });
}
