import { defineConfig, devices } from "@playwright/test";

// Portal FFM browser checks. The app under test is an OWNED `next start` on
// :3001 (built from the current tree); Playwright never starts or stops any
// other server. System Chrome is used (channel "chrome"); no browser download.
// Traces/videos are OFF so no signed-in state or credential ever lands in output.
const baseURL = process.env.PORTAL_BASE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./qa-e2e",
  outputDir: "/tmp/cody-combined-pw-output",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", {outputFile:"/tmp/cody-combined-browser.json"}]],
  use: {
    baseURL,
    channel: "chrome",
    trace: "off",
    video: "off",
    screenshot: "off",
  },
  projects: [
    { name: "public", testMatch: /public\..*\.spec\.ts/, use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "gate-m-public", testMatch: /gate-m\.public\.spec\.ts/, use: { channel: "chrome" } },
    // Account specs sign in through e2e/auth.ts (real admin, in memory; logout aborted).
    { name: "account", testMatch: /account\..*\.spec\.ts/, use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    // Opt-in only (PORTAL_ALLOW_LOGOUT=1): the inherited logout is a GLOBAL
    // sign-out that ends every session of the account, including the Director's.
    ...(process.env.PORTAL_ALLOW_LOGOUT === "1"
      ? [{ name: "logout", testMatch: /logout\.final\.spec\.ts/, use: { channel: "chrome" as const } }]
      : []),
  ],
});
