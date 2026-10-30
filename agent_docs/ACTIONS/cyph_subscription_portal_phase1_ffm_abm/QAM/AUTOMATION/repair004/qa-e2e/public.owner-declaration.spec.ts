import { expect, test, type Page } from "@playwright/test";
import { assertGate, measure, setTheme, THEMES } from "./gate-m";

// R-011: owner-only registration with an explicit owner declaration (anonymous).
const KEY = "cyph-portal-demo:v1:public";
const DECLARATION = /I confirm that I am the pharmacy owner and am registering this account to manage its subscription and pharmacies\./;

async function fresh(page: Page) {
  await page.goto("/demo/register/plan");
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/demo/register/plan");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/demo\/register\/owner/);
}
async function fillOwner(page: Page) {
  await page.getByLabel("First name").fill("Jordan");
  await page.getByLabel("Last name").fill("Ellis");
  await page.getByLabel("Work email").fill("jordan@demo-pharmacy.example");
  await page.getByLabel("Mobile phone").fill("(555) 010-0144");
}

test("no job-title dropdown; declaration is unchecked and required; missing it blocks progression", async ({ page }) => {
  await fresh(page);
  await expect(page.getByLabel("Your role")).toHaveCount(0);
  await expect(page.locator("#role")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("Pharmacist in charge");
  const box = page.getByRole("checkbox", { name: DECLARATION });
  await expect(box).not.toBeChecked();
  await fillOwner(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/demo\/register\/owner/);
  await expect(page.locator("#owner-declaration-err")).toHaveText("Confirm that you are the pharmacy owner to continue.");
  await expect(box).toHaveAttribute("aria-invalid", "true");
  const summaryLink = page.getByRole("link", { name: /Owner declaration/ });
  await expect(summaryLink).toBeVisible();
  // Deep links past the owner step are refused while the declaration is missing.
  await page.goto("/demo/register/review");
  await expect(page).toHaveURL(/\/demo\/register\/(owner|plan)/);
});

test("accepted declaration survives Back and reload; separate from terms/payment consent", async ({ page }) => {
  await fresh(page);
  await fillOwner(page);
  await page.getByRole("checkbox", { name: DECLARATION }).check();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page).toHaveURL(/\/demo\/register\/plan/);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("checkbox", { name: DECLARATION })).toBeChecked();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: DECLARATION })).toBeChecked();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/pharmacies\?store=1/);
  const stored = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k) || "null"), KEY);
  expect(stored.state.s.draft.owner.ownerDeclarationAccepted).toBe(true);
  expect(stored.state.s.draft.owner).not.toHaveProperty("businessRole");
  // Terms / recurring-charge consent are untouched by the declaration.
  expect(stored.state.s.draft.consents).toMatchObject({ termsAccepted: false, recurringChargeAccepted: false });
});

test("a pre-amendment (v1) draft does not acquire acceptance", async ({ page }) => {
  await page.goto("/demo/register/plan");
  await page.locator("summary", { hasText: "Demo controls" }).click();
  await page.locator("#demo-reg-scenario").selectOption("prefilled_two_store");
  await page.getByRole("button", { name: "Load" }).click();
  await page.waitForLoadState("networkidle");
  // Rewrite the stored draft as the old shape: job title, no declaration, storage version 1.
  await page.evaluate((k) => {
    const raw = JSON.parse(sessionStorage.getItem(k)!);
    delete raw.state.s.draft.owner.ownerDeclarationAccepted;
    raw.state.s.draft.owner.businessRole = "owner";
    raw.version = 1;
    sessionStorage.setItem(k, JSON.stringify(raw));
  }, KEY);
  await page.goto("/demo/register/review");
  await expect(page).toHaveURL(/\/demo\/register\/owner/);
  const box = page.getByRole("checkbox", { name: DECLARATION });
  await expect(box).not.toBeChecked();
  await expect(page.getByLabel("First name")).toHaveValue("Jordan"); // other details kept
  const stored = await page.evaluate((k) => JSON.parse(sessionStorage.getItem(k) || "null"), KEY);
  expect(stored.version).toBe(3); // public storage v3 since R-013 (checkout scope)
  expect(stored.state.s.draft.owner.ownerDeclarationAccepted).toBe(false);
  expect(stored.state.s.draft.owner).not.toHaveProperty("businessRole");
});

test("Me / Someone else copy keeps ownership and billing with the registering owner", async ({ page }) => {
  await fresh(page);
  await fillOwner(page);
  await page.getByRole("checkbox", { name: DECLARATION }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/pharmacies\?store=1/);
  const main = page.locator("main");
  await expect(main).toContainText("Each store has one designated admin");
  await expect(main).toContainText("you keep account ownership and billing");
  await expect(page.getByRole("radio", { name: /^Me/ })).toBeVisible();
  await expect(main).toContainText("This doesn't transfer ownership, billing or permission to buy more stores.");
});

test("keyboard + mobile + both themes: declaration usable at 375 and 1440", async ({ page }) => {
  for (const theme of THEMES)
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await fresh(page);
      await setTheme(page, theme);
      await page.reload();
      const box = page.locator("#owner-declaration");
      await page.getByLabel("Mobile phone").focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(box).toBeFocused();
      await page.keyboard.press("Space");
      await expect(box).toBeChecked();
      const label = await page.locator("label[for=owner-declaration]").boundingBox();
      expect(label!.height).toBeGreaterThanOrEqual(44);
      assertGate(await measure(page, "/demo/register/owner#declaration", width, theme));
    }
});
