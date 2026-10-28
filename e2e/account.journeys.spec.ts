import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { assertGate, checkSheet, measure, record, setTheme, THEMES, WIDTHS, type GateResult } from "./gate-m";
import { trackHosts } from "./helpers";

// REAL admin session (storage state from admin.setup). The account shown is
// SYNTHETIC. Never screenshot or log the real identity.
const gate: GateResult[] = [];

async function controls(page: Page) {
  const summary = page.locator("summary", { hasText: "Demo controls" });
  if (!(await page.locator("details[open]").count())) await summary.click();
}
async function scenario(page: Page, id: string) {
  await page.goto("/dashboard");
  await controls(page);
  await page.locator("#demo-acct-scenario").selectOption(id);
  await page.getByRole("button", { name: "Load" }).click();
  await page.waitForLoadState("networkidle");
}
async function addStore(page: Page, n: number, other = true) {
  await page.goto("/demo/stores/add");
  await page.getByLabel("Pharmacy name").fill(`Example Added Pharmacy ${n}`);
  await page.getByLabel("Street address").fill("2 Test Road");
  await page.getByLabel("City").fill("Springfield");
  await page.getByLabel("State").selectOption("Alabama");
  await page.getByLabel("ZIP").fill("00000");
  await page.getByLabel("NCPDP number").fill(`000002${n}`);
  await page.getByLabel("NPI").fill(`000000002${n}`);
  await page.getByLabel("Store phone").fill("(555) 010-0188");
  await page.getByLabel("Pharmacy software").selectOption("Pioneer");
  if (other) {
    await page.getByLabel("Someone else").check();
    await page.getByLabel("Admin's full name").fill("Sam Ortiz");
    await page.getByLabel("Admin's email").fill("sam@demo-pharmacy.example");
  } else {
    await page.getByRole("radio", { name: /^Me/ }).check();
  }
  await page.getByTestId("review-price").click();
  await expect(page).toHaveURL(/\/demo\/stores\/confirm/);
  await expect(page.getByTestId("charged-today")).toHaveText("$24.50");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await controls(page);
  await page.getByRole("button", { name: "Reset account demo" }).click();
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
});

test("real admin reaches account management; synthetic account is labelled", async ({ page }) => {
  const hosts = trackHosts(page);
  await expect(page.getByTestId("account-demo-strip")).toContainText("(real account)");
  await expect(page.getByTestId("account-demo-strip")).toContainText("Demo account");
  await expect(page.getByTestId("store-count")).toHaveText("2");
  // Protected navigation through normal links.
  await page.getByRole("link", { name: "Back to OwedBook" }).first().click();
  await expect(page.getByTestId("owedbook-owner")).toBeVisible();
  await page.getByTestId("owedbook-add-store").click();
  await expect(page).toHaveURL(/\/demo\/stores\/add$/);
  // A signed-in admin can still use public registration.
  await page.goto("/demo/register/plan");
  await expect(page.getByRole("heading", { name: "Choose your plan" })).toBeVisible();
  // /login skips straight in for an admin session.
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  expect([...hosts].filter((h) => h !== "localhost:3001")).toEqual([]);
});

test("add store 2 → 3: $197.00, three distinct stores, invitation pending", async ({ page }) => {
  await addStore(page, 1);
  await expect(page.getByTestId("new-monthly")).toHaveText("$197.00");
  await page.getByTestId("confirm-add").click();
  await expect(page.getByTestId("consent-error")).toBeFocused();
  await page.locator("#pc").check();
  // Double click: one operation, one store.
  await page.getByTestId("confirm-add").dblclick();
  await expect(page).toHaveURL(/\/demo\/stores\/result$/);
  await expect(page.getByTestId("result-added")).toContainText("Example Added Pharmacy 1 is added");
  await expect(page.getByTestId("store-status")).toContainText("Pending");
  await page.goto("/dashboard");
  await expect(page.getByTestId("store-count")).toHaveText("3");
  await expect(page.getByTestId("monthly-total")).toHaveText("$197.00");
});

test("1 → 2 then failure leaves the plan unchanged; unknown blocks a second attempt", async ({ page }) => {
  await scenario(page, "one_store_active");
  await expect(page.getByTestId("monthly-total")).toHaveText("$99.00");
  await controls(page);
  await page.locator("#demo-next-add").selectOption("failed");
  await addStore(page, 2, false);
  await page.locator("#pc").check();
  await page.getByTestId("confirm-add").click();
  await expect(page.getByText("Your card on file was declined")).toBeVisible();
  await expect(page.getByText("still 1 pharmacy, $99.00")).toBeVisible();

  await controls(page);
  await page.locator("#demo-next-add").selectOption("unknown");
  await page.getByTestId("confirm-add").click();
  await expect(page.getByText("Payment pending with Stripe").first()).toBeVisible();
  await expect(page.getByTestId("confirm-add")).toBeDisabled();
  await controls(page);
  await page.getByRole("button", { name: "Succeeded" }).click();
  await expect(page).toHaveURL(/\/demo\/stores\/result$/);
  await page.goto("/dashboard");
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
});

