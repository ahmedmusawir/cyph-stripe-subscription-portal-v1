import { expect, test } from "@playwright/test";

// LAST: the inherited logout route calls Supabase signOut() with its default
// GLOBAL scope, which ends every session of this account. Run once, at the end.
test("logout clears all demo state and re-blocks account management", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/demo/register/plan"); // put something in the public namespace too
  await page.goto("/dashboard");
  const before = await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("cyph-portal-demo:")));
  expect(before.length).toBeGreaterThan(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByTestId("account-menu").click();
  await page.getByTestId("sign-out").click();
  await expect(page).toHaveURL(/\/login$/);
  const after = await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("cyph-portal-demo:")));
  expect(after).toEqual([]);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
