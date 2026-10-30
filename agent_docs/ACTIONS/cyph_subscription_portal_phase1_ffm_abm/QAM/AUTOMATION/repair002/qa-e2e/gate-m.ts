import { appendFileSync, mkdirSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

export const WIDTHS = [375, 767, 768, 1023, 1024, 1440] as const;
export const THEMES = ["light", "dark"] as const;

export async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, theme);
}

export interface GateResult {
  route: string;
  width: number;
  theme: string;
  scrollWidth: number;
  clientWidth: number;
  smallTargets: string[];
}

/**
 * Measure one rendered page: no horizontal overflow, and every visible
 * button / input / select / control-styled link in the page chrome and main is
 * >= 44px tall. Inline text links inside sentences are exempt (WCAG 2.5.8 inline
 * exception) and recognised by the `portal-link` class without a min-height.
 */
export async function measure(page: Page, route: string, width: number, theme: string): Promise<GateResult> {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const small: string[] = [];
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("button, input:not([type=checkbox]):not([type=radio]):not([type=hidden]), select, a[href]"));
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || style.visibility === "hidden") continue;
      if (el.closest("[aria-hidden=true]")) continue;
      const inlineLink = el.tagName === "A" && el.classList.contains("portal-link") && !/min-h-\[44px\]/.test(el.className);
      const inlineButtonLink = el.tagName === "BUTTON" && el.classList.contains("portal-link") && !/min-h-\[44px\]/.test(el.className);
      const skip = el.textContent?.trim() === "Skip to content";
      if (inlineLink || inlineButtonLink || skip) continue;
      if (r.height < 43.5) small.push(`${el.tagName.toLowerCase()}:"${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40)}" h=${Math.round(r.height)}`);
    }
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, small };
  });
  return { route, width, theme, scrollWidth: result.scrollWidth, clientWidth: result.clientWidth, smallTargets: result.small };
}

/** Append every measurement (survives worker restarts after a failure). */
export function record(file: string, r: GateResult) {
  mkdirSync("test-results", { recursive: true });
  appendFileSync(`test-results/${file}`, JSON.stringify(r) + "\n");
}

export function assertGate(r: GateResult) {
  expect.soft(r.scrollWidth, `${r.route} @${r.width} ${r.theme}: horizontal overflow`).toBeLessThanOrEqual(r.clientWidth);
  expect.soft(r.smallTargets, `${r.route} @${r.width} ${r.theme}: targets < 44px`).toEqual([]);
}

/** Mobile menu: opens, Escape closes, focus returns to the hamburger. */
export async function checkSheet(page: Page) {
  const trigger = page.getByTestId("menu-trigger");
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
}
