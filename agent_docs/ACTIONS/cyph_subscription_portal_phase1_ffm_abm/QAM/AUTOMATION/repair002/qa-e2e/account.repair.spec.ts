import type { Page } from "@playwright/test";
import { expect, test } from "./auth";
import { focusRings, inputBoundaries, recordContrast, textContrast, textFailures } from "./contrast";
import { setTheme, THEMES } from "./gate-m";

// REPAIR_001 regressions on the REAL admin session (in memory; logout aborted).
// The account shown is SYNTHETIC. Never screenshot or log the real identity.

async function controls(page: Page) {
  const summary = page.locator("summary", { hasText: "Demo controls" });
  if ((await summary.count()) && !(await page.locator("details[open]").count())) await summary.click();
}
async function scenario(page: Page, id: string) {
  await page.goto("/dashboard");
  await controls(page);
  await page.locator("#demo-acct-scenario").selectOption(id);
  await page.getByRole("button", { name: "Load" }).click();
  await page.waitForLoadState("networkidle");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await controls(page);
  await page.getByRole("button", { name: "Reset account demo" }).click();
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
});

// ── Q2-F02 ──────────────────────────────────────────────────────────────────
test("F02: load error stays until Retry, survives navigation and reload, Retry recovers", async ({ page }) => {
  await page.goto("/dashboard");
  await controls(page);
  await page.locator("#demo-acct-scenario").selectOption("load_error");
  // Diagnostic: did the error view appear at all, even briefly?
  const seen = page.getByTestId("load-retry").waitFor({ timeout: 5000 }).then(() => true, () => false);
  await page.getByRole("button", { name: "Load" }).click();
  test.info().annotations.push({ type: "load-retry-seen-at-least-once", description: String(await seen) });
  await expect(page.getByTestId("load-retry")).toBeVisible();
  await page.waitForTimeout(1200); // past any second load the navigation could trigger
  await expect(page.getByTestId("load-retry")).toBeVisible();
  await expect(page.getByTestId("monthly-total")).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId("load-retry")).toBeVisible();
  await page.goto("/demo/references/owedbook");
  await page.goto("/dashboard");
  await expect(page.getByTestId("load-retry")).toBeVisible();

  await page.getByTestId("load-retry").click();
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
  await expect(page.getByTestId("store-count")).toHaveText("2");
  await page.reload();
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
  await expect(page.getByTestId("load-retry")).toHaveCount(0);
});

test("F02: Retry shows a busy state, then a coherent account (both themes)", async ({ page }) => {
  for (const theme of THEMES) {
    await scenario(page, "load_error");
    await setTheme(page, theme);
    const retry = page.getByTestId("load-retry");
    await expect(retry).toBeVisible();
    await retry.click();
    await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
    await expect(page.getByTestId("plan-summary")).toContainText("Active");
  }
});

