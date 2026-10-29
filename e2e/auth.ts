import { appendFileSync, mkdirSync } from "node:fs";
import { test as base, expect, type BrowserContext } from "@playwright/test";
import { adminCredentials } from "./helpers";

// REAL admin session kept IN MEMORY only (REPAIR_001): one sign-in per worker
// through the real /login UI with the single authorized pair from ignored
// `.env.qa.local`. No storage-state file is written. The inherited logout is a
// GLOBAL sign-out, so every account context aborts /api/auth/logout unless a
// test opts in with `allowLogout` (only logout.final does).
type StorageState = Awaited<ReturnType<BrowserContext["storageState"]>>;

export const test = base.extend<{ allowLogout: boolean }, { adminState: StorageState }>({
  allowLogout: [false, { option: true }],
  adminState: [
    async ({ browser }, use, workerInfo) => {
      const creds = adminCredentials();
      if (!creds) throw new Error("BLOCKED: .env.qa.local admin credentials absent");
      const baseURL = workerInfo.project.use.baseURL;
      const ctx = await browser.newContext({ baseURL });
      await ctx.route("**/api/auth/logout", (r) => r.abort());
      const page = await ctx.newPage();
      await page.goto("/login");
      await page.getByLabel("Work email").fill(creds!.email);
      await page.getByLabel("Password").fill(creds!.password);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20000 });
      await expect(page.getByRole("heading", { name: "Your subscription" })).toBeVisible({ timeout: 20000 });
      mkdirSync("test-results", { recursive: true });
      appendFileSync("test-results/signin-count.txt", "real sign-in (in-memory fixture)\n");
      const state = await ctx.storageState();
      await ctx.close();
      await use(state);
    },
    { scope: "worker" },
  ],
  storageState: async ({ adminState }, use) => {
    await use(adminState);
  },
  context: async ({ context, allowLogout }, use) => {
    if (!allowLogout) await context.route("**/api/auth/logout", (r) => r.abort());
    await use(context);
  },
});

export { expect };
