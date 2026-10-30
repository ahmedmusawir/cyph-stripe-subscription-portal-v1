import { test } from "@playwright/test";
import fs from "node:fs";
// R4-N01 observation (engineering): does Review offer to close a processing payment?
const KEY = "cyph-portal-demo:v1:public";
const OUT = process.env.OUT!;
test("observation: does Review offer to close a processing payment, and can it then be paid again?", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption("prefilled_one_store");
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await page.locator("#c1").check();
  await page.locator("#c2").check();
  await page.getByTestId("continue-payment").click();
  await page.getByRole("button", { name: "Payment processing → activation (waiting)", exact: true }).click();
  await page.waitForURL("**/demo/activation");
  await page.goto("/demo/register/review");
  await page.waitForTimeout(800);
  const offered = await page.getByRole("button", { name: "Edit my details instead" }).isVisible();
  let after: unknown = null;
  if (offered) {
    await page.getByRole("button", { name: "Edit my details instead" }).click();
    await page.waitForTimeout(800);
    after = await page.evaluate((k) => { const s = JSON.parse(sessionStorage.getItem(k)!).state.s; return { checkout: s.checkout?.status ?? null, payment: s.activation?.paymentState ?? null, due: (document.querySelector('[data-testid=due-today]') as HTMLElement | null)?.innerText ?? null }; }, KEY);
  }
  fs.writeFileSync(`${OUT}/eng-submitted-review.json`, JSON.stringify({ offered, after }, null, 2));
  await page.screenshot({ path: `${OUT}/eng-submitted-review.png`, fullPage: true });
});