test("paid but setup needs attention: one increment, invitation held", async ({ page }) => {
  await controls(page);
  await page.locator("#demo-next-add").selectOption("attention");
  await addStore(page, 1);
  await page.locator("#pc").check();
  await page.getByTestId("confirm-add").click();
  await expect(page.getByTestId("result-attention")).toContainText("Don't add it again");
  await expect(page.getByTestId("store-status")).toContainText("Held");
  await page.goto("/dashboard");
  await expect(page.getByTestId("store-count")).toHaveText("3");
});

test("store admin and member personas get the owner-contact view, not billing data", async ({ page }) => {
  for (const persona of ["store_admin", "member"]) {
    await controls(page);
    await page.locator("#demo-persona").selectOption(persona);
    await expect(page.getByTestId("denied-view")).toBeVisible();
    await expect(page.locator("main")).not.toContainText("$148.00");
    await page.goto("/demo/stores/add");
    await expect(page.getByText("Only the billing owner can add a store")).toBeVisible();
    await page.goto("/dashboard");
  }
});

test("Stripe portal return: refreshing → cancellation scheduled; handoff error retry", async ({ page }) => {
  await page.getByTestId("cancel-in-stripe").click();
  await expect(page).toHaveURL(/mode=portal&purpose=cancel/);
  await page.getByTestId("portal-cancel").click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("dashboard-banners")).toContainText("Cancellation scheduled");
  await expect(page.getByTestId("add-store")).toBeDisabled();

  await scenario(page, "handoff_error");
  await page.getByTestId("manage-billing").click();
  await expect(page.getByText("We couldn't open Stripe's billing page")).toBeVisible();
  await page.getByTestId("handoff-retry").click();
  await expect(page).toHaveURL(/mode=portal&purpose=manage/);
  await page.getByTestId("portal-no-change").click();
  await expect(page.getByText("Nothing changed on this account")).toBeVisible();
});

test("reload keeps the account demo; reset restores baseline", async ({ page }) => {
  await scenario(page, "past_due");
  await page.reload();
  await expect(page.getByText("We couldn't collect your last payment")).toBeVisible();
  await controls(page);
  await page.getByRole("button", { name: "Reset account demo" }).click();
  await expect(page.getByText("We couldn't collect your last payment")).toHaveCount(0);
});

const ACCOUNT_SCREENS: { route: string; scenario: string }[] = [
  { route: "/dashboard", scenario: "two_store_active" },
  { route: "/dashboard", scenario: "past_due" },
  { route: "/dashboard", scenario: "no_pharmacies" },
  { route: "/demo/stores/add", scenario: "add_draft_restored" },
  { route: "/demo/references/owedbook", scenario: "two_store_active" },
  { route: "/demo/stripe?mode=portal&purpose=manage", scenario: "two_store_active" },
];
for (const s of ACCOUNT_SCREENS) {
  test(`Gate M account ${s.route} [${s.scenario}]`, async ({ page }) => {
    test.setTimeout(240_000); // 12 authenticated loads, each with a real session lookup
    await scenario(page, s.scenario);
    for (const theme of THEMES)
      for (const width of WIDTHS) {
        await setTheme(page, theme);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(s.route);
        await page.waitForLoadState("networkidle");
        const r = await measure(page, s.route, width, theme);
        gate.push(r);
        record("gate-m-account.jsonl", r);
        assertGate(r);
        if (width < 768 && !s.route.includes("stripe")) await checkSheet(page);
      }
  });
}

test("Gate M confirm + table/card switch at 768", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 767, height: 900 });
  await page.goto("/dashboard");
  await expect(page.locator("table")).toBeHidden();
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(page.locator("table")).toBeVisible();
  await addStore(page, 1);
  for (const theme of THEMES)
    for (const width of WIDTHS) {
      await setTheme(page, theme);
      await page.setViewportSize({ width, height: 900 });
      const r = await measure(page, "/demo/stores/confirm", width, theme);
      gate.push(r);
        record("gate-m-account.jsonl", r);
      assertGate(r);
    }
});

test("evidence screenshots (real identity masked)", async ({ page }) => {
  test.setTimeout(120_000);
  const shots: [string, string, string, number, "light" | "dark"][] = [
    ["account-billing_active_dark_desktop", "two_store_active", "/dashboard", 1440, "dark"],
    ["account-billing_active_light_mobile", "two_store_active", "/dashboard", 375, "light"],
    ["account-billing_past-due_dark_desktop", "past_due", "/dashboard", 1440, "dark"],
    ["owedbook_owner_light_desktop", "two_store_active", "/demo/references/owedbook", 1440, "light"],
  ];
  for (const [name, sc, route, width, theme] of shots) {
    await scenario(page, sc);
    await setTheme(page, theme);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `test-results/shots/${name}.png`,
      fullPage: true,
      mask: [page.getByTestId("account-menu"), page.getByTestId("account-demo-strip").locator("summary > span").nth(1)],
    });
  }
});

test.afterAll(() => {
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/gate-m-account.json", JSON.stringify(gate, null, 2));
});
