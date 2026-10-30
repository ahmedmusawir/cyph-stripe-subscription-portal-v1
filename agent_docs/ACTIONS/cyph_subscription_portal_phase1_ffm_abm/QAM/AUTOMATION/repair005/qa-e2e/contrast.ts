import { appendFileSync, mkdirSync } from "node:fs";
import type { Page } from "@playwright/test";

// REPAIR_001 (Q2-F01) rendered-contrast probe. Same compositing method as the
// QA scan: walk every ancestor, alpha-blend background colours onto white,
// blend the text colour onto that, WCAG 2.x ratio. Normal text needs 4.5:1,
// large text (≥24px, or ≥18.66px bold) 3:1. Disabled controls are recorded but
// exempt (WCAG 1.4.3 "inactive components"). Elements under an ancestor with
// opacity < 1 are flagged so they are never silently counted as passing.
export interface TextRow {
  tag: string;
  text: string;
  cls: string;
  ratio: number;
  required: number;
  disabled: boolean;
  faded: boolean;
  font: string;
}
export interface BoundaryRow {
  kind: "input-boundary" | "focus-ring";
  tag: string;
  label: string;
  ratio: number;
  required: number;
}

export async function textContrast(page: Page): Promise<TextRow[]> {
  return page.evaluate(() => {
    const rgb = (s: string) => {
      const a = s.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
      return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1];
    };
    const blend = (f: number[], b: number[]) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3]));
    const lum = (a: number[]) =>
      a
        .map((v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        })
        .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const rows: TextRow[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      if (["SCRIPT", "STYLE", "OPTION", "svg", "path"].includes(el.tagName)) continue;
      const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim());
      if (!own) continue;
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const st = getComputedStyle(el);
      if (st.visibility === "hidden" || el.closest("[aria-hidden=true],.sr-only")) continue;
      const chain: HTMLElement[] = [];
      for (let a: HTMLElement | null = el; a; a = a.parentElement) chain.unshift(a);
      let bg = [255, 255, 255];
      let faded = false;
      for (const a of chain) {
        const cs = getComputedStyle(a);
        bg = blend(rgb(cs.backgroundColor), bg);
        if (parseFloat(cs.opacity) < 1) faded = true;
      }
      const fg = blend(rgb(st.color), bg);
      const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
      const size = parseFloat(st.fontSize);
      const large = size >= 24 || (size >= 18.66 && parseInt(st.fontWeight) >= 700);
      const masked = !!el.closest("[data-testid=account-menu],[data-testid=account-demo-strip] summary");
      rows.push({
        tag: el.tagName,
        text: masked ? "[real identity masked]" : (el.textContent || "").trim().slice(0, 40),
        cls: String(el.className).slice(0, 90),
        ratio: Math.round(ratio * 100) / 100,
        required: large ? 3 : 4.5,
        disabled: !!el.closest(":disabled,[aria-disabled=true]"),
        faded,
        font: st.fontSize,
      });
    }
    return rows;
  });
}

/** Text-entry boundaries (input/select/textarea) against the surface they sit on: 3:1 (WCAG 1.4.11). */
export async function inputBoundaries(page: Page): Promise<BoundaryRow[]> {
  return page.evaluate(() => {
    const rgb = (s: string) => {
      const a = s.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
      return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1];
    };
    const blend = (f: number[], b: number[]) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3]));
    const lum = (a: number[]) =>
      a
        .map((v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        })
        .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const surface = (el: HTMLElement | null) => {
      const chain: HTMLElement[] = [];
      for (let a = el; a; a = a.parentElement) chain.unshift(a);
      let bg = [255, 255, 255];
      for (const a of chain) bg = blend(rgb(getComputedStyle(a).backgroundColor), bg);
      return bg;
    };
    const rows: BoundaryRow[] = [];
    const sel = "input:not([type=checkbox]):not([type=radio]):not([type=hidden]),select,textarea";
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || el.closest(":disabled")) continue;
      const outer = surface(el.parentElement);
      const border = blend(rgb(getComputedStyle(el).borderTopColor), outer);
      const ratio = (Math.max(lum(border), lum(outer)) + 0.05) / (Math.min(lum(border), lum(outer)) + 0.05);
      rows.push({
        kind: "input-boundary",
        tag: el.tagName,
        label: el.id || el.getAttribute("name") || "",
        ratio: Math.round(ratio * 100) / 100,
        required: 3,
      });
    }
    return rows;
  });
}

/**
 * Keyboard focus ring: Tab through the first `steps` stops; for each focused
 * element read the ring colour (box-shadow/outline) and compare it with the
 * surface around the control (3:1, WCAG 1.4.11 state indicator).
 */
export async function focusRings(page: Page, steps = 8): Promise<BoundaryRow[]> {
  const rows: BoundaryRow[] = [];
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press("Tab");
    const row = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const rgb = (s: string) => {
        const a = s.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
        return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1];
      };
      const blend = (f: number[], b: number[]) => [0, 1, 2].map((k) => f[k] * f[3] + b[k] * (1 - f[3]));
      const lum = (a: number[]) =>
        a
          .map((v) => {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          })
          .reduce((s, v, k) => s + v * [0.2126, 0.7152, 0.0722][k], 0);
      // A radio's indicator is its card label's focus-within ring.
      const src = el instanceof HTMLInputElement && el.type === "radio" ? (el.closest("label") as HTMLElement) ?? el : el;
      const chain: HTMLElement[] = [];
      for (let a = src.parentElement; a; a = a.parentElement) chain.unshift(a);
      let outer = [255, 255, 255];
      for (const a of chain) outer = blend(rgb(getComputedStyle(a).backgroundColor), outer);
      const st = getComputedStyle(src);
      // Tailwind ring = last non-transparent colour in the box-shadow list.
      const shadows = (st.boxShadow.match(/rgba?\([^)]*\)/g) || []).map(rgb).filter((c) => c[3] > 0);
      const ringColor = shadows.length ? shadows[shadows.length - 1] : st.outlineStyle !== "none" ? rgb(st.outlineColor) : null;
      const label = el.closest("[data-testid=account-menu],[data-testid=account-demo-strip] summary")
        ? "[real identity region]"
        : (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40);
      if (!ringColor) return { kind: "focus-ring" as const, tag: el.tagName, label, ratio: 0, required: 3 };
      const ring = blend(ringColor, outer);
      const ratio = (Math.max(lum(ring), lum(outer)) + 0.05) / (Math.min(lum(ring), lum(outer)) + 0.05);
      return {
        kind: "focus-ring" as const,
        tag: el.tagName,
        label,
        ratio: Math.round(ratio * 100) / 100,
        required: 3,
      };
    });
    if (row) rows.push(row);
  }
  return rows;
}

export function textFailures(rows: TextRow[]) {
  return rows.filter((r) => !r.disabled && r.ratio < r.required);
}

export function recordContrast(file: string, entry: unknown) {
  mkdirSync("test-results", { recursive: true });
  appendFileSync(`test-results/${file}`, JSON.stringify(entry) + "\n");
}