// ── Q2-O04 ──────────────────────────────────────────────────────────────────
test("O04: approved pharmacies section, cards, count and refresh line (mobile + desktop)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/dashboard");
  const section = page.getByTestId("pharmacies-section");
  await expect(section).toBeVisible();
  // No enclosing panel around the section (approved: heading on the page surface).
  expect(await section.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("0px");
  // Plain count, right of the description (not a bordered pill).
  const count = page.getByTestId("pharmacy-count");
  await expect(count).toHaveText("2 of 2");
  expect(await count.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("0px");
  const cBox = (await count.boundingBox())!;
  const hBox = (await page.getByRole("heading", { name: "Pharmacies on this plan" }).boundingBox())!;
  expect(cBox.x).toBeGreaterThan(hBox.x + 150);
  // Cards: activation pill in the title row; two-column Store admin | Monthly; Invitation | action.
  const cards = page.getByTestId("pharmacy-card");
  await expect(cards).toHaveCount(2);
  const first = cards.nth(0);
  const name = (await first.getByText("Example Main Street Pharmacy", { exact: true }).boundingBox())!;
  const pill = (await first.getByTestId("card-activation").boundingBox())!;
  expect(Math.abs(pill.y - name.y)).toBeLessThan(12);
  expect(pill.x).toBeGreaterThan(name.x + 100);
  const admin = (await first.getByText("Store admin", { exact: true }).boundingBox())!;
  const monthly = (await first.getByText("Monthly", { exact: true }).boundingBox())!;
  expect(Math.abs(admin.y - monthly.y)).toBeLessThan(2);
  expect(monthly.x).toBeGreaterThan(admin.x + 100);
  const inv = (await first.getByText("Invitation", { exact: true }).boundingBox())!;
  const act = (await first.getByRole("link", { name: /Open in OwedBook/ }).boundingBox())!;
  expect(act.x).toBeGreaterThan(inv.x + 100);
  await expect(cards.nth(1)).toContainText("Sent 26 Oct");
  // Refresh line visible on the initial view; Refresh re-reads the summary.
  const line = page.getByTestId("refresh-line");
  await expect(line).toContainText("Last refreshed just now");
  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(line).toContainText("Last refreshed");
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");

  // Desktop: the table is the bordered card; same section/count treatment.
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("table")).toBeVisible();
  await expect(page.getByTestId("pharmacy-card").first()).toBeHidden();
  // table → overflow wrapper → bordered card wrapper (approved desktop table card)
  expect(await page.locator("[data-testid=pharmacies-section] table").evaluate((el) => getComputedStyle(el.parentElement!.parentElement!).borderTopWidth)).toBe("1px");
});

test("O04: returned-from-Stripe and refreshing variants of the refresh line", async ({ page }) => {
  await page.getByTestId("manage-billing").click();
  await expect(page).toHaveURL(/mode=portal&purpose=manage/);
  await page.getByTestId("portal-no-change").click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("refresh-line")).toContainText(/Refreshing…|after returning from Stripe/);
  await expect(page.getByTestId("refresh-line")).toContainText("after returning from Stripe");
});

// ── Mapped transient states (AC-04 evidence gap) ────────────────────────────
test("transient states are observable: loading, launching, saving, quote loading, confirming", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByTestId("dashboard-loading")).toBeVisible();
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");

  const manage = page.getByTestId("manage-billing");
  await manage.click();
  await expect(manage).toHaveAttribute("aria-busy", "true");
  await expect(page).toHaveURL(/mode=portal/);
  // The refreshing banner lives ~350ms: record it with a MutationObserver
  // installed before the click (client navigation keeps the document).
  await page.evaluate(() => {
    const w = window as unknown as { __refreshingSeen?: boolean };
    w.__refreshingSeen = false;
    new MutationObserver(() => {
      if (document.body.innerText.includes("Welcome back from Stripe — refreshing your summary")) w.__refreshingSeen = true;
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  });
  await page.getByTestId("portal-no-change").click();
  await expect(page.getByText("Nothing changed on this account")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __refreshingSeen?: boolean }).__refreshingSeen)).toBe(true);
  await expect(page.getByText("Nothing changed on this account")).toBeVisible();

  await page.goto("/demo/stores/add");
  await page.getByLabel("Pharmacy name").fill("Example Busy Pharmacy");
  await page.getByLabel("Street address").fill("3 Test Road");
  await page.getByLabel("City").fill("Springfield");
  await page.getByLabel("State").selectOption("Alabama");
  await page.getByLabel("ZIP").fill("00000");
  await page.getByLabel("NCPDP number").fill("0000031");
  await page.getByLabel("NPI").fill("0000000031");
  await page.getByLabel("Store phone").fill("(555) 010-0188");
  await page.getByLabel("Pharmacy software").selectOption("Pioneer");
  await page.getByRole("radio", { name: /^Me/ }).check();
  const review = page.getByTestId("review-price");
  await review.click();
  await expect(review).toHaveAttribute("aria-busy", "true");
  await expect(page).toHaveURL(/\/demo\/stores\/confirm/);
  await expect(page.getByTestId("add-quote")).toContainText(/Getting|Loading|price/i);
  await expect(page.getByTestId("charged-today")).toHaveText("$24.50");
  await page.locator("#pc").check();
  const confirm = page.getByTestId("confirm-add");
  await confirm.click();
  await expect(confirm).toHaveAttribute("aria-busy", "true");
  await expect(page).toHaveURL(/\/demo\/stores\/result$/);
});

