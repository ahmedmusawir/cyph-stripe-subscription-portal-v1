import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, appendFileSync } from "node:fs";
import { assertGate, measure, record, setTheme, THEMES } from "./gate-m";
import { recordContrast, textContrast, textFailures } from "./contrast";

// R-012 addendum 2: named activation states are chosen ONLY via Registration
// scenario → Load; the "Next activation check" control is gone. Each state is
// shown as loaded (no silent advance/reset) and the customer action progresses it.
const KEY = "cyph-portal-demo:v1:public";
const h1 = (p: Page) => p.getByRole("heading", { level: 1 });
const stored = (p: Page) =>
  p.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!).state.s;
    return { scenario: s.scenario, plan: s.activationPlan, payment: s.activation?.paymentState ?? null, setup: s.activation?.provisioningState ?? null, email: s.activation?.emailState ?? null, checkout: s.checkout?.status ?? null };
  }, KEY);

async function openControls(p: Page) {
  if (!(await p.locator("details[open]").count())) await p.locator("summary", { hasText: "Demo controls" }).click();
}
async function load(p: Page, id: string) {
  await openControls(p);
  await p.locator("#demo-reg-scenario").selectOption(id);
  await p.getByRole("button", { name: "Load", exact: true }).click();
}
function evidence(row: unknown) {
  mkdirSync("test-results", { recursive: true });
  appendFileSync("test-results/activation-scenarios.jsonl", JSON.stringify(row) + "\n");
}

test("the 'Next activation check' control is gone; scenario, clock and reset controls remain", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await openControls(page);
  const strip = page.getByTestId("public-demo-strip");
  await expect(strip.locator("#demo-activation-plan")).toHaveCount(0);
  await expect(strip).not.toContainText("Next activation check");
  await expect(strip.locator("#demo-reg-scenario")).toBeVisible();
  await expect(strip.getByRole("button", { name: "Load", exact: true })).toBeVisible();
  await expect(strip.getByRole("button", { name: "Advance 31 minutes" })).toBeVisible();
  await expect(strip.getByRole("button", { name: "Reset signup demo" })).toBeVisible();
  // Customer actions are never inside the demo strip.
  await expect(strip.getByRole("button", { name: /Refresh status|Resend access email|Try payment again/ })).toHaveCount(0);
});

type Row = { scenario: string; initial: string; seed: Record<string, string | null>; action: string; act: (p: Page) => Promise<void>; next: string; nextCheck?: (p: Page) => Promise<void> };
const ROWS: Row[] = [
  {
    scenario: "activation_waiting",
    initial: "Waiting for payment confirmation",
    seed: { payment: "pending", setup: "not_started", checkout: "pending" },
    action: "Refresh status",
    act: (p) => p.getByTestId("activation-refresh").click(),
    next: "Payment confirmed. Setting up your pharmacies…",
    nextCheck: async (p) => {
      await p.getByTestId("activation-refresh").click();
      await expect(h1(p)).toHaveText("You're in. Check your email.");
    },
  },
  {
    scenario: "activation_provisioning",
    initial: "Payment confirmed. Setting up your pharmacies…",
    seed: { payment: "confirmed", setup: "pending", checkout: "paid" },
    action: "Refresh status",
    act: (p) => p.getByTestId("activation-refresh").click(),
    next: "You're in. Check your email.",
  },
  {
    scenario: "activation_delayed",
    initial: "Paid — setup is taking longer",
    seed: { payment: "confirmed", setup: "attention", checkout: "paid" },
    action: "Refresh status",
    act: (p) => p.getByTestId("activation-refresh").click(),
    next: "You're in. Check your email.",
  },
  {
    scenario: "activation_email_failed",
    initial: "You're set up — the access email didn't send",
    seed: { payment: "confirmed", setup: "ready", email: "failed", checkout: "paid" },
    action: "Resend access email",
    act: (p) => p.getByTestId("resend").click(),
    next: "You're in. Check your email.",
    nextCheck: async (p) => {
      await expect(p.getByRole("status").filter({ hasText: "Sent again at" })).toBeVisible();
    },
  },
  {
    scenario: "activation_payment_failed",
    initial: "Payment didn't go through",
    seed: { payment: "failed", setup: "not_started", checkout: "declined" },
    action: "Try payment again",
    act: (p) => p.getByRole("button", { name: "Try payment again" }).click(),
    next: "Review and pay",
    nextCheck: async (p) => {
      await expect(p).toHaveURL(/\/demo\/register\/review/);
      await expect(p.getByTestId("due-today")).toHaveText("$148.00");
      await expect(p.locator("#c1")).not.toBeChecked(); // fresh consent; no duplicate payment
      expect(await stored(p)).toMatchObject({ checkout: null, payment: null });
    },
  },
  {
    scenario: "activation_ready",
    initial: "You're in. Check your email.",
    seed: { payment: "confirmed", setup: "ready", email: "sent", checkout: "paid" },
    action: "Resend access email",
    act: (p) => p.getByTestId("resend").click(),
    next: "You're in. Check your email.",
    nextCheck: async (p) => {
      await expect(p.getByRole("status").filter({ hasText: "Sent again at" })).toBeVisible();
      await expect(p.getByTestId("activation-refresh")).toHaveCount(0);
    },
  },
];

