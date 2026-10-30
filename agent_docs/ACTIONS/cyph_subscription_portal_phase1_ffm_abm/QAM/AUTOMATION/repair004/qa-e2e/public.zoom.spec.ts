import { expect, test } from "@playwright/test";
import { setTheme, THEMES } from "./gate-m";

// REPAIR_001: 200% zoom EMULATION for public screens. A 1440 CSS-px window at
// 200% browser zoom lays out at 720 CSS px with device pixel ratio 2; this
// context reproduces that geometry (it is not the browser's zoom setting).
test.use({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });

for (const route of ["/demo/register/plan", "/demo/register/owner", "/login"]) {
  test(`200% zoom emulation ${route}: no horizontal overflow, primary action reachable`, async ({ page }) => {
    for (const theme of THEMES) {
      await page.goto(route);
      await setTheme(page, theme);
      await page.reload();
      await page.waitForLoadState("networkidle");
      const g = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, dpr: window.devicePixelRatio }));
      expect(g.dpr).toBe(2);
      expect(g.sw).toBeLessThanOrEqual(g.cw);
      const action = page.getByRole("button", { name: /^(Continue|Sign in)$/ }).first();
      await action.scrollIntoViewIfNeeded();
      await expect(action).toBeInViewport();
    }
  });
}
