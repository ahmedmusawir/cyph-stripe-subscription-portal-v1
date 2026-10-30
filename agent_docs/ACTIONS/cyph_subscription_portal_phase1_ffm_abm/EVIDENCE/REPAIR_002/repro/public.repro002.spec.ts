import { expect, test, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";

// REPAIR_002 BEFORE-repair reproduction (owned scratch copy of 24cf075 only; not committed).
const KEY = "cyph-portal-demo:v1:public";
const OUT = process.env.REPRO_OUT!;
const snap = (page: Page) =>
  page.evaluate((k) => {
    const s = JSON.parse(sessionStorage.getItem(k)!).state.s;
    return { accepted: s.draft.owner.ownerDeclarationAccepted, quoteCleared: s.quote === null, checkout: s.checkout?.status ?? null, payment: s.activation?.paymentState ?? null };
  }, KEY);

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

async function payIfOffered(page: Page) {
  await page.waitForTimeout(1500);
  const offered = await page.getByTestId("outcome-paid").isVisible();
  if (offered) {
    await page.getByTestId("outcome-paid").click();
    await page.waitForURL("**/demo/activation");
  }
  return offered;
}

test("A: current UI — uncheck declaration, revisit /demo/stripe", async ({ page }) => {
  await openCheckout(page);
  await page.goto("/demo/register/owner");
  await page.locator("#owner-declaration").uncheck();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#owner-declaration-err")).toBeVisible();
  const afterContinue = await snap(page);
  await page.goto("/demo/stripe");
  const offered = await payIfOffered(page);
  const result = { afterContinue, paidControlAvailable: offered, final: await snap(page) };
  writeFileSync(`${OUT}/before-A-current-ui.json`, JSON.stringify(result, null, 2));
  if (offered) await page.screenshot({ path: `${OUT}/before-A-activation.png`, fullPage: true });
});

test("B: legacy v1 draft restored over a pending checkout", async ({ page }) => {
  await openCheckout(page);
  await page.evaluate((k) => {
    const v = JSON.parse(sessionStorage.getItem(k)!);
    delete v.state.s.draft.owner.ownerDeclarationAccepted;
    v.state.s.draft.owner.businessRole = "owner";
    v.version = 1;
    sessionStorage.setItem(k, JSON.stringify(v));
  }, KEY);
  await page.reload();
  const offered = await payIfOffered(page);
  writeFileSync(`${OUT}/before-B-legacy-browser.json`, JSON.stringify({ paidControlAvailable: offered, final: await snap(page) }, null, 2));
});

test("C: pharmacy edit while checkout open, then revisit /demo/stripe", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption("prefilled_one_store");
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await expect(page.getByTestId("checkout-preview")).toBeVisible();
  await page.goto("/demo/register/plan");
  await page.getByRole("button", { name: "More pharmacies" }).click();
  const afterEdit = await snap(page);
  await page.goto("/demo/stripe");
  const offered = await payIfOffered(page);
  const s = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k)!).state.s, KEY);
  writeFileSync(`${OUT}/before-C-edit-while-open.json`, JSON.stringify({ afterEdit, paidControlAvailable: offered, final: await snap(page), requested: s.draft.requestedStoreCount, entered: s.draft.pharmacies.filter((p: { name?: string }) => p?.name).length }, null, 2));
});