for (const r of ROWS) {
  test(`${r.scenario}: Load shows it as named, stays put, then "${r.action}" → ${r.next}`, async ({ page }) => {
    await page.goto("/demo/register/plan");
    await page.evaluate(() => sessionStorage.clear());
    await page.goto("/demo/register/plan");
    await load(page, r.scenario);
    await expect(page).toHaveURL(/\/demo\/activation$/);
    await expect(h1(page)).toHaveText(r.initial);
    const seeded = await stored(page);
    expect(seeded).toMatchObject({ scenario: r.scenario, plan: "ready", ...r.seed });
    // Not silently advanced or reset: still the named state after waiting and after a reload.
    await page.waitForTimeout(2500);
    await expect(h1(page)).toHaveText(r.initial);
    await page.reload();
    await expect(h1(page)).toHaveText(r.initial);
    expect(await stored(page)).toEqual(seeded);
    await r.act(page);
    await expect(h1(page)).toHaveText(r.next);
    if (r.nextCheck) await r.nextCheck(page);
    evidence({ scenario: r.scenario, selected: "Registration scenario → Load", initial: r.initial, seed: seeded, stableAfterWaitAndReload: true, customerAction: r.action, next: r.next, final: await stored(page) });
  });
}

test("keyboard only: open Demo controls, choose a scenario, Load, then Refresh status", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/demo/register/plan");
  const summary = page.locator("summary", { hasText: "Demo controls" });
  for (let i = 0; i < 20 && !(await summary.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const select = page.locator("#demo-reg-scenario");
  await expect(select).toBeFocused();
  // Closed native select: arrow keys change the value without a pointer.
  for (let i = 0; i < 30 && (await select.inputValue()) !== "activation_waiting"; i++) await page.keyboard.press("ArrowDown");
  await expect(select).toHaveValue("activation_waiting");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Load", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(h1(page)).toHaveText("Waiting for payment confirmation");
  const refresh = page.getByTestId("activation-refresh");
  for (let i = 0; i < 60 && !(await refresh.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(refresh).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(h1(page)).toHaveText("Payment confirmed. Setting up your pharmacies…");
});

test("mobile 375 + desktop 1440, light/dark: open demo strip and each activation state pass Gate M and contrast", async ({ page }) => {
  test.setTimeout(180_000);
  for (const theme of THEMES) {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/demo/register/plan");
      await setTheme(page, theme);
      await page.reload();
      await openControls(page);
      const stripGate = await measure(page, "/demo/register/plan [demo controls open]", width, theme);
      record("gate-m-activation-scenarios.jsonl", stripGate);
      assertGate(stripGate);
      await page.getByTestId("public-demo-strip").screenshot({ path: `test-results/demo-strip_${theme}_${width}.png` });
      for (const r of ROWS) {
        await load(page, r.scenario);
        await expect(h1(page)).toHaveText(r.initial);
        await page.locator("summary", { hasText: "Demo controls" }).click(); // close the strip for the page shot
        const g = await measure(page, `/demo/activation [${r.scenario}]`, width, theme);
        record("gate-m-activation-scenarios.jsonl", g);
        assertGate(g);
        const fails = textFailures(await textContrast(page));
        recordContrast("contrast-activation-scenarios.jsonl", { screen: `/demo/activation [${r.scenario}]`, width, theme, fails });
        expect.soft(fails, `${r.scenario} ${theme} ${width}`).toEqual([]);
        if (width === 375) await page.screenshot({ path: `test-results/activation_${r.scenario}_${theme}_375.png`, fullPage: true });
      }
    }
  }
});
