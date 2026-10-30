import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { assertGate, checkSheet, measure, record, setTheme, THEMES, WIDTHS, type GateResult } from "./gate-m";

// Gate M on every PUBLIC layout (anonymous). Each route is visited in a known
// state loaded through the public Demo controls' scenario seeds (sessionStorage).
const results: GateResult[] = [];

async function seed(page: Page, scenario: string) {
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption(scenario);
  await page.getByRole("button", { name: "Load" }).click();
}

const SCREENS: { route: string; scenario: string; prepare?: (page: Page) => Promise<void> }[] = [
  { route: "/demo/register/plan", scenario: "prefilled_two_store" },
  { route: "/demo/register/owner", scenario: "prefilled_two_store" },
  { route: "/demo/register/pharmacies?store=2", scenario: "prefilled_two_store" },
  { route: "/demo/register/review", scenario: "prefilled_three_store" },
  { route: "/demo/activation", scenario: "activation_ready" },
  { route: "/demo/activation", scenario: "activation_delayed" },
  { route: "/demo/checkout-incomplete", scenario: "checkout_unknown" },
  { route: "/demo/access-link", scenario: "link_expired" },
  { route: "/demo/references/email?variant=store_admin", scenario: "prefilled_two_store" },
  { route: "/login", scenario: "fresh" },
];

for (const screen of SCREENS) {
  test(`Gate M ${screen.route} [${screen.scenario}]`, async ({ page }) => {
    test.setTimeout(120_000);
    await seed(page, screen.scenario);
    for (const theme of THEMES) {
      await setTheme(page, theme);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(screen.route);
        await page.waitForLoadState("networkidle");
        await expect(page.getByTestId("view-skeleton")).toHaveCount(0);
        const r = await measure(page, screen.route, width, theme);
        results.push(r);
        record("gate-m-public.jsonl", r);
        assertGate(r);
        if (width < 768) await checkSheet(page);
        else await expect(page.getByTestId("menu-trigger")).toBeHidden();
      }
    }
  });
}

test("Gate M checkout stand-in and review split at 1024", async ({ page }) => {
  await seed(page, "prefilled_two_store");
  await page.goto("/demo/register/review");
  await page.setViewportSize({ width: 1024, height: 900 });
  const formBox = await page.locator("section[aria-labelledby=own-h]").boundingBox();
  const asideBox = await page.locator("aside[aria-labelledby=sum-h]").boundingBox();
  expect(asideBox!.x).toBeGreaterThan(formBox!.x + formBox!.width - 1); // side by side at lg
  await page.setViewportSize({ width: 1023, height: 900 });
  const asideBelow = await page.locator("aside[aria-labelledby=sum-h]").boundingBox();
  const formBelow = await page.locator("section[aria-labelledby=own-h]").boundingBox();
  expect(asideBelow!.y).toBeGreaterThan(formBelow!.y); // stacked below lg

  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible({ timeout: 5000 });
  for (const theme of THEMES)
    for (const width of WIDTHS) {
      await setTheme(page, theme);
      await page.setViewportSize({ width, height: 900 });
      const r = await measure(page, "/demo/stripe (preview)", width, theme);
      results.push(r);
        record("gate-m-public.jsonl", r);
      assertGate(r);
    }
});

test("keyboard: plan → owner form reachable and submittable without a mouse", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "More pharmacies" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#stores")).toHaveText("2");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/owner/);
  await page.getByLabel("First name").focus();
  for (const v of ["Jordan", "Ellis", "jordan@demo-pharmacy.example", "(555) 010-0144"]) {
    await page.keyboard.type(v);
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("ArrowDown"); // native select: choose first role
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/pharmacies\?store=1/);
});

test("Additional narrow-width reflow ONLY (not actual zoom)", async ({ page }) => {
  // Browser zoom cannot be driven from Playwright; 200% zoom of a 1440/1280px
  // window lays out like a 720/640 CSS-px viewport, so measure those widths.
  await seed(page, "prefilled_two_store");
  for (const route of ["/demo/register/review", "/demo/register/plan"]) {
    for (const width of [720, 640]) {
      await page.setViewportSize({ width, height: 450 });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const r = await measure(page, `${route} (200% proxy)`, width, "dark");
      results.push(r);
        record("gate-m-public.jsonl", r);
      assertGate(r);
    }
  }
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test.afterAll(() => {
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/gate-m-public.json", JSON.stringify(results, null, 2));
});