// ── AC-23 evidence gap: account form completed by keyboard only ─────────────
type Focused = { id: string; type: string; testid: string };
async function tabTo(page: Page, match: (at: Focused) => boolean, max = 80) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const at = await page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement | null;
      return { id: el?.id ?? "", type: el?.type ?? "", testid: el?.getAttribute("data-testid") ?? "" };
    });
    if (match(at)) return at;
  }
  throw new Error("focus target not reached by Tab");
}

test("keyboard only: add store → confirm → result with no pointer input", async ({ page }) => {
  await page.goto("/demo/stores/add");
  await expect(page.getByLabel("Pharmacy name")).toBeVisible();
  const text: [string, string][] = [
    ["ph-name", "Example Keyboard Pharmacy"],
    ["ph-street", "4 Key Street"],
    ["ph-city", "Springfield"],
  ];
  for (const [id, value] of text) {
    await tabTo(page, (a) => a.id === id);
    await page.keyboard.type(value);
  }
  await tabTo(page, (a) => a.id === "ph-state");
  await page.keyboard.type("Alabama"); // native select typeahead, no pointer
  for (const [id, value] of [["ph-zip", "00000"], ["ph-ncpdp", "0000041"], ["ph-npi", "0000000041"], ["ph-phone", "(555) 010-0141"]]) {
    await tabTo(page, (a) => a.id === id);
    await page.keyboard.type(value);
  }
  await tabTo(page, (a) => a.id === "ph-software");
  await page.keyboard.type("Pioneer");
  // Store admin radio group: Tab lands on the group, arrow keys move, Space selects "Me".
  await tabTo(page, (a) => a.type === "radio");
  const me = page.getByRole("radio", { name: /^Me/ });
  for (let i = 0; i < 3 && !(await me.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await expect(me).toBeChecked();
  await tabTo(page, (a) => a.testid === "review-price");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/demo\/stores\/confirm/);
  await expect(page.getByTestId("charged-today")).toHaveText("$24.50");
  await tabTo(page, (a) => a.id === "pc");
  await page.keyboard.press("Space");
  await expect(page.locator("#pc")).toBeChecked();
  await tabTo(page, (a) => a.testid === "confirm-add");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/demo\/stores\/result$/);
  await expect(page.getByTestId("result-added")).toContainText("Example Keyboard Pharmacy");
});

// ── Q2-F01: rendered contrast on account surfaces, both themes ──────────────
const SCREENS: { name: string; scenario: string; route: string; act?: (p: Page) => Promise<void> }[] = [
  { name: "dashboard active", scenario: "two_store_active", route: "/dashboard" },
  { name: "dashboard past due", scenario: "past_due", route: "/dashboard" },
  { name: "dashboard cancel scheduled", scenario: "cancel_scheduled", route: "/dashboard" },
  { name: "dashboard canceled", scenario: "canceled", route: "/dashboard" },
  { name: "dashboard no pharmacies", scenario: "no_pharmacies", route: "/dashboard" },
  { name: "dashboard load error", scenario: "load_error", route: "/dashboard" },
  {
    name: "dashboard handoff error",
    scenario: "handoff_error",
    route: "/dashboard",
    act: async (p) => {
      await p.getByTestId("manage-billing").click();
      await expect(p.getByTestId("handoff-retry")).toBeVisible();
    },
  },
  { name: "add store draft restored", scenario: "add_draft_restored", route: "/demo/stores/add" },
  {
    name: "add store errors",
    scenario: "two_store_active",
    route: "/demo/stores/add",
    act: async (p) => {
      await p.getByTestId("review-price").click();
      await expect(p.getByRole("alert").first()).toBeVisible();
    },
  },
  { name: "owedbook", scenario: "two_store_active", route: "/demo/references/owedbook" },
  { name: "portal stand-in", scenario: "two_store_active", route: "/demo/stripe?mode=portal&purpose=manage" },
];

