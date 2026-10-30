import { readFileSync, existsSync } from "node:fs";
import type { Page } from "@playwright/test";

/** Reads ONLY the two permitted keys from ignored `.env.qa.local`; values never logged. */
export function adminCredentials(): { email: string; password: string } | null {
  if (!existsSync(".env.qa.local")) return null;
  const vars: Record<string, string> = {};
  for (const raw of readFileSync(".env.qa.local", "utf8").split(/\r?\n/)) {
    const m = /^(?:export\s+)?([A-Z_]+)\s*=\s*(.*)$/.exec(raw.trim());
    if (m) vars[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  const email = vars.QA_PORTAL_ADMIN_EMAIL;
  const password = vars.QA_PORTAL_ADMIN_PASSWORD;
  return email && password ? { email, password } : null;
}

/** Record every request host so tests can assert no billing/email/other destinations. */
export function trackHosts(page: Page): Set<string> {
  const hosts = new Set<string>();
  page.on("request", (r) => hosts.add(new URL(r.url()).host));
  return hosts;
}

export async function demoState(page: Page, key: string): Promise<unknown> {
  return page.evaluate((k) => {
    const raw = window.sessionStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  }, key);
}
