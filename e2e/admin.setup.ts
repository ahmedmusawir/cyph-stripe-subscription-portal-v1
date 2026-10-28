import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test as setup } from "@playwright/test";
import { adminCredentials } from "./helpers";

// One REAL sign-in through the real /login UI with the single authorized admin
// pair from ignored `.env.qa.local` (R-009). Values are never logged; the saved
// browser state goes to ignored `.auth/` and is deleted after the run.
setup("real admin login", async ({ page }) => {
  const creds = adminCredentials();
  setup.skip(!creds, "BLOCKED: .env.qa.local admin credentials absent");
  await page.goto("/login");
  await page.getByLabel("Work email").fill(creds!.email);
  await page.getByLabel("Password").fill(creds!.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Your subscription" })).toBeVisible();
  mkdirSync(".auth", { recursive: true });
  await page.context().storageState({ path: ".auth/admin.json" });
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/signin-count.txt", "real sign-ins performed by admin.setup: 1\n", { flag: "a" });
});