for (const s of SCREENS) {
  test(`F01 contrast: ${s.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    for (const theme of THEMES) {
      await scenario(page, s.scenario);
      await page.setViewportSize({ width: 1024, height: 900 });
      await page.goto(s.route);
      await setTheme(page, theme);
      await page.reload(); // theme applied at load: no colour transition in flight
      await page.waitForLoadState("networkidle");
      if (s.act) await s.act(page);
      await controls(page); // include the demo strip's controls in the scan
      const rows = await textContrast(page);
      const fails = textFailures(rows);
      const boundaries = await inputBoundaries(page);
      const rings = await focusRings(page, 30);
      recordContrast("repair-contrast-account.jsonl", { screen: s.name, theme, rows: rows.length, fails, faded: rows.filter((r) => r.faded && !r.disabled), boundaries, rings });
      expect.soft(fails, `${s.name} ${theme}: text below threshold`).toEqual([]);
      expect.soft(boundaries.filter((b) => b.ratio < b.required), `${s.name} ${theme}: input boundary`).toEqual([]);
      expect.soft(rings.filter((r) => r.ratio < r.required), `${s.name} ${theme}: focus ring`).toEqual([]);
    }
  });
}

// ── 200% zoom emulation (720 CSS px, DPR 2 ≙ 1440 window at 200%) ────────────
test.describe("200% zoom emulation", () => {
  test.use({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  test("dashboard cards and add-store confirm reflow without overflow; actions reachable", async ({ page }) => {
    for (const theme of THEMES) {
      await page.goto("/dashboard");
      await setTheme(page, theme);
      await page.reload();
      await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
      const g = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, dpr: window.devicePixelRatio }));
      expect(g).toMatchObject({ dpr: 2 });
      expect(g.sw).toBeLessThanOrEqual(g.cw);
      await expect(page.getByTestId("pharmacy-card")).toHaveCount(2);
      for (const id of ["add-store", "manage-billing", "cancel-in-stripe"]) {
        await page.getByTestId(id).scrollIntoViewIfNeeded();
        await expect(page.getByTestId(id)).toBeInViewport();
      }
    }
  });
});

// ── O04 evidence: masked mobile screenshots for comparison with the approved render ──
test("O04 evidence screenshots (real identity masked)", async ({ page }) => {
  for (const theme of THEMES) {
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.goto("/dashboard");
    await setTheme(page, theme);
    await page.reload();
    await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
    await page.screenshot({
      path: `test-results/shots/repair-account-billing_active_${theme}_mobile.png`,
      fullPage: true,
      mask: [page.getByTestId("account-menu"), page.getByTestId("account-demo-strip").locator("summary > span").nth(1)],
    });
  }
});

// ── REPAIR_002: Q2-O04 residual — plan Actions column (approved C10 treatment) ──
test("O04 residual: Actions divider above on mobile, beside on desktop; approved spacing", async ({ page }) => {
  const geometry = () =>
    page.getByTestId("plan-actions").evaluate((el) => {
      const cs = getComputedStyle(el);
      const inner = getComputedStyle(el.children[1] as HTMLElement);
      return { top: cs.borderTopWidth, left: cs.borderLeftWidth, pt: cs.paddingTop, pl: cs.paddingLeft, gap: cs.rowGap, innerGap: inner.rowGap, width: Math.round(el.getBoundingClientRect().width) };
    });
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto("/dashboard");
  await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
  expect(await geometry()).toMatchObject({ top: "1px", left: "0px", pt: "20px", gap: "12px", innerGap: "12px" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await geometry()).toMatchObject({ top: "0px", left: "1px", pt: "0px", pl: "32px", gap: "12px", innerGap: "12px", width: 320 });
  for (const theme of THEMES) {
    for (const [width, label] of [[375, "mobile"], [1440, "desktop"]] as const) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/dashboard");
      await setTheme(page, theme);
      await page.reload();
      await expect(page.getByTestId("monthly-total")).toHaveText("$148.00");
      await page.screenshot({
        path: `test-results/shots/repair002-account-billing_active_${theme}_${label}.png`,
        fullPage: true,
        mask: [page.getByTestId("account-menu"), page.getByTestId("account-demo-strip").locator("summary > span").nth(1)],
      });
    }
  }
});
